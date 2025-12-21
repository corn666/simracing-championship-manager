/**
 * Liste complète des circuits AMS2
 * Mapping: track_id (int) -> nom du circuit
 * 
 * Source: sms_stats_data.json - field "TrackId"
 */

const TRACKS = {
  // Adelaide
  '-559709709': 'Adelaide Historic',
  '827815091': 'Adelaide Modern',
  '1565677554': 'Adelaide Modern STT',
  
  // Ascurra
  '1328659519': 'Ascurra DIRT',
  '-2021270791': 'Ascurra RX',
  
  // Azure
  '-1939104917': 'Azure Circuit 2021',
  
  // Barcelona / Catalunya
  '-1976262540': 'Barcelona 1991',
  '788137081': 'Circuit de Catalunya GP',
  '-2045930240': 'Circuit de Catalunya GP NC',
  '-1460882916': 'Circuit de Catalunya NATL NC',
  '-1698375535': 'Circuit de Catalunya RX',
  
  // Bathurst
  '-620880244': 'Bathurst 1983',
  '1080325116': 'Bathurst 2020',
  
  // Brands Hatch
  '1534602052': 'Brands Hatch GP',
  '-572148012': 'Brands Hatch Indy',
  
  // Brasilia
  '202837760': 'Brasilia Full',
  '1828328431': 'Brasilia Outer',
  
  // Buenos Aires
  '-1914387303': 'Buenos Aires Circuito 6',
  '-44643975': 'Buenos Aires Circuito 6T',
  '-1297377774': 'Buenos Aires Circuito 7',
  '-444279793': 'Buenos Aires Circuito 8',
  '325651039': 'Buenos Aires Circuito 9',
  '799677855': 'Buenos Aires Circuito 12',
  '-430748509': 'Buenos Aires Circuito 15',
  
  // Buskerud
  '-1786068114': 'Buskerud Long',
  '2097280990': 'Buskerud Short',
  
  // Cadwell Park
  '1910889511': 'Cadwell Park',
  
  // Campo Grande
  '2135405654': 'Campo Grande 1',
  
  // Cascavel
  '-916478809': 'Cascavel 2',
  
  // Cascais
  '-869897529': 'Cascais 1988',
  '1650761166': 'Cascais',
  '-1015082583': 'Cascais Alternate',
  
  // Cleveland
  '-2123543761': 'Cleveland GP',
  '706432470': 'Cleveland STT',
  
  // Cordoba
  '-1142444519': 'Cordoba International',
  '-1043857231': 'Cordoba GP',
  '-171682166': 'Cordoba NATL',
  
  // Copa Sao Paulo
  '-939269561': 'Copa São Paulo Stage 2',
  
  // Curitiba
  '844082431': 'Curitiba Internacional',
  '-549646259': 'Curitiba Outer',
  
  // Curvelo
  '-923996694': 'Curvelo Long',
  '-203742941': 'Curvelo Short',
  
  // Daytona
  '2054003546': 'Daytona Speedway Tri Oval',
  '467707118': 'Daytona Road Course',
  '705412912': 'Daytona Nascar Road Course',
  
  // Donington
  '1497365379': 'Donington GP',
  '-865646115': 'Donington National',
  
  // Fontana
  '1602044389': 'Fontana OVAL',
  '-1899621736': 'Fontana SCC',
  
  // Foz
  '-1399336065': 'Foz RX',
  
  // Galeao
  '1674501695': 'Galeão Airport',
  
  // Gateway
  '2044979547': 'Gateway OVAL',
  '-385022794': 'Gateway RC1',
  '175033766': 'Gateway RC2',
  
  // Goiania
  '-438882031': 'Goiânia Mixed',
  '693994049': 'Goiânia Outer',
  '-916412256': 'Goiânia Short',
  
  // Granja Viana Kart
  '-844021865': 'Granja Viana Kart 101',
  '553029608': 'Granja Viana Kart 102',
  '1153901510': 'Granja Viana Kart 121',
  
  // Guapore
  '2058166835': 'Guaporé',
  '-1949748308': 'Guaporé STT',
  
  // Hockenheim
  '-435924753': 'Hockenheim GP',
  '239659483': 'Hockenheim Short A',
  '230784137': 'Hockenheim Short B',
  '-327427534': 'Hockenheim National',
  '-108270200': 'Hockenheim 2001',
  '534374248': 'Hockenheim 1988',
  '-543681041': 'Hockenheim 1988 Short',
  '473366003': 'Hockenheim 1977',
  '761864750': 'Hockenheim RX',
  '-1567974516': 'Hockenheim STT',
  
  // Ibarra
  '2111076703': 'Ibarra 2',
  '-676667056': 'Ibarra Reverse',
  '-254340281': 'Ibarra STT',
  
  // Imola
  '731129913': 'Imola GP 2018',
  '1003427592': 'Imola GP 1972',
  '1544603199': 'Imola GP 1988',
  '-29732804': 'Imola GP 2001',
  
  // Indianapolis
  '-468654879': 'Indianapolis 2022 Oval',
  '328837350': 'Indianapolis 2022 RC',
  
  // Interlagos
  '930258290': 'Interlagos 1991',
  '1641699173': 'Interlagos 1993',
  '-1478712571': 'Interlagos GP',
  '420324528': 'Interlagos SCB',
  '1312214486': 'Interlagos Historic',
  '-1704124105': 'Interlagos Historic Outer',
  '228315736': 'Interlagos Kart 1',
  '870961348': 'Interlagos Kart 2',
  '1869056157': 'Interlagos Kart 3',
  
  // Jacarepagua
  '-89774641': 'Jacarepaguá Historic',
  '393495474': 'Jacarepaguá 2005',
  '-1081969582': 'Jacarepaguá OVAL',
  '-467386624': 'Jacarepaguá SCB',
  '1891554116': 'Jacarepaguá SHORT',
  
  // Jerez
  '-1548942089': 'Jerez GP 1988',
  '1406264747': 'Jerez GP 2019',
  '-1602971785': 'Jerez Standard',
  
  // Kansai
  '1261622488': 'Kansai GP',
  '1035236174': 'Kansai Classic',
  '530399487': 'Kansai East',
  '85029775': 'Kansai West',
  
  // Kyalami
  '2018595322': 'Kyalami 2019',
  '-1384297883': 'Kyalami Historic',
  
  // Laguna Seca
  '568559152': 'Laguna Seca 2020',
  
  // Le Mans
  '999948974': 'Le Mans 24h 2005',
  '1060182346': 'Le Mans 24h',
  '1446740417': 'Le Mans Circuit Bugatti',
  
  // Londrina
  '-1540556268': 'Londrina Short',
  '-1959616750': 'Londrina Long',
  '1373891276': 'Londrina Kart 1',
  '16295271': 'Londrina Kart 2',
  
  // Long Beach
  '1731699995': 'Long Beach',
  '-1976903313': 'Long Beach STT',
  
  // Montreal
  '880948150': 'Montreal Historic 1991',
  '-696853932': 'Montreal Historic',
  '-1239363445': 'Montreal Modern',
  
  // Monza
  '-2054918047': 'Monza 1971 10k',
  '612695202': 'Monza 1971 10k NC',
  '-332593300': 'Monza 1971',
  '1003665316': 'Monza 1991',
  '-1956398437': 'Monza 1971 Junior',
  '-1257095693': 'Monza 2020',
  '-2098177408': 'Monza 2020 Junior',
  '256298636': 'Monza 2020 STT',
  
  // Mosport
  '868841025': 'Mosport',
  
  // Nürburgring
  '884472481': 'Nordschleife 2020',
  '-472366150': 'Nordschleife 2020 24hr',
  '-1789057785': 'Nordschleife 2025',
  '-864856074': 'Nordschleife 2025 24hr',
  '-1999809693': 'Nürburgring 1971 Beton',
  '-1099915987': 'Nürburgring 1971 Gesamt',
  '399001429': 'Nürburgring 1971 Nordschleife',
  '199279675': 'Nürburgring 1971 Südschleife',
  '-1012344423': 'Nürburgring 2020 RX',
  '899109770': 'Nürburgring GP 2020',
  '1133983668': 'Nürburgring GP 2020 Sprint',
  '1819021861': 'Nürburgring GP 2020 Sprint S',
  '-581740816': 'Nürburgring GP 2020 Veedol',
  '-741729925': 'Nürburgring GP 2025',
  
  // Ortona
  '809214670': 'Ortona 1',
  '1549441566': 'Ortona 2',
  '-1213903939': 'Ortona 3',
  '59749392': 'Ortona 4',
  
  // Oulton Park
  '-498735748': 'Oulton Park International',
  '-914088887': 'Oulton Park Classic',
  '-92069206': 'Oulton Park Fosters',
  '1820168870': 'Oulton Park Island',
  
  // Road America
  '-398562049': 'Road America RC',
  '372107672': 'Road America RCB',
  '1508125921': 'Road America STT',
  
  // Road Atlanta
  '269355464': 'Road Atlanta',
  '512524319': 'Road Atlanta Moto',
  '61057241': 'Road Atlanta 2005',
  '-2008079786': 'Road Atlanta 2005 Short',
  
  // Salvador
  '761562120': 'Salvador Street Circuit',
  
  // Santa Cruz do Sul
  '1932830334': 'Santa Cruz do Sul',
  
  // Sebring
  '1064267013': 'Sebring',
  '1655714206': 'Sebring Club',
  '21132368': 'Sebring School',
  '-681188758': 'Sebring STT',
  
  // Silverstone
  '-526206945': 'Silverstone 1975',
  '-533867030': 'Silverstone 1975 No Chicane',
  '-797317755': 'Silverstone 1991',
  '509991425': 'Silverstone 2001',
  '1648317775': 'Silverstone 2001 International',
  '-507834810': 'Silverstone 2001 National',
  '-931849903': 'Silverstone GP',
  '964004535': 'Silverstone International 2019',
  '-1061474453': 'Silverstone National 2019',
  
  // Snetterton
  '-1470317805': 'Snetterton 100',
  '-1338478783': 'Snetterton 200',
  '987592900': 'Snetterton 300',
  
  // Spa-Francorchamps
  '-1736505524': 'Spa-Francorchamps 1970',
  '1170932587': 'Spa-Francorchamps 1970 1000km',
  '1283905272': 'Spa-Francorchamps 1993',
  '-1017131847': 'Spa-Francorchamps 2005',
  '797987967': 'Spa-Francorchamps 2005 EC',
  '-1262750090': 'Spa-Francorchamps 2020',
  '775712153': 'Spa-Francorchamps 2022',
  '-1531498465': 'Spa-Francorchamps 2022 RX',
  
  // Speedland
  '756011139': 'Speedland 1',
  '-588458518': 'Speedland 2',
  '-327486946': 'Speedland 3',
  '-1941017299': 'Speedland 4',
  
  // Spielberg (Red Bull Ring)
  '-100668052': 'Spielberg Historic',
  '-213305159': 'Spielberg Vintage',
  '735562025': 'Spielberg Modern',
  '1819432538': 'Spielberg Short',
  '1524591075': 'Spielberg STT',
  
  // Taruma
  '2074495683': 'Tarumã Internacional',
  '-108853074': 'Tarumã Chicane',
  
  // Termas de Rio Hondo
  '163877389': 'Termas de Río Hondo',
  
  // Tykki
  '779269607': 'Tykki DIRT 1',
  '-1929604728': 'Tykki DIRT 2',
  '1637229097': 'Tykki RX',
  '-1627472795': 'Tykki Tarmac',
  
  // VeloCitta
  '1882187011': 'VeloCitta 1',
  '1557615576': 'VeloCitta TD',
  '1956507207': 'VeloCitta Club Day',
  
  // Velopark
  '193535285': 'Velopark 2010',
  '-1642426225': 'Velopark 2017',
  '-1732031247': 'Velopark 2017 STT',
  
  // Virginia
  '1063112912': 'Virginia Full',
  '-1592912773': 'Virginia Grand',
  '2134032188': 'Virginia North',
  '1284894334': 'Virginia Patriot',
  '-1235504884': 'Virginia South',
  
  // Watkins Glen
  '-875185854': 'Watkins Glen GP',
  '-191952188': 'Watkins Glen GPIL',
  '2035789624': 'Watkins Glen Short',
  '-619438500': 'Watkins Glen SIIL',
  '1836425306': 'Watkins Glen STT'
};

/**
 * Récupère le nom d'un circuit à partir de son ID
 * @param {number|string} trackId - L'ID du circuit
 * @returns {string} - Le nom du circuit ou 'Circuit inconnu' si non trouvé
 */
function getTrackName(trackId) {
  if (!trackId && trackId !== 0) return 'Circuit inconnu';
  
  const trackIdStr = String(trackId);
  return TRACKS[trackIdStr] || `Circuit inconnu (${trackId})`;
}

/**
 * Récupère tous les circuits
 * @returns {Object} - Objet avec tous les circuits
 */
function getAllTracks() {
  return TRACKS;
}

/**
 * Recherche un circuit par nom (partiel)
 * @param {string} searchTerm - Terme de recherche
 * @returns {Array} - Liste des circuits correspondants [{id, name}]
 */
function searchTracks(searchTerm) {
  if (!searchTerm) return [];
  
  const term = searchTerm.toLowerCase();
  return Object.entries(TRACKS)
    .filter(([_, name]) => name.toLowerCase().includes(term))
    .map(([id, name]) => ({ id, name }));
}

module.exports = {
  TRACKS,
  getTrackName,
  getAllTracks,
  searchTracks
};
