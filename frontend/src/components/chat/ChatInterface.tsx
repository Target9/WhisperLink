import React, { useRef, useEffect } from 'react';
import type { Chat, UserSettings } from '../../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '../ui/scroll-area';
import { MessageCircle, Shield, Key } from 'lucide-react';

interface ChatInterfaceProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  onDecryptMessage: (messageId: string) => string;
  onFixKey?: () => void;
  decryptedMessages: Record<string, string>;
  settings: UserSettings;
  onToggleEncryption?: () => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chat,
  onSendMessage,
  onDecryptMessage,
  onFixKey,
  decryptedMessages,
  settings,
  onToggleEncryption,
  onEditMessage,
  onDeleteMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No chat selected</h3>
          <p className="text-sm text-muted-foreground">
            Choose a chat from the sidebar or start a new conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{chat.address}</h2>
            <p className="text-xs text-muted-foreground">
              {chat.messages.length} messages • Created {chat.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {settings.displayKeysInChats && (
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border">
              <Key className="h-3 w-3 text-muted-foreground" />
              <code className="text-xs font-mono text-muted-foreground">
                {chat.secretKey}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {chat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending an encrypted message
              </p>
            </div>
          ) : (
            chat.messages.map((message) => {
              const isOwn = message.sender === (settings.currentUsername || 'me');
              console.log('ChatInterface mapping message:', {
                messageId: message.id,
                sender: message.sender,
                currentUsername: settings.currentUsername,
                isOwn,
                contentLength: message.content.length
              });
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwn}
                  isDecrypted={!!decryptedMessages[message.id]}
                  decryptedContent={decryptedMessages[message.id]}
                  onDecrypt={() => onDecryptMessage(message.id)}
                  onFixKey={onFixKey}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput
          onSendMessage={onSendMessage}
          placeholder={`Send ${chat.isEncrypted ? 'encrypted' : ''} message to ${chat.address}...`}
          isEncrypted={chat.isEncrypted}
          onToggleEncryption={onToggleEncryption}
        />
      </div>
    </div>
  );
};
