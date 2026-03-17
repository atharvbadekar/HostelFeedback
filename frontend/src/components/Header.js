import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b-2 border-[#1E3A3A] shadow-md py-3 px-4 md:px-12 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left Section: University Identity */}
        <div className="flex items-center group">
          <img 
            src="/images/curaj-logo.png" 
            className="h-14 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            alt="Central University of Rajasthan" 
          />
        </div>

        {/* Right Section: Excellence Badges - Now in Color */}
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* NIRF Badge Container */}
          <div className="flex flex-col items-center">
            <img 
              src="/images/NIRF_Logo.jpeg" 
              className="h-10 md:h-14 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-help" 
              title="NIRF Ranked"
              alt="NIRF Logo" 
            />
          </div>

          {/* Subtle Vertical Divider */}
          <div className="h-10 w-[1px] bg-slate-200 hidden sm:block"></div>

          {/* NAAC Badge Container */}
          <div className="flex flex-col items-center">
            <img 
              src="/images/NAAC5.jpeg" 
              className="h-10 md:h-14 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-help" 
              title="NAAC A++ Accredited"
              alt="NAAC Logo" 
            />
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;