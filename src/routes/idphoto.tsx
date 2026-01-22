import { Navigate } from "react-router-dom";
import { lazy } from "react";

import IDPhotoChangePage from "@/pages/IDPhotoChange";

const HistoryPage = lazy(() => import("@/pages/IDPhotoChange/history"));
const MakePage = lazy(() => import("@/pages/IDPhotoChange/make"));
const ProfilePage = lazy(() => import("@/pages/IDPhotoChange/profile"));

export default {
  path: "/idphoto",
  children: [
    {
      path: "home",
      element: <IDPhotoChangePage />,
    },
    {
      path: "history",
      element: <HistoryPage />,
    },
    {
      path: "make",
      element: <MakePage />,
    },
    {
      path: "profile",
      element: <ProfilePage />,
    },
    {
      path: "*",
      element: <Navigate to="/idphoto/home" />,
    },
  ],
};
