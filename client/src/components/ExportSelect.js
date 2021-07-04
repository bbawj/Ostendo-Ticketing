import React, { useState } from "react";
import { Select, MenuItem, IconButton, Button } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import axios from "../axios";

const headerObj = {
  user: ["email", "count"],
  category: ["name", "count"],
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
      const res = await axios.post(
        "/api/ticket/export",
        { start: start, end: end, type: type },
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
        <MenuItem value="user">
          <Button onClick={() => handleExport("user")}>Report by user</Button>
        </MenuItem>
      </Select>
    </div>
  );
}
