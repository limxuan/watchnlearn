

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.users (user_id, username, email, role, pfp_url, approved, created_at)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username', NEW.email, NEW.raw_user_meta_data ->> 'role', NEW.raw_user_meta_data ->> 'pfp_url', false, NEW.created_at);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "badge_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "admin_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "xp_threshold" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_active" boolean
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bans" (
    "ban_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "admin_id" "uuid",
    "reason" "text",
    "banned_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."bans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_attempts" (
    "question_attempt_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "attempt_id" "uuid",
    "question_id" "uuid",
    "selected_option_id" "uuid",
    "correct_option_id" "uuid",
    "is_correct" boolean,
    "mistake_count" numeric
);


ALTER TABLE "public"."question_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_matches" (
    "question_id" "uuid" NOT NULL,
    "source_option_id" "uuid" NOT NULL,
    "target_option_id" "uuid" NOT NULL,
    "question_matches_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."question_matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_options" (
    "option_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid",
    "option_text" "text",
    "option_url" "text",
    "is_correct" boolean,
    "pos_x" integer,
    "pos_y" integer,
    "is_active" boolean
);


ALTER TABLE "public"."question_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "question_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "quiz_id" "uuid",
    "question_type" "text" NOT NULL,
    "question_text" "text" NOT NULL,
    "image_urls" "text"[],
    "video_url" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_active" boolean
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_attempts" (
    "attempt_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "quiz_id" "uuid",
    "user_id" "uuid",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "correct_questions" integer,
    "total_questions" integer,
    "difficulty_rating" integer
);


ALTER TABLE "public"."quiz_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quizzes" (
    "quiz_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "public_visibility" boolean,
    "join_code" "text",
    "quiz_cover_url" "text",
    "last_updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."quizzes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "badge_id" "uuid",
    "user_id" "uuid",
    "earned_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_streaks" (
    "user_streaks_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "current_streak" integer DEFAULT 0,
    "streak_updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "longest_streak" integer DEFAULT 0
);


ALTER TABLE "public"."user_streaks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_xp" (
    "user_xp_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "total_xp" integer DEFAULT 0,
    "last_updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."user_xp" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" "uuid" NOT NULL,
    "username" "text",
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'student'::"text",
    "pfp_url" "text" DEFAULT 'https://nkpjxoqztjvekrfoshso.supabase.co/storage/v1/object/public/profile-pictures/default.jpg'::"text",
    "approved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."xp_transactions" (
    "xp_transaction_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "xp_amount" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."xp_transactions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("badge_id");



ALTER TABLE ONLY "public"."bans"
    ADD CONSTRAINT "bans_pkey" PRIMARY KEY ("ban_id");



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_pkey" PRIMARY KEY ("question_attempt_id");



ALTER TABLE ONLY "public"."question_matches"
    ADD CONSTRAINT "question_matches_pkey" PRIMARY KEY ("question_matches_id");



ALTER TABLE ONLY "public"."question_options"
    ADD CONSTRAINT "question_options_pkey" PRIMARY KEY ("option_id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("question_id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("attempt_id");



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_pkey" PRIMARY KEY ("quiz_id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_streaks"
    ADD CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("user_streaks_id");



ALTER TABLE ONLY "public"."user_streaks"
    ADD CONSTRAINT "user_streaks_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_xp"
    ADD CONSTRAINT "user_xp_pkey" PRIMARY KEY ("user_xp_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."xp_transactions"
    ADD CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("xp_transaction_id");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bans"
    ADD CONSTRAINT "bans_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bans"
    ADD CONSTRAINT "bans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("attempt_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_correct_option_id_fkey" FOREIGN KEY ("correct_option_id") REFERENCES "public"."question_options"("option_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("question_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_attempts"
    ADD CONSTRAINT "question_attempts_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("option_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_matches"
    ADD CONSTRAINT "question_matches_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("question_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_matches"
    ADD CONSTRAINT "question_matches_source_option_id_fkey" FOREIGN KEY ("source_option_id") REFERENCES "public"."question_options"("option_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_matches"
    ADD CONSTRAINT "question_matches_target_option_id_fkey" FOREIGN KEY ("target_option_id") REFERENCES "public"."question_options"("option_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_options"
    ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("question_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("quiz_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("quiz_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_streaks"
    ADD CONSTRAINT "user_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_xp"
    ADD CONSTRAINT "user_xp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."xp_transactions"
    ADD CONSTRAINT "xp_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



CREATE POLICY "Allow everything for everyone" ON "public"."badges" USING (true) WITH CHECK (true);



ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "anon";


























































































































































































GRANT ALL ON TABLE "public"."badges" TO "authenticated";



GRANT ALL ON TABLE "public"."bans" TO "authenticated";



GRANT ALL ON TABLE "public"."question_attempts" TO "authenticated";



GRANT ALL ON TABLE "public"."question_matches" TO "authenticated";



GRANT ALL ON TABLE "public"."question_options" TO "authenticated";



GRANT ALL ON TABLE "public"."questions" TO "authenticated";



GRANT ALL ON TABLE "public"."quiz_attempts" TO "authenticated";



GRANT ALL ON TABLE "public"."quizzes" TO "authenticated";



GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";



GRANT ALL ON TABLE "public"."user_streaks" TO "authenticated";



GRANT ALL ON TABLE "public"."user_xp" TO "authenticated";



GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT SELECT ON TABLE "public"."users" TO "anon";



GRANT ALL ON TABLE "public"."xp_transactions" TO "authenticated";

































RESET ALL;
