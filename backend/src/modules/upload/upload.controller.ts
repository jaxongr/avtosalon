import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('photos')
  @ApiOperation({ summary: 'Upload photos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map(file => ({
      filename: file.filename,
      url: this.uploadService.getFileUrl(file.filename, 'photos'),
      size: file.size,
    }));
  }

  @Post('videos')
  @ApiOperation({ summary: 'Upload videos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(FilesInterceptor('files', 3))
  uploadVideos(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map(file => ({
      filename: file.filename,
      url: this.uploadService.getFileUrl(file.filename, 'videos'),
      size: file.size,
    }));
  }
}
