---
next: /guide/walkthrough 
---
# Quick Start
Welcome to the CLUI documentation! CLUI (Command Line User Interface) is a powerful desktop application designed to simplify and streamline your command line workflows. With CLUI, you can create and execute custom command line flows effortlessly, providing a unified GUI for all your CLI tools.

## Getting Started
To get started with CLUI, follow these simple steps:

1. **Installation**: Ensure you have CLUI installed on your system. Refer to the installation guide for detailed instructions.

2. **Creating Your First Flow**: Dive into CLUI by creating your first flow. Flows are command line workflows that you define and execute using CLUI. Each flow consists of a title, description, tags, working directory, dependencies, inputs, and a command builder.

3. **Defining Flows**: Specify the title, description, and tags for searchability. Set the working directory for the flow, if necessary. Add any required dependencies and configure the inputs mapped to your command builder.

4. **Executing Flows**: Once your flows are defined, you can easily execute them within CLUI. Simply select a flow from your dashboard, review the details, and execute it with a click of a button.

## Flow Definition
When defining a flow using CLUI, keep the following in mind:

**Title and Description**: Give your flow a meaningful title and description to identify its purpose and functionality.

**Tags**: Assign tags to your flows to facilitate easy searching and categorization.

**Working Directory**: Specify the working directory from which the commands in your flow should be executed. This allows you to control the context of the commands.

**Dependencies**: Define any dependencies required by your flow, such as external tools or packages. Use the `url` property to render a link to the given dependency or omit it to just render the dependency name as text.

**Inputs**: Configure the inputs required for your flow. Inputs can be of type `string` or `file`. `string` inputs allow for text input, and `file` inputs enable drag-and-drop file selection.

**Command Builder**: Use the command builder to construct the command to be executed. Use the `input`s' `name`s within the command builder string to represent their corresponding values during execution.

## Troubleshooting
If you encounter any issues while using CLUI, [create an issue](https://github.com/nicolehollant/clui/issues/new)!