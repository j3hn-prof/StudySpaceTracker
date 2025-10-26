import { useState } from 'react';
import { Search, MapPin, Volume2, VolumeX, Volume1, Clock, Star } from 'lucide-react';

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
import './App.css'


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




const getNoiseIcon = (noise: string) => {
    switch (noise.toLowerCase()) {
    case "quiet": return <VolumeX className="w-4 h-4" />;
    case "moderate": return <Volume1 className="w-4 h-4" />;
    case "loud": return <Volume2 className="w-4 h-4" />;
    default: return null;
  }
};




const getNoiseColor = (noise: string) => {
  switch(noise) {
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




      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Map */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-900">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Campus Map</h2>
          <div className="relative w-full h-96 rounded-lg border-2 border-red-800 overflow-hidden" style={{
            backgroundImage: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)',
          }}>
            {/* Map Background Elements */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Charles River */}
              <path d="M 0 320 Q 200 300 400 320 T 800 320 L 800 384 L 0 384 Z" fill="#93c5fd" opacity="0.4" />
            
              {/* Commonwealth Avenue - main street */}
              <rect x="0" y="180" width="800" height="8" fill="#78716c" opacity="0.3" />
            
              {/* Bay State Road */}
              <rect x="0" y="120" width="800" height="6" fill="#78716c" opacity="0.25" />
            
              {/* Cross streets */}
              <rect x="150" y="100" width="4" height="250" fill="#78716c" opacity="0.2" />
              <rect x="300" y="100" width="4" height="250" fill="#78716c" opacity="0.2" />
              <rect x="450" y="100" width="4" height="250" fill="#78716c" opacity="0.2" />
              <rect x="600" y="100" width="4" height="250" fill="#78716c" opacity="0.2" />
            
              {/* Building blocks */}
              <rect x="160" y="130" width="60" height="40" fill="#7c2d12" opacity="0.15" rx="2" />
              <rect x="310" y="140" width="70" height="50" fill="#7c2d12" opacity="0.15" rx="2" />
              <rect x="460" y="200" width="80" height="60" fill="#7c2d12" opacity="0.15" rx="2" />
              <rect x="100" y="200" width="50" height="45" fill="#7c2d12" opacity="0.15" rx="2" />
              <rect x="520" y="130" width="65" height="55" fill="#7c2d12" opacity="0.15" rx="2" />
            
              {/* Green spaces */}
              <circle cx="180" cy="280" r="25" fill="#86efac" opacity="0.3" />
              <circle cx="500" cy="100" r="30" fill="#86efac" opacity="0.3" />
            </svg>
          
            {/* Study Spot Markers */}
            {filteredSpots.map((spot) => (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  selectedSpot?.id === spot.id
                    ? 'scale-125 z-10'
                    : 'hover:scale-110'
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <div className={`${
                  selectedSpot?.id === spot.id
                    ? 'bg-red-900 ring-4 ring-red-800'
                    : 'bg-red-800 hover:bg-red-900'
                } text-amber-50 p-3 rounded-full shadow-lg`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-semibold text-red-900 whitespace-nowrap bg-amber-50 px-2 py-1 rounded shadow">
                  {spot.name.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center italic">
            Click on a marker to view details
          </p>
        </div>




        {/* Details Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-900">
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            {selectedSpot ? "Spot Details" : "Select a Location"}
          </h2>
        
          {selectedSpot ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-red-900">{selectedSpot.name}</h3>
                <p className="text-amber-800 font-medium">{selectedSpot.type}</p>
              </div>




              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-lg">{selectedSpot.rating}</span>
                  <span className="text-gray-600">/5.0</span>
                </div>
              
                <div className={`flex items-center gap-2 ${getNoiseColor(selectedSpot.noise)}`}>
                  {getNoiseIcon(selectedSpot.noise)}
                  <span className="font-semibold capitalize">{selectedSpot.noise}</span>
                </div>
              </div>




              <div>
                <h4 className="font-semibold text-red-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedSpot.description}</p>
              </div>




              <div>
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hours
                </h4>
                <p className="text-gray-700">{selectedSpot.hours}</p>
              </div>




              <div>
                <h4 className="font-semibold text-red-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSpot.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="bg-red-900 text-amber-50 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-red-900 opacity-30" />
              <p className="text-lg">Click on a location marker on the map to view details</p>
              <p className="text-sm mt-2">Found {filteredSpots.length} study spots matching your filters</p>
            </div>
          )}
        </div>
      </div>




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
    </div>
  </div>
  );
}

export default App;

