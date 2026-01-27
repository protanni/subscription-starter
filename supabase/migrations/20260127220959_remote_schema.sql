


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."capture_status" AS ENUM (
    'inbox',
    'processed',
    'archived'
);


ALTER TYPE "public"."capture_status" OWNER TO "postgres";


CREATE TYPE "public"."capture_type" AS ENUM (
    'note',
    'task',
    'goal',
    'project',
    'journal',
    'habit',
    'event',
    'idea',
    'link',
    'other'
);


ALTER TYPE "public"."capture_type" OWNER TO "postgres";


CREATE TYPE "public"."goal_status" AS ENUM (
    'active',
    'paused',
    'completed',
    'archived'
);


ALTER TYPE "public"."goal_status" OWNER TO "postgres";


CREATE TYPE "public"."habit_frequency" AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'custom'
);


ALTER TYPE "public"."habit_frequency" OWNER TO "postgres";


CREATE TYPE "public"."mood_level" AS ENUM (
    'very_low',
    'low',
    'neutral',
    'good',
    'great'
);


ALTER TYPE "public"."mood_level" OWNER TO "postgres";


CREATE TYPE "public"."project_status" AS ENUM (
    'active',
    'paused',
    'completed',
    'archived'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


CREATE TYPE "public"."task_priority" AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE "public"."task_priority" OWNER TO "postgres";


CREATE TYPE "public"."task_status" AS ENUM (
    'todo',
    'doing',
    'done',
    'archived'
);


ALTER TYPE "public"."task_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_owner"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select p_user_id = auth.uid()
$$;


ALTER FUNCTION "public"."is_owner"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seed_default_life_areas"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.life_areas where user_id = uid) then
    return;
  end if;

  insert into public.life_areas (user_id, name, icon, sort_order) values
    (uid, 'Saúde', 'HeartPulse', 10),
    (uid, 'Corpo & Estética', 'Sparkles', 20),
    (uid, 'Relacionamentos', 'Users', 30),
    (uid, 'Família', 'Home', 40),
    (uid, 'Carreira', 'Briefcase', 50),
    (uid, 'Negócios', 'Rocket', 60),
    (uid, 'Finanças', 'Wallet', 70),
    (uid, 'Espiritualidade', 'Sun', 80),
    (uid, 'Lazer', 'Gamepad2', 90),
    (uid, 'Ambiente', 'Building2', 100),
    (uid, 'Estudos', 'GraduationCap', 110),
    (uid, 'Propósito', 'Target', 120);

end;
$$;


ALTER FUNCTION "public"."seed_default_life_areas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_task_completed_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.status = 'done' and (old.status is distinct from new.status) then
    new.completed_at = now();
  end if;

  if new.status <> 'done' and (old.status is distinct from new.status) then
    new.completed_at = null;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."set_task_completed_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."calendar_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "life_area_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "location" "text",
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone,
    "all_day" boolean DEFAULT false NOT NULL,
    "linked_task_id" "uuid",
    "linked_project_id" "uuid",
    "is_cancelled" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."calendar_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."captures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "life_area_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."capture_type" DEFAULT 'note'::"public"."capture_type" NOT NULL,
    "status" "public"."capture_status" DEFAULT 'inbox'::"public"."capture_status" NOT NULL,
    "content" "text" NOT NULL,
    "linked_goal_id" "uuid",
    "linked_project_id" "uuid",
    "linked_task_id" "uuid",
    "processed_at" timestamp with time zone,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."captures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "life_area_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."goal_status" DEFAULT 'active'::"public"."goal_status" NOT NULL,
    "start_date" "date",
    "due_date" "date",
    "target_value" numeric,
    "current_value" numeric,
    "sort_order" numeric DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."habit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "habit_id" "uuid" NOT NULL,
    "log_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "value" integer DEFAULT 1 NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."habit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."habits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "life_area_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "frequency" "public"."habit_frequency" DEFAULT 'daily'::"public"."habit_frequency" NOT NULL,
    "target_per_period" integer DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" numeric DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."habits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journal_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "life_area_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "entry_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "title" "text",
    "content" "text" NOT NULL,
    "mood" "public"."mood_level",
    "energy_level" integer,
    "stress_level" integer,
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    CONSTRAINT "journal_entries_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 10))),
    CONSTRAINT "journal_entries_stress_level_check" CHECK ((("stress_level" >= 1) AND ("stress_level" <= 10)))
);


ALTER TABLE "public"."journal_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."life_areas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "icon" "text",
    "color" "text",
    "sort_order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."life_areas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mood_checkins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "checkin_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "mood" "public"."mood_level" NOT NULL,
    "note" "text",
    "energy_level" integer,
    "stress_level" integer,
    CONSTRAINT "mood_checkins_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 10))),
    CONSTRAINT "mood_checkins_stress_level_check" CHECK ((("stress_level" >= 1) AND ("stress_level" <= 10)))
);


ALTER TABLE "public"."mood_checkins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "locale" "text" DEFAULT 'pt-BR'::"text",
    "onboarding_completed" boolean DEFAULT false NOT NULL,
    "is_paid" boolean DEFAULT false NOT NULL,
    "daily_focus_text" "text",
    "daily_focus_updated_at" timestamp with time zone
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "goal_id" "uuid",
    "life_area_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."project_status" DEFAULT 'active'::"public"."project_status" NOT NULL,
    "start_date" "date",
    "due_date" "date",
    "sort_order" numeric DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routine_checkins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "routine_id" "uuid" NOT NULL,
    "checkin_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."routine_checkins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routine_item_checkins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "routine_checkin_id" "uuid" NOT NULL,
    "routine_item_id" "uuid" NOT NULL,
    "is_done" boolean DEFAULT true NOT NULL,
    "done_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."routine_item_checkins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routine_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "routine_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "sort_order" numeric DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."routine_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "period" "text" DEFAULT 'custom'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" numeric DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."routines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "color" "text"
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_tags" (
    "task_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."task_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "goal_id" "uuid",
    "project_id" "uuid",
    "life_area_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."task_status" DEFAULT 'todo'::"public"."task_status" NOT NULL,
    "priority" "public"."task_priority" DEFAULT 'medium'::"public"."task_priority" NOT NULL,
    "due_date" "date",
    "start_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "sort_order" numeric DEFAULT 0 NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "area" "text",
    CONSTRAINT "tasks_area_check" CHECK ((("area" = ANY (ARRAY['work'::"text", 'personal'::"text", 'mind'::"text", 'body'::"text"])) OR ("area" IS NULL)))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_dashboard_area_counts" AS
 SELECT "la"."user_id",
    "la"."id" AS "life_area_id",
    "la"."name" AS "life_area_name",
    "count"(*) FILTER (WHERE (("t"."id" IS NOT NULL) AND ("t"."is_deleted" = false) AND ("t"."status" = ANY (ARRAY['todo'::"public"."task_status", 'doing'::"public"."task_status"])))) AS "open_tasks",
    "count"(*) FILTER (WHERE (("p"."id" IS NOT NULL) AND ("p"."status" = 'active'::"public"."project_status"))) AS "active_projects",
    "count"(*) FILTER (WHERE (("g"."id" IS NOT NULL) AND ("g"."status" = 'active'::"public"."goal_status"))) AS "active_goals"
   FROM ((("public"."life_areas" "la"
     LEFT JOIN "public"."tasks" "t" ON ((("t"."life_area_id" = "la"."id") AND ("t"."user_id" = "la"."user_id"))))
     LEFT JOIN "public"."projects" "p" ON ((("p"."life_area_id" = "la"."id") AND ("p"."user_id" = "la"."user_id"))))
     LEFT JOIN "public"."goals" "g" ON ((("g"."life_area_id" = "la"."id") AND ("g"."user_id" = "la"."user_id"))))
  GROUP BY "la"."user_id", "la"."id", "la"."name";


ALTER VIEW "public"."v_dashboard_area_counts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_today_summary" AS
 SELECT "id" AS "user_id",
    ( SELECT "count"(*) AS "count"
           FROM "public"."tasks" "t"
          WHERE (("t"."user_id" = "u"."id") AND ("t"."is_deleted" = false) AND ("t"."status" = ANY (ARRAY['todo'::"public"."task_status", 'doing'::"public"."task_status"])) AND ("t"."due_date" = CURRENT_DATE))) AS "tasks_due_today",
    ( SELECT "count"(*) AS "count"
           FROM "public"."habit_logs" "hl"
          WHERE (("hl"."user_id" = "u"."id") AND ("hl"."log_date" = CURRENT_DATE))) AS "habits_logged_today",
    ( SELECT "mc"."mood"
           FROM "public"."mood_checkins" "mc"
          WHERE (("mc"."user_id" = "u"."id") AND ("mc"."checkin_date" = CURRENT_DATE))) AS "mood_today",
    ( SELECT "count"(*) AS "count"
           FROM "public"."calendar_events" "e"
          WHERE (("e"."user_id" = "u"."id") AND ("e"."is_cancelled" = false) AND ("date"("e"."starts_at") = CURRENT_DATE))) AS "events_today"
   FROM "auth"."users" "u";


ALTER VIEW "public"."v_today_summary" OWNER TO "postgres";


ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."captures"
    ADD CONSTRAINT "captures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."habit_logs"
    ADD CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."habit_logs"
    ADD CONSTRAINT "habit_logs_user_id_habit_id_log_date_key" UNIQUE ("user_id", "habit_id", "log_date");



ALTER TABLE ONLY "public"."habits"
    ADD CONSTRAINT "habits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."life_areas"
    ADD CONSTRAINT "life_areas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."life_areas"
    ADD CONSTRAINT "life_areas_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."mood_checkins"
    ADD CONSTRAINT "mood_checkins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mood_checkins"
    ADD CONSTRAINT "mood_checkins_user_id_checkin_date_key" UNIQUE ("user_id", "checkin_date");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routine_checkins"
    ADD CONSTRAINT "routine_checkins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routine_checkins"
    ADD CONSTRAINT "routine_checkins_user_id_routine_id_checkin_date_key" UNIQUE ("user_id", "routine_id", "checkin_date");



ALTER TABLE ONLY "public"."routine_item_checkins"
    ADD CONSTRAINT "routine_item_checkins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routine_item_checkins"
    ADD CONSTRAINT "routine_item_checkins_user_id_routine_checkin_id_routine_it_key" UNIQUE ("user_id", "routine_checkin_id", "routine_item_id");



ALTER TABLE ONLY "public"."routine_items"
    ADD CONSTRAINT "routine_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routines"
    ADD CONSTRAINT "routines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_user_id_name_key" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."task_tags"
    ADD CONSTRAINT "task_tags_pkey" PRIMARY KEY ("task_id", "tag_id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



CREATE INDEX "habit_logs_habit_id_idx" ON "public"."habit_logs" USING "btree" ("habit_id");



CREATE INDEX "habit_logs_log_date_idx" ON "public"."habit_logs" USING "btree" ("log_date");



CREATE INDEX "habits_user_active_idx" ON "public"."habits" USING "btree" ("user_id", "is_active");



CREATE INDEX "habits_user_id_idx" ON "public"."habits" USING "btree" ("user_id");



CREATE INDEX "idx_calendar_user_range" ON "public"."calendar_events" USING "btree" ("user_id", "starts_at");



CREATE INDEX "idx_captures_status" ON "public"."captures" USING "btree" ("user_id", "status");



CREATE INDEX "idx_captures_type" ON "public"."captures" USING "btree" ("user_id", "type");



CREATE INDEX "idx_captures_user" ON "public"."captures" USING "btree" ("user_id");



CREATE INDEX "idx_goals_area" ON "public"."goals" USING "btree" ("life_area_id");



CREATE INDEX "idx_goals_user" ON "public"."goals" USING "btree" ("user_id");



CREATE INDEX "idx_habit_logs_user_date" ON "public"."habit_logs" USING "btree" ("user_id", "log_date");



CREATE INDEX "idx_habits_user" ON "public"."habits" USING "btree" ("user_id");



CREATE INDEX "idx_journal_user_date" ON "public"."journal_entries" USING "btree" ("user_id", "entry_date");



CREATE INDEX "idx_life_areas_user" ON "public"."life_areas" USING "btree" ("user_id");



CREATE INDEX "idx_mood_user_date" ON "public"."mood_checkins" USING "btree" ("user_id", "checkin_date");



CREATE INDEX "idx_projects_area" ON "public"."projects" USING "btree" ("life_area_id");



CREATE INDEX "idx_projects_goal" ON "public"."projects" USING "btree" ("goal_id");



CREATE INDEX "idx_projects_user" ON "public"."projects" USING "btree" ("user_id");



CREATE INDEX "idx_routine_checkins_user_date" ON "public"."routine_checkins" USING "btree" ("user_id", "checkin_date");



CREATE INDEX "idx_routine_item_checkins_user" ON "public"."routine_item_checkins" USING "btree" ("user_id");



CREATE INDEX "idx_routine_items_user" ON "public"."routine_items" USING "btree" ("user_id");



CREATE INDEX "idx_routines_user" ON "public"."routines" USING "btree" ("user_id");



CREATE INDEX "idx_tasks_due" ON "public"."tasks" USING "btree" ("user_id", "due_date");



CREATE INDEX "idx_tasks_goal" ON "public"."tasks" USING "btree" ("goal_id");



CREATE INDEX "idx_tasks_project" ON "public"."tasks" USING "btree" ("project_id");



CREATE INDEX "idx_tasks_status" ON "public"."tasks" USING "btree" ("user_id", "status");



CREATE INDEX "idx_tasks_user" ON "public"."tasks" USING "btree" ("user_id");



CREATE INDEX "mood_checkins_date_idx" ON "public"."mood_checkins" USING "btree" ("checkin_date");



CREATE INDEX "mood_checkins_user_id_idx" ON "public"."mood_checkins" USING "btree" ("user_id");



CREATE INDEX "profiles_daily_focus_updated_at_idx" ON "public"."profiles" USING "btree" ("daily_focus_updated_at");



CREATE OR REPLACE TRIGGER "trg_calendar_updated_at" BEFORE UPDATE ON "public"."calendar_events" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_captures_updated_at" BEFORE UPDATE ON "public"."captures" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_goals_updated_at" BEFORE UPDATE ON "public"."goals" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_habits_set_updated_at" BEFORE UPDATE ON "public"."habits" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_habits_updated_at" BEFORE UPDATE ON "public"."habits" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_journal_updated_at" BEFORE UPDATE ON "public"."journal_entries" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_life_areas_updated_at" BEFORE UPDATE ON "public"."life_areas" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_mood_set_updated_at" BEFORE UPDATE ON "public"."mood_checkins" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_projectss_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_routine_items_updated_at" BEFORE UPDATE ON "public"."routine_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_routines_updated_at" BEFORE UPDATE ON "public"."routines" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_tags_updated_at" BEFORE UPDATE ON "public"."tags" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_tasks_completed_at" BEFORE UPDATE OF "status" ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."set_task_completed_at"();



CREATE OR REPLACE TRIGGER "trg_tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_life_area_id_fkey" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_linked_project_id_fkey" FOREIGN KEY ("linked_project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_linked_task_id_fkey" FOREIGN KEY ("linked_task_id") REFERENCES "public"."tasks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."captures"
    ADD CONSTRAINT "captures_life_area_id_fkey" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."captures"
    ADD CONSTRAINT "captures_linked_goal_id_fkey" FOREIGN KEY ("linked_goal_id") REFERENCES "public"."goals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."captures"
    ADD CONSTRAINT "captures_linked_project_id_fkey" FOREIGN KEY ("linked_project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."captures"
    ADD CONSTRAINT "captures_linked_task_id_fkey" FOREIGN KEY ("linked_task_id") REFERENCES "public"."tasks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."captures"
    ADD CONSTRAINT "captures_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_life_area_id_fkey" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."habit_logs"
    ADD CONSTRAINT "habit_logs_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."habit_logs"
    ADD CONSTRAINT "habit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."habits"
    ADD CONSTRAINT "habits_life_area_id_fkey" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."habits"
    ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_life_area_id_fkey" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."life_areas"
    ADD CONSTRAINT "life_areas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mood_checkins"
    ADD CONSTRAINT "mood_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_life_area_id_fkey" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_checkins"
    ADD CONSTRAINT "routine_checkins_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_checkins"
    ADD CONSTRAINT "routine_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_item_checkins"
    ADD CONSTRAINT "routine_item_checkins_routine_checkin_id_fkey" FOREIGN KEY ("routine_checkin_id") REFERENCES "public"."routine_checkins"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_item_checkins"
    ADD CONSTRAINT "routine_item_checkins_routine_item_id_fkey" FOREIGN KEY ("routine_item_id") REFERENCES "public"."routine_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_item_checkins"
    ADD CONSTRAINT "routine_item_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_items"
    ADD CONSTRAINT "routine_items_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_items"
    ADD CONSTRAINT "routine_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routines"
    ADD CONSTRAINT "routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_tags"
    ADD CONSTRAINT "task_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_tags"
    ADD CONSTRAINT "task_tags_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_life_area_id_fkey" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Habit logs are deletable by habit owner" ON "public"."habit_logs" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."habits" "h"
  WHERE (("h"."id" = "habit_logs"."habit_id") AND ("h"."user_id" = "auth"."uid"())))));



CREATE POLICY "Habit logs are insertable by habit owner" ON "public"."habit_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."habits" "h"
  WHERE (("h"."id" = "habit_logs"."habit_id") AND ("h"."user_id" = "auth"."uid"())))));



CREATE POLICY "Habit logs are updatable by habit owner" ON "public"."habit_logs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."habits" "h"
  WHERE (("h"."id" = "habit_logs"."habit_id") AND ("h"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."habits" "h"
  WHERE (("h"."id" = "habit_logs"."habit_id") AND ("h"."user_id" = "auth"."uid"())))));



CREATE POLICY "Habit logs are viewable by habit owner" ON "public"."habit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."habits" "h"
  WHERE (("h"."id" = "habit_logs"."habit_id") AND ("h"."user_id" = "auth"."uid"())))));



CREATE POLICY "Habits are deletable by owner" ON "public"."habits" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Habits are insertable by owner" ON "public"."habits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Habits are updatable by owner" ON "public"."habits" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Habits are viewable by owner" ON "public"."habits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Mood checkins are deletable by owner" ON "public"."mood_checkins" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Mood checkins are insertable by owner" ON "public"."mood_checkins" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Mood checkins are updatable by owner" ON "public"."mood_checkins" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Mood checkins are viewable by owner" ON "public"."mood_checkins" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Profiles are insertable by owner" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Profiles are updatable by owner" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Profiles are viewable by owner" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."calendar_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "calendar_own" ON "public"."calendar_events" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."captures" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "captures_own" ON "public"."captures" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."goals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "goals_own" ON "public"."goals" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."habit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "habit_logs_own" ON "public"."habit_logs" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."habits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "habits_own" ON "public"."habits" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."journal_entries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "journal_own" ON "public"."journal_entries" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."life_areas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "life_areas_own" ON "public"."life_areas" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."mood_checkins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "mood_own" ON "public"."mood_checkins" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "projects_own" ON "public"."projects" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."routine_checkins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "routine_checkins_own" ON "public"."routine_checkins" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."routine_item_checkins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "routine_item_checkins_own" ON "public"."routine_item_checkins" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."routine_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "routine_items_own" ON "public"."routine_items" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."routines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "routines_own" ON "public"."routines" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tags_own" ON "public"."tags" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));



ALTER TABLE "public"."task_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "task_tags_delete_own" ON "public"."task_tags" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."tasks" "t"
  WHERE (("t"."id" = "task_tags"."task_id") AND ("t"."user_id" = "auth"."uid"())))));



CREATE POLICY "task_tags_insert_own" ON "public"."task_tags" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."tasks" "t"
  WHERE (("t"."id" = "task_tags"."task_id") AND ("t"."user_id" = "auth"."uid"())))) AND (EXISTS ( SELECT 1
   FROM "public"."tags" "g"
  WHERE (("g"."id" = "task_tags"."tag_id") AND ("g"."user_id" = "auth"."uid"()))))));



CREATE POLICY "task_tags_select_own" ON "public"."task_tags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."tasks" "t"
  WHERE (("t"."id" = "task_tags"."task_id") AND ("t"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tasks_own" ON "public"."tasks" USING ("public"."is_owner"("user_id")) WITH CHECK ("public"."is_owner"("user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_owner"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_owner"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_owner"("p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."seed_default_life_areas"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."seed_default_life_areas"() TO "anon";
GRANT ALL ON FUNCTION "public"."seed_default_life_areas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."seed_default_life_areas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_task_completed_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_task_completed_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_task_completed_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."captures" TO "anon";
GRANT ALL ON TABLE "public"."captures" TO "authenticated";
GRANT ALL ON TABLE "public"."captures" TO "service_role";



GRANT ALL ON TABLE "public"."goals" TO "anon";
GRANT ALL ON TABLE "public"."goals" TO "authenticated";
GRANT ALL ON TABLE "public"."goals" TO "service_role";



GRANT ALL ON TABLE "public"."habit_logs" TO "anon";
GRANT ALL ON TABLE "public"."habit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."habit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."habits" TO "anon";
GRANT ALL ON TABLE "public"."habits" TO "authenticated";
GRANT ALL ON TABLE "public"."habits" TO "service_role";



GRANT ALL ON TABLE "public"."journal_entries" TO "anon";
GRANT ALL ON TABLE "public"."journal_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_entries" TO "service_role";



GRANT ALL ON TABLE "public"."life_areas" TO "anon";
GRANT ALL ON TABLE "public"."life_areas" TO "authenticated";
GRANT ALL ON TABLE "public"."life_areas" TO "service_role";



GRANT ALL ON TABLE "public"."mood_checkins" TO "anon";
GRANT ALL ON TABLE "public"."mood_checkins" TO "authenticated";
GRANT ALL ON TABLE "public"."mood_checkins" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."routine_checkins" TO "anon";
GRANT ALL ON TABLE "public"."routine_checkins" TO "authenticated";
GRANT ALL ON TABLE "public"."routine_checkins" TO "service_role";



GRANT ALL ON TABLE "public"."routine_item_checkins" TO "anon";
GRANT ALL ON TABLE "public"."routine_item_checkins" TO "authenticated";
GRANT ALL ON TABLE "public"."routine_item_checkins" TO "service_role";



GRANT ALL ON TABLE "public"."routine_items" TO "anon";
GRANT ALL ON TABLE "public"."routine_items" TO "authenticated";
GRANT ALL ON TABLE "public"."routine_items" TO "service_role";



GRANT ALL ON TABLE "public"."routines" TO "anon";
GRANT ALL ON TABLE "public"."routines" TO "authenticated";
GRANT ALL ON TABLE "public"."routines" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."task_tags" TO "anon";
GRANT ALL ON TABLE "public"."task_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."task_tags" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."v_dashboard_area_counts" TO "anon";
GRANT ALL ON TABLE "public"."v_dashboard_area_counts" TO "authenticated";
GRANT ALL ON TABLE "public"."v_dashboard_area_counts" TO "service_role";



GRANT ALL ON TABLE "public"."v_today_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_today_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_today_summary" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


