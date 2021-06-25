import React, { useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

export default function MyTickets() {
  const [value, setValue] = useState(0);
  return (
    <div className="myTickets">
      <h2>My Tickets</h2>
      <Tabs
        indicatorColor="primary"
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <Tab label="Open" />
        <Tab label="Closed" />
      </Tabs>
      <div value={value} hidden={value !== 0}>
        <h3>No opened tickets</h3>
      </div>
      <div value={value} hidden={value !== 1}>
        <h3>No closed tickets</h3>
      </div>
    </div>
  );
}
