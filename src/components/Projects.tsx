
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Projects = () => {
  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include user authentication, product management, and real-time inventory tracking.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
      liveUrl: '#',
      githubUrl: '#',
    },
    {
      title: 'Task Management App',
      description: 'Collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
      technologies: ['Vue.js', 'Express.js', 'Socket.io', 'MongoDB'],
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
      liveUrl: '#',
      githubUrl: '#',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Modern analytics dashboard with interactive charts, real-time data visualization, and customizable reporting features.',
      technologies: ['React', 'D3.js', 'Python', 'FastAPI'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      liveUrl: '#',
      githubUrl: '#',
    },
    {
      title: 'Social Media App',
      description: 'Full-featured social media platform with real-time messaging, content sharing, and advanced privacy controls.',
      technologies: ['React Native', 'Firebase', 'Node.js', 'GraphQL'],
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
      liveUrl: '#',
      githubUrl: '#',
    },
  ];

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Here are some of my recent projects that showcase my skills in full-stack development, UI/UX design, and modern web technologies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="glass-card overflow-hidden group hover:bg-white/10 transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-neon-blue">{project.title}</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-sm bg-electric-blue/20 text-electric-blue rounded-full border border-electric-blue/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-neon-blue/30 hover:bg-neon-blue/20 flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Live Demo</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-500/30 hover:bg-gray-500/20 flex items-center space-x-2"
                  >
                    <Github className="h-4 w-4" />
                    <span>Code</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-neon-blue/30 hover:bg-neon-blue/20 px-8 py-3 text-lg group"
          >
            View All Projects
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Projects;
