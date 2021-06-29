import React from "react";
import Signup from "./Signup";
import Header from "./Header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import Login from "./Login";
import { UserProvider } from "../contexts/UserContext";
import TicketPage from "./TicketPage";

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
            <Route exact path="/" component={Login} />
            <Route exact path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/home" component={Home} />
            <Route path="/ticket/:id" component={TicketPage} />
          </UserProvider>
        </Router>
      </ThemeProvider>
    </div>
  );
}
