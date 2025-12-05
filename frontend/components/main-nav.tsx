"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="lg:mr-6 sm:mr-0 flex items-center gap-2">
        <Icons.logo className="h-8 w-8" />
        <span className="font-bold text-xl hidden lg:block md:block text-[#00FFE0] drop-shadow-[0_0_10px_rgba(0,255,224,0.5)]">
          HydroX
        </span>
      </Link>
      <NavigationMenu className="hidden lg:block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/#features" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Features
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="https://github.com/HydroX-labs" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                GitHub
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
