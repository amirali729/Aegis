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




const AuthApiEndpoint = {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/resetPassword',
    REFRESH: '/auth/refresh',
    LOGOUT_ALL: '/auth/logoutAll'
}
export const { SIGNUP, LOGIN, LOGOUT, RESET_PASSWORD, REFRESH, LOGOUT_ALL } = AuthApiEndpoint