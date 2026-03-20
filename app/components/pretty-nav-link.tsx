import { NavLink } from "react-router"
import { cn } from "~/lib/utils"

export function PrettyNavLink({
  children,
  ...props
}: React.ComponentProps<typeof NavLink>) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "flex rounded-sm text-sidebar-primary/70 items-center gap-2 overflow-hidden p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent/50 focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 hover:[&>svg]:text-sidebar-foreground [&>svg]:shrink-0",
          isActive &&
            "text-sidebar-primary bg-sidebar-accent hover:bg-sidebar-accent"
        )
      }
      {...props}
    >
      {children}
    </NavLink>
  )
}
