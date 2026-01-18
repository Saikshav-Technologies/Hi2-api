import { IsString, IsIn } from 'class-validator';

export class UpsertRSVPDto {
  @IsString()
  @IsIn(['going', 'interested', 'not_going'])
  status: 'going' | 'interested' | 'not_going';
}
