import "~/styles/globals.css";

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import PrelineInit from "~/app/_components/preline";
import { Providers } from "~/app/_components/providers";

export const metadata: Metadata = {
  title: "Piket",
  description: "Jadwal piket acak tapi adil & tetap.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="theme-piket" className={`${jakarta.variable}`}>
      <body className="font-custom-default">
        <Providers>
          <PrelineInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
