import './globals.css'

export const metadata = {
  title: 'Airline Stats',
  description: 'Airline traffic analysis, simplified.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
