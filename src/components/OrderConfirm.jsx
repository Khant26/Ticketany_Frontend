import React, { useState } from "react";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";

function OrderConfirm({
  isOpen,
  onClose,
  onAddMore,
  onConfirmOrder,
  allOrders,
  eventTitle,
  onEditOrder,
  onDeleteOrder,
}) {
  const { t } = useTranslation();

  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const nextOrder = () => {
    setCurrentOrderIndex((prev) =>
      prev === allOrders.length - 1 ? 0 : prev + 1,
    );
  };

  const prevOrder = () => {
    setCurrentOrderIndex((prev) =>
      prev === 0 ? allOrders.length - 1 : prev - 1,
    );
  };

  const goToOrder = (index) => {
    setCurrentOrderIndex(index);
  };

  if (!isOpen || !allOrders || allOrders.length === 0) return null;
  const currentOrder = allOrders[currentOrderIndex];

  return (
    <div
      className="cursor-default fixed inset-0 flex items-center justify-center px-3 sm:px-4"
      style={{
        zIndex: 10000,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold"
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          ×
        </button>

        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-black text-lg sm:text-xl md:text-3xl mb-2 sm:mb-3 md:mb-4 font-semibold">
            Order Details
          </h2>
          <h3 className="text-black text-base sm:text-lg md:text-2xl font-semibold break-words">
            {eventTitle}
          </h3>
        </div>

        {/* Current Order Details */}
        <div className="mx-auto px-2 sm:px-4 md:px-6">
          <div className="shadow-md border-1 border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                {currentOrderIndex + 1}.
              </h3>

              <div className="flex flex-wrap gap-2 sm:gap-2">
                <button
                  onClick={() => onEditOrder(currentOrderIndex)}
                  className="cursor-pointer px-2 sm:px-3 py-1 border-2 border-gray-350 rounded text-xs sm:text-sm hover:scale-105 transition-all duration-200"
                >
                  {t("order.Edit")}
                </button>
                {allOrders.length > 1 && (
                  <button
                    onClick={() => {
                      onDeleteOrder(currentOrderIndex);
                      if (currentOrderIndex >= allOrders.length - 1) {
                        setCurrentOrderIndex(Math.max(0, allOrders.length - 2));
                      }
                    }}
                    className="cursor-pointer px-2 sm:px-3 py-1 border-2 border-red-400 text-red-400 hover:scale-105 rounded text-xs sm:text-sm transition-all duration-200"
                  >
                    {t("order.Delete")}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Name */}
              <div className="flex flex-col sm:flex-row sm:items-center py-2 gap-2 sm:gap-0">
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 sm:w-1/2 sm:text-right sm:pr-4">
                  {t("order.UserName")}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-medium sm:w-1/2 break-words">
                  {currentOrder.userName || "Not provided"}
                </span>
              </div>

              {/* Facebook Name */}
              <div className="flex flex-col sm:flex-row sm:items-center py-2 gap-2 sm:gap-0">
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 sm:w-1/2 sm:text-right sm:pr-4">
                  {t("order.FacebookName")}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-medium sm:w-1/2 break-words">
                  {currentOrder.facebookName || "Not provided"}
                </span>
              </div>

              {/* Member Code */}
              <div className="flex flex-col sm:flex-row sm:items-center py-2 gap-2 sm:gap-0">
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 sm:w-1/2 sm:text-right sm:pr-4">
                  {t("order.MemberCode")}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-medium sm:w-1/2">
                  {currentOrder.memberCode || "-"}
                </span>
              </div>

              {/* Priority Date */}
              <div className="flex flex-col sm:flex-row sm:items-center py-2 gap-2 sm:gap-0">
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 sm:w-1/2 sm:text-right sm:pr-4">
                  {t("order.PriorityDate")}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-medium sm:w-1/2">
                  {currentOrder.priorityDate || "Not selected"}
                </span>
              </div>

              {/* 1st Priority Ticket */}
              <div className="flex flex-col sm:flex-row sm:items-center py-2 gap-2 sm:gap-0">
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 sm:w-1/2 sm:text-right sm:pr-4">
                  {t("order.FirstPriorityTicket")}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-medium sm:w-1/2 break-words">
                  {currentOrder.firstPriorityTicket || "-"}
                </span>
              </div>

              {/* 2nd Priority Ticket */}
              <div className="flex flex-col sm:flex-row sm:items-center py-2 gap-2 sm:gap-0">
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 sm:w-1/2 sm:text-right sm:pr-4">
                  {t("order.SecondPriorityTicket")}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-medium sm:w-1/2 break-words">
                  {currentOrder.secondPriorityTicket || "-"}
                </span>
              </div>

              {/* 3rd Priority Ticket */}
              <div className="flex flex-col sm:flex-row sm:items-center py-2 gap-2 sm:gap-0">
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700 sm:w-1/2 sm:text-right sm:pr-4">
                  {t("order.ThirdPriorityTicket")}
                </span>
                <span className="text-sm sm:text-base md:text-lg text-gray-900 font-medium sm:w-1/2 break-words">
                  {currentOrder.thirdPriorityTicket || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Navigation - Only show if multiple orders */}
          {allOrders.length > 1 && (
            <div className="flex items-center justify-center mb-4 sm:mb-6 gap-2 sm:gap-4 md:gap-6">
              <button
                onClick={prevOrder}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition duration-200 text-black border-none outline-none"
                style={{ background: "transparent" }}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                {allOrders.map((_, index) => {
                  const active = currentOrderIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => goToOrder(index)}
                      className="p-0 m-0 border-none bg-transparent outline-none focus:outline-none"
                      style={{
                        backgroundColor: "transparent",
                      }}
                    >
                      <span
                        className={`block w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-transform duration-200 ${
                          active
                            ? "bg-pink-500 scale-110"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextOrder}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition duration-200 text-black border-none outline-none"
                style={{ background: "transparent" }}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center mt-4 sm:mt-6">
            <button
              onClick={() => setShowPrompt(true)}
              className="cursor-pointer px-4 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 text-white text-sm sm:text-base rounded-lg font-semibold hover:opacity-80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-[#ee6786] active:bg-[#d45573]"
            >
              {t("order.Confirm")}
            </button>
            <button
              onClick={onAddMore}
              className="cursor-pointer px-4 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 text-white text-sm sm:text-base rounded-lg font-semibold hover:opacity-80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 transition bg-[#ee6786] active:bg-[#d45573]"
            >
              {t("order.AddMore")}
            </button>
          </div>

          {showPrompt && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-lg px-3 sm:px-4"
              style={{
                zIndex: 9999,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowPrompt(false);
                }
              }}
            >
              <div
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-base sm:text-lg font-semibold text-center mb-4 sm:mb-6 text-black">
                  {t("order.Confirm")} ?
                </p>
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setShowPrompt(false);
                      onConfirmOrder();
                    }}
                    className="cursor-pointer flex-1 py-2 sm:py-3 rounded-md text-sm sm:text-base text-black font-medium transition-all duration-200 hover:opacity-90 hover:scale-105"
                    style={{ backgroundColor: "white", border: "1px solid" }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="cursor-pointer flex-1 py-2 sm:py-3 rounded-md text-sm sm:text-base text-black font-medium transition-all duration-200 hover:bg-gray-50 hover:scale-105"
                    style={{ backgroundColor: "white", border: "1px solid" }}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderConfirm;
