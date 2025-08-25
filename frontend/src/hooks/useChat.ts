import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Message } from '../types';
import { encryptMessage, decryptMessage, generateSecretKey } from '../utils/encryption';

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('whisperlink-chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        // Convert string dates back to Date objects and ensure isEncrypted field exists
        const chatsWithDates = parsedChats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          isEncrypted: chat.isEncrypted !== undefined ? chat.isEncrypted : true, // Default to true for existing chats
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(chatsWithDates);
      } catch (error) {
        console.error('Failed to load chats from localStorage:', error);
      }
    }

    // Load current username
    const savedUsername = localStorage.getItem('whisperlink-username');
    if (savedUsername) {
      setCurrentUsername(savedUsername);
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    localStorage.setItem('whisperlink-chats', JSON.stringify(chats));
  }, [chats]);

  // Save username to localStorage
  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem('whisperlink-username', currentUsername);
    }
  }, [currentUsername]);

  const setUsername = (username: string) => {
    setCurrentUsername(username);
  };

  const createChat = (address: string, secretKey?: string): Chat => {
    const newChat: Chat = {
      id: uuidv4(),
      address,
      secretKey: secretKey || '', // Don't generate a default key
      messages: [],
      createdAt: new Date(),
      isEncrypted: true // Default to encrypted
    };

    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
    return newChat;
  };

  const updateChatKey = (chatId: string, newKey: string): void => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        // Re-encrypt all unencrypted messages in this chat with the new key
        const updatedMessages = c.messages.map(msg => {
          if (!msg.isEncrypted && c.isEncrypted && newKey.trim() !== '') {
            // This message was stored as plain text, now encrypt it
            return {
              ...msg,
              content: encryptMessage(msg.content, newKey),
              isEncrypted: true
            };
          }
          return msg;
        });
        
        return { ...c, secretKey: newKey, messages: updatedMessages };
      }
      return c;
    }));
  };

  const sendMessage = (content: string, receiver: string, secretKey: string): Message => {
    // Find or create chat for this receiver
    let chat = chats.find(c => c.address === receiver);
    if (!chat) {
      chat = createChat(receiver, secretKey);
    }

    // Always encrypt the message for local storage if encryption is enabled
    const shouldEncrypt = chat.isEncrypted;
    const messageContent = shouldEncrypt ? encryptMessage(content, secretKey) : content;
    
    const message: Message = {
      id: uuidv4(),
      content: messageContent,
      sender: currentUsername || 'me',
      receiver,
      timestamp: new Date(),
      isEncrypted: shouldEncrypt
    };

    // Add message to chat
    setChats(prev => prev.map(c => 
      c.id === chat!.id 
        ? { ...c, messages: [...c.messages, message] }
        : c
    ));

    return message;
  };

  const receiveMessage = (encryptedContent: string, sender: string, chatId: string): Message => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const message: Message = {
      id: uuidv4(),
      content: encryptedContent,
      sender,
      receiver: currentUsername,
      timestamp: new Date(),
      isEncrypted: true
    };

    setChats(prev => prev.map(c => 
      c.id === chatId 
        ? { ...c, messages: [...c.messages, message] }
        : c
    ));

    return message;
  };

  const receiveWebSocketMessage = (messageData: any): Message | null => {
    const { id, sender, receiver, content, isEncrypted } = messageData;
    
    // Only process messages for current user
    if (receiver !== currentUsername) {
      return null;
    }

    // Find or create chat for this sender
    let chat = chats.find(c => c.address === sender);
    if (!chat) {
      chat = createChat(sender, ''); // Create chat without default key
    }

    // Check if message already exists to prevent duplicates
    const existingMessage = chat.messages.find(m => m.id === id);
    if (existingMessage) {
      return existingMessage;
    }

    // If this is a message from ourselves (sent via WebSocket), 
    // we need to make sure it's properly identified as our own message
    const messageSender = sender === currentUsername ? currentUsername : sender;

    // Store the message as received from WebSocket
    // The content is already encrypted if isEncrypted is true
    const message: Message = {
      id: id || uuidv4(), // Use server ID if provided, otherwise generate one
      content: content,
      sender: messageSender,
      receiver: currentUsername,
      timestamp: new Date(),
      isEncrypted: isEncrypted || false
    };

    // Add message to chat
    setChats(prev => prev.map(c => 
      c.id === chat!.id 
        ? { ...c, messages: [...c.messages, message] }
        : c
    ));

    return message;
  };

  const decryptMessageInChat = (messageId: string, chatId: string): string => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // If message is not encrypted, return the content as-is
    if (!message.isEncrypted) {
      return message.content;
    }

    // Check if we have a secret key
    if (!chat.secretKey || chat.secretKey.trim() === '') {
      throw new Error('No key specified - cannot decrypt message');
    }

    try {
      return decryptMessage(message.content, chat.secretKey);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  const autoDecryptMessage = (messageId: string, chatId: string): string | null => {
    try {
      return decryptMessageInChat(messageId, chatId);
    } catch (error) {
      // Return null for failed decryption - this will be handled by the UI
      return null;
    }
  };

  const editMessage = (messageId: string, newContent: string, chatId: string): void => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // If the message is encrypted, encrypt the new content
    const updatedContent = message.isEncrypted 
      ? encryptMessage(newContent, chat.secretKey) 
      : newContent;

    setChats(prev => prev.map(c => 
      c.id === chatId 
        ? {
            ...c,
            messages: c.messages.map(m => 
              m.id === messageId 
                ? { ...m, content: updatedContent }
                : m
            )
          }
        : c
    ));
  };

  const deleteMessage = (messageId: string, chatId: string): void => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    setChats(prev => prev.map(c => 
      c.id === chatId 
        ? {
            ...c,
            messages: c.messages.filter(m => m.id !== messageId)
          }
        : c
    ));
  };

  const getActiveChat = (): Chat | null => {
    return chats.find(c => c.id === activeChatId) || null;
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(chats.length > 1 ? chats[0].id : null);
    }
  };

  const toggleChatEncryption = (chatId: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const newEncryptionState = !c.isEncrypted;
        
        // If turning on encryption and we have a key, encrypt all plain text messages
        if (newEncryptionState && c.secretKey && c.secretKey.trim() !== '') {
          const updatedMessages = c.messages.map(msg => {
            if (!msg.isEncrypted) {
              return {
                ...msg,
                content: encryptMessage(msg.content, c.secretKey),
                isEncrypted: true
              };
            }
            return msg;
          });
          return { ...c, isEncrypted: newEncryptionState, messages: updatedMessages };
        }
        
        return { ...c, isEncrypted: newEncryptionState };
      }
      return c;
    }));
  };

  const clearAllData = () => {
    setChats([]);
    setActiveChatId(null);
    setCurrentUsername('');
    localStorage.removeItem('whisperlink-chats');
    localStorage.removeItem('whisperlink-username');
  };

  return {
    chats,
    activeChatId,
    setActiveChatId,
    currentUsername,
    setUsername,
    createChat,
    sendMessage,
    receiveMessage,
    receiveWebSocketMessage,
    decryptMessageInChat,
    autoDecryptMessage,
    updateChatKey,
    editMessage,
    deleteMessage,
    getActiveChat,
    deleteChat,
    toggleChatEncryption,
    clearAllData
  };
};
