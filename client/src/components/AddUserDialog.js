import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import { IconButton, Tooltip } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { FixedSizeList } from "react-window";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import axios from "../axios";
import { Formik, Field, Form } from "formik";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import "./AdminPanel.css";

export default function AddUserDialog({ info, setInfo }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersCopy, setUsersCopy] = useState([]);
  const [search, setSearch] = useState("");

  function handleSearch(e) {
    setSearch(e.target.value);
    setUsersCopy(users.filter((user) => user.email.includes(e.target.value)));
  }

  function addUser(e) {
    // console.log(e);
    setInfo((prev) => ({ ...prev, user: e }));
    setSearch("");
    setOpen(false);
  }

  const User = ({ index, style }) => (
    <ListItem
      value={usersCopy[index].email}
      button
      onClick={() => addUser(usersCopy[index].email)}
      style={style}
    >
      <ListItemText primary={usersCopy[index].email} />
    </ListItem>
  );

  useEffect(() => {
    async function getUsers() {
      const res = await axios.get("/api/user", { withCredentials: true });
      setUsers(res.data);
      setUsersCopy(res.data);
    }
    getUsers();
  }, []);

  return (
    <div className="addUserDialog">
      <div className="addUserBox">
        <Tooltip title="Assign User">
          <IconButton color="primary" onClick={() => setOpen(true)}>
            <PersonAddIcon />
          </IconButton>
        </Tooltip>
        <p>: {info.user}</p>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Assign User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            value={search}
            autoComplete="off"
            id="name"
            label="Search"
            type="text"
            fullWidth
            onChange={handleSearch}
          />
          <FixedSizeList
            height={200}
            itemCount={usersCopy.length}
            itemSize={30}
            width={300}
          >
            {User}
          </FixedSizeList>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => setSecondOpen(true)} color="primary">
            Add New
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={secondOpen}
        onClose={() => setSecondOpen(false)}
        aria-labelledby="secondform-dialog-title"
      >
        <DialogTitle id="secondform-dialog-title">Add New User</DialogTitle>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            setError(false);
            try {
              await axios.post("/api/user", values, { withCredentials: true });
              setSecondOpen(false);
              setOpen(false);
              setInfo((prev) => ({ ...prev, user: values.email }));
            } catch (err) {
              console.error(err);
              setError(true);
              setSubmitting(false);
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <DialogContent>
              {error && (
                <p style={{ color: "var(--error)" }}>
                  Error creating new user.
                </p>
              )}
              <Form>
                <Field
                  style={{ padding: "1em 0" }}
                  name="email"
                  autoComplete="off"
                  type="email"
                  placeholder="Email"
                  fullWidth
                  as={TextField}
                />
                <Field
                  style={{ padding: "1em 0" }}
                  name="password"
                  autoComplete="off"
                  type="password"
                  placeholder="Password"
                  fullWidth
                  as={TextField}
                />
                <DialogActions>
                  <Button onClick={() => setSecondOpen(false)} color="primary">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" disabled={isSubmitting}>
                    Create
                  </Button>
                </DialogActions>
              </Form>
            </DialogContent>
          )}
        </Formik>
      </Dialog>
    </div>
  );
}
