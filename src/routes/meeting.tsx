import { lazy } from "react";

const CreateMeetingPage = lazy(
  () => import("@/pages/CreateMeeting/CreateMeeting.tsx"),
);
const MeetingRoom = lazy(() => import("@/pages/MeetingRoom/MeetingRoom.tsx"));

export default {
  path: "/meeting",
  // element: <ToolLayout />,
  children: [
    {
      path: "",
      element: <CreateMeetingPage />,
    },
    {
      path: "room/:roomId",
      element: <MeetingRoom />,
    },
  ],
};
