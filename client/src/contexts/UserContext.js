import axios from "../axios";
import React, { useContext, useEffect, useState } from "react";

const UserContext = React.createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const value = { currentUser, setCurrentUser };

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get("/api/auth/isauth", {
          withCredentials: true,
        });
        setCurrentUser({ id: res.data.id, role: res.data.role });
      } catch (err) {
        setCurrentUser();
      }
    }
    getUser();
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
