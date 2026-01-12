import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * 磁性按钮组件
 * 功能：实现跟随鼠标移动的磁性效果按钮
 * @param children - 按钮内容
 * @param className - 自定义类名
 */
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const btn = btnRef.current;

      if (!btn) return;

      const xTo = gsap.quickTo(btn, "x", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });
      const yTo = gsap.quickTo(btn, "y", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });

      const handleMove = (e: MouseEvent) => {
        const { left, top, width, height } = btn.getBoundingClientRect();
        const x = e.clientX - (left + width / 2);
        const y = e.clientY - (top + height / 2);

        xTo(x * 0.3); // 移动系数，0.3 表示轻微跟随
        yTo(y * 0.3);
      };

      const handleLeave = () => {
        xTo(0);
        yTo(0);
      };

      btn.addEventListener("mousemove", handleMove);
      btn.addEventListener("mouseleave", handleLeave);

      return () => {
        btn.removeEventListener("mousemove", handleMove);
        btn.removeEventListener("mouseleave", handleLeave);
      };
    },
    { scope: btnRef },
  );

  return (
    <div className="inline-block p-4">
      {" "}
      {/* Padding 增加触发面积 */}
      <button ref={btnRef} className={className}>
        {children}
      </button>
    </div>
  );
};

export default MagneticButton;
