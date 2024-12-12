import json
import threading
from pika_client import *


users = {}  # {"<login>": "<uuid>"}


def login_callback(body):
    try:
        print(f"Получена команда входа: {body}")
        action = body.get("action")
        login = body.get("login")
        queue = body.get("queue")

        if action == "login" and login and queue:
            create_queue(queue)
            users[login] = {"queue": queue}
            print(f"Пользователь {login} вошел в систему с очередью {queue}")
        elif action == "logout" and login:
            if login in users:
                del users[login]
                print(f"Пользователь {login} вышел из системы.")
    except Exception as e:
        print(f"Ошибка в login_callback: {e}")


def chat_callback(body):
    try:
        print(f"Получено сообщение чата: {body}")
        for user, data in users.items():
            send_message(data["queue"], body)
    except Exception as e:
        print(f"Ошибка в chat_callback: {e}")


def start_listeners():
    """Start RabbitMQ listeners for system commands and chat messages."""
    print(1)
    threading.Thread(
        target=consume_messages,
        args=("login", login_callback),
    ).start()
    print(2)
    threading.Thread(
        target=consume_messages,
        args=("chat", chat_callback),
    ).start()
    print(3)

if __name__ == "__main__":
    start_listeners()