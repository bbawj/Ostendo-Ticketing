import React, { useState } from "react";
import "./Signup.css";
import { Formik, Field, Form, useField } from "formik";
import * as Yup from "yup";
import { TextField, Button } from "@material-ui/core";
import axios from "../axios";
import { useHistory, Link, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const MyTextField = ({ label, type, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : "";

  return (
    <div className="formFields">
      <TextField
        label={label}
        fullWidth
        type={type}
        {...field}
        helperText={errorText}
        error={!!errorText}
      />
    </div>
  );
};
export default function Login() {
  const history = useHistory();
  const { setCurrentUser } = useUser();
  const [error, setError] = useState("");
  const { state } = useLocation();

  return (
    <div className="signup">
      <h2>Login</h2>
      <p>Sign in to your account</p>
      {error && (
        <span style={{ marginLeft: "1em", color: "red" }}>{error}</span>
      )}
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Required"),
          password: Yup.string().required("Required"),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setSubmitting(true);
            const res = await axios.post("/api/auth/login", values, {
              withCredentials: true,
            });
            setSubmitting(false);
            setCurrentUser({ id: res.data.id, role: res.data.role });
            //redirect users to page they were trying to navigate
            if (state && state.from) {
              history.push(state.from);
            } else {
              history.push("/home");
            }
          } catch (err) {
            console.log(err);
            setError("Email or password incorrect");
          }
        }}
      >
        <Form>
          <div className="formFlex">
            <Field name="email" type="email" as={MyTextField} label="Email" />
          </div>
          <div className="formFlex">
            <Field
              name="password"
              type="password"
              label="Password"
              as={MyTextField}
            />
          </div>

          <Button variant="contained" type="submit">
            Login
          </Button>
        </Form>
      </Formik>
      <p>
        Don't have an account? <Link to="/signup">Sign up.</Link>
      </p>
      <p>
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>
    </div>
  );
}
