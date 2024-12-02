// @ts-ignore
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
    // @ts-ignore
    const [clientId, setClienId] = useState(
        Math.floor(new Date().getTime() / 1000)
    );
    const [login, setLogin] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // @ts-ignore
    const [chatHistory, setChatHistory] = useState([]);
    // @ts-ignore
    const [isOnline, setIsOnline] = useState(false);
    // @ts-ignore
    const [textValue, setTextValue] = useState("");
    const [websckt, setWebsckt] = useState();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const handleLogin = () => {
        const url = "ws://localhost:8000/ws/" + clientId;
        const ws = new WebSocket(url);
        // @ts-ignore
        ws.onopen = (event) => {
            ws.send(JSON.stringify({ clientId: clientId, login: login }));
        };

        // recieve message every start page
        ws.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setMessages((messages) => ([...messages, message]));
        };
        // @ts-ignore
        setWebsckt(ws);
        setIsLoggedIn(true);
        //clean up function when we close page
        return () => ws.close();
    };

    // @ts-ignore
    const sendMessage = () => {
        // @ts-ignore
        websckt.send(JSON.stringify({message: message }));
        // recieve message every send message
        // @ts-ignore
        websckt.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setMessages([...messages, message]);
        };
        setMessage([]);
    };

    const enterClick = (e, func) => {
        if (e.key === "Enter") {
            func();
        }
    }

    // @ts-ignore
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
                        onChange={(e) => setLogin(e.target.value)}
                        onKeyDown={(e) => enterClick(e, handleLogin)}
                    />
                    <button
                        onClick={handleLogin}
                        className="submit-chat"
                    >Login</button>
                </div>
            ) : (
                <div className="chat-container">
                    <h1>Chat</h1>
                    <h2>Your login: {login} </h2>
                    <div className="chat">
                        {messages.map((value, index) => {
                            if (value.login === login) {
                                return (
                                    <div key={index} className="my-message-container">
                                        <div className="my-message">
                                            <p className="message">{value.message}</p>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={index} className="another-message-container">
                                        <div className="another-message">
                                            <p className="client">{value.login}</p>
                                            <p className="message">{value.message}</p>
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
                            // @ts-ignore
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => enterClick(e, sendMessage)}
                            value={message}>
                        </input>
                        <button
                            className="submit-chat"
                            onClick={sendMessage}
                        >Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;