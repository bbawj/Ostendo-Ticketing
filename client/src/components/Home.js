import React from "react";
import { useUser } from "../contexts/UserContext";
import AdminDashboard from "./AdminDashboard";
import TicketList from "./TicketList";
import CreateTicket from "./CreateTicket";
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber";
import "./Home.css";

export default function Home() {
  const { currentUser } = useUser();
  return (
    <div className="home">
      {currentUser && currentUser.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <div className="userHome">
          <CreateTicket />
          <div className="ticketCreateHeader">
            <h3>My Tickets</h3>
            <ConfirmationNumberIcon />
          </div>
          <TicketList type="user" />
        </div>
      )}
    </div>
  );
}
