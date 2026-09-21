import { Module } from '@nestjs/common';
import { CmsController, AdminCmsController } from './cms.controller';
import { CmsService } from './cms.service';

@Module({
  controllers: [CmsController, AdminCmsController],
  providers: [CmsService],
})
export class CmsModule {}
