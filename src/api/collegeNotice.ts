import { http } from "./request";

export const getCollegeNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/college-notice?page=${page}`);
};

export const getAcademicNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/academic-notice?page=${page}`);
};

export const getGraduateNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/graduate-notice?page=${page}`);
};

export const getPublicNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/public-notice?page=${page}`);
};

export const getAnnouncementNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/announcement-notice?page=${page}`);
};

export const getDJNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/DJ-notice?page=${page}`);
};
