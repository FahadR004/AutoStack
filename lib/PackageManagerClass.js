
import { execSync } from 'node:child_process';
import { platform } from 'os';

class PackageManagerCommands {
  constructor(manager) {
    this.manager = manager;
    this.isWindows = platform() === 'win32';
  }

  init() {
    const commands = {
      npm: 'npm init -y',
      yarn: 'yarn init -y',
      pnpm: 'pnpm init',
      bun: 'bun init -y',
      pip: null, // No init needed for Python
      deno: 'deno init'
    };
    return commands[this.manager];
  }

  install(packages = [], dev = false) {
    // Install all dependencies from lock file
    if (packages.length === 0) {
      const commands = {
        npm: 'npm install',
        yarn: 'yarn install',
        pnpm: 'pnpm install',
        bun: 'bun install',
        pip: `${this.getVenvPip()} install -r requirements.txt`,
        deno: null
      };
      return commands[this.manager];
    }

    // Install specific packages
    const pkgString = packages.join(' ');
    
    switch (this.manager) {
      case 'npm':
        return `npm install ${dev ? '-D ' : ''}${pkgString}`;
      
      case 'yarn':
        return `yarn add ${dev ? '-D ' : ''}${pkgString}`;
      
      case 'pnpm':
        return `pnpm add ${dev ? '-D ' : ''}${pkgString}`;
      
      case 'bun':
        return `bun add ${dev ? '-d ' : ''}${pkgString}`;
      
      case 'pip':
        return `${this.getVenvPip()} install ${pkgString}`;
      
      case 'deno':
        return null; // Deno imports via URLs
      
      default:
        throw new Error(`Unknown package manager: ${this.manager}`);
    }
  }

  run(script) {
    const commands = {
      npm: `npm run ${script}`,
      yarn: `yarn ${script}`,
      pnpm: `pnpm ${script}`,
      bun: `bun ${script}`,
      pip: `${this.getVenvPython()} ${script}`,
      deno: `deno task ${script}`
    };
    return commands[this.manager];
  }

  execute(command) {
    const commands = {
      npm: `npx ${command}`,
      yarn: `yarn dlx ${command}`,
      pnpm: `pnpm dlx ${command}`,
      bun: `bunx ${command}`,
      pip: null,
      deno: `deno run ${command}`
    };
    return commands[this.manager];
  }

  create(template) {
    const commands = {
      npm: `npm create vite@latest ${template}`,
      yarn: `yarn create vite ${template}`,
      pnpm: `pnpm create vite ${template}`,
      bun: `bun create vite ${template}`,
      pip: this.createVirtualEnv(),
      deno: `deno init ${template}`
    };
    return commands[this.manager];
  }


  getPythonCommand() {
    const pythonCommands = ['python3', 'python', 'py'];
    
    for (const cmd of pythonCommands) {
      try {
        execSync(`${cmd} --version`, { stdio: 'ignore' });
        return cmd;
      } catch(error) {
        continue;
      }
    }
    
    throw new Error('Python not found. Please install Python 3.7+');
  }

  getPythonVersion() {
    try {
      const pythonCmd = this.getPythonCommand();
      const version = execSync(`${pythonCmd} --version`, { encoding: 'utf8' });
      const match = version.match(/Python (\d+)\.(\d+)/);
      
      if (match) {
        return {
          major: parseInt(match[1]),
          minor: parseInt(match[2]),
          full: `${match[1]}.${match[2]}`
        };
      }
    } catch (error) {
      throw new Error('Could not detect Python version');
    }
  }

  createVirtualEnv(venvName = '.venv') {
    const pythonCmd = this.getPythonCommand();
    const version = this.getPythonVersion();
    
    if (version.major >= 3 && version.minor >= 3) {
      return `${pythonCmd} -m venv ${venvName}`;
    }
    
    return `${pythonCmd} -m virtualenv ${venvName}`;
  }

  // Get path to venv's Python executable
  getVenvPython(venvName = '.venv') {
    return this.isWindows
      ? `${venvName}\\Scripts\\python.exe`
      : `${venvName}/bin/python`;
  }

  // Get path to venv's pip executable
  getVenvPip(venvName = '.venv') {
    return this.isWindows
      ? `${venvName}\\Scripts\\pip.exe`
      : `${venvName}/bin/pip`;
  }

  // Not required due to requirements.txt in templates. Simply installing
  // freezeRequirements(venvName = '.venv') {
  //   if (this.manager !== 'pip') {
  //     throw new Error('freezeRequirements is only for Python (pip)');
  //   }

  //   const pip = this.getVenvPip(venvName);
  //   return `${pip} freeze > requirements.txt`;
  // }

  getActivationInstructions(venvName = '.venv') {
    if (this.isWindows) {
      return {
        gitBash: `source ${venvName}/Scripts/activate`,
        cmd: `${venvName}\\Scripts\\activate.bat`,
        powershell: `${venvName}\\Scripts\\Activate.ps1`
      };
    } else {
      return {
        bash: `source ${venvName}/bin/activate`
      };
    }
  }
}

export default PackageManagerCommands;