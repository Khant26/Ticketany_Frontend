import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFacebookMessenger, FaClock, FaMapMarkerAlt } from "react-icons/fa";

function OrderDetails({ isOpen, onClose, order, ticket, meta = {} }) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  const date = meta.date || order?.eventMeta?.date || ticket?.date || "";
  const time = meta.time || order?.eventMeta?.time || ticket?.time || "";
  const venue = meta.venue || order?.eventMeta?.venue || ticket?.venue || "";
  const eventPrices = meta.prices || order?.eventMeta?.prices || "";
  const eventDates = meta.dates || order?.eventMeta?.dates || "";

  const parsedDates = useMemo(() => {
    try {
      if (typeof eventDates === "string") {
        const parsed = JSON.parse(eventDates);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(eventDates) ? eventDates : [];
    } catch {
      return [];
    }
  }, [eventDates]);

  const parsedPrices = useMemo(() => {
    try {
      if (typeof eventPrices === "string") {
        const parsed = JSON.parse(eventPrices);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(eventPrices) ? eventPrices : [];
    } catch {
      return [];
    }
  }, [eventPrices]);

  useEffect(() => {
    if (isOpen) {
      if (parsedDates.length > 0) {
        setSelectedDate(parsedDates[0]);
      }
      if (parsedPrices.length > 0) {
        setSelectedPrice(parsedPrices[0]);
      }
    }
  }, [isOpen, parsedDates, parsedPrices]);

  const IMAGE_SEPARATOR = "|||SEPARATOR|||";
  const coverImage = useMemo(() => {
    const raw = meta.image || order?.eventMeta?.image;
    if (!raw || typeof raw !== "string") return "/placeholder.jpg";
    if (raw.includes(IMAGE_SEPARATOR)) {
      const [first] = raw.split(IMAGE_SEPARATOR).filter(Boolean);
      return first || "/placeholder.jpg";
    }
    return raw;
  }, [meta?.image, order?.eventMeta?.image]);

  const getPrice = (ticket) => {
    if (ticket?.price) {
      return `${ticket.price} THB`;
    }
    return "—";
  };

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
        if (refund === "refunded") {
          return "border-blue-500 text-blue-600 bg-blue-50";
        }
        if (refund === "in_process") {
          return "border-red-500 text-red-600 bg-red-50";
        }
      default:
        return "border-gray-500 text-gray-600 bg-gray-50";
    }
  };

  const getStatusLabel = (ticket) => {
    const status = ticket.status?.toLowerCase();
    const refund = ticket.refundStatus?.toLowerCase();

    switch (status) {
      case "pending":
        return "Pending";
      case "paid":
        return "Paid";
      case "complete":
        return "Completed";
      case "cancel":
        if (refund === "refunded") return "Cancelled(Refunded)";
        if (refund === "in_process") return "Cancelled(In Process)";
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const ticketStatus = (ticket?.status || "").toLowerCase();

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen || !order || !ticket) return null;

  return (
    <div
      className="fixed inset-0 z-[12000] flex items-center justify-center px-3 sm:px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="cursor-default bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl relative p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-3 right-3 sm:top-4 sm:right-4 text-xl sm:text-2xl leading-none text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">
          {t("orderDetails.title")}
        </h2>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="w-full md:w-2/5 lg:w-1/3 shrink-0">
            <img
              src={coverImage}
              alt="Event Poster"
              className="w-full h-auto object-cover rounded-xl shadow-lg border border-gray-200"
            />
          </div>

          <div className="flex-1 bg-white rounded-lg p-5 sm:p-6 shadow-sm border border-gray-300">
            {order.eventTitle && (
              <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                  {t("orderDetails.event")}
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-words">
                  {order.eventTitle}
                </p>
              </div>
            )}

            {time && (
              <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200 flex items-start gap-3">
                <FaClock className="text-gray-600 text-base mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1">
                    {t("orderDetails.time")}
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 font-medium">
                    {time}
                  </p>
                </div>
              </div>
            )}

            {venue && (
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gray-600 text-base mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1">
                    {t("orderDetails.venue")}
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 font-medium leading-snug">
                    {venue}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="cursor-default bg-white rounded-lg p-5 sm:p-6 border border-gray-300 shadow-sm mb-6 sm:mb-8">
          {parsedDates.length > 0 && (
            <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
                {t("orderDetails.eventDate")}
              </p>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm sm:text-base font-medium focus:outline-none focus:border-[#ee6786] focus:ring-2 focus:ring-pink-200 transition"
              >
                {parsedDates.map((d, idx) => (
                  <option key={idx} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                {t("orderDetails.Name")}
              </p>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {ticket.userName || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                {t("orderDetails.orderId")}
              </p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 break-all">
                {order.orderId || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-end">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
                {t("orderDetails.price")}
              </p>
              {parsedPrices.length > 0 ? (
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm sm:text-base font-medium focus:outline-none focus:border-[#ee6786] focus:ring-2 focus:ring-pink-200 transition"
                >
                  {parsedPrices.map((p, idx) => (
                    <option key={idx} value={p}>
                      {typeof p === "number" ? `${p} THB` : p}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {getPrice(ticket)}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
                {t("orderDetails.status")}
              </p>
              <span
                className={`inline-block px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 text-xs sm:text-sm font-bold transition ${getStatusColor(ticket)}`}
              >
                {getStatusLabel(ticket)}
              </span>
            </div>
          </div>

          {ticketStatus === "paid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                  {t("profileOrderDetails.customerPayment")}
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                  {ticket.customerPayment || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                  {t("profileOrderDetails.paymentDate")}
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                  {ticket.paymentDate || "—"}
                </p>
              </div>
            </div>
          )}

          {ticketStatus === "complete" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                  {t("profileOrderDetails.sellingPrice")}
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                  {ticket.sellingPrice || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                  {t("profileOrderDetails.zone")}
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                  {ticket.zone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                  {t("profileOrderDetails.row")}
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                  {ticket.row || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1.5">
                  {t("profileOrderDetails.seat")}
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                  {ticket.seat || "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 sm:mt-8">
          <a
            href="https://www.facebook.com/profile.php?id=100088835078200"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-lg py-3 sm:py-4 text-sm sm:text-base font-semibold flex items-center justify-center gap-3 text-white bg-[#ee6786] hover:opacity-90 hover:scale-105 active:bg-[#d45573] transition duration-200 shadow-lg"
          >
            {t("orderDetails.paymentInfo")}
            <FaFacebookMessenger className="text-base sm:text-lg" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
