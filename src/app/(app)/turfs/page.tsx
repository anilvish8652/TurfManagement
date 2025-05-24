
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Turf, ApiTurfListItem, ApiTurfListResponse } from "@/types"; // Using shared types
import Link from "next/link";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export default function TurfsPage() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTurfsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      const msg = "Authentication token not found. Please login.";
      setError(msg);
      setIsLoading(false);
      toast({
        title: "Authentication Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api-proxy/Turf/GetTurfList?page=1&pageSize=100', { // Using proxy
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorBody = `API Error: ${response.status}`;
        try {
          const text = await response.text();
          errorBody += ` - ${text || response.statusText}`;
        } catch (e) {
          // ignore if reading text fails
        }
        console.error("Failed to fetch turfs:", errorBody);
        setError(`Server Error: ${response.status}. Check console for details.`);
        toast({ title: "Failed to load turfs", description: `The server responded with status ${response.status}. Please check console for more details.`, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const result: ApiTurfListResponse = await response.json();

      if (result.success && result.data) {
        const transformedTurfs: Turf[] = result.data.map((item: ApiTurfListItem) => {
          const locationParts = [item.turfAddress, item.turfCity].filter(Boolean);
          return {
            id: item.turfID,
            name: item.turfName,
            turfAddress: item.turfAddress || undefined,
            turfCity: item.turfCity || undefined,
            turfState: item.turfState || undefined,
            turfPinCode: item.turfPinCode || undefined,
            location: locationParts.join(', ') || 'N/A',
            turfType: item.turfType || undefined,
            turfContactNo: item.turfContactNo || undefined,
            turfEmail: item.turfEmail || undefined,
            rawImage: item.turfImage || undefined,
            images: [item.turfImage || `https://placehold.co/100x80.png`],
            status: 'available', // Default status as API doesn't provide it
          };
        });
        setTurfs(transformedTurfs);
        if (transformedTurfs.length === 0) {
          toast({ title: "No Turfs Found", description: "The API returned an empty list of turfs." });
        }
      } else {
        const msg = result.message || "Failed to process turfs data from API.";
        setError(msg);
        toast({ title: "Failed to load turfs", description: msg, variant: "destructive" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown network error fetching turfs.";
      console.error("Network or unexpected error fetching turfs:", err);
      setError(msg);
      toast({ title: "Failed to load turfs", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTurfsData();
  }, [fetchTurfsData]);

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
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading turfs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              <p>Error loading turfs: {error}</p>
              <Button variant="outline" onClick={fetchTurfsData} className="mt-4">Try Again</Button>
            </div>
          ) : turfs.length === 0 && !isLoading ? ( // Added !isLoading to prevent showing "No turfs found" during initial load
             <div className="text-center py-10 text-muted-foreground">
              <p>No turfs found. You can add a new turf to get started.</p>
               <Button asChild className="mt-4">
                  <Link href="/turfs/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Turf
                  </Link>
                </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turfs.map((turf) => (
                  <TableRow key={turf.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={turf.name}
                        className="aspect-square rounded-md object-cover"
                        height={64}
                        src={turf.images[0]}
                        width={64}
                        data-ai-hint={turf.turfType ? turf.turfType.toLowerCase().split(' ')[0] : "sports field"} // Use first word of type
                        unoptimized={turf.images[0].startsWith('https://placehold.co')}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{turf.name}</TableCell>
                    <TableCell>{turf.location}</TableCell>
                    <TableCell>{turf.turfType || 'N/A'}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
