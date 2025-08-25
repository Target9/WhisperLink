import logging
import sys
import uvicorn
import json
from typing import Dict, Set, List
from datetime import datetime

# Always configure logging handlers and format at startup
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s:%(name)s:%(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import argparse

# Parse command line arguments
parser = argparse.ArgumentParser(description='FastAPI application with configurable options')
parser.add_argument('--debug', action='store_true', help='Enable debug mode and show API documentation')
parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to bind the server to')
parser.add_argument('--port', type=int, default=8000, help='Port to bind the server to')
args = parser.parse_args()

app = FastAPI(
    docs_url="/docs" if args.debug else None,
    redoc_url="/redoc" if args.debug else None,
)

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Data models
class Message(BaseModel):
    id: str
    content: str
    sender: str
    receiver: str
    timestamp: datetime
    isEncrypted: bool

class ChatMessage(BaseModel):
    content: str
    receiver: str
    isEncrypted: bool = True

class UsernameRequest(BaseModel):
    username: str

# Global state for managing connections and users
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # username -> websocket
        self.usernames: Set[str] = set()  # Set of active usernames
        self.messages: List[Message] = []  # Store all messages in memory

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[username] = websocket
        self.usernames.add(username)
        logging.info(f"User {username} connected")

    def disconnect(self, username: str):
        if username in self.active_connections:
            del self.active_connections[username]
        if username in self.usernames:
            self.usernames.remove(username)
        logging.info(f"User {username} disconnected")

    async def send_personal_message(self, message: str, username: str):
        if username in self.active_connections:
            await self.active_connections[username].send_text(message)

    async def broadcast(self, message: str, exclude_username: str = None):
        for username, connection in self.active_connections.items():
            if username != exclude_username:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logging.error(f"Failed to send message to {username}: {e}")

    def is_username_taken(self, username: str) -> bool:
        return username in self.usernames

    def get_online_users(self) -> List[str]:
        return list(self.usernames)

    def add_message(self, message: Message):
        self.messages.append(message)

    def get_messages_for_user(self, username: str) -> List[Message]:
        return [msg for msg in self.messages if msg.sender == username or msg.receiver == username]

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "WhisperLink Backend Server"}

@app.get("/users")
async def get_online_users():
    return {"users": manager.get_online_users()}

@app.post("/check-username")
async def check_username(request: UsernameRequest):
    is_taken = manager.is_username_taken(request.username)
    return {"username": request.username, "is_taken": is_taken}

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    # Check if username is already taken
    if manager.is_username_taken(username):
        await websocket.close(code=4000, reason="Username already taken")
        return

    await manager.connect(websocket, username)
    
    try:
        # Send welcome message
        welcome_message = {
            "type": "system",
            "content": f"Welcome {username}! You are now connected.",
            "timestamp": datetime.now().isoformat()
        }
        await websocket.send_text(json.dumps(welcome_message))

        # Send current online users
        users_message = {
            "type": "users",
            "users": manager.get_online_users()
        }
        await websocket.send_text(json.dumps(users_message))

        # Notify other users about new connection
        user_joined_message = {
            "type": "user_joined",
            "username": username,
            "timestamp": datetime.now().isoformat()
        }
        await manager.broadcast(json.dumps(user_joined_message), username)

        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "message":
                # Handle chat message
                chat_message = ChatMessage(**message_data)
                
                # Create message object
                message = Message(
                    id=f"msg_{datetime.now().timestamp()}",
                    content=chat_message.content,
                    sender=username,
                    receiver=chat_message.receiver,
                    timestamp=datetime.now(),
                    isEncrypted=chat_message.isEncrypted
                )
                
                # Store message
                manager.add_message(message)
                
                # Send message to receiver if online
                if chat_message.receiver in manager.active_connections:
                    message_payload = {
                        "type": "message",
                        "message": {
                            "id": message.id,
                            "content": message.content,
                            "sender": message.sender,
                            "receiver": message.receiver,
                            "timestamp": message.timestamp.isoformat(),
                            "isEncrypted": message.isEncrypted
                        }
                    }
                    await manager.send_personal_message(json.dumps(message_payload), chat_message.receiver)
                
                # Send confirmation to sender
                confirmation = {
                    "type": "message_sent",
                    "message_id": message.id,
                    "timestamp": datetime.now().isoformat()
                }
                await websocket.send_text(json.dumps(confirmation))
                
            elif message_data.get("type") == "ping":
                # Handle ping for connection health
                pong = {
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }
                await websocket.send_text(json.dumps(pong))

    except WebSocketDisconnect:
        manager.disconnect(username)
        # Notify other users about disconnection
        user_left_message = {
            "type": "user_left",
            "username": username,
            "timestamp": datetime.now().isoformat()
        }
        await manager.broadcast(json.dumps(user_left_message))

if __name__ == "__main__":
    uvicorn_config = {
        "app": "app:app",
        "host": args.host,
        "port": args.port,
        "reload": args.debug,
    }
    
    uvicorn.run(**uvicorn_config)