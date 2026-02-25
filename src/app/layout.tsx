import type { Metadata } from 'next';
import './globals.css';
import { TelegramAuthProvider } from '@/components/TelegramAuthProvider';
import { I18nProvider } from '@/i18n/provider';
import { ViewportAdapter } from '@/components/ViewportAdapter';

export const metadata: Metadata = {
  title: 'Misrak Shemeta - Eastern Ethiopia Marketplace',
  description: 'Multi-tenant marketplace connecting Harar, Dire Dawa, and Haramaya',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevent zoom on mobile for better UX
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className="overflow-x-hidden">
        <I18nProvider>
          <TelegramAuthProvider>
            <ViewportAdapter>
              {children}
            </ViewportAdapter>
          </TelegramAuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
