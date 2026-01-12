import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { CHANNEL_RECEIVE_KEY, CHANNEL_SEND_KEY } from "@/utils/const.ts";

export default function AdminPage() {
  const [channel, setChannel] = useState<string>("");

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_SEND_KEY);

    channel.onmessage = (event) => {
      if (event.data === CHANNEL_SEND_KEY) {
        setChannel(event.data);
        channel.postMessage(CHANNEL_RECEIVE_KEY);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return (
    <div className={"text-center text-6xl"}>
      <h1>Admin Page</h1>
      {channel} <Outlet />
    </div>
  );
}
