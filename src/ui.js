const inquirer = require("inquirer");

async function selectProcess(processes) {
  if (processes.length === 0) {
    return null;
  }

  const choices = processes.map((process, index) => ({
    name: `PID: ${process.pid} | ${process.command}`,
    value: process,
    short: `PID: ${process.pid}`,
  }));

  choices.push(new inquirer.Separator());
  choices.push({ name: "Cancel", value: null, short: "Cancel" });

  const { selectedProcess } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProcess",
      message: 'Select a process to terminate (or "Cancel" to exit):',
      choices: choices,
      default: null,
    },
  ]);

  return selectedProcess;
}

module.exports = {
  selectProcess,
};
