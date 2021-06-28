import React, { useEffect, useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import axios from "../axios";
import { formatTimeAgo } from "./FormatTime";
import "./Ticket.css";
import { Link } from "react-router-dom";

export default function MyTickets() {
  const [value, setValue] = useState(0);
  const [openTickets, setOpenTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);
  //console.log(openTickets);
  useEffect(() => {
    async function getMyTickets() {
      try {
        const res = await axios.get(`/api/ticket/user`, {
          withCredentials: true,
        });
        setOpenTickets(res.data.filter((el) => el.status === "open"));
        setClosedTickets(res.data.filter((el) => el.status === "closed"));
      } catch (err) {
        console.error(err);
      }
    }
    getMyTickets();
  }, []);

  return (
    <div className="myTickets">
      <h2>My Tickets</h2>
      <Tabs
        indicatorColor="primary"
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <Tab label="Open" />
        <Tab label="Closed" />
      </Tabs>
      <div value={value} hidden={value !== 0}>
        {!(openTickets.length === 0) ? (
          openTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={{
                pathname: `/ticket/${ticket.id}`,
                state: { ticketId: ticket.id },
              }}
            >
              <div className="ticket">
                <h3>{ticket.title}</h3>
                <p>{`#${ticket.id} opened ${formatTimeAgo(
                  ticket.created_date
                )} by ${ticket.email}`}</p>
              </div>
            </Link>
          ))
        ) : (
          <h3>No opened tickets</h3>
        )}
      </div>
      <div value={value} hidden={value !== 1}>
        {!(closedTickets.length === 0) ? (
          closedTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={{
                pathname: `/ticket/${ticket.id}`,
                state: { ticketId: ticket.id },
              }}
            >
              <div className="ticket">
                <h3>{ticket.title}</h3>
                <p>{`#${ticket.id} opened ${formatTimeAgo(
                  ticket.created_date
                )} by ${ticket.email}`}</p>
              </div>
            </Link>
          ))
        ) : (
          <h3>No closed tickets</h3>
        )}
      </div>
    </div>
  );
}
