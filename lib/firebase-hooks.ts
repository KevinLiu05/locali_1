"use client"

import { useState, useEffect } from "react"
import { collection, doc, getDoc, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"

export function useEvents(limitCount = 50) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const eventsRef = collection(db, "events")
        const q = query(eventsRef, orderBy("date", "asc"), limit(limitCount))

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const eventsList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            setEvents(eventsList)
            setLoading(false)
          },
          (err) => {
            setError(err)
            setLoading(false)
          },
        )

        return () => unsubscribe()
      } catch (err: any) {
        setError(err)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [limitCount])

  return { events, loading, error }
}

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    const fetchEvent = async () => {
      try {
        setLoading(true)
        const eventRef = doc(db, "events", eventId)

        const unsubscribe = onSnapshot(
          eventRef,
          (doc) => {
            if (doc.exists()) {
              setEvent({
                id: doc.id,
                ...doc.data(),
              })
            } else {
              setEvent(null)
            }
            setLoading(false)
          },
          (err) => {
            setError(err)
            setLoading(false)
          },
        )

        return () => unsubscribe()
      } catch (err: any) {
        setError(err)
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  return { event, loading, error }
}

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileRef = doc(db, "users", userId)

        const unsubscribe = onSnapshot(
          profileRef,
          (doc) => {
            if (doc.exists()) {
              setProfile({
                id: doc.id,
                ...doc.data(),
              })
            } else {
              setProfile(null)
            }
            setLoading(false)
          },
          (err) => {
            setError(err)
            setLoading(false)
          },
        )

        return () => unsubscribe()
      } catch (err: any) {
        setError(err)
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  return { profile, loading, error }
}

export function useEventAttendees(eventId: string | undefined) {
  const [attendees, setAttendees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    const fetchAttendees = async () => {
      try {
        setLoading(true)
        const attendeesRef = collection(db, "events", eventId, "attendees")

        const unsubscribe = onSnapshot(
          attendeesRef,
          async (snapshot) => {
            const attendeesList = []

            for (const doc of snapshot.docs) {
              const attendeeData = doc.data()
              // Fetch user profile for each attendee
              const userRef = doc(db, "users", attendeeData.userId)
              const userSnap = await getDoc(userRef)

              if (userSnap.exists()) {
                attendeesList.push({
                  id: doc.id,
                  ...attendeeData,
                  user: {
                    id: userSnap.id,
                    ...userSnap.data(),
                  },
                })
              }
            }

            setAttendees(attendeesList)
            setLoading(false)
          },
          (err) => {
            setError(err)
            setLoading(false)
          },
        )

        return () => unsubscribe()
      } catch (err: any) {
        setError(err)
        setLoading(false)
      }
    }

    fetchAttendees()
  }, [eventId])

  return { attendees, loading, error }
}

