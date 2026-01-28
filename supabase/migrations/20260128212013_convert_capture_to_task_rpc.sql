create or replace function public.convert_capture_to_task(
  p_capture_id uuid,
  p_user_id uuid
)
returns public.tasks
language plpgsql
security definer
as $$
declare
  v_capture public.captures;
  v_task public.tasks;
begin
  -- Lock the capture row (prevents concurrent conversions)
  select *
  into v_capture
  from public.captures
  where id = p_capture_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'Capture not found';
  end if;

  -- If already converted, return existing task (idempotent)
  if v_capture.linked_task_id is not null then
    select *
    into v_task
    from public.tasks
    where id = v_capture.linked_task_id;

    return v_task;
  end if;

  -- Create task
  insert into public.tasks (
    user_id,
    title,
    status,
    priority,
    area
  )
  values (
    p_user_id,
    left(coalesce(v_capture.content, ''), 200),
    'todo',
    'medium',
    v_capture.area
  )
  returning * into v_task;

  -- Link capture → task (same transaction)
  update public.captures
  set
    linked_task_id = v_task.id,
    status = 'processed'
  where id = v_capture.id;

  return v_task;
end;
$$;

