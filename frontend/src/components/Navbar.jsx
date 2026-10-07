import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Dynamic Scan', path: '/scan/dynamic' },
    { name: 'Static Scan', path: '/scan/static' },
  ];

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 bg-primary/90 backdrop-blur-sm border border-accent/30 rounded-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 cursor-pointer group">
              <Shield className="h-8 w-8 text-accent group-hover:neon-glow rounded-full transition-all duration-300" />
              <span className="font-mono text-xl font-bold tracking-wider neon-text text-accent">
                VulnGuard
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'text-accent border-b-2 border-accent neon-glow bg-secondary/50'
                        : 'text-textMuted hover:text-textPrimary hover:bg-secondary'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-textMuted hover:text-textPrimary hover:bg-secondary focus:outline-none cursor-pointer"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-accent/20 bg-primary/95 rounded-b-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                    isActive
                      ? 'text-accent bg-secondary/50 border-l-4 border-accent'
                      : 'text-textMuted hover:text-textPrimary hover:bg-secondary'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
