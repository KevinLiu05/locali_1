"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db, storage } from "@/lib/firebase" // Correct import path with storage
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"

export function ProfileForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    organization: "",
    photoURL: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        bio: user.bio || "AI enthusiast and researcher with a focus on NLP and ethics.",
        organization: user.organization || "Tech University",
        photoURL: user.photoURL || "",
      })
    }
  }, [user])

  const userId = user?.uid || user?.id
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
        bio: formData.bio,
        organization: formData.organization,
        photoURL: formData.photoURL, // Ensuring profile picture is saved
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    const storageRef = ref(storage, `profile_pictures/${userId}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: Handle progress updates if needed
      },
      (error) => {
        console.error("Error uploading image:", error)
        setUploadingImage(false)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        setFormData((prev) => ({ ...prev, photoURL: downloadURL }))

        // Save image URL to Firestore
        await updateDoc(doc(db, "users", userId), { photoURL: downloadURL })
        setUploadingImage(false)
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={formData.photoURL} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="avatarUpload" />
        <label htmlFor="avatarUpload">
          <Button asChild variant="outline" type="button" disabled={uploadingImage}>
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
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} />
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
  )
}

