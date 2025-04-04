
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status?: string;
  lastActive?: string;
}

interface UserContextType {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  getUserById: (userId: string) => User | undefined;
  isUserOnline: (userId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId);
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId);
  };

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        fetchUsers,
        getUserById,
        isUserOnline,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
