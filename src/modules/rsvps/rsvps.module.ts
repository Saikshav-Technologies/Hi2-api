import { Module } from '@nestjs/common';
import { RSVPsController } from './rsvps.controller';
import { RSVPsService } from './rsvps.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RSVPsController],
  providers: [RSVPsService],
  exports: [RSVPsService],
})
export class RsvpsModule {}
