import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";
import type { TalentEngagement } from "@/hooks/useTalentEngagements";

interface Props {
  engagement: TalentEngagement;
  isNew: boolean;
  onOpen: (engagement: TalentEngagement) => void;
}

export const EngagementCard = ({ engagement, isNew, onOpen }: Props) => {
  const date = engagement.dateISO ? new Date(engagement.dateISO) : null;

  return (
    <div className="relative">
      {isNew && (
        <span className="absolute -top-4 right-6 z-10 rounded-full bg-[#a30a2b] px-3 py-2 text-[15px] font-medium leading-none text-white">
          Nuovo
        </span>
      )}
      <button
        type="button"
        onClick={() => onOpen(engagement)}
        className="w-full text-left bg-white rounded-3xl pl-2 pr-6 md:pr-8 py-2 min-h-[144px] flex items-center gap-4 md:gap-8 transition-shadow hover:shadow-sm"
      >
        <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[#f4f0ec] p-2 flex flex-col items-center justify-center gap-1">
          <span className="text-[32px] md:text-[48px] leading-none text-[#1a1a1a]">
            {date ? format(date, "d") : "—"}
          </span>
          <span className="text-sm md:text-base font-medium text-[#787878] capitalize text-center">
            {date ? format(date, "MMMM", { locale: itLocale }) : "Data da definire"}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <h3 className="font-display uppercase text-base text-[#1a1a1a] truncate">
            {engagement.title}
          </h3>
          {engagement.city && (
            <p className="text-sm font-medium text-[#787878] truncate">{engagement.city}</p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-[#1a1a1a]" />
      </button>
    </div>
  );
};
