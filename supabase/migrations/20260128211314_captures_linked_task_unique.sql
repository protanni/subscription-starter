-- Prevent multiple captures pointing to the same task
-- Ensures data model consistency for capture → task conversion
create unique index if not exists captures_linked_task_id_unique
on public.captures(linked_task_id)
where linked_task_id is not null;
