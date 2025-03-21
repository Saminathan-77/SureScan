// App.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import DiagnosisPage from './components/DiagnosisPage';
import ChatbotPage from './components/ChatbotPage';
import SurvivalTime from './components/SurvivalTime'; // Import the new page

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'diagnosis':
        return <DiagnosisPage />;
      case 'survival':
        return <SurvivalTime />; // New page
      case 'chat':
        return <ChatbotPage />;
      // You can add other cases here as needed.
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Mobile menu button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-800 text-white"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Floating Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
