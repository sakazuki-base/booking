import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "使い方 ｜ Reserve-Sys",
    description: "予約システムUIの使い方についての説明ページ"
};

export default function theAboutPageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            <section>
                {children}
            </section>
        </main>
    );
}