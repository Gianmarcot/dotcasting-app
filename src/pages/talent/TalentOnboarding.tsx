import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Camera, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  User, 
  Sparkles,
  Film,
  Music,
  Mic2,
  Shirt,
  Dumbbell,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

// Talent category options
const TALENT_CATEGORIES = [
  { id: "model", label: "Modello/a", icon: Shirt, description: "Moda, beauty, commercial" },
  { id: "actor", label: "Attore/Attrice", icon: Film, description: "Cinema, TV, teatro" },
  { id: "dancer", label: "Ballerino/a", icon: Music, description: "Danza classica, moderna, hip-hop" },
  { id: "singer", label: "Cantante", icon: Mic2, description: "Voce solista, coro" },
  { id: "influencer", label: "Influencer", icon: Sparkles, description: "Social media, content creation" },
  { id: "fitness", label: "Fitness Model", icon: Dumbbell, description: "Sport, fitness, wellness" },
  { id: "extra", label: "Figurante", icon: Users, description: "Comparse, figurazione speciale" },
];

const STEPS = [
  { id: 1, title: "Seleziona i tuoi ruoli", description: "Che tipo di talento sei?" },
  { id: 2, title: "Informazioni base", description: "Raccontaci di te" },
  { id: 3, title: "Foto profilo", description: "Mostra il tuo volto" },
];

export const TalentOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Step 2: Basic info
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    city: "",
    country: "Italia",
  });
  
  // Step 3: Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const progress = (currentStep / STEPS.length) * 100;

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La foto non può superare i 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Il file deve essere un'immagine");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCategories.length > 0;
      case 2:
        return formData.firstName.trim() && formData.lastName.trim() && formData.birthDate;
      case 3:
        return true; // Photo is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      let photoUrl: string | null = null;
      
      // Upload photo if selected
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const filePath = `${user.id}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, photoFile, { upsert: true });
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Errore nel caricamento della foto. Puoi aggiungerla dopo.");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          photoUrl = publicUrl;
        }
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          birth_date: formData.birthDate || null,
          gender: formData.gender || null,
          city: formData.city || null,
          country: formData.country || null,
          talent_categories: selectedCategories,
          profile_photo_url: photoUrl,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);
      
      if (profileError) {
        console.error("Profile update error:", profileError);
        toast.error("Errore nel salvataggio del profilo");
        return;
      }
      
      toast.success("Onboarding completato! Benvenuto in dotCasting.");
      navigate("/talent", { replace: true });
      
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Si è verificato un errore. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="dotCasting" className="h-8 mx-auto" />
        </div>

        {/* Progress */}
        <div className="mb-8 bg-[#ECE5DE] rounded-lg p-4">
          <Progress value={progress} className="h-3 bg-white" />
          <div className="flex justify-between mt-3">
            {STEPS.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "text-xs transition-colors",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2",
                  currentStep > step.id 
                    ? "bg-primary text-primary-foreground" 
                    : currentStep === step.id 
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                )}>
                  {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Category Selection */}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TALENT_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon className={cn(
                        "w-6 h-6 mb-2",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                      <p className="font-medium text-sm">{category.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Basic Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Mario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Cognome *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Rossi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data di nascita *</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Genere</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Seleziona...</option>
                      <option value="male">Uomo</option>
                      <option value="female">Donna</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Città</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Milano"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Paese</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Italia"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Photo Upload */}
            {currentStep === 3 && (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <Avatar className="h-40 w-40">
                    <AvatarImage src={photoPreview || undefined} />
                    <AvatarFallback className="text-4xl bg-muted">
                      <User className="w-16 h-16 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Carica una foto professionale (opzionale)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: JPG, PNG. Massimo 5MB.
                  </p>
                </div>

                {photoPreview && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                  >
                    Rimuovi foto
                  </Button>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Indietro
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Avanti
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  {isLoading ? "Salvataggio..." : "Completa"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/talent")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Completa dopo
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentOnboarding;
