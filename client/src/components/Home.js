import React from "react";
import { useUser } from "../contexts/UserContext";
import AdminHome from "./AdminHome";
import CreateTicket from "./CreateTicket";
import "./Home.css";
import MyTickets from "./MyTickets";

export default function Home() {
  const { currentUser } = useUser();
  return (
    <div className="home">
      {currentUser && currentUser.role === "admin" ? (
        <AdminHome />
      ) : (
        <div className="userHome">
          <CreateTicket />
          <MyTickets />
        </div>
      )}
    </div>
  );
}
