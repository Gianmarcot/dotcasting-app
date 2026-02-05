 import { useState, useEffect } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Badge } from "@/components/ui/badge";
 import { Pencil, Check, X, Loader2, Plus } from "lucide-react";
 import { useProfile } from "@/hooks/useProfile";
 import { useUpdateProfile } from "@/hooks/useUpdateProfile";
 import { toast } from "sonner";
 import { DRIVING_LICENSES } from "@/lib/profileOptions";
 
 export const WorkInfoSection = () => {
   const { data: profile } = useProfile();
   const updateProfile = useUpdateProfile();
   const [isEditing, setIsEditing] = useState(false);
 
   const [formData, setFormData] = useState({
     mainOccupation: "",
     hasMinorChildren: false,
   });
   const [workCities, setWorkCities] = useState<string[]>([]);
   const [newCity, setNewCity] = useState("");
   const [drivingLicenses, setDrivingLicenses] = useState<string[]>([]);
 
   useEffect(() => {
     if (profile) {
       setFormData({
         mainOccupation: profile.main_occupation || "",
         hasMinorChildren: profile.has_minor_children || false,
       });
       setWorkCities(profile.work_cities || []);
       setDrivingLicenses(profile.driving_licenses || []);
     }
   }, [profile]);
 
   const handleAddCity = () => {
     if (newCity.trim() && !workCities.includes(newCity.trim())) {
       setWorkCities([...workCities, newCity.trim()]);
       setNewCity("");
     }
   };
 
   const handleRemoveCity = (city: string) => {
     setWorkCities(workCities.filter(c => c !== city));
   };
 
   const handleLicenseToggle = (license: string) => {
     setDrivingLicenses(prev =>
       prev.includes(license)
         ? prev.filter(l => l !== license)
         : [...prev, license]
     );
   };
 
   const handleSave = async () => {
     try {
       await updateProfile.mutateAsync({
         main_occupation: formData.mainOccupation || null,
         has_minor_children: formData.hasMinorChildren,
         work_cities: workCities.length > 0 ? workCities : null,
         driving_licenses: drivingLicenses.length > 0 ? drivingLicenses : null,
       });
       setIsEditing(false);
       toast.success("Informazioni lavoro aggiornate!");
     } catch (error) {
       toast.error("Errore durante il salvataggio");
     }
   };
 
   const handleCancel = () => {
     if (profile) {
       setFormData({
         mainOccupation: profile.main_occupation || "",
         hasMinorChildren: profile.has_minor_children || false,
       });
       setWorkCities(profile.work_cities || []);
       setDrivingLicenses(profile.driving_licenses || []);
     }
     setIsEditing(false);
   };
 
   return (
     <Card className="border-0 shadow-sm">
       <CardHeader className="flex flex-row items-center justify-between pb-2">
         <CardTitle className="text-lg">Lavoro</CardTitle>
         {isEditing ? (
           <div className="flex gap-2">
             <Button size="sm" variant="ghost" onClick={handleCancel}>
               <X className="h-4 w-4" />
             </Button>
             <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
               {updateProfile.isPending ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Check className="h-4 w-4" />
               )}
             </Button>
           </div>
         ) : (
           <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
             <Pencil className="h-4 w-4" />
           </Button>
         )}
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Main Occupation */}
         <div className="space-y-2">
           <Label htmlFor="mainOccupation">Occupazione principale</Label>
           <Input
             id="mainOccupation"
             value={formData.mainOccupation}
             onChange={(e) => setFormData({...formData, mainOccupation: e.target.value})}
             disabled={!isEditing}
             placeholder="Es. Studente, Impiegato, Libero professionista"
           />
         </div>
 
         {/* Minor Children */}
         <div className="flex items-center space-x-2">
           <Checkbox
             id="hasMinorChildren"
             checked={formData.hasMinorChildren}
             onCheckedChange={(checked) => setFormData({...formData, hasMinorChildren: checked as boolean})}
             disabled={!isEditing}
           />
           <Label htmlFor="hasMinorChildren" className="font-normal">Ho figli minorenni</Label>
         </div>
 
         {/* Work Cities */}
         <div className="space-y-3">
           <Label>Città di partenza per lavori</Label>
           {isEditing && (
             <div className="flex gap-2">
               <Input
                 value={newCity}
                 onChange={(e) => setNewCity(e.target.value)}
                 placeholder="Aggiungi città"
                 onKeyPress={(e) => e.key === "Enter" && handleAddCity()}
               />
               <Button size="sm" variant="outline" onClick={handleAddCity}>
                 <Plus className="h-4 w-4" />
               </Button>
             </div>
           )}
           <div className="flex flex-wrap gap-2">
             {workCities.map(city => (
               <Badge key={city} variant="secondary" className="gap-1">
                 {city}
                 {isEditing && (
                   <button onClick={() => handleRemoveCity(city)} className="ml-1 hover:text-destructive">
                     <X className="h-3 w-3" />
                   </button>
                 )}
               </Badge>
             ))}
             {workCities.length === 0 && !isEditing && (
               <span className="text-sm text-muted-foreground">Nessuna città specificata</span>
             )}
           </div>
         </div>
 
         {/* Driving Licenses */}
         <div className="space-y-3">
           <Label>Patenti di guida</Label>
           <div className="flex flex-wrap gap-2">
             {DRIVING_LICENSES.map(license => (
               <div key={license} className="flex items-center space-x-1">
                 <Checkbox
                   id={`license-${license}`}
                   checked={drivingLicenses.includes(license)}
                   onCheckedChange={() => handleLicenseToggle(license)}
                   disabled={!isEditing}
                 />
                 <Label htmlFor={`license-${license}`} className="text-sm font-normal cursor-pointer">
                   {license}
                 </Label>
               </div>
             ))}
           </div>
         </div>
       </CardContent>
     </Card>
   );
 };