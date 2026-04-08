import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast'

export function rehypeCustomAttributes() {
    return (tree: Root) => {
        
        visit(tree, 'element', (node: Element) => {
            const children = node.children;
            if (!children || children.length === 0) return;
        
            const lastChild = children[children.length - 1];
            if (!lastChild) return
        
            
            if (lastChild.type === 'text' && lastChild.value) {
                const match = lastChild.value.match(/\{([^}]+)\}\s*$/);
        
                if (match) {
                    const attrString = match[1];
                    if (!attrString) return
            
                    
                    lastChild.value = lastChild.value.replace(/\s*\{[^}]+\}\s*$/, '');
            
                    
                    const classes: string[] = [];
                    const parts = attrString.split(/\s+/);
            
                    
                    node.properties = node.properties || {};
            
                    parts.forEach((part: string) => {
                        if (part.startsWith('.')) {
                            classes.push(part.substring(1));
                        } else if (part.startsWith('#')) {
                            node.properties!.id = part.substring(1);
                        } else if (part.includes('=')) {
                            const [key, val] = part.split('=');
                            if (!key || !val) return
                            node.properties![key] = val.replace(/['"]/g, '');
                        }
                    });
            
                    
                    if (classes.length > 0) {
                        const existingClasses = (node.properties.className as string[]) || [];
                        node.properties.className = [...existingClasses, ...classes];
                    }
                }
            }
        })
    }
}