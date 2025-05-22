# AI Development Workflow Platform

## Overview
An intelligent, agent-powered development workflow system that automates software development tasks through a collaborative Kanban board interface.

## Features
- AI-driven task planning
- Automated code generation
- Intelligent code review
- Human-in-the-loop validation
- Real-time workflow tracking

## Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Docker
- MongoDB

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/decagondev/ai-dev-workflow.git
cd ai-dev-workflow
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your specific configurations
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Agents
cd ../agents
pip install -r requirements.txt
```

### 4. Run Development Servers
```bash
# Start all services with Docker
docker-compose up --build
```

## Core Workflow
1. Create Task
2. AI Planning Agent breaks down task
3. Code Generation Agent implements
4. Code Review Agent analyzes
5. Human validates/adjusts

## API Endpoints
- `POST /tasks/create`: Initialize new task
- `GET /tasks/{id}/status`: Retrieve task status
- `POST /tasks/{id}/approve`: Approve task modifications

## Security
- JWT Authentication
- Role-based access control
- Comprehensive logging

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License
MIT License

