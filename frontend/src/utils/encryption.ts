import CryptoJS from 'crypto-js';

export const generateSecretKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

export const encryptMessage = (message: string, secretKey: string): string => {
  try {
    console.log('Encrypting message with key:', secretKey.substring(0, 8) + '...');
    const encrypted = CryptoJS.AES.encrypt(message, secretKey);
    const result = encrypted.toString();
    console.log('Encryption successful, result length:', result.length);
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

export const decryptMessage = (encryptedMessage: string, secretKey: string): string => {
  // Check if secret key is provided
  if (!secretKey || secretKey.trim() === '') {
    throw new Error('No key specified - cannot decrypt message');
  }

  console.log('Attempting to decrypt message with key:', secretKey.substring(0, 8) + '...');
  console.log('Message to decrypt:', encryptedMessage.substring(0, 50) + '...');

  // Check if the message looks like it might be plain text (not encrypted)
  // Encrypted messages typically have a specific format with base64 encoding
  const isLikelyPlainText = !encryptedMessage.includes('U2F') && 
                           !encryptedMessage.includes('U2Fs') &&
                           encryptedMessage.length < 100 &&
                           !/^[A-Za-z0-9+/=]+$/.test(encryptedMessage);

  if (isLikelyPlainText) {
    console.log('Message appears to be plain text, returning as-is');
    // If it looks like plain text, return it as-is
    return encryptedMessage;
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      console.error('Decryption returned empty result');
      throw new Error('Decryption failed - invalid key or corrupted message');
    }
    
    console.log('Decryption successful:', result);
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
