"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { School, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export function LoginForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(email, password);
    if (success) {
      router.replace("/");
    } else {
      setError("Correo o contraseña incorrectos");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-2xl bg-accent mb-6">
            <School className="w-10 h-10 text-primary-dark" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Liahona</h1>
          <p className="text-lg text-white/70 max-w-md">
            Sistema de gestión escolar. Administra estudiantes, pagos y calendario académico en un solo lugar.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 bg-surface">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <School className="w-6 h-6 text-accent" />
            </div>
            <span className="text-2xl font-bold text-primary">Liahona</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-bold text-primary text-center mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-sm text-muted text-center mb-8">
              Ingresa tus credenciales para acceder al sistema
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="admin@liahona.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  id="password"
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-muted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-danger text-center bg-red-50 rounded-lg py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>

            <p className="text-xs text-muted text-center mt-6">
              Demo: admin@liahona.edu / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}