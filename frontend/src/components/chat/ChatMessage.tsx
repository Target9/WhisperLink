import React, { useState } from 'react';
import type { Message } from '../../types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessageProps {
  message: Message;
  isDecrypted?: boolean;
  decryptedContent?: string;
  onDecrypt?: () => void;
  isOwnMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isDecrypted = false,
  decryptedContent,
  onDecrypt,
  isOwnMessage = false
}) => {
  const [showDecrypted, setShowDecrypted] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleToggleDecrypted = () => {
    if (isDecrypted) {
      setShowDecrypted(!showDecrypted);
    } else if (onDecrypt) {
      onDecrypt();
    }
  };

  return (
    <div className={cn(
      "flex w-full",
      isOwnMessage ? "justify-end" : "justify-start"
    )}>
      <Card className={cn(
        "max-w-[80%] p-3 space-y-2",
        isOwnMessage 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs opacity-70">
            {message.sender}
          </span>
          <div className="flex items-center gap-1">
            {message.isEncrypted && (
              <Badge variant="secondary" className="text-xs">
                {isDecrypted ? (
                  <>
                    <Unlock className="h-3 w-3 mr-1" />
                    Decrypted
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Encrypted
                  </>
                )}
              </Badge>
            )}
            <span className="text-xs opacity-70">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {message.isEncrypted && isDecrypted ? (
            <div className="space-y-1">
              <div className="text-sm">
                {showDecrypted ? decryptedContent : '••••••••••••••••'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleToggleDecrypted}
              >
                {showDecrypted ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </div>
          ) : message.isEncrypted ? (
            <div className="space-y-1">
              <div className="text-sm opacity-70">
                Encrypted message
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleToggleDecrypted}
              >
                <Unlock className="h-3 w-3 mr-1" />
                Decrypt
              </Button>
            </div>
          ) : (
            <div className="text-sm">
              {message.content}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
