import React, { useState } from "react";
import { Select, MenuItem, IconButton, Button } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import axios from "../axios";

const headerObj = {
  user: ["email", "count"],
  category: ["name", "count"],
  detail: [
    "id",
    "owner_id",
    "assigned_id",
    "status",
    "title",
    "description",
    "created_date",
    "closed_date",
    "email",
    "company",
    "label",
  ],
};

export default function ExportSelect({ start, end, data }) {
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
      if (!start && !end) {
        return alert("Search with select first.");
      }
      let info;
      if (type !== "detail") {
        const res = await axios.post(
          "/api/ticket/export",
          { start: start, end: end, type: type },
          { withCredentials: true }
        );
        info = res.data.data;
      } else {
        info = data;
      }
      console.log(data);
      const csvRows = [];
      csvRows.push(headerObj[type].join(","));
      for (const row of info) {
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
        <MoreVertIcon />
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
