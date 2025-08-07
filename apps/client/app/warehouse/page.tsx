"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, PackageOpen, Truck, QrCode, ArrowRight, LogOut, User, Warehouse } from "lucide-react"

export default function WarehousePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (role !== "warehouse") {
      router.push("/")
      return
    }

    setUserEmail(email || "")
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const inventoryStats = {
    ok: 1247,
    faulty: 89,
    incoming: 24,
  }

  const recentShipments = [
    {
      id: "SH-2024-045",
      destination: "Government College, Sector 5",
      jammers: 12,
      status: "Dispatched",
      time: "2 hours ago",
    },
    {
      id: "SH-2024-044",
      destination: "Central University",
      jammers: 18,
      status: "In Transit",
      time: "4 hours ago",
    },
    {
      id: "SH-2024-043",
      destination: "Technical Institute",
      jammers: 8,
      status: "Delivered",
      time: "6 hours ago",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Delhi Central Warehouse</h1>
              <p className="text-sm text-muted-foreground">JIMS Warehouse Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{userEmail}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Inventory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{inventoryStats.ok}</div>
                  <p className="text-sm text-muted-foreground">OK Jammers</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{inventoryStats.faulty}</div>
                  <p className="text-sm text-muted-foreground">Faulty Jammers</p>
                </div>
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{inventoryStats.incoming}</div>
                  <p className="text-sm text-muted-foreground">Incoming</p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <PackageOpen className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Receive Shipment</h3>
                  <p className="text-sm text-muted-foreground">Scan incoming jammers and update inventory</p>
                </div>
                <Button className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Start Receiving
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create Shipment</h3>
                  <p className="text-sm text-muted-foreground">Pack and dispatch jammers to exam centers</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Package className="w-4 h-4 mr-2" />
                  Start Packing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Shipments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
            <CardDescription>Latest outbound shipments from this warehouse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{shipment.id}</span>
                      <Badge
                        variant={
                          shipment.status === "Delivered"
                            ? "default"
                            : shipment.status === "Dispatched"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {shipment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{shipment.destination}</p>
                    <p className="text-xs text-muted-foreground">
                      {shipment.jammers} jammers • {shipment.time}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 bg-transparent">
            <QrCode className="w-5 h-5 mr-2" />
            Scan QR Code
          </Button>
          <Button variant="outline" className="h-16 bg-transparent">
            <Package className="w-5 h-5 mr-2" />
            View Inventory
          </Button>
        </div>
      </div>
    </div>
  )
}
