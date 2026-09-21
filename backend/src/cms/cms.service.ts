import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSectionDto } from './dto/upsert-section.dto';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Public read: returns a page with its sections ordered for rendering.
   * This is the single endpoint the React frontend hits to render Home/About/Contact.
   */
  async getPageBySlug(slug: string) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { slug },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!page) {
      throw new NotFoundException(`No CMS page found for slug "${slug}"`);
    }

    return {
      slug: page.slug,
      title: page.title,
      updatedAt: page.updatedAt,
      sections: page.sections.map((s) => ({
        key: s.sectionKey,
        order: s.order,
        content: s.content,
      })),
    };
  }

  async listPages() {
    return this.prisma.cmsPage.findMany({
      select: { slug: true, title: true, updatedAt: true },
    });
  }

  /**
   * Admin write: upsert a single section's content by (page, sectionKey).
   * Used by the "Visual Dynamic CMS Editor" — every section edit is one call here.
   */
  async upsertSection(pageSlug: string, dto: UpsertSectionDto) {
    const page = await this.prisma.cmsPage.findUnique({ where: { slug: pageSlug } });
    if (!page) {
      throw new NotFoundException(`No CMS page found for slug "${pageSlug}"`);
    }

    return this.prisma.cmsSection.upsert({
      where: { pageId_sectionKey: { pageId: page.id, sectionKey: dto.sectionKey } },
      update: { content: dto.content as any, order: dto.order },
      create: {
        pageId: page.id,
        sectionKey: dto.sectionKey,
        content: dto.content as any,
        order: dto.order,
      },
    });
  }
}
