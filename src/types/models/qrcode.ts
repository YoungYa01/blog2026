export type QRCodeReq = {
  file: File;
  x: number;
  y: number;
  size: number;
};

export type QRCodeResp = string