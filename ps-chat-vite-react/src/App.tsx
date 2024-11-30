// @ts-ignore
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
    // @ts-ignore
    const [clientId, setClienId] = useState(
        Math.floor(new Date().getTime() / 1000)
    );
    // @ts-ignore
    const [chatHistory, setChatHistory] = useState([]);
    // @ts-ignore
    const [isOnline, setIsOnline] = useState(false);
    // @ts-ignore
    const [textValue, setTextValue] = useState("");
    const [websckt, setWebsckt] = useState();

    const [message, setMessage] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const url = "ws://localhost:8000/ws/" + clientId;
        const ws = new WebSocket(url);
        // @ts-ignore
        ws.onopen = (event) => {
            ws.send("Connect");
        };

        // recieve message every start page
        ws.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setMessages((messages) => ([...messages, message]));
        };
        // @ts-ignore
        setWebsckt(ws);
        //clean up function when we close page
        return () => ws.close();
    }, []);

    const sendMessage = () => {
        // @ts-ignore
        websckt.send(message);
        // recieve message every send message
        // @ts-ignore
        websckt.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setMessages([...messages, message]);
        };
        setMessage([]);
    };

    return (
        <div className="container">
            <h1>Chat</h1>
            <h2>Your client id: {clientId} </h2>
            <div className="chat-container">
                <div className="chat">
                    {messages.map((value, index) => {
                        if (value.clientId === clientId) {
                            return (
                                <div key={index} className="my-message-container">
                                    <div className="my-message">
                                        <p className="client">client id : {clientId}</p>
                                        <p className="message">{value.message}</p>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={index} className="another-message-container">
                                    <div className="another-message">
                                        <p className="client">client id : {clientId}</p>
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
                        value={message}
                    ></input>
                    <button className="submit-chat" onClick={sendMessage}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;