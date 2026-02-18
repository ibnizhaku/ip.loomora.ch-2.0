import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { UpdateCompanyDto, CreateTeamMemberDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

const LOGO_DIR = 'uploads/logos';
if (!existsSync(LOGO_DIR)) {
  mkdirSync(LOGO_DIR, { recursive: true });
}

@ApiTags('Company')
@Controller('company')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get()
  @RequirePermissions('company:read')
  @ApiOperation({ summary: 'Get current company profile' })
  findOne(@CurrentUser() user: CurrentUserPayload) {
    return this.companyService.findById(user.companyId);
  }

  @Put()
  @RequirePermissions('company:write')
  @ApiOperation({ summary: 'Update company profile' })
  update(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(user.companyId, dto);
  }

  // --- Logo Upload ---

  @Post('logo')
  @RequirePermissions('company:write')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: LOGO_DIR,
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml|webp)$/)) {
        cb(new BadRequestException('Nur Bilddateien sind erlaubt'), false);
      } else {
        cb(null, true);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  @ApiOperation({ summary: 'Upload company logo' })
  @ApiConsumes('multipart/form-data')
  async uploadLogo(
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Keine Datei hochgeladen');
    }
    return this.companyService.updateLogo(user.companyId, file);
  }

  // --- Team Members ---

  @Get('team')
  @RequirePermissions('company:read')
  @ApiOperation({ summary: 'Get company team members' })
  getTeamMembers(@CurrentUser() user: CurrentUserPayload) {
    return this.companyService.getTeamMembers(user.companyId);
  }

  @Post('team')
  @RequirePermissions('company:write')
  @ApiOperation({ summary: 'Add a team member' })
  addTeamMember(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTeamMemberDto) {
    return this.companyService.addTeamMember(user.companyId, dto);
  }

  @Delete('team/:id')
  @RequirePermissions('company:write')
  @ApiOperation({ summary: 'Remove a team member' })
  removeTeamMember(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.companyService.removeTeamMember(user.companyId, id);
  }
}
