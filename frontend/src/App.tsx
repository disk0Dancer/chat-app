// @ts-expect-error - ignore TS error
import React, { useState, useEffect } from 'react';
import { PubSub } from '@google-cloud/pubsub';
import './App.css';

type ChatMessage = {
    sender: string;
    message: string;
};

const SYSTEM_TOPIC = 'users';
const CHAT_TOPIC = 'chat';
export const pubSubClient = new PubSub({
    projectId: 'chat',
    apiEndpoint: '0.0.0.0:8085',
});

function App() {
    const [login, setLogin] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [userTopic, setUserTopic] = useState<string>('');


    async function publishMessage(topicNameOrId: string, data: string) {
        const dataBuffer = Buffer.from(data);
        const topic = pubSubClient.topic(topicNameOrId);

        try {
            const messageId = topic.publishMessage({data: dataBuffer});
            console.log(`Message ${messageId} published.`);
        } catch (error) {
            console.error(
                `Received error while publishing: ${(error as Error).message}`
            );
            process.exitCode = 1;
        }
    }

    const logout = async () => {
        try {
            const command = {
                action: 'logout',
                login: login,
            };
            await publishMessage(SYSTEM_TOPIC, JSON.stringify({ json: command }));
            return;
        } catch (err) {
            setErrorMessage('Ошибка выхода' + err);
        }
    };

    const sendMessage = async () => {
        if (!message) {
            return;
        }
        try {
            const chatMessage = {
                login: login,
                message: message,
            };
            await publishMessage(CHAT_TOPIC,  JSON.stringify({ json: chatMessage }));
            setMessage('');
        } catch (err) {
            setErrorMessage('Ошибка отправки сообщения' + err);
        }
        return;
    };

    const handleLogin = async () => {
        try {
            const command = {
                action: 'login',
                login: login,
            };

            await publishMessage(SYSTEM_TOPIC, JSON.stringify({ json: command }));
            setUserTopic(`chat_user_${login}`);
            setLogin(login);
            setIsLoggedIn(true);

            const subscription = pubSubClient.subscription(userTopic);
            subscription.on('message', message => {
                const chatMessage = JSON.parse(
                    message.data.toString(),
                ) as ChatMessage;
                setMessages(prev => [...prev, chatMessage]);
                message.ack();
            });
        } catch (err) {
            setErrorMessage(err);
        }
    };

    const enterClick = (e, func) => {
        if (e.key === 'Enter') {
            func();
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            window.addEventListener('beforeunload', logout);
            return;
        }
    }, [isLoggedIn, logout]);

    return (
        <div className="container">
            {!isLoggedIn ? (
                <div className="input-chat-container">
                    <h1>Enter your login</h1>
                    <input
                        className="input-chat"
                        type="text"
                        placeholder="Login"
                        value={login}
                        onChange={e => setLogin(e.target.value)}
                        onKeyDown={e => enterClick(e, handleLogin)}
                    />
                    <button onClick={handleLogin} className="submit-chat">
                        Login
                    </button>
                </div>
            ) : (
                <div className={'container'}>
                    <div className="chat-container">
                        <h1>Chat</h1>
                        <h2>Your login: {login} </h2>
                        {errorMessage && (
                            <p className="error-message">{errorMessage}</p>
                        )}
                        <div className="chat">
                            {messages.map((value, index) => {
                                // @ts-ignore
                                if (value.user.login === login) {
                                    return (
                                        <div
                                            key={index}
                                            className="my-message-container"
                                        >
                                            <div className="my-message">
                                                <p className="message">
                                                    {value.message}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={index}
                                            className="another-message-container"
                                        >
                                            <div className="another-message">
                                                <p className="client">
                                                    {value.login}
                                                </p>
                                                <p className="message">
                                                    {value.message}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                        <div className="input-chat-container">
                            <input
                                className="input-chat"
                                type="text"
                                placeholder="Chat message ..."
                                onChange={e => setMessage(e.target.value)}
                                onKeyDown={e => enterClick(e, sendMessage)}
                                value={message}
                            ></input>
                            <button
                                className="submit-chat"
                                onClick={sendMessage}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div>
    )
}

export default App;
