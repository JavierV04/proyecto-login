"use client";

import { useState } from "react";

export default function Page() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [protectedData, setProtectedData] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("Cargando...");

    // Si estamos registrando, validamos en el front también por velocidad
    if (isRegistering && password !== confirmarPassword) {
      setMensaje("Error: Las contraseñas no coinciden");
      return;
    }

    const endpoint = isRegistering ? "registro" : "login";

    // Construimos el cuerpo de la petición dependiendo de la vista
    const bodyData = isRegistering
      ? { nombre, email, password, confirmar_password: confirmarPassword }
      : { email, password };

    try {
      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Ocurrió un error");
      }

      if (isRegistering) {
        setMensaje("¡Registrado con éxito! Ahora inicia sesión.");
        setIsRegistering(false);
        setPassword("");
        setConfirmarPassword("");
        setNombre("");
      } else {
        localStorage.setItem("token", data.access_token);
        setIsLoggedIn(true);
      }
    } catch (err: any) {
      setMensaje(err.message || "Error conectando con el servidor");
    }
  };

  const probarRutaProtegida = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setProtectedData(`Conectado como: ${data.email} (${data.estado})`);
    } catch (err: any) {
      setProtectedData("Error: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setConfirmarPassword("");
    setNombre("");
    setMensaje("");
    setProtectedData("");
  };

  if (isLoggedIn) {
    return (
      <main style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ background: "#1e293b", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "400px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>¡Bienvenido, estás dentro! 🎉</h1>
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>Tu sesión está activa y protegida con JWT.</p>

          <button
            onClick={probarRutaProtegida}
            style={{ width: "100%", padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginBottom: "15px" }}
          >
            Probar Ruta Protegida (/me)
          </button>

          {protectedData && <p style={{ fontSize: "14px", color: "#38bdf8", marginBottom: "15px" }}>{protectedData}</p>}

          <button
            onClick={handleLogout}
            style={{ width: "100%", padding: "12px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "sans-serif" }}>
      <div style={{ background: "#1e293b", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "24px", fontSize: "24px" }}>
          {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Campo Nombre (Solo aparece al registrarse) */}
          {isRegistering && (
            <div>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", color: "#94a3b8" }}>Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "white", boxSizing: "border-box" }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", color: "#94a3b8" }}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "white", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", color: "#94a3b8" }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "white", boxSizing: "border-box" }}
            />
          </div>

          {/* Campo Confirmar Contraseña (Solo aparece al registrarse) */}
          {isRegistering && (
            <div>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", color: "#94a3b8" }}>Confirmar contraseña</label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "white", boxSizing: "border-box" }}
              />
            </div>
          )}

          <button
            type="submit"
            style={{ padding: "12px", background: "#22c55e", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}
          >
            {isRegistering ? "Registrarse" : "Entrar"}
          </button>
        </form>

        {mensaje && (
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: mensaje.includes("éxito") ? "#4ade80" : "#f87171" }}>
            {mensaje}
          </p>
        )}

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#94a3b8" }}>
          {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}{" "}
          <span
            onClick={() => { setIsRegistering(!isRegistering); setMensaje(""); }}
            style={{ color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}
          >
            {isRegistering ? "Inicia sesión aquí" : "Regístrate aquí"}
          </span>
        </p>
      </div>
    </main>
  );
}