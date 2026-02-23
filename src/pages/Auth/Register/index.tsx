import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Activity,
  Zap,
  ArrowRight,
  FileBadge,
  ShieldCheck,
  Key, // 新增图标
  Timer,
} from "lucide-react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { addToast, closeAll } from "@heroui/toast";

import { getAllSchemaMessage, registerSchema } from "@/utils/schemaVerify.ts";
import { register, sendCaptchaEmail } from "@/api/auth.ts";
import { RegisterModel } from "@/types/models/auth.ts";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterModel>({
    name: "",
    age: 18,
    email: "",
    password: "",
    captcha: "", // 这里的 captcha 如果指的是图片验证码，保留；如果是指邮箱验证码，可以复用
  });

  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // --- 验证码倒计时逻辑 ---
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    // 简单的邮箱校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email || !emailRegex.test(formData.email)) {
      addToast({
        description: "请输入有效的邮箱地址",
        color: "warning",
      });

      return;
    }

    setIsSendingCode(true);
    try {
      const { success, message } = await sendCaptchaEmail({
        email: formData.email,
      });

      if (!success) {
        addToast({
          description: message,
          color: "danger",
        });

        return;
      }

      addToast({
        description: "验证码已发送至您的邮箱",
        color: "success",
      });
      setCountdown(60);
    } catch (err) {
      addToast({
        description: "发送失败，请稍后重试",
        color: "danger",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  // --- 3D 视差逻辑 ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setFocusedField(null);
  };

  const handleRegister = async () => {
    setIsLoading(true);

    if (!formData.captcha || formData.captcha.length < 6) {
      addToast({ description: "请输入正确的验证码", color: "danger" });
      setIsLoading(false);

      return;
    }

    const { success, error } = registerSchema.safeParse(formData);

    if (!success) {
      closeAll();
      addToast({
        description: getAllSchemaMessage(String(error)),
        color: "danger",
      });
      setIsLoading(false);

      return;
    }

    try {
      await register(formData);

      addToast({ title: "注册成功", color: "success" });
      navigate("/auth/login");
    } catch (err) {
      addToast({
        title: "注册失败",
        description: (err as { message: string }).message,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 根据聚焦字段返回核心颜色和图标
  const getCoreState = () => {
    switch (focusedField) {
      case "name":
        return {
          color: "border-cyan-400 bg-cyan-400/20",
          icon: <FileBadge className="text-cyan-400 w-8 h-8" />,
          glow: "shadow-cyan-400/50",
        };
      case "age":
        return {
          color: "border-emerald-400 bg-emerald-400/20",
          icon: <Activity className="text-emerald-400 w-8 h-8" />,
          glow: "shadow-emerald-400/50",
        };
      case "email":
        return {
          color: "border-amber-400 bg-amber-400/20",
          icon: <Mail className="text-amber-400 w-8 h-8" />,
          glow: "shadow-amber-400/50",
        };
      case "captcha": // 新增验证码的状态颜色 (紫色)
        return {
          color: "border-violet-500 bg-violet-500/20",
          icon: <Key className="text-violet-500 w-8 h-8" />,
          glow: "shadow-violet-500/50",
        };
      case "password":
        return {
          color: "border-rose-500 bg-rose-500/20",
          icon: <ShieldCheck className="text-rose-500 w-8 h-8" />,
          glow: "shadow-rose-500/50",
        };
      default:
        return {
          color: "border-primary bg-primary/20",
          icon: <Zap className="text-primary w-8 h-8" />,
          glow: "shadow-primary/50",
        };
    }
  };

  const coreState = getCoreState();

  return (
    <div
      className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden relative perspective-1000 py-10"
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* 背景层 (保持不变) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-20 animate-pulse" />
      </div>

      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-lg px-4"
        initial={{ scale: 0.9, opacity: 0 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* 顶部状态栏 */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-primary to-purple-500 opacity-80" />

          <div className="p-8 flex flex-col gap-6">
            {/* 1. 动态核心展示区 */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-widest uppercase">
                  Initialize
                </h1>
                <p className="text-xs text-default-400 font-mono mt-1">
                  NEW SUBJECT REGISTRATION // PROTOCOL V.1
                </p>
              </div>

              {/* 核心球体 */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: isLoading ? -360 : 0 }}
                  className={`absolute inset-0 rounded-full border border-dashed border-white/20`}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  layout
                  className={`
                                relative w-12 h-12 rounded-full flex items-center justify-center border
                                shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300
                                ${coreState.color} ${coreState.glow}
                            `}
                >
                  {isLoading ? (
                    <Activity className="animate-bounce" />
                  ) : (
                    coreState.icon
                  )}
                </motion.div>
              </div>
            </div>

            {/* 2. 表单输入区 */}
            <div className="space-y-5">
              {/* Name & Age Row */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-white/5 border-white/10 group-data-[focus=true]:border-cyan-400/50 h-12",
                      label: "text-default-400 text-xs",
                    }}
                    label="名字"
                    maxLength={20}
                    minLength={2}
                    startContent={
                      <User className="text-default-400" size={16} />
                    }
                    value={formData.name}
                    variant="bordered"
                    onFocus={() => setFocusedField("name")}
                    onValueChange={(v) => setFormData({ ...formData, name: v })}
                  />
                </div>
                <div className="w-24">
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-white/5 border-white/10 group-data-[focus=true]:border-emerald-400/50 h-12",
                      label: "text-default-400 text-xs",
                    }}
                    label="年龄"
                    max={150}
                    min={1}
                    type="number"
                    value={formData.age.toString()}
                    variant="bordered"
                    onFocus={() => setFocusedField("age")}
                    onValueChange={(v) =>
                      setFormData({ ...formData, age: Number(v) })
                    }
                  />
                </div>
              </div>

              {/* Email Row */}
              <Input
                classNames={{
                  inputWrapper:
                    "bg-white/5 border-white/10 group-data-[focus=true]:border-amber-400/50 h-12",
                  label: "text-default-400 text-xs",
                }}
                label="邮箱"
                startContent={<Mail className="text-default-400" size={16} />}
                value={formData.email}
                variant="bordered"
                onFocus={() => setFocusedField("email")}
                onValueChange={(v) => setFormData({ ...formData, email: v })}
              />

              <Input
                classNames={{
                  inputWrapper:
                    "bg-white/5 border-white/10 group-data-[focus=true]:border-violet-500/50 h-12 pr-1",
                  label: "text-default-400 text-xs",
                }}
                endContent={
                  <Button
                    className={`
                      min-w-[100px] h-8 font-mono text-xs
                      ${
                        countdown > 0
                          ? "bg-default-100 text-default-400"
                          : "bg-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-white border border-violet-500/50"
                      }
                    `}
                    disabled={countdown > 0 || isSendingCode}
                    isLoading={isSendingCode}
                    size="sm"
                    onPress={handleSendCode}
                  >
                    {countdown > 0 ? (
                      <span className="flex items-center gap-1">
                        <Timer size={12} /> {countdown}s
                      </span>
                    ) : (
                      "SEND CAPTCHA"
                    )}
                  </Button>
                }
                label="验证码"
                placeholder="输入6位验证码"
                startContent={<Key className="text-default-400" size={16} />}
                value={formData.captcha}
                variant="bordered"
                onFocus={() => setFocusedField("captcha")}
                onValueChange={(v) => setFormData({ ...formData, captcha: v })}
              />

              {/* Password Row */}
              <Input
                classNames={{
                  inputWrapper:
                    "bg-white/5 border-white/10 group-data-[focus=true]:border-rose-500/50 h-12",
                  label: "text-default-400 text-xs",
                }}
                label="密码"
                startContent={<Lock className="text-default-400" size={16} />}
                type="password"
                value={formData.password}
                variant="bordered"
                onFocus={() => setFocusedField("password")}
                onValueChange={(v) => setFormData({ ...formData, password: v })}
              />
            </div>

            {/* 3. 提交按钮 */}
            <Button
              className={`
                        w-full font-bold relative overflow-hidden group mt-2
                        ${isLoading ? "bg-white/5 text-white/50" : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20"}
                    `}
              isLoading={isLoading}
              size="lg"
              onPress={handleRegister}
            >
              {isLoading ? "UPLOADING TO MAINFRAME..." : "ESTABLISH IDENTITY"}
              {!isLoading && (
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              )}

              {/* 扫描光效 */}
              {!isLoading && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              )}
            </Button>

            {/* 底部链接 */}
            <div className="flex items-center justify-center gap-2 text-md text-default-500 font-mono">
              <span>ALREADY REGISTERED?</span>
              <button
                className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors uppercase"
                onClick={() => navigate("/auth/login")}
              >
                Access Terminal
              </button>
            </div>
          </div>

          {/* 装饰性数据流背景 (保持不变) */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <div className="flex flex-col gap-1 items-end text-[8px] font-mono text-cyan-500">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                >
                  0x
                  {Math.floor(Math.random() * 10000)
                    .toString(16)
                    .toUpperCase()}{" "}
                  :: SYNC
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default Register;
