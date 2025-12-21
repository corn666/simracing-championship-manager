/**
 * Liste complète des véhicules AMS2
 * Mapping: vehicle_id (int) -> {name, class}
 * 
 * Source: API AMS2 /api/list/vehicles
 */

const VEHICLES = 
{
  "9617015": {
    "name": "Chevrolet Corvette Z06 GT3.R",
    "class": "GT3_Gen2"
  },
  "16119375": {
    "name": "Cadillac V-Series.R",
    "class": "LMDh"
  },
  "24108228": {
    "name": "Porsche 911 RSR GTE",
    "class": "GTE"
  },
  "65202613": {
    "name": "MetalMoro MRX Honda P3",
    "class": "P3"
  },
  "65306143": {
    "name": "Sauber Mercedes C9",
    "class": "Group C"
  },
  "95104745": {
    "name": "MCR S2000",
    "class": "P4"
  },
  "121318055": {
    "name": "Formula Classic Gen4 Model3",
    "class": "F-Classic_Gen4"
  },
  "143364290": {
    "name": "BMW 2002 Turbo",
    "class": "TC60S"
  },
  "150641251": {
    "name": "Fusca 2 Hot Cars",
    "class": "Hot Cars"
  },
  "157362639": {
    "name": "Formula Classic Gen4 Model2",
    "class": "F-Classic_Gen4"
  },
  "160008140": {
    "name": "Mercedes-AMG GT3 Evo",
    "class": "GT3_Gen2"
  },
  "174857498": {
    "name": "Reynard 98i Mercedes-Benz",
    "class": "F-USA_Gen2"
  },
  "213908738": {
    "name": "Mitsubishi Lancer RS",
    "class": "LancerCup"
  },
  "240609990": {
    "name": "Brabham Cosworth BT49",
    "class": "F-Retro_Gen2"
  },
  "243649723": {
    "name": "Reynard 95i Honda",
    "class": "F-USA_Gen1"
  },
  "245459304": {
    "name": "Chevrolet Opala Stock Cars 1986",
    "class": "Opala86"
  },
  "253111186": {
    "name": "Super V8",
    "class": "SuperV8"
  },
  "262982797": {
    "name": "Mercedes-Benz 190E 2.5-16 Evo II DTM",
    "class": "Group A"
  },
  "264295457": {
    "name": "Formula Classic Gen3 Model4",
    "class": "F-Classic_Gen3"
  },
  "271036494": {
    "name": "McLaren Honda MP4/6",
    "class": "F-Classic_Gen4"
  },
  "280856873": {
    "name": "Brabham BMW BT52",
    "class": "F-Retro_Gen3"
  },
  "290327508": {
    "name": "Reynard 2Ki Mercedes-Benz",
    "class": "F-USA_Gen3"
  },
  "302183120": {
    "name": "Dallara F309",
    "class": "F-3"
  },
  "306371028": {
    "name": "Superkart 250cc",
    "class": "SuperKart"
  },
  "306785397": {
    "name": "Ultima GTR Race",
    "class": "GTOpen"
  },
  "310900789": {
    "name": "Ginetta G40",
    "class": "GT5"
  },
  "311092313": {
    "name": "Uno Classic B",
    "class": "CopaClassicB"
  },
  "318400650": {
    "name": "Formula Vintage Gen1 Model2",
    "class": "F-Vintage_Gen1"
  },
  "369722929": {
    "name": "Formula Retro Gen2",
    "class": "F-Retro_Gen2"
  },
  "373176631": {
    "name": "Chevrolet Corvette GTP",
    "class": "Group C"
  },
  "374810616": {
    "name": "Kart 4-Stroke Race",
    "class": "KartGX390"
  },
  "379055283": {
    "name": "Ginetta G55 GT4",
    "class": "GT4"
  },
  "390318757": {
    "name": "Passat Hot Cars",
    "class": "Hot Cars"
  },
  "428770333": {
    "name": "Dallara F301",
    "class": "F-3"
  },
  "435621847": {
    "name": "Lotus 72E",
    "class": "F-Retro_Gen1"
  },
  "440916666": {
    "name": "Oreca 07",
    "class": "LMP2_Gen1"
  },
  "476615325": {
    "name": "Brabham Alfa Romeo BT46B",
    "class": "F-Retro_Gen2"
  },
  "478471898": {
    "name": "Ligier JS P4",
    "class": "LES_2025"
  },
  "512055145": {
    "name": "Mitsubishi Lancer Evo10 RX",
    "class": "RX"
  },
  "523915852": {
    "name": "Formula V10 Gen2",
    "class": "F-V10_Gen2"
  },
  "539628044": {
    "name": "Toyota Corolla Stock Car 2022",
    "class": "StockCarV8_2022"
  },
  "553963368": {
    "name": "McLaren M23",
    "class": "F-Retro_Gen1"
  },
  "575788923": {
    "name": "Formula Trainer",
    "class": "F-Trainer"
  },
  "617290135": {
    "name": "Formula Vintage Gen2 Model2",
    "class": "F-Vintage_Gen2"
  },
  "619110280": {
    "name": "Toyota Corolla Stock Car 2020",
    "class": "StockCarV8_2020"
  },
  "697161929": {
    "name": "Formula Classic Gen1 Model1",
    "class": "F-Classic_Gen1"
  },
  "703591920": {
    "name": "MetalMoro MRX Duratec Turbo P2",
    "class": "P2"
  },
  "802736208": {
    "name": "Roco 001",
    "class": "P3"
  },
  "806954123": {
    "name": "Toyota Corolla Stock Car 2021",
    "class": "StockCarV8_2021"
  },
  "809291220": {
    "name": "Porsche 911 GT3 R",
    "class": "GT3"
  },
  "844159614": {
    "name": "Kart 2-Stroke 125cc Direct",
    "class": "Kart125cc"
  },
  "850609487": {
    "name": "McLaren 570S GT4",
    "class": "GT4"
  },
  "851522805": {
    "name": "Caterham Supersport",
    "class": "Cat_Supersport"
  },
  "884102371": {
    "name": "Formula V10 Gen1",
    "class": "F-V10_Gen1"
  },
  "901145560": {
    "name": "BMW M8 GTE",
    "class": "GTE"
  },
  "912279169": {
    "name": "Cadillac DPi-VR",
    "class": "DPI"
  },
  "943684424": {
    "name": "Swift 009c Ford-Cosworth",
    "class": "F-USA_Gen2"
  },
  "957632269": {
    "name": "Porsche 962C",
    "class": "Group C"
  },
  "969706465": {
    "name": "Alpine A110 GT4 Evo",
    "class": "GT4"
  },
  "979672157": {
    "name": "Copa Montana",
    "class": "Montana"
  },
  "990042821": {
    "name": "Reynard 2Ki Ford-Cosworth",
    "class": "F-USA_Gen3"
  },
  "995681332": {
    "name": "MetalMoro AJR Gen2 Honda",
    "class": "P1Gen2"
  },
  "1031807465": {
    "name": "Puma GTE",
    "class": "CopaClassicB"
  },
  "1061494025": {
    "name": "Lotus 49C",
    "class": "F-Vintage_Gen2"
  },
  "1076438091": {
    "name": "Porsche 911 GT1-98",
    "class": "GT1"
  },
  "1122735892": {
    "name": "Lamborghini SC63",
    "class": "LMDh"
  },
  "1132970248": {
    "name": "Audi R8 LMS GT4",
    "class": "GT4"
  },
  "1137681361": {
    "name": "Chevrolet Cruze Stock Car 2023",
    "class": "StockCarV8_2023"
  },
  "1168262642": {
    "name": "Courage C60 Hybrid",
    "class": "LMP1_05"
  },
  "1294128988": {
    "name": "Formula Classic Gen4 Model1",
    "class": "F-Classic_Gen4"
  },
  "1305671580": {
    "name": "Lola B2K00 Mercedes-Benz",
    "class": "F-USA_Gen3"
  },
  "1311912387": {
    "name": "BMW M4 GT3",
    "class": "GT3_Gen2"
  },
  "1323381033": {
    "name": "Chevrolet Cruze Stock Car 2019",
    "class": "StockCarV8"
  },
  "1327147786": {
    "name": "Aston Martin Vantage GT3 Evo",
    "class": "GT3_Gen2"
  },
  "1330326301": {
    "name": "MINI Cooper S 1965",
    "class": "TC60S2"
  },
  "1353949246": {
    "name": "Mercedes-AMG GT3",
    "class": "GT3"
  },
  "1368036017": {
    "name": "BMW M1 Procar",
    "class": "Procar"
  },
  "1380008006": {
    "name": "Lamborghini Murcielago R-GT",
    "class": "GT1_05"
  },
  "1401532035": {
    "name": "Aston Martin Vantage GTE",
    "class": "GTE"
  },
  "1401751841": {
    "name": "Aston Martin DBR9",
    "class": "GT1_05"
  },
  "1408558396": {
    "name": "Formula Retro Gen3 Turbo",
    "class": "F-Retro_Gen3"
  },
  "1408764300": {
    "name": "Lola T98/00 Ford-Cosworth",
    "class": "F-USA_Gen2"
  },
  "1433352906": {
    "name": "Ginetta G58",
    "class": "P1"
  },
  "1437730287": {
    "name": "Formula Retro V8",
    "class": "F-Retro_Gen1"
  },
  "1439296671": {
    "name": "Lotus 79",
    "class": "F-Retro_Gen2"
  },
  "1464988033": {
    "name": "Porsche Cayman GT4 Clubsport MR",
    "class": "GT4"
  },
  "1466312296": {
    "name": "Audi R8 LMP1",
    "class": "LMP1_05"
  },
  "1511161791": {
    "name": "Formula HiTech Gen2 Model1",
    "class": "F-Hitech_Gen2"
  },
  "1530597907": {
    "name": "Reynard 2Ki Honda",
    "class": "F-USA_Gen3"
  },
  "1560162507": {
    "name": "Ultima GTR",
    "class": "Supercars"
  },
  "1561601348": {
    "name": "Ligier JS2 R",
    "class": "LES_2025"
  },
  "1564669712": {
    "name": "Lamborghini Veneno Roadster",
    "class": "Hypercars"
  },
  "1609162502": {
    "name": "Formula Junior",
    "class": "F-Junior"
  },
  "1618401665": {
    "name": "MetalMoro AJR Nissan",
    "class": "P1"
  },
  "1625859751": {
    "name": "Lamborghini Diablo SV-R",
    "class": "ST96"
  },
  "1630268373": {
    "name": "Brabham BT62",
    "class": "Hypercars"
  },
  "1646202889": {
    "name": "Maserati MC12 GT1",
    "class": "GT1_05"
  },
  "1647822272": {
    "name": "Mercedes-Benz Actros",
    "class": "CopaTruck"
  },
  "1653755268": {
    "name": "Gol Hot Cars",
    "class": "Hot Cars"
  },
  "1656093112": {
    "name": "Lamborghini Revuelto",
    "class": "Hypercars"
  },
  "1661024873": {
    "name": "Passat Classic FL",
    "class": "CopaClassicFL"
  },
  "1679105968": {
    "name": "Ligier JS P217",
    "class": "LMP2_Gen1"
  },
  "1700425966": {
    "name": "Passat Classic B",
    "class": "CopaClassicB"
  },
  "1701517873": {
    "name": "Lola T95/00 Mercedes-Benz",
    "class": "F-USA_Gen1"
  },
  "1723657866": {
    "name": "Ligier JS P320",
    "class": "P1Gen2"
  },
  "1767659669": {
    "name": "Chevrolet Cruze Stock Car 2022",
    "class": "StockCarV8_2022"
  },
  "1775576087": {
    "name": "Copa Fusca",
    "class": "CopaFusca"
  },
  "1785300635": {
    "name": "ARC Camaro",
    "class": "ARC_Cam"
  },
  "1818602836": {
    "name": "MINI Cooper JCW",
    "class": "MiniChallenge"
  },
  "1820184336": {
    "name": "Formula HiTech Gen1 Model4",
    "class": "F-Hitech_Gen1"
  },
  "1836524676": {
    "name": "Chevrolet Cruze Stock Car 2020",
    "class": "StockCarV8_2020"
  },
  "1841695623": {
    "name": "Lola B05/40 Turbo",
    "class": "LMP2_05"
  },
  "1864701845": {
    "name": "Caterham 620R",
    "class": "Cat620R"
  },
  "1891730007": {
    "name": "Nissan R89C",
    "class": "Group C"
  },
  "1932261404": {
    "name": "MetalMoro AJR Chevrolet",
    "class": "P1"
  },
  "1947909519": {
    "name": "Formula Ultimate Gen2",
    "class": "F-Ultimate_Gen2"
  },
  "1948072701": {
    "name": "Formula Reiza",
    "class": "F-Reiza"
  },
  "1959097924": {
    "name": "Lotus Renault 98T",
    "class": "F-Classic_Gen1"
  },
  "1965836946": {
    "name": "Chevrolet Corvette C3.R",
    "class": "TC70S"
  },
  "1979398129": {
    "name": "Mercedes-Benz CLK LM",
    "class": "GT1"
  },
  "1982976051": {
    "name": "Formula Trainer Advanced",
    "class": "F-Trainer_A"
  },
  "1989434463": {
    "name": "Ginetta G58 Gen2",
    "class": "P1Gen2"
  },
  "2005556145": {
    "name": "McLaren Cosworth MP4/1C",
    "class": "F-Retro_Gen3"
  },
  "2011027431": {
    "name": "Reynard 98i Honda",
    "class": "F-USA_Gen2"
  },
  "2016280350": {
    "name": "Porsche 911 RSR 1974",
    "class": "TC70S"
  },
  "2037619631": {
    "name": "Volkswagen Polo RX",
    "class": "RX"
  },
  "2057865340": {
    "name": "Audi R8 LMS GT3 evo II",
    "class": "GT3_Gen2"
  },
  "2091910841": {
    "name": "Ginetta G55 GT4 Supercup",
    "class": "G55Supercup"
  },
  "2119768860": {
    "name": "Porsche 996 GT3 RSR",
    "class": "GT2_05"
  },
  "2144142462": {
    "name": "Porsche 911 GT3 Cup 3.8",
    "class": "Carrera Cup"
  },
  "-1404454397": {
    "name": "Alpine A424",
    "class": "LMDh"
  },
  "-896587240": {
    "name": "Aston Martin Valkyrie Hypercar",
    "class": "LMDh"
  },
  "-524222514": {
    "name": "Aston Martin Vantage GT4 Evo",
    "class": "GT4"
  },
  "-340376700": {
    "name": "Audi V8 quattro DTM",
    "class": "Group A"
  },
  "-1135637484": {
    "name": "Audi R8 LMS GT3",
    "class": "GT3"
  },
  "-934098507": {
    "name": "BMW M3 Sport Evo Group A",
    "class": "Group A"
  },
  "-842343170": {
    "name": "BMW M Hybrid V8",
    "class": "LMDh"
  },
  "-1334233081": {
    "name": "BMW M3 E46 GTR",
    "class": "GTR_04"
  },
  "-1075591999": {
    "name": "MINI Cooper S 1965 B",
    "class": "CopaClassicB"
  },
  "-830134672": {
    "name": "Lotus 23",
    "class": "TC60S2"
  },
  "-610534646": {
    "name": "Dallara SP1",
    "class": "LMP1_05"
  },
  "-1768443172": {
    "name": "Dodge Viper GTS-R",
    "class": "GT1_05"
  },
  "-1575210468": {
    "name": "Lola B05/40 V8",
    "class": "LMP2_05"
  },
  "-950775810": {
    "name": "Caterham Academy",
    "class": "Cat_Academy"
  },
  "-1660644383": {
    "name": "Caterham Superlight",
    "class": "Cat_Superlight"
  },
  "-2123166417": {
    "name": "Chevrolet Camaro SS",
    "class": "Street"
  },
  "-489015418": {
    "name": "McLaren Honda MP4/4",
    "class": "F-Classic_Gen2"
  },
  "-61299331": {
    "name": "McLaren Honda MP4/5B",
    "class": "F-Classic_Gen3"
  },
  "-520644472": {
    "name": "McLaren Honda MP4/7A",
    "class": "F-Hitech_Gen1"
  },
  "-1271841366": {
    "name": "McLaren Cosworth MP4/8",
    "class": "F-Hitech_Gen2"
  },
  "-1819510420": {
    "name": "Formula Classic Gen1 Model2",
    "class": "F-Classic_Gen1"
  },
  "-1667467124": {
    "name": "Formula Classic Gen2 Model1",
    "class": "F-Classic_Gen2"
  },
  "-1004811218": {
    "name": "Formula Classic Gen2 Model2",
    "class": "F-Classic_Gen2"
  },
  "-494068343": {
    "name": "Formula Classic Gen2 Model3",
    "class": "F-Classic_Gen2"
  },
  "-1700189536": {
    "name": "Formula Classic Gen3 Model1",
    "class": "F-Classic_Gen3"
  },
  "-1662617552": {
    "name": "Formula Classic Gen3 Model2",
    "class": "F-Classic_Gen3"
  },
  "-1828044943": {
    "name": "Formula Classic Gen3 Model3",
    "class": "F-Classic_Gen3"
  },
  "-1261768631": {
    "name": "Formula Vintage Gen1 Model1",
    "class": "F-Vintage_Gen1"
  },
  "-1988395354": {
    "name": "Formula Vintage Gen2 Model1",
    "class": "F-Vintage_Gen2"
  },
  "-546064616": {
    "name": "Formula HiTech Gen1 Model1",
    "class": "F-Hitech_Gen1"
  },
  "-1021087696": {
    "name": "Formula HiTech Gen1 Model2",
    "class": "F-Hitech_Gen1"
  },
  "-1740598979": {
    "name": "Formula HiTech Gen1 Model3",
    "class": "F-Hitech_Gen1"
  },
  "-873293860": {
    "name": "Formula HiTech Gen2 Model2",
    "class": "F-Hitech_Gen2"
  },
  "-1932898643": {
    "name": "Formula HiTech Gen2 Model3",
    "class": "F-Hitech_Gen2"
  },
  "-360792512": {
    "name": "Formula USA 2023",
    "class": "F-USA_2023"
  },
  "-1201605905": {
    "name": "Brabham BT26A",
    "class": "F-Vintage_Gen2"
  },
  "-1025098540": {
    "name": "Brabham BT44",
    "class": "F-Retro_Gen1"
  },
  "-532210519": {
    "name": "Formula Retro V12",
    "class": "F-Retro_Gen1"
  },
  "-953316099": {
    "name": "Formula Retro Gen3 DFY",
    "class": "F-Retro_Gen3"
  },
  "-2140090167": {
    "name": "Formula Vee Gen1",
    "class": "F-Vee"
  },
  "-186413128": {
    "name": "Formula Vee Gen1 + Fin",
    "class": "F-Vee"
  },
  "-129624066": {
    "name": "Formula Vee Gen2",
    "class": "F-Vee_Gen2"
  },
  "-67190685": {
    "name": "Formula Inter MG-15",
    "class": "F-Inter"
  },
  "-1142039519": {
    "name": "Formula Ultimate Gen1",
    "class": "F-Ultimate"
  },
  "-1766950841": {
    "name": "McLaren Mercedes MP4/12",
    "class": "F-V10_Gen1"
  },
  "-2053858829": {
    "name": "Formula V12",
    "class": "F-V12"
  },
  "-487937394": {
    "name": "Iveco Stralis",
    "class": "CopaTruck"
  },
  "-819133010": {
    "name": "MAN TGX",
    "class": "CopaTruck"
  },
  "-2086797102": {
    "name": "Volkswagen Constellation",
    "class": "CopaTruck"
  },
  "-619309786": {
    "name": "Vulkan Truck",
    "class": "CopaTruck"
  },
  "-751207847": {
    "name": "Ginetta G40 Cup",
    "class": "G40Cup"
  },
  "-1170674276": {
    "name": "Ginetta G55 GT3",
    "class": "GTOpen"
  },
  "-1507418170": {
    "name": "Ligier JS P217",
    "class": "LMP2"
  },
  "-215037480": {
    "name": "Chevrolet Corvette C3",
    "class": "TC60S"
  },
  "-1050342761": {
    "name": "Chevrolet Corvette C3.R Convertible",
    "class": "TC70S"
  },
  "-957838629": {
    "name": "Chevrolet Corvette C5-R",
    "class": "GT1_05"
  },
  "-1729418598": {
    "name": "Chevrolet Corvette C8.R",
    "class": "GTE"
  },
  "-1625811303": {
    "name": "Chevrolet Corvette C8 Z06 (+Z07 Upgrade)",
    "class": "Supercars"
  },
  "-241187148": {
    "name": "BMW M6 GT3",
    "class": "GT3"
  },
  "-1966031044": {
    "name": "BMW M4 GT4",
    "class": "GT4"
  },
  "-1396331646": {
    "name": "Lamborghini Miura SV",
    "class": "TC60S"
  },
  "-1685046747": {
    "name": "Lamborghini Huracan Super Trofeo EVO2",
    "class": "Super Trofeo"
  },
  "-1655460260": {
    "name": "Lamborghini Huracan GT3 EVO2",
    "class": "GT3_Gen2"
  },
  "-855144880": {
    "name": "Mercedes-AMG GT4",
    "class": "GT4"
  },
  "-1941368649": {
    "name": "Milano GT36",
    "class": "GT2_05"
  },
  "-811404968": {
    "name": "Porsche 963",
    "class": "LMDh"
  },
  "-519566358": {
    "name": "Porsche 992 GT3 R",
    "class": "GT3_Gen2"
  },
  "-1416203489": {
    "name": "Nissan GT-R Nismo GT3",
    "class": "GT3"
  },
  "-109705417": {
    "name": "Porsche 911 GT3 Cup 4.0",
    "class": "Carrera Cup"
  },
  "-310556497": {
    "name": "McLaren 720S GT3",
    "class": "GT3"
  },
  "-1026941607": {
    "name": "McLaren 720S GT3 Evo",
    "class": "GT3_Gen2"
  },
  "-2019695308": {
    "name": "Chevrolet Camaro GT4.R",
    "class": "GT4"
  },
  "-1001569309": {
    "name": "McLaren F1 GTR",
    "class": "GT1"
  },
  "-484149203": {
    "name": "Oreca 07",
    "class": "LMP2"
  },
  "-343023508": {
    "name": "Nissan R390 GT1",
    "class": "GT1"
  },
  "-2116593279": {
    "name": "Kart 4-Stroke Rental",
    "class": "KartRental"
  },
  "-739789710": {
    "name": "Kart 2-Stroke 125cc Shifter",
    "class": "KartShifter"
  },
  "-204135982": {
    "name": "McLaren F1 LM",
    "class": "Supercars"
  },
  "-975958992": {
    "name": "McLaren Senna",
    "class": "Hypercars"
  },
  "-1236687924": {
    "name": "MetalMoro AJR Honda",
    "class": "P1"
  },
  "-1745773963": {
    "name": "MetalMoro AJR Judd",
    "class": "P1"
  },
  "-1164814162": {
    "name": "MetalMoro AJR Gen2 Chevrolet",
    "class": "P1Gen2"
  },
  "-68656752": {
    "name": "MetalMoro AJR Gen2 Nissan",
    "class": "P1Gen2"
  },
  "-50694644": {
    "name": "Mitsubishi Lancer R",
    "class": "LancerCup"
  },
  "-1404228714": {
    "name": "Sprint Race",
    "class": "SprintRace"
  },
  "-1357079805": {
    "name": "Chevrolet Cruze Stock Car 2021",
    "class": "StockCarV8_2021"
  },
  "-1110072839": {
    "name": "Chevrolet Cruze Stock Car 2024",
    "class": "StockCarV8_2024"
  },
  "-1274933694": {
    "name": "Toyota Corolla Stock Car 2023",
    "class": "StockCarV8_2023"
  },
  "-959185748": {
    "name": "Toyota Corolla Stock Car 2024",
    "class": "StockCarV8_2024"
  },
  "-371227432": {
    "name": "Chevrolet Omega Stock Car 1999",
    "class": "StockCar99"
  },
  "-2038590707": {
    "name": "Super Trophy Trucks",
    "class": "STT"
  },
  "-181636428": {
    "name": "MetalMoro MRX Duratec P4",
    "class": "P4"
  },
  "-1834081784": {
    "name": "MetalMoro MRX Duratec Turbo P3",
    "class": "P3"
  },
  "-1870819346": {
    "name": "Sigma P1",
    "class": "P2"
  },
  "-1720554236": {
    "name": "Sigma P1 G5",
    "class": "P1Gen2"
  },
  "-1201567586": {
    "name": "Chevrolet Opala Stock Cars 1979",
    "class": "Opala79"
  },
  "-62148492": {
    "name": "Chevrolet Opala Old Stock Race",
    "class": "OldStock"
  },
  "-609305506": {
    "name": "Puma GTB",
    "class": "CopaClassicFL"
  },
  "-93205368": {
    "name": "Puma P052",
    "class": "GT5"
  },
  "-1155860123": {
    "name": "Chevrolet Chevette",
    "class": "CopaClassicB"
  },
  "-815324367": {
    "name": "Fusca Classic FL",
    "class": "CopaClassicFL"
  },
  "-844211966": {
    "name": "Copa Uno",
    "class": "CopaUno"
  },
  "-45848101": {
    "name": "Gol Classic FL",
    "class": "CopaClassicFL"
  },
  "-333355648": {
    "name": "Gol Classic B",
    "class": "CopaClassicB"
  },
  "-1086802614": {
    "name": "Fusca 1 Hot Cars",
    "class": "Hot Cars"
  },
  "-1170240161": {
    "name": "Volkswagen Polo",
    "class": "TSICup"
  },
  "-1762971386": {
    "name": "Volkswagen Polo GTS",
    "class": "TSICup"
  },
  "-1137512839": {
    "name": "Volkswagen Virtus",
    "class": "TSICup"
  },
  "-1310963279": {
    "name": "Volkswagen Virtus GTS",
    "class": "TSICup"
  },
  "-1477576480": {
    "name": "Lola T95/00 Ford-Cosworth",
    "class": "F-USA_Gen1"
  },
  "-845636149": {
    "name": "Lola B2K00 Ford-Cosworth",
    "class": "F-USA_Gen3"
  },
  "-1883533152": {
    "name": "Lola B2K00 Toyota",
    "class": "F-USA_Gen3"
  },
  "-794072085": {
    "name": "Reynard 95i Ford-Cosworth",
    "class": "F-USA_Gen1"
  },
  "-832846400": {
    "name": "Reynard 95i Mercedes-Benz",
    "class": "F-USA_Gen1"
  },
  "-406287657": {
    "name": "Reynard 98i Ford-Cosworth",
    "class": "F-USA_Gen2"
  },
  "-1212556546": {
    "name": "Reynard 98i Toyota",
    "class": "F-USA_Gen2"
  },
  "-564338836": {
    "name": "Reynard 2Ki Toyota",
    "class": "F-USA_Gen3"
  },
  "-354497004": {
    "name": "Formula Dirt",
    "class": "F-Dirt"
  },
  "-1084561430": {
    "name": "Kart Cross",
    "class": "Kartcross"
  },
  "-69155277": {
    "name": "MINI Countryman R60 RX",
    "class": "RX"
  },
  "-983006067": {
    "name": "Citroen DS3 RX",
    "class": "RX"
  }
}
;

/**
 * Récupère les infos d'un véhicule à partir de son ID
 * @param {number|string} vehicleId - L'ID du véhicule
 * @returns {Object} - {name, class} ou {name: 'Unknown', class: 'Unknown'}
 */
function getVehicleInfo(vehicleId) {
  if (!vehicleId && vehicleId !== 0) {
    return { name: 'Unknown', class: 'Unknown' };
  }
  
  const vehicleIdStr = String(vehicleId);
  return VEHICLES[vehicleIdStr] || { 
    name: `Vehicle ${vehicleId}`, 
    class: 'Unknown' 
  };
}

/**
 * Récupère le nom d'un véhicule
 * @param {number|string} vehicleId 
 * @returns {string}
 */
function getVehicleName(vehicleId) {
  return getVehicleInfo(vehicleId).name;
}

/**
 * Récupère la classe d'un véhicule
 * @param {number|string} vehicleId 
 * @returns {string}
 */
function getVehicleClass(vehicleId) {
  return getVehicleInfo(vehicleId).class;
}

/**
 * Récupère tous les véhicules
 * @returns {Object}
 */
function getAllVehicles() {
  return VEHICLES;
}

module.exports = {
  VEHICLES,
  getVehicleInfo,
  getVehicleName,
  getVehicleClass,
  getAllVehicles
};
