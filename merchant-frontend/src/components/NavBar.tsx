import { useState, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import { Burger, Drawer, Button, Group, Stack, Anchor, Divider } from '@mantine/core';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const logoSrc = useMemo(() => `${import.meta.env.BASE_URL}logo-1.png`, []);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



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
                    <img src={logoSrc} alt="Rudi" className="h-8 w-auto" />
                    <span className="font-heading text-xl font-bold text-foreground">rudi</span>
                  </a>
                </div>
             </div>
             <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-2 lg:space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    Home
                  </button>
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
              <Group gap="xs" visibleFrom="md" className="flex-shrink-0">
                <Button
                   onClick={() => navigate('/get-app')}
                   variant="filled"
                   color="primary"
                   size="xs"
                   className="custom-nav-button lg:size-sm"
                 >
                   <span className="hidden lg:inline">Get the App</span>
                   <span className="lg:hidden">Get App</span>
                 </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="filled"
                  color="secondary"
                  size="xs"
                  className="custom-nav-button lg:size-sm"
                >
                  <span className="hidden lg:inline">Merchant Login</span>
                  <span className="lg:hidden">Login</span>
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
            <img src={logoSrc} alt="Rudi" style={{ height: 32, width: 'auto' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>rudi</span>
          </Group>
        }
        hiddenFrom="md"
      >
        <Stack gap="md" align="center">
          <Button
            variant="subtle"
            onClick={() => {
              navigate('/')
              closeDrawer()
            }}
          >
            Home
          </Button>
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
        <p style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)', textAlign: 'center' }}>
          © {new Date().getFullYear()} Rudi • Earn. Return. Reward.
        </p>
      </Drawer>
    </>
  );
};

export default NavBar;
