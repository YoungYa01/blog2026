import { useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";

import BottomNav from "../BottomNav";

interface HistoryItem {
  id: number;
  specName: string;
  date: string;
  imgUrl: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 模拟从 LocalStorage 读取数据 (真实逻辑需在 Make 页面保存)
  useEffect(() => {
    const saved = localStorage.getItem("idphoto_history");

    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    if (confirm("确定清空历史记录吗？")) {
      localStorage.removeItem("idphoto_history");
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-lg font-bold">制作记录</h1>
        {history.length > 0 && (
          <button
            className="text-gray-400 hover:text-red-500"
            onClick={clearHistory}
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {history.length > 0 ? (
          history.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-2xl shadow-sm flex space-x-4"
            >
              <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  alt="History"
                  className="w-full h-full object-cover"
                  src={item.imgUrl}
                />
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h3 className="font-bold text-gray-800">{item.specName}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                <div className="mt-2 flex space-x-2">
                  <a
                    download
                    className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
                    href={item.imgUrl}
                  >
                    再次下载
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-300">
            <Clock className="mb-4 opacity-50" size={48} />
            <p>暂无制作记录</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
