#!/usr/bin/env node

import * as fs from 'node:fs/promises'
import { select, input } from '@inquirer/prompts'
import { createSpinner } from 'nanospinner';
import { execSync } from 'node:child_process';
import { access, readFile,writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';


const STACKS = [
  'MERN',
  'MEVN',
  // 'PERN',
  'SERN',
]

let PROJECT_NAME;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

const createFile = async (name, content, format = 'utf8') => {
  try {
      await writeFile(name, content, format)
      console.log('File created successfully: ', name);
  } catch (error) {
      console.error('Error creating file: ', error);
      process.exit(1);
  }
}

const readAFile = async (name) => {
  try {
    const data = await readFile(name);
    console.log(data.toString());
    return data;
  } catch(error) {
    console.log("Unable to read file. Installation Stopped");
    process.exit(1);
  }
} 

// Backend Creation
const createFrontend = () => {
  fs.mkdir('./frontend', { recursive: true}, (err) => {
    if (err) throw err;
  });
}

// const BACKEND_FOLDERS = ['controllers', 'routes', 'models', 'config',] // TO-DO OPTIMIZATION

const createBackend = async (stack) => {
  try {
    console.log(`.${PROJECT_NAME}/backend/src`, 'DEBUG')
    await mkdir(`.${PROJECT_NAME}/backend/src`, { recursive: true});

    await mkdir(`.${PROJECT_NAME}/backend/src/controllers`);
    await mkdir(`.${PROJECT_NAME}/backend/src/routes`);
    await mkdir(`.${PROJECT_NAME}/backend/src/models`);
    await mkdir(`.${PROJECT_NAME}/backend/src/config`);
    await mkdir(`.${PROJECT_NAME}/backend/src/middleware`);

    execSync('npm init -y', { cwd: `.${PROJECT_NAME}/backend/src`});

    const serverData = await readAFile(`./templates/${stack}/backend/src/server.js`);

    await writeFile(`.${PROJECT_NAME}/backend/src/server.js`, serverData);

    // const spinner = createSpinner('Checking answer...').start();

  } catch(err) {
    console.error("Unable to create backend folder", err);
    process.exit(1);
  }
}

const start = async () => {
  console.log(`
     This is AutoMERN!
     An NPM package, designed to automate the setup of your full-stack projects!
    `)

  PROJECT_NAME = await input({ message: 'Please enter project name: ', default: '.'});
  if (existsSync(PROJECT_NAME)) {
      console.log("A directory with this name already exists. Creating a separate directory...");
      await mkdir(`./${PROJECT_NAME}-automern`);
      PROJECT_NAME = '/' + PROJECT_NAME + '-automern';
  } else if (PROJECT_NAME !== '.') { // Means it doesn't exist and it's name is not .
      await mkdir(`./${PROJECT_NAME}`);
      PROJECT_NAME = '/' + PROJECT_NAME;
  } else {
    PROJECT_NAME = '';
  } 

  const stack = await select({
    message: 'Please pick a stack: ',
    choices: STACKS
  })

  console.log("Setting up " + stack + "...")
  
  createBackend(stack);
  // createFrontend(stackChoice);
}

// const choice = userInput === 'frontend' ? createFrontend() : createBackend();

// let file;
// try {
//    file = await open("textfile.txt", 'r');
// } finally {
//   console.log(file, 'asdf')
//   await file?.close();
// }

// console.log('All arguments:', process.argv);
// console.log('First argument:', process.argv[2]);
// console.log('Second argument:', process.argv[3]);
// console.log('asdasdf', process.argv.template);
start();