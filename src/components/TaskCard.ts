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
       
      </style>
      <div class="card" data-status="${status}">
        <div class="header">
          <h3 class="title">${title}</h3>
          <span class="tag ${status}">${this.getStatusText(status)}</span>
        </div>
        <p class="description">${description}</p>
        <div class="footer">
          <div class="controls">
            <button class="btn-status" data-status="todo">Por hacer</button>
            <button class="btn-status" data-status="in-progress">En progreso</button>
            <button class="btn-status" data-status="completed">Completada</button>
          </div>
          <button class="btn-delete">Eliminar</button>
        </div>
      </div>
    `;
  }
}

export default NeonTaskCard;
customElements.define('neon-task-card', NeonTaskCard);
