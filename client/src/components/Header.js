import React from "react";
import "./Header.css";
import { Link, useHistory } from "react-router-dom";
import { Button } from "@material-ui/core";
import axios from "../axios";
import { useUser } from "../contexts/UserContext";

export default function Header() {
  const history = useHistory();
  const { currentUser, setCurrentUser } = useUser();

  async function handleLogout() {
    await axios.post("/api/auth/logout", null, {
      withCredentials: true,
    });
    setCurrentUser();
    history.push("/login");
  }

  return (
    <div className="header">
      <div className="headerLogo">
        <Link to="/home" />
      </div>
      {currentUser && <Button onClick={handleLogout}>Log out</Button>}
    </div>
  );
}
