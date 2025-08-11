"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, CheckCircle, Circle, Lock, User, LogOut, UserCheck, Power, Upload } from "lucide-react"

export default function OperatorPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const email = localStorage.getItem("userEmail")

    if (role !== "operator") {
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

  const assignment = {
    center: "Government College, Sector 5",
    address: "Sector 5, Dwarka, New Delhi - 110075",
    examDate: "February 15, 2024",
    reportingTime: "07:00 AM",
    jammersRequired: 12,
    examStartTime: "10:00 AM",
  }

  const checklist = [
    {
      id: 1,
      title: "Mark Attendance",
      description: "Check-in at the exam center",
      icon: UserCheck,
      status: currentStep >= 1 ? "completed" : currentStep === 0 ? "active" : "locked",
      gpsRequired: true,
    },
    {
      id: 2,
      title: "Receive Jammers",
      description: "Confirm receipt of shipment",
      icon: CheckCircle,
      status: currentStep >= 2 ? "completed" : currentStep === 1 ? "active" : "locked",
      gpsRequired: false,
    },
    {
      id: 3,
      title: "Install Jammers",
      description: "0 / 12 Installed",
      icon: Circle,
      status: currentStep >= 3 ? "completed" : currentStep === 2 ? "active" : "locked",
      gpsRequired: false,
      progress: 0,
    },
    {
      id: 4,
      title: "Power ON Jammers",
      description: "Available 10 min before exam",
      icon: Power,
      status: currentStep >= 4 ? "completed" : "locked",
      gpsRequired: false,
      timeRestricted: true,
    },
    {
      id: 5,
      title: "Upload Certificate",
      description: "Photo of signed certificate",
      icon: Upload,
      status: currentStep >= 5 ? "completed" : "locked",
      gpsRequired: false,
    },
    {
      id: 6,
      title: "Power OFF & De-install",
      description: "Pack jammers for return",
      icon: Power,
      status: currentStep >= 6 ? "completed" : "locked",
      gpsRequired: false,
    },
  ]

  const handleStepAction = (stepId: number) => {
    if (stepId === currentStep + 1 || (stepId === 1 && currentStep === 0)) {
      setCurrentStep(stepId)
    }
  }

  const getStepIcon = (step: any) => {
    if (step.status === "completed") return CheckCircle
    if (step.status === "active") return step.icon
    return Lock
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "active":
        return "text-blue-600"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Field Operator</h1>
              <p className="text-sm text-muted-foreground">JIMS Installation Portal</p>
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
        {/* Assignment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Today's Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{assignment.center}</h3>
                <p className="text-sm text-muted-foreground">{assignment.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Report: {assignment.reportingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4 text-muted-foreground" />
                  <span>{assignment.jammersRequired} Jammers</span>
                </div>
              </div>

              <Badge variant="outline" className="w-fit">
                Exam Date: {assignment.examDate}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{currentStep}/6 Steps Completed</span>
              </div>
              <Progress value={(currentStep / 6) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Daily Task Checklist</h2>

          {checklist.map((step) => {
            const StepIcon = getStepIcon(step)
            const isActive = step.status === "active"
            const isCompleted = step.status === "completed"
            const isLocked = step.status === "locked"

            return (
              <Card key={step.id} className={`${isActive ? "ring-2 ring-blue-500" : ""}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted ? "bg-green-100" : isActive ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <StepIcon className={`w-6 h-6 ${getStepColor(step.status)}`} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>

                      {step.gpsRequired && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          GPS Required
                        </Badge>
                      )}

                      {step.timeRestricted && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Time Restricted
                        </Badge>
                      )}
                    </div>

                    <div>
                      {isCompleted && <Badge className="bg-green-100 text-green-800">Completed</Badge>}

                      {isActive && (
                        <Button onClick={() => handleStepAction(step.id)}>
                          {step.id === 1
                            ? "Check In"
                            : step.id === 2
                              ? "Confirm Receipt"
                              : step.id === 3
                                ? "Start Installing"
                                : step.id === 4
                                  ? "Power ON"
                                  : step.id === 5
                                    ? "Take Photo"
                                    : "Complete"}
                        </Button>
                      )}

                      {isLocked && <Badge variant="secondary">Locked</Badge>}
                    </div>
                  </div>

                  {step.progress !== undefined && (
                    <div className="mt-4">
                      <Progress value={step.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Emergency Contact */}
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-red-600">Emergency Contact</h3>
              <p className="text-sm text-muted-foreground">For technical issues or emergencies</p>
              <Button variant="outline" className="text-red-600 border-red-200 bg-transparent">
                Call Support: +91-9876543210
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
