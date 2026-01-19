import { http } from "@/api/request.ts";
import { UserModel } from "@/types/models/user.ts";

export const getUserInfo = async () =>
  await http.get<UserModel>("/api/v1/user/profile");
