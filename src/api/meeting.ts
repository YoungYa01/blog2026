const ENV_API_BASE = import.meta.env.VITE_API_BASE || "";
const ENV_WS_BASE = import.meta.env.VITE_WS_BASE || "";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const API_BASE = trimTrailingSlash(ENV_API_BASE);

export function getWsBase() {
  if (ENV_WS_BASE) {
    return trimTrailingSlash(ENV_WS_BASE);
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  // 开发环境：ws://192.168.x.x:5173/ws，由 Vite 代理到 Go
  // 生产环境：wss://meeting.example.com/ws，由 Nginx 代理到 Go
  return `${protocol}//${window.location.host}`;
}

export async function createRoom(title: string, creatorId: string) {
  const res = await fetch(`${API_BASE}/api/v1/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, creatorId }),
  });

  if (!res.ok) {
    throw new Error("创建会议失败");
  }

  return res.json();
}

export async function getRoom(roomId: string, token: string) {
  const res = await fetch(
    `${API_BASE}/api/v1/rooms/${roomId}?token=${encodeURIComponent(token)}`,
  );

  if (!res.ok) {
    throw new Error("会议不存在或邀请链接无效");
  }

  return res.json();
}

export async function saveMinutes(
  roomId: string,
  content: string,
  userId: string,
) {
  const res = await fetch(`${API_BASE}/api/v1/rooms/${roomId}/minutes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, userId }),
  });

  if (!res.ok) {
    throw new Error("保存会议纪要失败");
  }

  return res.json();
}

export async function getMinutes(roomId: string) {
  const res = await fetch(`${API_BASE}/api/v1/rooms/${roomId}/minutes`);

  if (!res.ok) {
    throw new Error("获取会议纪要失败");
  }

  return res.json();
}

export async function uploadRecordingChunk(
  roomId: string,
  sessionId: string,
  index: number,
  blob: Blob,
) {
  const form = new FormData();

  form.append("sessionId", sessionId);
  form.append("index", String(index));
  form.append("chunk", blob, `${String(index).padStart(6, "0")}.part`);

  const res = await fetch(`${API_BASE}/api/v1/rooms/${roomId}/recordings/chunks`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("上传录制分片失败");
  }

  return res.json();
}

export async function completeRecording(
  roomId: string,
  sessionId: string,
  userId: string,
  mimeType: string,
) {
  const res = await fetch(
    `${API_BASE}/api/v1/rooms/${roomId}/recordings/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, userId, mimeType }),
    },
  );

  if (!res.ok) {
    throw new Error("结束录制失败");
  }

  return res.json();
}
