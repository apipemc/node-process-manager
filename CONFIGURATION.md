# Configuration Guide

The Node Process Manager includes a configuration system that allows you to customize project detection, blacklists, and whitelists. This helps with better grouping and filtering of processes.

## Configuration File

The configuration file is located at `config/projectConfig.json` and has the following structure:

```json
{
  "projectMappings": {
    "Project Name": {
      "patterns": ["pattern1", "pattern2"],
      "displayName": "Display Name"
    }
  },
  "blacklist": ["process1", "process2"],
  "waitlist": ["process3", "process4"]
}
```

## Project Mappings

Project mappings allow you to group related processes that may have different executable paths. For example, LM Studio has multiple helper processes with different paths that should be grouped together.

- `patterns`: Array of strings that, if found in a command, will map to the specified project name
- `displayName`: The name to show when grouping these processes

## Blacklist

The blacklist contains process names or patterns that should be filtered out and not displayed in the process list. This is useful for hiding system processes or unimportant Node processes.

## Waitlist

The waitlist contains process names that should be treated with caution. These might be important processes that require special handling.

## Example Configuration

The default configuration includes mappings for common applications like Visual Studio Code, Slack, Figma, and Electron apps. You can add your own mappings as needed.

## Overriding Configuration

To customize the configuration:

1. Copy the default configuration from `config/projectConfig.json`
2. Modify the entries according to your needs
3. Save the changes

Your modifications will be preserved when updating the package, as long as you keep the same structure.