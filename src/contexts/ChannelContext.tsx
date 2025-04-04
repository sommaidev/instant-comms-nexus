
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  members?: ChannelMember[];
}

interface ChannelMember {
  channelId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface ChannelContextType {
  channels: Channel[];
  currentChannel: Channel | null;
  loading: boolean;
  fetchChannels: () => Promise<void>;
  fetchChannelDetails: (channelId: string) => Promise<Channel | null>;
  createChannel: (name: string, description?: string, isPrivate?: boolean) => Promise<Channel | null>;
  updateChannel: (channelId: string, data: Partial<Channel>) => Promise<Channel | null>;
  addMember: (channelId: string, userId: string) => Promise<ChannelMember | null>;
  removeMember: (channelId: string, userId: string) => Promise<void>;
  setCurrentChannel: (channel: Channel | null) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const useChannels = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannels must be used within a ChannelProvider');
  }
  return context;
};

interface ChannelProviderProps {
  children: ReactNode;
}

export const ChannelProvider: React.FC<ChannelProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChannels();
    }
  }, [isAuthenticated]);

  const fetchChannels = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/channels', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }

      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelDetails = async (channelId: string): Promise<Channel | null> => {
    if (!isAuthenticated) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/channels/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channel details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching channel details:', error);
      toast.error('Failed to load channel details');
      return null;
    }
  };

  const createChannel = async (name: string, description?: string, isPrivate = false): Promise<Channel | null> => {
    if (!isAuthenticated) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, isPrivate }),
      });

      if (!response.ok) {
        throw new Error('Failed to create channel');
      }

      const newChannel = await response.json();
      setChannels((prev) => [...prev, newChannel]);
      toast.success('Channel created successfully');
      return newChannel;
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Failed to create channel');
      return null;
    }
  };

  const updateChannel = async (channelId: string, data: Partial<Channel>): Promise<Channel | null> => {
    if (!isAuthenticated) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/channels/${channelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update channel');
      }

      const updatedChannel = await response.json();
      setChannels((prev) =>
        prev.map((channel) => (channel.id === channelId ? updatedChannel : channel))
      );

      if (currentChannel?.id === channelId) {
        setCurrentChannel(updatedChannel);
      }

      toast.success('Channel updated successfully');
      return updatedChannel;
    } catch (error) {
      console.error('Error updating channel:', error);
      toast.error('Failed to update channel');
      return null;
    }
  };

  const addMember = async (channelId: string, userId: string): Promise<ChannelMember | null> => {
    if (!isAuthenticated) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/channels/${channelId}/members/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to add member to channel');
      }

      const newMember = await response.json();
      toast.success('Member added to channel');
      return newMember;
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member to channel');
      return null;
    }
  };

  const removeMember = async (channelId: string, userId: string): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/channels/${channelId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove member from channel');
      }

      toast.success('Member removed from channel');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member from channel');
    }
  };

  return (
    <ChannelContext.Provider
      value={{
        channels,
        currentChannel,
        loading,
        fetchChannels,
        fetchChannelDetails,
        createChannel,
        updateChannel,
        addMember,
        removeMember,
        setCurrentChannel,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};
