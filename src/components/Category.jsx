import { useState, useEffect } from "react";

function Category({ selectedCategory, setSelectedCategory }) {
  const [category, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('http://127.0.0.1:8000/api/categories/'); 
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-4 px-4 pb-[100px]">
      {category.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.category_name)}
          className={`w-[200px] h-[200px] hover:w-[210px] hover:h-[210px] shadow-lg rounded-lg transition-all duration-400 ease-in-out
 ${
            selectedCategory === cat.category_name
              ? "bg-pink-700 text-white "
              : "bg-pink-500 text-white hover:bg-pink-600 "
          }`}
        >
          {cat.category_name}
          {cat.category_image && (
            <img
              src={cat.category_image}
              alt={cat.category_name}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </button>
      ))}
    </div>
  );
}

export default Category;
