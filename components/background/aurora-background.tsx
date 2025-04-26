"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-dvh flex-col items-center justify-center bg-[#111827] text-white",
          className,
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              "--aurora": `
                repeating-linear-gradient(
                  115deg,
                  rgba(244,114,182,0.08) 5%,    /* pink-400 */
                  rgba(96,165,250,0.08) 10%,    /* blue-400 */
                  rgba(167,139,250,0.08) 15%,   /* violet-400 */
                  rgba(94,234,212,0.08) 20%,    /* teal-300 */
                  rgba(52,211,153,0.08) 25%,    /* green-400 */
                  rgba(34,211,238,0.08) 30%,    /* cyan-400 */
                  transparent 35%
                )
              `,
              "--dark-gradient":
                "repeating-linear-gradient(115deg, #111827 0%, #111827 7%, transparent 10%, transparent 12%, #111827 16%)",
              "--white-gradient":
                "repeating-linear-gradient(115deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.02) 7%, transparent 10%, transparent 12%, rgba(255,255,255,0.02) 16%)",
              "--transparent": "transparent",
              backgroundPosition: "50% 50%",
              animation: "auroraShift 30s ease-in-out infinite",
            } as React.CSSProperties
          }
        >
          <div
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] opacity-60 blur-[10px] filter will-change-transform [background-image:var(--white-gradient),var(--aurora)] [background-position:center] [background-size:300%,_200%] after:absolute after:inset-0 after:mix-blend-lighten after:content-[""] after:[background-attachment:fixed] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] dark:[background-image:var(--dark-gradient),var(--aurora)] after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%, black 10%, transparent 70%)]`,
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
