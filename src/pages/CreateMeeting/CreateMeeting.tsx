import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { createRoom } from "@/api/meeting.ts";
import { generateUUID } from "@/utils/uuid";

export default function Home() {
  const [title, setTitle] = useState("我的会议");
  const [inviteLink, setInviteLink] = useState("");

  async function handleCreate() {
    const userId = localStorage.getItem("userId") || generateUUID();

    localStorage.setItem("userId", userId);

    const data = await createRoom(title, userId);

    setInviteLink(location.origin + data.inviteLink);
  }

  return (
    <div className={"text-center pt-5"}>
      <h1 className={"text-2xl"}>在线会议系统</h1>

      <div className={"flex gap-2 px-4 w-1/2 m-auto mt-4"}>
        <Input
          placeholder="会议标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Button color={"secondary"} variant={"bordered"} onPress={handleCreate}>
          创建会议
        </Button>
      </div>

      {inviteLink && (
        <div style={{ marginTop: 16 }}>
          <h1 className={"text-2xl"}>邀请链接：</h1>
          <div className={"flex gap-2 px-4 w-1/2 m-auto mt-4"}>
            <Input readOnly style={{ width: 600 }} value={inviteLink} />
            <Button
              variant={"bordered"}
              color={"success"}
              onPress={() => (window.location.href = inviteLink)}
            >
              打开
            </Button>
            <Button onPress={() => navigator.clipboard.writeText(inviteLink)}>
              复制
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
