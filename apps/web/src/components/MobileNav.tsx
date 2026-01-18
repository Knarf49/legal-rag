"use client";

import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import {
  Home,
  Bell,
  FileText,
  FileCheck,
  ClipboardCheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BottomMenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  href: string;
};

const MENUS: BottomMenuItem[] = [
  {
    key: "meeting",
    label: "Meeting",
    icon: <Home className="h-5 w-5" />,
    href: "/",
  },
  {
    key: "legal-check",
    label: "Legal",
    icon: <FileCheck className="h-5 w-5" />,
    href: "/check",
  },
  {
    key: "alerts",
    label: "Alerts",
    icon: <Bell className="h-5 w-5" />,
    href: "/alert",
  },
  {
    key: "minutes",
    label: "Minutes",
    icon: <FileText className="h-5 w-5" />,
    href: "/minutes",
  },
  {
    key: "checklist",
    label: "Checklist",
    icon: <ClipboardCheckIcon className="h-5 w-5" />,
    href: "/checklist",
  },
];

export default function MobileNav({
  activeKey,
  onChange,
  className,
}: {
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}) {
  return (
    <Menubar
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-16 rounded-none border-t bg-white px-2",
        "flex justify-between",
        className,
      )}
    >
      {MENUS.map((menu) => {
        const isActive = menu.key === activeKey;

        return (
          <MenubarMenu key={menu.key}>
            <MenubarTrigger
              onClick={() => onChange?.(menu.key)}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-1 rounded-none",
                "text-xs text-muted-foreground",
                isActive && "text-primary",
              )}
            >
              {menu.icon}
              <span className="leading-none">{menu.label}</span>
            </MenubarTrigger>
          </MenubarMenu>
        );
      })}
    </Menubar>
  );
}
