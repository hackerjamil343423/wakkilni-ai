"use client";

import UserProfile from "@/components/user-profile";
import clsx from "clsx";
import {
  Activity,
  Bot,
  Lightbulb,
  LucideIcon,
  ShoppingCart,
  Sparkles,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlatformConnections } from "@/lib/platform/hooks/usePlatformConnections";
import { getAvailablePlatforms, PlatformConfig } from "@/lib/platform/config";
import { useTranslation } from "@/hooks/use-translation";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  requireConnection?: boolean;  // If true, only show when platform is connected
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const STATIC_NAV_SECTIONS: NavSection[] = [
  {
    title: "nav.performanceMonitoring",
    items: [
      {
        label: "nav.globalOverview",
        href: "/dashboard",
        icon: Activity,
      },
    ],
  },
  {
    title: "nav.aiIntelligence",
    items: [
      {
        label: "nav.aiAgent",
        href: "/dashboard/chat",
        icon: Bot,
      },
      {
        label: "nav.smartInsights",
        href: "/dashboard/insights",
        icon: Lightbulb,
      },
    ],
  },
  {
    title: "nav.sales",
    items: [
      {
        label: "nav.ecommerce",
        href: "/dashboard/ecommerce",
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "nav.management",
    items: [
      {
        label: "nav.notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
    ],
  },
];

export default function DashboardSideBar() {
  const pathname = usePathname();
  const { isPlatformConnected } = usePlatformConnections();
  const { t } = useTranslation();

  // Build platform nav items dynamically based on connection status
  const platformNavItems: NavItem[] = getAvailablePlatforms().map((platform) => {
    // Convert platform id to translation key (e.g., "meta-ads" -> "metaAds")
    const translationKey = platform.id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return {
      label: `platform.${translationKey}.shortName`,
      href: platform.dashboardPath,
      icon: platform.icon,
      requireConnection: true,
    };
  });

  // Combine static and dynamic nav items
  const navSections: NavSection[] = [
    {
      title: "nav.performanceMonitoring",
      items: [
        STATIC_NAV_SECTIONS[0].items[0], // Global Overview
        ...platformNavItems,
      ],
    },
    ...STATIC_NAV_SECTIONS.slice(1), // AI Intelligence, Sales, Management
  ];

  // Check if an item should be visible
  const isItemVisible = (item: NavItem): boolean => {
    if (!item.requireConnection) {
      return true;
    }

    // Check platform connection status
    const platform = getAvailablePlatforms().find((p) => p.dashboardPath === item.href);
    if (!platform) {
      return true; // Not a platform, show by default
    }

    return isPlatformConnected(platform.id);
  };

  return (
    <div className="min-[1024px]:block hidden w-64 border-r border-sidebar-border h-full bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-[3.45rem] items-center border-b border-sidebar-border px-5">
          <Link
            prefetch={true}
            className="flex items-center gap-2.5 font-semibold hover:cursor-pointer group"
            href="/"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-foreground font-semibold tracking-tight">Wakklni AI</span>
          </Link>
        </div>

        <nav className="flex flex-col h-full w-full">
          <div className="flex-1 w-full overflow-y-auto py-2">
            {navSections.map((section, sectionIndex) => (
              <div key={section.title} className="py-2">
                <div className="px-5 mb-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                    {t(section.title)}
                  </h3>
                </div>
                <div className="space-y-1 px-3">
                  {section.items.filter(isItemVisible).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={clsx(
                        "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:cursor-pointer group/item",
                        pathname === item.href
                          ? "bg-sidebar-accent text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                      )}
                    >
                      <div className={clsx(
                        "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
                        pathname === item.href
                          ? "bg-primary/15"
                          : "bg-transparent group-hover/item:bg-muted/50"
                      )}>
                        <item.icon className={clsx(
                          "h-4 w-4 transition-colors",
                          pathname === item.href ? "text-primary" : ""
                        )} />
                      </div>
                      <span>{t(item.label)}</span>
                      {pathname === item.href && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </Link>
                  ))}
                </div>
                {sectionIndex < navSections.length - 1 && (
                  <div className="mx-5 mt-3 border-t border-sidebar-border/50" />
                )}
              </div>
            ))}
          </div>

          <div className="w-full shrink-0 border-t border-sidebar-border/50 px-3 py-3">
            <UserProfile />
          </div>
        </nav>
      </div>
    </div>
  );
}
