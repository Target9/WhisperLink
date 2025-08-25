import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatInterface } from './ChatInterface';
import { NewChatDialog } from './NewChatDialog';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/button';
import { Plus, Shield } from 'lucide-react';
import type { Group, UserSettings } from '../../types';

export const ChatApp: React.FC = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    createChat,
    sendMessage,
    decryptMessageInChat,
    editMessage,
    deleteMessage,
    getActiveChat,
    deleteChat,
    toggleChatEncryption
  } = useChat();

  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    isVisible: true,
    secretKeys: {},
    displayKeysInChats: false
  });

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

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (activeChatId) {
      try {
        editMessage(messageId, newContent, activeChatId);
        console.log('Message edited successfully:', messageId);
      } catch (error) {
        console.error('Failed to edit message:', error);
      }
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (activeChatId) {
      try {
        deleteMessage(messageId, activeChatId);
        console.log('Message deleted successfully:', messageId);
        
        // Also remove from decrypted messages
        setDecryptedMessages(prev => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
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

  const handleToggleEncryption = (chatId: string) => {
    toggleChatEncryption(chatId);
  };

  const handleCreateGroup = (name: string, description: string, chatIds: string[]) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      description,
      createdAt: new Date(),
      chatIds
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleUpdateGroup = (groupId: string, name: string, description: string, chatIds: string[]) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name, description, chatIds }
        : group
    ));
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const activeChat = getActiveChat();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onToggleEncryption={handleToggleEncryption}
        groups={groups}
        settings={settings}
        onCreateGroup={handleCreateGroup}
        onUpdateGroup={handleUpdateGroup}
        onDeleteGroup={handleDeleteGroup}
        onSettingsChange={handleSettingsChange}
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
              settings={settings}
              onToggleEncryption={activeChat ? () => handleToggleEncryption(activeChat.id) : undefined}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
            />
            

          </>
        )}
      </div>
    </div>
  );
};
