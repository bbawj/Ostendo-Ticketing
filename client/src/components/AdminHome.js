import React, { useCallback, useEffect, useRef, useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import { Formik, Field, Form } from "formik";
import {
  Button,
  IconButton,
  TextField,
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
import axios from "../axios";
import AutoComplete from "@material-ui/lab/Autocomplete";

export default function AdminHome({ type }) {
  const [value, setValue] = useState(0);
  const [order, setSort] = useState("asc");
  const [labels, setLabels] = useState([]);
  const [companies, setCompanies] = useState([]);
  const formRef = useRef();
  const [query, setQuery] = useState({});
  const [openId, setOpenId] = useState(0);
  const [closedId, setClosedId] = useState(0);
  const openObserver = useRef();
  const closedObserver = useRef();
  const { openTickets, hasMore, loading, error } = useOpenTicketSearch(
    openId,
    order,
    type,
    query
  );
  const { closedTickets, cHasMore, cLoading, cError } = useClosedTicketSearch(
    closedId,
    order,
    type,
    query
  );
  // observer to check when user has scrolled to last item
  const lastOpenTicket = useCallback(
    (node, id) => {
      // console.log(id);
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

  useEffect(() => {
    async function getCompanies() {
      const res = await axios.get("/api/company", { withCredentials: true });
      setCompanies(res.data);
    }
    getCompanies();
  }, []);

  return (
    <div className="adminHome">
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
          {({ isSubmitting, setFieldValue, initialValues }) => (
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
                {(type === "all" || type === "assigned") && (
                  <AutoComplete
                    id="company"
                    name="company"
                    options={companies}
                    style={{ width: "50%" }}
                    getOptionLabel={(option) => option.name}
                    onChange={(e, value) => {
                      //console.log(value);
                      setFieldValue(
                        "company",
                        value !== null ? value.id : initialValues.company
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Company"
                        variant="outlined"
                      />
                    )}
                  />
                )}
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
          {type === "all" && formRef.current && (
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
        ) : error || loading ? (
          <span></span>
        ) : (
          <h3>No open tickets. Try searching something else.</h3>
        )}
        <div>
          {loading && <CircularProgress style={{ marginTop: "1em" }} />}
        </div>
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
