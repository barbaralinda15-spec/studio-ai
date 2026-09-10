import './globals.css';

export const metadata = {
  title: 'Studio AI',
  description: 'Editor fotográfico por referência para profissionais.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
