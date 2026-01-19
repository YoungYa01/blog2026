import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "@heroui/spinner";

import { useUserStore } from "@/store/userStore";
import { getToken } from "@/utils/localstorage";

type Props = {
  children: React.ReactNode;
};

export default function Auth({ children }: Props) {
  // 从 Zustand Store 中提取状态和方法
  const { user, loading, fetchUserInfo, logout } = useUserStore();
  const location = useLocation();
  const token = getToken();

  useEffect(() => {
    if (token && !user) {
      fetchUserInfo();
    }
  }, [fetchUserInfo, token, user]);

  // 2. 定时心跳（可选优化）：每5分钟静默刷新一次用户信息
  useEffect(() => {
    const timer = setInterval(
      () => {
        if (getToken()) {
          fetchUserInfo();
        }
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(timer);
  }, [fetchUserInfo]);

  // --- 鉴权逻辑分支 ---

  // A. 第一道防线：本地没有 Token
  // 不需要等待网络请求，直接踢回登录页
  if (!token) {
    return <Navigate replace state={{ from: location }} to="/auth/login" />;
  }

  // B. 正在从后端验证 Token 有效性
  // 显示全屏 Loading，避免白屏
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        {/* 这里可以使用你喜欢的任何 Loading 动画 */}
        <div className="flex flex-col items-center gap-4">
          <Spinner color="primary" size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">
            正在验证身份权限...
          </p>
        </div>
      </div>
    );
  }

  // C. 请求结束，但没有 User 数据
  // 说明 Token 虽然本地有，但是过期的或者伪造的（后端返回了错误）
  if (!user) {
    return <Navigate replace to="/auth/login" />;
  }

  // D. 业务逻辑鉴权：检查 is_active
  // 这是一个非常实用的功能，防止离职/封禁员工继续访问
  if (!user.is_active) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white gap-4">
        <h1 className="text-2xl font-bold text-red-500">账号已冻结</h1>
        <p className="text-gray-400">
          您的账号当前处于非活跃状态，无法访问系统。
        </p>
        <button
          className="px-4 py-2 border border-white/20 rounded hover:bg-white/10 transition"
          onClick={logout}
        >
          返回登录页
        </button>
      </div>
    );
  }

  // E. 全部通过，渲染子路由
  return <>{children}</>;
}
