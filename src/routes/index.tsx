import { Navigate, RouteObject } from "react-router-dom";
import { lazy } from "react";

import HomePage from "@/pages/Home";
import DefaultLayout from "@/layouts/default.tsx";
import ToolsRouter from "@/routes/tools.tsx";
import AdminRouter from "@/routes/admin.tsx";
import IDPhotoRouter from "@/routes/idphoto.tsx";
import MvCarCode from "@/routes/mv-car-code.tsx";
import Meeting from "@/routes/meeting.tsx";
import TestPage from "@/pages/Test/index.tsx";
import CollegeNoticePage from "@/pages/CollegeNotice/index.tsx";

const DocsPage = lazy(() => import("@/pages/Docs/index.tsx"));
const AlbumPage = lazy(() => import("@/pages/Album/index.tsx"));
const AboutPage = lazy(() => import("@/pages/About/index.tsx"));
const Login = lazy(() => import("@/pages/Auth/Login/index.tsx"));
const Register = lazy(() => import("@/pages/Auth/Register/index.tsx"));
const ProxyPage = lazy(() => import("@/pages/ProxyPage/ProxyPage.tsx"));

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
      {
        path: "test",
        element: <TestPage />,
      },
      {
        path: "college-notice",
        element: <CollegeNoticePage />,
      },
      {
        path: "proxy",
        element: <ProxyPage />,
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
  MvCarCode,
  Meeting,
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];
