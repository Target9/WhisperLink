import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { RefreshCw, Copy, Check, AlertCircle, Users } from 'lucide-react';
import { generateSecretKey, validateAddress } from '../../utils/encryption';

interface NewChatDialogProps {
  onNewChat: (address: string, secretKey: string) => void;
  trigger?: React.ReactNode;
  onlineUsers?: string[];
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({
  onNewChat,
  trigger,
  onlineUsers = []
}) => {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ address?: string; secretKey?: string }>({});

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    // Simulate some delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    const newKey = generateSecretKey();
    setSecretKey(newKey);
    setIsGenerating(false);
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy key:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { address?: string; secretKey?: string } = {};

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    } else if (!validateAddress(address.trim())) {
      newErrors.address = 'Address must be 3-50 characters and contain only letters, numbers, underscores, and hyphens';
    }

    if (!secretKey.trim()) {
      newErrors.secretKey = 'Secret key is required';
    } else if (secretKey.trim().length < 10) {
      newErrors.secretKey = 'Secret key must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onNewChat(address.trim(), secretKey.trim());
      setOpen(false);
      setAddress('');
      setSecretKey('');
      setErrors({});
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setAddress('');
      setSecretKey('');
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>New Chat</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Encrypted Chat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Recipient Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter recipient's address (e.g., alice_123)"
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {errors.address}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This is the unique identifier for the person you want to chat with
            </p>
            
            {/* Online Users Suggestions */}
            {onlineUsers.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Online Users</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {onlineUsers.map((user) => (
                    <Button
                      key={user}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setAddress(user)}
                    >
                      {user}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="secretKey">Secret Key</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateKey}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate
                </Button>
                {secretKey && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyKey}
                  >
                    {copied ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </div>
            </div>
            
            <Textarea
              id="secretKey"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter or generate a secret key for encryption"
              className={errors.secretKey ? "border-red-500" : ""}
              rows={3}
            />
            {errors.secretKey && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {errors.secretKey}
              </div>
            )}
            
            {secretKey && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {secretKey.length} characters
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Keep this key secure - it's used to encrypt and decrypt messages
                </span>
              </div>
            )}
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Security Notice</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Messages are encrypted using AES-256 encryption</li>
              <li>• Only people with the same secret key can decrypt messages</li>
              <li>• Store your secret key securely - it cannot be recovered</li>
              <li>• Share the secret key securely with your intended recipient</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!address.trim() || !secretKey.trim()}>
              Start Chat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
