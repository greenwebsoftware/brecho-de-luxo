import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'globals.css')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove 'group' from @apply - it cannot be used with @apply
c = c.replace(
    '@apply bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group;',
    '@apply bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer;'
)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('globals.css corrigido!')
