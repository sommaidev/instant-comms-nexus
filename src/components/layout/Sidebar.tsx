
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useChannels } from "@/contexts/ChannelContext";
import { useUsers } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Hash, 
  Users, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  MessageSquare 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const createChannelSchema = z.object({
  name: z.string().min(3, "Channel name must be at least 3 characters"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

export const Sidebar = () => {
  const { channels, createChannel } = useChannels();
  const { users } = useUsers();
  const { user } = useAuth();
  
  const [showChannels, setShowChannels] = useState(true);
  const [showDirectMessages, setShowDirectMessages] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof createChannelSchema>>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof createChannelSchema>) => {
    await createChannel(values.name, values.description, values.isPrivate);
    form.reset();
    setIsDialogOpen(false);
  };

  // Filter out the current user from direct messages list
  const otherUsers = users.filter(u => u.id !== user?.id);

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 hidden md:flex flex-col h-full">
      {/* App logo and name */}
      <div className="p-4 border-b border-sidebar-border flex items-center">
        <MessageSquare className="mr-2 text-primary" />
        <h1 className="font-bold text-lg">ICN</h1>
      </div>

      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Channels section */}
        <div className="px-3">
          <div 
            className="flex items-center justify-between py-2 cursor-pointer text-sidebar-foreground/80 hover:text-sidebar-foreground"
            onClick={() => setShowChannels(!showChannels)}
          >
            {showChannels ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="font-medium flex-1">Channels</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0 rounded-full">
                  <Plus size={14} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new channel</DialogTitle>
                  <DialogDescription>
                    Add a new channel for your team to collaborate.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. general" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="What's this channel about?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPrivate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Private Channel</FormLabel>
                            <FormDescription>
                              Only invited members can view this channel
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        Create Channel
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {showChannels && (
            <div className="ml-2 space-y-1">
              {channels.map((channel) => (
                <NavLink
                  key={channel.id}
                  to={`/chat/channel/${channel.id}`}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-1.5 rounded-md text-sm ${
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    }`
                  }
                >
                  <Hash size={16} className="mr-2 opacity-70" />
                  <span className="truncate">{channel.name}</span>
                  {channel.isPrivate && (
                    <span className="ml-2 text-xs bg-sidebar-accent px-1.5 py-0.5 rounded">
                      Private
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Direct Messages section */}
        <div className="px-3 mt-4">
          <div 
            className="flex items-center justify-between py-2 cursor-pointer text-sidebar-foreground/80 hover:text-sidebar-foreground"
            onClick={() => setShowDirectMessages(!showDirectMessages)}
          >
            {showDirectMessages ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="font-medium flex-1">Direct Messages</span>
          </div>
          
          {showDirectMessages && (
            <div className="ml-2 space-y-1">
              {otherUsers.map((otherUser) => (
                <NavLink
                  key={otherUser.id}
                  to={`/chat/dm/${otherUser.id}`}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-1.5 rounded-md text-sm ${
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    }`
                  }
                >
                  <div className="relative mr-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={otherUser.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {otherUser.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                      otherUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                  </div>
                  <span className="truncate">{otherUser.username}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings link */}
      <div className="p-3 border-t border-sidebar-border">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-md ${
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
            }`
          }
        >
          <Settings size={18} className="mr-2" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};
