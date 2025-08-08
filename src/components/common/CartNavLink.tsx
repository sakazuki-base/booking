// components/header/CartNavLink.tsx
"use client";

import Link from "next/link";
import { useAtom } from "jotai";
import { cartCountAtom } from "@/types/cart-atom";

export default function CartNavLink() {
  const [count] = useAtom(cartCountAtom);

  return (
    <Link href="/cart" className="relative hover:text-blue-600">
      カート
      {count > 0 && (
        <span className="ml-1 rounded-full bg-red-600 px-2 text-xs text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
