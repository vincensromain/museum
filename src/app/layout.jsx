import { Inter } from "next/font/google";
import "./globals.scss";
import LogoHeader from "./components/LogoHeader/LogoHeader";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Museum",
  description: "Museum visit",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LogoHeader />
        {children}
      </body>
    </html>
  );
}
