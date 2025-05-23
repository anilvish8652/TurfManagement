'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChartBig, CalendarCheck2, Users, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const totalBookingsData = [
  { month: "Jan", bookings: 186 },
  { month: "Feb", bookings: 305 },
  { month: "Mar", bookings: 237 },
  { month: "Apr", bookings: 273 },
  { month: "May", bookings: 209 },
  { month: "Jun", bookings: 214 },
];

const chartConfig: ChartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--primary))",
  },
};


const turfAvailabilityData = [
  { name: "Turf A", status: 75 }, // 75% available
  { name: "Turf B", status: 50 },
  { name: "Turf C", status: 90 },
  { name: "Turf D", status: 30 },
];
const turfChartConfig: ChartConfig = {
  status: {
    label: "Availability (%)",
    color: "hsl(var(--accent))",
  }
}


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/turfs/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Turf
            </Link>
          </Button>
          <Button asChild>
            <Link href="/bookings/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarCheck2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings (Next 7 Days)</CardTitle>
            <CalendarCheck2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div>
            <p className="text-xs text-muted-foreground">View Details</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Turfs Now</CardTitle>
            <BarChartBig className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 / 12</div>
            <p className="text-xs text-muted-foreground">Manage Availability</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Links */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Monthly booking overview for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart accessibilityLayer data={totalBookingsData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  // tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Turf Availability</CardTitle>
            <CardDescription>Current availability status of turfs.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={turfChartConfig} className="min-h-[250px] w-full">
              <BarChart accessibilityLayer data={turfAvailabilityData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis dataKey="status" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="status" fill="var(--color-status)" radius={5} layout="vertical" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Management</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/turfs" className="group">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Manage Turfs <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View, add, edit, or delete turf details.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/bookings" className="group">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Manage Bookings <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Oversee all current and past bookings.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/users" className="group">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Manage Users <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View and manage registered user accounts.</p>
              </CardContent>
            </Card>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
