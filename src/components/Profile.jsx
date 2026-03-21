import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation, initReactI18next } from "react-i18next";
import OrderDetails from "./OrderDetails";
import Logo from "../assets/logo.jpg";

function Profile() {
  const tabRefs = useRef({});
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("orders");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); 
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
 
  const getUserEmail = () => {
    try {
      const raw = localStorage.getItem("user_data");
      if (!raw) {
        console.log("[getUserEmail] No user_data in localStorage");
        return "";
      }
      const parsed = JSON.parse(raw);
      const email = parsed?.email || parsed?.user?.email || "";
      console.log(
        "[getUserEmail] Retrieved email:",
        email,
        "from user_data:",
        parsed,
      );
      return email;
    } catch (e) {
      console.error("[getUserEmail] Error parsing user_data:", e);
      return "";
    }
  };

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
          .join(""),
      );
      const payload = JSON.parse(jsonPayload);
      const candidates = [payload?.user_id, payload?.id, payload?.sub];
      const found = candidates.find((v) => Number.isFinite(Number(v)));
      return found != null ? Number(found) : null;
    } catch {
      return null;
    }
  };

  const normalizeId = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
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

  useEffect(() => {
    let id = getCurrentUserId();
    if (id == null) {
      const fromJwt = getUserIdFromToken();
      if (fromJwt != null) id = fromJwt;
    }
    setUserId(id);
    setOrders([]);
  }, []);

  useEffect(() => {
    if (!userId) return;
    setOrders([]);
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

  const fetchData = async () => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

    if (!userId) {
      setOrders([]);
      return;
    }

    const token = localStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    setLoading(true);
    setError("");
    try {
      const [ordersRes, ticketsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE_URL}orders/`, { headers }),
        fetch(`${API_BASE_URL}tickets/`, { headers }),
        fetch(`${API_BASE_URL}events/`, { headers }),
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

      const [ordersDataRaw, ticketsDataRaw, eventsDataRaw] = await Promise.all([
        parseMaybeJson(ordersRes),
        parseMaybeJson(ticketsRes),
        parseMaybeJson(eventsRes),
      ]);

      if (!ordersRes.ok)
        throw new Error(
          typeof ordersDataRaw === "string"
            ? ordersDataRaw
            : JSON.stringify(ordersDataRaw),
        );
      if (!ticketsRes.ok)
        throw new Error(
          typeof ticketsDataRaw === "string"
            ? ticketsDataRaw
            : JSON.stringify(ticketsDataRaw),
        );
      if (!eventsRes.ok)
        throw new Error(
          typeof eventsDataRaw === "string"
            ? eventsDataRaw
            : JSON.stringify(eventsDataRaw),
        );

      const toArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.results)) return data.results;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.items)) return data.items;
        return [];
      };

      const allOrdersArray = toArray(ordersDataRaw);
      const allTicketsArray = toArray(ticketsDataRaw);
      const allEventsArray = toArray(eventsDataRaw);
      console.log("ALL TICKETS ARRAY FROM API:", allTicketsArray);

      const eventsById = allEventsArray.reduce((acc, ev) => {
        const id = normalizeId(ev?.id);
        if (id) acc[id] = ev;
        return acc;
      }, {});

      const myOrders = allOrdersArray.filter((o) => {
        const customerId = normalizeId(o?.customer);
        return Number(customerId) === Number(userId);
      });

      const ticketsByOrder = allTicketsArray.reduce((acc, t) => {
        const orderId = normalizeId(t?.order);
        if (!orderId) return acc;
        if (!acc[orderId]) acc[orderId] = [];
        acc[orderId].push(t);
        return acc;
      }, {});

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
          refundStatus: t?.refund_status || "none",
          customerPayment: t?.customer_payment || "",
          paymentDate: t?.payment_date || "",
          sellingPrice: t?.selling_price || "",
          zone: t?.zone || "",
          row: t?.row || "",
          seat: t?.seat || "",
        }));

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
            refundStatus: "none",
            customerPayment: "",
            paymentDate: "",
            sellingPrice: "",
            zone: "",
            row: "",
            seat: "",
          });
        }

        let eventId = normalizeId(o?.event);
        if (!eventId) {
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
          ? (() => {
              let imageUrl = null;
              if (Array.isArray(ev.images) && ev.images.length > 0) {
                imageUrl = ev.images[0]?.image_url || ev.images[0]?.image;
              } else if (ev.event_image) {
                imageUrl = ev.event_image;
              }

              console.log("[Profile] Event object for image extraction:", {
                id: ev.id,
                name: ev.event_name,
                has_images_array: !!Array.isArray(ev.images),
                images_count: ev.images?.length || 0,
                extracted_image: imageUrl,
              });

              return {
                date: ev.event_date,
                time: ev.event_time,
                venue: ev.event_location,
                image: imageUrl,
              };
            })()
          : undefined;

        return {
          orderId: oid,
          eventTitle,
          eventMeta: normalizedMeta,
          allOrders: mappedTickets,
        };
      });

      setOrders(mapped);
      try {
        const cacheKey = `userOrders_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify(mapped));
        if (localStorage.getItem("userOrders")) {
          localStorage.removeItem("userOrders");
        }
      } catch {
      }
    } catch (e) {
      console.error("Failed to load profile orders:", e);
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const openOrderDetails = (orderGroup, ticket) => {
    setSelectedOrder(orderGroup);
    setSelectedTicket(ticket);
    setShowOrderDetails(true);
  };

  const handleSendOTP = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordFormData.oldPassword.trim()) {
      setPasswordError("Please enter your old password");
      return;
    }

    setChangingPassword(true);

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
      const userEmail = getUserEmail();

      if (!userEmail) {
        setPasswordError("Unable to find your email. Please log in again.");
        setChangingPassword(false);
        return;
      }

      console.log(
        "[handleSendOTP] Starting password verification for email:",
        userEmail,
      );

      try {
        console.log("[handleSendOTP] Verifying old password...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const loginRes = await fetch(`${API_BASE_URL}auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            password: passwordFormData.oldPassword,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(
          "[handleSendOTP] Login verification response status:",
          loginRes.status,
        );

        if (!loginRes.ok) {
          const loginData = await loginRes.json().catch(() => ({}));
          console.log(
            "[handleSendOTP] Password verification failed:",
            loginData,
          );
          setPasswordError("❌ Old password is incorrect. Please try again.");
          setChangingPassword(false);
          return;
        }

        console.log("[handleSendOTP] Old password verified successfully!");
      } catch (loginError) {
        console.error("[handleSendOTP] Login error:", loginError);
        if (loginError.name === "AbortError") {
          setPasswordError(
            "⏱️ Password verification timeout. Please check your internet connection.",
          );
        } else {
          setPasswordError(
            "Error verifying password. Please check your internet connection.",
          );
        }
        setChangingPassword(false);
        return;
      }

      try {
        console.log("[handleSendOTP] Sending OTP to:", userEmail);
        console.log("[handleSendOTP] API Base URL:", API_BASE_URL);

        const otpRes = await fetch(`${API_BASE_URL}auth/forgot-password/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });

        console.log("[handleSendOTP] OTP API response status:", otpRes.status);
        const otpData = await otpRes.json().catch(() => ({}));
        console.log("[handleSendOTP] OTP API response data:", otpData);

        if (!otpRes.ok) {
          console.log(
            "[handleSendOTP] OTP send failed with status:",
            otpRes.status,
          );
          setPasswordError(
            otpData?.message ||
              otpData?.error ||
              "Failed to send OTP. Please try again.",
          );
          setChangingPassword(false);
          return;
        }

        console.log("[handleSendOTP] OTP sent successfully!");
        setPasswordSuccess("✅ Password verified! OTP sent to your email.");
        setOtpSent(true);
      } catch (otpError) {
        console.error("[handleSendOTP] OTP error:", otpError);
        console.error("[handleSendOTP] OTP error details:", otpError.message);
        setPasswordError("Error sending OTP. Please try again.");
        setChangingPassword(false);
        return;
      }
    } catch (e) {
      console.error("[handleSendOTP] Unexpected error:", e);
      setPasswordError("An unexpected error occurred. Please try again.");
      setChangingPassword(false);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordFormData.otpCode.trim()) {
      setPasswordError("Please enter the OTP code");
      return;
    }

    if (!passwordFormData.newPassword.trim()) {
      setPasswordError("Please enter a new password");
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordFormData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    setChangingPassword(true);
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
      const userEmail = getUserEmail();

      if (!userEmail) {
        setPasswordError("Unable to retrieve your email. Please log in again.");
        return;
      }

      console.log(
        "[handleResetPassword] Calling reset-password API with OTP validation...",
      );
      const resetRes = await fetch(`${API_BASE_URL}auth/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          otp_code: passwordFormData.otpCode,
          new_password: passwordFormData.newPassword,
        }),
      });

      console.log(
        "[handleResetPassword] Reset password response status:",
        resetRes.status,
      );

      if (!resetRes.ok) {
        const data = await resetRes.json().catch(() => ({}));
        console.log("[handleResetPassword] Reset password failed:", data);
        setPasswordError(
          data?.message ||
            data?.error ||
            "Invalid OTP or failed to reset password. Please try again.",
        );
        setChangingPassword(false);
        return;
      }

      const responseData = await resetRes.json().catch(() => ({}));
      setPasswordSuccess(
        "✅ " + (responseData?.message || "Password changed successfully!"),
      );
      setTimeout(() => {
        setShowChangePassword(false);
        setOtpSent(false);
        setPasswordFormData({
          oldPassword: "",
          otpCode: "",
          newPassword: "",
          confirmPassword: "",
        });
      }, 2000);
    } catch (e) {
      console.error("[handleResetPassword] Error:", e);
      setPasswordError(e.message || "Failed to reset password");
    } finally {
      setChangingPassword(false);
    }
  };

  const user = { name: getDisplayName() };

  const getStatusColor = (ticket) => {
    const status = ticket.status?.toLowerCase();
    const refund = ticket.refundStatus?.toLowerCase();
    switch (status) {
      case "pending":
        return "border-orange-500 text-orange-600 bg-orange-50";
      case "paid":
        return "border-blue-500 text-blue-600 bg-blue-50";
      case "complete":
        return "border-green-500 text-green-600 bg-green-50";
      case "cancel":
      case "cancelled":
        if (refund === "refunded") {
          return "border-blue-500 text-blue-600 bg-blue-50";
        }
        if (refund === "in_process") {
          return "border-yellow-500 text-yellow-600 bg-yellow-50";
        }
        return "border-gray-500 text-gray-600 bg-gray-50";
      default:
        return "border-gray-500 text-gray-600";
    }
  };

  const getPrice = (ticket) => {
    if (ticket?.price) {
      return `${ticket.price}`;
    }
    return "—";
  };

  const getDisplayStatus = (ticket) => {
    const status = (ticket.status || "Pending").toLowerCase();
    if (status === "complete") return "Completed";
    if (status === "cancel" || status === "cancelled") {
      console.log("TICKET OBJECT:", ticket);
       const refund = (ticket.refundStatus || "none").toLowerCase();

      if (refund === "in_process") return "Cancelled (In Process)";
      if (refund === "refunded") return "Cancelled (Refunded)";
      return "Cancelled";
    }
    return (ticket.status || "Pending").charAt(0).toUpperCase() + (ticket.status || "Pending").slice(1); 
  };

  const displayedGroups = useMemo(() => {
    const desiredStatuses =
      activeTab === "orders" ? ["pending", "paid", "cancel"] : ["complete"]; 
    const normalized = (s) =>
      typeof s === "string" ? s.trim().toLowerCase() : "";

    return orders
      .map((group) => {
        const filteredTickets = (group.allOrders || []).filter((t) =>
          desiredStatuses.includes(normalized(t.status)),
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
            {/* Name & Actions */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <h1 className="text-lg sm:text-2xl font-semibold text-black relative pb-4 sm:pb-2 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-[#ee6786ff] transition-all duration-300 cursor-default">
                {user.name}
              </h1>
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
                className={`relative pb-3 sm:pb-4 px-1 font-medium text-base sm:text-lg transition-colors duration-300 ${
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
          <div className="px-4 sm:px-4 overflow-x-auto ">
            {/* Desktop Headers */}
            <div className="hidden md:block relative">
              <div className="grid grid-cols-8 pr-0 px-4 pb-2 h-18 items-center">
                <div className="font-semibold text-gray-600 text-xs lg:text-sm">
                  {t("profile.id")}
                </div>
                <div className="font-semibold text-gray-600 text-xs lg:text-sm">
                  {t("profile.event")}
                </div>
                <div className="font-semibold text-gray-600 text-xs lg:text-sm">
                  {t("profile.name")}
                </div>
                <div className="font-semibold text-gray-600 text-xs lg:text-sm w-30">
                  {t("profile.facebookName")}
                </div>
                <div className="font-semibold text-gray-600 text-xs lg:text-sm w-25">
                  {t("profile.memberCode")}
                </div>
                <div className="font-semibold text-gray-600 text-xs lg:text-sm w-25">
                  {t("profile.priorityDate")}
                </div>
                <div className="font-semibold text-gray-600 text-xs lg:text-sm pl-2">
                  {t("profile.price")}
                </div>
                <div className="font-semibold text-gray-600 text-xs lg:text-sm pl-6">
                  {t("profile.status")}
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
                  ? t("profile.noOrdersFound")
                  : t("profile.noTicketsFound")}
              </div>
            )}

            {displayedGroups.map((orderGroup, groupIndex) => (
              <div
                key={orderGroup.orderId || groupIndex}
                className="border border-gray-500 md:border-gray-400 rounded-lg p-4 md:p-4"
              >
                {orderGroup.allOrders?.map((ticket, ticketIndex) => {
                  const displayStatus = getDisplayStatus(ticket); // UPDATED: Use new helper for status display
                  const price = getPrice(ticket);

                  return (
                    <div key={`${orderGroup.orderId}-${ticketIndex}`}>
                      {/* Desktop row */}
                      <div className="hidden md:grid grid-cols-8 gap-4 py-3 pl-2 items-center min-w-[1040px]">
                        <div className="text-sm lg:text-base whitespace-nowrap">
                          {ticketIndex === 0 && (
                            <div className="font-medium text-black">
                              {orderGroup.orderId || "00001"}
                            </div>
                          )}
                        </div>
                        <div className="text-sm lg:text-base font-medium text-black truncate max-w-[14ch]">
                          {ticketIndex === 0 && (
                            <div className="truncate">
                              {orderGroup.eventTitle || "Event"}
                            </div>
                          )}
                        </div>
                        <div className="text-sm lg:text-base font-medium text-black truncate max-w-[16ch]">
                          {ticket.userName || "—"}
                        </div>
                        <div className="text-sm lg:text-base font-medium text-black truncate max-w-[18ch]">
                          {ticket.facebookName || "—"}
                        </div>
                        <div className="text-sm lg:text-base font-medium text-black whitespace-nowrap">
                          {ticket.memberCode || "—"}
                        </div>
                        <div className="text-sm lg:text-base font-medium text-black truncate whitespace-nowrap">
                          {ticket.priorityDate || "—"}
                        </div>
                        <div className="text-sm lg:text-base font-medium text-black whitespace-normal break-words leading-snug">
                          {price}
                        </div>
                        <div className="text-sm lg:text-base pl-3">
                          <button
                            type="button"
                            onClick={() => openOrderDetails(orderGroup, ticket)}
                            className={`inline-block px-4 py-2 rounded-full border-2 text-xs lg:text-sm font-bold cursor-pointer ${getStatusColor(
                              ticket, // Pass full ticket object
                            )} hover:scale-105 hover:opacity-90 transition-all duration-200`}
                          >
                            {displayStatus} {/* UPDATED: Use displayStatus */}
                          </button>
                        </div>
                      </div>

                      {/* Mobile card */}
                      <div className="md:hidden text-black mt-3 first:mt-0 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2 transition-all duration-200">
                        {ticketIndex === 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-gray-600">
                                {t("profile.id")}
                              </span>
                              <span className="font-medium text-black">
                                {orderGroup.orderId || "00001"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-gray-600">
                                {t("profile.event")}
                              </span>
                              <span className="font-medium text-black max-w-[55%] text-right">
                                {orderGroup.eventTitle || "Event"}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-600">
                            {t("profile.name")}
                          </span>
                          <span className="font-medium text-black">
                            {ticket.userName || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-600">
                            {t("profile.facebookName")}
                          </span>
                          <span className="font-medium text-black max-w-[55%] text-right">
                            {ticket.facebookName || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-600">
                            {t("profile.memberCode")}
                          </span>
                          <span className="font-medium text-black">
                            {ticket.memberCode || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-600">
                            {t("profile.priorityDate")}
                          </span>
                          <span className="text-black">
                            {ticket.priorityDate || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-600">
                            {t("profile.price")}
                          </span>
                          <span className="font-medium text-black max-w-[55%] text-right break-words">
                            {price}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-semibold text-gray-600">Status</span>
                          <button
                            type="button"
                            onClick={() => openOrderDetails(orderGroup, ticket)}
                            className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(
                              ticket, // Pass full ticket object
                            )} hover:opacity-90 transition-colors duration-200`}
                          >
                            {displayStatus} {/* UPDATED: Use displayStatus */}
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
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setOtpSent(false);
                  setPasswordFormData({
                    oldPassword: "",
                    otpCode: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                className="cursor-pointer absolute top-4 right-4 text-gray-700 hover:text-gray-600 text-2xl font-bold"
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

            {/* Error Message */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {passwordError}
              </div>
            )}

            {/* Success Message */}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {passwordSuccess}
              </div>
            )}

            {/* Change Password Form */}
            <form className="space-y-4 text-black">
              {!otpSent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("changepw.oldPassword")}
                    </label>
                    <input
                      type="password"
                      value={passwordFormData.oldPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          oldPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder={t("changepw.enterOldPassword")}
                      disabled={changingPassword}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={changingPassword}
                    className="w-full px-4 py-2 text-white bg-[#ee6786] hover:opacity-80 hover:scale-105 transition-all duration-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              )}

              {otpSent && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={changingPassword}
                        className="text-xs text-[#ee6786] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Resend OTP
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Check your email for the OTP code
                    </p>
                    <input
                      type="text"
                      value={passwordFormData.otpCode}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          otpCode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter OTP code"
                      disabled={changingPassword}
                      maxLength="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordFormData.newPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Enter new password (minimum 8 characters)"
                      disabled={changingPassword}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Confirm new password"
                      disabled={changingPassword}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={changingPassword}
                    className="w-full px-4 py-2 text-white bg-[#ee6786] hover:opacity-80 hover:scale-105 transition-all duration-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword
                      ? "Changing Password..."
                      : "Confirm and Change"}
                  </button>
                </>
              )}
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
