import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="border-b p-4">
      <div className="container flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat App</h1>
        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}