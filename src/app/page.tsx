'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Plane, CheckCircle2, MapPin, Calendar, Users, Wallet, Sparkles, Loader2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

interface JourneyData {
  profile?: any;
  selectedDestination?: any;
  tripDetails?: any;
  bookingConfirmed?: boolean;
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [journeyData, setJourneyData] = useState<JourneyData>({});
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(40); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session on mount
  useEffect(() => {
    fetch('/api/session', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setSessionId(data.sessionId);
        setCurrentSection(data.currentSection);
        // Add welcome message
        const welcomeMessage = '👋 Welcome! I\'m excited to help you plan your perfect European getaway. Tell me about your ideal trip - what interests you most when you travel?';
        setMessages([{
          role: 'agent',
          content: welcomeMessage
        }]);
        // Generate initial suggestions based on welcome message
        generateSuggestions(welcomeMessage);
      })
      .catch(err => console.error('Failed to create session:', err));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate dynamic suggestions based on AI's last message
  const generateSuggestions = async (lastAIMessage: string) => {
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: lastAIMessage,
          section: currentSection 
        })
      });
      
      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setDynamicSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to default suggestions if API fails
      setDynamicSuggestions([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMessage })
      });

      const data = await response.json();

      // Add agent response
      setMessages(prev => [...prev, { role: 'agent', content: data.content }]);
      
      // Update section if advanced
      if (data.metadata?.newSection) {
        setCurrentSection(data.metadata.newSection);
      }
      
      // Update journey data from metadata
      if (data.metadata?.profile) {
        setJourneyData(prev => ({ ...prev, profile: data.metadata.profile }));
      }
      if (data.metadata?.selectedDestination) {
        setJourneyData(prev => ({ ...prev, selectedDestination: data.metadata.selectedDestination }));
      }
      if (data.metadata?.tripDetails) {
        setJourneyData(prev => ({ ...prev, tripDetails: data.metadata.tripDetails }));
      }

      // Generate contextual suggestions based on AI's response
      generateSuggestions(data.content);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const toggleSection = (sectionId: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Resizing handlers
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = (e.clientX / window.innerWidth) * 100;
      // Constrain between 25% and 60%
      if (newWidth >= 25 && newWidth <= 60) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const steps = [
    { id: 1, name: 'Preferences', short: 'Profile' },
    { id: 2, name: 'Destination', short: 'Explore' },
    { id: 3, name: 'Trip Details', short: 'Plan' },
    { id: 4, name: 'Confirmation', short: 'Book' }
  ];

  // Dynamic suggestions based on AI's last message or fallback to section defaults
  const getSuggestions = () => {
    if (isLoading || input.trim()) return []; // Hide when user is typing
    
    // Use AI-generated suggestions if available
    if (dynamicSuggestions.length > 0) {
      return dynamicSuggestions;
    }
    
    // Fallback to default suggestions based on section
    switch (currentSection) {
      case 1:
        return [
          "🎨 We love art and museums",
          "🍷 We're foodies looking for culinary experiences",
          "🏖️ Beach and relaxation for a week",
          "⛰️ Adventure and nature activities",
          "🏛️ History and architecture enthusiast",
          "💑 Romantic getaway for a couple"
        ];
      case 2:
        return [
          "Show me your top recommendations",
          "Tell me more about the first option",
          "What's best for warm weather?",
          "I prefer somewhere quieter",
          "Which has the best food scene?",
          "Show me budget-friendly options"
        ];
      case 3:
        return [
          "June 15-20 for 5 nights",
          "Prefer boutique hotels in city center",
          "Include museum and food tours",
          "Want to see top attractions",
          "Flexible with dates, mid-month",
          "Ready to review my trip"
        ];
      case 4:
        return [
          "Yes, confirm my booking",
          "Looks perfect!",
          "Can you adjust the dates?",
          "What's included in the price?",
          "Confirm and proceed"
        ];
      default:
        return [];
    }
  };

  const getSectionHelper = () => {
    switch (currentSection) {
      case 1:
        return "Tell me about your travel preferences - interests, budget, who's traveling, and when";
      case 2:
        return "Ask for recommendations or select a destination you'd like to explore";
      case 3:
        return "Share your trip details - dates, accommodation preferences, and activities";
      case 4:
        return "Review your trip summary and confirm to complete your booking";
      default:
        return "";
    }
  };

  const suggestions = getSuggestions();
  const helperText = getSectionHelper();

  return (
    <div className={`h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg z-50">
        <div className="w-full px-8 py-5">
          {/* Top: Logo and Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plane className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Intelligent Booking
                </h1>
                <p className="text-xs text-gray-600 font-medium">Powered by GPT-5 • AI Travel Assistant</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2.5 rounded-full border border-green-200 shadow-sm">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-sm font-semibold text-green-700">AI Online</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2.5 rounded-full border border-blue-200 shadow-sm">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">{messages.length} msgs</span>
              </div>
            </div>
          </div>

          {/* Horizontal Step Progress */}
          <div className="flex items-center justify-between relative px-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative group">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-1 -z-10">
                    <div className={`h-full transition-all duration-700 ease-out rounded-full ${
                      currentSection > step.id 
                        ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 shadow-sm' 
                        : 'bg-gray-200'
                    }`} />
                  </div>
                )}
                
                {/* Step Circle */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                  currentSection > step.id 
                    ? 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-xl shadow-green-500/30 scale-105' 
                    : currentSection === step.id
                    ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-xl shadow-blue-500/40 scale-110 ring-4 ring-blue-100 animate-pulse-slow'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}>
                  {currentSection > step.id ? (
                    <CheckCircle2 className="w-6 h-6 text-white animate-scale-in" />
                  ) : (
                    <span className={`text-base font-bold ${
                      currentSection === step.id ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.id}
                    </span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-3 text-center">
                  <div className={`text-xs font-bold transition-all duration-300 ${
                    currentSection === step.id 
                      ? 'text-blue-600 scale-110' 
                      : currentSection > step.id
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}>
                    <span className="hidden sm:inline">{step.name}</span>
                    <span className="sm:hidden">{step.short}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main 2-Column Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Sidebar - Journey Details (Resizable) */}
        <aside 
          className="bg-gradient-to-br from-white/60 via-white/50 to-blue-50/30 backdrop-blur-md flex flex-col overflow-hidden shadow-inner transition-all duration-150"
          style={{ width: `${sidebarWidth}%` }}
        >

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
            {/* Journey Header */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Your Journey
                </h2>
                <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Real-time progress tracking
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-5">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-500 transform hover:scale-[1.02] ${
                    currentSection === step.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl shadow-blue-200/50 scale-[1.02]'
                      : currentSection > step.id
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-200/40'
                      : 'border-gray-200 bg-white/70 shadow-sm hover:shadow-md hover:border-gray-300'
                  }`}
                >
                  {/* Active indicator */}
                  {currentSection === step.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                  )}
                  
                  {/* Header - Clickable to collapse/expand */}
                  <div 
                    className="flex items-center gap-4 cursor-pointer select-none"
                    onClick={() => toggleSection(step.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
                      currentSection > step.id
                        ? 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-green-500/30'
                        : currentSection === step.id
                        ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-blue-500/40 animate-pulse-slow'
                        : 'bg-gray-300'
                    }`}>
                      {currentSection > step.id ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold text-base">{step.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-base transition-colors ${
                        currentSection === step.id ? 'text-blue-700' : currentSection > step.id ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {step.name}
                      </h3>
                      {currentSection === step.id && (
                        <span className="text-xs text-blue-600 font-semibold animate-pulse">In Progress...</span>
                      )}
                      {currentSection > step.id && (
                        <span className="text-xs text-green-600 font-semibold">✓ Completed</span>
                      )}
                    </div>
                    {/* Collapse/Expand Icon */}
                    <div className={`transition-transform duration-300 ${collapsedSections.has(step.id) ? '' : 'rotate-180'}`}>
                      {collapsedSections.has(step.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                  
                  {/* Section Content - Collapsible */}
                  {!collapsedSections.has(step.id) && (
                    <>
                  {step.id === 1 && journeyData.profile && (
                    <div className="mt-4 space-y-3 animate-fadeIn">
                      {journeyData.profile.interests?.length > 0 && (
                        <div className="flex items-center gap-3 p-2.5 bg-white/60 rounded-lg backdrop-blur-sm border border-blue-100">
                          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800 font-medium">{journeyData.profile.interests.join(', ')}</span>
                        </div>
                      )}
                      {journeyData.profile.budget && (
                        <div className="flex items-center gap-3 p-2.5 bg-white/60 rounded-lg backdrop-blur-sm border border-green-100">
                          <Wallet className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800 font-medium capitalize">{journeyData.profile.budget} budget</span>
                        </div>
                      )}
                      {journeyData.profile.group_type && (
                        <div className="flex items-center gap-3 p-2.5 bg-white/60 rounded-lg backdrop-blur-sm border border-purple-100">
                          <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800 font-medium">{journeyData.profile.group_size} {journeyData.profile.group_type}</span>
                        </div>
                      )}
                      {journeyData.profile.duration_days && (
                        <div className="flex items-center gap-3 p-2.5 bg-white/60 rounded-lg backdrop-blur-sm border border-orange-100">
                          <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800 font-medium">{journeyData.profile.duration_days} days in {journeyData.profile.travel_season}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {step.id === 2 && journeyData.selectedDestination && (
                    <div className="mt-4 animate-fadeIn">
                      <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                        <div className="flex items-start gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-900 text-base">{journeyData.selectedDestination.destination.name}</span>
                            <div className="flex gap-3 mt-2 text-xs">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                                {journeyData.selectedDestination.score}% match
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                                €{journeyData.selectedDestination.destination.avg_daily_cost}/day
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step.id === 3 && currentSection >= 3 && journeyData.selectedDestination && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200 animate-fadeIn">
                      <p className="text-sm text-purple-700 font-medium flex items-center gap-2">
                        {currentSection === 3 ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Finalizing trip details...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Trip details collected
                          </>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {step.id === 4 && currentSection >= 4 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 animate-fadeIn">
                      <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                        {currentSection === 4 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Ready for confirmation
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Booking confirmed!
                          </>
                        )}
                      </p>
                    </div>
                  )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Card */}
            {journeyData.selectedDestination && (
              <div className="relative animate-slideIn">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-2xl shadow-blue-200/50">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Plane className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-extrabold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Trip Summary
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-blue-100">
                      <div className="text-xs text-gray-600 font-semibold mb-1">Destination</div>
                      <div className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {journeyData.selectedDestination.destination.name}
                      </div>
                    </div>
                    {journeyData.profile && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-orange-100">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Duration</div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-orange-500" />
                              {journeyData.profile.duration_days} days
                            </div>
                          </div>
                          <div className="p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-green-100">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Budget</div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-green-500" />
                              €{(journeyData.selectedDestination.destination.avg_daily_cost * journeyData.profile.duration_days * journeyData.profile.group_size).toFixed(0)}
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <div className="text-xs text-purple-700 font-bold mb-1 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Travelers
                          </div>
                          <div className="font-bold text-gray-900">
                            {journeyData.profile.group_size} {journeyData.profile.group_type}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Resize Handle */}
        <div
          className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize relative group transition-colors ${
            isResizing ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-1 h-12 bg-gray-400 group-hover:bg-blue-500 rounded-full transition-colors"></div>
          </div>
          {/* Tooltip */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap -translate-y-8">
              Drag to resize
            </div>
          </div>
        </div>

        {/* Right Side - Chat Interface (Dynamic Width) */}
        <main 
          className="flex flex-col overflow-hidden min-h-0 bg-gradient-to-br from-white/40 to-blue-50/20 transition-all duration-150"
          style={{ width: `${100 - sidebarWidth}%` }}
        >
          {/* Chat Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="max-w-4xl mx-auto space-y-6 pb-4">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div className={`max-w-2xl rounded-2xl px-6 py-5 transition-all duration-300 hover:scale-[1.01] ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white ml-16 shadow-lg shadow-blue-500/30' 
                      : 'bg-white text-gray-800 mr-16 border-2 border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200'
                  }`}>
                    {msg.role === 'agent' ? (
                      <div className="markdown-content text-sm leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="space-y-1 my-2" {...props} />,
                            li: ({node, ...props}) => <li className="ml-4" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-base font-bold mt-3 mb-2 first:mt-0" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-2 mb-1 first:mt-0" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl px-6 py-5 shadow-lg mr-16 border-2 border-blue-200">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-sm font-medium text-blue-700">AI is thinking...</span>
                      <div className="flex space-x-1.5 ml-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestion Chips */}
          {suggestions.length > 0 && !isLoading && (
            <div className="border-t border-gray-200/50 bg-gradient-to-br from-white/90 via-blue-50/30 to-indigo-50/20 backdrop-blur-md animate-slideUp">
              <div className="px-8 py-5">
                <div className="max-w-4xl mx-auto">
                  {/* Helper Text */}
                  <div className="flex items-start gap-3 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-700 mb-1">Section {currentSection} of 4</div>
                      <div className="text-sm text-gray-700 leading-relaxed">{helperText}</div>
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-600">Quick suggestions:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={!sessionId}
                          className="group relative px-4 py-2.5 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed animate-fadeIn"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <span className="relative z-10">{suggestion}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-indigo-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:via-indigo-400/10 group-hover:to-purple-400/10 rounded-xl transition-all duration-300"></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Area - Sticky Bottom */}
          <div className="bg-white/95 backdrop-blur-xl border-t-2 border-gray-200/50 shadow-2xl">
            <div className="px-8 py-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message... ✨ (Press Enter to send)"
                      rows={1}
                      className="w-full px-6 py-4 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 resize-none transition-all text-sm shadow-inner hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-800 placeholder:text-gray-400"
                      disabled={isLoading || !sessionId}
                      style={{ minHeight: '58px', maxHeight: '120px' }}
                    />
                    {input.trim() && (
                      <div className="absolute bottom-2 right-3 text-xs text-gray-400 font-medium">
                        {input.length} chars
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !sessionId || !input.trim()}
                    className="relative bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl px-8 py-4 flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl group transform hover:scale-105 active:scale-95"
                  >
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    <span className="font-bold">
                      {isLoading ? 'Sending...' : 'Send'}
                    </span>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-3" />}
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    Powered by GPT-5
                  </span>
                  <span className="hidden sm:block">Press <kbd className="px-2 py-0.5 bg-gray-200 rounded font-mono text-gray-700">Enter</kbd> to send</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulseSlow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulseSlow 2s ease-in-out infinite;
        }
        
        /* Custom scrollbar for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .scrollbar-thumb-blue-300::-webkit-scrollbar-thumb {
          background: #93c5fd;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}


