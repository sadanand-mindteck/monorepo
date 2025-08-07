"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Building2, Warehouse, Edit, Trash2 } from "lucide-react"

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const organizations = [
    {
      id: "ORG-001",
      name: "Delhi Central Warehouse",
      type: "Warehouse",
      location: "New Delhi",
      contact: "warehouse.delhi@example.com",
      phone: "+91-9876543210",
      status: "Active",
      capacity: "3000 units",
    },
    {
      id: "ORG-002",
      name: "Mumbai Storage Facility",
      type: "Warehouse",
      location: "Mumbai",
      contact: "warehouse.mumbai@example.com",
      phone: "+91-9876543211",
      status: "Active",
      capacity: "2500 units",
    },
    {
      id: "ORG-003",
      name: "SecureInstall Services",
      type: "Installation Agency",
      location: "Pan India",
      contact: "ops@secureinstall.com",
      phone: "+91-9876543212",
      status: "Active",
      capacity: "50 operators",
    },
    {
      id: "ORG-004",
      name: "TechGuard Solutions",
      type: "Installation Agency",
      location: "North India",
      contact: "support@techguard.com",
      phone: "+91-9876543213",
      status: "Active",
      capacity: "30 operators",
    },
    {
      id: "ORG-005",
      name: "Bangalore Warehouse Hub",
      type: "Warehouse",
      location: "Bangalore",
      contact: "warehouse.blr@example.com",
      phone: "+91-9876543214",
      status: "Inactive",
      capacity: "1800 units",
    },
  ]

  const getTypeIcon = (type: string) => {
    return type === "Warehouse" ? Warehouse : Building2
  }

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">Manage warehouses and installation agencies</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter by Type</Button>
            <Button variant="outline">Filter by Status</Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <CardDescription>Complete list of registered warehouses and installation agencies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => {
                const TypeIcon = getTypeIcon(org.type)
                return (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{org.name}</div>
                          <div className="text-sm text-muted-foreground">{org.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.type}</Badge>
                    </TableCell>
                    <TableCell>{org.location}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{org.contact}</div>
                        <div className="text-xs text-muted-foreground">{org.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{org.capacity}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(org.status)}>{org.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
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
            <p className="text-sm text-muted-foreground">Total Organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Active Warehouses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Installation Agencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">7,300</div>
            <p className="text-sm text-muted-foreground">Total Capacity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
