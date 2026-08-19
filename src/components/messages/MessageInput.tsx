import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { ActionAttachPopover } from "@/components/messages/ActionAttachPopover";
import type { AttachedAction } from "@/hooks/useSendCommunication";

interface MessageInputProps {
  onSend: (message: string, action?: AttachedAction | null) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Abilita il comando per allegare un'azione alla comunicazione. */
  enableActions?: boolean;
}

export const MessageInput = ({
  onSend,
  disabled,
  placeholder = "Scrivi un messaggio...",
  enableActions = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<AttachedAction | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), action);
      setMessage("");
      setAction(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="border-t p-4 bg-background space-y-2">
      {enableActions && <ActionAttachPopover value={action} onChange={setAction} />}
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="resize-none min-h-[40px] max-h-[120px]"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
