
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatWindow } from "@/components/chat/ChatWindow";

const ChatPage = () => {
  return (
    <AppLayout>
      <Routes>
        <Route index element={<ChatHome />} />
        <Route path="channel/:channelId" element={<ChatWindow />} />
        <Route path="dm/:userId" element={<ChatWindow />} />
      </Routes>
    </AppLayout>
  );
};

const ChatHome = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-5xl mb-6">👋</div>
        <h1 className="text-3xl font-bold mb-3">Welcome to Instant Comms Nexus</h1>
        <p className="text-muted-foreground mb-8">
          Connect with your team through channels and direct messages.
          Select a conversation from the sidebar to get started.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-lg p-5 text-center space-y-2">
            <h3 className="font-medium">Channels</h3>
            <p className="text-sm text-muted-foreground">
              Organize conversations around topics
            </p>
          </div>
          <div className="bg-card border rounded-lg p-5 text-center space-y-2">
            <h3 className="font-medium">Direct Messages</h3>
            <p className="text-sm text-muted-foreground">
              Private conversations with team members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
