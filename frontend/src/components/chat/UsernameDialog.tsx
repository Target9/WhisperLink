import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { User, AlertCircle } from 'lucide-react';

interface UsernameDialogProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
}

export const UsernameDialog: React.FC<UsernameDialogProps> = ({ isOpen, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    // Check if username contains only alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      // Check if username is available
      const response = await fetch('http://localhost:8000/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (data.is_taken) {
        setError('Username is already taken');
      } else {
        onSubmit(username.trim());
      }
    } catch (error) {
      setError('Failed to check username availability. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Choose Your Username
          </DialogTitle>
          <DialogDescription>
            Please choose a username that will be displayed to other users.
            It must be between 3 and 20 characters and can only contain letters, numbers, and underscores.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={handleInputChange}
              disabled={isChecking}
              autoFocus
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Username must be 3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isChecking || !username.trim()}
          >
            {isChecking ? 'Checking...' : 'Connect'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
