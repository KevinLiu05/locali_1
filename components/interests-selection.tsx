"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

interface InterestsSelectionProps {
  user: any
  value?: string[]
  onChange?: (newInterests: string[]) => void
}

export function InterestsSelection({ user, value, onChange }: InterestsSelectionProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(value || [])
  const [loading, setLoading] = useState(true)

  // Sync with external value if provided
  useEffect(() => {
    if (value) {
      setSelectedInterests(value)
      setLoading(false)
    }
  }, [value])

  // Load interests from Firestore only if no external value is provided
  useEffect(() => {
    if (value) {
      return
    }

    const loadUserInterests = async () => {
      const defaultInterests = ["Deep Learning", "NLP", "AI Ethics"]

      if (!user || !user.uid) {
        console.log("No user found or user not fully loaded")
        setSelectedInterests(defaultInterests)
        setLoading(false)
        return
      }

      try {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData && Array.isArray(userData.interests)) {
            setSelectedInterests(userData.interests)
          } else {
            // Initialize with default interests if missing
            setSelectedInterests(defaultInterests)
            await updateDoc(userRef, { interests: defaultInterests })
          }
        } else {
          // Create document with default interests if it doesn't exist
          setSelectedInterests(defaultInterests)
          await setDoc(userRef, { interests: defaultInterests })
        }
      } catch (error) {
        console.error("Error loading interests:", error)
        setSelectedInterests(defaultInterests)
      } finally {
        setLoading(false)
      }
    }

    loadUserInterests()
  }, [user, value])

  const allInterests = [
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "AI Ethics",
    "Reinforcement Learning",
    "Neural Networks",
    "Machine Learning",
    "Data Science",
    "Robotics",
    "Generative AI",
    "Large Language Models",
    "AI in Healthcare",
    "AI in Finance",
    "AI in Education",
    "Explainable AI",
    "Edge AI",
    "AI Hardware",
    "Quantum Computing",
    "Autonomous Systems",
    "Human-AI Interaction",
  ]

  const toggleInterest = async (interest: string) => {
    if (!user || !user.uid) {
      alert("Please sign in to update your interests.")
      return
    }

    let newInterests: string[]
    if (selectedInterests.includes(interest)) {
      newInterests = selectedInterests.filter((i) => i !== interest)
    } else {
      newInterests = [...selectedInterests, interest]
    }

    setSelectedInterests(newInterests)
    if (onChange) onChange(newInterests)

    try {
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        await setDoc(userRef, { interests: newInterests })
      } else {
        await updateDoc(userRef, { interests: newInterests })
      }
    } catch (error) {
      console.error("Error updating interests:", error)
      alert("Failed to update interests. Please try again.")
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest)
              return (
                <Badge
                  key={interest}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer ${isSelected ? "bg-primary" : ""}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {isSelected && <Check className="mr-1 h-3 w-3" />}
                  {interest}
                </Badge>
              )
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            Selected {selectedInterests.length} of {allInterests.length} interests
          </p>
        </>
      )}
    </div>
  )
}

