import { Navigate, RouteObject } from "react-router-dom";
import { lazy } from "react";

import HomePage from "@/pages/Home";
import DefaultLayout from "@/layouts/default.tsx";
import AdminLayout from "@/layouts/adminLayout.tsx";
import Auth from "@/components/auth";

const DocsPage = lazy(() => import("@/pages/Docs/index.tsx"));
const PricingPage = lazy(() => import("@/pages/Pricing/index.tsx"));
const BlogPage = lazy(() => import("@/pages/Blog/index.tsx"));
const AboutPage = lazy(() => import("@/pages/About/index.tsx"));
const DashboardPage = lazy(() => import("@/pages/Admin/index.tsx"));
const Login = lazy(() => import("@/pages/Auth/Login/index.tsx"));
const Register = lazy(() => import("@/pages/Auth/Register/index.tsx"));
const ArticleManager = lazy(() => import("@/pages/Admin/ArticleManager/index.tsx"));

// 定义路由表
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "docs",
        element: <DocsPage />,
      },
      {
        path: "pricing",
        element: <PricingPage />,
      },
      {
        path: "blog",
        element: <BlogPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
    ],
  },
  {
    path: "/auth",
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Register />,
      },
    ],
  },
  {
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
        element: <ArticleManager/>,
      },
      {
        path: "tag",
        element: <h1>标签</h1>,
      },
      {
        path: "category",
        element: <h1>分类</h1>,
      },
      {
        path: "album",
        element: <h1>图集</h1>,
      },
      {
        path: "user",
        element: <h1>个人中心</h1>,
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
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];
