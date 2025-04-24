import { create } from "zustand";

type CursorGlowStore = {
  x: number;
  y: number;
  height: number;
  glowColor: string;
  setCoordinates: (x: number, y: number) => void;
  setGlowColor: (color: string) => void;
  setHeight: (height: number) => void;
  resetGlow: () => void;
};

const useCursorGlowStore = create<CursorGlowStore>((set) => ({
  x: 0,
  y: 0,
  height: 300,
  glowColor: "bg-blue-200",
  setCoordinates: (x, y) => set({ x, y }),
  setGlowColor: (color) => set({ glowColor: color }),
  setHeight: (height) => set({ height }),
  resetGlow: () => set({ glowColor: "bg-blue-200" }),
}));

export default useCursorGlowStore;
