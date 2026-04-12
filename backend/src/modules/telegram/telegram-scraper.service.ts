import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TelegramClientService } from './telegram-client.service';
import { LeadsService } from '../leads/leads.service';
import { MonitoredGroupsService } from '../monitored-groups/monitored-groups.service';
import { SmsService } from '../sms/sms.service';
import { extractPhones } from '../../common/utils/phone-parser';
import { parseCarAd } from '../../common/utils/car-parser';
import { isCarAd } from '../../common/utils/message-filter';
import { Api } from 'telegram';

@Injectable()
export class TelegramScraperService {
  private readonly logger = new Logger(TelegramScraperService.name);
  private isScraping = false;

  constructor(
    private telegramClient: TelegramClientService,
    private leadsService: LeadsService,
    private groupsService: MonitoredGroupsService,
    private smsService: SmsService,
  ) {}

  /**
   * Har 10 daqiqada barcha guruhlardan oxirgi xabarlarni scrape qilish
   * gramjs real-time update hammadan kelmaydi, shu sababli fallback kerak
   */
  @Cron('* * * * *')
  async periodicScrape() {
    await this.scrape(5); // oxirgi 5 daqiqa, har daqiqa tekshirish
  }

  async scrape(minutes: number = 15) {
    const client = this.telegramClient.getClient();
    if (!client || !this.telegramClient.getIsConnected()) return;
    if (this.isScraping) {
      this.logger.warn('Scrape already in progress, skipping');
      return;
    }

    this.isScraping = true;
    const startTime = Date.now();
    const groups = await this.groupsService.findActive();
    let totalLeads = 0;
    let processedGroups = 0;
    let errorGroups = 0;

    try {
      const offsetDate = Math.floor(Date.now() / 1000) - (minutes * 60);

      for (const group of groups) {
        // 5 daqiqadan oshsa — to'xtatish (stuck bo'lmasligi uchun)
        if (Date.now() - startTime > 5 * 60 * 1000) {
          this.logger.warn(`Scrape timeout after 5 min, processed ${processedGroups}/${groups.length} groups`);
          break;
        }

        try {
          const entity = await client.getEntity(group.telegramId).catch(() => null);
          if (!entity) {
            errorGroups++;
            continue;
          }

          // Har doim offsetDate ishlatish — minId gramjs da ishonchsiz
          const messages = await client.getMessages(entity, {
            limit: 50,
            offsetDate,
          });

          let groupLeads = 0;
          for (const msg of messages) {
            const text = msg.text || msg.message || '';
            if (!text) continue;

            const parsed = parseCarAd(text);
            if (!isCarAd(text, parsed)) continue;

            const phones = extractPhones(text);
            if (phones.length === 0) continue;

            const mainPhone = phones[0];
            const isDuplicate = await this.leadsService.isDuplicate(mainPhone);
            if (isDuplicate) continue;

            let senderName: string | undefined;
            let senderUsername: string | undefined;
            try {
              const sender = await msg.getSender() as any;
              if (sender) {
                senderUsername = sender.username || undefined;
                senderName = [sender.firstName, sender.lastName].filter(Boolean).join(' ') || undefined;
              }
            } catch {}

            try {
              const lead = await this.leadsService.create({
                phone: mainPhone,
                rawPhone: phones.join(', '),
                rawMessage: text.substring(0, 2000),
                brand: parsed.brand,
                model: parsed.model,
                year: parsed.year,
                priceAmount: parsed.priceAmount,
                priceCurrency: parsed.priceCurrency,
                color: parsed.color,
                mileage: parsed.mileage,
                fuelType: parsed.fuelType,
                transmission: parsed.transmission,
                condition: parsed.condition,
                creditAvailable: parsed.creditAvailable,
                city: parsed.city,
                senderName,
                senderUsername,
                sourceGroupId: group.id,
                sourceMsgId: msg.id,
                notes: phones.length > 1 ? `Qo'shimcha: ${phones.slice(1).join(', ')}` : undefined,
              });

              await this.groupsService.incrementLeadCount(group.telegramId);
              this.smsService.autoSendPromo(lead.id).catch(() => {});
              groupLeads++;
            } catch {}
          }

          // Eng yangi msg_id ni saqlash — keyingi scrape faqat bundan keyingilarni oladi
          if (messages.length > 0) {
            const maxMsgId = Math.max(...messages.map(m => m.id));
            await this.groupsService.updateLastMessage(group.telegramId, maxMsgId);
          }
          await this.groupsService.updateLastScraped(group.telegramId);
          totalLeads += groupLeads;
          processedGroups++;

          // Rate limit between groups
          await new Promise(r => setTimeout(r, 500));
        } catch (error) {
          errorGroups++;
          this.logger.debug(`Scrape error for "${group.title}": ${error.message}`);
        }
      }

      this.logger.log(`Scrape done: ${totalLeads} leads, ${processedGroups}/${groups.length} groups ok, ${errorGroups} errors`);
    } finally {
      this.isScraping = false;
    }

    return { totalLeads, processedGroups };
  }
}
