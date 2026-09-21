import { Module } from '@nestjs/common';
import { ContactController, AdminContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  controllers: [ContactController, AdminContactController],
  providers: [ContactService],
})
export class ContactModule {}
