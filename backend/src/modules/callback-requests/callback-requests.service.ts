import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCallbackDto } from './dto/create-callback.dto';
import { LeadSource } from '@prisma/client';

@Injectable()
export class CallbackRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCallbackDto) {
    // Try to find or create lead
    let lead = await this.prisma.lead.findFirst({
      where: { phone: dto.phone },
    });

    if (!lead) {
      lead = await this.prisma.lead.create({
        data: {
          phone: dto.phone,
          name: dto.name,
          source: LeadSource.MINI_APP,
          interestedCarId: dto.carId,
        },
      });
    }

    const callback = await this.prisma.callbackRequest.create({
      data: {
        leadId: lead.id,
        phone: dto.phone,
        name: dto.name,
        carId: dto.carId,
        message: dto.message,
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        action: 'CALLBACK_REQUESTED',
        details: `Callback request from Mini App${dto.carId ? ` for car ${dto.carId}` : ''}`,
      },
    });

    return callback;
  }

  async findAll() {
    return this.prisma.callbackRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lead: { select: { id: true, phone: true, name: true, status: true } } },
    });
  }

  async markHandled(id: string) {
    const cb = await this.prisma.callbackRequest.findUnique({ where: { id } });
    if (!cb) throw new NotFoundException('Callback request not found');
    return this.prisma.callbackRequest.update({
      where: { id },
      data: { isHandled: true },
    });
  }
}
