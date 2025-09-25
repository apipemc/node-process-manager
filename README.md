# Node Process Manager

A CLI tool to list and kill Node.js processes running in the background.

## Installation

### Local Usage
1. Make sure you have Node.js installed on your system
2. Install dependencies:

```bash
npm install
```

Run with:
```bash
npm start
```

Or if you prefer to use it directly:
```bash
node src/index.js
```

### Global Installation
Install globally to use as a command-line shortcut from anywhere:

```bash
npm install -g node-process-manager
```

After installation, you can use the tool with the `process-manager` command from any directory:

```bash
process-manager
```

To uninstall globally:
```bash
npm uninstall -g node-process-manager
```

### One-time Usage with npx (No Installation Required)
You can also run the tool without installing it using npx:

```bash
npx node-process-manager
```

This downloads and runs the package instantly without requiring a local installation.

## Features

- Lists all Node.js processes running in the background
- Displays PID, command, CPU usage, and memory
- Allows you to select and terminate individual processes
- Group processes by project and terminate all processes from the same project
- Safely terminates processes with SIGTERM, and if necessary with SIGKILL
- Choose between individual process management or project-based grouping

## Disclaimer

This tool is designed to help you manage background Node.js processes. Be careful when terminating processes, as you might interrupt important applications. Use at your own risk.

## License

MIT# node-process-manager
