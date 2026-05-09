# Contributing to Taluq

First off, thank you for considering contributing to Taluq! It's people like you that make this protocol a powerful tool for financial sovereignty in Kenya.

## 🚀 How to Contribute

### 1. Reporting Bugs
If you find a bug, please open an issue in the repository. Provide as much context as possible, including:
- Steps to reproduce the bug.
- Expected vs actual behavior.
- Browser and device specifications.

### 2. Suggesting Enhancements
Have an idea to make Taluq better? We want to hear it!
- Open an issue labeled `enhancement`.
- Describe the current limitation and how your suggestion solves it.
- If it relates to Kenyan financial integration (e.g., adding a new Utility or Statutory body), please provide links to their APIs or payment gateways if possible.

### 3. Pull Requests
If you want to write code and fix a bug or add a feature:
1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes.
4. Ensure your code lints (`pnpm lint`).
5. Issue a pull request describing the changes and linking to any relevant issues.

## 🛠 Development Setup
Taluq is a monorepo utilizing `pnpm`.
```bash
# Install dependencies
pnpm install

# Generate Prisma Client
cd apps/web && pnpm dlx prisma generate

# Run the development server
pnpm dev
```

## ⚖️ Code Style
- We follow strict TypeScript guidelines. No `any` types unless absolutely necessary.
- We adhere to the **Zero-Blue Standard** for UI (Amber on Black). Do not introduce blue light into the Terminal components.

Thank you for helping us build the future of Kenyan finance.