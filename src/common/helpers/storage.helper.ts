import * as fs from 'fs';
import { promisify } from 'util';

export const checkIfFileOrDirectoryExists = (directory: string): boolean => {
  return fs.existsSync(directory);
};

export const createDirectory = (directory: string) => {
  fs.mkdirSync(directory);
};

export const getFile = async (
  directory: string,
  encoding?: any,
): Promise<string | Buffer> => {
  const readFile = promisify(fs.readFile);

  return encoding ? readFile(directory, { encoding }) : readFile(directory, {});
};

export const createFile = async (
  directory: string,
  fileName: string,
  data: string | NodeJS.ArrayBufferView,
  fileEncoding: BufferEncoding,
): Promise<void> => {
  if (!checkIfFileOrDirectoryExists(directory)) {
    createDirectory(directory);
  }

  const writeFile = promisify(fs.writeFile);

  return await writeFile(`${directory}/${fileName}`, data, fileEncoding);
};

export const deleteFile = async (directory: string): Promise<void> => {
  const unlink = promisify(fs.unlink);

  return await unlink(directory);
};
