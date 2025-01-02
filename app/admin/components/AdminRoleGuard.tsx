import { useAdminAuth } from "../context/AdminAuthContext";

interface AdminRoleGuardProps {
  children: React.ReactNode;
}

export function AdminRoleGuard({ children }: AdminRoleGuardProps) {
  const { user, isAdmin } = useAdminAuth();

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
} 