import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Smartphone,
  Globe,
  Key,
  Edit3,
  Camera,
  Zap,
  Activity,
  AlertTriangle,
  Terminal,
  Fingerprint,
  Save,
  LogOut,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Switch } from "@heroui/switch";

// --- 模拟用户数据 ---
const MOCK_USER = {
  name: "Neo Anderson",
  handle: "@the_one",
  email: "neo@matrix.net",
  role: "SYS_ADMIN",
  level: 99,
  bio: "Wake up, Neo. The Matrix has you.",
  avatar: "https://i.pravatar.cc/300?u=a042581f4e29026704d",
  securityScore: 85,
  joinedDate: "2099-01-01",
  twoFactor: true,
};

const ACTIVITY_LOGS = [
  {
    id: 1,
    action: "LOGIN_SUCCESS",
    ip: "192.168.X.X",
    time: "2 mins ago",
    device: "Neural Interface V.2",
  },
  {
    id: 2,
    action: "DATA_UPLOAD",
    ip: "192.168.X.X",
    time: "4 hours ago",
    device: "Mainframe Terminal",
  },
  {
    id: 3,
    action: "PASSWORD_CHANGE",
    ip: "10.0.0.1",
    time: "2 days ago",
    device: "Mobile Uplink",
  },
];

// --- 组件：3D 身份卡片 (Identity Card) ---
const IdentityCard = ({ user }: { user: typeof MOCK_USER }) => {
  return (
    <motion.div
      className="relative w-full aspect-[3/4] md:aspect-auto md:h-full bg-gradient-to-br from-black/60 to-content1/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-8 flex flex-col items-center shadow-2xl group"
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
    >
      {/* 顶部装饰 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
      <div className="absolute top-4 right-4 text-[10px] font-mono text-cyan-500 border border-cyan-500/30 px-2 py-0.5 rounded">
        ID: 992-ALPHA
      </div>

      {/* 头像区 */}
      <div className="relative mt-8 mb-6">
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative p-1 rounded-full border-2 border-dashed border-cyan-500/50 group-hover:border-cyan-400 transition-colors">
          <Avatar
            isBordered
            className="w-32 h-32 text-large"
            color="primary"
            src={user.avatar}
          />
        </div>
        <Button
          isIconOnly
          className="absolute bottom-0 right-0 bg-content1 border border-white/20 text-cyan-400 shadow-lg"
          size="sm"
        >
          <Camera size={14} />
        </Button>
      </div>

      {/* 信息区 */}
      <div className="text-center space-y-2 z-10">
        <h2 className="text-2xl font-bold text-white tracking-wider">
          {user.name}
        </h2>
        <p className="text-sm text-default-400 font-mono">{user.handle}</p>
        <Chip
          classNames={{ base: "border-white/10 bg-white/5 mt-2" }}
          color="secondary"
          size="sm"
          variant="dot"
        >
          {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
          LEVEL {user.level} // {user.role}
        </Chip>
      </div>

      {/* 底部生物特征装饰 */}
      <div className="mt-auto w-full pt-8 border-t border-white/5">
        <div className="flex justify-between text-xs text-default-400 font-mono mb-2">
          <span>SYNC STATUS</span>
          <span className="text-success">ONLINE</span>
        </div>
        <Progress
          isIndeterminate // 模拟数据传输动画
          classNames={{ track: "bg-white/5" }}
          color="success"
          size="sm"
          value={100}
        />
        <div className="mt-4 flex justify-center opacity-30">
          <Fingerprint className="text-cyan-500" size={48} />
        </div>
      </div>

      {/* 扫描线特效 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none translate-y-[-100%] group-hover:animate-[scan_2s_linear_infinite]" />
    </motion.div>
  );
};

// --- 组件：安全防火墙面板 ---
const SecurityShield = ({ score }: { score: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <Card className="bg-success/10 border border-success/20">
      <CardBody className="flex flex-row items-center gap-4">
        <div className="p-3 rounded-full bg-success/20 text-success">
          <Shield size={24} />
        </div>
        <div>
          <p className="text-xs text-success/80 font-mono">SHIELD STATUS</p>
          <p className="text-lg font-bold text-success">ACTIVE</p>
        </div>
      </CardBody>
    </Card>
    <Card className="bg-content1/50 border border-white/5">
      <CardBody className="flex flex-row items-center gap-4">
        <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
          <Key size={24} />
        </div>
        <div>
          <p className="text-xs text-default-400 font-mono">AUTH METHOD</p>
          <p className="text-lg font-bold">{score} 2FA ENABLED</p>
        </div>
      </CardBody>
    </Card>
    <Card className="bg-content1/50 border border-white/5">
      <CardBody className="flex flex-row items-center gap-4">
        <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
          <Zap size={24} />
        </div>
        <div>
          <p className="text-xs text-default-400 font-mono">THREAT LEVEL</p>
          <p className="text-lg font-bold">ZERO</p>
        </div>
      </CardBody>
    </Card>
  </div>
);

// --- 主组件 ---
export const ProfileManager = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "security">(
    "overview",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="w-full min-h-screen p-6 pb-24 relative overflow-hidden">
      {/* 顶部标题 */}
      <div className="flex items-center gap-3 mb-8">
        <User className="text-cyan-400" size={28} />
        <div>
          <h1 className="text-2xl font-bold tracking-wide">IDENTITY CORE</h1>
          {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
          <p className="text-xs text-default-400 font-mono">
            // MANAGE PERSONAL PARAMETERS
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 左侧：固定身份卡 */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <IdentityCard user={MOCK_USER} />

          {/* 快速注销 */}
          <Button
            className="w-full mt-6 bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 font-mono"
            startContent={<LogOut size={16} />}
            variant="flat"
          >
            TERMINATE SESSION
          </Button>
        </div>

        {/* 右侧：功能矩阵 */}
        <div className="flex-1">
          {/* 导航 Tabs (赛博风格) */}
          <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm w-fit">
            {[
              { id: "overview", label: "OVERVIEW", icon: Activity },
              { id: "edit", label: "EDIT DATA", icon: Edit3 },
              { id: "security", label: "FIREWALL", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`
                            px-4 py-2 rounded-lg text-xs font-bold font-mono flex items-center gap-2 transition-all
                            ${
                              activeTab === tab.id
                                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                : "text-default-400 hover:text-white hover:bg-white/5"
                            }
                        `}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* 内容区域 */}
          <Card className="bg-content1/30 border border-white/5 backdrop-blur-md min-h-[500px]">
            <CardBody className="p-8">
              <AnimatePresence mode="wait">
                {/* 1. 概览视图 */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                    exit={{ opacity: 0, x: -20 }}
                    initial={{ opacity: 0, x: 20 }}
                  >
                    <SecurityShield score={MOCK_USER.securityScore} />

                    <div>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Terminal className="text-default-400" size={18} />
                        NEURAL LOGS
                      </h3>
                      <div className="space-y-3 font-mono text-sm">
                        {ACTIVITY_LOGS.map((log) => (
                          <div
                            key={log.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5 hover:border-cyan-500/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${log.action.includes("SUCCESS") ? "bg-success" : "bg-warning"}`}
                              />
                              <span className="text-white">{log.action}</span>
                            </div>
                            <div className="flex items-center gap-6 text-default-400 text-xs mt-2 md:mt-0">
                              <span>{log.device}</span>
                              <span>{log.ip}</span>
                              <span>{log.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. 编辑视图 */}
                {activeTab === "edit" && (
                  <motion.div
                    key="edit"
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6 max-w-2xl"
                    exit={{ opacity: 0, x: -20 }}
                    initial={{ opacity: 0, x: 20 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        classNames={{
                          inputWrapper: "bg-black/20 border-white/10",
                        }}
                        defaultValue={MOCK_USER.name}
                        label="Display Name"
                        variant="bordered"
                      />
                      <Input
                        classNames={{
                          inputWrapper: "bg-black/20 border-white/10",
                        }}
                        defaultValue={MOCK_USER.handle}
                        label="Neural Handle"
                        startContent={
                          <span className="text-default-400">@</span>
                        }
                        variant="bordered"
                      />
                    </div>
                    <Input
                      classNames={{
                        inputWrapper: "bg-black/20 border-white/10",
                      }}
                      defaultValue={MOCK_USER.email}
                      endContent={
                        <Mail className="text-default-400" size={18} />
                      }
                      label="Comms Link (Email)"
                      variant="bordered"
                    />
                    <div className="space-y-2">
                      <span className="text-xs text-default-500 ml-1">
                        BIO DATA
                      </span>
                      <textarea
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        defaultValue={MOCK_USER.bio}
                        rows={4}
                      />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <Button
                        color="primary"
                        isLoading={isLoading}
                        startContent={!isLoading && <Save size={18} />}
                        variant="shadow"
                        onPress={handleSave}
                      >
                        REWRITE DATA
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* 3. 安全视图 */}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6 max-w-2xl"
                    exit={{ opacity: 0, x: -20 }}
                    initial={{ opacity: 0, x: 20 }}
                  >
                    <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex gap-4 items-start">
                      <AlertTriangle className="text-warning shrink-0" />
                      <div>
                        <h4 className="text-warning font-bold">
                          SECURITY PROTOCOL LEVEL 3
                        </h4>
                        <p className="text-xs text-warning/80 mt-1">
                          Changes to these settings will require a bio-metric
                          re-scan upon next login.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded bg-default-100 text-default-500">
                            <Smartphone size={20} />
                          </div>
                          <div>
                            <p className="font-bold">
                              Two-Factor Authentication
                            </p>
                            <p className="text-xs text-default-400">
                              Secure entry via mobile uplink
                            </p>
                          </div>
                        </div>
                        <Switch defaultSelected color="success" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded bg-default-100 text-default-500">
                            <Globe size={20} />
                          </div>
                          <div>
                            <p className="font-bold">Active Sessions</p>
                            <p className="text-xs text-default-400">
                              Manage connected devices
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="bordered">
                          MANAGE
                        </Button>
                      </div>

                      <Divider className="my-4 bg-white/10" />

                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-default-500">
                          UPDATE PASSPHRASE
                        </h4>
                        <Input
                          classNames={{
                            inputWrapper: "bg-black/20 border-white/10",
                          }}
                          label="Current Passphrase"
                          type="password"
                          variant="bordered"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            classNames={{
                              inputWrapper: "bg-black/20 border-white/10",
                            }}
                            label="New Passphrase"
                            type="password"
                            variant="bordered"
                          />
                          <Input
                            classNames={{
                              inputWrapper: "bg-black/20 border-white/10",
                            }}
                            label="Confirm New"
                            type="password"
                            variant="bordered"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button color="primary" variant="flat">
                            UPDATE KEY
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 背景噪点 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />
    </div>
  );
};

export default ProfileManager;
