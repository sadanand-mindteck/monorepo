"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, Filter, Eye, BarChart3 } from "lucide-react"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("")
  const [dateRange, setDateRange] = useState("")

  const availableReports = [
    {
      id: "RPT-001",
      name: "Jammer Inventory Report",
      description: "Complete inventory status with locations",
      type: "Inventory",
      frequency: "Daily",
      lastGenerated: "2024-01-24 09:00 AM",
      status: "Ready",
    },
    {
      id: "RPT-002",
      name: "Installation Summary",
      description: "Summary of all installations by examination",
      type: "Operations",
      frequency: "Per Exam",
      lastGenerated: "2024-01-23 06:30 PM",
      status: "Ready",
    },
    {
      id: "RPT-003",
      name: "Warehouse Activity Log",
      description: "All inbound and outbound shipments",
      type: "Logistics",
      frequency: "Weekly",
      lastGenerated: "2024-01-22 11:15 AM",
      status: "Ready",
    },
    {
      id: "RPT-004",
      name: "Operator Performance",
      description: "Field operator task completion metrics",
      type: "Performance",
      frequency: "Monthly",
      lastGenerated: "2024-01-20 03:45 PM",
      status: "Generating",
    },
    {
      id: "RPT-005",
      name: "System Health Dashboard",
      description: "Overall system status and KPIs",
      type: "Analytics",
      frequency: "Real-time",
      lastGenerated: "2024-01-24 10:30 AM",
      status: "Ready",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Inventory":
        return "bg-blue-100 text-blue-800"
      case "Operations":
        return "bg-green-100 text-green-800"
      case "Logistics":
        return "bg-purple-100 text-purple-800"
      case "Performance":
        return "bg-orange-100 text-orange-800"
      case "Analytics":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-800"
      case "Generating":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and export system reports for analysis</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create Custom Report
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Filter reports by type, date range, and other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="Search reports..." />

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Pre-configured reports ready for generation and export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{report.name}</h3>
                      <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Frequency: {report.frequency}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last: {report.lastGenerated}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled={report.status === "Generating"}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" disabled={report.status === "Generating"}>
                    Generate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Real-time Dashboard</h3>
                <p className="text-sm text-muted-foreground">Live system metrics</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Export All Data</h3>
                <p className="text-sm text-muted-foreground">Bulk data export</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Schedule Reports</h3>
                <p className="text-sm text-muted-foreground">Automated reporting</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Setup Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
