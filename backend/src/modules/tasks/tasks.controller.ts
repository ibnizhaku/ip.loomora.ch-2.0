import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

const TASK_ATTACHMENTS_DIR = join(process.cwd(), 'uploads', 'task-attachments');
if (!existsSync(TASK_ATTACHMENTS_DIR)) {
  mkdirSync(TASK_ATTACHMENTS_DIR, { recursive: true });
}

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get all tasks' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: TaskQueryDto) {
    return this.tasksService.findAll(user.companyId, query);
  }

  @Get('stats')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get task statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.tasksService.getStats(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.tasksService.findById(id, user.companyId);
  }

  @Post()
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Create new task' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Update task' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.companyId, dto, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('tasks:delete')
  @ApiOperation({ summary: 'Delete task' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.tasksService.delete(id, user.companyId);
  }

  // ========================
  // SUBTASKS
  // ========================

  @Get(':id/subtasks')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get subtasks for a task' })
  getSubtasks(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.tasksService.getSubtasks(id, user.companyId);
  }

  @Post(':id/subtasks')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Create a subtask' })
  createSubtask(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: { title: string },
  ) {
    return this.tasksService.createSubtask(id, user.companyId, dto);
  }

  @Patch(':id/subtasks/:subtaskId')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Update a subtask (PATCH)' })
  updateSubtask(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Body() dto: { title?: string; isCompleted?: boolean },
  ) {
    return this.tasksService.updateSubtask(id, subtaskId, user.companyId, dto);
  }

  @Put(':id/subtasks/:subtaskId')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Update a subtask (PUT)' })
  updateSubtaskPut(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Body() dto: { title?: string; isCompleted?: boolean },
  ) {
    return this.tasksService.updateSubtask(id, subtaskId, user.companyId, dto);
  }

  @Delete(':id/subtasks/:subtaskId')
  @RequirePermissions('tasks:delete')
  @ApiOperation({ summary: 'Delete a subtask' })
  deleteSubtask(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
  ) {
    return this.tasksService.deleteSubtask(id, subtaskId, user.companyId);
  }

  // ========================
  // COMMENTS
  // ========================

  @Get(':id/comments')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get comments for a task' })
  getComments(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.tasksService.getComments(id, user.companyId);
  }

  @Post(':id/comments')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Create a comment' })
  createComment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: { content: string },
  ) {
    return this.tasksService.createComment(id, user.companyId, user.userId, dto);
  }

  @Delete(':id/comments/:commentId')
  @RequirePermissions('tasks:delete')
  @ApiOperation({ summary: 'Delete a comment' })
  deleteComment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.tasksService.deleteComment(id, commentId, user.companyId);
  }

  // ========================
  // TIME ENTRIES
  // ========================

  @Post(':id/time-entries')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Create a time entry for a task' })
  createTimeEntry(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: { duration: number; description?: string },
  ) {
    return this.tasksService.createTimeEntry(id, user.companyId, user.userId, dto);
  }

  // ========================
  // ATTACHMENTS
  // ========================

  @Get(':id/attachments')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get attachments for a task' })
  getAttachments(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.tasksService.getAttachments(id, user.companyId);
  }

  @Post(':id/attachments')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Upload an attachment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: TASK_ATTACHMENTS_DIR,
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  createAttachment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.tasksService.createAttachment(id, user.companyId, user.userId, file);
  }

  @Delete(':id/attachments/:attachmentId')
  @RequirePermissions('tasks:delete')
  @ApiOperation({ summary: 'Delete an attachment' })
  deleteAttachment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.tasksService.deleteAttachment(id, attachmentId, user.companyId);
  }
}
