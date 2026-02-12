import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { UpdateCompanyDto, CreateTeamMemberDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Company')
@Controller('company')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Get current company profile' })
  findOne(@CurrentUser() user: CurrentUserPayload) {
    return this.companyService.findById(user.companyId);
  }

  @Put()
  @ApiOperation({ summary: 'Update company profile' })
  update(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(user.companyId, dto);
  }

  // --- Team Members ---

  @Get('team')
  @ApiOperation({ summary: 'Get company team members' })
  getTeamMembers(@CurrentUser() user: CurrentUserPayload) {
    return this.companyService.getTeamMembers(user.companyId);
  }

  @Post('team')
  @ApiOperation({ summary: 'Add a team member' })
  addTeamMember(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTeamMemberDto) {
    return this.companyService.addTeamMember(user.companyId, dto);
  }

  @Delete('team/:id')
  @ApiOperation({ summary: 'Remove a team member' })
  removeTeamMember(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.companyService.removeTeamMember(user.companyId, id);
  }
}
