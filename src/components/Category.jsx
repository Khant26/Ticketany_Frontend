import { useState, useEffect, useRef } from "react";

function Category({ selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchCategories = async () => {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
      const response = await fetch(`${baseUrl}categories/`);
      const data = await response.json();
      setCategories(data);

      if (data.length > 0) {
        setSelectedCategory(data[0].category_name);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryRefs.current[selectedCategory]) {
      const element = categoryRefs.current[selectedCategory];
      setUnderlineStyle({
        width: `${element.offsetWidth}px`,
        left: `${element.offsetLeft}px`,
      });
    }
  }, [selectedCategory, categories]);

  return (
    <div className="relative mb-12 sm:mb-20">
      {/* Underline only for sm and above */}
      <div
        className="hidden sm:block absolute bottom-0 h-1 bg-[#ee6786ff] rounded-full transition-all duration-300 ease-out"
        style={underlineStyle}
      />

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            ref={(el) => {
              if (el) categoryRefs.current[cat.category_name] = el;
            }}
            onClick={() => setSelectedCategory(cat.category_name)}
            className={`relative flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-4 sm:py-2 transition-all duration-300 rounded-xl sm:rounded-none border sm:border-0 sm:pb-3
              ${
                selectedCategory === cat.category_name
                  ? "bg-pink-50 border-[#ee6786] text-[#e51f4b] font-semibold shadow-sm sm:bg-transparent sm:shadow-none sm:text-gray-800"
                  : "bg-white border-gray-200 text-gray-600 font-medium hover:border-[#ee6786] hover:text-[#e51f4b] sm:bg-transparent sm:hover:border-transparent sm:text-gray-500 sm:font-semibold"
              }`}
          >
            {cat.category_image_url && (
              <img
                src={cat.category_image_url}
                alt={cat.category_name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-300 shrink-0"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/32x32/e2e8f0/666?text=" +
                    encodeURIComponent(cat.category_name.charAt(0));
                }}
              />
            )}

            <span className="text-xs leading-tight sm:text-base truncate max-w-[100px] sm:max-w-none">
              {cat.category_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Category;
