import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { UpstashService } from '../upstash/upstash.service';
import { ThumbnailService } from './thumbnail.service';

@Injectable()
export class ThumbnailWorkerService {
  private isProcessing = false;

  constructor(
    private readonly upstashService: UpstashService,
    private readonly thumbnailService: ThumbnailService,
    private readonly supabaseService: SupabaseService,
  ) { }

  @Interval(15000)
  async handleThumbnailQueue() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      while (true) {
        const jobData = await this.upstashService.rpop('thumbnail-generation');
        if (!jobData) {
          break; // Queue is empty
        }

        const job = typeof jobData === 'string' ? JSON.parse(jobData) : jobData;
        console.log('Processing thumbnail job:', job);

        try {
          const response = await lastValueFrom(
            this.thumbnailService.generateThumbnail(job.objectName),
          );
          console.log('Thumbnail generated:', response);
          const { thumbnailUrl } = response;
          const { error } = await this.supabaseService.supabase
            .from('images')
            .update({ thumbnail_url: thumbnailUrl })
            .eq('id', job.imageId);

          if (error) {
            console.error('Failed to update Supabase:', error);
            // TODO: Add retry logic
          } else {
            console.log(
              `Successfully updated image ${job.imageId} with thumbnail.`,
            );
          }
        } catch (err) {
          console.error('gRPC call failed:', err);
          // TODO: Add retry logic
        }
      }
    } catch (error) {
      console.error('Error in thumbnail worker:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
