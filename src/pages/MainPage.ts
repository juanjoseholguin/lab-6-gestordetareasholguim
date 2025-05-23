
import { onAuthChange } from "../services/firebase/auth-service";

class MainPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.renderSkeleton();
    this.handleAuth();
  }

  private renderSkeleton() {
    this.shadowRoot!.innerHTML = `
      <style>
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&display=swap");

        :host {
          display: block;
          font-family: 'Orbitron', sans-serif;
          --bg-color: #0d0d0d;
          --neon-pink: #ff00c8;
          --neon-blue: #00ffe7;
          --neon-purple: #a100ff;
          --text-light: #f0f0f0;
          --text-muted: #999;
          --card-bg: #1a1a1a;
          --btn-radius: 30px;
        }

        .container {
          padding: 50px 20px;
          max-width: 900px;
          margin: auto;
          text-align: center;
          background: var(--bg-color);
          min-height: 100vh;
        }

        .auth-box {
          background: var(--card-bg);
          border: 2px solid var(--neon-purple);
          border-radius: 16px;
          padding: 40px 30px;
          box-shadow: 0 0 15px var(--neon-blue);
          animation: fadeIn 1s ease-in;
        }

        h1 {
          font-size: 2.8rem;
          color: var(--neon-blue);
          text-shadow: 0 0 5px var(--neon-blue), 0 0 15px var(--neon-pink);
        }

        p {
          color: var(--text-muted);
          font-size: 1.1rem;
          margin: 20px 0;
        }

        .actions {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 25px;
          flex-wrap: wrap;
        }

        button {
          font-size: 1rem;
          padding: 14px 28px;
          border-radius: var(--btn-radius);
          border: none;
          cursor: pointer;
          color: #fff;
          background: linear-gradient(135deg, var(--neon-blue), var(--neon-pink));
          box-shadow: 0 0 10px var(--neon-blue);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        button:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 20px var(--neon-pink), 0 0 25px var(--neon-blue);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          h1 {
            font-size: 2rem;
          }

          .actions {
            flex-direction: column;
            gap: 15px;
          }

          button {
            width: 100%;
            max-width: 250px;
          }
        }
      </style>

      <div class="container">
        <!-- contenido dinámico -->
      </div>
    `;
  }

  private handleAuth() {
    onAuthChange(user => {
      if (user) {
        window.history.pushState({}, "", "/tasks");
        this.dispatchEvent(new CustomEvent("route-change", {
          bubbles: true,
          composed: true,
          detail: { path: "/tasks" },
        }));
      } else {
        this.showAuthOptions();
      }
    });
  }

  private showAuthOptions() {
    const container = this.shadowRoot!.querySelector(".container") as HTMLElement;
    container.innerHTML = `
      <div class="auth-box">
        <h1>¡Bienvenidoooo!</h1>
        <p>Administra tus tareas como un profesional con la mejor app creada.</p>
        <p><small>Inicia sesión o regístrate para continuar :D.</small></p>
        <div class="actions">
          <button id="login-btn">Iniciar sesión</button>
          <button id="register-btn">Registrarse</button>
        </div>
      </div>
    `;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const loginBtn = this.shadowRoot!.getElementById("login-btn") as HTMLElement;
    const registerBtn = this.shadowRoot!.getElementById("register-btn") as HTMLElement;

    loginBtn.addEventListener("click", () => {
      window.history.pushState({}, "", "/login");
      this.dispatchEvent(new CustomEvent("route-change", {
        bubbles: true,
        composed: true,
        detail: { path: "/login" },
      }));
    });

    registerBtn.addEventListener("click", () => {
      window.history.pushState({}, "", "/register");
      this.dispatchEvent(new CustomEvent("route-change", {
        bubbles: true,
        composed: true,
        detail: { path: "/register" },
      }));
    });
  }
}

customElements.define("main-page", MainPage);
export default MainPage;
