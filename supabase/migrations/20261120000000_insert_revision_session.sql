-- Insère la séance de révision en position 5 sans perdre ni mélanger
-- les enregistrements des anciennes séances 5 à 15.

begin;

alter table public.course_2ac_submissions
  drop constraint if exists course_2ac_submissions_session_check;
alter table public.course_2ac_session_access
  drop constraint if exists course_2ac_session_access_id_check;
alter table public.course_2ac_learning_checkpoints
  drop constraint if exists course_2ac_learning_checkpoints_session_id_check;

update public.course_2ac_submissions
set session_id = session_id + 1
where session_id >= 5;

update public.course_2ac_learning_checkpoints
set session_id = session_id + 1
where session_id >= 5;

-- Évite les collisions de clé primaire pendant le décalage.
update public.course_2ac_session_access
set session_id = session_id + 100
where session_id >= 5;

update public.course_2ac_session_access
set session_id = session_id - 99
where session_id >= 105;

insert into public.course_2ac_session_access (session_id, is_unlocked)
values (5, false)
on conflict (session_id) do nothing;

alter table public.course_2ac_submissions
  add constraint course_2ac_submissions_session_check
  check (session_id between 1 and 16);
alter table public.course_2ac_session_access
  add constraint course_2ac_session_access_id_check
  check (session_id between 1 and 16);
alter table public.course_2ac_learning_checkpoints
  add constraint course_2ac_learning_checkpoints_session_id_check
  check (session_id between 1 and 16);

commit;
