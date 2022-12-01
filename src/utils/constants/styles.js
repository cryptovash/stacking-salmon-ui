const LAYOUT = Object.freeze({
    appBarHeight: 80
  });
  
  const BREAKPOINTS = Object.freeze({
    landscape: { raw: '(orientation: landscape)' },
    portrait: { raw: '(orientation: portrait)' },
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1220px',
    '2xl': '1536px'
  });
  
  module.exports = {
    LAYOUT,
    BREAKPOINTS
  };
  