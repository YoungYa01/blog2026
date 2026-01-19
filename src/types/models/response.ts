export type Response<T = any> = {
  success: boolean;
  message: string;
  data: T;
  error: string;
};
