import { useNavigate } from "react-router-dom";

import { title } from "@/components/primitives.ts";

export default function DocsPage() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <h1 className={title()} onClick={handleClick}>
          About
        </h1>
      </div>
    </section>
  );
}
