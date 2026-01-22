import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      toast({
        title: 'Reset link sent!',
        description: 'If the email exists, a password reset link has been sent.',
      });
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send reset link. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <div className="flex flex-col items-center gap-6 mb-8">
            <img 
              src="/soccer-scouting-logo.jpeg" 
              alt="Soccer Scouting Academy Reality Show" 
              className="max-w-[200px] h-auto"
            />
            <h1 className="text-4xl font-bold text-primary-foreground">
              Soccer Scouting Academy Reality Show
            </h1>
          </div>
          
          <div className="p-8 bg-white/10 rounded-2xl backdrop-blur-sm max-w-sm">
            <Mail className="h-16 w-16 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary-foreground mb-2">
              Password Recovery
            </h2>
            <p className="text-primary-foreground/70">
              We'll send you a secure link to reset your password and get back to managing scouting and academy entries.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex flex-col items-center justify-center gap-3 mb-8">
            <img 
              src="/soccer-scouting-logo.jpeg" 
              alt="Soccer Scouting Academy Reality Show" 
              className="max-w-[120px] h-auto"
            />
            <h1 className="text-2xl font-bold text-foreground">Soccer Scouting Academy Reality Show</h1>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              {isSubmitted ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-success/10">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
                  <CardDescription className="text-center">
                    We've sent a password reset link to <strong>{email}</strong>
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl font-bold text-center">Reset password</CardTitle>
                  <CardDescription className="text-center">
                    Enter your email address and we'll send you a link to reset your password
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full h-11"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Try a different email
                  </Button>
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full h-11">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@soccerscoutingacademy.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>

                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full h-11">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Button>
                  </Link>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need help? Contact{' '}
            <a href="mailto:support@soccerscoutingacademy.com" className="text-accent hover:underline">
              support@soccerscoutingacademy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
