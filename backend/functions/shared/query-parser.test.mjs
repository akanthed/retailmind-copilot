// Test file for query parser - Comprehensive attribute extraction
import { parseUserQuery, extractCapacity, calculateMatchScore, filterResultsStrict } from './query-parser.mjs';

console.log('=== Comprehensive Query Parser Tests ===\n');

// Test 1: Capacity extraction (various formats)
console.log('Test 1: Extract Capacity (Refrigerators, Washing Machines)');
const capacityTests = [
  '15L', '15 L', '15 litre', '15 ltr', '15 liter', '15-litre',
  'Haier Refrigerator 15L', 'Samsung 10 litre washing machine'
];
capacityTests.forEach(test => {
  const result = extractCapacity(test);
  console.log(`  "${test}" → ${result}`);
});

// Test 2: Screen size extraction (TVs, Monitors, Phones)
console.log('\nTest 2: Extract Screen Size');
const screenTests = [
  'Samsung 55 inch TV',
  'LG 65" Smart TV',
  'Dell 27 inch Monitor',
  'iPhone 6.1 inch display'
];
screenTests.forEach(test => {
  const parsed = parseUserQuery(test);
  console.log(`  "${test}" → ${parsed.attributes.screenSize || 'not found'}`);
});

// Test 3: Storage & RAM (Laptops, Phones)
console.log('\nTest 3: Extract Storage & RAM');
const storageTests = [
  'iPhone 15 Pro 256GB',
  'Dell Laptop 512GB SSD 16GB RAM',
  'Samsung Galaxy 128GB 8GB RAM',
  'MacBook Pro 1TB'
];
storageTests.forEach(test => {
  const parsed = parseUserQuery(test);
  console.log(`  "${test}"`);
  console.log(`    Storage: ${parsed.attributes.storage || 'N/A'}, RAM: ${parsed.attributes.ram || 'N/A'}`);
});

// Test 4: AC Tonnage & Star Rating
console.log('\nTest 4: Extract Tonnage & Star Rating');
const acTests = [
  'LG 1.5 ton AC',
  'Samsung 2 ton 5 star AC',
  'Voltas 1 ton 3 star Air Conditioner'
];
acTests.forEach(test => {
  const parsed = parseUserQuery(test);
  console.log(`  "${test}"`);
  console.log(`    Tonnage: ${parsed.attributes.tonnage || 'N/A'}, Stars: ${parsed.attributes.starRating || 'N/A'}`);
});

// Test 5: Weight (Kitchen Appliances)
console.log('\nTest 5: Extract Weight');
const weightTests = [
  'Mixer Grinder 2kg',
  'Microwave Oven 15 kg',
  'Pressure Cooker 3.5 kilograms'
];
weightTests.forEach(test => {
  const parsed = parseUserQuery(test);
  console.log(`  "${test}" → ${parsed.attributes.weight || 'not found'}`);
});

// Test 6: Resolution (TVs, Cameras)
console.log('\nTest 6: Extract Resolution');
const resolutionTests = [
  'Samsung 4K TV',
  'Sony Full HD Television',
  'LG UHD Smart TV',
  'Canon 1080p Camera'
];
resolutionTests.forEach(test => {
  const parsed = parseUserQuery(test);
  console.log(`  "${test}" → ${parsed.attributes.resolution || 'not found'}`);
});

// Test 7: Comprehensive parsing
console.log('\nTest 7: Full Query Parsing (All Attributes)');
const comprehensiveTests = [
  'Haier Refrigerator 15L',
  'Samsung 55 inch 4K Smart TV',
  'LG 1.5 ton 5 star AC',
  'iPhone 15 Pro 256GB Black',
  'Dell Laptop 16GB RAM 512GB SSD',
  'Bosch Washing Machine 7kg 1400RPM',
  'Sony 65" UHD Android TV'
];

comprehensiveTests.forEach(query => {
  const parsed = parseUserQuery(query);
  console.log(`\n  "${query}"`);
  console.log(`    Brand: ${parsed.brand || 'N/A'}`);
  console.log(`    Category: ${parsed.category || 'N/A'}`);
  console.log(`    Model: ${parsed.model || 'N/A'}`);
  console.log(`    Attributes:`, Object.keys(parsed.attributes).length > 0 ? 
    Object.entries(parsed.attributes).map(([k,v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`).join(', ') : 
    'none');
});

// Test 8: Match Scoring with Multiple Attributes
console.log('\n\nTest 8: Match Scoring (Multi-Attribute)');
const parsedQuery = parseUserQuery('Samsung 55 inch 4K TV');
const mockResults = [
  { title: 'Samsung 55 inch 4K Smart TV', snippet: 'Ultra HD resolution' },
  { title: 'Samsung 65 inch 4K TV', snippet: 'Larger screen' },
  { title: 'LG 55 inch 4K TV', snippet: 'Different brand' },
  { title: 'Samsung 55 inch Full HD TV', snippet: 'Lower resolution' },
  { title: 'Samsung TV', snippet: 'No specs' }
];

mockResults.forEach(result => {
  const score = calculateMatchScore(parsedQuery, result);
  console.log(`  "${result.title}" → Score: ${score}`);
});

// Test 9: Strict Filtering
console.log('\nTest 9: Strict Filtering (Multi-Attribute)');
const filtered = filterResultsStrict(parsedQuery, mockResults, {
  strictAttributes: true,
  minScore: 60
});

console.log(`  Original: ${mockResults.length} results`);
console.log(`  Filtered: ${filtered.length} results`);
filtered.forEach(r => {
  console.log(`    ✓ ${r.title} (Score: ${r.matchScore}, Type: ${r.matchType})`);
});

console.log('\n=== All Tests Complete ===');
console.log('\nSupported Attributes:');
console.log('  • Capacity (L, litre, liter, ltr)');
console.log('  • Weight (kg, g, grams, kilograms)');
console.log('  • Screen Size (inch, cm)');
console.log('  • Storage (GB, TB, MB)');
console.log('  • RAM (GB)');
console.log('  • Tonnage (ton, TR)');
console.log('  • Star Rating (1-5 stars)');
console.log('  • Wattage (W, watts)');
console.log('  • Voltage (V, volts)');
console.log('  • Speed (RPM, Hz)');
console.log('  • Resolution (4K, FHD, HD, 1080p, etc.)');
console.log('  • Connectivity (WiFi, Bluetooth, 5G, 4G, NFC)');
console.log('  • Dimensions (LxWxH)');
console.log('  • Size (XS, S, M, L, XL, numeric)');
console.log('  • Color (20+ colors)');
console.log('  • Material (15+ materials)');

