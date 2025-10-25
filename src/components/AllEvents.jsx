import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const IMAGE_SEPARATOR = "|||SEPARATOR|||";

export default function AllEvents() {
  const { category } = useParams();
  const { search } = useLocation();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await fetch("http://127.0.0.1:8000/api/events/");
      const data = await r.json();
      setEvents(Array.isArray(data) ? data : []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch("http://127.0.0.1:8000/api/categories/");
      const data = await r.json();
      setCategories(Array.isArray(data) ? data : []);
    })();
  }, []);

  const selectedCategoryId = useMemo(() => {
    if (!category || category === "all") return null;
    const match = categories.find((c) => c.category_name === category || String(c.id) === String(category));
    return match ? match.id : null;
  }, [category, categories]);

  const filtered = useMemo(() => {
    if (!selectedCategoryId) return events;
    return events.filter((e) => String(e.category) === String(selectedCategoryId));
  }, [events, selectedCategoryId]);

  // Read search query (?q=...) and filter events by name/location/date
  const query = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("q")?.trim().toLowerCase() || "";
  }, [search]);

  const displayed = useMemo(() => {
    if (!query) return filtered;
    return filtered.filter((e) => {
      const fields = [e?.event_name, e?.event_location, e?.event_date, e?.event_description, e?.organizer];
      return fields.some((v) => String(v || "").toLowerCase().includes(query));
    });
  }, [filtered, query]);

  const cover = (e) => {
    if (typeof e?.event_image === "string") {
      if (e.event_image.includes(IMAGE_SEPARATOR)) {
        const [first] = e.event_image.split(IMAGE_SEPARATOR).filter(Boolean);
        return first || null;
      }
      return e.event_image;
    }
    return null;
  };

  const cardHref = (id) => `/EventPageDetails/${id}`;

  return (
    <div className="min-h-screen mx-auto w-full max-w-[1060px] px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayed.map((e) => {
          const img = cover(e);
          return (
            <Link
              key={e.id}
              to={cardHref(e.id)}
              className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {img ? (
                <img
                  src={img}
                  alt={e.event_name}
                  className="w-full h-80 object-cover"
                  onError={(ev) => {
                    ev.currentTarget.src =
                      "https://via.placeholder.com/400x256/e2e8f0/64748b?text=" +
                      encodeURIComponent(e.event_name || "Event");
                  }}
                />
              ) : (
                <div className="w-full h-80 text-gray-500 bg-gray-200 flex flex-col items-center justify-center">
                  <div className="text-lg font-bold">{e.event_name}</div>
                  <div className="text-sm">No Posters Available</div>
                </div>
              )}
              <div className="flex flex-col p-4 gap-2">
                <div className="text-md font-medium text-[#e51f4b]">{e.event_date}</div>
                <div className="text-lg font-semibold">{e.event_name}</div>
                <div className="text-md text-gray-500">{e.event_location}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}