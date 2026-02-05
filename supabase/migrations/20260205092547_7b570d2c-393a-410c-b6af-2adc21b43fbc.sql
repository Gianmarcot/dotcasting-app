-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Talents can view their booked slots" ON public.audition_slots;

-- Create a new policy that allows talents to view ALL slots for events they are booked into
-- This enables them to select a different slot
CREATE POLICY "Talents can view slots for their booked events" 
ON public.audition_slots 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM audition_bookings ab
    JOIN audition_slots asl ON ab.audition_slot_id = asl.id
    WHERE asl.audition_event_id = audition_slots.audition_event_id
    AND ab.talent_user_id = auth.uid()
  )
);