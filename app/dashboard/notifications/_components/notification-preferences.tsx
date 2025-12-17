"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationPreferences } from "../types";
import { Separator } from "@/components/ui/separator";

interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onPreferencesChange: (preferences: NotificationPreferences) => void;
}

export function NotificationPreferencesCard({
  preferences,
  onPreferencesChange,
}: NotificationPreferencesProps) {
  const updatePreference = (key: string, value: any) => {
    onPreferencesChange({
      ...preferences,
      [key]: value,
    });
  };

  const updatePlatformAlert = (platform: string, value: boolean) => {
    onPreferencesChange({
      ...preferences,
      platformAlerts: {
        ...preferences.platformAlerts,
        [platform]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email & Push */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                updatePreference("emailNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in browser
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                updatePreference("pushNotifications", checked)
              }
            />
          </div>
        </div>

        <Separator />

        {/* Platform Alerts */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Platform Alerts</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="meta-alerts">Meta Ads</Label>
            <Switch
              id="meta-alerts"
              checked={preferences.platformAlerts.meta}
              onCheckedChange={(checked) =>
                updatePlatformAlert("meta", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="google-alerts">Google Ads</Label>
            <Switch
              id="google-alerts"
              checked={preferences.platformAlerts.google}
              onCheckedChange={(checked) =>
                updatePlatformAlert("google", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="tiktok-alerts">TikTok Ads</Label>
            <Switch
              id="tiktok-alerts"
              checked={preferences.platformAlerts.tiktok}
              onCheckedChange={(checked) =>
                updatePlatformAlert("tiktok", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="ecommerce-alerts">E-commerce</Label>
            <Switch
              id="ecommerce-alerts"
              checked={preferences.platformAlerts.ecommerce}
              onCheckedChange={(checked) =>
                updatePlatformAlert("ecommerce", checked)
              }
            />
          </div>
        </div>

        <Separator />

        {/* Alert Types */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Alert Types</h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="performance-alerts">Performance Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Campaign performance changes
              </p>
            </div>
            <Switch
              id="performance-alerts"
              checked={preferences.performanceAlerts}
              onCheckedChange={(checked) =>
                updatePreference("performanceAlerts", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="budget-alerts">Budget Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Budget and spend notifications
              </p>
            </div>
            <Switch
              id="budget-alerts"
              checked={preferences.budgetAlerts}
              onCheckedChange={(checked) =>
                updatePreference("budgetAlerts", checked)
              }
            />
          </div>
        </div>

        <Separator />

        {/* Digest Frequency */}
        <div className="space-y-2">
          <Label htmlFor="digest-frequency">Digest Frequency</Label>
          <Select
            value={preferences.digestFrequency}
            onValueChange={(value: any) =>
              updatePreference("digestFrequency", value)
            }
          >
            <SelectTrigger id="digest-frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Digest</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            How often you want to receive notification summaries
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
