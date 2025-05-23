import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User } from "@/types";
import Link from "next/link";
import { MoreHorizontal, UserPlus, Edit, Eye, Ban } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const dummyUsers: User[] = [
  { id: "U001", name: "John Doe", email: "john.doe@example.com", phone: "555-1234", status: 'active', registrationDate: new Date(2023, 0, 15), lastLogin: new Date(2024, 5, 1) },
  { id: "U002", name: "Jane Smith", email: "jane.smith@example.com", status: 'active', registrationDate: new Date(2023, 2, 10), lastLogin: new Date(2024, 5, 3) },
  { id: "U003", name: "Alice Johnson", email: "alice.j@example.com", phone: "555-5678", status: 'blocked', registrationDate: new Date(2023, 5, 20) },
  { id: "U004", name: "Bob Williams", email: "bob.w@example.com", status: 'active', registrationDate: new Date(2024, 0, 5), lastLogin: new Date(2024, 4, 28) },
];

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        {/* <Button> <UserPlus className="mr-2 h-4 w-4" /> Add New User </Button>  Typically users self-register */}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>View and manage all registered users.</CardDescription>
          </div>
          <Input placeholder="Search by name or email..." className="max-w-sm w-full sm:w-auto" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="profile person" />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(user.registrationDate, "PP")}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}
                     className={user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' : ''}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
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
                          <Link href={`/users/${user.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Profile & History
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center text-destructive hover:text-destructive focus:text-destructive">
                          <Ban className="mr-2 h-4 w-4" /> 
                          {user.status === 'active' ? 'Block User' : 'Unblock User'}
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
