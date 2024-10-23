import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Settings } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageList } from '@/components/chat/MessageList';
import { Message } from '@/lib/types';
import { ChatService } from '@/lib/api';
import { initDB, saveMessage, getMessages, saveSettings, getSettings } from '@/lib/db';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const { theme, setTheme } = useTheme();
  const [chatService, setChatService] = useState<ChatService | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await initDB();
      const settings = await getSettings();
      setApiKey(settings.apiKey || '');
      setTheme(settings.theme);
      const savedMessages = await getMessages();
      setMessages(savedMessages);
    };
    initialize();
  }, [setTheme]);

  useEffect(() => {
    if (apiKey) {
      setChatService(new ChatService(apiKey));
      saveSettings({ apiKey, theme: theme || 'system' });
    }
  }, [apiKey, theme]);

  const handleSendMessage = async (content: string) => {
    if (!chatService) {
      alert('Please enter your API key first');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
      status: 'sent',
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: Date.now() + 1,
      status: 'sending',
      streamingComplete: false,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    await saveMessage(userMessage);

    setIsLoading(true);
    try {
      await chatService.sendMessage(content, (chunk) => {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant') {
            const updatedMessage = {
              ...lastMessage,
              content: lastMessage.content + chunk,
            };
            return [...prev.slice(0, -1), updatedMessage];
          }
          return prev;
        });
      });

      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant') {
          const completedMessage = {
            ...lastMessage,
            status: 'sent' as const,
            streamingComplete: true,
          };
          saveMessage(completedMessage);
          return [...prev.slice(0, -1), completedMessage];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant') {
          const errorMessage = {
            ...lastMessage,
            status: 'error' as const,
            content: 'Sorry, there was an error processing your message.',
          };
          return [...prev.slice(0, -1), errorMessage];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="flex flex-col h-screen bg-background">
        <header className="border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Chat App</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="password"
                placeholder="Enter API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-64"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          <MessageList messages={messages} />
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;