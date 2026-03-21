import React from "react";
import { Link, useLocation } from "react-router";
import logo from "../assets/logo.jpg";

function ErrorPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f9_0%,#ffffff_55%,#f7f7f8_100%)] px-4 py-20 text-gray-900">
      <div className="mx-auto flex max-w-4xl flex-col items-center rounded-[32px] border border-rose-100 bg-white/95 px-6 py-12 text-center shadow-[0_30px_80px_rgba(17,24,39,0.12)] backdrop-blur sm:px-10">
        <div className="mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-rose-100 bg-white shadow-md sm:h-32 sm:w-32">
          <img src={logo} alt="Tickets Anywhere" className="h-full w-full object-cover" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.45em] text-rose-500">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
          The page you requested does not exist or may have been moved.
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-4 py-3 text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Requested path:</span>{" "}
          {location.pathname}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-xl bg-[#ee6786] px-6 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-[#d45573]"
          >
            Back to Home
          </Link>
          <Link
            to="/home"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;