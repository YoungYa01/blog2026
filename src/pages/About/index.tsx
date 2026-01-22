import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Terminal, Cpu, Code2, Globe, Braces, Laptop } from "lucide-react";
import { Code } from "@heroui/code";

import Typewriter from "@/components/Typewriter";

// --- 组件：技能芯片 ---
const TechChip = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <Chip
    classNames={{
      base: "bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors cursor-default",
      content:
        "flex items-center gap-1 text-xs font-mono text-default-400 group-hover:text-cyan-400",
    }}
    variant="flat"
  >
    <Icon size={12} /> {label}
  </Chip>
);

export default function AboutPage() {
  // --- 3D 视差逻辑 ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="w-full flex justify-center items-center">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg perspective-1000"
        initial={{ opacity: 0, scale: 0.9 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ duration: 0.5 }}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div className="p-8 md:p-12 flex flex-col items-center text-center relative gap-6">
          {/* 头像区 */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 opacity-20 group-hover:opacity-75 blur transition duration-500" />
            <div className="relative p-1 bg-black rounded-full border border-white/10">
              <Avatar
                isBordered
                className="w-32 h-32 md:w-40 md:h-40"
                color="primary"
                src="https://avatars.githubusercontent.com/u/118104940?s=400&u=9709c934d4246f4fde369cb70d71bbff5d8d1baa&v=4"
              />
            </div>
            {/* 在线状态点 */}
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-white/10">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>

          {/* 个人信息 */}
          <div className="w-full">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              YoungYa
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-500 mb-6 bg-cyan-500/5 py-1 px-3 rounded-full border border-cyan-500/10 w-fit mx-auto">
              <Terminal size={12} />
              <span>FULL_STACK_DEVELOPER</span>
            </div>

            {/* 打字机简介 */}
            <div className="min-h-[3rem] text-sm md:text-base leading-relaxed mb-6">
              <p>
                <span className="text-purple-400 mr-2">root@youngya:~$</span>
                <Typewriter text="Building digital experiences in the void. Exploring Go, React, and web aesthetics." />
              </p>
            </div>

            {/* 系统构建进度 */}
            <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5 mb-6 text-left">
              <div className="flex justify-between text-xs text-default-400 font-mono mb-2">
                <span>BLOG_SYSTEM_STATUS</span>
                <span className="text-yellow-500 animate-pulse">
                  BUILDING...
                </span>
              </div>
              <Progress
                aria-label="Loading..."
                classNames={{
                  track: "bg-white/5",
                  indicator: "bg-gradient-to-r from-yellow-500 to-orange-500",
                }}
                color="warning"
                size="sm"
                value={65}
              />
              <p className="text-[10px] text-default-500 mt-2 font-mono">
                // 博客还在抽空着写，敬请期待 final release v1.0
              </p>
            </div>

            {/* 技术栈 */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <TechChip icon={Code2} label="React" />
              <TechChip icon={Braces} label="Next.js" />
              <TechChip icon={Code} label={"Vue"} />
              <TechChip icon={Braces} label="Typescript" />
              <TechChip icon={Laptop} label="Node.js" />
              <TechChip icon={Braces} label="Tailwindcss" />
              <TechChip icon={Globe} label="Golang" />
              <TechChip icon={Cpu} label="Docker" />
              <TechChip icon={Terminal} label="Linux" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
