import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Clock, Video, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCastings } from "@/hooks/useCastings";
import { useCreateAuditionEvent } from "@/hooks/useAuditions";
import { it } from "@/lib/i18n";

const slotSchema = z.object({
  startTime: z.string().min(1, "Orario richiesto"),
  endTime: z.string().min(1, "Orario richiesto"),
  capacity: z.number().min(1).default(1),
});

const formSchema = z.object({
  castingId: z.string().min(1, "Seleziona un casting"),
  title: z.string().min(1, "Titolo richiesto"),
  date: z.string().min(1, "Data richiesta"),
  isVirtual: z.boolean().default(false),
  locationText: z.string().optional(),
  virtualLinkUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type SlotValues = z.infer<typeof slotSchema>;

interface CreateAuditionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAuditionDialog = ({
  open,
  onOpenChange,
}: CreateAuditionDialogProps) => {
  const { data: castings } = useCastings();
  const createAudition = useCreateAuditionEvent();
  const [slots, setSlots] = useState<SlotValues[]>([
    { startTime: "09:00", endTime: "09:30", capacity: 1 },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      castingId: "",
      title: "",
      date: "",
      isVirtual: false,
      locationText: "",
      virtualLinkUrl: "",
    },
  });

  const isVirtual = form.watch("isVirtual");
  const activeCastings = castings?.filter((c) => c.status === "active") || [];

  const addSlot = () => {
    const lastSlot = slots[slots.length - 1];
    const newStartTime = lastSlot?.endTime || "09:00";
    const [hours, minutes] = newStartTime.split(":").map(Number);
    const endHours = hours + (minutes >= 30 ? 1 : 0);
    const endMinutes = minutes >= 30 ? 0 : 30;
    const newEndTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    
    setSlots([...slots, { startTime: newStartTime, endTime: newEndTime, capacity: 1 }]);
  };

  const removeSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const updateSlot = (index: number, field: keyof SlotValues, value: string | number) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const onSubmit = async (values: FormValues) => {
    const date = values.date;
    
    // Calculate event start and end from slots
    const sortedSlots = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const eventStart = `${date}T${sortedSlots[0].startTime}:00`;
    const eventEnd = `${date}T${sortedSlots[sortedSlots.length - 1].endTime}:00`;

    // Prepare slots with full datetime
    const slotsData = slots.map((slot) => ({
      startDatetime: `${date}T${slot.startTime}:00`,
      endDatetime: `${date}T${slot.endTime}:00`,
      capacity: slot.capacity,
    }));

    await createAudition.mutateAsync({
      castingId: values.castingId,
      title: values.title,
      startDatetime: eventStart,
      endDatetime: eventEnd,
      isVirtual: values.isVirtual,
      locationText: values.isVirtual ? undefined : values.locationText,
      virtualLinkUrl: values.isVirtual ? values.virtualLinkUrl : undefined,
      slots: slotsData,
    });

    form.reset();
    setSlots([{ startTime: "09:00", endTime: "09:30", capacity: 1 }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo Provino</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Casting selection */}
            <FormField
              control={form.control}
              name="castingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Casting</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un casting" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeCastings.map((casting) => (
                        <SelectItem key={casting.id} value={casting.id}>
                          {casting.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo provino</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Provino giorno 1 - Milano" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Virtual toggle */}
            <FormField
              control={form.control}
              name="isVirtual"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Provino virtuale
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Il provino si svolgerà online
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Location or Virtual Link */}
            {isVirtual ? (
              <FormField
                control={form.control}
                name="virtualLinkUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Link videochiamata
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://meet.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="locationText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Luogo
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="es. Studio ABC, Via Roma 15, Milano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Time slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Slot orari
                </FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                  <Plus className="h-4 w-4 mr-1" />
                  Aggiungi slot
                </Button>
              </div>

              <div className="space-y-2">
                {slots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                        className="w-28"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                        className="w-28"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Posti:</span>
                      <Input
                        type="number"
                        min={1}
                        value={slot.capacity}
                        onChange={(e) => updateSlot(index, "capacity", parseInt(e.target.value) || 1)}
                        className="w-16"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlot(index)}
                      disabled={slots.length === 1}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {it.common.cancel}
              </Button>
              <Button type="submit" disabled={createAudition.isPending}>
                {createAudition.isPending ? it.common.loading : "Crea Provino"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
