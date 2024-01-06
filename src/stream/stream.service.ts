import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class StreamService {
  stream(): StreamableFile {
    const file = createReadStream(
      join(process.cwd(), 'tmp/homer-ice-cream.webp'),
    );
    return new StreamableFile(file);
  }
}
