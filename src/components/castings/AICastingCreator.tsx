import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAICasting, type AICastingResult } from "@/hooks/useAICasting";

const SUGGESTED_PROMPTS = [
  "Spot TV per brand di moda, servono 2 modelle donne 20-30 anni, alte almeno 175cm",
  "Film indipendente, cerco attore protagonista uomo 35-45 anni e una comparsa donna giovane",
  "Campagna pubblicitaria a Milano, 3 figuranti misti 25-40 anni con esperienza danza",
];

// Check Web Speech API support
const isSpeechSupported = typeof window !== "undefined" && 
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

interface AICastingCreatorProps {
  onCreated?: (castingId: string) => void;
  variant?: "card" | "bare";
}

export const AICastingCreator = ({ onCreated, variant = "card" }: AICastingCreatorProps = {}) => {
  const [prompt, setPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { generateCasting, createCastingFromAI, isGenerating, isCreating, isProcessing } = useAICasting();

  // Setup speech recognition
  useEffect(() => {
    if (!isSpeechSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim = transcript;
        }
      }
      setPrompt(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setPrompt("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isProcessing) return;
    const result = await generateCasting(prompt.trim());
    if (result) {
      const created = await createCastingFromAI(result);
      setPrompt("");
      if (created?.id) onCreated?.(created.id);
    }
  };

  const containerClass =
    variant === "bare"
      ? "space-y-4"
      : "bg-card border border-border rounded-xl p-5 space-y-4";

  return (
    <div className={containerClass}>
      {/* Header */}
      {variant === "card" && (
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-base font-medium text-foreground">Crea casting con AI</h3>
          <Badge variant="outline" className="text-xs font-normal bg-primary/10 text-primary border-primary/20">
            Beta
          </Badge>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-3 items-start">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descrivi il casting che vuoi creare..."
          className="min-h-[80px] resize-none flex-1"
          disabled={isProcessing}
        />
        <div className="flex flex-col gap-2">
          {isSpeechSupported && (
            <Button
              size="icon"
              variant={isRecording ? "default" : "outline"}
              className={`h-10 w-10 rounded-full shrink-0 ${isRecording ? "animate-pulse" : ""}`}
              onClick={toggleRecording}
              disabled={isProcessing}
              title={isRecording ? "Ferma registrazione" : "Registra con voce"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isProcessing}
            className="rounded-full shrink-0 h-10 px-5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isGenerating ? "Genero..." : "Creo..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Genera
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggested prompts */}
      {!prompt && !isProcessing && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setPrompt(suggestion)}
              className="text-xs text-muted-foreground bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-full transition-colors text-left"
            >
              {suggestion.length > 70 ? suggestion.slice(0, 70) + "…" : suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
