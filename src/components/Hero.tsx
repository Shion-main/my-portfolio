import { ArrowDown, Github, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-electric-blue/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-electric-blue/5 to-transparent rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 glow-text">
            Full Stack
            <br />
            <span className="text-transparent bg-gradient-to-r from-neon-blue to-electric-blue bg-clip-text">
              Developer
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Crafting modern, scalable web applications with cutting-edge technologies and exceptional user experiences
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Button 
              onClick={scrollToProjects}
              className="btn-glow bg-gradient-to-r from-neon-blue to-electric-blue text-black font-semibold px-8 py-3 rounded-full text-lg"
            >
              View My Work
            </Button>
            
            <div className="flex space-x-4">
              <Button asChild variant="outline" size="icon" className="rounded-full border-neon-blue/30 hover:bg-neon-blue/20">
                <a href="https://github.com/Shion-main" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon" className="rounded-full border-neon-blue/30 hover:bg-neon-blue/20">
                <a href="https://www.linkedin.com/in/joshua-robert-sabuero-6b3677373/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon" className="rounded-full border-neon-blue/30 hover:bg-neon-blue/20">
                <a href="mailto:official.joshuasabuero@gmail.com" aria-label="Email">
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="animate-bounce">
            <ArrowDown className="h-6 w-6 text-neon-blue mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
