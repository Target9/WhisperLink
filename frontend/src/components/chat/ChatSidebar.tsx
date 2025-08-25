import React, { useState } from 'react';
import type { Chat } from '../../types';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Trash2, MessageCircle, Plus, Settings, FolderPlus, Lock, Unlock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NewChatDialog } from './NewChatDialog';
import { SettingsDialog } from './SettingsDialog';
import { GroupsDialog } from './GroupsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: (address: string, secretKey: string) => void;
  onDeleteChat: (chatId: string) => void;
  onToggleEncryption?: (chatId: string) => void;
  groups?: any[];
  settings?: any;
  onCreateGroup?: (name: string, description: string, chatIds: string[]) => void;
  onUpdateGroup?: (groupId: string, name: string, description: string, chatIds: string[]) => void;
  onDeleteGroup?: (groupId: string) => void;
  onSettingsChange?: (settings: any) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onToggleEncryption,
  groups = [],
  settings,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onSettingsChange
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">WhisperLink</h2>
        <div className="flex items-center gap-1 ml-auto">
          {onCreateGroup && onUpdateGroup && onDeleteGroup && (
            <GroupsDialog
              chats={chats}
              groups={groups}
              onCreateGroup={onCreateGroup}
              onUpdateGroup={onUpdateGroup}
              onDeleteGroup={onDeleteGroup}
            />
          )}
          {onSettingsChange && settings && (
            <SettingsDialog
              chats={chats}
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          )}
          <NewChatDialog
            onNewChat={onNewChat}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="p-2">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">No chats yet</p>
              <p className="text-xs text-muted-foreground">
                Start a new conversation to begin
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-3 mb-1 group",
                    activeChatId === chat.id && "bg-accent"
                  )}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-sm truncate max-w-48">
                        {chat.address}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {chat.messages.length} messages
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(chat.createdAt)}
                      </span>
                      {onToggleEncryption && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {chat.isEncrypted ? (
                                      <Lock className="h-3 w-3" />
                                    ) : (
                                      <Unlock className="h-3 w-3" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {chat.isEncrypted ? 'Disable Encryption' : 'Enable Encryption'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {chat.isEncrypted 
                                        ? 'Are you sure you want to disable encryption for this chat? Messages will be sent in plain text.'
                                        : 'Are you sure you want to enable encryption for this chat? Messages will be encrypted using AES-256.'
                                      }
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onToggleEncryption(chat.id)}
                                    >
                                      {chat.isEncrypted ? 'Disable Encryption' : 'Enable Encryption'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{chat.isEncrypted ? 'Messages encrypted' : 'Messages not encrypted'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Button>
                <Separator className="my-1" />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
