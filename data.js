/* =========================================================
   CARDÁPIO KIDS • BASE DE DADOS
   Receitas, frutas, bebidas, mercado, quiz, níveis e conquistas
   ========================================================= */

// Setores do mercado (usados na lista de compras)
const H = 'Hortifruti';
const P = 'Proteínas & Ovos';
const L = 'Laticínios';
const PC = 'Padaria & Cereais';
const M = 'Mercearia';
const SN = 'Snacks & Saudáveis';

const SECTOR_ORDER = [H, P, L, PC, M, SN, 'Bebidas & Sucos'];
const SECTOR_ICONS = {
  [H]: '🥕', [P]: '🥚', [L]: '🧀', [PC]: '🍞', [M]: '🫙', [SN]: '🥨', 'Bebidas & Sucos': '🧃'
};

const MEAL_SLOTS = [
  { key: 'cafe',   label: 'Café da Manhã',    short: 'Café',    icon: '☀️', tone: 'sun' },
  { key: 'escola', label: 'Lanche da Escola', short: 'Escola',  icon: '🎒', tone: 'tangerine' },
  { key: 'almoco', label: 'Almoço',           short: 'Almoço',  icon: '🍽️', tone: 'mint' },
  { key: 'tarde',  label: 'Lanche da Tarde',  short: 'Tarde',   icon: '🌤️', tone: 'sky' },
  { key: 'jantar', label: 'Jantar',           short: 'Jantar',  icon: '🌙', tone: 'grape' }
];

const FRUIT_COLORS = {
  'Roxo': '#8B5CF6', 'Amarelo': '#FACC15', 'Vermelho': '#EF4444',
  'Laranja': '#FB923C', 'Verde': '#22C55E', 'Arco-Íris': 'rainbow'
};

const FRUITS_CATALOG = [
  { id: 'f-uva',       short: 'Uva',       name: 'Uvas sem semente (congeladas)',  color: 'Roxo',     icon: '🍇' },
  { id: 'f-banana',    short: 'Banana',    name: 'Banana prata ou nanica',         color: 'Amarelo',  icon: '🍌' },
  { id: 'f-morango',   short: 'Morango',   name: 'Morangos frescos picados',       color: 'Vermelho', icon: '🍓' },
  { id: 'f-maca',      short: 'Maçã',      name: 'Maçã fatiada com canela',        color: 'Vermelho', icon: '🍎' },
  { id: 'f-mamao',     short: 'Mamão',     name: 'Mamão formosa picado',           color: 'Laranja',  icon: '🧡' },
  { id: 'f-manga',     short: 'Manga',     name: 'Manga palmer em cubos',          color: 'Laranja',  icon: '🥭' },
  { id: 'f-melancia',  short: 'Melancia',  name: 'Melancia em cubos',              color: 'Vermelho', icon: '🍉' },
  { id: 'f-melao',     short: 'Melão',     name: 'Melão gelado em fatias',         color: 'Amarelo',  icon: '🍈' },
  { id: 'f-tangerina', short: 'Tangerina', name: 'Tangerina / Mexerica em gomos',  color: 'Laranja',  icon: '🍊' },
  { id: 'f-kiwi',      short: 'Kiwi',      name: 'Kiwi fatiado',                   color: 'Verde',    icon: '🥝' },
  { id: 'f-goiaba',    short: 'Goiaba',    name: 'Goiaba vermelha picada',         color: 'Vermelho', icon: '💗' },
  { id: 'f-abacaxi',   short: 'Abacaxi',   name: 'Abacaxi pérola em pedaços',      color: 'Amarelo',  icon: '🍍' },
  { id: 'f-pera',      short: 'Pera',      name: 'Pera doce fatiada',              color: 'Verde',    icon: '🍐' },
  { id: 'f-acerola',   short: 'Acerola',   name: 'Acerolas lavadinhas',            color: 'Vermelho', icon: '🍒' },
  { id: 'f-caju',      short: 'Caju',      name: 'Caju em pedaços',                color: 'Amarelo',  icon: '💛' },
  { id: 'f-pitanga',   short: 'Pitanga',   name: 'Pitangas maduras',               color: 'Vermelho', icon: '❤️' },
  { id: 'f-siriguela', short: 'Siriguela', name: 'Siriguelas (seriguelas)',        color: 'Laranja',  icon: '🟠' },
  { id: 'f-coco',      short: 'Coco',      name: 'Coco fresco em lascas',          color: 'Verde',    icon: '🥥' },
  { id: 'f-salada',    short: 'Salada',    name: 'Salada de frutas naturais',      color: 'Arco-Íris', icon: '🌈' }
];

const DRINKS_CATALOG = [
  { id: 'd-agua',      name: 'Garrafinha de água fresca',             icon: '💧', sector: 'Bebidas & Sucos', ingredients: [] },
  { id: 'd-aguacoco',  name: 'Água de coco natural (sem açúcar)',     icon: '🥥', sector: H, ingredients: ['Água de coco natural'] },
  { id: 'd-limonada',  name: 'Água com gás + limão espremido',        icon: '🍋', sector: H, ingredients: ['Água com gás', 'Limão'] },
  { id: 'd-maracuja',  name: 'Suco natural de maracujá (sem açúcar)', icon: '🍹', sector: H, ingredients: ['Maracujá (fruta ou polpa)'] },
  { id: 'd-acerola',   name: 'Suco de acerola com laranja',           icon: '🍊', sector: H, ingredients: ['Acerola', 'Laranja'] },
  { id: 'd-caju',      name: 'Suco natural de caju gelado',           icon: '🧃', sector: H, ingredients: ['Caju ou polpa 100% fruta'] },
  { id: 'd-uva100',    name: 'Suco de uva integral 100% (150 ml)',    icon: '🍇', sector: M, ingredients: ['Suco de uva integral 100%'] },
  { id: 'd-iogurte',   name: 'Iogurte natural + fio de mel',          icon: '🥛', sector: L, ingredients: ['Iogurte natural integral', 'Mel'] },
  { id: 'd-vitamina',  name: 'Vitamina de banana com mamão',          icon: '🥤', sector: L, ingredients: ['Leite', 'Banana', 'Mamão'] },
  { id: 'd-leite',     name: 'Copo de leite com cacau 100%',          icon: '🍫', sector: L, ingredients: ['Leite', 'Cacau em pó 100%'] }
];

// Helper para deixar as receitas mais enxutas
function rec(o) {
  return Object.assign({ difficulty: 1, tags: [], kidCan: '' }, o, {
    ingredients: o.ingredients.map(([item, sector]) => ({ item, sector }))
  });
}

const RECIPE_CATEGORIES = [
  { name: 'Lanches & Cafés',      icon: '🥪', tone: 'sun' },
  { name: 'Proteínas Principais', icon: '🍗', tone: 'tangerine' },
  { name: 'Acompanhamentos',      icon: '🍚', tone: 'mint' },
  { name: 'Saladas & Molhos',     icon: '🥗', tone: 'leaf' },
  { name: 'Sopas & Caldos',       icon: '🍲', tone: 'sky' },
  { name: 'Doces & Shakes',       icon: '🍓', tone: 'berry' }
];

const RECIPES_CATALOG = [
  // ============ LANCHES & CAFÉS ============
  rec({
    id: 'r-pao-queijo-inhame', emoji: '🧀', title: 'Pão de Queijo de Inhame ou Macaxeira',
    category: 'Lanches & Cafés', time: '25 min', yield: '8 bolinhas', difficulty: 2,
    tags: ['Lancheira', 'Forno/Airfryer'],
    kidTip: 'Ótimo para a lancheira porque não fica borrachudo depois de frio.',
    kidCan: 'Amassar o inhame com o garfo e enrolar as bolinhas.',
    ingredients: [
      ['Inhame ou macaxeira cozida (2 rodelas)', H],
      ['Queijo coalho ou minas ralado (1 col. sopa)', L],
      ['Goma de tapioca (3 col. sobremesa)', M],
      ['Azeite de oliva (1 col. chá)', M],
      ['Sementes de chia (opcional)', M]
    ],
    steps: [
      'Amasse bem o inhame ou a macaxeira cozida ainda morna até formar um purê liso.',
      'Misture o queijo ralado, o azeite, a goma de tapioca e a chia até dar ponto de modelar.',
      'Faça bolinhas pequenas e asse em forno médio (180°C) ou airfryer por 15 a 20 minutos até dourar.'
    ]
  }),
  rec({
    id: 'r-pao-queijo-frigideira', emoji: '🍳', title: 'Pãozinho de Queijo de Frigideira (Cottage)',
    category: 'Lanches & Cafés', time: '8 min', yield: '1 porção',
    tags: ['Rápido', 'Frigideira'],
    kidTip: 'Corte em quadradinhos estilo petisco para mandar no potinho.',
    kidCan: 'Misturar tudo com o garfo (o fogão fica com o adulto).',
    ingredients: [
      ['Ovo (1 un.)', P],
      ['Queijo cottage ou ricota cremosa (1 col. sopa)', L],
      ['Goma de tapioca (2 col. sopa)', M],
      ['Sal a gosto', M]
    ],
    steps: [
      'Misture todos os ingredientes com um garfo até ficar homogêneo.',
      'Despeje em frigideira antiaderente em fogo baixo e deixe formar casquinha.',
      'Dobre ao meio como omelete, doure dos dois lados e corte em quadradinhos.'
    ]
  }),
  rec({
    id: 'r-pizza-frigideira', emoji: '🍕', title: 'Pizza Rápida de Frigideira com Aveia',
    category: 'Lanches & Cafés', time: '10 min', yield: '1 disco',
    tags: ['Tarde', 'Frigideira', 'Favorito Kids'],
    kidTip: 'Substitui a pizza tradicional no lanche da tarde, com as fibras da aveia.',
    kidCan: 'Montar a cobertura: queijo, tomate e orégano como quiser!',
    ingredients: [
      ['Ovo (1 un.)', P],
      ['Aveia em flocos finos (3 col. sopa)', M],
      ['Leite (1 col. sopa)', L],
      ['Queijo muçarela (2 fatias)', L],
      ['Tomate em rodelas e orégano', H]
    ],
    steps: [
      'Bata o ovo, a aveia, o leite e uma pitada de sal.',
      'Doure a massa em frigideira untada com um fio de azeite.',
      'Vire, cubra com queijo, tomate e orégano e tampe até derreter.'
    ]
  }),
  rec({
    id: 'r-panini-micro', emoji: '🥪', title: 'Panini Recheado de Micro-ondas',
    category: 'Lanches & Cafés', time: '5 min', yield: '1 sanduíche',
    tags: ['Micro-ondas', 'Lancheira'],
    kidTip: 'Fica com cara de pão tostado e segura a fome por horas.',
    kidCan: 'Misturar a massa no potinho e escolher o recheio.',
    ingredients: [
      ['Ovo (1 un.)', P],
      ['Requeijão light (2 col. sopa)', L],
      ['Queijo parmesão ralado (1/2 col. sobremesa)', L],
      ['Fermento químico (1 col. chá)', M],
      ['Frango desfiado ou atum (60 g)', P]
    ],
    steps: [
      'Misture ovo, requeijão, parmesão e fermento num potinho quadrado.',
      'Leve ao micro-ondas por cerca de 3 minutos.',
      'Corte ao meio, recheie com frango ou atum e doure na sanduicheira.'
    ]
  }),
  rec({
    id: 'r-quiche-caneca', emoji: '☕', title: 'Quiche Express de Caneca',
    category: 'Lanches & Cafés', time: '4 min', yield: '1 porção',
    tags: ['Micro-ondas', 'Rápido'],
    kidTip: 'Opção salgada e quentinha para o lanche da tarde.',
    kidCan: 'Picar o pão com as mãos e colocar na caneca.',
    ingredients: [
      ['Pão integral (1 fatia)', PC],
      ['Ovo (1 un.)', P],
      ['Peito de frango cozido desfiado (30 g)', P],
      ['Requeijão light (1 col. sobremesa)', L],
      ['Leite (1 col. sopa)', L]
    ],
    steps: [
      'Pique o pão integral em cubinhos no fundo de uma caneca.',
      'Misture ovo, frango, requeijão, leite e temperos e despeje sobre o pão.',
      'Leve ao micro-ondas por cerca de 2 minutos, até firmar.'
    ]
  }),
  rec({
    id: 'r-bolinho-batata-frango', emoji: '🍠', title: 'Bolinho Assado de Batata-Doce com Frango',
    category: 'Lanches & Cafés', time: '30 min', yield: '10 bolinhos', difficulty: 2,
    tags: ['Lancheira', 'Congelável'],
    kidTip: 'Lembra coxinha assada! Faça em lote e congele para a semana.',
    kidCan: 'Distribuir a massa nas forminhas com uma colher.',
    ingredients: [
      ['Batata-doce crua ralada (200 g)', H],
      ['Frango desfiado cozido (100 g)', P],
      ['Ovos (4 un.)', P],
      ['Farinha de aveia (100 g)', M],
      ['Cebola ralada e couve picada', H],
      ['Fermento químico (1 col. sopa)', M]
    ],
    steps: [
      'Misture a batata-doce ralada, o frango, os ovos, a aveia e os temperos.',
      'Incorpore o fermento por último e distribua em forminhas.',
      'Asse a 180°C por 25 minutos ou na airfryer por cerca de 15 minutos.'
    ]
  }),
  rec({
    id: 'r-banana-comprida-ovos', emoji: '🍌', title: 'Banana Comprida Cozida com Ovos e Queijo',
    category: 'Lanches & Cafés', time: '15 min', yield: '1 porção',
    tags: ['Café Regional', 'Saciedade'],
    kidTip: 'Café nordestino completo que ajuda a segurar a vontade de doce pela manhã.',
    kidCan: 'Quebrar os ovos numa tigela (e caçar as casquinhas!).',
    ingredients: [
      ['Banana comprida / da terra (1 un.)', H],
      ['Ovos (2 un.)', P],
      ['Queijo coalho ou minas (30 g)', L]
    ],
    steps: [
      'Cozinhe a banana comprida em água até ficar macia.',
      'Prepare os ovos mexidos e grelhe levemente o queijo.',
      'Sirva tudo junto no café da manhã.'
    ]
  }),
  rec({
    id: 'r-sanduiche-natural', emoji: '🥙', title: 'Sanduíche Natural com Pasta Caseira',
    category: 'Lanches & Cafés', time: '10 min', yield: '2 sanduíches',
    tags: ['Lancheira', 'Frio'],
    kidTip: 'Corte em triângulos ou rolinhos para ficar mais divertido.',
    kidCan: 'Misturar a pasta e montar o sanduíche sozinha(o).',
    ingredients: [
      ['Pão de forma integral (4 fatias)', PC],
      ['Frango desfiado ou atum em água (170 g)', P],
      ['Iogurte natural ou creme de ricota (80 g)', L],
      ['Cenoura ralada e milho verde', H],
      ['Alface e tomate', H]
    ],
    steps: [
      'Misture a proteína com o iogurte ou ricota, a cenoura ralada e temperos leves.',
      'Recheie o pão integral com a pasta, a alface e o tomate.',
      'Embrulhe bem em papel-manteiga e leve na lancheira com gelo reutilizável.'
    ]
  }),
  rec({
    id: 'r-cuscuz', emoji: '🌽', title: 'Cuscuz Nordestino com Ovo e Queijo',
    category: 'Lanches & Cafés', time: '12 min', yield: '1 porção',
    tags: ['Café Regional', 'Sem Glúten'],
    kidTip: 'Energia de liberação lenta para dias de educação física.',
    kidCan: 'Hidratar o flocão e mexer com as mãos limpinhas.',
    ingredients: [
      ['Flocão de milho (1/2 xícara)', M],
      ['Ovo (1 un.)', P],
      ['Queijo coalho ou minas (30 g)', L]
    ],
    steps: [
      'Hidrate o flocão com água e uma pitada de sal por 5 minutos.',
      'Cozinhe na cuscuzeira por cerca de 8 minutos.',
      'Sirva com ovo mexido e queijo derretido por cima.'
    ]
  }),
  rec({
    id: 'r-crepioca', emoji: '🌯', title: 'Crepioca Crocante com Queijo e Frango',
    category: 'Lanches & Cafés', time: '8 min', yield: '1 unidade',
    tags: ['Rápido', 'Frigideira'],
    kidTip: 'Enrole como wrap e corte em rodelinhas.',
    kidCan: 'Bater o ovo com a tapioca usando um fouet.',
    ingredients: [
      ['Ovo (1 un.)', P],
      ['Goma de tapioca (1 a 2 col. sopa)', M],
      ['Queijo minas ou muçarela (1 fatia)', L],
      ['Frango desfiado (2 col. sopa)', P]
    ],
    steps: [
      'Bata bem o ovo com a tapioca e uma pitada de sal.',
      'Doure em frigideira antiaderente em fogo baixo.',
      'Recheie com queijo e frango, dobre e sirva.'
    ]
  }),
  rec({
    id: 'r-tapioca-colorida', emoji: '🫓', title: 'Tapioca Recheada de Banana e Canela',
    category: 'Lanches & Cafés', time: '7 min', yield: '1 tapioca',
    tags: ['Rápido', 'Café Regional'],
    kidTip: 'Docinha sem açúcar: a banana madura faz todo o trabalho.',
    kidCan: 'Peneirar a goma na frigideira e espalhar com a colher.',
    ingredients: [
      ['Goma de tapioca hidratada (3 col. sopa)', M],
      ['Banana madura (1 un.)', H],
      ['Queijo minas (1 fatia)', L],
      ['Canela em pó', M]
    ],
    steps: [
      'Peneire a goma na frigideira fria e leve ao fogo baixo até grudar.',
      'Vire, recheie com banana amassada, queijo e canela.',
      'Dobre ao meio e deixe aquecer mais 1 minuto.'
    ]
  }),
  rec({
    id: 'r-muffin-ovo', emoji: '🧁', title: 'Muffin Salgado de Ovo com Legumes',
    category: 'Lanches & Cafés', time: '25 min', yield: '6 muffins', difficulty: 2,
    tags: ['Lancheira', 'Congelável', 'Forno/Airfryer'],
    kidTip: 'Cada muffin pode ter uma “carinha” feita com milho e ervilha!',
    kidCan: 'Escolher os legumes e decorar o topo de cada forminha.',
    ingredients: [
      ['Ovos (4 un.)', P],
      ['Cenoura ralada, milho e ervilha (1/2 xícara)', H],
      ['Queijo muçarela ralado (50 g)', L],
      ['Cheiro-verde e sal', H]
    ],
    steps: [
      'Bata os ovos com sal e cheiro-verde.',
      'Distribua os legumes e o queijo em forminhas de silicone e cubra com os ovos.',
      'Asse a 180°C por 18 a 20 minutos, até firmar.'
    ]
  }),

  // ============ PROTEÍNAS PRINCIPAIS ============
  rec({
    id: 'r-escondidinho-frango', emoji: '🥘', title: 'Escondidinho de Frango com Batata-Doce ou Macaxeira',
    category: 'Proteínas Principais', time: '40 min', yield: '6 a 8 porções', difficulty: 2,
    tags: ['Almoço', 'Jantar', 'Congelável', 'Favorito Kids'],
    kidTip: 'Um dos favoritos das crianças! Fica cremoso e rende marmitas.',
    kidCan: 'Amassar o purê e espalhar as camadas no refratário.',
    ingredients: [
      ['Peito de frango cozido e desfiado (500 g)', P],
      ['Batata-doce ou macaxeira cozida (1 kg)', H],
      ['Molho de tomate caseiro (1 xícara)', M],
      ['Requeijão light (90 g)', L],
      ['Azeite de oliva e páprica doce', M]
    ],
    steps: [
      'Refogue o frango com azeite, páprica e molho de tomate até encorpar.',
      'Amasse a batata-doce ou a macaxeira com o requeijão até virar purê.',
      'Monte camadas de purê e frango num refratário e asse a 200°C por 20 minutos.'
    ]
  }),
  rec({
    id: 'r-hamburguer-fit', emoji: '🍔', title: 'Hambúrguer Caseiro com Cenoura Ralada',
    category: 'Proteínas Principais', time: '20 min', yield: '4 hambúrgueres', difficulty: 2,
    tags: ['Almoço', 'Jantar', 'Airfryer', 'Favorito Kids'],
    kidTip: 'A cenoura ralada “some” na carne e deixa o hambúrguer suculento.',
    kidCan: 'Modelar os discos com as mãos (e lavar bem depois!).',
    ingredients: [
      ['Patinho moído (250 g)', P],
      ['Cenoura crua ralada fina (1 pequena)', H],
      ['Farelo de aveia (4 col. sopa)', M],
      ['Ovo (1 un.)', P],
      ['Alho, cebola ralada e cheiro-verde', H]
    ],
    steps: [
      'Misture todos os ingredientes até dar liga.',
      'Modele discos de 80 a 100 g.',
      'Grelhe em frigideira antiaderente ou asse a 200°C por cerca de 15 minutos, até não ficar rosado por dentro.'
    ]
  }),
  rec({
    id: 'r-frango-crosta-limao', emoji: '🍗', title: 'Iscas de Frango Crocantes em Crosta de Aveia',
    category: 'Proteínas Principais', time: '30 min', yield: '3 porções', difficulty: 2,
    tags: ['Forno/Airfryer', 'Crocante', 'Favorito Kids'],
    kidTip: 'Substitui os nuggets industrializados com crocância de verdade.',
    kidCan: 'Empanar as iscas na farofinha de aveia.',
    ingredients: [
      ['Filé de peito de frango (300 g)', P],
      ['Iogurte natural sem açúcar (1 pote)', L],
      ['Farelo de aveia (1 xícara)', M],
      ['Raspas de limão e lemon pepper', H],
      ['Azeite de oliva (1 col. sopa)', M]
    ],
    steps: [
      'Corte o frango em tiras e deixe marinar no iogurte com lemon pepper por 20 minutos.',
      'Misture o farelo de aveia com raspas de limão, sal e azeite.',
      'Empane pressionando bem e asse a 220°C por cerca de 20 minutos.'
    ]
  }),
  rec({
    id: 'r-frango-caprese', emoji: '🍅', title: 'Peito de Frango Assado Caprese',
    category: 'Proteínas Principais', time: '25 min', yield: '4 porções',
    tags: ['Almoço', 'Jantar'],
    kidTip: 'Queijo derretido com tomate deixa o frango muito mais atrativo.',
    kidCan: 'Encaixar as fatias de queijo e tomate nos cortes.',
    ingredients: [
      ['Peito de frango em filés altos (800 g)', P],
      ['Queijo muçarela fatiado (200 g)', L],
      ['Tomates (2 un.) e manjericão', H],
      ['Alho e azeite de oliva', M]
    ],
    steps: [
      'Faça cortes superficiais no frango, sem atravessar.',
      'Tempere com alho, azeite e sal e encaixe queijo, tomate e manjericão.',
      'Asse em forno preaquecido a 220°C por cerca de 20 minutos.'
    ]
  }),
  rec({
    id: 'r-estrogonofe-leve', emoji: '🍛', title: 'Estrogonofe Leve de Frango ou Patinho',
    category: 'Proteínas Principais', time: '20 min', yield: '4 porções',
    tags: ['Almoço', 'Favorito Kids'],
    kidTip: 'Feito com requeijão light e leite no lugar do creme de leite.',
    kidCan: 'Medir o leite e o requeijão.',
    ingredients: [
      ['Frango em cubos ou patinho (500 g)', P],
      ['Extrato de tomate (40 g)', M],
      ['Requeijão light (90 g)', L],
      ['Leite (165 ml)', L],
      ['Cebola, alho e azeite', H]
    ],
    steps: [
      'Doure a cebola e o alho no azeite e refogue a carne até dourar.',
      'Adicione o extrato de tomate, o leite e o requeijão.',
      'Mexa em fogo baixo até formar um molho cremoso.'
    ]
  }),
  rec({
    id: 'r-almondegas-chia', emoji: '🧆', title: 'Almôndegas Leves com Cenoura e Chia',
    category: 'Proteínas Principais', time: '30 min', yield: '15 almôndegas', difficulty: 2,
    tags: ['Almoço', 'Jantar', 'Congelável'],
    kidTip: 'Perfeitas com macarrão integral ou purê.',
    kidCan: 'Enrolar as bolinhas do mesmo tamanho (vira competição!).',
    ingredients: [
      ['Patinho moído (500 g)', P],
      ['Cenoura ralada (240 g)', H],
      ['Ovos (2 un.)', P],
      ['Semente de chia (15 g)', M],
      ['Molho de tomate caseiro', M]
    ],
    steps: [
      'Misture a carne, a cenoura ralada, os ovos, a chia e os temperos.',
      'Modele bolinhas e doure no forno ou na panela.',
      'Finalize cozinhando por 10 minutos no molho de tomate.'
    ]
  }),
  rec({
    id: 'r-panqueca-aveia', emoji: '🥞', title: 'Panqueca de Aveia Recheada e Gratinada',
    category: 'Proteínas Principais', time: '25 min', yield: '2 panquecas', difficulty: 2,
    tags: ['Almoço', 'Jantar'],
    kidTip: 'A massa com aveia sustenta muito mais que a de farinha branca.',
    kidCan: 'Rechear e enrolar as panquecas.',
    ingredients: [
      ['Farelo ou farinha de aveia (30 g)', M],
      ['Ovo (1 un.)', P],
      ['Leite (20 ml)', L],
      ['Frango desfiado ou carne moída (90 g)', P],
      ['Queijo muçarela (2 fatias)', L],
      ['Molho de tomate', M]
    ],
    steps: [
      'Bata o ovo, a aveia, o leite e o sal; faça discos finos na frigideira.',
      'Recheie, enrole e cubra com queijo e molho de tomate.',
      'Leve ao forno por 10 minutos para gratinar.'
    ]
  }),
  rec({
    id: 'r-papelote-peixe', emoji: '🐟', title: 'Papelote de Peixe Aromático (Sem Espinhas)',
    category: 'Proteínas Principais', time: '20 min', yield: '1 filé',
    tags: ['Leve', 'Jantar'],
    kidTip: 'O peixe assa no próprio vapor e fica macio e úmido. Confira se não há espinhas.',
    kidCan: 'Fechar o “pacotinho” de papel como um presente.',
    ingredients: [
      ['Filé de tilápia ou pescada (120 g)', P],
      ['Cebola fatiada fina (30 g)', H],
      ['Raspas de limão e alecrim fresco', H],
      ['Azeite e sal', M]
    ],
    steps: [
      'Coloque o filé temperado sobre um quadrado de papel-manteiga.',
      'Cubra com cebola, raspas de limão, alecrim e um fio de azeite.',
      'Feche como um pacote e asse a 200°C por 15 a 20 minutos.'
    ]
  }),
  rec({
    id: 'r-abobrinha-recheada', emoji: '⛵', title: 'Barquinha de Abobrinha Recheada Gratinada',
    category: 'Proteínas Principais', time: '30 min', yield: '2 metades', difficulty: 2,
    tags: ['Jantar', 'Vegetais'],
    kidTip: 'O formato de barquinho ajuda a criança a comer abobrinha sem resistência.',
    kidCan: 'Rechear os barquinhos e espetar uma “velinha” de palito com queijo.',
    ingredients: [
      ['Abobrinha média (1 un.)', H],
      ['Carne moída ou frango desfiado (150 g)', P],
      ['Molho de tomate (3 col. sopa)', M],
      ['Queijo muçarela ralado (40 g)', L],
      ['Cebola e alho', H]
    ],
    steps: [
      'Corte a abobrinha ao meio no comprimento e retire o miolo com uma colher.',
      'Refogue a carne com cebola, alho, o miolo picado e o molho de tomate.',
      'Recheie as metades, cubra com queijo e asse a 200°C por cerca de 20 minutos.'
    ]
  }),
  rec({
    id: 'r-carne-panela', emoji: '🥩', title: 'Carne de Panela Desfiada com Legumes',
    category: 'Proteínas Principais', time: '50 min', yield: '6 porções', difficulty: 3,
    tags: ['Almoço', 'Congelável', 'Panela de Pressão'],
    kidTip: 'Desfiada fica macia e fácil de mastigar, ótima para marmitas.',
    kidCan: 'Desfiar a carne já morna com dois garfos.',
    ingredients: [
      ['Acém ou patinho em pedaços (600 g)', P],
      ['Cenoura e batata em cubos', H],
      ['Tomate, cebola e alho', H],
      ['Azeite e louro', M]
    ],
    steps: [
      'Doure a carne no azeite com cebola e alho.',
      'Junte tomate, louro e água até cobrir; cozinhe na pressão por 30 minutos.',
      'Abra com cuidado, junte os legumes e cozinhe até ficarem macios. Desfie a carne.'
    ]
  }),
  rec({
    id: 'r-omelete-forno', emoji: '🥚', title: 'Omelete de Forno Colorida',
    category: 'Proteínas Principais', time: '25 min', yield: '4 porções',
    tags: ['Jantar', 'Vegetais', 'Rápido'],
    kidTip: 'Corte em quadrados como “bolo salgado” — criança adora.',
    kidCan: 'Bater os ovos e espalhar os legumes coloridos.',
    ingredients: [
      ['Ovos (6 un.)', P],
      ['Tomate, pimentão e espinafre picados', H],
      ['Queijo minas em cubos (80 g)', L],
      ['Leite (1/2 xícara)', L]
    ],
    steps: [
      'Bata os ovos com o leite e uma pitada de sal.',
      'Espalhe os legumes e o queijo numa forma untada e cubra com os ovos.',
      'Asse a 180°C por 20 a 25 minutos, até dourar.'
    ]
  }),

  // ============ ACOMPANHAMENTOS ============
  rec({
    id: 'r-arroz-colorido', emoji: '🍚', title: 'Arroz Colorido com Legumes',
    category: 'Acompanhamentos', time: '25 min', yield: '4 porções',
    tags: ['Almoço', 'Vegetais'],
    kidTip: 'Quanto mais cores no arroz, mais divertido fica o prato.',
    kidCan: 'Lavar o arroz e jogar os legumes na panela (com supervisão).',
    ingredients: [
      ['Arroz (1 xícara)', M],
      ['Cenoura em cubinhos, milho e ervilha', H],
      ['Cebola e alho', H],
      ['Azeite e sal', M]
    ],
    steps: [
      'Refogue cebola e alho no azeite, junte o arroz e os legumes.',
      'Adicione 2 xícaras de água quente e sal.',
      'Cozinhe em fogo baixo, tampado, até secar a água.'
    ]
  }),
  rec({
    id: 'r-feijao', emoji: '🫘', title: 'Feijão Caseiro Bem Temperado',
    category: 'Acompanhamentos', time: '45 min', yield: '8 porções', difficulty: 2,
    tags: ['Almoço', 'Congelável', 'Panela de Pressão'],
    kidTip: 'Feijão com arroz é uma dupla campeã de nutrientes. Congele em potinhos.',
    kidCan: 'Escolher os grãos (tirando pedrinhas) antes de lavar.',
    ingredients: [
      ['Feijão carioca ou preto (2 xícaras)', M],
      ['Cebola, alho e louro', H],
      ['Azeite e sal', M]
    ],
    steps: [
      'Deixe o feijão de molho por pelo menos 8 horas e descarte a água.',
      'Cozinhe na pressão com água nova e louro por cerca de 25 minutos após pegar pressão.',
      'Refogue cebola e alho no azeite, junte uma concha de feijão amassado e volte tudo à panela.'
    ]
  }),
  rec({
    id: 'r-pure-abobora', emoji: '🎃', title: 'Purê Cremoso de Abóbora',
    category: 'Acompanhamentos', time: '25 min', yield: '4 porções',
    tags: ['Almoço', 'Jantar', 'Vegetais'],
    kidTip: 'Laranjinha e docinha naturalmente — combina com qualquer proteína.',
    kidCan: 'Amassar com o espremedor.',
    ingredients: [
      ['Abóbora cabotiá (500 g)', H],
      ['Requeijão light (1 col. sopa)', L],
      ['Noz-moscada e sal', M]
    ],
    steps: [
      'Cozinhe a abóbora descascada em cubos até ficar bem macia.',
      'Escorra e amasse com o requeijão.',
      'Tempere com sal e uma pitada de noz-moscada.'
    ]
  }),
  rec({
    id: 'r-macarrao-sugo', emoji: '🍝', title: 'Macarrão Integral ao Sugo Escondido',
    category: 'Acompanhamentos', time: '25 min', yield: '4 porções',
    tags: ['Almoço', 'Favorito Kids', 'Vegetais'],
    kidTip: 'O molho leva legumes batidos que ninguém percebe!',
    kidCan: 'Contar até 10 mexendo o macarrão (com o adulto no fogão).',
    ingredients: [
      ['Macarrão integral (250 g)', M],
      ['Tomates maduros (4 un.)', H],
      ['Cenoura e abobrinha', H],
      ['Queijo parmesão ralado', L]
    ],
    steps: [
      'Cozinhe tomate, cenoura e abobrinha e bata no liquidificador.',
      'Apure o molho na panela com alho, azeite e sal.',
      'Misture ao macarrão cozido e finalize com parmesão.'
    ]
  }),
  rec({
    id: 'r-batata-rustica', emoji: '🥔', title: 'Batatinha Rústica de Airfryer',
    category: 'Acompanhamentos', time: '25 min', yield: '3 porções',
    tags: ['Airfryer', 'Crocante', 'Favorito Kids'],
    kidTip: 'Crocante sem fritura — a versão caseira da batata frita.',
    kidCan: 'Temperar as batatas na tigela, sacudindo com a tampa fechada.',
    ingredients: [
      ['Batatas com casca (3 un.)', H],
      ['Azeite (1 col. sopa)', M],
      ['Páprica doce, alecrim e sal', M]
    ],
    steps: [
      'Lave bem e corte as batatas em gomos.',
      'Misture com azeite, páprica, alecrim e sal.',
      'Leve à airfryer a 200°C por 20 a 25 minutos, sacudindo na metade.'
    ]
  }),

  // ============ SALADAS & MOLHOS ============
  rec({
    id: 'r-salada-arcoiris', emoji: '🌈', title: 'Salada Arco-Íris de Potinho',
    category: 'Saladas & Molhos', time: '10 min', yield: '2 potes',
    tags: ['Almoço', 'Vegetais', 'Frio'],
    kidTip: 'Monte em camadas coloridas num pote transparente: vira arte!',
    kidCan: 'Montar as camadas de cores na ordem que escolher.',
    ingredients: [
      ['Tomate-cereja (1 xícara)', H],
      ['Cenoura ralada (1 un.)', H],
      ['Milho verde (1/2 xícara)', M],
      ['Pepino em cubos (1 un.)', H],
      ['Repolho roxo fatiado fino', H]
    ],
    steps: [
      'Lave e higienize todos os vegetais.',
      'Corte em pedaços pequenos e monte camadas coloridas no pote.',
      'Tempere na hora de comer com azeite, limão e sal.'
    ]
  }),
  rec({
    id: 'r-molho-tomate', emoji: '🥫', title: 'Molho de Tomate Caseiro',
    category: 'Saladas & Molhos', time: '30 min', yield: '1 pote (500 ml)',
    tags: ['Congelável', 'Base'],
    kidTip: 'Sem conservantes e com menos sal que o de caixinha. Base de várias receitas.',
    kidCan: 'Rasgar as folhas de manjericão.',
    ingredients: [
      ['Tomates maduros (6 un.)', H],
      ['Cebola e alho', H],
      ['Azeite, sal e manjericão', M]
    ],
    steps: [
      'Faça um corte em X nos tomates, escalde e retire a pele.',
      'Refogue cebola e alho no azeite e junte os tomates picados.',
      'Cozinhe em fogo baixo por 20 minutos e bata, se quiser mais liso.'
    ]
  }),
  rec({
    id: 'r-palitinhos-pasta', emoji: '🥕', title: 'Palitinhos de Legumes com Pasta de Iogurte',
    category: 'Saladas & Molhos', time: '10 min', yield: '2 porções',
    tags: ['Lancheira', 'Frio', 'Vegetais'],
    kidTip: 'Mergulhar o legume na pastinha deixa tudo mais gostoso de comer.',
    kidCan: 'Misturar a pasta e arrumar os palitinhos no pote.',
    ingredients: [
      ['Cenoura e pepino em palitos', H],
      ['Iogurte natural (1 pote)', L],
      ['Cheiro-verde, limão e sal', H]
    ],
    steps: [
      'Corte os legumes em palitos.',
      'Misture o iogurte com cheiro-verde picado, gotas de limão e sal.',
      'Sirva a pasta num potinho e os palitos ao lado.'
    ]
  }),
  rec({
    id: 'r-salada-grao', emoji: '🫛', title: 'Salada de Grão-de-Bico com Tomate',
    category: 'Saladas & Molhos', time: '15 min', yield: '3 porções',
    tags: ['Almoço', 'Proteína Vegetal'],
    kidTip: 'Grão-de-bico tem proteína e fibra e parece “bolinhas” divertidas.',
    kidCan: 'Temperar e misturar tudo na tigela.',
    ingredients: [
      ['Grão-de-bico cozido (1 xícara)', M],
      ['Tomate e pepino picados', H],
      ['Cheiro-verde', H],
      ['Azeite, limão e sal', M]
    ],
    steps: [
      'Escorra o grão-de-bico cozido.',
      'Misture com tomate, pepino e cheiro-verde.',
      'Tempere com azeite, limão e sal.'
    ]
  }),

  // ============ SOPAS & CALDOS ============
  rec({
    id: 'r-sopa-letrinhas', emoji: '🔤', title: 'Sopa de Legumes com Macarrão Letrinha',
    category: 'Sopas & Caldos', time: '30 min', yield: '4 porções',
    tags: ['Jantar', 'Vegetais', 'Favorito Kids'],
    kidTip: 'Brinque de achar as letras do nome no prato!',
    kidCan: 'Escolher os legumes e contar as letrinhas.',
    ingredients: [
      ['Cenoura, batata e chuchu em cubos', H],
      ['Peito de frango em cubos (200 g)', P],
      ['Macarrão letrinha (1/2 xícara)', M],
      ['Cebola, alho e cheiro-verde', H]
    ],
    steps: [
      'Refogue cebola, alho e frango até dourar.',
      'Junte os legumes e cubra com água; cozinhe por 15 minutos.',
      'Adicione o macarrão letrinha e cozinhe até ficar macio.'
    ]
  }),
  rec({
    id: 'r-caldo-abobora', emoji: '🧡', title: 'Creme de Abóbora com Frango Desfiado',
    category: 'Sopas & Caldos', time: '30 min', yield: '4 porções',
    tags: ['Jantar', 'Congelável'],
    kidTip: 'Aveludado e laranja: tem cara de sopa de conto de fadas.',
    kidCan: 'Salpicar o cheiro-verde por cima.',
    ingredients: [
      ['Abóbora cabotiá (600 g)', H],
      ['Frango cozido desfiado (150 g)', P],
      ['Cebola e alho', H],
      ['Requeijão light (1 col. sopa)', L]
    ],
    steps: [
      'Cozinhe a abóbora com cebola e alho em pouca água até desmanchar.',
      'Bata no liquidificador com cuidado (espere amornar).',
      'Volte à panela, junte o frango e o requeijão e aqueça.'
    ]
  }),
  rec({
    id: 'r-canja', emoji: '🐔', title: 'Canja Leve de Frango',
    category: 'Sopas & Caldos', time: '35 min', yield: '4 porções',
    tags: ['Jantar', 'Conforto'],
    kidTip: 'Clássica de vó: quentinha para noites frias ou dias de dodói.',
    kidCan: 'Desfiar o frango cozido.',
    ingredients: [
      ['Peito de frango (300 g)', P],
      ['Arroz (1/2 xícara)', M],
      ['Cenoura em cubinhos', H],
      ['Cebola, alho e cheiro-verde', H]
    ],
    steps: [
      'Cozinhe o frango em água com cebola e alho; retire e desfie.',
      'No mesmo caldo, cozinhe o arroz e a cenoura.',
      'Volte o frango, acerte o sal e finalize com cheiro-verde.'
    ]
  }),
  rec({
    id: 'r-caldinho-feijao', emoji: '🥣', title: 'Caldinho de Feijão com Couve',
    category: 'Sopas & Caldos', time: '20 min', yield: '3 porções',
    tags: ['Jantar', 'Café Regional', 'Saciedade'],
    kidTip: 'Aproveita o feijão da semana e vira jantar em minutos.',
    kidCan: 'Rasgar a couve em tirinhas.',
    ingredients: [
      ['Feijão cozido com caldo (2 xícaras)', M],
      ['Couve em tirinhas', H],
      ['Alho, cebola e azeite', H]
    ],
    steps: [
      'Bata o feijão cozido com o caldo no liquidificador.',
      'Refogue alho e cebola no azeite e junte o feijão batido.',
      'Ferva por 5 minutos e finalize com a couve refogada.'
    ]
  }),

  // ============ DOCES & SHAKES ============
  rec({
    id: 'r-panqueca-banana', emoji: '🥞', title: 'Panquequinha de Banana e Aveia',
    category: 'Doces & Shakes', time: '10 min', yield: '6 mini panquecas',
    tags: ['Tarde', 'Frigideira', 'Sem Açúcar'],
    kidTip: 'Sem açúcar adicionado: a banana madura adoça sozinha.',
    kidCan: 'Amassar a banana e misturar a massa.',
    ingredients: [
      ['Banana bem madura (1 un.)', H],
      ['Ovo (1 un.)', P],
      ['Aveia em flocos (2 col. sopa)', M],
      ['Canela em pó', M]
    ],
    steps: [
      'Amasse a banana e misture com o ovo, a aveia e a canela.',
      'Coloque colheradas da massa em frigideira antiaderente em fogo baixo.',
      'Vire quando formar bolhinhas e doure o outro lado.'
    ]
  }),
  rec({
    id: 'r-picole-iogurte', emoji: '🍦', title: 'Picolé de Iogurte com Frutas',
    category: 'Doces & Shakes', time: '10 min + congelar', yield: '6 picolés',
    tags: ['Tarde', 'Frio', 'Sem Açúcar'],
    kidTip: 'Sobremesa que é lanche: cálcio do iogurte + vitaminas da fruta.',
    kidCan: 'Escolher as frutas e encher as forminhas.',
    ingredients: [
      ['Iogurte natural integral (2 potes)', L],
      ['Morango, manga ou uva picados (1 xícara)', H],
      ['Mel (1 col. sopa, opcional)', M]
    ],
    steps: [
      'Misture o iogurte com o mel.',
      'Coloque pedaços de fruta nas forminhas e complete com iogurte.',
      'Espete os palitos e congele por pelo menos 6 horas.'
    ]
  }),
  rec({
    id: 'r-bolo-caneca', emoji: '🍫', title: 'Bolo de Caneca de Banana com Cacau',
    category: 'Doces & Shakes', time: '5 min', yield: '1 bolinho',
    tags: ['Micro-ondas', 'Rápido'],
    kidTip: 'Chocolate de verdade com cacau 100% e sem açúcar refinado.',
    kidCan: 'Fazer tudo dentro da caneca com um garfo!',
    ingredients: [
      ['Banana madura (1/2 un.)', H],
      ['Ovo (1 un.)', P],
      ['Farinha de aveia (2 col. sopa)', M],
      ['Cacau em pó 100% (1 col. sopa)', M],
      ['Fermento químico (1/2 col. chá)', M]
    ],
    steps: [
      'Amasse a banana na caneca e misture o ovo.',
      'Junte a aveia, o cacau e por último o fermento.',
      'Leve ao micro-ondas por cerca de 2 minutos e espere amornar.'
    ]
  }),
  rec({
    id: 'r-shake-morango', emoji: '🥤', title: 'Shake Rosa de Morango',
    category: 'Doces & Shakes', time: '5 min', yield: '1 copo',
    tags: ['Tarde', 'Rápido', 'Favorito Kids'],
    kidTip: 'Cor de sorvete, mas é fruta com iogurte.',
    kidCan: 'Colocar tudo no liquidificador (o adulto liga).',
    ingredients: [
      ['Morangos congelados (6 un.)', H],
      ['Iogurte natural (1 pote)', L],
      ['Leite (1/2 copo)', L],
      ['Banana (1/2 un.)', H]
    ],
    steps: [
      'Coloque todos os ingredientes no liquidificador.',
      'Bata até ficar cremoso.',
      'Sirva na hora com um canudinho divertido.'
    ]
  }),
  rec({
    id: 'r-cookie-aveia', emoji: '🍪', title: 'Cookie de Aveia, Banana e Uva-Passa',
    category: 'Doces & Shakes', time: '20 min', yield: '10 cookies',
    tags: ['Lancheira', 'Forno/Airfryer', 'Sem Açúcar'],
    kidTip: 'Rende uma fornada para a semana e vai bem na lancheira.',
    kidCan: 'Fazer as bolinhas e achatar com a palma da mão.',
    ingredients: [
      ['Bananas maduras (2 un.)', H],
      ['Aveia em flocos (1 xícara)', M],
      ['Uva-passa (2 col. sopa)', M],
      ['Canela em pó', M]
    ],
    steps: [
      'Amasse as bananas e misture com a aveia, a uva-passa e a canela.',
      'Faça bolinhas, achate numa assadeira com papel-manteiga.',
      'Asse a 180°C por 15 a 18 minutos, até dourar.'
    ]
  }),
  rec({
    id: 'r-brigadeiro-banana', emoji: '🟤', title: 'Docinho de Banana com Cacau e Coco',
    category: 'Doces & Shakes', time: '15 min', yield: '12 docinhos', difficulty: 2,
    tags: ['Festinha', 'Sem Açúcar'],
    kidTip: 'Para festinhas e dias especiais: tem cara de brigadeiro.',
    kidCan: 'Enrolar e passar os docinhos no coco ralado.',
    ingredients: [
      ['Bananas maduras (2 un.)', H],
      ['Cacau em pó 100% (2 col. sopa)', M],
      ['Leite em pó (3 col. sopa)', L],
      ['Coco ralado sem açúcar', M]
    ],
    steps: [
      'Amasse as bananas e leve ao fogo baixo com o cacau, mexendo sempre.',
      'Desligue, junte o leite em pó e mexa até dar ponto de enrolar.',
      'Espere esfriar, enrole e passe no coco ralado.'
    ]
  })
];

const MARKET_CATALOG = [
  { id: 'm-iogurte-natural', icon: '🥛', name: 'Iogurte natural integral (só leite + fermento)', category: 'Iogurtes & Lácteos', protein: '≈ 5–7 g por pote', cleanLabel: true, sector: L,
    note: 'Leia a lista: o ideal é ter só leite e fermento lácteo. Adoce em casa com fruta picada.' },
  { id: 'm-iogurte-grego', icon: '🍶', name: 'Iogurte tipo grego sem açúcar', category: 'Iogurtes & Lácteos', protein: '≈ 8–12 g por pote', cleanLabel: true, sector: L,
    note: 'Mais cremoso e proteico. Muitas versões “tradicionais” são bem açucaradas: prefira a sem açúcar.' },
  { id: 'm-bebida-lactea-proteica', icon: '🧃', name: 'Bebida láctea proteica (sem cafeína)', category: 'Iogurtes & Lácteos', protein: '≈ 10–15 g por garrafa', cleanLabel: false, sector: L,
    note: 'Quebra-galho para dias corridos, não para todo dia. Evite sabores com café e confira o açúcar.' },
  { id: 'm-queijo-palito', icon: '🧀', name: 'Queijo em palito ou bolinha (porção individual)', category: 'Queijos & Proteínas', protein: '≈ 4–6 g por unidade', cleanLabel: true, sector: L,
    note: 'Prático na lancheira com gelo reutilizável. Combine com uma fruta.' },
  { id: 'm-ovo-cozido', icon: '🥚', name: 'Ovos de codorna cozidos', category: 'Queijos & Proteínas', protein: '≈ 1 g por ovinho', cleanLabel: true, sector: P,
    note: 'Criança adora o tamanho. Mande descascados e bem frios, com gelo reutilizável.' },
  { id: 'm-atum-agua', icon: '🐟', name: 'Atum em água (lata ou sachê)', category: 'Queijos & Proteínas', protein: '≈ 15–20 g por lata pequena', cleanLabel: true, sector: P,
    note: 'Base rápida para a pasta do sanduíche. Escolha a versão em água e com menos sódio.' },
  { id: 'm-pasta-amendoim', icon: '🥜', name: 'Pasta de amendoim integral (100% amendoim)', category: 'Pastas & Grãos', protein: '≈ 4 g por colher de sopa', cleanLabel: true, sector: M,
    note: 'Atenção: muitas escolas proíbem amendoim por alergias. Use em casa e confira a regra da escola.' },
  { id: 'm-grao-bico-crocante', icon: '🫛', name: 'Grão-de-bico tostado crocante', category: 'Snacks Salgados', protein: '≈ 5–7 g por porção', cleanLabel: true, sector: SN,
    note: 'Troca boa para o salgadinho de pacote. Prefira versões com pouco sal.' },
  { id: 'm-pipoca', icon: '🍿', name: 'Milho para pipoca (de panela)', category: 'Snacks Salgados', protein: '≈ 3 g por porção', cleanLabel: true, sector: M,
    note: 'Pipoca feita em casa com fio de azeite é grão integral. Evite a de micro-ondas com gordura e sal em excesso.' },
  { id: 'm-biscoito-arroz', icon: '🍘', name: 'Biscoito de arroz integral', category: 'Snacks Salgados', protein: '≈ 1–2 g por unidade', cleanLabel: true, sector: SN,
    note: 'Leve e crocante. Fica mais completo com requeijão ou pasta de ricota por cima.' },
  { id: 'm-barrinha', icon: '🍫', name: 'Barrinha de cereal ou proteína com pouco açúcar', category: 'Barrinhas', protein: '≈ 2–10 g (varia muito)', cleanLabel: false, sector: SN,
    note: 'Compare rótulos: muitas têm mais açúcar que um doce. Procure a lupa de “alto em açúcar” na frente da embalagem.' },
  { id: 'm-fruta-desidratada', icon: '🍎', name: 'Chips de fruta desidratada (sem açúcar)', category: 'Frutas Secas', protein: '≈ 0–1 g', cleanLabel: true, sector: SN,
    note: 'Bom substituto de bala. Por ser concentrada, uma porção pequena já basta.' },
  { id: 'm-uva-passa', icon: '🟣', name: 'Uva-passa ou damasco seco (porção pequena)', category: 'Frutas Secas', protein: '≈ 1 g', cleanLabel: true, sector: SN,
    note: 'Docinho natural. Escove os dentes depois: grudam nos dentes.' },
  { id: 'm-pao-integral', icon: '🍞', name: 'Pão integral (farinha integral como 1º ingrediente)', category: 'Pães & Cereais', protein: '≈ 3–4 g por 2 fatias', cleanLabel: false, sector: PC,
    note: 'O primeiro ingrediente da lista deve ser farinha integral, não “farinha de trigo enriquecida”.' },
  { id: 'm-aveia', icon: '🌾', name: 'Aveia em flocos', category: 'Pães & Cereais', protein: '≈ 4–5 g por 3 col. sopa', cleanLabel: true, sector: M,
    note: 'Coringa da cozinha: vai em panqueca, cookie, empanado e vitamina.' }
];

// Modelo de semana base (7 dias, repete na semana 2)
const DEFAULT_WEEK_TEMPLATE = [
  { cafe: ['r-cuscuz', 'f-mamao'], escola: ['r-pao-queijo-inhame', 'f-uva', 'd-agua'], almoco: ['r-escondidinho-frango', 'r-salada-arcoiris'], tarde: ['r-shake-morango'], jantar: ['r-sopa-letrinhas'] },
  { cafe: ['r-tapioca-colorida', 'd-leite'], escola: ['r-sanduiche-natural', 'f-tangerina', 'd-aguacoco'], almoco: ['r-frango-caprese', 'r-arroz-colorido', 'r-feijao'], tarde: ['r-pizza-frigideira', 'f-acerola'], jantar: ['r-omelete-forno', 'r-salada-grao'] },
  { cafe: ['r-banana-comprida-ovos'], escola: ['r-muffin-ovo', 'f-morango', 'd-agua'], almoco: ['r-hamburguer-fit', 'r-batata-rustica', 'r-palitinhos-pasta'], tarde: ['r-panqueca-banana', 'd-iogurte'], jantar: ['r-caldo-abobora'] },
  { cafe: ['r-crepioca', 'f-manga'], escola: ['r-bolinho-batata-frango', 'f-maca', 'd-agua'], almoco: ['r-estrogonofe-leve', 'r-arroz-colorido', 'r-salada-arcoiris'], tarde: ['r-cookie-aveia', 'f-melancia'], jantar: ['r-papelote-peixe', 'r-pure-abobora'] },
  { cafe: ['r-pao-queijo-frigideira', 'f-melao'], escola: ['r-panini-micro', 'f-kiwi', 'd-aguacoco'], almoco: ['r-almondegas-chia', 'r-macarrao-sugo'], tarde: ['r-picole-iogurte'], jantar: ['r-abobrinha-recheada'] },
  { cafe: ['r-panqueca-banana', 'f-abacaxi'], escola: ['r-palitinhos-pasta', 'f-pitanga', 'd-caju'], almoco: ['r-carne-panela', 'r-arroz-colorido', 'r-feijao'], tarde: ['r-bolo-caneca', 'd-leite'], jantar: ['r-caldinho-feijao'] },
  { cafe: ['r-cuscuz', 'f-goiaba'], escola: ['r-quiche-caneca', 'f-salada', 'd-agua'], almoco: ['r-panqueca-aveia', 'r-salada-grao'], tarde: ['r-brigadeiro-banana', 'f-siriguela'], jantar: ['r-canja'] }
];

// Níveis de estrelas
const LEVELS = [
  { min: 0,   icon: '🌱', f: 'Sementinha',           m: 'Sementinho' },
  { min: 8,   icon: '🌿', f: 'Brotinho Curioso',     m: 'Brotinho Curioso' },
  { min: 20,  icon: '🌼', f: 'Exploradora de Sabores', m: 'Explorador de Sabores' },
  { min: 40,  icon: '🍓', f: 'Caçadora de Frutas',   m: 'Caçador de Frutas' },
  { min: 65,  icon: '🚀', f: 'Mestre das Vitaminas', m: 'Mestre das Vitaminas' },
  { min: 100, icon: '🌈', f: 'Chef do Arco-Íris',    m: 'Chef do Arco-Íris' },
  { min: 150, icon: '👑', f: 'Rainha da Cozinha',    m: 'Rei da Cozinha' },
  { min: 220, icon: '🦄', f: 'Lenda dos Sabores',    m: 'Lenda dos Sabores' }
];

// Quiz Verdade ou Mito
const QUIZ = [
  { id: 'q1',  q: 'Fruta inteira tem mais fibras do que o suco da mesma fruta.', a: true,  e: 'Isso mesmo! No suco, boa parte das fibras fica para trás. Por isso a fruta inteira enche mais a barriga.' },
  { id: 'q2',  q: 'Comer cenoura dá visão noturna de super-herói.', a: false, e: 'Mito! A cenoura tem vitamina A, que ajuda os olhos a ficarem saudáveis, mas ninguém ganha superpoderes.' },
  { id: 'q3',  q: 'Água é a melhor bebida para matar a sede.', a: true,  e: 'Verdade! Água hidrata sem açúcar. Deixe a garrafinha sempre por perto.' },
  { id: 'q4',  q: 'Refrigerante é uma boa bebida para a lancheira.', a: false, e: 'Mito! Refrigerante tem muito açúcar (ou adoçante) e não alimenta. Água ou água de coco são melhores.' },
  { id: 'q5',  q: 'Frutas de cores diferentes têm nutrientes diferentes.', a: true,  e: 'Verdade! Cada cor tem seus “poderes”. Por isso a missão arco-íris é tão legal.' },
  { id: 'q6',  q: 'Arroz com feijão juntos formam uma dupla muito nutritiva.', a: true,  e: 'Verdade! Juntos eles se completam e formam uma ótima proteína. Dupla campeã do Brasil!' },
  { id: 'q7',  q: 'Engolir semente de melancia faz nascer uma melancia na barriga.', a: false, e: 'Mito! A semente não nasce dentro da gente. Ela só passa pelo corpo e sai depois.' },
  { id: 'q8',  q: 'Ovo é uma boa fonte de proteína.', a: true,  e: 'Verdade! Proteína ajuda os músculos a crescerem fortes.' },
  { id: 'q9',  q: 'Café é uma boa bebida para crianças terem energia na escola.', a: false, e: 'Mito! Cafeína não é indicada para crianças. A energia boa vem de comer bem e dormir bem.' },
  { id: 'q10', q: 'Dormir bem ajuda o corpo a crescer.', a: true,  e: 'Verdade! É durante o sono que o corpo produz bastante do hormônio do crescimento.' },
  { id: 'q11', q: 'Só precisamos beber água quando está calor.', a: false, e: 'Mito! O corpo precisa de água todos os dias, até no frio e na chuva.' },
  { id: 'q12', q: 'Às vezes precisamos provar um alimento várias vezes para começar a gostar.', a: true, e: 'Verdade! O paladar vai se acostumando. Provar de novo é coragem de exploradora!' },
  { id: 'q13', q: 'Leite, iogurte e queijo ajudam a deixar os ossos fortes.', a: true, e: 'Verdade! Eles têm cálcio, que é um dos tijolinhos dos ossos e dentes.' },
  { id: 'q14', q: 'Lavar as mãos antes de comer ajuda a evitar doenças.', a: true, e: 'Verdade! Água e sabão tiram os micróbios das mãos antes que cheguem à boca.' },
  { id: 'q15', q: 'Salgadinho de pacote costuma ter muito sal e gordura.', a: true, e: 'Verdade! Pipoca de panela ou grão-de-bico crocante são trocas mais espertas.' },
  { id: 'q16', q: 'Banana é rica em potássio, que ajuda os músculos.', a: true, e: 'Verdade! Por isso tanta gente come banana antes de fazer esporte.' },
  { id: 'q17', q: 'Comer muito rápido ajuda a ficar satisfeito mais rápido.', a: false, e: 'Mito! A barriga demora um pouquinho para avisar ao cérebro que está cheia. Mastigar devagar ajuda.' },
  { id: 'q18', q: 'Couve, espinafre e brócolis são vegetais verde-escuros cheios de nutrientes.', a: true, e: 'Verdade! Folhas verde-escuras têm ferro, cálcio e vitaminas.' }
];

// Dicas do mascote
const MASCOT_TIPS = [
  'Que tal uma fruta de cor nova hoje? 🌈',
  'Água é a bebida dos campeões! 💧',
  'Provar uma vez já vale estrela de coragem! ⭐',
  'Ajudar na cozinha deixa a comida mais gostosa! 👩‍🍳',
  'Prato colorido = corpo feliz! 🥕🍅🥦',
  'Mastigue devagarinho, a barriga agradece. 😋',
  'Lancheira boa tem fruta, comidinha e água! 🎒',
  'Dormir bem também é alimentar o corpo! 😴',
  'Lavou as mãos? Então bora comer! 🧼',
  'Já jogou o Verdade ou Mito hoje? 🎮'
];

// Conquistas (o "check" recebe um resumo do progresso)
const ACHIEVEMENTS = [
  { id: 'a-primeira',  icon: '⭐', title: 'Primeira Estrela',   desc: 'Ganhe sua primeira estrela.',                  check: p => p.base >= 1 },
  { id: 'a-dia',       icon: '🏆', title: 'Dia Perfeito',       desc: 'Marque “Comi!” nas 5 refeições de um dia.',   check: p => p.perfectDays >= 1 },
  { id: 'a-3dias',     icon: '🔥', title: 'Semana de Fogo',     desc: 'Tenha 3 dias perfeitos.',                      check: p => p.perfectDays >= 3 },
  { id: 'a-provei5',   icon: '🍓', title: 'Coragem de Provar',  desc: 'Carimbe 5 frutas no passaporte.',              check: p => p.tasted >= 5 },
  { id: 'a-provei12',  icon: '🗺️', title: 'Viajante das Frutas', desc: 'Carimbe 12 frutas no passaporte.',            check: p => p.tasted >= 12 },
  { id: 'a-passaporte',icon: '🛂', title: 'Passaporte Completo', desc: 'Carimbe todas as frutas do passaporte.',      check: p => p.tasted >= FRUITS_CATALOG.length },
  { id: 'a-arcoiris',  icon: '🌈', title: 'Missão Arco-Íris',   desc: 'Complete a meta de frutas diferentes no cardápio.', check: p => p.rainbowDone },
  { id: 'a-chef1',     icon: '👩‍🍳', title: 'Chef Mirim',      desc: 'Termine uma receita no Modo Cozinheira.',    check: p => p.cooked >= 1 },
  { id: 'a-chef5',     icon: '🎖️', title: 'Chef Estrela',       desc: 'Termine 5 receitas diferentes.',               check: p => p.cooked >= 5 },
  { id: 'a-quiz5',     icon: '🧠', title: 'Cabeça Esperta',     desc: 'Acerte 5 perguntas diferentes do quiz.',       check: p => p.quiz >= 5 },
  { id: 'a-quizall',   icon: '🦉', title: 'Sabe-Tudo',          desc: 'Acerte todas as perguntas do quiz.',           check: p => p.quiz >= QUIZ.length },
  { id: 'a-fav',       icon: '💖', title: 'Coração Guloso',     desc: 'Favorite 3 receitas.',                         check: p => p.favs >= 3 }
];

const AVATARS = ['🦊', '🐼', '🐰', '🦄', '🐱', '🐶', '🐸', '🐯', '🐨', '🦁', '🐧', '🐙'];
