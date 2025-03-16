import React, { useState } from 'react';
import { Search, Image, Shuffle, Shield, ChevronRight } from 'lucide-react';

interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for gallery images with real Unsplash images
  const galleryImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', alt: 'Abstract art' },
    { id: 2, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', alt: 'Nature landscape' },
    { id: 3, url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390', alt: 'Urban cityscape' },
    { id: 4, url: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb', alt: 'Portrait' },
    { id: 5, url: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43', alt: 'Abstract design' },
    { id: 6, url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', alt: 'Technology' },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-2">Explore anything</h1>
          <p className="text-gray-400">Discover incredible AI creations</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Describe to explore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 px-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            <Search size={20} />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-full">
            <Image size={18} />
            <span>Image</span>
          </button>
          <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-full">
            <Shuffle size={18} />
            <span>Recommended</span>
          </button>
          <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-full">
            <Shield size={18} />
            <span>Safe Mode</span>
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-xl aspect-square bg-zinc-800">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-70 transition-opacity"></div>
              <img
                src={`${image.url}?w=600&h=600&fit=crop&crop=entropy&auto=format&q=80`}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                <h3 className="text-white font-semibold">{image.alt}</h3>
                <button className="mt-2 text-sm text-gray-300 flex items-center">
                  View details <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MainContent;