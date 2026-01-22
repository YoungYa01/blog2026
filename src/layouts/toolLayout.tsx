import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";

export default function ToolLayout() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="relative w-full h-full">
      <div className={"absolute left-16 top-4 z-[9999]"}>
        <Tooltip content="返回上一页" showArrow={true}>
          <Button isIconOnly variant={"light"} onPress={handleBack}>
            <ArrowLeft />
          </Button>
        </Tooltip>
      </div>
      <div className="h-screen w-screen">
        <Outlet />
      </div>
    </div>
  );
}
