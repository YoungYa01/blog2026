import { http } from './request';

export const getCollegeNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/college-notice?page=${page}`);
};

export const getAcademicNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/academic-notice?page=${page}`);
};

export const getGraduateNotice = (page: number = 1) => {
  return http.get(`/api/v1/public/graduate-notice?page=${page}`);
};
