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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: TaskQueryDto) {
    return this.tasksService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.tasksService.getStats(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.tasksService.findById(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new task' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.tasksService.delete(id, user.companyId);
  }
}
