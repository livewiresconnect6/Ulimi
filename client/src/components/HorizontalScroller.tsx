import { useRef, useState, useEffect, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function HorizontalScroller({ children, title, className = "" }: HorizontalScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', checkScrollButtons);
      return () => element.removeEventListener('scroll', checkScrollButtons);
    }
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };
  
  // ALWAYS SHOW MOBILE LAYOUT - NO CONDITIONS
  return (
    <div className={`${className}`}>
      {title && (
        <h2 className="text-xl font-bold text-amber-800 mb-4 px-4">{title}</h2>
      )}
      

      
      {/* Mobile navigation buttons - ALWAYS SHOW */}
      <div className="flex justify-between items-center mb-4 px-4">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`mobile-button bg-amber-100 border-2 border-amber-300 text-amber-800 shadow-lg px-4 py-2 rounded-lg flex items-center ${
            !canScrollLeft ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="text-sm ml-1">Back</span>
        </button>
        
        <div className="flex gap-2">
          {canScrollLeft && <div className="w-3 h-3 rounded-full bg-amber-400"></div>}
          <div className="w-3 h-3 rounded-full bg-amber-600"></div>
          {canScrollRight && <div className="w-3 h-3 rounded-full bg-amber-400"></div>}
        </div>
        
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`mobile-button bg-amber-100 border-2 border-amber-300 text-amber-800 shadow-lg px-4 py-2 rounded-lg flex items-center ${
            !canScrollRight ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <span className="text-sm mr-1">Next</span>
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile scrollable container */}
      <div
        ref={scrollRef}
        className="mobile-scroll-container flex gap-4 px-4 pb-4 overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
    </div>
  );
}