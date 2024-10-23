import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2',
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            {message.status === 'sending' && !message.streamingComplete && (
              <div className="text-xs opacity-70">typing...</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}