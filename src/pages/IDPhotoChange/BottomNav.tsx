import { Home, History, User } from "lucide-react";

export default function BottomNav() {
  const pathname = window.location.pathname;

  const navItems = [
    { name: "首页", href: "/idphoto/home", icon: Home },
    { name: "历史", href: "/idphoto/history", icon: History },
    { name: "我的", href: "/idphoto/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center pb-safe pt-2 h-[60px] z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <a
            key={item.name}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? "text-blue-600" : "text-gray-400"
            }`}
            href={item.href}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </a>
        );
      })}
    </div>
  );
}
