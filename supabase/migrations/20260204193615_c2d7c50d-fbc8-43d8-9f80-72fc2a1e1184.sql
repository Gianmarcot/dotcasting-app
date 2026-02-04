-- Allow talents to view audition slots they are booked into
CREATE POLICY "Talents can view their booked slots" 
ON public.audition_slots 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM audition_bookings 
    WHERE audition_bookings.audition_slot_id = audition_slots.id 
    AND audition_bookings.talent_user_id = auth.uid()
  )
);

-- Allow talents to view audition events for their booked slots
CREATE POLICY "Talents can view events for their bookings" 
ON public.audition_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM audition_slots 
    JOIN audition_bookings ON audition_bookings.audition_slot_id = audition_slots.id
    WHERE audition_slots.audition_event_id = audition_events.id 
    AND audition_bookings.talent_user_id = auth.uid()
  )
);