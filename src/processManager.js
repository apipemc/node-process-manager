const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

async function listNodeProcesses() {
  try {
    const command =
      'ps aux | grep node | grep -v grep | grep -v process-manager | grep -v "node-process-manager" | grep -v "npm" | grep -v "yarn"';

    const { stdout } = await execPromise(command);

    if (!stdout.trim()) {
      return [];
    }

    const processes = stdout
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const parts = line.split(/\s+/);

        if (parts.length < 11) {
          return null;
        }

        const pid = parts[1];
        const command = parts.slice(10).join(" ");

        const pidNum = parseInt(pid);
        if (isNaN(pidNum)) {
          return null;
        }

        return {
          pid: pidNum,
          command: command,
          user: parts[0],
          cpu: parts[2] || "0.0",
          memory: parts[3] || "0.0",
        };
      })
      .filter((process) => process !== null);

    return processes;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error('The "ps" command is not available on this system');
    }
    throw new Error(`Error listing processes: ${error.message}`);
  }
}

/**
 * Terminates a process by its PID
 * @param {number} pid - ID of the process to terminate
 * @returns {Promise<boolean>} true if the process was terminated successfully, false otherwise
 */
async function killProcess(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    throw new Error(`Invalid PID: ${pid}`);
  }

  try {
    try {
      await execPromise(`kill -0 ${pid}`);
    } catch (e) {
      return false;
    }

    await execPromise(`kill -15 ${pid}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await execPromise(`kill -0 ${pid}`);
      await execPromise(`kill -9 ${pid}`);
    } catch (e) {}

    return true;
  } catch (error) {
    if (error.message.includes("No such process")) {
      return false;
    } else if (error.message.includes("Operation not permitted")) {
      throw new Error(`You don't have permissions to terminate process ${pid}`);
    } else if (error.message.includes("invalid signal number")) {
      throw new Error(`Invalid signal number for process ${pid}`);
    } else {
      throw new Error(`Error terminating process ${pid}: ${error.message}`);
    }
  }
}

module.exports = {
  listNodeProcesses,
  killProcess,
};
