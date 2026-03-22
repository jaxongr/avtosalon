import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const subDir = file.mimetype.startsWith('video') ? 'videos' : 'photos';
          const dir = join(uploadDir, subDir);
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const name = `${uuid()}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /\.(jpg|jpeg|png|webp|mp4|mov|avi)$/i;
        if (allowedTypes.test(extname(file.originalname))) {
          cb(null, true);
        } else {
          cb(new Error('Only image and video files are allowed'), false);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
