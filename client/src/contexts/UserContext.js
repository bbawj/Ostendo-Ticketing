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
      const res = await axios.get("/isauth", { withCredentials: true });
      if (res.data.redirectUrl) {
        history.push("/");
      } else {
        console.log(res);
        setCurrentUser({ id: res.data.id, role: res.data.role });
      }
    }
    getUser();
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
