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
}

export interface EncryptedMessage {
  content: string;
  iv: string;
}
