import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { FileManagerService } from './file-manager.service';
import { ApiFiles } from './decorators/files.decorator';
import { ApiVideoFile } from './decorators/file-type.decorator';
import { ParseFile } from './pipes/parse-file.pipe';
import { IVideoFileResponse } from './types/i-video-file-response';
import { CompileFileDto } from './dto/compile-file.dto';
import { Delete, Param } from '@nestjs/common/decorators';

@Controller('file-manager')
@ApiTags('File Manager')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Get('clear-tmp/videos')
  async clearTmp(): Promise<string> {
    const fileInfo = await this.fileManagerService.clearTmp();
    return fileInfo;
  }

  @Delete('clear-tmp/videos/:videoId')
  async removeVideoById(@Param('videoId') videoId: string): Promise<string> {
    const fileInfo = await this.fileManagerService.removeVideoById(videoId);
    return fileInfo;
  }

  @Post('upload/video')
  @ApiVideoFile()
  async uploadVideo(
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<IVideoFileResponse> {
    const fileInfo = await this.fileManagerService.uploadVideo(file);
    return this.fileManagerService.buildVideoFileResponse(fileInfo);
  }

  @Post('upload/videos')
  @ApiFiles('files', true)
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(files);
    return 'uploadFiles';
  }

  @Post('compile/video')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['fileId,ext'],
      properties: {
        fileId: {
          type: 'string',
        },
        ext: {
          type: 'string',
        },
        vertical: {
          type: 'boolean',
          default: false,
        },
      },
    },
  })
  async compileFile(@Body() file: CompileFileDto) {
    const result = this.fileManagerService.compileFile(file);
    return result;
  }
}
