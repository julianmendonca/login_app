import React, { useState } from "react";
import { useLoggedContext } from "../context/loginContext";
import { Link, useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:4000";

const Lobby = ({ setSocket, setRoomUID }) => {
  const { username, setLogged, setToken, logged } = useLoggedContext();
  const [roomCode, setRoomCode] = useState("");
  const [uid] = useState(uuidv4());
  const history = useHistory();
  const createSocket = () => {
    return socketIOClient(ENDPOINT);
  };
  const createRoom = () => {
    setRoomUID(uid);
    const mySocket = createSocket();
    mySocket.emit("create room", uid);
    setSocket(mySocket);
    history.push("/chat");
  };
  return (
    <div id="lobby">
      <h3>Bienvenido {username}!</h3>
      <div className="unir_chat">
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Codigo de sala"
        />

        <Link to="/chat">
          <button
            onClick={() => {
              setSocket(createSocket());
              setRoomUID(roomCode);
            }}
          >
            Unirse a sala
          </button>
        </Link>
      </div>
      <br />
      <button style={{ width: "100%" }} onClick={createRoom}>
        Crear sala
      </button>
      <button
        onClick={() => {
          setLogged(false);
          setToken("");
          localStorage.setItem("jwt", "");
        }}
      >
        Cerrar sesion
      </button>
    </div>
  );
};

export default Lobby;
