import "./globals.scss";
import LayoutClient from "./components/LayoutClient/LayoutClient";

export const metadata = {
  title: "Museum",
  description: "Museum visit",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
