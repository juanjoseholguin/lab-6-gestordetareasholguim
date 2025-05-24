class NeonTaskForm extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.handleFormEvents();
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 500px;
          margin: 0 auto;
          padding: 1.5rem;
          background: #0a0a0a;
          border: 2px solid #0ff;
          border-radius: 1rem;
          box-shadow: 0 0 20px #00ffff44;
          font-family: 'Segoe UI', sans-serif;
          color: #0ff;
        }

        h3 {
          text-align: center;
          margin-bottom: 1.2rem;
          font-size: 1.5rem;
          color: #00ffff;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        label {
          font-weight: bold;
          margin-bottom: 0.3rem;
          font-size: 0.95rem;
        }

        input, textarea {
          background-color: #111;
          border: 1px solid #0ff5;
          border-radius: 8px;
          padding: 0.8rem;
          font-size: 1rem;
          color: #0ff;
          resize: none;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #0ff;
          box-shadow: 0 0 6px #00ffff99;
        }

        textarea {
          min-height: 100px;
        }

        button {
          background: linear-gradient(135deg, #00ffff, #0099cc);
          color: #000;
          font-weight: bold;
          border: none;
          border-radius: 30px;
          padding: 0.9rem;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px #00ffff55;
        }

        button:active {
          transform: translateY(1px);
        }
      </style>

      <h3>Crear nueva tarea</h3>
      <form id="taskForm">
        <div>
          <label for="title">Título</label>
          <input type="text" id="title" placeholder="Ej: Comprar materiales" required />
        </div>
        <div>
          <label for="description">Descripción</label>
          <textarea id="description" placeholder="Ej: Ir a la tienda por papel y lápices..."></textarea>
        </div>
        <button type="submit">Agregar tarea</button>
      </form>
    `;
  }

  private handleFormEvents() {
    const form = this.shadow.getElementById("taskForm") as HTMLFormElement;
    const title = this.shadow.getElementById("title") as HTMLInputElement;
    const description = this.shadow.getElementById("description") as HTMLTextAreaElement;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const taskTitle = title.value.trim();
      const taskDescription = description.value.trim();

      if (!taskTitle) return;

      this.dispatchEvent(new CustomEvent("task-submitted", {
        bubbles: true,
        composed: true,
        detail: { title: taskTitle, description: taskDescription }
      }));

      form.reset();
    });
  }
}

customElements.define("neon-task-form", NeonTaskForm);
export default NeonTaskForm;
