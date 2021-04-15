import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { useLoggedContext } from "../context/loginContext";
import { Link } from "react-router-dom";
const ENDPOINT = "http://localhost:4000";

const Chat = ({ socket, uid }) => {
  const { username, logged } = useLoggedContext();
  const [text, setText] = useState("");
  const [chats, setChat] = useState([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("chat", (data) => {
      console.log(data, chats);
      if (data !== "") setChat((prevState) => [...prevState, data]);
    });
  }, [socket]);
  useEffect(() => {
    if (!uid || !socket) return;
    socket.emit("join room", { uid });
  }, [uid]);

  const sendText = () => {
    socket.emit("chat", { username, text, uid });
    setText("");
  };
  const content = logged ? (
    <div className="chat">
      <div className="chatbox">
        {chats.map(({ username, text }, i) => (
          <div key={i}>
            <span style={{ color: "grey" }}>{username}:</span>
            <p>{text}</p>
            <br />
          </div>
        ))}
      </div>
      <div className="chattext">
        {username}
        <input
          onKeyDown={(e) => {
            if (e.code === "Enter") sendText();
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          type="text"
        />
        <button onClick={sendText}>Enviar</button>
      </div>
      <Link to="home">
        <button>Volver</button>
      </Link>
      <p>Chat: {uid}</p>
    </div>
  ) : (
    <h1>
      <Link to="/login">
        <button>Please log in</button>
      </Link>
    </h1>
  );
  return content;
};
export default Chat;
