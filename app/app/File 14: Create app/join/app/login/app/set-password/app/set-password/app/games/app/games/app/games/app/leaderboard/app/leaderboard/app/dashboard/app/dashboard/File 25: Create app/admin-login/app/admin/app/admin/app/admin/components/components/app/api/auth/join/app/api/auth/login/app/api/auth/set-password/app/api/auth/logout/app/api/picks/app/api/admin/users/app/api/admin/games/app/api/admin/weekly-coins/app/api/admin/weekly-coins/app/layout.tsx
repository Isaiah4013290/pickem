// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* This "children" prop is where your page.tsx content will appear */}
        {children}
      </body>
    </html>
  )
}
