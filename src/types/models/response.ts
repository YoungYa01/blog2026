export type Response<T = any> = {
  success: boolean;
  message: string;
  data: T;
  error: string;
};

export type PaginationModel = {
  page?: number;
  page_size?: number;
  total?: number;
  keyword?: string;
  sort?: string;
};

export type PaginationResponse<T = any> = {
  list: T[];
  total: number;
};
