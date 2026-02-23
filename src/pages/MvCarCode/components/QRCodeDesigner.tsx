import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import QRCode from "qrcode";
import { Button } from "@heroui/button";
import { MoveDiagonal2 } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure, useDraggable,
} from "@heroui/modal";
import { Image } from "@heroui/image";

import defaultBgi from "@/asset/default.png";
import { createCustomQRCode } from "@/api/qrcode.ts";

const QRCodeDesigner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null); // 💡 新增：用于直接获取图片的 DOM 元素
  const inputRef = useRef<HTMLInputElement>(null);

  const [bgImage, setBgImage] = useState(defaultBgi);
  const [qrStyle, setQrStyle] = useState({
    x: 50,
    y: 50,
    size: 100,
  });
  const [qrImage, setQRImage] = useState<string>("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState<string>("");
  const targetRef = React.useRef(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

  const generateQRCode = async (data: string) => {
    const qrDataURL = await QRCode.toDataURL(data, {
      width: qrStyle.size,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    setQRImage(qrDataURL);
  };

  // 2. 处理图片上传预览
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setBgImage(imageUrl);
      setFile(file);
    }
  };

  // 3. 提交数据给后端
  const handleSave = async () => {
    if (!containerRef.current || !bgImgRef.current) return;
    // 💡 核心修改：直接计算图片的原始宽度与当前容器渲染宽度的比例
    const renderedWidth = bgImgRef.current.clientWidth;
    const naturalWidth = bgImgRef.current.naturalWidth;
    const convRatio = naturalWidth / renderedWidth;

    const formData = new FormData();

    if (file === null) {
      const blob = await fetch(defaultBgi).then((res) => res.blob());
      const defaultFile = new File([blob], "default.png", { type: blob.type });

      formData.append("file", defaultFile);
    } else {
      formData.append("file", file);
    }

    // 💡 应用缩放比例，并使用 Math.round 取整，避免向后端发送带小数点的像素值
    // @ts-ignore
    formData.append("x", Math.round(qrStyle.x * convRatio));
    // @ts-ignore
    formData.append("y", Math.round(qrStyle.y * convRatio));
    // @ts-ignore
    formData.append("size", Math.round(qrStyle.size * convRatio));

    const response = await createCustomQRCode(formData);

    setPreview(import.meta.env["VITE_BASE_URL"] + response.data);
    onOpen();
  };

  const handleImageLoad = () => {
    if (containerRef.current) {
      // 获取容器当前的实际渲染宽高
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      // 1. 计算大小：宽和高中最小值的二分之一
      const initialSize = Math.min(containerWidth, containerHeight) / 2;

      // 2. 计算居中坐标：(容器宽度/高度 - 二维码大小) / 2
      const centerX = (containerWidth - initialSize) / 2;
      const centerY = (containerHeight - initialSize) / 2;

      // 更新二维码的状态
      setQrStyle({
        size: initialSize,
        x: centerX,
        y: centerY,
      });
    }
  };

  useEffect(() => {
    generateQRCode("https://example.com");
  }, []);

  return (
    <>
      <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: "100%",
            touchAction: "none",
            border: "1px solid #ccc",
          }}
        >
          <img
            ref={bgImgRef} // 💡 绑定 ref 到背景图上
            alt="Background"
            src={bgImage}
            style={{ width: "100%", display: "block", pointerEvents: "none" }}
            onLoad={handleImageLoad}
          />

          <Rnd
            lockAspectRatio
            bounds="parent"
            className={
              "flex justify-center align-center p-3 bg-contain bg-no-repeat bg-center"
            }
            minWidth={100}
            position={{ x: qrStyle.x, y: qrStyle.y }}
            resizeHandleComponent={{
              bottomRight: (
                <MoveDiagonal2
                  className={
                    "bg-white rounded-full -translate-x-0.5 -translate-y-0.5"
                  }
                  height={20}
                  width={20}
                />
              ),
            }}
            size={{ width: qrStyle.size, height: qrStyle.size }}
            style={{
              border: "2px dashed #1890ff",
              backgroundColor: "rgba(24, 144, 255, 0.2)",
              backgroundImage: `url(${qrImage})`,
            }}
            onDragStop={(_, d) => {
              setQrStyle((prev) => ({ ...prev, x: d.x, y: d.y }));
            }}
            onResizeStop={(_, __, ref, ___, position) => {
              setQrStyle({
                size: parseInt(ref.style.width, 10),
                ...position,
              });
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            ref={inputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={handleImageUpload}
          />
          <Button
            className={"w-full mt-4"}
            color={"primary"}
            onPress={() => {
              if (inputRef) inputRef.current?.click();
            }}
          >
            自定义图片
          </Button>
        </div>

        <Button className={"w-full"} color={"success"} onPress={handleSave}>
          保存并生成
        </Button>
      </div>
      <Modal
        ref={targetRef}
        isOpen={isOpen}
        placement={"center"}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader {...moveProps} className={"flex justify-center"}>
                效果图
              </ModalHeader>
              <ModalBody className="text-center w-full">
                <Image isBlurred alt="" className="w-full mb-6" src={preview} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default QRCodeDesigner;
