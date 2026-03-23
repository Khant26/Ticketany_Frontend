import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiService from "../services/apiService";

function EventGrid({ selectedCategory, variant = "user" }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const isAdmin = variant === "admin";
  const seeAllBase = isAdmin ? "/admin/events" : "/events";
  const cardHref = (id) => isAdmin ? `/admin/events/${id}/edit` : `/EventPageDetails/${id}`;
  const IMAGE_SEPARATOR = "|||SEPARATOR|||";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiService.get("events/", { auth: false });
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.get("categories/", { auth: false });
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const getSelectedCategoryId = () => {
    if (!selectedCategory || categories.length === 0) return null;
    const category = categories.find(
      (cat) => cat.category_name === selectedCategory,
    );
    return category ? category.id : null;
  };

  const getCoverImageFromEvent = (event) => {
    if (event?.images?.length > 0) {
      return event.images[0].image_url;
    }

    if (event?.event_image && typeof event.event_image === "string") {
      if (event.event_image.includes(IMAGE_SEPARATOR)) {
        const [first] = event.event_image
          .split(IMAGE_SEPARATOR)
          .filter(Boolean);
        return first || null;
      }
      return event.event_image;
    }
    return null;
  };

  const formatCardEventDate = (dateString) => {
    if (!dateString) return "";

    return String(dateString)
      .replace(/,\s*/g, " - ")  // Replace comma with dash
      .replace(/(\d{4})(?=\d)/, "$1 - ");  // Year separator (if needed)
  };

  const getEventImage = (event) => getCoverImageFromEvent(event);

  const filteredEvents = (() => {
    const selectedCategoryId = getSelectedCategoryId();
    if (!selectedCategoryId) return events.slice(0, 4);
    return events
      .filter((event) => event.category === selectedCategoryId)
      .slice(0, 4);
  })();

  return (
    <div className="mx-auto w-full max-w-[1060px]">
      <div className="flex justify-end mb-4">
        <Link
          to={`${seeAllBase}/${selectedCategory || "all"}`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#e51f4b] transition-colors duration-200"
        >
          <span>{t("home.viewAll")}</span>
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m0 0l-6-6m6 6l-6 6"
            />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredEvents.map((event) => {
          const eventImage = getEventImage(event);
          return (
            <Link
              key={event.id}
              to={cardHref(event.id)}
              className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div>
                {eventImage ? (
                  <img
                    src={eventImage}
                    alt={event.event_name}
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x256/e2e8f0/64748b?text=" +
                        encodeURIComponent(event.event_name);
                    }}
                  />
                ) : (
                  <div className="w-full h-80 text-gray-500 bg-gray-200 flex flex-col items-center justify-center">
                    <div className="text-lg font-bold">{event.event_name}</div>
                    <div className="text-sm">No Posters Available</div>
                  </div>
                )}
              </div>
              <div className="flex flex-col p-4 gap-2">
                <div className="sm:text-md text-sm font-medium text-[#e51f4b]">
                  {formatCardEventDate(event.event_date)}
                </div>
                <div className="sm:text-lg text-md font-semibold">{event.event_name}</div>
                <div className="sm:text-md text-sm text-gray-500">
                  {event.event_location}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default EventGrid;
