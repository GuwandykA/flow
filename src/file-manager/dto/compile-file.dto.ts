import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CompileFileDto {
  @IsString()
  @IsNotEmpty()
  readonly fileId: string;

  @IsString()
  @IsNotEmpty()
  readonly ext: string;

  @IsBoolean()
  readonly vertical: boolean;
}


export class CompileFileQualityDto {
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsNotEmpty()
  quality: string;

  @IsString()
  @IsNotEmpty()
  savePath: string;

  @IsString()
  @IsNotEmpty()
  fileId: string;
  
  @IsBoolean()
  readonly vertical: boolean;
}