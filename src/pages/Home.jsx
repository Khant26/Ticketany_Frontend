
import { useState } from "react";
import Banner from "../components/Banner";
import Category from "../components/Category";
import EventGrid from "../components/EventGrid";

function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Justin Bieber");

  return (
    <>
      {/* Page wrapper: spacing tuned for a fixed navbar */}
      <div className="min-h-screen max-w-8xl bg-gray-50 pt-24 sm:pt-28 pb-16 sm:pb-24">
        {/*Banner*/}
        {/* Banner with breathing room below */}
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 flex justify-center">
          <Banner />
        </div>

        {/*Category*/}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-center mb-8 sm:mb-12">
            Category
          </h1>
          <Category
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
        {/* Event Main container */}
        <div className="mx-auto w-[85%]  px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-center mb-8 sm:mb-12">
            Featured Events
          </h1>
          <EventGrid selectedCategory={selectedCategory} />
        </div>
      </div>
    </>
  );
}

export default Home;
