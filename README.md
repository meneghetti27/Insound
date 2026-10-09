# InSound — Site

Site da InSound Invest: *o seu primeiro contato com investimento musical.*

## Rodar localmente

Site estático (HTML + CSS + JS), sem build:

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

Dá pra publicar direto no GitHub Pages, Netlify ou Vercel.

## Estrutura

- `index.html`: a página
- `assets/css/style.css`: estilos (tokens de cor e tipografia no topo)
- `assets/js/main.js`: animações (GSAP + ScrollTrigger, Lenis para scroll suave), formulário, abas
- `assets/img/`: fotos da equipe
- `conteudo/`: todo o conteúdo de origem, organizado em Markdown (ver `conteudo/README.md`)
- `conteudo/pendencias.md`: o que falta decidir

## Formulário da lista de espera

Ainda não conectado. Para ligar, coloque a URL que recebe um POST JSON (`perfil`, `nome`, `email`) em `data-endpoint` no `<form id="form-lista">`.
