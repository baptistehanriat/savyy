import { NavLink, Outlet } from "react-router"
import { Tags, ArrowLeftRight, MoreHorizontal, Coins } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

const navItems = [
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/labels", label: "Labels", icon: Tags },
]

export default function AppLayout() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Top-left: logo button */}
      <div className="fixed top-4 left-4 z-50">
        <div className="size-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm transition-colors cursor-pointer">
          <Coins size={20} />
        </div>
      </div>

      {/* Top-center: floating navigation */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <nav className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1.5 shadow-sm">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                ].join(" ")
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Top-right: user menu */}
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              className="size-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-accent transition-colors cursor-pointer"
              aria-label="User menu"
            >
              <MoreHorizontal size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Page content */}
      <Outlet />
    </div>
  )
}
