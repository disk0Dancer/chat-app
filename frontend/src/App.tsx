import React, { useState, useEffect } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';import { Buffer } from 'buffer';
window.Buffer = Buffer;
// import { Client } from '@stomp/stompjs';

import {ampq} from 'amqplib';

type ChatMessage = {
    sender: string;
    message: string;
};

const SYSTEM_QUEUE = 'login';
const CHAT_QUEUE = 'chat';


function App() {
    const [userLogin, setUserLogin] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // @ts-ignore
    const [userQueue, setUserQueue] = useState<string>('');
    const [channel, setChannel] = useState(null);
    const [connection, setConnection] = useState(null);

    useEffect(() => {

        const connection = ampq.connect("amqp://localhost:5672"); // await
        const channel= connection.createChannel();

        setChannel(channel);
        setConnection(connection);


        return () => {
            if (isLoggedIn && connection) {
                window.addEventListener('beforeunload', logout);
                connection.on("message", (message) => (
                    setMessages([message, ...messages])
                ))
                window.removeEventListener('beforeunload', logout);
            }
        };
    }, [isLoggedIn]);

    const publishMessage = async (queueName: string, data: string) => {
        if (channel) {
            await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
        } else {
            console.error('err publish');
        }
    };

    const sendMessage = () => {
        if (!message) {
            return;
        }
        const chatMessage = {
            sender: userLogin,
            message: message,
        };
        publishMessage(CHAT_QUEUE, JSON.stringify(chatMessage))
            .then(() =>  setMessage(''));
    };

    const login = () => {
        const userQueue = `${uuidv4()}`;
        const command = {
            action: 'login',
            login: userLogin,
            queue: userQueue,
        };
        publishMessage(SYSTEM_QUEUE, JSON.stringify(command))
            .then(
                () => (
                    setIsLoggedIn(true), setUserQueue(userQueue)
                )
            );
    };

    const logout = async () => {
        const command = {
            action: 'logout',
            login: userLogin,
        };
        publishMessage(SYSTEM_QUEUE, JSON.stringify(command))
            .then(() => setIsLoggedIn(false));
        await connection.close(); // await
        await channel.close();
    };

    const enterClick = (e: React.KeyboardEvent, func: () => void) => {
        if (e.key === 'Enter') {
            func();
        }
    };

    // useEffect(() => {
    //
    // }, [isLoggedIn]);

    return (
        <div className="container">
            {!isLoggedIn ? (
                <div className="input-chat-container">
                    <h1>Enter your login</h1>
                    <input
                        className="input-chat"
                        type="text"
                        placeholder="Login"
                        value={userLogin}
                        onChange={(e) => setUserLogin(e.target.value)}
                        onKeyDown={(e) => enterClick(e, login)}
                    />
                    <button onClick={login} className="submit-chat">
                        Login
                    </button>
                </div>
            ) : (
                <div className="container">
                    <div className="chat-container">
                        <h1>Chat</h1>
                        <h2>Your login: {userLogin}</h2>
                        <div className="chat">
                            {messages.map((value, index) => (
                                <div
                                    key={index}
                                    className={
                                        value.sender === userLogin
                                            ? 'my-message-container'
                                            : 'another-message-container'
                                    }
                                >
                                    <div
                                        className={
                                            value.sender === userLogin
                                                ? 'my-message'
                                                : 'another-message'
                                        }
                                    >
                                        <p className="message">
                                            {value.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="input-chat-container">
                            <input
                                className="input-chat"
                                type="text"
                                placeholder="Chat message ..."
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => enterClick(e, sendMessage)}
                                value={message}
                            />
                            <button
                                className="submit-chat"
                                onClick={sendMessage}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;