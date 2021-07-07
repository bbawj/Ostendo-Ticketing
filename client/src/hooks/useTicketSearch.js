import { useEffect, useLayoutEffect, useState } from "react";
import axios from "../axios";
import baseaxios from "axios";

export function useOpenTicketSearch(query, openId, order) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openTickets, setOpenTickets] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  //   console.log(order);
  //   console.log(query);
  //   console.log(openId);
  useEffect(() => {
    setOpenTickets([]);
  }, [query, order]);

  useEffect(() => {
    // console.log("requested Open");
    let cancel;
    async function getOpenTickets() {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.post(
          "/api/ticket/admin",
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
  }, [query, openId, order]);

  return { loading, error, openTickets, hasMore };
}

export function useClosedTicketSearch(query, closedId, order) {
  const [cLoading, setCLoading] = useState(true);
  const [cError, setError] = useState(false);
  const [closedTickets, setClosedTickets] = useState([]);
  const [cHasMore, setHasMore] = useState(false);

  useEffect(() => {
    setClosedTickets([]);
  }, [query, order]);

  useEffect(() => {
    let cancel;
    async function getClosedTickets() {
      try {
        // console.log("requestedClosed");
        setCLoading(true);
        setError(false);
        const res = await axios.post(
          "/api/ticket/admin",
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
  }, [query, closedId, order]);

  return { cLoading, cError, closedTickets, cHasMore };
}
