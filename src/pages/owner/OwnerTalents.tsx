import { useState } from "react";
import { it } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, ChevronRight } from "lucide-react";

const mockTalents = [
  { id: "1", name: "Giulia Rossi", city: "Milano", age: 25, skills: ["Modella", "Attrice"], rating: 4.8 },
  { id: "2", name: "Marco Bianchi", city: "Roma", age: 30, skills: ["Attore", "Doppiatore"], rating: 4.5 },
  { id: "3", name: "Sara Verdi", city: "Torino", age: 22, skills: ["Ballerina", "Modella"], rating: 4.9 },
  { id: "4", name: "Luca Ferrari", city: "Milano", age: 28, skills: ["Modello", "Influencer"], rating: 4.3 },
];

export const OwnerTalents = () => {
  const [search, setSearch] = useState("");

  const filteredTalents = mockTalents.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">
            {it.backoffice.talentDatabase}
          </h1>
          <p className="text-muted-foreground mt-1">
            Cerca e gestisci i talenti registrati
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={it.backoffice.searchTalents}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {it.common.filter}
        </Button>
      </div>

      {/* Talent grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTalents.map((talent) => (
          <Card key={talent.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-muted text-foreground">
                    {talent.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground truncate">
                      {talent.name}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {talent.city} • {talent.age} anni
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {talent.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-muted px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OwnerTalents;
