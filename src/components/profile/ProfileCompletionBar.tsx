 import { useState, useEffect } from "react";
 import { useProfileCompletion } from "@/hooks/useProfileCompletion";
 import { Progress } from "@/components/ui/progress";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { ChevronDown, ChevronUp, Plus } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 const STORAGE_KEY = "profile-completion-tips-hidden";
 
 export const ProfileCompletionBar = () => {
   const { percentage, emoji, message, missingSections, isLoading } = useProfileCompletion();
   const [showTips, setShowTips] = useState(true);
 
   useEffect(() => {
     const stored = localStorage.getItem(STORAGE_KEY);
     if (stored === "true") {
       setShowTips(false);
     }
   }, []);
 
   const toggleTips = () => {
     const newValue = !showTips;
     setShowTips(newValue);
     localStorage.setItem(STORAGE_KEY, (!newValue).toString());
   };
 
   const scrollToSection = (anchor: string) => {
     const element = document.getElementById(anchor);
     if (element) {
       element.scrollIntoView({ behavior: "smooth", block: "start" });
     }
   };
 
  if (isLoading) {
    return (
      <Card className="bg-[#ECE5DE] border-0">
        <CardContent className="py-4">
          <div className="h-16 animate-pulse bg-muted/50 rounded" />
        </CardContent>
      </Card>
    );
  }
 
   const scoreOutOf10 = Math.round(percentage / 10);
 
  return (
    <Card className="bg-[#ECE5DE] border-0">
      <CardContent className="py-4 space-y-3">
         {/* Header row */}
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <span className="font-semibold text-foreground">
               Forza del Profilo: {scoreOutOf10}/10
             </span>
             <span className="text-2xl" role="img" aria-label="completion level">
               {emoji}
             </span>
           </div>
           <Button
             variant="ghost"
             size="sm"
             onClick={toggleTips}
             className="text-muted-foreground hover:text-foreground"
           >
             {showTips ? (
               <>
                 <ChevronUp className="h-4 w-4 mr-1" />
                 Nascondi suggerimenti
               </>
             ) : (
               <>
                 <ChevronDown className="h-4 w-4 mr-1" />
                 Mostra suggerimenti
               </>
             )}
           </Button>
         </div>
 
          {/* Progress bar */}
          <div className="relative">
            <Progress value={percentage} className="h-3 bg-white" />
            <span className="absolute right-0 -top-5 text-xs text-muted-foreground">
              {percentage}%
            </span>
          </div>
 
         {/* Message */}
         <p className="text-sm text-muted-foreground">{message}</p>
 
         {/* Suggestions */}
         <div
           className={cn(
             "overflow-hidden transition-all duration-300",
             showTips && missingSections.length > 0 ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
           )}
         >
           <div className="flex flex-wrap gap-2 pt-2">
             {missingSections.slice(0, 6).map((section) => (
               <Button
                 key={section.key}
                 variant="outline"
                 size="sm"
                 onClick={() => scrollToSection(section.anchor)}
                 className="h-auto py-1 px-3 text-sm"
               >
                 <Plus className="h-3 w-3 mr-1" />
                 {section.label}
               </Button>
             ))}
           </div>
         </div>
       </CardContent>
     </Card>
   );
 };