#!/usr/bin/env node
const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const handlebars = require('handlebars');
const fs = require('fs');
const fse = require('fs-extra')
const package = require('./package.json')

const ipromptConfig = [
  {
    type: 'input',
    name: 'description',
    message: '请输入项目描述'
  },
  {
    type: 'input',
    name: 'author',
    message: '请输入作者名称'
  },
  {
    type: 'list',
    name: 'template',
    message: '请选择模版',
    choices: [
      {
        name: 'Vue',
        value: 'vue'
      },
      {
        name: 'React',
        value: 'react-temp'
      }
    ]
  }
]
let ipromptConfigTemplate = []
let meta = {}
// 下线 Template Repo
const downloadRepo = (target) => {
  return new Promise((resolve, reject) => {
    download('https://github.com:xiaotiandada/cli-ant-temp#master', target, { clone: true }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(target)
      }
    })
  })
}

// 合并配置文件
const mergenPackage = (name) => {
  try {
    // console.log('meta', meta)
    const fileName = `./${name}/package.json`;
    const content = fs.readFileSync(fileName).toString();
    const temp = handlebars.compile(content)(meta)
    fs.writeFileSync(fileName, temp);
    // console.log('temp', temp)
  } catch (err) {
    console.error(err)
  }
}

// 处理文件夹
const handleFolder = async (target, temp ,name) => {
  try {
    await fse.copySync(`${target}/template/${temp}`, `./${name}`)
    await fse.removeSync(target)
    await mergenPackage(name)
  } catch (err) {
    console.error(err)
  }
}

// 选择模版
const chooseTemplate = (name) => {
  inquirer
  .prompt(ipromptConfigTemplate)
  .then(async (ct) => {
    // console.log('ct', ct);
    await pullRepo(ct.template, name)
  })
  .catch(err => console.log(err))
}

// pull repo
const pullRepo = async (temp, name) => {
  const spinner = ora('正在下载模板...');
  spinner.start();
  let target = '.download-temp'
  try {
    await downloadRepo(target)
    await handleFolder(target, temp, name)
    spinner.succeed();
    console.log(symbols.success, chalk.green('项目创建成功'));
  } catch (err) {
    spinner.fail();
    console.log(symbols.error, chalk.red(`项目创建失败 ${err}`));
  }
}

program
  .version(package.version, '-v, --version')
  .command('init <name>')
  .action((name) => {
    if (fs.existsSync(name)) {
      console.log(symbols.error, chalk.red('项目已存在'));
      return
    }

    inquirer
      .prompt(ipromptConfig)
      .then((c) => {
        // write meta
        meta = Object.assign(meta, {
          name: name,
          description: c.description,
          author: c.author,
        })

        if (c.template === 'vue') {
          ipromptConfigTemplate = [
            {
              type: 'list',
              name: 'template',
              message: '请选择模版',
              choices: [
                {
                  name: 'Vue2',
                  value: 'vue2'
                },
                {
                  name: 'Vue3',
                  value: 'vue3'
                },
                {
                  name: 'Nuxt',
                  value: 'nuxt-temp'
                }
              ]
            }
          ]
          chooseTemplate(name)
        } else if (c.template === 'create-temp' ) {
          pullRepo(c.template, name)
        } else {
          return
        }
      })
      .catch(err => console.log(err))
  });

program.parse(process.argv);