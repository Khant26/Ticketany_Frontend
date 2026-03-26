import { useRef, useState } from "react";

function ImageSlider({ banner }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartXRef = useRef(null);
  const touchDeltaXRef = useRef(0);

  if (!banner || banner.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === banner.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? banner.length - 1 : prev - 1));
  };

  const handleTouchStart = (e) => {
    if (banner.length <= 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return;

    const swipeThreshold = 50;

    if (touchDeltaXRef.current <= -swipeThreshold) {
      nextImage();
    } else if (touchDeltaXRef.current >= swipeThreshold) {
      prevImage();
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  return (
  <div className="w-full max-w-[1060px] mx-auto rounded-xl overflow-hidden shadow-md">
    <div
      className="relative w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] xl:h-[360px] 2xl:h-[400px] overflow-hidden rounded-xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={
          banner[currentImageIndex]?.banner_image_url ||
          banner[currentImageIndex]?.image
        }
        alt={banner[currentImageIndex]?.description || "Banner"}
        className="block w-full h-full object-cover object-center"
        onError={(e) => {
          e.currentTarget.src =
            "https://via.placeholder.com/1060x400/e2e8f0/64748b?text=Banner+Image";
        }}
      />

      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <button
        onClick={prevImage}
        className="hidden md:flex absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/65 hover:scale-110 transition-all duration-200 cursor-pointer"
        aria-label="Previous banner"
      >
        <svg
          className="w-5 h-5 lg:w-6 lg:h-6"
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

      <button
        onClick={nextImage}
        className="hidden md:flex absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/65 hover:scale-110 transition-all duration-200 cursor-pointer"
        aria-label="Next banner"
      >
        <svg
          className="w-5 h-5 lg:w-6 lg:h-6"
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

      <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 rounded-full bg-black/35 backdrop-blur-sm">
        {banner.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImageIndex(idx)}
            aria-label={`Go to banner ${idx + 1}`}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentImageIndex
                ? "bg-white scale-110"
                : "bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  </div>
  );
}

export default ImageSlider;
