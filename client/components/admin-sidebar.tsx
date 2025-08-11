import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  Package,
  Users,
  FileText,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Examinations",
    url: "/admin/examinations",
    icon: BookOpen,
  },
  {
    title: "Organizations",
    url: "/admin/organizations",
    icon: Building2,
  },
  {
    title: "Jammers",
    url: "/admin/jammers",
    icon: Package,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: FileText,
  },
];

const getLastPathSegment = (path: string) => {
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1];
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">JIMS Admin</h2>
            <p className="text-xs text-muted-foreground">
              BEL Management Portal
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                 const itemSegment = pathname.split("/").pop();
                const isActive = itemSegment === getLastPathSegment(item.url);
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={`group ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : ""
                    }`}
                  >
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
