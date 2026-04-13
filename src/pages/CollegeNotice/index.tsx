import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Loader2,
  BellOff,
  ChevronLeft,
  Captions,
  University,
  Handshake,
} from "lucide-react";

// API 接口导入
import {
  getCollegeNotice,
  getAcademicNotice,
  getGraduateNotice,
  getPublicNotice,
  getAnnouncementNotice,
  getDJNotice,
} from "@/api/collegeNotice";

interface NoticeItem {
  title: string;
  link: string;
  date?: string;
}

interface NoticeResponse {
  success: boolean;
  message: string;
  data: NoticeItem[];
}

// 定义子组件的 Props
interface NoticeCardProps {
  title: string;
  icon: React.ReactNode;
  delay: number;
  // 注意：需要确保你的 API 函数支持接收 page 参数
  fetchApi: (page: number) => Promise<NoticeResponse>;
}

/**
 * 独立的通知卡片组件
 * 自己管理自己的 loading、page 和数据状态，实现局部刷新
 */
const NoticeCard: React.FC<NoticeCardProps> = ({
  title,
  icon,
  delay,
  fetchApi,
}) => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        // 传入 page 参数获取对应页码的数据
        const res = await fetchApi(page);

        if (res.success) {
          setNotices(res.data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${title}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [page, fetchApi, title]);

  const renderNoticeList = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-default-400 h-full">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <span className="text-sm">正在同步第 {page} 页...</span>
        </div>
      );
    }

    if (notices.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-default-400 h-full">
          <BellOff className="w-6 h-6 mb-2 opacity-50" />
          <span className="text-sm">本页暂无通知</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {notices.map((notice, index) => (
          <motion.a
            key={`${page}-${index}`}
            animate={{ opacity: 1, x: 0 }}
            className="group relative flex flex-col gap-1 p-3 rounded-xl hover:bg-default-100 dark:hover:bg-default-50 transition-all active:scale-[0.98]"
            href={notice.link}
            initial={{ opacity: 0, x: -10 }}
            rel="noopener noreferrer"
            target="_blank"
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-default-300 group-hover:text-primary transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </span>
              <h3 className="text-sm md:text-base font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed flex-grow">
                {notice.date ? (
                  <span className="text-[11px] font-mono text-gray-50 px-1.5 py-0.5 rounded border border-gray-50">
                  {notice.date}
                </span>
              ) : (
                  <span className="text-[10px] font-bold text-danger-500 bg-danger-50 px-1.5 py-0.5 rounded border border-danger-100">
                  置顶
                </span>
              )} {"  "} {notice.title}
              </h3>
            </div>

            {/* 🔥 2. 增加日期显示区域 */}
            {/*<div className="pl-7 flex items-center gap-2">*/}
            {/*  {notice.date ? (*/}
            {/*    <span className="text-[11px] font-mono text-default-400 px-1.5 py-0.5 rounded">*/}
            {/*      {notice.date}*/}
            {/*    </span>*/}
            {/*  ) : (*/}
            {/*    <span className="text-[10px] font-bold text-danger-500 bg-danger-50 px-1.5 py-0.5 rounded border border-danger-100">*/}
            {/*      置顶*/}
            {/*    </span>*/}
            {/*  )}*/}
            {/*</div>*/}
          </motion.a>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full flex flex-col bg-background/60 backdrop-blur-md border border-default-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex gap-3 px-6 pt-6 pb-2 shrink-0">
          <div className="p-2 rounded-lg bg-default-100 dark:bg-default-50">
            {icon}
          </div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </CardHeader>

        {/* 核心改动：固定高度，局部滚动，自定义滚动条样式 */}
        <CardBody
          className="px-3 pb-2 pt-2 flex-grow overflow-y-auto max-h-[360px]
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-thumb]:bg-default-200
          dark:[&::-webkit-scrollbar-thumb]:bg-default-100
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-default-300"
        >
          {renderNoticeList()}
        </CardBody>

        {/* 分页控制区域 */}
        <CardFooter className="px-6 py-4 border-t border-default-100 flex justify-between items-center shrink-0">
          <button
            className="flex items-center gap-1 text-sm text-default-500 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </button>

          <span className="text-xs text-default-400 font-medium">
            第 {page} 页
          </span>

          <button
            className="flex items-center gap-1 text-sm text-default-500 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            disabled={loading || notices.length === 0} // 如果当前页没有数据，则假设没有下一页
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

/**
 * 主页面组件
 */
const CollegeNotice: React.FC = () => {
  // 配置数据：将不同卡片的标题、图标和对应的接口请求绑定
  const cardsConfig = [
    {
      title: "学院通知",
      icon: <School className="w-5 h-5 text-blue-500" />,
      fetchApi: getCollegeNotice,
      delay: 0.1,
    },
    {
      title: "学术通知",
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      fetchApi: getAcademicNotice,
      delay: 0.2,
    },
    {
      title: "党建通知",
      icon: <Handshake className="w-5 h-5 text-red-600" />,
      fetchApi: getDJNotice,
      delay: 0.3,
    },
    {
      title: "研究生公告",
      icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
      fetchApi: getGraduateNotice,
      delay: 0.4,
    },
    {
      title: "学生公告",
      icon: <Captions className="w-5 h-5 text-yellow-500" />,
      fetchApi: getAnnouncementNotice,
      delay: 0.5,
    },
    {
      title: "公示公告",
      icon: <University className="w-5 h-5 text-gray-500" />,
      fetchApi: getPublicNotice,
      delay: 0.6,
    },
  ];

  return (
    <div className="container mx-auto px-4 pb-6 md:py-20 min-h-[60vh]">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题区 */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-foreground">
            School of Computer and Artificial Intelligence,{" "}
            <a
              className="text-secondary-500 border-b-1"
              href="https://www.swjtu.edu.cn/"
              rel="noreferrer"
              target="_blank"
            >
              SWJTU
            </a>
          </h1>
          <p className="text-default-500 text-sm md:text-base">
            获取最新的学院动态、学术讲座与研究生事务
          </p>
        </motion.div>

        {/* 响应式网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {cardsConfig.map((card) => (
              <NoticeCard
                key={card.title}
                delay={card.delay}
                fetchApi={
                  card.fetchApi as (page: number) => Promise<NoticeResponse>
                }
                icon={card.icon}
                title={card.title}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CollegeNotice;
