/*
  # Add User Creation Trigger

  1. Changes
    - Add function to handle new user creation
    - Add trigger to automatically create user record when auth.users is updated
  
  2. Security
    - Function is owned by postgres to ensure it has proper permissions
*/

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();