# JOGO DA CESTA DE BOLINHAS
O projeto consiste em usar programação de códigos para criar um pequeno jogo, com uma "cesta" controlada pelo mouse, no qual haverá a geração de bolinhas no topo da tela. Dessa maneira, o objetivo do jogo sendo pegar o máximo de bolinhas com a "cesta".

## Adições ao jogo
Na queda das bolinhas em tela, quanto na colisão da bolinha dentro da cesta ou no chão, haverá a aplicação dos movimentos da física, as bolinhas são geradas por sistema de partículas, há um painel de pontuação do jogador, as bolinhas são de diferentes materiais, há bolinhas "especiais” que dão mais pontos ou penalizam se caírem fora da cesta, existe um pequeno painel usando dat.gui para ajustar a gravidade ou a velocidade das bolinhas, e, por fim, haverá um som quando as bolinhas colidirem com a cesta.

## Tecnologia usada
Utilizando a API Three.js, as seguintes bibliotecas e funções foram utilizadas: cannon js, criamos um mundo onde a física existe, escolhendo uma gravidade para os objetos não estáticos; para a aparência da cesta, foi utilizado o GLTFLoader; foi criada a função seguirMouse, que faz com que a cesta siga o mouse pela tela; foi criada uma função chamada criarBolinha, usada para gerar várias partículas em pontos aleatórios de uma esfera e suas cores são baseadas no tipo da bolinha; para criar o corpo físico da bolinha, foi utilizada a biblioteca cannon js e, com o auxílio do evento de colisão, são dados os pontos baseando-se no local em que a bolinha caiu e o seu tipo, além de tocar um som se a bolinha cair na cesta; por fim, através do dat.gui, foi criado uma GUI para que o jogador possa escolher tanto a gravidade das bolinhas quanto a frequência em que serão geradas. 

## Como rodar o projeto
Para que o projeto seja executado corretamente, é necessário rodá-lo através do NodeJS. Para isso, instale o Node JS. Abra um terminal e digite “cd < caminho>”, em que < caminho> é o caminho para a pasta do projeto. Então digite “npx vite”. Aparecerá um url no campo “Local:”, copie-o e cole-o no navegador.

## Vídeo Demonstrativo: 
Visite [Jogo da Cesta de Bolinhas](https://youtu.be/ig4JSejB3B0?si=eah_ZI8e4epKXyBT)

## Integrantes da Equuipe de Desenvolvimento:
- ISABELA DA SILVA MELO E COSTA
- GABRIELA DA SILVA MELO E COSTA
- KAREN STEPHAN DA PENHA SOUSA
- JOÃO PAULO GUILHERME MOREIRA MOTA
- VITÓRIA MOREIRA DE OLIVEIRA
