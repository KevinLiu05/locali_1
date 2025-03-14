import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

export function EventsGrid() {
  // Mock data for events
  const events = [
    {
      id: "1",
      title: "Deep Learning Workshop",
      date: "March 15, 2024",
      time: "2:00 PM - 4:00 PM",
      location: "Tech Building, Room 302",
      attendees: 45,
      tags: ["Deep Learning", "Neural Networks", "AI"],
      matchScore: 98,
    },
    {
      id: "2",
      title: "NLP Research Symposium",
      date: "March 20, 2024",
      time: "10:00 AM - 3:00 PM",
      location: "Science Center Auditorium",
      attendees: 120,
      tags: ["NLP", "Research", "Language Models"],
      matchScore: 92,
    },
    {
      id: "3",
      title: "AI Ethics Panel Discussion",
      date: "March 25, 2024",
      time: "5:30 PM - 7:00 PM",
      location: "Virtual Event",
      attendees: 78,
      tags: ["AI Ethics", "Responsible AI", "Discussion"],
      matchScore: 87,
    },
    {
      id: "6",
      title: "Computer Vision Hackathon",
      date: "April 5, 2024",
      time: "9:00 AM - 9:00 PM",
      location: "Innovation Hub",
      attendees: 60,
      tags: ["Computer Vision", "Hackathon", "Competition"],
      matchScore: 85,
    },
    {
      id: "7",
      title: "Reinforcement Learning Meetup",
      date: "April 10, 2024",
      time: "6:30 PM - 8:30 PM",
      location: "Tech Incubator, Floor 3",
      attendees: 35,
      tags: ["Reinforcement Learning", "AI", "Meetup"],
      matchScore: 82,
    },
    {
      id: "8",
      title: "AI in Healthcare Symposium",
      date: "April 15, 2024",
      time: "1:00 PM - 5:00 PM",
      location: "Medical School Auditorium",
      attendees: 150,
      tags: ["Healthcare AI", "Medical", "Research"],
      matchScore: 79,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              {event.matchScore && (
                <Badge variant="secondary" className="ml-2">
                  {event.matchScore}% Match
                </Badge>
              )}
            </div>
            <CardDescription className="flex flex-wrap gap-1 mt-1">
              {event.tags.map((tag) => (
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
                {event.date}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                {event.time}
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                {event.attendees} attendees
              </div>
            </div>
          </CardContent>
          <div className="px-6 pb-6 pt-0">
            <Button asChild className="w-full">
              <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

