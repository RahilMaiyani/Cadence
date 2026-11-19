'use client';

import { apiRequest } from "@/lib/api";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    timezone: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, timezone: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await apiRequest<{ success: boolean; user: User; }>("/auth/me")
                if (data?.user) {
                    setUser(data.user);
                }
            }
            catch (err) {
                setUser(null);
            }
            finally {
                setIsLoading(false);
            }
        }

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await apiRequest<{ success: boolean; user: User; }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
            }),
        });
        setUser(data.user);
    };

    const register = async (name: string, email: string, password: string, timezone?: string) => {
        const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

        const data = await apiRequest<{ success: boolean; user: User; }>("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password,
                timezone: userTimezone,
            }),
        });
        setUser(data.user);
    };

    const logout = async () => {
        try {
            await apiRequest('/auth/logout', {
                method: "POST"
            });
        }
        finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}