import { Inter } from "next/font/google";
import "./globals.scss";
import LayoutClient from "./components/LayoutClient/LayoutClient";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Museum",
  description: "Museum visit",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
