import os
import json
from google.cloud import pubsub_v1


class PubSubClient:
    def __init__(self, project_id="chat"):
        self.project_id = project_id
        self.publisher = pubsub_v1.PublisherClient()
        self.subscriber = pubsub_v1.SubscriberClient()
        os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"

    def create_topic(self, topic_id: str):
        """Create a new Pub/Sub topic."""
        topic_path = self.publisher.topic_path(self.project_id, topic_id)
        try:
            self.publisher.create_topic(request={"name": topic_path})
            print(f"Topic created: {topic_id}")
        except Exception as e:
            print(f"Topic already exists or failed: {e}")
        return topic_path

    def publish_message(self, topic_id: str, message: dict):
        """Publish a message to a topic."""
        topic_path = self.publisher.topic_path(self.project_id, topic_id)
        data = json.dumps(message).encode("utf-8")
        future = self.publisher.publish(topic_path, data)
        print(f"Published message ID: {future.result()}")

    def listen_to_messages(self, topic_id: str, callback):
        """Listen to messages on a subscription."""
        subscription_id = f"{topic_id}_sub"
        topic_path = self.publisher.topic_path(self.project_id, topic_id)
        subscription_path = self.subscriber.subscription_path(
            self.project_id, subscription_id
        )

        try:
            self.subscriber.create_subscription(
                request={"name": subscription_path, "topic": topic_path}
            )
        except Exception:
            pass

        streaming_pull_future = self.subscriber.subscribe(
            subscription_path, callback=callback
        )
        print(f"Listening on subscription: {subscription_id}")
        try:
            streaming_pull_future.result()
        except Exception as e:
            print(f"Stopped listening: {e}")
            streaming_pull_future.cancel()
