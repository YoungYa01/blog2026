import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Snippet } from "@heroui/snippet";

interface SubscriptionLinks {
  clash: string[];
  v2ray: string[];
  singbox: string[];
}

export default function ProxyPage() {
  const [links, setLinks] = useState<SubscriptionLinks | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [articleDate, setArticleDate] = useState<string>("");

  useEffect(() => {
    // 第一步：获取首页，提取最新文章链接
    fetch("https://vergeclash.github.io/")
      .then((res) => {
        if (!res.ok) throw new Error("首页请求失败");

        return res.text();
      })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // 首页文章列表按日期降序排列，最新文章在第一个 .xcblog-blog-item
        const firstItem = doc.querySelector(".xcblog-blog-item");

        if (!firstItem) throw new Error("未找到文章列表");

        const linkElement = firstItem.querySelector(".xcblog-blog-url");
        const href = linkElement?.getAttribute("href");

        if (!href) throw new Error("未找到文章链接");

        // 构造完整的文章 URL（首页链接为相对路径）
        const articleUrl = new URL(href, "https://vergeclash.github.io/").href;

        // 顺便获取文章日期（显示用）
        const dateStr = firstItem.getAttribute("data-date") || "";

        setArticleDate(dateStr);

        // 第二步：获取文章页面 HTML
        return fetch(articleUrl);
      })
      .then((res) => {
        if (!res.ok) throw new Error("文章页面请求失败");

        return res.text();
      })
      .then((articleHtml) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(articleHtml, "text/html");

        // 提取文章内容中所有以指定前缀开头的链接
        const paragraphs = doc.querySelectorAll(".xcblog-blog-detail p");
        const allUrls: string[] = [];

        paragraphs.forEach((p) => {
          const text = p.textContent?.trim();

          if (
            text &&
            text.startsWith("https://vergeclash.github.io/uploads/")
          ) {
            allUrls.push(text);
          }
        });

        // 按文件扩展名分类
        setLinks({
          clash: allUrls.filter((url) => url.endsWith(".yaml")),
          v2ray: allUrls.filter((url) => url.endsWith(".txt")),
          singbox: allUrls.filter((url) => url.endsWith(".json")),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg">正在获取最新订阅链接...</p>
      </div>
    );
  }

  // 出错
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">出错啦：{error}</p>
      </div>
    );
  }

  if (!links) return null;

  const groups: { title: string; links: string[] }[] = [
    { title: "Clash 订阅链接", links: links.clash },
    { title: "V2Ray 订阅链接", links: links.v2ray },
    { title: "Sing-Box 订阅链接", links: links.singbox },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-center">免费节点订阅</h1>

      {/* 纵向卡片，避免长链接溢出 */}
      <div className="flex flex-col gap-6 max-w-full md:max-w-3xl mx-auto">
        {articleDate && (
          <p className="text-gray-400 text-right">更新日期：{articleDate}</p>
        )}
        {groups.map((group, idx) => (
          <Card
            key={idx}
            className="bg-gray-900 border border-gray-700 text-white w-full"
          >
            <CardHeader className="text-lg font-semibold px-4 pt-4 pb-2">
              {group.title}
            </CardHeader>
            <CardBody className="flex flex-col gap-3 px-4 pb-4">
              {group.links.map((link, i) => (
                <Snippet
                  key={i}
                  className="bg-gray-800 hover:bg-gray-750 transition-colors w-full max-w-full"
                  classNames={{
                    base: "flex items-center justify-center overflow-hidden",
                    pre: "text-white break-all text-sm whitespace-normal flex-1 min-w-0",
                    copyButton: "text-gray-300 hover:text-white shrink-0 ml-2",
                  }}
                  codeString={link}
                  color="default"
                  symbol=""
                  variant="flat"
                >
                  {link}
                </Snippet>
              ))}
            </CardBody>
          </Card>
        ))}
        <div className={"text-right text-gray-400 text-xs"}>
          <a href="https://vergeclash.github.io/">特别鸣谢：Vergeclash</a>
        </div>
      </div>
    </div>
  );
}
