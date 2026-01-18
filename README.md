# AutoStack ⚡

<div align="center">

**The fastest way to scaffold production-ready full-stack applications**

Scaffold complete full-stack applications with frontend, backend, and database in under 60 seconds.

[Get Started](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🚀 Quick Start

Get your full-stack application up and running with a single command:

```bash
# Using npm (npm 7+)
npm create autostack 

# Using npx
npx create-autostack 

# Using yarn
yarn create autostack 

# Using pnpm
pnpm create autostack 

# Using bun
bun create autostack 
```

Then follow the interactive prompts to choose your tech stack!

---

## ✨ Features

- ⚡ **Lightning Fast** - Get your full-stack app running in under 60 seconds
- 🎯 **Production Ready** - Best practices and optimized configurations out of the box
- 🔧 **Fully Configured** - Frontend, backend, and database all connected automatically
- 📦 **Package Manager Agnostic** - Works with npm, yarn, pnpm, bun, or pip
- 🎨 **Multiple Frameworks** - Choose from popular frontend and backend frameworks
- 🗄️ **Database Ready** - MongoDB, MySQL, or PostgreSQL with working model structures
- 💻 **TypeScript Support** - Optional TypeScript for frontend frameworks
- 🎨 **Tailwind CSS** - Pre-configured styling with Tailwind CSS

---

## 🛠️ Supported Technologies

### Frontend Frameworks
- ⚛️ React (JS/TS)
- 🎯 React with SWC (JS/TS)
- 🟢 Vue (JS/TS)
- ⚡ Preact (JS/TS)
- 🔥 Svelte (JS/TS)  
- 🔷 Solid (JS/TS)

### Backend Frameworks
- 🟢 Node.js (Express)
- 🐍 Flask
- ⚡ FastAPI

### Databases
- 🍃 MongoDB
- 🐬 MySQL
- 🐘 PostgreSQL

### Package Managers
- 📦 npm
- 🧶 yarn
- 📦 pnpm
- 🥟 bun
- 🐍 pip

---

## 📖 Documentation

### Installation

AutoStack is designed to be run directly without installation:

```bash
npm create autostack 
```

This will:
1. Prompt you to select your frontend framework
2. Ask you to choose your backend framework
3. Let you pick your database
4. Generate a fully-configured project structure
5. Install all dependencies
6. Set up API routes and database connections

### Project Structure

After scaffolding, your project will have the following structure, 

```
my-app/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/ // If you picked a JS backend
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── config/
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── node_modules/
| OR 
├── backend/ // Else you picked a Python backend
│   ├── main.py
|   ├── ... 
│   ├── .env
│   ├── package.json
│   └── node_modules/
├── README.md
└── .gitignore
```

### Getting Started with Your New App

1. **Navigate to your project:**
   ```bash
   cd my-app
   ```

2. **Set up environment variables (if not configured during setup):**
   ```bash
   # Edit backend/.env with your database connection details
   ```

3. **Start the development servers in separate terminals:**
   ```bash
   # Terminal 1 - Start backend
   cd backend
   npm run dev

   # Terminal 2 - Start frontend
   cd frontend
   npm run dev
   ```

4. **Open your browser:**
   ```
   Frontend: http://localhost:5173 (or specified port)
   Backend:  http://localhost:5000 (or specified port)
   ```

---

## 🎯 Example Usage

```bash
# Create a new app
npm create autostack my-awesome-app

# Follow the prompts:
? Select frontend framework: React
? Select backend framework: Node.js
? Select database: MongoDB
? Install dependencies? Yes

# Navigate to your project
cd my-awesome-app

# Start developing!
cd backend && npm run dev
cd frontend && npm run dev
```

---

## 🔮 Roadmap

I will be working to make AutoStack better! Here's what's coming:

### Coming Soon
- 🎯 Django support
- 🎯 NestJS support
- 🎯 Next.js (via create-t3-app)
- 🎯 Laravel support
- 🎯 Additional database options (SQLite, Redis)
- 🎯 Authentication templates
- 🎯 GraphQL support

There's a lot more I can do that I haven't yet implemented, and with more support and more people, I am sure that this project could become a core part of any full-stack project!

### Future Possibilities
The sky's the limit! I envision AutoStack supporting every major framework and helping developers start projects in any tech stack imaginable.

---

## 🤝 Contributing

I'd love your help to make AutoStack even better! Here's how you can contribute:

### Ways to Contribute
- 🐛 Report bugs by opening an issue
- 💡 Suggest new features or frameworks
- 📝 Create documentation
- 🔧 Submit pull requests
- ⭐ Star this repository
- 📢 Spread the word!

## 📄 License

MIT © Fahad Rasheed

---

## 💬 Support

- 📫 [Open an issue](https://github.com/FahadR004/AutoStack/issues)
- 💬 [Discussions](https://github.com/FahadR004/AutoStack/discussions)

---

## 🙏 Acknowledgments

Built with ❤️ for developers who ship fast.

Special thanks to all our contributors and the amazing open-source community!

---

<div align="center">

**[⬆ back to top](#autostack-)**

Made by Fahad Rasheed

</div>
