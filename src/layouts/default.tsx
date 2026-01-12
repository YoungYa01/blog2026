import { Link } from "@heroui/link";
import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/Navbar/index.tsx";
import CleanStarfall from "@/components/CleanStarfall";

export default function DefaultLayout() {
  return (
    <div className="dark relative flex flex-col h-screen">
      <Navbar />

      <CleanStarfall />

      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        <Outlet />
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://heroui.com"
          title="heroui.com homepage"
        >
          <span className="text-default-600">
            Copyright © 2023. All rights reserved.Powered by
          </span>
          <p className="text-primary">YoungYa</p>
        </Link>
      </footer>
    </div>
  );
}
