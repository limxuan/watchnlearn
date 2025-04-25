export default function FlexCenter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
      {children}
    </div>
  );
}
