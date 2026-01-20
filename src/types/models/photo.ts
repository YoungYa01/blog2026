export interface Photo {
  id: string; // 对应 json:"id" (UUID)
  url: string; // 对应 json:"url"
  title: string;
  story: string;
  location: string;
  date: string; // 后端返回 ISO 字符串
  likes: number;
  tags: string[]; // 对应 json:"tags"
}
