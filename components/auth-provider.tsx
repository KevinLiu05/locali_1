"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type User = {
  id: string
  name: string
  email: string
  photoURL?: string
  fieldOfStudy?: string
  bio?: string
  organization?: string
  interests?: string[]
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

          if (userDoc.exists()) {
            setUser({
              id: firebaseUser.uid,
              ...(userDoc.data() as Omit<User, "id">),
            })
          } else {
            // Create user doc if it doesn’t exist
            const userData = {
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || "/placeholder.svg?height=40&width=40",
              fieldOfStudy: "",
              bio: "",
              organization: "",
              interests: [],
              createdAt: new Date(),
            }

            await setDoc(doc(db, "users", firebaseUser.uid), userData)

            setUser({
              id: firebaseUser.uid,
              ...userData,
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update Firebase Auth display name
      await updateProfile(user, { displayName: name })

      // Create user document in Firestore
      const userData = {
        name: name,
        email: email,
        photoURL: `/placeholder.svg?height=40&width=40`,
        fieldOfStudy: "",
        bio: "",
        organization: "",
        interests: [],
        createdAt: new Date(),
      }

      await setDoc(doc(db, "users", user.uid), userData)

      // Update local state
      setUser({ id: user.uid, ...userData })
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    console.warn("⚠️ useAuth() is not inside an AuthProvider. Returning default values.")
    return {
      user: null,
      loading: true,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
    }
  }
  return context
}

