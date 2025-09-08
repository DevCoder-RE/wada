# Gemini Code Assistant Context

This file provides the Gemini code assistant with a comprehensive overview of the BMad Method project.

## Project Overview

This project, the BMad Method, is a framework for AI-driven software development. It provides a structured workflow and a team of specialized AI agents to assist in the planning, design, development, and testing of software projects. The BMad Method is designed to be extensible, with different "bundles" that adapt the framework to specific domains, such as 2D Unity game development, infrastructure and DevOps, and creative writing.

The core of the BMad Method is a two-phase workflow:

1.  **Planning Workflow:** This phase is typically performed in a web UI with powerful AI models. It involves agents like the Analyst, Product Manager (PM), and Architect to create a Product Requirements Document (PRD) and a System Architecture document.
2.  **Core Development Cycle:** This phase takes place in an IDE. The PRD and architecture documents are "sharded" into epics and stories. The Developer (`dev`) agent then implements these stories in a sequential and structured manner.

The BMad Method is highly configurable through YAML files and is designed to be used with AI-powered IDEs and code assistants.

### Key Concepts

*   **Agents:** The BMad Method uses a team of specialized AI agents, each with a specific role and set of capabilities. The core agents include an Analyst, Architect, Developer, Product Manager, Product Owner, QA, and Scrum Master.
*   **Bundles:** The BMad Method is organized into "bundles" that package agents, tasks, templates, and workflows for a specific domain. This allows the framework to be adapted to different types of projects.
*   **Workflows:** The BMad Method defines structured workflows for both planning and development. These workflows ensure that all necessary steps are followed and that the AI agents have the context they need to perform their tasks.
*   **Sharding:** The process of breaking down the PRD and architecture documents into smaller, more manageable epics and stories that can be assigned to the developer agent.
*   **Configuration:** The BMad Method is configured through YAML files, allowing users to customize the framework to their specific needs.

## Using the BMad Method

The BMad Method is designed to be used with an AI-powered IDE or code assistant. The primary way to interact with the BMad Method is by invoking the various agents to perform tasks.

### Agent Invocation

Agents are invoked using a slash command or an `@` mention, depending on the IDE. For example, to invoke the Product Manager agent, you would use `@pm` or `/pm`. Each bundle can also have its own custom prefix.

### The Development Workflow

The core development workflow is as follows:

1.  **Story Creation:** The Scrum Master (`sm`) agent creates a new story from the sharded epics and architecture.
2.  **Story Validation:** The Product Owner (`po`) agent validates the story to ensure it aligns with the project requirements.
3.  **Development:** The Developer (`dev`) agent implements the story, following a strict, sequential process of implementing tasks, writing tests, and running validations.
4.  **QA Review:** The QA agent reviews the completed story, performs a test architecture analysis, and provides a quality gate decision.
5.  **Completion:** Once the story has passed QA, it is marked as "Done".

## Project Structure

The BMad Method project is organized into a series of directories, each containing a specific "bundle" of agents, tasks, templates, and workflows.

*   `.bmad-core/`: The core of the BMad Method framework. This directory contains the base agents, tasks, and templates that are used across all bundles.
*   `.bmad-2d-unity-game-dev/`: A bundle for developing 2D games with Unity and C#.
*   `.bmad-2d-phaser-game-dev/`: A bundle for developing 2D games with Phaser and Node.js.
*   `.bmad-infrastructure-devops/`: A bundle for infrastructure and DevOps tasks.
*   `.bmad-creative-writing/`: A bundle for creative writing projects.

### Key Files

*   `.bmad-core/user-guide.md`: The main user guide for the BMad Method.
*   `.bmad-core/core-config.yaml`: The core configuration file for the BMad Method.
*   `.bmad-core/agents/`: The directory containing the definitions for the core AI agents.
*   `.bmad-core/tasks/`: The directory containing the definitions for the core tasks that can be performed by the agents.
*   `.bmad-core/templates/`: The directory containing the templates used by the agents to generate documents.
*   `GEMINI.md`: This file, which provides a comprehensive overview of the project for the Gemini code assistant.
