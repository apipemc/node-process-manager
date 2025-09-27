# Node PKill Process

A CLI tool to list and kill Node.js processes running in the background.

## Origin

This project was initially created with the assistance of Qwen Code, an AI coding assistant, during a live coding session. The tool has been developed to help users manage background Node.js processes efficiently.

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
npm install -g node-pkill-process
```

After installation, you can use the tool with the `pkill-process` command from any directory:

```bash
pkill-process
```

To uninstall globally:
```bash
npm uninstall -g node-pkill-process
```

### One-time Usage with npx (No Installation Required)
You can also run the tool without installing it using npx:

```bash
npx node-pkill-process
```

This downloads and runs the package instantly without requiring a local installation.

## Features

- Lists all Node.js processes running in the background
- Displays PID, command, CPU usage, and memory
- Allows you to select and terminate individual processes
- Group processes by project and terminate all processes from the same project
- Safely terminates processes with SIGTERM, and if necessary with SIGKILL
- Choose between individual process management or project-based grouping
- Configurable project mappings, blacklists, and whitelists through configuration file
- Support for complex applications with multiple related processes (e.g., LM Studio, VS Code, Electron apps)

## Disclaimer

This tool is designed to help you manage background Node.js processes. Be careful when terminating processes, as you might interrupt important applications. Use at your own risk.

## License

MIT