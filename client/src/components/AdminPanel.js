import React from "react";
import CreateTicket from "./CreateTicket";
import "./AdminPanel.css";
import AdminHome from "./AdminHome";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";

export default function AdminPanel() {
  return (
    <div className="home">
      <h2>Admin Panel</h2>
      <CreateTicket admin={true} />
      <div className="ticketCreateHeader">
        <h3>Assigned to me</h3>
        <SupervisorAccountIcon color="primary" />
      </div>
      <AdminHome type="assigned" />
    </div>
  );
}
