import React from 'react';
import { Home, Brain, MessageSquare, Activity, User, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'diagnosis', icon: Brain, label: 'Scan' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'activity', icon: Activity, label: 'Reports' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help' },
  ];

  return (
    <div 
      className={`fixed left-0 top-0 z-40 h-full bg-zinc-900/90 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[80px] lg:w-[80px]' : 'w-0 lg:w-[80px]'
      }`}
      style={{
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 flex justify-center items-center h-16 border-b border-zinc-800/50">
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">SS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8">
          <ul className="space-y-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="px-4">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-xs mt-1">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-zinc-800/50">
          <button className="w-full flex flex-col items-center justify-center p-3 rounded-xl text-gray-400 hover:text-white hover:bg-zinc-800/50">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;