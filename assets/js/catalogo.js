/* ==========================================================================
   CATÁLOGO NYPARFUM
   --------------------------------------------------------------------------
   Para adicionar um perfume, copie um bloco { ... } da lista PRODUTOS e
   edite os campos. Campos:

   id         identificador único, sem espaços (ex.: "lattafa-khamrah")
   nome       nome do perfume
   marca      marca (ex.: "Lattafa")
   colecoes   uma ou mais de: "arabes", "femininos", "masculinos",
              "body-splash", "presentes"
   tipo       ex.: "Eau de Parfum", "Body Splash"
   volume     ex.: "100 ml"
   preco      número em reais (ex.: 289.9) ou null para "Consulte o valor"
   imagem     caminho da foto (ex.: "assets/img/fahad.webp") ou null —
              sem foto, o site desenha um frasco usando as cores de "tons"
   tons       duas cores para o frasco desenhado (ex.: ["#c9a46a", "#3a2a14"])
   descricao  texto curto
   notas      opcional: { topo: [...], coracao: [...], fundo: [...] }
   destaque   true para aparecer primeiro
   consulta   true para cartões de "consultar opções" (sem produto fixo)
   ========================================================================== */

window.NY_COLECOES = [
  { id: "todos",       nome: "Todos" },
  { id: "arabes",      nome: "Árabes" },
  { id: "femininos",   nome: "Femininos" },
  { id: "masculinos",  nome: "Masculinos" },
  { id: "body-splash", nome: "Body Splash" },
  { id: "presentes",   nome: "Presentes" }
];

window.NY_PRODUTOS = [
  {
    id: "lattafa-fahad",
    nome: "Fahad",
    marca: "Lattafa",
    colecoes: ["arabes", "presentes"],
    tipo: "Eau de Parfum",
    volume: "100 ml",
    preco: null,
    imagem: "assets/img/fahad.webp",
    tons: ["#d9a441", "#3b2508"],
    descricao: "Um árabe dourado e luminoso, com frasco escultural e rastro marcante. Presença do primeiro borrifo ao fim do dia.",
    destaque: true
  },
  {
    id: "lattafa-al-nashama-caprice",
    nome: "Al Nashama Caprice",
    marca: "Lattafa",
    colecoes: ["arabes", "presentes"],
    tipo: "Eau de Parfum",
    volume: "100 ml",
    preco: null,
    imagem: "assets/img/al-nashama-caprice.webp",
    tons: ["#2f4f8a", "#d8b46a"],
    descricao: "Elegância árabe em azul profundo e dourado. Sofisticado, envolvente e perfeito para quem gosta de ser lembrado.",
    destaque: true
  },
  {
    id: "brand-collection-savage-100",
    nome: "Savage Nº 100",
    marca: "Brand Collection",
    colecoes: ["body-splash", "masculinos"],
    tipo: "Body Splash",
    volume: "250 ml",
    preco: null,
    imagem: "assets/img/body-splash-savage.jpg",
    tons: ["#1f3a52", "#c8d3dc"],
    descricao: "Body splash da Brand Collection com perfil fresco e aromático. Ótimo para o dia a dia e para reaplicar sem pesar.",
    destaque: true
  },
  {
    id: "brand-collection-body-splash",
    nome: "Body Splash",
    marca: "Brand Collection",
    colecoes: ["body-splash", "femininos", "presentes"],
    tipo: "Body Splash",
    volume: "250 ml",
    preco: null,
    imagem: "assets/img/body-splash-white.jpg",
    tons: ["#e9e4dc", "#9c8f80"],
    descricao: "Linha de body splashes queridinha das clientes: “fica na roupa e na pele”. Pergunte as fragrâncias disponíveis.",
    destaque: false
  },

  /* ---- Cartões de consulta (mostram as linhas da loja sem fixar estoque) ---- */
  {
    id: "selecao-arabes",
    nome: "Seleção Árabe",
    marca: "Diversas marcas",
    colecoes: ["arabes"],
    tipo: "Eau de Parfum",
    volume: "Vários tamanhos",
    preco: null,
    imagem: null,
    tons: ["#c9a46a", "#2a1a0a"],
    descricao: "Outras fragrâncias árabes intensas e duradouras chegam toda semana. Peça a lista do momento.",
    consulta: true
  },
  {
    id: "selecao-femininos",
    nome: "Seleção Feminina",
    marca: "Importados e nacionais",
    colecoes: ["femininos", "presentes"],
    tipo: "Perfumes",
    volume: "Vários tamanhos",
    preco: null,
    imagem: null,
    tons: ["#e8b4b0", "#6b2f3a"],
    descricao: "Florais, doces e frutados — delicadeza e personalidade para diferentes ocasiões.",
    consulta: true
  },
  {
    id: "selecao-masculinos",
    nome: "Seleção Masculina",
    marca: "Importados e nacionais",
    colecoes: ["masculinos", "presentes"],
    tipo: "Perfumes",
    volume: "Vários tamanhos",
    preco: null,
    imagem: null,
    tons: ["#5b6b78", "#121820"],
    descricao: "Amadeirados, aromáticos e especiados — elegância, impacto e identidade.",
    consulta: true
  },
  {
    id: "selecao-presentes",
    nome: "Presente Sob Medida",
    marca: "NYPARFUM",
    colecoes: ["presentes"],
    tipo: "Curadoria",
    volume: "Do seu orçamento",
    preco: null,
    imagem: null,
    tons: ["#d8c3a0", "#4a3a26"],
    descricao: "Conte para quem é o presente e o seu orçamento. A gente indica a fragrância certa.",
    consulta: true
  }
];
