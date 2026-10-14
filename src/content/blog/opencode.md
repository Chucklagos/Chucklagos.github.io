---
title: "OpenCode + Ollama Local Models"
description: "Practical guide for connecting OpenCode to Ollama, selecting local language models, and allowing an AI coding\n        agent to work directly with a project directory."
tags: ["OpenCode", "Ollama", "Local AI"]
draft: false
---

## Overview

**Ollama** runs language models locally, while **OpenCode** acts as the coding agent
        that can inspect, search, create, and modify files inside a project.

Running a model with Ollama alone does not automatically give that model access to files in the current
        directory. OpenCode provides the agent and tool layer needed to work with the project.

```
Project directory
      │
      ▼
   OpenCode
      │
      ├── Read files
      ├── Search source code
      ├── Create files
      ├── Modify files
      └── Use coding tools
      │
      ▼
    Ollama
      │
      ▼
 Local language model
```

## Verify Ollama

Confirm that Ollama is installed and list the models currently available:

```
ollama list
```

Example:

```
NAME                     SIZE
codegemma:2b             1.6 GB
deepseek-coder:1.3b      776 MB
gemma3:1b                815 MB
gemma3:latest            3.3 GB
qwen3:4b                 2.5 GB
qwen3.5:0.8b             1.0 GB
mistral:7b               4.4 GB
deepseek-coder:6.7b      3.8 GB
qwen2.5:3b               1.9 GB
```

## Verify the Ollama API

OpenCode communicates with Ollama through its local HTTP API. Test the OpenAI-compatible endpoint:

```
curl http://localhost:11434/v1/models
```

If Ollama is running correctly, the command should return JSON containing the locally installed models.

<details>
<summary>If Ollama is not running</summary>

<p>Start the Ollama server manually:</p>


```
ollama serve
```


<p>Keep that process running and open another terminal for OpenCode.</p>

</details>

## OpenCode provider selection

OpenCode may display **Ollama Cloud** in the provider list. Ollama Cloud is not the same as the
        Ollama server running locally on the machine.

For local models, configure a custom provider pointing to the local Ollama API.

## Create the OpenCode configuration

Create the OpenCode configuration directory if it does not already exist:

```
mkdir -p ~/.config/opencode
```

Open the configuration file:

```
nano ~/.config/opencode/opencode.json
```

Add the local Ollama provider:

```
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama Local",
      "options": {
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "qwen3:4b": {
          "name": "Qwen 3 4B"
        },
        "deepseek-coder:6.7b": {
          "name": "DeepSeek Coder 6.7B"
        },
        "codegemma:2b": {
          "name": "CodeGemma 2B"
        },
        "deepseek-coder:1.3b": {
          "name": "DeepSeek Coder 1.3B"
        },
        "gemma3:latest": {
          "name": "Gemma 3"
        },
        "gemma3:1b": {
          "name": "Gemma 3 1B"
        },
        "qwen2.5:3b": {
          "name": "Qwen 2.5 3B"
        },
        "mistral:7b": {
          "name": "Mistral 7B"
        }
      }
    }
  }
}
```

When using Nano, save and exit with:

```
Ctrl + O
Enter
Ctrl + X
```

## Start OpenCode

After saving the configuration, start OpenCode:

```
opencode
```

Inside OpenCode, open the model selector:

```
/models
```

The configured models should appear under **Ollama Local**.

## Recommended models

### Qwen 3 4B

```
qwen3:4b
```

A useful first option when balancing general reasoning, coding ability, and local resource consumption.

### DeepSeek Coder 6.7B

```
deepseek-coder:6.7b
```

A larger coding-focused model that can be useful for source-code generation and analysis when enough RAM is
        available.

### Smaller models

```
codegemma:2b
deepseek-coder:1.3b
gemma3:1b
```

Smaller models consume fewer resources, but their ability to follow complex agent workflows and use tools can
        be more limited.

## Tool support matters

OpenCode is an agent, not only a chat interface. To inspect and modify a project effectively, the selected
        model must be able to work reliably with the tools exposed by OpenCode.

A model may work correctly in a normal Ollama chat but still fail when OpenCode requests tool usage.

A typical error is:

```
does not support tools
```

If this occurs, select another model with better tool-calling support.

## Work inside a project directory

The recommended workflow is to enter the project directory before starting OpenCode.

Example:

```
cd ~/Projects/my-project
opencode
```

OpenCode now uses that directory as the working context for the coding session.

For example, given:

```
my-project/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── README.md
```

OpenCode can use its tools to inspect relevant files and provide their contents to the local model as context.

## Example tasks

Once OpenCode is running inside the project, prompts can focus on the repository itself:

```
Analyze this project and explain its structure.
```

```
Find where the database connection is configured.
```

```
Review the PHP files and identify possible errors.
```

```
Explain how authentication works in this project.
```

```
Modify the home page to add a dark mode.
```

## Ollama alone vs OpenCode + Ollama

### Ollama alone

```
cd ~/Projects/my-project
ollama run qwen3:4b
```

Starting Ollama from a directory does **not** automatically grant the model access to that
        directory or its files.

### OpenCode + Ollama

```
cd ~/Projects/my-project
opencode
```

OpenCode provides the file and coding tools, while Ollama performs the local model inference.

## Typical local workflow

```
# 1. Verify available models
ollama list

# 2. Verify Ollama API
curl http://localhost:11434/v1/models

# 3. Enter the project
cd ~/Projects/my-project

# 4. Start OpenCode
opencode

# 5. Select a model inside OpenCode
/models
```

## Troubleshooting

<details>
<summary>Ollama Local does not appear in OpenCode</summary>

<p>Verify that the configuration file exists:</p>


```
cat ~/.config/opencode/opencode.json
```


<p>Check the JSON syntax and restart OpenCode after making changes.</p>

</details>
<details>
<summary>OpenCode cannot connect to Ollama</summary>

<p>Test the API directly:</p>


```
curl http://localhost:11434/v1/models
```


<p>If the request fails, verify that Ollama is running:</p>


```
ollama serve
```



</details>
<details>
<summary>The model does not support tools</summary>

<p>Choose another model from <code>/models</code>. Coding agents depend on reliable tool support, so very small
          or older models may not be suitable even if they work correctly for normal chat.</p>

</details>
<details>
<summary>Check installed Ollama models</summary>



```
ollama list
```



</details>

## Quick reference

```
# List local models
ollama list

# Start Ollama server
ollama serve

# Test local API
curl http://localhost:11434/v1/models

# Edit OpenCode configuration
nano ~/.config/opencode/opencode.json

# Open a project
cd ~/Projects/my-project

# Start OpenCode
opencode
```

## Key concept

**Ollama runs the model. OpenCode gives the model the ability to work with the project.**

This separation makes it possible to use local language models for coding workflows while keeping model
        inference on the local machine.
