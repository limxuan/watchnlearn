import { create } from "zustand";

export type UserInfo = {
  user_id: string;
  username: string;
  email: string;
  role: string;
  pfp_url: string;
};

type UserStore = {
  user: UserInfo | null;
  setUser: (userData: UserInfo) => void;
  clearUser: () => void;
};

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
