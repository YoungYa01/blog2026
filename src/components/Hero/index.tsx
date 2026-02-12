import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import MagneticButton from "../MagneticButton/index.tsx";

import Logo from "@/components/Logo";
import Typewriter from "@/components/Typewriter";

/**
 * 英雄区域组件
 * 功能：实现带有文字揭示动画的英雄区域
 * - 文字从下方滑入，带有3D旋转效果
 * - 装饰线从左向右展开
 * - 按钮从下方淡入
 */
const Hero = () => {
  const container = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useGSAP(
    () => {
      // 高级文字揭示：从 overflow-hidden 的容器中滑出
      const tl = gsap.timeline();

      tl.from(".reveal-text", {
        yPercent: 100, // 向下偏移 100%
        rotateX: 45, // 稍微带点 3D 旋转
        opacity: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out",
      })
        .from(
          ".hero-line",
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1,
            ease: "expo.out",
          },
          "-=1",
        )
        .from(
          ".hero-btn",
          {
            y: 20,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.8",
        );
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="w-full relative h-[66vh] flex flex-row items-center justify-around z-10"
    >
      <div className="text-center ml-20 flex-1/2">
        {/* 遮罩容器 1 */}
        <div className="overflow-hidden mb-2">
          <h1 className="reveal-text text-[6vw] leading-[0.8] font-black text-white tracking-tighter mix-blend-difference">
            <Typewriter text={`$:hi~`}/>
          </h1>
        </div>

        <div className="hero-btn mt-12">
          <MagneticButton className="px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-black transition-colors duration-300 flex items-center gap-2 group">
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */}
            <div onClick={() => navigate("/docs")}>EXPLORE</div>
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform"
              size={18}
            />
          </MagneticButton>
        </div>
      </div>

      <div className="flex justify-center items-center reveal-text mr-20 flex-1/2">
        <Logo />
      </div>
    </section>
  );
};

export default Hero;
