'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/Button';
import Container from '@/app/components/Container';
import Heading from '@/app/components/Heading';

const AuthErrorPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams?.get('error') ?? null;

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return 'Access was denied. Please try signing in again.';
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account.';
      case 'OAuthCallbackError':
        return 'There was an error with the OAuth provider.';
      case 'SessionRequired':
        return 'You must be signed in to access this page.';
      default:
        return 'An unknown authentication error occurred.';
    }
  };

  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center">
          <Heading
            title="Authentication Error"
            subtitle={getErrorMessage(error)}
          />
        </div>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button
            label="Try Again"
            onClick={() => router.push('/')}
          />
          <Button
            outline
            label="Go Home"
            onClick={() => router.push('/')}
          />
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p><strong>Debug Info (Development Only):</strong></p>
            <p>Error: {error}</p>
            <p>URL: {window.location.href}</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default AuthErrorPage;