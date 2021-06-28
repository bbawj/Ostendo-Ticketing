import React from "react";
import "./Signup.css";
import { Formik, Field, Form, useField } from "formik";
import * as Yup from "yup";
import { TextField, Button } from "@material-ui/core";
import axios from "../axios";
import { useHistory, Link } from "react-router-dom";
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

  return (
    <div className="signup">
      <h2>Login</h2>
      <Formik
        initialValues={{ email: "", password: "", passwordConfirm: "" }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Required"),
          password: Yup.string().required("Required"),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          const res = await axios.post("/login", values, {
            withCredentials: true,
          });
          setSubmitting(false);
          history.push(res.data.redirectUrl);
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

          <Button variant="contained" type="submit">
            Login
          </Button>
        </Form>
      </Formik>
      <p>
        Don't have an account? <Link to="/signup">Sign up.</Link>
      </p>
    </div>
  );
}
