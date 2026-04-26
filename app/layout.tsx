import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoloDesk — The Freelancer OS",
  description:
    "Manage your clients, projects, invoices, and communicate professionally with AI assistance. Built for freelancers.",
  keywords: ["freelancer", "client management", "Pakistan", "AI", "invoicing"],
  openGraph: {
    title: "SoloDesk — The Freelancer OS",
    description: "Your complete freelance business, in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
