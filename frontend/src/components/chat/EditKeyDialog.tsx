import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Key, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { generateSecretKey } from '../../utils/encryption';

interface EditKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newKey: string) => void;
  currentKey?: string;
  chatAddress: string;
}

export const EditKeyDialog: React.FC<EditKeyDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentKey = '',
  chatAddress
}) => {
  const [secretKey, setSecretKey] = useState(currentKey);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

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

  const handleSave = () => {
    if (!secretKey.trim()) {
      setError('Secret key is required');
      return;
    }

    if (secretKey.trim().length < 10) {
      setError('Secret key must be at least 10 characters');
      return;
    }

    onSave(secretKey.trim());
    onClose();
    setError('');
  };

  const handleClose = () => {
    setSecretKey(currentKey);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Edit Encryption Key
          </DialogTitle>
          <DialogDescription>
            Update the encryption key for chat with <strong>{chatAddress}</strong>.
            This key is used to encrypt and decrypt messages.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secretKey"
                type="text"
                placeholder="Enter or generate a secret key"
                value={secretKey}
                onChange={(e) => {
                  setSecretKey(e.target.value);
                  if (error) setError('');
                }}
                className="font-mono"
              />
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
            </div>
            {secretKey && (
              <div className="flex items-center gap-2">
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
                <span className="text-xs text-muted-foreground">
                  {secretKey.length} characters
                </span>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Important</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Both users must have the same key to decrypt messages</li>
              <li>• Changing the key will affect all future messages</li>
              <li>• Previous messages may not decrypt with a new key</li>
              <li>• Share the new key securely with your chat partner</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!secretKey.trim()}>
              Save Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
