-- Enable Row Level Security
alter table redirects enable row level security;

-- 1. Public Read Access (Critical for RedirectHandler to work for guests)
create policy "Redirects are viewable by everyone"
on redirects for select
using ( true );

-- 2. Authenticated Write Access (For Admins to add/delete redirects)
create policy "Authenticated users can insert redirects"
on redirects for insert
to authenticated
with check ( true );

create policy "Authenticated users can update redirects"
on redirects for update
to authenticated
using ( true );

create policy "Authenticated users can delete redirects"
on redirects for delete
to authenticated
using ( true );
