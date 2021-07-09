import React, { useState } from "react";
import { Select, MenuItem, IconButton, Button } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import axios from "../axios";

const headerObj = {
  user: ["email", "count"],
  category: ["name", "count"],
  detail: [
    "id",
    "email",
    "company",
    "assigned_id",
    "status",
    "title",
    "description",
    "created_date",
    "closed_date",
    "conclusion",
    "label",
  ],
};

export default function ExportSelect({ start, end }) {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState("");

  function download(data) {
    const blob = new Blob([data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "download.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleExport(type) {
    try {
      if (!start || !end) {
        return alert("No data to export. Try searching for something first.");
      }
      const res = await axios.post(
        "/api/ticket/export",
        {
          start: start,
          end: new Date(new Date(end).getTime() + 24 * 60 * 60 * 1000),
          type: type,
        },
        { withCredentials: true }
      );
      const csvRows = [];
      csvRows.push(headerObj[type].join(","));
      for (const row of res.data.data) {
        const values = headerObj[type].map((header) => {
          const escaped = ("" + row[header]).replace(/"/g, '\\"');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      }
      const exported = csvRows.join("\n");
      return download(exported);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="exportSelect">
      <IconButton onClick={() => setOpen(!open)} color="primary">
        <ExitToAppIcon />
      </IconButton>
      <Select
        MenuProps={{
          getContentAnchorEl: () => null,
        }}
        style={{ visibility: "hidden", width: "0" }}
        open={open}
        value={exportType}
        onChange={(e) => setExportType(e.target.value)}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      >
        {(!start || !end) && (
          <MenuItem>
            <p style={{ whiteSpace: "pre-wrap" }}>
              Search with a date range to enable exporting.
            </p>
          </MenuItem>
        )}
        {start &&
          end &&
          Object.keys(headerObj).map((key) => (
            <MenuItem value={key} key={key}>
              <Button onClick={() => handleExport(key)}>Report by {key}</Button>
            </MenuItem>
          ))}
      </Select>
    </div>
  );
}
