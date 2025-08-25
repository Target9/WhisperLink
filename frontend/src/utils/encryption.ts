import CryptoJS from 'crypto-js';

export const generateSecretKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

export const encryptMessage = (message: string, secretKey: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(message, secretKey);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

export const decryptMessage = (encryptedMessage: string, secretKey: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('Decryption failed - invalid key or corrupted message');
    }
    
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
};

export const validateAddress = (address: string): boolean => {
  // Basic address validation - you can customize this based on your requirements
  return address.length >= 3 && address.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(address);
};
