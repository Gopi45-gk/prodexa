# PRODEXA — Smart Task Manager

PRODEXA is a modern, futuristic task management web application built for focused work, helping you organize, prioritize, and achieve your goals with momentum.

## 🚀 Features

- **Smart Dashboard**: A command center for all your daily tasks, providing a comprehensive overview of your productivity score and completion rates.
- **Firebase Authentication**: Secure user login with email/password and Google Sign-in integration.
- **Dynamic Task Management**: Easily create, edit, delete, and categorize tasks. Set priorities (Low, Medium, High) and track deadlines.
- **Advanced Analytics**: Visual representations of your task distribution, weekly productivity, and monthly progress using interactive charts.
- **Beautiful UI/UX**: An elegant, glassmorphic design featuring smooth micro-animations, responsive layouts, and customizable dark/light modes.
- **Activity Tracking**: Real-time logging of your actions (added, updated, completed, or deleted tasks).

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite & Bun
- **Routing**: TanStack Router
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS & Vanilla CSS (with rich animations)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Toast Notifications**: Sonner

## 📦 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (or Bun) installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GOPIKRISHNA104-gk/ascend-task-manager.git
   cd "intern carrer sol"
   ```

2. **Install dependencies:**
   Using npm:
   ```bash
   npm install
   ```
   *Note: If you have Bun installed, you can also run `bun install`.*

3. **Set up Firebase (Required for Authentication):**
   - The application relies on Firebase Authentication.
   - You must enable **Email/Password** and **Google** sign-in methods in your Firebase Console.
   - The Firebase configuration is located in `src/lib/firebase.ts`.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the Application:**
   Open your browser and navigate to `http://localhost:8080/`.

## 📂 Project Structure

- `/src/components`: Contains the core UI components (`Login.tsx`, `Dashboard.tsx`, `Splash.tsx`).
- `/src/lib`: Contains utility functions and third-party configurations like `firebase.ts`.
- `/src/routes`: Contains the application routes managed by TanStack Router.
- `/src/styles.css`: Global styles, CSS variables, and custom keyframe animations.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to explore the codebase and submit pull requests.

## 📜 License

This project is licensed under the MIT License.
