import "./root/RootApp";
import "./components/LoginForm";
import "./components/RegisterForm";
import "./components/TaskForm";
import "./components/TaskCard";
import "./components/TaskList";
import "./pages/MainPage";
import "./pages/FourPage";
import "./pages/TasksPage";

window.addEventListener("DOMContentLoaded", () => {
  const app = document.createElement("root-app");
  document.body.appendChild(app);
});
