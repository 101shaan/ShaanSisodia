import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Terminal, ExternalLink } from 'lucide-react';

const ContactSection: React.FC = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/101shaan',
      color: 'hover:text-gray-300',
      description: '@101shaan'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://www.linkedin.com/in/shaan-sisodia-2810962ab?trk=people-guest_people_search-card&originalSubdomain=uk',
      color: 'hover:text-blue-400',
      description: 'Shaan Sisodia'
    },
    {
      name: 'Email',
      icon: Mail,
      href: 'mailto:shaansisodia3@gmail.com',
      color: 'hover:text-cyan-400',
      description: 'shaansisodia3@gmail.com'
    }
  ];

  return (
    <section id="contact" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="text-gray-100">Let's Build</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Something
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ready to create something extraordinary together?
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-8" />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Info & Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-100 mb-6">Get In Touch</h3>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                Whether you have a project in mind, want to collaborate, or just want to chat about 
                systems architecture and clean code, I'd love to hear from you.
              </p>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.02,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative p-8 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-cyan-500/50 css-transition text-center overflow-hidden ${link.color}`}
                >
                  {/* Background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 css-transition" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 css-transition">
                      <link.icon className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 css-transition" />
                    </div>
                    
                    <h4 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-cyan-400 css-transition">
                      {link.name}
                    </h4>
                    
                    <p className="text-sm text-gray-400 mb-4">
                      {link.description}
                    </p>
                    
                    <div className="inline-flex items-center text-cyan-400 font-medium">
                      <span>Connect</span>
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </div>
                  </div>

                  {/* Animated border */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 w-0 group-hover:w-full css-transition" />
                </motion.a>
              ))}
            </div>

            {/* Terminal Hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-16 p-6 bg-gray-900/30 rounded-lg border border-gray-800 max-w-md mx-auto"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-mono text-cyan-400">Terminal Hint</span>
              </div>
              <p className="text-sm text-gray-400 font-mono">
                // Try typing 'hack' + Enter anywhere on the site
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;