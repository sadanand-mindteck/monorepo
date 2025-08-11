"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Shield, Warehouse, UserCheck, Edit, MoreHorizontal } from "lucide-react"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const users = [
    {
      id: "USR-001",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@bel.co.in",
      role: "BEL Admin",
      organization: "BEL Headquarters",
      status: "Active",
      lastLogin: "2024-01-24 09:30 AM",
    },
    {
      id: "USR-002",
      name: "Priya Sharma",
      email: "priya.sharma@warehouse.com",
      role: "Warehouse Operator",
      organization: "Delhi Central Warehouse",
      status: "Active",
      lastLogin: "2024-01-24 08:15 AM",
    },
    {
      id: "USR-003",
      name: "Amit Singh",
      email: "amit.singh@secureinstall.com",
      role: "Installation Operator",
      organization: "SecureInstall Services",
      status: "Active",
      lastLogin: "2024-01-24 07:45 AM",
    },
    {
      id: "USR-004",
      name: "Sunita Patel",
      email: "sunita.patel@warehouse.com",
      role: "Warehouse Operator",
      organization: "Mumbai Storage Facility",
      status: "Inactive",
      lastLogin: "2024-01-20 02:30 PM",
    },
    {
      id: "USR-005",
      name: "Vikram Gupta",
      email: "vikram.gupta@techguard.com",
      role: "Installation Operator",
      organization: "TechGuard Solutions",
      status: "Active",
      lastLogin: "2024-01-24 06:00 AM",
    },
  ]

  const getRoleIcon = (role: string) => {
    if (role === "BEL Admin") return Shield
    if (role === "Warehouse Operator") return Warehouse
    return UserCheck
  }

  const getRoleColor = (role: string) => {
    if (role === "BEL Admin") return "bg-purple-100 text-purple-800"
    if (role === "Warehouse Operator") return "bg-blue-100 text-blue-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users and their access permissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter by Role</Button>
            <Button variant="outline">Filter by Status</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Complete list of system users with their roles and access status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const RoleIcon = getRoleIcon(user.role)
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.organization}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">1</div>
            <p className="text-sm text-muted-foreground">BEL Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Field Operators</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
