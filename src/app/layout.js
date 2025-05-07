import { Inter } from "next/font/google";
import "./globals.scss";
import Nav from "./components/Nav/Nav";
import Reperes from "./components/Reperes/Reperes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "starter next js",
  description: "starter next js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Reperes />
        <Nav />
        {children}
      </body>
    </html>
  );
}
