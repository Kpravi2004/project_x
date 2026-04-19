const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/tiruchendur_properties.json');

const appendProperties = (newProps) => {
  try {
    const existingData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const updatedData = [...existingData, ...newProps];
    fs.writeFileSync(dataFile, JSON.stringify(updatedData, null, 2));
    console.log(`Successfully appended ${newProps.length} properties. Total: ${updatedData.length}`);
  } catch (err) {
    console.error('Error appending properties:', err);
    process.exit(1);
  }
};

// Data passed via stdin to avoid shell escaping issues
let inputData = '';
process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  const newProps = JSON.parse(inputData);
  appendProperties(newProps);
});
