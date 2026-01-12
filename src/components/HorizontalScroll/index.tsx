import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

import ParallaxCard from "../ParallaxCard/index.tsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HorizontalScroll = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);

  // 核心引用数据 (使用 ref 避免闭包陷阱)
  const dragData = useRef({
    startX: 0,
    scrollStartY: 0,
    velocity: 0,
    lastTime: 0,
    lastX: 0,
    rafId: null as number | null,
  });

  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>(".h-item");

      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          pin: true,
          scrub: 0.5, // 稍微增加 scrub 时间，使 ScrollTrigger 自带平滑效果
          snap: 1 / (sections.length - 1),
          end: "+=3000",
        },
      });
    },
    { scope: wrapperRef },
  );

  // 惯性滚动循环
  const inertiaLoop = useCallback(() => {
    const { velocity } = dragData.current;

    // 摩擦力系数 (越接近 1 滑动越远)
    const friction = 0.95;

    // 停止阈值
    if (Math.abs(velocity) < 0.1) {
      dragData.current.velocity = 0;
      if (dragData.current.rafId) {
        cancelAnimationFrame(dragData.current.rafId);
        dragData.current.rafId = null;
      }

      return;
    }

    // 应用滚动 (反向：因为向左拖拽 = 向右浏览 = 页面向下滚动)
    window.scrollBy(0, -velocity);

    // 衰减速度
    dragData.current.velocity *= friction;

    // 继续循环
    dragData.current.rafId = requestAnimationFrame(inertiaLoop);
  }, []);

  // 鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 阻止默认行为（防止选中文字等）
    e.preventDefault();

    // 停止当前的惯性滚动
    if (dragData.current.rafId) {
      cancelAnimationFrame(dragData.current.rafId);
      dragData.current.rafId = null;
    }

    setIsDragging(true);

    // 记录初始状态
    dragData.current.startX = e.clientX;
    dragData.current.lastX = e.clientX;
    dragData.current.lastTime = Date.now();
    dragData.current.velocity = 0;
  }, []);

  // 鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      e.preventDefault();

      const currentX = e.clientX;
      const now = Date.now();

      // 计算差值
      const deltaX = currentX - dragData.current.lastX;

      // 1. 直接滚动页面
      // 乘以系数 1.5 让拖拽手感更跟手 (视差滚动通常需要比 1:1 更快的速度)
      window.scrollBy(0, -deltaX * 1.5);

      // 2. 计算瞬时速度 (用于松手后的惯性)
      const dt = now - dragData.current.lastTime;

      if (dt > 0) {
        // 简单的速度计算：距离 / 时间
        // 限制最大速度防止飞出
        const newVel = deltaX * 1.5;

        dragData.current.velocity = newVel;
      }

      // 更新记录
      dragData.current.lastX = currentX;
      dragData.current.lastTime = now;
    },
    [isDragging],
  );

  // 鼠标释放/离开
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // 启动惯性滚动
    dragData.current.rafId = requestAnimationFrame(inertiaLoop);
  }, [isDragging, inertiaLoop]);

  // 全局清理
  useEffect(() => {
    return () => {
      if (dragData.current.rafId) {
        cancelAnimationFrame(dragData.current.rafId);
      }
    };
  }, []);

  const works = [
    {
      title: "NEON VERSE",
      tag: "WEBGL / THREE.JS",
      img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000",
      description:
        "A 3D web app that simulates a neon-themed virtual reality experience.",
      href: "https://neonverse.com",
    },
    {
      title: "SILENT ECHO",
      tag: "BRANDING",
      img: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=2000",
      description:
        "A branding project for a fictional company that specializes in creating high-quality audio recordings.",
      href: "https://silentecho.com",
    },
    {
      title: "VOID WALKER",
      tag: "IMMERSIVE UI",
      img: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&q=80&w=2000",
      description:
        "A minimalist, minimalistic user interface for a fictional audio recording company.",
      href: "https://voidwalker.com",
    },
    {
      title: "AERO FLUX",
      tag: "CREATIVE DEV",
      img: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?auto=format&fit=crop&q=80&w=2000",
      description:
        "A creative development project for a fictional audio recording company.",
      href: "https://aeroflux.com",
    },
    {
      title: "CYBER CORE",
      tag: "WEBGL / THREE.JS",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000",
      description:
        "A 3D web app that simulates a cyberpunk-themed virtual reality experience.",
      href: "/about",
    },
  ];

  return (
    <div ref={wrapperRef} className="relative z-10">
      {/* 状态指示器 */}
      <div className="fixed top-12 left-12 flex items-center gap-4 z-50 mix-blend-difference text-white/50 pointer-events-none">
        <div
          className={`w-2 h-2 bg-purple-500 rounded-full ${isDragging ? "scale-150" : "animate-pulse"} transition-transform`}
        />
        <span className="font-mono text-sm tracking-widest uppercase">
          {isDragging ? "DRAGGING..." : "SCROLL OR DRAG"}
        </span>
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={containerRef}
        className={clsx(
          `flex h-full items-center overflow-hidden cursor-grab active:cursor-grabbing`,
          isDragging ? "cursor-grabbing" : "",
        )}
        style={{
          userSelect: "none",
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {works.map((item, i) => (
          <ParallaxCard key={i} index={i} item={item} />
        ))}
      </div>
    </div>
  );
};

export default HorizontalScroll;
