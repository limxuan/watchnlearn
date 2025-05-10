CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (user_id, username, email, role, pfp_url, approved, created_at)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username', NEW.email, NEW.raw_user_meta_data ->> 'role', NEW.raw_user_meta_data ->> 'pfp_url', false, NEW.created_at);
    RETURN NEW;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
END;

$$ LANGUAGE plpgsql SECURITY DEFINER;
