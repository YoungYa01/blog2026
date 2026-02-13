import { Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";

import { Navbar } from "@/components/Navbar/index.tsx";
import { BackgroundBeamsWithCollision } from "@/components/BackgroundBeamsWithCollision";

export default function DefaultLayout() {
  const location = useLocation();
  const fullscreenRoutes = ["/excalidraw", "/xmind"];

  return (
    <BackgroundBeamsWithCollision className={"bg-black"}>
      <div className="dark relative flex flex-col min-h-screen">
        <Navbar />

        <main
          className={clsx(
            `container mx-auto px-6 flex-grow`,
            fullscreenRoutes.includes(location.pathname)
              ? "max-w-full pb-6"
              : "max-w-7xl pt-16",
          )}
        >
          <Outlet />
        </main>
        <footer
          className={clsx(
            "w-full text-xs flex items-center justify-center flex-col py-3",
            fullscreenRoutes.includes(location.pathname) ? "hidden" : "",
          )}
        >
          <div className={"flex text-center text-gray-500 gap-2"}>
            <span>
              Copyright © 2023-{new Date().getFullYear()} <a href="/album">YoungYa</a>{" "}
              <span id="update_time" />
            </span>
            <br />
            <span className={"text-blue-900"}>
              <a href="https://beian.miit.gov.cn/"> 蜀ICP备2023021028号-2 </a>
            </span>
          </div>
          <div className={"text-gray-500"}>
            {"Last Update at " +
              new Date(window.document.lastModified).toLocaleString()}
          </div>
        </footer>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
