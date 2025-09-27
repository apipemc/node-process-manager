const path = require("path");
const fs = require("fs");
const pathModule = require("path");

// Load project configuration
let projectConfig;

try {
  const configPath = pathModule.join(__dirname, "../config/projectConfig.json");
  if (fs.existsSync(configPath)) {
    projectConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } else {
    projectConfig = {
      projectMappings: {},
      blacklist: [],
      waitlist: []
    };
  }
} catch (error) {
  console.warn("Could not load project configuration file:", error.message);
  projectConfig = {
    projectMappings: {},
    blacklist: [],
    waitlist: []
  };
}

function extractProjectName(command) {
  // Check blacklist first
  for (const blacklisted of projectConfig.blacklist) {
    if (command.includes(blacklisted)) {
      return null; // Skip blacklisted processes
    }
  }

  // Check project mappings
  for (const [projectName, projectInfo] of Object.entries(projectConfig.projectMappings)) {
    for (const pattern of projectInfo.patterns) {
      if (command.includes(pattern)) {
        return projectInfo.displayName || projectName;
      }
    }
  }
  if (
    command.includes("Visual Studio Code") ||
    command.includes("Code Helper")
  ) {
    return "Visual Studio Code";
  }

  if (command.includes("qwen")) {
    return "Qwen";
  }

  if (command.includes(".nvm") || command.includes("/nvm/")) {
    return "NVM";
  }

  if (
    (command.startsWith("node ") || command.includes("node ")) &&
    !command.includes("/Users/") &&
    !command.includes("/home/") &&
    command.includes(" ")
  ) {
    const nodeMatch = command.match(/node\s+([^\s]+)/);
    if (nodeMatch && nodeMatch[1]) {
      const file = nodeMatch[1];
      if (file.includes("/")) {
        const pathParts = file.split("/");
        if (pathParts.length > 1) {
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (isValidProjectName(pathParts[i])) {
              return `node-${pathParts[i]}`;
            }
          }
          // If we couldn't determine project name from path, try to get it from package.json
          const projectFromPackageJson = getProjectNameFromPackageJson(file);
          if (projectFromPackageJson) {
            return projectFromPackageJson;
          }
          return "node-project";
        } else {
          return "node";
        }
      } else {
        return "node";
      }
    }
    return "node";
  }

  if (command.includes("node_modules")) {
    const normalizedCommand = command.replace(/\\/g, "/");
    const nodeModulesIndex = normalizedCommand.indexOf("node_modules");

    if (nodeModulesIndex !== -1) {
      const beforeNodeModules = normalizedCommand.substring(
        0,
        nodeModulesIndex
      );
      const pathParts = beforeNodeModules
        .split("/")
        .filter(
          (part) =>
            part !== "." &&
            part !== ".." &&
            ![
              ".",
              "..",
              "node_modules",
              "src",
              "dist",
              "build",
              "public",
              "lib",
              "test",
              "tests",
              "spec",
              "bin",
            ].includes(part)
        );

      for (let i = pathParts.length - 1; i >= 0; i--) {
        if (isValidProjectName(pathParts[i])) {
          return pathParts[i];
        }
      }
    }
  }

  const normalizedCommand = command.replace(/\\/g, "/");
  const pathSegments = normalizedCommand.split("/");

  let userHomeIndex = -1;
  for (let i = 0; i < pathSegments.length; i++) {
    if (["Users", "home", "root"].includes(pathSegments[i])) {
      userHomeIndex = i;
      break;
    }
  }

  if (userHomeIndex !== -1 && userHomeIndex + 2 < pathSegments.length) {
    const pathAfterUser = pathSegments.slice(userHomeIndex + 2);

    const validProjectNames = [];
    for (const segment of pathAfterUser) {
      if (isValidProjectName(segment)) {
        validProjectNames.push(segment);
      }
    }

    if (normalizedCommand.includes("node_modules")) {
      const nodeModulesIndex = normalizedCommand.indexOf("node_modules");

      for (const project of [...validProjectNames].reverse()) {
        if (normalizedCommand.indexOf(project) < nodeModulesIndex) {
          return project;
        }
      }
    } else {
      if (validProjectNames.length > 0) {
        return validProjectNames[validProjectNames.length - 1];
      }
    }
  }

  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match && match[1]) {
      const fullPath = match[1];
      let projectName = path.basename(fullPath);

      if (isValidProjectName(projectName)) {
        return projectName;
      }

      const pathParts = fullPath
        .split(path.sep)
        .filter(
          (part) =>
            part !== "." &&
            part !== ".." &&
            ![
              ".",
              "..",
              "node_modules",
              "src",
              "dist",
              "build",
              "public",
              "lib",
              "test",
              "tests",
              "spec",
              "bin",
            ].includes(part)
        );

      for (let i = pathParts.length - 1; i >= 0; i--) {
        if (isValidProjectName(pathParts[i])) {
          return pathParts[i];
        }
      }
    }
  }

  const commandParts = command.split(" ");
  for (const part of commandParts) {
    if (
      part.includes("/") &&
      !part.startsWith("http") &&
      !part.includes("node_modules")
    ) {
      const normalizedPath = part.replace(/\\/g, "/");
      const pathParts = normalizedPath
        .split("/")
        .filter(
          (part) =>
            part !== "." &&
            part !== ".." &&
            ![
              ".",
              "..",
              "node_modules",
              "src",
              "dist",
              "build",
              "public",
              "lib",
              "test",
              "tests",
              "spec",
              "bin",
            ].includes(part)
        );

      for (let i = pathParts.length - 2; i >= 0; i--) {
        if (pathParts[i] && isValidProjectName(pathParts[i])) {
          return pathParts[i];
        }
      }
    }
  }

  const nestedPathLikeParts = command.match(
    /\/(?:home|Users|root)\/[^\/\s]+\/([^\/\s]+)\/[^\/\s]+/g
  );
  if (nestedPathLikeParts) {
    for (const part of nestedPathLikeParts) {
      const pathParts = part.split("/");
      if (pathParts.length >= 4) {
        const projectName = pathParts[3];
        if (isValidProjectName(projectName)) {
          return projectName;
        }
      }
    }
  }

  const directPathLikeParts = command.match(
    /\/(?:home|Users|root)\/[^\/\s]+\/([^\/\s]+)/g
  );
  if (directPathLikeParts) {
    for (const part of directPathLikeParts) {
      const projectName = part.split("/").pop();
      if (isValidProjectName(projectName)) {
        return projectName;
      }
    }
  }

  // As a fallback, try to determine project name from package.json if command contains a file path
  for (const part of command.split(" ")) {
    if (part.includes("/") && !part.startsWith("http")) {
      const projectFromPackageJson = getProjectNameFromPackageJson(part);
      if (projectFromPackageJson) {
        return projectFromPackageJson;
      }
    }
  }

  return "other-processes";
}

/**
 * Attempts to read the package.json file from the same directory as the given file path
 * and return the project name from the 'name' field.
 * @param {string} filePath - Path to a JavaScript file that might belong to a Node.js project
 * @returns {string|null} - Project name from package.json or null if not found
 */
function getProjectNameFromPackageJson(filePath) {
  try {
    // Get the absolute path of the directory containing the file
    const fileDir = path.dirname(path.resolve(filePath));
    
    // Search up the directory tree for a package.json file
    let currentDir = fileDir;
    
    while (currentDir !== path.dirname(currentDir)) { // Stop when reaching the root directory
      const packageJsonPath = path.join(currentDir, "package.json");
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        
        if (packageJson.name && isValidProjectName(packageJson.name)) {
          return packageJson.name;
        }
        break; // Stop searching once we find a package.json file
      }
      
      currentDir = path.dirname(currentDir);
    }
    
    return null;
  } catch (error) {
    // If any error occurs (e.g., no permission, invalid JSON), continue with other methods
    return null;
  }
}

function isValidProjectName(name) {
  const invalidNames = [
    "node",
    "nodejs",
    "node_modules",
    "npm",
    "yarn",
    "pnpm",
    "index",
    "app",
    "server",
    "main",
    "start",
    "index.js",
    "app.js",
    "server.js",
    "main.js",
    "start.js",
    "lib",
    "bin",
    "sbin",
    "src",
    "dist",
    "build",
    "public",
    "test",
    "tests",
    "spec",
    "docs",
    "doc",
    "config",
    "configs",
    "conf",
    "package",
    "packages",
    "home",
    "Users",
    "root",
    "tmp",
    "temp",
    "Library",
    "Applications",
    "System",
    "usr",
    "etc",
    "var",
    "opt",
    "home",
    "Desktop",
    "Documents",
    "Downloads",
    ".nvm",
    ".npm",
    ".yarn",
    ".config",
    ".vscode",
    ".git",
    "node_modules",
    "vendor",
    "target",
    "out",
    "release",
    "debug",
    "obj",
    "node_modules",
    "bower_components",
  ];

  return (
    name.length >= 2 &&
    !invalidNames.includes(name) &&
    !name.startsWith(".") &&
    !name.match(/^\d+$/)
  );
}

function groupProcessesByProject(processes) {
  const grouped = {};

  processes.forEach((process) => {
    const projectName = extractProjectName(process.command);

    // Skip blacklisted processes (they return null)
    if (projectName === null) {
      return;
    }

    if (!grouped[projectName]) {
      grouped[projectName] = {
        processes: [],
        totalCpu: 0,
        totalMemory: 0
      };
    }

    // Add process to the group
    grouped[projectName].processes.push(process);

    // Add CPU and memory to the group totals
    const cpu = parseFloat(process.cpu) || 0;
    const memory = parseFloat(process.memory) || 0;
    
    grouped[projectName].totalCpu += cpu;
    grouped[projectName].totalMemory += memory;
  });

  // Convert grouped object to the expected format (array of processes for each project)
  const result = {};
  for (const [projectName, groupData] of Object.entries(grouped)) {
    result[projectName] = groupData.processes;
    // Add the aggregated data to the group for display purposes
    result[projectName].totalCpu = groupData.totalCpu.toFixed(1);
    result[projectName].totalMemory = groupData.totalMemory.toFixed(1);
  }

  return result;
}

module.exports = {
  extractProjectName,
  groupProcessesByProject,
};
