import os, json

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'tsconfig.json')

with open(fp, 'r') as f:
    c = json.load(f)

c['compilerOptions']['target'] = 'es2015'
c['compilerOptions']['downlevelIteration'] = True

with open(fp, 'w', newline='\n') as f:
    json.dump(c, f, indent=2)

print('tsconfig.json atualizado!')
print('target:', c['compilerOptions']['target'])
