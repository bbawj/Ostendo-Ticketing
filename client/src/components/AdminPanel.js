import React from "react";
import CreateTicket from "./CreateTicket";
import "./AdminPanel.css";
import TicketList from "./TicketList";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";

export default function AdminPanel() {
  return (
    <div className="home">
      <div className="adminPanelHeader">
        <h2>Admin Panel</h2>
      </div>
      <CreateTicket admin={true} />
      <div className="ticketCreateHeader">
        <h3>Assigned to me</h3>
        <SupervisorAccountIcon color="primary" />
      </div>
      <TicketList type="assigned" />
    </div>
  );
}
