import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UPLOAD_DIR } from './upload-dir';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

interface UploadedImage {
  buffer: Buffer;
  size: number;
}

/**
 * Identify the image from its first bytes instead of trusting the client's filename / MIME type.
 * SVG is deliberately not accepted: it can carry scripts.
 */
function detectImageExtension(buf: Buffer): 'jpg' | 'png' | 'webp' | 'gif' | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') return 'gif';
  return null;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/uploads')
export class UploadsController {
  /** Used by the CMS editor for website background images. Returns a site-relative URL like /uploads/abc.jpg */
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } }))
  async uploadImage(@UploadedFile() file?: UploadedImage) {
    if (!file) throw new BadRequestException('No file received. Choose an image to upload.');

    const ext = detectImageExtension(file.buffer);
    if (!ext) throw new BadRequestException('Only JPG, PNG, WebP or GIF images are allowed.');

    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomBytes(12).toString('hex')}.${ext}`;
    await writeFile(join(UPLOAD_DIR, name), file.buffer);

    return { url: `/uploads/${name}` };
  }
}
