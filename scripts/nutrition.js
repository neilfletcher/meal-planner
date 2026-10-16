"use strict";
// Rough nutrition per serving, worked out from each recipe's ingredient list.
// Values are typical UK figures per 100 g (kcal, protein, carbs, fat), and
// amounts are turned into grams with the usual weights below. It is a guide,
// not a lab figure: brands vary, and "a handful" is not exact.
//
//   node scripts/nutrition.js          writes nutrition into recipes-data.js
//   node scripts/nutrition.js --check  lists ingredients it could not place
var fs = require("fs");
var path = require("path");

// [pattern, kcal, protein, carbs, fat, grams for one "each", grams per tbsp]
// First match wins, so specific entries come before general ones.
var FOODS = [
  // nothing worth counting
  [/^(salt|coarse sea salt|black pepper|salt and pepper|pepper$|water|sparkling water|ice|wooden skewers|bay leaf|kaffir lime|star anise|cinnamon stick|whole cloves|green cardamom|whole allspice|saffron|curry leaves|fresh curry leaves|lemongrass stalk|sage leaves|bonito|nori|dried red chillies|thumb|slices fresh ginger)/, 0, 0, 0, 0, 0, 0],
  [/(ground|dried|seeds|powder|paprika|cayenne|turmeric|garam masala|five spice|seasoning|spice blend|sumac|za'atar|ras el hanout|chaat masala|asafoetida|nutmeg|peppercorns|sichuan pepper|gochugaru|chilli flakes|black pepper|herbes|oregano|thyme$|mixed herbs|marjoram|tarragon$|dried mint|baking powder|bicarbonate|garlic powder|onion powder|curry powder)/, 300, 12, 40, 12, 0, 6],
  [/^(fresh )?(coriander|parsley|dill|mint|basil|chives|thyme|rosemary|tarragon|thai basil|lovage)|coriander and mint|mint and coriander|fresh thyme|fresh rosemary|chives$/, 30, 3, 4, 0.5, 0, 3],
  // liquids and condiments, before the meat, fish and rice in their names
  [/stock|dashi|broth/, 5, 0.5, 0.5, 0.2, 10, 15],
  [/soy sauce|fish sauce|oyster sauce|black bean sauce|worcestershire|hot sauce|sriracha|chilli sauce|peri-peri|vinegar|mustard|horseradish|stock cube|stock powder|kimchi juice|pickle|gherkin|capers|tamarind paste/, 60, 4, 8, 1, 10, 16],
  // ready-made things, before the meat and flour they contain
  [/dumpling or wonton wrappers/, 280, 9, 56, 1.5, 8, 15],
  [/meatballs/, 240, 15, 6, 17, 25, 15],
  [/koftas/, 260, 16, 5, 20, 50, 15],
  [/falafel/, 250, 8, 25, 13, 25, 15],
  // oils and fats
  [/(vegetable|olive|sesame|mustard|sunflower|red palm) oil|oil, for frying|^oil$/, 884, 0, 0, 100, 0, 13.5],
  [/^(ghee or butter|butter|salted butter|unsalted butter|softened butter)$/, 740, 0.5, 0.5, 82, 0, 14],
  [/double cream/, 450, 1.7, 2.7, 48, 0, 15],
  [/single cream|milk or single cream/, 190, 2.6, 3.9, 18, 0, 15],
  [/soured cream|creme fraiche|crème fraîche/, 190, 2.9, 4, 18, 0, 15],
  [/mayonnaise|tartare/, 680, 1, 2, 75, 0, 14],
  [/peanut butter/, 600, 25, 15, 50, 0, 16],
  [/tahini/, 600, 18, 10, 55, 0, 15],
  [/pesto/, 450, 5, 6, 45, 0, 15],
  // dairy
  [/natural yoghurt|plain yoghurt|^yoghurt|greek yoghurt|single cream or plain yoghurt/, 70, 5, 6, 3.5, 0, 16],
  [/tzatziki|raita|mint yoghurt/, 120, 4, 4, 10, 0, 16],
  [/^(?!coconut).*(milk|buttermilk)/, 50, 3.4, 4.8, 1.8, 0, 15],
  [/halloumi/, 320, 21, 2, 25, 0, 15],
  [/paneer/, 300, 19, 3, 23, 0, 15],
  [/feta/, 265, 15, 1, 22, 0, 15],
  [/mozzarella|cheese curds/, 250, 18, 2, 19, 0, 15],
  [/goat's cheese/, 300, 19, 1, 25, 0, 15],
  [/cottage cheese|curd cheese|cream cheese/, 160, 11, 4, 11, 0, 15],
  [/parmesan|pecorino|hard cheese/, 400, 33, 0, 29, 0, 7],
  [/cheddar|gruy[eè]re|emmental|provolone|cheese/, 410, 25, 0.5, 34, 20, 7],
  [/egg yolk/, 320, 16, 0.5, 27, 17, 15],
  [/egg(?!\s*noodles)/, 143, 12.6, 0.7, 9.5, 50, 15],
  // meat and fish
  [/chicken breast|chicken mince|turkey breast/, 115, 24, 0, 2, 170, 15],
  [/chicken thigh|boneless chicken/, 175, 18, 0, 11, 90, 15],
  [/turkey mince/, 150, 20, 0, 8, 0, 15],
  [/duck leg/, 300, 18, 0, 25, 180, 15],
  [/duck breast/, 200, 20, 0, 13, 150, 15],
  [/beef mince|cooked roast beef or beef mince|beef strips or mince|beef mince or steak/, 230, 19, 0, 17, 0, 15],
  [/lamb mince/, 260, 17, 0, 21, 0, 15],
  [/pork mince/, 230, 18, 0, 17, 0, 15],
  [/beef|steak|brisket|pastrami/, 160, 22, 0, 8, 160, 15],
  [/lamb chops/, 260, 18, 0, 21, 90, 15],
  [/lamb/, 200, 20, 0, 13, 160, 15],
  [/pork belly|lardons/, 500, 14, 0, 49, 0, 15],
  [/pork ribs/, 280, 17, 0, 23, 0, 15],
  [/pork chop|pork loin chop/, 220, 20, 0, 15, 180, 15],
  [/pork shoulder/, 220, 19, 0, 16, 0, 15],
  [/pork (loin|tenderloin)/, 150, 22, 0, 6, 0, 15],
  [/chorizo|merguez|boerewors/, 450, 24, 2, 38, 70, 15],
  [/bratwurst|frankfurter|smoked sausage|chinese sausage/, 300, 13, 2, 27, 90, 15],
  [/sausage/, 280, 13, 9, 21, 65, 15],
  [/bacon/, 330, 14, 0, 30, 25, 15],
  [/ham|prosciutto|salami|spam/, 160, 18, 1, 9, 15, 15],
  [/salmon/, 200, 20, 0, 13, 140, 15],
  [/smoked mackerel/, 300, 19, 0, 25, 0, 15],
  [/mackerel|herring/, 220, 19, 0, 16, 150, 15],
  [/trout/, 150, 21, 0, 7, 140, 15],
  [/smoked haddock/, 100, 23, 0, 0.6, 0, 15],
  [/cod|haddock|white fish|sea bass|snapper|sea bream|plaice|pollock|\bbasa\b/, 85, 18, 0, 1, 140, 15],
  [/tuna/, 110, 25, 0, 1, 110, 15],
  [/prawn|squid/, 80, 17, 1, 1, 0, 15],
  [/anchovy/, 200, 29, 0, 10, 4, 15],
  [/tofu/, 125, 13, 2, 7, 0, 15],
  // starches
  [/cooked (jasmine |wild |white )?rice|cooked pearl barley/, 140, 2.8, 31, 0.4, 0, 15],
  [/rice noodles|vermicelli|glass noodles|flat rice noodles/, 360, 6, 80, 1, 0, 15],
  [/straight-to-wok|udon/, 140, 3.5, 28, 1, 0, 15],
  [/rice cakes/, 220, 4, 49, 0.5, 0, 15],
  [/rice|sushi rice/, 355, 7, 78, 1, 0, 12],
  [/noodles/, 360, 12, 70, 3, 0, 15],
  [/gnocchi/, 150, 4, 32, 0.5, 0, 15],
  [/couscous|orzo|pasta|spaghetti|penne|fusilli|tagliatelle|pappardelle|macaroni|bulgur|freekeh|polenta|maize meal/, 355, 12, 72, 1.5, 0, 12],
  [/lentils|split peas/, 340, 24, 50, 1.5, 0, 12],
  [/puy lentils/, 120, 9, 17, 0.5, 0, 15],
  [/^(plain |self-raising |gram |chickpea |cassava )?flour|gram  flour|cornflour|potato starch|cassava flour/, 350, 9, 75, 1.5, 0, 8],
  [/breadcrumbs|panko/, 380, 12, 75, 4, 0, 6],
  [/tortilla chips/, 490, 7, 60, 24, 0, 15],
  [/taco shells/, 470, 7, 63, 22, 12, 15],
  [/tortilla|^wraps?$/, 300, 8, 50, 7, 45, 15],
  [/flatbread|pitta|naan|roti|paratha|cornbread/, 275, 9, 52, 4, 75, 15],
  [/puff pastry/, 400, 6, 37, 25, 0, 15],
  [/filo/, 300, 8, 60, 3, 20, 15],
  [/bun|roll|bread|toast/, 250, 9, 47, 3, 40, 15],
  [/frozen chips|frozen fries/, 160, 2.5, 25, 5, 0, 15],
  [/sweet potato|kumara/, 86, 1.6, 20, 0.1, 200, 15],
  [/potato/, 77, 2, 17, 0.1, 170, 15],
  [/plantain/, 120, 1.3, 32, 0.4, 200, 15],
  [/swede/, 30, 1, 6, 0.2, 0, 15],
  // beans and pulses (tinned, drained)
  [/chickpeas|beans|black-eyed|pigeon peas|edamame/, 115, 7, 16, 1.5, 0, 15],
  // veg and fruit
  [/sweetcorn|corn on the cob/, 85, 3, 16, 1.2, 150, 15],
  [/frozen peas|^peas/, 70, 5.5, 10, 0.9, 0, 15],
  [/avocado/, 190, 2, 2, 19, 150, 15],
  [/olives/, 140, 1, 1, 15, 4, 12],
  [/spring onion/, 30, 1.8, 6, 0.2, 15, 10],
  [/onion|shallot|leek/, 38, 1, 8, 0.1, 150, 10],
  [/garlic/, 140, 6, 30, 0.5, 4, 10],
  [/ginger/, 80, 2, 18, 0.8, 10, 6],
  [/carrot/, 40, 0.6, 9, 0.3, 70, 10],
  [/pepper|chilli|scotch bonnet/, 30, 1, 6, 0.3, 150, 10],
  [/tomato pur[eé]e|tomato paste/, 80, 4.5, 14, 0.5, 0, 16],
  [/chopped tomatoes|passata|tinned chopped/, 22, 1.2, 3.5, 0.2, 0, 15],
  [/tomato/, 18, 0.9, 3.2, 0.2, 100, 15],
  [/mushroom/, 22, 3, 1, 0.5, 0, 10],
  [/spinach|kale|greens|cavolo|chard|rocket|pak choi|lettuce|salad|chicory|cabbage|sauerkraut|kimchi|beansprouts|coleslaw/, 25, 2, 3.5, 0.4, 150, 10],
  [/broccoli|green beans|courgette|cauliflower|fennel|celery|cucumber|radish|daikon|squash|aubergine|stir-fry veg|mixed stir-fry/, 30, 1.8, 4.5, 0.4, 200, 10],
  [/beetroot/, 45, 1.7, 9, 0.2, 40, 15],
  [/apple sauce/, 70, 0.2, 18, 0.1, 0, 17],
  [/apple/, 52, 0.3, 14, 0.2, 150, 15],
  [/pineapple/, 55, 0.5, 13, 0.1, 0, 15],
  [/orange juice|pineapple juice|apple juice/, 45, 0.7, 10, 0.2, 0, 15],
  [/orange/, 47, 0.9, 12, 0.1, 130, 15],
  [/lemon|lime/, 25, 0.5, 7, 0.2, 40, 15],
  [/pomegranate seeds/, 83, 1.7, 19, 1.2, 0, 15],
  [/raisins|sultanas|apricots|dried apricot/, 300, 3, 70, 0.5, 8, 15],
  [/cranberry sauce|lingonberry|jam|marmalade/, 250, 0.3, 62, 0.1, 0, 20],
  // nuts
  [/peanuts|almonds|walnuts|pine nuts|cashews|sesame seeds/, 600, 22, 12, 52, 0, 8],
  // sauces and sweeteners
  [/honey|maple syrup|golden syrup|molasses|sweet soy|kecap/, 310, 0.3, 80, 0, 0, 21],
  [/sugar/, 400, 0, 100, 0, 0, 12],
  [/coconut milk/, 190, 1.6, 3, 19, 0, 15],
  [/ketchup|barbecue sauce|brown sauce|okonomiyaki|plum sauce|sweet and sour|hoisin|teriyaki|sticky sesame|bulgogi|sesame ginger|honey mustard|chutney|tamarind sauce/, 180, 1.5, 40, 1, 0, 17],
  [/katsu curry sauce|creamy mustard|peppercorn sauce/, 110, 1.5, 9, 7, 0, 15],
  [/curry paste|harissa|pesto|chipotle|mole|aji|gochujang|chilli bean|doubanjiang|miso|lemongrass paste|ginger garlic paste|sambal|chilli paste/, 150, 4, 12, 9, 0, 16],
  [/salsa|pico de gallo/, 35, 1.3, 6, 0.3, 0, 16],
  [/hummus/, 300, 7, 10, 25, 0, 15],
  [/refried beans/, 90, 5, 13, 1.5, 0, 15],
  [/wine|sherry|sake|mirin|shaoxing|ale|stout/, 80, 0.2, 4, 0, 0, 15],
  [/cocoa/, 380, 20, 12, 22, 0, 6],
  [/toasted rice powder/, 360, 7, 78, 1, 0, 8]
];

var UNIT_G = { g: 1, kg: 1000, ml: 1, l: 1000, tin: 400, "small tin": 145, slice: 40, slices: 40, sheet: 25, sheets: 25, rashers: 25, stick: 40,
  handful: 30, "small handful": 5, "large handful": 45, handfuls: 30, sprig: 0, "few sprigs": 0, pinch: 0, "to taste": 0, thumb: 10 };

function lookup(item) {
  var name = String(item).toLowerCase().replace(/\(.*?\)/g, "").split(",")[0].trim();
  for (var i = 0; i < FOODS.length; i++) if (FOODS[i][0].test(name)) return FOODS[i];
  return null;
}
function grams(ing, food) {
  var amt = ing.amt == null ? 1 : ing.amt, u = (ing.unit || "").toLowerCase();
  var name = String(ing.item).toLowerCase();
  if (u === "tbsp") return amt * food[6];
  if (u === "tsp") return amt * food[6] / 3;
  if (u === "" || u === "each") {
    if (/^(small|medium) /.test(name)) return amt * food[5] * 0.7;
    if (/^large /.test(name)) return amt * food[5] * 1.4;
    if (/^(slice|slices) /.test(name)) return amt * 30;
    if (/tin/.test(name)) return amt * 240;
    return amt * food[5];
  }
  if (u === "tin") return amt * (/(beans|chickpeas|peas|sweetcorn)/.test(name) ? 240 : 400);
  if (/herb|coriander|parsley|dill|mint|basil|chives/.test(name) && /handful/.test(u)) return amt * 5;
  return amt * (UNIT_G[u] != null ? UNIT_G[u] : 0);
}
function nutritionOf(r) {
  var t = { kcal: 0, protein: 0, carbs: 0, fat: 0 }, missing = [];
  r.ingredients.forEach(function (ing) {
    var f = lookup(ing.item);
    if (!f) { missing.push(ing.item); return; }
    var g = grams(ing, f);
    // Deep-frying oil mostly stays in the pan: count about a third of it.
    // Oil for frying mostly stays in the pan.
    if (/oil/.test(ing.item) && /frying/.test(ing.item)) g *= 0.15;
    else if (/oil/.test(ing.item) && ing.unit === "tbsp" && ing.amt >= 2) g *= 0.6;
    t.kcal += g * f[1] / 100; t.protein += g * f[2] / 100; t.carbs += g * f[3] / 100; t.fat += g * f[4] / 100;
  });
  return {
    n: { kcal: Math.round(t.kcal / 10) * 10, protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) },
    missing: missing
  };
}
module.exports = { nutritionOf: nutritionOf };

if (require.main === module) {
  var file = path.join(__dirname, "..", "recipes-data.js");
  global.window = {};
  require(file);
  var R = window.SOLO_RECIPES;
  if (process.argv.indexOf("--check") !== -1) {
    var miss = {};
    R.forEach(function (r) { nutritionOf(r).missing.forEach(function (m) { miss[m] = (miss[m] || 0) + 1; }); });
    console.log(Object.keys(miss).length ? Object.keys(miss).join("\n") : "Every ingredient placed.");
    var all = R.map(function (r) { return [r.id, nutritionOf(r).n, r.title]; }).sort(function (a, b) { return a[1].kcal - b[1].kcal; });
    console.log("lowest:", all.slice(0, 5).map(function (x) { return x[1].kcal + " " + x[2]; }).join(" | "));
    console.log("highest:", all.slice(-5).map(function (x) { return x[1].kcal + " " + x[2]; }).join(" | "));
    process.exit(0);
  }
  var src = fs.readFileSync(file, "utf8"), n = 0;
  R.forEach(function (r) {
    var nu = nutritionOf(r).n;
    var line = "      nutrition: { kcal: " + nu.kcal + ", protein: " + nu.protein + ", carbs: " + nu.carbs + ", fat: " + nu.fat + " },\n";
    var start = src.indexOf('    {\n      id: "' + r.id + '",');
    if (start === -1) throw new Error("not found " + r.id);
    var ingAt = src.indexOf("      ingredients: [", start);
    var prev = src.lastIndexOf("      nutrition: {", ingAt);
    if (prev > start) src = src.slice(0, prev) + line + src.slice(src.indexOf("\n", prev) + 1);
    else src = src.slice(0, ingAt) + line + src.slice(ingAt);
    n++;
  });
  fs.writeFileSync(file, src);
  console.log("nutrition written for " + n + " recipes");
}
