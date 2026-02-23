import "./globals.css";

export const metadata = {
  title: "AI Career Roadmap",
  description: "Generate a personalized AI career roadmap"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
