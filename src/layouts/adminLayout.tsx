import { Outlet } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

import { CircularMenu } from "@/components/CircularMenu";

export const AdminLayout = () => {
  // --- 菜单配置 ---
  const MENU_ITEMS = [
    { key: "dashboard", label: "控制台", icon: LayoutDashboard },
    { key: "users", label: "用户管理", icon: Users },
    { key: "analytics", label: "数据分析", icon: BarChart3 },
    { key: "orders", label: "订单列表", icon: ShoppingCart },
    { key: "messages", label: "消息中心", icon: MessageSquare },
    { key: "settings", label: "系统设置", icon: Settings },
  ];

  return (
    // 使用 h-screen 和 overflow-hidden 锁定外层，让内部滚动
    <div className="flex flex-col h-screen w-full bg-content2/50 relative overflow-hidden">
      {/* 顶部导航 (可以保留，也可以简化，只留搜索和头像) */}
      {/*<Header onMenuClick={() => {}} />*/}

      {/* 主内容区域 */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* 新的桌面式导航菜单 */}
      <CircularMenu menuItems={MENU_ITEMS} />
    </div>
  );
};

export default AdminLayout;
