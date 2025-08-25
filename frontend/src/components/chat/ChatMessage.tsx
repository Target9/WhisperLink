import React, { useEffect, useState } from 'react';
import type { Message } from '../../types';
import { Lock, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';

interface ChatMessageProps {
  message: Message;
  isDecrypted?: boolean;
  decryptedContent?: string;
  onDecrypt?: () => void;
  isOwnMessage?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isDecrypted = false,
  decryptedContent,
  onDecrypt,
  isOwnMessage = false,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Automatically decrypt if not already decrypted
  useEffect(() => {
    if (message.isEncrypted && !isDecrypted && onDecrypt) {
      onDecrypt();
    }
  }, [message.id, message.isEncrypted, isDecrypted, onDecrypt]);

  const handleEdit = () => {
    setEditContent(message.isEncrypted && isDecrypted ? decryptedContent || '' : message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== '') {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={cn(
          "group flex w-full px-4 py-1 hover:bg-muted/50 transition-colors",
          isOwnMessage ? "justify-end" : "justify-start"
        )}>
          <div className={cn(
            "flex max-w-[70%] gap-3",
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          )}>
            {/* Avatar */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
              isOwnMessage 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted-foreground/20 text-foreground"
            )}>
              {message.sender.charAt(0).toUpperCase()}
            </div>

            {/* Message Content */}
            <div className={cn(
              "flex flex-col min-w-0",
              isOwnMessage ? "items-end" : "items-start"
            )}>
              {/* Message Header */}
              <div className={cn(
                "flex items-center gap-2 mb-1",
                isOwnMessage ? "flex-row-reverse" : "flex-row"
              )}>
                {message.isEncrypted && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {message.sender}
                </span>
              </div>

              {/* Message Body */}
              <div className={cn(
                "text-sm leading-relaxed break-words",
                isOwnMessage ? "text-right" : "text-left"
              )}>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full min-h-[60px] p-2 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-foreground">
                    {message.isEncrypted && isDecrypted ? decryptedContent : message.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent>
        <ContextMenuItem onClick={handleEdit}>
          <Edit className="h-4 w-4" />
          Edit message
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete message
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
