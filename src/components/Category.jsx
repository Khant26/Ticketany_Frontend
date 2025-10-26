import { useState, useEffect, useRef } from "react";

function Category({ selectedCategory, setSelectedCategory }) {
  const [categories, setCategories] = useState([]);
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);
  const [underlineStyle, setUnderlineStyle] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/categories/");
      const data = await response.json();
      setCategories(data);
    
      if (data.length > 0) {
        setSelectedCategory(data[0].category_name);
      }
      };
    fetchCategories();
  }, []);

  useEffect(() => {
    const index = categories.findIndex(
      (cat) => cat.category_name === selectedCategory
    );
    const button = buttonRefs.current[index];
    if (button) {
      setUnderlineStyle({
        width: `${button.offsetWidth}px`,
        left: `${button.offsetLeft}px`,
      });
    }
  }, [selectedCategory, categories]);

  return (
    <div className="relative flex flex-wrap justify-center gap-6 mb-20
    " ref={containerRef}>
      {categories.map((cat, index) => (
        <button
          key={cat.id}
          ref={(el) => (buttonRefs.current[index] = el)}
          onClick={() => setSelectedCategory(cat.category_name)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-300 mb-2
            ${
              selectedCategory === cat.category_name
                ? "text-gray-800 font-semibold"
                : "text-gray-500 font-semibold hover:text-[#e51f4b] cursor-pointer"
            }`}
        >
          {cat.category_image && (
            <img
              src={cat.category_image}
              alt={cat.category_name}
              className="w-8 h-8 rounded-full object-cover border border-gray-300"
            />
          )}
          <span>{cat.category_name}</span>
        </button>
      ))}

      <span
  className="absolute bottom-0 h-1 rounded-full transition-all duration-300 ease-in-out bg-[#ee6786ff]"
  style={underlineStyle}
/>
</div>
  );
}

export default Category;
