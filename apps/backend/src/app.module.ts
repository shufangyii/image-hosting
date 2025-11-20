import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ImageModule } from './image/image.module';
import { MinioModule } from './minio/minio.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';
import { UpstashModule } from './upstash/upstash.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),
    AuthModule,
    UserModule,
    SupabaseModule,
    MinioModule,
    ImageModule,
    UpstashModule,
    ThumbnailModule,
    EmailModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
