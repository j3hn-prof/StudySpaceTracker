import { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StudySpot {
  id: number;
  name: string;
  type: string;
  rating: number;
  amenities: string[];
  hours: string;
  description: string;
  latitude: number;
  longitude: number;
}

const App = () => {
  const studySpots: StudySpot[] = [
    {
      id: 1,
      name: "Mugar",
      type: "Library",
      rating: 4.5,
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
      amenities: ["WiFi", "Power Outlets", "Whiteboards", "Collaborative"],
      hours: "8am - 11pm",
      description: "Open collaborative space designed for group projects and discussion.",
      latitude: 42.3503,
      longitude: -71.1048
    },
    {
      id: 3,
      name: "Kilachand",
      type: "Academic Building",
      rating: 4.6,
      amenities: ["WiFi", "Power Outlets", "Beautiful Architecture"],
      hours: "8am - 10pm",
      description: "Stunning reading room with high ceilings and natural light.",
      latitude: 42.3503,
      longitude: -71.0970
    },
    {
      id: 4,
      name: "CGS",
      type: "Student Center",
      rating: 4.3,
      amenities: ["WiFi", "Power Outlets", "Food Nearby", "Collaborative"],
      hours: "7am - 2am",
      description: "Popular student center with comfortable seating and group study areas.",
      latitude: 42.3514,
      longitude: -71.1146
    },
    {
      id: 5,
      name: "Warren Towers",
      type: "Residence",
      rating: 4.0,
      amenities: ["WiFi", "Power Outlets", "Reserved Rooms"],
      hours: "8am - 12am",
      description: "Peaceful library atmosphere with individual study carrels.",
      latitude: 42.3490,
      longitude: -71.1035
    }
  ];

  const [selectedSpot, setSelectedSpot] = useState<StudySpot | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bestSpot, setBestSpot] = useState<StudySpot | null>(null);

  // Filter spots based on search term
  const filteredSpots = studySpots.filter((spot) =>
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch and highlight best spot
const fetchBestSpot = async () => {
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    const userLat = pos.coords.latitude;
    const userLon = pos.coords.longitude;

    const res = await fetch(`http://localhost:8000/ranked?lat=${userLat}&lon=${userLon}`);
    const data = await res.json(); // Expected format: [["Mugar", 0.75], ["CDS", 0.66], ...]

    // Just use the first element (index 0) from the ranked list
    const [bestName, bestScore] = data[0]; // Get the best-ranked spot from the response
    console.log(bestName);

    // Directly find the best spot from the studySpots list (no need for `if` block)
    const bestStudySpot = studySpots.find(spot => spot.name === bestName);

    // Log the best spot name and score
    console.log('Best spot:', bestStudySpot?.name, 'with score:', bestScore);

    // Set the best spot and selected spot
    setBestSpot(bestStudySpot!);  // Set the best spot
    setSelectedSpot(bestStudySpot!);  // Highlight this spot on the map
  } catch (err) {
    console.error("Error fetching ranked locations:", err);
  }
};
 
  // Define marker icons
  const getIcon = (isSelected: boolean, isBest: boolean) => {
    return L.icon({
      iconUrl: isBest
        ? 'https://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/green-dot.png'
        : isSelected
        ? 'https://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png'
        : 'https://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/red-dot.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

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
        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-red-900">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-red-900 w-5 h-5" />
            <input
              type="text"
              placeholder="Search study spots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>

          <button
            onClick={fetchBestSpot}
            className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition"
          >
            Find Best Spot
          </button>
        </div>

        {/* Map and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="w-full h-96">
            <MapContainer
              center={[42.3563, -71.09]}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {filteredSpots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id;
                const isBest = bestSpot?.id === spot.id;

                return (
                  <Marker
                    key={spot.id}
                    position={[spot.latitude, spot.longitude] as LatLngExpression}
                    icon={getIcon(isSelected, isBest)}
                    eventHandlers={{
                      click: () => setSelectedSpot(spot),
                    }}
                  >
                    <Popup>
                      <h3>{spot.name}</h3>
                      <p>{spot.description}</p>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Study Spots List */}
          <div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">Study Spots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedSpot?.id === spot.id
                      ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                      : bestSpot?.id === spot.id
                      ? 'border-green-600 bg-green-50 shadow-lg'
                      : 'border-red-800 hover:border-red-900 hover:shadow-md'
                  }`}
                >
                  <h3 className="font-bold text-red-900 mb-1">{spot.name}</h3>
                  <p className="text-sm text-amber-800 mb-2">{spot.type}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-semibold">{spot.rating}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Spot Details */}
        {selectedSpot && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-red-900">{selectedSpot.name}</h3>
            <p className="text-sm text-amber-800 mb-2">{selectedSpot.type}</p>
            <p className="text-sm mb-4">{selectedSpot.description}</p>

            <h4 className="font-semibold text-red-900 mb-2">Amenities:</h4>
            <ul className="list-disc pl-5">
              {selectedSpot.amenities.map((amenity, index) => (
                <li key={index} className="text-sm text-amber-800">{amenity}</li>
              ))}
            </ul>

            <h4 className="font-semibold text-red-900 mt-4">Hours:</h4>
            <p className="text-sm text-amber-800">{selectedSpot.hours}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
