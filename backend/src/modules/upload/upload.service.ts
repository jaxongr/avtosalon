import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  getFileUrl(filename: string, type: 'photos' | 'videos'): string {
    return `/uploads/${type}/${filename}`;
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      const fullPath = join(process.cwd(), filepath);
      await unlink(fullPath);
    } catch (error) {
      // File might not exist, ignore
    }
  }
}
