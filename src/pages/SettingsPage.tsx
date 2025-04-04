
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SettingsPage = () => {
  const handleToggleChange = () => {
    toast.info("This is a demonstration. Settings are not actually saved.");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications on your desktop
                  </div>
                </div>
                <Switch id="desktop-notifications" onCheckedChange={handleToggleChange} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-notifications">Sound Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Play a sound when you receive a message
                  </div>
                </div>
                <Switch id="sound-notifications" defaultChecked onCheckedChange={handleToggleChange} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive email notifications when you're offline
                  </div>
                </div>
                <Switch id="email-notifications" onCheckedChange={handleToggleChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable dark mode for the application
                  </div>
                </div>
                <Switch id="dark-mode" onCheckedChange={handleToggleChange} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <div className="text-sm text-muted-foreground">
                    Display messages in a more compact layout
                  </div>
                </div>
                <Switch id="compact-view" onCheckedChange={handleToggleChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="read-receipts">Read Receipts</Label>
                  <div className="text-sm text-muted-foreground">
                    Let others know when you've read their messages
                  </div>
                </div>
                <Switch id="read-receipts" defaultChecked onCheckedChange={handleToggleChange} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="online-status">Online Status</Label>
                  <div className="text-sm text-muted-foreground">
                    Show your online status to others
                  </div>
                </div>
                <Switch id="online-status" defaultChecked onCheckedChange={handleToggleChange} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
