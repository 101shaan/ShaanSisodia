import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import TechStack from './components/TechStack';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import Navigation from './components/Navigation';
import TerminalOverlay from './components/TerminalOverlay';
import MatrixRain from './components/MatrixRain';
import FloatingParticles from './components/FloatingParticles';
import BackgroundCubes from './components/BackgroundCubes';

function App() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <MatrixRain />
      <FloatingParticles />
      <BackgroundCubes />
      
      <Navigation />
      
      <main>
        <HeroSection />
        <AboutSection />
        <TechStack />
        <ProjectsSection />
        <ContactSection />
      </main>
      
      <TerminalOverlay onClose={() => {}} />
    </div>
  );
}

export default App;