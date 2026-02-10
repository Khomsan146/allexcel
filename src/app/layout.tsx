import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: ['300', '400', '600', '700'],
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: "Link Monitor & Dashboard",
  description: "Advanced URL and Vendor Contract Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={kanit.className}>
        {children}
      </body>
    </html>
  );
}
