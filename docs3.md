# Отчёт по практическому заданию: Чат на WebSockets
# Автор: Чураков Григорий

# Цель работы
1.	Разработать чат-приложение с использованием WebSocket.
2.	Реализовать клиент-серверную архитектуру:
	-	Серверная часть на python.
	-	Клиентская часть на React.
3.	Внедрить функционал:
	-	Отображение сообщений от всех участников.
  -	Идентификация клиентов по логину.

<img width="674" alt="image" src="https://github.com/user-attachments/assets/379b7dcd-7ea6-48a1-82b7-7c3c67dbeb87" />


# Архитектура приложения

## Сервер

Серверная часть реализована на Python и поддерживает двустороннюю коммуникацию через WebSocket.

Основные элементы

1.	WebSocket эндпоинт:
Обрабатывает подключения клиентов и маршрутизацию сообщений.
```python
@app.api.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await app.manager.connect(websocket)
    now = datetime.now()
    current_time = datetime.now().strftime("%H:%M")
    try:
        while True:
            data = await websocket.receive_json() 
            
            if "login" in data and data["login"] not in app.manager.users.values():
                app.manager.users[client_id] = data["login"]
                message = {
                    "time": current_time,
                    "clientId": client_id,
                    "message": "Online",
                    "login": app.manager.users[client_id],
                }
                await app.manager.broadcast(json.dumps(message))
                continue
            
            if "message" in data:
            
                # await app.manager.send_personal_message(f"You wrote: {data}", websocket)
                message = {
                    "time": current_time,
                    "clientId": client_id,
                    "message": data["message"], 
                    "login": app.manager.users[client_id],
                }
                await app.manager.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        app.manager.disconnect(websocket)
        message = {
            "time": current_time,
            "clientId": client_id,
            "message": "Offline",
            "login": app.manager.users[client_id],
        }
        app.manager.users.pop(client_id)
        await app.manager.broadcast(json.dumps(message))

```

2.	Менеджер пользователей:
Управляет подключёнными клиентами и их идентификаторами.

```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.users: Dict[int, str] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
    
    @staticmethod
    async def send_personal_message(message: str, websocket: WebSocket):
        await websocket.send_text(message)
```

## Клиент

Клиентская часть реализована на React. Обеспечивает подключение к серверу, отправку сообщений и отображение чата.

#### Логика подключения

Клиент подключается к серверу через WebSocket:
 
```tsx
    const handleLogin = () => {
        const url = "ws://localhost:8000/ws/" + clientId;
        const ws = new WebSocket(url);
        ws.onopen = (event) => {
            ws.send(JSON.stringify({ clientId: clientId, login: login }));
        };

        // recieve message every start page
        ws.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setMessages((messages) => ([...messages, message]));
        };
        setWebsckt(ws);
        setIsLoggedIn(true);
        return () => ws.close();
    };
```

#### Отправка сообщений

Клиент отправляет сообщения в формате JSON:

```tsx
    const sendMessage = () => {
        websckt.send(JSON.stringify({message: message }));
        // recieve message every send message
        websckt.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setMessages([...messages, message]);
        };
        setMessage([]);
    };
```

#### Интерфейс

- Поле для ввода логина.
- Поле для ввода сообщения.
- Список сообщений.


Тестирование

1.	Подключение нескольких клиентов:
	•	Все клиенты успешно подключаются к серверу.
	•	Сообщения отображаются у всех участников.
2.	Обновление чата:
	•	Новые сообщения отображаются у всех клиентов.
3.	Обработка отключений:
	•	Сервер корректно удаляет отключённого клиента из списка активных соединений.
