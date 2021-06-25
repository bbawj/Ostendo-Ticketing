import React from "react";
import "./Signup.css";
import { Formik, Field, Form, useField } from "formik";
import * as Yup from "yup";
import { TextField, Button } from "@material-ui/core";
import axios from "../axios";
import { useHistory } from "react-router-dom";

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
export default function Signup() {
  const history = useHistory();
  return (
    <div className="signup">
      <h2>Create an account</h2>
      <Formik
        initialValues={{ email: "", password: "", passwordConfirm: "" }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Required"),
          password: Yup.string().required("Required"),
          passwordConfirm: Yup.string().oneOf(
            [Yup.ref("password"), null],
            "Passwords must match"
          ),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          const res = await axios.post("/register", values);
          history.push(res.redirectUrl);
          setSubmitting(false);
        }}
      >
        <Form>
          <Field name="email" type="email" as={MyTextField} label="Email" />
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

          <Button variant="contained" type="submit">
            Sign up
          </Button>
        </Form>
      </Formik>
      <p>Have an account? Login.</p>
    </div>
  );
}
