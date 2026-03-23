import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useLocation } from "react-router-dom";
import apiService from "../services/apiService";

function AllEventsPage({ selectedCategory: propCategory }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const IMAGE_SEPARATOR = "|||SEPARATOR|||";

  const { category } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q")?.toLowerCase() || "";
  const currentCategory = category || propCategory;
  const normalizedCategory =
    typeof currentCategory === "string" && currentCategory.toLowerCase() === "all"
      ? null
      : currentCategory;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [normalizedCategory, searchQuery]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiService.get("events/");
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
        const data = await apiService.get("categories/");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const getSelectedCategoryId = () => {
    if (!normalizedCategory || categories.length === 0) return null;
    const cat = categories.find((c) => c.category_name === normalizedCategory);
    return cat ? cat.id : null;
  };

  const getCoverImageFromEvent = (event) => {
    if (event?.images?.length > 0) {
      return event.images[0].image_url;
    }

    if (event?.event_image && typeof event.event_image === "string") {
      if (event.event_image.includes(IMAGE_SEPARATOR)) {
        return event.event_image.split(IMAGE_SEPARATOR).filter(Boolean)[0];
      }
      return event.event_image;
    }
    return null;
  };

  const formatCardEventDate = (dateString) => {
    if (!dateString) return "";

    return String(dateString)
      .replace(/,\s*/g, " - ")
      .replace(/(\d{4})(?=\d)/, "$1 - ");
  };

  const filteredEvents = (() => {
    const selectedCategoryId = getSelectedCategoryId();
    let filtered = events;

    if (selectedCategoryId) {
      filtered = filtered.filter(
        (event) => event.category === selectedCategoryId,
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((event) =>
        (event.event_name?.toLowerCase() || "").includes(searchQuery),
      );
    }

    return filtered;
  })();

  const pageTitle = normalizedCategory
    ? `${normalizedCategory} ${t("events.titleSuffix")}`
    : t("events.allEvents");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 pt-20">
        <div className="mx-auto w-full max-w-[1060px] pt-10 pb-7 px-4 lg:px-auto lg:pt-7">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {pageTitle}
          </h2>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {filteredEvents.map((event) => {
                const eventImage = getCoverImageFromEvent(event);
                return (
                  <Link
                    key={event.id}
                    to={`/EventPageDetails/${event.id}`}
                    className="relative rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 overflow-hidden"
                  >
                    {eventImage ? (
                      <img
                        src={eventImage}
                        alt={event.event_name}
                        className="w-full h-80 object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x256/e2e8f0/64748b?text=" +
                            encodeURIComponent(event.event_name);
                        }}
                      />
                    ) : (
                      <div className="w-full h-80 text-gray-500 bg-gray-200 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold">
                          {event.event_name}
                        </div>
                        <div className="text-sm">No Posters Available</div>
                      </div>
                    )}

                    <div className="flex flex-col p-4 gap-2">
                      <div className="text-md font-medium text-red-500">
                        {formatCardEventDate(event.event_date)}
                      </div>
                      <div className="text-lg font-semibold">
                        {event.event_name}
                      </div>
                      <div className="text-md text-gray-500">
                        {event.event_location}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-gray-600 shadow-sm">
              {t("events.noEventsFound")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllEventsPage;
