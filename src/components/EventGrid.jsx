import { useState, useEffect } from "react";
import EventCard from "./EventCard";

function EventGrid({ selectedCategory }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents([
      {
        id: 1,
        category: "Justin Bieber",
        title: "JB World Tour",
        date: "Nov 4",
        location: "Bangkok Arena",
        img: "https://media.pitchfork.com/photos/687106d521b3667f887fb3db/2:3/w_2000,h_3000,c_limit/Justin-Bieber-Swag.jpeg",
      },
      {
        id: 2,
        category: "Taylor Swift",
        title: "Eras Tour",
        date: "Dec 12",
        location: "Impact Arena",
        img: "https://i1.sndcdn.com/artworks-eAIJwLgEtt7j-0-t500x500.jpg",
      },
      {
        id: 3,
        category: "Justin Bieber",
        title: "JB Acoustic Night",
        date: "Nov 6",
        location: "CentralWorld",
        img: "https://media.pitchfork.com/photos/687106d521b3667f887fb3db/2:3/w_2000,h_3000,c_limit/Justin-Bieber-Swag.jpeg",
      },
      {
        id: 4,
        category: "Drake",
        title: "Drake Live",
        date: "Jan 20",
        location: "ICONSIAM",
        img: "https://i.scdn.co/image/ab67616d0000b2734f0fd9dad63977146e685700",
      },
      {
        id: 5,
        category: "Justin Bieber",
        title: "JB Meet & Greet",
        date: "Nov 8",
        location: "Siam Paragon",
        img: "https://media.pitchfork.com/photos/687106d521b3667f887fb3db/2:3/w_2000,h_3000,c_limit/Justin-Bieber-Swag.jpeg",
      },
      {
        id: 6,
        category: "Kendrik Lamer",
        title: "JB Meet & Greet",
        date: "Nov 8",
        location: "Siam Paragon",
        img: "https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png",
      },
      {
        id: 7,
        category: "Double J",
        title: "JB Meet & Greet",
        date: "Nov 8",
        location: "Siam Paragon",
        img: "https://cdn-images.dzcdn.net/images/cover/5a1d13e654948f2333fbe820266acbfe/0x1900-000000-80-0-0.jpg",
      },
    ]);
  }, []);

  const filteredEvents = events
    .filter((e) => e.category === selectedCategory)
    .slice(0, 4);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </div>
  );
}

export default EventGrid;
