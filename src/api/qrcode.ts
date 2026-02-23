import { request } from "@/api/request.ts";
import { Response } from "@/types/models/response.ts";
import { QRCodeResp } from "@/types/models/qrcode.ts";

export const createCustomQRCode = (data: FormData) =>
  request.post<FormData, Response<QRCodeResp>>("/api/v1/public/qr-image", data);
