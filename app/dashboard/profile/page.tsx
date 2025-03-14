"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { InterestsSelection } from "@/components/interests-selection"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    fieldOfStudy: "",
    bio: "",
    organization: "University of Washington",
    interests: [] as string[],
    photoURL: "",
  })

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        // Get the latest user data from Firestore
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setFormData({
            fullName: userData.name || user.name || "",
            email: user.email || "",
            fieldOfStudy: userData.fieldOfStudy || "",
            bio: userData.bio || "",
            organization: userData.organization || "University of Washington",
            interests: userData.interests || [],
            photoURL: userData.photoURL || user.photoURL || "",
          })
        } else {
          // If user document doesn't exist, use auth user data
          setFormData({
            fullName: user.name || "",
            email: user.email || "",
            fieldOfStudy: "",
            bio: "",
            organization: "University of Washington",
            interests: [],
            photoURL: user.photoURL || "",
          })
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile data. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadUserData()
  }, [user, toast])

  const userId = user?.uid
  if (!user || !userId) {
    return <div>Loading profile...</div>
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        name: formData.fullName,
        fieldOfStudy: formData.fieldOfStudy,
        bio: formData.bio,
        organization: formData.organization,
        interests: formData.interests,
        photoURL: formData.photoURL,
        updatedAt: new Date(),
      })

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)

    try {
      // Create a storage reference with a unique path
      const storageRef = ref(storage, `profile_pictures/${userId}`)

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optional: Handle progress updates if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`Upload is ${progress}% done`)
        },
        (error) => {
          console.error("Error uploading image:", error)
          toast({
            title: "Upload Failed",
            description: "Failed to upload your profile picture. Please try again.",
            variant: "destructive",
          })
          setUploadingImage(false)
        },
        async () => {
          // Upload completed successfully, get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Update form data with the new image URL
          setFormData((prev) => ({ ...prev, photoURL: downloadURL }))

          // Save image URL to Firestore
          const userRef = doc(db, "users", userId)
          await updateDoc(userRef, { photoURL: downloadURL })

          toast({
            title: "Upload Complete",
            description: "Your profile picture has been updated.",
          })

          setUploadingImage(false)
        },
      )
    } catch (error) {
      console.error("Error handling image upload:", error)
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setUploadingImage(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="interests">AI Interests</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.photoURL} alt={formData.fullName} />
                    <AvatarFallback>{formData.fullName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="avatarUpload"
                  />
                  <label htmlFor="avatarUpload">
                    <Button variant="outline" type="button" disabled={uploadingImage} asChild>
                      <span>
                        {uploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Change Avatar"
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} readOnly disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science, Data Science, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself and your interests in AI"
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" name="organization" value={formData.organization} onChange={handleChange} />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your AI Interests</CardTitle>
              <CardDescription>Select topics you're interested in to get personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <InterestsSelection
                user={user}
                value={formData.interests}
                onChange={(newInterests: string[]) => {
                  setFormData((prev) => ({ ...prev, interests: newInterests }))

                  // Save interests to Firestore immediately
                  const userRef = doc(db, "users", userId)
                  updateDoc(userRef, { interests: newInterests }).catch((error) => {
                    console.error("Error updating interests:", error)
                    toast({
                      title: "Error",
                      description: "Failed to update your interests. Please try again.",
                      variant: "destructive",
                    })
                  })
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

