import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderTree,
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Database,
  Layers,
  Hash,
  Zap,
  Cpu,
  Server,
} from "lucide-react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { useDisclosure, Modal, ModalBody, ModalContent } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Progress } from "@heroui/progress";
// --- 类型定义 ---
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
  color: "cyan" | "purple" | "rose" | "amber" | "emerald";
  status: "active" | "locked";
}

// --- 模拟数据 ---
const MOCK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Neural Networks",
    slug: "neural-networks",
    description: "Deep learning algorithms and brain-computer interfaces.",
    articleCount: 42,
    color: "cyan",
    status: "active",
  },
  {
    id: "2",
    name: "Cyber Security",
    slug: "cyber-security",
    description: "Protocols for defense against digital intrusions.",
    articleCount: 15,
    color: "rose",
    status: "active",
  },
  {
    id: "3",
    name: "Hardware Specs",
    slug: "hardware",
    description: "Next-gen quantum processors and memory units.",
    articleCount: 28,
    color: "amber",
    status: "active",
  },
  {
    id: "4",
    name: "Dev Logs",
    slug: "dev-logs",
    description: "System updates and patch notes.",
    articleCount: 8,
    color: "purple",
    status: "locked", // 模拟系统默认分类，不可删
  },
];

// --- 颜色映射工具 ---
const COLOR_MAP = {
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
    bar: "bg-cyan-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
    bar: "bg-purple-500",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    glow: "shadow-rose-500/20",
    bar: "bg-rose-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    bar: "bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    bar: "bg-emerald-500",
  },
};

// --- 组件：分类编辑器模态框 ---
const CategoryModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: Category | null;
  onSave: (data: Category) => void;
}) => {
  const [formData, setFormData] = useState<Partial<Category>>(
    initialData || {
      name: "",
      slug: "",
      description: "",
      color: "cyan",
      status: "active",
      articleCount: 0,
    },
  );

  const handleNameChange = (val: string) => {
    // 自动生成 Slug
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !initialData ? slug : prev.slug,
    }));
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{ base: "bg-[#09090b] border border-white/10" }}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent>
        <ModalBody className="p-6">
          <div className="flex items-center gap-3 mb-4 text-xl font-bold">
            <Layers className="text-cyan-400" />
            <h3>
              {initialData ? "RECONFIGURE SECTOR" : "INITIALIZE NEW SECTOR"}
            </h3>
          </div>

          <div className="space-y-4">
            <Input
              classNames={{ inputWrapper: "bg-white/5 border-white/10" }}
              label="Sector Name"
              value={formData.name}
              variant="bordered"
              onValueChange={handleNameChange}
            />
            <Input
              classNames={{
                inputWrapper: "bg-black/20 border-white/10 font-mono text-sm",
              }}
              label="Index Slug"
              startContent={<Hash className="text-default-400" size={14} />}
              value={formData.slug}
              variant="bordered"
              onValueChange={(v) => setFormData({ ...formData, slug: v })}
            />
            <Textarea
              classNames={{ inputWrapper: "bg-white/5 border-white/10" }}
              label="Protocol Description"
              value={formData.description}
              variant="bordered"
              onValueChange={(v) =>
                setFormData({ ...formData, description: v })
              }
            />

            {/* 颜色选择器 */}
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className="text-xs text-default-500 font-mono mb-2 block">
                SIGNAL_COLOR
              </label>
              <div className="flex gap-3">
                {(Object.keys(COLOR_MAP) as Array<keyof typeof COLOR_MAP>).map(
                  (c) => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === c
                          ? `border-white scale-110 shadow-[0_0_10px_currentColor] ${COLOR_MAP[c].text}`
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: `var(--heroui-${c}-500, ${c === "cyan" ? "#06b6d4" : c === "purple" ? "#a855f7" : c === "rose" ? "#f43f5e" : c === "amber" ? "#f59e0b" : "#10b981"})`,
                      }}
                      onClick={() => setFormData({ ...formData, color: c })}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="light" onPress={onClose}>
              CANCEL
            </Button>
            <Button
              color="primary"
              variant="shadow"
              onPress={() => onSave(formData as Category)}
            >
              {initialData ? "UPDATE CONFIG" : "DEPLOY SECTOR"}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// --- 主组件 ---
const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 统计数据
  const totalArticles = categories.reduce(
    (acc, cur) => acc + cur.articleCount,
    0,
  );
  const totalSectors = categories.length;

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    onOpen();
  };

  const handleCreate = () => {
    setEditingCategory(null);
    onOpen();
  };

  const handleSave = (data: Category) => {
    if (editingCategory) {
      setCategories((prev) => prev.map((c) => (c.id === data.id ? data : c)));
    } else {
      setCategories((prev) => [
        ...prev,
        { ...data, id: Date.now().toString(), articleCount: 0 },
      ]);
    }
    onClose();
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "WARNING: Initiating sector purge. This action cannot be undone. Proceed?",
      )
    ) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="w-full min-h-screen p-6 pb-24 relative">
      {/* 顶部概览仪表盘 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <FolderTree className="text-cyan-400" size={32} />
            SECTOR CONTROL
          </h1>
          <p className="text-default-400 font-mono text-xs mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            SYSTEM ARRAY ONLINE
          </p>
        </div>

        {/* 顶部统计卡片 */}
        <div className="flex gap-4">
          <Card className="bg-content1/30 border border-white/5 backdrop-blur-md">
            <CardBody className="px-6 py-3 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Database size={20} />
              </div>
              <div>
                <p className="text-[10px] text-default-400 font-mono">
                  TOTAL LOAD
                </p>
                <p className="text-xl font-bold">
                  {totalArticles}{" "}
                  <span className="text-xs font-normal opacity-50">items</span>
                </p>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-content1/30 border border-white/5 backdrop-blur-md">
            <CardBody className="px-6 py-3 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Server size={20} />
              </div>
              <div>
                <p className="text-[10px] text-default-400 font-mono">
                  ACTIVE SECTORS
                </p>
                <p className="text-xl font-bold">{totalSectors}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 控制栏 */}
      <div className="flex justify-between items-center mb-6">
        <Input
          className="max-w-xs"
          classNames={{ inputWrapper: "bg-content1/30 border-white/10" }}
          placeholder="Search sector index..."
          size="sm"
          startContent={<Search size={16} />}
          value={search}
          variant="bordered"
          onValueChange={setSearch}
        />
        <Button
          className="font-bold tracking-wide"
          color="primary"
          startContent={<Plus size={18} />}
          variant="shadow"
          onPress={handleCreate}
        >
          INIT NEW SECTOR
        </Button>
      </div>

      {/* 扇区网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {categories
            .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
            .map((category) => {
              const theme = COLOR_MAP[category.color];
              // 计算负载比例 (假设每个分类最大容量 100 篇，用于视觉展示)
              const loadPercent = Math.min(
                (category.articleCount / 100) * 100,
                100,
              );

              return (
                <motion.div
                  key={category.id}
                  layout
                  animate={{ opacity: 1, scale: 1 }}
                  className="group"
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    transition: { duration: 0.2 },
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    className={`bg-content1/40 backdrop-blur-xl border ${theme.border} hover:bg-content1/60 transition-all duration-300 overflow-visible relative`}
                  >
                    {/* 装饰性发光边框 */}
                    <div
                      className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ${theme.glow}`}
                    />

                    <CardBody className="p-6 relative z-10">
                      {/* 头部：图标与操作 */}
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`p-3 rounded-xl ${theme.bg} ${theme.text} border border-white/5`}
                        >
                          {category.slug === "hardware" ? (
                            <Cpu size={24} />
                          ) : (
                            <Zap size={24} />
                          )}
                        </div>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              className="opacity-50 hover:opacity-100"
                              size="sm"
                              variant="light"
                            >
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Sector Actions"
                            variant="flat"
                          >
                            <DropdownItem
                              key={"1"}
                              startContent={<Edit3 size={16} />}
                              onPress={() => handleEdit(category)}
                            >
                              Reconfigure
                            </DropdownItem>
                            <DropdownItem
                              key={"2"}
                              className="text-danger"
                              color="danger"
                              isDisabled={category.status === "locked"}
                              startContent={<Trash2 size={16} />}
                              onPress={() => handleDelete(category.id)}
                            >
                              {category.status === "locked"
                                ? "Locked Sector"
                                : "Purge Sector"}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>

                      {/* 标题与描述 */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-cyan-400 transition-colors">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-mono text-default-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            /{category.slug}
                          </span>
                          {category.status === "locked" && (
                            <Hash className="text-default-400" size={12} />
                          )}
                        </div>
                        <p className="text-xs text-default-400 line-clamp-2 h-8 leading-relaxed">
                          {category.description ||
                            "No protocol description available."}
                        </p>
                      </div>

                      {/* 底部：负载指示器 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-default-500">
                          <span>CAPACITY LOAD</span>
                          <span className={theme.text}>
                            {category.articleCount} UNITS
                          </span>
                        </div>
                        <Progress
                          classNames={{
                            track: "bg-black/20",
                            indicator: theme.bar,
                          }}
                          size="sm"
                          value={loadPercent}
                        />
                      </div>
                    </CardBody>

                    {/* 底部状态条 */}
                    <div className={`h-1 w-full ${theme.bar} opacity-20`} />
                  </Card>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* 新建分类占位符 (虚线框) */}
        <motion.div
          layout
          className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group min-h-[250px]"
          onClick={handleCreate}
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
            <Plus
              className="text-default-400 group-hover:text-cyan-400"
              size={24}
            />
          </div>
          <p className="font-bold text-default-500 group-hover:text-cyan-400 transition-colors">
            INITIALIZE NEW
          </p>
        </motion.div>
      </div>

      <CategoryModal
        initialData={editingCategory}
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
      />

      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />
    </div>
  );
};

export default CategoryManager;
