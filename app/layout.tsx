import '../src/index.css';
import LayoutWrapper from './LayoutWrapper';

export const metadata = {
  title: 'Balaji Chilkur Family Dhaba',
  description: 'Authentic Indian Cuisine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="flex flex-col min-h-screen bg-brand-bg noise-overlay selection:bg-brand-accent selection:text-[#FFFFFF]">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
