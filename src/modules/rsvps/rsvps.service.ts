import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RSVPsService {
  constructor(private prisma: PrismaService) {}

  async upsertRSVP(eventId: string, userId: string, status: 'going' | 'interested' | 'not_going') {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!['going', 'interested', 'not_going'].includes(status)) {
      throw new BadRequestException('Invalid RSVP status. Must be: going, interested, or not_going');
    }

    const rsvp = await this.prisma.rSVP.upsert({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      update: {
        status,
      },
      create: {
        userId,
        eventId,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const counts = await this.getRSVPCounts(eventId);

    return {
      rsvp,
      counts,
    };
  }

  async getRSVP(eventId: string, userId: string) {
    const rsvp = await this.prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    return rsvp;
  }

  async getRSVPCounts(eventId: string) {
    const [going, interested, notGoing] = await Promise.all([
      this.prisma.rSVP.count({
        where: { eventId, status: 'going' },
      }),
      this.prisma.rSVP.count({
        where: { eventId, status: 'interested' },
      }),
      this.prisma.rSVP.count({
        where: { eventId, status: 'not_going' },
      }),
    ]);

    return {
      going,
      interested,
      notGoing,
      total: going + interested + notGoing,
    };
  }

  async getEventRSVPs(eventId: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: any = { eventId };
    if (status) {
      where.status = status;
    }

    const [rsvps, total] = await Promise.all([
      this.prisma.rSVP.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rSVP.count({ where }),
    ]);

    return {
      rsvps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteRSVP(eventId: string, userId: string) {
    await this.prisma.rSVP.deleteMany({
      where: {
        eventId,
        userId,
      },
    });

    const counts = await this.getRSVPCounts(eventId);

    return { counts };
  }
}
