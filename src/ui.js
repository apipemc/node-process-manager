const inquirer = require("inquirer");
const Table = require('cli-table3');

async function selectProcess(processes) {
  if (processes.length === 0) {
    return null;
  }

  // Create a table to display process information
  const table = new Table({
    head: ['Index', 'PID', 'CPU%', 'MEM%', 'Command'],
    colWidths: [7, 8, 8, 8, 60], // Adjust column widths as needed
    style: {
      head: ['cyan', 'bold'],
      border: ['grey']
    }
  });

  // Add processes to the table
  processes.forEach((process, index) => {
    table.push([
      index + 1,
      process.pid,
      `${process.cpu}%`,
      `${process.memory}%`,
      process.command.length > 55 ? process.command.substring(0, 52) + '...' : process.command
    ]);
  });

  console.log(table.toString());
  console.log(); // Add a blank line after the table for better readability

  const choices = processes.map((process, index) => ({
    name: `${index + 1}. PID: ${process.pid}`,
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
