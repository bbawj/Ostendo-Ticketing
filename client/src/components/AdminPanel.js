import React, { useState } from "react";
import CreateTicket from "./CreateTicket";
import "./AdminPanel.css";

export default function AdminPanel() {
  return (
    <div className="home">
      <h2>Admin Panel</h2>
      <CreateTicket admin={true} />
    </div>
  );
}
