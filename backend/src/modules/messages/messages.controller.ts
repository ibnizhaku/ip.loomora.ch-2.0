import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMessageDto, UpdateMessageDto, ToggleReactionDto } from './dto/message.dto';

@ApiTags('Messages & Chat')
@Controller('messages')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @RequirePermissions('messages:write')
  @ApiOperation({ summary: 'Send a chat message' })
  async create(@CurrentUser() user: any, @Body() dto: CreateMessageDto) {
    return this.messagesService.create(user.companyId, user.userId, dto);
  }

  @Get()
  @RequirePermissions('messages:read')
  @ApiOperation({ summary: 'Get chat messages' })
  async findAll(@CurrentUser() user: any, @Query('projectId') projectId?: string, @Query('taskId') taskId?: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    if (projectId) return this.messagesService.findByProject(user.companyId, projectId, page, pageSize);
    if (taskId) return this.messagesService.findByTask(user.companyId, taskId, page, pageSize);
    return { data: [], total: 0, page: 1, pageSize: 50 };
  }

  @Patch(':id')
  @RequirePermissions('messages:write')
  @ApiOperation({ summary: 'Edit a chat message' })
  async updateMessage(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateMessageDto) {
    return this.messagesService.updateMessage(id, user.companyId, user.userId, dto);
  }

  @Delete(':id')
  @RequirePermissions('messages:delete')
  @ApiOperation({ summary: 'Delete a chat message' })
  async deleteMessage(@CurrentUser() user: any, @Param('id') id: string) {
    return this.messagesService.deleteMessage(id, user.companyId, user.userId);
  }

  @Post(':id/reactions')
  @RequirePermissions('messages:write')
  @ApiOperation({ summary: 'Toggle emoji reaction on a message' })
  async toggleReaction(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: ToggleReactionDto) {
    return this.messagesService.toggleReaction(id, user.companyId, user.userId, dto);
  }
}
