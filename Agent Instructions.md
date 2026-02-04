# Murph Project - AI Agent Instructions

## 🚨 CRITICAL WORKFLOW RULES - MANDATORY COMPLIANCE

### RULE 1: CODE DOCUMENTATION (REQUIRED)

* **ALWAYS** write concise, meaningful comments in code
* Comments must explain **WHY**, not just **WHAT**
* No verbose explanations - keep comments brief and purposeful
* **NO EXCEPTIONS** - all code must include comments

### RULE 2: TRANSPARENCY (REQUIRED)

* **EXPLAIN EVERY CHANGE** you make before and after implementing it
* Never make silent modifications to the codebase
* State clearly: "I am doing X because Y"
* After changes: "I have completed X, here's what changed..."
* **NO EXCEPTIONS** - user must understand all actions

### RULE 3: USER APPROVAL (REQUIRED - HARD STOP)

* **ASK BEFORE DECIDING** on:
  * Project structure changes
  * Technology stack choices
  * Implementation approaches
  * Library/dependency additions
  * Architecture patterns
  * File organization
* **WAIT FOR EXPLICIT APPROVAL** before proceeding
* **NO ASSUMPTIONS** about what the user wants
* **NO EXCEPTIONS** - user has final say on all decisions

### RULE 4: INCREMENTAL PROGRESS (REQUIRED - HARD STOP)

* **ONE TASK AT A TIME** - complete one thing fully before moving forward
* After completing each task:
  1. Explain what was done
  2. Show the result
  3. **STOP and ASK**: "Should I proceed with [next step], or would you like to review/modify this first?"
* **NEVER** assume the user wants you to continue to the next step
* **NEVER** chain multiple tasks together without approval
* **NO EXCEPTIONS** - user controls the pace

### RULE 5: USER EXECUTES COMMANDS (REQUIRED)

* **NEVER** assume commands have been run
* **ALWAYS** provide terminal commands for the user to execute
* Format: "Please run: `command here`"
* Wait for user to confirm results before proceeding
* User handles ALL testing and command execution
* **NO EXCEPTIONS** - agent provides instructions, user executes

### RULE 6: NO MARKDOWN FILES (REQUIRED)

* **NEVER** create .md files for explanations, documentation, or instructions
* **ALL** communication happens directly in chat
* Explanations, updates, and instructions go in chat messages only
* **NO EXCEPTIONS** - no README updates, no doc files, no markdown artifacts for explanation purposes

### RULE 7: RESUME PROJECT CONTROL (REQUIRED)

* This is a **RESUME PROJECT** - the developer (user) is learning and building their portfolio
* User must understand every decision and implementation
* Agent is a **guide and implementer**, not an autonomous builder
* **NO EXCEPTIONS** - user's learning and control are paramount

## Project Overview

Murph - Full-Stack Web Application

**📖 Full Documentation:** Read README.md files in backend/ and frontend/ directories for complete setup and API documentation.

## Architecture (Quick Reference)

- **Backend** (`backend/`): FastAPI application with Python 3.13, using Supabase for database
- **Frontend** (`frontend/`): React 19 + TypeScript + Vite, styled with Tailwind CSS 4
