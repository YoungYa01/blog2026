import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  UploadCloud,
  Image as ImageIcon,
  MapPin,
  Camera,
  RefreshCw,
  Maximize2,
  Hash,
} from "lucide-react";
import { Spinner } from "@heroui/spinner";
import { Progress } from "@heroui/progress";
import { Modal, ModalBody, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Input, Textarea } from "@heroui/input";
import { Image } from "@heroui/image";

// --- 类型定义 ---
interface Photo {
  id: string;
  url: string;
  width: number; // 新增：后端返回的宽
  height: number; // 新增：后端返回的高
  title: string;
  story: string;
  date: string;
  location: string;
  metadata: {
    camera: string;
    iso: string;
    aperture: string;
  };
  tags: string[];
  likes: number;
}

// --- 模拟后端数据 (带宽高以防止塌陷) ---
const GENERATE_MOCK = (offset: number, limit: number): Photo[] => {
  return Array.from({ length: limit }).map((_, i) => {
    const id = (offset + i).toString();
    // 随机生成不同的长宽比，模拟真实图片
    const width = 800;
    const height = Math.floor(Math.random() * (1200 - 600 + 1)) + 600;

    return {
      id,
      url: `https://picsum.photos/${width}/${height}?random=${id}`, // 使用 picsum 生成随机尺寸图片
      width,
      height,
      title: `Memory Fragment #${id}`,
      story: "Data fragment retrieved from the neural network...",
      date: "2045-11-02",
      location: "Sector 7",
      metadata: { camera: "Sony A7S III", iso: "3200", aperture: "f/1.4" },
      tags: ["Cyberpunk", "Raw"],
      likes: Math.floor(Math.random() * 500),
    };
  });
};

// --- 组件：防塌陷图片卡片 ---
// 核心技巧：利用 aspect-ratio 或 padding-bottom 占位
const PhotoCard = ({
  photo,
  onClick,
}: {
  photo: Photo;
  onClick: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative group cursor-pointer mb-6 break-inside-avoid"
      initial={{ opacity: 0, y: 20 }}
      layoutId={`photo-${photo.id}`}
      onClick={onClick}
    >
      <div className="relative rounded-xl overflow-hidden bg-content1 border border-white/10 shadow-lg">
        {/* 占位容器：直接根据宽高比撑开高度 
           这样即使图片没加载，高度也是固定的，不会塌陷
        */}
        <div
          className="w-full relative bg-default-100/10"
          style={{ aspectRatio: `${photo.width}/${photo.height}` }}
        >
          {!isLoaded && !isError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner color="default" size="sm" />
            </div>
          )}

          {isError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-default-400 bg-default-50">
              <ImageIcon size={24} />
              <span className="text-[10px] mt-2">LOAD FAILED</span>
            </div>
          ) : (
            <img
              alt={photo.title}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy" // 原生懒加载
              src={photo.url}
              onError={() => setIsError(true)}
              onLoad={() => setIsLoaded(true)}
            />
          )}

          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-bold truncate text-sm">
                {photo.title}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-300 flex items-center gap-1">
                  <MapPin size={10} /> {photo.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 组件：上传区域 (只负责选择文件)
const UploadZone = ({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      // 这里我们只处理单文件逻辑演示，多文件需循环调用
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="mb-8">
      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        type="file"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center 
          bg-black/20 backdrop-blur-sm cursor-pointer group transition-all duration-300
          ${isDragging ? "border-cyan-500 bg-cyan-500/10" : "border-white/10 hover:bg-black/30"}
        `}
        whileHover={{ scale: 1.01, borderColor: "rgba(6,182,212,0.5)" }}
        onClick={() => fileInputRef.current?.click()}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div
          className="w-16 h-16 rounded-full bg-content1/50 flex items-center justify-center
         mb-4 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors"
        >
          <UploadCloud size={32} />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Inject Visual Data
        </h3>
        <p className="text-sm text-default-400 mt-2 font-mono text-center">
          CLICK OR DROP TO START ENTRY
        </p>
      </motion.div>
    </div>
  );
};

interface DraftPhoto extends Partial<Photo> {
  file?: File; // 本地文件对象
  previewUrl: string; // 本地预览 blob url
  isNew: boolean; // 标记是否为新上传
}

// 组件：图片编辑器/详情查看器
const PhotoEditorModal = ({
  photo, // 可以是已存在的 Photo 或 DraftPhoto
  isOpen,
  onClose,
  onSubmit,
}: {
  photo: Photo | DraftPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Photo | DraftPhoto) => Promise<void>;
}) => {
  // 本地状态
  const [formData, setFormData] = useState<Photo | DraftPhoto>(photo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!photo) return null;
  // 如果是新文件，自动读取一些元数据（模拟）
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setFormData(photo);
    if ((photo as DraftPhoto).isNew) {
      // 这里可以做一些自动填充，比如从文件名获取标题
      setFormData((prev) => ({
        ...prev,
        title:
          prev.title || (prev as DraftPhoto).file?.name.split(".")[0] || "",
        metadata: { camera: "Unknown", iso: "-", aperture: "-" } as any,
      }));
    }
  }, [photo]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setUploadProgress(10);

    // 如果是新上传，开启进度条模拟
    let interval: any;

    if ((formData as DraftPhoto).isNew) {
      interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);
    }

    try {
      await onSubmit(formData);
      if (interval) clearInterval(interval);
      setUploadProgress(100);
      setTimeout(onClose, 500); // 成功后关闭
    } catch (e) {
      console.error(e);
      alert("Operation Failed");
    } finally {
      if (interval) clearInterval(interval);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-[#09090b]/95 border border-white/10 shadow-2xl",
        closeButton: "z-50 text-white hover:bg-white/10",
      }}
      isDismissable={!isSubmitting}
      isOpen={isOpen}
      size="5xl"
      onClose={!isSubmitting ? onClose : undefined} // 上传中禁止关闭
    >
      <ModalContent>
        <ModalBody className="p-0 overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px]">
          {/* 左侧：预览区 */}
          <div className="w-full md:w-3/5 h-[40vh] md:h-full bg-black flex items-center justify-center relative p-4">
            <Image
              alt="Preview"
              className="object-contain w-full h-full max-h-full"
              classNames={{
                wrapper: "w-full h-full flex items-center justify-center",
              }}
              radius="none"
              src={(formData as any).url || (formData as any).previewUrl}
            />

            {/* 上传进度遮罩 */}
            {isSubmitting && (formData as DraftPhoto).isNew && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                <Spinner color="primary" size="lg" />
                <p className="text-cyan-400 font-mono mt-4 animate-pulse">
                  UPLOADING DATA STREAM...
                </p>
                <Progress
                  className="max-w-xs mt-2"
                  classNames={{ track: "bg-white/10" }}
                  color="primary"
                  size="sm"
                  value={uploadProgress}
                />
              </div>
            )}
          </div>

          {/* 右侧：编辑表单 */}
          <div className="w-full md:w-2/5 h-full flex flex-col border-l border-white/10 bg-content1/20 backdrop-blur-md">
            <div className="p-4 border-b border-white/10 bg-black/20">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {(formData as DraftPhoto).isNew ? (
                  <>
                    <UploadCloud className="text-cyan-400" size={18} /> NEW
                    ENTRY INITIALIZATION
                  </>
                ) : (
                  <>
                    <Maximize2 className="text-purple-400" size={18} /> ARCHIVE
                    DETAILS
                  </>
                )}
              </h3>
            </div>

            <ScrollShadow className="flex-1 p-6 space-y-6">
              {/* 标题 */}
              <Input
                classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                label="Title / Codename"
                value={formData.title}
                variant="bordered"
                onValueChange={(v) => setFormData({ ...formData, title: v })}
              />

              {/* 地点 */}
              <Input
                classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                label="Location Coordinates"
                startContent={<MapPin className="text-default-400" size={16} />}
                value={formData.location}
                variant="bordered"
                onValueChange={(v) => setFormData({ ...formData, location: v })}
              />

              {/* 故事 */}
              <Textarea
                classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                label="Memory Log / Story"
                minRows={5}
                placeholder="What is happening in this visual fragment?"
                value={formData.story}
                variant="bordered"
                onValueChange={(v) => setFormData({ ...formData, story: v })}
              />

              {/* 标签 (简单文本演示，实际可用 TagInput 组件) */}
              <Input
                classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                label="Tags (Comma separated)"
                placeholder="Cyberpunk, Neon, City"
                variant="bordered"
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    tags: v.split(",").map((s) => s.trim()),
                  })
                }
                startContent={<Hash size={16} className="text-default-400" />}
                // 简单模拟 tags 转换
                value={formData.tags?.join(", ")}
              />
            </ScrollShadow>

            {/* 底部按钮 */}
            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20">
              <Button
                color="danger"
                isDisabled={isSubmitting}
                variant="light"
                onPress={onClose}
              >
                CANCEL
              </Button>
              <Button
                color={(formData as DraftPhoto).isNew ? "secondary" : "primary"}
                isLoading={isSubmitting}
                startContent={
                  !isSubmitting &&
                  ((formData as DraftPhoto).isNew ? (
                    <UploadCloud size={18} />
                  ) : (
                    <RefreshCw size={18} />
                  ))
                }
                variant="shadow"
                onPress={handleSubmit}
              >
                {(formData as DraftPhoto).isNew
                  ? "PUBLISH TO ARCHIVE"
                  : "UPDATE RECORD"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// --- 主页面组件：相册管理器 ---
export const AlbumManager = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState<Photo | DraftPhoto | null>(
    null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // --- 瀑布流列计算 logic ---
  // 根据屏幕宽度决定列数，这里简单硬编码为 Hooks 或者 ResizeListener 动态计算
  // 为了简化代码，我们在渲染时直接分配数据到 N 个数组
  const useColumns = (items: Photo[]) => {
    // 简单起见，使用固定列数逻辑 (比如 lg 屏幕 3 列)
    // 在真实项目中，应该监听 window resize
    const [columns, setColumns] = useState<Photo[][]>([[], [], []]);

    useEffect(() => {
      // 简单的轮询分配算法 (Round Robin)
      // 更好的做法是：追踪每一列的当前总高度，将新图片放入最短的那一列
      // 由于这里我们已经有了 width/height，我们可以精确计算
      const newCols: Photo[][] = [[], [], []];
      const colHeights = [0, 0, 0];

      items.forEach((item) => {
        // 找到当前最短的列
        let minIndex = 0;
        let minHeight = colHeights[0];

        for (let i = 1; i < 3; i++) {
          if (colHeights[i] < minHeight) {
            minHeight = colHeights[i];
            minIndex = i;
          }
        }

        // 加入该列
        newCols[minIndex].push(item);
        // 更新高度 (高度 = 图片高度 / 图片宽度 * 归一化宽度)
        // 假设显示的卡片宽度是一样的，我们只关心长宽比带来的高度增量
        colHeights[minIndex] += item.height / item.width;
      });
      setColumns(newCols);
    }, [items]);

    return columns;
  };

  const columns = useColumns(photos);

  // --- 获取数据 ---
  const fetchPhotos = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    // 模拟 API 延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newPhotos = GENERATE_MOCK(photos.length, 12);

    if (newPhotos.length === 0) {
      setHasMore(false);
    } else {
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
    setLoading(false);
  }, [loading, hasMore, photos.length]);

  const handleFileSelect = (file: File) => {
    const draft: DraftPhoto = {
      isNew: true,
      file: file,
      previewUrl: URL.createObjectURL(file), // 创建本地预览
      title: file.name.replace(/\.[^/.]+$/, ""), // 去除后缀作为默认标题
      story: "",
      location: "",
      tags: [],
      metadata: { camera: "Unknown", iso: "Auto", aperture: "Auto" },
    };

    setEditingPhoto(draft);
    setIsEditorOpen(true);
  };

  // 2. 用户点击已有图片 -> 打开编辑器
  const handlePhotoClick = (photo: Photo) => {
    setEditingPhoto({ ...photo, isNew: false });
    setIsEditorOpen(true);
  };

  // 3. 提交逻辑 (上传 或 更新)
  const handleSubmit = async (data: Photo | DraftPhoto) => {
    if ((data as DraftPhoto).isNew) {
      // === 新增上传逻辑 ===
      const draft = data as DraftPhoto;

      if (!draft.file) return;

      const formData = new FormData();

      // 核心：文件
      formData.append("file", draft.file);

      // 核心：其他信息
      formData.append("title", draft.title || "");
      formData.append("story", draft.story || "");
      formData.append("location", draft.location || "");
      // 如果后端需要 tags 是 JSON 字符串
      formData.append("tags", JSON.stringify(draft.tags || []));
      // 如果后端需要 metadata
      formData.append("metadata", JSON.stringify(draft.metadata));

      // 模拟 API 请求
      /* const res = await fetch('/api/v1/upload', {
                method: 'POST',
                body: formData
            });
            if(!res.ok) throw new Error("Upload failed");
            const newPhoto = await res.json();
            */

      // 模拟成功，插入到列表最前
      await new Promise((r) => setTimeout(r, 1500)); // 模拟网络耗时

      // 模拟后端返回的数据结构
      const newPhotoMock: Photo = {
        id: Date.now().toString(),
        url: draft.previewUrl, // 实际应为后端返回的 URL
        width: 800, // 假设
        height: 600,
        title: draft.title!,
        story: draft.story!,
        date: new Date().toISOString().split("T")[0],
        location: draft.location!,
        metadata: draft.metadata as any,
        tags: draft.tags!,
        likes: 0,
      };

      setPhotos((prev) => [newPhotoMock, ...prev]);
    } else {
      // === 更新逻辑 ===
      console.log("Updating photo:", data);
      // await fetch(`/api/v1/photo/${data.id}`, { method: 'PUT', body: JSON.stringify(data) ... })

      // 更新本地状态
      setPhotos((prev) =>
        prev.map((p) => (p.id === data.id ? (data as Photo) : p)),
      );
    }
  };

  // --- 无限滚动监听 ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPhotos();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchPhotos]);

  // --- 初始加载 ---
  useEffect(() => {
    fetchPhotos();
  }, []); // 只执行一次初始加载

  return (
    <div className="w-full min-h-screen p-6 pb-24 relative">
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="text-purple-400" /> VISUAL ARCHIVES
          </h1>
        </div>
        <Button
          size="sm"
          startContent={<RefreshCw size={14} />}
          variant="flat"
          onPress={() => setPhotos([])}
        >
          Reset View
        </Button>
      </div>

      {/* 上传区域 */}
      <UploadZone onFileSelect={handleFileSelect} />

      {/* JS 瀑布流布局容器 
         使用 grid 将列分开，每列内部是一个 flex col
       */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-6">
            {col.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => handlePhotoClick(photo)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 无限滚动哨兵 & Loading 状态 */}
      <div
        ref={loadMoreRef}
        className="w-full h-20 flex items-center justify-center mt-8"
      >
        {loading && <Spinner color="white" label="Loading fragments..." />}
        {!hasMore && (
          <span className="text-default-400 text-xs font-mono">
            END OF ARCHIVE
          </span>
        )}
      </div>

      {/* 编辑器模态框 */}
      <AnimatePresence>
        {isEditorOpen && (
          <PhotoEditorModal
            isOpen={isEditorOpen}
            photo={editingPhoto}
            onClose={() => setIsEditorOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
      {/* 详情弹窗 (保持原样，略去部分重复代码以节省空间) */}
      {/*<Modal*/}
      {/*  backdrop="blur"*/}
      {/*  classNames={{*/}
      {/*    base: "bg-[#09090b]/90 border border-white/10 shadow-2xl",*/}
      {/*    closeButton: "hover:bg-white/10 active:bg-white/20 z-50 text-white",*/}
      {/*  }}*/}
      {/*  isOpen={isOpen}*/}
      {/*  size="5xl"*/}
      {/*  onClose={onClose}*/}
      {/*>*/}
      {/*  <ModalContent>*/}
      {/*    {(onClose) => (*/}
      {/*      <ModalBody className="p-0 overflow-hidden flex flex-col md:flex-row h-[80vh]">*/}
      {/*        {selectedPhoto && (*/}
      {/*          <>*/}
      {/*            <div className="w-full md:w-3/5 h-full bg-black flex items-center justify-center relative">*/}
      {/*              <img*/}
      {/*                alt={selectedPhoto.title}*/}
      {/*                className="w-full h-full object-contain"*/}
      {/*                src={selectedPhoto.url}*/}
      {/*              />*/}
      {/*            </div>*/}
      {/*            <div className="w-full md:w-2/5 h-full bg-content1/20 border-l border-white/10 p-6">*/}
      {/*              <h2 className="text-2xl font-bold text-white mb-2">*/}
      {/*                {selectedPhoto.title}*/}
      {/*              </h2>*/}
      {/*              <p className="text-default-400 font-mono text-sm">*/}
      {/*                {selectedPhoto.story}*/}
      {/*              </p>*/}
      {/*              /!* ... 其他详情字段 ... *!/*/}
      {/*            </div>*/}
      {/*          </>*/}
      {/*        )}*/}
      {/*      </ModalBody>*/}
      {/*    )}*/}
      {/*  </ModalContent>*/}
      {/*</Modal>*/}
    </div>
  );
};

export default AlbumManager;
