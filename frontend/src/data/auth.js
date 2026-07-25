const baseUrl = import.meta.env.VITE_API_URL;

export const login = async ({ email, password }) => {
    const emailLowerCase = email.toLowerCase();
    const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: emailLowerCase, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const register = async ({ name, email, password, phone }) => {
    const emailLowerCase = email.toLowerCase();
    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ username : name, email: emailLowerCase, password, phone }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export const loginAdmin = async ({ username, password }) => {
    const response = await fetch(`${baseUrl}/auth/login-admin`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;

}