import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Palette, Upload, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const SystemTheme = () => {
  const { toast } = useToast();
  const { theme, updateTheme } = useAuth();
  const [localTheme, setLocalTheme] = useState(theme);
  const [iconText, setIconText] = useState("SafetyMS");
  const [favicon, setFavicon] = useState(null);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleSaveTheme = () => {
    updateTheme(localTheme);
    toast({
      title: "Theme Updated",
      description: "The system theme has been updated successfully.",
    });
  };

  const handleColorChange = (colorKey, value) => {
    setLocalTheme((prev) => ({
      ...prev,
      [colorKey]: value,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Theme</h1>
          <p className="text-muted-foreground">
            Customize the appearance and branding of the application
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Color Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Theme
              </CardTitle>
              <CardDescription>
                Customize the color scheme of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary"
                      type="color"
                      value={localTheme.primary}
                      onChange={(e) =>
                        handleColorChange("primary", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={localTheme.primary}
                      onChange={(e) =>
                        handleColorChange("primary", e.target.value)
                      }
                      placeholder="#FFB703"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary"
                      type="color"
                      value={localTheme.secondary}
                      onChange={(e) =>
                        handleColorChange("secondary", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={localTheme.secondary}
                      onChange={(e) =>
                        handleColorChange("secondary", e.target.value)
                      }
                      placeholder="#023047"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent"
                      type="color"
                      value={localTheme.accent}
                      onChange={(e) =>
                        handleColorChange("accent", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={localTheme.accent}
                      onChange={(e) =>
                        handleColorChange("accent", e.target.value)
                      }
                      placeholder="#FB8500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="danger">Danger Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="danger"
                      type="color"
                      value={localTheme.danger}
                      onChange={(e) =>
                        handleColorChange("danger", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={localTheme.danger}
                      onChange={(e) =>
                        handleColorChange("danger", e.target.value)
                      }
                      placeholder="#D00000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background"
                      type="color"
                      value={localTheme.background}
                      onChange={(e) =>
                        handleColorChange("background", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={localTheme.background}
                      onChange={(e) =>
                        handleColorChange("background", e.target.value)
                      }
                      placeholder="#EAEAEA"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text"
                      type="color"
                      value={localTheme.text}
                      onChange={(e) =>
                        handleColorChange("text", e.target.value)
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={localTheme.text}
                      onChange={(e) =>
                        handleColorChange("text", e.target.value)
                      }
                      placeholder="#121212"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>
                Customize icons, text, and favicon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iconText">Icon Text</Label>
                <Input
                  id="iconText"
                  value={iconText}
                  onChange={(e) => setIconText(e.target.value)}
                  placeholder="SafetyMS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon</Label>
                <Input
                  id="favicon"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFavicon(e.target.files[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a new favicon (recommended: 32x32px ICO or PNG)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Preview</CardTitle>
            <CardDescription>
              See how your theme changes will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: localTheme.background,
                color: localTheme.text,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: localTheme.primary }}
                >
                  {iconText.charAt(0)}
                </div>
                <span className="font-bold">{iconText}</span>
              </div>

              <div className="space-y-2">
                <Button
                  style={{
                    backgroundColor: localTheme.primary,
                    color: "white",
                  }}
                  className="mr-2"
                >
                  Primary Button
                </Button>
                <Button
                  variant="outline"
                  style={{
                    borderColor: localTheme.secondary,
                    color: localTheme.secondary,
                  }}
                >
                  Secondary Button
                </Button>
                <Button
                  style={{ backgroundColor: localTheme.accent, color: "white" }}
                  className="ml-2"
                >
                  Accent Button
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveTheme} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Theme Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemTheme;
