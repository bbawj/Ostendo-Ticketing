import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import React from "react";
import AdminHome from "./AdminHome";

export default function AdminDashboard() {
  return (
    <div>
      <div className="adminHomeHeader">
        <h2>Dashboard</h2>
        <Button variant="outlined" color="primary">
          <Link to="/admin">Admin Panel</Link>
        </Button>
      </div>
      <AdminHome type="all" />
    </div>
  );
}
