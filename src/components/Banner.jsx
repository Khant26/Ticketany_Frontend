import { useState, useEffect } from "react";
import Banner1 from "../assets/Banner1.jpg";
import ImageSlider from "./ImageSlider";

function Banner() {
  const [banner, setBanner] = useState([]);

  useEffect(() => {
    setBanner([
      { id: 1, image: Banner1, description: "Tomorrowland" },
      {
        id: 2,
        image:
          "https://www.tomorrowland.com/home/media/Z2GcI5bqstJ98m8a_1721687209357_c03adfb8-e1c1-45ca-83cd-e6e3611e6b56.jpg_0_13155614510499255711-min.jpg?auto=format,compress&rect=0,734,4096,1264&w=1296&h=400",
        description: "Tomorrowland",
      },
      { id: 3, image: Banner1, description: "Tomorrowland" },
      {
        id: 4,
        image:
          "https://www.tomorrowland.com/home/media/Z2GcI5bqstJ98m8a_1721687209357_c03adfb8-e1c1-45ca-83cd-e6e3611e6b56.jpg_0_13155614510499255711-min.jpg?auto=format,compress&rect=0,734,4096,1264&w=1296&h=400",
        description: "Tomorrowland",
      },
      { id: 5, image: Banner1, description: "Tomorrowland" },
    ]);
  }, []);

  return (
    <div className="relative w-[85%] h-64 overflow-hidden rounded-xl group">
      <ImageSlider banner={banner} />
    </div>
  );
}

export default Banner;
