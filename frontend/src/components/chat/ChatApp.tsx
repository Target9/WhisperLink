import React, { useState, useEffect, useCallback } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatInterface } from './ChatInterface';
import { NewChatDialog } from './NewChatDialog';
import { UsernameDialog } from './UsernameDialog';
import { EditKeyDialog } from './EditKeyDialog';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Button } from '../ui/button';
import { Plus, Shield, Wifi, WifiOff, User } from 'lucide-react';
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
    toggleChatEncryption,
    currentUsername,
    setUsername,
    receiveWebSocketMessage,
    clearAllData,
    updateChatKey
  } = useChat();

  const {
    isConnected,
    onlineUsers,
    sendMessage: sendWebSocketMessage,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    lastMessage,
    connectionError
  } = useWebSocket();

  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    isVisible: true,
    secretKeys: {},
    displayKeysInChats: false
  });
  const [editKeyDialog, setEditKeyDialog] = useState<{
    isOpen: boolean;
    chatId: string;
    chatAddress: string;
    currentKey: string;
  }>({
    isOpen: false,
    chatId: '',
    chatAddress: '',
    currentKey: ''
  });

  // Check if user needs to enter username
  const needsUsername = !currentUsername;

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'message' && lastMessage.message) {
      const receivedMessage = receiveWebSocketMessage(lastMessage.message);
      if (receivedMessage) {
        console.log('Received message from WebSocket:', receivedMessage);
      }
    }
  }, [lastMessage, receiveWebSocketMessage]);

  // Update settings when currentUsername changes
  useEffect(() => {
    setSettings(prev => ({ ...prev, currentUsername }));
  }, [currentUsername]);

  const handleUsernameSubmit = (username: string) => {
    setUsername(username);
    connectWebSocket(username);
  };

  const handleNewChat = (address: string, secretKey: string) => {
    createChat(address, secretKey);
  };

  const handleSendMessage = (content: string) => {
    const activeChat = getActiveChat();
    if (activeChat) {
      console.log('Sending message:', {
        content: content.substring(0, 50) + '...',
        address: activeChat.address,
        secretKey: activeChat.secretKey ? 'present' : 'missing',
        currentUsername
      });
      
      // Create and store the message locally first
      const message = sendMessage(content, activeChat.address, activeChat.secretKey);
      console.log('Local message created:', {
        id: message.id,
        sender: message.sender,
        isEncrypted: message.isEncrypted,
        contentLength: message.content.length
      });
      
      // Send the encrypted message via WebSocket
      sendWebSocketMessage(message.content, activeChat.address, message.isEncrypted);
    }
  };

  const handleDecryptMessage = useCallback((messageId: string): string => {
    // Check if we already have a cached result for this message
    if (decryptedMessages[messageId]) {
      return decryptedMessages[messageId];
    }

    try {
      const decryptedContent = decryptMessageInChat(messageId, activeChatId!);
      setDecryptedMessages(prev => ({
        ...prev,
        [messageId]: decryptedContent
      }));
      return decryptedContent;
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to decrypt message';
      setDecryptedMessages(prev => ({
        ...prev,
        [messageId]: errorMessage
      }));
      return errorMessage;
    }
  }, [decryptedMessages, activeChatId, decryptMessageInChat]);

  const handleFixKey = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setEditKeyDialog({
        isOpen: true,
        chatId: chat.id,
        chatAddress: chat.address,
        currentKey: chat.secretKey
      });
    }
  }, [chats]);

  const handleSaveKey = useCallback((newKey: string) => {
    updateChatKey(editKeyDialog.chatId, newKey);
    
    // Clear decrypted messages for this chat to force re-decryption
    setDecryptedMessages(prev => {
      const newState = { ...prev };
      const chat = chats.find(c => c.id === editKeyDialog.chatId);
      if (chat) {
        chat.messages.forEach(msg => {
          delete newState[msg.id];
        });
      }
      return newState;
    });
    
    // Close the dialog
    setEditKeyDialog(prev => ({ ...prev, isOpen: false }));
  }, [editKeyDialog.chatId, updateChatKey, chats]);

  const handleCloseEditKeyDialog = useCallback(() => {
    setEditKeyDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleEditMessage = useCallback((messageId: string, newContent: string) => {
    if (activeChatId) {
      try {
        editMessage(messageId, newContent, activeChatId);
        console.log('Message edited successfully:', messageId);
      } catch (error) {
        console.error('Failed to edit message:', error);
      }
    }
  }, [activeChatId, editMessage]);

  const handleDeleteMessage = useCallback((messageId: string) => {
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
  }, [activeChatId, deleteMessage]);

  const handleChatSelect = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const handleDeleteChat = useCallback((chatId: string) => {
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
  }, [deleteChat, chats]);

  const handleToggleEncryption = useCallback((chatId: string) => {
    toggleChatEncryption(chatId);
    
    // Clear decrypted messages for this chat to force re-decryption
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
  }, [toggleChatEncryption, chats]);

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

  const handleDisconnect = () => {
    if (isConnected) {
      disconnectWebSocket();
      clearAllData();
    } else {
      // Reconnect if currently disconnected
      if (currentUsername) {
        connectWebSocket(currentUsername);
      }
    }
  };

  const activeChat = getActiveChat();



  return (
    <div className="flex h-screen bg-background">
      {/* Username Dialog */}
      <UsernameDialog 
        isOpen={needsUsername} 
        onSubmit={handleUsernameSubmit} 
      />

      {/* Edit Key Dialog */}
      <EditKeyDialog
        isOpen={editKeyDialog.isOpen}
        onClose={handleCloseEditKeyDialog}
        onSave={handleSaveKey}
        currentKey={editKeyDialog.currentKey}
        chatAddress={editKeyDialog.chatAddress}
      />

      {/* Connection Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {currentUsername && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                {currentUsername}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onlineUsers.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {onlineUsers.length} online
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDisconnect}
            >
              {isConnected ? 'Disconnect' : 'Reconnect'}
            </Button>
          </div>
        </div>
        {connectionError && (
          <div className="px-4 pb-2">
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">
              {connectionError}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="pt-16">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onToggleEncryption={handleToggleEncryption}
          onEditKey={handleFixKey}
          groups={groups}
          settings={settings}
          onCreateGroup={handleCreateGroup}
          onUpdateGroup={handleUpdateGroup}
          onDeleteGroup={handleDeleteGroup}
          onSettingsChange={handleSettingsChange}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col pt-16">
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
                onlineUsers={onlineUsers}
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
              onFixKey={activeChat ? () => handleFixKey(activeChat.id) : undefined}
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
