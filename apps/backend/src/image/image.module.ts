import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MinioModule } from '../minio/minio.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { UpstashModule } from '../upstash/upstash.module';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

@Module({
  imports: [MinioModule, SupabaseModule, AuthModule, UpstashModule],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
