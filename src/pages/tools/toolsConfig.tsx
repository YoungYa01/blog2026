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
    id: "Qwerty Learner",
    title: "为键盘工作者设计的单词与肌肉记忆锻炼软件",
    description: "一个用于学习键盘工作者的键盘训练软件",
    icon: Icons.Keyboard,
    url: "https://qwerty.kaiyi.cool",
    type: ToolType.external,
    category: Category.Productivity,
    status: ToolStatus.online,
  },
  {
    id: "科研废物导航",
    title: "科研废物导航！",
    description: "一个用于搜索科研废物的导航网站",
    icon: Icons.FileText,
    url: "https://www.yanweb.top/",
    type: ToolType.external,
    category: Category.Productivity,
    status: ToolStatus.online,
  },
  {
    id: "TeXHub",
    title: "TeXHub",
    description:
      "从基础到高级，发掘全面的 LaTeX 学习资源，提升您的学术写作技能",
    icon: Icons.HammerIcon,
    url: "https://www.texhub.com/tutorials",
    type: ToolType.external,
    category: Category.Productivity,
    status: ToolStatus.online,
  },
  {
    id: "一元机场",
    title: "一元机场",
    description: "一元机场",
    icon: Icons.Airplay,
    url: "https://xn--4gq62f52gdss.ink/#/register?code=66nVmMOs",
    type: ToolType.external,
    category: Category.System,
    status: ToolStatus.online,
  },
  {
    id: "Napkin",
    title: "Napkin",
    description:
      "Napkin is a free AI-powered tool for sketching and designing.",
    icon: Icons.HammerIcon,
    url: "https://www.napkin.ai/",
    type: ToolType.external,
    category: Category.Dev,
    status: ToolStatus.online,
  },
  {
    id: "smithery",
    title: "Smithery",
    description: "Smithery is a tool for sketching and designing.",
    icon: Icons.PenTool,
    url: "https://smithery.ai/",
    type: ToolType.external,
    category: Category.Dev,
    status: ToolStatus.online,
  },
  {
    id: "firecrawl",
    title: "Firecrawl",
    description: "Firecrawl is a free tool for crawling and scraping websites.",
    icon: Icons.FireExtinguisher,
    url: "https://www.firecrawl.dev/",
    type: ToolType.external,
    category: Category.Dev,
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
