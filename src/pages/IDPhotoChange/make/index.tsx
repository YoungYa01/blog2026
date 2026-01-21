import { useState, useRef, Suspense } from "react";
import {
  ArrowLeft,
  Upload,
  Check,
  Loader2,
  Download,
  Shirt,
  RefreshCw,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; //

import { SPECS, STYLES } from "../constants";

// 将主逻辑包装在组件中
function MakeContent() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const specIdParam = searchParams.get("specId");

  // 根据 ID 查找规格信息
  const currentSpec =
    SPECS.find((s) => s.id === Number(specIdParam)) || SPECS[0];

  const [step, setStep] = useState<1 | 2>(1); // 1: 上传, 2: 结果
  const [userImage, setUserImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string>("");
  const [gender, setGender] = useState<0 | 1>(1); //
  const [styleId, setStyleId] = useState("blueshirt");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;

        setUserImage(result);
        setBase64Data(result.split(",")[1]);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!base64Data) return;
    setLoading(true);
    setResultImage(null);

    // ============================================================
    // MOCK 模式：模拟接口调用
    // ============================================================
    try {
      console.log("正在使用模拟数据模式...");

      // 1. 模拟网络延迟 (2秒)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 2. 模拟随机成功/失败 (这里强制成功)
      const isSuccess = true;

      if (isSuccess) {
        // 3. 构造模拟的返回结果
        // 注意：因为没有真实后端生成图片，为了让流程走通，
        // 我们暂时把用户上传的原图当作“结果图”展示，或者使用一张固定的网图。

        // 方案 A: 使用用户上传的图作为结果 (最方便调试样式)
        const mockResultUrl = userImage;

        // 方案 B: 使用一张固定的网络示例图 (如果你想看换了图的效果)
        // const mockResultUrl = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=600&fit=crop";

        setResultImage(mockResultUrl);
        setStep(2); // 跳转到结果页

        // === 保存历史记录 (Mock 数据) ===
        const newRecord = {
          id: Date.now(),
          specName: currentSpec.name,
          date: new Date().toLocaleDateString(),
          imgUrl: mockResultUrl || "", // 保存模拟图片的地址
        };

        const oldHistory = JSON.parse(
          localStorage.getItem("idphoto_history") || "[]",
        );

        localStorage.setItem(
          "idphoto_history",
          JSON.stringify([newRecord, ...oldHistory]),
        );
        // ============================
      } else {
        alert("模拟报错: 生成失败，请重试");
      }
    } catch (error) {
      console.error(error);
      alert("模拟网络异常");
    } finally {
      setLoading(false);
    }

    // ============================================================
    //以此下是原来的真实代码 (暂时注释掉)
    // ============================================================
    /*
        try {
          const response = await fetch('/api/change_clothes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              spec_id: currentSpec.id,
              file: base64Data,
              sex: gender,
              style: styleId
            }),
          });

          const data = await response.json();

          if (data.code === 200 && data.file_name) {
            const imgUrl = `/api/take_pic_mark/${data.file_name}`;
            setResultImage(imgUrl);
            setStep(2);

            // 保存历史记录逻辑...
          } else {
            alert('制作失败: ' + (data.msg || '未知错误'));
          }
        } catch (error) {
          console.error(error);
          alert('网络请求失败');
        } finally {
          setLoading(false);
        }
        */
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-20">
        <button
          className="p-2 -ml-2 text-gray-600"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
        </button>
        <div className="ml-2">
          <h1 className="font-bold text-gray-800 text-lg">
            {currentSpec.name}
          </h1>
          <p className="text-xs text-gray-400">正在制作中</p>
        </div>
      </div>

      <main className="flex-1 p-4 pb-32">
        {/* 预览区域 (核心视觉区) */}
        <div className="flex flex-col items-center justify-center my-4">
          <div
            className="relative bg-white rounded shadow-lg overflow-hidden border border-gray-200 transition-all duration-300"
            style={{
              width: step === 2 ? "240px" : "200px", // 结果页稍微放大
              aspectRatio: `${currentSpec.width}/${currentSpec.height}`,
            }}
          >
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
                <Loader2
                  className="animate-spin text-blue-500 mb-2"
                  size={32}
                />
                <span className="text-xs text-gray-400">AI 正在换装...</span>
              </div>
            ) : null}

            {resultImage ? (
              <img
                alt="Result"
                className="w-full h-full object-cover"
                src={resultImage}
              />
            ) : userImage ? (
              <img
                alt="Preview"
                className="w-full h-full object-cover opacity-90"
                src={userImage}
              />
            ) : (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events
              <div
                className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mb-2" size={32} />
                <span className="text-xs">点击上传照片</span>
              </div>
            )}
          </div>

          {/* 如果有结果，显示重做提示 */}
          {resultImage && (
            <button
              className="mt-4 flex items-center space-x-1 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border shadow-sm"
              onClick={() => {
                setStep(1);
                setResultImage(null);
              }}
            >
              <RefreshCw size={14} />
              <span>重新调整</span>
            </button>
          )}
        </div>

        {/* 操作控制区 - 仅在非结果页或想调整时显示 */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* 上传按钮 (如果没图) */}
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />

            {userImage && (
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
                {/* 选项：性别 */}
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                    <User className="mr-1" size={14} /> 1. 选择性别
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === 1 ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                      onClick={() => setGender(1)}
                    >
                      男士
                    </button>
                    <button
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === 0 ? "bg-white text-pink-500 shadow-sm" : "text-gray-500"}`}
                      onClick={() => setGender(0)}
                    >
                      女士
                    </button>
                  </div>
                </div>

                {/* 选项：服装 */}
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                    <Shirt className="mr-1" size={14} /> 2. 选择服装
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${
                          styleId === s.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-transparent bg-gray-50"
                        }`}
                        onClick={() => setStyleId(s.id)}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border shadow-sm mb-1 ${s.color}`}
                        />
                        <span className="text-[10px] text-gray-600 scale-90">
                          {s.name}
                        </span>
                        {styleId === s.id && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部固定按钮区 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-pb">
        {!userImage ? (
          <button
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
            onClick={() => fileInputRef.current?.click()}
          >
            上传照片 / 拍摄
          </button>
        ) : step === 1 ? (
          <button
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
            disabled={loading}
            onClick={handleGenerate}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Check />}
            <span>{loading ? "AI 正在制作中..." : "生成证件照"}</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold active:scale-95 transition-transform"
              onClick={() => navigate("/idphoto/home")}
            >
              返回首页
            </button>
            <a
              className="flex-[2] flex items-center justify-center space-x-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
              download={`idphoto_${Date.now()}.jpg`}
              href={resultImage || "#"}
            >
              <Download size={20} />
              <span>保存预览图</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// 必须使用 Suspense 包裹使用 useSearchParams 的组件
export default function MakePage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">加载中...</div>}>
      <MakeContent />
    </Suspense>
  );
}
