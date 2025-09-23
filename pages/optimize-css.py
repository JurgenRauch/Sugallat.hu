#!/usr/bin/env python3
"""
Simple CSS minification script for performance optimization
"""
import os
import re

def minify_css(css_content):
    """Simple CSS minification"""
    # Remove comments
    css_content = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
    
    # Remove extra whitespace
    css_content = re.sub(r'\s+', ' ', css_content)
    
    # Remove whitespace around specific characters
    css_content = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', css_content)
    
    # Remove trailing semicolons before closing braces
    css_content = re.sub(r';\s*}', '}', css_content)
    
    # Remove leading/trailing whitespace
    css_content = css_content.strip()
    
    return css_content

def optimize_css_files():
    """Optimize CSS files in the css directory"""
    css_dir = 'css'
    files_to_optimize = [
        'components.css',
        'responsive.css', 
        'square-patterns.css',
        'hover-animations.css'
    ]
    
    for filename in files_to_optimize:
        filepath = os.path.join(css_dir, filename)
        if os.path.exists(filepath):
            print(f"Optimizing {filename}...")
            
            # Read original file
            with open(filepath, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            # Minify
            minified_content = minify_css(original_content)
            
            # Calculate savings
            original_size = len(original_content.encode('utf-8'))
            minified_size = len(minified_content.encode('utf-8'))
            savings = original_size - minified_size
            savings_percent = (savings / original_size) * 100 if original_size > 0 else 0
            
            # Create minified version
            minified_filepath = filepath.replace('.css', '.min.css')
            with open(minified_filepath, 'w', encoding='utf-8') as f:
                f.write(minified_content)
            
            print(f"  Original: {original_size:,} bytes")
            print(f"  Minified: {minified_size:,} bytes")
            print(f"  Saved: {savings:,} bytes ({savings_percent:.1f}%)")
            print(f"  Created: {minified_filepath}")
            print()
        else:
            print(f"File not found: {filepath}")

if __name__ == "__main__":
    optimize_css_files()
    print("CSS optimization complete!")
