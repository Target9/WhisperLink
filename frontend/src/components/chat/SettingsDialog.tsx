import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Settings, Eye, EyeOff, Key, Copy, Check } from 'lucide-react';
import type { Chat, UserSettings } from '../../types';
interface SettingsDialogProps {
  chats: Chat[];
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  trigger?: React.ReactNode;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  chats,
  settings,
  onSettingsChange,
  trigger
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleVisibilityToggle = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      isVisible: checked
    });
  };

  const handleDisplayKeysToggle = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      displayKeysInChats: checked
    });
  };

  const copyToClipboard = async (text: string, chatId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(chatId);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" title="Settings">
      <Settings className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {settings.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Visibility
                </CardTitle>
                <CardDescription>
                  Control your online status and visibility to other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="visibility-toggle">Show as online</Label>
                    <p className="text-sm text-muted-foreground">
                      Other users can see when you're active
                    </p>
                  </div>
                  <Switch
                    id="visibility-toggle"
                    checked={settings.isVisible}
                    onCheckedChange={handleVisibilityToggle}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Display Keys in Chats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Chat Display
                </CardTitle>
                <CardDescription>
                  Control how secret keys are displayed in your chat interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="display-keys-toggle">Show secret keys in chats</Label>
                    <p className="text-sm text-muted-foreground">
                      Display secret keys directly in the chat interface for easy access
                    </p>
                  </div>
                  <Switch
                    id="display-keys-toggle"
                    checked={settings.displayKeysInChats}
                    onCheckedChange={handleDisplayKeysToggle}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Secret Keys */}
            {settings.displayKeysInChats && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Secret Keys
                    </CardTitle>
                    <CardDescription>
                      View and manage secret keys for all your chats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chats.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No chats available
                        </p>
                      ) : (
                        chats.map((chat) => (
                          <div
                            key={chat.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">
                                  {chat.address}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {chat.messages.length} messages
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate max-w-48">
                                  {chat.secretKey}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(chat.secretKey, chat.id)}
                                >
                                  {copiedKey === chat.id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
