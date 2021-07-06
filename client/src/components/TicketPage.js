import axios from "../axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import "./Ticket.css";
import TicketSidebar from "./TicketSidebar";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { Button } from "@material-ui/core";
import { useUser } from "../contexts/UserContext";
import CloseDialog from "./CloseDialog";

export default function TicketPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState({});
  const [response, setResponse] = useState("");
  const [comments, setComments] = useState([]);
  const { currentUser } = useUser();
  //console.log(ticket);
  async function handleSubmitComment(e) {
    try {
      e.preventDefault();
      const res = await axios.post(
        "/api/comment",
        {
          currentUser: currentUser.id,
          ticket_id: ticket.id,
          text: response,
          email: ticket.email,
          title: ticket.title,
        },
        { withCredentials: true }
      );
      setResponse("");
      setComments((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err.response.data.message);
      console.error(err);
    }
  }

  useEffect(() => {
    async function getTicketData() {
      try {
        const res = await axios.get(`/api/ticket/${id}`, {
          withCredentials: true,
        });
        // console.log(res);
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
  }, [id]);

  return (
    <div className="ticketPage">
      <div className="ticketHeader">
        <h2>
          {ticket.title} <span>#{ticket.id}</span>
        </h2>
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
          <CloseDialog ticket={ticket} setTicket={setTicket} />
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
              } else if (comment.type === "open") {
                return (
                  <div
                    className={`ticketContent ${
                      idx === comments.length - 1 && "last"
                    } `}
                    key={comment.id}
                  >
                    <div className="updateContainer">
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
                    <div className="updateContainer">
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
                      })}: ${comment.text}`}</span>
                    </div>
                  </div>
                );
              }
            })}
          <div
            className="ticketContent"
            style={{ marginTop: "1em", marginLeft: "-0.05em" }}
          >
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
        <TicketSidebar
          id={ticket.id}
          label={ticket.label}
          assign={ticket.assigned}
        />
      </div>
    </div>
  );
}
