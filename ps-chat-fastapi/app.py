from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from typing import Optional, Dict, List
from pydantic import BaseModel, Field


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

    def get_users(self) -> Dict[str, User]:
        return self.users

    def remove_user(self, user: User) -> bool:
        # TODO: remove user if he  not fetched msgs for a long time
        if user.login in self.users:
            self.users.remove(user.login)
            return True
        return False


class ChatHistory(BaseModel):
    messages: Dict[str, Message] = Field(default_factory=dict)

    def add_message(self, message: Message) -> bool:
        # assert len(message.message_id) > 0, "Message ID must be set"
        if len(message.message_id) > 0:
            self.messages[message.message_id] = message
            return True
        return False

    def get_messages(self) -> List[Message]:
        return list(self.messages.values())

    def remove_message(self, message: Message) -> bool:
        if message.message_id in self.messages:
            self.messages.remove(message.message_id)
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
