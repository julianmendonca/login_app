import React, { useEffect } from "react";
import Login from "./login";
import Lobby from "./lobby";
import { useLoggedContext } from "../context/loginContext";

const Home = () => {
  const { logged } = useLoggedContext();
  return (
    <div className="home">{!logged ? <Login></Login> : <Lobby></Lobby>}</div>
  );
};

export default Home;
