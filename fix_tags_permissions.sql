-- Give authenticated users (admins) full control over tags
create policy "Enable all access for authenticated users on tags"
on tags
for all
to authenticated
using (true)
with check (true);

-- Give authenticated users (admins) full control over news_tags
create policy "Enable all access for authenticated users on news_tags"
on news_tags
for all
to authenticated
using (true)
with check (true);
