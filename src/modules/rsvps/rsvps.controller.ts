import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { RSVPsService } from './rsvps.service';
import { UpsertRSVPDto } from './dto/upsert-rsvp.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('api')
export class RSVPsController {
  constructor(private readonly rsvpsService: RSVPsService) {}

  @Post('events/:eventId/rsvp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async upsertRSVP(
    @Param('eventId') eventId: string,
    @CurrentUser() user: User,
    @Body() upsertRSVPDto: UpsertRSVPDto,
  ) {
    const result = await this.rsvpsService.upsertRSVP(eventId, user.id, upsertRSVPDto.status);
    return {
      success: true,
      data: result,
    };
  }

  @Get('events/:eventId/rsvp')
  @UseGuards(JwtAuthGuard)
  async getRSVP(@Param('eventId') eventId: string, @CurrentUser() user: User) {
    const rsvp = await this.rsvpsService.getRSVP(eventId, user.id);
    return {
      success: true,
      data: rsvp,
    };
  }

  @Get('events/:eventId/rsvp/counts')
  async getRSVPCounts(@Param('eventId') eventId: string) {
    const counts = await this.rsvpsService.getRSVPCounts(eventId);
    return {
      success: true,
      data: counts,
    };
  }

  @Get('events/:eventId/rsvps')
  async getEventRSVPs(
    @Param('eventId') eventId: string,
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    const result = await this.rsvpsService.getEventRSVPs(eventId, status, page, limit);
    return {
      success: true,
      data: result,
    };
  }

  @Delete('events/:eventId/rsvp')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteRSVP(@Param('eventId') eventId: string, @CurrentUser() user: User) {
    const result = await this.rsvpsService.deleteRSVP(eventId, user.id);
    return {
      success: true,
      data: result,
    };
  }
}
