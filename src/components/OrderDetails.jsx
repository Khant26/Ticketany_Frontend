import React, { useEffect, useMemo } from "react";
import { FaFacebookMessenger } from "react-icons/fa";

function OrderDetails({
  isOpen,
  onClose,
  order, // whole order group
  ticket, // specific ticket row
  meta = {}, // optional extra event meta (date, time, venue, image)
}) {
  if (!isOpen || !order || !ticket) return null;

  const date = meta.date || order?.eventMeta?.date || ticket.date || "";
  const time = meta.time || order?.eventMeta?.time || ticket.time || "";
  const venue = meta.venue || order?.eventMeta?.venue || ticket.venue || "";

  // Use same cover image extraction approach as EventGrid
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

  // Close on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[12000] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl relative p-6 sm:p-10">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl leading-none text-gray-600 hover:text-black"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-center text-2xl font-semibold mb-6 sm:mb-10 text-black">
          Order details
        </h2>

        {/* Event meta text block */}
        <div className="text-[15px] font-normal text-black space-y-4 mb-10">
          {order.eventTitle && <p>{order.eventTitle}</p>}
          {date && <p>{date}</p>}
          {time && <p>{time}</p>}
          {venue && <p className="leading-snug">{venue}</p>}
        </div>

        {/* Poster + info grid */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          <div className="w-full sm:w-[140px] shrink-0">
            <img
              src={coverImage}
              alt="Event Poster"
              className="w-full h-auto object-cover rounded"
            />
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr] gap-y-4 sm:gap-y-6 gap-x-4 sm:gap-x-6 text-base sm:text-xl text-black">
              <span className="font-medium">Name</span>
              <span>{ticket.userName || "—"}</span>

              <span className="font-medium">Price</span>
              <span>{getPrice(ticket)}</span>

              <span className="font-medium">Order ID</span>
              <span>{order.orderId || "—"}</span>

              <span className="font-medium">Status</span>
              <span>{ticket.status || "Pending"}</span>
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="mt-8 sm:mt-12">
          <button
            className="w-full rounded-md py-5 text-[15px] font-medium flex items-center justify-center gap-3 bg-[#ee6786] active:bg-[#d45573]"
            onClick={() => {}}
          >
            Payment info at ‘Tickets Anywhere’
            <FaFacebookMessenger className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
