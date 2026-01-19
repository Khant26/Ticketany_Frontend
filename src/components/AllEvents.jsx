import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

function AllEventsPage({ selectedCategory: propCategory }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const IMAGE_SEPARATOR = "|||SEPARATOR|||";

  const { category } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category,searchQuery]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/events/");
      const data = await response.json();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/categories/");
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const getSelectedCategoryId = () => {
    const currentCategory = category || propCategory;
    if (!currentCategory || categories.length === 0) return null;
    const cat = categories.find((c) => c.category_name === currentCategory);
    return cat ? cat.id : null;
  };

  const getCoverImageFromEvent = (event) => {
    // Use the new images array structure with image_url
    if (event?.images?.length > 0) {
      return event.images[0].image_url; // Use image_url from EventImageSerializer
    }
    
    // Fallback for old event_image format (for backward compatibility)
    if (event?.event_image && typeof event.event_image === "string") {
      if (event.event_image.includes(IMAGE_SEPARATOR)) {
        return event.event_image.split(IMAGE_SEPARATOR).filter(Boolean)[0];
      }
      return event.event_image;
    }
    return null;
  };

  const filteredEvents = (() => {
    const selectedCategoryId = getSelectedCategoryId();
    let filtered = events;

    if (selectedCategoryId) {
      filtered = filtered.filter((event) => event.category === selectedCategoryId);
    }

    if (searchQuery) {
  filtered = filtered.filter((event) =>
    (event.event_name?.toLowerCase() || "").includes(searchQuery)
  );
}

    return filtered;
  })();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 pt-20">
        <div className="mx-auto w-full max-w-[1060px] py-7">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {category || propCategory
              ? `${category || propCategory} Events`
              : "All Events"}
          </h2>

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
                      {event.event_date}
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
        </div>
      </div>
    </div>
  );
}

export default AllEventsPage;
