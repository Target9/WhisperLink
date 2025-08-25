import logging
import sys
import uvicorn

# Always configure logging handlers and format at startup
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s:%(name)s:%(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


# Import routers, sorted alphabetically by their alias for clarity
#from modules.Auth.index import router as auth_router


# Include routers with improved, more descriptive tags
#app.include_router(auth_router, tags=["Auth"])



if __name__ == "__main__":
    uvicorn_config = {
        "app": "app:app",
        "host": args.host,
        "port": args.port,
        "reload": args.debug,
    }
    
    uvicorn.run(**uvicorn_config)