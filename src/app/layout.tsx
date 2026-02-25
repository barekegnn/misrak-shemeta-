import type { Metadata } from 'next';
import './globals.css';
import { TelegramAuthProvider } from '@/components/TelegramAuthProvider';
import { I18nProvider } from '@/i18n/provider';

export const metadata: Metadata = {
  title: 'Misrak Shemeta - Eastern Ethiopia Marketplace',
  description: 'Multi-tenant marketplace connecting Harar, Dire Dawa, and Haramaya',
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
      <body>
        <I18nProvider>
          <TelegramAuthProvider>
            {children}
          </TelegramAuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
