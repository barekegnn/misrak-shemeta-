import type { Metadata } from 'next';
import './globals.css';
import { TelegramAuthProvider } from '@/components/TelegramAuthProvider';
import { I18nProvider } from '@/i18n/provider';
import { ViewportAdapter } from '@/components/ViewportAdapter';
import { AppShell } from '@/components/AppShell';
import { CartProvider } from '@/contexts/CartContext';
import { seedDatabase } from '@/lib/firebase/seed';

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
  // Seed database on app startup (fire and forget, but will wait if needed)
  seedDatabase().catch(console.error);

  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        {/* Mobile-first meta tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="overflow-x-hidden bg-gray-50">
        <I18nProvider>
          <TelegramAuthProvider>
            <CartProvider>
              <ViewportAdapter>
                <AppShell>
                  {children}
                </AppShell>
              </ViewportAdapter>
            </CartProvider>
          </TelegramAuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
