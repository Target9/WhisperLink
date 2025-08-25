import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Message } from '../types';
import { encryptMessage, decryptMessage, generateSecretKey } from '../utils/encryption';

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

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
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    localStorage.setItem('whisperlink-chats', JSON.stringify(chats));
  }, [chats]);

  const createChat = (address: string, secretKey?: string): Chat => {
    const newChat: Chat = {
      id: uuidv4(),
      address,
      secretKey: secretKey || generateSecretKey(),
      messages: [],
      createdAt: new Date(),
      isEncrypted: true // Default to encrypted
    };

    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
    return newChat;
  };

  const sendMessage = (content: string, receiver: string, secretKey: string): Message => {
    // Find or create chat for this receiver
    let chat = chats.find(c => c.address === receiver);
    if (!chat) {
      chat = createChat(receiver, secretKey);
    }

    // Determine if message should be encrypted based on chat setting
    const shouldEncrypt = chat.isEncrypted;
    const messageContent = shouldEncrypt ? encryptMessage(content, secretKey) : content;
    
    const message: Message = {
      id: uuidv4(),
      content: messageContent,
      sender: 'me',
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
      receiver: 'me',
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

  const decryptMessageInChat = (messageId: string, chatId: string): string => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const message = chat.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    return decryptMessage(message.content, chat.secretKey);
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
    setChats(prev => prev.map(c => 
      c.id === chatId 
        ? { ...c, isEncrypted: !c.isEncrypted }
        : c
    ));
  };

  return {
    chats,
    activeChatId,
    setActiveChatId,
    createChat,
    sendMessage,
    receiveMessage,
    decryptMessageInChat,
    editMessage,
    deleteMessage,
    getActiveChat,
    deleteChat,
    toggleChatEncryption
  };
};
