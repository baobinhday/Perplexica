'use client';
import { ThemeProvider } from 'next-themes';

const ThemeProviderComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem={false}
      disableTransitionOnChange
      defaultTheme="dark"
    >
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderComponent;
