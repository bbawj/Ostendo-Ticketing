import React from "react";
import CreateTicket from "./CreateTicket";
import "./AdminPanel.css";
import MyTickets from "./MyTickets";

export default function AdminPanel() {
  return (
    <div className="home">
      <h2>Admin Panel</h2>
      <CreateTicket admin={true} />
      <MyTickets admin={true} />
    </div>
  );
}
