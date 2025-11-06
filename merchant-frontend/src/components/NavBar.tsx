import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Burger, Drawer, Button, Group, Stack, Anchor, Divider } from '@mantine/core';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleDrawer = () => setDrawerOpened((o) => !o);
  const closeDrawer = () => setDrawerOpened(false);

  return (
    <>
      <nav
        className={`sticky top-0 w-full z-50 py-2 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : ''}`}
        role="navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between">
             <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center gap-2">
                  <a href="/" className="flex items-center gap-2">
                    <img src="/logo-1.png" alt="Rudi" className="h-8 w-auto" />
                    <span className="font-heading text-xl font-bold text-foreground">rudi</span>
                  </a>
                </div>
             </div>
            <div className="hidden md:block">
               <div className="ml-10 flex items-baseline space-x-4">
                 <button
                   type="button"
                   onClick={() => navigate('/how-it-works')}
                   className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                 >
                   How it works
                 </button>
                 <button
                   type="button"
                   onClick={() => navigate('/for-merchants')}
                   className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                 >
                   For Merchants
                 </button>
                 <a href="#pricing" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                   Pricing
                 </a>
                 <a href="#faq" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                   FAQ
                 </a>
                 <a href="#contact" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                   Contact
                 </a>
               </div>
            </div>
             <Group gap="xs" visibleFrom="md">
               <Button
                 onClick={toggleTheme}
                 variant="subtle"
                 size="sm"
                 aria-label="Toggle theme"
               >
                 {isDark ? <Sun size={20} /> : <Moon size={20} />}
               </Button>
                <Button
                  onClick={() => navigate('/get-app')}
                  variant="filled"
                  color="primary"
                  size="sm"
                  className="custom-nav-button"
                >
                  Get the App
                </Button>
               <Button
                 onClick={() => navigate('/login')}
                 variant="filled"
                 color="secondary"
                 size="sm"
                 className="custom-nav-button"
               >
                 Merchant Login
               </Button>
             </Group>
             <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="md" size="sm" />
          </div>
        </div>
      </nav>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={
          <Group>
            <img src="/logo-1.png" alt="Rudi" style={{ height: 32, width: 'auto' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>rudi</span>
          </Group>
        }
        hiddenFrom="md"
      >
        <Stack gap="md" justify="center">
          <Button
            variant="subtle"
            onClick={() => {
              navigate('/how-it-works')
              closeDrawer()
            }}
          >
            How it works
          </Button>
          <Anchor href="#pricing" onClick={closeDrawer}>
            Pricing
          </Anchor>
          <Anchor href="#faq" onClick={closeDrawer}>
            FAQ
          </Anchor>
          <Anchor href="#contact" onClick={closeDrawer}>
            Contact
          </Anchor>
          <Divider />
          <Button onClick={toggleTheme} variant="subtle" leftSection={isDark ? <Sun size={20} /> : <Moon size={20} />}>
            Toggle Theme
          </Button>
          <Button
            onClick={() => {
              navigate('/for-merchants')
              closeDrawer()
            }}
            variant="subtle"
          >
            For Merchants
          </Button>
           <Button onClick={() => { navigate('/get-app'); closeDrawer(); }} variant="filled" color="primary" className="custom-nav-button">
             Get the App
           </Button>
          <Button onClick={() => { navigate('/login'); closeDrawer(); }} variant="filled" color="secondary" className="custom-nav-button">
            Merchant Login
          </Button>
        </Stack>
        <Divider mt="md" />
        <p style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>
          © {new Date().getFullYear()} Rudi • Earn. Return. Reward.
        </p>
      </Drawer>
    </>
  );
};

export default NavBar;
