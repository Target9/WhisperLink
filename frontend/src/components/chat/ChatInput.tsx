import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Lock, Unlock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isEncrypted?: boolean;
  onToggleEncryption?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder,
  isEncrypted = true,
  onToggleEncryption
}) => {
  const defaultPlaceholder = isEncrypted 
    ? "Type your encrypted message..." 
    : "Type your message...";
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || defaultPlaceholder}
            disabled={disabled}
            className="min-h-[60px] max-h-[120px] resize-none pr-10"
            rows={1}
          />
          {onToggleEncryption ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-3 h-6 w-6 hover:bg-muted/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isEncrypted ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Unlock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {isEncrypted ? 'Disable Encryption' : 'Enable Encryption'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {isEncrypted 
                            ? 'Are you sure you want to disable encryption for this chat? Messages will be sent in plain text.'
                            : 'Are you sure you want to enable encryption for this chat? Messages will be encrypted using AES-256.'
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={onToggleEncryption}
                        >
                          {isEncrypted ? 'Disable Encryption' : 'Enable Encryption'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isEncrypted ? 'Messages encrypted' : 'Messages not encrypted'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              {isEncrypted ? (
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              ) : (
                <Unlock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              )}
            </>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};
