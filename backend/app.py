from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from typing import Optional, Dict, List
from pydantic import BaseModel, Field

import logging


class User(BaseModel):
    login: str


class Message(BaseModel):
    message: str
    user: User
    message_id: str
    time: Optional[str] = ""


class ApplicationUsers(BaseModel):
    users: Dict[str, User] = Field(default_factory=dict)

    def add_user(self, user: User) -> bool:
        if user.login not in self.users:
            self.users[user.login] = user
            return True
        return False

    def get_users(self) -> List[str]:
        return list(self.users.keys())

    def get_user(self, login: str) -> User:
        return self.users.get(login, None)

    def remove_user(self, user: User) -> bool:
        if user.login in self.users:
            self.users.pop(user.login)
            return True
        return False


class ChatHistory(BaseModel):
    messages: Dict[str, Message] = Field(default_factory=dict)

    def add_message(self, message: Message) -> bool:
        if len(message.message_id) > 0:
            self.messages[message.message_id] = message
            return True
        return False

    def get_messages(self) -> List[Message]:
        return list(self.messages.values())

    def get_message(self, message_id: str) -> Message:
        return self.messages.get(message_id, None)

    def remove_message(self, message: Message) -> bool:
        if message.message_id in self.messages:
            self.messages.pop(message.message_id)
            return True
        return False


class Application:
    def __init__(self):
        self.api = FastAPI()
        self.api.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        self.manager = ApplicationUsers()
        self.history = ChatHistory()

        logging.basicConfig(
            filename="chat_app.log",
            level=logging.INFO,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        )
        self.logger = logging.getLogger(__name__)
