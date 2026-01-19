import React, { useState, useRef, useEffect } from "react"; // 引入 useEffect
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { X } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { useNavigate, useLocation } from "react-router-dom"; // 引入 useLocation

export type MenuItem = {
  key: string;
  label: string;
  icon: React.ElementType;
};

type CircularMenuProps = {
  menuItems: MenuItem[];
};

const RADIUS = 140;
const INNER_RADIUS = 50;

export const CircularMenu: React.FC<CircularMenuProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // --- 新增: 获取当前路由位置 ---
  const location = useLocation();

  const rotationValue = useSpring(0, {
    stiffness: 150,
    damping: 20,
    mass: 0.8,
  });
  const currentRotationRef = useRef(0);

  // 抽离关闭逻辑，方便复用
  const handleClose = () => {
    setIsOpen(false);
    setActiveIndex(null);
    rotationValue.set(0);
    currentRotationRef.current = 0;
  };

  // --- 新增: 监听路由变化，自动关闭菜单 ---
  useEffect(() => {
    // 只要路径发生变化，就强制关闭菜单
    if (isOpen) {
      handleClose();
    }
  }, [location.pathname]); // 依赖项是路径

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isOpen || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    angle = angle + 90;
    if (angle < 0) angle += 360;

    const sectorAngle = 360 / props.menuItems.length;
    const index = Math.floor(angle / sectorAngle) % props.menuItems.length;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > INNER_RADIUS && distance < RADIUS + 20) {
      if (activeIndex !== index) {
        setActiveIndex(index);
        const targetAngle = index * sectorAngle;
        const currentAngle = currentRotationRef.current;
        let delta = targetAngle - (currentAngle % 360);

        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        const nextRotation = currentAngle + delta;

        rotationValue.set(nextRotation);
        currentRotationRef.current = nextRotation;
      }
    } else {
      setActiveIndex(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[8px] z-40 cursor-pointer"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        <AnimatePresence>
          {isOpen && (
            <div
              className="absolute bottom-20"
              style={{
                width: RADIUS * 2,
                height: RADIUS * 2,
              }}
              onMouseLeave={() => setActiveIndex(null)}
              onMouseMove={handleMouseMove}
            >
              <motion.div
                ref={menuRef}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                className="relative w-full h-full flex items-center justify-center"
                exit={{ scale: 0.8, opacity: 0, rotate: 0 }}
                initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="absolute inset-0 rounded-full bg-content1/80 backdrop-blur-2xl border border-white/10 shadow-2xl"
                  style={{
                    maskImage:
                      "radial-gradient(circle at center, black 65%, transparent 100%)",
                    WebkitMaskImage:
                      "radial-gradient(circle at center, black 65%, transparent 100%)",
                  }}
                />

                <motion.div
                  className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
                  style={{ rotate: rotationValue }}
                >
                  <div
                    className="w-full h-full rounded-full opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: activeIndex !== null ? 1 : 0,
                      background: `conic-gradient(from -30deg at 50% 50%, transparent 0deg, var(--heroui-primary) 30deg, transparent 60deg)`,
                      filter: "blur(15px)",
                      transform: "scale(1.1)",
                    }}
                  />
                </motion.div>

                <div className="absolute w-24 h-24 rounded-full bg-background/50 backdrop-blur-md border border-white/5 shadow-inner z-10 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeIndex || "default"}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-medium font-bold tracking-widest uppercase text-foreground/80"
                      exit={{ opacity: 0, y: -5 }}
                      initial={{ opacity: 0, y: 5 }}
                    >
                      {activeIndex !== null
                        ? props.menuItems[activeIndex].label
                        : "MENU"}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {props.menuItems.map((item, index) => {
                  const angle = index * (360 / props.menuItems.length) - 90;
                  const radian = (angle * Math.PI) / 180;
                  const x = Math.cos(radian) * (RADIUS - 45);
                  const y = Math.sin(radian) * (RADIUS - 45);
                  const isActive = activeIndex === index;

                  return (
                    <motion.button
                      key={item.key}
                      className={`absolute z-20 transition-all duration-200 flex flex-col items-center justify-center 
                      cursor-grab active:cursor-grabbing
                      ${
                        isActive
                          ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(var(--heroui-primary),0.5)]"
                          : "text-default-400"
                      }`}
                      style={{ x, y }}
                      onClick={() => {
                        navigate(item.key);
                        // 这里可以不用手动调用 handleClose 了，因为 useEffect 会监听路由变化自动关闭
                        // 但保留它会让交互感觉更“跟手”（反应更快）
                        handleClose();
                      }}
                    >
                      <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Tooltip content="系统导航" offset={20}>
          <motion.button
            layout
            className={`
                    w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2
                    transition-colors duration-300 cursor-pointer
                    ${
                      isOpen
                        ? "bg-default-100 border-default-200 text-default-900"
                        : "bg-content1 border-white/10 text-primary hover:border-primary/50"
                    }
                `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {isOpen ? (
                <X color={"#d41821"} size={28} />
              ) : (
                <HiOutlineSquares2X2 size={36} />
              )}
            </motion.div>
          </motion.button>
        </Tooltip>
      </div>
    </>
  );
};
