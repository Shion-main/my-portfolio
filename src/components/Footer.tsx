
import { Code, Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Mail, href: 'mailto:hello@portfolio.dev', label: 'Email' },
  ];

  return (
    <footer className="py-12 border-t border-white/10 bg-navy/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Code className="h-6 w-6 text-neon-blue" />
            <span className="text-lg font-bold glow-text">Portfolio</span>
          </div>

          <div className="flex space-x-4 mb-4 md:mb-0">
            {socialLinks.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                size="icon"
                className="hover:bg-neon-blue/20 hover:text-neon-blue transition-colors"
                asChild
              >
                <a href={link.href} aria-label={link.label}>
                  <link.icon className="h-5 w-5" />
                </a>
              </Button>
            ))}
          </div>

          <p className="text-gray-400 text-sm">
            © 2024 Portfolio. Built with React & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
