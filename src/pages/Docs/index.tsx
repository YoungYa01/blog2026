import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
  Search,
  Calendar,
  Eye,
  X,
  Clock,
  Cpu,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { MdPreview } from "md-editor-rt";
import "md-editor-rt/lib/style.css";

// HeroUI Components
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Spinner } from "@heroui/spinner";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";

// API
import { getArticleList, getArticleDetail } from "@/api/article.ts";
import { ArticleModel } from "@/types/models/article.ts";
import { PaginationModel } from "@/types/models/response.ts";

// --- 组件：时间轴节点卡片 (Timeline Node) ---
const TimelineNode = ({
  article,
  index,
  onClick,
}: {
  article: ArticleModel;
  index: number;
  onClick: () => void;
}) => {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`flex w-full mb-12 relative ${isEven ? "justify-start" : "justify-end"}`}
    >
      {/* 1. 中轴线上的点 (Mobile: hidden, Desktop: visible) */}
      <div className="absolute left-4 md:left-1/2 top-8 w-4 h-4 -ml-2 rounded-full border-2 border-cyan-500 bg-[#09090b] z-20 shadow-[0_0_10px_cyan]">
        <div className="w-full h-full bg-cyan-500 rounded-full animate-ping opacity-20" />
      </div>

      {/* 2. 只有移动端的左侧连接线 */}
      <div className="md:hidden absolute left-4 top-12 bottom-[-48px] w-px bg-white/10" />

      {/* 3. 卡片容器 */}
      <motion.div
        className={`relative w-[calc(100%-40px)] ml-10 md:ml-0 md:w-[45%] group cursor-pointer`}
        initial={{ opacity: 0, x: isEven ? -50 : 50, filter: "blur(10px)" }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        viewport={{ once: true, margin: "-100px" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        onClick={onClick}
      >
        {/* 连接线 (Desktop) */}
        <div
          className={`hidden md:block absolute top-9 h-px bg-cyan-500/30 w-10 transition-all duration-500 group-hover:w-full group-hover:bg-cyan-500/50 ${isEven ? "right-[-40px]" : "left-[-40px]"}`}
        />

        {/* 卡片主体：切角设计 + 赛博边框 */}
        <div
          className="relative bg-content1/20 backdrop-blur-md border border-white/10 p-6 
                      hover:bg-content1/40 hover:border-cyan-500/50 transition-all duration-300
                      before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t before:border-l before:border-cyan-500 before:transition-all before:duration-300 group-hover:before:w-full group-hover:before:h-full
                      after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:border-b after:border-r after:border-cyan-500 after:transition-all after:duration-300 group-hover:after:w-full group-hover:after:h-full"
          style={{
            clipPath:
              "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
          }}
        >
          {/* 装饰性HUD元素 */}
          <div className="absolute top-2 right-4 text-[10px] font-mono text-cyan-500/50 flex items-center gap-1">
            <Activity size={10} />
            SYS_LOG_{index.toString().padStart(3, "0")}
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {article.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 font-mono border border-cyan-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
              {article.title}
            </h3>
          </div>

          <p className="text-default-400 text-sm line-clamp-3 font-mono leading-relaxed opacity-80 mb-4">
            {article.excerpt ||
              ">> Encrypted content block. Authorization required for decryption..."}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-4 text-xs text-default-500 font-mono">
              <span className="flex items-center gap-1">
                <Calendar size={12} />{" "}
                {new Date(article.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={12} /> {article.views}
              </span>
            </div>
            <div className="bg-white/5 p-1.5 rounded-full text-white/50 group-hover:bg-cyan-500 group-hover:text-black transition-all">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- 组件：详情阅读器 (保持之前的逻辑，略微优化样式) ---
const ArticleReader = ({
  articleId,
  allArticles,
  isOpen,
  onClose,
  onChangeArticle,
}: {
  articleId: string | null;
  allArticles: ArticleModel[];
  isOpen: boolean;
  onClose: () => void;
  onChangeArticle: (newId: string) => void;
}) => {
  const [article, setArticle] = useState<ArticleModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  const { prev, next } = useMemo(() => {
    if (!articleId || allArticles.length === 0)
      return { prev: null, next: null };
    const currentIndex = allArticles.findIndex((a) => a.uuid === articleId);

    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? allArticles[currentIndex - 1] : null,
      next:
        currentIndex < allArticles.length - 1
          ? allArticles[currentIndex + 1]
          : null,
    };
  }, [articleId, allArticles]);

  const fetchDetail = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await getArticleDetail(id);

      setArticle(data);
      setContentKey((k) => k + 1);
    } catch (e) {
      console.error("Failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && articleId) fetchDetail(articleId);
  }, [isOpen, articleId]);

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-black/95 m-0 h-[100dvh] max-h-[100dvh] border-none",
        wrapper: "w-screen h-[100dvh] overflow-hidden",
        closeButton: "z-50 text-white hover:bg-white/20 right-6 top-6 fixed",
      }}
      isOpen={isOpen}
      size="full"
      onClose={onClose}
    >
      <ModalContent>
        <ModalBody className="p-0 w-full h-full relative overflow-hidden flex flex-col">
          <AnimatePresence>
            {loading && (
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                <Spinner color="primary" size="lg" />
                <p className="mt-4 text-cyan-500 font-mono text-xs animate-pulse">
                  DECRYPTING...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && article && (
            <ScrollShadow className="flex-1 w-full" size={0}>
              <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen flex flex-col">
                <motion.div
                  key={contentKey}
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* 文章头部 */}
                  <div className="mb-12 border-b border-white/10 pb-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags?.map((tag) => (
                        <Chip
                          key={tag}
                          classNames={{ base: "bg-cyan-500/10 text-cyan-400" }}
                          size="sm"
                          variant="flat"
                        >
                          #{tag}
                        </Chip>
                      ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                      {article.title}
                    </h1>
                    <div className="flex gap-6 text-sm text-default-500 font-mono">
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />{" "}
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock size={14} />{" "}
                        {Math.ceil(article.content.length / 500)} MIN
                      </span>
                    </div>
                  </div>

                  {/* 文章内容 */}
                  <div className="min-h-[40vh]">
                    <MdPreview
                      codeTheme="atom"
                      editorId="reader"
                      modelValue={article.content}
                      style={
                        {
                          backgroundColor: "transparent",
                          "--md-color": "#a1a1aa",
                          fontSize: "1.05rem",
                          lineHeight: "1.8",
                        } as any
                      }
                      theme="dark"
                    />
                  </div>
                </motion.div>

                {/* 底部导航 */}
                <div className="mt-24 grid grid-cols-2 gap-4">
                  <button
                    className="group text-left p-6 rounded-none border border-white/10 hover:bg-white/5 hover:border-cyan-500/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed relative overflow-hidden"
                    disabled={!prev}
                    onClick={() => onChangeArticle(prev!.uuid)}
                  >
                    <div className="absolute top-0 left-0 w-1 h-0 bg-cyan-500 transition-all group-hover:h-full" />
                    <span className="text-xs font-mono text-default-500 block mb-2 group-hover:text-cyan-400">
                      &lt; PREV_LOG
                    </span>
                    <div className="text-white font-bold text-sm md:text-lg truncate">
                      {prev?.title || "NULL"}
                    </div>
                  </button>

                  <button
                    className="group text-right p-6 rounded-none border border-white/10 hover:bg-white/5 hover:border-cyan-500/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed relative overflow-hidden"
                    disabled={!next}
                    onClick={() => onChangeArticle(next!.uuid)}
                  >
                    <div className="absolute top-0 right-0 w-1 h-0 bg-cyan-500 transition-all group-hover:h-full" />
                    <span className="text-xs font-mono text-default-500 block mb-2 group-hover:text-cyan-400">
                      NEXT_LOG &gt;
                    </span>
                    <div className="text-white font-bold text-sm md:text-lg truncate">
                      {next?.title || "NULL"}
                    </div>
                  </button>
                </div>
              </div>
            </ScrollShadow>
          )}

          <Button
            isIconOnly
            className="fixed top-6 right-6 z-50 bg-black/50 backdrop-blur-md border border-white/10 text-white rounded-full"
            onPress={onClose}
          >
            <X size={20} />
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// --- 主页面 ---
export default function BlogArticlePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const loadingRef = useRef(false);

  // --- Fetch Logic ---
  const fetchArticles = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const params: PaginationModel = { page, page_size: 10 };

      if (searchQuery) params.keyword = searchQuery;

      const { data } = await getArticleList(params);
      const list = data.list || [];

      if (list.length === 0) {
        setHasMore(false);
      } else {
        setArticles((prev) => {
          if (page === 1) return list;
          const exists = new Set(prev.map((p) => p.uuid));

          return [...prev, ...list.filter((p) => !exists.has(p.uuid))];
        });
        setPage((p) => p + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, page, searchQuery]);

  // Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      setArticles([]);
      loadingRef.current = false;
      fetchArticles();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Infinite Scroll Trigger (Simple)
  useEffect(() => {
    if (page === 1 && articles.length === 0) fetchArticles();

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        fetchArticles();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchArticles]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050505] text-foreground relative overflow-hidden font-sans"
    >
      {/* 顶部进度条 */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* 动态背景 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#050505] to-[#050505]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="sticky top-0 z-40 py-6 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 mb-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-cyan-500 text-xs font-mono tracking-widest mb-1">
              <Cpu className="animate-spin-slow" size={14} />
              <span>SYSTEM_READY</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              TIMELINE_ARCHIVES
            </h1>
          </div>

          <Input
            isClearable
            classNames={{
              inputWrapper:
                "bg-white/5 border border-white/10 h-10 w-full md:w-64 hover:bg-white/10 focus-within:bg-black group-data-[focus=true]:border-cyan-500/50",
              input: "text-xs font-mono text-white",
            }}
            placeholder="SEARCH_DATA..."
            startContent={<Search className="text-default-400" size={14} />}
            value={searchQuery}
            onClear={() => setSearchQuery("")}
            onValueChange={setSearchQuery}
          />
        </div>

        {/* 核心：Timeline Stream */}
        <div className="relative min-h-screen pb-40">
          {/* 中轴线 (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/30 to-cyan-500/0" />

          {articles.map((article, index) => (
            <TimelineNode
              key={article.uuid}
              article={article}
              index={index}
              onClick={() => setSelectedArticleId(article.uuid)}
            />
          ))}

          {/* Load More Status */}
          <div className="mt-20 flex justify-center">
            {loading ? (
              <Spinner
                color="primary"
                label="SYNCING..."
                labelColor="primary"
              />
            ) : (
              !hasMore && (
                <div className="flex flex-col items-center gap-2 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-xs font-mono tracking-[0.3em]">
                    END_OF_TRANSMISSION
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      <ArticleReader
        allArticles={articles}
        articleId={selectedArticleId}
        isOpen={!!selectedArticleId}
        onChangeArticle={(id) => setSelectedArticleId(id)}
        onClose={() => setSelectedArticleId(null)}
      />
    </div>
  );
}
