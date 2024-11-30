from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from connection import ConnectionManager

class App:
    def __init__(self):
        self.api = FastAPI()
        self.connection_manager = ConnectionManager()

        self.api.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )