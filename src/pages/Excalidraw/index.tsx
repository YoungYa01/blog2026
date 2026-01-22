import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useTheme } from "@heroui/use-theme";

export default function ExcalidrawPage() {
  const { theme } = useTheme();

  return (
    <div className="w-screen h-screen">
      <Excalidraw
        langCode={"zh-CN"}
        theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}
