import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMessageDto } from './dto/message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(user.companyId, user.userId, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    if (projectId) {
      return this.messagesService.findByProject(user.companyId, projectId, page, pageSize);
    }
    if (taskId) {
      return this.messagesService.findByTask(user.companyId, taskId, page, pageSize);
    }
    return { data: [], total: 0, page: 1, pageSize: 50 };
  }
}
