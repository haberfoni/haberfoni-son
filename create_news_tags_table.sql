-- Create news_tags junction table
-- Using bigint for IDs to match news and tags tables (assuming tags is also bigint based on news being bigint)
create table if not exists public.news_tags (
  news_id bigint references public.news(id) on delete cascade not null,
  tag_id bigint references public.tags(id) on delete cascade not null,
  primary key (news_id, tag_id)
);

-- Enable RLS
alter table public.news_tags enable row level security;

-- Create policies
create policy "Public read access for news_tags"
  on public.news_tags for select
  using (true);

create policy "Admin full access for news_tags"
  on public.news_tags for all
  using (auth.role() = 'authenticated');
