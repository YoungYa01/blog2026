import { TOKEN } from "@/utils/const.ts";

export const getToken = () => localStorage.getItem(TOKEN);

export const setToken = (token: string) => localStorage.setItem(TOKEN, token);
