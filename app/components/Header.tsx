import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
      toast({
        id: 'signout-success',
        title: "Success",
        description: "Signed out successfully"
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({   
        id: 'signout-error',
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };
} 