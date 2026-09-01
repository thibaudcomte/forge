-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.programs (
  id integer NOT NULL DEFAULT nextval('programs_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  CONSTRAINT programs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exercises (
  id integer NOT NULL DEFAULT nextval('exercises_id_seq'::regclass),
  name character varying NOT NULL,
  description text,
  video text,
  rest_time_seconds numeric NOT NULL,
  CONSTRAINT exercises_pkey PRIMARY KEY (id)
);
CREATE TABLE public.program_exercises (
  id integer NOT NULL DEFAULT nextval('program_exercises_id_seq'::regclass),
  program_id integer NOT NULL,
  exercise_id integer NOT NULL,
  sets_count integer NOT NULL,
  reps_range character varying NOT NULL,
  notes text,
  position numeric,
  CONSTRAINT program_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT program_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id),
  CONSTRAINT program_exercises_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id)
);
CREATE TABLE public.workouts (
  id integer NOT NULL DEFAULT nextval('workouts_id_seq'::regclass),
  program_id integer,
  performed_at date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  user_id uuid,
  CONSTRAINT workouts_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.workout_exercises (
  id integer NOT NULL DEFAULT nextval('workout_exercises_id_seq'::regclass),
  workout_id integer NOT NULL,
  exercise_id integer NOT NULL,
  notes text,
  CONSTRAINT workout_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id),
  CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id)
);
CREATE TABLE public.exercise_sets (
  id integer NOT NULL DEFAULT nextval('exercise_sets_id_seq'::regclass),
  workout_exercise_id integer NOT NULL,
  set_index integer NOT NULL,
  reps integer,
  weight numeric,
  rpe numeric,
  notes text,
  CONSTRAINT exercise_sets_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_sets_workout_exercise_id_fkey FOREIGN KEY (workout_exercise_id) REFERENCES public.workout_exercises(id)
);
CREATE TABLE public.weight_entries (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  weight_kg numeric NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  body_fat_pct numeric,
  CONSTRAINT weight_entries_pkey PRIMARY KEY (user_id, recorded_at),
  CONSTRAINT weight_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);