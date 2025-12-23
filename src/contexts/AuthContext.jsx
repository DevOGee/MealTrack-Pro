import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Simple hash function for demo purposes (NOT secure for production)
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
};

// Seeded users
const SEEDED_USERS = [
    {
        id: 'admin-1',
        email: 'gee.mwerevu@gmail.com',
        username: 'superadmin',
        password_hash: simpleHash('passcode123!'),
        role: 'ADMIN',
        is_active: true,
        email_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        last_login_at: null
    },
    {
        id: 'user-demo',
        email: 'demo@mealtrack.pro',
        username: null,
        password_hash: simpleHash('demo123!'),
        role: 'USER',
        is_active: true,
        email_verified: true,
        created_at: '2024-06-01T00:00:00Z',
        last_login_at: null
    }
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize users in localStorage if not present
    useEffect(() => {
        const storedUsers = localStorage.getItem('Users');
        if (!storedUsers) {
            localStorage.setItem('Users', JSON.stringify(SEEDED_USERS));
        }

        // Check for existing session
        const session = localStorage.getItem('auth_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.expires > Date.now()) {
                    setUser(sessionData.user);
                } else {
                    localStorage.removeItem('auth_session');
                }
            } catch (e) {
                localStorage.removeItem('auth_session');
            }
        }
        setLoading(false);
    }, []);

    const getUsers = () => {
        try {
            return JSON.parse(localStorage.getItem('Users')) || SEEDED_USERS;
        } catch {
            return SEEDED_USERS;
        }
    };

    const saveUsers = (users) => {
        localStorage.setItem('Users', JSON.stringify(users));
    };

    const addAuditLog = (action, entityType = null, entityId = null) => {
        try {
            const logs = JSON.parse(localStorage.getItem('AuditLog') || '[]');
            logs.push({
                id: 'log-' + Date.now(),
                user_id: user?.id || null,
                action,
                entity_type: entityType,
                entity_id: entityId,
                ip_address: '127.0.0.1',
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('AuditLog', JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to add audit log:', e);
        }
    };

    const login = async (email, password) => {
        const users = getUsers();
        const foundUser = users.find(u =>
            (u.email.toLowerCase() === email.toLowerCase() || u.username === email) &&
            u.password_hash === simpleHash(password)
        );

        if (!foundUser) {
            addAuditLog('LOGIN_FAILED', 'User', email);
            throw new Error('Invalid email or password');
        }

        if (!foundUser.is_active) {
            addAuditLog('LOGIN_BLOCKED', 'User', foundUser.id);
            throw new Error('Account is deactivated. Please contact support.');
        }

        if (!foundUser.email_verified) {
            throw new Error('Please verify your email before logging in.');
        }

        // Update last login
        const updatedUsers = users.map(u =>
            u.id === foundUser.id
                ? { ...u, last_login_at: new Date().toISOString() }
                : u
        );
        saveUsers(updatedUsers);

        // Create session (24 hours)
        const sessionUser = { ...foundUser };
        delete sessionUser.password_hash;

        const session = {
            user: sessionUser,
            expires: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem('auth_session', JSON.stringify(session));
        setUser(sessionUser);

        addAuditLog('LOGIN_SUCCESS', 'User', foundUser.id);

        return sessionUser;
    };

    const signup = async (email, password, name) => {
        const users = getUsers();

        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('An account with this email already exists.');
        }

        const newUser = {
            id: 'user-' + Date.now(),
            email,
            username: null,
            name: name || email.split('@')[0],
            password_hash: simpleHash(password),
            role: 'USER',
            is_active: true,
            email_verified: true, // Auto-verify for demo
            created_at: new Date().toISOString(),
            last_login_at: null
        };

        users.push(newUser);
        saveUsers(users);

        addAuditLog('USER_CREATED', 'User', newUser.id);

        return newUser;
    };

    const logout = () => {
        addAuditLog('LOGOUT', 'User', user?.id);
        localStorage.removeItem('auth_session');
        setUser(null);
    };

    const forgotPassword = async (email) => {
        const users = getUsers();
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (foundUser) {
            addAuditLog('PASSWORD_RESET_REQUESTED', 'User', foundUser.id);
        }

        // In a real app, this would send an email
        return true;
    };

    const resetPassword = async (email, newPassword) => {
        const users = getUsers();
        const updatedUsers = users.map(u =>
            u.email.toLowerCase() === email.toLowerCase()
                ? { ...u, password_hash: simpleHash(newPassword) }
                : u
        );
        saveUsers(updatedUsers);

        addAuditLog('PASSWORD_RESET_COMPLETED', 'User', email);
        return true;
    };

    const isAdmin = () => user?.role === 'ADMIN';
    const isAuthenticated = () => !!user;

    const value = {
        user,
        loading,
        login,
        logout,
        signup,
        forgotPassword,
        resetPassword,
        isAdmin,
        isAuthenticated,
        addAuditLog,
        getUsers,
        saveUsers
    };

    return (
        <AuthContext.Provider value={value}>
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

export default AuthContext;
