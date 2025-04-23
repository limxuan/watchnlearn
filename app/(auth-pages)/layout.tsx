import FlexCenter from "@/components/flex-center";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FlexCenter>{children}</FlexCenter>;
}
