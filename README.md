# Site da Athomon (athomon.com)

HTML, CSS e JS puros. Sem build, sem dependências. Publicável no GitHub Pages como está.

## Páginas
- index.html: Início (frase de apresentação, destaque da FOX, atualizações, saiba mais)
- fox.html: FOX (em produção, em desenvolvimento, arquitetura)
- seguranca.html: Controles de segurança
- o-nome.html: O nome (ATOM + HOMO)
- contato.html: Contato
- 404.html: página de erro

## Mídia
Os vídeos e imagens do Higgsfield não vêm no projeto. Dê dois cliques em `baixar-midia.bat` uma vez:
ele baixa para `assets/media` e converte as imagens em JPG leve.
Enquanto a mídia não estiver baixada, o site busca direto no CDN do Higgsfield (mais pesado).

Usados: ath-09.mp4 (cartão de vídeo na página FOX), ath-06.jpg e ath-20.jpg (O nome), ath-21.jpg (FOX). As animações ficam em assets/js/motion.js.
Descartados: ath-03/ath-10 (tom alaranjado, fora da paleta), ath-08/ath-13 (quase preto, o fundo de órbitas faz esse papel),
ath-12 (34 MB, pesado demais para fundo), ath-02 e ath-15 (o ath-09 já cobre a esfera; o ath-15 não fecha o loop).

## Ver no PC
Abrir o index.html direto funciona, mas as transições entre páginas só aparecem servido por http
(GitHub Pages, ou `npx serve` / `python -m http.server` dentro da pasta).

## Marca
Cores e logo seguem `../athomon-site-kit/marca`. Fontes incluídas em assets/fonts (licença OFL): Newsreader (títulos e texto) e Jost (interface e marca).
O arquivo assets/js/home.js é da v1 e pode ser apagado.
