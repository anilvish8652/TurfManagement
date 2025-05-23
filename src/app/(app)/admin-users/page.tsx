import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AdminUser } from "@/types";
import { MoreHorizontal, UserPlus, Edit, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const dummyAdminUsers: AdminUser[] = [
  { id: "A001", username: "superadmin", email: "super@turf.admin", role: "Super Admin", lastLogin: new Date(2024, 5, 1, 10, 0), status: 'active' },
  { id: "A002", username: "turfmanager_john", email: "john.manager@turf.admin", role: "Turf Manager", lastLogin: new Date(2024, 4, 28, 14,30), status: 'active' },
  { id: "A003", username: "disabled_admin", email: "disabled@turf.admin", role: "Turf Manager", status: 'disabled' },
];


export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin User Management</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add New Admin User
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>Manage admin accounts and their roles.</CardDescription>
          </div>
           <Input placeholder="Search by username or email..." className="max-w-sm w-full sm:w-auto" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyAdminUsers.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === "Super Admin" ? "destructive" : "secondary"}>
                       {admin.role === "Super Admin" && <ShieldAlert className="mr-1 h-3 w-3"/>}
                       {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {admin.lastLogin ? format(admin.lastLogin, "PPpp") : 'Never'}
                  </TableCell>
                   <TableCell>
                    <Badge variant={admin.status === 'active' ? 'default' : 'outline'}
                     className={admin.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' : ''}
                    >
                      {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
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
                        <DropdownMenuItem className="flex items-center"><Edit className="mr-2 h-4 w-4" /> Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center">Change Role</DropdownMenuItem>
                         <DropdownMenuItem className="flex items-center text-destructive hover:text-destructive focus:text-destructive">
                          {admin.status === 'active' ? 'Disable Account' : 'Enable Account'}
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
      <Card className="mt-4 bg-accent/20 border-accent">
        <CardHeader>
            <CardTitle className="text-accent-foreground flex items-center"><ShieldAlert className="mr-2 h-5 w-5" />Role-Based Access Control (RBAC)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
            This section is a placeholder for future RBAC implementation.
            Currently, roles are informational.
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                <li><strong>Super Admin:</strong> Full access to all system features, including managing other admin users.</li>
                <li><strong>Turf Manager:</strong> Access to turf management, availability, and booking management. Cannot manage admin users.</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
