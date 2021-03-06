"use strict";

const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the exceptional ${chalk.red(
          "generator-travel-agent",
        )} generator!`,
      ),
    );

    const prompts = [
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname, // Default to current folder name
      },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copy(this.templatePath("app"), this.destinationPath("app"));
    this.fs.copy(this.templatePath("config"), this.destinationPath("config"));
    this.fs.copy(
      this.templatePath("_gitignore"),
      this.destinationPath(".gitignore"),
    );
    this.fs.copy(
      this.templatePath("_prettierrc"),
      this.destinationPath(".prettierrc"),
    );
    this.fs.copy(
      this.templatePath("_eslintrc"),
      this.destinationPath(".eslintrc"),
    );
    this.fs.copyTpl(
      this.templatePath("_package.json"),
      this.destinationPath("package.json"),
      {
        appname: this.props.name,
      },
    );
    this.fs.copy(
      this.templatePath("tsconfig.json"),
      this.destinationPath("tsconfig.json"),
    );
    this.fs.copy(
      this.templatePath("tslint.json"),
      this.destinationPath("tslint.json"),
    );
  }

  install() {
    this.installDependencies({
      bower: false,
    });
  }
};
