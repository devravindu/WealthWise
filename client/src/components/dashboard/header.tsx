import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrencyOptions } from '@/lib/currency';
import { Wallet, ChevronDown } from 'lucide-react';

type HeaderProps = {
  onOpenPremiumModal: () => void;
};

export default function Header({ onOpenPremiumModal }: HeaderProps) {
  const { user, logoutMutation, updateCurrencyMutation } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currencyOptions = getCurrencyOptions();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleCurrencyChange = (value: string) => {
    updateCurrencyMutation.mutate({ currency: value });
  };
  
  const getUserInitials = () => {
    if (!user?.email) return '';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Wallet className="text-primary h-6 w-6 mr-2" />
              <span className="text-xl font-bold text-primary">FinTrack</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:items-center">
              <div className="relative">
                <Select 
                  value={user?.currency || "USD"} 
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!user ? (
              <div className="ml-4 flex items-center">
                <Button variant="ghost" size="sm" className="text-primary">
                  Sign In
                </Button>
                <Button size="sm" className="ml-2">
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="ml-4 flex items-center">
                {!user.isPremium && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="hidden md:block mr-3 bg-yellow-400 text-white border-yellow-400 hover:bg-yellow-500 hover:text-white hover:border-yellow-500"
                    onClick={onOpenPremiumModal}
                  >
                    Upgrade
                  </Button>
                )}
                
                <div className="relative" ref={dropdownRef}>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 focus:outline-none"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.email}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <span>{getUserInitials()}</span>
                    </div>
                  </Button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-10">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Your Profile
                      </a>
                      <a href="#" onClick={onOpenPremiumModal} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Upgrade to Premium
                      </a>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          logoutMutation.mutate();
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile currency selector */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex justify-between items-center">
            <Select 
              value={user?.currency || "USD"} 
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {user && !user.isPremium && (
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-yellow-400 text-white border-yellow-400 hover:bg-yellow-500 hover:text-white hover:border-yellow-500"
                onClick={onOpenPremiumModal}
              >
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
