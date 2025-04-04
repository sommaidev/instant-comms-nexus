
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, MessageSquare, Users, Zap } from "lucide-react";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="container py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">Instant Comms Nexus</span>
        </div>
        <div className="space-x-2">
          {isAuthenticated ? (
            <Button asChild>
              <Link to="/chat">Go to Chat</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link to="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col md:flex-row items-center justify-between py-12 md:py-24">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Connect and collaborate in real-time
          </h1>
          <p className="text-xl text-muted-foreground">
            Instant Comms Nexus brings your team together with channels, direct messages, 
            and real-time communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/chat">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Open App
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <div className="bg-card rounded-lg shadow-lg border p-4">
            <div className="bg-chat-dark rounded-md p-3 flex flex-col space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <Hash className="text-white h-4 w-4" />
                <span className="text-white font-medium">general</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="bg-chat-light text-chat-dark p-2 rounded-md rounded-tl-none max-w-xs">
                  <p className="text-sm">Welcome to Instant Comms Nexus!</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-chat-primary text-white p-2 rounded-md rounded-tr-none max-w-xs">
                  <p className="text-sm">Thanks! Looking forward to collaborating with the team.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="bg-chat-light text-chat-dark p-2 rounded-md rounded-tl-none max-w-xs animate-pulse-opacity">
                  <p className="text-sm">Let me know if you need any help getting started...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 bg-card rounded-lg my-12">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-time Messaging</h3>
            <p className="text-muted-foreground">
              Communicate instantly with your team without delay or refresh.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Channel Organization</h3>
            <p className="text-muted-foreground">
              Create public and private channels to organize conversations by topic.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Direct Messages</h3>
            <p className="text-muted-foreground">
              Have private conversations with team members directly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-auto">
        <div className="container text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Instant Comms Nexus</span>
          </div>
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Instant Comms Nexus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
