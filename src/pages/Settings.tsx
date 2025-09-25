import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/Avatar";
import toast from "react-hot-toast";
import { handleApiError } from "../utils/errorHandler";
import { userService } from "../services/userService";

const Settings = () => {
  const { user } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  if (!user) {
    return <div className="text-center p-10 text-xl">You must be logged in to view settings.</div>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userService.updateProfile({ bio });
      toast.success("Bio updated!");
      setIsEditing(false);
    } catch (error) {
      const { userMessage } = handleApiError(error, "updating bio");
      toast.error(userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAvatarLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await userService.updateProfile({ avatar: reader.result as string });
        toast.success("Avatar updated!");
      } catch (error) {
        const { userMessage } = handleApiError(error, "updating avatar");
        toast.error(userMessage);
      } finally {
        setIsAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="dark:bg-gray-800">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>

          {/* Avatar Section */}
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=ffffff`
                }
                alt={user.name ?? "User"}
              />
              <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <label className="block font-semibold mb-1">Change Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isAvatarLoading}
              />
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Bio</h2>
            {isEditing ? (
              <div>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  {user.bio || "No bio added yet."}
                </p>
                <Button
                  className="mt-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Bio
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
