import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, ArrowRight, Shield, Grid } from "lucide-react";

// 引入你的配置
import toolsConfig from "@/pages/tools/toolsConfig.tsx";
import { ToolItem } from "@/pages/tools/toolsConfig.tsx";

// --- 组件：全息磁贴 (Holo-Tile) ---
const ToolTile = ({ item }: { item: ToolItem }) => {
  const navigate = useNavigate();
  // 用于实现鼠标跟随光效
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  const handleClick = () => {
    if (item.status === "maintenance") return;
    if (item.type === "internal") {
      navigate(item.url);
    } else {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  // 状态颜色点
  const statusColor = {
    online: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
    maintenance: "bg-rose-500 shadow-[0_0_8px_#f43f5e]",
    beta: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
  };

  return (
    <motion.div
      ref={divRef}
      layout // 仅用于筛选时的位置重排，不涉及尺寸变化
      animate={{ opacity: 1, scale: 1 }}
      className={`relative h-[160px] rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden group cursor-pointer select-none transition-colors duration-500 ${
        item.status === "maintenance"
          ? "opacity-50 grayscale cursor-not-allowed"
          : ""
      }`}
      exit={{ opacity: 0, scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* 1. 鼠标跟随光效 (Spotlight) */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(6,182,212,0.15), transparent 40%)`,
        }}
      />

      {/* 2. 边框高亮跟随 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 border border-cyan-500/30"
        style={{
          maskImage: `radial-gradient(200px circle at ${position.x}px ${position.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(200px circle at ${position.x}px ${position.y}px, black, transparent)`,
        }}
      />

      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        {/* Layer 1: 常驻信息 (Icon & Status) */}
        <div className="flex justify-between items-start">
          {/* 图标：默认居中大图标，Hover时缩小并移到左上角 */}
          <div className="relative">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors duration-300 text-default-400">
              <item.icon size={24} />
            </div>
          </div>

          {/* 状态灯 */}
          <div className="flex flex-col items-end gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${statusColor[item.status]} transition-all duration-300 group-hover:shadow-[0_0_12px_cyan]`}
            />
            {item.type === "external" && (
              <ExternalLink
                className="text-default-600 group-hover:text-default-400 transition-colors"
                size={12}
              />
            )}
          </div>
        </div>

        {/* Layer 2: 标题 (始终显示) */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-default-500 uppercase tracking-widest group-hover:text-cyan-500/70 transition-colors">
              {item.category}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
            {item.title}
          </h3>
        </div>

        {/* Layer 3: 描述信息 (仅Hover显示，绝对定位覆盖，不占流空间) */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col justify-end h-full">
          <p className="text-xs text-default-300 font-mono leading-relaxed line-clamp-3 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            {item.description}
          </p>
          <div className="flex items-center gap-2 text-cyan-500 text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <span>INITIALIZE</span>
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform"
              size={14}
            />
          </div>
        </div>
      </div>

      {/* 背景装饰网格 */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] z-0" />
      <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-[100px]" />
    </motion.div>
  );
};

// --- 主页面 ---
export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filteredTools = useMemo(() => {
    return toolsConfig.filter((tool) => {
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        tool.category.toLowerCase() === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filter]);

  const categories = ["all", "Dev", "Design", "System", "Productivity"];

  return (
    <div className="min-h-screen bg-[#020202] text-foreground relative font-sans selection:bg-cyan-500/30 pb-20">
      {/* 极简背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12">
        {/* Header: HUD 风格 */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 text-xs font-mono mb-1">
              <Grid size={14} />
              <span>GRID_SYSTEM_v3.0</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Dev<span className="text-white/30">Arsenal</span>
            </h1>
          </div>

          {/* 统计数据 */}
          <div className="flex gap-4 font-mono text-xs text-default-500">
            <div className="flex flex-col items-end">
              <span className="text-emerald-500 font-bold">
                {toolsConfig.filter((t) => t.status === "online").length}
              </span>
              <span>ACTIVE</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="text-default-300 font-bold">
                {toolsConfig.length}
              </span>
              <span>TOTAL</span>
            </div>
          </div>
        </div>

        {/* Control Bar: 悬浮式 */}
        <div className="sticky top-6 z-50 mb-8">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl items-center justify-between">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide w-full md:w-auto px-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`
                                px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-wider
                                ${
                                  filter === cat
                                    ? "bg-white text-black"
                                    : "text-default-500 hover:text-white hover:bg-white/5"
                                }
                            `}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="w-full md:w-64 relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-default-500 group-focus-within:text-cyan-400 transition-colors"
                size={14}
              />
              <input
                className="w-full bg-black/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-default-600 outline-none focus:border-cyan-500/50 transition-all h-9"
                placeholder="SEARCH_PROTOCOL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Grid: 4列布局，更加紧凑 */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => (
              <ToolTile key={tool.id} item={tool} />
            ))}
          </AnimatePresence>

          {filteredTools.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-40">
              <Shield className="mx-auto mb-2 text-default-600" size={48} />
              <p className="font-mono text-xs">NO_MODULES_FOUND</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
