import { Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Projects = () => {
  const projects = [
    {
      title: 'Spacely – Nearby Rentals',
      description: 'A full-stack platform that helps Mapúa Malayan Colleges Mindanao students discover budget-friendly rentals, post listings, and manage the process – with a powerful admin dashboard for moderation.',
      technologies: ['Typescript', 'Next.js', 'PostgreSQL'],
      image: '/Images/Projects/SPACELY.png',
      githubUrl: 'https://github.com/Shion-main/spacely.git',
    },
    {
      title: 'J&H Management System',
      description: 'A comprehensive rental property management system designed for J&H Management staff to efficiently manage branches, tenants, billing, and financial operations.',
      technologies: ['Typescript', 'Next.js', 'PostgreSQL', 'Nodemailer'],
      image: '/Images/Projects/J-H-APARTMENT.png',
      githubUrl: 'https://github.com/Shion-main/j-h-apartment.git',
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
                
                <div className="flex justify-start">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-500/30 hover:bg-gray-500/20 flex items-center space-x-2"
                    onClick={() => window.open(project.githubUrl, '_blank')}
                  >
                    <Github className="h-4 w-4" />
                    <span>Code</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
