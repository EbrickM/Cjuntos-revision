export { AuthApiError } from '../lib/authApi';
import {
  requestOtp,
  verifyOtp,
  refreshSession,
  requestAdminOtp,
  verifyAdminOtp,
  refreshAdminSession,
  logoutAdmin,
} from '../lib/authApi';

export const authService = {
  requestOtp,
  verifyOtp,
  refreshSession,
  requestAdminOtp,
  verifyAdminOtp,
  refreshAdminSession,
  logoutAdmin,
};
