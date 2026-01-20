import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  UploadCloud,
  Image as ImageIcon,
  MapPin,
  Camera,
  RefreshCw,
  Maximize2,
  Hash,
  Trash2,
} from "lucide-react";
import { Spinner } from "@heroui/spinner";
import { Progress } from "@heroui/progress";
import { Modal, ModalBody, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Input, Textarea } from "@heroui/input";
import { Image } from "@heroui/image";
import { addToast } from "@heroui/toast";

import { Photo } from "@/types/models/photo.ts";
import {
  createPhoto,
  deletePhoto,
  getPhotoList,
  updatePhoto,
} from "@/api/photo.ts";
import { PaginationResponse } from "@/types/models/response.ts";

// --- 组件：图片卡片 ---
const PhotoCard = ({
  photo,
  onClick,
  onDelete,
}: {
  photo: Photo;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
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
      <div className="relative rounded-xl overflow-hidden bg-content1 border border-white/10 shadow-lg min-h-[150px]">
        {!isLoaded && !isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-default-100/10 z-10">
            <Spinner color="default" size="sm" />
          </div>
        )}

        {isError ? (
          <div className="flex flex-col items-center justify-center h-40 text-default-400 bg-default-50">
            <ImageIcon size={24} />
            <span className="text-[10px] mt-2">LOAD FAILED</span>
          </div>
        ) : (
          <img
            alt={photo.title}
            className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            src={import.meta.env["VITE_BASE_URL"] + photo.url}
            onError={() => setIsError(true)}
            onLoad={() => setIsLoaded(true)}
          />
        )}

        {/* 悬停遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white font-bold truncate text-sm">
              {photo.title || "Untitled"}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-300 flex items-center gap-1">
                <MapPin size={10} /> {photo.location || "Unknown"}
              </span>
            </div>
          </div>

          {/* 删除按钮 */}
          <Button
            isIconOnly
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            color="danger"
            size="sm"
            variant="flat"
            onPress={(e) => onDelete(e as any)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// --- 组件：上传区域 ---
const UploadZone = ({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
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
        <div className="w-16 h-16 rounded-full bg-content1/50 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
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
  file?: File;
  previewUrl: string;
  isNew: boolean;
}

// --- 组件：图片编辑器/详情查看器 ---
const PhotoEditorModal = ({
  photo,
  isOpen,
  onClose,
  onSubmit,
}: {
  photo: Photo | DraftPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Photo | DraftPhoto) => Promise<void>;
}) => {
  const [formData, setFormData] = useState<Photo | DraftPhoto | null>(photo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!photo) return;
    setFormData(photo);

    if ((photo as DraftPhoto).isNew) {
      setFormData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          title:
            prev.title || (prev as DraftPhoto).file?.name.split(".")[0] || "",
        };
      });
    }
  }, [photo]);

  if (!photo || !formData) return null;

  const handleSubmit = async () => {
    if (!formData) return;

    setIsSubmitting(true);
    setUploadProgress(10);

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
      setTimeout(onClose, 500);
    } catch (e) {
      console.error(e);
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
      onClose={!isSubmitting ? onClose : undefined}
    >
      <ModalContent>
        <ModalBody className="p-0 overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px]">
          {/* 左侧：预览区 */}
          <div className="w-full md:w-3/5 h-[40vh] md:h-full bg-black flex items-center justify-center relative p-4">
            <Image
              alt="Preview"
              className="object-contain w-full h-full max-h-[80vh]"
              classNames={{
                wrapper: "w-full h-full flex items-center justify-center",
              }}
              radius="none"
              src={
                formData.url
                  ? import.meta.env["VITE_BASE_URL"] + (formData as any).url
                  : (formData as any).previewUrl
              }
            />

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
              <Input
                classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                label="Title / Codename"
                value={formData.title}
                variant="bordered"
                onValueChange={(v) =>
                  setFormData((prev) => (prev ? { ...prev, title: v } : null))
                }
              />

              <Input
                classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                label="Location Coordinates"
                startContent={<MapPin className="text-default-400" size={16} />}
                value={formData.location}
                variant="bordered"
                onValueChange={(v) =>
                  setFormData((prev) =>
                    prev ? { ...prev, location: v } : null,
                  )
                }
              />

              <Textarea
                classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                label="Memory Log / Story"
                minRows={5}
                placeholder="What is happening in this visual fragment?"
                value={formData.story}
                variant="bordered"
                onValueChange={(v) =>
                  setFormData((prev) => (prev ? { ...prev, story: v } : null))
                }
              />

              <Input
                classNames={{ inputWrapper: "bg-black/20 border-white/10" }}
                label="Tags (Comma separated)"
                placeholder="Cyberpunk, Neon, City"
                startContent={<Hash className="text-default-400" size={16} />}
                value={formData.tags?.join(", ")}
                variant="bordered"
                onValueChange={(v) =>
                  setFormData((prev) =>
                    prev
                      ? { ...prev, tags: v.split(",").map((s) => s.trim()) }
                      : null,
                  )
                }
              />
            </ScrollShadow>

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

// --- 主页面组件 ---
export const AlbumManager = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [editingPhoto, setEditingPhoto] = useState<Photo | DraftPhoto | null>(
    null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // --- 瀑布流分配 Logic (Round-Robin) ---
  // 由于没有宽高信息，无法智能计算高度，改用轮询分配到 3 列
  const useColumns = (items: Photo[]) => {
    const [columns, setColumns] = useState<Photo[][]>([[], [], []]);

    useEffect(() => {
      const newCols: Photo[][] = [[], [], []];

      items.forEach((item, index) => {
        // 简单轮询：0->col0, 1->col1, 2->col2, 3->col0...
        const colIndex = index % 3;

        newCols[colIndex].push(item);
      });
      setColumns(newCols);
    }, [items]);

    return columns;
  };

  const columns = useColumns(photos);

  const loadingRef = useRef(false); // 引入 Ref

  const fetchPhotos = useCallback(async () => {
    // 使用 Ref 判断，不依赖 state
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      // 传入 page
      const data = (await getPhotoList({
        page,
        page_size: 12,
      })) as unknown as PaginationResponse<Photo>;

      const list = data.list || [];

      if (list.length === 0) {
        setHasMore(false);
      } else {
        setPhotos((prev) => {
          const exists = new Set(prev.map((p) => p.id));
          const newItems = list.filter((p: Photo) => !exists.has(p.id));

          return [...prev, ...newItems];
        });
        setPage((prev) => prev + 1);
      }
    } catch (e) {
      console.error("Fetch photos failed", e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, page]); // ✅ 移除 loading 依赖，避免 Observer 闪烁

  // --- 交互: 删除图片 ---
  const handleDelete = async (uid: string) => {
    try {
      const { success } = await deletePhoto(uid);

      if (success) {
        setPhotos((prev) => prev.filter((p) => p.id !== uid));
        addToast({ title: "Delete Success", color: "success" });
      }
    } catch (err) {
      addToast({ title: "Delete Failed", color: "danger" });
    }
  };

  // --- 交互: 文件选择 ---
  const handleFileSelect = (file: File) => {
    const draft: DraftPhoto = {
      isNew: true,
      file: file,
      previewUrl: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""),
      story: "",
      location: "",
      tags: [],
    };

    setEditingPhoto(draft);
    setIsEditorOpen(true);
  };

  const handlePhotoClick = (photo: Photo) => {
    setEditingPhoto({ ...photo, isNew: false });
    setIsEditorOpen(true);
  };

  // --- 交互: 提交表单 (上传) ---
  const handleSubmit = async (draftData: Photo | DraftPhoto) => {
    // @ts-ignore
    const draft: DraftPhoto = draftData;

    const formData = new FormData();

    // @ts-ignore
    formData.append("file", draft.file);
    formData.append("title", draft.title || "");
    formData.append("story", draft.story || "");
    formData.append("location", draft.location || "");
    formData.append("tags", JSON.stringify(draft.tags || []));

    if ((draftData as DraftPhoto).isNew) {
      if (!draft.file) return;
      const { success, message, data } = await createPhoto(formData);

      if (!success) {
        addToast({ title: message, color: "danger" });
      }

      // 本地乐观更新：插入到最前
      // @ts-ignore
      setPhotos((prev) => [data, ...prev]);
      addToast({ title: "Upload Success", color: "success" });
    } else {
      formData.append("uid", String(draftData.id));
      const { success, message } = await updatePhoto(
        String(draftData.id),
        formData,
      );

      if (success) {
        // @ts-ignore
        setPhotos((prev) =>
          prev.map((p) => (p.id === draftData.id ? draftData : p)),
        );
        addToast({ title: "Update Success", color: "success" });
        setEditingPhoto(null);
        setIsEditorOpen(false);
      } else {
        addToast({ title: message, color: "danger" });
      }
    }
  };

  // --- 初始加载与滚动监听 ---
  useEffect(() => {
    fetchPhotos();
  }, []); // Mount only

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

  return (
    <div className="w-full min-h-screen p-6 pb-24 relative">
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
          onPress={() => {
            setPhotos([]);
            setPage(1);
            setHasMore(true);
            setTimeout(fetchPhotos, 100);
          }}
        >
          Reset View
        </Button>
      </div>

      <UploadZone onFileSelect={handleFileSelect} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-6">
            {col.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => handlePhotoClick(photo)}
                onDelete={() => handleDelete(photo.id)}
              />
            ))}
          </div>
        ))}
      </div>

      <div
        ref={loadMoreRef}
        className="w-full h-20 flex items-center justify-center mt-8"
      >
        {loading && <Spinner color="white" label="Loading fragments..." />}
        {!hasMore && photos.length > 0 && (
          <span className="text-default-400 text-xs font-mono">
            END OF ARCHIVE
          </span>
        )}
      </div>

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
    </div>
  );
};

export default AlbumManager;
