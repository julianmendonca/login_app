import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Chat from "./components/chat";
import Login from "./components/login";
import Lobby from "./components/lobby";
import "./App.css";
import { useEffect, useState } from "react";
import { useLoggedContext } from "./context/loginContext";

function App() {
  const { setLogged, setUsername, logged } = useLoggedContext();
  const [socket, setSocket] = useState(undefined);
  const [roomUID, setRoomUID] = useState("");
  useEffect(() => {
    if (window.localStorage.getItem("jwt")) {
      console.log(window.localStorage.getItem("jwt"));
      window
        .fetch("http://localhost:4000/authenticate", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            token: window.localStorage.getItem("jwt"),
          },
        })
        .then((res) => res.json())
        .then(({ auth, username }) => {
          if (auth) setLogged(true);
          if (username) setUsername(username);
        })
        .catch((e) => console.log(e));
    }
  }, [setLogged]);
  return (
    <BrowserRouter>
      <div className="App">
        <Switch>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route path="/home">
            <div className="home">
              {logged ? (
                <Lobby setSocket={setSocket} setRoomUID={setRoomUID}></Lobby>
              ) : (
                <Redirect to="/login" />
              )}
            </div>
          </Route>
          <Route path="/login">
            {logged ? <Redirect to="/home" /> : <Login></Login>}
          </Route>

          <Route exact path="/chat">
            <Chat uid={roomUID} socket={socket}></Chat>
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
