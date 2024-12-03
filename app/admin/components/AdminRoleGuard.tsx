import { useAdminAuth } from "../context/AdminAuthContext";

interface AdminRoleGuardProps {
  children: React.ReactNode;
}

export function AdminRoleGuard({ children }: AdminRoleGuardProps) {
  const { adminUser } = useAdminAuth();

  if (!adminUser) {
    return null;
  }

  return <>{children}</>;
} 