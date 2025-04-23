import InitUserStore from "@/components/init-user-store";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
