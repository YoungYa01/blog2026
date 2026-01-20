export type ArticleModel = {
  id: number;
    uuid: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: "draft" | "published";
  date: string;
  views: number;
  user_id: number;
  created_at: string;
};

export type ImageModel = {
  id: number;
    uuid: string;
  file_name: string;
  path: string;
  size: number;
  created_at: string;
  user_id: number;
};
