import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Telegraf, Markup } from 'telegraf';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: Telegraf;
  private adminGroupId: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const token = this.config.get('TELEGRAM_BOT_TOKEN');
    this.adminGroupId = this.config.get('TELEGRAM_ADMIN_GROUP_ID', '');

    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set, bot disabled');
      return;
    }

    this.bot = new Telegraf(token);
    this.setupHandlers();

    try {
      await this.bot.launch();
      this.logger.log('Telegram bot started');
    } catch (error) {
      this.logger.error(`Bot launch failed: ${error.message}`);
    }
  }

  private setupHandlers() {
    this.bot.command('start', (ctx) => {
      const webAppUrl = this.config.get('MINI_APP_URL', 'https://your-mini-app.com');
      ctx.reply(
        '🚗 Avtosalon CRM Bot\n\nMashinalar katalogini ko\'rish uchun quyidagi tugmani bosing:',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚗 Katalogni ko\'rish', webAppUrl)],
        ]),
      );
    });

    // Handle callback queries from admin group inline buttons
    this.bot.on('callback_query', async (ctx) => {
      const data = (ctx.callbackQuery as any).data;
      if (!data) return;

      const [action, leadId] = data.split(':');

      try {
        const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) {
          await ctx.answerCbQuery('Lead topilmadi');
          return;
        }

        let newStatus: LeadStatus | null = null;
        let statusText = '';

        switch (action) {
          case 'accept':
            newStatus = LeadStatus.NEW;
            statusText = '✅ Qabul qilindi';
            // Assign to the user who clicked
            const telegramUser = ctx.from;
            const manager = await this.prisma.user.findUnique({
              where: { telegramId: String(telegramUser.id) },
            });
            if (manager) {
              await this.prisma.lead.update({
                where: { id: leadId },
                data: { managerId: manager.id },
              });
            }
            break;
          case 'contacted':
            newStatus = LeadStatus.CONTACTED;
            statusText = '📞 Bog\'lanildi';
            break;
          case 'interested':
            newStatus = LeadStatus.INTERESTED;
            statusText = '⭐ Qiziqdi';
            break;
          case 'lost':
            newStatus = LeadStatus.LOST;
            statusText = '❌ Yo\'qoldi';
            break;
          default:
            await ctx.answerCbQuery('Noma\'lum buyruq');
            return;
        }

        if (newStatus) {
          await this.prisma.lead.update({
            where: { id: leadId },
            data: { status: newStatus },
          });

          await this.prisma.leadActivity.create({
            data: {
              leadId,
              action: 'STATUS_CHANGED',
              details: `Status changed to ${newStatus} via Telegram bot by ${ctx.from.first_name}`,
            },
          });

          // Update the message
          await ctx.editMessageReplyMarkup({
            inline_keyboard: this.getLeadButtons(leadId, newStatus),
          });

          await ctx.answerCbQuery(statusText);
        }
      } catch (error) {
        this.logger.error(`Callback query error: ${error.message}`);
        await ctx.answerCbQuery('Xatolik yuz berdi');
      }
    });
  }

  async notifyNewLead(lead: { id: string; phone: string; name?: string; source: string; sourceGroup?: string; sourceMessage?: string }) {
    if (!this.bot || !this.adminGroupId) return;

    const message = [
      '🆕 **Yangi Lead!**',
      '',
      `📱 Telefon: \`${lead.phone}\``,
      lead.name ? `👤 Ism: ${lead.name}` : '',
      `📍 Manba: ${lead.source}`,
      lead.sourceGroup ? `💬 Guruh: ${lead.sourceGroup}` : '',
      lead.sourceMessage ? `\n📝 Xabar: ${lead.sourceMessage.substring(0, 200)}` : '',
    ].filter(Boolean).join('\n');

    try {
      const sent = await this.bot.telegram.sendMessage(this.adminGroupId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getLeadButtons(lead.id, LeadStatus.NEW),
        },
      });

      // Save telegram message id for later editing
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: { telegramMsgId: sent.message_id },
      });

      return sent;
    } catch (error) {
      this.logger.error(`Failed to notify admin group: ${error.message}`);
    }
  }

  async sendReminder(leadId: string, message: string) {
    if (!this.bot || !this.adminGroupId) return;

    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { manager: true },
    });

    if (!lead) return;

    const text = [
      '⏰ **Eslatma!**',
      '',
      `📱 Lead: \`${lead.phone}\``,
      lead.name ? `👤 ${lead.name}` : '',
      `📋 Status: ${lead.status}`,
      '',
      `💬 ${message}`,
    ].filter(Boolean).join('\n');

    try {
      await this.bot.telegram.sendMessage(this.adminGroupId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: this.getLeadButtons(lead.id, lead.status),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send reminder: ${error.message}`);
    }
  }

  private getLeadButtons(leadId: string, currentStatus: LeadStatus): any[][] {
    const buttons: any[][] = [];

    switch (currentStatus) {
      case LeadStatus.NEW:
        buttons.push([
          { text: '✅ Qabul qilish', callback_data: `accept:${leadId}` },
          { text: '📞 Bog\'landim', callback_data: `contacted:${leadId}` },
        ]);
        buttons.push([
          { text: '⭐ Qiziqdi', callback_data: `interested:${leadId}` },
          { text: '❌ Yo\'qoldi', callback_data: `lost:${leadId}` },
        ]);
        break;
      case LeadStatus.CONTACTED:
        buttons.push([
          { text: '⭐ Qiziqdi', callback_data: `interested:${leadId}` },
          { text: '❌ Yo\'qoldi', callback_data: `lost:${leadId}` },
        ]);
        break;
      case LeadStatus.INTERESTED:
        buttons.push([
          { text: '🤝 Muzokara', callback_data: `negotiating:${leadId}` },
          { text: '❌ Yo\'qoldi', callback_data: `lost:${leadId}` },
        ]);
        break;
      case LeadStatus.NEGOTIATING:
        buttons.push([
          { text: '🎉 Sotildi!', callback_data: `sold:${leadId}` },
          { text: '❌ Yo\'qoldi', callback_data: `lost:${leadId}` },
        ]);
        break;
      default:
        // SOLD or LOST - no buttons
        break;
    }

    return buttons;
  }

  async onModuleDestroy() {
    if (this.bot) {
      this.bot.stop('Module destroy');
    }
  }
}
