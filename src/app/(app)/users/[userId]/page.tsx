'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User, Booking } from "@/types";
import { ArrowLeft, Edit, Ban, CalendarDays, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const dummyUsers: User[] = [
  { id: "U001", name: "John Doe", email: "john.doe@example.com", phone: "555-1234", status: 'active', registrationDate: new Date(2023, 0, 15), lastLogin: new Date(2024, 5, 1) },
  { id: "U002", name: "Jane Smith", email: "jane.smith@example.com", status: 'active', registrationDate: new Date(2023, 2, 10), lastLogin: new Date(2024, 5, 3) },
];

const dummyBookings: Booking[] = [
  { id: "B001", turfId: "1", turfName: "Greenfield Arena", userId: "U001", userName: "John Doe", startTime: new Date(Date.now() - 86400000 * 5), endTime: new Date(Date.now() - 86400000 * 5 + 3600000 * 2), status: 'completed', totalPrice: 100, bookedAt: new Date(Date.now() - 86400000 * 6) },
  { id: "B004", turfId: "3", turfName: "Rooftop Kickers", userId: "U001", userName: "John Doe", startTime: new Date(Date.now() + 86400000 * 3), endTime: new Date(Date.now() + 86400000 * 3 + 3600000 * 1), status: 'confirmed', totalPrice: 60, bookedAt: new Date() },
];

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // In a real app, fetch user and their bookings by userId
    const foundUser = dummyUsers.find(u => u.id === userId);
    setUser(foundUser || null);
    if (foundUser) {
      setUserBookings(dummyBookings.filter(b => b.userId === foundUser.id));
    }
  }, [userId]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-muted-foreground">User not found.</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/users">Go back to User Management</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
            <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Users</span>
            </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">User Profile: {user.name}</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Edit className="mr-2 h-4 w-4"/> Edit Profile</Button>
            <Button variant="destructive"><Ban className="mr-2 h-4 w-4"/> {user.status === 'active' ? 'Block User' : 'Unblock User'}</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
              <AvatarImage src={`https://placehold.co/96x96.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="profile person" />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}
             className={`mt-1 ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' : ''}`}
            >
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span>Registered: {format(user.registrationDate, "PPP")}</span>
            </div>
            {user.lastLogin && (
                 <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <span>Last Login: {format(user.lastLogin, "PPp")}</span>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>List of all bookings made by {user.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            {userBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Turf</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>{booking.turfName}</TableCell>
                      <TableCell>{format(booking.startTime, "PPp")}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'completed' ? 'secondary' : 'destructive'}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No bookings found for this user.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
