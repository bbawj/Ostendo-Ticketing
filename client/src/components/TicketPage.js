import axios from "../axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import "./Ticket.css";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { Button } from "@material-ui/core";
import { useUser } from "../contexts/UserContext";

export default function TicketPage() {
  const { state } = useLocation();
  const [ticket, setTicket] = useState({});
  const [response, setResponse] = useState("");
  const [comments, setComments] = useState([]);
  const { currentUser } = useUser();
  console.log(ticket);

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
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function getTicketData() {
      const res = await axios.get(`/api/ticket/${state.ticketId}`, {
        withCredentials: true,
      });
      setTicket({
        ...res.data.ticketData,
        username: res.data.ticketData.email.split("@")[0],
        date: new Date(res.data.ticketData.created_date).toDateString(),
      });
      setComments(res.data.commentData);
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
          startIcon={<CheckCircleOutlineIcon style={{ color: "#d73a49" }} />}
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
          startIcon={<ErrorOutlineIcon style={{ color: "#28a745" }} />}
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
        comments.map((comment, idx) => (
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
                  commented on {new Date(comment.created_date).toDateString()}
                </p>
              </div>
              <div className="ticketContentMain">
                <p>{comment.text}</p>
              </div>
            </div>
          </div>
        ))}
      <div className="ticketContent" style={{ marginTop: "1em" }}>
        <div className="ticketContentHeader">
          <h3>Respond</h3>
        </div>
        <div className="ticketContentMain">
          <form onSubmit={handleSubmitComment}>
            <TextareaAutosize
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Leave a comment"
            />
            <div className="commentButton">
              <Button
                type="submit"
                disabled={!!!response}
                style={{ backgroundColor: "#28a745", color: "white" }}
              >
                Comment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
