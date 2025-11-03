import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          isScrolled ? 'bg-white shadow-md border-b border-[#EADCC7]' : 'bg-[#FDF6EC]'
        }`}
        role="navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFB300] to-orange-400 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#009688] rounded-full"></div>
                </div>
                <span className="font-heading text-xl font-bold text-[#3B1F1E]">rudi</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#how-it-works" className="text-[#3B1F1E] hover:text-[#009688] px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688]">
                  How it works
                </a>
                <a href="#for-merchants" className="text-[#3B1F1E] hover:text-[#009688] px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688]">
                  For Merchants
                </a>
                <a href="#pricing" className="text-[#3B1F1E] hover:text-[#009688] px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688]">
                  Pricing
                </a>
                <a href="#faq" className="text-[#3B1F1E] hover:text-[#009688] px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688]">
                  FAQ
                </a>
                <a href="#contact" className="text-[#3B1F1E] hover:text-[#009688] px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688]">
                  Contact
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-3">
                <button
                  onClick={() => window.location.href = 'http://localhost:3002/register'}
                  className="bg-[#009688] text-white rounded-2xl h-12 px-6 hover:bg-[#008075] active:translate-y-px transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFB300] font-medium"
                >
                  Get the App
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-[#FFB300] text-[#3B1F1E] rounded-2xl h-12 px-6 hover:bg-[#FFC633] active:translate-y-px transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#009688] font-medium"
                >
                  Merchant Demo
                </button>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-[#3B1F1E] hover:text-[#009688] p-2 focus:outline-none focus:ring-2 focus:ring-[#009688] rounded"
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
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-[#FDF6EC] py-6 shadow-xl">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFB300] to-orange-400 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#009688] rounded-full"></div>
                </div>
                <span className="font-heading text-xl font-bold text-[#3B1F1E]">rudi</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="text-[#3B1F1E] hover:text-[#009688] p-2 focus:outline-none focus:ring-2 focus:ring-[#009688] rounded"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-6 flex-1 px-6">
              <nav className="space-y-3">
                <a href="#how-it-works" onClick={closeMobileMenu} className="block text-[#3B1F1E] hover:text-[#009688] py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] rounded">
                  How it works
                </a>
                <a href="#for-merchants" onClick={closeMobileMenu} className="block text-[#3B1F1E] hover:text-[#009688] py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] rounded">
                  For Merchants
                </a>
                <a href="#pricing" onClick={closeMobileMenu} className="block text-[#3B1F1E] hover:text-[#009688] py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] rounded">
                  Pricing
                </a>
                <a href="#faq" onClick={closeMobileMenu} className="block text-[#3B1F1E] hover:text-[#009688] py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] rounded">
                  FAQ
                </a>
                <a href="#contact" onClick={closeMobileMenu} className="block text-[#3B1F1E] hover:text-[#009688] py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#009688] rounded">
                  Contact
                </a>
              </nav>
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => { window.location.href = 'http://localhost:3002/register'; closeMobileMenu(); }}
                  className="w-full bg-[#009688] text-white rounded-2xl h-12 px-6 hover:bg-[#008075] active:translate-y-px transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFB300] font-medium"
                >
                  Get the App
                </button>
                <button
                  onClick={() => { navigate('/register'); closeMobileMenu(); }}
                  className="w-full bg-[#FFB300] text-[#3B1F1E] rounded-2xl h-12 px-6 hover:bg-[#FFC633] active:translate-y-px transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#009688] font-medium"
                >
                  Merchant Demo
                </button>
              </div>
            </div>
            <div className="border-t border-[#EADCC7] px-6 py-4">
              <p className="text-xs text-[#3B1F1E]/70">© {new Date().getFullYear()} Rudi • Earn. Return. Reward.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;