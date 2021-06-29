import React, { useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Formik, Field, Form, useField } from "formik";
import {
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { Link } from "react-router-dom";
import axios from "../axios";
import { formatTimeAgo } from "./FormatTime";
import "./AdminHome.css";

const MySelect = ({ ...props }) => {
  const [field] = useField(props);

  return (
    <FormControl style={{ width: "25%" }}>
      <Select variant="outlined" displayEmpty {...field}>
        <MenuItem value="">Company</MenuItem>
        <MenuItem value="GMP Recruitment">GMP</MenuItem>
      </Select>
    </FormControl>
  );
};

export default function AdminHome() {
  const [value, setValue] = useState(0);
  const [openTickets, setOpenTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);

  return (
    <div className="adminHome">
      <h2>Admin Dashboard</h2>
      <div className="searchContainer">
        <Formik
          initialValues={{ text: "", company: "", start: "", end: "" }}
          onSubmit={async (values, { setSubmitting }) => {
            // search database
            setSubmitting(true);
            const res = await axios.post("/api/ticket/admin", values, {
              withCredentials: true,
            });
            setOpenTickets(
              res.data.filter((ticket) => ticket.status === "open")
            );
            setClosedTickets(
              res.data.filter((ticket) => ticket.status === "closed")
            );
          }}
        >
          <Form>
            <Field
              name="text"
              as={TextField}
              variant="outlined"
              fullWidth
              placeholder="Search tickets"
            />
            <Field
              className="searchField"
              InputLabelProps={{ shrink: true }}
              as={TextField}
              name="start"
              label="Start"
              type="date"
            />
            <Field
              className="searchField"
              as={TextField}
              name="end"
              label="End"
              InputLabelProps={{ shrink: true }}
              type="date"
            />
            <Field as={MySelect} name="company" />
            <IconButton type="submit">
              <SearchIcon />
            </IconButton>
          </Form>
        </Formik>
      </div>
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
      <div className="ticketTable" value={value} hidden={value !== 0}>
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
          <h3>No open tickets. Try searching something else.</h3>
        )}
      </div>
      <div className="ticketTable" value={value} hidden={value !== 1}>
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
          <h3>No closed tickets. Try searching something else.</h3>
        )}
      </div>
    </div>
  );
}
