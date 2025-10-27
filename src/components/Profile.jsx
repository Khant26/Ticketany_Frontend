import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import OrderDetails from "./OrderDetails";
import Logo from "../assets/logo.jpg";

function Profile() {
  const tabRefs = useRef({});
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("orders");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); // smooth scroll
  }, []);

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    if (activeEl) {
      setUnderlineStyle({
        width: `${activeEl.offsetWidth}px`,
        left: `${activeEl.offsetLeft}px`,
      });
    }
  }, [activeTab]);

  // Utility: get current user id from localStorage (robust across shapes)
  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem("user_data");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id || parsed?.user?.id || parsed?.userId || null;
    } catch {
      return null;
    }
  };

  // Utility: get display name for profile header
  const getDisplayName = () => {
    try {
      const raw = localStorage.getItem("user_data");
      if (!raw) return "User";
      const parsed = JSON.parse(raw);
      const nameLike =
        parsed?.name ||
        parsed?.username ||
        parsed?.user?.name ||
        parsed?.user?.username ||
        parsed?.email ||
        parsed?.user?.email;
      if (typeof nameLike === "string" && nameLike.includes("@")) {
        return nameLike.split("@")[0];
      }
      return nameLike || "User";
    } catch {
      return "User";
    }
  };

  // Try to derive user id from JWT access token (e.g., 'user_id' claim)
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token || typeof token !== "string" || !token.includes("."))
        return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      const candidates = [payload?.user_id, payload?.id, payload?.sub];
      const found = candidates.find((v) => Number.isFinite(Number(v)));
      return found != null ? Number(found) : null;
    } catch {
      return null;
    }
  };

  // Helper: normalize various ID shapes to a numeric ID
  const normalizeId = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Try to parse a trailing number (e.g., '/api/users/4/')
      const match = value.match(/(\d+)(?!.*\d)/);
      if (match) return Number(match[1]);
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    }
    if (typeof value === "object") {
      if (typeof value.id === "number") return value.id;
      if (typeof value.pk === "number") return value.pk;
      if (value.user && typeof value.user.id === "number") return value.user.id;
      const str = String(value);
      const match = str.match(/(\d+)(?!.*\d)/);
      return match ? Number(match[1]) : null;
    }
    return null;
  };

  // Capture the current user ID once on mount (and clear stale orders)
  useEffect(() => {
    let id = getCurrentUserId();
    if (id == null) {
      const fromJwt = getUserIdFromToken();
      if (fromJwt != null) id = fromJwt;
    }
    setUserId(id);
    setOrders([]);
  }, []);

  // 1) Fallback: load locally cached orders per-user to avoid empty UI while fetching
  useEffect(() => {
    if (!userId) return;
    setOrders([]); // clear stale orders from a previous user
    const cacheKey = `userOrders_${userId}`;
    const savedOrders = localStorage.getItem(cacheKey);
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) setOrders(parsed);
      } catch (e) {
        console.error("Error loading orders from localStorage:", e);
      }
    }
  }, [userId]);

  // 2) Fetch from backend: orders, tickets, and events, scoped to current user
  useEffect(() => {
    const API_BASE_URL = "http://127.0.0.1:8000";
    if (!userId) {
      setOrders([]);
      return;
    }

    const token = localStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all orders, tickets, and events, then filter/group client-side
        const [ordersRes, ticketsRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/orders/`, { headers }),
          fetch(`${API_BASE_URL}/api/tickets/`, { headers }),
          fetch(`${API_BASE_URL}/api/events/`, { headers }),
        ]);

        const parseMaybeJson = async (res) => {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) return res.json();
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        };

        const [ordersDataRaw, ticketsDataRaw, eventsDataRaw] =
          await Promise.all([
            parseMaybeJson(ordersRes),
            parseMaybeJson(ticketsRes),
            parseMaybeJson(eventsRes),
          ]);

        if (!ordersRes.ok)
          throw new Error(
            typeof ordersDataRaw === "string"
              ? ordersDataRaw
              : JSON.stringify(ordersDataRaw)
          );
        if (!ticketsRes.ok)
          throw new Error(
            typeof ticketsDataRaw === "string"
              ? ticketsDataRaw
              : JSON.stringify(ticketsDataRaw)
          );
        if (!eventsRes.ok)
          throw new Error(
            typeof eventsDataRaw === "string"
              ? eventsDataRaw
              : JSON.stringify(eventsDataRaw)
          );

        const toArray = (data) => {
          if (Array.isArray(data)) return data;
          if (data && Array.isArray(data.results)) return data.results;
          // Some DRF paginations use 'data' or 'items'
          if (data && Array.isArray(data.data)) return data.data;
          if (data && Array.isArray(data.items)) return data.items;
          return [];
        };

        const allOrdersArray = toArray(ordersDataRaw);
        const allTicketsArray = toArray(ticketsDataRaw);
        const allEventsArray = toArray(eventsDataRaw);

        // Build a quick lookup for events by id
        const eventsById = allEventsArray.reduce((acc, ev) => {
          const id = normalizeId(ev?.id);
          if (id) acc[id] = ev;
          return acc;
        }, {});

        // Only orders for this user
        const myOrders = allOrdersArray.filter((o) => {
          const customerId = normalizeId(o?.customer);
          return Number(customerId) === Number(userId);
        });

        // Group tickets by order id
        const ticketsByOrder = allTicketsArray.reduce((acc, t) => {
          const orderId = normalizeId(t?.order);
          if (!orderId) return acc;
          if (!acc[orderId]) acc[orderId] = [];
          acc[orderId].push(t);
          return acc;
        }, {});

        // Map into UI groups expected by this component
        const mapped = myOrders.map((o) => {
          const oid = o?.id;
          const tickets = ticketsByOrder[oid] || [];
          const mappedTickets = tickets.map((t) => ({
            userName: t?.passport_name || "—",
            facebookName: t?.facebook_name || "—",
            memberCode: t?.member_code || "—",
            priorityDate: t?.priority_date || "",
            firstPriorityTicket: t?.fst_pt || "",
            secondPriorityTicket: t?.snd_pt || "",
            thirdPriorityTicket: t?.trd_pt || "",
            price: t?.fst_pt || "",
            status: t?.status || "Pending",
          }));

          // Ensure we render at least one row per order even when there are no tickets yet
          if (mappedTickets.length === 0) {
            mappedTickets.push({
              userName: "—",
              facebookName: "—",
              memberCode: "—",
              priorityDate: "",
              firstPriorityTicket: "",
              secondPriorityTicket: "",
              thirdPriorityTicket: "",
              status: "Pending",
            });
          }

          // Determine the event id for this order: prefer order.event, else infer from tickets
          let eventId = normalizeId(o?.event);
          if (!eventId) {
            // Try to infer from any ticket belonging to this order
            for (const t of tickets) {
              const tid = normalizeId(t?.event);
              if (tid) {
                eventId = tid;
                break;
              }
            }
          }

          const ev = eventId ? eventsById[eventId] : undefined;
          const eventTitle = ev?.event_name || "Event";
          const normalizedMeta = ev
            ? {
                date: ev.event_date,
                time: ev.event_time,
                venue: ev.event_location,
                image: ev.event_image,
              }
            : undefined;

          return {
            orderId: oid,
            eventTitle,
            eventMeta: normalizedMeta,
            allOrders: mappedTickets,
          };
        });

        setOrders(mapped);
        // Persist a snapshot locally per-user
        try {
          const cacheKey = `userOrders_${userId}`;
          localStorage.setItem(cacheKey, JSON.stringify(mapped));
          // Clean up old global cache to avoid future confusion
          if (localStorage.getItem("userOrders")) {
            localStorage.removeItem("userOrders");
          }
        } catch {
          // ignore quota or serialization errors
        }
      } catch (e) {
        console.error("Failed to load profile orders:", e);
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const openOrderDetails = (orderGroup, ticket) => {
    setSelectedOrder(orderGroup);
    setSelectedTicket(ticket);
    setShowOrderDetails(true);
  };

  const handleSendVerification = () => {
    setVerificationSent(true);
  };

  const handleConfirmPassword = () => {
    setShowChangePassword(false);
    setVerificationSent(false);
  };

  const user = { name: getDisplayName() };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "border-orange-500 text-orange-600";
      case "paid":
        return "border-green-500 text-green-600";
      case "received":
        return "border-pink-500 text-pink-600";
      case "cancelled":
        return "border-red-500 text-red-600";
      default:
        return "border-gray-500 text-gray-600";
    }
  };

  const getPrice = (ticket) => {
    if (ticket?.price) {
      return `${ticket.price} THB`;
    }
    return "—";
  };

  // Compute groups to display based on active tab and ticket status
  const displayedGroups = useMemo(() => {
    const desiredStatus = activeTab === "orders" ? "pending" : "received";
    const normalized = (s) =>
      typeof s === "string" ? s.trim().toLowerCase() : "";

    return orders
      .map((group) => {
        const filteredTickets = (group.allOrders || []).filter(
          (t) => normalized(t.status) === desiredStatus
        );
        return { ...group, allOrders: filteredTickets };
      })
      .filter((g) => (g.allOrders || []).length > 0);
  }, [orders, activeTab]);

  return (
    <div className="min-h-screen flex flex-col pt-24 pb-14 bg-gray-50">
      <div className="w-full max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow-sm p-6 sm:p-8 mb-6 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-full flex items-center justify-center transition-transform duration-200"></div>
              <button className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                <svg
                  className="w-3 h-3 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            {/* Name & Actions */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-black relative pb-4 sm:pb-2 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[#ee6786ff] transition-all duration-300 cursor-default">
                {user.name}
              </h1>
              <button className="sm:mb-1.5 absolute-right w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                <svg
                  className="w-3 h-3 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="text-white px-4 py-2 rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200 font-medium text-sm sm:text-base w-full sm:w-auto
              bg-[#ee6786] active:bg-[#d45573]"
            >
              {t("profile.changePassword")}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-sm">
          <div className="relative flex flex-wrap items-end gap-6 sm:pt-8 sm:gap-12 mb-4 sm:mb-8 px-4 sm:px-8">
            {["orders", "tickets"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                ref={(el) => (tabRefs.current[tab] = el)}
                className={`relative pb-3 sm:pb-4 px-1 font-medium text-lg sm:text-2xl transition-colors duration-300 ${
                  activeTab === tab
                    ? "text-gray-700 cursor-default"
                    : "text-gray-700 hover:text-gray-1000 cursor-pointer"
                }`}
              >
                {t(`profile.my${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
              </button>
            ))}

            {/* underline */}
            <div
              className="absolute bottom-0 h-[2px] bg-[#ee6786ff] rounded transition-all duration-300"
              style={{
                width: underlineStyle.width,
                left: underlineStyle.left,
              }}
            />
          </div>

          <div className="border-b border-[#ee6786ff]" />

          {/* Orders / Tickets Table */}
          <div className="px-4 sm:px-4 py-4 pb-1 overflow-x-auto ">
            {/* Desktop Headers */}
            <div className="hidden md:block relative">
              <div className="grid grid-cols-8 pr-0 px-4 py-4 sm:pb-9">
                <div className="font-semibold text-gray-700 text-sm lg:text-lg ">
                  {t("profile.id")}
                </div>
                <div className="font-semibold text-gray-700 text-sm lg:text-lg ">
                  {t("profile.event")}
                </div>
                <div className="font-semibold text-gray-700 text-sm lg:text-lg ">
                  {t("profile.name")}
                </div>
                <div className="font-semibold text-gray-700 text-sm lg:text-lg w-30">
                  {t("profile.facebookName")}
                </div>
                <div className="font-semibold text-gray-700 text-sm lg:text-lg w-25">
                  {t("profile.memberCode")}
                </div>
                <div className="font-semibold text-gray-700 text-sm lg:text-lg w-25">
                  {t("profile.priorityDate")}
                </div>
                <div className="font-semibold text-gray-700 text-sm lg:text-lg pl-2">
                  {t("profile.price")}
                </div>
                <div className="font-semibold text-gray-700 text-sm lg:text-lg pl-6">
                  Status
                </div>
              </div>
            </div>
          </div>
          <div className="border-b border-[#ee6786ff]" />
        </div>

        <div className="bg-white shadow-sm pt-1 px-3 sm:px-4 pb-6">
          <div className="space-y-4 mt-4">
            {loading && (
              <div className="text-center py-12 text-gray-500 transition-all duration-300">
                Loading your orders...
              </div>
            )}
            {!loading && displayedGroups.length === 0 && (
              <div className="text-center py-12 text-gray-500 transition-all duration-300">
                {activeTab === "orders"
                  ? "No pending tickets found."
                  : "No received tickets found."}
              </div>
            )}

            {displayedGroups.map((orderGroup, groupIndex) => (
              <div
                key={orderGroup.orderId || groupIndex}
                className="border border-gray-500 md:border-gray-400 rounded-lg p-4 md:p-4"
              >
                {orderGroup.allOrders?.map((ticket, ticketIndex) => {
                  const status = ticket.status || "Pending";
                  const price = getPrice(ticket);

                  return (
                    <div key={`${orderGroup.orderId}-${ticketIndex}`}>
                      {/* Desktop row */}
                      <div className="hidden md:grid grid-cols-8 gap-4 py-3 pl-2 min-w-[1040px]">
                        <div className="text-base lg:text-lg whitespace-nowrap">
                          {ticketIndex === 0 && (
                            <div className="font-medium text-black">
                              {orderGroup.orderId || "00001"}
                            </div>
                          )}
                        </div>
                        <div className="text-base lg:text-lg font-medium text-black truncate max-w-[14ch]">
                          {ticketIndex === 0 && (
                            <div className="truncate">
                              {orderGroup.eventTitle || "Event"}
                            </div>
                          )}
                        </div>
                        <div className="text-base lg:text-lg font-medium text-black truncate max-w-[16ch]">
                          {ticket.userName || "—"}
                        </div>
                        <div className="text-base lg:text-lg text-black truncate max-w-[18ch]">
                          {ticket.facebookName || "—"}
                        </div>
                        <div className="text-base lg:text-lg text-black whitespace-nowrap">
                          {ticket.memberCode || "—"}
                        </div>
                        <div className="text-base lg:text-lg font-medium text-black truncate whitespace-nowrap">
                          {ticket.priorityDate || "—"}
                        </div>
                        <div className="text-base lg:text-lg font-medium text-black truncate whitespace-nowrap">
                          {price}
                        </div>
                        <div className="text-base lg:text-lg pl-3">
                          <button
                            type="button"
                            onClick={() => openOrderDetails(orderGroup, ticket)}
                            className={`inline-block px-3 py-1 rounded border text-sm lg:text-lg font-medium cursor-pointer ${getStatusColor(
                              status
                            )} hover:scale-105 hover:opacity-90 transition-all duration-200`}
                            style={{ background: "transparent" }}
                          >
                            {status}
                          </button>
                        </div>
                      </div>

                      {/* Mobile card */}
                      <div className="md:hidden text-black mt-3 first:mt-0 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2 transition-all duration-200">
                        {ticketIndex === 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold">
                                {t("profile.id")}
                              </span>
                              <span className="font-medium text-black">
                                {orderGroup.orderId || "00001"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold">
                                {t("profile.event")}
                              </span>
                              <span className="font-medium text-black max-w-[55%] text-right">
                                {orderGroup.eventTitle || "Event"}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">
                            {t("profile.name")}
                          </span>
                          <span className="font-medium text-black">
                            {ticket.userName || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">
                            {t("profile.facebookName")}
                          </span>
                          <span className="text-black max-w-[55%] text-right">
                            {ticket.facebookName || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">
                            {t("profile.memberCode")}
                          </span>
                          <span className="text-black">
                            {ticket.memberCode || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">
                            {t("profile.priorityDate")}
                          </span>
                          <span className="text-black">
                            {ticket.priorityDate || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">
                            {t("profile.price")}
                          </span>
                          <span className="font-medium text-black">
                            {price}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-semibold text-sm">Status</span>
                          <button
                            type="button"
                            onClick={() => openOrderDetails(orderGroup, ticket)}
                            className={`px-3 py-1 rounded border text-sm font-medium ${getStatusColor(
                              status
                            )} hover:opacity-90 transition-colors duration-200`}
                            style={{ background: "transparent" }}
                          >
                            {status}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4  duration-300 z-900"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md transition-transform duration-300 transform scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg sm:text-xl font-semibold"></h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-700 hover:text-gray-600 text-2xl font-bold"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                }}
              >
                ×
              </button>
            </div>

            <div className="text-center mb-6 flex flex-col items-center">
              <img
                src={Logo}
                alt="Logo"
                className="w-24 h-24 object-contain mb-2"
              />
              <h2 className="text-2xl text-gray-800 mt-4">
                {t("changepw.title")}
              </h2>
            </div>

            <form
              className="space-y-4 text-black"
              onSubmit={(e) => {
                e.preventDefault();
                setShowChangePassword(false);
              }}
            >
              {["Old Password", "New Password", "Confirm Password"].map(
                (label, idx) => (
                  <div key={idx}>
                    <label className="block text-2xl font-medium text-gray-700 mb-1">
                      {t(`changepw.${label.replace(" ", "").toLowerCase()}`)}
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder={t(
                        `changepw.${label.replace(" ", "").toLowerCase()}`
                      )}
                    />
                  </div>
                )
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    verificationSent
                      ? handleConfirmPassword()
                      : handleSendVerification()
                  }
                  className="flex-1 px-4 py-2 text-white border border-gray-300 rounded-lg transition-all hover:opacity-80 hover:scale-105 duration-all-200 bg-[#ee6786] active:bg-[#d45573]"
                >
                  {verificationSent
                    ? t("changepw.confirmPassword")
                    : t("changepw.sendVerification")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OrderDetails
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        order={selectedOrder}
        ticket={selectedTicket}
        meta={selectedOrder?.eventMeta}
      />
    </div>
  );
}

export default Profile;
