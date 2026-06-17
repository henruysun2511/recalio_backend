declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
      stream: any;
      destination?: string;
      filename?: string;
      path?: string;
    }
  }
}
