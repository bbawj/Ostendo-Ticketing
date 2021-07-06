import React, { useEffect, useState } from "react";
import "./TicketSidebar.css";
import AddIcon from "@material-ui/icons/Add";
import axios from "../axios";
import LabelSelect from "./LabelSelect";
import AssignSelect from "./AssignSelect";

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

export default function TicketSidebar({ id, label, assign }) {
  const [labels, setLabels] = useState([]);
  const [assigned, setAssigned] = useState("");

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

  async function changeAssigned(e) {
    try {
      await axios.patch(
        `/api/ticket/${id}`,
        {
          assignee: e.target.value,
        },
        { withCredentials: true }
      );
      setAssigned(e.target.value);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (label) {
      setLabels(label.split(","));
    }
    if (assign) {
      setAssigned(assign);
    }
  }, [label, assign]);

  return (
    <div className="ticketSidebar">
      <div className="sidebarBox">
        <div className="sidebarBoxHeader">
          <LabelSelect labels={labels} addLabel={addLabel} Icon={AddIcon} />
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
      <div className="sidebarBox">
        <div className="sidebarBoxHeader">
          <AssignSelect changeAssigned={changeAssigned} assigned={assigned} />
        </div>
        <div className="sidebarBoxContent">
          {assigned && <span className="label">{assigned}</span>}
        </div>
      </div>
    </div>
  );
}
