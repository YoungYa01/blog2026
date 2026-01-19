import { create } from "zustand";

import { getUserInfo } from "@/api/user"; // 假设这是你的接口路径
import { getToken, removeToken } from "@/utils/localstorage";
import { UserModel } from "@/types/models/user"; // 你的类型定义

// 定义 Store 的状态和方法类型
interface UserState {
  user: UserModel | null;
  loading: boolean; // 全局加载状态，用于防止白屏
  fetchUserInfo: () => Promise<void>; // 获取用户信息的方法
  logout: () => void; // 登出方法
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true, // 初始为 true，表示页面刚加载，需要检查身份

  fetchUserInfo: async () => {
    const token = getToken();

    // 1. 如果本地连 Token 都没有，直接结束加载，状态为未登录
    if (!token) {
      set({ user: null, loading: false });

      return;
    }

    try {
      // 2. 有 Token，发起请求
      const res = await getUserInfo();

      console.log("res is: ", res);

      // 假设接口返回结构是 { data: UserModel, ... }
      set({ user: res.data, loading: false });
    } catch (error) {
      // 3. 请求失败（Token 过期或网络错误）
      console.error("Fetch user info failed:", error);
      removeToken(); // 清除无效 Token
      set({ user: null, loading: false });
    }
  },

  logout: () => {
    removeToken();
    set({ user: null });
    window.location.href = "/login";
  },
}));
