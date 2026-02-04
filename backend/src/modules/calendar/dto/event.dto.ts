import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum EventType {
  MEETING = 'MEETING',
  CALL = 'CALL',
  DEADLINE = 'DEADLINE',
  REMINDER = 'REMINDER',
  VACATION = 'VACATION',
}

export class CreateEventDto {
  @ApiProperty({ example: 'Projekt-Kickoff E-Commerce' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiPropertyOptional({ example: '10:30' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiPropertyOptional({ example: 'Konferenzraum A' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class EventQueryDto {
  @ApiPropertyOptional({ example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-02-28' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;
}
