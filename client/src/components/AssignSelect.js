import React, { useState } from "react";
import { IconButton, Select, MenuItem } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

export default function AssignSelect({ changeAssigned, assigned }) {
  const [open, setOpen] = useState(false);

  const assignees = ["anson@ostendoasia.com", "brendanawjang@gmail.com"];
  return (
    <div className={`sidebarBoxHeader`}>
      <h3>Assigned to</h3>
      <IconButton onClick={() => setOpen(!open)}>
        <AddIcon style={{ color: "var(--theme)" }} />
      </IconButton>
      <Select
        MenuProps={{
          getContentAnchorEl: () => null,
        }}
        style={{ visibility: "hidden", width: "0" }}
        open={open}
        value={assigned}
        onChange={changeAssigned}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      >
        {assignees.sort().map((label) => (
          <MenuItem key={label} value={label}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}
