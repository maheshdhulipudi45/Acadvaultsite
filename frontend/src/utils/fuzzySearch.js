// A simple, fast fuzzy search utility to match suggestions on the search bar
export const fuzzySearch = (items, query, keys = ['title']) => {
  if (!query) return [];
  
  const cleanQuery = query.toLowerCase().trim();
  
  return items
    .map(item => {
      let score = 0;
      
      // Calculate matching scores across given keys
      for (const key of keys) {
        const value = String(item[key] || '').toLowerCase();
        
        if (value === cleanQuery) {
          score += 100; // Exact match
        } else if (value.startsWith(cleanQuery)) {
          score += 50; // Prefix match
        } else if (value.includes(cleanQuery)) {
          score += 25; // Substring match
        } else {
          // Check for character presence order
          let queryIdx = 0;
          let matchCount = 0;
          for (let i = 0; i < value.length; i++) {
            if (value[i] === cleanQuery[queryIdx]) {
              queryIdx++;
              matchCount++;
              if (queryIdx === cleanQuery.length) break;
            }
          }
          if (matchCount > 0) {
            score += Math.round((matchCount / cleanQuery.length) * 10);
          }
        }
      }
      
      return { item, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.item);
};
