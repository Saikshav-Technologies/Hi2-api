import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createEvent(@CurrentUser() user: User, @Body() createEventDto: CreateEventDto) {
    const event = await this.eventsService.createEvent(user.id, {
      ...createEventDto,
      startDate: new Date(createEventDto.startDate),
      endDate: createEventDto.endDate ? new Date(createEventDto.endDate) : undefined,
    });
    return {
      success: true,
      data: event,
    };
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getEvents(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @CurrentUser() user?: User,
  ) {
    const result = await this.eventsService.getEvents(page, limit, user?.id);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':eventId')
  @UseGuards(OptionalAuthGuard)
  async getEvent(@Param('eventId') eventId: string, @CurrentUser() user?: User) {
    const event = await this.eventsService.getEvent(eventId, user?.id);
    return {
      success: true,
      data: event,
    };
  }

  @Put(':eventId')
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: User,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.updateEvent(eventId, user.id, {
      ...updateEventDto,
      startDate: updateEventDto.startDate ? new Date(updateEventDto.startDate) : undefined,
      endDate: updateEventDto.endDate ? new Date(updateEventDto.endDate) : undefined,
    });
    return {
      success: true,
      data: event,
    };
  }

  @Delete(':eventId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteEvent(@Param('eventId') eventId: string, @CurrentUser() user: User) {
    await this.eventsService.deleteEvent(eventId, user.id);
    return {
      success: true,
      message: 'Event deleted successfully',
    };
  }
}
