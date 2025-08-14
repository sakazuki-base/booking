import Link from "next/link";
import { memo } from "react";
import Image from "next/image";
import { auth } from "~/server/auth";
import CartNavLink from "@/components/common/CartNavLink";

export default async function Header() {
  const session = await auth(); // ログイン情報を取得

  return (
    <header className="bg-white p-4 shadow">
      <nav className="mx-auto flex max-w-screen-xl items-center justify-between">
        {/* 左側：ロゴ */}
        <Link href="/" className="hover:text-blue-600">
          <Image
            src="/icons/logo.png"
            alt="SakaZuki Base"
            width={40}
            height={40}
          />
        </Link>
        {/* 右側：リンク群 */}
        <ul className="flex space-x-6 text-sm font-medium">
          <li>
            <Link href="/" className="hover:text-blue-600">
              TOP
            </Link>
          </li>

          <li>
            <CartNavLink />
          </li>
          {/* ログイン中はユーザー名表示 */}
          {session?.user && (
            <li className="text-gray-700">
              ようこそ{" "}
              <span className="font-semibold">{session.user.name}</span> さん
            </li>
          )}
          <li>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded bg-blue-100 px-4 py-1 text-blue-800 transition hover:bg-blue-200"
            >
              {session ? "ログアウト" : "ログイン"}
            </Link>
          </li>
          <li>
            <Link
              href="/admin/reservations"
              className="rounded bg-red-600 px-4 py-1 text-white transition hover:bg-red-200"
            >
              管理画面
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
