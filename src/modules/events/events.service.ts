import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { getS3Url } from '../../utils/s3';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(
    userId: string,
    data: {
      title: string;
      description?: string;
      location?: string;
      startDate: Date;
      endDate?: Date;
      imageKey?: string;
    },
  ) {
    const event = await this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        imageUrl: data.imageKey ? getS3Url(data.imageKey) : null,
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    });

    return event;
  }

  async getEvent(eventId: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
        ...(userId && {
          rsvps: {
            where: { userId },
            select: { status: true },
          },
        }),
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      ...event,
      userRSVP: userId && event.rsvps && event.rsvps.length > 0 ? event.rsvps[0].status : null,
    };
  }

  async updateEvent(
    eventId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      location?: string;
      startDate?: Date;
      endDate?: Date;
      imageKey?: string;
    },
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== userId) {
      throw new ForbiddenException('Not authorized to update this event');
    }

    const updateData: any = { ...data };
    if (data.imageKey) {
      updateData.imageUrl = getS3Url(data.imageKey);
      delete updateData.imageKey;
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    });

    return updatedEvent;
  }

  async deleteEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this event');
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });
  }

  async getEvents(page = 1, limit = 10, userId?: string) {
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              rsvps: true,
            },
          },
          ...(userId && {
            rsvps: {
              where: { userId },
              select: { status: true },
            },
          }),
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.event.count(),
    ]);

    return {
      events: events.map((event) => ({
        ...event,
        userRSVP: userId && event.rsvps && event.rsvps.length > 0 ? event.rsvps[0].status : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
