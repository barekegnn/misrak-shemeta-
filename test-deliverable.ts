/**
 * Test script to verify isDeliverable function logic
 */

type City = 'Harar' | 'Dire Dawa';
type Campus = 'Haramaya_Main' | 'Harar_Campus' | 'DDU';
type Location = Campus | 'Harar_City' | 'Dire_Dawa_City';

function isDeliverable(shopCity: City, userLocation: Location): boolean {
  // Harar shops can deliver to all locations
  if (shopCity === 'Harar') {
    return ['Harar_Campus', 'Haramaya_Main', 'DDU'].includes(userLocation);
  }
  
  // Dire Dawa shops can deliver to all locations
  if (shopCity === 'Dire Dawa') {
    return ['DDU', 'Haramaya_Main', 'Harar_Campus'].includes(userLocation);
  }
  
  return false;
}

// Test all combinations
const cities: City[] = ['Harar', 'Dire Dawa'];
const locations: Location[] = ['Haramaya_Main', 'Harar_Campus', 'DDU'];

console.log('Testing isDeliverable function:\n');

for (const city of cities) {
  for (const location of locations) {
    const result = isDeliverable(city, location);
    console.log(`${city} -> ${location}: ${result ? '✅ YES' : '❌ NO'}`);
  }
  console.log('');
}

// Expected: All should be YES (✅)
