import * as Icons from "lucide-react";

export enum ToolType {
  internal = "internal",
  external = "external",
}
export enum ToolStatus {
  online = "online", // 正常
  maintenance = "maintenance", // 维护中
  beta = "beta", // beta
}

export enum Category {
  Dev = "Dev", // 开发者工具
  Design = "Design", // 设计工具
  System = "System", // 系统工具
  Productivity = "Productivity", // 产品工具
}
export interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  url: string;
  type: ToolType;
  category: Category;
  status: ToolStatus;
}

export default [
  {
    id: "Excalidraw",
    title: "Excalidraw",
    description:
      "A free online tool for creating diagrams, flowcharts, and mind maps.",
    icon: Icons.PenTool,
    url: "/tools/excalidraw",
    type: ToolType.internal,
    category: Category.Design,
    status: ToolStatus.online,
  },
  {
    id: "xmind-viewer",
    title: "XMind Viewer",
    description:
      "Visualization terminal for .xmind brain-files. Supports drag-and-drop injection.",
    icon: Icons.BrainCircuit,
    url: "/tools/xmind",
    type: ToolType.internal,
    category: Category.Productivity,
    status: ToolStatus.online,
  },
  {
    id: "IDPhotoChange",
    title: "ID Photo Change",
    description:
      "Change your ID photo to a professional photo with a professional photo editor.",
    icon: Icons.Image,
    url: "/idphoto/home",
    type: ToolType.external,
    category: Category.Design,
    status: ToolStatus.online,
  },
  {
    id: "json-parser",
    title: "JSON Decoder",
    description:
      "Format, validate and sanitize raw data streams from the network.",
    icon: Icons.FileJson,
    url: "https://jsonformatter.org/", // 外部链接示例
    type: ToolType.external,
    category: Category.Dev,
    status: ToolStatus.online,
  },
  {
    id: "color-matrix",
    title: "Palette Generator",
    description: "AI-driven color scheme generation for UI interfaces.",
    icon: Icons.Palette,
    url: "https://coolors.co/",
    type: ToolType.external,
    category: Category.Design,
    status: ToolStatus.online,
  },
  {
    id: "regex-tester",
    title: "RegEx Compiler",
    description: "Test and debug regular expressions in real-time.",
    icon: Icons.Terminal,
    url: "https://regex101.com/",
    type: ToolType.external,
    category: Category.Dev,
    status: ToolStatus.beta,
  },
  {
    id: "img-compressor",
    title: "Asset Compressor",
    description: "Reduce file size of visual assets without quality loss.",
    icon: Icons.Box,
    url: "https://squoosh.app/",
    type: ToolType.external,
    category: Category.Design,
    status: ToolStatus.online,
  },
] as ToolItem[];
