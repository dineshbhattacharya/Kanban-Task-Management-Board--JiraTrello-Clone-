# 🚀 Kanban Task Management Board

A powerful, modern task management application inspired by Jira and Trello. Built with Angular 22, TypeScript, and RxJS, this project provides an intuitive kanban board experience for managing tasks and workflows.

![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Angular](https://img.shields.io/badge/Angular-22.0-red)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Available Scripts](#available-scripts)
  - [Code Generation](#code-generation)
  - [Testing](#testing)
  - [Building for Production](#building-for-production)
- [Technologies & Dependencies](#technologies--dependencies)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **📊 Interactive Kanban Board** - Visualize tasks across multiple workflow stages
- **🎯 Task Management** - Create, update, and delete tasks with ease
- **💾 Responsive UI** - Beautifully designed with modern CSS styling
- **⚡ Real-time Updates** - Reactive programming with RxJS for seamless data binding
- **🔧 Component-Based Architecture** - Modular and maintainable code structure
- **🧪 Test Coverage** - Unit tests with Vitest and Angular testing utilities
- **♿ Accessibility** - Angular CDK integration for enhanced UI accessibility

## 🛠️ Tech Stack

### Frontend Framework
- **Angular 22** - Modern, scalable web application framework
- **TypeScript 6.0** - Strongly-typed JavaScript for robust development
- **RxJS 7.8** - Reactive programming library for async operations

### Build & Development Tools
- **Angular CLI 22** - Command-line interface for Angular development
- **Angular CDK 22** - Angular Component Dev Kit for pre-built behaviors
- **Vite/Vitest** - Fast unit testing framework

### Styling
- **CSS** - Custom styling with modern CSS features
- **Angular Forms** - Reactive and template-driven form handling

### Development Tools
- **Prettier 3.8** - Code formatter for consistent code style
- **EditorConfig** - Maintain consistent coding styles across editors
- **npm 10.9.8** - Package manager

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v10.9.8 or higher) - included with Node.js
- **Angular CLI** (v22.0.5)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dineshbhattacharya/Kanban-Task-Management-Board--JiraTrello-Clone-.git
   cd Kanban-Task-Management-Board--JiraTrello-Clone-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm start
```

Or use Angular CLI directly:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`

**Note:** The application automatically reloads whenever you modify any of the source files during development.

## 📁 Project Structure

```
Kanban-Task-Management-Board--JiraTrello-Clone-/
├── src/
│   ├── main.ts              # Application entry point
│   ├── styles.css           # Global styles
│   ├── index.html           # Main HTML file
│   └── app/                 # Application components and services
├── public/                  # Static assets
├── angular.json             # Angular CLI configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # TypeScript app-specific configuration
├── tsconfig.spec.json       # TypeScript test configuration
├── package.json             # Project dependencies
└── README.md                # This file
```

## 🔨 Development

### Available Scripts

#### `npm start`
Starts the development server on `http://localhost:4200/`
```bash
npm start
```

#### `npm run build`
Builds the application for production in the `dist/` directory
```bash
npm run build
```

#### `npm run watch`
Watches for file changes and rebuilds continuously
```bash
npm run watch
```

#### `npm run test`
Runs unit tests using Vitest
```bash
npm run test
```

#### `npm run ng`
Run any Angular CLI command
```bash
npm run ng -- [command]
```

### Code Generation

Generate new Angular components, services, directives, and more using Angular CLI schematics:

```bash
# Generate a new component
ng generate component component-name

# Generate a new service
ng generate service service-name

# Generate a new directive
ng generate directive directive-name

# Generate a new pipe
ng generate pipe pipe-name

# Generate a new module
ng generate module module-name
```

View all available schematics:
```bash
ng generate --help
```

### Testing

#### Unit Tests
Run unit tests with Vitest:

```bash
npm run test
```

Tests are located alongside component files with `.spec.ts` extension:
```
src/app/components/example.component.spec.ts
```

#### End-to-End Tests
Configure your preferred e2e testing framework (e.g., Cypress, Playwright):

```bash
ng e2e
```

### Building for Production

Build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory. The production build is optimized for performance and speed with:

- Output hashing for cache busting
- Tree-shaking to remove unused code
- Minification and uglification
- Module concatenation

## 📦 Technologies & Dependencies

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @angular/core | ^22.0.0 | Angular framework core |
| @angular/common | ^22.0.0 | Common Angular directives |
| @angular/forms | ^22.0.0 | Form handling (reactive & template-driven) |
| @angular/router | ^22.0.0 | Client-side routing |
| @angular/platform-browser | ^22.0.0 | DOM rendering |
| @angular/cdk | ^22.0.3 | Component Dev Kit utilities |
| rxjs | ~7.8.0 | Reactive programming |
| tslib | ^2.3.0 | TypeScript runtime library |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @angular/cli | ^22.0.5 | CLI tools for development |
| @angular/compiler-cli | ^22.0.0 | Angular template compiler |
| typescript | ~6.0.2 | TypeScript compiler |
| vitest | ^4.0.8 | Unit testing framework |
| prettier | ^3.8.1 | Code formatter |
| jsdom | ^28.0.0 | DOM implementation for testing |

## 💡 Best Practices

### Code Style
- Follow the existing code style enforced by Prettier
- Use TypeScript strict mode for type safety
- Component naming: `component-name.component.ts`
- Service naming: `service-name.service.ts`

### Component Development
- Keep components focused on a single responsibility
- Use reactive forms with RxJS operators
- Leverage Angular CDK for accessibility and common UI patterns
- Implement OnDestroy to clean up subscriptions

### Performance
- Use OnPush change detection strategy when possible
- Unsubscribe from observables to prevent memory leaks
- Lazy-load modules for better initial load time
- Use TrackBy function in *ngFor loops

### Testing
- Write unit tests for services and components
- Aim for meaningful test coverage
- Use descriptive test names following: `should [expected behavior] when [given state]`

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's style guide and includes appropriate tests.

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Overview](https://angular.dev/tools/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [RxJS Documentation](https://rxjs.dev)
- [Angular CDK Documentation](https://material.angular.io/cdk)
- [Vitest Documentation](https://vitest.dev)

## 📞 Support

For issues, questions, or feedback, please open an issue on the GitHub repository.

---

**Made with ❤️ by [Dinesh Bhattacharya](https://github.com/dineshbhattacharya)**

Last Updated: July 2026
