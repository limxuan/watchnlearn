import useCursorGlowStore from "@/stores/useCursorGlowStore";
import { useEffect, useState } from "react";

export default function GlowingQuestionWrapper({ children, ...props }: any) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { x, y, glowColor, height } = useCursorGlowStore();

  // colors used
  ["bg-blue-200"];

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden" {...props}>
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4">
        {children}
      </div>
    </div>
  );

  // glow is disabled for now
  // return (
  //   <div className="relative min-h-screen w-full overflow-hidden" {...props}>
  //     <div
  //       className={`${glowColor} pointer-events-none absolute z-0 rounded-full opacity-50 blur-[100px] transition-transform duration-300 ease-linear`}
  //       style={{
  //         transform: `translate(${mousePos.x - 192}px, ${mousePos.y - 192}px)`,
  //         height: `${height}px`,
  //         width: `${height}px`,
  //       }}
  //     />
  //
  //     <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4">
  //       {children}
  //     </div>
  //   </div>
  // );
}
