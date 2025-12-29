#!/usr/bin/env node

import * as fs from 'node:fs/promises'
import { open } from 'node:fs/promises'
import inquirer from 'inquirer';
import { select } from '@inquirer/prompts'


const createFile = async (name, content, format = 'utf8') => {
  try {
      await fs.writeFile(name, content, format)
      console.log('File created successfully: ', name);
  } catch (error) {
      console.error('Error creating file: ', error);
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

const createBackend = async () => {
  try {
    await fs.mkdir('./backend');

    await fs.mkdir('./backend/controllers');
    await fs.mkdir('./backend/routes');
    await fs.mkdir('./backend/models');
    await fs.mkdir('./backend/config');
    await fs.mkdir('./backend/middleware');

  } catch(err) {
    console.error("Unable to create backend folder", err);
    process.exit(1);
  }
}


// const userInput = await select({
//   message: 'Create frontend or backend?',
//   choices: [
//     'frontend',
//     'backend',
//   ],
// });

// const choice = userInput === 'frontend' ? createFrontend() : createBackend();

// let file;
// try {
//    file = await open("textfile.txt", 'r');
// } finally {
//   console.log(file, 'asdf')
//   await file?.close();
// }

createBackend();