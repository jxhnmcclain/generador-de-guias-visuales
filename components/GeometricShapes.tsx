import React from 'react';

const GeometricShapes: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Top Right - 1/4 Circle Green */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#4cbf8c]/10 md:bg-[#4cbf8c] md:opacity-20"></div>
      
      {/* Top Left - Semi Circle Blue */}
      <div className="absolute top-40 -left-16 w-32 h-64 rounded-r-full bg-[#005fc5] opacity-10"></div>
      
      {/* Bottom Left - Circle Yellow */}
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#ffc000] opacity-15"></div>
      
      {/* Middle Right - Semi Circle Red */}
      <div className="absolute top-1/2 right-0 w-20 h-40 rounded-l-full bg-[#ff6b75] opacity-10 transform -translate-y-1/2"></div>
      
      {/* Bottom Right - Large Accent */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#eef3fe] rounded-tl-full -z-10"></div>
    </div>
  );
};

export default GeometricShapes;
