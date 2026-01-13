import { Outlet } from "react-router-dom";
import {
  BookImage,
  LayoutDashboard,
  Newspaper,
  Shapes,
  Tag,
  Users,
} from "lucide-react";

import { CircularMenu } from "@/components/CircularMenu";

const AdminLayout = () => {
  const MENU_ITEMS = [
    { key: "dashboard", label: "控制台", icon: LayoutDashboard },
    { key: "article", label: "文章", icon: Newspaper },
    { key: "tag", label: "标签", icon: Tag },
    { key: "category", label: "分类", icon: Shapes },
    { key: "album", label: "图集", icon: BookImage },
    { key: "user", label: "个人中心", icon: Users },
    // { key: "setting", label: "系统设置", icon: Settings },
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
