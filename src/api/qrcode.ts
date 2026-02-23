import { http } from "@/api/request.ts";
import { Response } from "@/types/models/response.ts";

export const createCustomQRCode = (data: FormData) =>
  http.post<Response>("/api/v1/public/qr-image", data);
