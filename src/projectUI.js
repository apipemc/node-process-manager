const inquirer = require("inquirer");
const chalk = require("chalk");

async function selectProjectAction(groupedProcesses) {
  const projectNames = Object.keys(groupedProcesses);

  if (projectNames.length === 0) {
    return null;
  }

  const projectChoices = projectNames.map((projectName) => {
    const projectGroup = groupedProcesses[projectName];
    const processCount = projectGroup.length;
    
    // Get aggregated CPU and memory if available
    const totalCpu = projectGroup.totalCpu || "0.0";
    const totalMemory = projectGroup.totalMemory || "0.0";
    
    return {
      name: `${projectName} (${processCount} process${processCount !== 1 ? "es" : ""}) | CPU: ${totalCpu}% | MEM: ${totalMemory}%`,
      value: projectName,
      short: projectName,
    };
  });

  projectChoices.push(new inquirer.Separator());
  projectChoices.push({ name: "Cancel", value: null, short: "Cancel" });

  const { selectedProject } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProject",
      message:
        "Select a project (you can choose to kill individual processes or all processes from the project):",
      choices: projectChoices,
      default: null,
    },
  ]);

  if (!selectedProject) {
    return null;
  }

  const actionChoices = [
    { name: "Kill all processes from this project", value: "all" },
    { name: "Kill individual processes", value: "individual" },
    new inquirer.Separator(),
    { name: "Go back to project selection", value: "back" },
    { name: "Cancel", value: "cancel" },
  ];

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: `What would you like to do with ${chalk.yellow(
        selectedProject
      )}?`,
      choices: actionChoices,
      default: "all",
    },
  ]);

  if (action === "cancel") {
    return null;
  } else if (action === "back") {
    return await selectProjectAction(groupedProcesses); // Recursión para volver a seleccionar proyecto
  } else if (action === "individual") {
    const processes = groupedProcesses[selectedProject];
    const processChoices = processes.map((process, index) => ({
      name: `PID: ${process.pid} | ${process.command}`,
      value: process,
      short: `PID: ${process.pid}`,
    }));

    processChoices.push(new inquirer.Separator());
    processChoices.push({ name: "Cancel", value: null, short: "Cancel" });

    const { selectedProcesses } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedProcesses",
        message: `Select process(es) to kill from ${chalk.yellow(
          selectedProject
        )}:`,
        choices: processChoices,
        default: null,
      },
    ]);

    return {
      action: "individual",
      projectName: selectedProject,
      processes: selectedProcesses.filter((p) => p !== null),
    };
  } else {
    return {
      action: "all",
      projectName: selectedProject,
      processes: groupedProcesses[selectedProject],
    };
  }
}

module.exports = {
  selectProjectAction,
};
