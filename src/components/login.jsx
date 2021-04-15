import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./login.scss";
import { useLoggedContext } from "../context/loginContext";
import { io } from "socket.io-client";
const ENDPOINT = "http://localhost:3000";

const Login = () => {
  const socket = io(ENDPOINT);
  let history = useHistory();
  socket.on("FromAPI", (data) => {
    console.log(data);
  });
  const { setLogged, setToken, setUsername } = useLoggedContext();
  const [fetchError, setFetchError] = useState("");
  const [username, setCurrentUsername] = useState("");
  const [password, setPassword] = useState("");
  const sendCreateData = () => {
    return new Promise(async (resolve, reject) => {
      if (!username.length > 5 && !password.length > 5) throw new Error("");
      const response = await window
        .fetch("http://localhost:4000/create_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })
        .then((resp) => resp.json())
        .catch((e) => reject(e));
      if (response === undefined) return;
      resolve(response);
    });
  };
  const login = async (e) => {
    e.preventDefault();
    if (username?.length < 5 || password?.length < 5) return null;
    const response = await window
      .fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
      .then((res) => res.json())
      .catch((e) =>
        setFetchError(typeof e == "string" ? e : "Error en el servidor")
      );
    if (response?.error) return setFetchError(response.error);
    if (response?.jwt) {
      setLogged(true);
      setToken(response.jwt);
      localStorage.setItem("jwt", response.jwt);
      history.push("/home");
    }
    if (response?.username) setUsername(response.username);
  };
  const createUser = async (e) => {
    e.preventDefault();
    sendCreateData()
      .then(({ error, jwt }) => {
        if (error) setFetchError(error);
        if (jwt) {
          localStorage.setItem("jwt", jwt);
          setToken(jwt);
          setLogged(true);
          setUsername(username);
          history.push("/home");
        }
      })
      .catch((e) => setFetchError(e));
  };
  return (
    <React.Fragment>
      <form
        onSubmit={(e) => {
          login(e);
        }}
      >
        <label htmlFor="username">Username</label>
        <input
          type="text"
          onChange={(e) => setCurrentUsername(e.target.value)}
          name="username"
          value={username}
          placeholder="username"
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="password"
        />
        {fetchError !== "" ? <p className="error_text">{fetchError}</p> : null}
        <button type="submit" onClick={(e) => login(e)}>
          Login
        </button>
        or
        <button onClick={(e) => createUser(e)}>Create User</button>
      </form>
    </React.Fragment>
  );
};

export default Login;
