import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Helper to get Simple Icons SVG URL by slug, with overrides for special cases
const getSimpleIconUrl = (name: string) => {
  switch (name) {
    case 'Next.js':
      return 'https://cdn.simpleicons.org/nextdotjs';
    case 'Framer Motion':
      return 'https://cdn.simpleicons.org/framer';
    case 'Linux Shell':
      return 'https://cdn.simpleicons.org/linux';
    default:
      const slug = name
        .replace(/\./g, '')
        .replace(/\s+/g, '')
        .replace(/\+/g, 'plus')
        .replace(/#/g, 'sharp')
        .toLowerCase();
      return `https://cdn.simpleicons.org/${slug}`;
  }
};

const TechShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const technologies = [
    {
      category: 'Languages',
      items: [
        { name: 'TypeScript', mastery: 'Precise', color: '#3178C6' },
        { name: 'Python', mastery: 'Mastered', color: '#3776AB' },
        { name: 'C++', mastery: 'Precise', color: '#00599C' },
        { name: 'C', mastery: 'Fluid', color: '#A8B9CC' }
      ],
      gradient: 'from-accent-primary/20 to-accent-primary/5',
      borderColor: 'border-accent-primary/20 hover:border-accent-primary/40',
      accentColor: '#00ADB5',
    },
    {
      category: 'Frameworks & Tools',
      items: [
        { name: 'React', mastery: 'Fluid', color: '#61DAFB' },
        { name: 'Next.js', mastery: 'Fluid', color: '#000000' },
        { name: 'TailwindCSS', mastery: 'Mastered', color: '#06B6D4' },
        { name: 'Framer Motion', mastery: 'Mastered', color: '#0055FF' },
        { name: 'Git', mastery: 'Precise', color: '#F05032' }
      ],
      gradient: 'from-orange-500/20 to-orange-500/5',
      borderColor: 'border-orange-500/20 hover:border-orange-500/40',
      accentColor: '#FF9E00',
    },
    {
      category: 'Infra & DevOps',
      items: [
        { name: 'PostgreSQL', mastery: 'Fluid', color: '#336791' },
        { name: 'Docker', mastery: 'Fluid', color: '#2496ED' },
        { name: 'Linux Shell', mastery: 'Fluid', color: '#FCC624' }
      ],
      gradient: 'from-accent-secondary/20 to-accent-secondary/5',
      borderColor: 'border-accent-secondary/20 hover:border-accent-secondary/40',
      accentColor: '#F72585',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 80, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const getMasteryColor = (mastery: string) => {
    switch (mastery) {
      case 'Mastered': return 'text-green-400';
      case 'Precise': return 'text-accent-primary';
      case 'Fluid': return 'text-blue-400';
      default: return 'text-text-secondary';
    }
  };

  return (
    <section ref={sectionRef} className="py-32 px-8 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Tech <span className="text-accent-primary">Arsenal</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-text-secondary max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Tools and technologies I use to craft exceptional digital experiences
          </motion.p>
          
          {/* Animated divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-24 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full mx-auto mt-8"
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.category}
              variants={cardVariants}
              whileHover={{ 
                y: -15,
                scale: 1.02,
                rotateY: index === 1 ? 0 : (index === 0 ? 5 : -5),
                transition: { duration: 0.4 }
              }}
              className="group relative"
            >
              <div className={`relative p-8 bg-dark-surface/80 backdrop-blur-sm border ${tech.borderColor} rounded-2xl transition-all duration-500 overflow-hidden`}>
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${tech.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Category with accent color */}
                  <motion.h3 
                    className="text-xl font-semibold mb-8 text-text-primary relative"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {tech.category}
                    <motion.div
                      className="absolute -bottom-2 left-0 h-0.5 bg-current"
                      style={{ color: tech.accentColor }}
                      initial={{ width: 0 }}
                      whileInView={{ width: '60%' }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    />
                  </motion.h3>

                  {/* Technologies */}
                  <div className="space-y-6">
                    {tech.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: itemIndex * 0.1 + index * 0.05,
                          duration: 0.5
                        }}
                        whileHover={{ 
                          x: 8,
                          transition: { duration: 0.2 }
                        }}
                        className="group/item cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <motion.span 
                              className="w-8 h-8 flex items-center justify-center bg-transparent"
                              whileHover={{ 
                                scale: 1.15,
                                rotate: [0, -10, 10, 0],
                                transition: { duration: 0.4 }
                              }}
                            >
                              <img
                                src={getSimpleIconUrl(item.name)}
                                alt={item.name + ' logo'}
                                className="w-8 h-8 object-contain"
                                loading="lazy"
                                style={{ filter: item.name === 'Next.js' ? 'invert(1)' : 'none' }}
                              />
                            </motion.span>
                            <div>
                              <div className="font-medium text-text-primary group-hover/item:text-accent-primary transition-colors duration-300">
                                {item.name}
                              </div>
                              <div className={`text-sm font-mono ${getMasteryColor(item.mastery)} opacity-80`}>
                                {item.mastery}
                              </div>
                            </div>
                          </div>
                          
                          {/* Mastery indicator */}
                          <motion.div
                            className="w-3 h-3 rounded-full border-2"
                            style={{ 
                              borderColor: item.color,
                              backgroundColor: `${item.color}20`
                            }}
                            whileHover={{ 
                              scale: 1.5,
                              backgroundColor: item.color,
                              boxShadow: `0 0 20px ${item.color}40`
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Hover effect line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 rounded-full"
                  style={{ backgroundColor: tech.accentColor }}
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-40, 40, -40],
                x: [-20, 20, -20],
                opacity: [0.1, 0.4, 0.1],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechShowcase;