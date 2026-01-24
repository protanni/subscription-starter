import { Metadata } from 'next';
import ConditionalFooter from '@/components/ui/Footer/ConditionalFooter';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

const title = 'PROTANNI';
const description = 'A personal productivity system built around quick capture, processing, and simple execution.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#E4F1ED] text-[#2B4040] antialiased"
      >
        <Navbar />
        <main
          id="skip"
           className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
        >
          {children}
        </main>
        <ConditionalFooter />
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
