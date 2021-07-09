import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import Button from "@material-ui/core/Button";
import { IconButton, Tooltip, Select, MenuItem } from "@material-ui/core";
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
import Slide from "@material-ui/core/Slide";
import BusinessIcon from "@material-ui/icons/Business";
import "./AdminPanel.css";

export default function AddUserDialog({ info, setInfo }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [userOpen, setUserOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersCopy, setUsersCopy] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");

  function handleSearch(e) {
    setSearch(e.target.value);
    setUsersCopy(users.filter((user) => user.email.includes(e.target.value)));
  }

  function addUser(id, email) {
    setInfo((prev) => ({ ...prev, owner_id: id, selected: email }));
    setSearch("");
    setOpen(false);
  }

  const User = ({ index, style }) => (
    <ListItem
      value={usersCopy[index].id}
      button
      disableGutters
      onClick={() => addUser(usersCopy[index].id, usersCopy[index].email)}
      style={style}
    >
      <ListItemText primary={usersCopy[index].email} />
    </ListItem>
  );

  useEffect(() => {
    async function getUsers() {
      const res = await axios.get("/api/user", { withCredentials: true });
      const nonAdmins = res.data.filter((user) => user.role === "user");
      setUsers(nonAdmins);
      setUsersCopy(nonAdmins);
      setAdmins(res.data.filter((user) => user.role === "admin"));
      const company = await axios.get("/api/company", {
        withCredentials: true,
      });
      setCompanies(company.data);
    }
    getUsers();
  }, []);

  return (
    <div className="addUserDialog">
      <div className="addUserBox">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpen(true)}
        >
          Assign User
        </Button>
        <p>{info.selected}</p>
      </div>
      <Select
        displayEmpty
        value={info.assigned_id ? info.assigned_id : ""}
        onChange={(e) =>
          setInfo((prev) => ({ ...prev, assigned_id: e.target.value }))
        }
      >
        <MenuItem value="" disabled>
          Assign Admin
        </MenuItem>
        {admins.map((admin) => (
          <MenuItem key={admin.id} value={admin.id}>
            {admin.email}
          </MenuItem>
        ))}
      </Select>
      <Dialog
        TransitionComponent={Slide}
        TransitionProps={{ direction: "right" }}
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Assign User</DialogTitle>
        <DialogContent>
          <TextField
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
            width={"100%"}
          >
            {User}
          </FixedSizeList>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              setUserOpen(true);
            }}
            color="primary"
          >
            Add New
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Slide}
        TransitionProps={{ direction: "left" }}
        open={userOpen}
        onClose={() => setUserOpen(false)}
        aria-labelledby="secondform-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="secondform-dialog-title">Add New User</DialogTitle>
        <DialogContent>
          {!!error && <p style={{ color: "var(--error)" }}>{error}</p>}
          <Formik
            initialValues={{
              email: "",
              password: "",
              passwordConfirm: "",
              company: "",
            }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email("Invalid email address")
                .required("Required"),
              company: Yup.number("Required").integer().required("Required"),
              password: Yup.string().required("Required"),
              passwordConfirm: Yup.string().oneOf(
                [Yup.ref("password"), null],
                "Passwords must match"
              ),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);
              setError(false);
              try {
                await axios.post("/api/user", values, {
                  withCredentials: true,
                });
                setUserOpen(false);
                setInfo((prev) => ({ ...prev, user: values.email }));
                setSubmitting(false);
              } catch (err) {
                console.error(err);
                if (err.response.status === 500) {
                  setError("Error creating new user");
                } else {
                  setError(err.response.data.message);
                }
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="addUserForm">
                <Field
                  name="email"
                  autoComplete="off"
                  type="email"
                  placeholder="Email"
                  as={TextField}
                />
                <Field
                  name="password"
                  autoComplete="off"
                  type="password"
                  placeholder="Password"
                  as={TextField}
                />
                <Field
                  name="passwordConfirm"
                  type="password"
                  placeholder="Confirm Password"
                  as={TextField}
                />
                <div className="container">
                  <Field
                    name="company"
                    style={{ width: "100%" }}
                    as={Select}
                    displayEmpty
                  >
                    <MenuItem value="">Company</MenuItem>
                    {companies.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Field>
                  <Tooltip title="New Company">
                    <IconButton
                      color="primary"
                      onClick={() => setCompanyOpen(true)}
                    >
                      <BusinessIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <DialogActions>
                  <Button
                    onClick={() => {
                      setUserOpen(false);
                      setOpen(true);
                    }}
                    color="primary"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" disabled={isSubmitting}>
                    Create
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
      <Dialog
        TransitionComponent={Slide}
        TransitionProps={{ direction: "right" }}
        open={companyOpen}
        onClose={() => setCompanyOpen(false)}
        aria-labelledby="thirdform-dialog-title"
        maxWidth="xs"
      >
        <DialogTitle id="thirdform-dialog-title">Add New Company</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{ name: "" }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                setSubmitting(true);
                const res = await axios.post("/api/company", values, {
                  withCredentials: true,
                });
                setCompanies((prev) => [...prev, res.data]);
                setSubmitting(false);
                setCompanyOpen(false);
              } catch (err) {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <Field
                  fullWidth
                  name="name"
                  autoComplete="off"
                  type="text"
                  placeholder="Company Name"
                  as={TextField}
                />

                <DialogActions>
                  <Button onClick={() => setCompanyOpen(false)} color="primary">
                    Cancel
                  </Button>
                  <Button disabled={isSubmitting} type="submit" color="primary">
                    Create
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
}
