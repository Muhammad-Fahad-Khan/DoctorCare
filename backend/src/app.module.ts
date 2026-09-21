import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CmsModule } from './cms/cms.module';
import { AuthModule } from './auth/auth.module';
import { AdminDoctorsModule } from './admin-doctors/admin-doctors.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { GroqModule } from './groq/groq.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CmsModule,
    AdminDoctorsModule,
    DoctorsModule,
    AppointmentsModule,
    GroqModule,
    ContactModule,
  ],
})
export class AppModule {}
