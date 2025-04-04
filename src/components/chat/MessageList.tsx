
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  content: string;
  sentAt: string;
  updatedAt: string;
  isEdited: boolean;
  isRead?: boolean;
  recipientId?: string;
  sender?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  isDirectMessage?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isDirectMessage = false }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce<{
    [date: string]: Message[];
  }>((groups, message) => {
    const date = new Date(message.sentAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Check if messages array is empty
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
        <div className="text-4xl mb-3">💬</div>
        <p className="text-center">
          {isDirectMessage 
            ? "No messages yet. Start the conversation!"
            : "No messages in this channel yet. Be the first to say something!"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {Object.entries(groupedMessages)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-xs text-muted-foreground font-medium">
                {date === new Date().toLocaleDateString() ? 'Today' : date}
              </span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {dateMessages
              .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
              .map((message, index, arr) => {
                // Check if this message is by the same sender as the previous one
                const prevMessage = index > 0 ? arr[index - 1] : null;
                const isSameSender = prevMessage && prevMessage.senderId === message.senderId;
                // Check if the time between messages is within 5 minutes
                const isCloseInTime = prevMessage && 
                  new Date(message.sentAt).getTime() - new Date(prevMessage.sentAt).getTime() < 5 * 60 * 1000;
                
                // Only show avatar and name for the first message in a group
                const showHeader = !isSameSender || !isCloseInTime;
                
                const isCurrentUser = message.senderId === user?.id;
                
                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[85%]`}>
                      {/* Avatar - only show for first message in a group or for all messages if it's not the current user */}
                      {(!isCurrentUser || showHeader) && (
                        <div className={`flex-shrink-0 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
                          {showHeader ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender?.avatarUrl} />
                              <AvatarFallback>
                                {message.sender?.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8" /> // Placeholder for alignment
                          )}
                        </div>
                      )}

                      {/* Message content */}
                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} space-y-1`}>
                        {showHeader && message.sender && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {message.sender.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                            </span>
                          </div>
                        )}

                        <div 
                          className={`rounded-lg px-3 py-2 text-sm break-words ${
                            isCurrentUser 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-secondary text-secondary-foreground rounded-tl-none'
                          }`}
                        >
                          {message.content}
                        </div>

                        {/* Edit indicator and read status (for DMs) */}
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          {message.isEdited && <span>(edited)</span>}
                          {isDirectMessage && isCurrentUser && message.isRead && (
                            <span className="text-xs text-blue-500">Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
