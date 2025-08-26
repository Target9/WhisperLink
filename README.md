# WhisperLink

A real-time encrypted messaging application with WebSocket support and username-based routing.

## Features

- 🔐 **End-to-End Encryption**: Messages are encrypted using AES-256 encryption
- 🌐 **Real-time Messaging**: WebSocket-based real-time communication
- 👤 **Username Management**: Unique usernames with duplicate prevention
- 💾 **Local Storage**: All chats and messages are stored locally in the browser
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- 🔑 **Secret Key Management**: Each chat has its own encryption key
- 👥 **Online Users**: See who's currently online and start chats with them

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + WebSockets + Python
- **Encryption**: AES-256 encryption for message security
- **Storage**: Browser localStorage for chat persistence

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   python app.py --debug
   ```

   The server will start on `http://192.168.12.7:8000` with debug mode enabled.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://192.168.12.7:5173`.

## Usage

1. **Connect to Server**: When you first access the application, you'll be prompted to enter a username
2. **Username Validation**: Usernames must be 3-20 characters and contain only letters, numbers, and underscores
3. **Start Chatting**: Once connected, you can see online users and start new encrypted conversations
4. **Message Encryption**: Each chat uses a unique secret key for encryption
5. **Real-time Updates**: Messages are delivered instantly via WebSocket connections

## API Endpoints

### HTTP Endpoints

- `GET /` - Server status
- `GET /users` - Get list of online users
- `POST /check-username` - Check if username is available

### WebSocket Endpoints

- `WS /ws/{username}` - WebSocket connection for real-time messaging

## Message Flow

1. User enters username and connects via WebSocket
2. Server validates username uniqueness
3. User can see online users and start chats
4. Messages are encrypted locally and sent via WebSocket
5. Server routes messages to intended recipients
6. Recipients decrypt messages using shared secret keys

## Security Features

- **Username Uniqueness**: No duplicate usernames allowed
- **Message Encryption**: AES-256 encryption for all messages
- **Local Storage**: Sensitive data stays in the browser
- **Secret Key Management**: Each chat has its own encryption key

## Development

### Backend Development

- Run with debug mode: `python app.py --debug`
- Access API docs: `http://192.168.12.7:8000/docs`
- WebSocket testing: Use browser dev tools or WebSocket clients

### Frontend Development

- Hot reload enabled with Vite
- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture

## File Structure

```
WhisperLink/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── server/                  # FastAPI backend
│   ├── app.py              # Main server file
│   └── requirements.txt    # Python dependencies
└── README.md
```

## Troubleshooting

### Common Issues

1. **Username Already Taken**: Try a different username
2. **Connection Lost**: Check if the backend server is running
3. **Messages Not Sending**: Verify WebSocket connection status
4. **Encryption Errors**: Ensure both users have the same secret key

### Debug Mode

Run the backend with debug mode to see detailed logs:
```bash
python app.py --debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
