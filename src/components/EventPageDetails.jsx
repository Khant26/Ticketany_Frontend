import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import OrderForm from "./OrderForm";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

function EventPageDetails() {
  const { t } = useTranslation();
  let { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);
  const fadeTimeoutRef = useRef(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const accessToken = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    return !!(accessToken && userData);
  });

  const [eventDetails, setEventDetails] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
      const response = await fetch(`${baseUrl}events/`);
      const data = await response.json();
      setEventDetails(data);

      if (data.length > 0) {
        const targetEvent =
          data.find((event) => event.id === parseInt(id)) || data[0];
      }
    };
    fetchEvents();
  }, [id]);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateLoginState = () => {
      const accessToken = localStorage.getItem("access_token");
      const userData = localStorage.getItem("user_data");
      const newLoggedInState = !!(accessToken && userData);
      setIsLoggedIn(newLoggedInState);
    };

    window.addEventListener("userLoginChanged", updateLoginState);
    window.addEventListener("storage", updateLoginState);

    return () => {
      window.removeEventListener("userLoginChanged", updateLoginState);
      window.removeEventListener("storage", updateLoginState);
    };
  }, []);

  const eventDetail =
    eventDetails.find((event) => event.id === parseInt(id)) || eventDetails[0];
  if (eventDetails.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen mt-16 md:mt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading event details...</p>
      </div>
    );
  }

  if (id && !eventDetail) {
    return (
      <div className="mt-16 lg:mb-10 lg:px-100 md:mt-24 px-4 md:px-8 py-6 text-center">
        <div className="text-red-600 text-xl font-semibold">
          {t("generic.noEvent")}
        </div>
        <p className="text-gray-600 mt-2">Event with ID {id} not found</p>
      </div>
    );
  }

  const formatEventDates = (dateData) => {
    if (!dateData) return "TBD";

    try {
      let dates = dateData;
      if (typeof dateData === "string") {
        try {
          const parsed = JSON.parse(dateData);
          if (Array.isArray(parsed)) {
            dates = parsed;
          }
        } catch {
          dates = dateData;
        }
      }

      if (Array.isArray(dates)) {
        return dates.join(", ");
      }

      return String(dates);
    } catch (error) {
      return String(dateData);
    }
  };

  const formatTicketPrices = (priceData) => {
    if (!priceData) return "TBD";

    try {
      let prices = priceData;

      if (typeof priceData === "string") {
        try {
          const parsed = JSON.parse(priceData);
          if (Array.isArray(parsed)) {
            prices = parsed;
          }
        } catch {
          prices = priceData;
        }
      }

      if (Array.isArray(prices)) {
        return prices.join(", ");
      }

      if (typeof prices === "number") {
        return String(prices);
      }

      if (typeof prices === "object") {
        return Object.entries(prices)
          .map(
            ([tier, price]) =>
              `${tier.charAt(0).toUpperCase() + tier.slice(1)}: ${price}`,
          )
          .join(", ");
      }

      return String(prices);
    } catch (error) {
      return String(priceData);
    }
  };

  const getEventImages = (event) => {
    if (event?.images?.length > 0) {
      console.log("getEventImages - Using images array with image_url");
      return event.images.map((img) => img.image_url).filter(Boolean);
    }

    if (event.event_image && typeof event.event_image === "string") {
      if (event.event_image.includes("|||SEPARATOR|||")) {
        const images = event.event_image
          .split("|||SEPARATOR|||")
          .filter(Boolean);

        return images;
      } else {
        return [event.event_image];
      }
    }

    if (event.event_images && Array.isArray(event.event_images)) {
      const processedImages = event.event_images
        .map((img, index) => {
          console.log(
            `getEventImages - Processing image ${index}:`,
            typeof img,
            img?.substring?.(0, 50),
          );
          if (typeof img === "string") return img;
          return img.data || img.image || img.url || img;
        })
        .filter(Boolean);

      console.log(
        "getEventImages - Processed images array:",
        processedImages.length,
        "items",
      );
      return processedImages;
    }

    console.log("getEventImages - No images found");
    return [];
  };

  const images = eventDetail ? getEventImages(eventDetail) : [];
  console.log("EventPageDetails - Final images array:", images.length, "items");

  const goToImage = (nextIndex) => {
    if (!images.length) return;
    if (nextIndex === currentImageIndex) return;

    setIsImageFading(true);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      setCurrentImageIndex(nextIndex);
    }, 80);
  };

  const nextImage = () => {
    const nextIndex =
      currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    goToImage(nextIndex);
  };

  const prevImage = () => {
    const nextIndex =
      currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    goToImage(nextIndex);
  };

  const isUserLoggedIn = () => {
    return isLoggedIn;
  };

  const handleOrderNowClick = () => {
    if (isUserLoggedIn()) {
      setShowOrderForm(true);
    } else {
      setShowSignIn(true);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center min-h-screen bg-gray-50">
        <div className="mt-16 md:mt-24 px-4 md:px-8 py-6 relative z-10 w-full">
          <div className="max-w-[1360px] mx-auto flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8">
            <div className="w-full lg:w-2/3 bg-white shadow-md rounded-lg  pb-6 flex flex-col">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-3/5 ">
                  {images.length > 0 ? (
                    <img
                      src={images[currentImageIndex]}
                      alt={`${eventDetail?.event_name || "Event"} - Image ${currentImageIndex + 1}`}
                      className={`w-full h-64 md:h-80 lg:h-150 object-cover rounded-lg transition-opacity duration-150 ease-out ${
                        isImageFading ? "opacity-80" : "opacity-100"
                      }`}
                      onLoad={() => setIsImageFading(false)}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 md:h-80 lg:h-150 bg-gray-200 flex items-center justify-center rounded-lg">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}

                  {images.length > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-5">
                      <button
                        onClick={prevImage}
                        className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
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
                      <div className="flex items-center gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className="p-0 m-0 focus:outline-none"
                          >
                            <span
                              className={`block rounded-full transition-all duration-200 ${currentImageIndex === index ? "w-3 h-3 bg-[#ee6786ff] scale-110 shadow-[0_0_0_3px_rgba(238,103,134,0.4)]" : "w-2.5 h-2.5 bg-black/50 hover:bg-black/70"}`}
                            />
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={nextImage}
                        className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
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
                </div>

                <div className="w-full lg:w-3/5 flex flex-col justify-between pt-4 cursor-default">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                    {eventDetail?.event_name || "Event Details"}
                  </h3>

                  <div className="flex-1 space-y-4 md:space-y-5">
                    <div className="flex items-start mb-7">
                      <span className="text-lg font-semibold min-w-[80px]">
                        {t("event.date")}
                      </span>
                      <span className="text-lg font-semibold ml-4">
                        {formatEventDates(eventDetail?.event_date)}
                      </span>
                    </div>
                    <div className="flex items-start mb-7">
                      <span className="text-lg font-semibold min-w-[80px]">
                        {t("event.time")}
                      </span>
                      <span className="text-lg font-semibold ml-4">
                        {eventDetail?.event_time || "TBD"}
                      </span>
                    </div>
                    <div className="flex items-start mb-7">
                      <span className="text-lg font-semibold min-w-[80px]">
                        {t("event.location")}
                      </span>
                      <span className="text-lg font-semibold ml-4">
                        {eventDetail?.event_location || "TBD"}
                      </span>
                    </div>
                    <div className="flex items-start mb-7">
                      <span className="text-lg font-semibold min-w-[80px]">
                        {t("event.sale")}
                      </span>
                      <span className="text-lg font-semibold ml-4">
                        {eventDetail?.sale_date || "TBD"}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-lg font-semibold min-w-[80px]">
                        {t("event.price")}
                      </span>
                      <span className="text-lg font-semibold ml-4 break-words line-clamp-2">
                        {formatTicketPrices(eventDetail?.ticket_price)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleOrderNowClick}
                    className="mt-6 w-1/2 px-6 py-2 text-white rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-200 font-semibold bg-[#ee6786] active:bg-[#d45573] cursor-pointer"
                  >
                    {t("event.orderNow")}
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - How to Order */}
            <div className="cursor-default w-full lg:w-1/3 bg-white shadow-md rounded-lg p-6 min-h-[500px] mt-6 lg:mt-0">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                How to Order
              </h3>
            </div>
          </div>
        </div>
      </div>

      <OrderForm
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        eventTitle={eventDetail?.event_name || "Event"}
        eventDates={eventDetail?.event_date || "TBD"}
        eventTime={eventDetail?.event_time || "TBD"}
        eventLocation={eventDetail?.event_location || "TBD"}
        eventImage={images?.length > 0 ? images[0] : null}
        eventPrices={eventDetail?.ticket_price || "TBD"}
        eventId={eventDetail?.id}
      />

      <SignIn
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
        onSwitchToForgotPassword={() => {}}
        onLogin={() => {
          setIsLoggedIn(true);
          setShowSignIn(false);
          setShowOrderForm(true);
        }}
      />

      <SignUp
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />
    </>
  );
}

export default EventPageDetails;
