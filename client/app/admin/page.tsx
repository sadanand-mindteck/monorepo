"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Truck, BookOpen, AlertTriangle, MapPin, Activity, TrendingUp, Users, FileText } from "lucide-react";
import MapView from "@/components/map";

export default function AdminDashboard() {
  const kpis = [
    {
      title: "Total Jammers",
      value: "2,847",
      subtitle: "2,654 OK • 193 Faulty",
      icon: Package,
      trend: "+12 this week",
      color: "text-green-600",
    },
    {
      title: "In Transit",
      value: "156",
      subtitle: "Across 23 shipments",
      icon: Truck,
      trend: "8 arriving today",
      color: "text-blue-600",
    },
    {
      title: "Active Exams",
      value: "34",
      subtitle: "12 starting today",
      icon: BookOpen,
      trend: "Peak season",
      color: "text-purple-600",
    },
    {
      title: "Attention Required",
      value: "7",
      subtitle: "Centers need review",
      icon: AlertTriangle,
      trend: "2 critical",
      color: "text-red-600",
    },
  ];

  const recentActivity = [
    {
      time: "2 min ago",
      action: "Shipment JIM-2024-001 delivered to Government College",
      status: "success",
    },
    {
      time: "15 min ago",
      action: "Installation completed at Central University - 12/12 jammers",
      status: "success",
    },
    {
      time: "1 hour ago",
      action: "Faulty jammer reported at Technical Institute (Serial: JM-4567)",
      status: "warning",
    },
    {
      time: "2 hours ago",
      action: "New examination created: Engineering Entrance Exam 2024",
      status: "info",
    },
    {
      time: "3 hours ago",
      action: "Warehouse operator checked in at Delhi Central Warehouse",
      status: "info",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the JIMS Admin Portal. Here's your system overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{kpi.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              System Map View
            </CardTitle>
            <CardDescription>Real-time locations of warehouses and exam centers</CardDescription>
          </CardHeader>
          <CardContent>
            <MapView />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "success" ? "bg-green-500" : activity.status === "warning" ? "bg-yellow-500" : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2">
              <BookOpen className="h-6 w-6" />
              Create New Examination
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Users className="h-6 w-6" />
              Add New User
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <FileText className="h-6 w-6" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
