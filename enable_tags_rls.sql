-- Enable RLS on tags table if not already enabled (idempotent usually, but explicit alter is good)
alter table tags enable row level security;

-- Create policy for public read access if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'tags' 
    and policyname = 'Public read access'
  ) then
    create policy "Public read access"
      on tags for select
      using ( true );
  end if;
end
$$;
