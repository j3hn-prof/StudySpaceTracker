import { useState } from 'react';
import { Search, MapPin, Volume2, VolumeX, Volume1, Clock, Star } from 'lucide-react';
import './App.css';

interface StudySpot {
  id: number;
  name: string;
  type: string;
  rating: number;
  amenities: string[];
  hours: string;
  description: string;
  x: number;
  y: number;
}

const App = () => {
  const studySpots: StudySpot[] = [
  {
    id: 1,
    name: "Mugar",
    type: "Library",
    rating: 4.5,
    numberOfRatings: 9802,
    maxCapacity: 500,
    currentCapacity: 267,
    amenities: ["WiFi", "Power Outlets", "Printing", "24/7"],
    hours: "24/7 during semester",
    description: "Main library with multiple floors offering various study environments from silent study to collaborative spaces.",
    latitude: 42.3510,
    longitude: -71.1080
  },
  {
    id: 2,
    name: "CDS",
    type: "Academic Building",
    rating: 4.5,
    numberOfRatings: 4781,
    maxCapacity: 300,
    currentCapacity: 161,
    amenities: ["WiFi", "Power Outlets", "Whiteboards", "Collaborative"],
    hours: "8am - 11pm",
    description: "Open collaborative space designed for group projects and discussion. Whiteboards available.",
    latitude: 42.3503,
    longitude: -71.1048
  },
  {
    id: 3,
    name: "Kilachand",
    type: "Academic Building",
    rating: 4.6,
    numberOfRatings: 599,
    maxCapacity: 50,
    currentCapacity: 14,
    amenities: ["WiFi", "Power Outlets", "Beautiful Architecture"],
    hours: "8am - 10pm",
    description: "Stunning reading room with high ceilings and natural light. Perfect for focused individual study.",
    latitude: 42.3503,
    longitude: -71.0970
  },
  {
    id: 4,
    name: "CGS",
    type: "Student Center",
    rating: 4.3,
    numberOfRatings: 1000,
    maxCapacity: 100,
    currentCapacity: 50,
    amenities: ["WiFi", "Power Outlets", "Food Nearby", "Collaborative"],
    hours: "7am - 2am",
    description: "Popular student center with comfortable seating and group study areas. Great for collaborative work.",
    latitude: 42.3514,
    longitude: -71.1146
  },
  {
    id: 5,
    name: "Warren Towers",
    type: "Residence",
    rating: 4.0,
    numberOfRatings: 803,
    maxCapacity: 10,
    currentCapacity: 8,
    amenities: ["WiFi", "Power Outlets", "Reserved Rooms"],
    hours: "8am - 12am",
    description: "Peaceful library atmosphere with individual study carrels and reservable group study rooms.",
    latitude: 42.3490,
    longitude: -71.1035
  }
];

  const [selectedSpot, setSelectedSpot] = useState<StudySpot | null>(null);
  const [amenityFilter, setAmenityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- New states for ranking ---
  const [rankedSpots, setRankedSpots] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [error, setError] = useState("");

  // --- Fetch rankings from backend ---
  const fetchRankings = async () => {
    setLoadingRankings(true);
    setError("");

    try {
      let lat = userLocation?.lat;
      let lon = userLocation?.lon;

      if (!lat || !lon) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        setUserLocation({ lat, lon });
      }

      const response = await fetch(`http://localhost:8000/ranked?lat=${lat}&lon=${lon}`);
      if (!response.ok) throw new Error("Failed to fetch rankings");

      const data = await response.json();
      setRankedSpots(data);
    } catch (err: any) {
      console.error(err);
      setError("Error fetching ranked study spots.");
    } finally {
      setLoadingRankings(false);
    }
  };

  const filteredSpots = studySpots.filter(spot => {
    const matchesAmenity = amenityFilter === "all" || spot.amenities.some(a =>
      a.toLowerCase().includes(amenityFilter.toLowerCase())
    );
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAmenity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 to-red-800 text-amber-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2">BU Study Spot Finder</h1>
          <p className="text-amber-100">Find your perfect study space on campus</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-red-900">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-red-900 w-5 h-5" />
              <input
                type="text"
                placeholder="Search study spots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>
          </div>
        </div>

        {/* Main Content (Map + Details) */}
        {/* ... existing map and details code stays the same ... */}

        {/* Study Spots List */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-2 border-red-900">
          <h2 className="text-2xl font-bold text-red-900 mb-4">All Study Spots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpots.map((spot) => (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedSpot?.id === spot.id
                    ? 'border-red-900 bg-amber-50 shadow-lg'
                    : 'border-red-800 hover:border-red-900 hover:shadow-md'
                }`}
              >
                <h3 className="font-bold text-red-900 mb-1">{spot.name}</h3>
                <p className="text-sm text-amber-800 mb-2">{spot.type}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-semibold">{spot.rating}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- Ranked Study Spots Section --- */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-2 border-red-900">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Top Ranked Study Spots Near You</h2>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={fetchRankings}
              disabled={loadingRankings}
              className="bg-red-900 text-amber-50 px-4 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50"
            >
              {loadingRankings ? "Fetching..." : "Find Ranked Spots"}
            </button>
            {userLocation && (
              <p className="text-sm text-gray-600">
                Using your location: ({userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)})
              </p>
            )}
          </div>

          {error && <p className="text-red-700 mb-2">{error}</p>}

          {rankedSpots.length > 0 ? (
            <div className="space-y-3">
              {rankedSpots.slice(0, 10).map((item, idx) => {
                const row = item[0];
                const score = item[1];
                const name = row["Name"] || row["name"] || "Unknown";

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-amber-200 pb-2"
                  >
                    <div>
                      <span className="font-semibold text-red-900">{idx + 1}. {name}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Score: <span className="font-bold">{(score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 italic">
              {loadingRankings ? "Loading..." : "Click the button above to get personalized rankings."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
