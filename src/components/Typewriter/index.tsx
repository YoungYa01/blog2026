import React, { useState, useEffect } from "react";
import clsx from "clsx";

type Props = {
  text: string;
  delay?: number;
  wait?: number;
  className?: string;
};

const Typewriter: React.FC<Props> = ({
  text,
  delay = 100,
  wait = 2000, // 打完字后停留的时间 (毫秒)
  className = "",
}) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentIndex < text.length) {
      // 1. 正在打字：添加字符
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
    } else if (isDeleting && currentIndex > 0) {
      // 2. 正在删除：减少字符 (删除速度稍微快一点，除以2)
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => prev - 1);
      }, delay / 2);
    } else if (!isDeleting && currentIndex === text.length) {
      // 3. 打字完成：等待一段时间，然后切换到删除模式
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, wait);
    } else if (isDeleting && currentIndex === 0) {
      // 4. 删除完成：切换回打字模式
      setIsDeleting(false);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, delay, isDeleting, text, wait]);

  return (
    <span className={clsx("font-mono", className)}>
      {currentText}
      <span className="animate-pulse text-cyan-500">_</span>
    </span>
  );
};

export default Typewriter;
