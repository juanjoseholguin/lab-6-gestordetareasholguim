import { TaskType } from "../types/TypesDB";
import {
  getTasksByUserId,
  subscribeTasksByUser,
  addTask as svcAddTask,
  updateTask as svcUpdateTask,
  deleteTask as svcDeleteTask,
} from "../services/firebase/TaskService";
import { logoutUser } from "../services/firebase/auth-service";

class TasksPage extends HTMLElement {
  private tasks: TaskType[] = [];
  private unsubscribeTasks?: () => void;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
    this.startRealtimeSubscription();
  }

  disconnectedCallback() {
    this.unsubscribeTasks && this.unsubscribeTasks();
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <style>
        /* tus estilos originales */
        :host {
          --bg: #0f0f1b;
          --text: #f0f0f0;
          --card-bg: #1f1f2e;
          --accent: #00f5d4;
          --warning: #ff9f1c;
          --success: #06d6a0;
          --danger: #ef476f;
          font-family: 'Montserrat', sans-serif;
          display: block;
        }
        .container {
          padding: 2rem;
          color: var(--text);
          background: var(--bg);
          min-height: 100vh;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .top-bar h1 {
          color: var(--accent);
          margin: 0;
        }
        button {
          background: var(--accent);
          color: #000;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 30px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
        }
        button:hover {
          background: #06d6a0;
        }
        #logout-btn {
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
        }
        .task-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }
        .card {
          background: var(--card-bg);
          padding: 1rem;
          border-left: 5px solid var(--accent);
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,255,200,0.2);
        }
        .card.in-progress {
          border-left-color: var(--warning);
        }
        .card.completed {
          border-left-color: var(--success);
        }
        .card.completed h3 {
          text-decoration: line-through;
        }
        .actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
        }
        .actions button {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--text);
          transition: transform 0.2s;
        }
        .actions button:hover {
          transform: scale(1.3);
        }
        .modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-box {
          background: var(--card-bg);
          padding: 1rem;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          color: var(--text);
          position: relative;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--danger);
          cursor: pointer;
        }
        .empty {
          text-align: center;
          color: #888;
          margin-top: 3rem;
        }
      </style>
      <div class="container">
        <div class="top-bar">
          <h1>Tareas</h1>
          <div>
            <button id="add-btn">+ Nueva</button>
            <button id="logout-btn">Cerrar sesión</button>
          </div>
        </div>
        <div class="task-list"></div>
      </div>
    `;
  }

  private attachEvents() {
    this.shadowRoot!
      .getElementById("add-btn")!
      .addEventListener("click", () => this.showModal());
    this.shadowRoot!
      .getElementById("logout-btn")!
      .addEventListener("click", async () => {
        await logoutUser();
        window.history.pushState({}, "", "/");
        this.dispatchEvent(
          new CustomEvent("route-change", {
            bubbles: true,
            composed: true,
            detail: { path: "/" },
          })
        );
      });
  }

 
  private startRealtimeSubscription() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    this.unsubscribeTasks = subscribeTasksByUser(userId, tasks => {
      this.tasks = tasks;
      this.renderTasks();
    });
  }

  
  private renderTasks() {
    const list = this.shadowRoot!.querySelector(".task-list") as HTMLElement;
    list.innerHTML =
      this.tasks.length === 0
        ? `<p class="empty">No tienes tareas. ¡Agrega una!</p>`
        : "";

    this.tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = `card ${task.status}`;
      card.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <div class="actions">
          <button class="status" title="Cambiar estado">⚙️</button>
          <button class="delete" title="Eliminar">🗑️</button>
        </div>
      `;
      card
        .querySelector(".status")!
        .addEventListener("click", () => this.toggleStatus(task.id));
      card
        .querySelector(".delete")!
        .addEventListener("click", () => this.deleteTask(task.id));
      list.appendChild(card);
    });
  }

  private async toggleStatus(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    const statusCycle = {
      todo: "in-progress",
      "in-progress": "completed",
      completed: "todo",
    } as const;

    const newStatus = statusCycle[task.status as keyof typeof statusCycle];
    const ok = await svcUpdateTask(id, { status: newStatus });
    if (!ok) console.error("Error actualizando estado");
  }

  private async deleteTask(id: string) {
    const ok = await svcDeleteTask(id);
    if (!ok) console.error("Error borrando tarea");
  }

  private async addTask(data: {
    title: string;
    description: string;
  }) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const newTask: Omit<TaskType, "id"> = {
      userId,
      title: data.title,
      description: data.description,
      status: "todo",
    };

    const taskId = await svcAddTask(newTask);
    if (!taskId) console.error("Error creando tarea");
  }

  private showModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2>Nueva tarea</h2>
          <button class="close">✖️</button>
        </div>
        <neon-task-form id="task-form"></neon-task-form>
      </div>
    `;
    this.shadowRoot!.appendChild(modal);

    modal
      .querySelector(".close")!
      .addEventListener("click", () => modal.remove());

    modal
      .querySelector("#task-form")!
      .addEventListener("task-submitted", (e: Event) => {
        const custom = e as CustomEvent;
        this.addTask(custom.detail);
        modal.remove();
      });
  }
}

customElements.define("tasks-page", TasksPage);
export default TasksPage;
