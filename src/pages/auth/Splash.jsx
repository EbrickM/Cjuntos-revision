import { useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import { useAuthStore } from '../../stores/authStore';
import BonafideLoader from '../../components/common/BonafideLoader';

export default function Splash() {
  const { go } = useApp();
  const authorized = useAuthStore((s) => s.authorized);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  useEffect(() => {
    // Session persists across reloads (sessionStorage, see authStore) — skip
    // straight past the login screen when one is already active.
    const next = !authorized ? 'login' : isAdmin ? 'adminDash' : 'roleSelect';
    const timer = setTimeout(() => go(next), 4500);
    return () => clearTimeout(timer);
  }, [go, authorized, isAdmin]);

  return <BonafideLoader />;
}
