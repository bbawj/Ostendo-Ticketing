import React, { useState } from "react";
import { IconButton, Select, MenuItem } from "@material-ui/core";

export default function LabelSelect(props) {
  const [open, setOpen] = useState(false);

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
  return (
    <div className={`sidebarBoxHeader ${props.className}`}>
      <h3>Labels</h3>
      <IconButton onClick={() => setOpen(!open)}>
        <props.Icon style={{ color: "var(--theme)" }} />
      </IconButton>
      <Select
        MenuProps={{
          getContentAnchorEl: () => null,
        }}
        style={{ visibility: "hidden", width: "0" }}
        multiple
        open={open}
        value={props.labels}
        onChange={props.addLabel}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      >
        {labelNames.sort().map((label) => (
          <MenuItem key={label} value={label}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}
