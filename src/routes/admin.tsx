import { Navigate } from "react-router-dom";
import { lazy } from "react";

import Auth from "@/components/auth";
import AdminLayout from "@/layouts/adminLayout.tsx";

const DashboardPage = lazy(() => import("@/pages/Admin/index.tsx"));
const ArticleManager = lazy(
  () => import("@/pages/Admin/ArticleManager/index.tsx"),
);
const AlbumManager = lazy(() => import("@/pages/Admin/AlbumManager/index.tsx"));
const ProfileManager = lazy(
  () => import("@/pages/Admin/ProfileManager/index.tsx"),
);
const CategoryManager = lazy(
  () => import("@/pages/Admin/CategoryManager/index.tsx"),
);
const TagManager = lazy(() => import("@/pages/Admin/TagManager/index.tsx"));

export default {
  path: "/admin",
  element: (
    <Auth>
      <AdminLayout />
    </Auth>
  ),
  children: [
    {
      path: "",
      element: <Navigate to="/admin/dashboard" />,
    },
    {
      path: "dashboard",
      element: <DashboardPage />,
    },
    {
      path: "article",
      element: <ArticleManager />,
    },
    {
      path: "tag",
      element: <TagManager />,
    },
    {
      path: "category",
      element: <CategoryManager />,
    },
    {
      path: "album",
      element: <AlbumManager />,
    },
    {
      path: "user",
      element: <ProfileManager />,
    },
    {
      path: "setting",
      element: <h1>系统设置</h1>,
    },
    {
      path: "*",
      element: <Navigate to="/admin/dashboard" />,
    },
  ],
};
