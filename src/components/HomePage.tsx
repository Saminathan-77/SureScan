import React from 'react';
import { Brain, MessageSquare, Activity, ArrowRight, Shield, Clock } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text font-Minecraft">
          SureScan
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Advanced AI-powered medical diagnosis platform for brain tumor classification and personalized healthcare assistance
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/50 hover:border-blue-500/50 transition-all">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
            <Brain size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Brain Tumor Classification</h3>
          <p className="text-gray-400 mb-4">
            Upload brain MRI scans for instant AI-powered tumor detection and classification with high accuracy.
          </p>
          <button className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
            Try diagnosis <ArrowRight size={16} className="ml-2" />
          </button>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/50 hover:border-purple-500/50 transition-all">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
            <MessageSquare size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Medical AI Assistant</h3>
          <p className="text-gray-400 mb-4">
            Chat with our specialized medical AI to get answers about symptoms, conditions, and treatment options.
          </p>
          <button className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
            Start chatting <ArrowRight size={16} className="ml-2" />
          </button>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/50 hover:border-pink-500/50 transition-all">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
            <Activity size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Health Reports</h3>
          <p className="text-gray-400 mb-4">
            Track your diagnosis history, get detailed reports, and monitor your health progress over time.
          </p>
          <button className="flex items-center text-pink-400 hover:text-pink-300 transition-colors">
            View reports <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Scan</h3>
            <p className="text-gray-400">
              Upload your MRI scan images securely to our platform for analysis.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-400">
              Our advanced AI algorithms analyze the images with precision and accuracy.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-red-500 text-transparent bg-clip-text">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Results</h3>
            <p className="text-gray-400">
              Receive detailed diagnosis results and recommended next steps.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50 flex items-center">
          <div className="mr-4">
            <Shield size={32} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Privacy Protected</h3>
            <p className="text-gray-400">Your medical data is encrypted and securely stored with strict privacy controls.</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50 flex items-center">
          <div className="mr-4">
            <Clock size={32} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">24/7 Availability</h3>
            <p className="text-gray-400">Access diagnosis tools and AI assistance anytime, anywhere you need it.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-12 rounded-2xl border border-blue-800/30">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Experience the future of medical diagnosis with our AI-powered platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:opacity-90 transition-opacity">
            Try Brain Tumor Diagnosis
          </button>
          <button className="px-8 py-3 bg-zinc-800 rounded-full font-semibold hover:bg-zinc-700 transition-colors">
            Chat with Medical AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;