

import { TaskType } from "../types/TypesDB";
import {
  subscribeTasksByUser,
  addTask as svcAddTask,
  updateTask as svcUpdateTask,
  deleteTask as svcDeleteTask
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
    this.unsubscribeTasks?.();
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <style>
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
        .container { padding: 2rem; color: var(--text); background: var(--bg); min-height: 100vh; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .top-bar h1 { color: var(--accent); margin: 0; }
        button { background: var(--accent); color: #000; border: none; padding: .5rem 1.2rem; border-radius: 30px; cursor: pointer; font-weight: bold; transition: .3s; }
        button:hover { background: #06d6a0; }
        #logout-btn { background: transparent; border: 1px solid var(--accent); color: var(--accent); }
        .tasks { display: grid; gap: 2rem; }
        .section { background: var(--card-bg); padding: 1rem; border-radius: 8px; }
        .section h2 { margin-top: 0; color: var(--accent); }
        .list { list-style: none; padding: 0; margin: 0; }
        .list li { display: flex; justify-content: space-between; align-items: center; background: #222; margin-bottom: .5rem; padding: .8rem; border-radius: 6px; }
        .list li.done { opacity: .6; text-decoration: line-through; }
        .actions { display: flex; gap: .5rem; }
        .actions button { background: none; border: none; color: var(--text); font-size: 1.2rem; cursor: pointer; transition: transform .2s; }
        .actions button:hover { transform: scale(1.3); }
        .empty { color: #888; text-align: center; font-style: italic; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box { background: var(--card-bg); padding: 1rem; border-radius: 12px; width: 90%; max-width: 400px; color: var(--text); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .close { background: none; border: none; font-size: 1.5rem; color: var(--danger); cursor: pointer; }
        input { width: calc(100% - 1rem); margin-bottom: .8rem; padding: .5rem; border: 1px solid var(--accent); border-radius: 4px; background: #111; color: var(--text); }
      </style>

      <div class="container">
        <div class="top-bar">
          <h1>Tareas</h1>
          <div>
            <button id="add-btn">+ Nueva</button>
            <button id="logout-btn">Cerrar sesión</button>
          </div>
        </div>

        <div class="tasks">
          <div class="section" id="pending-section">
            <h2>Pendientes</h2>
            <ul class="list" id="pending-list"></ul>
          </div>
          <div class="section" id="completed-section">
            <h2>Completadas</h2>
            <ul class="list" id="completed-list"></ul>
          </div>
        </div>
      </div>
    `;
  }

  private attachEvents() {
    this.shadowRoot!.getElementById("add-btn")!
      .addEventListener("click", () => this.showModal());
    this.shadowRoot!.getElementById("logout-btn")!
      .addEventListener("click", async () => {
        await logoutUser();
        this.unsubscribeTasks?.();
        window.location.href = "/";
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
    const pendEl = this.shadowRoot!.getElementById("pending-list") as HTMLUListElement;
    const compEl = this.shadowRoot!.getElementById("completed-list") as HTMLUListElement;

    const pending = this.tasks.filter(t => t.status !== "completed");
    const completed = this.tasks.filter(t => t.status === "completed");

    pendEl.innerHTML = pending.length
      ? pending.map(t => this.taskItemHTML(t, false)).join("")
      : `<li class="empty">No hay tareas pendientes</li>`;

    compEl.innerHTML = completed.length
      ? completed.map(t => this.taskItemHTML(t, true)).join("")
      : `<li class="empty">No hay tareas completadas</li>`;

    // attach listeners
    this.shadowRoot!.querySelectorAll(".btn-complete").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        this.toggleStatus(id);
      });
    });
    this.shadowRoot!.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = (e.currentTarget as HTMLElement).dataset.id!;
        this.deleteTask(id);
      });
    });
  }

  private taskItemHTML(task: TaskType, done: boolean) {
    return `
      <li class="${done ? "done" : ""}">
        <span>${task.title}</span>
        <div class="actions">
          <button class="btn-complete" data-id="${task.id}" title="${done ? "Desmarcar" : "Marcar completa"}">
            ${done ? "↺" : "✔️"}
          </button>
          <button class="btn-delete" data-id="${task.id}" title="Eliminar">✖</button>
        </div>
      </li>
    `;
  }

  private async toggleStatus(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    const next = task.status === "completed" ? "todo" : "completed";
    const ok = await svcUpdateTask(id, { status: next });
    if (!ok) console.error("Error al actualizar estado");
  }

  private async deleteTask(id: string) {
    const ok = await svcDeleteTask(id);
    if (!ok) console.error("Error al eliminar tarea");
  }

  private showModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2>Nueva tarea</h2>
          <button class="close">✖</button>
        </div>
        <input id="title" placeholder="Título *" required />
        <input id="desc" placeholder="Descripción (opcional)" />
        <div style="text-align:right">
          <button id="cancel">Cancelar</button>
          <button id="save">Guardar</button>
        </div>
      </div>
    `;
    this.shadowRoot!.appendChild(modal);

    modal.querySelector(".close")!.addEventListener("click", () => modal.remove());
    modal.querySelector("#cancel")!.addEventListener("click", () => modal.remove());

    modal.querySelector("#save")!.addEventListener("click", async () => {
      const title = (modal.querySelector("#title")! as HTMLInputElement).value.trim();
      const desc  = (modal.querySelector("#desc")!  as HTMLInputElement).value.trim();
      if (!title) return alert("El título es obligatorio");
      const uid = localStorage.getItem("userId")!;
      await svcAddTask({ userId: uid, title, description: desc, status: "todo" });
      modal.remove();
    });
  }
}

customElements.define("tasks-page", TasksPage);
export default TasksPage;
