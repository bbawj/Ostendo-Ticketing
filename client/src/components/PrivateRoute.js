import React from "react";
import { Redirect, Route } from "react-router";
import { useUser } from "../contexts/UserContext";

export default function PrivateRoute({ component: Component, ...rest }) {
  const { currentUser } = useUser();
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!currentUser) {
          return <Redirect to="/login" />;
        } else {
          return <Component {...props} />;
        }
      }}
    ></Route>
  );
}
