import { AuthForm } from '../components/AuthForm';
import Image from 'next/image';

export default function AdminSignupPage() {
    return (
      <div className="flex min-h-screen">
        <div className="flex w-full items-center justify-center px-4 sm:px-6 lg:w-1/2">
          <AuthForm type="signup" />
        </div>
  
        <div className="hidden lg:block lg:w-1/2">
          <div className="relative h-full w-full">
            <Image
              src="/images/admin-auth-bg.jpg"
              alt="Admin authentication"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold">trustBank Admin</h1>
                <p className="mt-2 text-lg">Secure Banking Administration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }