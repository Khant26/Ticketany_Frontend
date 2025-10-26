import { useState } from "react";

function ImageSlider({ banner }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!banner || banner.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === banner.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? banner.length - 1 : prev - 1));
  };

  return (
   <div className="w-full max-w-[1060px] mx-auto rounded-xl overflow-hidden shadow-md">
  
  <div className="relative w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] xl:h-[360px] overflow-hidden">
    <img
      src={banner[currentImageIndex].image}
      alt={banner[currentImageIndex].description}
      className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform-gpu will-change-transform hover:scale-[1.03]"

    />

   
    <button
      onClick={prevImage}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:scale-110 hover:bg-opacity-70 transition-all duration-200"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>

  
    <button
      onClick={nextImage}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:scale-110 hover:bg-opacity-70 transition-all duration-200"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>

 
  <div className="flex justify-center items-center gap-2 bg-white py-5 rounded-b-xl">
    {banner.map((_, idx) => (
      <span
        key={idx}
        className={`h-2 w-2 rounded-full ${
          idx === currentImageIndex ? "bg-black" : "bg-black/30"
        }`}
      />
      
    ))}
  </div>
</div>

  );
}

export default ImageSlider;
