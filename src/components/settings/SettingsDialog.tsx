import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';
import type { Settings } from '@/lib/types';

interface SettingsDialogProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  trigger: React.ReactNode;
}

export function SettingsDialog({ settings, onSave, trigger }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave({
      ...settings,
      apiKey: apiKey.trim(),
      theme: theme as Settings['theme'],
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
          </div>
          <div className="grid gap-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogContent>
    </Dialog>
  );
}