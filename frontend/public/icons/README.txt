# INSTRUÇÕES PARA CRIAR ÍCONES PWA

Para que o PWA funcione corretamente, você precisa criar dois ícones:

1. **icon-192.png** (192x192 pixels)
2. **icon-512.png** (512x512 pixels)

## Como criar os ícones:

### Opção 1: Online (Recomendado)
1. Acesse: https://www.favicon-generator.org/
2. Faça upload de uma imagem (logo da barbearia)
3. Baixe os ícones nos tamanhos 192x192 e 512x512
4. Salve em: `frontend/public/icons/`

### Opção 2: Photoshop/GIMP
1. Crie uma imagem quadrada com o logo da barbearia
2. Redimensione para 512x512 pixels
3. Salve como `icon-512.png`
4. Redimensione a mesma imagem para 192x192 pixels
5. Salve como `icon-192.png`
6. Coloque ambos em `frontend/public/icons/`

### Opção 3: Temporário (para testes)
Use ícones genéricos de placeholder:
- https://via.placeholder.com/192x192.png
- https://via.placeholder.com/512x512.png

## Importante:
- Os ícones devem ter fundo sólido (não transparente) para melhor visualização
- Recomenda-se usar cores da identidade visual da barbearia
- Formato PNG obrigatório
- Os nomes dos arquivos devem ser exatamente `icon-192.png` e `icon-512.png`
