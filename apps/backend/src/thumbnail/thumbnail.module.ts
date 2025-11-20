import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SupabaseModule } from '../supabase/supabase.module';
import { UpstashModule } from '../upstash/upstash.module';
import { ThumbnailService } from './thumbnail.service';
import { ThumbnailWorkerService } from './thumbnail.worker.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'THUMBNAIL_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'thumbnail_service',
          protoPath: join(
            __dirname,
            '../../../../proto/thumbnail_service.proto',
          ),
          url: process.env.THUMBNAIL_GRPC_URL || 'localhost:50051',
          loader: {
            keepCase: true,
          },
        },
      },
    ]),
    UpstashModule,
    SupabaseModule,
  ],
  providers: [ThumbnailService, ThumbnailWorkerService],
  exports: [ThumbnailService],
})
export class ThumbnailModule { }
