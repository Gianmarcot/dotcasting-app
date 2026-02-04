import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingStatus {
  isLoading: boolean;
  isOnboardingComplete: boolean;
  profile: {
    firstName: string | null;
    lastName: string | null;
    talentCategories: string[];
  } | null;
}

export const useOnboardingCheck = (): OnboardingStatus => {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [profile, setProfile] = useState<OnboardingStatus["profile"]>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      // Only check for talent users
      if (!user || authLoading || userRole !== "talent") {
        setIsLoading(false);
        setIsOnboardingComplete(true); // Non-talent users don't need onboarding
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, talent_categories, onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking onboarding status:", error);
          setIsOnboardingComplete(true); // Fail open to avoid blocking users
          return;
        }

        if (data) {
          setProfile({
            firstName: data.first_name,
            lastName: data.last_name,
            talentCategories: data.talent_categories || [],
          });
          setIsOnboardingComplete(data.onboarding_completed ?? false);
        } else {
          setIsOnboardingComplete(false);
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setIsOnboardingComplete(true); // Fail open
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [user, userRole, authLoading]);

  return { isLoading, isOnboardingComplete, profile };
};
