import React, { useContext, useMemo, useState } from "react";

const LoggedContext = React.createContext(undefined);

export const LoggedContextProvider = ({ children }) => {
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(window.localStorage.getItem("jwt") || "");
  const memoizedLogged = useMemo(
    () => ({ logged, setLogged, token, setToken, username, setUsername }),
    [logged, token, username]
  );
  return (
    <LoggedContext.Provider value={memoizedLogged}>
      {children}
    </LoggedContext.Provider>
  );
};

export const useLoggedContext = () => {
  const contextValue = useContext(LoggedContext);
  if (contextValue === undefined) throw new Error("Please provide a context");
  return contextValue;
};
