"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Icons } from "./icons";
import { Button, buttonVariants } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 border-[#00FFE0]/20">
          <SheetHeader>
            <SheetTitle>
              <MobileLink
                href="/"
                className="flex items-center"
                onOpenChange={setOpen}
              >
                <Icons.logo className="mr-2 h-6 w-6" />
                <span className="font-bold text-[#00FFE0] drop-shadow-[0_0_10px_rgba(0,255,224,0.5)]">
                  HydroX
                </span>
              </MobileLink>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
            <div className="flex flex-col space-y-4">
              <MobileLink href="/#features" onOpenChange={setOpen}>
                Features
              </MobileLink>
              <MobileLink href="https://github.com/HydroX-labs" onOpenChange={setOpen}>
                GitHub
              </MobileLink>
              <div className="pt-4">
                <div
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-[#00FFE0]/20 text-[#00FFE0]/70 border border-[#00FFE0]/30 w-full cursor-not-allowed"
                  )}
                >
                  Coming Soon
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center gap-2 md:hidden">
        <Icons.logo className="h-6 w-6" />
        <span className="font-bold text-[#00FFE0] drop-shadow-[0_0_10px_rgba(0,255,224,0.5)]">
          HydroX
        </span>
      </Link>
    </div>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn("text-muted-foreground hover:text-[#00FFE0] transition-colors", className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export default MobileNav;
