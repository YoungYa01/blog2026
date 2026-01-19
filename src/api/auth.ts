import { http } from "@/api/request.ts";
import {
  CaptchaEmailModel,
  LoginModel,
  LoginResponse,
  RegisterModel,
} from "@/types/models/auth.ts";

export const login = async (data: LoginModel) =>
  await http.post<LoginResponse>("/api/v1/auth/login", data);

export const register = async (data: RegisterModel) =>
  await http.post("/api/v1/auth/register", data);

export const sendCaptchaEmail = async (data: CaptchaEmailModel) =>
  await http.post("/api/v1/auth/captcha", data);
