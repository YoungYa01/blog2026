import React, { useState, forwardRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit3,
  Save,
  Calendar,
  Eye,
  FileText,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import { MdEditor, MdPreview } from "md-editor-rt";
import "md-editor-rt/lib/style.css";

// 引入 HeroUI 组件
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Spinner } from "@heroui/spinner";
import { addToast, closeAll } from "@heroui/toast";

import {
  createArticle,
  deleteArticle,
  getArticleDetail,
  getArticleList,
  updateArticle,
  uploadImage,
} from "@/api/article.ts";
import { PaginationModel } from "@/types/models/response.ts";
import { ArticleModel } from "@/types/models/article.ts";

// --- 工具组件：标签管理器 ---
const TagInput = ({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/10 min-h-[50px]">
      {tags.map((tag) => (
        <Chip
          key={tag}
          color="secondary"
          size="sm"
          variant="flat"
          onClose={() => removeTag(tag)}
        >
          {tag}
        </Chip>
      ))}
      <input
        className="bg-transparent outline-none text-sm font-mono text-cyan-400 placeholder:text-default-500/50 flex-1 min-w-[120px]"
        placeholder="TYPE TAG + ENTER..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

// --- 组件：文章列表项 ---
const ArticleCard = forwardRef<
  HTMLDivElement,
  {
    article: ArticleModel;
    onClick: () => void;
    onDelete: (e: any) => void;
  }
>(({ article, onClick, onDelete }, ref) => (
  <motion.div
    ref={ref}
    animate={{ opacity: 1, y: 0 }}
    className="bg-content1/40 p-5 rounded-xl border border-white/10 cursor-pointer hover:bg-content1/60 transition-colors group relative overflow-hidden"
    exit={{ opacity: 0, scale: 0.95 }}
    initial={{ opacity: 0, y: 20 }}
    layoutId={`card-${article.uuid}`}
    whileHover={{ scale: 1.01, y: -2 }}
    onClick={onClick}
  >
    <div
      className={`absolute top-0 left-0 w-1 h-full ${article.status === "published" ? "bg-cyan-500" : "bg-amber-500"}`}
    />

    <div className="flex justify-between items-start">
      <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors pr-8">
        {article.title}
      </h3>
      {/* 删除按钮 (阻止冒泡) */}
      <Button
        isIconOnly
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4"
        color="danger"
        size="sm"
        variant="light"
        onPress={(e) => {
          onDelete(e);
        }}
      >
        <Trash2 size={16} />
      </Button>
    </div>

    <p className="text-sm text-default-400 mt-2 line-clamp-2">
      {article.excerpt || "No excerpt provided..."}
    </p>
    <div className="mt-4 flex gap-2">
      {article.tags &&
        article.tags.map((t) => (
          <span
            key={t}
            className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-default-400"
          >
            #{t}
          </span>
        ))}
    </div>
  </motion.div>
));

ArticleCard.displayName = "ArticleCard";

// --- 组件：全息编辑器/查看器 ---
const CyberEditor = ({
  initialArticle,
  onClose,
  onSave,
}: {
  initialArticle: ArticleModel;
  onClose: () => void;
  onSave: (article: ArticleModel) => Promise<void>;
}) => {
  // 修复：为 defaultArticle 添加缺失的字段以匹配 ArticleModel 类型
  const defaultArticle: ArticleModel = {
    id: 0,
    uuid: "",
    title: "",
    excerpt: "",
    content: "",
    tags: [],
    status: "draft",
    views: 0,
    date: "",
    user_id: 0,
    created_at: "",
  };

  const [mode, setMode] = useState<"view" | "edit">(
    !initialArticle?.uuid ? "edit" : "view",
  );

  const [article, setArticle] = useState<ArticleModel>(
    initialArticle ? { ...defaultArticle, ...initialArticle } : defaultArticle,
  );

  const [isSaving, setIsSaving] = useState(false);

  // 图片上传逻辑对接后端接口
  const onUploadImg = async (
    files: Array<File>,
    callback: (urls: Array<string>) => void,
  ) => {
    const res = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();

        formData.append("file", file);

        try {
          const { data } = await uploadImage(formData);

          return import.meta.env["VITE_BASE_URL"] + data.path || "";
        } catch (error) {
          return "image_upload_failed";
        }
      }),
    );

    callback(res);
  };

  const handleSaveWrapper = async () => {
    setIsSaving(true);
    try {
      await onSave(article);
      setMode("view");
    } catch (error) {
      console.error("Save failed", error);
      closeAll();
      addToast({
        title: "保存失败",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 格式化日期显示
  const displayDate = article.created_at
    ? new Date(article.created_at).toLocaleDateString()
    : "Unpublished";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl"
      layoutId={
        initialArticle?.uuid ? `card-${initialArticle.uuid}` : "new-card"
      }
    >
      {/* 顶部工具栏 */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-content1/50 shrink-0">
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" onPress={onClose}>
            <ChevronLeft className="text-default-400" />
          </Button>

          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase">
              {mode === "view"
                ? "READ_ONLY :: ARCHIVE_MODE"
                : "WRITE_ACCESS :: OVERRIDE_MODE"}
            </span>
            {mode === "view" ? (
              <h2 className="text-xl font-bold text-foreground">
                {article.title || "Untitled Protocol"}
              </h2>
            ) : (
              <input
                className="bg-transparent outline-none text-xl font-bold text-foreground placeholder:text-default-600 w-96"
                placeholder="ENTER TITLE..."
                value={article.title}
                onChange={(e) =>
                  setArticle({ ...article, title: e.target.value })
                }
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode === "view" ? (
            <Button
              color="primary"
              startContent={<Edit3 size={16} />}
              variant="flat"
              onPress={() => setMode("edit")}
            >
              UNLOCK EDIT
            </Button>
          ) : (
            <>
              <Button
                color="danger"
                isDisabled={isSaving}
                variant="light"
                onPress={() => setMode("view")}
              >
                CANCEL
              </Button>
              <Button
                color="success"
                isLoading={isSaving}
                startContent={
                  isSaving ? (
                    <Spinner color="white" size="sm" />
                  ) : (
                    <Save size={16} />
                  )
                }
                variant="shadow"
                onPress={handleSaveWrapper}
              >
                {isSaving ? "SAVING..." : "SAVE CHANGES"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden flex relative">
        {mode === "edit" && (
          <div className="w-full h-full flex animate-in fade-in duration-300">
            {/* 左侧：元数据侧边栏 (20% 宽度) */}
            <div className="w-80 h-full flex flex-col border-r border-white/10 bg-black/20 shrink-0">
              <ScrollShadow className="flex-1">
                <div className="p-6 space-y-6">
                  <div>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label className="text-xs text-default-500 font-mono mb-2 block">
                      TAG_MATRIX
                    </label>
                    <TagInput
                      tags={article.tags || []}
                      onChange={(tags) => setArticle({ ...article, tags })}
                    />
                  </div>
                  <div>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label className="text-xs text-default-500 font-mono mb-2 block">
                      EXCERPT_DATA
                    </label>
                    <Textarea
                      classNames={{
                        inputWrapper: "bg-black/20 border-white/10",
                      }}
                      minRows={4}
                      placeholder="Brief description for index..."
                      value={article.excerpt}
                      onValueChange={(v) =>
                        setArticle({ ...article, excerpt: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                    <span className="text-xs text-default-500 font-mono">
                      PUBLISH_STATUS
                    </span>
                    <Switch
                      color="success"
                      isSelected={article.status === "published"}
                      size="sm"
                      onValueChange={(v) =>
                        setArticle({
                          ...article,
                          status: v ? "published" : "draft",
                        })
                      }
                    >
                      {(article.status || "draft").toUpperCase()}
                    </Switch>
                  </div>
                </div>
              </ScrollShadow>
            </div>

            {/* 右侧：md-editor-rt 编辑器 */}
            <div className="flex-1 h-full bg-content1/20 relative">
              <MdEditor
                className="h-full w-full"
                codeTheme="atom"
                // 强制背景透明，融入现有设计
                style={{
                  height: "100%",
                  backgroundColor: "transparent",
                  // @ts-ignore
                  "--md-bk-color": "transparent",
                  "--md-color": "#ECEDEE", // HeroUI foreground
                  "--md-bk-color-outstand": "rgba(255, 255, 255, 0.05)", // 引用块背景
                  "--md-border-color": "rgba(255, 255, 255, 0.1)", // 边框颜色
                }}
                theme="dark"
                value={article.content}
                onChange={(v) => setArticle({ ...article, content: v })}
                onUploadImg={onUploadImg}
              />
            </div>
          </div>
        )}

        {mode === "view" && (
          <ScrollShadow className="w-full h-full bg-black/40">
            <div className="max-w-5xl mx-auto py-12 px-8">
              {/* 阅读模式头部 */}
              <div className="mb-10 border-b border-white/10 pb-8">
                <div className="flex gap-2 mb-4">
                  {article.tags &&
                    article.tags.map((tag) => (
                      <Chip
                        key={tag}
                        color="secondary"
                        size="sm"
                        variant="flat"
                      >
                        #{tag}
                      </Chip>
                    ))}
                  <Chip
                    color={
                      article.status === "published" ? "success" : "warning"
                    }
                    size="sm"
                    variant="dot"
                  >
                    {(article.status || "DRAFT").toUpperCase()}
                  </Chip>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-default-400">
                  {article.title}
                </h1>
                <p className="text-xl text-default-400 font-serif italic leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-6 mt-6 text-sm text-default-500 font-mono">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} /> {displayDate}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye size={14} /> {article.views} READS
                  </span>
                  <span className="flex items-center gap-2">
                    <FileText size={14} /> ID: {article.uuid || "PENDING"}
                  </span>
                </div>
              </div>

              {/* 使用 MdPreview 渲染，保持样式一致性 */}
              <div className="rounded-xl overflow-hidden border border-white/5 bg-content1/10 p-2">
                <MdPreview
                  codeTheme="atom"
                  editorId="preview-only"
                  modelValue={article.content}
                  style={{
                    backgroundColor: "transparent",
                    // @ts-ignore
                    "--md-bk-color": "transparent",
                    "--md-color": "#ECEDEE",
                  }}
                  theme="dark"
                />
              </div>
            </div>
          </ScrollShadow>
        )}
      </div>
    </motion.div>
  );
};

// --- 主页面组件 ---
const ArticleManager = () => {
  const [activeArticle, setActiveArticle] = useState<ArticleModel | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 真实数据状态
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 获取列表数据
  const fetchList = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.append("keyword", searchQuery);
      // 假设后端支持分页，这里暂时不传page，获取默认第一页
      const { data } = await getArticleList(
        params as unknown as PaginationModel,
      );

      // 兼容后端返回结构: { list: [], total: 0 } 或 直接 []
      setArticles(data.list);
    } catch (e) {
      console.error("Fetch articles failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载和搜索时触发
  useEffect(() => {
    // 简单防抖
    const timer = setTimeout(() => {
      fetchList();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 保存（新增或更新）
  const handleSave = async (articleData: ArticleModel) => {
    try {
      const isNew = !articleData.uuid;

      if (isNew) {
          articleData.created_at = new Date().toISOString();
        await createArticle(articleData);
      } else {
        await updateArticle(articleData.uuid, articleData);
      }
      // 刷新列表
      await fetchList();

      setIsEditorOpen(false);
    } catch (e) {
      console.error("Save failed", e);
      throw e; // 抛出给 Editor 组件处理 loading 状态
    }
  };

  // 修复：使用下划线前缀忽略未使用的参数，或者直接移除
  const handleDelete = async (_: any, uuid: string) => {
    try {
      const data = await deleteArticle(uuid);

      if (data.success) {
        closeAll();
        addToast({
          description: "删除成功",
          color: "success",
        });
      } else {
        addToast({
          description: "删除失败",
          color: "danger",
        });
      }
    } catch (err) {
      console.error("Delete error", err);
    } finally {
      await fetchList();
    }
  };

  const handleNewEntry = () => {
    setActiveArticle(null);
    setIsEditorOpen(true);
  };

  const handleCardClick = async (uuid: string) => {
    if (!uuid) {
      return;
    }
    try {
      const { data } = await getArticleDetail(uuid);

      setActiveArticle(data);
      setIsEditorOpen(true);
    } catch (e) {
      console.error("Get article detail failed", e);
    }
  };

  return (
    <div className="w-full min-h-screen p-6 relative pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-cyan-400" /> ARCHIVES
        </h1>
        <div className="flex gap-4">
          <Input
            classNames={{ inputWrapper: "bg-content1/50" }}
            placeholder="Search..."
            size="sm"
            startContent={<Search size={16} />}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <Button
            color="primary"
            startContent={<Plus size={20} />}
            onPress={handleNewEntry}
          >
            NEW ENTRY
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner color="primary" label="Loading Archives..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {articles.map((article) => (
              <ArticleCard
                key={article.uuid}
                article={article}
                onClick={() => handleCardClick(article.uuid)}
                onDelete={(e) => {
                  handleDelete(e, article.uuid!);
                }}
              />
            ))}
          </AnimatePresence>
          {articles.length === 0 && (
            <div className="col-span-full text-center py-20 text-default-400 font-mono">
              NO DATA FOUND IN SECTOR
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isEditorOpen && (
          <CyberEditor
            initialArticle={activeArticle as ArticleModel}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArticleManager;
