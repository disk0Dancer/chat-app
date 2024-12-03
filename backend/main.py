import json
import threading
from pubsub import PubSubClient

pubsub_client = PubSubClient()
SYSTEM_TOPIC = "login"
CHAT_TOPIC = "chat"

users = {}  # Structure: {login: {"topic": "chat_user_<login>"}}

# Create required topics
pubsub_client.create_topic(SYSTEM_TOPIC)
pubsub_client.create_topic(CHAT_TOPIC)


def process_system_message(message):
    """Process system commands like login, logout, and get_users."""
    command = json.loads(message.data.decode("utf-8"))
    print(f"System command received: {command}")
    response = {}
    action = command.get("action")
    login = command.get("login")

    if action == "login" and login:
        user_topic = f"chat_user_{login}"
        pubsub_client.create_topic(user_topic)
        users[login] = {"topic": user_topic}
        print(user_topic)

    elif action == "logout" and login:
        if login in users:
            del users[login]
            print(f"User {login} logged out.")

    pubsub_client.publish_message(SYSTEM_TOPIC, response)
    message.ack()


def process_chat_message(message):
    """Process chat messages and broadcast them to all users."""
    chat_message = json.loads(message.data.decode("utf-8"))
    print(f"Chat message received: {chat_message}")

    # Broadcast message to all user topics
    for user, data in users.items():
        pubsub_client.publish_message(data["topic"], chat_message)
    message.ack()


def start_listeners():
    """Start Pub/Sub listeners for system commands and chat messages."""
    threading.Thread(
        target=pubsub_client.listen_to_messages,
        args=(SYSTEM_TOPIC, process_system_message),
        daemon=True,
    ).start()
    threading.Thread(
        target=pubsub_client.listen_to_messages,
        args=(CHAT_TOPIC, process_chat_message),
        daemon=True,
    ).start()


if __name__ == "__main__":
    start_listeners()
