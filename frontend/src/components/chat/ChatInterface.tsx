import React, { useState, useRef, useEffect } from 'react';
import type { Chat, Message } from '../../types';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { MessageCircle, Shield, Key } from 'lucide-react';

interface ChatInterfaceProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  onDecryptMessage: (messageId: string) => string;
  decryptedMessages: Record<string, string>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chat,
  onSendMessage,
  onDecryptMessage,
  decryptedMessages
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
      <div className="flex-1 flex items-center justify-center">
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
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">{chat.address}</h2>
            <p className="text-xs text-muted-foreground">
              {chat.messages.length} messages • Created {chat.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Key className="h-3 w-3 mr-1" />
            Secret Key
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending an encrypted message
              </p>
            </div>
          ) : (
            chat.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwnMessage={message.sender === 'me'}
                isDecrypted={!!decryptedMessages[message.id]}
                decryptedContent={decryptedMessages[message.id]}
                onDecrypt={() => onDecryptMessage(message.id)}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        placeholder={`Send encrypted message to ${chat.address}...`}
      />
    </div>
  );
};
