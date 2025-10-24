import { Outlet } from "react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "~/components/primitives/sidebar"

export default function Layout() {
  return (
    <div className="[--header-height:calc(--spacing(10))]">
      <SidebarProvider className="flex flex-col">
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
