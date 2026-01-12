import HorizontalScroll from "@/components/HorizontalScroll/index.tsx";
import Hero from "@/components/Hero/index";

/**
 * 博客首页组件
 */
export default function HomePage() {
  return (
    <main>
      <Hero />

      <HorizontalScroll />
    </main>
  );
}
