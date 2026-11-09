-- 새 Supabase 프로젝트의 SQL Editor에서 한 번 실행합니다.
-- 비공개 파일은 이 프로젝트의 portfolio-private 버킷에만 업로드합니다.
begin;
create table public.portfolio_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;

create function public.portfolio_email() returns text language sql stable security definer set search_path = '' as $$
 select lower(email) from auth.users where id = auth.uid() and email_confirmed_at is not null;
$$;
create function public.is_portfolio_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.portfolio_admins where user_id=auth.uid());
$$;
create table public.access_requests (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null check(email=lower(email)),
 status text not null default 'pending' check(status in ('pending','approved')),
 created_at timestamptz not null default now()
);
alter table public.access_requests enable row level security;
revoke all on public.access_requests from anon, authenticated;
grant select,insert on public.access_requests to authenticated;
grant update(status) on public.access_requests to authenticated;
create policy "Read own request or administer" on public.access_requests for select to authenticated using(user_id=auth.uid() or public.is_portfolio_admin());
create policy "Request only for verified self" on public.access_requests for insert to authenticated with check(user_id=auth.uid() and email=public.portfolio_email() and status='pending');
create policy "Only admin changes approval" on public.access_requests for update to authenticated using(public.is_portfolio_admin()) with check(public.is_portfolio_admin());

create function public.can_download_portfolio() returns boolean language sql stable security definer set search_path = '' as $$
 select public.is_portfolio_admin() or exists(select 1 from public.access_requests where user_id=auth.uid() and email=public.portfolio_email() and status='approved');
$$;
revoke all on function public.portfolio_email(),public.is_portfolio_admin(),public.can_download_portfolio() from public;
grant execute on function public.portfolio_email(),public.is_portfolio_admin(),public.can_download_portfolio() to authenticated;

create table public.portfolio_files (
 id uuid primary key default gen_random_uuid(),
 category text not null,
 title text not null check(length(title)>0),
 object_path text not null unique,
 original_name text not null,
 created_at timestamptz not null default now()
);
alter table public.portfolio_files enable row level security;
revoke all on public.portfolio_files from anon, authenticated;
grant select,insert,delete on public.portfolio_files to authenticated;
create policy "Approved readers see file metadata" on public.portfolio_files for select to authenticated using(public.can_download_portfolio());
create policy "Admin registers file" on public.portfolio_files for insert to authenticated with check(public.is_portfolio_admin());
create policy "Admin deletes file" on public.portfolio_files for delete to authenticated using(public.is_portfolio_admin());

insert into storage.buckets(id,name,public,file_size_limit) values('portfolio-private','portfolio-private',false,52428800);
create policy "Portfolio approved download" on storage.objects for select to authenticated using(bucket_id='portfolio-private' and public.can_download_portfolio());
create policy "Portfolio admin upload" on storage.objects for insert to authenticated with check(bucket_id='portfolio-private' and public.is_portfolio_admin());
create policy "Portfolio admin delete" on storage.objects for delete to authenticated using(bucket_id='portfolio-private' and public.is_portfolio_admin());
commit;
