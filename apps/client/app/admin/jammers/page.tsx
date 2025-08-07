"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Package, MapPin, Calendar, Filter } from "lucide-react"

export default function JammersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const jammers = [
    {
      serialNumber: "JM-2024-001",
      model: "SecureBlock Pro",
      status: "OK",
      location: "Delhi Central Warehouse",
      lastMaintenance: "2024-01-15",
      batteryLevel: "98%",
      assignedTo: "Government College",
    },
    {
      serialNumber: "JM-2024-002",
      model: "SecureBlock Pro",
      status: "In Transit",
      location: "En route to Mumbai",
      lastMaintenance: "2024-01-10",
      batteryLevel: "95%",
      assignedTo: "Technical Institute",
    },
    {
      serialNumber: "JM-2024-003",
      model: "SecureBlock Lite",
      status: "Faulty",
      location: "Mumbai Storage Facility",
      lastMaintenance: "2024-01-05",
      batteryLevel: "12%",
      assignedTo: "Under Repair",
    },
    {
      serialNumber: "JM-2024-004",
      model: "SecureBlock Pro",
      status: "Deployed",
      location: "Central University",
      lastMaintenance: "2024-01-20",
      batteryLevel: "89%",
      assignedTo: "Engineering Exam",
    },
    {
      serialNumber: "JM-2024-005",
      model: "SecureBlock Max",
      status: "OK",
      location: "Bangalore Warehouse Hub",
      lastMaintenance: "2024-01-18",
      batteryLevel: "100%",
      assignedTo: "Available",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK":
        return "bg-green-100 text-green-800"
      case "Deployed":
        return "bg-blue-100 text-blue-800"
      case "In Transit":
        return "bg-yellow-100 text-yellow-800"
      case "Faulty":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBatteryColor = (level: string) => {
    const numLevel = Number.parseInt(level)
    if (numLevel > 80) return "text-green-600"
    if (numLevel > 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jammers</h1>
          <p className="text-muted-foreground">Master inventory of all jammers in the system</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by serial number, model, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Status
            </Button>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </Button>
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Model
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jammers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Jammers</CardTitle>
          <CardDescription>Complete inventory with real-time status and location tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jammers.map((jammer) => (
                <TableRow key={jammer.serialNumber}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{jammer.serialNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>{jammer.model}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(jammer.status)}>{jammer.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {jammer.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getBatteryColor(jammer.batteryLevel)}>{jammer.batteryLevel}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {jammer.lastMaintenance}
                    </div>
                  </TableCell>
                  <TableCell>{jammer.assignedTo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-sm text-muted-foreground">Total Jammers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2,654</div>
            <p className="text-sm text-muted-foreground">OK Status</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">In Transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">193</div>
            <p className="text-sm text-muted-foreground">Need Attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
