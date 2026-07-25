// | Endpoint                          | Verify JWT  | Priority     |
// | --------------------------------- | ----------  | --------     |
// | `GET /me`                         | ✅          | ⭐⭐⭐⭐⭐   |
// | `PATCH /me`                       | ✅          | ⭐⭐⭐⭐     |
// | `POST /verify-email`              | ❌          | ⭐⭐⭐⭐     |
// | `POST /resend-verification-email` | ❌          | ⭐⭐⭐⭐     |
// | `POST /forgot-password`           | ❌          | ⭐⭐⭐⭐⭐   |
// | `POST /reset-password`            | ❌          | ⭐⭐⭐⭐⭐   |
// | `DELETE /me`                      | ✅          | ⭐⭐⭐       |
// | `POST /change-email`              | ✅          | ⭐⭐⭐       |

// GET	/users	Get all users (Admin)
// GET	/users/:id	Get a specific user
// GET	/users/me	Get current user's profile
// PATCH	/users/me	Update current user's profile
// PATCH	/users/:id	Update any user (Admin)
// DELETE	/users/me	Delete own account
// DELETE	/users/:id	Delete user (Admin)


const AuthApiEndpoint = {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/resetPassword',
    REFRESH: '/auth/refresh',
    LOGOUT_ALL: '/auth/logoutAll'
}
export const { SIGNUP, LOGIN, LOGOUT, RESET_PASSWORD, REFRESH, LOGOUT_ALL } = AuthApiEndpoint