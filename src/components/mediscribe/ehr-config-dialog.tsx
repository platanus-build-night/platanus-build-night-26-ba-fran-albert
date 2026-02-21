"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Loader2, Check, AlertCircle, Unplug } from "lucide-react";

interface EhrUser {
  firstName: string;
  lastName: string;
  roles: string[];
}

interface EhrConfigDialogProps {
  dataMode: "mock" | "ehr";
  onConnect: () => void;
  onDisconnect: () => void;
}

type ConnectionMode = "mock" | "server";

export function EhrConfigDialog({ dataMode, onConnect, onDisconnect }: EhrConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ConnectionMode>(dataMode === "ehr" ? "server" : "mock");
  const [url, setUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [directToken, setDirectToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(dataMode === "ehr");
  const [connectedUser, setConnectedUser] = useState<EhrUser | null>(null);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/ehr-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, userName, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Error al conectar");
        return;
      }
      setConnected(true);
      setConnectedUser(data.user);
      onConnect();
    } catch {
      setError("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleDirectToken() {
    setError("");
    if (!directToken.trim() || !url.trim()) {
      setError("URL y token son requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: directToken, url }),
      });
      const data = await res.json();
      if (data.mode === "ehr") {
        setConnected(true);
        setConnectedUser(null);
        onConnect();
      }
    } catch {
      setError("Error al guardar el token");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      await fetch("/api/auth/ehr-login", { method: "DELETE" });
      setConnected(false);
      setConnectedUser(null);
      setMode("mock");
      setUrl("");
      setUserName("");
      setPassword("");
      setDirectToken("");
      onDisconnect();
    } finally {
      setLoading(false);
    }
  }

  async function handleModeChange(newMode: ConnectionMode) {
    setMode(newMode);
    setError("");
    if (newMode === "mock" && connected) {
      try {
        await handleDisconnect();
      } catch {
        setError("Error al desconectar");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
          <Settings className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conexión EHR</DialogTitle>
          <DialogDescription>Configurá la fuente de datos clínicos</DialogDescription>
        </DialogHeader>

        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Conectado</span>
              {url && (
                <Badge variant="outline" className="text-xs">
                  {url.replace(/^https?:\/\//, "").slice(0, 30)}
                </Badge>
              )}
            </div>
            {connectedUser && (connectedUser.firstName || connectedUser.lastName) && (
              <p className="text-sm text-muted-foreground">
                Sesión: {connectedUser.firstName} {connectedUser.lastName}
              </p>
            )}
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Unplug className="h-4 w-4 mr-2" />}
              Desconectar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mode selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ehr-mode"
                  checked={mode === "mock"}
                  onChange={() => handleModeChange("mock")}
                  className="accent-primary"
                />
                <span className="text-sm">Mock (datos de ejemplo)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ehr-mode"
                  checked={mode === "server"}
                  onChange={() => handleModeChange("server")}
                  className="accent-primary"
                />
                <span className="text-sm">Servidor externo</span>
              </label>
            </div>

            {mode === "server" && (
              <>
                {/* URL */}
                <div>
                  <label className="text-sm font-medium block mb-1">URL del servidor</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="http://localhost:3000"
                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Login form */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Usuario</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="12345678"
                      className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <Button
                    onClick={handleLogin}
                    disabled={loading || !url || !userName || !password}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Conectar
                  </Button>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t" />
                  <span className="text-xs text-muted-foreground">o</span>
                  <div className="flex-1 border-t" />
                </div>

                {/* Direct token */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Token JWT (pegar directamente)</label>
                  <input
                    type="text"
                    value={directToken}
                    onChange={(e) => setDirectToken(e.target.value)}
                    placeholder="eyJhbG..."
                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button
                    variant="outline"
                    onClick={handleDirectToken}
                    disabled={loading || !url || !directToken}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Usar token
                  </Button>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
