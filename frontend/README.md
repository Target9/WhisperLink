# WhisperLink - Encrypted Chat Application

A secure, end-to-end encrypted chat application built with React, TypeScript, and AES-256 encryption.

## Features

### 🔐 End-to-End Encryption
- All messages are encrypted using AES-256 encryption
- Each chat has its own unique secret key
- Messages can only be decrypted by users with the correct secret key

### 💬 Chat Management
- Create new encrypted conversations with custom addresses
- Generate secure random keys or use your own
- View chat history with encrypted/decrypted message states
- Delete conversations and their associated data

### 🛡️ Security Features
- Client-side encryption (messages are never stored in plain text)
- Secret key generation with cryptographic randomness
- Address validation to prevent invalid inputs
- Secure key sharing between parties

## How It Works

### Starting a New Chat
1. Click "New Chat" or the "+" button
2. Enter the recipient's address (unique identifier)
3. Generate or enter a secret key
4. Share the secret key securely with your recipient
5. Start sending encrypted messages

### Sending Messages
- Type your message in the chat input
- Messages are automatically encrypted before being stored
- Only users with the same secret key can decrypt and read messages

### Receiving Messages
- When you receive an encrypted message, click "Decrypt" to reveal the content
- Decrypted messages can be shown/hidden for privacy
- Each message maintains its encryption status

## Technical Details

### Encryption
- Uses CryptoJS library for AES-256 encryption
- Each message is encrypted with the chat's secret key
- Decryption requires the exact same key used for encryption

### Data Storage
- All data is stored locally in the browser's localStorage
- No server-side storage of messages or keys
- Chat data persists between browser sessions

### Security Considerations
- Secret keys are never transmitted or stored on servers
- Messages are encrypted before being stored locally
- Users must securely share secret keys through external means
- Lost secret keys cannot be recovered

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the application

## Usage Tips

- **Keep your secret keys secure**: Never share them through insecure channels
- **Use strong keys**: Generate random keys for better security
- **Backup important conversations**: Export chat data if needed
- **Clear data when needed**: Delete chats to remove all associated data

## Security Notice

This application provides client-side encryption for messages. While this adds a layer of security, it's important to:

- Share secret keys through secure channels
- Keep your device secure
- Be aware that local storage can be accessed if your device is compromised
- Consider additional security measures for highly sensitive communications

## Technologies Used

- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- CryptoJS for encryption
- UUID for unique identifiers
