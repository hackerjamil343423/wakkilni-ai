"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ReactNode } from "react";
import MobileSidebar from "./mobile-sidebar";

export default function DashboardTopNav({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[52px] items-center gap-4 border-b px-3">
        {/* Mobile Menu Trigger */}
        <div className="min-[1024px]:hidden">
          <MobileSidebar
            trigger={
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            }
          />
        </div>
      </header>
      {children}
    </div>
  );
}
