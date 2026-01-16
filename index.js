#!/usr/bin/env node

import * as fs from 'node:fs/promises'
import { createSpinner } from 'nanospinner';
import { execSync } from 'node:child_process';
import { exec } from 'node:child_process';
import {  readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import colors from 'picocolors';
import * as prompts from '@clack/prompts';
import mri from 'mri';
import figlet from 'figlet'
import { promisify } from 'node:util';
import { platform } from 'os';

const { 
  yellow,
  blue, 
  red,
  green, 
  white,
  magenta,
  cyan,
  whiteBright,
  greenBright,
  blueBright,
  redBright,
  dim,
  italic
} = colors

const BKEND_FRAMEWORKS = {
  "NODEJS": {
    "COLOR": green
  }, 
  "FLASK": {
    "COLOR": red
  },
  "FASTAPI": {
    "COLOR": blue
  }
}

const FRONTEND_FRAMEWORKS = {
  "VANILLA": {
    "COLOR": yellow,
    "CSS_FILE": "style.css", // No default CSS file created
  },
  "VUE": {
    "COLOR": green,
    "CSS_FILE": "style.css", // Typically in src/assets/ or src/
  },
  "REACT": {
    "COLOR": cyan,
    "CSS_FILE": "index.css", // In src/ directory
  },
  "REACT-SWC": {
    "COLOR": cyan,
    "CSS_FILE": "index.css", // Same as React
  },
  "PREACT": {
    "COLOR": magenta,
    "CSS_FILE": "style.css", // In src/ directory
  },
  // "LIT": {
  //   "COLOR": redBright,
  //   "CSS_FILE": null, // No external CSS - uses CSS-in-JS
  //   // "TAILWIND_SETUP": "Install @lit/tailwindcss, use in component styles property"
  // },
  // "SVELTE": {
  //   "COLOR": red,
  //   "CSS_FILE": "app.css", // In src/ directory
  //   // "TAILWIND_SETUP": "Add @import to app.css, install @sveltejs/add-postcss"
  // },
  // "SOLID": {
  //   "COLOR": blue,
  //   "CSS_FILE": "index.css", // In src/ directory
  //   // "TAILWIND_SETUP": "Add @import to index.css, configure tailwind.config.js"
  // },
  // "QWIK": {
  //   "COLOR": blueBright,
  //   "CSS_FILE": "global.css", // In src/ directory
  //   // "TAILWIND_SETUP": "Add @import to global.css, configure tailwind.config.js"
  //}
}
const DATABASES = {
    "MONGODB" : {
      "COLOR": green
    },
    "MYSQL": {
      "COLOR": yellow
    },
    "POSTGRESQL" : {
      "COLOR": blue
    }
}

const PACKAGE_MANAGERS = {
  "npm": {
    "COLOR": red
  },
  "yarn": {
    "COLOR": blue
  },
  "pnpm": {
    "COLOR": yellow
  },
  "bun": {
    "COLOR": white
  },
  "deno": {
    "COLOR": green
  }, 
   "pip" : {
     "COLOR": magenta
   }
}

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
const TEMPLATES_DIR = join(_dirname, '../templates');
// const templatePath = join(TEMPLATES_DIR, stack, 'backend/server.js');
// const destPath = join(PROJECT_PATH, 'backend/server.js');

let PROJECT_NAME;
let PROJECT_PATH;
let FRONTEND;
let DATABASE;
let BACKEND;
let PKG_MGR;
let ENV_CHOICE;
let isTerminating;
let CWD = process.cwd();

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
      pip: null, // No need for init in python. We create venv.
      deno: 'deno init'
    };
    return commands[this.manager];
  }

  install(packages = [], dev = false) {
    if (packages.length === 0) {
      const commands = {
        npm: 'npm install',
        yarn: 'yarn install',
        pnpm: 'pnpm install',
        bun: 'bun install',
        pip: 'pip install -r requirements.txt', // Not really needed for our use-case yet
        deno: null 
      };
      return commands[this.manager];
    }

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
        return `pip install ${pkgString}`; // No dev dependencies in pip
      
      case 'deno':
        return null; // Deno doesn't install packages, imports via URLs
      
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
      pip: this.getPythonRunCommand(script),
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
      pip: null, // No equivalent
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
      deno: `deno init --npm vite ${template}`
    };
    return commands[this.manager];
  }

   getPythonCommand() {
      const pythonCommands = ['python3', 'python', 'py'];
      for (const cmd of pythonCommands) {
        try {
          execSync(`${cmd} --version`, { stdio: 'ignore' });
          return cmd;
        } catch {
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

    getPythonRunCommand(script) {
      const pythonCmd = this.getPythonCommand();
      if (this.isWindows) {
        return `.venv\\Scripts\\activate && ${pythonCmd} ${script}`;
      } else {
        return `source .venv/bin/activate && ${pythonCmd} ${script}`;
      }
    }

  // Create Python virtual environment (handles all cases)
  createVirtualEnv(venvName = '.venv') {
    const pythonCmd = this.getPythonCommand();
    const version = this.getPythonVersion();
    
    // Python 3.3+ has venv built-in
    if (version.major >= 3 && version.minor >= 3) {
      return `${pythonCmd} -m venv ${venvName}`;
    }
    
    // Older Python versions (fallback to virtualenv)
    // User needs to have virtualenv installed
    return `${pythonCmd} -m virtualenv ${venvName}`;
  }

  // Activate virtual environment command
  activateVenv(venvName = '.venv') {
    if (this.manager !== 'pip') {
      throw new Error('activateVenv is only for Python (pip)');
    }

    if (this.isWindows) {
      // Windows: multiple possible paths
      return [
        `${venvName}\\Scripts\\activate.bat`,      // cmd.exe
        `${venvName}\\Scripts\\Activate.ps1`,      // PowerShell
        `${venvName}\\Scripts\\activate`           // Git Bash
      ];
    } else {
      // Unix/Linux/Mac
      return [`source ${venvName}/bin/activate`];
    }
  }

  // Get activation command as string
  getActivateCommand(venvName = '.venv') {
    const commands = this.activateVenv(venvName);
    
    if (this.isWindows) {
      // Try to detect shell
      const shell = process.env.SHELL || process.env.ComSpec || '';
      
      if (shell.includes('powershell') || shell.includes('pwsh')) {
        return commands[1]; // PowerShell
      } else if (shell.includes('bash')) {
        return commands[2]; // Git Bash
      } else {
        return commands[0]; // cmd.exe (default)
      }
    } else {
      return commands[0]; // Unix
    }
  }

  // Install packages with venv activated
  installWithVenv(packages = [], venvName = '.venv') {
    if (this.manager !== 'pip') {
      throw new Error('installWithVenv is only for Python (pip)');
    }

    const activateCmd = this.getActivateCommand(venvName);
    const installCmd = this.install(packages);
    
    // Chain commands
    if (this.isWindows) {
      return `${activateCmd} && ${installCmd}`;
    } else {
      return `${activateCmd} && ${installCmd}`;
    }
  }

  // Freeze requirements (pip freeze > requirements.txt)
  freezeRequirements(venvName = '.venv') {
    if (this.manager !== 'pip') {
      throw new Error('freezeRequirements is only for Python (pip)');
    }

    const activateCmd = this.getActivateCommand(venvName);
    
    if (this.isWindows) {
      return `${activateCmd} && pip freeze > requirements.txt`;
    } else {
      return `${activateCmd} && pip freeze > requirements.txt`;
    }
  }
}

const terminate = async () => { // To be checked
    if (isTerminating) return; 
    isTerminating = true;

    if (PROJECT_PATH === undefined) return;

    console.log(yellow('\n\n⚠️  Installation interrupted!'));
    console.log(dim('Removing partial installation...'));
     if (PROJECT_NAME && existsSync(join(CWD, PROJECT_PATH))) {
        if (PROJECT_PATH === '') { // Empty strings
          await fs.rm(join(CWD, 'frontend'), { recursive: true, force: true });
          await fs.rm(join(CWD, 'backend'), { recursive: true, force: true });
        } else {
          await fs.rm(join(CWD, PROJECT_NAME), { recursive: true, force: true }); 
        }
        console.log(green('Cleaned up partial installation'));
      }

    console.log(whiteBright('\nGoodbye!\n'));
    process.exit(0);
}

process.on('SIGINT', terminate); // CTRL + C

process.on('SIGTERM', terminate); // Other termination signals 

// process.on('uncaughtException', (error) => {
//   console.error('\nUnexpected error:', error.message);
//   terminate();
// });

const isValidProjectName = (name) => {
  // Allows: letters, numbers, hyphens, underscores, dots
  // No spaces, no special chars, no starting with dot (except '.')
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$|^\.$/;
  return regex.test(name);
};

const checkEmptyDir = (path) => {
  try {
    const files = readdirSync(path);
    const visibleFiles = files.filter(f => !f.startsWith('.'));
    return visibleFiles.length === 0;
  } catch {
    return true; // Directory doesn't exist = "empty"
  }
}

const createFile = async (destPath, content, format = 'utf8') => {
  try {
      await writeFile(destPath, content, format)
  } catch (error) {
      console.error('Error creating file: ', error);
      terminate();
  }
}

const readAFile = async (name) => {
  try {
    const data = await readFile(name);
    return data;
  } catch(error) {
    console.log("Unable to read file. Installation Stopped");
    terminate()
  }
} 

const copyFile = async (srcPath, destPath, modify=false, modificationFn=null) => {
    const data = await readAFile(srcPath);
    if (modify) {
      const modifiedData = modificationFn(data);
      await writeFile(destPath, modifiedData);
      return;
    }
    await writeFile(destPath, data);
}

const copyDirectory = async (src, dest) => {
  await fs.cp(src, dest, { recursive: true });
};

const installPackages = async (packageName, installationPath) => {
  const spinner = createSpinner(`Installing ${packageName}...`).start();
  return new Promise((resolve, reject) => {
    exec(`npm install ${packageName}`, { cwd: installationPath }, (error, stdout) => {
      if (error) {
        spinner.error({ text: `Failed to install ${packageName}` });
        reject(error);
      } else {
        spinner.success({ text: `${packageName} installed successfully!` });
        resolve(stdout);
      }
    });
  });
}

async function runCommand(command, cwd, loadingDesc, successDesc, errorDesc) {
  const execPromise = promisify(exec);
  const spinner = createSpinner(loadingDesc).start();
  try {
    // Use an explicit, reliable shell. On Windows prefer the COMSPEC or PowerShell,
    // otherwise use /bin/sh. This avoids spawn ENOENT when cmd.exe path is unavailable.
    const isWin = platform() === 'win32';
    const shell = isWin ? (process.env.ComSpec || 'powershell.exe') : '/bin/sh';
    await execPromise(command, { cwd: cwd, shell });
    spinner.success({ text: `${successDesc} ✓` });
  } catch (error) {
    spinner.error({ text: `${errorDesc} ✗` });
    throw error;
  }
}

const dbConfigurations = async () => {
   
    if (ENV_CHOICE === 'Yes') {
      switch (DATABASE) {
        case 'MONGODB':
          const connStr = await prompts.password({
            message: 'Please enter your MongoDB connection string: '
          })
          createFile(`.${PROJECT_PATH}/backend/src/.env`, `PORT=5000\nMONGO_URI=${connStr}`)
          return 'mongoose'
        
        case 'MYSQL':
          const mysqlUser = await prompts.password({
            message: 'Please enter your MySQL username: '
          })
          const mysqlPass = await prompts.password({
            message: 'Please enter your MySQL password: '
          })
          const mysqlHost = await prompts.password({
            message: 'Please enter your MySQL host: '
          })
          createFile(`.${PROJECT_PATH}/backend/src/.env`, `PORT=5000\nUSER=${mysqlUser}\nPASSWORD=${mysqlPass}\nHOST=${mysqlHost}`)
          return 'mysql2';
      
        case 'POSTGRESQL':
          const postgresUser = await prompts.password({
            message: 'Please enter your PostgreSQL username: '
          })
          const postgresPass = await prompts.password({
            message: 'Please enter your PostgreSQL password: '
          })
          const postgresHost = await prompts.password({
            message: 'Please enter your PostgreSQL host: '
          })
          createFile(`.${PROJECT_PATH}/backend/src/.env`, `PORT=5000\nUSER=${postgresUser}\nPASSWORD=${postgresPass}\nHOST=${postgresHost}`)
          return // POSTGRESQL Lib
      }
    } else {
      console.log("Okay, environment variables have not been set. The file will be created and you can edit accordingly..");
      createFile(`.${PROJECT_PATH}/backend/src/.env`, '');
    }
}

const cancel = () => {
    terminate();
}

// Backend Creation
const createBackend = async () => {
  try {   
    switch (BACKEND) {
      case 'NODEJS':
        // 4. Create Main Folder
        await mkdir(`.${PROJECT_PATH}/backend/src`, { recursive: true });
       
        // 5. Initialize Backend
        console.log(whiteBright("\nINITIALIZING BACKEND...\n"))
        execSync(PKG_MGR.init(), { cwd: `.${PROJECT_PATH}/backend`});

        // 6. Ask user for environment variables selection
        ENV_CHOICE = await prompts.select({
          message: `Do you want to configure your environment variables right now? (recommended):
          Or do it later?`,
          options: [
            {label: "Yes (Do it now)", value: "Yes"},
            {label: "No (I'll do it later)", value: "No"}
          ],
        })
        if (prompts.isCancel(ENV_CHOICE)) return cancel() 

        const dbPkg = await dbConfigurations(); 
        
        // 7. Copy Template Directory and Other Files        
        const backendPath = `.${PROJECT_PATH}/backend/src`;
        
        const spinner = createSpinner(whiteBright("COPYING TEMPLATE DIRECTORY AND ITS CONTENTS...\n")).start();
        await copyDirectory(`./templates/${BACKEND}/${DATABASE}`, backendPath);
        await copyDirectory(`./templates/${BACKEND}/common`, backendPath);          
        spinner.success({ text: 'COPIED TEMPLATE DIRECTORY!' });
      
        copyFile( // For package.json
          `.${PROJECT_PATH}/backend/package.json`, 
          `.${PROJECT_PATH}/backend/package.json`, 
            true, 
            (data) => { // The modificationFn
              const jsonObject = JSON.parse(data);
              jsonObject['type'] = 'module';
              jsonObject['scripts'] = {
                'dev': 'nodemon server.js',
                'start': 'node server.js'
              }
              return JSON.stringify(jsonObject, null, 4); // 4 is for indentation whereas null is for the replacer fn which we don't require  
        });  
        
        await installPackages(`express ${dbPkg} dotenv nodemon redis`, `.${PROJECT_PATH}/backend`);
        console.log(greenBright("\nBACKEND CREATED!"));
      break;

      case 'FLASK':
         // 4. Create Main Folder
         await mkdir(`.${PROJECT_PATH}/backend`, { recursive: true });

         // 5. Create virtual environment 
         PKG_MGR.createVirtualEnv('.venv');

         // 6. Activate virtual environment
         PKG_MGR.activateVenv('.venv')

         // 7. Ask if user wants to configure .env file. If yes, configure. Else, create with default values.

         // 8. Copy template directory with it's contents based on selected database

         // 8. Install relevant packages 
         
       
      break;
      case 'FASTAPI':
         // 4. Create Main Folder
         await mkdir(`.${PROJECT_PATH}/backend`, { recursive: true });

         // 5. Create virtual environment 
          PKG_MGR.createVirtualEnv('.venv');

         // 6. Activate virtual environment

         // 7. Ask if user wants to configure .env file. If yes, configure. Else, create with default values.

         // 8. Copy template directory with it's contents based on selected database

         // 8. Install relevant packages 

      break;
    }
  } catch(err) {
    console.error("Unable to create backend folder", err);
    terminate();
  }
}

const createFrontend = async () => {
  if (isTerminating) return;
  console.log(whiteBright("\nCREATING FRONTEND"))

  const baseTech = await prompts.select({
      message: 'Please pick a frontend framework:',
      options: Object.keys(FRONTEND_FRAMEWORKS).map((name) => {
       const color = FRONTEND_FRAMEWORKS[`${name}`]['COLOR'];
       return { 
        label: color(name), value: name, 
      }
      }),
    })
  if (prompts.isCancel(baseTech)) return cancel();

  const tsOption = await prompts.select({
    message: `Use TypeScript?`,
    options: [
      {label: 'Yes', value: 'Yes'},
      {label: 'No', value: 'No'}
    ]
  })
  
  FRONTEND = tsOption === 'Yes' ? (baseTech.toLowerCase() + '-ts') : baseTech.toLowerCase();
  console.log(FRONTEND, "FAHAD");

  const cmd = PKG_MGR.create(`frontend ${PKG_MGR.manager === 'npm' ? '--' : ''} --template ${FRONTEND}`);
  await runCommand(cmd, `.${PROJECT_PATH}`, 'Creating frontend folder with Vite..', 'Successfully created frontend folder', 'Error creating frontend folder')
  
  console.log(whiteBright("CONFIGURING TAILWINDCSS"));
  await runCommand(PKG_MGR.install(['tailwindcss', '@tailwindcss/vite']), `.${PROJECT_PATH}/frontend`, 'Installing tailwindcss..', 'Successfully installed tailwindcss with vite', 'Error installing tailwindcss')
  
  const fileName = FRONTEND_TECHNOLOGIES[baseTech];
  if (!fileName) {

  }
  createFile(`.${PROJECT_PATH}/frontend/src/${fileName}`, '@import "tailwindcss"');

}

const start = async () => { // Main function
  console.log(
    (greenBright(figlet.textSync('AUTOSTACK', { horizontalLayout: 'full' }))
  ));
  console.log(whiteBright(italic('--- An NPM package designed to automate the setup of your full-stack projects ---'))); 
  console.log(`
${blueBright('---------------------------- Supported Technologies ---------------------------\n')}
╔═════════════════════════╦═════════════════════════╦═════════════════════════╗
║        FRONTEND         ║         BACKEND         ║        DATABASE         ║
╠═════════════════════════╬═════════════════════════╬═════════════════════════╣
║         Vanilla         ║         Node.js         ║        MongoDB          ║
║           Vue           ║          Flask          ║       PostgreSQL        ║
║          React          ║         FastAPI         ║         MySQL           ║
║        React-SWC        ║                         ║                         ║
║         Preact          ║                         ║                         ║
║           Lit           ║                         ║                         ║
║         Svelte          ║                         ║                         ║
║          Solid          ║                         ║                         ║
║          Qwik           ║                         ║                         ║
╚═════════════════════════╩═════════════════════════╩═════════════════════════╝
   `);

  // 1. Ask Project Name 
  PROJECT_NAME = await prompts.text({
      message: 'Please enter project name:',
      placeholder: '.',
      defaultValue: '.',
      validate: (value) => {
        if (!value) return 'Project name is required';
        if (value === '.') {
          const currentDirPath = CWD;
          if (!checkEmptyDir(currentDirPath)) {
             return 'Current directory is not empty. Please use an empty directory.'
          }
          return;
        } 
        if (!isValidProjectName(value)) {  
          return 'Invalid name. Use letters, numbers, hyphens, underscores only';
        }
        if (existsSync(join(CWD, value))) {  // Relative to user dir
          return "A directory with this name already exists. Please choose a different name."
        }
      }
  });
  if (prompts.isCancel(PROJECT_NAME)) return cancel()

  if (PROJECT_NAME !== '.') { 
      await mkdir(`./${PROJECT_NAME}`);
      PROJECT_PATH = '/' + PROJECT_NAME;
  } else { // Means project_name is '.' i.e. need to create in cwd
    PROJECT_PATH = '';
  } 

   // 2. Ask For Backend Technology
   BACKEND = await prompts.select({
      message: 'Please pick a backend framework:',
      options: Object.keys(BKEND_FRAMEWORKS).map((name) => {
        const color = BKEND_FRAMEWORKS[`${name}`]['COLOR'];
        return { 
        label: color(name), value: name, 
      }
      }),
  })
  if (prompts.isCancel(BACKEND)) return cancel();

  // 3. Ask For Database 
  DATABASE = await prompts.select({
      message: 'Please select a database:',
      options: Object.keys(DATABASES).map((db) => {
       const color = DATABASES[`${db}`]['COLOR'];
       return { 
        label: color(db), value: db, 
      }
      })
    })
    if (prompts.isCancel(DATABASE)) return cancel(); 

  // 4. Ask For Package Manager
   const pkg_mgr = await prompts.select({
    message: 'Please select a package manager:',
    options: Object.keys(PACKAGE_MANAGERS).map((db) => {
      const color = PACKAGE_MANAGERS[`${db}`]['COLOR'];
      return { 
      label: color(db), value: db, 
    }}),
      validate: (value) => {
        if (value === "pip" && BACKEND === "NODEJS") {
          return 'pip cannot be used for installation of NodeJS. Please select a different package manager.';
        } else if (value !== "pip" && ['FLASK', 'FASTAPI'].includes(BACKEND)) {
          return `${value} cannot be used for installation of ${BACKEND}. Please select a different package manager.`;
        }
      }
    })
    if (prompts.isCancel(pkg_mgr)) return cancel();

    PKG_MGR = new PackageManagerCommands(pkg_mgr);
  
  // await createBackend();
  await createFrontend();
}

start();