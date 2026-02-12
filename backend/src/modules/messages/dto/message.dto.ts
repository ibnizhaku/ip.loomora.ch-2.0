import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  taskId?: string;

  @ApiPropertyOptional({ description: 'Parent message ID for thread replies' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Mentioned user IDs (auto-parsed from content if not provided)' })
  @IsArray()
  @IsOptional()
  mentionedUserIds?: string[];
}

export class UpdateMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;
}

export class ToggleReactionDto {
  @ApiProperty()
  @IsString()
  emoji: string;
}
