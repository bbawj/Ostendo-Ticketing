import React, { useEffect, useRef, useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import { Formik, Field, Form, useField } from "formik";
import {
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import { Link } from "react-router-dom";
import axios from "../axios";
import { formatTimeAgo } from "./FormatTime";
import LabelSelect from "./LabelSelect";
import "./AdminHome.css";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ExportSelect from "./ExportSelect";

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
  const [sort, setSort] = useState(1);
  const [labels, setLabels] = useState([]);
  const [labelledTickets, setLabelledTickets] = useState([]);
  const [disable, setDisable] = useState(false);
  const formRef = useRef();

  function addLabel(e) {
    setLabels(e.target.value);
    setOpenTickets(
      labelledTickets.filter((ticket) => {
        if (ticket.status === "open") {
          if (e.target.value.length === 0) return true;
          return e.target.value.some((label) => {
            if (ticket.label && ticket.label.split(",").includes(label)) {
              return true;
            }
            return false;
          });
        }
        return false;
      })
    );
    setClosedTickets(
      labelledTickets.filter((ticket) => {
        if (ticket.status === "closed" || ticket.status === "closedbyadmin") {
          if (e.target.value.length === 0) return true;
          return e.target.value.some((label) => {
            if (ticket.label && ticket.label.split(",").includes(label)) {
              return true;
            }
            return false;
          });
        }
        return false;
      })
    );
  }

  function handleSort() {
    if (sort) {
      setOpenTickets((prev) =>
        prev.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      );
      setClosedTickets((prev) =>
        prev.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      );
      setSort((prev) => !prev);
    } else {
      setOpenTickets((prev) =>
        prev.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      );
      setClosedTickets((prev) =>
        prev.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      );
      setSort((prev) => !prev);
    }
  }

  useEffect(() => {
    async function getTickets() {
      const res = await axios.get("/api/ticket/admin", {
        withCredentials: true,
      });
      setLabelledTickets(res.data);
      setOpenTickets(res.data.filter((ticket) => ticket.status === "open"));
      setClosedTickets(
        res.data.filter(
          (ticket) =>
            ticket.status === "closed" || ticket.status === "closedbyadmin"
        )
      );
    }
    getTickets();
  }, []);

  return (
    <div className="adminHome">
      <h2>Admin Dashboard</h2>
      <div className="searchContainer">
        <Formik
          initialValues={{ text: "", company: "", start: "", end: "" }}
          innerRef={formRef}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              // search database
              setSubmitting(true);
              setDisable(true);
              const res = await axios.post("/api/ticket/admin", values, {
                withCredentials: true,
              });
              setOpenTickets(
                res.data.filter((ticket) => ticket.status === "open")
              );
              setClosedTickets(
                res.data.filter(
                  (ticket) =>
                    ticket.status === "closed" ||
                    ticket.status === "closedbyadmin"
                )
              );
              setLabels([]);
              setSort(1);
              setDisable(false);
              setSubmitting(false);
            } catch (err) {
              // console.log(err.response.data);
              console.error(err);
            }
          }}
        >
          <Form>
            <div className="searchHalf">
              <Field
                name="text"
                as={TextField}
                variant="outlined"
                fullWidth
                placeholder="Search tickets"
              />
            </div>
            <div className="searchHalf">
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
              <IconButton type="submit" disabled={disable}>
                <SearchIcon />
              </IconButton>
            </div>
          </Form>
        </Formik>
      </div>
      <div className="tabsPanel">
        <Tabs
          indicatorColor="primary"
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <Tab
            style={{ color: "var(--success)" }}
            icon={<ErrorOutlineIcon />}
            label="Open"
          />
          <Tab
            style={{ color: "var(--error)" }}
            icon={<CheckCircleOutlineIcon />}
            label="Closed"
          />
        </Tabs>
        <div className="tabsGroup">
          <LabelSelect
            className="labelSelect"
            labels={labels}
            Icon={ArrowDropDownIcon}
            addLabel={addLabel}
          />
          <Button
            onClick={handleSort}
            endIcon={sort ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          >
            Sort By
          </Button>
          {formRef.current && (
            <ExportSelect
              start={formRef.current.values.start}
              end={formRef.current.values.end}
              data={labelledTickets}
            />
          )}
        </div>
      </div>
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
                <span className="listTicketHeader">
                  <h3>{ticket.title} </h3>
                  {ticket.label &&
                    ticket.label.split(",").map((label) => (
                      <span key={label} className="label">
                        {label}
                      </span>
                    ))}
                </span>
                <p>{`#${ticket.id} opened ${formatTimeAgo(
                  ticket.created_date
                )} by ${ticket.email}, ${ticket.company}`}</p>
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
                <span className="listTicketHeader">
                  <h3>{ticket.title} </h3>
                  {ticket.label &&
                    ticket.label.split(",").map((label) => (
                      <span key={label} className="label">
                        {label}
                      </span>
                    ))}
                </span>
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
