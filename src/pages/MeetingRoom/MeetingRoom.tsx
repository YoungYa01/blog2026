import { useEffect, useMemo, useRef, useState } from "react";

import { styles } from "./styles.ts";

import {
  completeRecording,
  getMinutes,
  getRoom,
  getWsBase,
  saveMinutes,
  uploadRecordingChunk,
} from "@/api/meeting.ts";
import { generateUUID } from "@/utils/uuid";

type PeerInfo = {
  userId: string;
  name: string;
};

type LayoutMode = "speaker" | "gallery" | "content";

type SignalMessage = {
  type: string;
  from?: string;
  to?: string;
  roomId?: string;
  name?: string;
  peers?: PeerInfo[];
  payload?: any;
};

type VideoTile = {
  userId: string;
  name: string;
  stream: MediaStream;
  isLocal: boolean;
  isScreenShare?: boolean;
};

type RightPanel = "none" | "members" | "minutes";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
  iceCandidatePoolSize: 10,
};

const VIDEO_QUALITY = {
  camera: {
    width: 1920,
    height: 1080,
    frameRate: 30,
    maxBitrate: 6_000_000,
  },
  screen: {
    width: 2560,
    height: 1440,
    frameRate: 30,
    maxBitrate: 12_000_000,
  },
};

function getRoomIdFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  return decodeURIComponent(parts[parts.length - 1] || "");
}

function getTokenFromQuery() {
  return new URLSearchParams(window.location.search).get("token") || "";
}

function shortId(id: string) {
  return id ? id.slice(0, 8) : "";
}

function setTrackContentHint(
  track: MediaStreamTrack,
  hint: "motion" | "detail",
) {
  try {
    (track as MediaStreamTrack & { contentHint?: string }).contentHint = hint;
  } catch {
    // 某些浏览器可能不支持 contentHint，忽略即可。
  }
}

async function tuneVideoSender(
  sender: RTCRtpSender,
  mode: "camera" | "screen",
) {
  if (!sender.track || sender.track.kind !== "video") {
    return;
  }

  const quality = VIDEO_QUALITY[mode];

  const params = sender.getParameters() as RTCRtpSendParameters & {
    degradationPreference?: RTCDegradationPreference;
  };

  if (!params.encodings || params.encodings.length === 0) {
    params.encodings = [{}];
  }

  for (const encoding of params.encodings) {
    encoding.maxBitrate = quality.maxBitrate;
    encoding.maxFramerate = quality.frameRate;
    encoding.scaleResolutionDownBy = 1;
  }

  params.degradationPreference =
    mode === "screen" ? "maintain-resolution" : "balanced";

  try {
    await sender.setParameters(params);
  } catch (err) {
    console.warn("setParameters failed:", err);
  }
}

function pickRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return "";
}

async function requestLocalMedia() {
  if (!window.isSecureContext) {
    throw new Error(
      "当前页面不是安全上下文，无法使用摄像头和麦克风。局域网调试请使用 HTTPS，或在 Chrome/Edge flags 中把当前地址加入安全来源白名单。",
    );
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "当前浏览器环境不支持摄像头/麦克风访问。请检查是否使用 HTTPS，或是否已允许当前局域网地址作为安全来源。",
    );
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: { ideal: 2 },
      },
      video: {
        width: { ideal: VIDEO_QUALITY.camera.width },
        height: { ideal: VIDEO_QUALITY.camera.height },
        frameRate: {
          ideal: VIDEO_QUALITY.camera.frameRate,
          max: VIDEO_QUALITY.camera.frameRate,
        },
        aspectRatio: { ideal: 16 / 9 },
      },
    });

    const videoTrack = stream.getVideoTracks()[0];

    if (videoTrack) {
      setTrackContentHint(videoTrack, "motion");
      console.log("camera settings:", videoTrack.getSettings());
    }

    return stream;
  } catch (err: any) {
    console.error("getUserMedia failed:", err);

    if (err?.name === "NotAllowedError") {
      throw new Error(
        "摄像头或麦克风权限被拒绝。请在浏览器地址栏左侧权限设置中允许访问。",
      );
    }

    if (err?.name === "NotFoundError") {
      throw new Error("没有找到可用的摄像头或麦克风设备。");
    }

    if (err?.name === "NotReadableError") {
      throw new Error(
        "摄像头或麦克风正在被其他程序占用，请关闭 Zoom、腾讯会议、微信、OBS 等程序后重试。",
      );
    }

    throw new Error(err?.message || "获取摄像头/麦克风失败。");
  }
}

export default function MeetingRoom() {
  const roomId = getRoomIdFromPath();
  const token = getTokenFromQuery();

  const initialUserId = localStorage.getItem("userId") || generateUUID();
  const initialNickname =
    localStorage.getItem("nickname") || `用户-${shortId(initialUserId)}`;

  const userIdRef = useRef(initialUserId);
  const nameRef = useRef(initialNickname);

  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const pcMapRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const remoteStreamsRef = useRef<Record<string, MediaStream>>({});
  const participantNamesRef = useRef<Record<string, string>>({});
  const screenSharingUserIdRef = useRef<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingSessionIdRef = useRef("");
  const recordingIndexRef = useRef(0);
  const recordingUploadsRef = useRef<Promise<unknown>[]>([]);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<number | null>(null);

  const [layoutMode, setLayoutMode] = useState<LayoutMode>("speaker");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [roomTitle, setRoomTitle] = useState("我的会议");
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});

  const [participantNames, setParticipantNames] = useState<
    Record<string, string>
  >({});

  const [localDisplayStream, setLocalDisplayStream] =
    useState<MediaStream | null>(null);

  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [screenSharingUserId, setScreenSharingUserIdState] = useState<
    string | null
  >(null);

  const [rightPanel, setRightPanel] = useState<RightPanel>("none");

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [recording, setRecording] = useState(false);

  const [minutes, setMinutes] = useState("");

  function setScreenSharingUserId(userId: string | null) {
    screenSharingUserIdRef.current = userId;
    setScreenSharingUserIdState(userId);
  }

  function mergeParticipantNames(names: Record<string, string>) {
    setParticipantNames((prev) => {
      const next = {
        ...prev,
        ...names,
      };

      participantNamesRef.current = next;

      return next;
    });
  }

  function removeParticipantName(userId: string) {
    setParticipantNames((prev) => {
      const next = { ...prev };

      delete next[userId];

      participantNamesRef.current = next;

      return next;
    });
  }

  function getDisplayName(userId: string) {
    if (userId === userIdRef.current) {
      return "我";
    }

    return participantNamesRef.current[userId] || `用户-${shortId(userId)}`;
  }

  const allTiles = useMemo<VideoTile[]>(() => {
    const result: VideoTile[] = [];

    if (localDisplayStream) {
      result.push({
        userId: userIdRef.current,
        name: "我",
        stream: localDisplayStream,
        isLocal: true,
        isScreenShare: sharingScreen,
      });
    }

    for (const [peerId, stream] of Object.entries(remoteStreams)) {
      if (peerId === userIdRef.current) {
        continue;
      }

      result.push({
        userId: peerId,
        name: participantNames[peerId] || `用户-${shortId(peerId)}`,
        stream,
        isLocal: false,
        isScreenShare: screenSharingUserId === peerId,
      });
    }

    return result;
  }, [
    localDisplayStream,
    remoteStreams,
    participantNames,
    sharingScreen,
    screenSharingUserId,
  ]);

  const mainTile = useMemo(() => {
    if (pinnedUserId) {
      const selected = allTiles.find((tile) => tile.userId === pinnedUserId);

      if (selected) {
        return selected;
      }
    }

    if (screenSharingUserId) {
      const sharingTile = allTiles.find(
        (tile) => tile.userId === screenSharingUserId,
      );

      if (sharingTile) {
        return sharingTile;
      }
    }

    return (
      allTiles.find((tile) => !tile.isLocal) ||
      allTiles.find((tile) => tile.isLocal) ||
      null
    );
  }, [allTiles, pinnedUserId, screenSharingUserId]);

  function send(msg: SignalMessage) {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.send(JSON.stringify(msg));
  }

  function setRemoteStream(peerId: string, stream: MediaStream) {
    if (peerId === userIdRef.current) {
      return;
    }

    remoteStreamsRef.current = {
      ...remoteStreamsRef.current,
      [peerId]: stream,
    };

    setRemoteStreams(remoteStreamsRef.current);
  }

  function removePeer(peerId: string) {
    const pc = pcMapRef.current.get(peerId);

    if (pc) {
      pc.close();
    }

    pcMapRef.current.delete(peerId);
    pendingIceRef.current.delete(peerId);

    const nextStreams = { ...remoteStreamsRef.current };

    delete nextStreams[peerId];

    remoteStreamsRef.current = nextStreams;
    setRemoteStreams(nextStreams);

    removeParticipantName(peerId);

    setPinnedUserId((current) => {
      if (current === peerId) {
        return null;
      }

      return current;
    });

    if (screenSharingUserIdRef.current === peerId) {
      setScreenSharingUserId(null);
    }
  }

  function getOutgoingVideoTrack() {
    const screenTrack = screenStreamRef.current?.getVideoTracks()[0];

    if (screenTrack) {
      return {
        track: screenTrack,
        stream: screenStreamRef.current!,
        mode: "screen" as const,
      };
    }

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];

    if (cameraTrack && localStreamRef.current) {
      return {
        track: cameraTrack,
        stream: localStreamRef.current,
        mode: "camera" as const,
      };
    }

    return null;
  }

  function createPeerConnection(peerId: string) {
    if (peerId === userIdRef.current) {
      throw new Error("不能和自己建立 WebRTC 连接");
    }

    const existing = pcMapRef.current.get(peerId);

    if (existing && existing.connectionState !== "closed") {
      return existing;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);

    const localStream = localStreamRef.current;

    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    const outgoingVideo = getOutgoingVideoTrack();

    if (outgoingVideo) {
      const videoSender = pc.addTrack(
        outgoingVideo.track,
        outgoingVideo.stream,
      );

      void tuneVideoSender(videoSender, outgoingVideo.mode);
    }

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      send({
        type: "ice",
        to: peerId,
        payload: event.candidate.toJSON(),
      });
    };

    pc.ontrack = (event) => {
      if (peerId === userIdRef.current) {
        return;
      }

      const [stream] = event.streams;

      if (!stream) {
        return;
      }

      setRemoteStream(peerId, stream);
    };

    pc.onconnectionstatechange = () => {
      console.log(peerId, pc.connectionState);

      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        removePeer(peerId);
      }
    };

    pcMapRef.current.set(peerId, pc);

    return pc;
  }

  async function flushPendingIce(peerId: string) {
    const pc = pcMapRef.current.get(peerId);

    if (!pc || !pc.remoteDescription) {
      return;
    }

    const list = pendingIceRef.current.get(peerId) || [];

    for (const item of list) {
      await pc.addIceCandidate(new RTCIceCandidate(item));
    }

    pendingIceRef.current.delete(peerId);
  }

  async function handleSignal(msg: SignalMessage) {
    switch (msg.type) {
      case "peers": {
        const peers = (msg.peers || []).filter(
          (peer) => peer.userId !== userIdRef.current,
        );

        const names: Record<string, string> = {};

        for (const peer of peers) {
          names[peer.userId] = peer.name || `用户-${shortId(peer.userId)}`;
        }

        mergeParticipantNames(names);

        for (const peer of peers) {
          const pc = createPeerConnection(peer.userId);

          const offer = await pc.createOffer();

          await pc.setLocalDescription(offer);

          send({
            type: "offer",
            to: peer.userId,
            payload: offer,
          });
        }

        break;
      }

      case "user-joined": {
        if (!msg.from || msg.from === userIdRef.current) {
          return;
        }

        mergeParticipantNames({
          [msg.from]: msg.name || `用户-${shortId(msg.from)}`,
        });

        setNotice(`${msg.name || `用户-${shortId(msg.from)}`} 加入了会议`);
        break;
      }

      case "offer": {
        if (!msg.from || msg.from === userIdRef.current) {
          return;
        }

        mergeParticipantNames({
          [msg.from]:
            participantNamesRef.current[msg.from] ||
            `用户-${shortId(msg.from)}`,
        });

        const pc = createPeerConnection(msg.from);

        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        send({
          type: "answer",
          to: msg.from,
          payload: answer,
        });

        await flushPendingIce(msg.from);
        break;
      }

      case "answer": {
        if (!msg.from || msg.from === userIdRef.current) {
          return;
        }

        const pc = pcMapRef.current.get(msg.from);

        if (!pc) {
          return;
        }

        if (pc.signalingState === "stable") {
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
        await flushPendingIce(msg.from);
        break;
      }

      case "ice": {
        if (!msg.from || msg.from === userIdRef.current || !msg.payload) {
          return;
        }

        const pc =
          pcMapRef.current.get(msg.from) || createPeerConnection(msg.from);

        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
        } else {
          const list = pendingIceRef.current.get(msg.from) || [];

          list.push(msg.payload);
          pendingIceRef.current.set(msg.from, list);
        }

        break;
      }

      case "user-left": {
        if (!msg.from || msg.from === userIdRef.current) {
          return;
        }

        const displayName = getDisplayName(msg.from);

        removePeer(msg.from);
        setNotice(`${displayName} 离开了会议`);
        break;
      }

      case "screen-share-started": {
        if (!msg.from || msg.from === userIdRef.current) {
          return;
        }

        setScreenSharingUserId(msg.from);
        setPinnedUserId(msg.from);
        setNotice(`${getDisplayName(msg.from)} 正在共享屏幕`);
        break;
      }

      case "screen-share-stopped": {
        if (!msg.from || msg.from === userIdRef.current) {
          return;
        }

        if (screenSharingUserIdRef.current === msg.from) {
          setScreenSharingUserId(null);
        }

        setNotice(`${getDisplayName(msg.from)} 停止了屏幕共享`);
        break;
      }

      case "recording-started": {
        if (msg.from && msg.from !== userIdRef.current) {
          setNotice(`${getDisplayName(msg.from)} 开始录制`);
        }

        break;
      }

      case "recording-stopped": {
        if (msg.from && msg.from !== userIdRef.current) {
          setNotice(`${getDisplayName(msg.from)} 停止录制`);
        }

        break;
      }

      case "minutes-updated": {
        const data = await getMinutes(roomId);

        setMinutes(data.content || "");
        setNotice("会议纪要已更新");
        break;
      }

      default:
        break;
    }
  }

  async function connectWebSocket() {
    const wsBase = getWsBase();

    const url =
      `${wsBase}/rooms/ws/rooms/${roomId}` +
      `?token=${encodeURIComponent(token)}` +
      `&userId=${encodeURIComponent(userIdRef.current)}` +
      `&name=${encodeURIComponent(nameRef.current)}`;

    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(url);

      wsRef.current = ws;

      let settled = false;

      ws.onopen = () => {
        settled = true;
        resolve(ws);
      };

      ws.onerror = () => {
        if (!settled) {
          reject(new Error("WebSocket 连接失败"));
        }
      };

      ws.onmessage = (event) => {
        void (async () => {
          try {
            const msg = JSON.parse(event.data);

            await handleSignal(msg);
          } catch (err) {
            console.error("handle signal failed:", err);
          }
        })();
      };

      ws.onclose = () => {
        console.log("websocket closed");
      };
    });
  }

  function toggleMic() {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    const next = !micOn;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });

    setMicOn(next);
  }

  function toggleCamera() {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    const next = !camOn;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });

    setCamOn(next);
  }

  async function replaceOutgoingVideoTrack(
    track: MediaStreamTrack,
    mode: "camera" | "screen",
  ) {
    setTrackContentHint(track, mode === "screen" ? "detail" : "motion");

    const tasks: Promise<void>[] = [];

    for (const pc of pcMapRef.current.values()) {
      const sender = pc
        .getSenders()
        .find((item) => item.track?.kind === "video");

      if (sender) {
        tasks.push(
          sender.replaceTrack(track).then(() => tuneVideoSender(sender, mode)),
        );
      }
    }

    await Promise.all(tasks);
  }

  async function startScreenShare() {
    if (!window.isSecureContext) {
      alert(
        "当前页面不是安全上下文，无法共享屏幕。请使用 HTTPS，或把当前局域网地址加入 Chrome/Edge 安全来源白名单。",
      );

      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert("当前浏览器不支持屏幕共享，或当前访问地址不是安全来源。");

      return;
    }

    let screenStream: MediaStream;

    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: VIDEO_QUALITY.screen.width },
          height: { ideal: VIDEO_QUALITY.screen.height },
          frameRate: {
            ideal: VIDEO_QUALITY.screen.frameRate,
            max: VIDEO_QUALITY.screen.frameRate,
          },
          cursor: "always",
        } as MediaTrackConstraints,
        audio: false,
      });
    } catch (err: any) {
      console.error("getDisplayMedia failed:", err);

      if (err?.name === "NotAllowedError") {
        alert("屏幕共享权限被拒绝。请允许浏览器进行屏幕录制/屏幕共享。");

        return;
      }

      alert(err?.message || "屏幕共享失败。");

      return;
    }

    const screenTrack = screenStream.getVideoTracks()[0];

    if (!screenTrack) {
      alert("没有获取到屏幕视频轨道。");

      return;
    }

    setTrackContentHint(screenTrack, "detail");
    console.log("screen settings:", screenTrack.getSettings());

    screenStreamRef.current = screenStream;

    await replaceOutgoingVideoTrack(screenTrack, "screen");

    setLocalDisplayStream(screenStream);
    setSharingScreen(true);
    setScreenSharingUserId(userIdRef.current);
    setPinnedUserId(userIdRef.current);

    send({
      type: "screen-share-started",
    });

    screenTrack.onended = () => {
      void stopScreenShare();
    };
  }

  async function stopScreenShare() {
    const localStream = localStreamRef.current;

    if (!localStream) {
      return;
    }

    const cameraTrack = localStream.getVideoTracks()[0];

    if (cameraTrack) {
      await replaceOutgoingVideoTrack(cameraTrack, "camera");
    }

    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    setLocalDisplayStream(localStream);
    setSharingScreen(false);

    if (screenSharingUserIdRef.current === userIdRef.current) {
      setScreenSharingUserId(null);
    }

    send({
      type: "screen-share-stopped",
    });
  }

  function buildRecordingStream() {
    const stream = new MediaStream();

    localStreamRef.current?.getAudioTracks().forEach((track) => {
      stream.addTrack(track);
    });

    Object.values(remoteStreamsRef.current).forEach((remote) => {
      remote.getAudioTracks().forEach((track) => {
        stream.addTrack(track);
      });
    });

    const videoTrack =
      screenStreamRef.current?.getVideoTracks()[0] ||
      localStreamRef.current?.getVideoTracks()[0];

    if (videoTrack) {
      stream.addTrack(videoTrack);
    }

    if (stream.getTracks().length === 0) {
      throw new Error("没有可录制的音视频轨道。");
    }

    return stream;
  }

  async function startRecording() {
    if (typeof MediaRecorder === "undefined") {
      alert("当前浏览器不支持 MediaRecorder，无法录制。");

      return;
    }

    let stream: MediaStream;

    try {
      stream = buildRecordingStream();
    } catch (err: any) {
      alert(err?.message || "创建录制流失败。");

      return;
    }

    const mimeType = pickRecordingMimeType();
    const isRecordingScreen = Boolean(screenStreamRef.current);

    const recorderOptions: MediaRecorderOptions = {
      videoBitsPerSecond: isRecordingScreen ? 12_000_000 : 6_000_000,
      audioBitsPerSecond: 160_000,
    };

    if (mimeType) {
      recorderOptions.mimeType = mimeType;
    }

    const recorder = new MediaRecorder(stream, recorderOptions);

    recordingSessionIdRef.current = generateUUID();
    recordingIndexRef.current = 0;
    recordingUploadsRef.current = [];

    recorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) {
        return;
      }

      const index = recordingIndexRef.current++;

      const task = uploadRecordingChunk(
        roomId,
        recordingSessionIdRef.current,
        index,
        event.data,
      ).catch((err) => {
        console.error("upload recording chunk failed:", err);
      });

      recordingUploadsRef.current.push(task);
    };

    recorder.onstop = () => {
      void (async () => {
        await Promise.allSettled(recordingUploadsRef.current);

        await completeRecording(
          roomId,
          recordingSessionIdRef.current,
          userIdRef.current,
          recorder.mimeType,
        );

        send({
          type: "recording-stopped",
        });

        setRecording(false);
        setNotice("录制已停止");
      })();
    };

    recorderRef.current = recorder;

    recorder.start(5000);

    setRecording(true);
    setNotice("正在录制");

    send({
      type: "recording-started",
    });
  }

  function stopRecording() {
    const recorder = recorderRef.current;

    if (!recorder) {
      return;
    }

    if (recorder.state !== "inactive") {
      recorder.stop();
    }

    recorderRef.current = null;
  }

  async function handleSaveMinutes() {
    try {
      await saveMinutes(roomId, minutes, userIdRef.current);

      send({
        type: "minutes-updated",
      });

      setNotice("会议纪要已保存");
    } catch (err) {
      console.error(err);
      alert("保存会议纪要失败");
    }
  }

  async function copyInviteLink() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setNotice("邀请链接已复制");
      } else {
        window.prompt("复制邀请链接", window.location.href);
      }
    } catch {
      window.prompt("复制邀请链接", window.location.href);
    }
  }

  function revealControls() {
    setControlsVisible(true);

    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }

    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2800);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await pageRef.current?.requestFullscreen({
          navigationUI: "hide",
        } as FullscreenOptions);
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("toggle fullscreen failed:", err);
      alert("无法进入全屏模式，请检查浏览器权限。");
    }
  }

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    revealControls();

    return () => {
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotice("");
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notice]);

  useEffect(() => {
    let cancelled = false;

    localStorage.setItem("userId", userIdRef.current);

    if (!localStorage.getItem("nickname")) {
      localStorage.setItem("nickname", nameRef.current);
    }

    async function bootstrap() {
      try {
        if (!roomId || !token) {
          throw new Error("会议链接不完整，缺少 roomId 或 token。");
        }

        const room = await getRoom(roomId, token);

        if (cancelled) {
          return;
        }

        setRoomTitle(room.title || "我的会议");

        try {
          const savedMinutes = await getMinutes(roomId);

          if (!cancelled) {
            setMinutes(savedMinutes.content || "");
          }
        } catch (err) {
          console.warn("get minutes failed:", err);
        }

        const localStream = await requestLocalMedia();

        if (cancelled) {
          localStream.getTracks().forEach((track) => track.stop());

          return;
        }

        localStreamRef.current = localStream;
        setLocalDisplayStream(localStream);

        await connectWebSocket();
      } catch (err: any) {
        console.error(err);

        if (!cancelled) {
          setPageError(err?.message || "进入会议失败");
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;

      try {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      } catch {
        // ignore
      }

      wsRef.current?.close();

      pcMapRef.current.forEach((pc) => {
        pc.close();
      });
      pcMapRef.current.clear();

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());

      remoteStreamsRef.current = {};
    };
  }, []);

  // const mainGridStyle: CSSProperties = {
  //   ...styles.mainGrid,
  //   gridTemplateColumns:
  //     rightPanel === "none" ? "minmax(0, 1fr)" : "minmax(0, 1fr) 360px",
  // };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={pageRef}
      style={styles.immersivePage}
      onClick={revealControls}
      onMouseMove={revealControls}
    >
      <main style={styles.immersiveStage}>
        {layoutMode === "gallery" ? (
          <div style={styles.galleryGrid}>
            {allTiles.map((tile) => (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div
                key={tile.userId}
                style={styles.galleryCard}
                onClick={() => {
                  setPinnedUserId(tile.userId);
                  setLayoutMode("speaker");
                }}
              >
                <StreamPlayer muted={tile.isLocal} stream={tile.stream} />

                <div style={styles.tileNameBadge}>
                  {tile.name}
                  {tile.isScreenShare ? " · 屏幕共享" : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.mainVideoLayer}>
            {mainTile ? (
              <>
                <StreamPlayer
                  muted={mainTile.isLocal}
                  stream={mainTile.stream}
                />

                <div style={styles.mainNameBadge}>
                  <span>
                    {mainTile.name}
                    {mainTile.isScreenShare ? " 正在共享屏幕" : ""}
                  </span>
                  <span style={styles.mainQualityBadge}>
                    {mainTile.isScreenShare ? "屏幕高清" : "主讲人"}
                  </span>
                </div>
              </>
            ) : (
              <div style={styles.emptyVideo}>暂无视频画面</div>
            )}
          </div>
        )}

        {/* 顶部悬浮信息栏 */}
        <div
          style={{
            ...styles.topFloatingBar,
            opacity: controlsVisible ? 1 : 0,
            pointerEvents: controlsVisible ? "auto" : "none",
          }}
        >
          <div style={styles.roomTitleBlock}>
            <div style={styles.roomTitle}>{roomTitle}</div>
            <div style={styles.roomMeta}>
              {nameRef.current} · {allTiles.length} 人参会
            </div>
          </div>

          <div style={styles.topFloatingActions}>
            <button
              style={{
                ...styles.modeButton,
                ...(layoutMode === "speaker" ? styles.activeModeButton : {}),
              }}
              onClick={() => setLayoutMode("speaker")}
            >
              主讲人
            </button>

            <button
              style={{
                ...styles.modeButton,
                ...(layoutMode === "gallery" ? styles.activeModeButton : {}),
              }}
              onClick={() => setLayoutMode("gallery")}
            >
              宫格
            </button>

            <button
              style={{
                ...styles.modeButton,
                ...(layoutMode === "content" ? styles.activeModeButton : {}),
              }}
              onClick={() => setLayoutMode("content")}
            >
              纯内容
            </button>

            <button style={styles.modeButton} onClick={toggleFullscreen}>
              {isFullscreen ? "退出全屏" : "全屏"}
            </button>

            <button style={styles.modeButton} onClick={copyInviteLink}>
              邀请
            </button>

            <button
              style={{
                ...styles.modeButton,
                ...(rightPanel === "members" ? styles.activeModeButton : {}),
              }}
              onClick={() =>
                setRightPanel((current) =>
                  current === "members" ? "none" : "members",
                )
              }
            >
              成员
            </button>

            <button
              style={{
                ...styles.modeButton,
                ...(rightPanel === "minutes" ? styles.activeModeButton : {}),
              }}
              onClick={() =>
                setRightPanel((current) =>
                  current === "minutes" ? "none" : "minutes",
                )
              }
            >
              纪要
            </button>
          </div>
        </div>

        {/* 观众缩略图，纯内容模式下隐藏 */}
        {layoutMode !== "content" && (
          <div
            style={{
              ...styles.floatingFilmstrip,
              opacity: controlsVisible ? 1 : 0,
              pointerEvents: controlsVisible ? "auto" : "none",
            }}
          >
            {allTiles.map((tile) => {
              const active = mainTile?.userId === tile.userId;

              return (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                  key={tile.userId}
                  style={{
                    ...styles.floatingThumb,
                    ...(active ? styles.activeFloatingThumb : {}),
                  }}
                  onClick={() => {
                    setPinnedUserId(tile.userId);
                    setLayoutMode("speaker");
                  }}
                >
                  <div style={styles.floatingThumbVideo}>
                    <StreamPlayer muted={tile.isLocal} stream={tile.stream} />
                  </div>

                  <div style={styles.floatingThumbName}>
                    {tile.name}
                    {tile.isScreenShare ? " · 屏幕" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部悬浮控制栏 */}
        <div
          style={{
            ...styles.floatingControls,
            opacity: controlsVisible ? 1 : 0,
            pointerEvents: controlsVisible ? "auto" : "none",
          }}
        >
          <button
            style={{
              ...styles.controlButton,
              ...(!micOn ? styles.offControlButton : {}),
            }}
            onClick={toggleMic}
          >
            {micOn ? "静音" : "取消静音"}
          </button>

          <button
            style={{
              ...styles.controlButton,
              ...(!camOn ? styles.offControlButton : {}),
            }}
            onClick={toggleCamera}
          >
            {camOn ? "关闭视频" : "开启视频"}
          </button>

          <button
            style={{
              ...styles.controlButton,
              ...(sharingScreen ? styles.primaryControlButton : {}),
            }}
            onClick={() => {
              if (sharingScreen) {
                void stopScreenShare();
              } else {
                void startScreenShare();
              }
            }}
          >
            {sharingScreen ? "停止共享" : "共享屏幕"}
          </button>

          <button
            style={{
              ...styles.controlButton,
              ...(recording ? styles.dangerControlButton : {}),
            }}
            onClick={() => {
              if (recording) {
                stopRecording();
              } else {
                void startRecording();
              }
            }}
          >
            {recording ? "停止录制" : "录制"}
          </button>

          <button
            style={styles.controlButton}
            onClick={() => {
              setPinnedUserId(null);
              setLayoutMode("speaker");
            }}
          >
            恢复主讲
          </button>
        </div>

        {/* 成员 / 纪要右侧抽屉 */}
        {rightPanel !== "none" && (
          <aside style={styles.popupDrawer}>
            {rightPanel === "members" && (
              <>
                <div style={styles.drawerHeader}>
                  <h2 style={styles.drawerTitle}>参会成员</h2>
                  <button
                    style={styles.drawerCloseButton}
                    onClick={() => setRightPanel("none")}
                  >
                    ×
                  </button>
                </div>

                <div style={styles.memberList}>
                  {allTiles.map((tile) => (
                    <div key={tile.userId} style={styles.memberItem}>
                      <div>
                        <div style={styles.memberName}>
                          {tile.name}
                          {tile.isLocal ? "（我）" : ""}
                        </div>

                        <div style={styles.memberMeta}>
                          {tile.isScreenShare ? "正在共享屏幕" : "在线"}
                        </div>
                      </div>

                      <button
                        style={styles.drawerSmallButton}
                        onClick={() => {
                          setPinnedUserId(tile.userId);
                          setLayoutMode("speaker");
                        }}
                      >
                        设为主屏
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {rightPanel === "minutes" && (
              <>
                <div style={styles.drawerHeader}>
                  <h2 style={styles.drawerTitle}>会议纪要</h2>
                  <button
                    style={styles.drawerCloseButton}
                    onClick={() => setRightPanel("none")}
                  >
                    ×
                  </button>
                </div>

                <textarea
                  placeholder="记录会议议题、结论、待办事项..."
                  style={styles.minutesTextarea}
                  value={minutes}
                  onChange={(event) => setMinutes(event.target.value)}
                />

                <button style={styles.saveButton} onClick={handleSaveMinutes}>
                  保存会议纪要
                </button>
              </>
            )}
          </aside>
        )}

        {notice && <div style={styles.noticeBox}>{notice}</div>}

        {pageError && <div style={styles.errorBox}>{pageError}</div>}
      </main>
    </div>
  );
}

function StreamPlayer({
  stream,
  muted = false,
}: {
  stream: MediaStream | null;
  muted?: boolean;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video ref={ref} autoPlay playsInline muted={muted} style={styles.video} />
  );
}
