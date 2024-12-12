import pika
import json
import logging

logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
    ]
)

logger = logging.getLogger(__name__)

def log(message):
    logger.info(message)

def create_channel(queue_name):
    params = pika.ConnectionParameters(
        host='localhost',
        port=5672,
    )
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=queue_name)
    return connection, channel

def send_message(queue_name, message):
    connection, channel = create_channel(queue_name)
    serialized_message = json.dumps(message)
    print(f"Отправка сообщения в очередь {queue_name}: {serialized_message}")
    channel.basic_publish(exchange='', routing_key=queue_name, body=serialized_message)
    connection.close()
    
    
def consume_messages(queue_name, callback):
    connection, channel = create_channel(queue_name)

    def on_message(ch, method, properties, body):
        try:
            print(f"Получено сообщение из очереди {queue_name}: {body}")
            if isinstance(body, bytes):
                body = body.decode("utf-8")
            message = json.loads(body)
            callback(message)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f"Ошибка при обработке сообщения из очереди {queue_name}: {e}")
            print(f"Сырой текст сообщения: {body}")

    channel.basic_consume(queue=queue_name, on_message_callback=on_message)
    print(f"Подписка на очередь {queue_name}")
    channel.start_consuming()        
    channel.basic_consume(queue=queue_name, on_message_callback=on_message)
    print(f"Listening on {queue_name}...")
    channel.start_consuming()
