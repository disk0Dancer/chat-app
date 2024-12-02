// @ts-expect-error - ignore TS error
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import './App.css';

function App() {
    const [login, setLogin] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [message, setMessage] = useState([]);
    const [messages, setMessages] = useState([]);
    const [deletedMessages,setDeletedMessages] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);

    const handleDeleteClick = (messageId) => {
        setSelectedMessageId(messageId);
        setShowDialog(true);
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        setSelectedMessageId(null);
    };

    const handleDeleteForMe = () => {
        setDeletedMessages([...deletedMessages, selectedMessageId]);
        handleDialogClose();
    };

    const handleDeleteForAll = async () => {
        await deleteMessage(selectedMessageId);
        handleDialogClose();
    };

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
            setErrorMessage('Message not delivered. Please try again.' + (await response.json()["response"] || ""));
        }
        await fetchMessages();
    };

    const fetchMessages = async () => {
        const url = 'http://localhost:8000/chat';
        const response = await fetch(url);
        const data = await response.json();
        if (JSON.stringify(data) !== JSON.stringify(messages)) {
            setMessages(data.filter((message) => !deletedMessages.includes(message.message_id)));
        }
    };

    const deleteMessage = async (messageId) => {
        const url = `http://localhost:8000/chat/${messageId}`;
        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (response.ok) {
            setDeletedMessages([...deletedMessages, selectedMessageId]);
            await fetchMessages();
        } else {
            setErrorMessage('Message not deleted. Please try again.' + (await response.json()["response"] || ""));
        }
    };

    const enterClick = (e, func) => {
        if (e.key === 'Enter') {
            func();
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            const interval = setInterval(fetchMessages, 1000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn, fetchMessages]);

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
                <div className="chat-container">
                    <h1>Chat</h1>
                    <h2>Your login: {login} </h2>
                    {errorMessage && (
                        <p className="error-message">{errorMessage}</p>
                    )}
                    <div className="chat">
                        {messages.map((value, index) => {
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
                                        <button
                                            onClick={() => handleDeleteClick(value.message_id)}
                                            className="submit-chat my-message message">
                                            <img src="/trash.png" alt="Delete" className="delete-icon" />
                                        </button>
                                        {showDialog && (
                                            <div className="dialog">
                                                <p>Удалить сообщение только для вас или для всех?</p>
                                                <button
                                                    onClick={handleDeleteForMe}
                                                    className="submit-chat"
                                                >Только для меня</button>
                                                <button
                                                    onClick={handleDeleteForAll}
                                                    className="submit-chat"
                                                >Для всех</button>
                                                <button
                                                    onClick={handleDialogClose}
                                                    className="submit-chat"
                                                >Отмена</button>
                                            </div>
                                        )}
                                    </div>);
                            } else {
                                return (
                                    <div
                                        key={index}
                                        className="another-message-container"
                                    >
                                        <div className="another-message">
                                            <p className="client">
                                                {value.user.login}
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
                            // @ts-expect-error - ignore TS error
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => enterClick(e, sendMessage)}
                            value={message}
                        ></input>
                        <button className="submit-chat" onClick={sendMessage}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
