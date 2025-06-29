import { FileSystem } from './FileSystem';
// @ts-ignore
import asciiArt from './asciiart.txt?raw';

interface CommandResult {
  output: Array<{ type: 'output' | 'error' | 'success'; text: string }>;
  newDirectory?: string;
}

interface CommandContext {
  currentDirectory: string;
  theme: string;
  soundEnabled: boolean;
  onDirectoryChange: (dir: string) => void;
  onThemeChange: (theme: string) => void;
  onSoundToggle: (enabled: boolean) => void;
  onGameStart: (game: string) => void;
  onExit: () => void;
}

export class CommandProcessor {
  private fileSystem: FileSystem;
  private aliases: { [key: string]: string } = {
    'll': 'ls -la',
    'la': 'ls -a',
    'dir': 'ls',
    'cls': 'clear',
    'type': 'cat'
  };

  constructor(fileSystem: FileSystem) {
    this.fileSystem = fileSystem;
  }

  async execute(command: string, context: CommandContext): Promise<CommandResult> {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Handle aliases
    if (this.aliases[cmd]) {
      return this.execute(this.aliases[cmd], context);
    }

    switch (cmd) {
      case 'help':
        return this.help();
      case 'ls':
        return this.ls(args, context.currentDirectory);
      case 'cd':
        return this.cd(args, context);
      case 'pwd':
        return this.pwd(context.currentDirectory);
      case 'cat':
        return this.cat(args, context.currentDirectory);
      case 'clear':
        return this.clear();
      case 'neofetch':
        return this.neofetch();
      case 'portfolio':
        return this.portfolio();
      case 'games':
        return this.games();
      case 'snake':
        context.onGameStart('snake');
        return { output: [] };
      case 'tetris':
        context.onGameStart('tetris');
        return { output: [] };
      case 'invaders':
        context.onGameStart('invaders');
        return { output: [] };
      case 'theme':
        return this.theme(args, context);
      case 'sound':
        return this.sound(args, context);
      case 'matrix':
        return this.matrix();
      case 'konami':
        return this.konami();
      case 'hack':
        return this.hack(args);
      case 'whoami':
        return this.whoami();
      case 'uname':
        return this.uname(args);
      case 'date':
        return this.date();
      case 'uptime':
        return this.uptime();
      case 'ps':
        return this.ps();
      case 'top':
        return this.top();
      case 'free':
        return this.free();
      case 'df':
        return this.df();
      case 'history':
        return this.history();
      case 'echo':
        return this.echo(args);
      case 'exit':
      case 'logout':
        context.onExit();
        return { output: [] };
      default:
        // Check if it's an executable in /bin
        if (this.fileSystem.isExecutable(`/bin/${cmd}`)) {
          context.onGameStart(cmd);
          return { output: [] };
        }
        return {
          output: [{ type: 'error', text: `Command not found: ${cmd}` }]
        };
    }
  }

  private help(): CommandResult {
    return {
      output: [
        { type: 'success', text: 'ShaanOS Command Reference' },
        { type: 'success', text: '========================' },
        { type: 'output', text: '' },
        { type: 'output', text: 'File System:' },
        { type: 'output', text: '  ls [options]     - List directory contents' },
        { type: 'output', text: '  cd <directory>   - Change directory' },
        { type: 'output', text: '  pwd              - Print working directory' },
        { type: 'output', text: '  cat <file>       - Display file contents' },
        { type: 'output', text: '' },
        { type: 'output', text: 'System Information:' },
        { type: 'output', text: '  neofetch         - System information with ASCII art' },
        { type: 'output', text: '  whoami           - Current user' },
        { type: 'output', text: '  uname            - System information' },
        { type: 'output', text: '  date             - Current date and time' },
        { type: 'output', text: '  uptime           - System uptime' },
        { type: 'output', text: '  ps               - Running processes' },
        { type: 'output', text: '  top              - System monitor' },
        { type: 'output', text: '  free             - Memory usage' },
        { type: 'output', text: '  df               - Disk usage' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Portfolio:' },
        { type: 'output', text: '  portfolio        - Explore my projects' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Games:' },
        { type: 'output', text: '  games            - List available games' },
        { type: 'output', text: '  snake            - Play Snake' },
        { type: 'output', text: '  tetris           - Play Tetris' },
        { type: 'output', text: '  invaders         - Play Space Invaders' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Customization:' },
        { type: 'output', text: '  theme <name>     - Change theme (matrix/amber/cyan)' },
        { type: 'output', text: '  sound on/off     - Toggle sound effects' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Easter Eggs:' },
        { type: 'output', text: '  matrix           - Enter the Matrix' },
        { type: 'output', text: '  konami           - Unlock special features' },
        { type: 'output', text: '  hack --advanced  - Advanced hacker mode' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Utilities:' },
        { type: 'output', text: '  clear            - Clear terminal' },
        { type: 'output', text: '  history          - Command history' },
        { type: 'output', text: '  echo <text>      - Display text' },
        { type: 'output', text: '  exit             - Exit ShaanOS' }
      ]
    };
  }

  private ls(args: string[], currentDirectory: string): CommandResult {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
    
    const files = this.fileSystem.listDirectory(currentDirectory);
    
    if (files.length === 0) {
      return { output: [{ type: 'output', text: 'Directory is empty' }] };
    }

    const output: Array<{ type: 'output' | 'error' | 'success'; text: string }> = [];

    if (longFormat) {
      output.push({ type: 'output', text: 'total ' + files.length });
    }

    for (const file of files) {
      if (!showAll && file.name.startsWith('.')) continue;

      if (longFormat) {
        const permissions = file.permissions || '-rw-r--r--';
        const size = file.size || 0;
        const date = file.modified?.toLocaleDateString() || new Date().toLocaleDateString();
        const time = file.modified?.toLocaleTimeString() || new Date().toLocaleTimeString();
        
        output.push({
          type: 'output',
          text: `${permissions} 1 shaan shaan ${size.toString().padStart(8)} ${date} ${time} ${file.name}`
        });
      } else {
        const prefix = file.type === 'directory' ? '📁 ' : 
                      file.executable ? '🎮 ' : '📄 ';
        output.push({
          type: 'output',
          text: prefix + file.name
        });
      }
    }

    return { output };
  }

  private cd(args: string[], context: CommandContext): CommandResult {
    if (args.length === 0) {
      return {
        output: [],
        newDirectory: '/home/shaan'
      };
    }

    const targetPath = this.fileSystem.resolvePath(context.currentDirectory, args[0]);
    
    if (!this.fileSystem.exists(targetPath)) {
      return {
        output: [{ type: 'error', text: `cd: ${args[0]}: No such file or directory` }]
      };
    }

    if (!this.fileSystem.isDirectory(targetPath)) {
      return {
        output: [{ type: 'error', text: `cd: ${args[0]}: Not a directory` }]
      };
    }

    return {
      output: [],
      newDirectory: targetPath
    };
  }

  private pwd(currentDirectory: string): CommandResult {
    return {
      output: [{ type: 'output', text: currentDirectory }]
    };
  }

  private cat(args: string[], currentDirectory: string): CommandResult {
    if (args.length === 0) {
      return {
        output: [{ type: 'error', text: 'cat: missing file operand' }]
      };
    }

    const filePath = this.fileSystem.resolvePath(currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);

    if (content === null) {
      return {
        output: [{ type: 'error', text: `cat: ${args[0]}: No such file or directory` }]
      };
    }

    const lines = content.split('\n');
    return {
      output: lines.map(line => ({ type: 'output' as const, text: line }))
    };
  }

  private clear(): CommandResult {
    return { output: [{ type: 'output', text: '\x1b[2J\x1b[H' }] };
  }

  private neofetch(): CommandResult {
    // Just print the ASCII art file, line by line
    const neofetchArt = String.raw`
OS: ShaanOS 2.1.0                  
Host: Portfolio Terminal         
Kernel: 6.5.0-shaan                 
Uptime: 42 days                     
Packages: 1337 (npm)                
Shell: zsh 5.9                      
CPU: Intel i9-13900K (32) @ 3.0GHz
GPU: NVIDIA RTX 4090
Memory: 6847MiB / 32768MiB
Theme: Matrix [GTK3]
Terminal: ShaanOS Terminal
`;
    return {
      output: neofetchArt.split('\n').map(line => ({ type: 'success', text: line }))
    };
  }

  private portfolio(): CommandResult {
    return {
      output: [
        { type: 'success', text: '🚀 Shaan\'s Project Portfolio' },
        { type: 'success', text: '============================' },
        { type: 'output', text: '' },
        { type: 'output', text: '1. ShaanOS - Custom x86 Operating System' },
        { type: 'output', text: '   📁 /projects/shaanos' },
        { type: 'output', text: '   🔗 https://github.com/101shaan/ShaanOS' },
        { type: 'output', text: '   💡 Real OS with memory management, interrupts, file system' },
        { type: 'output', text: '' },
        { type: 'output', text: '2. CivSim - Civilization Simulator' },
        { type: 'output', text: '   📁 /projects/civsim' },
        { type: 'output', text: '   🔗 https://github.com/101shaan/CIVSIM' },
        { type: 'output', text: '   💡 AI-powered civilization simulation with OpenAI integration' },
        { type: 'output', text: '' },
        { type: 'output', text: '3. Daily Glitch - Mystery Story Platform' },
        { type: 'output', text: '   📁 /projects/dailyglitch' },
        { type: 'output', text: '   🔗 https://github.com/101shaan/DailyGlitch' },
        { type: 'output', text: '   🌐 https://dailyglitch.org' },
        { type: 'output', text: '   💡 Full-stack web platform with React, Next.js, Supabase' },
        { type: 'output', text: '' },
        { type: 'output', text: '4. Ardenvale RPG - Dark Souls Text RPG' },
        { type: 'output', text: '   📁 /projects/ardenvale' },
        { type: 'output', text: '   🔗 https://github.com/101shaan/Arvendale' },
        { type: 'output', text: '   💡 Complex text-based RPG with 15+ locations and deep mechanics' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Use "cd /projects/<name>" to explore each project!' }
      ]
    };
  }

  private games(): CommandResult {
    return {
      output: [
        { type: 'success', text: '🎮 Available Games' },
        { type: 'success', text: '=================' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Classic Arcade:' },
        { type: 'output', text: '  snake     - Classic Snake game with smooth controls' },
        { type: 'output', text: '  tetris    - Full-featured Tetris with proper rotation' },
        { type: 'output', text: '  invaders  - Space Invaders with retro sound effects' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Coming Soon:' },
        { type: 'output', text: '  pong      - Two-player Pong' },
        { type: 'output', text: '  breakout  - Ball and paddle game' },
        { type: 'output', text: '  pacman    - Maze navigation game' },
        { type: 'output', text: '  chess     - Full chess implementation' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Type the game name to start playing!' },
        { type: 'output', text: 'Press ESC during any game to return to terminal.' }
      ]
    };
  }

  private theme(args: string[], context: CommandContext): CommandResult {
    if (args.length === 0) {
      return {
        output: [
          { type: 'output', text: `Current theme: ${context.theme}` },
          { type: 'output', text: 'Available themes: matrix, amber, cyan' },
          { type: 'output', text: 'Usage: theme <name>' }
        ]
      };
    }

    const newTheme = args[0].toLowerCase();
    if (['matrix', 'amber', 'cyan'].includes(newTheme)) {
      context.onThemeChange(newTheme);
      return {
        output: [{ type: 'success', text: `Theme changed to: ${newTheme}` }]
      };
    }

    return {
      output: [{ type: 'error', text: `Unknown theme: ${args[0]}` }]
    };
  }

  private sound(args: string[], context: CommandContext): CommandResult {
    if (args.length === 0) {
      return {
        output: [
          { type: 'output', text: `Sound: ${context.soundEnabled ? 'enabled' : 'disabled'}` },
          { type: 'output', text: 'Usage: sound on|off' }
        ]
      };
    }

    const setting = args[0].toLowerCase();
    if (setting === 'on' || setting === 'enable') {
      context.onSoundToggle(true);
      return {
        output: [{ type: 'success', text: 'Sound enabled' }]
      };
    } else if (setting === 'off' || setting === 'disable') {
      context.onSoundToggle(false);
      return {
        output: [{ type: 'success', text: 'Sound disabled' }]
      };
    }

    return {
      output: [{ type: 'error', text: 'Usage: sound on|off' }]
    };
  }

  private matrix(): CommandResult {
    return {
      output: [
        { type: 'success', text: 'Wake up, Neo...' },
        { type: 'success', text: 'The Matrix has you...' },
        { type: 'success', text: 'Follow the white rabbit.' },
        { type: 'output', text: '' },
        { type: 'output', text: '01001000 01100101 01101100 01101100 01101111' },
        { type: 'output', text: '01010111 01101111 01110010 01101100 01100100' },
        { type: 'output', text: '' },
        { type: 'success', text: 'Matrix mode activated! Theme changed to matrix.' }
      ]
    };
  }

  private konami(): CommandResult {
    return {
      output: [
        { type: 'success', text: '🎉 KONAMI CODE ACTIVATED! 🎉' },
        { type: 'output', text: '' },
        { type: 'output', text: 'Special features unlocked:' },
        { type: 'output', text: '  - God mode in games' },
        { type: 'output', text: '  - Hidden commands revealed' },
        { type: 'output', text: '  - Secret directories accessible' },
        { type: 'output', text: '  - Developer commentary enabled' },
        { type: 'output', text: '' },
        { type: 'success', text: 'You are now a ShaanOS power user!' }
      ]
    };
  }

  private hack(args: string[]): CommandResult {
    if (args.includes('--advanced')) {
      return {
        output: [
          { type: 'success', text: '🔓 ADVANCED HACKER MODE ACTIVATED' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Bypassing security protocols...' },
          { type: 'output', text: 'Accessing root privileges...' },
          { type: 'output', text: 'Decrypting hidden files...' },
          { type: 'output', text: '' },
          { type: 'success', text: 'Welcome to the inner sanctum.' },
          { type: 'output', text: 'Try: ls -la ~/.secrets' }
        ]
      };
    }

    return {
      output: [
        { type: 'output', text: 'Initiating hack sequence...' },
        { type: 'output', text: 'Scanning for vulnerabilities...' },
        { type: 'output', text: 'Found 0 vulnerabilities (this system is secure!)' },
        { type: 'output', text: '' },
        { type: 'success', text: 'Hack complete! You\'re already in the system.' }
      ]
    };
  }

  private whoami(): CommandResult {
    return {
      output: [{ type: 'output', text: 'shaan' }]
    };
  }

  private uname(args: string[]): CommandResult {
    if (args.includes('-a')) {
      return {
        output: [{ 
          type: 'output', 
          text: 'ShaanOS portfolio 2.1.0-retro #1 SMP PREEMPT_DYNAMIC Mon Jan 1 00:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux' 
        }]
      };
    }
    return {
      output: [{ type: 'output', text: 'ShaanOS' }]
    };
  }

  private date(): CommandResult {
    return {
      output: [{ type: 'output', text: new Date().toString() }]
    };
  }

  private uptime(): CommandResult {
    const uptime = Math.floor(Math.random() * 100);
    return {
      output: [{ 
        type: 'output', 
        text: `up ${uptime} days, ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}, 1 user, load average: 0.${Math.floor(Math.random() * 99)}, 0.${Math.floor(Math.random() * 99)}, 0.${Math.floor(Math.random() * 99)}` 
      }]
    };
  }

  private ps(): CommandResult {
    return {
      output: [
        { type: 'output', text: '  PID TTY          TIME CMD' },
        { type: 'output', text: ' 1337 pts/0    00:00:01 zsh' },
        { type: 'output', text: ' 1338 pts/0    00:00:00 shaanos' },
        { type: 'output', text: ' 1339 pts/0    00:00:00 portfolio' },
        { type: 'output', text: ' 1340 pts/0    00:00:00 ps' }
      ]
    };
  }

  private top(): CommandResult {
    return {
      output: [
        { type: 'output', text: 'top - ' + new Date().toLocaleTimeString() + ' up 42 days, 13:37, 1 user, load average: 0.42, 0.13, 0.37' },
        { type: 'output', text: 'Tasks: 4 total, 1 running, 3 sleeping, 0 stopped, 0 zombie' },
        { type: 'output', text: '%Cpu(s): 1.3 us, 0.7 sy, 0.0 ni, 98.0 id, 0.0 wa, 0.0 hi, 0.0 si, 0.0 st' },
        { type: 'output', text: 'MiB Mem : 32768.0 total, 16384.0 free, 8192.0 used, 8192.0 buff/cache' },
        { type: 'output', text: 'MiB Swap: 0.0 total, 0.0 free, 0.0 used. 24576.0 avail Mem' },
        { type: 'output', text: '' },
        { type: 'output', text: '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND' },
        { type: 'output', text: ' 1337 shaan     20   0  123456   4096   2048 S   1.3   0.0   0:01.23 shaanos' },
        { type: 'output', text: ' 1338 shaan     20   0   98765   3072   1536 S   0.7   0.0   0:00.45 portfolio' }
      ]
    };
  }

  private free(): CommandResult {
    return {
      output: [
        { type: 'output', text: '               total        used        free      shared  buff/cache   available' },
        { type: 'output', text: 'Mem:        33554432     8388608    16777216           0     8388608    25165824' },
        { type: 'output', text: 'Swap:              0           0           0' }
      ]
    };
  }

  private df(): CommandResult {
    return {
      output: [
        { type: 'output', text: 'Filesystem     1K-blocks    Used Available Use% Mounted on' },
        { type: 'output', text: '/dev/sda1       2097152  524288   1572864  25% /' },
        { type: 'output', text: 'tmpfs           1048576       0   1048576   0% /tmp' },
        { type: 'output', text: '/dev/sda2       4194304 1048576   3145728  25% /home' }
      ]
    };
  }

  private history(): CommandResult {
    return {
      output: [
        { type: 'output', text: '    1  ls' },
        { type: 'output', text: '    2  cd /projects' },
        { type: 'output', text: '    3  cat README.md' },
        { type: 'output', text: '    4  neofetch' },
        { type: 'output', text: '    5  games' },
        { type: 'output', text: '    6  portfolio' },
        { type: 'output', text: '    7  help' },
        { type: 'output', text: '    8  history' }
      ]
    };
  }

  private echo(args: string[]): CommandResult {
    return {
      output: [{ type: 'output', text: args.join(' ') }]
    };
  }
}