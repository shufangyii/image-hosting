/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { User } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MinioService } from '../minio/minio.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpstashService } from '../upstash/upstash.service';

@Injectable()
export class ImageService {
  constructor(
    private readonly minioService: MinioService,
    private readonly supabaseService: SupabaseService,
    private readonly upstashService: UpstashService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    user: User,
  ): Promise<{ url: string; thumbnailUrl: string }> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated.');
    }

    const userId = user.id;
    const fileExtension = file.originalname.split('.').pop();
    const objectName = `${userId}/${uuidv4()}.${fileExtension}`; // Store in user-specific folder

    // Upload to Minio
    await this.minioService.upload(objectName, file.buffer, {
      'Content-Type': file.mimetype,
    });

    const imageUrl = this.minioService.getFileUrl(objectName);
    const thumbnailUrl = imageUrl; // Placeholder for now, will be generated asynchronously

    // Store metadata in Supabase
    const { data: newImageData, error } = await this.supabaseService.supabase
      .from('images')
      .insert([
        {
          user_id: userId,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: imageUrl,
          thumbnail_url: thumbnailUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      // Consider deleting the file from Minio if Supabase insertion fails
      await this.minioService.deleteFile(objectName);
      throw new Error(`Failed to save image metadata: ${error.message}`);
    }

    if (!newImageData) {
      await this.minioService.deleteFile(objectName);
      throw new Error('Failed to get new image data back from Supabase');
    }

    // Push a job to the thumbnail generation queue
    const job = {
      imageId: newImageData.id,
      objectName: objectName,
    };
    await this.upstashService.lpush(
      'thumbnail-generation',
      JSON.stringify(job),
    );

    return { url: imageUrl, thumbnailUrl: thumbnailUrl };
  }

  async getImages(user: User) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated.');
    }

    const { data, error } = await this.supabaseService.supabase
      .from('images')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to fetch images: ${error.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }

  async deleteImage(imageId: string, user: User) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated.');
    }

    // First, get the image details from Supabase to get the objectName (Minio path)
    const { data: imageData, error: fetchError } =
      await this.supabaseService.supabase
        .from('images')
        .select('url, user_id')
        .eq('id', imageId)
        .single();

    if (fetchError || !imageData) {
      throw new Error(
        `Image not found or unauthorized: ${fetchError?.message}`,
      );
    }

    if (imageData.user_id !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this image.',
      );
    }

    const objectName = imageData.url.split('/').slice(-2).join('/'); // Extract user_id/uuid.ext from URL

    // Delete from Minio
    await this.minioService.deleteFile(objectName);

    // Delete metadata from Supabase
    const { error: deleteError } = await this.supabaseService.supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      throw new Error(
        `Failed to delete image metadata: ${deleteError.message}`,
      );
    }

    return { message: 'Image deleted successfully.' };
  }
}
