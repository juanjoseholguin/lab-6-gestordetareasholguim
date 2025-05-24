class NeonTaskCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['id', 'title', 'description', 'status'];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  private setupListeners() {
    const statusBtns = this.shadowRoot?.querySelectorAll<HTMLButtonElement>('.btn-status');
    statusBtns?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const newStatus = target.dataset.status!;
        this.setAttribute('status', newStatus);
        this.dispatchEvent(new CustomEvent('task-status-changed', {
          bubbles: true,
          composed: true,
          detail: {
            id: this.getAttribute('id'),
            status: newStatus
          }
        }));
      });
    });

    const deleteBtn = this.shadowRoot?.querySelector<HTMLButtonElement>('.btn-delete');
    deleteBtn?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('task-deleted', {
        bubbles: true,
        composed: true,
        detail: { id: this.getAttribute('id') }
      }));
    });
  }

  private getStatusText(status: string) {
    switch (status) {
      case 'todo': return 'Por hacer';
      case 'in-progress': return 'En progreso';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  }

  private render() {
    const title = this.getAttribute('title') || 'Sin título';
    const description = this.getAttribute('description') || '';
    const status = this.getAttribute('status') || 'todo';

    this.shadowRoot!.innerHTML = `
      <style>
        :host { display: block; font-family: 'Segoe UI', sans-serif; }
        .card {
          border-radius: 1rem;
          padding: 1rem;
          margin: 1rem 0;
          background: #121212;
          border: 2px solid #0ff;
          box-shadow: 0 0 12px #0ff8;
          transition: background .3s ease;
        }
        .card[data-status="todo"] { border-left: 5px solid #00f2ff; }
        .card[data-status="in-progress"] { border-left: 5px solid #ffc107; }
        .card[data-status="completed"] {
          border-left: 5px solid #00e676;
          opacity: .9;
        }
        .header { display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 1.2rem; color: #0ff; margin: 0; }
        .tag {
          padding: .2rem .6rem;
          border-radius: 1rem;
          font-size: .8rem;
          text-transform: uppercase;
          background: #0ff2;
          color: #0ff;
        }
        .tag.todo { background: #00f2ff33; color: #00f2ff; }
        .tag.in-progress { background: #ffc10733; color: #ffc107; }
        .tag.completed { background: #00e67633; color: #00e676; }
        .description {
          margin: .8rem 0;
          color: #ccc;
          font-size: .95rem;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .controls { display: flex; gap: .5rem; }
        button {
          border: none;
          border-radius: 6px;
          padding: .4rem .8rem;
          font-size: .8rem;
          background: transparent;
          color: #0ff;
          cursor: pointer;
          outline: 1px solid #0ff4;
          transition: all .2s ease-in-out;
        }
        button.active { background: #0ff; color: #000; }
        .btn-delete {
          background: #ff1744;
          color: #fff;
          border: none;
          transition: background .3s;
        }
        .btn-delete:hover { background: #d50000; }
      </style>

      <div class="card" data-status="${status}">
        <div class="header">
          <h3 class="title">${title}</h3>
          <span class="tag ${status}">${this.getStatusText(status)}</span>
        </div>
        <p class="description">${description}</p>
        <div class="footer">
          <div class="controls">
            <button class="btn-status ${status==='todo'?'active':''}" data-status="todo">Por hacer</button>
            <button class="btn-status ${status==='in-progress'?'active':''}" data-status="in-progress">En progreso</button>
            <button class="btn-status ${status==='completed'?'active':''}" data-status="completed">Completada</button>
          </div>
          <button class="btn-delete">Eliminar</button>
        </div>
      </div>
    `;
  }
}

customElements.define('neon-task-card', NeonTaskCard);
export default NeonTaskCard;
