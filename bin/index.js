#!/usr/bin/env node

import * as fs from 'node:fs/promises'
import { createSpinner } from 'nanospinner';
import { exec, execSync } from 'node:child_process';
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
import PackageManagerCommands from '../lib/PackageManagerClass.js';

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
  // "VANILLA": {
  //   "COLOR": yellow,
  //   "CSS_FILE": "style.css", // No default CSS file created
  // },
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
  // },
  "SVELTE": {
    "COLOR": red,
    "CSS_FILE": "app.css", // In src/ directory
  },
  "SOLID": {
    "COLOR": blue,
    "CSS_FILE": "App.css", // In src/ directory
  },
  // "QWIK": {
  //   "COLOR": blueBright,
  //   "CSS_FILE": "global.css", // In src/ directory
  //}
}
const DATABASES = {
    "MONGODB" : {
      "NODEJS_LIB": "mongoose", 
      "FLASK_LIB": "",
      "FASTAPI_LIB": "",
      "COLOR": green
    },
    "MYSQL": {
      "NODEJS_LIB": 'mysql2',
      "FLASK_LIB": "",
      "FASTAPI_LIB": "",
      "COLOR": yellow
    },
    "POSTGRESQL" : {
      "NODEJS_LIB": 'pg',
      "FLASK_LIB": "",
      "FASTAPI_LIB": "",
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '../templates');
const CWD = process.cwd();

// const templatePath = join(TEMPLATES_DIR, stack, 'backend/server.js');
// const destPath = join(PROJECT_PATH, 'backend/server.js');

let PROJECT_NAME;
let PROJECT_PATH;
let FRONTEND;
let DATABASE;
let BACKEND;
let PKG_MGR_BK;
let PKG_MGR_FD;
let ENV_CHOICE;
let isTerminating;

const terminate = async () => { // To be checked
    if (isTerminating) return; 
    isTerminating = true;

    if (PROJECT_PATH === undefined) return;

    console.log(dim('\nRemoving partial installation...'));
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

process.on('uncaughtException', (error) => {
  console.error('\nUnexpected error:', error.message);
  terminate();
});

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

const prependToFile = async (destPath, content) => {
  try {
    const existing = await readFile(destPath, 'utf8');
    await writeFile(destPath, content + '\n' + existing, 'utf8');
  } catch (error) {
    console.error('Error prepending to file:', error);
    terminate();
  }
};

const copyDirectory = async (src, dest) => {
  await fs.cp(src, dest, { recursive: true, force: true});
};

const runWithSpinner = async (description, asyncFn) => {
  const spinner = createSpinner(description).start();
  try {
    await asyncFn();
    spinner.success({ text: `${description}` });
  } catch (error) {
    spinner.error({ text: `${description}` });
    throw error;
  }
};

const dbConfigurations = async () => {
   
    if (ENV_CHOICE === 'Yes') {
      switch (DATABASE) {
        case 'MONGODB':
          const connStr = await prompts.password({
            message: 'Please enter your MongoDB connection string: '
          })
          createFile(`.${PROJECT_PATH}/backend/.env`, `PORT=5000\nMONGO_URI=${connStr}`);
          break;
        
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
          createFile(`.${PROJECT_PATH}/backend/.env`, `PORT=5000\nUSER=${mysqlUser}\nPASSWORD=${mysqlPass}\nHOST=${mysqlHost}`)
          break;
          
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
          createFile(`.${PROJECT_PATH}/backend/.env`, `PORT=5000\nUSER=${postgresUser}\nPASSWORD=${postgresPass}\nHOST=${postgresHost}`);
          break;
      }
      return DATABASES[DATABASE][`${BACKEND}_LIB`];

    } else {
      console.log("Okay, example environment variables have not been set. The file will be created and you can edit accordingly..");
      switch (DATABASE) {
        case 'MONGODB':
          createFile(`.${PROJECT_PATH}/backend/.env`, `PORT=5000`);
        
        case 'MYSQL':
          createFile(`.${PROJECT_PATH}/backend/.env`, `PORT=5000`);
      
        case 'POSTGRESQL':
          createFile(`.${PROJECT_PATH}/backend/.env`, `PORT=5000`);
      }
      return DATABASES[DATABASE][`${BACKEND}_LIB`];
    }
}

const cancel = () => {
    prompts.cancel(yellow("Installation Interrupted"))
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
        execSync(PKG_MGR_BK.init(), { cwd: `.${PROJECT_PATH}/backend`});

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

        const dbPkg = await dbConfigurations() ?? ""; 
        
        // 7. Copy Template Directory and Other Files        
        const backendPath_js = `.${PROJECT_PATH}/backend/src`;
        console.log('\n')
        await runWithSpinner(
          whiteBright("COPYING TEMPLATE DIRECTORY"),
          async () => {
            await copyDirectory(join(TEMPLATES_DIR, 'backend', BACKEND, DATABASE), backendPath_js);
            await copyDirectory(join(TEMPLATES_DIR, 'backend', BACKEND, 'common'), backendPath_js);
          }
        );
      
        copyFile( // For package.json
          `.${PROJECT_PATH}/backend/package.json`, 
          `.${PROJECT_PATH}/backend/package.json`, 
            true, 
            (data) => { // The modificationFn
              const jsonObject = JSON.parse(data);
              jsonObject['main'] = 'src/index.js'
              jsonObject['type'] = 'module';
              jsonObject['scripts'] = {
                'dev': 'nodemon src/index.js',
                'start': 'node src/index.js'
              }
              return JSON.stringify(jsonObject, null, 4); // 4 is for indentation whereas null is for the replacer fn which we don't require  
        });  
        
        await runWithSpinner('Installing backend packages...', async () => {
          const execPromise = promisify(exec);
          const packages = ['express', dbPkg, 'dotenv', 'nodemon', 'redis', 'cors'].filter(Boolean);
          const command = PKG_MGR_BK.install(packages);
          await execPromise(command, { cwd: `.${PROJECT_PATH}/backend` });
        });
        console.log(greenBright("\nBACKEND CREATED!"));
      break;

      case 'FLASK':
         // 4. Create Main Folder
         await mkdir(`.${PROJECT_PATH}/backend`, { recursive: true });

         // 5. Create virtual environment 
         await runWithSpinner(whiteBright("CREATING VIRTUAL ENVIRONMENT"), async () => {
           const createVenvCmd = PKG_MGR_BK.createVirtualEnv('.venv');
           const execPromise = promisify(exec);
           await execPromise(createVenvCmd, { cwd: `.${PROJECT_PATH}/backend`, shell: true });
         });

         // 6. Ask if user wants to configure .env file. If yes, configure. Else, create with default values.
        ENV_CHOICE = await prompts.select({
          message: `Do you want to configure your environment variables right now? (recommended):
          Or do it later?`,
          options: [
            {label: "Yes (Do it now)", value: "Yes"},
            {label: "No (I'll do it later)", value: "No"}
          ],
        })
        if (prompts.isCancel(ENV_CHOICE)) return cancel() 
        
        const flask_pkg = await dbConfigurations();
        const backendPath_fl = `.${PROJECT_PATH}/backend`;

         // 7. Copy template directory with it's contents based on selected database
         await runWithSpinner(
          whiteBright("COPYING TEMPLATE DIRECTORY"),
          async () => {
            await copyDirectory(join(TEMPLATES_DIR, 'backend', BACKEND, DATABASE), backendPath_fl);
          }
        );

         // 8. Copy requirements.txt file
         await runWithSpinner(
          whiteBright("COPYING REQUIREMENTS.TXT"),
          async () => {
            await copyFile(join(TEMPLATES_DIR, 'backend', BACKEND, DATABASE, 'requirements.txt'), `.${PROJECT_PATH}/backend/requirements.txt`);
          }
        );

         // 9. Install relevant packages using pip install -r requirements.txt
        await runWithSpinner('Installing backend packages...', async () => {
          const execPromise = promisify(exec);
          const command = PKG_MGR_BK.install();
          await execPromise(command, { cwd: `.${PROJECT_PATH}/backend`, shell: platform() === 'win32' ? process.env.ComSpec : '/bin/sh' });
        });
        console.log(greenBright("\nBACKEND CREATED!"));
       
      break;
      case 'FASTAPI':
         // 4. Create Main Folder
         await mkdir(`.${PROJECT_PATH}/backend`, { recursive: true });

         // 5. Create virtual environment 
         await runWithSpinner(whiteBright("CREATING VIRTUAL ENVIRONMENT"), async () => {
           const createVenvCmd = PKG_MGR_BK.createVirtualEnv('.venv');
           const execPromise = promisify(exec);
           await execPromise(createVenvCmd, { cwd: `.${PROJECT_PATH}/backend`, shell: platform() === 'win32' ? process.env.ComSpec : '/bin/sh' });
         });

         // 6. Ask if user wants to configure .env file. If yes, configure. Else, create with default values.
        ENV_CHOICE = await prompts.select({
          message: `Do you want to configure your environment variables right now? (recommended):
          Or do it later?`,
          options: [
            {label: "Yes (Do it now)", value: "Yes"},
            {label: "No (I'll do it later)", value: "No"}
          ],
        })
        if (prompts.isCancel(ENV_CHOICE)) return cancel() 
        
        const fastapi_pkg = await dbConfigurations();
        const backendPath_fa = `.${PROJECT_PATH}/backend`;

         // 7. Copy template directory with it's contents based on selected database
         await runWithSpinner(
          whiteBright("COPYING TEMPLATE DIRECTORY"),
          async () => {
            await copyDirectory(join(TEMPLATES_DIR, 'backend', BACKEND, DATABASE), backendPath_fa);
          }
        );

         // 8. Copy requirements.txt file
         await runWithSpinner(
          whiteBright("COPYING REQUIREMENTS.TXT"),
          async () => {
            await copyFile(join(TEMPLATES_DIR, 'backend', BACKEND, DATABASE, 'requirements.txt'), `.${PROJECT_PATH}/backend/requirements.txt`);
          }
        );

         // 9. Install relevant packages using pip install -r requirements.txt
        await runWithSpinner('Installing backend packages...', async () => {
          const execPromise = promisify(exec);
          const command = PKG_MGR_BK.install();
          await execPromise(command, { cwd: `.${PROJECT_PATH}/backend`, shell: platform() === 'win32' ? process.env.ComSpec : '/bin/sh' });
        });
        console.log(greenBright("\nBACKEND CREATED!"));

      break;
    }
  } catch(err) {
    console.error("Unable to create backend folder", err);
    terminate();
  }
}

// Frontend Creation
const createFrontend = async () => {
  if (isTerminating) return;
  console.log(whiteBright("\nCREATING FRONTEND\n"))

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
  if (prompts.success) return;
  FRONTEND = tsOption === 'Yes' ? (baseTech.toLowerCase() + '-ts') : baseTech.toLowerCase();
  
  const cmd = PKG_MGR_FD.create(`frontend ${PKG_MGR_FD.manager === 'npm' ? '--' : ''} --template ${FRONTEND}`);
  console.log("\n");
  await runWithSpinner(whiteBright('CREATING FRONTEND FOLDER WITH VITE'),
      async () => {
      const execPromise = promisify(exec);
      await execPromise(
      cmd,
        { 
          cwd: `.${PROJECT_PATH}`,
        }
      );
    }
    );

  // Installing Tailwind
  await runWithSpinner(
  whiteBright("INSTALLING TAILWINDCSS"),
  async () => {
    const execPromise = promisify(exec);
    await execPromise(
      PKG_MGR_FD.install(['tailwindcss', '@tailwindcss/vite']),
      { 
        cwd: `.${PROJECT_PATH}/frontend`,
      }
    );
  }
  );

  
  const fileName = FRONTEND_FRAMEWORKS[baseTech]['CSS_FILE'];
  if (!fileName) {
    // handle Lit projects - TO-DO LATER
  } 
  createFile(`.${PROJECT_PATH}/frontend/src/${fileName}`, '@import "tailwindcss";');

  await copyFile(  // For backend svg
    join(TEMPLATES_DIR, 'assets', `${BACKEND.toLowerCase()}.svg`), 
    `.${PROJECT_PATH}/frontend/src/assets/backend.svg`
  );

  await copyFile(  // For database svg
    join(TEMPLATES_DIR, 'assets', `${DATABASE.toLowerCase()}.svg`), 
    `.${PROJECT_PATH}/frontend/src/assets/database.svg`
  );

  await runWithSpinner(
    whiteBright("CREATING API CONNECTIONS..."),
    async () => {
      await copyDirectory(join(TEMPLATES_DIR, 'frontend', FRONTEND.toUpperCase()), `.${PROJECT_PATH}/frontend`);
    }
  );

  await runWithSpinner(
    whiteBright("FINAL INSTALLATIONS..."),
    async () => {
      const execPromise = promisify(exec);
      await execPromise(PKG_MGR_FD.install(), { cwd: `.${PROJECT_PATH}/frontend`});
    }
  );

  console.log(greenBright("\nFRONTEND CREATED"));

  console.log(dim(`For starting your project: 
  1) cd frontend && npm install && npm run dev
  2) cd backend && npm run dev
    `))

  console.log(whiteBright("Happy Coding!"))

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
║      Vanilla (JS/TS)    ║         Node.js         ║        MongoDB          ║
║        Vue (JS/TS)      ║          Flask          ║       PostgreSQL        ║
║       React (JS/TS)     ║         FastAPI         ║         MySQL           ║
║      React-SWC (JS/TS)  ║                         ║                         ║
║       Preact (JS/TS)    ║                         ║                         ║
║        Svelte (JS/TS)   ║                         ║                         ║
║       Solid (JS/TS)     ║                         ║                         ║
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
   const pkg_mgr_bk = await prompts.select({
    message: 'Please select a package manager for handling your backend:',
    options: Object.keys(PACKAGE_MANAGERS).map((pkg) => {
      const color = PACKAGE_MANAGERS[`${pkg}`]['COLOR'];
      return { 
      label: color(pkg), value: pkg, 
    }}),
      validate: (value) => {
        if (value === "pip" && BACKEND === "NODEJS") {
          return 'pip cannot be used for installation of NodeJS. Please select a different package manager.';
        } else if (value !== "pip" && ['FLASK', 'FASTAPI'].includes(BACKEND)) {
          return `${value} cannot be used for installation of ${BACKEND}. Please select a different package manager.`;
        }
      }
    })
    if (prompts.isCancel(pkg_mgr_bk)) return cancel();

    const pkg_mgr_fd = await prompts.select({
    message: 'Please select a package manager for handling your frontend:',
    options: Object.keys(PACKAGE_MANAGERS).filter((pkg) => pkg !== 'pip').map((pkg) => {
      const color = PACKAGE_MANAGERS[`${pkg}`]['COLOR'];
      return { 
      label: color(pkg), value: pkg,
    }})
    })
    if (prompts.isCancel(pkg_mgr_fd)) return cancel();

    PKG_MGR_BK = new PackageManagerCommands(pkg_mgr_bk);
    PKG_MGR_FD = new PackageManagerCommands(pkg_mgr_fd);
  
  await createBackend();
  await createFrontend();
}

start();