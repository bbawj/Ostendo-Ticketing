import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
export default function ResetPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { id, token } = useParams();

  return (
    <div className="signup">
      <h2>Reset Password</h2>
      <p>Enter a new password.</p>
      {error && (
        <span style={{ marginLeft: "1em", color: "var(--error)" }}>
          {error}
          <Link
            style={{ textDecoration: "underline", color: "var(--error)" }}
            to="/forgot-password"
          >
            new reset link
          </Link>
        </span>
      )}
      {message && (
        <span style={{ marginLeft: "1em", color: "var(--success)" }}>
          {message}
          <Link
            style={{ textDecoration: "underline", color: "var(--success)" }}
            to="/login"
          >
            Login.
          </Link>
        </span>
      )}
      <Formik
        initialValues={{ password: "", passwordConfirm: "" }}
        validationSchema={Yup.object({
          password: Yup.string().required("Required"),
          passwordConfirm: Yup.string().oneOf(
            [Yup.ref("password"), null],
            "Passwords must match"
          ),
        })}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          try {
            setSubmitting(true);
            setMessage("");
            setError("");
            await axios.post(`/api/auth/reset-password/${id}/${token}`, values);
            setMessage("Your password has been reset. ");

            setStatus("done");
          } catch (err) {
            setError("Failed to reset your password. Try requesting a ");
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, status }) =>
          status !== "done" && (
            <Form>
              <div className="formFlex">
                <Field
                  name="password"
                  type="password"
                  label="Password"
                  as={MyTextField}
                />
                <Field
                  name="passwordConfirm"
                  type="password"
                  label="Confirm Password"
                  as={MyTextField}
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
