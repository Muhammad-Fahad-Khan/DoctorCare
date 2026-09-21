import { join } from 'path';

/** Where admin-uploaded images live on disk. Override with UPLOAD_DIR (e.g. a mounted volume in production). */
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');
