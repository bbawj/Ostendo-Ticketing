import React, { useState } from "react";
import "./Home.css";
import { TextField, Button } from "@material-ui/core";
import { Collapse } from "@material-ui/core";
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber";

export default function CreateTicket() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="createTicket">
      <div className="ticketHeader">
        <h2>Create a ticket</h2>
        <ConfirmationNumberIcon />
      </div>
      <form>
        <TextField
          onFocus={() => setExpanded(true)}
          label="Title"
          variant="outlined"
        />
        <Collapse in={expanded}>
          <TextField
            fullWidth
            placeholder="Description"
            multiline
            variant="filled"
            inputProps={{ maxLength: 140, rows: 3, cols: 50 }}
            InputProps={{ disableUnderline: true }}
          />
          <Button variant="contained">Submit Ticket</Button>
        </Collapse>
      </form>
    </div>
  );
}
