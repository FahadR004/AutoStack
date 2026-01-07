#!/usr/bin/env node

import * as fs from 'node:fs/promises'
import { createSpinner } from 'nanospinner';
import { execSync, spawn } from 'node:child_process';
import { exec } from 'node:child_process';
import {  readFile,writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pc from 'picocolors';
import * as prompts from '@clack/prompts';
import mri from 'mri';
import figlet from 'figlet'

const FOLDERS = {
  "NODEJS" : [
    'backend/src',
    'backend/src/controllers',
    'backend/src/routes', 
    'backend/src/models',
    'backend/src/config',
    'backend/src/middleware'
    ],
  "FLASK" : [
    'backend/src',
    'backend/public'
    ], 
  "FASTAPI" : [
    'backend/src',
    'backend/public'
    ]
};

const FILES = {
  "NODEJS_FILES": [
      'backend/src/controllers/noteController.js',
      'backend/src/controllers/userController.js',
      'backend/src/models/noteModel.js',
      'backend/src/models/userModel.js',
      'backend/src/routes/noteRoutes.js',
      'backend/src/routes/userRoutes.js',
      'backend/src/middleware/upstash.js',
      'backend/src/server.js'
  ],
  "FLASK": [

  ],
  "FASTAPI": [
    
  ]
}

const DATABASES = [
    "MONGODB",
    "MYSQL",
    "POSTGRESQL"
]

const PACKAGE_MANAGERS = [
  "npm",
  "yarn",
  "pnpm",
  "bun"
]

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
const TEMPLATES_DIR = join(_dirname, '../templates');
// const templatePath = join(TEMPLATES_DIR, stack, 'backend/server.js');
// const destPath = join(PROJECT_PATH, 'backend/server.js');

let PROJECT_NAME;
let FRONTEND;
let DATABASE;
let BACKEND;
let PKG_MGR;

// const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

const terminate = () => {
    // TO-DO
    process.exit(1);
}

const createFile = async (name, content, format = 'utf8') => {
  try {
      await writeFile(name, content, format)
      console.log('File created successfully: ', name);
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

async function installPackages(packageName, installationPath) {
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

const cancel = () => {
    prompts.cancel('Operation cancelled');
    terminate();
}

// Backend Creation
const createBackend = async () => {
  try {
   BACKEND = await prompts.select({
      message: 'Please pick a backend framework:',
      options: Object.keys(FOLDERS).map((name) => ({ label: name, value: name })),
    })
    if (prompts.isCancel(BACKEND)) return cancel()

    DATABASE = await prompts.select({
      message: 'Please select a database:',
      options: DATABASES.map((db) => ({ label: db, value: db })),
    })
    if (prompts.isCancel(DATABASE)) return cancel() 

    PKG_MGR = await prompts.select({
      message: 'Please select a package manager:',
      options: PACKAGE_MANAGERS.map((pm) => ({ label: pm, value: pm })),
    })
    if (prompts.isCancel(PKG_MGR)) return cancel()
    
    switch (BACKEND) {
      case 'NODEJS':
        console.log(pc.whiteBright("\nCREATING FOLDERS...\n"))
        for (const folder of FOLDERS['NODEJS']) {
          const spinner = createSpinner(`Creating ${folder}...`).start();          
          await mkdir(`.${PROJECT_NAME}/${folder}`, { recursive: true });
          spinner.success({ text: (`Created ${folder}!`) });
        }
        console.log(pc.whiteBright("\nINITIALIZING BACKEND...\n"))
        execSync('npm init -y', { cwd: `.${PROJECT_NAME}/backend`});
        console.log(pc.whiteBright("COPYING FILES...\n"))
        for (const filepath of FILES['NODEJS_FILES']) {
          const arrLength = filepath.split('/').length
          const fileName = filepath.split('/')[arrLength - 1];
          const spinner = createSpinner(`Creating ${fileName}...`).start();   
          await copyFile(`./templates/${BACKEND}/${fileName}`, `.${PROJECT_NAME}/${filepath}!`); 
          spinner.success({ text: `Created ${fileName}` });
        }
        
        copyFile( // For package.json
          `.${PROJECT_NAME}/backend/package.json`, 
          `.${PROJECT_NAME}/backend/package.json`, 
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
        switch (DATABASE) {
          case 'MONGODB':
              copyFile(`./templates/${BACKEND}/mongodbConn.js`, `.${PROJECT_NAME}/backend/src/config/db.js`); 
          break;
          case 'MYSQL':
              copyFile(`./templates/${BACKEND}/mysqlConn.js`, `.${PROJECT_NAME}/backend/src/config/db.js`); 
          break;
          case 'POSTGRESQL':
              copyFile(`./templates/${BACKEND}/postgresqlConn.js`, `.${PROJECT_NAME}/backend/src/config/db.js`); 
          break;
        }

        
        await installPackages('express mongoose dotenv nodemon redis', `.${PROJECT_NAME}/backend`);

        console.log(pc.greenBright("\nBACKEND CREATED!"));
      break;

      case 'FLASK':
        console.log("FLASK portion has not been implemented yet")
      break;
      case 'FASTAPI':
        console.log("FASTAPI portion has not been implemented yet")
      break;
    }
  } catch(err) {
    console.error("Unable to create backend folder", err);
    terminate();
  }
}

const createFrontend = async () => {
  fs.mkdir(`.${PROJECT_NAME}/frontend`, { recursive: true}, (err) => {
    if (err) throw err;
  });

  execSync('npm create vite@latest', { cwd: `.${PROJECT_NAME}/frontend`, stdio: 'inherit' });
}

const start = async () => {
  console.log(
    (pc.greenBright(figlet.textSync('AUTOSTACK', { horizontalLayout: 'full' }))
  ));
  console.log(pc.whiteBright(pc.italic('--- An NPM package designed to automate the setup of your full-stack projects ---'))); 
  console.log(`
${pc.blueBright('---------------------------- Supported Technologies ---------------------------\n')}
╔═════════════════════════╦═════════════════════════╦═════════════════════════╗
║        FRONTEND         ║         BACKEND         ║        DATABASE         ║
╠═════════════════════════╬═════════════════════════╬═════════════════════════╣
║         Vanilla         ║         Node.js         ║        MongoDB          ║
║           Vue           ║          Flask          ║       PostgreSQL        ║
║          React          ║         FastAPI         ║         MySQL           ║
║         Preact          ║                         ║                         ║
║         Svelte          ║                         ║                         ║
║          Solid          ║                         ║                         ║
╚═════════════════════════╩═════════════════════════╩═════════════════════════╝
   `);
  PROJECT_NAME = await prompts.text({
      message: 'Please enter project name:',
      placeholder: '.',
      defaultValue: '.'
  });
  if (existsSync(PROJECT_NAME) && PROJECT_NAME !== '.') {
      console.log("A directory with this name already exists. Creating a separate directory...");
      await mkdir(`./${PROJECT_NAME}-automern`);
      PROJECT_NAME = '/' + PROJECT_NAME + '-automern';
  } else if (PROJECT_NAME !== '.') { // Means it doesn't exist and it's name is not .
      await mkdir(`./${PROJECT_NAME}`);
      PROJECT_NAME = '/' + PROJECT_NAME;
  } else {
    PROJECT_NAME = '';
  } 
  
  await createBackend();
  await createFrontend();
}

start();
