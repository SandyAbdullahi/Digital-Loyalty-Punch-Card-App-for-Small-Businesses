import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeMobileMenu();
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 w-full z-50 py-2 transition-all duration-300 ${
          isScrolled ? 'bg-card shadow-md border-b border-border' : 'bg-background'
        }`}
        role="navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between">
             <div className="flex items-center">
               <div className="flex-shrink-0 flex items-center gap-2">
                 <a href="/">
                   <img src="/logo-1.png" alt="Rudi" className="h-8 w-auto" />
                 </a>
                 <span className="font-heading text-xl font-bold text-foreground">rudi</span>
               </div>
             </div>
            <div className="hidden md:block">
               <div className="ml-10 flex items-baseline space-x-4">
                 <a href="#how-it-works" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                   How it works
                 </a>
                 <a href="#for-merchants" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                   For Merchants
                 </a>
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
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="text-foreground hover:text-primary p-2 focus:outline-none focus:ring-2 focus:ring-ring rounded"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => window.location.href = 'http://localhost:3002/register'}
                  className="bg-primary text-primary-foreground rounded-2xl h-12 px-6 hover:opacity-90 active:translate-y-px transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                >
                  Get the App
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-secondary text-secondary-foreground rounded-2xl h-12 px-6 hover:opacity-90 active:translate-y-px transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                >
                  Merchant Login
                </button>
              </div>
            </div>
             <div className="md:hidden">
               <button
                 onClick={() => setMobileMenuOpen(true)}
                 className="text-foreground hover:text-primary p-2 focus:outline-none focus:ring-2 focus:ring-ring rounded"
                 aria-label="Open menu"
               >
                 <Menu size={24} />
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          aria-modal="true"
          role="dialog"
          onClick={handleBackdropClick}
        >
          <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-background py-6 shadow-xl">
             <div className="flex items-center justify-between px-6">
               <div className="flex-shrink-0 flex items-center gap-2">
                 <a href="/">
                   <img src="/logo-1.png" alt="Rudi" className="h-8 w-auto" />
                 </a>
                 <span className="font-heading text-xl font-bold text-foreground">rudi</span>
               </div>
               <button
                 onClick={closeMobileMenu}
                 className="text-foreground hover:text-primary p-2 focus:outline-none focus:ring-2 focus:ring-ring rounded"
                 aria-label="Close menu"
               >
                <X size={24} />
              </button>
            </div>
            <div className="mt-6 flex-1 px-6">
               <nav className="space-y-3">
                 <a href="#how-it-works" onClick={closeMobileMenu} className="block text-foreground hover:text-primary py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded">
                   How it works
                 </a>
                 <a href="#for-merchants" onClick={closeMobileMenu} className="block text-foreground hover:text-primary py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded">
                   For Merchants
                 </a>
                 <a href="#pricing" onClick={closeMobileMenu} className="block text-foreground hover:text-primary py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded">
                   Pricing
                 </a>
                 <a href="#faq" onClick={closeMobileMenu} className="block text-foreground hover:text-primary py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded">
                   FAQ
                 </a>
                 <a href="#contact" onClick={closeMobileMenu} className="block text-foreground hover:text-primary py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded">
                   Contact
                 </a>
               </nav>
               <div className="mt-8 space-y-3">
                 <button
                   onClick={toggleTheme}
                   className="w-full flex items-center justify-center text-foreground hover:text-primary p-2 focus:outline-none focus:ring-2 focus:ring-ring rounded"
                   aria-label="Toggle theme"
                 >
                   {isDark ? <Sun size={20} /> : <Moon size={20} />} Toggle Theme
                 </button>
                 <button
                   onClick={() => { window.location.href = 'http://localhost:3002/register'; closeMobileMenu(); }}
                   className="w-full bg-primary text-primary-foreground rounded-2xl h-12 px-6 hover:opacity-90 active:translate-y-px transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                 >
                   Get the App
                 </button>
                 <button
                   onClick={() => { navigate('/login'); closeMobileMenu(); }}
                   className="w-full bg-secondary text-secondary-foreground rounded-2xl h-12 px-6 hover:opacity-90 active:translate-y-px transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                 >
                   Merchant Login
                 </button>
               </div>
            </div>
             <div className="border-t border-border px-6 py-4">
               <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Rudi • Earn. Return. Reward.</p>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;