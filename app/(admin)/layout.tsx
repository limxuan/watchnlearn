"use client";

import useUserStore from "@/stores/useUserStore";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUserStore();

  if (!user || user.role !== "admin") return <Unauthorized />;
  return <>{children}</>;
}

function Unauthorized() {
  return (
    <div>
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
    </div>
  );
}
