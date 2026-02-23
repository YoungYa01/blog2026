import { request } from "@/api/request.ts";

export const createCustomQRCode = (data: FormData) =>
  request.post<FormData, Blob>("/api/v1/public/qr-image", data, {
    responseType: "blob",
  });
