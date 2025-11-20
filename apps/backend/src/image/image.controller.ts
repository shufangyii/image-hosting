import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { ClerkGuard } from '../auth/clerk.guard';
import { ImageService } from './image.service';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @UseGuards(ClerkGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new Error('User not authenticated.');
    }
    const result = await this.imageService.uploadImage(file, req.user);
    return { message: 'Image uploaded successfully', ...result };
  }

  @UseGuards(ClerkGuard)
  @Get()
  async getImages(@Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated.');
    }
    return this.imageService.getImages(req.user);
  }

  @UseGuards(ClerkGuard)
  @Delete(':id')
  async deleteImage(@Param('id') imageId: string, @Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated.');
    }
    return this.imageService.deleteImage(imageId, req.user);
  }
}
