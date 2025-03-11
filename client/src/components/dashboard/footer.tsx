import { Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner border-t border-gray-200">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex items-center">
            <Wallet className="text-primary h-5 w-5 mr-2" />
            <span className="text-lg font-semibold text-primary">FinTrack</span>
          </div>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Privacy</a></li>
              <li><a href="#" className="hover:text-primary">Terms</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} FinTrack. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
