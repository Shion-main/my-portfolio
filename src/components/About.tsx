
import { Code, Database, Globe, Smartphone, Zap, Users } from 'lucide-react';

const About = () => {
  const skills = [
    { icon: Code, name: 'Frontend Development', desc: 'React, Vue, TypeScript' },
    { icon: Database, name: 'Backend Development', desc: 'Node.js, Python, PostgreSQL' },
    { icon: Globe, name: 'Web Technologies', desc: 'REST APIs, GraphQL, WebSocket' },
    { icon: Smartphone, name: 'Mobile Development', desc: 'React Native, Flutter' },
    { icon: Zap, name: 'Performance', desc: 'Optimization, Caching, CDN' },
    { icon: Users, name: 'Collaboration', desc: 'Agile, Git, Code Reviews' },
  ];

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            About Me
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            I'm a passionate full-stack developer with expertise in modern web technologies. 
            I specialize in creating scalable, user-centric applications that deliver exceptional digital experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <div
              key={skill.name}
              className="glass-card p-6 hover:bg-white/10 transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-neon-blue/20 to-electric-blue/20 group-hover:from-neon-blue/30 group-hover:to-electric-blue/30 transition-all duration-300">
                  <skill.icon className="h-6 w-6 text-neon-blue" />
                </div>
                <h3 className="text-xl font-semibold ml-4">{skill.name}</h3>
              </div>
              <p className="text-gray-400">{skill.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-neon-blue">My Approach</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              I believe in writing clean, maintainable code and creating intuitive user experiences. 
              My focus is on delivering high-quality solutions that not only meet requirements but 
              exceed expectations. I stay current with emerging technologies and best practices to 
              ensure every project benefits from the latest innovations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
