
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useChannels } from './ChannelContext';

interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  sentAt: string;
  updatedAt: string;
  isEdited: boolean;
  sender?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  sentAt: string;
  updatedAt: string;
  isRead: boolean;
  isEdited: boolean;
  sender?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  recipient?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface MessageContextType {
  channelMessages: Record<string, Message[]>;
  directMessages: Record<string, DirectMessage[]>;
  typingUsers: Record<string, { userId: string; username: string }[]>;
  loadingMessages: boolean;
  fetchChannelMessages: (channelId: string) => Promise<Message[]>;
  fetchDirectMessages: (userId: string) => Promise<DirectMessage[]>;
  sendChannelMessage: (channelId: string, content: string) => Promise<boolean>;
  editChannelMessage: (messageId: string, content: string) => Promise<boolean>;
  sendDirectMessage: (recipientId: string, content: string) => Promise<boolean>;
  editDirectMessage: (messageId: string, content: string) => Promise<boolean>;
  markDirectMessageAsRead: (messageId: string) => Promise<boolean>;
  setChannelTyping: (channelId: string, isTyping: boolean) => void;
  setDirectTyping: (recipientId: string, isTyping: boolean) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket, connected } = useSocket();
  const { currentChannel } = useChannels();
  
  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({});
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, { userId: string; username: string }[]>>({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for new channel messages
    socket.on('channelMessage', (message: Message) => {
      setChannelMessages((prev) => {
        const channelId = message.channelId;
        const existingMessages = prev[channelId] || [];
        return {
          ...prev,
          [channelId]: [message, ...existingMessages],
        };
      });
    });

    // Listen for updated channel messages
    socket.on('messageUpdated', (message: Message) => {
      setChannelMessages((prev) => {
        const channelId = message.channelId;
        const existingMessages = prev[channelId] || [];
        return {
          ...prev,
          [channelId]: existingMessages.map((m) => (m.id === message.id ? message : m)),
        };
      });
    });

    // Listen for direct messages
    socket.on('directMessage', (message: DirectMessage) => {
      // Determine the conversation key (the other user's ID)
      const conversationKey = user?.id === message.senderId ? message.recipientId : message.senderId;
      
      setDirectMessages((prev) => {
        const existingMessages = prev[conversationKey] || [];
        return {
          ...prev,
          [conversationKey]: [message, ...existingMessages],
        };
      });
      
      // Show toast for incoming messages only
      if (message.senderId !== user?.id) {
        const senderName = message.sender?.username || 'Someone';
        toast(senderName, {
          description: message.content.length > 50 ? `${message.content.slice(0, 50)}...` : message.content,
        });
      }
    });

    // Listen for updated direct messages
    socket.on('directMessageUpdated', (message: DirectMessage) => {
      // Determine the conversation key (the other user's ID)
      const conversationKey = user?.id === message.senderId ? message.recipientId : message.senderId;
      
      setDirectMessages((prev) => {
        const existingMessages = prev[conversationKey] || [];
        return {
          ...prev,
          [conversationKey]: existingMessages.map((m) => (m.id === message.id ? message : m)),
        };
      });
    });

    // Listen for read receipts
    socket.on('directMessageRead', (message: DirectMessage) => {
      const conversationKey = message.recipientId;
      
      setDirectMessages((prev) => {
        const existingMessages = prev[conversationKey] || [];
        return {
          ...prev,
          [conversationKey]: existingMessages.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)),
        };
      });
    });

    // Listen for typing indicators in channels
    socket.on('userTyping', (data: { channelId: string; userId: string; username: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const channelId = data.channelId;
        const currentTypingUsers = prev[channelId] || [];
        
        if (data.isTyping) {
          // Add user to typing users if not already there
          if (!currentTypingUsers.some((u) => u.userId === data.userId)) {
            return {
              ...prev,
              [channelId]: [...currentTypingUsers, { userId: data.userId, username: data.username }],
            };
          }
        } else {
          // Remove user from typing users
          return {
            ...prev,
            [channelId]: currentTypingUsers.filter((u) => u.userId !== data.userId),
          };
        }
        
        return prev;
      });
    });

    // Listen for typing indicators in direct messages
    socket.on('userDirectTyping', (data: { userId: string; username: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const userId = data.userId;
        const currentTypingUsers = prev[userId] || [];
        
        if (data.isTyping) {
          // Add user to typing users if not already there
          if (!currentTypingUsers.some((u) => u.userId === data.userId)) {
            return {
              ...prev,
              [userId]: [...currentTypingUsers, { userId: data.userId, username: data.username }],
            };
          }
        } else {
          // Remove user from typing users
          return {
            ...prev,
            [userId]: currentTypingUsers.filter((u) => u.userId !== data.userId),
          };
        }
        
        return prev;
      });
    });

    // Join current channel if available
    if (currentChannel?.id) {
      socket.emit('joinChannel', { channelId: currentChannel.id });
    }

    return () => {
      socket.off('channelMessage');
      socket.off('messageUpdated');
      socket.off('directMessage');
      socket.off('directMessageUpdated');
      socket.off('directMessageRead');
      socket.off('userTyping');
      socket.off('userDirectTyping');
      
      // Leave current channel if available
      if (currentChannel?.id) {
        socket.emit('leaveChannel', { channelId: currentChannel.id });
      }
    };
  }, [socket, connected, user?.id, currentChannel?.id]);

  // Re-join channel when currentChannel changes
  useEffect(() => {
    if (!socket || !connected) return;

    // Leave all channels first (simplified approach)
    Object.keys(channelMessages).forEach((channelId) => {
      socket.emit('leaveChannel', { channelId });
    });

    // Join new channel if available
    if (currentChannel?.id) {
      socket.emit('joinChannel', { channelId: currentChannel.id });
      fetchChannelMessages(currentChannel.id);
    }
  }, [socket, connected, currentChannel?.id]);

  const fetchChannelMessages = async (channelId: string): Promise<Message[]> => {
    if (!isAuthenticated) return [];

    setLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/messages/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const messages = await response.json();
      setChannelMessages((prev) => ({
        ...prev,
        [channelId]: messages,
      }));
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      return [];
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchDirectMessages = async (userId: string): Promise<DirectMessage[]> => {
    if (!isAuthenticated || !user) return [];

    setLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/messages/direct/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch direct messages');
      }

      const messages = await response.json();
      setDirectMessages((prev) => ({
        ...prev,
        [userId]: messages,
      }));
      return messages;
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      toast.error('Failed to load direct messages');
      return [];
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendChannelMessage = async (channelId: string, content: string): Promise<boolean> => {
    if (!socket || !connected || !isAuthenticated) return false;

    try {
      return new Promise((resolve) => {
        socket.emit('sendChannelMessage', { channelId, content }, (response: { success: boolean }) => {
          resolve(response.success);
        });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };

  const editChannelMessage = async (messageId: string, content: string): Promise<boolean> => {
    if (!socket || !connected || !isAuthenticated) return false;

    try {
      return new Promise((resolve) => {
        socket.emit('editChannelMessage', { messageId, content }, (response: { success: boolean }) => {
          resolve(response.success);
        });
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
      return false;
    }
  };

  const sendDirectMessage = async (recipientId: string, content: string): Promise<boolean> => {
    if (!socket || !connected || !isAuthenticated) return false;

    try {
      return new Promise((resolve) => {
        socket.emit('sendDirectMessage', { recipientId, content }, (response: { success: boolean }) => {
          resolve(response.success);
        });
      });
    } catch (error) {
      console.error('Error sending direct message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };

  const editDirectMessage = async (messageId: string, content: string): Promise<boolean> => {
    if (!socket || !connected || !isAuthenticated) return false;

    try {
      return new Promise((resolve) => {
        socket.emit('editDirectMessage', { messageId, content }, (response: { success: boolean }) => {
          resolve(response.success);
        });
      });
    } catch (error) {
      console.error('Error editing direct message:', error);
      toast.error('Failed to edit message');
      return false;
    }
  };

  const markDirectMessageAsRead = async (messageId: string): Promise<boolean> => {
    if (!socket || !connected || !isAuthenticated) return false;

    try {
      return new Promise((resolve) => {
        socket.emit('markDirectMessageAsRead', { messageId }, (response: { success: boolean }) => {
          resolve(response.success);
        });
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };

  const setChannelTyping = (channelId: string, isTyping: boolean) => {
    if (!socket || !connected || !isAuthenticated) return;

    socket.emit('channelTyping', { channelId, isTyping });
  };

  const setDirectTyping = (recipientId: string, isTyping: boolean) => {
    if (!socket || !connected || !isAuthenticated) return;

    socket.emit('directTyping', { recipientId, isTyping });
  };

  return (
    <MessageContext.Provider
      value={{
        channelMessages,
        directMessages,
        typingUsers,
        loadingMessages,
        fetchChannelMessages,
        fetchDirectMessages,
        sendChannelMessage,
        editChannelMessage,
        sendDirectMessage,
        editDirectMessage,
        markDirectMessageAsRead,
        setChannelTyping,
        setDirectTyping,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};
