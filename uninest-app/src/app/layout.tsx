import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniNest — Student Housing, Without the Headache",
  description: "Student PG accommodation marketplace and landlord operating system. Find, book, and manage PG accommodations with verified listings, digital agreements, and complete rental lifecycle management.",
  keywords: "student accommodation, PG, paying guest, hostel, student housing, rent, landlord",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
