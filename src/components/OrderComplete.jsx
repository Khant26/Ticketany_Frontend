import React, { useRef, useState, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";
import logo from "../assets/logo.jpg";

const ACTIVE_SUBMIT_COLOR = "#e05680";

function OrderComplete({
  isOpen,
  onClose,
  eventTitle,
  allOrders = [],
  orderId,
  eventDates,
  eventTime,
  eventLocation,
  eventImage,
}) {
  const modalRef = useRef(null);
  const autoSavedImageRef = useRef(false);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const savedRef = React.useRef(false);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  useEffect(() => {
    if (isOpen && allOrders.length > 0 && orderId && !savedRef.current) {
      const orderData = {
        orderId,
        eventTitle,
        allOrders,
        dateSaved: new Date().toISOString(),
        eventMeta: {
          date: eventDates,
          time: eventTime,
          venue: eventLocation,
          image: eventImage,
        },
        status: "Pending",
      };

      const existingRaw = localStorage.getItem("userOrders");
      let parsedOrders = [];
      if (existingRaw) {
        try {
          parsedOrders = JSON.parse(existingRaw) || [];
        } catch (err) {
          console.error("Error parsing stored orders:", err);
          parsedOrders = [];
        }
      }

      parsedOrders.push(orderData);
      localStorage.setItem("userOrders", JSON.stringify(parsedOrders));
      savedRef.current = true;
    }
  }, [
    isOpen,
    allOrders,
    orderId,
    eventTitle,
    eventDates,
    eventTime,
    eventLocation,
    eventImage,
  ]);

  const saveImage = useCallback(async () => {
    if (!modalRef.current || savingRef.current) return;
    setSaving(true);
    try {
      await new Promise((res) => {
        requestAnimationFrame(() => setTimeout(res, 100));
      });

      const el = modalRef.current;
      if (!el || el.offsetWidth === 0 || el.offsetHeight === 0) {
        throw new Error("Modal not rendered");
      }

      const exportWrapper = document.createElement("div");
      exportWrapper.style.position = "fixed";
      exportWrapper.style.left = "-10000px";
      exportWrapper.style.top = "0";
      exportWrapper.style.padding = "24px";
      exportWrapper.style.background = "transparent";
      exportWrapper.style.zIndex = "-1";

      const exportNode = el.cloneNode(true);
      exportNode.style.width = "520px";
      exportNode.style.maxWidth = "520px";
      exportNode.style.maxHeight = "none";
      exportNode.style.overflow = "visible";
      exportNode.style.boxSizing = "border-box";

      exportNode
        .querySelectorAll("[data-export-ignore='true']")
        .forEach((node) => node.remove());

      exportWrapper.appendChild(exportNode);
      document.body.appendChild(exportWrapper);

      const canvas = await html2canvas(exportNode, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: exportNode.scrollWidth,
        height: exportNode.scrollHeight,
        windowWidth: exportNode.scrollWidth,
        windowHeight: exportNode.scrollHeight,
      });

      document.body.removeChild(exportWrapper);

      const dataUrl = canvas.toDataURL("image/png", 0.9);
      if (!dataUrl || dataUrl === "data:,")
        throw new Error("Canvas export failed");

      const link = document.createElement("a");
      link.download = `order-${orderId || "receipt"}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Image saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isOpen) {
      autoSavedImageRef.current = false;
      return undefined;
    }

    if (autoSavedImageRef.current) {
      return undefined;
    }

    autoSavedImageRef.current = true;

    const timer = setTimeout(() => {
      saveImage();
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, saveImage]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 11000, background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-[500px] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="select-none"
          style={{
            backgroundColor: "#ffffff",
            color: "#000000",
            fontFamily: "Arial, sans-serif",
            padding: "12px",
          }}
        >
          <div className="flex space-x-4 mb-4 items-center justify-center">
            <img src={logo} alt="logo" className="w-22"></img>

            <h2
              className="px-6"
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Order Completed !
            </h2>
          </div>

          {allOrders.length === 0 && (
            <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
              No tickets.
            </p>
          )}

          {allOrders.length > 0 && (
            <div
              style={{
                overflow: "hidden",
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              <div>
                <p
                  style={{
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "20px",
                    fontWeight: "300",
                  }}
                >
                  Event <span>{eventTitle || "-"}</span>
                </p>
              </div>

              <div>
                <p
                  style={{
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "20px",
                    fontWeight: "300",
                  }}
                >
                  Order ID <span>{orderId || "-"}</span>
                </p>
              </div>

              {allOrders.map((o, i) => (
                <div
                  key={o.id || i}
                  style={{
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom:
                      i < allOrders.length - 1 ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  <span style={{ fontSize: "20px", fontWeight: "300" }}>
                    Ticket {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: "300" }}>
                    {o.userName || "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4" data-export-ignore="true">
          <button
            onClick={saveImage}
            disabled={saving}
            className="px-10 py-4 w-100 h-15 text-white rounded-lg font-semibold hover:scale-105 hover:opacity-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
            style={{
              backgroundColor: ACTIVE_SUBMIT_COLOR,
              boxShadow: "0 10px 24px rgba(224, 86, 128, 0.28)",
            }}
          >
            {saving ? "Saving..." : "Save Image"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderComplete;
