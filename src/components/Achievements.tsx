import { Award, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Achievements = () => {
  const achievements = [
    {
      title: 'AWS Academy Certificate',
      issuer: 'Amazon Web Services',
      description: 'Cloud computing fundamentals and AWS services expertise',
      image: 'Images/Achivements/AWS Acedemy Certificate.png',
      category: 'Cloud Computing',
      year: '2024',
      skills: ['AWS EC2', 'S3', 'Lambda', 'CloudFormation']
    },
    {
      title: 'Network Cisco Certificate',
      issuer: 'Cisco',
      description: 'Network infrastructure and cybersecurity fundamentals',
      image: 'Images/Achivements/Network Cisco Certificate.png',
      category: 'Networking',
      year: '2024',
      skills: ['Network Security', 'Routing', 'Switching', 'Protocols']
    },
    {
      title: 'Microsoft Office Specialist',
      issuer: 'Microsoft',
      description: 'Advanced proficiency in Microsoft Office applications',
      image: 'Images/Achivements/Microsoft Office Specialist Certificate.png',
      category: 'Productivity',
      year: '2023',
      skills: ['Excel', 'Word', 'PowerPoint', 'Data Analysis']
    },
    {
      title: 'Google UI/UX Certificate',
      issuer: 'Google',
      description: 'User experience design and interface development',
      image: 'Images/Achivements/Google UI_UX Certificate.png',
      category: 'Design',
      year: '2024',
      skills: ['User Research', 'Prototyping', 'Wireframing', 'Figma']
    }
  ];

  return (
    <section id="achievements" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Achievements & Certifications
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Continuous learning and professional development through industry-recognized certifications and achievements.
          </p>
        </div>

        {/* Marquee Achievements Section */}
        <div className="relative overflow-hidden mb-16">
          <div className="flex animate-marquee">
            {/* First set of achievements */}
            {achievements.map((achievement, index) => (
              <div
                key={`achievement-1-${index}`}
                className="glass-card p-6 hover:bg-white/10 transition-all duration-300 group flex-shrink-0 mx-4 min-w-[350px] border-l-4 border-neon-blue/50"
              >
                <div className="flex items-start gap-4">
                  {/* Certificate Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden group cursor-pointer"
                         onClick={() => window.open(import.meta.env.BASE_URL + achievement.image, '_blank')}>
                      <img
                        src={import.meta.env.BASE_URL + achievement.image}
                        alt={achievement.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-full bg-gradient-to-r from-neon-blue/20 to-electric-blue/20">
                        <Award className="h-4 w-4 text-neon-blue" />
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{achievement.title}</h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>{achievement.year}</span>
                      <span>•</span>
                      <span className="truncate">{achievement.issuer}</span>
                    </div>
                    
                    <div className="mb-3">
                      <span className="px-2 py-1 text-xs bg-electric-blue/20 text-electric-blue rounded-full border border-electric-blue/30">
                        {achievement.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{achievement.description}</p>
                    
                    {/* Skills - show first 2 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {achievement.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-xs bg-gray-700/50 text-gray-300 rounded border border-gray-600/30"
                        >
                          {skill}
                        </span>
                      ))}
                      {achievement.skills.length > 2 && (
                        <span className="px-2 py-0.5 text-xs text-gray-400">
                          +{achievement.skills.length - 2}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-neon-blue/30 hover:bg-neon-blue/20 flex items-center space-x-2 text-xs px-3 py-1"
                      onClick={() => window.open(import.meta.env.BASE_URL + achievement.image, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {achievements.map((achievement, index) => (
              <div
                key={`achievement-2-${index}`}
                className="glass-card p-6 hover:bg-white/10 transition-all duration-300 group flex-shrink-0 mx-4 min-w-[350px] border-l-4 border-neon-blue/50"
              >
                <div className="flex items-start gap-4">
                  {/* Certificate Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden group cursor-pointer"
                         onClick={() => window.open(import.meta.env.BASE_URL + achievement.image, '_blank')}>
                      <img
                        src={import.meta.env.BASE_URL + achievement.image}
                        alt={achievement.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-full bg-gradient-to-r from-neon-blue/20 to-electric-blue/20">
                        <Award className="h-4 w-4 text-neon-blue" />
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{achievement.title}</h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>{achievement.year}</span>
                      <span>•</span>
                      <span className="truncate">{achievement.issuer}</span>
                    </div>
                    
                    <div className="mb-3">
                      <span className="px-2 py-1 text-xs bg-electric-blue/20 text-electric-blue rounded-full border border-electric-blue/30">
                        {achievement.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{achievement.description}</p>
                    
                    {/* Skills - show first 2 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {achievement.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-xs bg-gray-700/50 text-gray-300 rounded border border-gray-600/30"
                        >
                          {skill}
                        </span>
                      ))}
                      {achievement.skills.length > 2 && (
                        <span className="px-2 py-0.5 text-xs text-gray-400">
                          +{achievement.skills.length - 2}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-neon-blue/30 hover:bg-neon-blue/20 flex items-center space-x-2 text-xs px-3 py-1"
                      onClick={() => window.open(import.meta.env.BASE_URL + achievement.image, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-blue mb-2">{achievements.length}</div>
            <div className="text-gray-400">Certifications</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-blue mb-2">4</div>
            <div className="text-gray-400">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-blue mb-2">2025</div>
            <div className="text-gray-400">Latest Year</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-blue mb-2">100%</div>
            <div className="text-gray-400">Verified</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements; 