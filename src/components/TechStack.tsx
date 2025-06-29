import React from 'react';
import { motion } from 'framer-motion';

const TechStack: React.FC = () => {
  const techCategories = [
    {
      title: 'Languages',
      items: [
        { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript', color: '#3178C6' },
        { name: 'Python', icon: 'https://cdn.simpleicons.org/python', color: '#3776AB' },
        { name: 'C++', icon: 'https://cdn.simpleicons.org/cplusplus', color: '#00599C' },
        { name: 'C', icon: 'https://cdn.simpleicons.org/c', color: '#A8B9CC' },
        { name: 'Assembly', icon: 'https://cdn.simpleicons.org/assemblyscript', color: '#007ACC' },
        { name: 'Rust', icon: 'https://cdn.simpleicons.org/rust', color: '#000000' },
      ]
    },
    {
      title: 'Systems & Tools',
      items: [
        { name: 'Linux', icon: 'https://cdn.simpleicons.org/linux', color: '#FCC624' },
        { name: 'Docker', icon: 'https://cdn.simpleicons.org/docker', color: '#2496ED' },
        { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql', color: '#336791' },
        { name: 'Git', icon: 'https://cdn.simpleicons.org/git', color: '#F05032' },
        { name: 'GDB', icon: 'https://cdn.simpleicons.org/gnu', color: '#A42E2B' },
        { name: 'Valgrind', icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiNGRjZCMzUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+Cjwvc3ZnPgo=', color: '#FF6B35' },
        { name: 'QEMU', icon: 'https://cdn.simpleicons.org/qemu', color: '#FF6600' },
        { name: 'Vim', icon: 'https://cdn.simpleicons.org/vim', color: '#019733' },
      ]
    }
  ];

  return (
    <section id="tech" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Arsenal
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Systems tools and languages I use to build from the ground up
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-8" />
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {techCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, x: categoryIndex === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              className="space-y-8"
            >
              <h3 className="text-3xl font-bold text-gray-100 mb-8 text-center lg:text-left">
                {category.title}
              </h3>
              
              {/* Grid layout for tech items */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {category.items.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ 
                      delay: (categoryIndex * 0.2) + (index * 0.1), 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    className="group p-6 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 text-center will-change-transform"
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ 
                          backgroundColor: `${item.color}15`,
                          border: `1px solid ${item.color}30`
                        }}
                      >
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="w-8 h-8 object-contain transition-all duration-300 group-hover:brightness-110"
                          style={{ 
                            filter: item.name === 'Rust' || item.name === 'GDB' ? 'invert(1)' : 'none' 
                          }}
                          loading="lazy"
                        />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors duration-200">
                        {item.name}
                      </h4>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center, ${item.color}10 0%, transparent 70%)`
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;