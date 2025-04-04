
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChannels } from "@/contexts/ChannelContext";
import { useMessages } from "@/contexts/MessageContext";
import { useUsers } from "@/contexts/UserContext";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Hash, Users, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const ChatWindow = () => {
  const { channelId, userId } = useParams<{ channelId?: string; userId?: string }>();
  const { user } = useAuth();
  const { fetchChannelDetails, currentChannel, setCurrentChannel } = useChannels();
  const { 
    channelMessages,
    directMessages,
    fetchChannelMessages,
    fetchDirectMessages,
    typingUsers,
  } = useMessages();
  const { users, getUserById, isUserOnline } = useUsers();
  
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // Get chat partner for DMs
  const chatPartner = userId ? getUserById(userId) : undefined;

  // Effect to fetch channel details when channelId changes
  useEffect(() => {
    if (channelId) {
      const getChannelDetails = async () => {
        const channelDetails = await fetchChannelDetails(channelId);
        if (channelDetails) {
          setCurrentChannel(channelDetails);
          await fetchChannelMessages(channelId);
        }
      };
      
      getChannelDetails();
    } else {
      setCurrentChannel(null);
    }
  }, [channelId]);

  // Effect to fetch direct messages when userId changes
  useEffect(() => {
    if (userId) {
      fetchDirectMessages(userId);
    }
  }, [userId]);

  // Determine which messages to show based on chat type
  const messages = channelId 
    ? channelMessages[channelId] || []
    : userId && user
    ? directMessages[userId] || []
    : [];

  // Get typing users for the current context
  const currentTypingUsers = channelId 
    ? typingUsers[channelId] || [] 
    : userId 
    ? typingUsers[userId] || [] 
    : [];

  // Filter out current user from typing users
  const filteredTypingUsers = currentTypingUsers.filter(
    typingUser => typingUser.userId !== user?.id
  );

  if (!channelId && !userId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-xl font-semibold mb-2">Welcome to Instant Comms Nexus</h2>
        <p>Select a channel or direct message to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center">
          {channelId ? (
            <>
              <Hash className="mr-2 text-muted-foreground" />
              <span className="font-semibold">{currentChannel?.name}</span>
              {currentChannel?.isPrivate && (
                <Badge variant="secondary" className="ml-2">Private</Badge>
              )}
            </>
          ) : chatPartner ? (
            <>
              <div className="relative mr-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chatPartner.avatarUrl} />
                  <AvatarFallback>
                    {chatPartner.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                    isUserOnline(chatPartner.id) ? 'bg-green-500' : 'bg-gray-400'
                  } border-2 border-background`}
                ></span>
              </div>
              <span className="font-semibold">{chatPartner.username}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {isUserOnline(chatPartner.id) ? 'Online' : 'Offline'}
              </span>
            </>
          ) : null}
        </div>
        <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {channelId ? (
                  <div className="flex items-center">
                    <Hash className="mr-2" />
                    {currentChannel?.name}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={chatPartner?.avatarUrl} />
                      <AvatarFallback>
                        {chatPartner?.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {chatPartner?.username}
                  </div>
                )}
              </DialogTitle>
              <DialogDescription>
                {channelId 
                  ? currentChannel?.description || "No description provided."
                  : `You can send direct messages to ${chatPartner?.username}.`
                }
              </DialogDescription>
            </DialogHeader>
            
            {channelId && currentChannel?.members && (
              <>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    Members ({currentChannel.members.length})
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {currentChannel.members.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={member.user?.avatarUrl} />
                            <AvatarFallback className="text-xs">
                              {member.user?.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.user?.username}</span>
                        </div>
                        <Badge variant={member.role === 'admin' ? 'default' : 'outline'}>
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList 
          messages={messages} 
          isDirectMessage={!!userId} 
        />
      </div>
      
      {/* Typing indicator */}
      {filteredTypingUsers.length > 0 && (
        <div className="px-4 py-1 text-sm text-muted-foreground">
          {filteredTypingUsers.map(typer => typer.username).join(', ')} 
          {filteredTypingUsers.length === 1 ? ' is' : ' are'} typing
          <span className="inline-flex ml-1">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </span>
        </div>
      )}
      
      {/* Message input */}
      <MessageInput 
        channelId={channelId} 
        userId={userId}
        placeholder={
          channelId 
            ? `Message #${currentChannel?.name}` 
            : `Message @${chatPartner?.username}`
        }
      />
    </div>
  );
};
