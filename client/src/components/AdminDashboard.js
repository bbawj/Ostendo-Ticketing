import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import React from "react";
import TicketList from "./TicketList";

export default function AdminDashboard() {
  return (
    <div>
      <div className="adminHomeHeader">
        <h2>Dashboard</h2>
        <Button variant="outlined" color="primary">
          <Link to="/admin">Admin Panel</Link>
        </Button>
      </div>
      <TicketList type="all" />
    </div>
  );
}
