import { IconButton, Select, MenuItem } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./TicketSidebar.css";
import AddIcon from "@material-ui/icons/Add";
import axios from "../axios";

const labelNames = [
  "Software",
  "Hardware",
  "Email",
  "Business Application",
  "Office 365",
  "User Access",
  "OneDrive",
  "Printer",
  "Networking",
  "Server",
];

export default function TicketSidebar({ id, label }) {
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState([]);

  async function addLabel(e) {
    try {
      // check if label is removed or added
      if (labels.length > e.target.value.length) {
        // label was removed
        const diff = labels.filter((label) => !e.target.value.includes(label));
        const labelId = labelNames.indexOf(diff[0]) + 1;
        await axios.patch(
          `/api/ticket/${id}`,
          {
            label: labelId,
            method: "delete",
          },
          { withCredentials: true }
        );
      } else if (labels.length < e.target.value.length) {
        // label was added
        const diff = e.target.value.filter((label) => !labels.includes(label));
        const labelId = labelNames.indexOf(diff[0]) + 1;
        console.log(diff);
        await axios.patch(
          `/api/ticket/${id}`,
          {
            label: labelId,
            method: "add",
          },
          { withCredentials: true }
        );
      }
      setLabels(e.target.value);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (label) {
      setLabels(label.split(","));
    }
  }, [label]);

  return (
    <div className="ticketSidebar">
      <div className="sidebarBox">
        <div className="sidebarBoxHeader">
          <h3>Labels</h3>
          <IconButton onClick={() => setOpen(!open)}>
            <AddIcon style={{ color: "var(--theme)" }} />
          </IconButton>
          <Select
            style={{ visibility: "hidden", width: "0" }}
            multiple
            open={open}
            value={labels}
            onChange={addLabel}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
          >
            {labelNames.map((label) => (
              <MenuItem key={label} value={label}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div className="sidebarBoxContent">
          {labels.length !== 0 &&
            labels.map((label) => (
              <span key={label} className="label">
                {label}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
