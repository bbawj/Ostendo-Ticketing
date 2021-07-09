import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import axios from "../axios";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import { useUser } from "../contexts/UserContext";

export default function CloseDialog({ ticket, setTicket }) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useUser();
  const [conclusion, setConclusion] = useState("");

  async function handleChangeIssueStatus(status) {
    try {
      await axios.patch(
        `/api/ticket/${ticket.id}`,
        {
          status: status,
          conclusion: conclusion,
          email: currentUser.role === "admin" ? ticket.email : ticket.assigned,
        },
        { withCredentials: true }
      );
      setConclusion("");
      setTicket((prev) => ({ ...prev, status: status }));
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  let issueButton;
  switch (ticket.status) {
    case "open":
      issueButton = (
        <Button
          onClick={() => setOpen(true)}
          variant="outlined"
          startIcon={
            <CheckCircleOutlineIcon style={{ color: "var(--error)" }} />
          }
        >
          Close Issue
        </Button>
      );
      break;
    case "closed":
      issueButton = (
        <Button
          onClick={() => handleChangeIssueStatus("open")}
          variant="outlined"
          startIcon={<ErrorOutlineIcon style={{ color: "var(--success)" }} />}
        >
          Re-open Issue
        </Button>
      );
      break;
    case "closedbyadmin":
      if (currentUser.role === "admin") {
        issueButton = (
          <Button
            onClick={() => handleChangeIssueStatus("open")}
            variant="outlined"
            startIcon={<ErrorOutlineIcon style={{ color: "var(--success)" }} />}
          >
            Re-open Issue
          </Button>
        );
      } else {
        issueButton = <span></span>;
      }
      break;
    default:
      issueButton = <span></span>;
      break;
  }

  return (
    <div className="closeDialog">
      {issueButton}
      <Dialog
        open={open}
        onClose={() => setOpen(!open)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Close Issue</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Help others understand why you are closing this issue.
          </DialogContentText>
          <TextField
            value={conclusion}
            autoFocus
            required
            multiline
            onChange={(e) => setConclusion(e.target.value)}
            id="name"
            label="Description"
            type="text"
            fullWidth
          />
          <p style={{}}>Characters remaining: {250 - conclusion.length}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(!open)} color="primary">
            Cancel
          </Button>
          <Button
            disabled={!!!conclusion}
            onClick={() => {
              if (currentUser.role === "admin") {
                handleChangeIssueStatus("closedbyadmin");
              } else {
                handleChangeIssueStatus("closed");
              }
            }}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
