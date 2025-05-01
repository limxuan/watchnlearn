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
          "transition-bg relative flex min-h-dvh flex-1 flex-col items-center justify-center bg-background text-foreground",
          className,
        )}
        {...props}
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={
            {
              "--aurora": `
                repeating-linear-gradient(
                  115deg,
                  rgba(32,87,129,0.08) 5%,   /* Primary dark blue */
                  rgba(79,149,157,0.08) 10%, /* Secondary teal */
                  rgba(152,210,192,0.08) 15%,/* Accent green */
                  rgba(246,248,213,0.08) 20%,/* Background yellow */
                  rgba(79,149,157,0.08) 25%, /* Teal again */
                  rgba(32,87,129,0.08) 30%,  /* Primary again */
                  transparent 35%
                )
              `,
              "--dark-gradient":
                "repeating-linear-gradient(115deg, rgba(32,87,129,0.4) 0%, rgba(32,87,129,0.3) 7%, transparent 10%, transparent 12%, rgba(32,87,129,0.3) 16%)",
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
              `pointer-events-none absolute -inset-[10px] opacity-60 blur-[10px] filter will-change-transform [background-image:var(--white-gradient),var(--aurora)] [background-position:center] [background-size:300%,_200%] after:absolute after:inset-0 after:animate-aurora after:mix-blend-lighten after:content-[""] after:[background-attachment:fixed] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] dark:[background-image:var(--dark-gradient),var(--aurora)] after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
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
