# Отчёт по практическому заданию №6: Мессенджер на REST API
# Автор: Чураков Григорий

# Цель работы

1.	Создать чат-приложение с использованием REST API.
2.	Реализовать клиент-серверную архитектуру:
  -	Серверная часть на FastAPI.
  -	Клиентская часть на React.
3.	Внедрить функционал:
  -	Отображение сообщений сообщений.
  -	Сохранение сообщений на сервере.
  -	Отображение списка участников.
  -	Индетификация клиентов по логину
  -	Удаление сообщений пользователем.

# Архитектура приложения

![image](https://github.com/user-attachments/assets/394ecd0d-e9dc-47b0-becd-efdb0dff524c)


## Сервер

Серверная часть реализована на FastAPI и обеспечивает REST API для работы с сообщениями и пользователями.
Сервер обработатывает запросы клиентов.

### Основные модели

1.	Модель пользователя:
```python
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
```

### Эндпоинты API

OPENAPI spec: [http://localhost:8000/docs](http://localhost:8000/docs) 

1.	Добавление пользователя:
```python
@app.api.post("/login", status_code=200)
async def login(body: User, response: Response):
    if app.manager.add_user(body):
        return {"response": "Connected"}
    response.status_code = status.HTTP_400_BAD_REQUEST
    return {"response": "Choose another login"}
```

2. Удаление пользователя:
```python
@app.api.delete("/logout/{login}", status_code=200)
async def logout(login: str, response: Response):
    user = app.manager.get_user(login)
    if app.manager.remove_user(user):
        return {"response": "Disconnected"}
    response.status_code = status.HTTP_404_NOT_FOUND
    return {"response": "User not found"}
```

3.	Отправка сообщения:
```python
@app.api.post("/chat", status_code=201)
async def send(body: Message, response: Response):
    body.time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if app.history.add_message(body):
        app.logger.info(
            f"New message {body.message_id} from {body.user.login}: {body.message}"
        )
        return {"response": "Delivered"}
    response.status_code = status.HTTP_400_BAD_REQUEST
    return {"response": "Not delivered"}
```

4.	Получение всех сообщений:
```python
@app.api.get("/chat", status_code=200)
async def chat_history():
    return app.history.get_messages()
```

4.	Получение активных пользователей:
```python
@app.api.get("/users", status_code=200)
async def users():
    return app.manager.get_users()
```

5.	Удаление сообщения:
```python
@app.api.delete("/chat/{message_id}", status_code=201)
async def delete(message_id: str, response: Response):
    app.logger.info(
        f"Delete message {message_id}: {app.history.get_message(message_id)}"
    )
    message = app.history.get_message(message_id)
    if app.history.remove_message(message):
        return {"response": "Deleted"}
    response.status_code = status.HTTP_404_NOT_FOUND
    return {"response": "Message not found"}
```

## Клиент

Клиентская часть реализована на React и обеспечивает взаимодействие с сервером.


### Основные функции

1.	Авторизация пользователя:
```tsx
    const handleLogin = async () => {
        const url = 'http://localhost:8000/login';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login: login }),
        });
        if (response.ok) {
            setIsLoggedIn(true);
        }
    };

    const logout = async () => {
        const url = 'http://localhost:8000/logout/' + login;
        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (response.ok) {
            setIsLoggedIn(false);
        }
    };
```

2.	Отправка сообщения:
```tsx
    const sendMessage = async () => {
        const url = 'http://localhost:8000/chat';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: {
                    login: login,
                },
                message: message,
                message_id: uuid(),
            }),
        });
        if (response.ok) {
            setMessage(['']);
        } else {
            setErrorMessage(
                'Message not delivered. Please try again.' +
                    ((await response.json()['response']) || ''),
            );
        }
        await fetchMessages();
    };
```

3.	Удаление сообщения:
```tsx
    const deleteMessage = async messageId => {
        const url = `http://localhost:8000/chat/${messageId}`;
        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (response.ok) {
            setDeletedMessages([...deletedMessages, selectedMessageId]);
            await fetchMessages();
        } else {
            setErrorMessage(
                'Message not deleted. Please try again.' +
                    ((await response.json()['response']) || ''),
            );
        }
    };
```

### Интерфейс

1.	Поле для ввода логина.
2.	Список участников чата.
3.	Поле для ввода сообщения.
4.	Список сообщений с кнопкой удаления.


# Тестирование

1.	Отправка сообщений:
	-	Сообщения отображаются только у авторизованных участников.
	-	Новые участники не видят старые сообщения.
2.	Удаление сообщений:
	-	Пользователь может удалять только свои сообщения.
	-	Удалённые сообщения исчезают у всех участников.
3.	Отображение участников:
	-	Список участников обновляется при добавлении нового пользователя.

