import { visit } from 'unist-util-visit';

import type { Root, Element } from 'hast'
import type { Plugin } from 'unified';

export function rehypeCustomAttributes(): ReturnType<Plugin<[], Root>> {
    return (tree: Root) => {
        
        visit(tree, 'element', (node: Element) => {
            const children = node.children;
            if (!children || children.length === 0) return;

            // Get last element in the node's children. Curly brackets users use to define attributes should always be at the end.
            const lastChild = children[children.length - 1];
            if (!lastChild) return
        
            
            if (lastChild.type === 'text' && lastChild.value) {
                // Regex to get text inside curly brackets
                const match = lastChild.value.match(/\{([^}]+)\}\s*$/);
        
                if (match) {
                    // Store attributes in curly brackets
                    const attrString = match[1];
                    if (!attrString) return
            
                    // Remove the curly brackets from the html.
                    lastChild.value = lastChild.value.replace(/\s*\{[^}]+\}\s*$/, '');
            
                    // Create array for multiple classes
                    const classes: string[] = [];
                    // Split each attribute in curly brackets based on spaces.
                    const parts = attrString.split(/\s+/);
            
                    
                    node.properties = node.properties || {};
                    
                    // Go through each attribute and either add it the the node's properties or push it to the class array
                    parts.forEach((part: string) => {
                        if (part.startsWith('.')) {
                            classes.push(part.substring(1));
                        } else if (part.startsWith('#')) {
                            node.properties!.id = part.substring(1);
                        } else if (part.includes('=')) {
                            const [key, val] = part.split('=');
                            if (!key || !val) return
                            // Remove quotes/double-quotes on other attributes because the ast adds them automatically when parsed to html
                            node.properties![key] = val.replace(/['"]/g, '');
                        }
                    });
            
                    // In the ast className (the classes of the node) is an array. We just merge the classes we found with
                    // the classes that may already exist.
                    if (classes.length > 0) {
                        const existingClasses = (node.properties.className as string[]) || [];
                        node.properties.className = [...existingClasses, ...classes];
                    }
                }
            }
        })
    }
}