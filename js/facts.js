/* MultiQuest — fact tables the question generators draw on.
 *
 * Each table holds plain, checked facts; js/generators.js turns every fact
 * into several kinds of question, with the wrong answers taken from the same
 * table. Rows are "|"-separated strings to keep the file compact. A level is
 * 1 easy … 4 genius.
 */
(function (root) {
  'use strict';

  function rows(text) {
    return text.trim().split('\n').map(function (l) { return l.trim().split('|'); });
  }

  // ------------------------------------------------------------- history
  // Monarchs in order: name | dynasty (1 Afonsina, 2 Avis, 3 Filipina, 4 Bragança)
  //   | year the reign began ('' when disputed) | epithet ('' when shared or unclear) | level
  var MONARCHS = rows(`
    D. Afonso Henriques|1||o Conquistador|1
    D. Sancho I|1|1185|o Povoador|2
    D. Afonso II|1|1211|o Gordo|3
    D. Sancho II|1|1223|o Capelo|4
    D. Afonso III|1|1248|o Bolonhês|3
    D. Dinis|1|1279|o Lavrador|2
    D. Afonso IV|1|1325|o Bravo|3
    D. Pedro I|1|1357|o Justiceiro|2
    D. Fernando|1|1367|o Formoso|3
    D. João I|2|1385|o de Boa Memória|2
    D. Duarte|2|1433|o Eloquente|3
    D. Afonso V|2|1438|o Africano|3
    D. João II|2|1481|o Príncipe Perfeito|2
    D. Manuel I|2|1495|o Venturoso|2
    D. João III|2|1521|o Piedoso|3
    D. Sebastião|2|1557|o Desejado|1
    D. Henrique|2|1578|o Casto|4
    D. Filipe I|3|1580|o Prudente|3
    D. Filipe II|3|1598||4
    D. Filipe III|3|1621|o Grande|4
    D. João IV|4|1640|o Restaurador|1
    D. Afonso VI|4|1656|o Vitorioso|4
    D. Pedro II|4|1683|o Pacífico|4
    D. João V|4|1706|o Magnânimo|3
    D. José I|4|1750|o Reformador|3
    D. Maria I|4|1777|a Piedosa|3
    D. João VI|4|1816|o Clemente|3
    D. Pedro IV|4|1826|o Rei Soldado|3
    D. Maria II|4||a Educadora|3
    D. Miguel|4|1828|o Absolutista|4
    D. Pedro V|4|1853|o Esperançoso|4
    D. Luís I|4|1861|o Popular|4
    D. Carlos I|4|1889|o Diplomata|3
    D. Manuel II|4|1908|o Patriota|2
  `);
  // The reigns of Pedro IV, Maria II and Miguel overlap, so "who came next"
  // questions skip them.
  var MONARCH_NO_SEQUENCE = ['D. Pedro IV', 'D. Maria II', 'D. Miguel'];
  var DYNASTIES = [
    null,
    { pt: 'Afonsina (1.ª dinastia)', en: 'Afonsine (1st dynasty)' },
    { pt: 'de Avis (2.ª dinastia)', en: 'Aviz (2nd dynasty)' },
    { pt: 'Filipina (3.ª dinastia)', en: 'Philippine (3rd dynasty)' },
    { pt: 'de Bragança (4.ª dinastia)', en: 'Braganza (4th dynasty)' }
  ];

  // Presidents of the Republic, in order: name | year they took office | level
  var PRESIDENTS = rows(`
    Manuel de Arriaga|1911|2
    Teófilo Braga|1915|3
    Bernardino Machado|1915|3
    Sidónio Pais||3
    Canto e Castro|1918|4
    António José de Almeida|1919|4
    Manuel Teixeira Gomes|1923|4
    Óscar Carmona|1926|3
    Craveiro Lopes|1951|4
    Américo Tomás|1958|3
    António de Spínola|1974|3
    Costa Gomes|1974|3
    Ramalho Eanes|1976|2
    Mário Soares|1986|1
    Jorge Sampaio|1996|2
    Cavaco Silva|2006|2
    Marcelo Rebelo de Sousa|2016|1
  `);

  // Events in Portuguese history: year | pt | en | level
  var EVENTS = rows(`
    1128|a Batalha de São Mamede|the Battle of São Mamede|2
    1139|a Batalha de Ourique|the Battle of Ourique|3
    1143|o Tratado de Zamora|the Treaty of Zamora|2
    1147|a conquista de Lisboa aos mouros|the conquest of Lisbon from the Moors|2
    1249|a conquista definitiva do Algarve|the final conquest of the Algarve|3
    1290|a fundação da universidade (Estudo Geral) por D. Dinis|the founding of the university (Estudo Geral) by King Dinis|3
    1297|o Tratado de Alcanizes, que fixou a fronteira|the Treaty of Alcañices, which fixed the border|4
    1373|o primeiro tratado de aliança com Inglaterra|the first treaty of alliance with England|4
    1385|a Batalha de Aljubarrota|the Battle of Aljubarrota|1
    1386|o Tratado de Windsor|the Treaty of Windsor|3
    1415|a conquista de Ceuta|the conquest of Ceuta|2
    1419|a chegada à ilha da Madeira|the arrival at the island of Madeira|3
    1427|a chegada aos Açores|the arrival in the Azores|3
    1434|a passagem do Cabo Bojador por Gil Eanes|Gil Eanes sailing past Cape Bojador|3
    1488|a passagem do Cabo da Boa Esperança por Bartolomeu Dias|Bartolomeu Dias rounding the Cape of Good Hope|2
    1494|o Tratado de Tordesilhas|the Treaty of Tordesillas|2
    1498|a chegada de Vasco da Gama à Índia|Vasco da Gama reaching India|1
    1500|a chegada de Pedro Álvares Cabral ao Brasil|Pedro Álvares Cabral reaching Brazil|1
    1510|a conquista de Goa por Afonso de Albuquerque|Afonso de Albuquerque's conquest of Goa|3
    1511|a conquista de Malaca|the conquest of Malacca|4
    1519|a partida da viagem de circum-navegação de Fernão de Magalhães|the start of Ferdinand Magellan's voyage around the world|3
    1543|a chegada dos portugueses ao Japão|the Portuguese reaching Japan|4
    1557|o estabelecimento dos portugueses em Macau|the Portuguese settling in Macau|4
    1572|a publicação de Os Lusíadas|the publication of The Lusiads|2
    1578|a Batalha de Alcácer Quibir|the Battle of Alcácer Quibir|2
    1580|o início da União Ibérica|the start of the Iberian Union|2
    1640|a Restauração da Independência|the Restoration of Independence|1
    1668|o tratado de paz em que Espanha reconheceu a independência|the peace treaty in which Spain recognised independence|4
    1703|o Tratado de Methuen|the Methuen Treaty|4
    1755|o terramoto de Lisboa|the Lisbon earthquake|1
    1759|a expulsão dos Jesuítas por Pombal|Pombal's expulsion of the Jesuits|4
    1807|a primeira invasão francesa|the first French invasion|2
    1808|a chegada da corte portuguesa ao Brasil|the Portuguese court arriving in Brazil|3
    1820|a Revolução Liberal do Porto|the Liberal Revolution in Porto|2
    1822|a independência do Brasil|the independence of Brazil|2
    1834|o fim da guerra civil (Convenção de Évora Monte)|the end of the civil war (Concession of Evoramonte)|3
    1856|a primeira viagem de comboio em Portugal|the first train journey in Portugal|3
    1867|a abolição da pena de morte para crimes civis|the abolition of the death penalty for civil crimes|3
    1890|o Ultimato inglês|the British Ultimatum|3
    1908|o Regicídio|the Regicide (assassination of King Carlos)|2
    1910|a implantação da República|the founding of the Republic|1
    1916|a entrada de Portugal na Primeira Guerra Mundial|Portugal entering the First World War|3
    1922|a primeira travessia aérea do Atlântico Sul|the first flight across the South Atlantic|3
    1926|o golpe de 28 de Maio|the 28 May coup|3
    1933|a Constituição do Estado Novo|the Estado Novo constitution|3
    1949|a entrada de Portugal na NATO como membro fundador|Portugal joining NATO as a founding member|3
    1955|a entrada de Portugal na ONU|Portugal joining the United Nations|4
    1961|o início da Guerra Colonial|the start of the Colonial War|3
    1966|a inauguração da ponte sobre o Tejo em Lisboa|the opening of the bridge over the Tagus in Lisbon|3
    1974|a Revolução dos Cravos (25 de Abril)|the Carnation Revolution (25 April)|1
    1975|a independência de Angola e Moçambique|the independence of Angola and Mozambique|2
    1976|a aprovação da Constituição da República|the approval of the Constitution of the Republic|3
    1986|a entrada de Portugal na CEE|Portugal joining the EEC|2
    1998|a Exposição Mundial (Expo) em Lisboa|the World Expo in Lisbon|2
    1999|a entrega de Macau à China|the handover of Macau to China|2
    2002|a entrada em circulação das moedas e notas de euro|euro coins and notes coming into circulation|2
    2004|o Campeonato Europeu de futebol organizado por Portugal|the European football championship hosted by Portugal|2
    2016|a vitória de Portugal no Europeu de futebol|Portugal winning the European football championship|1
    2017|a vitória de Portugal na Eurovisão|Portugal winning the Eurovision Song Contest|2
  `);

  // People in Portuguese history: name | known for (pt) | known for (en) | level
  var PEOPLE = rows(`
    Vasco da Gama|chegou à Índia por mar|reached India by sea|1
    Pedro Álvares Cabral|chegou ao Brasil em 1500|reached Brazil in 1500|1
    Bartolomeu Dias|dobrou o Cabo da Boa Esperança|rounded the Cape of Good Hope|2
    Gil Eanes|passou o Cabo Bojador|sailed past Cape Bojador|3
    Fernão de Magalhães|liderou a primeira viagem à volta do mundo|led the first voyage around the world|2
    Diogo Cão|explorou a foz do rio Congo|explored the mouth of the Congo River|4
    Infante D. Henrique|impulsionou os Descobrimentos|drove the Age of Discovery|1
    Luís de Camões|escreveu Os Lusíadas|wrote The Lusiads|1
    Fernando Pessoa|escreveu com vários heterónimos|wrote under many heteronyms|2
    Marquês de Pombal|reconstruiu Lisboa depois do terramoto de 1755|rebuilt Lisbon after the 1755 earthquake|1
    Salgueiro Maia|liderou as tropas de Santarém no 25 de Abril|led the Santarém troops on 25 April|2
    Egas Moniz|ganhou o Prémio Nobel da Medicina|won the Nobel Prize in Medicine|3
    José Saramago|ganhou o Prémio Nobel da Literatura|won the Nobel Prize in Literature|2
    Amália Rodrigues|foi a grande voz do fado|was the great voice of fado|1
    Aristides de Sousa Mendes|deu vistos a milhares de refugiados em 1940|gave visas to thousands of refugees in 1940|2
    Gil Vicente|é considerado o pai do teatro português|is considered the father of Portuguese theatre|3
    Padre António Vieira|escreveu sermões famosos|wrote famous sermons|3
    D. Nuno Álvares Pereira|comandou o exército em Aljubarrota|commanded the army at Aljubarrota|2
    Inês de Castro|foi coroada rainha depois de morta, segundo a lenda|was crowned queen after her death, as legend says|2
    Afonso de Albuquerque|conquistou Goa e Malaca|conquered Goa and Malacca|3
    Eça de Queirós|escreveu Os Maias|wrote The Maias|2
    Almeida Garrett|escreveu Viagens na Minha Terra|wrote Travels in My Homeland|3
    Camilo Castelo Branco|escreveu Amor de Perdição|wrote Doomed Love|3
    Gago Coutinho|atravessou o Atlântico Sul de avião com Sacadura Cabral|flew across the South Atlantic with Sacadura Cabral|3
    Brites de Almeida|é a padeira de Aljubarrota da lenda|is the baker of Aljubarrota in the legend|2
    Florbela Espanca|escreveu sonetos famosos|wrote famous sonnets|3
    Sophia de Mello Breyner Andresen|escreveu A Menina do Mar|wrote The Girl from the Sea|2
    Cristiano Ronaldo|ganhou cinco Bolas de Ouro|won five Ballon d'Or awards|1
    Rosa Mota|ganhou a maratona olímpica em 1988|won the Olympic marathon in 1988|3
    Carlos Lopes|ganhou a maratona olímpica em 1984|won the Olympic marathon in 1984|3
    Siza Vieira|ganhou o Prémio Pritzker de arquitetura|won the Pritzker Prize for architecture|4
  `);

  // Former Portuguese territories: country | capital | year of independence | level
  var COLONIES = rows(`
    Brasil|Brasília|1822|2
    Guiné-Bissau|Bissau||3
    Angola|Luanda|1975|2
    Moçambique|Maputo|1975|2
    Cabo Verde|Praia|1975|2
    São Tomé e Príncipe|São Tomé|1975|3
    Timor-Leste|Díli||3
  `);

  // ------------------------------------------------------------- science
  // Elements: atomic number | symbol | pt | en | group ('' none) | level
  var ELEMENTS = rows(`
    1|H|Hidrogénio|Hydrogen||1
    2|He|Hélio|Helium|noble|1
    3|Li|Lítio|Lithium|alkali|3
    4|Be|Berílio|Beryllium||4
    5|B|Boro|Boron||4
    6|C|Carbono|Carbon||1
    7|N|Azoto|Nitrogen||2
    8|O|Oxigénio|Oxygen||1
    9|F|Flúor|Fluorine|halogen|3
    10|Ne|Néon|Neon|noble|2
    11|Na|Sódio|Sodium|alkali|2
    12|Mg|Magnésio|Magnesium||3
    13|Al|Alumínio|Aluminium||2
    14|Si|Silício|Silicon||3
    15|P|Fósforo|Phosphorus||3
    16|S|Enxofre|Sulfur||3
    17|Cl|Cloro|Chlorine|halogen|2
    18|Ar|Árgon|Argon|noble|3
    19|K|Potássio|Potassium|alkali|2
    20|Ca|Cálcio|Calcium||2
    21|Sc|Escândio|Scandium||4
    22|Ti|Titânio|Titanium||3
    23|V|Vanádio|Vanadium||4
    24|Cr|Crómio|Chromium||4
    25|Mn|Manganês|Manganese||4
    26|Fe|Ferro|Iron||1
    27|Co|Cobalto|Cobalt||4
    28|Ni|Níquel|Nickel||3
    29|Cu|Cobre|Copper||2
    30|Zn|Zinco|Zinc||3
    31|Ga|Gálio|Gallium||4
    32|Ge|Germânio|Germanium||4
    33|As|Arsénio|Arsenic||4
    34|Se|Selénio|Selenium||4
    35|Br|Bromo|Bromine|halogen|4
    36|Kr|Crípton|Krypton|noble|4
    37|Rb|Rubídio|Rubidium|alkali|4
    38|Sr|Estrôncio|Strontium||4
    47|Ag|Prata|Silver||2
    50|Sn|Estanho|Tin||3
    53|I|Iodo|Iodine|halogen|3
    54|Xe|Xénon|Xenon|noble|4
    55|Cs|Césio|Caesium|alkali|4
    56|Ba|Bário|Barium||4
    74|W|Tungsténio|Tungsten||4
    78|Pt|Platina|Platinum||3
    79|Au|Ouro|Gold||1
    80|Hg|Mercúrio|Mercury||2
    82|Pb|Chumbo|Lead||2
    86|Rn|Rádon|Radon|noble|4
    88|Ra|Rádio|Radium||4
    92|U|Urânio|Uranium||3
  `);
  var ELEMENT_GROUPS = {
    noble: { pt: 'um gás nobre', en: 'a noble gas' },
    alkali: { pt: 'um metal alcalino', en: 'an alkali metal' },
    halogen: { pt: 'um halogéneo', en: 'a halogen' }
  };

  // Animals: pt | en | class | level
  var ANIMALS = rows(`
    cão|dog|mammal|1
    gato|cat|mammal|1
    vaca|cow|mammal|1
    cavalo|horse|mammal|1
    baleia|whale|mammal|1
    golfinho|dolphin|mammal|1
    morcego|bat|mammal|2
    ornitorrinco|platypus|mammal|3
    canguru|kangaroo|mammal|1
    elefante|elephant|mammal|1
    leão|lion|mammal|1
    urso|bear|mammal|1
    coelho|rabbit|mammal|1
    foca|seal|mammal|2
    lince-ibérico|Iberian lynx|mammal|2
    ouriço-cacheiro|hedgehog|mammal|2
    toupeira|mole|mammal|2
    hipopótamo|hippopotamus|mammal|2
    girafa|giraffe|mammal|1
    orca|orca|mammal|2
    pinguim|penguin|bird|1
    avestruz|ostrich|bird|1
    águia|eagle|bird|1
    coruja|owl|bird|1
    galinha|chicken|bird|1
    pato|duck|bird|1
    papagaio|parrot|bird|1
    cegonha|stork|bird|2
    gaivota|seagull|bird|1
    pardal|sparrow|bird|1
    flamingo|flamingo|bird|2
    colibri|hummingbird|bird|2
    kiwi|kiwi (bird)|bird|3
    tartaruga|tortoise|reptile|1
    crocodilo|crocodile|reptile|1
    cobra|snake|reptile|1
    lagartixa|wall lizard|reptile|2
    camaleão|chameleon|reptile|2
    iguana|iguana|reptile|2
    jacaré|alligator|reptile|2
    víbora|viper|reptile|2
    sapo|toad|amphibian|2
    rã|frog|amphibian|2
    salamandra|salamander|amphibian|2
    tritão|newt|amphibian|3
    axolote|axolotl|amphibian|3
    tubarão|shark|fish|1
    sardinha|sardine|fish|1
    atum|tuna|fish|1
    salmão|salmon|fish|1
    cavalo-marinho|seahorse|fish|2
    enguia|eel|fish|3
    raia|ray (fish)|fish|3
    bacalhau|cod|fish|1
    peixe-palhaço|clownfish|fish|2
    carpa|carp|fish|2
    formiga|ant|insect|1
    abelha|bee|insect|1
    borboleta|butterfly|insect|1
    joaninha|ladybird|insect|1
    mosca|fly|insect|1
    gafanhoto|grasshopper|insect|2
    libelinha|dragonfly|insect|2
    barata|cockroach|insect|2
    louva-a-deus|praying mantis|insect|2
    aranha|spider|arachnid|2
    escorpião|scorpion|arachnid|2
    carraça|tick|arachnid|3
    polvo|octopus|mollusc|2
    caracol|snail|mollusc|2
    lula|squid|mollusc|2
    mexilhão|mussel|mollusc|3
    amêijoa|clam|mollusc|3
    caranguejo|crab|crustacean|2
    lagosta|lobster|crustacean|2
    camarão|shrimp|crustacean|2
    percebe|goose barnacle|crustacean|4
  `);
  // Class name, and the same with its article ("uma ave", "an insect").
  var ANIMAL_CLASSES = {
    mammal: { pt: 'mamífero', en: 'mammal', apt: 'um mamífero', aen: 'a mammal' },
    bird: { pt: 'ave', en: 'bird', apt: 'uma ave', aen: 'a bird' },
    reptile: { pt: 'réptil', en: 'reptile', apt: 'um réptil', aen: 'a reptile' },
    amphibian: { pt: 'anfíbio', en: 'amphibian', apt: 'um anfíbio', aen: 'an amphibian' },
    fish: { pt: 'peixe', en: 'fish', apt: 'um peixe', aen: 'a fish' },
    insect: { pt: 'inseto', en: 'insect', apt: 'um inseto', aen: 'an insect' },
    arachnid: { pt: 'aracnídeo', en: 'arachnid', apt: 'um aracnídeo', aen: 'an arachnid' },
    mollusc: { pt: 'molusco', en: 'mollusc', apt: 'um molusco', aen: 'a mollusc' },
    crustacean: { pt: 'crustáceo', en: 'crustacean', apt: 'um crustáceo', aen: 'a crustacean' }
  };

  // The body: part (pt) | part (en) | what it does (pt) | (en) | level
  var BODY = rows(`
    coração|heart|bombeia o sangue pelo corpo|pumps blood around the body|1
    pulmões|lungs|fazem as trocas de oxigénio e dióxido de carbono|exchange oxygen and carbon dioxide|1
    estômago|stomach|mistura e digere os alimentos com ácido|mixes and digests food with acid|1
    fígado|liver|produz a bílis|produces bile|2
    rins|kidneys|filtram o sangue e produzem a urina|filter the blood and make urine|2
    cérebro|brain|controla o corpo e o pensamento|controls the body and thinking|1
    intestino delgado|small intestine|absorve os nutrientes dos alimentos|absorbs nutrients from food|2
    intestino grosso|large intestine|absorve a água e forma as fezes|absorbs water and forms faeces|3
    pâncreas|pancreas|produz insulina|produces insulin|3
    bexiga|bladder|guarda a urina|stores urine|2
    traqueia|windpipe (trachea)|leva o ar até aos pulmões|carries air to the lungs|2
    esófago|oesophagus|leva os alimentos da boca ao estômago|carries food from the mouth to the stomach|2
    glóbulos vermelhos|red blood cells|transportam o oxigénio|carry oxygen|2
    glóbulos brancos|white blood cells|defendem o corpo das infeções|defend the body against infections|2
    plaquetas|platelets|ajudam o sangue a coagular|help the blood to clot|3
    pele|skin|é o maior órgão do corpo|is the largest organ of the body|2
    fémur|femur|é o osso mais comprido do corpo|is the longest bone in the body|2
    estribo|stapes (stirrup)|é o osso mais pequeno do corpo, no ouvido|is the smallest bone in the body, in the ear|3
    crânio|skull|protege o cérebro|protects the brain|1
    costelas|ribs|protegem o coração e os pulmões|protect the heart and lungs|1
    rótula|kneecap|protege a articulação do joelho|protects the knee joint|2
    coluna vertebral|spine|protege a medula espinal|protects the spinal cord|2
    diafragma|diaphragm|é o músculo principal da respiração|is the main breathing muscle|3
    córnea|cornea|é a parte transparente da frente do olho|is the clear front part of the eye|3
    tímpano|eardrum|vibra com o som|vibrates with sound|3
  `);

  // Planets in order from the Sun, with size rank (1 = biggest): pt | en | size | rocky (1) or giant (0)
  var PLANETS = rows(`
    Mercúrio|Mercury|8|1
    Vénus|Venus|6|1
    Terra|Earth|5|1
    Marte|Mars|7|1
    Júpiter|Jupiter|1|0
    Saturno|Saturn|2|0
    Úrano|Uranus|3|0
    Neptuno|Neptune|4|0
  `);

  // SI quantities: quantity pt | en | unit (pt) | unit (en) | symbol | level
  var UNITS = rows(`
    comprimento|length|metro|metre|m|1
    massa|mass|quilograma|kilogram|kg|1
    tempo|time|segundo|second|s|1
    força|force|newton|newton|N|2
    energia|energy|joule|joule|J|2
    potência|power|watt|watt|W|2
    pressão|pressure|pascal|pascal|Pa|3
    temperatura (absoluta)|(absolute) temperature|kelvin|kelvin|K|3
    corrente elétrica|electric current|ampere|ampere|A|3
    tensão elétrica|voltage|volt|volt|V|2
    resistência elétrica|electrical resistance|ohm|ohm|Ω|3
    frequência|frequency|hertz|hertz|Hz|3
    carga elétrica|electric charge|coulomb|coulomb|C|4
    quantidade de matéria|amount of substance|mole|mole|mol|4
    intensidade luminosa|luminous intensity|candela|candela|cd|4
  `);

  // Continents and oceans, biggest first: pt | en
  var CONTINENTS = rows(`
    Ásia|Asia
    África|Africa
    América do Norte|North America
    América do Sul|South America
    Antártida|Antarctica
    Europa|Europe
    Oceânia|Oceania
  `);
  var OCEANS = rows(`
    Pacífico|Pacific
    Atlântico|Atlantic
    Índico|Indian
    Antártico|Southern
    Ártico|Arctic
  `);

  // Discoveries and inventions: year | who (pt) | who (en) | what pt | what en | level
  var DISCOVERIES = rows(`
    1687|Isaac Newton|Isaac Newton|publicou a lei da gravitação universal|published the law of universal gravitation|3
    1859|Charles Darwin|Charles Darwin|publicou A Origem das Espécies|published On the Origin of Species|3
    1876|Alexander Graham Bell|Alexander Graham Bell|patenteou o telefone|patented the telephone|2
    1879|Thomas Edison|Thomas Edison|criou uma lâmpada elétrica prática|made a practical electric light bulb|2
    1895|Wilhelm Röntgen|Wilhelm Röntgen|descobriu os raios X|discovered X-rays|3
    1898|Marie Curie|Marie Curie|descobriu o rádio e o polónio|discovered radium and polonium|3
    1903|os irmãos Wright|the Wright brothers|fizeram o primeiro voo de avião a motor|made the first powered aeroplane flight|2
    1905|Albert Einstein|Albert Einstein|publicou a teoria da relatividade restrita|published the theory of special relativity|3
    1928|Alexander Fleming|Alexander Fleming|descobriu a penicilina|discovered penicillin|2
    1953|Watson e Crick|Watson and Crick|descreveram a dupla hélice do ADN|described the double helix of DNA|4
    1957|a União Soviética|the Soviet Union|lançou o Sputnik, o primeiro satélite artificial|launched Sputnik, the first artificial satellite|3
    1961|Yuri Gagarin|Yuri Gagarin|foi o primeiro ser humano no espaço|became the first human in space|2
    1969|Neil Armstrong|Neil Armstrong|foi o primeiro a pisar a Lua|became the first person to walk on the Moon|1
    1885|Louis Pasteur|Louis Pasteur|testou a vacina contra a raiva|tested the rabies vaccine|3
    1610|Galileu Galilei|Galileo Galilei|observou as luas de Júpiter com um telescópio|observed Jupiter's moons through a telescope|3
    1543|Nicolau Copérnico|Nicolaus Copernicus|publicou que a Terra gira à volta do Sol|published that the Earth goes around the Sun|3
    1869|Dmitri Mendeleev|Dmitri Mendeleev|organizou a primeira tabela periódica|organised the first periodic table|3
    1990|a NASA|NASA|lançou o telescópio espacial Hubble|launched the Hubble Space Telescope|3
  `);

  // ---------------------------------------------------------- portuguese
  // Regular verbs, by ending.
  var VERBS_AR = 'falar cantar andar estudar trabalhar morar nadar jantar gostar lavar levar olhar ajudar chamar comprar cozinhar desenhar escutar esperar gritar saltar pintar viajar visitar mandar tomar usar entrar tirar guardar ganhar acabar acordar deitar mostrar perguntar pensar preparar procurar sonhar voltar saltitar'.split(' ');
  var VERBS_ER = 'aprender beber comer correr escrever vender viver responder receber meter bater entender depender esconder varrer sofrer'.split(' ');
  var VERBS_IR = 'partir abrir assistir decidir dividir discutir existir garantir imprimir insistir permitir resistir unir cumprir'.split(' ');
  // Irregular verbs: infinitive | present (eu, tu, ele, nós, eles) | preterite (same order)
  var VERBS_IRREGULAR = rows(`
    ser|sou,és,é,somos,são|fui,foste,foi,fomos,foram
    estar|estou,estás,está,estamos,estão|estive,estiveste,esteve,estivemos,estiveram
    ter|tenho,tens,tem,temos,têm|tive,tiveste,teve,tivemos,tiveram
    ir|vou,vais,vai,vamos,vão|fui,foste,foi,fomos,foram
    fazer|faço,fazes,faz,fazemos,fazem|fiz,fizeste,fez,fizemos,fizeram
    dizer|digo,dizes,diz,dizemos,dizem|disse,disseste,disse,dissemos,disseram
    poder|posso,podes,pode,podemos,podem|pude,pudeste,pôde,pudemos,puderam
    querer|quero,queres,quer,queremos,querem|quis,quiseste,quis,quisemos,quiseram
    ver|vejo,vês,vê,vemos,veem|vi,viste,viu,vimos,viram
    vir|venho,vens,vem,vimos,vêm|vim,vieste,veio,viemos,vieram
    dar|dou,dás,dá,damos,dão|dei,deste,deu,demos,deram
    saber|sei,sabes,sabe,sabemos,sabem|soube,soubeste,soube,soubemos,souberam
    pôr|ponho,pões,põe,pomos,põem|pus,puseste,pôs,pusemos,puseram
    trazer|trago,trazes,traz,trazemos,trazem|trouxe,trouxeste,trouxe,trouxemos,trouxeram
    ler|leio,lês,lê,lemos,leem|li,leste,leu,lemos,leram
    ouvir|ouço,ouves,ouve,ouvimos,ouvem|ouvi,ouviste,ouviu,ouvimos,ouviram
    pedir|peço,pedes,pede,pedimos,pedem|pedi,pediste,pediu,pedimos,pediram
    dormir|durmo,dormes,dorme,dormimos,dormem|dormi,dormiste,dormiu,dormimos,dormiram
    sair|saio,sais,sai,saímos,saem|saí,saíste,saiu,saímos,saíram
  `);

  // Plurals: singular | plural
  var PLURALS = rows(`
    avião|aviões
    botão|botões
    coração|corações
    limão|limões
    leão|leões
    balão|balões
    camião|camiões
    canção|canções
    lição|lições
    estação|estações
    melão|melões
    televisão|televisões
    ladrão|ladrões
    portão|portões
    cartão|cartões
    pulmão|pulmões
    feijão|feijões
    pão|pães
    cão|cães
    alemão|alemães
    capitão|capitães
    escrivão|escrivães
    mão|mãos
    irmão|irmãos
    cidadão|cidadãos
    cristão|cristãos
    órgão|órgãos
    órfão|órfãos
    grão|grãos
    chão|chãos
    sótão|sótãos
    animal|animais
    jornal|jornais
    canal|canais
    hospital|hospitais
    sinal|sinais
    quintal|quintais
    postal|postais
    pardal|pardais
    metal|metais
    papel|papéis
    anel|anéis
    pastel|pastéis
    hotel|hotéis
    painel|painéis
    túnel|túneis
    móvel|móveis
    nível|níveis
    automóvel|automóveis
    farol|faróis
    lençol|lençóis
    caracol|caracóis
    girassol|girassóis
    anzol|anzóis
    espanhol|espanhóis
    barril|barris
    funil|funis
    réptil|répteis
    fóssil|fósseis
    fácil|fáceis
    útil|úteis
    difícil|difíceis
    azul|azuis
    flor|flores
    mar|mares
    colher|colheres
    mulher|mulheres
    motor|motores
    professor|professores
    luz|luzes
    nariz|narizes
    rapaz|rapazes
    cruz|cruzes
    voz|vozes
    vez|vezes
    país|países
    mês|meses
    inglês|ingleses
    português|portugueses
    gás|gases
    lápis|lápis
    pires|pires
    vírus|vírus
    tórax|tórax
    cais|cais
    atlas|atlas
    jardim|jardins
    homem|homens
    nuvem|nuvens
    viagem|viagens
    som|sons
    atum|atuns
    bombom|bombons
    chapéu|chapéus
    troféu|troféus
    céu|céus
    guarda-chuva|guarda-chuvas
    couve-flor|couves-flores
    arco-íris|arco-íris
    beija-flor|beija-flores
    segunda-feira|segundas-feiras
    cachorro-quente|cachorros-quentes
    obra-prima|obras-primas
  `);

  // Masculine | feminine
  var FEMININES = rows(`
    ator|atriz
    cão|cadela
    cavalo|égua
    boi|vaca
    galo|galinha
    carneiro|ovelha
    bode|cabra
    rei|rainha
    príncipe|princesa
    imperador|imperatriz
    herói|heroína
    poeta|poetisa
    padrinho|madrinha
    genro|nora
    padrasto|madrasta
    homem|mulher
    pai|mãe
    irmão|irmã
    avô|avó
    frade|freira
    leão|leoa
    ladrão|ladra
    alemão|alemã
    cidadão|cidadã
    campeão|campeã
    patrão|patroa
    conde|condessa
    duque|duquesa
    barão|baronesa
    sacerdote|sacerdotisa
    juiz|juíza
    freguês|freguesa
    rapaz|rapariga
    cavalheiro|dama
    czar|czarina
    tigre|tigresa
    pavão|pavoa
    porco|porca
    lobo|loba
    doutor|doutora
    deus|deusa
    abade|abadessa
    sultão|sultana
    cantor|cantora
    autor|autora
    compadre|comadre
  `);

  // Collective noun | what it groups (pt) | (en)
  var COLLECTIVES = rows(`
    cardume|peixes|fish
    alcateia|lobos|wolves
    enxame|abelhas|bees
    rebanho|ovelhas|sheep
    matilha|cães|dogs
    bando|aves|birds
    arquipélago|ilhas|islands
    constelação|estrelas|stars
    biblioteca|livros|books
    cordilheira|montanhas|mountains
    frota|navios|ships
    esquadrilha|aviões|aeroplanes
    multidão|pessoas|people
    orquestra|músicos|musicians
    exército|soldados|soldiers
    turma|alunos|pupils
    vara|porcos|pigs
    pinhal|pinheiros|pine trees
    olival|oliveiras|olive trees
    laranjal|laranjeiras|orange trees
    pomar|árvores de fruto|fruit trees
    ramalhete|flores|flowers
    molho|chaves|keys
    réstia|cebolas ou alhos|onions or garlic
    resma|folhas de papel|sheets of paper
    vocabulário|palavras|words
    álbum|fotografias|photographs
    cáfila|camelos|camels
    atlas|mapas|maps
    elenco|atores|actors
    coro|cantores|singers
    ninhada|crias nascidas juntas|young born together
    girândola|foguetes|fireworks
    fauna|animais de uma região|animals of a region
    flora|plantas de uma região|plants of a region
    manada|bois ou elefantes|cattle or elephants
    tripulação|tripulantes|crew members
  `);

  // Synonym groups (words in a group mean the same)
  var SYNONYMS = rows(`
    feliz|contente|alegre
    começar|iniciar|principiar
    acabar|terminar|concluir
    bonito|belo|lindo
    rápido|veloz|ligeiro
    lento|vagaroso
    casa|lar|moradia
    carro|automóvel|viatura
    olhar|observar|fitar
    andar|caminhar
    construir|edificar|erguer
    destruir|demolir|arrasar
    medo|receio|pavor
    coragem|bravura|valentia
    esperto|inteligente|perspicaz
    tolo|parvo|tonto
    cansado|exausto|fatigado
    calmo|sereno|tranquilo
    zangado|irritado|furioso
    grande|enorme|gigante
    rico|abastado
    difícil|complicado|árduo
    limpo|asseado
    sujo|imundo
    escuro|sombrio
    cheio|repleto
    forte|robusto
    fraco|débil
    pedir|solicitar|rogar
    oferecer|presentear
    esconder|ocultar
    mostrar|exibir
    lembrar|recordar
    acreditar|crer
    desejar|ansiar
    morrer|falecer
    perigo|risco
    erro|engano|falha
    ajuda|auxílio|apoio
    caminho|trilho|via
    rosto|cara|face
    barriga|ventre
    aluno|estudante
    professor|docente
    trabalho|emprego|ofício
    presente|oferta|prenda
    fim|término|final
    início|começo|princípio
    nunca|jamais
    talvez|porventura
  `);

  // Antonym pairs (each word appears once)
  var ANTONYMS = rows(`
    alto|baixo
    rápido|lento
    alegre|triste
    grande|pequeno
    quente|frio
    claro|escuro
    cheio|vazio
    novo|velho
    forte|fraco
    rico|pobre
    fácil|difícil
    aberto|fechado
    limpo|sujo
    longe|perto
    cedo|tarde
    gordo|magro
    subir|descer
    entrar|sair
    ganhar|perder
    comprar|vender
    acender|apagar
    dia|noite
    verdade|mentira
    início|fim
    doce|amargo
    duro|mole
    molhado|seco
    largo|estreito
    pesado|leve
    corajoso|medroso
    bom|mau
    bem|mal
    muito|pouco
    tudo|nada
    sempre|nunca
    antes|depois
    dentro|fora
    frente|trás
    esquerda|direita
    norte|sul
    amor|ódio
    paz|guerra
    vida|morte
    curto|comprido
    grosso|fino
    liso|rugoso
    barato|caro
    primeiro|último
    presente|ausente
    possível|impossível
    legal|ilegal
    agradável|desagradável
    útil|inútil
    visível|invisível
    igual|diferente
    verdadeiro|falso
    certo|errado
    mais|menos
    maior|menor
    melhor|pior
    ontem|amanhã
    chegar|partir
    lembrar|esquecer
    aceitar|recusar
    amar|odiar
    abrir|fechar
    ligar|desligar
    nascer|morrer
    rir|chorar
    perguntar|responder
    empurrar|puxar
    encher|esvaziar
    atacar|defender
    aumentar|diminuir
    aparecer|desaparecer
    ensinar|aprender
    dar|receber
    vestir|despir
    construir|destruir
    mostrar|esconder
    juntar|separar
    cru|cozido
    acordado|adormecido
    vencedor|vencido
    entrada|saída
    pergunta|resposta
  `);

  // Word classes: word | class (noun, verb, adj, adv)
  var WORD_CLASSES = rows(`
    mesa|noun
    cadeira|noun
    livro|noun
    cidade|noun
    amizade|noun
    felicidade|noun
    árvore|noun
    computador|noun
    janela|noun
    escola|noun
    montanha|noun
    liberdade|noun
    coragem|noun
    professor|noun
    girafa|noun
    oceano|noun
    bicicleta|noun
    chocolate|noun
    música|noun
    viagem|noun
    correr|verb
    saltar|verb
    escrever|verb
    pensar|verb
    dormir|verb
    construir|verb
    nadar|verb
    aprender|verb
    descobrir|verb
    sorrir|verb
    partilhar|verb
    imaginar|verb
    cozinhar|verb
    viajar|verb
    ouvir|verb
    desenhar|verb
    proteger|verb
    explicar|verb
    responder|verb
    crescer|verb
    bonito|adj
    rápido|adj
    feliz|adj
    enorme|adj
    corajoso|adj
    inteligente|adj
    simpático|adj
    delicioso|adj
    estreito|adj
    barulhento|adj
    silencioso|adj
    cansado|adj
    generoso|adj
    redondo|adj
    perigoso|adj
    macio|adj
    curioso|adj
    rapidamente|adv
    devagar|adv
    ontem|adv
    hoje|adv
    amanhã|adv
    sempre|adv
    nunca|adv
    aqui|adv
    ali|adv
    longe|adv
    perto|adv
    felizmente|adv
    calmamente|adv
    talvez|adv
    cedo|adv
    sim|adv
    não|adv
  `);
  var WORD_CLASS_NAMES = {
    noun: { pt: 'nome (substantivo)', en: 'noun', aen: 'a noun' },
    verb: { pt: 'verbo', en: 'verb', aen: 'a verb' },
    adj: { pt: 'adjetivo', en: 'adjective', aen: 'an adjective' },
    adv: { pt: 'advérbio', en: 'adverb', aen: 'an adverb' }
  };

  // Spelling: correct | wrong | wrong | wrong | level
  var SPELLING = rows(`
    cabeleireiro|cabelereiro|cabeleleiro|cabeleiriro|3
    sobrancelha|sombrancelha|sobrançelha|sobranselha|2
    privilégio|previlégio|priviléjio|privilegiu|3
    esquisito|esquesito|esquizito|isquisito|3
    cebola|sebola|cebolla|cébola|1
    açúcar|assúcar|açucar|açúcare|2
    mexer|mecher|mexê|mechêr|2
    enxada|enchada|inxada|enxáda|2
    hesitar|exitar|hezitar|esitar|3
    quase|quasi|cuase|quaze|1
    através|atravez|atráves|atravéz|2
    paralisar|paralizar|parelisar|paralisár|3
    analisar|analizar|analissar|ánalisar|3
    pesquisa|pesquiza|pesquissa|pesquisá|2
    surpresa|surpreza|surpressa|surprêsa|2
    beleza|belesa|beleça|belleza|1
    certeza|certesa|serteza|certeça|1
    cozinha|cosinha|cozinia|cuzinha|1
    vizinho|visinho|vizinhu|vezinho|1
    rapidez|rapidês|rapides|rapidéz|2
    ascensão|assensão|acensão|ascenção|4
    discussão|discução|discusão|discursão|3
    pretensão|pretenção|pertensão|pretenssão|4
    obsessão|obcessão|obseção|obssessão|4
    excesso|exesso|escesso|excessso|3
    nascer|naser|nasser|nacer|2
    crescer|creser|cresser|crecer|2
    piscina|pissina|picina|psicina|1
    disciplina|diciplina|disiplina|dissiplina|2
    consciência|conciência|consiência|conssiência|4
    adolescente|adolecente|adolessente|adolescênte|3
    mortadela|mortandela|mortadella|mortedela|2
    mendigo|mendingo|mendijo|mendigu|2
    asterisco|asterístico|asteristico|asterísco|3
    bicarbonato|bicabornato|bicarbunato|bicarbonáto|3
    problema|poblema|probrema|prublema|1
    próprio|própio|próprivo|proprio|2
    frustrado|frustado|fustrado|frustradu|2
    beneficente|beneficiente|beneficênte|benificente|4
    gorjeta|gorgeta|gurjeta|gorjêta|3
    majestade|magestade|majestáde|magistade|3
    berbequim|berbiquim|brebequim|berbequin|4
    trouxe|trousse|trusse|troxe|2
    chávena|xávena|chavéna|chavêna|2
  `);

  // -------------------------------------------------------------- english
  // Vocabulary: category | pt | en
  var VOCAB = rows(`
    animal|cão|dog
    animal|gato|cat
    animal|cavalo|horse
    animal|pássaro|bird
    animal|peixe|fish
    animal|coelho|rabbit
    animal|urso|bear
    animal|ovelha|sheep
    animal|vaca|cow
    animal|porco|pig
    animal|galinha|chicken
    animal|rato|mouse
    animal|leão|lion
    animal|tigre|tiger
    animal|elefante|elephant
    animal|macaco|monkey
    animal|cobra|snake
    animal|sapo|frog
    animal|abelha|bee
    animal|borboleta|butterfly
    animal|aranha|spider
    animal|lobo|wolf
    animal|raposa|fox
    animal|pato|duck
    animal|cabra|goat
    animal|tartaruga|turtle
    animal|baleia|whale
    animal|coruja|owl
    animal|girafa|giraffe
    animal|formiga|ant
    food|maçã|apple
    food|pão|bread
    food|leite|milk
    food|queijo|cheese
    food|morango|strawberry
    food|cenoura|carrot
    food|banana|banana
    food|laranja|orange
    food|uva|grape
    food|pera|pear
    food|limão|lemon
    food|ovo|egg
    food|manteiga|butter
    food|arroz|rice
    food|sopa|soup
    food|bolo|cake
    food|batata|potato
    food|tomate|tomato
    food|cebola|onion
    food|carne|meat
    food|frango|chicken (meat)
    food|açúcar|sugar
    food|sal|salt
    food|mel|honey
    food|gelado|ice cream
    food|sumo|juice
    food|bolacha|biscuit
    food|cereja|cherry
    food|melancia|watermelon
    food|ananás|pineapple
    body|mão|hand
    body|cabeça|head
    body|olho|eye
    body|orelha|ear
    body|perna|leg
    body|braço|arm
    body|pé|foot
    body|nariz|nose
    body|boca|mouth
    body|dente|tooth
    body|cabelo|hair
    body|dedo|finger
    body|joelho|knee
    body|ombro|shoulder
    body|pescoço|neck
    body|costas|back
    body|barriga|belly
    body|coração|heart
    body|língua|tongue
    body|lábio|lip
    house|casa|house
    house|mesa|table
    house|cadeira|chair
    house|janela|window
    house|porta|door
    house|cozinha|kitchen
    house|quarto|bedroom
    house|cama|bed
    house|casa de banho|bathroom
    house|sala|living room
    house|telhado|roof
    house|parede|wall
    house|chão|floor
    house|escadas|stairs
    house|jardim|garden
    house|frigorífico|fridge
    house|candeeiro|lamp
    house|espelho|mirror
    house|sofá|sofa
    house|chave|key
    school|escola|school
    school|livro|book
    school|lápis|pencil
    school|caneta|pen
    school|borracha|rubber (eraser)
    school|régua|ruler
    school|mochila|schoolbag
    school|caderno|notebook
    school|quadro|board
    school|professor|teacher
    school|aluno|pupil
    school|tesoura|scissors
    school|cola|glue
    school|recreio|break time
    school|trabalho de casa|homework
    colour|vermelho|red
    colour|azul|blue
    colour|verde|green
    colour|amarelo|yellow
    colour|preto|black
    colour|branco|white
    colour|cor de laranja|orange (colour)
    colour|roxo|purple
    colour|cor-de-rosa|pink
    colour|castanho|brown
    colour|cinzento|grey
    colour|dourado|golden
    family|irmão|brother
    family|irmã|sister
    family|pai|father
    family|mãe|mother
    family|avó|grandmother
    family|avô|grandfather
    family|tio|uncle
    family|tia|aunt
    family|primo|cousin
    family|filho|son
    family|filha|daughter
    family|neto|grandson
    family|marido|husband
    family|mulher (esposa)|wife
    family|bebé|baby
    clothes|sapato|shoe
    clothes|camisola|jumper
    clothes|calças|trousers
    clothes|saia|skirt
    clothes|vestido|dress
    clothes|chapéu|hat
    clothes|casaco|coat
    clothes|meias|socks
    clothes|luvas|gloves
    clothes|cachecol|scarf
    clothes|camisa|shirt
    clothes|botas|boots
    clothes|cinto|belt
    clothes|pijama|pyjamas
    weather|chuva|rain
    weather|neve|snow
    weather|vento|wind
    weather|sol|sun
    weather|nuvem|cloud
    weather|trovoada|thunderstorm
    weather|relâmpago|lightning
    weather|nevoeiro|fog
    weather|arco-íris|rainbow
    weather|granizo|hail
    time|segunda-feira|Monday
    time|terça-feira|Tuesday
    time|quarta-feira|Wednesday
    time|quinta-feira|Thursday
    time|sexta-feira|Friday
    time|sábado|Saturday
    time|domingo|Sunday
    time|janeiro|January
    time|fevereiro|February
    time|março|March
    time|abril|April
    time|maio|May
    time|junho|June
    time|julho|July
    time|agosto|August
    time|setembro|September
    time|outubro|October
    time|novembro|November
    time|dezembro|December
    time|inverno|winter
    time|verão|summer
    time|outono|autumn
    time|primavera|spring
    time|manhã|morning
    time|tarde|afternoon
    time|noite|night
    time|ontem|yesterday
    time|amanhã|tomorrow
    time|semana|week
    time|mês|month
    time|ano|year
    place|ponte|bridge
    place|castelo|castle
    place|montanha|mountain
    place|rio|river
    place|praia|beach
    place|floresta|forest
    place|cidade|city
    place|aldeia|village
    place|hospital|hospital
    place|biblioteca|library
    place|museu|museum
    place|igreja|church
    place|parque|park
    place|loja|shop
    place|mercado|market
    place|estação|station
    place|aeroporto|airport
    place|ilha|island
    place|lago|lake
    place|rua|street
    transport|carro|car
    transport|comboio|train
    transport|navio|ship
    transport|avião|aeroplane
    transport|autocarro|bus
    transport|bicicleta|bicycle
    transport|barco|boat
    transport|mota|motorbike
    transport|camião|lorry
    transport|helicóptero|helicopter
    job|médico|doctor
    job|enfermeiro|nurse
    job|bombeiro|firefighter
    job|polícia|police officer
    job|cozinheiro|chef
    job|agricultor|farmer
    job|carteiro|postman
    job|cantor|singer
    job|piloto|pilot
    job|dentista|dentist
    job|padeiro|baker
    job|pescador|fisherman
    job|veterinário|vet
    job|juiz|judge
    job|jornalista|journalist
    verb|correr|run
    verb|saltar|jump
    verb|nadar|swim
    verb|comer|eat
    verb|beber|drink
    verb|dormir|sleep
    verb|ler|read
    verb|escrever|write
    verb|cantar|sing
    verb|dançar|dance
    verb|brincar|play
    verb|ouvir|hear
    verb|ver|see
    verb|falar|speak
    verb|andar|walk
    verb|abrir|open
    verb|fechar|close
    verb|comprar|buy
    verb|vender|sell
    verb|ajudar|help
    verb|aprender|learn
    verb|ensinar|teach
    verb|cozinhar|cook
    verb|lavar|wash
    verb|chorar|cry
    verb|rir|laugh
    verb|pensar|think
    verb|esperar|wait
    verb|voar|fly
    verb|conduzir|drive
    adj|feliz|happy
    adj|triste|sad
    adj|grande|big
    adj|pequeno|small
    adj|rápido|fast
    adj|lento|slow
    adj|quente|hot
    adj|frio|cold
    adj|alto|tall
    adj|baixo|short
    adj|novo|new
    adj|velho|old
    adj|bonito|beautiful
    adj|feio|ugly
    adj|forte|strong
    adj|fraco|weak
    adj|cansado|tired
    adj|zangado|angry
    adj|limpo|clean
    adj|sujo|dirty
    adj|cheio|full
    adj|vazio|empty
    adj|barato|cheap
    adj|caro|expensive
    adj|fácil|easy
    adj|difícil|difficult
    adj|engraçado|funny
    adj|assustado|scared
    adj|com fome|hungry
    adj|simpático|friendly
  `);
  var VOCAB_CATEGORIES = {
    animal: { pt: 'um animal', en: 'an animal' },
    food: { pt: 'comida ou bebida', en: 'food or drink' },
    body: { pt: 'uma parte do corpo', en: 'a part of the body' },
    house: { pt: 'algo da casa', en: 'something in a house' },
    school: { pt: 'algo da escola', en: 'something at school' },
    colour: { pt: 'uma cor', en: 'a colour' },
    family: { pt: 'um membro da família', en: 'a family member' },
    clothes: { pt: 'uma peça de roupa', en: 'something you wear' },
    weather: { pt: 'um fenómeno meteorológico', en: 'a kind of weather' },
    place: { pt: 'um lugar', en: 'a place' },
    transport: { pt: 'um meio de transporte', en: 'a means of transport' },
    job: { pt: 'uma profissão', en: 'a job' }
  };

  // Irregular verbs: base | past | past participle | pt meaning ('' when shared)
  var IRREGULAR = rows(`
    begin|began|begun|começar
    break|broke|broken|partir
    bring|brought|brought|trazer
    build|built|built|construir
    buy|bought|bought|comprar
    catch|caught|caught|apanhar
    choose|chose|chosen|escolher
    come|came|come|vir
    cost|cost|cost|custar
    cut|cut|cut|cortar
    do|did|done|
    draw|drew|drawn|desenhar
    drink|drank|drunk|beber
    drive|drove|driven|conduzir
    eat|ate|eaten|comer
    fall|fell|fallen|cair
    feel|felt|felt|sentir
    fight|fought|fought|lutar
    find|found|found|encontrar
    fly|flew|flown|voar
    forget|forgot|forgotten|esquecer
    give|gave|given|dar
    go|went|gone|ir
    grow|grew|grown|crescer
    have|had|had|ter
    hear|heard|heard|ouvir
    hide|hid|hidden|esconder
    hit|hit|hit|bater
    hold|held|held|segurar
    hurt|hurt|hurt|magoar
    keep|kept|kept|guardar
    know|knew|known|saber
    leave|left|left|sair
    lend|lent|lent|emprestar
    let|let|let|permitir
    lose|lost|lost|perder
    make|made|made|
    meet|met|met|conhecer (alguém)
    pay|paid|paid|pagar
    put|put|put|pôr
    read|read|read|ler
    ride|rode|ridden|andar (de bicicleta ou a cavalo)
    ring|rang|rung|tocar (a campainha)
    run|ran|run|correr
    say|said|said|dizer
    see|saw|seen|ver
    sell|sold|sold|vender
    send|sent|sent|enviar
    shine|shone|shone|brilhar
    shoot|shot|shot|disparar
    show|showed|shown|mostrar
    shut|shut|shut|fechar
    sing|sang|sung|cantar
    sink|sank|sunk|afundar
    sit|sat|sat|sentar-se
    sleep|slept|slept|dormir
    speak|spoke|spoken|falar
    spend|spent|spent|gastar
    stand|stood|stood|estar de pé
    steal|stole|stolen|roubar
    swim|swam|swum|nadar
    take|took|taken|levar
    teach|taught|taught|ensinar
    tear|tore|torn|rasgar
    tell|told|told|contar
    think|thought|thought|pensar
    throw|threw|thrown|atirar
    understand|understood|understood|compreender
    wake|woke|woken|acordar
    wear|wore|worn|vestir
    win|won|won|ganhar
    write|wrote|written|escrever
    blow|blew|blown|soprar
    bite|bit|bitten|morder
    bend|bent|bent|dobrar
    feed|fed|fed|alimentar
    forgive|forgave|forgiven|perdoar
    freeze|froze|frozen|congelar
    lead|led|led|liderar
    light|lit|lit|acender
    mean|meant|meant|significar
    rise|rose|risen|erguer-se
    seek|sought|sought|procurar
    shake|shook|shaken|abanar
    spin|spun|spun|girar
    strike|struck|struck|atingir
    sweep|swept|swept|varrer
    swing|swung|swung|baloiçar
    dig|dug|dug|cavar
  `);

  // English opposites
  var EN_OPPOSITES = rows(`
    hot|cold
    big|small
    happy|sad
    fast|slow
    tall|short
    old|young
    open|closed
    full|empty
    clean|dirty
    rich|poor
    strong|weak
    light|dark
    early|late
    easy|difficult
    hard|soft
    wet|dry
    thick|thin
    cheap|expensive
    loud|quiet
    near|far
    first|last
    true|false
    right|wrong
    up|down
    in|out
    push|pull
    buy|sell
    win|lose
    give|take
    always|never
    before|after
    day|night
    question|answer
    love|hate
    remember|forget
    arrive|leave
    alive|dead
    safe|dangerous
    awake|asleep
    friend|enemy
    inside|outside
    north|south
    east|west
    above|below
    sweet|sour
    wide|narrow
    deep|shallow
    smooth|rough
    brave|cowardly
    polite|rude
    tidy|messy
    noisy|silent
    sharp|blunt
    begin|end
    laugh|cry
    accept|refuse
    increase|decrease
    borrow|lend
  `);

  // Related words: a wrong answer is never taken from the same cluster as the
  // question, so no option is "also right".
  var ANTONYM_CLUSTERS = [
    'grande pequeno maior menor alto baixo curto comprido largo estreito grosso fino gordo magro pesado leve cheio vazio',
    'bom mau bem mal melhor pior certo errado verdadeiro falso verdade mentira',
    'muito pouco mais menos tudo nada',
    'cedo tarde antes depois sempre nunca ontem amanhã dia noite início fim primeiro último',
    'alegre triste corajoso medroso amar odiar amor ódio rir chorar',
    'vida morte nascer morrer vencedor vencido ganhar perder',
    'subir descer entrar sair chegar partir entrada saída dentro fora',
    'aberto fechado abrir fechar ligar desligar acender apagar',
    'dar receber comprar vender aceitar recusar',
    'claro escuro visível invisível aparecer desaparecer mostrar esconder',
    'rápido lento'
  ].map(function (c) { return c.split(' '); });
  var EN_OPPOSITE_CLUSTERS = [
    'big small tall short thick thin wide narrow deep shallow full empty',
    'early late before after always never first last day night begin end',
    'easy difficult hard soft smooth rough',
    'loud quiet noisy silent',
    'true false right wrong',
    'up down above below in out inside outside north south east west',
    'happy sad laugh cry love hate friend enemy',
    'buy sell give take win lose borrow lend accept refuse',
    'open closed',
    'arrive leave',
    'alive dead safe dangerous'
  ].map(function (c) { return c.split(' '); });

  // English irregular and tricky plurals: singular | plural
  var EN_PLURALS = rows(`
    child|children
    man|men
    woman|women
    foot|feet
    tooth|teeth
    mouse|mice
    goose|geese
    sheep|sheep
    deer|deer
    ox|oxen
    knife|knives
    wife|wives
    leaf|leaves
    wolf|wolves
    half|halves
    life|lives
    loaf|loaves
    potato|potatoes
    tomato|tomatoes
    hero|heroes
    box|boxes
    bus|buses
    city|cities
    baby|babies
    lady|ladies
    party|parties
    church|churches
    watch|watches
    dish|dishes
    glass|glasses
    key|keys
    toy|toys
    day|days
    roof|roofs
    photo|photos
    piano|pianos
    zoo|zoos
    crisis|crises
    fox|foxes
    shelf|shelves
    thief|thieves
  `);

  // Adjective | comparative | superlative
  var EN_COMPARE = rows(`
    big|bigger|biggest
    good|better|best
    bad|worse|worst
    happy|happier|happiest
    easy|easier|easiest
    hot|hotter|hottest
    thin|thinner|thinnest
    sad|sadder|saddest
    wet|wetter|wettest
    large|larger|largest
    nice|nicer|nicest
    safe|safer|safest
    tall|taller|tallest
    small|smaller|smallest
    short|shorter|shortest
    long|longer|longest
    old|older|oldest
    young|younger|youngest
    fast|faster|fastest
    slow|slower|slowest
    cold|colder|coldest
    warm|warmer|warmest
    strong|stronger|strongest
    rich|richer|richest
    clean|cleaner|cleanest
    high|higher|highest
    kind|kinder|kindest
    busy|busier|busiest
    funny|funnier|funniest
    heavy|heavier|heaviest
    early|earlier|earliest
    pretty|prettier|prettiest
    dirty|dirtier|dirtiest
    wide|wider|widest
    brave|braver|bravest
    simple|simpler|simplest
    beautiful|more beautiful|most beautiful
    expensive|more expensive|most expensive
    interesting|more interesting|most interesting
    important|more important|most important
    difficult|more difficult|most difficult
    comfortable|more comfortable|most comfortable
    careful|more careful|most careful
    famous|more famous|most famous
    dangerous|more dangerous|most dangerous
    delicious|more delicious|most delicious
  `);

  // ============================================= genius: physics, chemistry
  // Compounds: name pt | name en | formula (with subscripts) | composition (El:count,…)
  var COMPOUNDS = rows(`
    água|water|H₂O|H:2,O:1
    dióxido de carbono|carbon dioxide|CO₂|C:1,O:2
    monóxido de carbono|carbon monoxide|CO|C:1,O:1
    cloreto de sódio (sal de cozinha)|sodium chloride (table salt)|NaCl|Na:1,Cl:1
    metano|methane|CH₄|C:1,H:4
    amoníaco|ammonia|NH₃|N:1,H:3
    ozono|ozone|O₃|O:3
    ácido sulfúrico|sulfuric acid|H₂SO₄|H:2,S:1,O:4
    ácido clorídrico|hydrochloric acid|HCl|H:1,Cl:1
    hidróxido de sódio|sodium hydroxide|NaOH|Na:1,O:1,H:1
    glicose|glucose|C₆H₁₂O₆|C:6,H:12,O:6
    carbonato de cálcio|calcium carbonate|CaCO₃|Ca:1,C:1,O:3
    peróxido de hidrogénio (água oxigenada)|hydrogen peroxide|H₂O₂|H:2,O:2
    dióxido de enxofre|sulfur dioxide|SO₂|S:1,O:2
    ácido nítrico|nitric acid|HNO₃|H:1,N:1,O:3
    bicarbonato de sódio|sodium bicarbonate|NaHCO₃|Na:1,H:1,C:1,O:3
    óxido de ferro(III) (ferrugem)|iron(III) oxide (rust)|Fe₂O₃|Fe:2,O:3
    etanol|ethanol|C₂H₆O|C:2,H:6,O:1
    oxigénio (molécula)|oxygen (molecule)|O₂|O:2
    azoto (molécula)|nitrogen (molecule)|N₂|N:2
    óxido de cálcio (cal viva)|calcium oxide (quicklime)|CaO|Ca:1,O:1
    sulfato de cobre(II)|copper(II) sulfate|CuSO₄|Cu:1,S:1,O:4
  `);
  // Rounded molar masses used in school (g/mol)
  var ATOMIC_MASS = { H: 1, C: 12, N: 14, O: 16, Na: 23, S: 32, Cl: 35.5, Ca: 40, Fe: 56, Cu: 63.5 };

  // Isotopes: symbol | mass number (Z comes from ELEMENTS)
  var ISOTOPES = rows(`
    H|1
    H|2
    He|4
    C|12
    C|14
    N|14
    O|16
    O|18
    Na|23
    Mg|24
    Al|27
    Cl|35
    Cl|37
    K|39
    Ca|40
    Fe|56
    Cu|63
    Ag|107
    Au|197
    Pb|208
    U|235
    U|238
  `);
  // Ions: symbol | charge
  var IONS = rows(`
    Na|1
    K|1
    Li|1
    Mg|2
    Ca|2
    Al|3
    F|-1
    Cl|-1
    Br|-1
    O|-2
    S|-2
  `);

  // Everyday substances: pt | en | acid / neutral / base
  var PH_SUBSTANCES = rows(`
    sumo de limão|lemon juice|acid
    vinagre|vinegar|acid
    suco gástrico|stomach acid|acid
    refrigerante de cola|cola drink|acid
    café|coffee|acid
    água pura|pure water|neutral
    lixívia|bleach|base
    sabão|soap|base
    amoníaco de limpeza|household ammonia|base
    solução de bicarbonato de sódio|baking soda solution|base
    pasta de dentes|toothpaste|base
    desentupidor de canos|drain cleaner|base
  `);
  var PH_NAMES = {
    acid: { pt: 'ácida', en: 'acidic', apt: 'ácida', aen: 'acidic' },
    neutral: { pt: 'neutra', en: 'neutral', apt: 'neutra', aen: 'neutral' },
    base: { pt: 'básica (alcalina)', en: 'basic (alkaline)', apt: 'básica', aen: 'basic' }
  };

  // Changes: pt | en | physical or chemical
  var CHANGES = rows(`
    a água a ferver|water boiling|physical
    o gelo a derreter|ice melting|physical
    o açúcar a dissolver-se na água|sugar dissolving in water|physical
    um copo a partir-se|a glass breaking|physical
    a água do mar a evaporar|seawater evaporating|physical
    o chocolate a derreter|chocolate melting|physical
    o vapor a condensar no vidro|steam condensing on glass|physical
    a manteiga a derreter|butter melting|physical
    um papel a ser rasgado|paper being torn|physical
    o papel a arder|paper burning|chemical
    o ferro a enferrujar|iron rusting|chemical
    um ovo a cozer|an egg cooking|chemical
    a fruta a apodrecer|fruit rotting|chemical
    o leite a azedar|milk going sour|chemical
    o fogo de artifício a explodir|fireworks exploding|chemical
    a fotossíntese nas folhas|photosynthesis in leaves|chemical
    a digestão dos alimentos|digesting food|chemical
    a massa do pão a levedar|bread dough rising|chemical
  `);

  // Separation techniques: mixture pt | mixture en | technique pt | technique en
  var SEPARATION = rows(`
    areia e água|sand and water|filtração|filtration
    sal dissolvido em água (para obter o sal)|salt dissolved in water (to get the salt)|evaporação|evaporation
    água e álcool|water and alcohol|destilação fracionada|fractional distillation
    limalha de ferro e areia|iron filings and sand|separação magnética|magnetic separation
    azeite e água|olive oil and water|funil de decantação|separating funnel
    os pigmentos da tinta de uma caneta|the pigments in pen ink|cromatografia|chromatography
  `);

  // Conductors and insulators: pt | en | conductor (1) or insulator (0)
  var CONDUCTORS = rows(`
    cobre|copper|1
    alumínio|aluminium|1
    ferro|iron|1
    prata|silver|1
    ouro|gold|1
    grafite|graphite|1
    água salgada|salt water|1
    plástico|plastic|0
    borracha|rubber|0
    vidro|glass|0
    madeira seca|dry wood|0
    cerâmica|ceramic|0
    papel|paper|0
    ar seco|dry air|0
  `);

  // Physics facts: question pt | question en | right pt~en | wrong pt~en ×3
  var PHYSICS_FACTS = rows(`
    Qual é aproximadamente a velocidade da luz no vazio?|What is the approximate speed of light in a vacuum?|300 000 km/s~300,000 km/s|300 km/s~300 km/s|340 m/s~340 m/s|30 000 km/h~30,000 km/h
    Qual é aproximadamente a velocidade do som no ar?|What is the approximate speed of sound in air?|340 m/s~340 m/s|300 000 km/s~300,000 km/s|34 m/s~34 m/s|3400 km/s~3,400 km/s
    Qual é o valor aproximado da aceleração da gravidade na Terra?|What is the approximate acceleration due to gravity on Earth?|9,8 m/s²~9.8 m/s²|1,6 m/s²~1.6 m/s²|98 m/s²~98 m/s²|0,98 m/s²~0.98 m/s²
    Que lei diz que um corpo mantém o seu movimento se nenhuma força o alterar?|Which law says a body keeps its motion unless a force changes it?|1.ª lei de Newton (inércia)~Newton's 1st law (inertia)|2.ª lei de Newton~Newton's 2nd law|3.ª lei de Newton~Newton's 3rd law|Lei de Ohm~Ohm's law
    Que lei de Newton diz que F = m × a?|Which of Newton's laws says F = m × a?|2.ª lei~2nd law|1.ª lei~1st law|3.ª lei~3rd law|Lei da gravitação~Law of gravitation
    Que lei diz que a toda a ação corresponde uma reação igual e oposta?|Which law says every action has an equal and opposite reaction?|3.ª lei de Newton~Newton's 3rd law|1.ª lei de Newton~Newton's 1st law|2.ª lei de Newton~Newton's 2nd law|Lei de Hooke~Hooke's law
    A que temperatura corresponde o zero absoluto?|What temperature is absolute zero?|−273,15 °C~−273.15 °C|0 °C~0 °C|−100 °C~−100 °C|−459 °C~−459 °C
    O som propaga-se no vazio?|Does sound travel through a vacuum?|Não, precisa de um meio~No, it needs a medium|Sim, mais depressa~Yes, faster|Sim, à mesma velocidade~Yes, at the same speed|Só se for agudo~Only high-pitched sound
    O que mede um ano-luz?|What does a light year measure?|Uma distância~A distance|Um tempo~A time|Uma velocidade~A speed|Uma energia~An energy
    Quem propôs a equação E = mc²?|Who proposed the equation E = mc²?|Albert Einstein~Albert Einstein|Isaac Newton~Isaac Newton|Niels Bohr~Niels Bohr|Galileu~Galileo
    Que partícula do átomo tem carga negativa?|Which particle of the atom has a negative charge?|Eletrão~Electron|Protão~Proton|Neutrão~Neutron|Núcleo~Nucleus
    Que partícula do átomo não tem carga elétrica?|Which particle of the atom has no electric charge?|Neutrão~Neutron|Protão~Proton|Eletrão~Electron|Ião~Ion
    Como se chama a mudança de direção da luz ao passar do ar para a água?|What is it called when light changes direction going from air into water?|Refração~Refraction|Reflexão~Reflection|Difração~Diffraction|Dispersão~Dispersion
    Que cor da luz visível tem maior comprimento de onda?|Which colour of visible light has the longest wavelength?|Vermelho~Red|Violeta~Violet|Verde~Green|Azul~Blue
    O que acontece ao período de um pêndulo se o fio for mais comprido?|What happens to a pendulum's period if the string is longer?|Aumenta~It increases|Diminui~It decreases|Fica igual~It stays the same|Passa a zero~It becomes zero
    Num circuito em série, se uma lâmpada fundir, o que acontece às outras?|In a series circuit, if one bulb blows, what happens to the others?|Apagam-se~They go out|Brilham mais~They shine brighter|Não mudam~Nothing changes|Brilham menos~They shine less
    Que tipo de energia tem um corpo em movimento?|What kind of energy does a moving body have?|Energia cinética~Kinetic energy|Energia potencial~Potential energy|Energia química~Chemical energy|Energia nuclear~Nuclear energy
    Que tipo de energia tem uma pedra no alto de um penhasco?|What kind of energy does a rock on top of a cliff have?|Energia potencial gravítica~Gravitational potential energy|Energia cinética~Kinetic energy|Energia térmica~Thermal energy|Energia sonora~Sound energy
    Que instrumento mede a corrente elétrica?|Which instrument measures electric current?|Amperímetro~Ammeter|Voltímetro~Voltmeter|Dinamómetro~Newton meter|Barómetro~Barometer
    Que instrumento mede a força?|Which instrument measures force?|Dinamómetro~Newton meter (dynamometer)|Termómetro~Thermometer|Amperímetro~Ammeter|Higrómetro~Hygrometer
  `);
  // Chemistry facts, same shape
  var CHEMISTRY_FACTS = rows(`
    Quantos períodos (linhas) tem a tabela periódica?|How many periods (rows) does the periodic table have?|7~7|8~8|18~18|9~9
    Quantos grupos (colunas) tem a tabela periódica?|How many groups (columns) does the periodic table have?|18~18|7~7|8~8|16~16
    Qual é o pH da água pura a 25 °C?|What is the pH of pure water at 25 °C?|7~7|0~0|14~14|1~1
    Como se chama a ligação em que dois átomos partilham eletrões?|What is the bond called where two atoms share electrons?|Ligação covalente~Covalent bond|Ligação iónica~Ionic bond|Ligação metálica~Metallic bond|Ponte de hidrogénio~Hydrogen bond
    Que tipo de ligação existe no cloreto de sódio (NaCl)?|What kind of bond holds sodium chloride (NaCl) together?|Iónica~Ionic|Covalente~Covalent|Metálica~Metallic|Não tem ligações~It has no bonds
    Que gás se liberta quando um metal como o zinco reage com um ácido?|Which gas is released when a metal like zinc reacts with an acid?|Hidrogénio~Hydrogen|Oxigénio~Oxygen|Dióxido de carbono~Carbon dioxide|Azoto~Nitrogen
    Que gás turva a água de cal?|Which gas turns limewater cloudy?|Dióxido de carbono~Carbon dioxide|Oxigénio~Oxygen|Hidrogénio~Hydrogen|Azoto~Nitrogen
    Que gás é o mais abundante no ar?|Which gas is the most abundant in air?|Azoto~Nitrogen|Oxigénio~Oxygen|Dióxido de carbono~Carbon dioxide|Árgon~Argon
    Que cor fica o papel de tornesol azul numa solução ácida?|What colour does blue litmus paper turn in an acidic solution?|Vermelho~Red|Azul~Blue|Verde~Green|Amarelo~Yellow
    Como se chama uma reação que liberta calor?|What is a reaction that releases heat called?|Exotérmica~Exothermic|Endotérmica~Endothermic|Neutralização~Neutralisation|Sublimação~Sublimation
    Ácido + base dá sal + água. Como se chama esta reação?|Acid + base gives salt + water. What is this reaction called?|Neutralização~Neutralisation|Combustão~Combustion|Oxidação~Oxidation|Fermentação~Fermentation
    Que três substâncias formam o triângulo do fogo?|Which three things make up the fire triangle?|Combustível, comburente e energia~Fuel, oxygen and heat|Água, ar e terra~Water, air and earth|Carbono, hidrogénio e azoto~Carbon, hydrogen and nitrogen|Madeira, papel e gás~Wood, paper and gas
    Quem organizou a primeira tabela periódica?|Who organised the first periodic table?|Dmitri Mendeleev~Dmitri Mendeleev|Antoine Lavoisier~Antoine Lavoisier|John Dalton~John Dalton|Marie Curie~Marie Curie
    Quem enunciou a lei da conservação da massa?|Who stated the law of conservation of mass?|Antoine Lavoisier~Antoine Lavoisier|Dmitri Mendeleev~Dmitri Mendeleev|Isaac Newton~Isaac Newton|Niels Bohr~Niels Bohr
    Como se chama a passagem direta de sólido a gasoso?|What is it called when a solid turns straight into a gas?|Sublimação~Sublimation|Fusão~Melting|Vaporização~Vaporisation|Solidificação~Freezing
    Quanto vale a constante de Avogadro (aproximadamente)?|What is Avogadro's constant (approximately)?|6,02 × 10²³ mol⁻¹~6.02 × 10²³ mol⁻¹|3,00 × 10⁸ mol⁻¹~3.00 × 10⁸ mol⁻¹|9,8 × 10²³ mol⁻¹~9.8 × 10²³ mol⁻¹|1,60 × 10⁻¹⁹ mol⁻¹~1.60 × 10⁻¹⁹ mol⁻¹
  `);

  var api = {
    MONARCHS: MONARCHS, MONARCH_NO_SEQUENCE: MONARCH_NO_SEQUENCE, DYNASTIES: DYNASTIES,
    PRESIDENTS: PRESIDENTS, EVENTS: EVENTS, PEOPLE: PEOPLE, COLONIES: COLONIES,
    ELEMENTS: ELEMENTS, ELEMENT_GROUPS: ELEMENT_GROUPS, ANIMALS: ANIMALS, ANIMAL_CLASSES: ANIMAL_CLASSES,
    BODY: BODY, PLANETS: PLANETS, UNITS: UNITS, CONTINENTS: CONTINENTS, OCEANS: OCEANS, DISCOVERIES: DISCOVERIES,
    VERBS_AR: VERBS_AR, VERBS_ER: VERBS_ER, VERBS_IR: VERBS_IR, VERBS_IRREGULAR: VERBS_IRREGULAR,
    PLURALS: PLURALS, FEMININES: FEMININES, COLLECTIVES: COLLECTIVES, SYNONYMS: SYNONYMS, ANTONYMS: ANTONYMS,
    WORD_CLASSES: WORD_CLASSES, WORD_CLASS_NAMES: WORD_CLASS_NAMES, SPELLING: SPELLING,
    VOCAB: VOCAB, VOCAB_CATEGORIES: VOCAB_CATEGORIES, IRREGULAR: IRREGULAR,
    COMPOUNDS: COMPOUNDS, ATOMIC_MASS: ATOMIC_MASS, ISOTOPES: ISOTOPES, IONS: IONS, PH_SUBSTANCES: PH_SUBSTANCES, PH_NAMES: PH_NAMES,
    CHANGES: CHANGES, SEPARATION: SEPARATION, CONDUCTORS: CONDUCTORS, PHYSICS_FACTS: PHYSICS_FACTS, CHEMISTRY_FACTS: CHEMISTRY_FACTS,
    EN_OPPOSITES: EN_OPPOSITES, ANTONYM_CLUSTERS: ANTONYM_CLUSTERS, EN_OPPOSITE_CLUSTERS: EN_OPPOSITE_CLUSTERS, EN_PLURALS: EN_PLURALS, EN_COMPARE: EN_COMPARE
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MQFacts = api;
})(this);
