import { fileMimetypeFilter } from '../filters/file-mimetype.filter';
import { ApiFile } from './file.decorator';

export function ApiVideoFile(fileName = 'file', required = false) {
  return ApiFile(fileName, required, {
    fileFilter: fileMimetypeFilter('video'),
  });
}
