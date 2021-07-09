import React, { useState } from "react";
import "./Home.css";
import { TextField, Button, Snackbar, Collapse } from "@material-ui/core";
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber";
import axios from "../axios";
import Alert from "@material-ui/lab/Alert";
import AddUserDialog from "./AddUserDialog";

export default function CreateTicket({ admin }) {
  const [expanded, setExpanded] = useState(false);
  const [info, setInfo] = useState({ title: "", description: "" });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  async function handleCreateTicket(e) {
    e.preventDefault();
    try {
      await axios.post(
        "/api/ticket",
        {
          title: info.title,
          description: info.description,
          assigned_id: info.assigned_id,
          owner_id: info.owner_id,
        },
        { withCredentials: true }
      );
      setInfo({ title: "", description: "" });
      setOpen(true);
    } catch (err) {
      console.error(err);
      setError(true);
    }
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };
  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setError(false);
  };

  return (
    <div className="createTicket">
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Your ticket has been recorded!
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          There was an error processing your request.
        </Alert>
      </Snackbar>
      <div className="ticketCreateHeader">
        <h3>Create a ticket</h3>
        <ConfirmationNumberIcon />
      </div>
      <form onSubmit={handleCreateTicket}>
        <div className="createTicketTitle">
          <TextField
            value={info.title}
            required
            onFocus={() => setExpanded(true)}
            label="Title"
            variant="outlined"
            onChange={(e) =>
              setInfo((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          {admin && <AddUserDialog info={info} setInfo={setInfo} />}
        </div>
        <Collapse in={expanded}>
          <TextField
            value={info.description}
            required
            fullWidth
            placeholder="Description"
            multiline
            variant="filled"
            inputProps={{ rows: 3, cols: 50 }}
            InputProps={{ disableUnderline: true }}
            onChange={(e) =>
              setInfo((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <Button type="submit" color="primary" variant="contained">
            Submit Ticket
          </Button>
        </Collapse>
      </form>
    </div>
  );
}
