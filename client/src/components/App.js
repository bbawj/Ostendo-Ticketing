import React from "react";
import Signup from "./Signup";
import Header from "./Header";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import Login from "./Login";
import { UserProvider } from "../contexts/UserContext";
import TicketPage from "./TicketPage";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import PrivateRoute from "../Routes/PrivateRoute";
import RedirectRoute from "../Routes/RedirectRoute";
import AdminRoute from "../Routes/AdminRoute";
import AdminPanel from "./AdminPanel";

const THEME = createMuiTheme({
  typography: {
    fontFamily: "Lato",
  },
  palette: {
    primary: {
      main: "#337ab7",
    },
  },
});

export default function App() {
  return (
    <div className="App">
      <ThemeProvider theme={THEME}>
        <Router>
          <UserProvider>
            <Header />
            <RedirectRoute exact path="/" component={Login} />
            <RedirectRoute exact path="/login" component={Login} />
            <RedirectRoute path="/signup" component={Signup} />
            <RedirectRoute path="/forgot-password" component={ForgotPassword} />
            <RedirectRoute path="/reset/:id/:token" component={ResetPassword} />
            <PrivateRoute path="/home" component={Home} />
            <AdminRoute path="/admin" component={AdminPanel} />
            <PrivateRoute path="/ticket/:id" component={TicketPage} />
          </UserProvider>
        </Router>
      </ThemeProvider>
    </div>
  );
}
