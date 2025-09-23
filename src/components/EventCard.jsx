import { Link } from "react-router-dom";

export default function EventCard({ id, img, date, title, location }) {
  return (
    <Link
      to={`/EventPageDetails/${id}`}
      className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
    >
      <img
        src={img}
        alt={title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
      <div className="absolute bottom-4 left-4 text-white space-y-1">
        <div className="text-sm font-medium">{date}</div>
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm">{location}</div>
      </div>
    </Link>
  );
}
