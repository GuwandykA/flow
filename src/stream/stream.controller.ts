import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Request,
  Response,
  StreamableFile,
  Param,
} from '@nestjs/common';
import { StreamService } from './stream.service';
import * as fs from 'fs';
import { join } from 'path';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Stream')
@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get(':id')
  stream(
    @Param('id') id: string,
    @Request() req,
    @Response({ passthrough: true }) res,
  ): StreamableFile {
    const { range } = req.headers;
    console.log("consol---",range)
    if (!range) {
      throw new HttpException('Requires Range header', HttpStatus.BAD_REQUEST);
    }

    // get video stats
    const filePath = join(process.cwd(), `uploads/videos/${id}/${id}.mp4`);
    const fileSize = fs.statSync(filePath).size;

    // Parse Range
    const CHUNK_SIZE = Math.pow(10, 5) / 4; // 1MB

    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(HttpStatus.PARTIAL_CONTENT, headers);

    const file = fs.createReadStream(filePath, { start, end });

    return new StreamableFile(file);
  }
}
