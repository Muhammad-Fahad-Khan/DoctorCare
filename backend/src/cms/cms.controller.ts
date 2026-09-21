import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { UpsertSectionDto } from './dto/upsert-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('cms')
export class CmsController {
  constructor(private cms: CmsService) {}

  @Get('pages')
  listPages() {
    return this.cms.listPages();
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.cms.getPageBySlug(slug);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/cms')
export class AdminCmsController {
  constructor(private cms: CmsService) {}

  @Put('pages/:slug/sections')
  upsertSection(@Param('slug') slug: string, @Body() dto: UpsertSectionDto) {
    return this.cms.upsertSection(slug, dto);
  }
}
