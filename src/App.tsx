import React from 'react';
import MatrixRain from './components/MatrixRain';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import TechStack from './components/TechStack';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import TerminalOverlay from './components/TerminalOverlay';
import FloatingParticles from './components/FloatingParticles';
import BackgroundCubes from './components/BackgroundCubes';

function App() {
  return (
    <div className="relative min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Massive Background Cubes */}
      <BackgroundCubes />
      
      {/* Floating Particles Throughout Site */}
      <FloatingParticles />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Terminal Overlay - THIS IS THE KEY! */}
      <TerminalOverlay />
      
      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <TechStack />
        <ProjectsSection />
        <ContactSection />
      </main>

      {/* Ambient lighting effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

export default App;