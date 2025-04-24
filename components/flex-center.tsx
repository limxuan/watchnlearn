import { HTMLAttributes } from "react";

interface FlexCenterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function FlexCenter({ children, ...props }: FlexCenterProps) {
  return (
    <div
      className="flex h-full w-full flex-1 flex-col items-center justify-center"
      {...props}
    >
      {children}
    </div>
  );
}
