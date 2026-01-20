import { http } from "@/api/request.ts";
import { Photo } from "@/types/models/photo.ts";
import {
  PaginationModel,
  PaginationResponse,
  Response,
} from "@/types/models/response.ts";

export const getPhotoList = async (params: PaginationModel) =>
  await http.get<PaginationResponse<Photo>>("/api/v1/photos", {
    params,
  });

export const deletePhoto = async (id: string) =>
  await http.delete<Response<string>>(`/api/v1/photos/${id}`);

export const createPhoto = async (data: FormData) =>
  await http.post<Response<Photo>>("/api/v1/photos/upload", data);

export const updatePhoto = async (id: string, data: FormData) =>
  await http.put<Response<Photo>>(`/api/v1/photos/${id}`, data);

export const likePhoto = async (id: string) =>
  await http.get<Response<Photo>>(`/api/v1/photos/like/${id}`);