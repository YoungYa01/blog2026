import { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
  immersivePage: {
    width: "100vw",
    height: "100vh",
    background: "#000",
    color: "#f9fafb",
    overflow: "hidden",
  },

  immersiveStage: {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "#000",
    overflow: "hidden",
  },

  mainVideoLayer: {
    position: "absolute",
    inset: 0,
    background: "#000",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: "#000",
    display: "block",
  },

  emptyVideo: {
    width: "100%",
    height: "100%",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  mainNameBadge: {
    position: "absolute",
    left: 20,
    top: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.52)",
    backdropFilter: "blur(10px)",
    fontSize: 15,
    fontWeight: 700,
  },

  mainQualityBadge: {
    fontSize: 12,
    fontWeight: 500,
    color: "#bfdbfe",
    background: "rgba(37,99,235,0.36)",
    border: "1px solid rgba(96,165,250,0.45)",
    borderRadius: 999,
    padding: "2px 8px",
  },

  topFloatingBar: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    transition: "opacity 180ms ease",
  },

  roomTitleBlock: {
    minWidth: 0,
    padding: "8px 12px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.42)",
    backdropFilter: "blur(10px)",
  },

  roomTitle: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  roomMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#cbd5e1",
  },

  topFloatingActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  modeButton: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(17,24,39,0.72)",
    color: "#f9fafb",
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 13,
    backdropFilter: "blur(10px)",
  },

  activeModeButton: {
    background: "#2563eb",
    borderColor: "#2563eb",
  },

  galleryGrid: {
    position: "absolute",
    inset: 0,
    padding: "78px 16px 104px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gridAutoRows: "minmax(220px, 1fr)",
    gap: 12,
    background: "#020617",
  },

  galleryCard: {
    position: "relative",
    background: "#000",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    overflow: "hidden",
    cursor: "pointer",
  },

  tileNameBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(8px)",
    fontSize: 13,
  },

  floatingFilmstrip: {
    position: "absolute",
    left: "50%",
    bottom: 92,
    transform: "translateX(-50%)",
    zIndex: 18,
    maxWidth: "calc(100vw - 40px)",
    display: "flex",
    gap: 10,
    overflowX: "auto",
    padding: 8,
    borderRadius: 16,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
    transition: "opacity 180ms ease",
  },

  floatingThumb: {
    width: 190,
    flex: "0 0 190px",
    borderRadius: 12,
    padding: 5,
    background: "rgba(17,24,39,0.86)",
    border: "1px solid rgba(255,255,255,0.16)",
    cursor: "pointer",
  },

  activeFloatingThumb: {
    border: "2px solid #3b82f6",
  },

  floatingThumbVideo: {
    width: "100%",
    height: 102,
    borderRadius: 8,
    overflow: "hidden",
    background: "#000",
  },

  floatingThumbName: {
    marginTop: 5,
    fontSize: 12,
    color: "#e5e7eb",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  floatingControls: {
    position: "absolute",
    left: "50%",
    bottom: 22,
    transform: "translateX(-50%)",
    zIndex: 25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.48)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    transition: "opacity 180ms ease",
  },

  controlButton: {
    minWidth: 82,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(31,41,55,0.92)",
    color: "#fff",
    borderRadius: 999,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 14,
  },

  primaryControlButton: {
    background: "#2563eb",
    borderColor: "#2563eb",
  },

  dangerControlButton: {
    background: "#dc2626",
    borderColor: "#dc2626",
  },

  offControlButton: {
    background: "#4b5563",
  },

  popupDrawer: {
    position: "absolute",
    top: 72,
    right: 16,
    bottom: 96,
    zIndex: 30,
    width: 380,
    maxWidth: "calc(100vw - 32px)",
    borderRadius: 18,
    background: "rgba(17,24,39,0.94)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.45)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  drawerHeader: {
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  drawerTitle: {
    margin: 0,
    fontSize: 18,
  },

  drawerCloseButton: {
    width: 32,
    height: 32,
    border: "none",
    borderRadius: 10,
    background: "rgba(31,41,55,0.96)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 22,
    lineHeight: "32px",
  },

  memberList: {
    flex: "1 1 auto",
    overflowY: "auto",
  },

  memberItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.09)",
  },

  memberName: {
    fontSize: 14,
    fontWeight: 700,
  },

  memberMeta: {
    marginTop: 4,
    color: "#9ca3af",
    fontSize: 12,
  },

  drawerSmallButton: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: "#1f2937",
    color: "#fff",
    borderRadius: 8,
    padding: "6px 9px",
    cursor: "pointer",
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  minutesTextarea: {
    flex: "1 1 auto",
    minHeight: 0,
    width: "100%",
    resize: "none",
    background: "rgba(2,6,23,0.96)",
    color: "#f9fafb",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
    outline: "none",
    lineHeight: 1.6,
  },

  saveButton: {
    flex: "0 0 auto",
    marginTop: 12,
    width: "100%",
    border: "none",
    borderRadius: 10,
    background: "#2563eb",
    color: "#fff",
    padding: "11px 12px",
    cursor: "pointer",
  },

  noticeBox: {
    position: "absolute",
    left: "50%",
    top: 76,
    transform: "translateX(-50%)",
    zIndex: 40,
    background: "rgba(37,99,235,0.94)",
    color: "#fff",
    borderRadius: 999,
    padding: "8px 16px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.36)",
  },

  errorBox: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 76,
    zIndex: 45,
    background: "#7f1d1d",
    color: "#fecaca",
    border: "1px solid #ef4444",
    borderRadius: 12,
    padding: 12,
  },
};
