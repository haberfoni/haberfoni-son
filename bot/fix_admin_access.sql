-- 1. Profiles tablosunu garantiye al
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now()
);

-- 2. RLS Politikaları
alter table public.profiles enable row level security;

-- Mevcut politikaları temizle (çakışma olmasın)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 3. Yeni üye olunca otomatik 'admin' yapma Trigger'ı
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'admin'); -- İlk etapta herkesi admin yap (kolay kurulum için)
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Eğer daha önce oluşturduğunuz bir kullanıcı varsa, onu admin yap:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'KULLANICI_UID_BURAYA';
