import { useState, useEffect, useRef } from "react";

function Category({ selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const categoryRefs = useRef({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
        const response = await fetch(`${baseUrl}categories/`);
        const data = await response.json();

        setCategories(data);

        if (data.length > 0) {
          const savedCategory = sessionStorage.getItem("selectedCategory");

          const validSavedCategory = data.find(
            (cat) => cat.category_name === savedCategory
          );

          if (validSavedCategory) {
            setSelectedCategory(validSavedCategory.category_name);
          } else {
            setSelectedCategory(data[0].category_name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [setSelectedCategory]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    sessionStorage.setItem("selectedCategory", categoryName);
  };

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
    <div className="relative px-4 sm:px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:justify-center lg:gap-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            ref={(el) => {
              if (el) categoryRefs.current[cat.category_name] = el;
            }}
            onClick={() => handleCategorySelect(cat.category_name)}
            className={`relative flex items-center justify-center lg:justify-start gap-2 px-3 py-2.5 lg:px-4 lg:py-2 transition-all duration-300 rounded-xl lg:rounded-none border lg:border-0 lg:pb-3
              ${
                selectedCategory === cat.category_name
                  ? "bg-pink-50 border-[#ee6786] text-[#e51f4b] font-semibold shadow-sm lg:bg-transparent lg:shadow-none lg:text-gray-800"
                  : "bg-white border-gray-200 text-gray-600 font-medium hover:border-[#ee6786] hover:text-[#e51f4b] lg:bg-transparent lg:hover:border-transparent lg:text-gray-500 lg:font-semibold"
              }`}
          >
            {cat.category_image_url && (
              <img
                src={cat.category_image_url}
                alt={cat.category_name}
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border border-gray-300 shrink-0"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/32x32/e2e8f0/666?text=" +
                    encodeURIComponent(cat.category_name.charAt(0));
                }}
              />
            )}

            <span className="text-xs leading-tight lg:text-base truncate max-w-[100px] lg:max-w-none">
              {cat.category_name}
            </span>
          </button>
        ))}
      </div>

      {/* Underline for lg+ only */}
      <div className="hidden lg:block relative mt-2 h-[2px]">
        <div
          className="absolute bottom-0 h-[2px] bg-[#e51f4b] transition-all duration-300"
          style={underlineStyle}
        />
      </div>
    </div>
  );
}

export default Category;
