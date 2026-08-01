// Kept in its own file (rather than exported from AuthContext.jsx)
// specifically so api.js can import it without creating a circular
// dependency: api.js needs this constant, and AuthContext.jsx needs
// AuthService.js, which needs api.js. Both api.js and AuthContext.jsx
// import from here independently instead.
export const TOKEN_STORAGE_KEY = "dailyos_token";
