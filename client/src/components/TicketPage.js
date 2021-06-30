import axios from "../axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import "./Ticket.css";
import TicketSidebar from "./TicketSidebar";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { Button } from "@material-ui/core";
import { useUser } from "../contexts/UserContext";

export default function TicketPage() {
  const { state } = useLocation();
  const [ticket, setTicket] = useState({});
  const [response, setResponse] = useState("");
  const [comments, setComments] = useState([]);
  const { currentUser } = useUser();

  async function handleSubmitComment(e) {
    try {
      e.preventDefault();
      const res = await axios.post(
        "/api/comment",
        {
          currentUser: currentUser.id,
          ticket_id: ticket.id,
          text: response,
        },
        { withCredentials: true }
      );
      console.log("hello");
      setResponse("");
      setComments((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleChangeIssueStatus(status) {
    try {
      await axios.patch(
        `/api/ticket/${ticket.id}`,
        {
          status: status,
        },
        { withCredentials: true }
      );
      setTicket((prev) => ({ ...prev, status: status }));
      setResponse("");
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function getTicketData() {
      try {
        const res = await axios.get(`/api/ticket/${state.ticketId}`, {
          withCredentials: true,
        });
        console.log(res);
        setTicket({
          ...res.data.ticketData,
          username: res.data.ticketData.email.split("@")[0],
          date: new Date(res.data.ticketData.created_date).toLocaleDateString(
            "en-SG",
            { year: "numeric", month: "short", day: "numeric" }
          ),
        });
        setComments(res.data.commentData);
      } catch (err) {
        console.error(err);
      }
    }
    getTicketData();
  }, [state.ticketId]);

  let issueButton;
  switch (ticket.status) {
    case "open":
      issueButton = (
        <Button
          onClick={() => {
            if (currentUser.role === "admin")
              return handleChangeIssueStatus("closedbyadmin");
            return handleChangeIssueStatus("closed");
          }}
          variant="outlined"
          startIcon={
            <CheckCircleOutlineIcon style={{ color: "var(--error)" }} />
          }
        >
          Close Issue
        </Button>
      );
      break;
    case "closed":
      issueButton = (
        <Button
          onClick={() => handleChangeIssueStatus("open")}
          variant="outlined"
          startIcon={<ErrorOutlineIcon style={{ color: "var(--success)" }} />}
        >
          Re-open Issue
        </Button>
      );
      break;
    default:
      issueButton = <span></span>;
      break;
  }

  return (
    <div className="ticketPage">
      <div className="ticketHeader">
        <h1>
          {ticket.title} <span>#{ticket.id}</span>
        </h1>
        <div className="ticketSubheader">
          {ticket.status === "open" ? (
            <div className="ticketStatus open">
              <ErrorOutlineIcon /> <p>Open</p>
            </div>
          ) : (
            <div className="ticketStatus closed">
              <CheckCircleOutlineIcon /> <p>Closed</p>
            </div>
          )}
          <p>{`${ticket.username} opened this issue on ${ticket.date}`}</p>
          {issueButton}
        </div>
      </div>
      <div className="ticketMain">
        <div className="ticketContentColumn">
          <div className="ticketContent">
            <div className="ticketContainer">
              <div className="ticketContentHeader">
                <p>
                  <span style={{ fontWeight: "bold" }}>{ticket.username}</span>{" "}
                  commented on {ticket.date}
                </p>
              </div>
              <div className="ticketContentMain">
                <p>{ticket.description}</p>
              </div>
            </div>
          </div>
          {!(comments.length === 0) &&
            comments.map((comment, idx) => {
              if (comment.type === "comment") {
                return (
                  <div
                    className={`ticketContent ${
                      idx === comments.length - 1 && "last"
                    } `}
                    key={comment.id}
                  >
                    <div className="ticketContainer">
                      <div className="ticketContentHeader">
                        <p>
                          <span style={{ fontWeight: "bold" }}>
                            {comment.email.split("@")[0]}
                          </span>{" "}
                          commented on{" "}
                          {new Date(comment.created_date).toLocaleDateString(
                            "en-SG",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="ticketContentMain">
                        <p>{comment.text}</p>
                      </div>
                    </div>
                  </div>
                );
              } else if (comment.type === "update" && comment.text === "open") {
                return (
                  <div
                    className={`ticketContent ${
                      idx === comments.length - 1 && "last"
                    } `}
                    key={comment.id}
                  >
                    <div className="updateContainer" key={comment.id}>
                      <ErrorOutlineIcon
                        style={{ color: "var(--success)", marginRight: "1em" }}
                      />
                      <span>{`${
                        comment.email.split("@")[0]
                      } has re-opened the issue on ${new Date(
                        comment.created_date
                      ).toLocaleDateString("en-SG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}`}</span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    className={`ticketContent ${
                      idx === comments.length - 1 && "last"
                    } `}
                    key={comment.id}
                  >
                    <div className="updateContainer" key={comment.id}>
                      <CheckCircleOutlineIcon
                        style={{ color: "var(--error)", marginRight: "1em" }}
                      />
                      <span>{`${
                        comment.email.split("@")[0]
                      } closed the issue on ${new Date(
                        comment.created_date
                      ).toLocaleDateString("en-SG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}`}</span>
                    </div>
                  </div>
                );
              }
            })}
          <div className="ticketContent" style={{ marginTop: "1em" }}>
            <div className="ticketContentHeader">
              <h3>Respond</h3>
            </div>
            <div className="ticketContentMain">
              <form onSubmit={handleSubmitComment}>
                <TextareaAutosize
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Leave a comment"
                />
                <div className="commentButton">
                  <Button
                    type="submit"
                    disabled={!!!response}
                    style={{
                      backgroundColor: "var(--success)",
                      color: "white",
                    }}
                  >
                    Comment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <TicketSidebar id={ticket.id} label={ticket.name} />
      </div>
    </div>
  );
}
