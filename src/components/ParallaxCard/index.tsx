import React, { useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

/**
 * 视差卡片组件
 * 功能：实现具有3D倾斜效果的卡片
 * - 鼠标悬停时卡片会根据鼠标位置产生3D倾斜
 * - 内容从下方滑入并淡入
 * - 带有项目分类、标题和查看链接
 * @param item - 卡片数据
 * @param index - 卡片索引
 */
interface ParallaxCardProps {
  item: {
    title: string;
    tag: string;
    img: string;
    description: string;
    href: string;
  };
  index: number;
}

const ParallaxCard: React.FC<ParallaxCardProps> = ({ item, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D 倾斜效果
  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;

    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 计算旋转角度
    const rotateX = ((y - centerY) / centerY) * -10; // -10 deg
    const rotateY = ((x - centerX) / centerX) * 10; // 10 deg

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000, // 关键：透视感
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  return (
    <div className="h-item flex-shrink-0 w-[80vw] md:w-[60vw] h-full flex items-center justify-center p-4 md:p-20 select-none cursor-grab active:cursor-grabbing">
      <div
        className="relative w-full aspect-[16/9] perspective-1000"
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div
          ref={cardRef}
          className="w-full h-full relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl group"
        >
          {/* 图片层 */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.img})` }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
          </div>

          {/* 内容层 - 悬停浮起 */}
          <div className="absolute inset-0 flex flex-col justify-end p-10 translate-z-20">
            <a
              className="translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out cursor-pointer
              flex items-start flex-col"
              href={item.href}
            >
              <span className="text-purple-400 font-mono text-sm tracking-widest mb-2 block">
                {item.tag}
              </span>
              <h3 className="text-4xl md:text-6xl font-bold text-white mb-4 flex hover:text-purple-600 transition-colors duration-300">
                {item.title}
                <ArrowUpRight size={28} />
              </h3>
              <div className="flex items-center gap-2 text-white/70">
                <span>{item.description}</span>
              </div>
            </a>
          </div>

          {/* 编号装饰 */}
          <div className="absolute top-6 right-8 font-mono text-white/20 text-xl border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            0{index + 1}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParallaxCard;
