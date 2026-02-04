import { useState, useEffect } from "react";
import ImageSlider from "./ImageSlider";
import axios from "axios";

function Banner() {
  const [banner, setBanner] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
        const response = await axios.get(`${baseUrl}banners/`);
        const bannerData = response.data.map((b) => ({
          id: b.id,
          image: b.banner_image_url || "https://placehold.co/1200x400/e2e8f0/666?text=Banner",
          banner_image_url: b.banner_image_url,
          description: b.banner_name || "Event Banner",
        }));
        console.log(
          "Banner data:",
          bannerData.map((b) => ({ id: b.id, name: b.description, hasImage: !!b.banner_image_url }))
        );
        setBanner(bannerData);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  if (banner.length === 0) return null;

  return (
    <div
      className="relative group mx-auto rounded-xl
             w-full max-w-[1060px] "
    >
      <ImageSlider banner={banner} />
    </div>
  );
}

export default Banner;
