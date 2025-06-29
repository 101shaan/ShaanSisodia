export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: { [key: string]: FileNode };
  permissions?: string;
  size?: number;
  modified?: Date;
  executable?: boolean;
}

export class FileSystem {
  private root: FileNode;
  
  constructor() {
    this.root = this.createFileSystem();
  }

  private createFileSystem(): FileNode {
    return {
      name: '/',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      modified: new Date(),
      children: {
        'home': {
          name: 'home',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          modified: new Date(),
          children: {
            'shaan': {
              name: 'shaan',
              type: 'directory',
              permissions: 'drwxr-xr-x',
              modified: new Date(),
              children: {
                'README.md': {
                  name: 'README.md',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  size: 1024,
                  modified: new Date(),
                  content: `# Welcome to ShaanOS!

This is the ultimate developer portfolio operating system.

## Available Commands:
- portfolio: Explore my projects
- games: Play retro games
- neofetch: System information
- ls: List directory contents
- cd: Change directory
- cat: Display file contents
- help: Show all commands

## Projects:
- /projects/shaanos: Custom operating system
- /projects/civsim: Civilization simulator
- /projects/dailyglitch: Mystery story platform
- /projects/ardenvale: Dark Souls RPG

Enjoy exploring!`
                },
                'portfolio.txt': {
                  name: 'portfolio.txt',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  size: 512,
                  modified: new Date(),
                  content: `Shaan Sisodia - Systems Developer
================================

Age: 14 years old
Location: United Kingdom
GitHub: https://github.com/101shaan
Email: shaansisodia3@gmail.com

Specializing in:
- Operating Systems Development
- Full-stack Web Applications
- Game Development
- Systems Programming`
                },
                '.secrets': {
                  name: '.secrets',
                  type: 'directory',
                  permissions: 'drwx------',
                  modified: new Date(),
                  children: {
                    'easter_egg.txt': {
                      name: 'easter_egg.txt',
                      type: 'file',
                      permissions: '-rw-------',
                      size: 256,
                      modified: new Date(),
                      content: `🎉 CONGRATULATIONS! 🎉

You found the secret directory!

Here's a secret: This entire OS is running in your browser
using React, TypeScript, and pure determination.

Try these secret commands:
- matrix: Enter the Matrix
- konami: Unlock special features
- hack --advanced: Advanced hacker mode`
                    }
                  }
                }
              }
            }
          }
        },
        'projects': {
          name: 'projects',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          modified: new Date(),
          children: {
            'shaanos': {
              name: 'shaanos',
              type: 'directory',
              permissions: 'drwxr-xr-x',
              modified: new Date(),
              children: {
                'README.md': {
                  name: 'README.md',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  size: 2048,
                  modified: new Date(),
                  content: `# ShaanOS - Custom x86 Operating System

A complete x86 operating system implementation featuring:

## Features:
- Memory Management (Physical & Virtual)
- Process Scheduling
- Interrupt Handling
- VGA Text Mode Output
- Keyboard Input Driver
- ATA Disk Operations
- FAT12 File System Support
- Custom Bootloader

## Technical Details:
- Written in C and Assembly
- Supports x86 architecture
- Custom memory allocator
- Interrupt-driven I/O
- Kernel shell for testing

## GitHub:
https://github.com/101shaan/ShaanOS

This is a real operating system that boots on actual hardware!`
                },
                'kernel.c': {
                  name: 'kernel.c',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  size: 4096,
                  modified: new Date(),
                  content: `// ShaanOS Kernel Entry Point
#include "kernel.h"
#include "memory.h"
#include "interrupts.h"

void kernel_main() {
    // Initialize VGA display
    vga_init();
    
    // Set up memory management
    memory_init();
    
    // Initialize interrupt handlers
    interrupts_init();
    
    // Start kernel shell
    kshell_start();
    
    // Kernel main loop
    while(1) {
        halt();
    }
}`
                }
              }
            },
            'civsim': {
              name: 'civsim',
              type: 'directory',
              permissions: 'drwxr-xr-x',
              modified: new Date(),
              children: {
                'README.md': {
                  name: 'README.md',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  size: 1536,
                  modified: new Date(),
                  content: `# CivSim - Civilization Simulator

A sophisticated Python/Pygame civilization simulation featuring:

## Features:
- Realistic population growth with demographic transitions
- Territory expansion and visualization
- War and diplomatic interactions
- OpenAI GPT integration for dynamic lore generation
- Detailed civilization information with rich UI

## Technical Implementation:
- Python with Pygame for graphics
- NumPy for mathematical calculations
- OpenAI API for AI-generated lore
- Complex algorithms for population dynamics
- Real-time simulation with variable speeds

## GitHub:
https://github.com/101shaan/CIVSIM

Watch civilizations rise and fall in real-time!`
                }
              }
            },
            'dailyglitch': {
              name: 'dailyglitch',
              type: 'directory',
              permissions: 'drwxr-xr-x',
              modified: new Date(),
              children: {
                'README.md': {
                  name: 'README.md',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  size: 1280,
                  modified: new Date(),
                  content: `# Daily Glitch - Mystery Story Platform

A full-stack web platform for mysterious daily stories.

## Features:
- Daily mysterious stories and unexplained phenomena
- Archive system with search functionality
- Responsive dark theme with glitch aesthetics
- Newsletter integration
- CLI tool for content management

## Tech Stack:
- React & Next.js frontend
- Supabase backend
- TypeScript for type safety
- TailwindCSS for styling
- PostgreSQL database

## Live Site:
https://dailyglitch.org

## GitHub:
https://github.com/101shaan/DailyGlitch

Explore the unexplained, one glitch at a time.`
                }
              }
            },
            'ardenvale': {
              name: 'ardenvale',
              type: 'directory',
              permissions: 'drwxr-xr-x',
              modified: new Date(),
              children: {
                'README.md': {
                  name: 'README.md',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  size: 1792,
                  modified: new Date(),
                  content: `# Ardenvale RPG - Dark Souls Inspired Text RPG

A complex text-based fantasy RPG inspired by Dark Souls.

## Features:
- Strategic turn-based combat system
- Character progression and leveling
- 15+ unique locations across 4 regions
- Beacon fast-travel system
- NPC dialogue trees and quest system
- Inventory management with equipment
- Save/load functionality

## Game World:
- Shrine Grounds: Starting area with Firelink Shrine
- Outer Lands: Undead Settlement, Cathedral of the Deep
- Ashen Woods: Farron Keep, burning forests
- Northern Realm: Lothric Castle, Anor Londo

## Technical Features:
- Modular Python architecture
- Object-oriented design
- Complex game state management
- ASCII art and rich text interface

## GitHub:
https://github.com/101shaan/Arvendale

Prepare to die... in text form!`
                }
              }
            }
          }
        },
        'bin': {
          name: 'bin',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          modified: new Date(),
          children: {
            'snake': {
              name: 'snake',
              type: 'file',
              permissions: '-rwxr-xr-x',
              size: 8192,
              modified: new Date(),
              executable: true,
              content: 'Binary executable: Snake Game'
            },
            'tetris': {
              name: 'tetris',
              type: 'file',
              permissions: '-rwxr-xr-x',
              size: 12288,
              modified: new Date(),
              executable: true,
              content: 'Binary executable: Tetris Game'
            },
            'invaders': {
              name: 'invaders',
              type: 'file',
              permissions: '-rwxr-xr-x',
              size: 10240,
              modified: new Date(),
              executable: true,
              content: 'Binary executable: Space Invaders'
            }
          }
        },
        'etc': {
          name: 'etc',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          modified: new Date(),
          children: {
            'motd': {
              name: 'motd',
              type: 'file',
              permissions: '-rw-r--r--',
              size: 512,
              modified: new Date(),
              content: `Welcome to ShaanOS v2.1!

This is the ultimate developer portfolio operating system.
Built with React, TypeScript, and pure determination.

System Status: All systems operational
Uptime: ${Math.floor(Math.random() * 100)} days
Load Average: 0.${Math.floor(Math.random() * 99)}

Have fun exploring!`
            }
          }
        }
      }
    };
  }

  getNode(path: string): FileNode | null {
    const parts = path.split('/').filter(p => p);
    let current = this.root;

    for (const part of parts) {
      if (!current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }

    return current;
  }

  listDirectory(path: string): FileNode[] {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory' || !node.children) {
      return [];
    }

    return Object.values(node.children);
  }

  readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') {
      return null;
    }
    return node.content || '';
  }

  exists(path: string): boolean {
    return this.getNode(path) !== null;
  }

  isDirectory(path: string): boolean {
    const node = this.getNode(path);
    return node?.type === 'directory';
  }

  isExecutable(path: string): boolean {
    const node = this.getNode(path);
    return node?.executable === true;
  }

  resolvePath(currentDir: string, targetPath: string): string {
    if (targetPath.startsWith('/')) {
      return targetPath;
    }

    if (targetPath === '.') {
      return currentDir;
    }

    if (targetPath === '..') {
      const parts = currentDir.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/');
    }

    if (targetPath.startsWith('./')) {
      targetPath = targetPath.slice(2);
    }

    const currentParts = currentDir.split('/').filter(p => p);
    const targetParts = targetPath.split('/').filter(p => p);

    for (const part of targetParts) {
      if (part === '..') {
        currentParts.pop();
      } else {
        currentParts.push(part);
      }
    }

    return '/' + currentParts.join('/');
  }
}