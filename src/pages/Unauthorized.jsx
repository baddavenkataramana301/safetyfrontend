import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 via-background to-destructive/5 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
