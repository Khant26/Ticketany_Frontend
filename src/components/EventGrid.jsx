import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function EventGrid({ selectedCategory, variant = "user" }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);

  // Admin/user route bases
  const isAdmin = variant === "admin";
  const seeAllBase = isAdmin ? "/admin/events" : "/events";
  const cardHref = (id) => (isAdmin ? `/admin/events/${id}/edit` : `/EventPageDetails/${id}`);

  const IMAGE_SEPARATOR = "|||SEPARATOR|||";

  useEffect(() => {
    const fetchEvents = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
      const response = await fetch(`${baseUrl}events/`);
      const data = await response.json();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
      const response = await fetch(`${baseUrl}categories/`);
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const getSelectedCategoryId = () => {
    if (!selectedCategory || categories.length === 0) return null;
    const category = categories.find((cat) => cat.category_name === selectedCategory);
    return category ? category.id : null;
  };

  const getCoverImageFromEvent = (event) => {
    // Use the new images array structure with image_url
    if (event?.images?.length > 0) {
      return event.images[0].image_url; // Use image_url from EventImageSerializer
    }
    
    // Fallback for old event_image format (for backward compatibility)
    if (event?.event_image && typeof event.event_image === "string") {
      if (event.event_image.includes(IMAGE_SEPARATOR)) {
        const [first] = event.event_image.split(IMAGE_SEPARATOR).filter(Boolean);
        return first || null;
      }
      return event.event_image;
    }
    return null;
  };

  const getEventImage = (event) => getCoverImageFromEvent(event);

  const filteredEvents = (() => {
    const selectedCategoryId = getSelectedCategoryId();
    if (!selectedCategoryId) return events.slice(0, 4);
    return events.filter((event) => event.category === selectedCategoryId).slice(0, 4);
  })();

  return (
    <div className="mx-auto w-full max-w-[1060px]">
      <div className="flex justify-end mb-4">
        <Link
          to={`${seeAllBase}/${selectedCategory || "all"}`}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#e51f4b] transition-colors duration-200"
        >
          See All
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="text-md font-medium text-[#e51f4b]">{event.event_date}</div>
                <div className="text-lg font-semibold">{event.event_name}</div>
                <div className="text-md text-gray-500">{event.event_location}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default EventGrid;