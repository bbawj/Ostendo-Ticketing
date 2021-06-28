import React, { useState } from "react";
import "./Signup.css";
import { Formik, Field, Form, useField } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";
import axios from "../axios";
import { useHistory, Link } from "react-router-dom";

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

const MySelectField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : "";

  return (
    <div className="formFields">
      <InputLabel id={label}>{label}</InputLabel>
      <Select style={{ width: "100%" }} {...field} labelId={label}>
        <MenuItem value="gmp">GMP Recruitment</MenuItem>
      </Select>
      <FormHelperText error={!!errorText}>{errorText}</FormHelperText>
    </div>
  );
};
export default function Signup() {
  const history = useHistory();
  const [error, setError] = useState();
  return (
    <div className="signup">
      <h2>Create an account</h2>
      {error && <span style={{ color: "red" }}>{error}</span>}
      <Formik
        initialValues={{
          email: "",
          company: "",
          password: "",
          passwordConfirm: "",
        }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Required"),
          company: Yup.string().required(),
          password: Yup.string().required("Required"),
          passwordConfirm: Yup.string().oneOf(
            [Yup.ref("password"), null],
            "Passwords must match"
          ),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setSubmitting(true);
            const res = await axios.post("/register", values);
            history.push(res.data.redirectUrl);
            setSubmitting(false);
          } catch (err) {
            setError(err.response.data.message);
          }
        }}
      >
        <Form>
          <div className="formFlex">
            <Field name="email" type="email" as={MyTextField} label="Email" />
            <Field
              name="company"
              type="select"
              as={MySelectField}
              label="Company"
            />
          </div>
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

          <Button variant="contained" type="submit">
            Sign up
          </Button>
        </Form>
      </Formik>
      <p>
        Have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}
