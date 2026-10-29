-- =====================================================================
--  KIBERone — личный кабинет ученика. Схема БД для Supabase (Postgres)
--  Выполнить целиком в Supabase → SQL Editor → New query → Run.
--  Скрипт можно запускать повторно (идемпотентный).
-- =====================================================================

-- ---------- Таблицы ----------

create table if not exists public.groups (
  id          bigint generated always as identity primary key,
  name        text not null,                -- «Средняя, сб 12–14»
  schedule    text,                         -- свободный текст
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  login       text unique,
  full_name   text,
  role        text not null default 'student' check (role in ('student', 'tutor')),
  group_id    bigint references public.groups (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.modules (
  id          bigint generated always as identity primary key,
  group_id    bigint not null references public.groups (id) on delete cascade,
  title       text not null,
  description text,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.lessons (
  id            bigint generated always as identity primary key,
  module_id     bigint not null references public.modules (id) on delete cascade,
  title         text not null,
  description   text,
  youtube_url   text,                       -- ссылка на видео (можно unlisted)
  materials_url text,                       -- ссылка на папку/файл Google Диска
  task          text,                       -- текст домашнего задания
  position      int not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.submissions (
  id            bigint generated always as identity primary key,
  lesson_id     bigint not null references public.lessons (id) on delete cascade,
  student_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  project_url   text not null,              -- ссылка на проект в Google Диске
  comment       text,                       -- комментарий ученика
  status        text not null default 'sent' check (status in ('sent', 'accepted', 'revision')),
  tutor_comment text,
  score         int check (score between 0 and 100),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (lesson_id, student_id)
);

create index if not exists modules_group_idx     on public.modules (group_id);
create index if not exists lessons_module_idx    on public.lessons (module_id);
create index if not exists submissions_lesson_idx on public.submissions (lesson_id);
create index if not exists submissions_student_idx on public.submissions (student_id);
create index if not exists profiles_group_idx    on public.profiles (group_id);

-- ---------- Вспомогательные функции ----------

create or replace function public.is_tutor()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'tutor');
$$;

create or replace function public.my_group()
returns bigint language sql stable security definer set search_path = ''
as $$
  select group_id from public.profiles where id = auth.uid();
$$;

-- Пинг для проверки связи и keep-alive (доступен без входа)
create or replace function public.ping()
returns text language sql stable
as $$ select 'ok'::text $$;

-- ---------- Автосоздание профиля при создании пользователя ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, login, full_name)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Защита полей сдачи: ученик не может поставить себе «принято» ----------

create or replace function public.guard_submission()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if public.is_tutor() then
    new.updated_at := now();
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.student_id    := auth.uid();
    new.status        := 'sent';
    new.tutor_comment := null;
    new.score         := null;
  else
    if old.status = 'accepted' then
      raise exception 'Работа уже принята — изменить нельзя';
    end if;
    new.student_id    := old.student_id;
    new.lesson_id     := old.lesson_id;
    new.status        := 'sent';           -- пересдача снова уходит на проверку
    new.tutor_comment := old.tutor_comment;
    new.score         := old.score;
    new.created_at    := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists submissions_guard on public.submissions;
create trigger submissions_guard
  before insert or update on public.submissions
  for each row execute function public.guard_submission();

-- ---------- Row Level Security ----------

alter table public.groups      enable row level security;
alter table public.profiles    enable row level security;
alter table public.modules     enable row level security;
alter table public.lessons     enable row level security;
alter table public.submissions enable row level security;

-- groups
drop policy if exists groups_select on public.groups;
create policy groups_select on public.groups for select to authenticated
  using (public.is_tutor() or id = public.my_group());
drop policy if exists groups_write on public.groups;
create policy groups_write on public.groups for all to authenticated
  using (public.is_tutor()) with check (public.is_tutor());

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_tutor());
drop policy if exists profiles_write on public.profiles;
create policy profiles_write on public.profiles for update to authenticated
  using (public.is_tutor()) with check (public.is_tutor());
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete to authenticated
  using (public.is_tutor());

-- modules
drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules for select to authenticated
  using (public.is_tutor() or group_id = public.my_group());
drop policy if exists modules_write on public.modules;
create policy modules_write on public.modules for all to authenticated
  using (public.is_tutor()) with check (public.is_tutor());

-- lessons
drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons for select to authenticated
  using (
    public.is_tutor()
    or (published and exists (
          select 1 from public.modules m
          where m.id = module_id and m.group_id = public.my_group()))
  );
drop policy if exists lessons_write on public.lessons;
create policy lessons_write on public.lessons for all to authenticated
  using (public.is_tutor()) with check (public.is_tutor());

-- submissions
drop policy if exists submissions_select on public.submissions;
create policy submissions_select on public.submissions for select to authenticated
  using (student_id = auth.uid() or public.is_tutor());

drop policy if exists submissions_insert on public.submissions;
create policy submissions_insert on public.submissions for insert to authenticated
  with check (
    public.is_tutor()
    or (student_id = auth.uid() and exists (
          select 1 from public.lessons l
          join public.modules m on m.id = l.module_id
          where l.id = lesson_id and l.published and m.group_id = public.my_group()))
  );

drop policy if exists submissions_update on public.submissions;
create policy submissions_update on public.submissions for update to authenticated
  using (student_id = auth.uid() or public.is_tutor())
  with check (student_id = auth.uid() or public.is_tutor());

drop policy if exists submissions_delete on public.submissions;
create policy submissions_delete on public.submissions for delete to authenticated
  using (public.is_tutor());

-- ---------- Явные права (обязательны для новых проектов Supabase с 2026 г.) ----------

grant usage on schema public to anon, authenticated;

revoke all on public.groups, public.profiles, public.modules, public.lessons, public.submissions from anon;
grant select, insert, update, delete
  on public.groups, public.profiles, public.modules, public.lessons, public.submissions
  to authenticated;

revoke execute on function public.is_tutor(), public.my_group(),
  public.handle_new_user(), public.guard_submission() from public, anon;
grant execute on function public.is_tutor(), public.my_group() to authenticated;
grant execute on function public.ping() to anon, authenticated;
