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
    <div className="relative flex flex-wrap justify-center gap-6 mb-20">
      <div
        className="absolute bottom-0 h-1 bg-[#ee6786ff] rounded-full transition-all duration-300 ease-out"
        style={underlineStyle}
      />

      {categories.map((cat, index) => (
        <button
          key={cat.id}
          ref={(el) => {
            if (el) categoryRefs.current[cat.category_name] = el;
          }}
          onClick={() => setSelectedCategory(cat.category_name)}
          className={`relative flex items-center gap-2 px-4 py-2 transition-colors duration-300 pb-3
            ${
              selectedCategory === cat.category_name
                ? "text-gray-800 font-semibold"
                : "text-gray-500 font-semibold hover:text-[#e51f4b] cursor-pointer"
            }`}
        >
          {cat.category_image_url && (
            <img
              src={cat.category_image_url}
              alt={cat.category_name}
              className="w-8 h-8 rounded-full object-cover border border-gray-300"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/32x32/e2e8f0/666?text=" +
                  encodeURIComponent(cat.category_name.charAt(0));
              }}
            />
          )}
          <span>{cat.category_name}</span>
        </button>
      ))}
    </div>
  );
}

export default Category;
