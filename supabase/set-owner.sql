-- 홈페이지에서 본인 이메일 인증을 완료한 뒤 SQL Editor에서 실행합니다.
-- 홈페이지 방문자가 스스로 관리자가 될 수 있는 기능은 없습니다.
insert into public.portfolio_admins(user_id)
select id from auth.users
where lower(email)='mk0704love@naver.com' and email_confirmed_at is not null
on conflict do nothing;
-- 1행이 표시되어야 등록 완료입니다.
select a.user_id,u.email from public.portfolio_admins a join auth.users u on u.id=a.user_id;
