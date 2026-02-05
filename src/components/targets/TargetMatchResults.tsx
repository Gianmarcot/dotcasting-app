import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { UserPlus, Users, Search, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CastingTarget } from "@/hooks/useTargets";
import { useTargetMatching, formatCriteriaSummary } from "@/hooks/useTargetMatching";
import { useAddToShortlist } from "@/hooks/useShortlist";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TargetMatchResultsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: CastingTarget | null;
}

export const TargetMatchResults = ({
  open,
  onOpenChange,
  target,
}: TargetMatchResultsProps) => {
  const { toast } = useToast();
  const [searchFilter, setSearchFilter] = useState("");
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  
  const { matchResults, isLoading } = useTargetMatching(target?.criteria_json || null);
  const addToShortlist = useAddToShortlist();

  // Fetch existing shortlist profile IDs
  const { data: shortlistProfileIds = [] } = useQuery({
    queryKey: ["shortlist-profile-ids", target?.id],
    queryFn: async () => {
      if (!target?.id) return [];
      const { data } = await supabase
        .from("target_shortlist")
        .select("profile_id")
        .eq("target_id", target.id);
      return data?.map(s => s.profile_id) || [];
    },
    enabled: !!target?.id && open,
  });

  const filteredResults = matchResults.filter((result) => {
    if (!searchFilter) return true;
    const search = searchFilter.toLowerCase();
    return (
      result.talent.first_name?.toLowerCase().includes(search) ||
      result.talent.last_name?.toLowerCase().includes(search) ||
      result.talent.city?.toLowerCase().includes(search)
    );
  });

  const handleAddToShortlist = async (profileId: string) => {
    if (!target) return;
    
    setAddingIds(prev => new Set(prev).add(profileId));
    try {
      await addToShortlist.mutateAsync({
        targetId: target.id,
        profileId,
      });
      toast({
        title: "Aggiunto alla shortlist",
        description: "Il talent è stato aggiunto alla shortlist",
      });
    } catch (error: any) {
      if (error?.code === "23505") {
        toast({
          title: "Già presente",
          description: "Questo talent è già nella shortlist",
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore",
          variant: "destructive",
        });
      }
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(profileId);
        return next;
      });
    }
  };

  const isInShortlist = (profileId: string) => shortlistProfileIds.includes(profileId);

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Match per "{target.name}"
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCriteriaSummary(target.criteria_json)}
          </p>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca nei risultati..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary">{filteredResults.length} talenti</Badge>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessun talent corrisponde ai criteri</p>
            </div>
          ) : (
            filteredResults.map((result) => {
              const inShortlist = isInShortlist(result.talent.id);
              const isAdding = addingIds.has(result.talent.id);
              
              return (
                <Card key={result.talent.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={result.talent.profile_photo_url || undefined} />
                        <AvatarFallback>
                          {result.talent.first_name?.[0]}
                          {result.talent.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {result.talent.first_name} {result.talent.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.talent.city || "Città non specificata"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.matchedCriteria.map((c) => (
                            <Badge key={c} variant="outline" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={result.matchScore >= 80 ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {Math.round(result.matchScore)}%
                      </Badge>
                      {inShortlist ? (
                        <Button variant="ghost" size="sm" disabled className="gap-1">
                          <Check className="h-4 w-4" />
                          Aggiunto
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToShortlist(result.talent.id)}
                          disabled={isAdding}
                          className="gap-1"
                        >
                          <UserPlus className="h-4 w-4" />
                          {isAdding ? "..." : "Aggiungi"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
