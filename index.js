const { program } = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const fs = require('fs');
const package = require('./package.json')

program
  .version(package.version, '-v, --version')
  .command('init <name>')
  .action((name) => {
    if(fs.existsSync(name)) {
      console.log(symbols.error, chalk.red('项目已存在'));
      return
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: '请输入项目描述'
      },
      {
        type: 'input',
        name: 'author',
        message: '请输入作者名称'
      }
    ]).then((answers) => {
      const spinner = ora('正在下载模板...');
      spinner.start();
      console.log(answers.author);
      console.log('name', name);
      download('https://github.com:eggjs/egg-init#master', name, { clone: true }, (err) => {
        if (err) {
          spinner.fail();
          console.log(symbols.error, chalk.red(`项目创建失败 ${err}`));
        } else {
          spinner.succeed();
          console.log(symbols.success, chalk.green('项目创建成功'));
        }
      })
    })
  });
program.parse(process.argv);