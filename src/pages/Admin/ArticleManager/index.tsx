import React, { useState, useRef, forwardRef } from "react";
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
  Image as ImageIcon,
  MonitorPlay,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { ScrollShadow } from "@heroui/scroll-shadow";

// --- 类型定义 ---
interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: "published" | "draft";
  date: string;
  views: number;
}

// --- 模拟数据 ---
const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Neural Network Optimization",
    excerpt: "Deep dive into backpropagation adjustments.",
    content:
      "# Neural Network Optimization\n\n> System initialized...\n\nHere is a list of **core** components:\n- Quantum Processor\n- Neural Link\n\n## Code Example\n```js\nconst ai = new AI();\nai.learn();\n```",
    tags: ["AI", "Quantum"],
    status: "published",
    date: "2045-05-12",
    views: 1240,
  },
  {
    id: "2",
    title: "Quantum Computing",
    excerpt: "Exploring the quantum world.",
    content:
      "# Quantum Computing\n\n> System initialized...\n\nHere is a list of **core** components:\n- Quantum Processor\n- Neural Link\n\n## Code Example\n```js\nconst ai = new AI();\nai.learn();\n```",
    tags: ["AI", "Quantum"],
    status: "published",
    date: "2045-05-12",
    views: 1240,
  },
];

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

// --- 组件：文章列表项 (Archive File) ---
// 修复点 1: 使用 forwardRef 包装组件，以便 AnimatePresence 可以传递 ref
const ArticleCard = forwardRef<
  HTMLDivElement,
  { article: Article; onClick: () => void }
>(({ article, onClick }, ref) => (
  <motion.div
    ref={ref} // 绑定 ref
    animate={{ opacity: 1, y: 0 }}
    className="bg-content1/40 p-5 rounded-xl border border-white/10 cursor-pointer hover:bg-content1/60 transition-colors group relative overflow-hidden"
    exit={{ opacity: 0, scale: 0.95 }} // 添加退出动画
    initial={{ opacity: 0, y: 20 }}
    layoutId={`card-${article.id}`}
    whileHover={{ scale: 1.01, y: -2 }}
    onClick={onClick}
  >
    {/* 状态指示条 */}
    <div
      className={`absolute top-0 left-0 w-1 h-full ${article.status === "published" ? "bg-cyan-500" : "bg-amber-500"}`}
    />

    <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors">
      {article.title}
    </h3>
    <p className="text-sm text-default-400 mt-2 line-clamp-2">
      {article.excerpt}
    </p>
    <div className="mt-4 flex gap-2">
      {article.tags.map((t) => (
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

// 必须设置 displayName，否则 React 开发工具可能会警告
ArticleCard.displayName = "ArticleCard";

// --- 组件：全息编辑器/查看器 ---
const CyberEditor = ({
  initialArticle,
  onClose,
  onSave,
}: {
  initialArticle: Article | null;
  onClose: () => void;
  onSave: (article: Article) => void;
}) => {
  // 修复点 2: 确保即使 initialArticle 传了空对象，也有默认兜底
  const defaultArticle: Article = {
    id: "new",
    title: "",
    excerpt: "",
    content: "",
    tags: [],
    status: "draft",
    date: new Date().toISOString().split("T")[0],
    views: 0,
  };

  const [mode, setMode] = useState<"view" | "edit">(
    initialArticle?.id === "new" ? "edit" : "view",
  );

  // 合并默认值，防止 undefined 报错
  const [article, setArticle] = useState<Article>(
    initialArticle ? { ...defaultArticle, ...initialArticle } : defaultArticle,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertImage = () => {
    const imageMarkdown =
      "\n![Image Description](https://source.unsplash.com/random/800x600?cyberpunk)\n";
    const newContent = article.content + imageMarkdown;

    setArticle({ ...article, content: newContent });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        textareaRef.current.focus();
      }
    }, 100);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl"
      layoutId={initialArticle?.id ? `card-${initialArticle.id}` : "new-card"}
    >
      {/* Top Bar */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-content1/50">
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" onClick={onClose}>
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
                isIconOnly
                title="Insert Image"
                variant="light"
                onClick={insertImage}
              >
                <ImageIcon className="text-default-400" size={20} />
              </Button>
              <div className="h-6 w-px bg-white/10 mx-2" />
              <Button
                color="danger"
                variant="light"
                onPress={() => setMode("view")}
              >
                CANCEL
              </Button>
              <Button
                color="success"
                startContent={<Save size={16} />}
                variant="shadow"
                onPress={() => {
                  onSave(article);
                  setMode("view");
                }}
              >
                SAVE CHANGES
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative">
        {mode === "edit" && (
          <div className="w-full h-full flex animate-in fade-in duration-300">
            <div className="w-1/2 h-full flex flex-col border-r border-white/10 bg-black/20">
              <div className="p-6 border-b border-white/10 space-y-4">
                <div>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className="text-xs text-default-500 font-mono mb-2 block">
                    TAG_MATRIX
                  </label>
                  <TagInput
                    tags={article.tags}
                    onChange={(tags) => setArticle({ ...article, tags })}
                  />
                </div>
                <div>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className="text-xs text-default-500 font-mono mb-2 block">
                    EXCERPT_DATA
                  </label>
                  <Textarea
                    classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                    minRows={2}
                    placeholder="Brief description for index..."
                    value={article.excerpt}
                    onValueChange={(v) =>
                      setArticle({ ...article, excerpt: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-default-500 font-mono">
                    PUBLISH_STATUS
                  </span>
                  {/* 修复点 3: 安全访问 article.status */}
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

              <div className="flex-1 relative group">
                <textarea
                  ref={textareaRef}
                  className="w-full h-full bg-transparent p-6 resize-none outline-none font-mono text-sm leading-relaxed text-default-300 selection:bg-cyan-500/30"
                  placeholder="// Type your content here..."
                  spellCheck={false}
                  value={article.content}
                  onChange={(e) =>
                    setArticle({ ...article, content: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="w-1/2 h-full bg-content1/20 overflow-hidden flex flex-col">
              <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 text-[10px] text-default-500 font-mono uppercase">
                <MonitorPlay className="mr-2" size={12} /> Live Render Output
              </div>
              <ScrollShadow className="flex-1 p-8">
                <article className="prose prose-invert prose-cyan max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-default-400 prose-a:text-cyan-400 prose-pre:bg-[#09090b] prose-pre:border prose-pre:border-white/10 prose-img:rounded-xl">
                  <ReactMarkdown>
                    {article.content || "*No content data...*"}
                  </ReactMarkdown>
                </article>
              </ScrollShadow>
            </div>
          </div>
        )}

        {mode === "view" && (
          <ScrollShadow className="w-full h-full">
            <div className="max-w-4xl mx-auto py-12 px-6">
              <div className="mb-10 border-b border-white/10 pb-8">
                <div className="flex gap-2 mb-4">
                  {article.tags.map((tag) => (
                    <Chip key={tag} color="secondary" size="sm" variant="flat">
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
                    <Calendar size={14} /> {article.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye size={14} /> {article.views} READS
                  </span>
                  <span className="flex items-center gap-2">
                    <FileText size={14} /> ID: {article.id}
                  </span>
                </div>
              </div>

              <article className="prose prose-xl prose-invert prose-cyan max-w-none prose-p:leading-8 prose-img:shadow-2xl prose-img:border prose-img:border-white/10">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </article>
            </div>
          </ScrollShadow>
        )}
      </div>
    </motion.div>
  );
};

// --- 主页面组件 ---
const ArticleManager = () => {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSave = (updatedArticle: Article) => {
    console.log("Saving article:", updatedArticle);
    // 这里添加你的 API 调用逻辑
  };

  // 修复点 4: 新建文章时，传递 null 或者不传，不要传 {id: "new"} 这种残缺对象
  // 这样 CyberEditor 内部会使用 defaultArticle
  const handleNewEntry = () => {
    setActiveArticle(null); // 或者 undefined
    setIsEditorOpen(true);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {MOCK_ARTICLES.filter((a) =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()),
          ).map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => {
                setActiveArticle(article);
                setIsEditorOpen(true);
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <CyberEditor
            initialArticle={activeArticle}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArticleManager;
