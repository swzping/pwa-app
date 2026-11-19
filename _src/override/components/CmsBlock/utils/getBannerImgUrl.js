export function extractMobileImageSrc(jsonString) {
  try {
    let cleanedString = jsonString.trim();
    if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
      cleanedString = cleanedString.slice(1, -1);
    }
    const jsonData = JSON.parse(cleanedString);
    function traverse(node) {
      if (Array.isArray(node)) {
        for (const item of node) {
          const result = traverse(item);
          if (result) {
            return result;
          }
        }
      } else if (node && typeof node === 'object') {
        if (
          node.tagName === 'img' &&
          Array.isArray(node.cssClasses) &&
          node.cssClasses.includes('pagebuilder-mobile-only') &&
          node.src
        ) {
          return node.src;
        }

        for (const key in node) {
          if (node.hasOwnProperty(key)) {
            const result = traverse(node[key]);
            if (result) {
              return result;
            }
          }
        }
      }
      return '';
    }
    return traverse(jsonData);
  } catch (error) {
    return '';
  }
}

export  function extractMobileImageLink(jsonString) {
    try {
        let cleanedString = jsonString.trim();
        if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
            cleanedString = cleanedString.slice(1, -1);
        }
        const jsonData = JSON.parse(cleanedString);
        function traverse(node) {
            if (Array.isArray(node)) {
                for (const item of node) {
                    const result = traverse(item);
                    if (result) return result;
                }
            } else if (node && typeof node === 'object') {
                if (node.tagName === 'a' && node.href) {
                    if (Array.isArray(node.children)) {
                        for (const child of node.children) {
                            if (child.tagName === 'img' &&
                                Array.isArray(child.cssClasses) &&
                                child.cssClasses.includes('pagebuilder-mobile-only')) {
                                return node.href;
                            }
                        }
                    }
                }
 
                for (const key in node) {
                    if (node.hasOwnProperty(key)) {
                        const result = traverse(node[key]);
                        if (result) return result;
                    }
                }
            }
            return '';
        }
        
        return traverse(jsonData);
    } catch (error) {
        return '';
    }
}