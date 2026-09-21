// Plate & List app logic
// Recipe data, planner/shopping/recipe-library UI, and persistence
// (localStorage always; Firestore too when signed in via Google, for
// cross-device sync). See firebase-config.js and README.md for setup.
(function () {
  "use strict";

  /* ============================= RECIPE DATA ============================= */
  var CAT_ORDER = ["meat", "produce", "dairy", "frozen", "store", "spice", "bakery"];
  var CAT_LABEL = {
    meat: "Meat & fish", produce: "Fresh produce", dairy: "Dairy & eggs", frozen: "Frozen",
    store: "Store cupboard", spice: "Spices & seasoning", bakery: "Bakery"
  };
  var TAG_COLOR = { vegetarian: "good", vegan: "good", spicy: "spicy", pescatarian: "info", quick: "accent-2" };

  function ing(amt, unit, item, cat) { return { amt: amt, unit: unit, item: item, cat: cat }; }

  var RECIPES = [
    {
      id: "d1", title: "Sticky Hoisin Pork with Egg-Fried Rice", tags: ["quick"],
      prep: 6, cook: 10,
      ingredients: [
        ing(150, "g", "pork loin steak, sliced into strips", "meat"), ing(2, "tbsp", "hoisin sauce", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tsp", "grated fresh ginger", "produce"), ing(150, "g", "cooked rice, cold", "store"),
        ing(1, "", "egg", "dairy"), ing(60, "g", "frozen peas", "frozen"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "spring onion", "produce")
      ],
      steps: [
        "Slice the pork into thin strips.",
        "Heat the vegetable oil in a wok or large frying pan over high heat and stir-fry the pork for 3–4 minutes until browned and cooked through.",
        "Add the garlic, ginger, hoisin and soy sauce, and toss to coat. Cook for 1 minute, then tip out and set aside.",
        "Wipe out the pan, add a touch more oil if needed, and tip in the cold rice and peas, breaking up any clumps. Stir-fry for 2–3 minutes until hot through.",
        "Push the rice to one side, crack in the egg, and scramble it into the rice as it sets.",
        "Return the pork to the pan, toss everything together, and scatter with sliced spring onion."
      ]
    },
    {
      id: "d2", title: "Harissa Salmon with Lemon Couscous", tags: ["pescatarian"],
      prep: 5, cook: 12,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(1.5, "tbsp", "harissa paste", "store"),
        ing(60, "g", "couscous", "store"), ing(80, "ml", "vegetable stock", "store"),
        ing(0.5, "", "lemon", "produce"), ing(null, "small handful", "fresh parsley", "produce"),
        ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C), or heat a grill to high.",
        "Rub the salmon all over with the harissa paste and place on a lined baking tray.",
        "Roast for 10–12 minutes (or grill for 6–8 minutes) until just cooked through and flaking easily.",
        "While the salmon cooks, put the couscous in a bowl and pour over the hot stock. Cover and leave for 5 minutes until absorbed.",
        "Fluff the couscous with a fork, stir through the lemon zest, a squeeze of lemon juice, olive oil and chopped parsley.",
        "Serve the salmon on top of the couscous."
      ]
    },
    {
      id: "d3", title: "Thai Green Curry with Chicken", tags: ["spicy"],
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(2, "tbsp", "Thai green curry paste", "store"),
        ing(200, "ml", "coconut milk", "store"), ing(70, "g", "jasmine rice", "store"),
        ing(60, "g", "green beans", "produce"), ing(1, "tsp", "fish sauce", "store"),
        ing(null, "small handful", "fresh basil or coriander", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Slice the chicken into bite-sized strips and trim the green beans.",
        "Heat a splash of the coconut milk (the thick part from the top) in a wok over medium-high heat, add the curry paste and fry for 1 minute until fragrant.",
        "Add the chicken and stir-fry for 2–3 minutes until sealed.",
        "Pour in the remaining coconut milk and the green beans, and simmer for 6–8 minutes until the chicken is cooked through and the sauce has thickened slightly.",
        "Stir in the fish sauce, taste and adjust seasoning, then serve over the rice scattered with basil or coriander."
      ]
    },
    {
      id: "d4", title: "Sesame Ginger Beef Stir-Fry", tags: ["quick"],
      prep: 6, cook: 8,
      ingredients: [
        ing(130, "g", "beef frying strips", "meat"), ing(3, "tbsp", "shop-bought sesame ginger stir-fry sauce", "store"),
        ing(150, "g", "mixed stir-fry vegetables", "produce"), ing(70, "g", "noodles", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the noodles according to the packet instructions and drain.",
        "Heat the vegetable oil in a wok over high heat until smoking, then add the beef and stir-fry for 1–2 minutes until browned. Remove and set aside.",
        "Add the vegetables to the wok and stir-fry for 2–3 minutes until just tender.",
        "Return the beef to the wok with the stir-fry sauce, and toss everything together for 1 minute.",
        "Add the noodles, toss well to combine, and serve immediately."
      ]
    },
    {
      id: "d5", title: "Spiced Chickpea & Spinach Curry", tags: ["vegetarian"],
      prep: 8, cook: 12,
      ingredients: [
        ing(200, "g", "chickpeas, drained", "store"), ing(200, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tsp", "grated fresh ginger", "produce"), ing(1, "tsp", "garam masala", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(null, "large handful", "baby spinach", "produce"),
        ing(60, "g", "basmati rice", "store"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Finely chop the onion, garlic and ginger.",
        "Heat the oil in a saucepan over medium heat and fry the onion for 3–4 minutes until soft.",
        "Add the garlic, ginger, garam masala and cumin, and fry for 1 minute until fragrant.",
        "Stir in the chopped tomatoes and chickpeas, and simmer for 6–8 minutes until thickened.",
        "Stir through the spinach until wilted, season to taste, and serve with the rice."
      ]
    },
    {
      id: "d6", title: "Cajun Chicken with Charred Corn Salsa", tags: ["spicy"],
      prep: 6, cook: 12,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(1.5, "tsp", "Cajun seasoning", "spice"),
        ing(80, "g", "sweetcorn", "store"), ing(80, "g", "shop-bought fresh tomato salsa", "store"),
        ing(0.5, "", "lime", "produce"), ing(1.5, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Butterfly or flatten the chicken breast slightly for even cooking, then coat all over with the Cajun seasoning and half the olive oil.",
        "Heat a frying pan over medium-high heat and cook the chicken for 5–6 minutes each side until charred and cooked through. Rest for 2 minutes, then slice.",
        "Meanwhile, dry-fry the sweetcorn in a separate small pan over high heat for 3–4 minutes until lightly charred.",
        "Stir the charred corn through the salsa with the remaining olive oil and a squeeze of lime.",
        "Serve the sliced chicken with the corn salsa spooned over."
      ]
    },
    {
      id: "d7", title: "Quick Matar Paneer", tags: ["vegetarian"],
      prep: 8, cook: 12,
      ingredients: [
        ing(120, "g", "paneer, cubed", "dairy"), ing(60, "g", "frozen peas", "frozen"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.25, "", "onion", "produce"),
        ing(1, "", "garlic clove", "produce"), ing(1, "tsp", "grated fresh ginger", "produce"),
        ing(1, "tsp", "garam masala", "spice"), ing(0.25, "tsp", "ground turmeric", "spice"),
        ing(60, "g", "basmati rice", "store"), ing(1.5, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Cut the paneer into cubes. Heat half the oil in a frying pan over medium-high heat and fry the paneer for 2–3 minutes, turning, until golden on a couple of sides. Set aside.",
        "Finely chop the onion and garlic. Heat the remaining oil in the same pan and fry the onion for 3 minutes until soft.",
        "Add the garlic, ginger, garam masala and turmeric, and cook for 1 minute until fragrant.",
        "Stir in the chopped tomatoes and simmer for 5 minutes until thickened.",
        "Add the peas and paneer, and simmer for 2–3 minutes until the peas are cooked through. Serve with the rice."
      ]
    },
    {
      id: "d8", title: "One-Pan Chorizo & Butter Bean Stew", tags: ["quick"],
      prep: 6, cook: 12,
      ingredients: [
        ing(60, "g", "cooking chorizo", "meat"), ing(200, "g", "butter beans, drained", "store"),
        ing(200, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion", "produce"),
        ing(1, "", "garlic clove", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(null, "small handful", "fresh parsley", "produce"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Slice the chorizo and finely chop the onion and garlic.",
        "Fry the chorizo in a dry saucepan over medium heat for 2–3 minutes until it releases its red oil.",
        "Add the onion and garlic and cook for 3–4 minutes until softened.",
        "Stir in the smoked paprika, chopped tomatoes and butter beans, and simmer for 8–10 minutes until thickened.",
        "Season to taste, scatter with chopped parsley, and serve with crusty bread for dunking."
      ]
    },
    {
      id: "d9", title: "Lemon & Herb Cod with Crushed Potatoes", tags: ["pescatarian"],
      prep: 6, cook: 15,
      ingredients: [
        ing(150, "g", "cod fillet (or other firm white fish)", "meat"), ing(150, "g", "new potatoes", "produce"),
        ing(15, "g", "butter", "dairy"), ing(0.5, "", "lemon", "produce"),
        ing(null, "small handful", "fresh parsley", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "tbsp", "plain flour", "store")
      ],
      steps: [
        "Put the new potatoes in a pan of salted water, bring to the boil and cook for 12–15 minutes until tender.",
        "Meanwhile, pat the cod dry and dust lightly with the flour, seasoning with salt and pepper.",
        "Heat the olive oil in a frying pan over medium-high heat and fry the cod for 3–4 minutes on the first side until golden, then flip and cook for 2–3 minutes more until just cooked through.",
        "Drain the potatoes and return to the pan. Crush lightly with a fork, then stir through the butter, crushed garlic and chopped parsley.",
        "Squeeze lemon juice over the cod and serve on top of the crushed potatoes."
      ]
    },
    {
      id: "d10", title: "Chicken Katsu Curry", tags: [],
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(40, "g", "panko breadcrumbs", "store"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "plain flour", "store"),
        ing(150, "g", "shop-bought katsu curry sauce", "store"),
        ing(3, "tbsp", "vegetable oil, for frying", "store"), ing(70, "g", "jasmine rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Flatten the chicken breast slightly, then coat in flour, dip in beaten egg, and press into the panko breadcrumbs to coat all over.",
        "Heat the vegetable oil in a frying pan over medium heat and fry the chicken for 4–5 minutes each side until deep golden and cooked through. Drain on kitchen paper and slice.",
        "Meanwhile, warm the katsu sauce through in a small pan.",
        "Serve the sliced katsu chicken over the rice, spooning the warmed curry sauce over the top."
      ]
    },
    {
      id: "d11", title: "Creamy Garlic Mushroom Tagliatelle", tags: ["vegetarian"],
      prep: 6, cook: 10,
      ingredients: [
        ing(80, "g", "tagliatelle", "store"), ing(150, "g", "chestnut mushrooms", "produce"),
        ing(2, "", "garlic clove", "produce"), ing(80, "ml", "double cream", "dairy"),
        ing(20, "g", "parmesan, grated", "dairy"), ing(15, "g", "butter", "dairy"),
        ing(null, "few sprigs", "fresh thyme", "produce"), ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Cook the tagliatelle in salted boiling water according to the packet instructions.",
        "Slice the mushrooms and finely chop the garlic.",
        "Heat the butter and olive oil in a large frying pan over medium-high heat, add the mushrooms and fry for 4–5 minutes until golden and any liquid has evaporated.",
        "Add the garlic and thyme leaves and cook for 30 seconds until fragrant.",
        "Pour in the cream, bring to a gentle simmer, and stir in the parmesan until melted into a silky sauce.",
        "Drain the pasta, reserving a splash of cooking water, and toss it through the sauce, loosening with the pasta water if needed."
      ]
    },
    {
      id: "d12", title: "Moroccan-Spiced Lamb with Couscous", tags: [],
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(60, "g", "couscous", "store"),
        ing(80, "ml", "vegetable stock", "store"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.25, "tsp", "ground cinnamon", "spice"), ing(3, "", "dried apricots", "store"),
        ing(0.25, "", "onion", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(null, "small handful", "fresh mint", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Put the couscous in a bowl, pour over the hot stock, cover and leave for 5 minutes until absorbed.",
        "Finely chop the onion, garlic and dried apricots.",
        "Heat the olive oil in a frying pan over medium-high heat and fry the onion for 2 minutes until softened.",
        "Add the lamb mince, breaking it up with a spoon, and fry for 4–5 minutes until browned.",
        "Stir in the garlic, cumin, cinnamon and apricots, and cook for 2 more minutes.",
        "Fluff the couscous with a fork and serve the spiced lamb on top, scattered with torn mint leaves."
      ]
    },
    {
      id: "d13", title: "Peri-Peri Chicken with Charred Tenderstem", tags: ["spicy"],
      prep: 5, cook: 12,
      ingredients: [
        ing(180, "g", "boneless chicken thighs", "meat"), ing(2, "tbsp", "peri-peri sauce", "store"),
        ing(100, "g", "tenderstem broccoli", "produce"), ing(70, "g", "jasmine rice", "store"),
        ing(0.25, "", "lemon", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken thighs in the peri-peri sauce to coat.",
        "Heat a frying pan over medium-high heat and cook the chicken for 5–6 minutes each side until charred and cooked through.",
        "While the chicken cooks, blanch or steam the tenderstem broccoli for 3–4 minutes until just tender, then toss in the olive oil.",
        "Slice the chicken and serve over the rice with the charred broccoli, finished with a squeeze of lemon."
      ]
    },
    {
      id: "d14", title: "Beetroot & Goat's Cheese Orzo", tags: ["vegetarian"],
      prep: 8, cook: 8,
      ingredients: [
        ing(70, "g", "orzo pasta", "store"), ing(100, "g", "cooked beetroot (vacuum-packed)", "produce"),
        ing(50, "g", "goat's cheese", "dairy"), ing(1, "tbsp", "walnuts", "store"),
        ing(null, "handful", "baby spinach", "produce"), ing(1, "tsp", "balsamic vinegar", "store"),
        ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Cook the orzo in salted boiling water according to the packet instructions, then drain.",
        "Dice the beetroot and roughly chop the walnuts.",
        "Toss the warm orzo with the olive oil and balsamic vinegar, then stir through the spinach so it wilts slightly in the heat.",
        "Fold in the diced beetroot and crumble over the goat's cheese.",
        "Scatter with the chopped walnuts and serve."
      ]
    },
    {
      id: "d15", title: "Turkey & Sweetcorn Chilli", tags: ["quick"],
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "turkey mince", "meat"), ing(60, "g", "sweetcorn", "frozen"),
        ing(100, "g", "kidney beans, drained", "store"), ing(200, "g", "chopped tomatoes", "store"),
        ing(0.25, "", "onion", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tsp", "chilli powder", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(60, "g", "basmati rice", "store"), ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Finely chop the onion and garlic.",
        "Heat the oil in a saucepan over medium heat and fry the onion for 2–3 minutes until soft.",
        "Add the turkey mince and garlic, breaking up the mince with a spoon, and cook for 4–5 minutes until browned.",
        "Stir in the chilli powder and cumin, then add the chopped tomatoes, kidney beans and sweetcorn. Simmer for 8–10 minutes until thickened.",
        "Season to taste and serve with the rice."
      ]
    },
    {
      id: "d16", title: "Honey Mustard Chicken Traybake", tags: [],
      prep: 6, cook: 25,
      ingredients: [
        ing(180, "g", "boneless chicken thighs", "meat"), ing(150, "g", "new potatoes, halved", "produce"),
        ing(2, "tbsp", "shop-bought honey mustard sauce or dressing", "store"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "red onion", "produce"),
        ing(null, "few sprigs", "fresh thyme", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Halve the new potatoes and cut the red onion into wedges. Toss both with half the olive oil on a baking tray and roast for 10 minutes.",
        "Meanwhile, toss the chicken thighs through the honey mustard sauce to coat.",
        "Push the potatoes to one side and add the chicken to the tray, scattering with thyme sprigs.",
        "Roast for a further 15–18 minutes until the chicken is cooked through and the potatoes are tender, turning everything halfway."
      ]
    },
    {
      id: "d17", title: "Teriyaki Salmon with Sesame Greens", tags: ["pescatarian"],
      prep: 4, cook: 10,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(3, "tbsp", "shop-bought teriyaki sauce", "store"),
        ing(100, "g", "tenderstem broccoli or greens", "produce"), ing(1, "tsp", "sesame seeds", "store"),
        ing(70, "g", "jasmine rice", "store"), ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Heat the vegetable oil in a frying pan over medium heat and fry the salmon skin-side down for 4 minutes, then flip and cook for 2 minutes more.",
        "Pour the teriyaki sauce into the pan and let it bubble for 1–2 minutes, spooning it over the salmon until glossy.",
        "Meanwhile, steam or blanch the greens for 3–4 minutes until just tender.",
        "Serve the salmon and its glaze over the rice with the greens, scattered with sesame seeds."
      ]
    },
    {
      id: "d18", title: "Beef & Black Bean Noodles", tags: ["quick"],
      prep: 8, cook: 8,
      ingredients: [
        ing(130, "g", "beef frying strips", "meat"), ing(2, "tbsp", "black bean sauce", "store"),
        ing(1, "", "garlic clove", "produce"), ing(0.5, "", "pepper", "produce"),
        ing(1, "", "spring onion", "produce"), ing(70, "g", "egg noodles", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the noodles according to the packet instructions and drain.",
        "Slice the pepper and finely chop the garlic.",
        "Heat the vegetable oil in a wok over high heat and stir-fry the beef for 1–2 minutes until browned. Remove and set aside.",
        "Add the pepper to the wok and stir-fry for 2 minutes, then add the garlic and cook for 30 seconds.",
        "Return the beef to the wok with the black bean sauce and noodles, and toss everything together for 1–2 minutes until well coated.",
        "Scatter with sliced spring onion and serve."
      ]
    },
    {
      id: "d19", title: "Spiced Red Lentil Dahl with Flatbread", tags: ["vegetarian", "vegan"],
      prep: 8, cook: 15,
      ingredients: [
        ing(75, "g", "red lentils", "store"), ing(100, "g", "chopped tomatoes", "store"),
        ing(0.25, "", "onion", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tsp", "grated fresh ginger", "produce"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(250, "ml", "vegetable stock", "store"),
        ing(1, "", "flatbread", "bakery"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Rinse the red lentils under cold water.",
        "Finely chop the onion and garlic. Heat the oil in a saucepan over medium heat and fry the onion for 3 minutes until soft.",
        "Add the garlic, ginger, turmeric and cumin, and cook for 1 minute until fragrant.",
        "Stir in the lentils, chopped tomatoes and stock, and bring to the boil.",
        "Reduce the heat and simmer for 12–15 minutes, stirring occasionally, until the lentils are soft and the dahl has thickened.",
        "Season to taste and serve with the warmed flatbread."
      ]
    },
    {
      id: "d20", title: "Chicken Fajita Bowl", tags: ["quick"],
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "chicken breast, sliced", "meat"), ing(0.5, "", "pepper", "produce"),
        ing(0.5, "", "red onion", "produce"), ing(1.5, "tsp", "fajita seasoning", "spice"),
        ing(0.5, "", "lime", "produce"), ing(60, "g", "basmati rice", "store"),
        ing(null, "small handful", "fresh coriander", "produce"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Slice the chicken, pepper and red onion into strips.",
        "Heat the oil in a frying pan over high heat and fry the chicken for 3–4 minutes until starting to colour.",
        "Add the pepper and onion, and cook for 4–5 minutes more, then sprinkle over the fajita seasoning and toss well.",
        "Serve over the rice with a squeeze of lime and scattered coriander."
      ]
    },
    {
      id: "d21", title: "Pork Chop with Apple & Mustard Sauce", tags: [],
      prep: 5, cook: 12,
      ingredients: [
        ing(180, "g", "pork chop", "meat"), ing(0.5, "", "apple", "produce"),
        ing(100, "g", "shop-bought creamy mustard or peppercorn sauce", "store"),
        ing(150, "g", "new potatoes", "produce"), ing(10, "g", "butter", "dairy"),
        ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Put the new potatoes in a pan of salted water, bring to the boil and cook for 12–15 minutes until tender.",
        "Meanwhile, season the pork chop and fry in the olive oil over medium-high heat for 4–5 minutes each side until cooked through. Rest on a plate.",
        "Thinly slice the apple and add to the same pan with the butter, frying for 2 minutes until just softened.",
        "Stir in the mustard sauce and simmer for 2–3 minutes until warmed through.",
        "Drain the potatoes and serve alongside the pork chop, spooning the apple and mustard sauce over the top."
      ]
    },
    {
      id: "d22", title: "Butternut Squash & Feta Traybake", tags: ["vegetarian"],
      prep: 8, cook: 25,
      ingredients: [
        ing(200, "g", "butternut squash, cubed", "produce"), ing(50, "g", "feta cheese", "dairy"),
        ing(0.5, "", "red onion", "produce"), ing(1.5, "tbsp", "olive oil", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(null, "pinch", "chilli flakes", "spice"),
        ing(null, "small handful", "fresh parsley", "produce"), ing(50, "g", "couscous", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the squash and red onion wedges with the olive oil, cumin and chilli flakes on a baking tray.",
        "Roast for 20 minutes, then crumble the feta over the top and roast for a further 5 minutes.",
        "While the vegetables finish roasting, cover the couscous with boiling water and leave for 5 minutes, then fluff with a fork.",
        "Serve the roasted squash and feta over the couscous, scattered with chopped parsley."
      ]
    },
    {
      id: "d23", title: "Sausage & Butter Bean Cassoulet", tags: [],
      prep: 6, cook: 15,
      ingredients: [
        ing(2, "", "pork sausages", "meat"), ing(200, "g", "butter beans, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(1, "", "small carrot", "produce"),
        ing(0.25, "", "onion", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(null, "few sprigs", "fresh thyme", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Finely dice the carrot and onion, and chop the garlic.",
        "Heat the oil in a saucepan over medium heat and brown the sausages all over, about 4–5 minutes, then remove and slice into thick chunks.",
        "Add the carrot and onion to the same pan and cook for 4 minutes until softening.",
        "Add the garlic and thyme, then stir in the chopped tomatoes and butter beans, and return the sausage to the pan.",
        "Simmer for 8–10 minutes until the sauce has thickened and the sausage is cooked through."
      ]
    },
    {
      id: "d24", title: "White Fish Tacos with Lime Slaw", tags: ["pescatarian"],
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "white fish fillet (pollock or cod)", "meat"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(2, "", "soft tortillas", "bakery"),
        ing(60, "g", "red cabbage, shredded", "produce"), ing(0.5, "", "lime", "produce"),
        ing(1, "tbsp", "soured cream", "dairy"), ing(null, "small handful", "fresh coriander", "produce"),
        ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Toss the fish in the cumin, paprika and a little salt.",
        "Heat the olive oil in a frying pan over medium-high heat and fry the fish for 3–4 minutes each side until cooked through and flaking easily. Break into large chunks.",
        "Meanwhile, toss the shredded cabbage with a squeeze of lime juice.",
        "Warm the tortillas briefly in a dry pan or microwave.",
        "Fill the tortillas with the fish, lime slaw, a spoonful of soured cream and chopped coriander."
      ]
    },
    {
      id: "d25", title: "Beef Massaman-Style Curry", tags: ["spicy"],
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef frying strips", "meat"), ing(2, "tbsp", "massaman or red curry paste", "store"),
        ing(200, "ml", "coconut milk", "store"), ing(1, "", "small potato, diced", "produce"),
        ing(1, "tbsp", "roasted peanuts", "store"), ing(70, "g", "jasmine rice", "store"),
        ing(1, "tsp", "fish sauce", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Dice the potato into small chunks.",
        "Heat a splash of the coconut milk in a saucepan over medium heat, add the curry paste and fry for 1 minute until fragrant.",
        "Add the beef and potato, and stir to coat, then pour in the remaining coconut milk.",
        "Simmer for 10–12 minutes until the potato is tender and the beef is cooked through.",
        "Stir in the fish sauce, taste and adjust seasoning, then serve over the rice scattered with crushed peanuts."
      ]
    },
    {
      id: "d26", title: "Halloumi & Roasted Veg Couscous", tags: ["vegetarian"],
      prep: 8, cook: 12,
      ingredients: [
        ing(100, "g", "halloumi", "dairy"), ing(0.5, "", "courgette", "produce"),
        ing(8, "", "cherry tomatoes", "produce"), ing(60, "g", "couscous", "store"),
        ing(80, "ml", "vegetable stock", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(null, "small handful", "fresh mint", "produce"), ing(0.5, "", "lemon", "produce")
      ],
      steps: [
        "Preheat the grill to high, or use a griddle pan.",
        "Slice the courgette and halve the cherry tomatoes. Toss with half the olive oil and grill or griddle for 6–8 minutes until charred, adding the tomatoes for the last 2 minutes.",
        "Slice the halloumi and fry or griddle for 1–2 minutes each side until golden.",
        "Meanwhile, put the couscous in a bowl, pour over the hot stock, cover and leave for 5 minutes.",
        "Fluff the couscous, stir through the remaining olive oil, lemon juice and chopped mint.",
        "Top with the roasted vegetables and grilled halloumi."
      ]
    },
    {
      id: "d27", title: "Chicken Shawarma Flatbread", tags: ["spicy"],
      prep: 6, cook: 10,
      ingredients: [
        ing(150, "g", "chicken thigh fillets", "meat"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(null, "pinch", "ground cinnamon", "spice"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "", "flatbread", "bakery"), ing(2, "tbsp", "shop-bought tzatziki or garlic sauce", "store"),
        ing(0.25, "", "red onion", "produce"), ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Slice the chicken into strips and toss with the cumin, cinnamon, paprika, a pinch of salt and the olive oil.",
        "Heat a frying pan over medium-high heat and cook the chicken for 6–7 minutes, turning occasionally, until browned and cooked through.",
        "Meanwhile, thinly slice the red onion and warm the flatbread.",
        "Spread the tzatziki over the flatbread, top with the spiced chicken and red onion, then fold or roll to serve."
      ]
    },
    {
      id: "d28", title: "Sausage & Lentil One-Pot", tags: [],
      prep: 6, cook: 18,
      ingredients: [
        ing(2, "", "pork sausages", "meat"), ing(150, "g", "green or brown lentils, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(1, "", "small carrot", "produce"),
        ing(0.25, "", "onion", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(null, "few sprigs", "fresh rosemary", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Dice the carrot and onion, and chop the garlic.",
        "Heat the oil in a saucepan over medium heat and brown the sausages all over, about 5 minutes, then remove and slice.",
        "Add the carrot and onion to the pan and cook for 4–5 minutes until softened.",
        "Add the garlic and rosemary, then stir in the chopped tomatoes and lentils, and return the sausage to the pan.",
        "Simmer for 8–10 minutes until thickened and the sausage is cooked through."
      ]
    },
    {
      id: "d29", title: "Sweet & Sour Pork", tags: [],
      prep: 6, cook: 12,
      ingredients: [
        ing(150, "g", "pork loin steak, cubed", "meat"), ing(80, "g", "pineapple chunks, tinned", "store"),
        ing(0.5, "", "pepper", "produce"), ing(150, "g", "shop-bought sweet and sour sauce", "store"),
        ing(1, "tsp", "cornflour", "store"), ing(70, "g", "jasmine rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Cut the pork into bite-sized cubes and toss lightly in the cornflour.",
        "Heat the oil in a wok or frying pan over high heat and fry the pork for 4–5 minutes until browned and cooked through. Remove and set aside.",
        "Add the pepper to the pan and stir-fry for 2 minutes, then add the pineapple chunks and sweet and sour sauce, and simmer for 2 minutes until glossy.",
        "Return the pork to the pan, toss to coat, and serve over the rice."
      ]
    },
    {
      id: "d30", title: "Baked Feta Pasta", tags: ["vegetarian"],
      prep: 6, cook: 20,
      ingredients: [
        ing(200, "g", "cherry tomatoes", "produce"), ing(80, "g", "feta cheese, block", "dairy"),
        ing(2, "", "garlic clove", "produce"), ing(2, "tbsp", "olive oil", "store"),
        ing(null, "pinch", "chilli flakes", "spice"), ing(80, "g", "fusilli or penne", "store"),
        ing(null, "small handful", "fresh basil", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Put the cherry tomatoes and whole garlic cloves in a small baking dish, sit the block of feta in the middle, and drizzle everything with the olive oil and chilli flakes.",
        "Bake for 20 minutes until the tomatoes have burst and the feta is soft and lightly golden.",
        "Meanwhile, cook the pasta in salted boiling water according to the packet instructions, then drain, reserving a splash of cooking water.",
        "Mash the roasted garlic, tomatoes and feta together in the dish to make a sauce, loosening with the pasta water if needed.",
        "Toss through the pasta and scatter with torn basil."
      ]
    },
    {
      id: "d31", title: "Chicken & Chorizo Jambalaya", tags: ["spicy"],
      prep: 8, cook: 20,
      ingredients: [
        ing(100, "g", "chicken thigh, diced", "meat"), ing(40, "g", "cooking chorizo, sliced", "meat"),
        ing(70, "g", "basmati or long-grain rice", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "pepper", "produce"), ing(0.25, "", "onion", "produce"),
        ing(1, "", "garlic clove", "produce"), ing(1, "tsp", "Cajun seasoning", "spice"),
        ing(200, "ml", "chicken stock", "store")
      ],
      steps: [
        "Dice the onion and pepper, and chop the garlic.",
        "Heat a saucepan over medium heat and fry the chorizo for 2 minutes until it releases its oil, then add the chicken and brown for 3–4 minutes.",
        "Add the onion, pepper and garlic, and cook for 3 minutes until softening.",
        "Stir in the rice and Cajun seasoning, then add the chopped tomatoes and stock.",
        "Bring to a simmer, cover and cook for 15–18 minutes, stirring occasionally, until the rice is tender and the liquid is absorbed."
      ]
    },
    {
      id: "d32", title: "Beef Tacos with Pico de Gallo", tags: ["quick"],
      prep: 5, cook: 10,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(1.5, "tsp", "taco seasoning", "spice"),
        ing(80, "g", "shop-bought pico de gallo or fresh salsa", "store"),
        ing(2, "", "taco shells", "bakery"), ing(30, "g", "cheddar cheese, grated", "dairy")
      ],
      steps: [
        "Heat a frying pan over medium-high heat and cook the beef mince for 5–6 minutes, breaking it up, until browned.",
        "Stir in the taco seasoning with a splash of water and simmer for 2 minutes.",
        "Warm the taco shells according to the packet instructions.",
        "Fill with the spiced beef, pico de gallo and grated cheese."
      ]
    },
    {
      id: "d33", title: "Pan-Seared Trout with Almonds", tags: ["pescatarian"],
      prep: 5, cook: 8,
      ingredients: [
        ing(150, "g", "trout fillet", "meat"), ing(1, "tbsp", "flaked almonds", "store"),
        ing(20, "g", "butter", "dairy"), ing(0.5, "", "lemon", "produce"),
        ing(80, "g", "green beans", "produce"), ing(1, "tbsp", "plain flour", "store"),
        ing(null, "small handful", "fresh parsley", "produce")
      ],
      steps: [
        "Cook the green beans in boiling water for 4–5 minutes until just tender, then drain.",
        "Pat the trout dry and dust lightly with flour, seasoning with salt and pepper.",
        "Melt half the butter in a frying pan over medium-high heat and fry the trout skin-side down for 3–4 minutes, then flip and cook for 1–2 minutes more. Remove to a plate.",
        "Add the remaining butter and the flaked almonds to the pan and toast for 1 minute until golden.",
        "Squeeze in the lemon juice, swirl to combine, and pour over the trout. Serve with the green beans, scattered with chopped parsley."
      ]
    },
    {
      id: "d34", title: "Spiced Squash & Coconut Soup", tags: ["vegetarian", "vegan"],
      prep: 8, cook: 15,
      ingredients: [
        ing(250, "g", "butternut squash, cubed", "produce"), ing(150, "ml", "coconut milk", "store"),
        ing(250, "ml", "vegetable stock", "store"), ing(0.25, "", "onion", "produce"),
        ing(1, "", "garlic clove", "produce"), ing(1, "tsp", "grated fresh ginger", "produce"),
        ing(1, "tsp", "mild curry powder", "spice"), ing(1, "slice", "crusty bread", "bakery"),
        ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Finely chop the onion and garlic.",
        "Heat the oil in a saucepan over medium heat and fry the onion for 3 minutes until soft.",
        "Add the garlic, ginger and curry powder, and cook for 1 minute until fragrant.",
        "Add the squash, coconut milk and stock, and bring to the boil.",
        "Simmer for 12–15 minutes until the squash is tender, then blend with a stick blender until smooth.",
        "Season to taste and serve with crusty bread."
      ]
    },
    {
      id: "d35", title: "Chicken Tikka Skewers with Minted Yoghurt", tags: ["spicy"],
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "chicken breast, cubed", "meat"), ing(2, "tbsp", "natural yoghurt", "dairy"),
        ing(1.5, "tbsp", "tikka curry paste", "store"), ing(3, "tbsp", "shop-bought mint yoghurt dip or raita", "store"),
        ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Cube the chicken and toss with the yoghurt and the tikka paste to coat. Thread onto a skewer if you have one.",
        "Heat a griddle or frying pan over medium-high heat and cook the chicken for 8–10 minutes, turning regularly, until charred and cooked through.",
        "Warm the flatbread and serve alongside the chicken with the mint yoghurt dip for dipping."
      ]
    },
    {
      id: "d36", title: "Beef & Broccoli in Oyster Sauce", tags: ["quick"],
      prep: 8, cook: 8,
      ingredients: [
        ing(130, "g", "beef frying strips", "meat"), ing(120, "g", "tenderstem broccoli", "produce"),
        ing(2, "tbsp", "oyster sauce", "store"), ing(1, "tsp", "soy sauce", "store"),
        ing(1, "", "garlic clove", "produce"), ing(70, "g", "jasmine rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Chop the broccoli into bite-sized pieces and finely chop the garlic.",
        "Heat the oil in a wok over high heat and stir-fry the beef for 1–2 minutes until browned. Remove and set aside.",
        "Add the broccoli to the wok with a splash of water, cover and steam-fry for 2–3 minutes until just tender.",
        "Return the beef to the wok with the garlic, oyster sauce and soy sauce, and toss for 1 minute until glossy.",
        "Serve over the rice."
      ]
    },
    {
      id: "d37", title: "Halloumi & Vegetable Skewers with Tzatziki", tags: ["vegetarian"],
      prep: 8, cook: 10,
      ingredients: [
        ing(100, "g", "halloumi, cubed", "dairy"), ing(0.5, "", "courgette", "produce"),
        ing(6, "", "cherry tomatoes", "produce"), ing(0.5, "", "pepper", "produce"),
        ing(3, "tbsp", "shop-bought tzatziki", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "pitta bread", "bakery")
      ],
      steps: [
        "Cube the halloumi, courgette and pepper, and thread onto skewers with the cherry tomatoes. Brush with the olive oil.",
        "Heat a griddle pan over medium-high heat and cook the skewers for 8–10 minutes, turning regularly, until charred and the halloumi is golden.",
        "Warm the pitta and serve alongside the skewers with the tzatziki."
      ]
    },
    {
      id: "d38", title: "Duck Breast with Plum Sauce and Egg Noodles", tags: [],
      prep: 6, cook: 12,
      ingredients: [
        ing(1, "", "duck breast (about 150g)", "meat"), ing(2, "tbsp", "plum sauce", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(1, "", "spring onion", "produce"),
        ing(70, "g", "egg noodles", "store"), ing(80, "g", "pak choi or greens", "produce"),
        ing(1, "tsp", "sesame oil", "store")
      ],
      steps: [
        "Score the duck skin in a criss-cross pattern and season with salt.",
        "Place skin-side down in a cold frying pan and place over medium heat. Cook for 6–7 minutes until the fat has rendered and the skin is crisp, then flip and cook for 3–4 minutes more. Rest for 3 minutes, then slice.",
        "Meanwhile, cook the noodles according to the packet instructions, adding the pak choi for the last 2 minutes to wilt.",
        "Warm the plum sauce with the soy sauce in a small pan.",
        "Drain the noodles and greens, toss with the sesame oil, and top with the sliced duck. Spoon over the plum sauce and scatter with sliced spring onion."
      ]
    },
    {
      id: "d39", title: "Sausage, Kale & White Bean Stew", tags: [],
      prep: 6, cook: 15,
      ingredients: [
        ing(2, "", "pork sausages", "meat"), ing(200, "g", "cannellini beans, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(null, "large handful", "kale or cavolo nero", "produce"),
        ing(0.25, "", "onion", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Chop the onion and garlic, and roughly tear the kale.",
        "Heat the oil in a saucepan over medium heat and brown the sausages all over, about 5 minutes, then remove and slice.",
        "Add the onion and garlic to the pan and cook for 3–4 minutes until softened.",
        "Stir in the chopped tomatoes and cannellini beans, and return the sausage to the pan. Simmer for 8 minutes.",
        "Stir through the kale for the last 2–3 minutes until wilted, then season to taste."
      ]
    },
    {
      id: "d40", title: "Spiced Cauliflower & Chickpea Traybake", tags: ["vegetarian", "vegan"],
      prep: 8, cook: 25,
      ingredients: [
        ing(0.5, "", "small cauliflower", "produce"), ing(150, "g", "chickpeas, drained", "store"),
        ing(1, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(1.5, "tbsp", "olive oil", "store"), ing(0.25, "", "lemon", "produce"),
        ing(null, "small handful", "fresh coriander", "produce"), ing(1, "tbsp", "tahini", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Cut the cauliflower into florets and toss with the chickpeas, cumin, turmeric and olive oil on a baking tray.",
        "Roast for 22–25 minutes, turning halfway, until the cauliflower is tender and lightly charred.",
        "Whisk the tahini with a squeeze of lemon and a splash of water to make a drizzle.",
        "Serve the roasted cauliflower and chickpeas drizzled with the tahini and scattered with coriander."
      ]
    },
    {
      id: "d41", title: "Ginger Chicken Noodle Soup", tags: [],
      prep: 8, cook: 12,
      ingredients: [
        ing(120, "g", "chicken breast, sliced", "meat"), ing(400, "ml", "chicken stock", "store"),
        ing(1, "", "thumb-sized piece fresh ginger", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tbsp", "soy sauce", "store"), ing(60, "g", "egg noodles", "store"),
        ing(null, "handful", "pak choi or spinach", "produce"), ing(1, "", "spring onion", "produce")
      ],
      steps: [
        "Finely slice the ginger and garlic.",
        "Bring the chicken stock to a simmer in a saucepan with the ginger, garlic and soy sauce.",
        "Add the sliced chicken and simmer for 5–6 minutes until cooked through.",
        "Add the noodles and pak choi, and cook for a further 3–4 minutes until the noodles are tender.",
        "Ladle into a bowl and scatter with sliced spring onion."
      ]
    },
    {
      id: "d42", title: "Beef Bulgogi Lettuce Cups", tags: [],
      prep: 6, cook: 8,
      ingredients: [
        ing(150, "g", "beef frying strips", "meat"), ing(3, "tbsp", "shop-bought bulgogi marinade", "store"),
        ing(1, "", "little gem lettuce", "produce"), ing(1, "", "spring onion", "produce"),
        ing(0.5, "tsp", "sesame seeds", "store")
      ],
      steps: [
        "Toss the beef through the bulgogi marinade while you prepare everything else.",
        "Separate the lettuce into whole leaves and arrange on a plate.",
        "Heat a frying pan or wok over high heat and stir-fry the beef and its marinade for 2–3 minutes until browned and sticky.",
        "Spoon the beef into the lettuce leaves, scatter with sliced spring onion and sesame seeds, and eat wrapped like a taco."
      ]
    },
    {
      id: "d43", title: "Persian-Style Chicken with Saffron Rice", tags: [],
      prep: 8, cook: 20,
      ingredients: [
        ing(180, "g", "chicken thigh fillets", "meat"), ing(70, "g", "basmati rice", "store"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(null, "pinch", "saffron strands (or extra turmeric)", "spice"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(3, "", "dried apricots", "store"), ing(1.5, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions with the turmeric and saffron stirred into the water.",
        "Meanwhile, toss the chicken with the crushed garlic, a squeeze of lemon and half the olive oil.",
        "Heat the remaining oil in a frying pan over medium-high heat and cook the chicken for 6–7 minutes each side until golden and cooked through.",
        "Roughly chop the dried apricots and stir through the cooked rice.",
        "Slice the chicken and serve over the saffron rice."
      ]
    },
    {
      id: "d44", title: "Pork Meatballs in Tomato Sauce with Spaghetti", tags: [],
      prep: 5, cook: 15,
      ingredients: [
        ing(6, "", "shop-bought pork meatballs", "meat"), ing(1, "", "garlic clove", "produce"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(200, "g", "chopped tomatoes", "store"),
        ing(15, "g", "parmesan, grated", "dairy"), ing(80, "g", "spaghetti", "store"),
        ing(null, "small handful", "fresh basil", "produce"), ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Heat the olive oil in a frying pan over medium heat and fry the meatballs for 5–6 minutes, turning, until browned all over.",
        "Add the garlic, oregano and chopped tomatoes, and simmer for 8–10 minutes until the meatballs are cooked through and the sauce has thickened.",
        "Meanwhile, cook the spaghetti in salted boiling water according to the packet instructions, then drain.",
        "Toss the spaghetti through the sauce, top with grated Parmesan and torn basil."
      ]
    },
    {
      id: "d45", title: "Smoked Mackerel & Beetroot Salad", tags: ["pescatarian", "quick"],
      prep: 6, cook: 0,
      ingredients: [
        ing(100, "g", "smoked mackerel fillet", "meat"), ing(100, "g", "cooked beetroot", "produce"),
        ing(null, "large handful", "baby spinach or rocket", "produce"), ing(1, "tsp", "horseradish sauce", "store"),
        ing(1, "tbsp", "natural yoghurt", "dairy"), ing(0.25, "", "lemon", "produce"),
        ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Dice the beetroot and flake the mackerel into large pieces, discarding the skin.",
        "Whisk the horseradish and yoghurt together with a squeeze of lemon to make a dressing.",
        "Arrange the spinach or rocket on a plate, top with the beetroot and flaked mackerel.",
        "Drizzle with the horseradish dressing and serve with crusty bread."
      ]
    },
    {
      id: "d46", title: "Jerk Chicken with Rice and Peas", tags: ["spicy"],
      prep: 8, cook: 15,
      ingredients: [
        ing(180, "g", "chicken thigh fillets", "meat"), ing(1.5, "tbsp", "jerk seasoning", "spice"),
        ing(60, "g", "basmati rice", "store"), ing(100, "ml", "coconut milk", "store"),
        ing(80, "g", "kidney beans, drained", "store"), ing(1, "", "spring onion", "produce"),
        ing(0.25, "", "lime", "produce")
      ],
      steps: [
        "Rub the chicken all over with the jerk seasoning.",
        "Cook the rice with the coconut milk in place of some of the water, according to the packet instructions, stirring in the kidney beans for the last 5 minutes to heat through.",
        "Meanwhile, heat a frying pan over medium-high heat and cook the chicken for 6–7 minutes each side until charred and cooked through.",
        "Slice the chicken and serve over the rice and peas, scattered with sliced spring onion and a squeeze of lime."
      ]
    },
    {
      id: "d47", title: "Spiced Sweet Potato & Black Bean Bowl", tags: ["vegetarian", "vegan"],
      prep: 8, cook: 15,
      ingredients: [
        ing(1, "", "medium sweet potato", "produce"), ing(150, "g", "black beans, drained", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.5, "", "lime", "produce"), ing(0.5, "", "avocado", "produce"),
        ing(null, "small handful", "fresh coriander", "produce"), ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C), or use a microwave to speed things up.",
        "Cube the sweet potato and toss with the olive oil, cumin and paprika. Roast for 20 minutes, or microwave whole for 6–8 minutes until tender, then dice.",
        "Warm the black beans in a small pan with a splash of water.",
        "Slice the avocado and squeeze over the lime juice.",
        "Build the bowl with the roasted sweet potato, black beans and avocado, scattered with chopped coriander."
      ]
    },
    {
      id: "d48", title: "Beef Ragu with Pappardelle", tags: [],
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(200, "g", "chopped tomatoes", "store"),
        ing(1, "", "small carrot", "produce"), ing(0.25, "", "onion", "produce"),
        ing(1, "", "garlic clove", "produce"), ing(0.5, "tsp", "dried oregano", "spice"),
        ing(15, "g", "parmesan, grated", "dairy"), ing(80, "g", "pappardelle or tagliatelle", "store"),
        ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Finely dice the carrot and onion, and chop the garlic.",
        "Heat the oil in a saucepan over medium heat and fry the carrot and onion for 4 minutes until softened.",
        "Add the beef mince and garlic, and cook for 5–6 minutes, breaking up the mince, until browned.",
        "Stir in the chopped tomatoes and oregano, and simmer for 10–12 minutes until thickened.",
        "Meanwhile, cook the pasta in salted boiling water according to the packet instructions, then drain.",
        "Toss the pasta through the ragu and top with grated Parmesan."
      ]
    },
    {
      id: "d49", title: "Lemon Chicken Piccata with Green Beans", tags: [],
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(1, "tbsp", "capers", "store"),
        ing(0.5, "", "lemon", "produce"), ing(20, "g", "butter", "dairy"),
        ing(60, "ml", "chicken stock", "store"), ing(1, "tbsp", "plain flour", "store"),
        ing(100, "g", "green beans", "produce"), ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Slice the chicken breast horizontally into two thin escalopes and dust lightly with flour.",
        "Heat the olive oil in a frying pan over medium-high heat and fry the chicken for 3 minutes each side until golden and cooked through. Remove to a plate.",
        "Add the butter, capers, stock and a squeeze of lemon to the pan, scraping up any bits, and simmer for 1–2 minutes until slightly thickened.",
        "Meanwhile, cook the green beans in boiling water for 4–5 minutes until just tender.",
        "Spoon the caper sauce over the chicken and serve with the green beans."
      ]
    },
    {
      id: "d50", title: "Sweet Potato Katsu Curry", tags: ["vegetarian", "vegan"],
      prep: 8, cook: 15,
      ingredients: [
        ing(1, "", "medium sweet potato, sliced into rounds", "produce"), ing(40, "g", "panko breadcrumbs", "store"),
        ing(2, "tbsp", "plain flour", "store"), ing(3, "tbsp", "plant milk or milk", "dairy"),
        ing(150, "g", "shop-bought katsu curry sauce (vegan)", "store"),
        ing(70, "g", "jasmine rice", "store"), ing(3, "tbsp", "vegetable oil, for frying", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Slice the sweet potato into rounds. Coat in the flour, then the milk, then press into the panko breadcrumbs.",
        "Heat the vegetable oil in a frying pan over medium heat and fry the sweet potato rounds for 3–4 minutes each side until golden and tender. Drain on kitchen paper.",
        "Meanwhile, warm the katsu sauce through in a small pan.",
        "Serve the crispy sweet potato over the rice, spooning the warmed curry sauce over the top."
      ]
    },
    {
      id: "d51", title: "Sticky Sesame Tofu with Rice", tags: ["vegetarian", "vegan"],
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "firm tofu", "store"), ing(1.5, "tbsp", "cornflour", "store"),
        ing(3, "tbsp", "shop-bought sticky sesame or teriyaki sauce", "store"),
        ing(1, "tsp", "sesame seeds", "store"), ing(1, "", "spring onion", "produce"),
        ing(70, "g", "jasmine rice", "store"), ing(2, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Pat the tofu dry and cut into cubes, then toss in the cornflour to coat.",
        "Heat the vegetable oil in a frying pan over medium-high heat and fry the tofu for 5–6 minutes, turning occasionally, until golden and crisp on all sides.",
        "Pour the sauce over the tofu and toss for 1–2 minutes until sticky and glossy.",
        "Serve over the rice, scattered with sesame seeds and sliced spring onion."
      ]
    },
    {
      id: "d52", title: "Lamb Koftas with Tzatziki and Flatbread", tags: [],
      prep: 4, cook: 10,
      ingredients: [
        ing(4, "", "shop-bought lamb koftas", "meat"), ing(1, "tsp", "olive oil", "store"),
        ing(4, "tbsp", "shop-bought tzatziki", "store"), ing(1, "", "flatbread", "bakery"),
        ing(null, "small handful", "fresh mint", "produce")
      ],
      steps: [
        "Heat the olive oil in a frying pan over medium-high heat and cook the koftas for 8–10 minutes, turning regularly, until browned all over and cooked through.",
        "Warm the flatbread.",
        "Serve the koftas with the flatbread and tzatziki, scattered with a few mint leaves."
      ]
    }
  ];
  var RECIPES_BY_ID = {};
  RECIPES.forEach(function (r) { RECIPES_BY_ID[r.id] = r; });

  /* ============================= STATE ============================= */
  var DOW_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var state = {
    servings: 1,
    plan: [null, null, null, null, null, null, null],
    checked: {}
  };
  var currentUser = null;       // Firebase auth user, or null when signed out
  var saveTimer = null;
  var suppressSave = false;     // true while applying an incoming snapshot, to avoid re-saving it
  var LOCAL_KEY = "plateAndList.state.v1";
  var firestoreUnsub = null;    // unsubscribe fn for the live Firestore listener

  function weekMonday() {
    var d = new Date();
    var day = d.getDay(); // 0 Sun .. 6 Sat
    var diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  var MONDAY = weekMonday();

  function fmtRange() {
    var start = MONDAY;
    var end = new Date(MONDAY);
    end.setDate(end.getDate() + 6);
    var opts = { day: "numeric", month: "short" };
    return start.toLocaleDateString("en-GB", opts) + " – " + end.toLocaleDateString("en-GB", opts);
  }

  /* ============================= PERSISTENCE ============================= */
  /*
   * Two tiers of storage:
   *  - localStorage always holds the latest state, so the app works fully
   *    offline and before/without sign-in.
   *  - Firestore mirrors that state per signed-in Google account, so it
   *    follows you across devices. A live listener keeps every open tab
   *    or device in sync while signed in.
   */
  function saveLocal() {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify({
        servings: state.servings, plan: state.plan, checked: state.checked
      }));
    } catch (e) { /* localStorage unavailable - ignore */ }
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function applyState(data) {
    if (!data) return;
    if (typeof data.servings === "number") state.servings = data.servings;
    if (Array.isArray(data.plan) && data.plan.length === 7) state.plan = data.plan;
    if (data.checked && typeof data.checked === "object") state.checked = data.checked;
  }

  function setSyncStatus(text) {
    var el = document.getElementById("account-sync");
    if (el) el.textContent = text;
  }

  function scheduleSave() {
    saveLocal();
    if (suppressSave) return;
    if (!currentUser || !window.firebaseDb) return;
    setSyncStatus("Saving\u2026");
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      window.firebaseDb.collection("users").doc(currentUser.uid)
        .collection("planner").doc("state")
        .set({
          servings: state.servings,
          plan: state.plan,
          checked: state.checked,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function () { setSyncStatus("Synced"); })
        .catch(function () { setSyncStatus("Sync failed"); });
    }, 400);
  }

  function stopCloudSync() {
    if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
  }

  function startCloudSync(user) {
    stopCloudSync();
    if (!window.firebaseDb) return;
    var ref = window.firebaseDb.collection("users").doc(user.uid).collection("planner").doc("state");
    setSyncStatus("Syncing\u2026");
    firestoreUnsub = ref.onSnapshot(function (snap) {
      if (snap.exists) {
        suppressSave = true;
        applyState(snap.data());
        suppressSave = false;
        saveLocal();
        renderAll();
      } else {
        // Nothing in the cloud yet for this account - seed it from whatever
        // is currently on this device (e.g. from local/offline use).
        ref.set({
          servings: state.servings,
          plan: state.plan,
          checked: state.checked,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(function () {});
      }
      setSyncStatus("Synced");
    }, function () {
      setSyncStatus("Sync failed");
    });
  }

  function updateAccountUI(user) {
    var signedOutEl = document.getElementById("account-signed-out");
    var signedInEl = document.getElementById("account-signed-in");
    if (!signedOutEl || !signedInEl) return;
    if (user) {
      signedOutEl.hidden = true;
      signedInEl.hidden = false;
      var avatar = document.getElementById("account-avatar");
      var name = document.getElementById("account-name");
      if (avatar) { avatar.src = user.photoURL || ""; avatar.alt = user.displayName || "Account"; }
      if (name) name.textContent = user.displayName || user.email || "Signed in";
    } else {
      signedOutEl.hidden = false;
      signedInEl.hidden = true;
    }
  }

  function initPersistence() {
    applyState(loadLocal());

    if (!window.firebaseAuth) {
      // Firebase not configured (see firebase-config.js) - the app still
      // works fully, just local to this device/browser.
      renderAll();
      return;
    }

    var googleBtn = document.getElementById("google-signin-btn");
    var signoutBtn = document.getElementById("signout-btn");
    var provider = new firebase.auth.GoogleAuthProvider();

    if (googleBtn) {
      googleBtn.addEventListener("click", function () {
        window.firebaseAuth.signInWithPopup(provider).catch(function (err) {
          console.error("Sign-in failed:", err);
          setSyncStatus("Sign-in failed");
        });
      });
    }
    if (signoutBtn) {
      signoutBtn.addEventListener("click", function () {
        window.firebaseAuth.signOut();
      });
    }

    window.firebaseAuth.onAuthStateChanged(function (user) {
      currentUser = user;
      updateAccountUI(user);
      if (user) {
        startCloudSync(user);
      } else {
        stopCloudSync();
      }
      renderAll();
    });

    renderAll();
  }

  /* ============================= FORMATTING ============================= */
  var FRACTIONS = [[0.125, "⅛"], [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"]];
  function fmtAmt(amt) {
    if (amt === null || amt === undefined) return "";
    var whole = Math.floor(amt + 1e-6);
    var frac = amt - whole;
    var fracStr = "";
    for (var i = 0; i < FRACTIONS.length; i++) {
      if (Math.abs(frac - FRACTIONS[i][0]) < 0.05) { fracStr = FRACTIONS[i][1]; break; }
    }
    if (fracStr) return (whole > 0 ? whole + " " : "") + fracStr;
    var rounded = Math.round(amt * 100) / 100;
    if (Math.abs(rounded - Math.round(rounded)) < 0.01) rounded = Math.round(rounded);
    return String(rounded);
  }
  function scaledIngredientText(i) {
    if (i.amt === null) return i.unit ? (i.unit + " " + i.item) : i.item;
    var scaled = i.amt * state.servings;
    var amtStr = fmtAmt(scaled);
    return amtStr + (i.unit ? " " + i.unit : "") + " " + i.item;
  }
  function scaledAmtOnly(i) {
    if (i.amt === null) return i.unit || "to taste";
    return fmtAmt(i.amt * state.servings) + (i.unit ? " " + i.unit : "");
  }
  function totalTime(r) { return r.prep + r.cook; }
  function tagPill(tag) {
    var cls = TAG_COLOR[tag] || "accent-2";
    return '<span class="tag-pill tag-' + cls + '">' + tag + "</span>";
  }

  /* ============================= TABS ============================= */
  var panels = { planner: document.getElementById("panel-planner"), shopping: document.getElementById("panel-shopping"), recipes: document.getElementById("panel-recipes") };
  var tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabBtns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
      btn.setAttribute("aria-selected", "true");
      Object.keys(panels).forEach(function (k) { panels[k].hidden = (k !== btn.dataset.panel); });
      if (btn.dataset.panel === "shopping") renderShopping();
    });
  });

  /* ============================= SERVINGS ============================= */
  document.getElementById("servings-minus").addEventListener("click", function () {
    if (state.servings > 1) { state.servings--; onStateChanged(); }
  });
  document.getElementById("servings-plus").addEventListener("click", function () {
    if (state.servings < 8) { state.servings++; onStateChanged(); }
  });

  function onStateChanged() {
    scheduleSave();
    renderAll();
  }

  /* ============================= PLANNER RENDER ============================= */
  var dayList = document.getElementById("day-list");
  var todayIdx = (function () { var d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  function renderPlanner() {
    document.getElementById("week-range").textContent = fmtRange();
    dayList.innerHTML = "";
    for (var idx = 0; idx < 7; idx++) {
      var date = new Date(MONDAY); date.setDate(date.getDate() + idx);
      var card = document.createElement("div");
      card.className = "day-card" + (idx === todayIdx ? " is-today" : "");

      var label = document.createElement("div");
      label.className = "day-label";
      label.innerHTML = '<span class="dow">' + DOW_NAMES[idx].slice(0, 3) + '</span><span class="dom">' + date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + "</span>";
      card.appendChild(label);

      var body = document.createElement("div");
      body.className = "day-body";
      var recipeId = state.plan[idx];

      if (recipeId && RECIPES_BY_ID[recipeId]) {
        var r = RECIPES_BY_ID[recipeId];
        var assigned = document.createElement("button");
        assigned.className = "assigned";
        assigned.innerHTML =
          '<span class="swatch" style="background:var(--' + (TAG_COLOR[r.tags[0]] || "border") + ')"></span>' +
          '<span class="info"><span class="title">' + r.title + '</span>' +
          '<span class="meta">' + r.prep + '+' + r.cook + ' min &middot; ' + r.tags.map(function(t){return t;}).join(", ") + '</span></span>';
        assigned.addEventListener("click", function (rid) { return function () { openRecipeModal(rid, { dayIdx: idx }); }; }(recipeId));
        body.appendChild(assigned);

        var actions = document.createElement("div");
        actions.className = "day-actions";
        var swapBtn = document.createElement("button");
        swapBtn.className = "icon-btn"; swapBtn.setAttribute("aria-label", "Change dinner"); swapBtn.textContent = "↻";
        swapBtn.addEventListener("click", function (i) { return function () { openPicker(i); }; }(idx));
        var removeBtn = document.createElement("button");
        removeBtn.className = "icon-btn"; removeBtn.setAttribute("aria-label", "Remove"); removeBtn.textContent = "✕";
        removeBtn.addEventListener("click", function (i) { return function () { state.plan[i] = null; onStateChanged(); }; }(idx));
        actions.appendChild(swapBtn); actions.appendChild(removeBtn);
        body.appendChild(actions);
      } else {
        var emptyBtn = document.createElement("button");
        emptyBtn.className = "day-empty-btn";
        emptyBtn.innerHTML = '<span class="plus-badge">+</span> Add a dinner';
        emptyBtn.addEventListener("click", function (i) { return function () { openPicker(i); }; }(idx));
        body.appendChild(emptyBtn);
      }
      card.appendChild(body);
      dayList.appendChild(card);
    }
    var planned = state.plan.filter(Boolean).length;
    document.getElementById("planner-count").textContent = planned + "/7";
  }

  document.getElementById("fill-week-btn").addEventListener("click", function () {
    var used = state.plan.filter(Boolean);
    var pool = RECIPES.map(function (r) { return r.id; }).filter(function (id) { return used.indexOf(id) === -1; });
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    var pi = 0;
    for (var d = 0; d < 7; d++) {
      if (!state.plan[d]) {
        if (pi >= pool.length) { pool = RECIPES.map(function (r) { return r.id; }); pi = 0; }
        state.plan[d] = pool[pi++];
      }
    }
    onStateChanged();
  });
  document.getElementById("clear-week-btn").addEventListener("click", function () {
    state.plan = [null, null, null, null, null, null, null];
    onStateChanged();
  });

  /* ============================= SHOPPING LIST ============================= */
  function renderShopping() {
    var content = document.getElementById("shop-content");
    var recipeIds = state.plan.filter(Boolean);
    if (recipeIds.length === 0) {
      content.innerHTML = '<p class="empty-state">Add some dinners to the week and your shopping list will build itself here.</p>';
      document.getElementById("shop-progress").textContent = "";
      return;
    }
    var groups = {}; // cat -> map(key -> {amt, unit, item, scalable, count})
    recipeIds.forEach(function (rid) {
      var r = RECIPES_BY_ID[rid];
      r.ingredients.forEach(function (i) {
        var key = i.item.toLowerCase() + "|" + (i.amt === null ? i.unit : i.unit);
        groups[i.cat] = groups[i.cat] || {};
        var g = groups[i.cat];
        if (!g[key]) g[key] = { item: i.item, unit: i.unit, amt: i.amt === null ? null : 0, count: 0, scalable: i.amt !== null };
        if (i.amt !== null) g[key].amt += i.amt * state.servings;
        g[key].count++;
      });
    });

    var total = 0, checkedCount = 0;
    var html = "";
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var keys = Object.keys(groups[cat]).sort(function (a, b) { return groups[cat][a].item.localeCompare(groups[cat][b].item); });
      html += '<div class="shop-section"><h3>' + CAT_LABEL[cat] + "</h3>";
      keys.forEach(function (key) {
        var g = groups[cat][key];
        var itemKey = cat + "|" + key;
        total++;
        var isChecked = !!state.checked[itemKey];
        if (isChecked) checkedCount++;
        var amtDisplay = g.scalable ? fmtAmt(g.amt) + (g.unit ? " " + g.unit : "") : (g.unit || "");
        var countSuffix = g.count > 1 && !g.scalable ? " ×" + g.count : "";
        html += '<label class="shop-item' + (isChecked ? " checked" : "") + '" data-key="' + itemKey.replace(/"/g, "&quot;") + '">' +
          '<input type="checkbox" ' + (isChecked ? "checked" : "") + '>' +
          '<span class="amt">' + amtDisplay + countSuffix + '</span>' +
          '<span class="name">' + g.item + '</span></label>';
      });
      html += "</div>";
    });
    content.innerHTML = html;
    document.getElementById("shop-progress").textContent = checkedCount + " of " + total + " ticked off";

    content.querySelectorAll(".shop-item").forEach(function (el) {
      el.querySelector("input").addEventListener("change", function () {
        var key = el.dataset.key;
        if (state.checked[key]) delete state.checked[key]; else state.checked[key] = true;
        el.classList.toggle("checked");
        var checkedNow = Object.keys(state.checked).length;
        scheduleSave();
        renderShopping();
      });
    });
  }

  /* ============================= RECIPES TAB ============================= */
  var activeTags = {};
  var searchTerm = "";
  var ALL_TAGS = ["vegetarian", "vegan", "pescatarian", "spicy", "quick"];

  function renderTagChips() {
    var wrap = document.getElementById("tag-chips");
    wrap.innerHTML = "";
    ALL_TAGS.forEach(function (t) {
      var chip = document.createElement("button");
      chip.className = "chip"; chip.type = "button"; chip.textContent = t;
      chip.setAttribute("aria-pressed", activeTags[t] ? "true" : "false");
      chip.addEventListener("click", function () {
        activeTags[t] = !activeTags[t];
        renderTagChips(); renderRecipeGrid();
      });
      wrap.appendChild(chip);
    });
  }

  function renderRecipeGrid() {
    var grid = document.getElementById("recipe-grid");
    var activeList = Object.keys(activeTags).filter(function (t) { return activeTags[t]; });
    var term = searchTerm.trim().toLowerCase();
    var filtered = RECIPES.filter(function (r) {
      if (activeList.length && !activeList.every(function (t) { return r.tags.indexOf(t) !== -1; })) return false;
      if (!term) return true;
      if (r.title.toLowerCase().indexOf(term) !== -1) return true;
      return r.ingredients.some(function (i) { return i.item.toLowerCase().indexOf(term) !== -1; });
    });
    grid.innerHTML = "";
    if (!filtered.length) {
      grid.innerHTML = '<p class="empty-state">Nothing matches that search.</p>';
    }
    filtered.forEach(function (r) {
      var card = document.createElement("button");
      card.className = "recipe-card";
      card.innerHTML =
        '<div class="top-row"><span class="title">' + r.title + '</span><span class="time">' + r.prep + "+" + r.cook + " min</span></div>" +
        '<div class="tag-row">' + r.tags.map(tagPill).join("") + "</div>";
      card.addEventListener("click", function () { openRecipeModal(r.id, { fromLibrary: true }); });
      grid.appendChild(card);
    });
    document.getElementById("recipes-count").textContent = RECIPES.length;
  }
  document.getElementById("recipe-search").addEventListener("input", function (e) { searchTerm = e.target.value; renderRecipeGrid(); });

  /* ============================= RECIPE MODAL ============================= */
  var recipeBackdrop = document.getElementById("recipe-modal-backdrop");
  var recipeModal = document.getElementById("recipe-modal");

  function openRecipeModal(recipeId, ctx) {
    var r = RECIPES_BY_ID[recipeId];
    if (!r) return;
    var servingsNote = state.servings > 1
      ? "Written for one; scaled here ×" + state.servings + "."
      : "Written for one.";
    var ingredientsHtml = r.ingredients.map(function (i) {
      return '<div class="ingredient-row"><span class="amt">' + scaledAmtOnly(i) + '</span><span>' + i.item + "</span></div>";
    }).join("");
    var stepsHtml = r.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("");

    var actionsHtml = "";
    if (ctx && ctx.dayIdx !== undefined) {
      actionsHtml = '<div class="modal-actions">' +
        '<button class="btn btn-primary" id="modal-swap-btn">Swap for something else</button>' +
        '<button class="btn btn-ghost" id="modal-remove-btn">Remove from this day</button></div>';
    } else {
      actionsHtml = '<h3>Add to a day</h3><div class="day-pick-row" id="modal-day-picks"></div>';
    }

    recipeModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="modal-close-btn" aria-label="Close">✕</button></div>' +
      "<h2>" + r.title + "</h2>" +
      '<div class="tag-row">' + r.tags.map(tagPill).join("") + "</div>" +
      '<div class="modal-meta"><span>Prep ' + r.prep + ' min</span><span>Cook ' + r.cook + ' min</span><span>Serves ' + state.servings + '</span></div>' +
      '<p style="color:var(--ink-muted); font-size:13px;">' + servingsNote + "</p>" +
      "<h3>Ingredients</h3>" + ingredientsHtml +
      "<h3>Method</h3><ol class=\"steps\">" + stepsHtml + "</ol>" +
      actionsHtml;

    recipeBackdrop.hidden = false;
    document.getElementById("modal-close-btn").addEventListener("click", closeRecipeModal);

    if (ctx && ctx.dayIdx !== undefined) {
      document.getElementById("modal-swap-btn").addEventListener("click", function () { closeRecipeModal(); openPicker(ctx.dayIdx); });
      document.getElementById("modal-remove-btn").addEventListener("click", function () { state.plan[ctx.dayIdx] = null; onStateChanged(); closeRecipeModal(); });
    } else {
      var pickWrap = document.getElementById("modal-day-picks");
      for (var d = 0; d < 7; d++) {
        var b = document.createElement("button");
        b.className = "day-pick-btn" + (state.plan[d] === r.id ? " filled" : "");
        b.textContent = DOW_NAMES[d].slice(0, 2);
        b.title = "Add to " + DOW_NAMES[d];
        b.addEventListener("click", function (dayIdx) { return function () {
          state.plan[dayIdx] = r.id;
          onStateChanged();
          closeRecipeModal();
        }; }(d));
        pickWrap.appendChild(b);
      }
    }
  }
  function closeRecipeModal() { recipeBackdrop.hidden = true; recipeModal.innerHTML = ""; }
  recipeBackdrop.addEventListener("click", function (e) { if (e.target === recipeBackdrop) closeRecipeModal(); });

  /* ============================= PICKER MODAL ============================= */
  var pickerBackdrop = document.getElementById("picker-modal-backdrop");
  var pickerModal = document.getElementById("picker-modal");

  function openPicker(dayIdx) {
    var date = new Date(MONDAY); date.setDate(date.getDate() + dayIdx);
    var rows = RECIPES.map(function (r) {
      return '<button class="picker-row" data-id="' + r.id + '">' +
        '<span class="swatch" style="background:var(--' + (TAG_COLOR[r.tags[0]] || "border") + ')"></span>' +
        '<span><span class="title">' + r.title + '</span><br><span class="meta">' + r.prep + '+' + r.cook + ' min' + (r.tags.length ? " · " + r.tags.join(", ") : "") + '</span></span>' +
        "</button>";
    }).join("");
    pickerModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="picker-close-btn" aria-label="Close">✕</button></div>' +
      "<h2>Pick a dinner for " + DOW_NAMES[dayIdx] + "</h2>" +
      '<p style="color:var(--ink-muted); font-size:13px;">' + date.toLocaleDateString("en-GB", { day: "numeric", month: "long" }) + "</p>" +
      '<div class="picker-list">' + rows + "</div>" +
      '<button class="btn btn-ghost" id="picker-surprise-btn" style="margin-top:14px;">Surprise me</button>';
    pickerBackdrop.hidden = false;
    document.getElementById("picker-close-btn").addEventListener("click", closePicker);
    pickerModal.querySelectorAll(".picker-row").forEach(function (row) {
      row.addEventListener("click", function () {
        state.plan[dayIdx] = row.dataset.id;
        onStateChanged();
        closePicker();
      });
    });
    document.getElementById("picker-surprise-btn").addEventListener("click", function () {
      var pick = RECIPES[Math.floor(Math.random() * RECIPES.length)];
      state.plan[dayIdx] = pick.id;
      onStateChanged();
      closePicker();
    });
  }
  function closePicker() { pickerBackdrop.hidden = true; pickerModal.innerHTML = ""; }
  pickerBackdrop.addEventListener("click", function (e) { if (e.target === pickerBackdrop) closePicker(); });

  /* ============================= INIT ============================= */
  function renderAll() {
    document.getElementById("servings-value").textContent = state.servings;
    renderPlanner();
    renderRecipeGrid();
    if (!panels.shopping.hidden) renderShopping();
  }
  renderTagChips();
  initPersistence();
})();
