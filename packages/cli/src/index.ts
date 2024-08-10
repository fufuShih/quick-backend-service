#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

program
  .command('add <service>')
  .description('Add a service to the project')
  .action(async (service) => {
    console.log(`Adding ${service} to the project`);
    try {
      const templatePath = path.join(__dirname, 'templates', `${service}.js`);
      const destinationPath = path.join(process.cwd(), `${service}.js`);

      await fs.copyFile(templatePath, destinationPath);
      console.log(`${service} service has been added successfully.`);
    } catch  {
      console.error(`Failed to add ${service}`);
    }
  });

program
  .command('list')
  .description('List available services')
  .action(async () => {
    try {
      const templatesDir = path.join(__dirname, 'templates');
      const files = await fs.readdir(templatesDir);
      console.log('Available services:');
      files.forEach(file => {
        console.log(`- ${path.parse(file).name}`);
      });
    } catch {
      console.error(`Failed to list services`);
    }
  });

// 添加一個默認的動作
program
  .action(() => {
    console.log('Welcome to Quick Backend Service CLI!');
    console.log('Use `qbs --help` to see available commands.');
  });

program.parse(process.argv);

// 如果沒有提供參數，顯示幫助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
