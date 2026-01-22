import { lazy } from "react";

import ToolsPage from "@/pages/tools";
import ToolLayout from "@/layouts/toolLayout.tsx";

const ExcalidrawPage = lazy(() => import("@/pages/Excalidraw/index"));
const XMindPage = lazy(() => import("@/pages/XMind"));

export default {
  path: "/tools",
  element: <ToolLayout />,
  children: [
    {
      path: "",
      element: <ToolsPage />,
    },
    {
      path: "/tools/excalidraw",
      element: <ExcalidrawPage />,
    },
    {
      path: "/tools/xmind",
      element: <XMindPage />,
    },
  ],
};
