import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target } from 'lucide-react';

const AboutSection: React.FC = () => {
  const principles = [
    {
      icon: Brain,
      title: 'Systems Thinking',
      description: 'Every component serves the whole. I architect solutions that scale from conception to production.'
    },
    {
      icon: Zap,
      title: 'Performance First',
      description: 'Code that runs fast, scales efficiently, and handles edge cases gracefully.'
    },
    {
      icon: Target,
      title: 'Purpose-Driven',
      description: 'Every line of code has intention. No bloat, no shortcuts, no compromises.'
    }
  ];

  return (
    <section id="about" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="text-gray-100">My</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Approach
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mb-8" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left side - Philosophy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <p className="text-xl text-gray-300 leading-relaxed">
                I don't just write code—I architect solutions.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Whether it's building an OS from scratch in C and Assembly, creating real-time 
                civilization simulations, or deploying full-stack web applications, I focus on 
                systems that scale and interfaces that feel inevitable.
              </p>
            </div>

            <motion.blockquote
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="border-l-4 border-cyan-400 pl-6 py-4 bg-gray-900/50 rounded-r"
            >
              <p className="text-xl italic text-cyan-300 font-light">
                "First, solve the problem. Then, write the code." - John Johnson
              </p>
            </motion.blockquote>
          </motion.div>

          {/* Right side - Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Projects Built', value: '15+', color: 'cyan' },
                { title: 'Languages', value: '6', color: 'purple' },
                { title: 'Years Coding', value: '3+', color: 'blue' },
                { title: 'Systems Focus', value: '100%', color: 'green' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="p-6 bg-gray-900/50 rounded-lg border border-gray-800 text-center"
                >
                  <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.title}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Principles */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              className="group p-8 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 will-change-transform"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <principle.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100">{principle.title}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">{principle.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;