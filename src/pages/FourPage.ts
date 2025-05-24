class NeonFourPage extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setListeners();
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #111 100%);
          font-family: 'Orbitron', sans-serif;
          color: #0ff;
        }

        .container {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 2rem;
        }

        .glitch {
          font-size: 6rem;
          color: #0ff;
          position: relative;
          animation: flicker 1.5s infinite;
        }

        .glitch::before,
        .glitch::after {
          content: '404';
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          overflow: hidden;
        }

        .glitch::before {
          color: #f0f;
          z-index: -1;
          animation: glitchTop 1s infinite linear alternate-reverse;
        }

        .glitch::after {
          color: #0f0;
          z-index: -1;
          animation: glitchBottom 1s infinite linear alternate-reverse;
        }

        @keyframes glitchTop {
          0% { transform: translate(1px, -1px); }
          100% { transform: translate(-2px, 2px); }
        }

        @keyframes glitchBottom {
          0% { transform: translate(-1px, 1px); }
          100% { transform: translate(2px, -2px); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .message {
          margin-top: 1rem;
          font-size: 1.5rem;
          color: #ccc;
        }

        .info {
          font-size: 1rem;
          color: #888;
          margin-bottom: 2rem;
        }

        button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          color: #000;
          background: #0ff;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
        }

        button:hover {
          background: #00cccc;
          transform: scale(1.05);
        }
      </style>

      <div class="container">
        <div class="glitch">404</div>
        <div class="message">¡Ups! Página no encontrada :cc</div>
        <div class="info">Parece que esta dirección no existe o fue eliminada ja ja ja.</div>
        <button id="goHome">Ir al inicio</button>
      </div>
    `;
  }

  private setListeners() {
    const btn = this.shadowRoot!.getElementById("goHome") as HTMLButtonElement;
    btn.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("route-change", {
        bubbles: true,
        composed: true,
        detail: { path: "/" }
      }));
    });
  }
}

customElements.define("neon-404", NeonFourPage);
export default NeonFourPage;
