create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  body text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  summary text not null default '',
  description text not null default '',
  category text not null default '',
  image_url text,
  technologies text[] not null default '{}',
  live_url text,
  repository_url text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null default '' check (char_length(phone) <= 40),
  company text not null default '' check (char_length(company) <= 160),
  service text not null default '' check (char_length(service) <= 120),
  budget text not null default '' check (char_length(budget) <= 80),
  deadline text not null default '' check (char_length(deadline) <= 80),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new' check (status in ('new', 'in_progress', 'contacted', 'closed')),
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  company text not null default '',
  quote text not null,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  cover_image_url text,
  seo_title text,
  seo_description text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'Nexvora Digital Solutions',
  contact_email text not null default 'hello@nexvora.com',
  phone text not null default '',
  location text not null default '',
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index projects_public_order_idx on public.projects (sort_order, created_at desc) where published;
create index services_public_order_idx on public.services (sort_order, created_at desc) where published;
create index inquiries_status_created_idx on public.inquiries (status, created_at desc);
create index blog_posts_public_date_idx on public.blog_posts (published_at desc) where published;

create trigger services_updated_at before update on public.services
for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger inquiries_updated_at before update on public.inquiries
for each row execute function public.set_updated_at();
create trigger testimonials_updated_at before update on public.testimonials
for each row execute function public.set_updated_at();
create trigger blog_posts_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.inquiries enable row level security;
alter table public.testimonials enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;

create policy "Profiles are visible to their owner or admins"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Published services are public"
on public.services for select to anon, authenticated
using (published or (select public.is_admin()));
create policy "Admins manage services"
on public.services for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published projects are public"
on public.projects for select to anon, authenticated
using (published or (select public.is_admin()));
create policy "Admins manage projects"
on public.projects for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Public may submit inquiries"
on public.inquiries for insert to anon, authenticated
with check (
  status = 'new'
  and admin_notes = ''
  and char_length(trim(name)) > 0
  and char_length(message) between 10 and 5000
);
create policy "Admins manage inquiries"
on public.inquiries for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published testimonials are public"
on public.testimonials for select to anon, authenticated
using (published or (select public.is_admin()));
create policy "Admins manage testimonials"
on public.testimonials for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published blog posts are public"
on public.blog_posts for select to anon, authenticated
using (published or (select public.is_admin()));
create policy "Admins manage blog posts"
on public.blog_posts for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Site settings are public to read"
on public.site_settings for select to anon, authenticated
using (true);
create policy "Admins manage site settings"
on public.site_settings for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.services, public.projects, public.testimonials, public.blog_posts, public.site_settings to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select, insert, update, delete on public.services, public.projects, public.testimonials, public.blog_posts, public.site_settings, public.profiles, public.inquiries to authenticated;
