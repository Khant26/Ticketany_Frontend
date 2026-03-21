import React, { useState, useRef } from "react";
import OrderConfirm from "./OrderConfirm";
import OrderComplete from "./OrderComplete";
import { useTranslation } from "react-i18next";

function OrderForm({
  isOpen,
  onClose,
  eventTitle,
  eventDates,
  eventTime,
  eventLocation,
  eventImage,
  eventPrices,
  eventId,
}) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

  const { t } = useTranslation();
 

  const [formData, setFormData] = useState({
    userName: "",
    facebookName: "",
    memberCode: "",
    priorityDate: "",
    firstPriorityTicket: "",
    secondPriorityTicket: "",
    thirdPriorityTicket: "",
  });

  const [allOrders, setAllOrders] = useState([]);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(null);

  const [showOrderComplete, setShowOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showBackButton, setShowBackButton] = useState(false);
  
  
  const orderCounterRef = useRef(0);
  const ORDER_ID_LENGTH = 5;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "firstPriorityTicket") {
        if (next.secondPriorityTicket === value) next.secondPriorityTicket = "";
        if (next.thirdPriorityTicket === value) next.thirdPriorityTicket = "";
      }

      if (name === "secondPriorityTicket") {
        if (value && value === next.firstPriorityTicket) next.secondPriorityTicket = "";
        if (next.thirdPriorityTicket === value) next.thirdPriorityTicket = "";
      }

      if (name === "thirdPriorityTicket") {
        if (value && (value === next.firstPriorityTicket || value === next.secondPriorityTicket)) {
          next.thirdPriorityTicket = "";
        }
      }

      return next;
    });
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      facebookName: "",
      memberCode: "",
      priorityDate: "",
      firstPriorityTicket: "",
      secondPriorityTicket: "",
      thirdPriorityTicket: "",
    });
    setIsEditingOrder(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Order form submitted:", formData);

    if (isEditingOrder !== null) {
      // Edit existing order
      const updatedOrders = [...allOrders];
      updatedOrders[isEditingOrder] = { ...formData, id: Date.now() };
      setAllOrders(updatedOrders);
    } else {
      // Add new order
      const newOrder = { ...formData, id: Date.now() };
      setAllOrders([...allOrders, newOrder]);
    }

    setShowOrderConfirm(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
      resetForm();
      setAllOrders([]);
      setShowBackButton(false);
    }
  };

  const handleConfirmClose = () => {
    setShowOrderConfirm(false);
  };

  const handleAddMore = () => {
    setShowOrderConfirm(false);
    resetForm();
    setShowBackButton(true);
  };

  const handleEditOrder = (index) => {
    const orderToEdit = allOrders[index];
    setFormData(orderToEdit);
    setIsEditingOrder(index);
    setShowOrderConfirm(false);
  };

  const handleDeleteOrder = (index) => {
    const updatedOrders = allOrders.filter((_, i) => i !== index);
    setAllOrders(updatedOrders);
  };

  const handleConfirmOrder = async () => {
    if (submitting) return; 
    setSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("access_token");
      
      const ticketsPayload = allOrders.map(entry => ({
        passport_name: entry.userName,
        facebook_name: entry.facebookName,
        member_code: entry.memberCode || null,
        priority_date: entry.priorityDate || null,
        fst_pt: entry.firstPriorityTicket || null,
        snd_pt: entry.secondPriorityTicket || null,
        trd_pt: entry.thirdPriorityTicket || null,
      }));

      const response = await fetch(`${API_BASE_URL}tickets/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          event: eventId,
          tickets: ticketsPayload  
        }),
      });

      const responseData = await (async () => {
        const ct = response.headers.get("content-type") || "";
        return ct.includes("application/json")
          ? response.json()
          : response.text();
      })();

      if (!response.ok) {
        throw new Error(
          typeof responseData === "string" ? responseData : JSON.stringify(responseData)
        );
      }

      setOrderId(String(responseData.order_id || ""));
      setShowOrderConfirm(false);
      setShowOrderComplete(true);
      
      console.log(`Successfully created ${responseData.total_tickets} tickets in order ${responseData.order_id}`);
      
    } catch (err) {
      const msg = err?.message || "Failed to submit order";
      setSubmitError(msg);
      alert(`Order submission failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseComplete = () => {
    setShowOrderComplete(false);
    setAllOrders([]);
    resetForm();
    onClose();
  };
  const anyOpen = isOpen || showOrderConfirm || showOrderComplete;
  const formVisible = isOpen && !showOrderConfirm && !showOrderComplete;
  if (!anyOpen) return null;

  const parseDates = (dateString) => {
    if (!dateString) return [];
    
    if (Array.isArray(dateString)) {
      return dateString.filter((date) => date && String(date).trim().length > 0);
    }
    
    if (typeof dateString === 'string') {
      try {
        const parsed = JSON.parse(dateString);
        if (Array.isArray(parsed)) {
          return parsed.filter((date) => date && String(date).trim().length > 0);
        }
      } catch {
        return dateString
          .split(",")
          .map((date) => date.trim())
          .filter((date) => date.length > 0);
      }
    }
    
    return [];
  };

  const parsePrices = (priceInput) => {
    if (!priceInput) return [];

    if (Array.isArray(priceInput)) {
      return priceInput
        .map((p) => String(p).trim())
        .filter((p) => p.length > 0);
    }

    let prices = priceInput;
    if (typeof priceInput === "string") {
      try {
        prices = JSON.parse(priceInput);
      } catch {
        return priceInput
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
      }
    }

    if (Array.isArray(prices)) {
      return prices
        .map((p) => String(p).trim())
        .filter((p) => p.length > 0);
    }

    if (typeof prices === "object" && prices !== null) {
      return Object.values(prices)
        .map((p) => String(p).trim())
        .filter((p) => p.length > 0);
    }

    return [String(prices).trim()].filter((p) => p.length > 0);
  };
  const availableDates = parseDates(eventDates);
  const availablePrices = parsePrices(eventPrices);
  const availablePricesForSecond = availablePrices.filter(
    (price) => price !== formData.firstPriorityTicket
  );
  const availablePricesForThird = availablePrices.filter(
    (price) => price !== formData.firstPriorityTicket && price !== formData.secondPriorityTicket
  );

  return (
    <>
      {formVisible && (
        <div
          className="cursor-default fixed inset-0 flex items-center justify-center px-4"
          style={{
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl relative max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onClose();
                resetForm();
                setAllOrders([]);
              }}
              className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              style={{
                backgroundColor: "transparent",
                border: "none",
              }}
            >
              ×
            </button>

            <div className="text-center mb-8">
              <p className="text-black text-3xl mb-3 font-bold">
                {isEditingOrder !== null
                  ? t("order.EditFormTitle")
                  : t("order.FillFormTitle")}
              </p>
              {allOrders.length > 0 && (
                <p className="text-gray-600 text-lg">
                  {isEditingOrder !== null
                    ? `${t("order.EditingOrder")} #${isEditingOrder + 1}`
                    : t("order.addedOrders", { count: allOrders.length })}
                </p>
              )}
            </div>

            <div className="max-w-4xl mx-auto px-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="cursor-default flex items-center min-h-[60px]">
                  <span className="block text-lg font-medium text-gray-700 min-w-[180px]">
                    {t("order.Event")}
                  </span>
                  <span className=" block text-lg font-medium text-gray-700 ml-8">
                    {eventTitle}
                  </span>
                </div>

                {/* User Name */}
                <div className="flex items-center min-h-[60px]">
                  <label
                    htmlFor="userName"
                    className="block text-lg font-medium text-gray-700 min-w-[180px]"
                  >
                    {t("order.UserName")}
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    className="flex-1 text-gray-600 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8"
                    placeholder={t("place.UserName")}
                    required
                  />
                </div>

                {/* Facebook Name */}
                <div className="flex items-center min-h-[60px]">
                  <label
                    htmlFor="facebookName"
                    className="block text-lg font-medium text-gray-700 min-w-[180px]"
                  >
                    {t("order.FacebookName")}
                  </label>
                  <input
                    type="text"
                    id="facebookName"
                    name="facebookName"
                    value={formData.facebookName}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8"
                    placeholder={t("place.FacebookName")}
                    required
                  />
                </div>

                {/* Member Code */}
                <div className="flex items-center min-h-[60px]">
                  <label
                    htmlFor="memberCode"
                    className="block text-lg font-medium text-gray-700 min-w-[180px]"
                  >
                    {t("order.MemberCode")}
                  </label>
                  <input
                    type="text"
                    id="memberCode"
                    name="memberCode"
                    value={formData.memberCode}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8"
                    placeholder={t("place.MemberCode")}
                  />
                </div>

                {/* Priority Date */}
                <div className="flex items-center min-h-[60px]">
                  <label
                    htmlFor="priorityDate"
                    className="block text-lg font-medium text-gray-700 min-w-[180px]"
                  >
                    {t("order.PriorityDate")}
                  </label>
                  <select
                    id="priorityDate"
                    name="priorityDate"
                    value={formData.priorityDate}
                    onChange={handleChange}
                    className="cursor-pointer flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8"
                  >
                    <option value="">{t("select.PriorityDate")}</option>
                    {availableDates.map((date, index) => (
                      <option key={index} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 1st Priority Ticket */}
                <div className="flex items-center min-h-[60px]">
                  <label
                    htmlFor="firstPriorityTicket"
                    className="block text-lg font-medium text-gray-700 min-w-[180px]"
                  >
                    {t("order.FirstPriorityTicket")}
                  </label>
                  <select
                    id="firstPriorityTicket"
                    name="firstPriorityTicket"
                    value={formData.firstPriorityTicket}
                    onChange={handleChange}
                    className="cursor-pointer flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8"
                    required
                  >
                    <option value="">{t("select.1stPriorityTicket")}</option>
                    {availablePrices.map((price, index) => (
                      <option key={index} value={price}>
                        {price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2nd Priority Ticket */}
                <div className="flex items-center min-h-[60px]">
                  <label
                    htmlFor="secondPriorityTicket"
                    className="block text-lg font-medium text-gray-700 min-w-[180px]"
                  >
                    {t("order.SecondPriorityTicket")}
                  </label>
                  <select
                    id="secondPriorityTicket"
                    name="secondPriorityTicket"
                    value={formData.secondPriorityTicket}
                    onChange={handleChange}
                    className="cursor-pointer flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8"
                  >
                    <option value="">{t("select.2ndPriorityTicket")}</option>
                    {availablePricesForSecond.map((price, index) => (
                      <option key={index} value={price}>
                        {price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3rd Priority Ticket */}
                <div className="flex items-center min-h-[60px]">
                  <label
                    htmlFor="thirdPriorityTicket"
                    className="block text-lg font-medium text-gray-700 min-w-[180px]"
                  >
                    {t("order.ThirdPriorityTicket")}
                  </label>
                  <select
                    id="thirdPriorityTicket"
                    name="thirdPriorityTicket"
                    value={formData.thirdPriorityTicket}
                    onChange={handleChange}
                    className="cursor-pointer flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8"
                  >
                    <option value="">{t("select.3rdPriorityTicket")}</option>
                    {availablePricesForThird.map((price, index) => (
                      <option key={index} value={price}>
                        {price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-8 justify-center mt-10">
                  <button
                    type="submit"
                    className="cursor-pointer w-1/2 text-white py-4 px-8 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 text-lg bg-[#ee6786] active:bg-[#d45573]"
                  >
                    {isEditingOrder !== null ? "Update Order" : "Next"}
                  </button>
                  {showBackButton && (
                    <button onClick={()=> {setShowBackButton(false); setShowOrderConfirm(true);}}
                     className="cursor-pointer w-1/2 text-white py-4 px-8 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 text-lg bg-[#ee6786] active:bg-[#d45573]">
                     Back to Orders</button>
                    )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <OrderConfirm
        isOpen={showOrderConfirm}
        onClose={handleConfirmClose}
        onAddMore={handleAddMore}
        onConfirmOrder={handleConfirmOrder}
        allOrders={allOrders}
        eventTitle={eventTitle}
        onEditOrder={handleEditOrder}
        onDeleteOrder={handleDeleteOrder}
        submitting={submitting}
        submitError={submitError}
      />

      <OrderComplete
        isOpen={showOrderComplete}
        onClose={handleCloseComplete}
        eventTitle={eventTitle}
        allOrders={allOrders}
        orderId={orderId}
      />
    </>
  );
}

export default OrderForm;
