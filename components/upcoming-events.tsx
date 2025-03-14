"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useEvents } from "@/lib/firebase-hooks"
import { format, isAfter, isBefore, addDays } from "date-fns"

export function UpcomingEvents() {
  const { events, loading, error } = useEvents()

  // Filter to only show upcoming events (next 7 days)
  const today = new Date()
  const nextWeek = addDays(today, 7)

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      return isAfter(eventDate, today) && isBefore(eventDate, nextWeek)
    })
    .slice(0, 2)

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
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
      </section>
    )
  }

  if (error || upcomingEvents.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">This Week at UW</h2>
          <p className="text-muted-foreground">Upcoming AI events in the next 7 days</p>
        </div>
        <Link href="/events" className="text-sm text-muted-foreground hover:underline">
          View all
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {upcomingEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                {event.tags && event.tags[0] && <Badge variant="secondary">{event.tags[0]}</Badge>}
              </div>
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
    </section>
  )
}

