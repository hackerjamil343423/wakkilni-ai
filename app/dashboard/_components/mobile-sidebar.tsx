"use client";

import UserProfile from "@/components/user-profile";
import clsx from "clsx";
import {
  Activity,
  Bot,
  Lightbulb,
  LucideIcon,
  ShoppingCart,
  Plug,
  Sparkles,
} from "lucide-react";
import {
  SiFacebook,
  SiGoogle,
  SiTiktok,
} from "@icons-pack/react-simple-icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Performance Monitoring",
    items: [
      {
        label: "Global Overview",
        href: "/dashboard",
        icon: Activity,
      },
      {
        label: "Meta Ads",
        href: "/dashboard/meta-ads",
        icon: SiFacebook,
      },
      {
        label: "Google Ads",
        href: "/dashboard/google-ads",
        icon: SiGoogle,
      },
      {
        label: "TikTok Ads",
        href: "/dashboard/tiktok-ads",
        icon: SiTiktok,
      },
    ],
  },
  {
    title: "AI Intelligence",
    items: [
      {
        label: "AI Agent",
        href: "/dashboard/chat",
        icon: Bot,
      },
      {
        label: "Smart Insights",
        href: "/dashboard/insights",
        icon: Lightbulb,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "E-commerce",
        href: "/dashboard/ecommerce",
        icon: ShoppingCart,
      },
      {
        label: "Connect Platform",
        href: "/dashboard/connect-platform",
        icon: Plug,
      },
    ],
  },
];

interface MobileSidebarProps {
  trigger: React.ReactNode;
}

export default function MobileSidebar({ trigger }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleNavigation = (href: string) => {
    router.push(href);
    setOpen(false); // Close sidebar after navigation
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col bg-sidebar">
          {/* Logo Section */}
          <div className="flex h-[3.45rem] items-center border-b border-sidebar-border px-5">
            <Link
              prefetch={true}
              className="flex items-center gap-2.5 font-semibold hover:cursor-pointer group"
              href="/"
              onClick={() => setOpen(false)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-foreground font-semibold tracking-tight">
                Wakklni AI
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col h-full w-full">
            <div className="flex-1 w-full overflow-y-auto py-2">
              {navSections.map((section, sectionIndex) => (
                <div key={section.title} className="py-3">
                  <div className="px-5 mb-2">
                    <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                      {section.title}
                    </h3>
                  </div>
                  <div className="space-y-1 px-3">
                    {section.items.map((item) => (
                      <div
                        key={item.href}
                        onClick={() => handleNavigation(item.href)}
                        className={clsx(
                          "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:cursor-pointer group/item",
                          pathname === item.href
                            ? "bg-sidebar-accent text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                        )}
                      >
                        <div
                          className={clsx(
                            "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
                            pathname === item.href
                              ? "bg-primary/15"
                              : "bg-transparent group-hover/item:bg-muted/50"
                          )}
                        >
                          <item.icon
                            className={clsx(
                              "h-4 w-4 transition-colors",
                              pathname === item.href ? "text-primary" : ""
                            )}
                          />
                        </div>
                        <span>{item.label}</span>
                        {pathname === item.href && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                  {sectionIndex < navSections.length - 1 && (
                    <div className="mx-5 mt-4 border-t border-sidebar-border/50" />
                  )}
                </div>
              ))}
            </div>

            {/* User Profile */}
            <div className="w-full border-t border-sidebar-border/50 px-3 py-4">
              <UserProfile />
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
