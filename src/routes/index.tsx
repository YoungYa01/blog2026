import { Navigate, RouteObject } from "react-router-dom";
import { lazy } from "react";

import HomePage from "@/pages/Home";
import DefaultLayout from "@/layouts/default.tsx";
import ToolsRouter from "@/routes/tools.tsx";
import AdminRouter from "@/routes/admin.tsx";
import IDPhotoRouter from "@/routes/idphoto.tsx";

const DocsPage = lazy(() => import("@/pages/Docs/index.tsx"));
const AlbumPage = lazy(() => import("@/pages/Album/index.tsx"));
const AboutPage = lazy(() => import("@/pages/About/index.tsx"));
const Login = lazy(() => import("@/pages/Auth/Login/index.tsx"));
const Register = lazy(() => import("@/pages/Auth/Register/index.tsx"));

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
        path: "album",
        element: <AlbumPage />,
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
  AdminRouter,
  IDPhotoRouter,
  ToolsRouter,
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];
