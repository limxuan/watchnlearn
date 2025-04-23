import { createBrowserClient } from "@supabase/ssr";
import useUserStore from "@/stores/useUserStore";

export const fetchUser = async () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userInfo } = await supabase
      .from("users")
      .select("user_id, username, email, role, pfp_url")
      .eq("user_id", user.id)
      .single();

    console.log("FETCHING USER....");
    console.log(userInfo);

    if (userInfo) {
      const setUser = useUserStore.getState().setUser;
      setUser(userInfo);
    }
  }
};
