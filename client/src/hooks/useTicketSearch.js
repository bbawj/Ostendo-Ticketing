import { useEffect, useState } from "react";
import axios from "../axios";
import baseaxios from "axios";

export function useOpenTicketSearch(openId, order, type, query) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openTickets, setOpenTickets] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  //   console.log(order);
  // console.log(query);
  //   console.log(openId);
  useEffect(() => {
    setOpenTickets([]);
  }, [query, order, type]);

  // when query/openId/order changes, refetch data
  useEffect(() => {
    let cancel;
    async function getOpenTickets() {
      try {
        setLoading(true);
        setError(false);
        let res;
        if (type === "all") {
          res = await axios.post(
            "/api/admin",
            {
              ...query,
              end: query.end
                ? new Date(new Date(query.end).getTime() + 24 * 60 * 60 * 1000)
                : "", //add 1 day because of date formatting
              last: openId,
              status: ["open"],
              order: order,
            },
            {
              withCredentials: true,
              cancelToken: new baseaxios.CancelToken((c) => (cancel = c)),
            }
          );
        } else if (type === "assigned") {
          res = await axios.post(
            "/api/admin",
            {
              ...query,
              end: query.end
                ? new Date(new Date(query.end).getTime() + 24 * 60 * 60 * 1000)
                : "", //add 1 day because of date formatting
              last: openId,
              status: ["open"],
              order: order,
              user: 1,
            },
            {
              withCredentials: true,
              cancelToken: new baseaxios.CancelToken((c) => (cancel = c)),
            }
          );
        } else if (type === "user") {
          res = await axios.get("/api/ticket/user", {
            params: {
              ...query,
              end: query.end
                ? new Date(new Date(query.end).getTime() + 24 * 60 * 60 * 1000)
                : "", //add 1 day because of date formatting
              last: openId,
              status: ["open"],
              order: order,
            },
            withCredentials: true,
            cancelToken: new baseaxios.CancelToken((c) => (cancel = c)),
          });
        }
        setHasMore(res.data.length > 0);
        setOpenTickets((prev) => [...prev, ...res.data]);
        setLoading(false);
      } catch (err) {
        if (baseaxios.isCancel(err)) return;
        console.error(err);
        setError(true);
      }
    }
    getOpenTickets();
    return () => cancel();
  }, [query, openId, order, type]);

  return { loading, error, openTickets, hasMore };
}

export function useClosedTicketSearch(closedId, order, type, query) {
  const [cLoading, setCLoading] = useState(true);
  const [cError, setError] = useState(false);
  const [closedTickets, setClosedTickets] = useState([]);
  const [cHasMore, setHasMore] = useState(false);

  useEffect(() => {
    setClosedTickets([]);
  }, [query, order, type]);

  useEffect(() => {
    let cancel;
    async function getClosedTickets() {
      try {
        setCLoading(true);
        setError(false);
        let res;
        if (type === "all") {
          res = await axios.post(
            "/api/admin",
            {
              ...query,
              end: query.end
                ? new Date(new Date(query.end).getTime() + 24 * 60 * 60 * 1000)
                : "", //add 1 day because of date formatting
              last: closedId,
              status: ["closed", "closedbyadmin"],
              order: order,
            },
            {
              withCredentials: true,
              cancelToken: new baseaxios.CancelToken((c) => (cancel = c)),
            }
          );
        } else if (type === "assigned") {
          res = await axios.post(
            "/api/admin",
            {
              ...query,
              end: query.end
                ? new Date(new Date(query.end).getTime() + 24 * 60 * 60 * 1000)
                : "", //add 1 day because of date formatting
              last: closedId,
              status: ["closed", "closedbyadmin"],
              order: order,
              user: 1,
            },
            {
              withCredentials: true,
              cancelToken: new baseaxios.CancelToken((c) => (cancel = c)),
            }
          );
        } else if (type === "user") {
          res = await axios.get("/api/ticket/user", {
            params: {
              ...query,
              end: query.end
                ? new Date(new Date(query.end).getTime() + 24 * 60 * 60 * 1000)
                : "", //add 1 day because of date formatting
              last: closedId,
              status: ["closed" || "closedbyadmin"],
              order: order,
            },
            withCredentials: true,
            cancelToken: new baseaxios.CancelToken((c) => (cancel = c)),
          });
        }
        setHasMore(res.data.length > 0);
        setClosedTickets((prev) => [...prev, ...res.data]);
        setCLoading(false);
      } catch (err) {
        if (baseaxios.isCancel(err)) return;
        console.error(err);

        setError(true);
      }
    }
    getClosedTickets();
    return () => cancel();
  }, [query, type, closedId, order]);

  return { cLoading, cError, closedTickets, cHasMore };
}
