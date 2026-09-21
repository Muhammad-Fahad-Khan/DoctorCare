import { Module } from '@nestjs/common';
import { AdminDoctorsController } from './admin-doctors.controller';
import { AdminDoctorsService } from './admin-doctors.service';

@Module({
  controllers: [AdminDoctorsController],
  providers: [AdminDoctorsService],
})
export class AdminDoctorsModule {}
