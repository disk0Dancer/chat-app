// App.tsx
import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

type ChatMessage = {
    sender: string;
    message: string;
};

const SYSTEM_QUEUE = 'login';
const CHAT_QUEUE = 'chat';

function App() {
    const [userLogin, setUserLogin] = useState('');
    // @ts-ignore
    const [userQueue, setUserQueue] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [client, setClient] = useState<Client | null>(null);

    // @ts-ignore
    useEffect(() => {
        const stompClient = new Client({
            brokerURL: 'ws://localhost:15674/ws',
            // reconnectDelay: 1000,
            debug: (str) => console.log('STOMP Debug:', str),
        });

        stompClient.onConnect = () => {
            console.log('Connected to RabbitMQ via STOMP');
            // Subscribe to chat queue
            if (isLoggedIn){
                client.subscribe(userQueue, (message) => {
                    const newMessage: ChatMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => [newMessage, ...prevMessages]);
                });
            }
        };

        stompClient.activate();
        setClient(stompClient);
        return () => stompClient.deactivate();
    }, []);

    const sendMessage = () => {
        if (!message.trim()) {
            console.error("Message is empty");
            return;
        }
        if (!client || !client.connected) {
            console.error("STOMP client is not connected");
            return;
        }

        const chatMessage: ChatMessage = {
            sender: userLogin,
            message,
        };

        console.log(JSON.stringify(chatMessage));

        client.publish({
            destination: CHAT_QUEUE,
            body: btoa(JSON.stringify(chatMessage)),
        });

        setMessage('');
    };

    const login = () => {
        const userQueue = uuidv4();
        const loginMessage = {
            action: 'login',
            login: userLogin,
            queue: userQueue,
        };
        console.log(JSON.stringify(loginMessage));


        client.publish({
            destination: SYSTEM_QUEUE,
            body: btoa(JSON.stringify(loginMessage)),
        });
        setUserQueue(userQueue);

        setIsLoggedIn(true);

        client.subscribe(userQueue, (message) => {
            const newMessage: ChatMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [newMessage, ...prevMessages]);
        });
    };

    // @ts-ignore
    const logout = () => {
        if (!client) return;

        const logoutMessage = {
            action: 'logout',
            login: userLogin,
        };

        client.publish({
            destination: SYSTEM_QUEUE,
            body: btoa(JSON.stringify(logoutMessage)),
        });

        setIsLoggedIn(false);
    };

    const handleKeyPress = (
        event: React.KeyboardEvent<HTMLInputElement>,
        action: () => void
    ) => {
        if (event.key === 'Enter') {
            action();
        }
    };

    return (
        <div className="container">
            {!isLoggedIn ? (
                <div className="input-chat-container">
                    <h1>Enter Your Login</h1>
                    <input
                        className="input-chat"
                        type="text"
                        placeholder="Enter your login"
                        value={userLogin}
                        onChange={(e) => setUserLogin(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, login)}
                    />
                    <button onClick={login} className="submit-chat">
                        Login
                    </button>
                </div>
            ) : (
                <div className="chat-container">
                    <h1>Chat Room</h1>
                    <h2>Your Login: {userLogin}</h2>
                    <div className="chat">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={
                                    msg.sender === userLogin
                                        ? 'my-message-container'
                                        : 'another-message-container'
                                }
                            >
                                <div
                                    className={
                                        msg.sender === userLogin
                                            ? 'my-message'
                                            : 'another-message'
                                    }
                                >
                                    <p className="message">
                                        <strong>{msg.sender}: </strong>
                                        {msg.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="input-chat-container">
                        <input
                            className="input-chat"
                            type="text"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, sendMessage)}
                        />
                        <button onClick={sendMessage} className="submit-chat">
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;