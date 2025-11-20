import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface ThumbnailServiceGrpc {
  generateThumbnail(data: {
    object_name: string;
  }): Observable<{ thumbnailUrl: string }>;
}

@Injectable()
export class ThumbnailService implements OnModuleInit {
  private grpcService: ThumbnailServiceGrpc;

  constructor(@Inject('THUMBNAIL_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.grpcService =
      this.client.getService<ThumbnailServiceGrpc>('ThumbnailService');
  }

  generateThumbnail(objectName: string) {
    return this.grpcService.generateThumbnail({
      object_name: objectName,
    });
  }
}
