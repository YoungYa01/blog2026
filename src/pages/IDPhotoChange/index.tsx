import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SPECS } from "./constants";
import BottomNav from "./BottomNav";

export default function IDPhotoChangePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSpecs = SPECS.filter((spec) =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* ... 顶部搜索区保持不变 ... */}
      <div className="bg-blue-600 p-6 pb-10 rounded-b-[2.5rem] shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">
          你好，
          <br />
          想制作什么证件照？
        </h1>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            className="w-full pl-12 pr-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="搜索规格，如：一寸、签证..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ... 规格列表保持不变 ... */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-2 overflow-hidden min-h-[400px]">
          {filteredSpecs.length > 0 ? (
            filteredSpecs.map((spec, index) => (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div
                key={spec.id}
                className={`flex items-center justify-between p-4 active:bg-gray-50 transition-colors ${
                  index !== filteredSpecs.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onClick={() => navigate(`/idphoto/make?specId=${spec.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">
                    {spec.width}x{spec.height}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{spec.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{spec.size}</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-300" size={18} />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">未找到相关规格</div>
          )}
        </div>
      </div>

      {/* 使用新的底部导航 */}
      <BottomNav />
    </div>
  );
}
