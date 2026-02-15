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
import { AbsencesService } from './absences.service';
import { CreateAbsenceDto, UpdateAbsenceDto, AbsenceQueryDto } from './dto/absence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Absences')
@Controller('absences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AbsencesController {
  constructor(private absencesService: AbsencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all absences' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: AbsenceQueryDto) {
    return this.absencesService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get absence statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.absencesService.getStats(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get absence by ID' })
  findOne(@Param('id') id: string) {
    return this.absencesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new absence' })
  create(@Body() dto: CreateAbsenceDto) {
    return this.absencesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update absence' })
  update(@Param('id') id: string, @Body() dto: UpdateAbsenceDto) {
    return this.absencesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete absence' })
  delete(@Param('id') id: string) {
    return this.absencesService.delete(id);
  }
}
