const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/pages/UsersConfig.tsx',
  'frontend/src/pages/RiskMatrix.tsx',
  'frontend/src/pages/ReportsLogs.tsx',
  'frontend/src/pages/Login.tsx',
  'frontend/src/pages/Dashboard.tsx',
  'frontend/src/pages/Controls.tsx',
  'frontend/src/pages/Calendar.tsx',
  'frontend/src/pages/ActionPlans.tsx'
];

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/'http:\/\/localhost:3000([^']+)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}$1`");
  content = content.replace(/`http:\/\/localhost:3000([^`]+)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}$1`");
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("URLs dinámicas actualizadas en: " + f);
});
