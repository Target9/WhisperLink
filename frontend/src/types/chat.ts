export interface Message {
  id: string;
  content: string;
  sender: string;
  receiver: string;
  timestamp: Date;
  isEncrypted: boolean;
}

export interface Chat {
  id: string;
  address: string;
  secretKey: string;
  messages: Message[];
  createdAt: Date;
  groupId?: string; // Optional group assignment
  isEncrypted: boolean; // Whether encryption is enabled for this chat
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  chatIds: string[];
}

export interface UserSettings {
  isVisible: boolean;
  secretKeys: Record<string, string>; // chatId -> secretKey mapping
  displayKeysInChats: boolean; // Toggle for displaying secret keys in chat interface
}

export interface EncryptedMessage {
  content: string;
  iv: string;
}
