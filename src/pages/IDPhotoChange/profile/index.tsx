import {
  User,
  Settings,
  HelpCircle,
  Shield,
  ChevronRight,
  FileText,
  DownloadIcon,
} from "lucide-react";

import BottomNav from "../BottomNav";

export default function ProfilePage() {
  const menuItems = [
    { icon: FileText, label: "我的订单", desc: "查看付费记录" },
    { icon: HelpCircle, label: "常见问题", desc: "如何拍出好看的照片" },
    { icon: Shield, label: "隐私协议", desc: "" },
    { icon: Settings, label: "设置", desc: "版本 v1.0.0" },
    { icon: DownloadIcon, label: "下载源码", desc: "" },
  ];

  const handleClick = (label: string) => {
    if (label === "下载源码") {
      window.open("/IDPhotoChange.7z");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部卡片 */}
      <div className="bg-blue-600 p-6 pt-12 pb-16 rounded-b-[2rem]">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm border-2 border-white/30">
            <User size={32} />
          </div>
          <div className="text-white">
            <h1 className="text-xl font-bold">用户****1234</h1>
            <p className="text-blue-100 text-sm opacity-80">ID: 8829301</p>
          </div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-5 active:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onClick={() => handleClick(item.label)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <Icon size={18} />
                  </div>
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{item.desc}</span>
                  <ChevronRight className="text-gray-300" size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
