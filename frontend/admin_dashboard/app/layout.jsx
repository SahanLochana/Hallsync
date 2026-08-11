import "./globals.css";

export const metadata = {
  title: "HallSync — Admin Dashboard",
  description: "Faculty Lecture Hall Management and Smart Scheduling System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-screen overflow-hidden antialiased font-sans"
    >
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  );
}
