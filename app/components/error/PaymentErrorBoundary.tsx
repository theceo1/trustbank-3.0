import { Component } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorLogger } from '@/app/lib/services/monitoring/ErrorLogger';
import Image from 'next/image';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorLogger.logError({
      error,
      errorInfo,
      context: 'PaymentFlow'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto mb-4">
              <Image 
                src="/images/error-illustration.svg" 
                alt="Error" 
                className="w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Something went wrong
            </h3>
            <p className="text-gray-600">
              We apologize for the inconvenience. Our team has been notified.
            </p>
            <div className="space-x-3">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/support'}
                variant="ghost"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}