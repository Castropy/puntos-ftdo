import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

// Componente para el control de acceso del personal de tienda
export const Login: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    // Procesa el intento de inicio de sesion contra Firebase Auth
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (err) {
            setError("Credenciales invalidas. Verifique el correo y la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-farmatodo-lightBg px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-farmatodo-blue">Farmatodo</h1>
                    <p className="text-sm text-farmatodo-textSecondary mt-1">
                        Gestion de Puntos Externos
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-farmatodo-red text-farmatodo-red text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Correo Institucional
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tienda@farmatodo.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-farmatodo-textPrimary mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-farmatodo-blue focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-farmatodo-blue hover:bg-farmatodo-blueHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farmatodo-blue disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Iniciando sesion..." : "Iniciar Sesion"}
                    </button>
                </form>
            </div>
        </div>
    );
};