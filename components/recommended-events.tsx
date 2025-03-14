"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import Image from "next/image"

export function RecommendedEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userInterests, setUserInterests] = useState<string[]>([])

  useEffect(() => {
    const fetchRecommendedEvents = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // First, get the user's interests
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        let interests: string[] = []
        if (userDoc.exists() && userDoc.data().interests) {
          interests = userDoc.data().interests
          setUserInterests(interests)
        }

        // Query events
        const eventsRef = collection(db, "events")
        const eventsQuery = query(eventsRef, where("isPublic", "==", true), orderBy("date", "asc"), limit(10))

        const snapshot = await getDocs(eventsQuery)
        const eventsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Calculate match scores for each event based on user interests
        const eventsWithScores = eventsList.map((event) => {
          if (!interests.length || !event.tags) {
            return { ...event, matchScore: 0 }
          }

          // Calculate match score based on overlap between user interests and event tags
          const matchingTags = event.tags.filter((tag: string) => interests.includes(tag))
          const matchScore = Math.round((matchingTags.length / Math.max(1, interests.length)) * 100)

          return { ...event, matchScore }
        })

        // Sort by match score and take top 3
        const recommendedEvents = eventsWithScores
          .sort((a, b) => b.matchScore - a.matchScore)
          .filter((event) => event.matchScore > 0)
          .slice(0, 3)

        setEvents(recommendedEvents)
      } catch (error) {
        console.error("Error fetching recommended events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedEvents()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
            <p className="text-muted-foreground">Events tailored to your interests by our AI</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/events">View All</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex flex-wrap gap-1 mt-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <div className="px-6 pb-6 pt-0">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!user || events.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Discover Events</h2>
            <p className="text-muted-foreground">
              {user
                ? "Update your interests to get personalized recommendations"
                : "Sign in to get personalized recommendations"}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/events">View All</Link>
          </Button>
        </div>
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No recommended events found</h3>
          <p className="text-muted-foreground mb-4">
            {user
              ? "We couldn't find events matching your interests. Try updating your interests in your profile."
              : "Sign in to get personalized event recommendations based on your interests."}
          </p>
          <Button asChild>
            {user ? (
              <Link href="/dashboard/profile?tab=interests">Update Interests</Link>
            ) : (
              <Link href="/auth/signin">Sign In</Link>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
          <p className="text-muted-foreground">Events tailored to your interests by our AI</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/events">View All</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            {event.imageURL && (
              <div className="relative w-full h-40">
                <Image src={event.imageURL || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {event.matchScore}% Match
                </Badge>
              </div>
              <CardDescription className="flex flex-wrap gap-1 mt-1">
                {event.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {event.date ? format(new Date(event.date), "EEEE, MMMM d, yyyy") : "Date TBD"}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {event.time || "Time TBD"}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {event.location || "Location TBD"}
                </div>
                {event.attendeeCount !== undefined && event.attendeeCount > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {event.attendeeCount} attendees
                  </div>
                )}
              </div>
            </CardContent>
            <div className="px-6 pb-6 pt-0">
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

