import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { User, Lock, Fingerprint, ScanEye, ArrowRight } from "lucide-react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import {z} from "zod";

const emailSchema = z.object({ email: z.string().email() });

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );

  const navigate = useNavigate();

  // --- 3D 视差倾斜逻辑 ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setFocusedField(null);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    // 模拟登录延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert("身份验证通过 / Access Granted");
  };

  return (
    <div
      className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden relative perspective-1000"
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* --- 背景层：动态流光 --- */}
      <div className="absolute inset-0 z-0">
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* 跟随鼠标的聚光灯 (简单版) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
      </div>

      {/* --- 核心层：3D 悬浮终端 --- */}
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md p-8"
        initial={{ scale: 0.8, opacity: 0 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        {/* 卡片本体 */}
        <div className="relative bg-content1/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(var(--heroui-primary),0.5)] overflow-hidden">
          {/* 顶部装饰条 */}
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          <div className="p-8 flex flex-col items-center gap-6">
            {/* 1. 动态核心 (The Reactive Core) */}
            <div className="relative w-24 h-24 flex items-center justify-center mb-4">
              {/* 核心外圈 */}
              <motion.div
                animate={{ rotate: isLoading ? 360 : 0 }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              {/* 核心内圈 - 根据状态变化 */}
              <motion.div
                layout
                className={`
                            relative w-16 h-16 rounded-full flex items-center justify-center
                            shadow-[0_0_30px_rgba(var(--heroui-primary),0.6)]
                            transition-colors duration-500
                            ${focusedField === "password" ? "bg-danger/20 border-danger" : "bg-primary/20 border-primary"}
                            border-2 
                        `}
              >
                {/* 状态图标切换 */}
                {isLoading ? (
                  <ScanEye className="text-primary animate-pulse w-8 h-8" />
                ) : focusedField === "password" ? (
                  <Lock className="text-danger w-8 h-8" />
                ) : (
                  <Fingerprint className="text-primary w-8 h-8" />
                )}
              </motion.div>

              {/* 扫描线效果 (Loading时出现) */}
              {isLoading && (
                <motion.div
                  animate={{ top: "100%" }}
                  className="absolute left-0 w-full h-1 bg-primary/50 shadow-[0_0_10px_rgba(var(--heroui-primary),1)]"
                  initial={{ top: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-widest text-foreground uppercase">
                System Login
              </h1>
              <p className="text-xs text-default-400 font-mono">
                SECURE TERMINAL // ID: A-992
              </p>
            </div>

            {/* 2. 表单区域 */}
            <div className="w-full space-y-4">
              <Input
                classNames={{
                  inputWrapper:
                    "bg-black/20 border-white/10 group-data-[focus=true]:border-primary/50 group-data-[focus=true]:bg-black/40 h-14",
                  label: "text-default-400",
                }}
                errorMessage="请输入正确的邮箱"
                isInvalid={emailSchema.safeParse(email).success}
                label="Email"
                startContent={
                  <User
                    className="text-default-400 pointer-events-none"
                    size={18}
                  />
                }
                type={"email"}
                value={email}
                variant="bordered"
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("email")}
                onValueChange={setEmail}
              />

              <Input
                classNames={{
                  inputWrapper:
                    "bg-black/20 border-white/10 group-data-[focus=true]:border-danger/50 group-data-[focus=true]:bg-black/40 h-14",
                }}
                label="Password"
                startContent={
                  <Lock
                    className="text-default-400 pointer-events-none"
                    size={18}
                  />
                }
                type="password"
                value={password}
                variant="bordered"
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("password")}
                onValueChange={setPassword}
              />
            </div>

            {/* 3. 交互式按钮 */}
            <Button
              className={`
                        w-full font-bold tracking-wider relative overflow-hidden group
                        ${isLoading ? "bg-default-100 cursor-not-allowed" : "bg-primary text-primary-foreground shadow-lg shadow-primary/40"}
                    `}
              isDisabled={isLoading}
              size="lg"
              onPress={handleLogin}
            >
              <div className="relative z-10 flex items-center gap-2">
                {isLoading ? "AUTHENTICATING..." : "INITIATE SESSION"}
                {!isLoading && (
                  <ArrowRight
                    className="group-hover:translate-x-1 transition-transform"
                    size={18}
                  />
                )}
              </div>

              {/* 按钮内部流光效果 */}
              {!isLoading && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
              )}
            </Button>

            {/* 底部辅助链接 */}
            <div className="flex justify-start w-full text-md gap-2 text-default-400 font-mono mt-2">
              don&rsquo;t have an account?
              <button
                className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors uppercase"
                onClick={() => navigate("/auth/signup")}
              >
                sign up
              </button>
            </div>
          </div>
        </div>

        {/* 悬浮阴影 (增强3D感) */}
        <div
          className="absolute -bottom-10 left-10 right-10 h-8 bg-black/50 blur-xl rounded-[50%]"
          style={{ transform: "translateZ(-50px)" }} // 让它看起来在卡片后面
        />
      </motion.div>

      {/* 屏幕噪点叠加层 (Retro Futurisim) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default Login;
