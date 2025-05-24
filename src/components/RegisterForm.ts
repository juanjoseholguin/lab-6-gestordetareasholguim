import { registerUser } from "../services/firebase/auth-service";

class NeonRegisterBox extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: 'Segoe UI', sans-serif;
          background: radial-gradient(circle at top left, #111, #000);
        }
        .form-wrapper {
          width: 380px;
          padding: 2rem;
          border-radius: 1rem;
          background: #0c0c0c;
          border: 2px solid #00ffff;
          box-shadow: 0 0 30px #00ffff66;
          color: #0ff;
        }
        h2 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          font-size: 0.9rem;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          background: #111;
          border: 1px solid #0ff3;
          color: #0ff;
          border-radius: 0.5rem;
          font-size: 1rem;
        }
        input:focus {
          outline: none;
          border-color: #00ffff;
        }
        button {
          width: 100%;
          margin-top: 1rem;
          padding: 0.8rem;
          font-size: 1rem;
          font-weight: bold;
          color: #000;
          background: #00ffff;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        button:hover:enabled {
          background: #00cccc;
        }
        .error {
          margin-top: 1rem;
          text-align: center;
          color: #ff3377;
          font-size: 0.9rem;
        }
        .footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: #aaa;
        }
        .footer a {
          color: #00ffff;
          cursor: pointer;
          text-decoration: underline;
        }
      </style>

      <div class="form-wrapper">
        <h2>Registro</h2>
        <form id="registerForm">
          <div class="form-group">
            <label for="username">Nombre de usuario</label>
            <input id="username" type="text" required placeholder="Usuario" />
          </div>
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input id="email" type="email" required placeholder="correo@example.com" />
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input id="password" type="password" required placeholder="Mínimo 6 caracteres" />
          </div>
          <div class="form-group">
            <label for="confirm">Confirmar contraseña</label>
            <input id="confirm" type="password" required placeholder="Repite tu contraseña" />
          </div>
          <button type="submit" id="submitBtn">Crear cuenta</button>
          <div class="error" id="errorMsg"></div>
        </form>
        <div class="footer">
          ¿Ya tienes cuenta? <a id="loginLink">Inicia sesión</a>
        </div>
      </div>
    `;
  }

  private setupEvents() {
    const form      = this.shadow.getElementById("registerForm") as HTMLFormElement;
    const username  = this.shadow.getElementById("username")    as HTMLInputElement;
    const email     = this.shadow.getElementById("email")       as HTMLInputElement;
    const password  = this.shadow.getElementById("password")    as HTMLInputElement;
    const confirm   = this.shadow.getElementById("confirm")     as HTMLInputElement;
    const errorMsg  = this.shadow.getElementById("errorMsg")    as HTMLDivElement;
    const submitBtn = this.shadow.getElementById("submitBtn")   as HTMLButtonElement;
    const loginLink = this.shadow.getElementById("loginLink")   as HTMLAnchorElement;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.textContent = "";

      const u = username.value.trim();
      const m = email.value.trim();
      const p = password.value;
      const c = confirm.value;

      if (!u || !m || !p || !c) {
        errorMsg.textContent = "Todos los campos son obligatorios.";
        return;
      }
      if (p !== c) {
        errorMsg.textContent = "Las contraseñas no coinciden.";
        return;
      }
      if (p.length < 6) {
        errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Registrando...";

      try {
        const result = await registerUser(m, p, u);
        if (result.success && result.user) {
          localStorage.setItem("userId", result.user.uid);
          window.location.href = "/tasks";
        } else {
          throw new Error((result.error as any)?.message || "Error al registrar");
        }
      } catch (err: any) {
        errorMsg.textContent = err.message;
        submitBtn.disabled = false;
        submitBtn.textContent = "Crear cuenta";
      }
    });

    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent("route-change", {
        bubbles: true,
        composed: true,
        detail: { path: "/login" }
      }));
    });
  }
}

if (!customElements.get("neon-register")) {
  customElements.define("neon-register", NeonRegisterBox);
}
export default NeonRegisterBox;