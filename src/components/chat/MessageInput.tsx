
import React, { useState, useRef, useEffect } from "react";
import { useMessages } from "@/contexts/MessageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  channelId?: string;
  userId?: string;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  channelId,
  userId,
  placeholder = "Type your message...",
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const {
    sendChannelMessage,
    sendDirectMessage,
    setChannelTyping,
    setDirectTyping,
  } = useMessages();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicator
  useEffect(() => {
    if (!message) {
      if (isTyping) {
        setIsTyping(false);
        
        if (channelId) {
          setChannelTyping(channelId, false);
        } else if (userId) {
          setDirectTyping(userId, false);
        }
      }
      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      
      if (channelId) {
        setChannelTyping(channelId, true);
      } else if (userId) {
        setDirectTyping(userId, true);
      }
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      
      if (channelId) {
        setChannelTyping(channelId, false);
      } else if (userId) {
        setDirectTyping(userId, false);
      }
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, channelId, userId, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      let success = false;

      if (channelId) {
        success = await sendChannelMessage(channelId, message);
      } else if (userId) {
        success = await sendDirectMessage(userId, message);
      }

      if (success) {
        setMessage("");
        textareaRef.current?.focus();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-12 max-h-32 resize-y pr-10"
            rows={1}
          />
          <Button
            size="icon"
            variant="ghost"
            type="button"
            className="absolute right-2 bottom-2 h-6 w-6 text-muted-foreground"
            disabled={true} // Disabled for this implementation
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            className="text-muted-foreground"
            disabled={true} // Disabled for this implementation
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button 
            type="button" 
            onClick={handleSendMessage} 
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
