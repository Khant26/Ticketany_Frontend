import { useState, useEffect } from "react";

function Category({ selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
      const response = await fetch(`${baseUrl}categories/`);
      const data = await response.json();
      setCategories(data);
    
      if (data.length > 0) {
        setSelectedCategory(data[0].category_name);
      }
      };
    fetchCategories();
  }, []);

  return (
    <div className="relative flex flex-wrap justify-center gap-6 mb-20">
      {categories.map((cat, index) => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.category_name)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-300 mb-2
            ${
              selectedCategory === cat.category_name
                ? "text-gray-800 font-semibold after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-1 after:w-full after:rounded-full after:bg-[#ee6786ff] after:transition-all after:duration-300"
                : "text-gray-500 font-semibold hover:text-[#e51f4b] cursor-pointer"
            }`}
        >
          {cat.category_image_url && (
            <img
              src={cat.category_image_url}
              alt={cat.category_name}
              className="w-8 h-8 rounded-full object-cover border border-gray-300"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/32x32/e2e8f0/666?text=" + encodeURIComponent(cat.category_name.charAt(0));
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
