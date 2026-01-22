import { useEffect, useRef, useState } from "react";
import { XMindEmbedViewer } from "xmind-embed-viewer";
import { motion, AnimatePresence } from "framer-motion";
// eslint-disable-next-line import/order
import { UploadCloud, Maximize, X, Minimize } from "lucide-react";

// HeroUI Components
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

// --- 组件：文件上传区 (拖拽或点击) ---
const UploadZone = ({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];

      if (file.name.endsWith(".xmind")) {
        onFileSelect(file);
      } else {
        alert("Please upload a valid .xmind file");
      }
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full"
      initial={{ opacity: 0, scale: 0.95 }}
    >
      <input
        ref={fileInputRef}
        accept=".xmind"
        className="hidden"
        type="file"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center 
          bg-black/40 backdrop-blur-md cursor-pointer group transition-all duration-300
          ${isDragging ? "border-cyan-500 bg-cyan-500/10" : "border-white/10 hover:bg-white/5 hover:border-cyan-500/50"}
        `}
        whileHover={{ scale: 1.02 }}
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
        <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors border border-cyan-500/20 text-cyan-500">
          <UploadCloud size={40} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Inject Neural Map</h3>
        <p className="text-sm text-default-400 font-mono text-center">
          DROP .XMIND FILE HERE <br /> OR CLICK TO BROWSE
        </p>
      </motion.div>
    </motion.div>
  );
};

// --- 主页面：XMind 查看器 ---
export default function XMindPage() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<XMindEmbedViewer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 初始化 Viewer
  useEffect(() => {
    if (!viewerRef.current) return;

    // 创建 Viewer 实例
    const v = new XMindEmbedViewer({
      el: viewerRef.current,
      styles: {
        height: "100%",
        width: "100%",
      },
    });

    setViewer(v);

    // 事件监听 (可选)
    v.addEventListener("map-ready", () => {
      setLoading(false);
      console.log("Map Ready");
    });

    return () => {
      // @ts-ignore
      v.removeEventListener("map-ready");
    };
  }, []);

  // 加载文件
  const loadFile = async (selectedFile: File) => {
    if (!viewer) return;
    setFile(selectedFile);
    setLoading(true);

    try {
      // 读取文件为 ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();

      // 加载数据
      viewer.load(arrayBuffer);
    } catch (error) {
      console.error("Failed to load xmind file:", error);
      setLoading(false);
      alert("Failed to parse XMind file.");
      setFile(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    // 重新创建一个空的 viewer 或者清空当前内容（库没有直接的 clear，重置状态即可）
    if (viewerRef.current) viewerRef.current.innerHTML = "";
    window.location.reload(); // 简单粗暴重置，或者重新实例化 viewer
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#050505] relative overflow-hidden flex flex-col text-foreground">
      {/* 主内容区 */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-grid-pattern">
        {/* 背景网格装饰 */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* 1. 文件上传状态 */}
        <AnimatePresence>
          {!file && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
              <UploadZone onFileSelect={loadFile} />
            </div>
          )}
        </AnimatePresence>

        {/* 2. Loading 状态 */}
        {loading && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Spinner color="primary" size="lg" />
            <p className="mt-4 text-cyan-500 font-mono text-xs animate-pulse tracking-[0.2em]">
              DECODING NEURAL PATHWAYS...
            </p>
          </div>
        )}

        {/* 3. XMind Viewer 容器 */}
        <div
          ref={viewerRef}
          className={`w-full h-full relative z-10 transition-opacity duration-500 ${!file ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          id="xmind-container"
        />

        {/* 4. 悬浮控制栏 (仅在有文件时显示) */}
        <AnimatePresence>
          {file && !loading && (
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
              exit={{ y: 100, opacity: 0 }}
              initial={{ y: 100, opacity: 0 }}
            >
              <Button
                isIconOnly
                className="text-default-400 hover:text-white"
                title="Close File"
                variant="flat"
                onPress={handleReset}
              >
                <X size={20} />
              </Button>
              {/*<div className="w-px h-8 bg-white/10 mx-1 my-auto" />*/}
              <div className="w-px h-8 bg-white/10 mx-1 my-auto" />
              <Button
                isIconOnly
                className="text-default-400 hover:text-white"
                variant="flat"
                onPress={toggleFullscreen}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
