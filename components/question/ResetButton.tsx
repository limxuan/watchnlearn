import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function ResetButton({ onClick }: any) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="bg-transparent text-white/60 hover:text-white"
    >
      <RefreshCcw className="mr-2 h-4 w-4" />
      <span className="hidden md:inline">Reset</span>
    </Button>
  );
}
