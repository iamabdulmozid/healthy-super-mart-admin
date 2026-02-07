// Example component showcasing CSS-first Tailwind configuration

export default function TailwindDemo() {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">CSS-First Tailwind Configuration Demo</h2>
      
      {/* Using the custom primary colors */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-primary-100 p-4 text-center text-sm font-medium">primary-100</div>
        <div className="bg-primary-300 p-4 text-center text-sm font-medium">primary-300</div>
        <div className="bg-primary-500 text-white p-4 text-center text-sm font-medium">primary-500</div>
        <div className="bg-primary-700 text-white p-4 text-center text-sm font-medium">primary-700</div>
        <div className="bg-primary-900 text-white p-4 text-center text-sm font-medium">primary-900</div>
      </div>

      {/* Using the custom secondary colors */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-secondary-100 p-4 text-center text-sm font-medium">secondary-100</div>
        <div className="bg-secondary-300 p-4 text-center text-sm font-medium">secondary-300</div>
        <div className="bg-secondary-500 text-white p-4 text-center text-sm font-medium">secondary-500</div>
        <div className="bg-secondary-700 text-white p-4 text-center text-sm font-medium">secondary-700</div>
        <div className="bg-secondary-900 text-white p-4 text-center text-sm font-medium">secondary-900</div>
      </div>

      {/* Button with custom easing */}
      <button 
        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-all duration-300 ease-fluid transform hover:scale-105"
      >
        Button with Custom Easing
      </button>

      {/* Using CSS custom properties directly */}
      <div 
        className="p-6 rounded-lg text-white text-center"
        style={{ 
          backgroundColor: 'var(--color-primary-600)',
          fontFamily: 'var(--font-display)',
          transition: 'all 0.3s var(--ease-snappy)'
        }}
      >
        Direct CSS Custom Properties Usage
      </div>
    </div>
  );
}