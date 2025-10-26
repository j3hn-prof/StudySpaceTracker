import { useState } from 'react';
import { Search, MapPin, Volume2, VolumeX, Volume1, Clock, Star } from 'lucide-react';
import './App.css';

interface StudySpot {
  id: number;
  name: string;
  type: string;
  rating: number;
  noise: string;
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
      name: "Mugar Memorial Library",
      type: "Library",
      rating: 4.5,
      noise: "quiet",
      amenities: ["WiFi", "Power Outlets", "Printing", "24/7"],
      hours: "24/7 during semester",
      description: "Main library with multiple floors offering various study environments from silent study to collaborative spaces.",
      x: 30,
      y: 45
    },
    {
      id: 2,
      name: "GSU Study Lounge",
      type: "Student Center",
      rating: 4.2,
      noise: "moderate",
      amenities: ["WiFi", "Power Outlets", "Food Nearby", "Collaborative"],
      hours: "7am - 2am",
      description: "Popular student center with comfortable seating and group study areas. Great for collaborative work.",
      x: 50,
      y: 55
    },
    {
      id: 3,
      name: "Stokes Hall Reading Room",
      type: "Academic Building",
      rating: 4.7,
      noise: "quiet",
      amenities: ["WiFi", "Power Outlets", "Beautiful Architecture"],
      hours: "8am - 10pm",
      description: "Stunning reading room with high ceilings and natural light. Perfect for focused individual study.",
      x: 65,
      y: 35
    },
    {
      id: 4,
      name: "CDS Collaborative Space",
      type: "Academic Building",
      rating: 4.0,
      noise: "loud",
      amenities: ["WiFi", "Power Outlets", "Whiteboards", "Collaborative"],
      hours: "8am - 11pm",
      description: "Open collaborative space designed for group projects and discussion. Whiteboards available.",
      x: 45,
      y: 65
    },
    {
      id: 5,
      name: "Pardee Library",
      type: "Library",
      rating: 4.6,
      noise: "quiet",
      amenities: ["WiFi", "Power Outlets", "Printing", "Reserved Rooms"],
      hours: "8am - 12am",
      description: "Peaceful library atmosphere with individual study carrels and reservable group study rooms.",
      x: 70,
      y: 50
    },
    {
      id: 6,
      name: "BU Beach",
      type: "Outdoor",
      rating: 3.8,
      noise: "moderate",
      amenities: ["WiFi", "Outdoor Seating", "Scenic"],
      hours: "Always Open",
      description: "Outdoor lawn area perfect for studying on nice days. Relaxed atmosphere by the Charles River.",
      x: 25,
      y: 30
    }
  ];

  const [selectedSpot, setSelectedSpot] = useState<StudySpot | null>(null);
  const [noiseFilter, setNoiseFilter] = useState<string>("all");
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

  const getNoiseIcon = (noise: string) => {
    switch (noise.toLowerCase()) {
      case "quiet": return <VolumeX className="w-4 h-4" />;
      case "moderate": return <Volume1 className="w-4 h-4" />;
      case "loud": return <Volume2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const getNoiseColor = (noise: string) => {
    switch (noise) {
      case "quiet": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "loud": return "text-orange-600";
      default: return "";
    }
  };

  const filteredSpots = studySpots.filter(spot => {
    const matchesNoise = noiseFilter === "all" || spot.noise === noiseFilter;
    const matchesAmenity = amenityFilter === "all" || spot.amenities.some(a =>
      a.toLowerCase().includes(amenityFilter.toLowerCase())
    );
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesNoise && matchesAmenity && matchesSearch;
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-red-900 mb-2">Noise Level</label>
              <select
                value={noiseFilter}
                onChange={(e) => setNoiseFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                <option value="all">All Levels</option>
                <option value="quiet">Quiet</option>
                <option value="moderate">Moderate</option>
                <option value="loud">Loud/Collaborative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-red-900 mb-2">Amenities</label>
              <select
                value={amenityFilter}
                onChange={(e) => setAmenityFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                <option value="all">All Amenities</option>
                <option value="wifi">WiFi</option>
                <option value="power">Power Outlets</option>
                <option value="printing">Printing</option>
                <option value="24/7">24/7 Access</option>
                <option value="collaborative">Collaborative</option>
              </select>
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
                  <div className={`flex items-center gap-1 ${getNoiseColor(spot.noise)}`}>
                    {getNoiseIcon(spot.noise)}
                    <span className="text-xs capitalize">{spot.noise}</span>
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