import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Turf } from "@/types";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";

const dummyTurfs: Turf[] = [
  { id: "1", name: "Greenfield Arena", location: "Downtown", description: "Premium 5-a-side turf", pricing: 50, images: ["https://placehold.co/100x80.png"], amenities: ["Floodlights", "Changing Rooms"], status: 'available', operatingHours: { start: "08:00", end: "22:00" } },
  { id: "2", name: "City Soccer Park", location: "Suburb", description: "Spacious 7-a-side turf", pricing: 70, images: ["https://placehold.co/100x80.png"], amenities: ["Parking", "Cafe"], status: 'maintenance', operatingHours: { start: "09:00", end: "23:00" } },
  { id: "3", name: "Rooftop Kickers", location: "Uptown", description: "Scenic rooftop turf", pricing: 60, images: ["https://placehold.co/100x80.png"], amenities: ["Seating Area", "Washrooms"], status: 'closed', operatingHours: { start: "10:00", end: "20:00" } },
];

export default function TurfsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Turf Management</h1>
        <Button asChild>
          <Link href="/turfs/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Turf
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Turfs</CardTitle>
          <CardDescription>View and manage all available turfs in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden md:table-cell">Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyTurfs.map((turf) => (
                <TableRow key={turf.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={turf.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={turf.images[0]}
                      width="64"
                      data-ai-hint="sports field"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{turf.name}</TableCell>
                  <TableCell>{turf.location}</TableCell>
                  <TableCell className="hidden md:table-cell">${turf.pricing}/hr</TableCell>
                  <TableCell>
                    <Badge variant={turf.status === 'available' ? 'default' : turf.status === 'maintenance' ? 'secondary' : 'destructive'}>
                      {turf.status.charAt(0).toUpperCase() + turf.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/turfs/${turf.id}/view`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/turfs/edit/${turf.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center text-destructive hover:text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
