import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

export const metadata: Metadata = {
  title: "Reserve-Sys",
  description: "予約システムUI",
  robots: {
    index: false, // noindex
    follow: false // nofollow
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <Header />
        <div className="globalWrapper">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
