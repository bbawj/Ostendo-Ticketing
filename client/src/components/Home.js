import React from "react";
import CreateTicket from "./CreateTicket";
import "./Home.css";
import MyTickets from "./MyTickets";

export default function Home() {
  return (
    <div className="home">
      <CreateTicket />
      <MyTickets />
    </div>
  );
}
