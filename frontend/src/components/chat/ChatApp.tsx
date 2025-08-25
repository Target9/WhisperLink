import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatInterface } from './ChatInterface';
import { NewChatDialog } from './NewChatDialog';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/button';
import { Plus, Shield } from 'lucide-react';

export const ChatApp: React.FC = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    createChat,
    sendMessage,
    decryptMessageInChat,
    getActiveChat,
    deleteChat
  } = useChat();

  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});

  const handleNewChat = (address: string, secretKey: string) => {
    createChat(address, secretKey);
  };

  const handleSendMessage = (content: string) => {
    const activeChat = getActiveChat();
    if (activeChat) {
      sendMessage(content, activeChat.address, activeChat.secretKey);
    }
  };

  const handleDecryptMessage = (messageId: string): string => {
    try {
      const decryptedContent = decryptMessageInChat(messageId, activeChatId!);
      setDecryptedMessages(prev => ({
        ...prev,
        [messageId]: decryptedContent
      }));
      return decryptedContent;
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return 'Failed to decrypt message';
    }
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    // Clear decrypted messages for this chat
    setDecryptedMessages(prev => {
      const newState = { ...prev };
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        chat.messages.forEach(msg => {
          delete newState[msg.id];
        });
      }
      return newState;
    });
  };

  const activeChat = getActiveChat();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onChatSelect={handleChatSelect}
        onNewChat={() => {}} // This will be handled by the dialog
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {chats.length === 0 ? (
          // Welcome screen when no chats exist
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Welcome to WhisperLink</h1>
                <p className="text-muted-foreground">
                  Start your first encrypted conversation to experience secure messaging
                </p>
              </div>
              <NewChatDialog
                onNewChat={handleNewChat}
                trigger={
                  <Button size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Start Your First Chat
                  </Button>
                }
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>🔒 Messages are encrypted with AES-256</p>
                <p>🔑 Each chat has its own secret key</p>
                <p>🛡️ Only you and your recipient can read messages</p>
              </div>
            </div>
          </div>
        ) : (
          // Chat interface when chats exist
          <>
            <ChatInterface
              chat={activeChat}
              onSendMessage={handleSendMessage}
              onDecryptMessage={handleDecryptMessage}
              decryptedMessages={decryptedMessages}
            />
            
            {/* Floating New Chat Button */}
            <div className="absolute bottom-6 right-6">
              <NewChatDialog
                onNewChat={handleNewChat}
                trigger={
                  <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                    <Plus className="h-5 w-5" />
                  </Button>
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
