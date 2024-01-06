/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { createFile, createDirectory } from '../common/helpers/storage.helper';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import { IVideoFile } from './types/i-video-file';
import { IVideoFileResponse } from './types/i-video-file-response';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { CompileFileDto, CompileFileQualityDto } from './dto/compile-file.dto';
import * as dotenv from 'dotenv';
dotenv.config();

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const REMOTE_HOST = process.env.REMOTE_HOST;
const TMP_VIDEO_FOLDER = 'videos';
const UPLOADS_VIDEO_FOLDER = 'uploads/videos';

@Injectable()
export class FileManagerService {
  async uploadVideo(file: Express.Multer.File): Promise<IVideoFile> {
    const { buffer, originalname } = file;

    const fileId = `${Date.now()}`;
    const ext = this.getFileExtension(originalname);
    const fileName = `${fileId}${ext}`;

    await createFile(TMP_VIDEO_FOLDER, fileName, buffer, 'utf-8');
    const fileInfo = { fileId, ext };
    return fileInfo;
  }

  async removeFolder(folderPath: string) {
    return new Promise((resolve) => {
      fs.rm(folderPath, { recursive: true }, (err) => {
        if (err) {
          console.error(err);
        }
        resolve(true);
      });
    });
  }

  async removeFile(filePath: string) {
    return await new Promise((res) => {
      fs.unlinkSync(filePath);
      res(true);
    });
  }

  async removeVideoById(videoId: string): Promise<string> {
    const folderPath = `uploads/videos/${videoId}`;
    await this.removeFolder(folderPath);
    return `Video ${videoId} removed`;
  }

  compileFile(fileInfo: CompileFileDto) {
    const filePath = `${TMP_VIDEO_FOLDER}/${fileInfo.fileId}${fileInfo.ext}`;
    const dStart = new Date();
    console.info(
      `Compile video ${
        fileInfo.fileId
      } started in ${dStart.toLocaleTimeString()}`,
    );

    createDirectory(`${UPLOADS_VIDEO_FOLDER}/${fileInfo.fileId}`);
    
    const cp_arr = ["426:240", "640:360", "854:480", "1280:720", "1920:1080"]
    const arr = [240, 360, 480, 720, 1080]
    var cp 

   ffmpeg.ffprobe(filePath, (err, metadata) =>  {
        if (err) {
            console.error(err);
            return
        } else {
            cp = metadata.streams[0].height
            for (let i = 0; i < arr.length; i++) {
   
              if (arr[i] <= cp) {
                createDirectory(`${UPLOADS_VIDEO_FOLDER}/${fileInfo.fileId}/${arr[i]}`);
                const savePath = `${UPLOADS_VIDEO_FOLDER}/${fileInfo.fileId}/${arr[i]}/${fileInfo.fileId}.m3u8`;
                this.compileVideoQuality(cp_arr[i], savePath, filePath, fileInfo.fileId)
          
              }				
            }
            return
        }
    });

    return 'File compile started';
  }

  async compileVideoQuality(quality : string, savePath :string , filePath :string , fileId : string): Promise<string> {
    try {

      ffmpeg(filePath, { timeout: 432000 })
      .addOptions([
        '-vf scale=' +quality,
        '-profile:v baseline',
        '-level 3.0',
        '-start_number 0',
        '-hls_time 5',
        '-hls_list_size 0',
        '-f hls',
      ])
      .output(savePath)
      .on('end', () => {
        const dEnd = new Date();
        console.info(
          `Compile video ${
            fileId
          } ended in ${dEnd.toLocaleTimeString()}`,
        );
        setTimeout(() => {
          this.removeFile(filePath);
        }, 5000);

        // if (REMOTE_HOST) {
        //   (async () => {
        //     await axios.post(REMOTE_HOST, {
        //       videoId: fileId,
        //       videoUrl: `/${fileId}/${fileId}.m3u8`,
        //     });
        //   })();
        // }
      })
      .run();

      return 'successfully!!!';
    } catch (error) {
      throw Error(error);
    }
  }

  getFileExtension = (originalname: string) => {
    return path.extname(originalname);
  };

  getFileNameWithoutExtension = (originalname: string) => {
    return originalname.split('.').slice(0, -1).join('.');
  };

  async clearTmp(): Promise<string> {
    try {
      fs.rmdirSync('tmp/videos', { recursive: true });
      createDirectory('tmp/videos');
      return 'TMP was cleared';
    } catch (error) {
      throw Error(error);
    }
  }

  buildVideoFileResponse(videoFile: IVideoFile): IVideoFileResponse {
    return {
      video: {
        ...videoFile,
      },
    };
  }
}
