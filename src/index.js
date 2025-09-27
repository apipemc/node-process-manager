#!/usr/bin/env node

const chalk = require("chalk");
const { listNodeProcesses, killProcess } = require("./processManager");
const { selectProcess } = require("./ui");
const { groupProcessesByProject } = require("./projectGrouping");
const { selectProjectAction } = require("./projectUI");

async function main() {
  try {
    console.log(
      chalk.blue("🔍 Searching for background Node.js processes...\n")
    );

    const processes = await listNodeProcesses();

    if (processes.length === 0) {
      console.log(chalk.green("✅ No background Node.js processes found"));
      return;
    }

    console.log(
      chalk.green(`✅ Found ${processes.length} background Node.js processes\n`)
    );

    const { groupingChoice } = await require("inquirer").prompt([
      {
        type: "list",
        name: "groupingChoice",
        message: "How would you like to manage the processes?",
        choices: [
          { name: "Group by project (recommended)", value: "grouped" },
          { name: "Handle individually", value: "individual" },
          { name: "Cancel", value: "cancel" },
        ],
      },
    ]);

    if (groupingChoice === "cancel") {
      console.log(chalk.yellow("❌ Operation cancelled"));
      return;
    } else if (groupingChoice === "individual") {
      const selectedProcess = await selectProcess(processes);

      if (selectedProcess) {
        console.log(
          `\n${chalk.red("🛑")} Terminating process PID: ${chalk.yellow(
            selectedProcess.pid
          )} (${selectedProcess.command})`
        );
        const success = await killProcess(selectedProcess.pid);

        if (success) {
          console.log(
            `${chalk.green("✅")} Process ${chalk.yellow(
              selectedProcess.pid
            )} terminated successfully`
          );
        } else {
          console.log(
            `${chalk.red("❌")} Could not terminate process ${chalk.yellow(
              selectedProcess.pid
            )} (possibly already terminated)`
          );
        }
      } else {
        console.log(`${chalk.red("❌")} No process selected to terminate`);
      }
    } else {
      const groupedProcesses = groupProcessesByProject(processes);

      console.log(chalk.green(`📦 Processes grouped by project:`));
      for (const [project, procs] of Object.entries(groupedProcesses)) {
        // Display aggregated CPU and memory if available
        const totalCpu = procs.totalCpu ? procs.totalCpu : "0.0";
        const totalMemory = procs.totalMemory ? procs.totalMemory : "0.0";
        
        console.log(
          `  ${chalk.cyan(project)}: ${procs.length} process${procs.length !== 1 ? "es" : ""} | CPU: ${totalCpu}% | MEM: ${totalMemory}%`
        );
        
        // Create a table for processes in the group
        const Table = require('cli-table3');
        const procTable = new Table({
          head: ['PID', 'CPU%', 'MEM%', 'Command'],
          colWidths: [10, 8, 8, 60], // Adjust column widths as needed
          style: {
            head: ['grey', 'bold'],
            border: ['grey']
          },
          wordWrap: true
        });

        for (const proc of procs) {
          procTable.push([
            proc.pid,
            `${proc.cpu}%`,
            `${proc.memory}%`,
            proc.command.length > 55 ? proc.command.substring(0, 52) + '...' : proc.command
          ]);
        }

        console.log(procTable.toString());
        console.log("");
      }

      const projectAction = await selectProjectAction(groupedProcesses);

      if (projectAction) {
        if (projectAction.action === "all") {
          console.log(
            `\n${chalk.red(
              "🛑"
            )} Terminating all processes from project: ${chalk.yellow(
              projectAction.projectName
            )}`
          );

          let successCount = 0;
          for (const process of projectAction.processes) {
            const success = await killProcess(process.pid);
            if (success) {
              successCount++;
              console.log(
                `${chalk.green("✅")} Process ${chalk.yellow(
                  process.pid
                )} terminated`
              );
            } else {
              console.log(
                `${chalk.red("❌")} Could not terminate process ${chalk.yellow(
                  process.pid
                )} (possibly already terminated)`
              );
            }
          }

          console.log(
            `\n${chalk.green("✅")} ${successCount}/${
              projectAction.processes.length
            } processes from ${chalk.yellow(
              projectAction.projectName
            )} terminated successfully`
          );
        } else if (
          projectAction.action === "individual" &&
          projectAction.processes.length > 0
        ) {
          console.log(
            `\n${chalk.red(
              "🛑"
            )} Terminating selected processes from project: ${chalk.yellow(
              projectAction.projectName
            )}`
          );

          let successCount = 0;
          for (const process of projectAction.processes) {
            const success = await killProcess(process.pid);
            if (success) {
              successCount++;
              console.log(
                `${chalk.green("✅")} Process ${chalk.yellow(
                  process.pid
                )} terminated`
              );
            } else {
              console.log(
                `${chalk.red("❌")} Could not terminate process ${chalk.yellow(
                  process.pid
                )} (possibly already terminated)`
              );
            }
          }

          console.log(
            `\n${chalk.green("✅")} ${successCount}/${
              projectAction.processes.length
            } selected processes terminated successfully`
          );
        } else {
          console.log(`${chalk.red("❌")} No processes selected to terminate`);
        }
      } else {
        console.log(`${chalk.red("❌")} No action selected`);
      }
    }
  } catch (error) {
    console.error(`${chalk.red("❌ Error:")} ${error.message}`);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error(`${chalk.red("❌ Unhandled error:")} ${reason}`);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error(`${chalk.red("❌ Uncaught exception:")} ${error.message}`);
  process.exit(1);
});

main();
