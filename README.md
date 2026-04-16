this is a miniproject for todo-application named KANBAN

LIVE DEPLOY LINK FOR PROJECT  -  https://piyush2o1-mini-project.vercel.app/boards

Mini Project Documentation
Project Title: Task Management / Board Application
Live URL
Open Project

1. Introduction
This project is a Task Management Web Application where users can organize their work
using boards, lists, and cards (similar to Trello). It helps users manage tasks efficiently, track
progress, and collaborate.

2. Objectives
• To provide a platform for managing tasks visually
• To organize work into boards and lists
• To allow users to create, update, and delete tasks
• To improve productivity and workflow management

3. Tech Stack
• Frontend: HTML, CSS, JavaScript (possibly React)
• Backend: Node.js, Express
• Database: MongoDB
• Deployment: Vercel
Projects on platforms like Vercel are deployed apps connected to a Git repository and
can have multiple deployments and configurations.

4. Features
User Features
• User authentication (Login / Signup)
• Session-based access control

Board Management
• Create multiple boards
• Each board represents a project
List Management
• Create lists inside boards (e.g., To Do, In Progress, Done)
Card/Task Management
• Add tasks inside lists
• Edit task details
• Delete tasks
Drag & Drop (if implemented)
• Move tasks between lists

5. System Architecture
Client (Browser)
↓
Frontend (UI)
↓
Backend API (Express)
↓
Database (MongoDB)

6. Authentication Flow
1. User logs in
2. Server verifies credentials
3. Session is created
4. Protected routes are accessed using middleware
Example:

function requireAuth(req, res, next) {
if (!req.session.userId) {
return res.redirect('/auth/login');
}
return next();
}

7. API Endpoints (Sample)
Auth
• POST /auth/register
• POST /auth/login
Boards
• GET /boards
• POST /boards
• DELETE /boards/:id
Lists
• POST /lists
• DELETE /lists/:id
Cards
• POST /cards
• PUT /cards/:id
• DELETE /cards/:id

8. Database Schema (Basic)
User
• id
• email
• password

Board
• id
• title
• userId
List
• id
• title
• boardId
Card
• id
• title
• description
• listId

9. UI Overview
• Dashboard showing all boards
• Board view with multiple lists
• Cards inside lists
• Clean and interactive interface

10. Deployment
• Hosted on Vercel
• Continuous deployment using GitHub
• Accessible via public URL

11. Advantages
• Easy task tracking
• Visual workflow management

• Improves productivity
• Scalable architecture

12. Limitations
• May require login to access boards
• Limited collaboration features (if not implemented)
• No real-time updates (if sockets not used)

13. Future Enhancements
• Real-time collaboration (Socket.io)
• Notifications system
• File attachments
• Team collaboration features
• Mobile responsiveness improvements

14. Conclusion
This project demonstrates full-stack development skills including frontend UI design,
backend API creation, database management, and deployment. It is a practical
implementation of a real-world productivity tool.
