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
      path: "/idphoto/home",
      element: <IDPhotoChangePage />,
    },
    {
      path: "/idphoto/history",
      element: <HistoryPage />,
    },
    {
      path: "/idphoto/make",
      element: <MakePage />,
    },
    {
      path: "/idphoto/profile",
      element: <ProfilePage />,
    },
    {
      path: "/idphoto/",
      element: <Navigate to="/idphoto/home" />,
    },
  ],
};
