/* MultiQuest — bilingual question bank and generators.
 *
 * Every question produced here has the shape:
 *   { key, topic, q: {pt, en}, options: [{pt, en} x4], correct: index }
 * The first answer given to the helpers is always the right one; options are
 * shuffled when the question is built.
 */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- helpers
  function rnd(rand, min, max) { return min + Math.floor(rand() * (max - min + 1)); }
  function pick(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }
  function shuffle(arr, rand) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function both(s) { return { pt: String(s), en: String(s) }; }

  /** Build a question; `answers[0]` is correct. answers are {pt,en} objects. */
  function build(key, topic, q, answers, rand) {
    var order = shuffle([0, 1, 2, 3], rand);
    return {
      key: key,
      topic: topic,
      q: q,
      options: order.map(function (i) { return answers[i]; }),
      correct: order.indexOf(0)
    };
  }

  // Static entry: [ptQuestion, ptAnswers, enQuestion, enAnswers?]
  // When enAnswers is omitted the Portuguese answers are reused (names, dates, words).
  function S(ptQ, ptA, enQ, enA) { return { ptQ: ptQ, ptA: ptA, enQ: enQ, enA: enA || ptA }; }

  // ---------------------------------------------------------------- history
  var HISTORY = [
    S('Quem foi o primeiro rei de Portugal?', ['D. Afonso Henriques', 'D. Dinis', 'D. João I', 'D. Sancho I'],
      'Who was the first king of Portugal?'),
    S('Em que ano foi a Batalha de São Mamede?', ['1128', '1143', '1385', '1640'],
      'In which year was the Battle of São Mamede?'),
    S('Em que ano o Tratado de Zamora reconheceu Portugal como reino?', ['1143', '1128', '1179', '1249'],
      'In which year did the Treaty of Zamora recognise Portugal as a kingdom?'),
    S('Em que ano se deu a Batalha de Aljubarrota?', ['1385', '1415', '1143', '1578'],
      'In which year was the Battle of Aljubarrota?'),
    S('Quem comandou o exército português em Aljubarrota?', ['D. Nuno Álvares Pereira', 'Vasco da Gama', 'Marquês de Pombal', 'Afonso de Albuquerque'],
      'Who commanded the Portuguese army at Aljubarrota?'),
    S('Segundo a lenda, que padeira lutou em Aljubarrota?', ['Brites de Almeida', 'Inês de Castro', 'Maria da Fonte', 'Filipa de Lencastre'],
      'According to legend, which baker fought at Aljubarrota?'),
    S('Em que ano os portugueses conquistaram Ceuta?', ['1415', '1385', '1498', '1500'],
      'In which year did the Portuguese conquer Ceuta?'),
    S('Em que ano Vasco da Gama chegou à Índia por mar?', ['1498', '1488', '1500', '1519'],
      'In which year did Vasco da Gama reach India by sea?'),
    S('Quem chegou ao Brasil em 1500?', ['Pedro Álvares Cabral', 'Vasco da Gama', 'Bartolomeu Dias', 'Diogo Cão'],
      'Who reached Brazil in 1500?'),
    S('Quem dobrou o Cabo da Boa Esperança em 1488?', ['Bartolomeu Dias', 'Gil Eanes', 'Pedro Álvares Cabral', 'Fernão de Magalhães'],
      'Who rounded the Cape of Good Hope in 1488?'),
    S('Que navegador passou o Cabo Bojador em 1434?', ['Gil Eanes', 'Diogo Cão', 'Vasco da Gama', 'João Gonçalves Zarco'],
      'Which navigator sailed past Cape Bojador in 1434?'),
    S('Que português comandou a primeira viagem de circum-navegação?', ['Fernão de Magalhães', 'Vasco da Gama', 'Pedro Álvares Cabral', 'Bartolomeu Dias'],
      'Which Portuguese man led the first circumnavigation voyage?'),
    S('Que infante ficou conhecido como "o Navegador"?', ['Infante D. Henrique', 'Infante D. Pedro', 'Infante D. Fernando', 'Infante D. Duarte'],
      'Which prince became known as "the Navigator"?'),
    S('Que tratado de 1494 dividiu o mundo entre Portugal e Castela?', ['Tratado de Tordesilhas', 'Tratado de Windsor', 'Tratado de Zamora', 'Tratado de Methuen'],
      'Which 1494 treaty divided the world between Portugal and Castile?',
      ['Treaty of Tordesillas', 'Treaty of Windsor', 'Treaty of Zamora', 'Methuen Treaty']),
    S('Que rei fundou a primeira universidade portuguesa, em 1290?', ['D. Dinis', 'D. Afonso Henriques', 'D. Manuel I', 'D. João II'],
      'Which king founded the first Portuguese university, in 1290?'),
    S('Que rainha ficou ligada ao "milagre das rosas"?', ['Rainha Santa Isabel', 'D. Leonor', 'D. Maria I', 'D. Filipa de Lencastre'],
      'Which queen is linked to the "miracle of the roses"?',
      ['Queen Saint Elizabeth', 'Queen Leonor', 'Queen Maria I', 'Queen Philippa of Lancaster']),
    S('Que rei ficou conhecido como "o Venturoso"?', ['D. Manuel I', 'D. João III', 'D. Sebastião', 'D. Pedro I'],
      'Which king was known as "the Fortunate"?'),
    S('Que monumento de Lisboa celebra a viagem de Vasco da Gama?', ['Mosteiro dos Jerónimos', 'Castelo de São Jorge', 'Aqueduto das Águas Livres', 'Palácio da Pena'],
      'Which Lisbon monument celebrates Vasco da Gama\'s voyage?',
      ['Jerónimos Monastery', 'São Jorge Castle', 'Águas Livres Aqueduct', 'Pena Palace']),
    S('Que rei desapareceu na Batalha de Alcácer-Quibir, em 1578?', ['D. Sebastião', 'D. Henrique', 'D. João III', 'D. Manuel I'],
      'Which king disappeared at the Battle of Alcácer Quibir in 1578?'),
    S('Em que ano começou a União Ibérica (dinastia filipina)?', ['1580', '1640', '1500', '1385'],
      'In which year did the Iberian Union (Philippine dynasty) begin?'),
    S('Em que ano Portugal restaurou a independência?', ['1640', '1580', '1385', '1910'],
      'In which year did Portugal restore its independence?'),
    S('Em que dia se celebra a Restauração da Independência?', ['1 de dezembro', '5 de outubro', '25 de abril', '10 de junho'],
      'On which day is the Restoration of Independence celebrated?',
      ['1 December', '5 October', '25 April', '10 June']),
    S('Em que ano o grande terramoto destruiu Lisboa?', ['1755', '1640', '1807', '1580'],
      'In which year did the great earthquake destroy Lisbon?'),
    S('Quem liderou a reconstrução de Lisboa depois do terramoto?', ['Marquês de Pombal', 'D. João V', 'Duque de Wellington', 'Padre António Vieira'],
      'Who led the rebuilding of Lisbon after the earthquake?',
      ['Marquis of Pombal', 'King João V', 'Duke of Wellington', 'Father António Vieira']),
    S('Que general francês comandou a primeira invasão francesa (1807)?', ['Junot', 'Napoleão', 'Massena', 'Soult'],
      'Which French general led the first French invasion (1807)?',
      ['Junot', 'Napoleon', 'Masséna', 'Soult']),
    S('Para onde foi a família real portuguesa em 1807?', ['Brasil', 'Inglaterra', 'Açores', 'Angola'],
      'Where did the Portuguese royal family go in 1807?',
      ['Brazil', 'England', 'The Azores', 'Angola']),
    S('Em que ano o Brasil se tornou independente?', ['1822', '1808', '1889', '1910'],
      'In which year did Brazil become independent?'),
    S('Em que cidade começou a Revolução Liberal de 1820?', ['Porto', 'Lisboa', 'Coimbra', 'Braga'],
      'In which city did the 1820 Liberal Revolution begin?',
      ['Porto', 'Lisbon', 'Coimbra', 'Braga']),
    S('Que rei foi assassinado no Regicídio de 1908?', ['D. Carlos I', 'D. Manuel II', 'D. Luís I', 'D. Pedro V'],
      'Which king was killed in the 1908 Regicide?'),
    S('Quem foi o último rei de Portugal?', ['D. Manuel II', 'D. Carlos I', 'D. Luís I', 'D. Miguel'],
      'Who was the last king of Portugal?'),
    S('Em que data foi implantada a República em Portugal?', ['5 de outubro de 1910', '25 de abril de 1974', '1 de dezembro de 1640', '28 de maio de 1926'],
      'When was the Republic established in Portugal?',
      ['5 October 1910', '25 April 1974', '1 December 1640', '28 May 1926']),
    S('Quem foi o primeiro Presidente da República eleito?', ['Manuel de Arriaga', 'Teófilo Braga', 'Bernardino Machado', 'Sidónio Pais'],
      'Who was the first elected President of the Republic?'),
    S('Quem liderou o regime do Estado Novo?', ['António de Oliveira Salazar', 'Marcelo Caetano', 'Mário Soares', 'Humberto Delgado'],
      'Who led the Estado Novo regime?'),
    S('Em que ano aconteceu a Revolução dos Cravos?', ['1974', '1910', '1986', '1926'],
      'In which year did the Carnation Revolution happen?'),
    S('Que capitão de Abril liderou a coluna de Santarém em 1974?', ['Salgueiro Maia', 'Otelo Saraiva de Carvalho', 'Spínola', 'Costa Gomes'],
      'Which April captain led the column from Santarém in 1974?'),
    S('Em que ano Portugal entrou na CEE (hoje União Europeia)?', ['1986', '1974', '1992', '2002'],
      'In which year did Portugal join the EEC (today\'s European Union)?'),
    S('Em que ano Macau foi entregue à China?', ['1999', '1974', '1986', '2002'],
      'In which year was Macau handed over to China?'),
    S('Em que ano Lisboa recebeu a Expo 98?', ['1998', '1994', '2000', '2004'],
      'In which year did Lisbon host Expo 98?'),
    S('Que líder lusitano resistiu aos Romanos?', ['Viriato', 'Afonso Henriques', 'Nuno Álvares Pereira', 'Martim Moniz'],
      'Which Lusitanian leader resisted the Romans?'),
    S('Em que ano D. Afonso Henriques conquistou Lisboa aos Mouros?', ['1147', '1139', '1249', '1385'],
      'In which year did Afonso Henriques take Lisbon from the Moors?'),
    S('Que cidade é conhecida como o "berço da nação"?', ['Guimarães', 'Coimbra', 'Lisboa', 'Porto'],
      'Which city is known as the "cradle of the nation"?',
      ['Guimarães', 'Coimbra', 'Lisbon', 'Porto']),
    S('Que rei ficou conhecido como "o de Boa Memória" e era Mestre de Avis?', ['D. João I', 'D. Duarte', 'D. Fernando', 'D. Pedro I'],
      'Which king, Master of Avis, was known as "of Good Memory"?'),
    S('Que rainha inglesa casou com D. João I?', ['Filipa de Lencastre', 'Isabel I', 'Leonor Teles', 'Catarina de Bragança'],
      'Which English queen married King João I?',
      ['Philippa of Lancaster', 'Elizabeth I', 'Leonor Teles', 'Catherine of Braganza']),
    S('Que descobridor chegou à foz do rio Congo?', ['Diogo Cão', 'Gil Eanes', 'Bartolomeu Dias', 'Pêro da Covilhã'],
      'Which explorer reached the mouth of the Congo River?'),
    S('Que arquipélago foi descoberto por Zarco e Tristão Vaz?', ['Madeira', 'Açores', 'Cabo Verde', 'Canárias'],
      'Which archipelago was found by Zarco and Tristão Vaz?',
      ['Madeira', 'The Azores', 'Cape Verde', 'The Canaries']),
    S('Que ponte de Lisboa se chamava antes Ponte Salazar?', ['Ponte 25 de Abril', 'Ponte Vasco da Gama', 'Ponte D. Luís', 'Ponte da Arrábida'],
      'Which Lisbon bridge used to be called the Salazar Bridge?',
      ['25 de Abril Bridge', 'Vasco da Gama Bridge', 'D. Luís Bridge', 'Arrábida Bridge']),
    S('Em que ano o Fado foi declarado Património da Humanidade pela UNESCO?', ['2011', '1998', '2004', '2019'],
      'In which year was Fado declared UNESCO Intangible Heritage?'),
    S('Que aliança, de 1386, é a mais antiga ainda em vigor no mundo?', ['Aliança Luso-Britânica', 'Aliança Luso-Francesa', 'Aliança Ibérica', 'Liga Hanseática'],
      'Which alliance, from 1386, is the oldest one still in force?',
      ['Anglo-Portuguese Alliance', 'Franco-Portuguese Alliance', 'Iberian Alliance', 'Hanseatic League']),
    S('Que governador conquistou Goa em 1510?', ['Afonso de Albuquerque', 'Francisco de Almeida', 'Vasco da Gama', 'D. João de Castro'],
      'Which governor conquered Goa in 1510?')
  ];

  // ---------------------------------------------------------------- science
  var SCIENCE = [
    S('Qual é o planeta mais perto do Sol?', ['Mercúrio', 'Vénus', 'Terra', 'Marte'],
      'Which planet is closest to the Sun?', ['Mercury', 'Venus', 'Earth', 'Mars']),
    S('Qual é o maior planeta do Sistema Solar?', ['Júpiter', 'Saturno', 'Terra', 'Neptuno'],
      'Which is the largest planet in the Solar System?', ['Jupiter', 'Saturn', 'Earth', 'Neptune']),
    S('Que planeta é conhecido como o "planeta vermelho"?', ['Marte', 'Vénus', 'Júpiter', 'Mercúrio'],
      'Which planet is known as the "red planet"?', ['Mars', 'Venus', 'Jupiter', 'Mercury']),
    S('Qual é a fórmula química da água?', ['H₂O', 'CO₂', 'O₂', 'NaCl'],
      'What is the chemical formula of water?'),
    S('Que gás as plantas absorvem do ar para a fotossíntese?', ['Dióxido de carbono', 'Oxigénio', 'Hélio', 'Azoto'],
      'Which gas do plants take from the air for photosynthesis?', ['Carbon dioxide', 'Oxygen', 'Helium', 'Nitrogen']),
    S('Qual é o gás mais abundante na atmosfera da Terra?', ['Azoto', 'Oxigénio', 'Dióxido de carbono', 'Hidrogénio'],
      'Which gas is most abundant in Earth\'s atmosphere?', ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Hydrogen']),
    S('Quantos ossos tem o corpo de um adulto?', ['206', '106', '306', '186'],
      'How many bones does an adult human body have?'),
    S('Qual é o maior órgão do corpo humano?', ['Pele', 'Fígado', 'Coração', 'Cérebro'],
      'What is the largest organ of the human body?', ['Skin', 'Liver', 'Heart', 'Brain']),
    S('Que órgão bombeia o sangue pelo corpo?', ['Coração', 'Pulmões', 'Rins', 'Estômago'],
      'Which organ pumps blood around the body?', ['Heart', 'Lungs', 'Kidneys', 'Stomach']),
    S('Quantas cavidades tem o coração humano?', ['4', '2', '3', '6'],
      'How many chambers does the human heart have?'),
    S('A que temperatura ferve a água ao nível do mar?', ['100 °C', '90 °C', '80 °C', '120 °C'],
      'At what temperature does water boil at sea level?'),
    S('A que temperatura congela a água?', ['0 °C', '10 °C', '-10 °C', '4 °C'],
      'At what temperature does water freeze?'),
    S('Qual é o símbolo químico do ouro?', ['Au', 'Ag', 'Or', 'Go'],
      'What is the chemical symbol for gold?'),
    S('Qual é o símbolo químico do ferro?', ['Fe', 'Fr', 'Ir', 'F'],
      'What is the chemical symbol for iron?'),
    S('Qual é o símbolo químico do sódio?', ['Na', 'So', 'S', 'Sd'],
      'What is the chemical symbol for sodium?'),
    S('Onde acontece a fotossíntese nas células das plantas?', ['Cloroplastos', 'Mitocôndrias', 'Núcleo', 'Vacúolo'],
      'Where does photosynthesis happen in plant cells?', ['Chloroplasts', 'Mitochondria', 'Nucleus', 'Vacuole']),
    S('Qual é a unidade básica da vida?', ['Célula', 'Átomo', 'Tecido', 'Órgão'],
      'What is the basic unit of life?', ['Cell', 'Atom', 'Tissue', 'Organ']),
    S('Que cientista formulou a lei da gravitação universal?', ['Isaac Newton', 'Albert Einstein', 'Galileu Galilei', 'Charles Darwin'],
      'Which scientist formulated the law of universal gravitation?', ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Charles Darwin']),
    S('Quem descobriu a penicilina?', ['Alexander Fleming', 'Louis Pasteur', 'Marie Curie', 'Egas Moniz'],
      'Who discovered penicillin?'),
    S('Que cientista português ganhou o Prémio Nobel da Medicina em 1949?', ['Egas Moniz', 'Ricardo Jorge', 'Abel Salazar', 'Pedro Nunes'],
      'Which Portuguese scientist won the 1949 Nobel Prize in Medicine?'),
    S('Quem criou a teoria da evolução por seleção natural?', ['Charles Darwin', 'Gregor Mendel', 'Isaac Newton', 'Louis Pasteur'],
      'Who created the theory of evolution by natural selection?'),
    S('Quem organizou a primeira tabela periódica moderna?', ['Dmitri Mendeleev', 'Marie Curie', 'Antoine Lavoisier', 'Niels Bohr'],
      'Who organised the first modern periodic table?'),
    S('Quantas patas tem um inseto?', ['6', '8', '4', '10'],
      'How many legs does an insect have?'),
    S('Quantas patas tem uma aranha?', ['8', '6', '10', '4'],
      'How many legs does a spider have?'),
    S('Qual destes animais é um mamífero que voa?', ['Morcego', 'Pinguim', 'Avestruz', 'Borboleta'],
      'Which of these animals is a flying mammal?', ['Bat', 'Penguin', 'Ostrich', 'Butterfly']),
    S('A baleia é um…', ['Mamífero', 'Peixe', 'Réptil', 'Anfíbio'],
      'A whale is a…', ['Mammal', 'Fish', 'Reptile', 'Amphibian']),
    S('Em que se transforma um girino?', ['Rã', 'Peixe', 'Lagarto', 'Libélula'],
      'What does a tadpole turn into?', ['Frog', 'Fish', 'Lizard', 'Dragonfly']),
    S('De que elemento é feito o diamante?', ['Carbono', 'Silício', 'Ferro', 'Cálcio'],
      'What element is diamond made of?', ['Carbon', 'Silicon', 'Iron', 'Calcium']),
    S('Qual é o pH de uma solução neutra?', ['7', '0', '14', '5'],
      'What is the pH of a neutral solution?'),
    S('Que células do sangue transportam oxigénio?', ['Glóbulos vermelhos', 'Glóbulos brancos', 'Plaquetas', 'Neurónios'],
      'Which blood cells carry oxygen?', ['Red blood cells', 'White blood cells', 'Platelets', 'Neurons']),
    S('Quanto tempo demora a Terra a dar uma volta ao Sol?', ['Cerca de 365 dias', 'Cerca de 30 dias', '24 horas', 'Cerca de 100 dias'],
      'How long does the Earth take to go around the Sun?', ['About 365 days', 'About 30 days', '24 hours', 'About 100 days']),
    S('Onde é que o som NÃO se consegue propagar?', ['No vácuo', 'Na água', 'No ar', 'No aço'],
      'Where can sound NOT travel?', ['In a vacuum', 'In water', 'In air', 'In steel']),
    S('Que partícula do átomo tem carga negativa?', ['Eletrão', 'Protão', 'Neutrão', 'Núcleo'],
      'Which particle of the atom has a negative charge?', ['Electron', 'Proton', 'Neutron', 'Nucleus']),
    S('Qual é o maior oceano da Terra?', ['Pacífico', 'Atlântico', 'Índico', 'Ártico'],
      'Which is the largest ocean on Earth?', ['Pacific', 'Atlantic', 'Indian', 'Arctic']),
    S('Que vitamina o corpo produz com a luz do Sol?', ['Vitamina D', 'Vitamina C', 'Vitamina A', 'Vitamina B12'],
      'Which vitamin does the body make with sunlight?', ['Vitamin D', 'Vitamin C', 'Vitamin A', 'Vitamin B12']),
    S('Como se chama a passagem do vapor de água a líquido?', ['Condensação', 'Evaporação', 'Fusão', 'Sublimação'],
      'What is it called when water vapour turns into liquid?', ['Condensation', 'Evaporation', 'Melting', 'Sublimation']),
    S('Quantas cores tem o arco-íris?', ['7', '5', '6', '8'],
      'How many colours does a rainbow have?'),
    S('Qual é o satélite natural da Terra?', ['Lua', 'Sol', 'Marte', 'Vénus'],
      'What is Earth\'s natural satellite?', ['The Moon', 'The Sun', 'Mars', 'Venus']),
    S('Em que unidade se mede a força?', ['Newton', 'Watt', 'Joule', 'Volt'],
      'What unit is force measured in?', ['Newton', 'Watt', 'Joule', 'Volt']),
    S('Que órgão faz as trocas gasosas na respiração?', ['Pulmões', 'Coração', 'Fígado', 'Rins'],
      'Which organ exchanges gases when we breathe?', ['Lungs', 'Heart', 'Liver', 'Kidneys']),
    S('Que estrela está no centro do Sistema Solar?', ['Sol', 'Sírius', 'Estrela Polar', 'Betelgeuse'],
      'Which star is at the centre of the Solar System?', ['The Sun', 'Sirius', 'The North Star', 'Betelgeuse']),
    S('Que animal é herbívoro?', ['Vaca', 'Lobo', 'Águia', 'Tubarão'],
      'Which animal is a herbivore?', ['Cow', 'Wolf', 'Eagle', 'Shark']),
    S('Qual é o estado físico do gelo?', ['Sólido', 'Líquido', 'Gasoso', 'Plasma'],
      'What state of matter is ice?', ['Solid', 'Liquid', 'Gas', 'Plasma']),
    S('Que força nos mantém presos ao chão?', ['Gravidade', 'Magnetismo', 'Atrito', 'Eletricidade'],
      'Which force keeps us on the ground?', ['Gravity', 'Magnetism', 'Friction', 'Electricity'])
  ];

  // ------------------------------------------------------------- portuguese
  var PORTUGUESE = [
    S('Quem escreveu "Os Lusíadas"?', ['Luís de Camões', 'Fernando Pessoa', 'Eça de Queirós', 'Gil Vicente'],
      'Who wrote "Os Lusíadas"?'),
    S('Quantos cantos tem "Os Lusíadas"?', ['10', '12', '7', '5'],
      'How many cantos does "Os Lusíadas" have?'),
    S('Quem escreveu "Mensagem"?', ['Fernando Pessoa', 'Luís de Camões', 'Sophia de Mello Breyner', 'José Saramago'],
      'Who wrote "Mensagem"?'),
    S('Quem escreveu "Os Maias"?', ['Eça de Queirós', 'Camilo Castelo Branco', 'Almeida Garrett', 'José Saramago'],
      'Who wrote "Os Maias"?'),
    S('Quem escreveu o "Auto da Barca do Inferno"?', ['Gil Vicente', 'Luís de Camões', 'Padre António Vieira', 'Bocage'],
      'Who wrote "Auto da Barca do Inferno"?'),
    S('Que escritor português ganhou o Prémio Nobel da Literatura em 1998?', ['José Saramago', 'António Lobo Antunes', 'Miguel Torga', 'Fernando Pessoa'],
      'Which Portuguese writer won the 1998 Nobel Prize in Literature?'),
    S('Quem escreveu "Memorial do Convento"?', ['José Saramago', 'Eça de Queirós', 'Florbela Espanca', 'Almeida Garrett'],
      'Who wrote "Memorial do Convento"?'),
    S('Quem escreveu "A Menina do Mar"?', ['Sophia de Mello Breyner Andresen', 'Alice Vieira', 'Florbela Espanca', 'Agustina Bessa-Luís'],
      'Who wrote "A Menina do Mar"?'),
    S('Qual é o feminino de "ator"?', ['atriz', 'atora', 'atoresa', 'atriza'],
      'What is the feminine of the Portuguese word "ator"?'),
    S('Qual é o feminino de "cavalo"?', ['égua', 'cavala', 'cavaleira', 'potra'],
      'What is the feminine of the Portuguese word "cavalo"?'),
    S('Qual é o feminino de "galo"?', ['galinha', 'gala', 'galeta', 'galina'],
      'What is the feminine of the Portuguese word "galo"?'),
    S('Qual é o feminino de "boi"?', ['vaca', 'boia', 'boa', 'bezerra'],
      'What is the feminine of the Portuguese word "boi"?'),
    S('Qual é o feminino de "rei"?', ['rainha', 'reia', 'reina', 'realeza'],
      'What is the feminine of the Portuguese word "rei"?'),
    S('Que palavra está escrita corretamente?', ['exceção', 'excessão', 'esceção', 'exseção'],
      'Which Portuguese word is spelled correctly?'),
    S('Que palavra está escrita corretamente?', ['privilégio', 'previlégio', 'privilejio', 'previlégeo'],
      'Which Portuguese word is spelled correctly?'),
    S('Que palavra está escrita corretamente?', ['cabeleireiro', 'cabelereiro', 'cabeleleiro', 'cabeleiro'],
      'Which Portuguese word is spelled correctly?'),
    S('Complete: "___ dois dias que não chove."', ['Há', 'À', 'A', 'Á'],
      'Complete in Portuguese: "___ dois dias que não chove."'),
    S('Complete: "Vou ___ praia."', ['à', 'há', 'á', 'ah'],
      'Complete in Portuguese: "Vou ___ praia."'),
    S('Que classe de palavra é "rapidamente"?', ['Advérbio', 'Adjetivo', 'Verbo', 'Nome'],
      'What word class is the Portuguese word "rapidamente"?', ['Adverb', 'Adjective', 'Verb', 'Noun']),
    S('Que classe de palavra é "bonito"?', ['Adjetivo', 'Advérbio', 'Verbo', 'Preposição'],
      'What word class is the Portuguese word "bonito"?', ['Adjective', 'Adverb', 'Verb', 'Preposition']),
    S('Que classe de palavra é "correr"?', ['Verbo', 'Nome', 'Adjetivo', 'Pronome'],
      'What word class is the Portuguese word "correr"?', ['Verb', 'Noun', 'Adjective', 'Pronoun']),
    S('Que classe de palavra é "mesa"?', ['Nome', 'Verbo', 'Advérbio', 'Adjetivo'],
      'What word class is the Portuguese word "mesa"?', ['Noun', 'Verb', 'Adverb', 'Adjective']),
    S('Qual é o pretérito perfeito de "fazer" na 1.ª pessoa (eu)?', ['fiz', 'fazi', 'fazei', 'fez'],
      'What is the preterite of "fazer" for "eu" (I)?'),
    S('Qual é o pretérito perfeito de "ir" na 1.ª pessoa (eu)?', ['fui', 'ia', 'iri', 'fu'],
      'What is the preterite of "ir" for "eu" (I)?'),
    S('Qual é o pretérito perfeito de "dizer" na 1.ª pessoa (eu)?', ['disse', 'dizi', 'dissi', 'dizei'],
      'What is the preterite of "dizer" for "eu" (I)?'),
    S('Qual é o pretérito perfeito de "ter" na 3.ª pessoa (ele)?', ['teve', 'tive', 'teu', 'tinha'],
      'What is the preterite of "ter" for "ele" (he)?'),
    S('Qual é o diminutivo de "casa"?', ['casinha', 'casão', 'casarão', 'casebre'],
      'What is the diminutive of the Portuguese word "casa"?'),
    S('Como se chama um conjunto de abelhas?', ['enxame', 'cardume', 'alcateia', 'rebanho'],
      'In Portuguese, what is a group of bees called?'),
    S('Como se chama um conjunto de lobos?', ['alcateia', 'enxame', 'manada', 'cardume'],
      'In Portuguese, what is a group of wolves called?'),
    S('Como se chama um conjunto de peixes?', ['cardume', 'rebanho', 'alcateia', 'bando'],
      'In Portuguese, what is a group of fish called?'),
    S('Como se chama um conjunto de ovelhas?', ['rebanho', 'cardume', 'enxame', 'alcateia'],
      'In Portuguese, what is a group of sheep called?'),
    S('Qual destas palavras é esdrúxula (acento na antepenúltima sílaba)?', ['lâmpada', 'café', 'mesa', 'papel'],
      'Which of these Portuguese words is stressed on the third-to-last syllable?'),
    S('Qual destas palavras é aguda (acento na última sílaba)?', ['café', 'mesa', 'lâmpada', 'livro'],
      'Which of these Portuguese words is stressed on the last syllable?'),
    S('Quantas vogais tem o alfabeto português?', ['5', '6', '7', '4'],
      'How many vowels does the Portuguese alphabet have?'),
    S('Quantas letras tem o alfabeto português atual?', ['26', '23', '24', '28'],
      'How many letters does the current Portuguese alphabet have?'),
    S('Qual é o sinónimo de "contente"?', ['feliz', 'zangado', 'cansado', 'triste'],
      'Which Portuguese word is a synonym of "contente"?'),
    S('Qual é o sinónimo de "começar"?', ['iniciar', 'terminar', 'parar', 'acabar'],
      'Which Portuguese word is a synonym of "começar"?'),
    S('Qual é o sinónimo de "bonito"?', ['belo', 'feio', 'grande', 'velho'],
      'Which Portuguese word is a synonym of "bonito"?')
  ];

  // Plurals: [singular, correct, wrong, wrong, wrong]
  var PLURALS = [
    ['pão', 'pães', 'pãos', 'pões', 'pãoes'], ['cão', 'cães', 'cãos', 'cões', 'cãoes'], ['mão', 'mãos', 'mães', 'mões', 'mãoes'],
    ['irmão', 'irmãos', 'irmães', 'irmões', 'irmãoes'], ['alemão', 'alemães', 'alemãos', 'alemões', 'alemãoes'],
    ['capitão', 'capitães', 'capitãos', 'capitões', 'capitãoes'], ['limão', 'limões', 'limãos', 'limães', 'limãoes'],
    ['avião', 'aviões', 'aviãos', 'aviães', 'aviãoes'], ['animal', 'animais', 'animales', 'animals', 'animaes'],
    ['papel', 'papéis', 'papeles', 'papels', 'papeis'], ['farol', 'faróis', 'farols', 'faroles', 'farois'],
    ['lápis', 'lápis', 'lápises', 'lápiss', 'lápes'], ['flor', 'flores', 'flors', 'floris', 'florez'],
    ['luz', 'luzes', 'luzs', 'luzis', 'luses'], ['jardim', 'jardins', 'jardims', 'jardines', 'jardis'],
    ['anel', 'anéis', 'aneles', 'anels', 'aneis'], ['mês', 'meses', 'mêses', 'mêss', 'mezes'],
    ['país', 'países', 'paíss', 'paises', 'paízes'], ['útil', 'úteis', 'útils', 'úteles', 'uteis'],
    ['chapéu', 'chapéus', 'chapéis', 'chapéues', 'chapéux']
  ];
  PLURALS.forEach(function (p) {
    PORTUGUESE.push(S('Qual é o plural de "' + p[0] + '"?', p.slice(1),
      'What is the plural of the Portuguese word "' + p[0] + '"?'));
  });

  // Antonyms: [word, opposite]
  var ANTONYMS = [
    ['alto', 'baixo'], ['rápido', 'lento'], ['alegre', 'triste'], ['grande', 'pequeno'], ['quente', 'frio'],
    ['claro', 'escuro'], ['cheio', 'vazio'], ['novo', 'velho'], ['forte', 'fraco'], ['rico', 'pobre'],
    ['fácil', 'difícil'], ['aberto', 'fechado'], ['limpo', 'sujo'], ['longe', 'perto'], ['cedo', 'tarde'],
    ['gordo', 'magro'], ['subir', 'descer'], ['entrar', 'sair'], ['ganhar', 'perder'], ['comprar', 'vender'],
    ['acender', 'apagar'], ['dia', 'noite'], ['verdade', 'mentira'], ['início', 'fim'], ['doce', 'amargo'],
    ['duro', 'mole'], ['molhado', 'seco'], ['largo', 'estreito'], ['pesado', 'leve'], ['corajoso', 'medroso']
  ];

  // ---------------------------------------------------------------- english
  var ENGLISH = [
    S('Qual é o passado de "go"?', ['went', 'goed', 'gone', 'goes'], 'What is the past simple of "go"?'),
    S('Qual é o passado de "eat"?', ['ate', 'eated', 'eaten', 'eats'], 'What is the past simple of "eat"?'),
    S('Qual é o passado de "see"?', ['saw', 'seed', 'seen', 'sees'], 'What is the past simple of "see"?'),
    S('Qual é o passado de "buy"?', ['bought', 'buyed', 'brought', 'buys'], 'What is the past simple of "buy"?'),
    S('Qual é o passado de "write"?', ['wrote', 'writed', 'written', 'writes'], 'What is the past simple of "write"?'),
    S('Qual é o passado de "run"?', ['ran', 'runned', 'runs', 'rung'], 'What is the past simple of "run"?'),
    S('Qual é o passado de "swim"?', ['swam', 'swimmed', 'swum', 'swims'], 'What is the past simple of "swim"?'),
    S('Qual é o passado de "think"?', ['thought', 'thinked', 'thank', 'thinks'], 'What is the past simple of "think"?'),
    S('Qual é o plural de "child"?', ['children', 'childs', 'childes', 'childrens'], 'What is the plural of "child"?'),
    S('Qual é o plural de "mouse"?', ['mice', 'mouses', 'mouse', 'meese'], 'What is the plural of "mouse"?'),
    S('Qual é o plural de "tooth"?', ['teeth', 'tooths', 'teeths', 'toothes'], 'What is the plural of "tooth"?'),
    S('Qual é o plural de "foot"?', ['feet', 'foots', 'feets', 'footes'], 'What is the plural of "foot"?'),
    S('Qual é o plural de "woman"?', ['women', 'womans', 'womens', 'woman'], 'What is the plural of "woman"?'),
    S('Qual é o plural de "box"?', ['boxes', 'boxs', 'boxen', 'boxies'], 'What is the plural of "box"?'),
    S('Complete: "She ___ to school every day."', ['goes', 'go', 'going', 'gone'], 'Complete: "She ___ to school every day."'),
    S('Complete: "I ___ a student."', ['am', 'is', 'are', 'be'], 'Complete: "I ___ a student."'),
    S('Complete: "They ___ happy."', ['are', 'is', 'am', 'be'], 'Complete: "They ___ happy."'),
    S('Complete: "___ apple a day."', ['An', 'A', 'The a', 'Some'], 'Complete: "___ apple a day."'),
    S('Complete: "How ___ you?"', ['are', 'is', 'am', 'do'], 'Complete: "How ___ you?"'),
    S('Complete: "I have lived here ___ 2010."', ['since', 'for', 'from', 'during'], 'Complete: "I have lived here ___ 2010."'),
    S('Complete: "The book is ___ the table."', ['on', 'at', 'of', 'by'], 'Complete: "The book is ___ the table."'),
    S('Qual é o comparativo de "good"?', ['better', 'gooder', 'best', 'more good'], 'What is the comparative of "good"?'),
    S('Qual é o superlativo de "bad"?', ['worst', 'baddest', 'worse', 'most bad'], 'What is the superlative of "bad"?'),
    S('Qual é o comparativo de "big"?', ['bigger', 'biger', 'more big', 'biggest'], 'What is the comparative of "big"?'),
    S('Que dia vem depois de "Monday"?', ['Tuesday', 'Thursday', 'Sunday', 'Wednesday'], 'Which day comes after "Monday"?'),
    S('Qual é o primeiro mês do ano em inglês?', ['January', 'June', 'July', 'March'], 'What is the first month of the year?'),
    S('Que palavra interrogativa se usa para perguntar por um lugar?', ['Where', 'When', 'Who', 'Why'], 'Which question word asks about a place?'),
    S('Que palavra interrogativa se usa para perguntar pelo tempo (quando)?', ['When', 'Where', 'What', 'Which'], 'Which question word asks about time?'),
    S('Quem escreveu "Romeo and Juliet"?', ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'], 'Who wrote "Romeo and Juliet"?'),
    S('Quem escreveu "Hamlet"?', ['William Shakespeare', 'Oscar Wilde', 'J. R. R. Tolkien', 'George Orwell'], 'Who wrote "Hamlet"?'),
    S('Como se escreve o número 13 em inglês?', ['thirteen', 'thirty', 'threeteen', 'thirtteen'], 'How do you spell the number 13 in English?'),
    S('Como se escreve o número 40 em inglês?', ['forty', 'fourty', 'fourteen', 'fortty'], 'How do you spell the number 40 in English?'),
    S('Qual é o contrário de "early"?', ['late', 'soon', 'fast', 'never'], 'What is the opposite of "early"?'),
    S('Qual é o contrário de "cheap"?', ['expensive', 'poor', 'free', 'small'], 'What is the opposite of "cheap"?')
  ];

  // Vocabulary: [portuguese, english]
  var VOCAB = [
    ['cão', 'dog'], ['gato', 'cat'], ['casa', 'house'], ['livro', 'book'], ['maçã', 'apple'], ['água', 'water'],
    ['sol', 'sun'], ['lua', 'moon'], ['escola', 'school'], ['amigo', 'friend'], ['carro', 'car'], ['cavalo', 'horse'],
    ['pássaro', 'bird'], ['peixe', 'fish'], ['árvore', 'tree'], ['flor', 'flower'], ['mar', 'sea'], ['céu', 'sky'],
    ['pão', 'bread'], ['leite', 'milk'], ['queijo', 'cheese'], ['mesa', 'table'], ['cadeira', 'chair'], ['janela', 'window'],
    ['porta', 'door'], ['vermelho', 'red'], ['azul', 'blue'], ['verde', 'green'], ['amarelo', 'yellow'], ['preto', 'black'],
    ['branco', 'white'], ['irmão', 'brother'], ['irmã', 'sister'], ['pai', 'father'], ['mãe', 'mother'], ['avó', 'grandmother'],
    ['chuva', 'rain'], ['neve', 'snow'], ['vento', 'wind'], ['comboio', 'train'], ['sapato', 'shoe'], ['cozinha', 'kitchen'],
    ['quarto', 'bedroom'], ['segunda-feira', 'Monday'], ['domingo', 'Sunday'], ['inverno', 'winter'], ['verão', 'summer'],
    ['outono', 'autumn'], ['primavera', 'spring'], ['coelho', 'rabbit'], ['urso', 'bear'], ['ovelha', 'sheep'], ['vaca', 'cow'],
    ['porco', 'pig'], ['galinha', 'chicken'], ['morango', 'strawberry'], ['cenoura', 'carrot'], ['mão', 'hand'], ['cabeça', 'head'],
    ['olho', 'eye'], ['orelha', 'ear'], ['perna', 'leg'], ['feliz', 'happy'], ['triste', 'sad'], ['grande', 'big'],
    ['pequeno', 'small'], ['rápido', 'fast'], ['lento', 'slow'], ['quente', 'hot'], ['frio', 'cold'], ['ponte', 'bridge'],
    ['castelo', 'castle'], ['navio', 'ship'], ['estrela', 'star'], ['nuvem', 'cloud'], ['montanha', 'mountain'], ['rio', 'river']
  ];

  // ------------------------------------------------------------- generators
  function fromStatic(topic, list, idx, rand) {
    var e = list[idx];
    var answers = e.ptA.map(function (a, i) { return { pt: a, en: e.enA[i] }; });
    return build(topic + '-s-' + idx, topic, { pt: e.ptQ, en: e.enQ }, answers, rand);
  }

  function threeOthers(rand, list, exclude) {
    var pool = shuffle(list.filter(function (x) { return x !== exclude; }), rand);
    var out = [];
    for (var i = 0; i < pool.length && out.length < 3; i++) if (out.indexOf(pool[i]) < 0) out.push(pool[i]);
    return out;
  }

  function genAntonym(rand) {
    var i = rnd(rand, 0, ANTONYMS.length - 1);
    var pair = ANTONYMS[i];
    var flip = rand() < 0.5;
    var word = flip ? pair[1] : pair[0];
    var ans = flip ? pair[0] : pair[1];
    var all = [];
    ANTONYMS.forEach(function (p) { all.push(p[0], p[1]); });
    all = all.filter(function (w) { return w !== word; });
    var wrong = threeOthers(rand, all, ans);
    return build('pt-ant-' + word, 'portuguese',
      { pt: 'Qual é o antónimo (contrário) de "' + word + '"?', en: 'What is the antonym (opposite) of the Portuguese word "' + word + '"?' },
      [both(ans)].concat(wrong.map(both)), rand);
  }

  function genVocab(rand) {
    var i = rnd(rand, 0, VOCAB.length - 1);
    var toEnglish = rand() < 0.5;
    var pair = VOCAB[i];
    var col = toEnglish ? 1 : 0;
    var wrong = threeOthers(rand, VOCAB.map(function (p) { return p[col]; }), pair[col]);
    var q = toEnglish
      ? { pt: 'Como se diz "' + pair[0] + '" em inglês?', en: 'What is the Portuguese word "' + pair[0] + '" in English?' }
      : { pt: 'O que significa "' + pair[1] + '" em português?', en: 'What does "' + pair[1] + '" mean in Portuguese?' };
    return build('en-voc-' + i + (toEnglish ? '-e' : '-p'), 'english', q, [both(pair[col])].concat(wrong.map(both)), rand);
  }

  // Wrong numeric options near the right one.
  function numericOptions(rand, ans, spread) {
    spread = spread || Math.max(3, Math.round(Math.abs(ans) * 0.15));
    var set = [ans];
    var guard = 0;
    while (set.length < 4 && guard++ < 200) {
      var d = rnd(rand, 1, spread) * (rand() < 0.5 ? -1 : 1);
      var v = ans + d;
      if (v >= 0 && set.indexOf(v) < 0) set.push(v);
    }
    var k = 1;
    while (set.length < 4) { if (set.indexOf(ans + k) < 0) set.push(ans + k); k++; }
    return set;
  }

  // Maths difficulty grows along the board: 1 (houses 1–25), 2 (26–50), 3 (51–75).
  function genMath(rand, house) {
    var d = house > 50 ? 3 : house > 25 ? 2 : 1;
    var kinds = d === 1
      ? ['add', 'sub', 'mul', 'half', 'missing', 'seq', 'div']
      : d === 2
        ? ['add', 'sub', 'mul', 'div', 'pct', 'square', 'ops', 'seq', 'missing', 'frac']
        : ['mul', 'div', 'pct', 'square', 'sqrt', 'ops', 'seq', 'frac', 'power', 'missing'];
    var kind = pick(rand, kinds);
    var a, b, c, ans, qpt, qen, opts;
    switch (kind) {
      case 'add':
        a = rnd(rand, d === 1 ? 5 : 40, d === 1 ? 60 : 900);
        b = rnd(rand, d === 1 ? 5 : 40, d === 1 ? 60 : 900);
        ans = a + b; qpt = 'Quanto é ' + a + ' + ' + b + '?'; qen = 'What is ' + a + ' + ' + b + '?';
        opts = numericOptions(rand, ans, 10);
        break;
      case 'sub':
        a = rnd(rand, d === 1 ? 20 : 200, d === 1 ? 99 : 999);
        b = rnd(rand, 5, a - 1);
        ans = a - b; qpt = 'Quanto é ' + a + ' − ' + b + '?'; qen = 'What is ' + a + ' − ' + b + '?';
        opts = numericOptions(rand, ans, 10);
        break;
      case 'mul':
        a = d === 1 ? rnd(rand, 2, 10) : d === 2 ? rnd(rand, 11, 25) : rnd(rand, 12, 35);
        b = d === 1 ? rnd(rand, 2, 10) : d === 2 ? rnd(rand, 3, 9) : rnd(rand, 11, 19);
        ans = a * b; qpt = 'Quanto é ' + a + ' × ' + b + '?'; qen = 'What is ' + a + ' × ' + b + '?';
        opts = numericOptions(rand, ans, Math.max(4, a));
        break;
      case 'div':
        b = rnd(rand, 2, d === 1 ? 10 : 12);
        ans = rnd(rand, 2, d === 1 ? 10 : 25);
        a = b * ans; qpt = 'Quanto é ' + a + ' ÷ ' + b + '?'; qen = 'What is ' + a + ' ÷ ' + b + '?';
        opts = numericOptions(rand, ans, 4);
        break;
      case 'half':
        a = rnd(rand, 5, 60) * 2; ans = a / 2;
        qpt = 'Qual é a metade de ' + a + '?'; qen = 'What is half of ' + a + '?';
        opts = numericOptions(rand, ans, 5);
        break;
      case 'frac':
        var dens = [3, 4, 5, 10];
        b = pick(rand, dens);
        c = rnd(rand, 1, b - 1);
        ans = rnd(rand, 2, 15) * c;
        a = ans / c * b;
        var fracPt = { 3: 'terços', 4: 'quartos', 5: 'quintos', 10: 'décimos' }[b];
        var fracPt1 = { 3: 'um terço', 4: 'um quarto', 5: 'um quinto', 10: 'um décimo' }[b];
        var fracEn = { 3: 'third', 4: 'quarter', 5: 'fifth', 10: 'tenth' }[b];
        qpt = 'Quanto é ' + (c === 1 ? fracPt1 : c + ' ' + fracPt) + ' de ' + a + '?';
        qen = 'What is ' + (c === 1 ? 'one ' + fracEn : c + ' ' + fracEn + 's') + ' of ' + a + '?';
        opts = numericOptions(rand, ans, Math.max(3, Math.round(ans / 4)));
        break;
      case 'pct':
        b = pick(rand, [10, 20, 25, 50, 75]);
        a = rnd(rand, 2, 30) * (b === 25 || b === 75 ? 4 : b === 20 ? 5 : 10);
        ans = a * b / 100;
        qpt = 'Quanto é ' + b + '% de ' + a + '?'; qen = 'What is ' + b + '% of ' + a + '?';
        opts = numericOptions(rand, ans, Math.max(3, Math.round(ans / 3)));
        break;
      case 'square':
        a = rnd(rand, 4, d === 2 ? 15 : 25); ans = a * a;
        qpt = 'Quanto é ' + a + '²?'; qen = 'What is ' + a + '²?';
        opts = [ans, a * 2, ans + a, ans - a];
        break;
      case 'sqrt':
        ans = rnd(rand, 4, 20); a = ans * ans;
        qpt = 'Qual é a raiz quadrada de ' + a + '?'; qen = 'What is the square root of ' + a + '?';
        opts = numericOptions(rand, ans, 3);
        break;
      case 'power':
        a = pick(rand, [2, 3, 5, 10]); b = a === 2 ? rnd(rand, 3, 8) : a === 10 ? rnd(rand, 2, 5) : rnd(rand, 2, 4);
        ans = Math.pow(a, b);
        qpt = 'Quanto é ' + a + ' elevado a ' + b + '?'; qen = 'What is ' + a + ' to the power of ' + b + '?';
        opts = [ans, a * b, Math.pow(a, b - 1), Math.pow(a, b + 1)];
        break;
      case 'ops':
        a = rnd(rand, 2, 20); b = rnd(rand, 2, 9); c = rnd(rand, 2, 9);
        ans = a + b * c;
        qpt = 'Quanto é ' + a + ' + ' + b + ' × ' + c + '?'; qen = 'What is ' + a + ' + ' + b + ' × ' + c + '?';
        opts = [ans, (a + b) * c, ans + 1, ans - b];
        break;
      case 'seq':
        a = rnd(rand, 1, 20); b = rnd(rand, 2, d === 1 ? 5 : 12);
        var seq = [a, a + b, a + 2 * b, a + 3 * b];
        ans = a + 4 * b;
        qpt = 'Qual é o número seguinte: ' + seq.join(', ') + ', …?';
        qen = 'What number comes next: ' + seq.join(', ') + ', …?';
        opts = numericOptions(rand, ans, b);
        break;
      default: // missing
        b = rnd(rand, 3, d === 1 ? 30 : 90); ans = rnd(rand, 3, d === 1 ? 30 : 90);
        a = ans + b;
        qpt = '? + ' + b + ' = ' + a + '. Qual é o número que falta?';
        qen = '? + ' + b + ' = ' + a + '. What is the missing number?';
        opts = numericOptions(rand, ans, 6);
    }
    // Make sure options are unique and non-negative.
    var uniq = [];
    opts.forEach(function (o) { if (o >= 0 && uniq.indexOf(o) < 0) uniq.push(o); });
    var k = 1;
    while (uniq.length < 4) { if (uniq.indexOf(ans + k) < 0) uniq.push(ans + k); k++; }
    uniq = uniq.slice(0, 4);
    return build('math-' + qen, 'math', { pt: qpt, en: qen }, uniq.map(both), rand);
  }

  // --------------------------------------------------------------- dealer
  /**
   * A Dealer hands out questions for a game, never repeating one
   * until every question of that topic has been used.
   */
  function Dealer(rand) {
    this.rand = rand || Math.random;
    this.used = {};
    this.decks = {};
  }

  var STATIC = { history: HISTORY, science: SCIENCE, portuguese: PORTUGUESE, english: ENGLISH };
  var GENERATOR = { portuguese: genAntonym, english: genVocab };

  Dealer.prototype._fromDeck = function (topic) {
    var list = STATIC[topic];
    if (!this.decks[topic] || this.decks[topic].length === 0) {
      var idx = [];
      for (var i = 0; i < list.length; i++) if (!this.used[topic + '-s-' + i]) idx.push(i);
      if (idx.length === 0) { // all used: start over
        for (var j = 0; j < list.length; j++) { idx.push(j); delete this.used[topic + '-s-' + j]; }
      }
      this.decks[topic] = shuffle(idx, this.rand);
    }
    return fromStatic(topic, list, this.decks[topic].pop(), this.rand);
  };

  Dealer.prototype.next = function (topic, house) {
    var q = null;
    for (var tries = 0; tries < 60; tries++) {
      if (topic === 'math') q = genMath(this.rand, house || 1);
      else if (GENERATOR[topic] && this.rand() < 0.4) q = GENERATOR[topic](this.rand);
      else q = this._fromDeck(topic);
      if (!this.used[q.key]) break;
    }
    this.used[q.key] = true;
    return q;
  };

  var api = {
    Dealer: Dealer,
    genMath: genMath,
    banks: { history: HISTORY, science: SCIENCE, portuguese: PORTUGUESE, english: ENGLISH, vocab: VOCAB, antonyms: ANTONYMS }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MQQuestions = api;
})(this);
