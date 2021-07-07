import React, { useCallback, useRef, useState } from "react";
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
  CircularProgress,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "./FormatTime";
import LabelSelect from "./LabelSelect";
import "./AdminHome.css";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ExportSelect from "./ExportSelect";
import {
  useOpenTicketSearch,
  useClosedTicketSearch,
} from "../hooks/useTicketSearch";

const MySelect = ({ ...props }) => {
  const [field] = useField(props);

  return (
    <FormControl style={{ width: "25%" }}>
      <Select variant="outlined" displayEmpty {...field}>
        <MenuItem value="">Company</MenuItem>
        <MenuItem value="GMP Recruitment">GMP</MenuItem>
        <MenuItem value="Ostendo Asia">Ostendo</MenuItem>
      </Select>
    </FormControl>
  );
};

export default function AdminHome() {
  const [value, setValue] = useState(0);
  const [order, setSort] = useState("asc");
  const [labels, setLabels] = useState([]);
  const formRef = useRef();
  const [query, setQuery] = useState({});
  const [openId, setOpenId] = useState(0);
  const [closedId, setClosedId] = useState(0);
  const openObserver = useRef();
  const closedObserver = useRef();
  const { openTickets, hasMore, loading, error } = useOpenTicketSearch(
    query,
    openId,
    order
  );
  const { closedTickets, cHasMore, cLoading, cError } = useClosedTicketSearch(
    query,
    closedId,
    order
  );
  // observer to check when user has scrolled to last item
  const lastOpenTicket = useCallback(
    (node, id) => {
      if (loading) return;
      if (openObserver.current) openObserver.current.disconnect();
      openObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setOpenId(id);
        }
      });
      if (node) openObserver.current.observe(node);
    },
    [loading, hasMore]
  );

  const lastClosedTicket = useCallback(
    (node, id) => {
      console.log(id);
      if (cLoading) return;
      if (closedObserver.current) closedObserver.current.disconnect();
      closedObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && cHasMore) {
          setClosedId(id);
        }
      });
      if (node) closedObserver.current.observe(node);
    },
    [cLoading, cHasMore]
  );

  function addLabel(e) {
    setLabels(e.target.value);
  }

  function handleSort() {
    if (order === "asc") {
      setSort("desc");
    } else {
      setSort("asc");
    }
    setOpenId(0);
    setClosedId(0);
  }

  return (
    <div className="adminHome">
      <h2>Admin Dashboard</h2>
      <div className="searchContainer">
        <Formik
          initialValues={{ text: "", company: "", start: "", end: "" }}
          innerRef={formRef}
          onSubmit={(values, { setSubmitting }) => {
            try {
              //create a shallow copy of values object to change equality by reference: trigger useEffect hook
              let valuesCopy;
              valuesCopy = { ...values };
              setSubmitting(true);
              setOpenId(0);
              setClosedId(0);
              setQuery(valuesCopy);
              setSubmitting(false);
            } catch (err) {
              // console.log(err.response.data);
              console.error(err);
            }
          }}
        >
          {({ isSubmitting }) => (
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
                <IconButton type="submit" disabled={isSubmitting}>
                  <SearchIcon />
                </IconButton>
              </div>
            </Form>
          )}
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
            endIcon={
              order === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
            }
          >
            Sort By
          </Button>
          {formRef.current && (
            <ExportSelect
              start={formRef.current.values.start}
              end={formRef.current.values.end}
            />
          )}
        </div>
      </div>
      <div className="ticketTable" value={value} hidden={value !== 0}>
        {openTickets && !(openTickets.length === 0) ? (
          openTickets
            .filter((ticket) => {
              if (labels.length === 0) return true;
              return labels.some((label) => {
                if (ticket.label && ticket.label.split(",").includes(label)) {
                  return true;
                }
                return false;
              });
            })
            .map((ticket, idx) => (
              <Link
                ref={
                  openTickets.length === idx + 1
                    ? (node) => lastOpenTicket(node, ticket.id)
                    : null
                }
                key={ticket.id}
                to={{
                  pathname: `/ticket/${ticket.id}`,
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
        <div>{loading && <CircularProgress />}</div>
        <div>
          {error && (
            <p>
              There was an error fetching data from the server. Please try
              refreshing.
            </p>
          )}
        </div>
      </div>
      <div className="ticketTable" value={value} hidden={value !== 1}>
        {closedTickets && !(closedTickets.length === 0) ? (
          closedTickets
            .filter((ticket) => {
              if (labels.length === 0) return true;
              return labels.some((label) => {
                if (ticket.label && ticket.label.split(",").includes(label)) {
                  return true;
                }
                return false;
              });
            })
            .map((ticket, idx) => (
              <Link
                ref={
                  closedTickets.length === idx + 1
                    ? (node) => lastClosedTicket(node, ticket.id)
                    : null
                }
                key={ticket.id}
                to={{
                  pathname: `/ticket/${ticket.id}`,
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
        <div>{cLoading && <CircularProgress />}</div>
        <div>
          {cError && (
            <p>
              There was an error fetching data from the server. Please try
              refreshing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
