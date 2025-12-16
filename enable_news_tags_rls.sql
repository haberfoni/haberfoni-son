-- Enable RLS on news_tags table
alter table news_tags enable row level security;

-- Create policy for public read access on news_tags
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'news_tags' 
    and policyname = 'Public read access'
  ) then
    create policy "Public read access"
      on news_tags for select
      using ( true );
  end if;
end
$$;
