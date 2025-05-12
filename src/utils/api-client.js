const BASE_URL = 'http://vfast.devmaster.in/api/v1';

/**
 * Decode a JWT token and return the payload.
 * @param {string} token - The JWT token.
 * @returns {object} Decoded payload of the token.
 */
function jwt_decode(token) {
    const payload = token.split('.')[1]; // Extract the payload part
    return JSON.parse(atob(payload)); // Decode from base64 and parse JSON
}

/**
 * Set the authentication token.
 * @param {string} token - The OAuth2 token.
 */
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authToken_expires', jwt_decode(token).exp);
}

/**
 * Get the current authentication token.
 * @returns {string|null} The OAuth2 token.
 */
function getAuthToken() {
    const expires = localStorage.getItem('authToken_expires');
    if (expires && Date.now() >= expires * 1000) clearAuthToken();
    return localStorage.getItem('authToken');
}

/**
 * Clear the authentication token.
 */
function clearAuthToken() {
    // localStorage.removeItem('_grecaptcha')
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('authToken_expires')
    // localStorage.removeItem('username');
    localStorage.clear()
}

/**
 * Get user data from the stored JWT token.
 * @returns {object|null} The decoded user data.
 */
function getUserData() {
    const token = getAuthToken();
    return token ? jwt_decode(token) : null;
}

/**
 * Make an HTTP request to the API.
 *
 * @param {string} endpoint - The API endpoint (e.g., '/user/login').
 * @param {object} [options={}] - Fetch options.
 * @param {string} [options.method='GET'] - HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [options.headers] - Additional headers to include in the request.
 * @param {object} [options.body] - The request payload to be sent as JSON.
 * @param {boolean} [requiresAuth=false] - Whether the endpoint requires authentication.
 * @returns {Promise<object>} A promise that resolves with the JSON response or rejects with an error.
 *
 * @throws {Error} Will throw an error if the response is not ok or if there's a network issue.
 *
 * @example
 * // Making a POST request with authentication
 * apiRequest('/user/login', {
 *     method: 'POST',
 *     body: { username: 'user', password: 'pass' },
 * }, true)
 * .then(data => {
 *     console.log('Login successful:', data);
 * })
 * .catch(error => {
 *     console.error('Login failed:', error.message);
 * });
 */
async function apiRequest(endpoint, options = {}, requiresAuth = false) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const authToken = getAuthToken();
    if (requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log("ApiRequest - ", url);

    const fetchOptions = {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = JSON.stringify(errorData.detail);
                }
                if (errorData.data) {
                    errorMessage += " error_data : " + JSON.stringify(errorData.data);
                }
                if (errorData.message) {
                    errorMessage += " error_message : " + JSON.stringify(errorData.message);
                }
            } catch (e) {
                console.log("Error parsing response JSON:", e);
            }
            throw new Error(errorMessage);
        }

        // Handle HTTP 204 No Content
        if (response.status === 204) {
            return {};
        }

        return await response.json();
    } catch (error) {
        console.error("apiRequest failed:", error.message);
        throw error;
    }
}

export { setAuthToken, getAuthToken, clearAuthToken, getUserData, apiRequest };
