import axios from "../axios";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const UserContext = React.createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const value = { currentUser, setCurrentUser };
  const history = useHistory();

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get("/api/isauth", { withCredentials: true });
        setCurrentUser({ id: res.data.id, role: res.data.role });
      } catch (err) {
        history.push(err.response.data.redirectUrl);
      }
    }
    getUser();
  }, [history]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
