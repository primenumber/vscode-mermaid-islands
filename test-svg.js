// Test file to verify SVG support in Mermaid Islands extension

// mermaid
// graph TD
//     A[Start] --> B{Decision}
//     B -->|Yes| C[Action 1]  
//     B -->|No| D[Action 2]
// end-mermaid

// svg
// <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
//   <rect x="10" y="10" width="180" height="80" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>
//   <text x="100" y="55" text-anchor="middle" font-family="Arial" font-size="16" fill="white">
//     Hello SVG!
//   </text>
// </svg>
// end-svg

console.log("Testing both Mermaid and SVG support");