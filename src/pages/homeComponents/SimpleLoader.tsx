import { memo } from "react";

const SimpleLoader = memo(() => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-[#007aff] via-[#2980b9] to-[#1f618d]">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 border-4 border-white/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-white text-base mt-6 font-medium animate-pulse">MWANANCHI COMMUNICATION LIMITED...</p>
    </div>
  </div>
));

SimpleLoader.displayName = 'SimpleLoader';
export default SimpleLoader;