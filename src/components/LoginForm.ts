import { loginUser } from "../services/firebase/auth-service";

class GlitchyLoginForm extends HTMLElement {
  private root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  private render() {
    this.root.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(145deg, #050505, #1a1a1a);
          font-family: 'Segoe UI', sans-serif;
        }
        .form-box {
          background-color: #0a0a0a;
          border: 2px solid #00ffff;
          border-radius: 1rem;
          padding: 2rem;
          width: 360px;
          box-shadow: 0 0 20px #00ffff66;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.7s ease-in-out;
        }
        .form-box h1 {
          color: #00ffff;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        input {
          padding: 0.8rem;
          margin-bottom: 1rem;
          background: #111;
          border: 1px solid #00ffff44;
          color: #0ff;
          border-radius: 0.5rem;
          outline: none;
          transition: border 0.3s;
        }
        input:focus {
          border-color: #0ff;
        }
        button {
          background-color: #0ff;
          color: #000;
          padding: 0.8rem;
          font-weight: bold;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background-color: #00cccc;
        }
        .error {
          margin-top: 0.5rem;
          color: #ff3366;
          text-align: center;
          font-size: 0.9rem;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <div class="form-box">
        <h1>Login</h1>
        <input type="email" id="emailInput" placeholder="Correo electrónico" />
        <input type="password" id="passwordInput" placeholder="Contraseña" />
        <button id="accessBtn">Entrar</button>
        <div class="error" id="errorBox"></div>
      </div>
    `;
  }

  private bindEvents() {
    const emailEl = this.root.getElementById("emailInput") as HTMLInputElement;
    const passEl  = this.root.getElementById("passwordInput") as HTMLInputElement;
    const btn     = this.root.getElementById("accessBtn") as HTMLButtonElement;
    const errorBox= this.root.getElementById("errorBox") as HTMLDivElement;

    btn.addEventListener("click", async () => {
      errorBox.textContent = "";
      const userEmail    = emailEl.value.trim();
      const userPassword = passEl.value.trim();

      if (!userEmail || !userPassword) {
        errorBox.textContent = "Completa todos los campos.";
        return;
      }

      btn.disabled   = true;
      btn.textContent= "Accediendo...";

      const result = await loginUser(userEmail, userPassword);

      if (result.success) {
       
        window.location.href = "/tasks";
        
        
       
      } else {
        const msg = (result.error as any)?.message 
                  || "Credenciales inválidas o error de conexión.";
        errorBox.textContent = msg;
        btn.disabled   = false;
        btn.textContent= "Entrar";
      }
    });
  }
}

if (!customElements.get("glitchy-login")) {
  customElements.define("glitchy-login", GlitchyLoginForm);
}
export default GlitchyLoginForm;
