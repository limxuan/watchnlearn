import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserInfo = {
  user_id: string;
  username: string;
  email: string;
  role: string;
  pfp_url: string;
};

type UserStore = {
  initialised: boolean;
  user: UserInfo | null;
  setUser: (userData: UserInfo) => void;
  clearUser: () => void;
};

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      initialised: false,
      user: null,
      setUser: (userData) => set({ user: userData }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export default useUserStore;
