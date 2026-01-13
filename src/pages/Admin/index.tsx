import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Eye,
  MessageCircle,
  Clock,
  Zap,
  Globe,
  Activity,
  Cpu,
  FileText,
} from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";

import { CHANNEL_RECEIVE_KEY, CHANNEL_SEND_KEY } from "@/utils/const.ts";

// --- 模拟数据 ---
const VISIT_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  visitors: Math.floor(Math.random() * 500) + 100,
  pageviews: Math.floor(Math.random() * 800) + 200,
}));

const SERVER_LOAD = [
  { name: "CPU", value: 45, color: "#06b6d4" }, // Cyan
  { name: "RAM", value: 72, color: "#8b5cf6" }, // Purple
  { name: "NET", value: 28, color: "#10b981" }, // Emerald
];

// --- 子组件：全息数据卡片 ---
const StatCard = ({ title, value, subtext, icon: Icon, color, delay }: any) => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className="relative group"
    initial={{ opacity: 0, y: 20 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    {/* 发光背景 */}
    <div
      className={`absolute inset-0 bg-${color}-500/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
    />

    <Card className="bg-content1/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden relative">
      <CardBody className="p-6 relative z-10 flex flex-row items-center justify-between gap-4">
        <div>
          <p className="text-tiny uppercase font-bold text-default-400 tracking-wider mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {subtext && (
              <span className={`text-xs font-mono text-${color}-400`}>
                {subtext}
              </span>
            )}
          </div>
        </div>
        <div
          className={`p-3 rounded-xl bg-${color}-500/20 text-${color}-500 ring-1 ring-${color}-500/50 shadow-[0_0_15px_rgba(var(--heroui-${color}),0.3)]`}
        >
          <Icon size={24} />
        </div>
      </CardBody>

      {/* 底部进度条装饰 */}
      <motion.div
        animate={{ width: "100%" }}
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-${color}-500 to-transparent opacity-50`}
        initial={{ width: 0 }}
        transition={{ delay: delay + 0.5, duration: 1.5 }}
      />
    </Card>
  </motion.div>
);

const Dashboard = () => {
  // 模拟实时时间
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_SEND_KEY);

    channel.onmessage = (event) => {
      if (event.data === CHANNEL_SEND_KEY) {
        channel.postMessage(CHANNEL_RECEIVE_KEY);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[80vh] text-foreground relative">
      {/* 顶部状态栏 HUD */}
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <motion.h1
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-default-400"
            initial={{ opacity: 0, x: -20 }}
          >
            Command Deck
          </motion.h1>
          <motion.p
            animate={{ opacity: 1 }}
            className="text-sm text-default-400 font-mono mt-1 flex items-center gap-2"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            SYSTEM ONLINE :: {time.toLocaleTimeString()}
          </motion.p>
        </div>

        {/* 右侧服务器状态微件 */}
        <motion.div
          animate={{ opacity: 1 }}
          className="hidden md:flex gap-6 text-xs font-mono text-default-400 bg-content1/30 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md"
          initial={{ opacity: 0 }}
        >
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-400" size={14} />
            <span>CPU: 45%</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="text-purple-400" size={14} />
            <span>MEM: 12GB</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="text-emerald-400" size={14} />
            <span>LATENCY: 24ms</span>
          </div>
        </motion.div>
      </div>

      {/* --- 第一排：关键指标 (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          color="cyan"
          delay={0.1}
          icon={Eye}
          subtext="+12% ↑"
          title="Total Views"
          value="128.4K"
        />
        <StatCard
          color="purple"
          delay={0.2}
          icon={Zap}
          subtext="LIVE"
          title="Active Users"
          value="2,845"
        />
        <StatCard
          color="pink"
          delay={0.3}
          icon={MessageCircle}
          subtext="+5 New"
          title="Comments"
          value="892"
        />
        <StatCard
          color="amber"
          delay={0.4}
          icon={Clock}
          subtext="-2% ↓"
          title="Avg. Duration"
          value="4m 32s"
        />
      </div>

      {/* --- 第二排：主图表区域 (非对称布局) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[400px]">
        {/* 左侧大图：流量趋势 */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 h-full"
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full bg-content1/40 border border-white/5 backdrop-blur-md">
            <CardBody className="p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="text-cyan-500" size={18} />
                    Traffic Analysis
                  </h3>
                  <p className="text-xs text-default-400">
                    Real-time visitor data stream
                  </p>
                </div>
                {/* 装饰性 Tab */}
                <div className="flex bg-default-100/50 rounded-lg p-1 text-xs">
                  <button className="px-3 py-1 bg-background rounded shadow-sm text-foreground">
                    24H
                  </button>
                  <button className="px-3 py-1 text-default-500 hover:text-foreground">
                    7D
                  </button>
                  <button className="px-3 py-1 text-default-500 hover:text-foreground">
                    30D
                  </button>
                </div>
              </div>

              <div className="w-full h-[85%]">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={VISIT_DATA}>
                    <defs>
                      <linearGradient
                        id="colorVisit"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#06b6d4"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06b6d4"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorPage"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      axisLine={false}
                      dataKey="time"
                      tick={{ fill: "#71717a", fontSize: 10 }}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10 }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#27272a",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#e4e4e7" }}
                    />
                    <Area
                      dataKey="pageviews"
                      fill="url(#colorPage)"
                      fillOpacity={1}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      type="monotone"
                    />
                    <Area
                      dataKey="visitors"
                      fill="url(#colorVisit)"
                      fillOpacity={1}
                      stroke="#06b6d4"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* 右侧：服务器负载 & 快速日志 */}
        <div className="flex flex-col gap-6 h-full">
          {/* 系统健康度 (环形图风格替代) */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full bg-content1/40 border border-white/5 backdrop-blur-md">
              <CardBody className="p-6">
                <h3 className="text-sm font-semibold text-default-500 uppercase tracking-widest mb-4">
                  System Load
                </h3>
                <div className="space-y-6">
                  {SERVER_LOAD.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-mono text-default-400">
                          {item.name}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: item.color }}
                        >
                          {item.value}%
                        </span>
                      </div>
                      <Progress
                        classNames={{
                          track: "bg-default-100",
                          indicator: "bg-current",
                        }}
                        size="sm"
                        style={{ color: item.color } as any}
                        value={item.value}
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* 最近访客 (头像组) */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="h-auto"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/5">
              <CardBody className="p-4 flex flex-row items-center justify-between">
                <div>
                  <p className="text-xs text-default-400 mb-1">RECENT LOGIN</p>
                  <AvatarGroup isBordered max={4} size="sm">
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                  </AvatarGroup>
                </div>
                <Chip color="success" size="sm" variant="flat">
                  Online
                </Chip>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* --- 第三排：底部文章/日志区域 (留出底部空间给 CircularMenu) --- */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-32" // 关键：增加底部 Margin，防止内容被 CircularMenu 遮挡
        initial={{ opacity: 0, y: 30 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-content1/30 border border-white/5 backdrop-blur-md">
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Latest Transmissions</h3>
              <Button className="text-cyan-400" size="sm" variant="light">
                View All Logs
              </Button>
            </div>
            {/* 模拟表格行 */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded bg-default-100 text-default-500 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium group-hover:text-cyan-400 transition-colors">
                      Project {i === 1 ? "Alpha" : i === 2 ? "Beta" : "Gamma"}{" "}
                      Deployment
                    </h4>
                    <p className="text-xs text-default-400">
                      Updated by Commander Shepard • 2h ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:block w-32 h-1.5 bg-default-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[70%]" />
                  </div>
                  <Chip
                    className="border-none"
                    color={i === 1 ? "success" : "warning"}
                    size="sm"
                    variant="dot"
                  >
                    {i === 1 ? "Deployed" : "Reviewing"}
                  </Chip>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </motion.div>

      {/* 装饰性背景网格线 (HUD Lines) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10 opacity-20">
        <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <div className="absolute top-[60%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent dashed" />
      </div>
    </div>
  );
};

export default Dashboard;