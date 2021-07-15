import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";
import { Formik, Field, Form, useField } from "formik";
import * as Yup from "yup";
import { TextField, Button } from "@material-ui/core";
import axios from "../axios";

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
export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="signup">
      <h2>Reset Password</h2>
      <p>Enter your email address.</p>
      {message && (
        <span style={{ marginLeft: "1em", color: "var(--success)" }}>
          {message}
        </span>
      )}
      {error && (
        <span style={{ marginLeft: "1em", color: "var(--error)" }}>
          {error}
        </span>
      )}

      <Formik
        initialValues={{ email: "" }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Required"),
        })}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          try {
            setMessage("");
            setError("");
            setSubmitting(true);
            await axios.post("/api/auth/forgot-password", values);
            setMessage("Reset link sent. Please check your email.");
            setStatus("done");
          } catch (err) {
            setError("User with email does not exist.");
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, status }) =>
          status !== "done" && (
            <Form className="resetPassword">
              <div className="formFlex">
                <Field
                  name="email"
                  type="email"
                  as={MyTextField}
                  label="Email"
                />
              </div>
              <Button disabled={isSubmitting} variant="contained" type="submit">
                Submit
              </Button>
            </Form>
          )
        }
      </Formik>
      <p>
        <Link to="/login">Cancel</Link>
      </p>
    </div>
  );
}
