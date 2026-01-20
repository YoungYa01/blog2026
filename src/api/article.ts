import { http } from "@/api/request.ts";
import { ArticleModel, ImageModel } from "@/types/models/article.ts";
import {
  PaginationModel,
  PaginationResponse,
  Response,
} from "@/types/models/response.ts";

export const uploadImage = async (data: FormData) =>
  await http.post<ImageModel>("/api/v1/files/image/upload", data);

export const getArticleList = async (params: PaginationModel) =>
  await http.get<PaginationResponse<ArticleModel>>("/api/v1/articles", {
    params,
  });

export const createArticle = async (data: ArticleModel) =>
  await http.post<ArticleModel>("/api/v1/articles", data);

export const updateArticle = async (uid: string, data: ArticleModel) =>
  await http.put<ArticleModel>(`/api/v1/articles/${uid}`, data);

export const deleteArticle = async (uid: string) =>
  await http.delete<Response<string>>(`/api/v1/articles/${uid}`);

export const getArticleDetail = async (uid: string) =>
  await http.get<ArticleModel>(`/api/v1/articles/${uid}`);
