/*
  # Fix User Creation Flow

  1. Changes
    - Drop existing trigger and function
    - Recreate function with better error handling
    - Recreate trigger with proper timing
    - Add missing RLS policies
  
  2. Security
    - Ensure proper RLS policies are in place
    - Add necessary security definer settings
*/

-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recreate function with better error handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

-- Recreate trigger
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- Ensure RLS policies are properly set
create policy "Allow users to update their own record"
  on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Allow users to insert their own record"
  on users for insert
  with check (auth.uid() = id);