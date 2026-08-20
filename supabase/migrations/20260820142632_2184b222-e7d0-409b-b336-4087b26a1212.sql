revoke execute on function public.convert_guardian_profile_to_adult() from public;
revoke execute on function public.convert_guardian_profile_to_adult() from anon;
grant execute on function public.convert_guardian_profile_to_adult() to authenticated;