import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import { ReduxProvider } from "@/components/ReduxProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invoice Generator",
  description: "Business invoice management suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar>{children}</AppSidebar>
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
