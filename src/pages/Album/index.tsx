import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Maximize2,
  X,
  Calendar,
  Hash,
  Share2,
  Heart,
} from "lucide-react";
import { Spinner } from "@heroui/spinner";
import { Modal, ModalBody, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";

import { Photo } from "@/types/models/photo.ts";
import { getPhotoList, likePhoto } from "@/api/photo.ts";

// --- 组件：公开展示卡片 ---
const PublicPhotoCard = ({
  photo,
  onClick,
}: {
  photo: Photo;
  onClick: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // 处理图片 URL (兼容相对路径和绝对路径)
  const imageUrl = photo.url.startsWith("http")
    ? photo.url
    : import.meta.env.VITE_BASE_URL + photo.url;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative group cursor-pointer mb-6 break-inside-avoid"
      initial={{ opacity: 0, y: 20 }}
      layoutId={`photo-${photo.id}`}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
    >
      <div className="relative rounded-xl overflow-hidden bg-content1 border border-white/10 shadow-lg min-h-[150px]">
        {/* Loading State */}
        {!isLoaded && !isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-default-100/10 z-10">
            <Spinner color="default" size="sm" />
          </div>
        )}

        {/* Image */}
        <img
          alt={photo.title}
          className={`w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          src={imageUrl}
          onError={() => setIsError(true)}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-20">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white font-bold truncate text-lg tracking-wide">
              {photo.title || "Untitled Fragment"}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-cyan-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar size={12} />{" "}
                {new Date(photo.date).toLocaleDateString()}
              </span>
              {photo.location && (
                <span className="flex items-center gap-1 text-purple-300">
                  <MapPin size={12} /> {photo.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- 组件：沉浸式查看器 (Lightbox) ---
const PhotoLightbox = ({
  photo,
  isOpen,
  onClose,
}: {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!photo) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isLiked, setIsLiked] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [likes, setLikes] = useState(photo.likes);

  const imageUrl = photo.url.startsWith("http")
    ? photo.url
    : import.meta.env.VITE_BASE_URL + photo.url;

  const handleLike = async (uid: string) => {
    await likePhoto(uid);

    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-black/95 m-0 h-screen max-h-screen border-none",
        closeButton: "z-50 text-white hover:bg-white/20 right-6 top-6",
        wrapper: "w-screen h-screen overflow-hidden",
      }}
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: { opacity: 1 },
          exit: { opacity: 0 },
        },
      }}
      size="full"
      onClose={onClose}
    >
      <ModalContent>
        <ModalBody className="p-0 flex flex-col md:flex-row h-full w-full overflow-hidden relative">
          {/* Close Button Custom Layout */}
          <Button
            isIconOnly
            className="absolute top-4 right-4 z-50 md:hidden text-white"
            variant="light"
            onPress={onClose}
          >
            <X />
          </Button>

          {/* Left: Image Container */}
          <div className="w-full md:w-3/4 h-[50vh] md:h-full flex items-center justify-center bg-black/50 relative group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <Image
              alt={photo.title}
              classNames={{
                wrapper:
                  "w-full h-full flex items-center justify-center p-4 md:p-12",
                img: "max-w-full max-h-full object-contain shadow-2xl shadow-cyan-500/10",
              }}
              radius="none"
              src={imageUrl}
            />
          </div>

          {/* Right: Info Panel */}
          <div className="w-full md:w-1/4 h-[50vh] md:h-full bg-[#09090b] border-l border-white/10 flex flex-col relative z-20">
            {/* Header */}
            <div className="p-8 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                    {photo.title || "Untitled"}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-mono text-default-500">
                    <span className="bg-white/5 px-2 py-1 rounded">
                      ID: {photo.id.slice(0, 8)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(photo.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <ScrollShadow className="flex-1 p-8">
              {/* Story Section */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Maximize2 size={14} /> Memory Log
                </h3>
                <p className="text-default-300 leading-relaxed font-sans text-sm md:text-base whitespace-pre-wrap">
                  {photo.story ||
                    "No memory data recorded for this fragment..."}
                </p>
              </div>

              {/* Location */}
              {photo.location && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={14} /> Coordinates
                  </h3>
                  <p className="text-default-300 font-mono text-sm">
                    {photo.location}
                  </p>
                </div>
              )}

              {/* Tags */}
              {photo.tags && photo.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-default-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Hash size={14} /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {photo.tags.map((tag) => (
                      <Chip
                        key={tag}
                        classNames={{
                          base: "bg-white/5 hover:bg-white/10 transition-colors cursor-default border border-white/5",
                          content: "text-xs font-mono text-default-400",
                        }}
                        size="sm"
                        variant="flat"
                      >
                        #{tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </ScrollShadow>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 flex gap-4 bg-black/20">
              <Button
                className={`flex-1 font-mono text-xs ${isLiked ? "text-red-500" : ""}`}
                startContent={
                  <Heart
                    className={photo.likes > 0 ? "fill-current" : ""}
                    size={16}
                  />
                }
                variant="flat"
                onPress={() => handleLike(photo.id)}
              >
                {likes || 0} LIKES
              </Button>
              <Button
                className="flex-1 font-mono text-xs"
                color="primary"
                startContent={<Share2 size={16} />}
                variant="solid"
              >
                SHARE
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// --- 主页面 ---
export default function BlogAlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // --- 瀑布流分配 Logic (Round-Robin) ---
  const useColumns = (items: Photo[]) => {
    const [columns, setColumns] = useState<Photo[][]>([[], [], []]);

    useEffect(() => {
      const newCols: Photo[][] = [[], [], []];

      items.forEach((item, index) => {
        newCols[index % 3].push(item);
      });
      setColumns(newCols);
    }, [items]);

    return columns;
  };

  const columns = useColumns(photos);

  // --- Fetch Logic ---
  const fetchPhotos = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const { data } = await getPhotoList({ page, page_size: 12 });

      const list = data.list || [];

      if (list.length === 0) {
        setHasMore(false);
      } else {
        setPhotos((prev) => {
          const exists = new Set(prev.map((p) => p.id));
          const newItems = list.filter((p) => !exists.has(p.id));

          return [...prev, ...newItems];
        });
        setPage((prev) => prev + 1);
      }
    } catch (e) {
      console.error("Failed to load visual archives", e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, page]);

  // --- Intersection Observer ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPhotos();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchPhotos]);

  // Initial Load
  useEffect(() => {
    fetchPhotos();
  }, []);

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-foreground relative">
      {/* Background Noise */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="hidden mb-16 text-center">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-4"
            initial={{ opacity: 0, y: -20 }}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            SYSTEM ONLINE :: VISUAL ARCHIVE
          </motion.div>
          <motion.h1
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
            initial={{ opacity: 0, scale: 0.9 }}
          >
            Captured Memories
          </motion.h1>
          {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
          <p className="text-default-500 max-w-xl mx-auto font-mono text-sm">
            // Fragments of time, digitalized and stored for eternity.
            <br />
            Explore the visual logs of the journey.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-6">
              {col.map((photo) => (
                <PublicPhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => openLightbox(photo)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Loading Sentinel */}
        <div
          ref={loadMoreRef}
          className="w-full h-32 flex items-center justify-center mt-12"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner color="primary" size="lg" />
              <span className="text-xs font-mono text-cyan-500 animate-pulse">
                DECODING STREAM...
              </span>
            </div>
          ) : (
            !hasMore &&
            photos.length > 0 && (
              <div className="text-center">
                <div className="w-16 h-1 bg-white/10 mx-auto mb-4" />
                <span className="text-default-400 text-xs font-mono">
                  [ END OF ARCHIVE ]
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && selectedPhoto && (
          <PhotoLightbox
            isOpen={isLightboxOpen}
            photo={selectedPhoto}
            onClose={() => setIsLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
