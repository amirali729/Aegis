// | Endpoint                          | Verify JWT  | Priority     |
// | --------------------------------- | ----------  | --------     |
// | `GET /me`                         | ✅          | ⭐⭐⭐⭐⭐   |
// | `PATCH /me`                       | ✅          | ⭐⭐⭐⭐     |
// | `POST /verify-email`              | ❌          | ⭐⭐⭐⭐     |
// | `POST /resend-verification`       | ❌          | ⭐⭐⭐⭐     |
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

// NOTE: `RESET_PASSWORD` used to point at `/auth/resetPassword`, but that
// endpoint is actually "change password while logged in", which is a
// different flow from a token-based password reset. It has been renamed
// to CHANGE_PASSWORD, and FORGOT_PASSWORD / RESET_PASSWORD now refer to
// the real token-based reset flow. This is a breaking API rename.

const AuthApiEndpoint = {
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  LOGOUT_ALL: '/auth/logoutAll',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/changePassword',
  VERIFY_EMAIL: '/auth/verifyEmail',
  RESEND_VERIFICATION: '/auth/resendVerification',
  FORGOT_PASSWORD: '/auth/forgotPassword',
  RESET_PASSWORD: '/auth/resetPassword',
  ME: '/auth/me',
};
export const {
  SIGNUP,
  LOGIN,
  LOGOUT,
  LOGOUT_ALL,
  REFRESH,
  CHANGE_PASSWORD,
  VERIFY_EMAIL,
  RESEND_VERIFICATION,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  ME,
} = AuthApiEndpoint;
