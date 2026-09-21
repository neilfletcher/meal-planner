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
      id: "d1", title: "Sticky Hoisin Pork with Egg-Fried Rice", tags: ["quick"], cuisine: "China", protein: "pork",
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
      id: "d2", title: "Harissa Salmon with Lemon Couscous", tags: ["pescatarian"], cuisine: "Morocco", protein: "fish",
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
      id: "d3", title: "Thai Green Curry with Chicken", tags: ["spicy"], cuisine: "Thailand", protein: "chicken",
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
      id: "d4", title: "Sesame Ginger Beef Stir-Fry", tags: ["quick"], cuisine: "China", protein: "beef",
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
      id: "d5", title: "Spiced Chickpea & Spinach Curry", tags: ["vegetarian"], cuisine: "India", protein: "plant-based",
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
      id: "d6", title: "Cajun Chicken with Charred Corn Salsa", tags: ["spicy"], cuisine: "USA", protein: "chicken",
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
      id: "d7", title: "Quick Matar Paneer", tags: ["vegetarian"], cuisine: "India", protein: "plant-based",
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
      id: "d8", title: "One-Pan Chorizo & Butter Bean Stew", tags: ["quick"], cuisine: "Spain", protein: "pork",
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
      id: "d9", title: "Lemon & Herb Cod with Crushed Potatoes", tags: ["pescatarian"], cuisine: "UK", protein: "fish",
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
      id: "d10", title: "Chicken Katsu Curry", tags: [], cuisine: "Japan", protein: "chicken",
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
      id: "d11", title: "Creamy Garlic Mushroom Tagliatelle", tags: ["vegetarian"], cuisine: "Italy", protein: "plant-based",
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
      id: "d12", title: "Moroccan-Spiced Lamb with Couscous", tags: [], cuisine: "Morocco", protein: "lamb",
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
      id: "d13", title: "Peri-Peri Chicken with Charred Tenderstem", tags: ["spicy"], cuisine: "Portugal", protein: "chicken",
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
      id: "d14", title: "Beetroot & Goat's Cheese Orzo", tags: ["vegetarian"], cuisine: "Greece", protein: "plant-based",
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
      id: "d15", title: "Turkey & Sweetcorn Chilli", tags: ["quick"], cuisine: "USA", protein: "turkey",
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
      id: "d16", title: "Honey Mustard Chicken Traybake", tags: [], cuisine: "UK", protein: "chicken",
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
      id: "d17", title: "Teriyaki Salmon with Sesame Greens", tags: ["pescatarian"], cuisine: "Japan", protein: "fish",
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
      id: "d18", title: "Beef & Black Bean Noodles", tags: ["quick"], cuisine: "China", protein: "beef",
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
      id: "d19", title: "Spiced Red Lentil Dahl with Flatbread", tags: ["vegetarian", "vegan"], cuisine: "India", protein: "plant-based",
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
      id: "d20", title: "Chicken Fajita Bowl", tags: ["quick"], cuisine: "Mexico", protein: "chicken",
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
      id: "d21", title: "Pork Chop with Apple & Mustard Sauce", tags: [], cuisine: "France", protein: "pork",
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
      id: "d22", title: "Butternut Squash & Feta Traybake", tags: ["vegetarian"], cuisine: "Greece", protein: "plant-based",
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
      id: "d23", title: "Sausage & Butter Bean Cassoulet", tags: [], cuisine: "France", protein: "pork",
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
      id: "d24", title: "White Fish Tacos with Lime Slaw", tags: ["pescatarian"], cuisine: "Mexico", protein: "fish",
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
      id: "d25", title: "Beef Massaman-Style Curry", tags: ["spicy"], cuisine: "Thailand", protein: "beef",
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
      id: "d26", title: "Halloumi & Roasted Veg Couscous", tags: ["vegetarian"], cuisine: "Cyprus", protein: "plant-based",
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
      id: "d27", title: "Chicken Shawarma Flatbread", tags: ["spicy"], cuisine: "Lebanon", protein: "chicken",
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
      id: "d28", title: "Sausage & Lentil One-Pot", tags: [], cuisine: "France", protein: "pork",
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
      id: "d29", title: "Sweet & Sour Pork", tags: [], cuisine: "China", protein: "pork",
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
      id: "d30", title: "Baked Feta Pasta", tags: ["vegetarian"], cuisine: "Greece", protein: "plant-based",
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
      id: "d31", title: "Chicken & Chorizo Jambalaya", tags: ["spicy"], cuisine: "USA", protein: "chicken",
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
      id: "d32", title: "Beef Tacos with Pico de Gallo", tags: ["quick"], cuisine: "Mexico", protein: "beef",
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
      id: "d33", title: "Pan-Seared Trout with Almonds", tags: ["pescatarian"], cuisine: "France", protein: "fish",
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
      id: "d34", title: "Spiced Squash & Coconut Soup", tags: ["vegetarian", "vegan"], cuisine: "Thailand", protein: "plant-based",
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
      id: "d35", title: "Chicken Tikka Skewers with Minted Yoghurt", tags: ["spicy"], cuisine: "India", protein: "chicken",
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
      id: "d36", title: "Beef & Broccoli in Oyster Sauce", tags: ["quick"], cuisine: "China", protein: "beef",
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
      id: "d37", title: "Halloumi & Vegetable Skewers with Tzatziki", tags: ["vegetarian"], cuisine: "Greece", protein: "plant-based",
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
      id: "d38", title: "Duck Breast with Plum Sauce and Egg Noodles", tags: [], cuisine: "China", protein: "duck",
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
      id: "d39", title: "Sausage, Kale & White Bean Stew", tags: [], cuisine: "Italy", protein: "pork",
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
      id: "d40", title: "Spiced Cauliflower & Chickpea Traybake", tags: ["vegetarian", "vegan"], cuisine: "India", protein: "plant-based",
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
      id: "d41", title: "Ginger Chicken Noodle Soup", tags: [], cuisine: "China", protein: "chicken",
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
      id: "d42", title: "Beef Bulgogi Lettuce Cups", tags: [], cuisine: "Korea", protein: "beef",
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
      id: "d43", title: "Persian-Style Chicken with Saffron Rice", tags: [], cuisine: "Iran", protein: "chicken",
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
      id: "d44", title: "Pork Meatballs in Tomato Sauce with Spaghetti", tags: [], cuisine: "Italy", protein: "pork",
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
      id: "d45", title: "Smoked Mackerel & Beetroot Salad", tags: ["pescatarian", "quick"], cuisine: "UK", protein: "fish",
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
      id: "d46", title: "Jerk Chicken with Rice and Peas", tags: ["spicy"], cuisine: "Jamaica", protein: "chicken",
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
      id: "d47", title: "Spiced Sweet Potato & Black Bean Bowl", tags: ["vegetarian", "vegan"], cuisine: "Mexico", protein: "plant-based",
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
      id: "d48", title: "Beef Ragu with Pappardelle", tags: [], cuisine: "Italy", protein: "beef",
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
      id: "d49", title: "Lemon Chicken Piccata with Green Beans", tags: [], cuisine: "Italy", protein: "chicken",
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
      id: "d50", title: "Sweet Potato Katsu Curry", tags: ["vegetarian", "vegan"], cuisine: "Japan", protein: "plant-based",
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
      id: "d51", title: "Sticky Sesame Tofu with Rice", tags: ["vegetarian", "vegan"], cuisine: "China", protein: "plant-based",
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
      id: "d52", title: "Lamb Koftas with Tzatziki and Flatbread", tags: [], cuisine: "Greece", protein: "lamb",
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
    },
    {
      id: "d53", title: "Korean Gochujang Chicken Traybake", tags: ["spicy"], cuisine: "Korea", protein: "chicken",
      prep: 8, cook: 22,
      ingredients: [
        ing(180, "g", "boneless chicken thighs, cut into chunks", "meat"), ing(150, "g", "tenderstem broccoli", "produce"),
        ing(1, "tbsp", "gochujang (Korean chilli paste)", "store"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "honey", "store"), ing(1, "tsp", "sesame oil", "store"),
        ing(1, "", "garlic clove", "produce"), ing(1, "tsp", "sesame seeds", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Mix the gochujang, soy sauce, honey, sesame oil and crushed garlic, then toss through the chicken.",
        "Spread the chicken over a lined baking tray and roast for 12 minutes.",
        "Add the broccoli to the tray, tossing it through any juices, and roast for a further 8–10 minutes until the chicken is cooked through and the broccoli is tender.",
        "Scatter with sesame seeds to serve."
      ]
    },
    {
      id: "d54", title: "Sausage, Apple & Red Onion Traybake", tags: [], cuisine: "UK", protein: "pork",
      prep: 6, cook: 25,
      ingredients: [
        ing(3, "", "pork sausages", "meat"), ing(1, "", "apple, cored and cut into wedges", "produce"),
        ing(1, "", "red onion, cut into wedges", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tsp", "wholegrain mustard", "store"), ing(null, "few sprigs", "fresh thyme", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the sausages, apple wedges and red onion with the olive oil on a baking tray.",
        "Roast for 15 minutes.",
        "Turn everything, drizzle with the mustard and scatter over the thyme, then roast for a further 10 minutes until the sausages are browned and cooked through.",
        "Serve straight from the tray."
      ]
    },
    {
      id: "d55", title: "Moroccan-Spiced Cod Traybake with Chickpeas", tags: ["pescatarian"], cuisine: "Morocco", protein: "fish",
      prep: 7, cook: 18,
      ingredients: [
        ing(150, "g", "cod fillet", "meat"), ing(200, "g", "tinned chickpeas, drained", "store"),
        ing(100, "g", "cherry tomatoes", "produce"), ing(1, "tsp", "ras el hanout", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "lemon", "produce"),
        ing(null, "small handful", "fresh coriander", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the chickpeas and cherry tomatoes with half the oil and the ras el hanout on a baking tray, and roast for 8 minutes.",
        "Rub the cod with the remaining oil, nestle it on top of the chickpeas, and squeeze over the lemon juice.",
        "Roast for a further 10 minutes until the cod flakes easily.",
        "Scatter with coriander to serve."
      ]
    },
    {
      id: "d56", title: "Harissa Chickpea & Sweet Potato Traybake", tags: ["vegetarian", "vegan"], cuisine: "Morocco", protein: "plant-based",
      prep: 8, cook: 25,
      ingredients: [
        ing(200, "g", "sweet potato, cubed", "produce"), ing(200, "g", "tinned chickpeas, drained", "store"),
        ing(1.5, "tbsp", "harissa paste", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.5, "", "red onion, cut into wedges", "produce"), ing(null, "small handful", "fresh coriander", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the sweet potato with the oil and half the harissa on a baking tray, and roast for 15 minutes.",
        "Add the chickpeas and red onion, tossed through the remaining harissa, and roast for a further 10 minutes until the sweet potato is tender and caramelised at the edges.",
        "Scatter with coriander to serve."
      ]
    },
    {
      id: "d57", title: "Sticky Soy Salmon Traybake with Broccoli", tags: ["pescatarian", "quick"], cuisine: "China", protein: "fish",
      prep: 5, cook: 12,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(120, "g", "tenderstem broccoli", "produce"),
        ing(1.5, "tbsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(1, "tsp", "sesame oil", "store"), ing(1, "tsp", "sesame seeds", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Mix the soy sauce, honey and sesame oil, and brush half over the salmon on a lined baking tray.",
        "Add the broccoli to the tray and brush with the remaining glaze.",
        "Roast for 10–12 minutes until the salmon is just cooked through and the broccoli is tender.",
        "Scatter with sesame seeds to serve."
      ]
    },
    {
      id: "d58", title: "Cajun Sausage & Pepper Traybake", tags: ["spicy"], cuisine: "USA", protein: "pork",
      prep: 6, cook: 25,
      ingredients: [
        ing(3, "", "pork sausages", "meat"), ing(1, "", "pepper, sliced", "produce"),
        ing(0.5, "", "red onion, sliced", "produce"), ing(1.5, "tsp", "Cajun seasoning", "spice"),
        ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the sausages, pepper and red onion with the oil and Cajun seasoning on a baking tray.",
        "Roast for 20–25 minutes, turning halfway, until the sausages are cooked through and the vegetables are charred at the edges."
      ]
    },
    {
      id: "d59", title: "Lemon Herb Chicken Thigh Traybake with New Potatoes", tags: [], cuisine: "UK", protein: "chicken",
      prep: 6, cook: 28,
      ingredients: [
        ing(180, "g", "boneless chicken thighs", "meat"), ing(150, "g", "new potatoes, halved", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "lemon", "produce"),
        ing(1, "tsp", "dried mixed herbs", "spice"), ing(1, "", "garlic clove", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the potatoes with half the oil on a baking tray and roast for 10 minutes.",
        "Toss the chicken with the remaining oil, the dried herbs, crushed garlic and lemon zest, then add to the tray with the potatoes.",
        "Squeeze over the lemon juice and roast for a further 16–18 minutes until the chicken is cooked through and the potatoes are tender."
      ]
    },
    {
      id: "d60", title: "Chorizo & New Potato Traybake with Peppers", tags: ["spicy"], cuisine: "Spain", protein: "pork",
      prep: 6, cook: 25,
      ingredients: [
        ing(80, "g", "cooking chorizo, sliced", "meat"), ing(150, "g", "new potatoes, halved", "produce"),
        ing(1, "", "pepper, sliced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tsp", "smoked paprika", "spice")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the potatoes with the oil and smoked paprika on a baking tray, and roast for 12 minutes.",
        "Add the chorizo and pepper to the tray, and roast for a further 13 minutes until the potatoes are tender and the chorizo is crisping at the edges."
      ]
    },
    {
      id: "d61", title: "Halloumi & Vegetable Traybake with Chilli Honey", tags: ["vegetarian"], cuisine: "Cyprus", protein: "plant-based",
      prep: 7, cook: 20,
      ingredients: [
        ing(100, "g", "halloumi, sliced", "dairy"), ing(1, "", "courgette, sliced", "produce"),
        ing(1, "", "pepper, sliced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tbsp", "honey", "store"), ing(0.5, "tsp", "chilli flakes", "spice")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the courgette and pepper with the oil on a baking tray and roast for 12 minutes.",
        "Add the halloumi slices to the tray and roast for a further 8 minutes until golden.",
        "Warm the honey with the chilli flakes and drizzle over everything to serve."
      ]
    },
    {
      id: "d62", title: "Greek-Style Chicken Traybake with Feta and Olives", tags: [], cuisine: "Greece", protein: "chicken",
      prep: 7, cook: 25,
      ingredients: [
        ing(180, "g", "boneless chicken thighs", "meat"), ing(100, "g", "cherry tomatoes", "produce"),
        ing(0.5, "", "red onion, cut into wedges", "produce"), ing(40, "g", "feta, crumbled", "dairy"),
        ing(6, "", "pitted olives", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tsp", "dried oregano", "spice")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the chicken, tomatoes and red onion with the oil and oregano on a baking tray.",
        "Roast for 20–22 minutes until the chicken is cooked through.",
        "Scatter over the feta and olives and roast for a final 3 minutes to warm through."
      ]
    },
    {
      id: "d63", title: "Filipino-Style Pork Adobo with Rice", tags: [], cuisine: "Philippines", protein: "pork",
      prep: 8, cook: 20,
      ingredients: [
        ing(180, "g", "pork shoulder or loin, cubed", "meat"), ing(2, "tbsp", "soy sauce", "store"),
        ing(2, "tbsp", "white or rice vinegar", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "", "bay leaf", "spice"), ing(0.25, "tsp", "black peppercorns", "spice"),
        ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Brown the pork in a dry pan over medium-high heat for 3–4 minutes.",
        "Add the soy sauce, vinegar, garlic, bay leaf, peppercorns and a splash of water.",
        "Bring to a simmer, cover and cook for 12–15 minutes until the pork is tender and the sauce has reduced slightly.",
        "Serve over the rice."
      ]
    },
    {
      id: "d64", title: "Vietnamese-Style Caramel Pork with Rice", tags: [], cuisine: "Vietnam", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1.5, "tbsp", "fish sauce", "store"),
        ing(1.5, "tbsp", "brown sugar", "store"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tsp", "grated fresh ginger", "produce"), ing(1, "", "spring onion", "produce"),
        ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Melt the sugar in a dry saucepan over medium heat until it turns a deep caramel colour, watching closely so it doesn't burn.",
        "Add the pork mince and brown for 3–4 minutes, breaking it up as it cooks.",
        "Stir in the fish sauce, garlic and ginger with a splash of water, and simmer for 5 minutes until sticky.",
        "Serve over the rice, scattered with sliced spring onion."
      ]
    },
    {
      id: "d65", title: "Kung Pao-Style Chicken with Peanuts", tags: ["spicy"], cuisine: "China", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(180, "g", "chicken breast, diced", "meat"), ing(30, "g", "roasted peanuts", "store"),
        ing(1, "", "pepper, diced", "produce"), ing(2, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "rice vinegar", "store"), ing(1, "tsp", "chilli flakes", "spice"),
        ing(1, "", "garlic clove", "produce"), ing(1, "tsp", "cornflour", "store"),
        ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Toss the chicken in the cornflour to coat.",
        "Heat a splash of oil in a wok over high heat and stir-fry the chicken for 4–5 minutes until browned and cooked through.",
        "Add the pepper, garlic and chilli flakes, and stir-fry for 2 minutes.",
        "Pour in the soy sauce and vinegar, simmer for 1–2 minutes, then stir through the peanuts.",
        "Serve over the rice."
      ]
    },
    {
      id: "d66", title: "Egg & Vegetable Chow Mein", tags: ["vegetarian", "quick"], cuisine: "China", protein: "plant-based",
      prep: 8, cook: 8,
      ingredients: [
        ing(100, "g", "dried egg noodles", "store"), ing(2, "", "eggs", "dairy"),
        ing(100, "g", "stir-fry vegetable mix", "produce"), ing(1.5, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "sesame oil", "store"), ing(1, "", "garlic clove", "produce")
      ],
      steps: [
        "Cook the noodles according to the packet instructions, then drain.",
        "Beat the eggs and scramble in a wok or frying pan over medium heat until just set, then set aside.",
        "Stir-fry the vegetables and garlic for 3 minutes.",
        "Add the noodles and soy sauce, and toss for 1–2 minutes until hot through.",
        "Fold the egg back through and drizzle with sesame oil to serve."
      ]
    },
    {
      id: "d67", title: "Char Siu-Style Pork Steaks with Steamed Rice", tags: [], cuisine: "China", protein: "pork",
      prep: 6, cook: 15,
      ingredients: [
        ing(180, "g", "pork loin steak", "meat"), ing(2, "tbsp", "hoisin sauce", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(0.5, "tsp", "Chinese five spice", "spice"), ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Mix the hoisin, soy sauce, honey and five spice, and coat the pork all over.",
        "Heat a frying pan or griddle over medium-high heat and cook the pork for 6–7 minutes each side, basting with any extra marinade, until glazed and cooked through.",
        "Rest for 2 minutes, then slice and serve with the rice."
      ]
    },
    {
      id: "d68", title: "Thai Basil Pork (Pad Krapow)", tags: ["spicy", "quick"], cuisine: "Thailand", protein: "pork",
      prep: 6, cook: 8,
      ingredients: [
        ing(180, "g", "pork mince", "meat"), ing(1, "tbsp", "fish sauce", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(1, "tsp", "brown sugar", "store"),
        ing(1, "", "red chilli", "produce"), ing(2, "", "garlic cloves", "produce"),
        ing(null, "handful", "fresh basil leaves", "produce"), ing(1, "", "egg", "dairy"),
        ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Fry the crushed garlic and sliced chilli in a splash of oil over high heat for 30 seconds.",
        "Add the pork mince and brown for 4–5 minutes, breaking it up as it cooks.",
        "Stir in the fish sauce, soy sauce and sugar, and cook for 1–2 minutes, then stir through the basil leaves.",
        "Fry the egg separately in a little oil, keeping the yolk runny.",
        "Serve the pork over the rice, topped with the fried egg."
      ]
    },
    {
      id: "d69", title: "Thai Peanut Noodles with Tofu", tags: ["vegetarian", "vegan"], cuisine: "Thailand", protein: "plant-based",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "firm tofu, cubed", "store"), ing(100, "g", "flat rice noodles", "store"),
        ing(2, "tbsp", "peanut butter", "store"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "sriracha or chilli sauce", "store"), ing(0.5, "", "lime", "produce"),
        ing(30, "g", "beansprouts", "produce"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Soak the rice noodles in boiled water according to the packet instructions, then drain.",
        "Pat the tofu dry, then fry in the oil over medium-high heat for 5–6 minutes until golden on all sides.",
        "Whisk the peanut butter, soy sauce, sriracha, lime juice and a splash of hot water into a smooth sauce.",
        "Add the noodles and beansprouts to the pan with the tofu, pour over the sauce, and toss for 1–2 minutes until well coated."
      ]
    },
    {
      id: "d70", title: "Butter Chicken with Basmati Rice", tags: [], cuisine: "India", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(180, "g", "chicken breast, diced", "meat"), ing(2, "tbsp", "butter chicken or tikka curry paste", "store"),
        ing(100, "ml", "passata", "store"), ing(2, "tbsp", "single cream or plain yoghurt", "dairy"),
        ing(1, "", "garlic clove", "produce"), ing(70, "g", "basmati rice", "store"),
        ing(null, "small handful", "fresh coriander", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the curry paste and crushed garlic in a splash of oil for 1 minute until fragrant.",
        "Add the chicken and cook for 3–4 minutes until sealed.",
        "Stir in the passata and simmer for 8–10 minutes until the chicken is cooked through.",
        "Stir through the cream, taste and adjust seasoning, then serve over the rice scattered with coriander."
      ]
    },
    {
      id: "d71", title: "Saag Paneer with Rice", tags: ["vegetarian"], cuisine: "India", protein: "plant-based",
      prep: 8, cook: 14,
      ingredients: [
        ing(150, "g", "paneer, cubed", "dairy"), ing(150, "g", "baby spinach", "produce"),
        ing(1, "tbsp", "medium curry powder", "spice"), ing(1, "", "garlic clove", "produce"),
        ing(2, "tbsp", "single cream or plain yoghurt", "dairy"), ing(70, "g", "basmati rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the paneer in the oil over medium-high heat for 3–4 minutes until golden, then set aside.",
        "Fry the crushed garlic and curry powder in the same pan for 1 minute, then add the spinach and cook until wilted.",
        "Blend or roughly mash the spinach mixture, stir in the cream, then return the paneer to the pan and warm through.",
        "Serve over the rice."
      ]
    },
    {
      id: "d72", title: "Chana Masala with Rice", tags: ["vegetarian", "vegan"], cuisine: "India", protein: "plant-based",
      prep: 8, cook: 15,
      ingredients: [
        ing(200, "g", "tinned chickpeas, drained", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tbsp", "medium curry powder", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(70, "g", "basmati rice", "store"), ing(null, "small handful", "fresh coriander", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and garlic in a splash of oil for 3 minutes until softening.",
        "Stir in the curry powder and cumin, and fry for 1 minute until fragrant.",
        "Add the chickpeas and chopped tomatoes, and simmer for 10 minutes until thickened.",
        "Serve over the rice, scattered with coriander."
      ]
    },
    {
      id: "d73", title: "Lamb Keema Curry with Peas", tags: [], cuisine: "India", protein: "lamb",
      prep: 8, cook: 18,
      ingredients: [
        ing(180, "g", "lamb mince", "meat"), ing(60, "g", "frozen peas", "frozen"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove", "produce"), ing(1, "tbsp", "medium curry powder or garam masala", "spice"),
        ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and garlic in a splash of oil for 3 minutes.",
        "Add the lamb mince and brown for 4–5 minutes, breaking it up as it cooks.",
        "Stir in the curry powder, then add the chopped tomatoes and simmer for 8 minutes.",
        "Stir through the peas and cook for a final 2 minutes, then serve over the rice."
      ]
    },
    {
      id: "d74", title: "Tandoori-Style Chicken with Minted Rice", tags: ["spicy"], cuisine: "India", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(180, "g", "chicken breast or thigh, sliced", "meat"), ing(2, "tbsp", "tandoori curry paste", "store"),
        ing(2, "tbsp", "plain yoghurt", "dairy"), ing(70, "g", "basmati rice", "store"),
        ing(null, "small handful", "fresh mint", "produce"), ing(0.5, "", "lemon", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions, then stir through the chopped mint.",
        "Mix the tandoori paste with the yoghurt and coat the chicken.",
        "Heat a griddle or frying pan over medium-high heat and cook the chicken for 5–6 minutes, turning occasionally, until charred and cooked through.",
        "Serve over the minted rice with a squeeze of lemon."
      ]
    },
    {
      id: "d75", title: "Falafel Bowl with Hummus and Flatbread", tags: ["vegetarian", "vegan"], cuisine: "Lebanon", protein: "plant-based",
      prep: 6, cook: 8,
      ingredients: [
        ing(6, "", "shop-bought falafel", "store"), ing(3, "tbsp", "shop-bought hummus", "store"),
        ing(1, "", "flatbread", "bakery"), ing(0.5, "", "cucumber, diced", "produce"),
        ing(80, "g", "cherry tomatoes, halved", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Warm the falafel according to the pack instructions.",
        "Warm the flatbread.",
        "Toss the cucumber and cherry tomatoes with the olive oil.",
        "Serve the falafel with the hummus, salad and flatbread."
      ]
    },
    {
      id: "d76", title: "Za'atar Chicken with Lemon Rice", tags: [], cuisine: "Lebanon", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(180, "g", "chicken thigh, sliced", "meat"), ing(1.5, "tbsp", "za'atar", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(70, "g", "basmati rice", "store"),
        ing(0.5, "", "lemon", "produce"), ing(null, "small handful", "fresh parsley", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions, then stir through the lemon zest, a squeeze of juice and the chopped parsley.",
        "Toss the chicken with the za'atar and olive oil.",
        "Heat a frying pan over medium-high heat and cook the chicken for 6–7 minutes, turning occasionally, until cooked through.",
        "Serve the chicken over the lemon rice."
      ]
    },
    {
      id: "d77", title: "Sumac Turkey Flatbread with Pickled Onion", tags: [], cuisine: "Turkey", protein: "turkey",
      prep: 8, cook: 10,
      ingredients: [
        ing(180, "g", "turkey breast steak, sliced", "meat"), ing(1, "tsp", "sumac", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "", "flatbread", "bakery"),
        ing(0.25, "", "red onion, thinly sliced", "produce"), ing(1, "tbsp", "red wine vinegar", "store"),
        ing(3, "tbsp", "shop-bought hummus", "store")
      ],
      steps: [
        "Toss the red onion with the vinegar and set aside to quick-pickle while you cook.",
        "Toss the turkey with the sumac and olive oil.",
        "Heat a frying pan over medium-high heat and cook the turkey for 3–4 minutes each side until cooked through.",
        "Warm the flatbread and spread with the hummus.",
        "Top with the sliced turkey and drained pickled onion."
      ]
    },
    {
      id: "d78", title: "Chipotle Beef Burrito Bowl", tags: ["spicy", "quick"], cuisine: "Mexico", protein: "beef",
      prep: 8, cook: 8,
      ingredients: [
        ing(180, "g", "beef mince or steak strips", "meat"), ing(1, "tsp", "chipotle paste", "store"),
        ing(150, "g", "cooked rice", "store"), ing(100, "g", "tinned black beans, drained", "store"),
        ing(60, "g", "sweetcorn", "frozen"), ing(3, "tbsp", "shop-bought salsa", "store"),
        ing(0.5, "", "avocado", "produce")
      ],
      steps: [
        "Fry the beef in a hot pan for 4–5 minutes until browned, stirring through the chipotle paste for the final minute.",
        "Warm the black beans and sweetcorn together in a small pan.",
        "Build the bowl with the rice, beans and sweetcorn, beef, salsa and sliced avocado."
      ]
    },
    {
      id: "d79", title: "Black Bean & Sweetcorn Quesadillas", tags: ["vegetarian", "quick"], cuisine: "Mexico", protein: "plant-based",
      prep: 6, cook: 8,
      ingredients: [
        ing(100, "g", "tinned black beans, drained", "store"), ing(60, "g", "sweetcorn", "frozen"),
        ing(2, "", "flour tortillas", "bakery"), ing(50, "g", "grated cheddar", "dairy"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(3, "tbsp", "shop-bought salsa", "store")
      ],
      steps: [
        "Roughly mash the black beans with the sweetcorn and smoked paprika.",
        "Spread over one tortilla, scatter with cheese, and top with the second tortilla.",
        "Dry-fry in a large pan over medium heat for 2–3 minutes each side until golden and the cheese has melted.",
        "Cut into wedges and serve with the salsa."
      ]
    },
    {
      id: "d80", title: "Chilaquiles-Style Baked Eggs with Tortilla Chips and Salsa", tags: ["vegetarian", "quick"], cuisine: "Mexico", protein: "plant-based",
      prep: 5, cook: 10,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(150, "g", "shop-bought tomato salsa", "store"),
        ing(40, "g", "tortilla chips", "store"), ing(30, "g", "grated cheddar", "dairy"),
        ing(null, "small handful", "fresh coriander", "produce")
      ],
      steps: [
        "Warm the salsa in a small ovenproof frying pan over medium heat.",
        "Make two wells in the salsa and crack in the eggs.",
        "Scatter over the cheese, cover, and cook gently for 5–6 minutes until the eggs are just set.",
        "Scatter the tortilla chips over the top just before serving, with coriander."
      ]
    },
    {
      id: "d81", title: "Jamaican-Style Chicken Curry with Rice and Peas", tags: ["spicy"], cuisine: "Jamaica", protein: "chicken",
      prep: 8, cook: 20,
      ingredients: [
        ing(180, "g", "chicken thigh, diced", "meat"), ing(1.5, "tbsp", "curry powder", "spice"),
        ing(150, "ml", "coconut milk", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove", "produce"), ing(70, "g", "rice", "store"),
        ing(80, "g", "tinned kidney beans, drained", "store")
      ],
      steps: [
        "Cook the rice with the kidney beans according to the rice packet instructions.",
        "Fry the onion and garlic in a splash of oil for 3 minutes.",
        "Stir in the curry powder and fry for 1 minute, then add the chicken and brown for 3–4 minutes.",
        "Pour in the coconut milk and simmer for 12–15 minutes until the chicken is cooked through and the sauce has thickened.",
        "Serve with the rice and peas."
      ]
    },
    {
      id: "d82", title: "Cuban-Style Black Bean Rice Bowl", tags: ["vegetarian", "vegan", "quick"], cuisine: "Cuba", protein: "plant-based",
      prep: 6, cook: 10,
      ingredients: [
        ing(150, "g", "tinned black beans, drained", "store"), ing(150, "g", "cooked rice", "store"),
        ing(0.5, "", "pepper, diced", "produce"), ing(0.25, "", "red onion, diced", "produce"),
        ing(1, "", "garlic clove", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "", "lime", "produce")
      ],
      steps: [
        "Fry the pepper, onion and garlic in a splash of oil for 4 minutes until softening.",
        "Stir in the cumin, then add the black beans and a splash of water, and simmer for 5 minutes.",
        "Serve over the rice with a squeeze of lime."
      ]
    },
    {
      id: "d83", title: "Spanish-Style Chicken and Chorizo Rice", tags: ["spicy"], cuisine: "Spain", protein: "chicken",
      prep: 8, cook: 20,
      ingredients: [
        ing(100, "g", "chicken thigh, diced", "meat"), ing(40, "g", "cooking chorizo, sliced", "meat"),
        ing(70, "g", "paella or short-grain rice", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "pepper, sliced", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(200, "ml", "chicken stock", "store")
      ],
      steps: [
        "Fry the chorizo in a saucepan for 2 minutes until it releases its oil, then add the chicken and brown for 3–4 minutes.",
        "Add the pepper and garlic, and cook for 2 minutes.",
        "Stir in the rice and smoked paprika, then add the chopped tomatoes and stock.",
        "Bring to a simmer, cover and cook for 15–18 minutes, stirring occasionally, until the rice is tender."
      ]
    },
    {
      id: "d84", title: "Spanish Tortilla-Style Potato & Onion Omelette", tags: ["vegetarian", "quick"], cuisine: "Spain", protein: "plant-based",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "potato, thinly sliced", "produce"), ing(0.5, "", "onion, thinly sliced", "produce"),
        ing(3, "", "eggs", "dairy"), ing(2, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Heat the oil in a small non-stick frying pan and gently fry the potato and onion for 10 minutes, turning occasionally, until tender.",
        "Beat the eggs with a pinch of salt and pour over the potatoes, pressing them down evenly.",
        "Cook over low heat for 4–5 minutes until mostly set.",
        "Place a plate over the pan, flip the tortilla out, then slide it back in to cook for a further 2 minutes on the other side."
      ]
    },
    {
      id: "d85", title: "Patatas Bravas Bowl with Fried Egg", tags: ["vegetarian"], cuisine: "Spain", protein: "plant-based",
      prep: 6, cook: 20,
      ingredients: [
        ing(200, "g", "potato, cubed", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(100, "g", "chopped tomatoes", "store"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(1, "", "egg", "dairy")
      ],
      steps: [
        "Toss the potato with the oil on a baking tray and roast at 200°C (fan 180°C) for 20 minutes until crisp, turning halfway.",
        "Meanwhile, simmer the chopped tomatoes with the smoked paprika and chilli flakes for 8–10 minutes until thickened.",
        "Fry the egg to your liking.",
        "Serve the potatoes with the spiced tomato sauce spooned over and the fried egg on top."
      ]
    },
    {
      id: "d86", title: "Greek-Style Lamb Gyros Bowl with Tzatziki", tags: [], cuisine: "Greece", protein: "lamb",
      prep: 8, cook: 10,
      ingredients: [
        ing(180, "g", "lamb mince", "meat"), ing(1, "tsp", "dried oregano", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(1, "", "garlic clove", "produce"),
        ing(70, "g", "basmati rice", "store"), ing(4, "tbsp", "shop-bought tzatziki", "store"),
        ing(80, "g", "cherry tomatoes, halved", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the lamb mince with the oregano, cumin and crushed garlic.",
        "Fry over medium-high heat for 6–7 minutes, breaking it up, until browned and cooked through.",
        "Serve over the rice with the tzatziki and cherry tomatoes."
      ]
    },
    {
      id: "d87", title: "Greek-Style Lemon Orzo with Feta", tags: ["vegetarian"], cuisine: "Greece", protein: "plant-based",
      prep: 6, cook: 12,
      ingredients: [
        ing(70, "g", "orzo", "store"), ing(50, "g", "feta, crumbled", "dairy"),
        ing(80, "g", "cherry tomatoes, halved", "produce"), ing(0.5, "", "lemon", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(null, "small handful", "fresh dill or parsley", "produce")
      ],
      steps: [
        "Cook the orzo in salted boiling water according to the packet instructions, then drain, reserving a splash of the cooking water.",
        "Toss the warm orzo with the olive oil, lemon zest and a squeeze of juice, loosening with the reserved water if needed.",
        "Stir through the cherry tomatoes and most of the feta.",
        "Scatter with the remaining feta and dill or parsley to serve."
      ]
    },
    {
      id: "d88", title: "Mushroom & Pea Risotto", tags: ["vegetarian"], cuisine: "Italy", protein: "plant-based",
      prep: 8, cook: 22,
      ingredients: [
        ing(70, "g", "risotto rice", "store"), ing(120, "g", "chestnut mushrooms, sliced", "produce"),
        ing(60, "g", "frozen peas", "frozen"), ing(400, "ml", "vegetable stock", "store"),
        ing(0.25, "", "onion, diced", "produce"), ing(15, "g", "butter", "dairy"),
        ing(15, "g", "grated parmesan", "dairy")
      ],
      steps: [
        "Heat the stock in a saucepan and keep it at a gentle simmer.",
        "Melt the butter in another pan and fry the onion for 2 minutes, then add the mushrooms and cook for 4–5 minutes until golden.",
        "Stir in the rice and cook for 1 minute, then add the hot stock a ladle at a time, stirring and letting each addition absorb before adding the next, for about 16–18 minutes.",
        "Stir through the peas for the final 3 minutes.",
        "Remove from the heat, stir through the parmesan, and rest for a minute before serving."
      ]
    },
    {
      id: "d89", title: "Italian Sausage & Rocket Pasta", tags: ["quick"], cuisine: "Italy", protein: "pork",
      prep: 6, cook: 12,
      ingredients: [
        ing(2, "", "pork sausages, skins removed", "meat"), ing(70, "g", "pasta", "store"),
        ing(1, "", "garlic clove", "produce"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(30, "g", "rocket", "produce"), ing(15, "g", "grated parmesan", "dairy")
      ],
      steps: [
        "Cook the pasta in salted boiling water according to the packet instructions, then drain, reserving a splash of the cooking water.",
        "Meanwhile, break the sausage meat into a hot frying pan and brown for 5–6 minutes, crumbling it as it cooks.",
        "Add the garlic and chilli flakes, and cook for 1 minute.",
        "Toss the pasta through the sausage with a splash of the cooking water, then fold through the rocket until just wilted.",
        "Scatter with parmesan to serve."
      ]
    },
    {
      id: "d90", title: "Pesto Gnocchi with Cherry Tomatoes", tags: ["vegetarian", "quick"], cuisine: "Italy", protein: "plant-based",
      prep: 5, cook: 8,
      ingredients: [
        ing(200, "g", "fresh gnocchi", "store"), ing(3, "tbsp", "shop-bought basil pesto", "store"),
        ing(100, "g", "cherry tomatoes, halved", "produce"), ing(15, "g", "grated parmesan", "dairy")
      ],
      steps: [
        "Cook the gnocchi in salted boiling water according to the packet instructions until they float, then drain, reserving a splash of the cooking water.",
        "Toss the gnocchi with the pesto and cherry tomatoes, loosening with the reserved water if needed.",
        "Scatter with parmesan to serve."
      ]
    },
    {
      id: "d91", title: "Aglio e Olio with Chilli and Crispy Breadcrumbs", tags: ["vegetarian", "vegan", "quick"], cuisine: "Italy", protein: "plant-based",
      prep: 5, cook: 10,
      ingredients: [
        ing(70, "g", "spaghetti", "store"), ing(2, "", "garlic cloves, thinly sliced", "produce"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(3, "tbsp", "olive oil", "store"),
        ing(2, "tbsp", "breadcrumbs", "store"), ing(null, "small handful", "fresh parsley", "produce")
      ],
      steps: [
        "Cook the spaghetti in salted boiling water according to the packet instructions, then drain, reserving a splash of the cooking water.",
        "Meanwhile, toast the breadcrumbs in a dry pan for 2–3 minutes until golden, then tip out.",
        "In the same pan, gently fry the garlic and chilli flakes in the olive oil for 1–2 minutes until fragrant but not coloured.",
        "Toss the spaghetti through the garlic oil with a splash of the cooking water and the parsley.",
        "Scatter with the crispy breadcrumbs to serve."
      ]
    },
    {
      id: "d92", title: "Croque Monsieur-Style Ham & Cheese Toastie with Salad", tags: ["quick"], cuisine: "France", protein: "pork",
      prep: 5, cook: 8,
      ingredients: [
        ing(2, "", "slices bread", "bakery"), ing(2, "", "slices ham", "meat"),
        ing(40, "g", "grated cheddar or gruyere", "dairy"), ing(1, "tsp", "dijon mustard", "store"),
        ing(30, "g", "mixed salad leaves", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Spread one slice of bread with the mustard and layer with the ham and half the cheese, then top with the second slice.",
        "Scatter the remaining cheese over the outside of the sandwich.",
        "Toast in a dry frying pan over medium heat for 3–4 minutes each side until golden and the cheese has melted.",
        "Serve with the salad leaves tossed in the olive oil."
      ]
    },
    {
      id: "d93", title: "French-Style Chicken Chasseur", tags: [], cuisine: "France", protein: "chicken",
      prep: 8, cook: 20,
      ingredients: [
        ing(180, "g", "chicken thigh", "meat"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(100, "g", "chopped tomatoes", "store"),
        ing(100, "ml", "chicken stock", "store"), ing(1, "tsp", "dried tarragon or mixed herbs", "spice"),
        ing(150, "g", "new potatoes, halved", "produce")
      ],
      steps: [
        "Cook the new potatoes in boiling salted water for 15–18 minutes until tender, then drain.",
        "Meanwhile, brown the chicken in a splash of oil for 4–5 minutes, then set aside.",
        "Fry the onion and mushrooms in the same pan for 4 minutes.",
        "Return the chicken to the pan with the tomatoes, stock and tarragon, and simmer for 10–12 minutes until the chicken is cooked through and the sauce has thickened.",
        "Serve with the potatoes."
      ]
    },
    {
      id: "d94", title: "German-Style Currywurst with Fries", tags: ["spicy"], cuisine: "Germany", protein: "pork",
      prep: 6, cook: 20,
      ingredients: [
        ing(2, "", "pork sausages, sliced", "meat"), ing(150, "g", "frozen fries", "frozen"),
        ing(3, "tbsp", "ketchup", "store"), ing(1, "tsp", "curry powder", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice")
      ],
      steps: [
        "Cook the fries according to the packet instructions.",
        "Fry the sliced sausages in a pan over medium-high heat for 6–8 minutes until browned all over.",
        "Warm the ketchup with the curry powder and smoked paprika in a small pan.",
        "Spoon the curry sauce over the sausages and serve with the fries."
      ]
    },
    {
      id: "d95", title: "Speedy Cottage Pie Mash Cup", tags: [], cuisine: "UK", protein: "beef",
      prep: 8, cook: 20,
      ingredients: [
        ing(180, "g", "beef mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "carrot, diced", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(150, "ml", "beef stock", "store"), ing(250, "g", "potato, peeled and cubed", "produce"),
        ing(15, "g", "butter", "dairy")
      ],
      steps: [
        "Cook the potato in boiling salted water for 15 minutes until tender, then drain and mash with the butter and a splash of milk if you have it.",
        "Meanwhile, brown the beef mince with the onion and carrot in a hot pan for 5–6 minutes.",
        "Stir in the tomato puree and stock, and simmer for 10 minutes until thickened.",
        "Spoon the mince into a bowl or dish and top with the mash."
      ]
    },
    {
      id: "d96", title: "Bangers and Colcannon Mash with Onion Gravy", tags: [], cuisine: "Ireland", protein: "pork",
      prep: 6, cook: 22,
      ingredients: [
        ing(3, "", "pork sausages", "meat"), ing(250, "g", "potato, peeled and cubed", "produce"),
        ing(60, "g", "shredded cabbage or kale", "produce"), ing(15, "g", "butter", "dairy"),
        ing(0.5, "", "onion, sliced", "produce"), ing(150, "ml", "beef or vegetable stock", "store"),
        ing(1, "tsp", "cornflour", "store")
      ],
      steps: [
        "Cook the potato in boiling salted water for 15 minutes until tender.",
        "Meanwhile, grill or fry the sausages for 12–15 minutes, turning occasionally, until browned and cooked through.",
        "Fry the onion in a splash of oil for 6–8 minutes until softened and golden, then stir in the stock and cornflour mixed with a splash of water, and simmer for 2 minutes until thickened into a gravy.",
        "Steam or boil the cabbage for the final 3 minutes of the potatoes' cooking time, then drain everything and mash together with the butter.",
        "Serve the sausages over the colcannon mash with the onion gravy."
      ]
    },
    {
      id: "d97", title: "Miso Butter Salmon with Steamed Rice", tags: ["pescatarian"], cuisine: "Japan", protein: "fish",
      prep: 6, cook: 12,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(1, "tbsp", "miso paste", "store"),
        ing(15, "g", "butter, softened", "dairy"), ing(1, "tsp", "soy sauce", "store"),
        ing(70, "g", "jasmine rice", "store"), ing(1, "", "spring onion", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mash the miso paste into the softened butter with the soy sauce.",
        "Spread over the salmon and place on a lined baking tray.",
        "Roast at 200°C (fan 180°C) for 10–12 minutes until just cooked through.",
        "Serve over the rice, scattered with sliced spring onion."
      ]
    },
    {
      id: "d98", title: "Yaki Udon with Beef and Vegetables", tags: ["quick"], cuisine: "Japan", protein: "beef",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "beef strips (sirloin or rump)", "meat"), ing(200, "g", "straight-to-wok udon noodles", "store"),
        ing(100, "g", "stir-fry vegetable mix", "produce"), ing(2, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "sesame oil", "store"), ing(1, "", "garlic clove", "produce")
      ],
      steps: [
        "Heat a splash of oil in a wok over high heat and stir-fry the beef for 2–3 minutes until browned, then set aside.",
        "Add the vegetables and garlic to the wok and stir-fry for 3 minutes.",
        "Add the udon noodles and soy sauce, and toss for 2 minutes to loosen and heat through.",
        "Return the beef to the wok, toss together, and drizzle with sesame oil to serve."
      ]
    },
    {
      id: "d99", title: "Bibimbap-Style Beef Rice Bowl", tags: [], cuisine: "Korea", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef strips or mince", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "sesame oil", "store"), ing(70, "g", "jasmine or short-grain rice", "store"),
        ing(60, "g", "carrot, julienned", "produce"), ing(60, "g", "spinach", "produce"),
        ing(1, "", "egg", "dairy"), ing(1, "tbsp", "gochujang", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the beef with the soy sauce and sesame oil in a hot pan for 3–4 minutes until browned, then set aside.",
        "Quickly stir-fry the carrot for 2 minutes, then wilt the spinach in the same pan for 1 minute. Season each lightly.",
        "Fry the egg in a little oil, keeping the yolk runny.",
        "Build the bowl with the rice, beef and vegetables arranged separately, topped with the fried egg and a spoonful of gochujang."
      ]
    },
    {
      id: "d100", title: "Kimchi Fried Rice with Fried Egg", tags: ["vegetarian"], cuisine: "Korea", protein: "plant-based",
      prep: 6, cook: 10,
      ingredients: [
        ing(150, "g", "cooked rice, cold", "store"), ing(80, "g", "kimchi, chopped", "store"),
        ing(1, "tbsp", "kimchi juice (from the jar)", "store"), ing(1, "tsp", "sesame oil", "store"),
        ing(1, "", "egg", "dairy"), ing(1, "", "spring onion", "produce")
      ],
      steps: [
        "Heat a splash of oil in a frying pan or wok over high heat and fry the kimchi for 2 minutes.",
        "Add the cold rice and kimchi juice, and stir-fry for 4–5 minutes, breaking up any clumps, until hot through and starting to crisp.",
        "Push to one side of the pan, fry the egg in the space, keeping the yolk runny.",
        "Drizzle the rice with sesame oil, top with the egg, and scatter with sliced spring onion."
      ]
    },
    {
      id: "d101", title: "Ethiopian-Inspired Spiced Red Lentil Stew", tags: ["vegetarian", "vegan"], cuisine: "Ethiopia", protein: "plant-based",
      prep: 8, cook: 20,
      ingredients: [
        ing(80, "g", "dried red lentils", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove", "produce"),
        ing(1, "tsp", "smoked paprika", "spice"), ing(0.5, "tsp", "ground ginger", "spice"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(0.25, "tsp", "chilli flakes", "spice")
      ],
      steps: [
        "Rinse the lentils well.",
        "Fry the onion and garlic in a splash of oil for 3–4 minutes until softening.",
        "Stir in the paprika, ginger, cinnamon and chilli flakes, and cook for 1 minute until fragrant.",
        "Add the lentils, chopped tomatoes and 300ml water, and simmer for 15 minutes, stirring occasionally, until the lentils are tender and the stew has thickened."
      ]
    },
    {
      id: "d102", title: "Tofu Satay Bowl with Peanut Sauce", tags: ["vegetarian", "vegan"], cuisine: "Indonesia", protein: "plant-based",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "firm tofu, cubed", "store"), ing(70, "g", "jasmine rice", "store"),
        ing(2, "tbsp", "peanut butter", "store"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "sriracha or chilli sauce", "store"), ing(0.5, "", "lime", "produce"),
        ing(60, "g", "cucumber, sliced", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Pat the tofu dry and fry in a splash of oil over medium-high heat for 5–6 minutes, turning occasionally, until golden on all sides.",
        "Whisk the peanut butter, soy sauce, sriracha, lime juice and a splash of hot water into a smooth sauce.",
        "Serve the tofu over the rice with the cucumber, drizzled with the peanut sauce."
      ]
    }
  ];
  var RECIPES_BY_ID = {};
  RECIPES.forEach(function (r) { RECIPES_BY_ID[r.id] = r; });

  /* ============================= STATE ============================= */
  var DOW_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var state = {
    servings: 1,
    mode: "days", // "days" (7-slot week planner) or "batch" (a plain list, not tied to days)
    plan: [null, null, null, null, null, null, null],
    batch: [],   // batch-mode dinners: [{ uid, id, cookedAt }] - no day attached
    checked: {},
    ratings: {},
    history: [], // log of every dinner a day slot has been filled with: { id, ts, via }
    cooked: {},  // which of THIS week's day slots have been confirmed cooked: { dayIdx: { id, ts } }
    cookLog: []  // durable log of confirmed cooks only, separate from planning: { id, ts }
  };
  var HISTORY_LIMIT = 400; // keep this bounded so it never grows the saved state unreasonably

  function newUid() { return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
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
        servings: state.servings, mode: state.mode, plan: state.plan, batch: state.batch,
        checked: state.checked, ratings: state.ratings,
        history: state.history, cooked: state.cooked, cookLog: state.cookLog
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
    if (data.mode === "days" || data.mode === "batch") state.mode = data.mode;
    if (Array.isArray(data.plan) && data.plan.length === 7) state.plan = data.plan;
    if (Array.isArray(data.batch)) state.batch = data.batch;
    if (data.checked && typeof data.checked === "object") state.checked = data.checked;
    if (data.ratings && typeof data.ratings === "object") state.ratings = data.ratings;
    if (Array.isArray(data.history)) state.history = data.history;
    if (data.cooked && typeof data.cooked === "object") state.cooked = data.cooked;
    if (Array.isArray(data.cookLog)) state.cookLog = data.cookLog;
  }

  function logHistory(recipeId, via) {
    state.history.push({ id: recipeId, ts: Date.now(), via: via });
    if (state.history.length > HISTORY_LIMIT) {
      state.history = state.history.slice(state.history.length - HISTORY_LIMIT);
    }
  }

  // Clears any "cooked" confirmation sitting on a day slot - called whenever
  // that slot's dinner changes, so a tick never survives onto a different dish.
  function clearCooked(dayIdx) {
    delete state.cooked[dayIdx];
  }

  // Shared cook-log helpers, used by both the day planner's checkmark and the
  // batch list's checkmark. This is deliberately separate from state.history:
  // history logs the moment a dish is PLANNED (picked, filled, or surprised),
  // which is not proof it was made. cookLog only grows when the person
  // explicitly confirms it with the checkmark.
  function logCook(recipeId) {
    var ts = Date.now();
    state.cookLog.push({ id: recipeId, ts: ts });
    if (state.cookLog.length > HISTORY_LIMIT) {
      state.cookLog = state.cookLog.slice(state.cookLog.length - HISTORY_LIMIT);
    }
    return ts;
  }
  function unlogCook(recipeId, ts) {
    for (var i = state.cookLog.length - 1; i >= 0; i--) {
      if (state.cookLog[i].id === recipeId && state.cookLog[i].ts === ts) { state.cookLog.splice(i, 1); return; }
    }
  }

  // Toggles the real "I actually cooked this" confirmation for a day slot.
  function toggleCooked(dayIdx) {
    var recipeId = state.plan[dayIdx];
    if (!recipeId) return;
    var entry = state.cooked[dayIdx];
    if (entry && entry.id === recipeId) {
      unlogCook(entry.id, entry.ts);
      delete state.cooked[dayIdx];
    } else {
      state.cooked[dayIdx] = { id: recipeId, ts: logCook(recipeId) };
    }
    onStateChanged();
  }

  // Same idea for a batch-list item, addressed by its uid rather than a day index.
  function toggleCookedBatch(uid) {
    var item = null;
    for (var i = 0; i < state.batch.length; i++) { if (state.batch[i].uid === uid) { item = state.batch[i]; break; } }
    if (!item) return;
    if (item.cookedAt) {
      unlogCook(item.id, item.cookedAt);
      item.cookedAt = null;
    } else {
      item.cookedAt = logCook(item.id);
    }
    onStateChanged();
  }

  function addToBatch(recipeId, via) {
    state.batch.push({ uid: newUid(), id: recipeId, cookedAt: null });
    logHistory(recipeId, via || "pick");
    onStateChanged();
  }
  function removeFromBatch(uid) {
    // Deliberately does not touch cookLog: if this item was already ticked as
    // cooked, that confirmed cook stays in your history even after the item
    // itself is taken off the active list.
    for (var i = 0; i < state.batch.length; i++) {
      if (state.batch[i].uid === uid) { state.batch.splice(i, 1); break; }
    }
    onStateChanged();
  }

  function currentRecipeIds() {
    return state.mode === "batch" ? state.batch.map(function (b) { return b.id; }) : state.plan.filter(Boolean);
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
          mode: state.mode,
          plan: state.plan,
          batch: state.batch,
          checked: state.checked,
          ratings: state.ratings,
          history: state.history,
          cooked: state.cooked,
          cookLog: state.cookLog,
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
          mode: state.mode,
          plan: state.plan,
          batch: state.batch,
          checked: state.checked,
          ratings: state.ratings,
          history: state.history,
          cooked: state.cooked,
          cookLog: state.cookLog,
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

  /* ============================= RATINGS ============================= */
  // Rate any dish 1-5 stars. A 1-star rating is treated as "not for me": it's
  // excluded from "Surprise me" picks (see openPicker below) but stays
  // visible everywhere else, so it's easy to change your mind later.
  function ratingStars(recipeId, interactive) {
    var current = state.ratings[recipeId] || 0;
    var html = '<div class="star-row" data-recipe-id="' + recipeId + '">';
    for (var n = 1; n <= 5; n++) {
      var filled = n <= current;
      var glyph = filled ? "★" : "☆";
      if (interactive) {
        html += '<button type="button" class="star-btn' + (filled ? " filled" : "") + '" data-value="' + n + '" aria-label="Rate ' + n + (n === 1 ? " star" : " stars") + '">' + glyph + "</button>";
      } else {
        html += '<span class="star-static' + (filled ? " filled" : "") + '">' + glyph + "</span>";
      }
    }
    html += "</div>";
    return html;
  }
  function wireRatingStars(container, recipeId, onChange) {
    var row = container.querySelector('.star-row[data-recipe-id="' + recipeId + '"]');
    if (!row) return;
    row.querySelectorAll(".star-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = parseInt(btn.getAttribute("data-value"), 10);
        var current = state.ratings[recipeId] || 0;
        if (current === val) {
          delete state.ratings[recipeId]; // click the same star again to clear the rating
        } else {
          state.ratings[recipeId] = val;
        }
        scheduleSave();
        row.outerHTML = ratingStars(recipeId, true);
        wireRatingStars(container, recipeId, onChange);
        renderRecipeGrid(); // keep the card behind the modal in sync (it isn't visible right now, but will be on close)
        if (onChange) onChange();
      });
    });
  }

  /* ============================= TABS ============================= */
  var panels = { planner: document.getElementById("panel-planner"), shopping: document.getElementById("panel-shopping"), recipes: document.getElementById("panel-recipes"), stats: document.getElementById("panel-stats") };
  var tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabBtns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
      btn.setAttribute("aria-selected", "true");
      Object.keys(panels).forEach(function (k) { panels[k].hidden = (k !== btn.dataset.panel); });
      if (btn.dataset.panel === "shopping") renderShopping();
      if (btn.dataset.panel === "stats") renderStats();
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
  var batchList = document.getElementById("batch-list");
  var todayIdx = (function () { var d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }

  function renderPlanner() {
    var isBatch = state.mode === "batch";
    document.getElementById("mode-days-btn").setAttribute("aria-pressed", isBatch ? "false" : "true");
    document.getElementById("mode-batch-btn").setAttribute("aria-pressed", isBatch ? "true" : "false");
    document.getElementById("days-toolbar").hidden = isBatch;
    dayList.hidden = isBatch;
    document.getElementById("batch-toolbar").hidden = !isBatch;
    batchList.hidden = !isBatch;

    if (isBatch) {
      renderBatchList();
      document.getElementById("planner-count").textContent = String(state.batch.length);
    } else {
      renderDayList();
      var planned = state.plan.filter(Boolean).length;
      document.getElementById("planner-count").textContent = planned + "/7";
    }
  }

  function renderBatchList() {
    batchList.innerHTML = "";
    if (!state.batch.length) {
      batchList.innerHTML = '<p class="empty-state">Nothing on your list yet. Hit Surprise me for a random batch, or add dinners one at a time.</p>';
      return;
    }
    state.batch.forEach(function (item) {
      var r = RECIPES_BY_ID[item.id];
      if (!r) return;
      var isCooked = !!item.cookedAt;
      var card = document.createElement("div");
      card.className = "day-card" + (isCooked ? " is-cooked" : "");

      var body = document.createElement("div");
      body.className = "day-body";
      var assigned = document.createElement("button");
      assigned.className = "assigned";
      assigned.innerHTML =
        '<span class="swatch" style="background:var(--' + (TAG_COLOR[r.tags[0]] || "border") + ')"></span>' +
        '<span class="info"><span class="title">' + r.title + (isCooked ? ' <span class="cooked-badge">&#10003; Cooked</span>' : '') + '</span>' +
        '<span class="meta">' + r.prep + '+' + r.cook + ' min &middot; ' + r.tags.map(function(t){return t;}).join(", ") + '</span></span>';
      assigned.addEventListener("click", function (uid) { return function () { openRecipeModal(item.id, { batchUid: uid }); }; }(item.uid));
      body.appendChild(assigned);

      var actions = document.createElement("div");
      actions.className = "day-actions";
      var cookBtn = document.createElement("button");
      cookBtn.className = "icon-btn cook-btn" + (isCooked ? " is-active" : "");
      cookBtn.setAttribute("aria-label", isCooked ? "Marked as cooked - click to undo" : "Mark as cooked");
      cookBtn.title = isCooked ? "Cooked – click to undo" : "Mark as cooked";
      cookBtn.textContent = "✓";
      cookBtn.addEventListener("click", function (uid) { return function (ev) { ev.stopPropagation(); toggleCookedBatch(uid); }; }(item.uid));
      var swapBtn = document.createElement("button");
      swapBtn.className = "icon-btn"; swapBtn.setAttribute("aria-label", "Change dinner"); swapBtn.textContent = "↻";
      swapBtn.addEventListener("click", function (uid) { return function () { openPicker({ type: "batchReplace", uid: uid }); }; }(item.uid));
      var removeBtn = document.createElement("button");
      removeBtn.className = "icon-btn"; removeBtn.setAttribute("aria-label", "Remove"); removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", function (uid) { return function () { removeFromBatch(uid); }; }(item.uid));
      actions.appendChild(cookBtn); actions.appendChild(swapBtn); actions.appendChild(removeBtn);
      body.appendChild(actions);

      card.appendChild(body);
      batchList.appendChild(card);
    });
  }

  document.getElementById("mode-days-btn").addEventListener("click", function () {
    if (state.mode === "days") return;
    state.mode = "days";
    onStateChanged();
  });
  document.getElementById("mode-batch-btn").addEventListener("click", function () {
    if (state.mode === "batch") return;
    state.mode = "batch";
    onStateChanged();
  });

  document.getElementById("batch-surprise-btn").addEventListener("click", function () {
    var input = document.getElementById("batch-count-input");
    var n = parseInt(input.value, 10);
    if (!n || n < 1) n = 1;
    if (n > 30) n = 30;
    input.value = n;
    var usedIds = state.batch.map(function (b) { return b.id; });
    var likedIds = RECIPES.filter(function (r) { return state.ratings[r.id] !== 1; }).map(function (r) { return r.id; });
    var basePool = likedIds.length ? likedIds : RECIPES.map(function (r) { return r.id; });
    var pool = shuffle(basePool.filter(function (id) { return usedIds.indexOf(id) === -1; }));
    var pi = 0;
    for (var k = 0; k < n; k++) {
      if (pi >= pool.length) { pool = shuffle(basePool.slice()); pi = 0; }
      var pickId = pool[pi++];
      state.batch.push({ uid: newUid(), id: pickId, cookedAt: null });
      logHistory(pickId, "surprise");
    }
    onStateChanged();
  });
  document.getElementById("batch-add-btn").addEventListener("click", function () {
    openPicker({ type: "batchAdd" });
  });
  document.getElementById("batch-clear-btn").addEventListener("click", function () {
    state.batch = [];
    onStateChanged();
  });

  function renderDayList() {
    document.getElementById("week-range").textContent = fmtRange();
    dayList.innerHTML = "";
    for (var idx = 0; idx < 7; idx++) {
      var date = new Date(MONDAY); date.setDate(date.getDate() + idx);
      var recipeIdForCard = state.plan[idx];
      var isCooked = !!(recipeIdForCard && state.cooked[idx] && state.cooked[idx].id === recipeIdForCard);
      var card = document.createElement("div");
      card.className = "day-card" + (idx === todayIdx ? " is-today" : "") + (isCooked ? " is-cooked" : "");

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
          '<span class="info"><span class="title">' + r.title + (isCooked ? ' <span class="cooked-badge">&#10003; Cooked</span>' : '') + '</span>' +
          '<span class="meta">' + r.prep + '+' + r.cook + ' min &middot; ' + r.tags.map(function(t){return t;}).join(", ") + '</span></span>';
        assigned.addEventListener("click", function (rid, i) { return function () { openRecipeModal(rid, { dayIdx: i }); }; }(recipeId, idx));
        body.appendChild(assigned);

        var actions = document.createElement("div");
        actions.className = "day-actions";
        var cookBtn = document.createElement("button");
        cookBtn.className = "icon-btn cook-btn" + (isCooked ? " is-active" : "");
        cookBtn.setAttribute("aria-label", isCooked ? "Marked as cooked - click to undo" : "Mark as cooked");
        cookBtn.title = isCooked ? "Cooked – click to undo" : "Mark as cooked";
        cookBtn.textContent = "✓";
        cookBtn.addEventListener("click", function (i) { return function (ev) { ev.stopPropagation(); toggleCooked(i); }; }(idx));
        var swapBtn = document.createElement("button");
        swapBtn.className = "icon-btn"; swapBtn.setAttribute("aria-label", "Change dinner"); swapBtn.textContent = "↻";
        swapBtn.addEventListener("click", function (i) { return function () { openPicker({ type: "day", dayIdx: i }); }; }(idx));
        var removeBtn = document.createElement("button");
        removeBtn.className = "icon-btn"; removeBtn.setAttribute("aria-label", "Remove"); removeBtn.textContent = "✕";
        removeBtn.addEventListener("click", function (i) { return function () { clearCooked(i); state.plan[i] = null; onStateChanged(); }; }(idx));
        actions.appendChild(cookBtn); actions.appendChild(swapBtn); actions.appendChild(removeBtn);
        body.appendChild(actions);
      } else {
        var emptyBtn = document.createElement("button");
        emptyBtn.className = "day-empty-btn";
        emptyBtn.innerHTML = '<span class="plus-badge">+</span> Add a dinner';
        emptyBtn.addEventListener("click", function (i) { return function () { openPicker({ type: "day", dayIdx: i }); }; }(idx));
        body.appendChild(emptyBtn);
      }
      card.appendChild(body);
      dayList.appendChild(card);
    }
  }

  document.getElementById("fill-week-btn").addEventListener("click", function () {
    var used = state.plan.filter(Boolean);
    // Never fill a day with a 1-star dish, same rule as Surprise me. Only
    // fall back to the full list (including 1-star dishes) if every single
    // recipe has been rated 1 star, so the week can still be filled.
    var likedIds = RECIPES.filter(function (r) { return state.ratings[r.id] !== 1; }).map(function (r) { return r.id; });
    var basePool = likedIds.length ? likedIds : RECIPES.map(function (r) { return r.id; });
    var pool = shuffle(basePool.filter(function (id) { return used.indexOf(id) === -1; }));
    var pi = 0;
    for (var d = 0; d < 7; d++) {
      if (!state.plan[d]) {
        if (pi >= pool.length) { pool = shuffle(basePool.slice()); pi = 0; }
        state.plan[d] = pool[pi++];
        logHistory(state.plan[d], "fill");
      }
    }
    onStateChanged();
  });
  document.getElementById("clear-week-btn").addEventListener("click", function () {
    state.plan = [null, null, null, null, null, null, null];
    state.cooked = {};
    onStateChanged();
  });

  /* ============================= SHOPPING LIST ============================= */
  function renderShopping() {
    var content = document.getElementById("shop-content");
    var recipeIds = currentRecipeIds();
    if (recipeIds.length === 0) {
      var emptyMsg = state.mode === "batch"
        ? "Pick some dinners in the Just pick dinners tab and your shopping list will build itself here."
        : "Add some dinners to the week and your shopping list will build itself here.";
      content.innerHTML = '<p class="empty-state">' + emptyMsg + '</p>';
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
      var rated = state.ratings[r.id] ? ratingStars(r.id, false) : "";
      card.innerHTML =
        '<div class="top-row"><span class="title">' + r.title + '</span><span class="time">' + r.prep + "+" + r.cook + " min</span></div>" +
        '<div class="tag-row">' + r.tags.map(tagPill).join("") + "</div>" +
        (rated ? '<div class="card-rating">' + rated + "</div>" : "");
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
    } else if (ctx && ctx.batchUid !== undefined) {
      actionsHtml = '<div class="modal-actions">' +
        '<button class="btn btn-primary" id="modal-swap-btn">Swap for something else</button>' +
        '<button class="btn btn-ghost" id="modal-remove-btn">Remove from list</button></div>';
    } else if (state.mode === "batch") {
      actionsHtml = '<div class="modal-actions"><button class="btn btn-primary" id="modal-add-batch-btn">Add to your list</button></div>';
    } else {
      actionsHtml = '<h3>Add to a day</h3><div class="day-pick-row" id="modal-day-picks"></div>';
    }

    recipeModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="modal-close-btn" aria-label="Close">✕</button></div>' +
      "<h2>" + r.title + "</h2>" +
      '<div class="tag-row">' + r.tags.map(tagPill).join("") + "</div>" +
      '<div class="modal-meta"><span>Prep ' + r.prep + ' min</span><span>Cook ' + r.cook + ' min</span><span>Serves ' + state.servings + '</span></div>' +
      '<p style="color:var(--ink-muted); font-size:13px;">' + servingsNote + "</p>" +
      '<div class="rating-block"><span class="rating-label">Your rating</span>' + ratingStars(r.id, true) + '<span class="rating-hint">Tap a star again to clear it. 1 star is never suggested by Surprise me.</span></div>' +
      "<h3>Ingredients</h3>" + ingredientsHtml +
      "<h3>Method</h3><ol class=\"steps\">" + stepsHtml + "</ol>" +
      actionsHtml;

    recipeBackdrop.hidden = false;
    document.getElementById("modal-close-btn").addEventListener("click", closeRecipeModal);
    wireRatingStars(recipeModal, r.id);

    if (ctx && ctx.dayIdx !== undefined) {
      document.getElementById("modal-swap-btn").addEventListener("click", function () { closeRecipeModal(); openPicker({ type: "day", dayIdx: ctx.dayIdx }); });
      document.getElementById("modal-remove-btn").addEventListener("click", function () { clearCooked(ctx.dayIdx); state.plan[ctx.dayIdx] = null; onStateChanged(); closeRecipeModal(); });
    } else if (ctx && ctx.batchUid !== undefined) {
      document.getElementById("modal-swap-btn").addEventListener("click", function () { closeRecipeModal(); openPicker({ type: "batchReplace", uid: ctx.batchUid }); });
      document.getElementById("modal-remove-btn").addEventListener("click", function () { removeFromBatch(ctx.batchUid); closeRecipeModal(); });
    } else if (state.mode === "batch") {
      document.getElementById("modal-add-batch-btn").addEventListener("click", function () {
        addToBatch(r.id, "pick");
        closeRecipeModal();
      });
    } else {
      var pickWrap = document.getElementById("modal-day-picks");
      for (var d = 0; d < 7; d++) {
        var b = document.createElement("button");
        b.className = "day-pick-btn" + (state.plan[d] === r.id ? " filled" : "");
        b.textContent = DOW_NAMES[d].slice(0, 2);
        b.title = "Add to " + DOW_NAMES[d];
        b.addEventListener("click", function (dayIdx) { return function () {
          clearCooked(dayIdx);
          state.plan[dayIdx] = r.id;
          logHistory(r.id, "pick");
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

  // Applies a chosen recipe to whatever the picker was opened for - a day
  // slot, a replacement inside the batch list, or a brand-new batch entry.
  function applyPick(ctx, recipeId, via) {
    if (ctx.type === "day") {
      clearCooked(ctx.dayIdx);
      state.plan[ctx.dayIdx] = recipeId;
      logHistory(recipeId, via);
    } else if (ctx.type === "batchReplace") {
      for (var i = 0; i < state.batch.length; i++) {
        if (state.batch[i].uid === ctx.uid) {
          // Changing the dish clears any cook confirmation on this entry,
          // same as swapping a day's dinner - but if it was already ticked,
          // that cook really happened, so its cookLog entry is left alone.
          state.batch[i].id = recipeId;
          state.batch[i].cookedAt = null;
          break;
        }
      }
      logHistory(recipeId, via);
    } else { // "batchAdd"
      state.batch.push({ uid: newUid(), id: recipeId, cookedAt: null });
      logHistory(recipeId, via);
    }
  }

  function openPicker(ctx) {
    var titleText, subText;
    if (ctx.type === "day") {
      var date = new Date(MONDAY); date.setDate(date.getDate() + ctx.dayIdx);
      titleText = "Pick a dinner for " + DOW_NAMES[ctx.dayIdx];
      subText = date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    } else if (ctx.type === "batchReplace") {
      titleText = "Change this dinner";
      subText = "Pick a replacement – it takes this one’s place on your list.";
    } else {
      titleText = "Add a dinner";
      subText = "Pick anything – it’ll join your list, no day attached.";
    }
    var rows = RECIPES.map(function (r) {
      var rated = state.ratings[r.id] ? ratingStars(r.id, false) : "";
      return '<button class="picker-row" data-id="' + r.id + '">' +
        '<span class="swatch" style="background:var(--' + (TAG_COLOR[r.tags[0]] || "border") + ')"></span>' +
        '<span><span class="title">' + r.title + '</span><br><span class="meta">' + r.prep + '+' + r.cook + ' min' + (r.tags.length ? " · " + r.tags.join(", ") : "") + '</span></span>' +
        (rated ? '<span class="picker-rating">' + rated + '</span>' : "") +
        "</button>";
    }).join("");
    pickerModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="picker-close-btn" aria-label="Close">✕</button></div>' +
      "<h2>" + titleText + "</h2>" +
      '<p style="color:var(--ink-muted); font-size:13px;">' + subText + "</p>" +
      '<div class="picker-list">' + rows + "</div>" +
      '<button class="btn btn-ghost" id="picker-surprise-btn" style="margin-top:14px;">Surprise me</button>';
    pickerBackdrop.hidden = false;
    document.getElementById("picker-close-btn").addEventListener("click", closePicker);
    pickerModal.querySelectorAll(".picker-row").forEach(function (row) {
      row.addEventListener("click", function () {
        applyPick(ctx, row.dataset.id, "pick");
        onStateChanged();
        closePicker();
      });
    });
    document.getElementById("picker-surprise-btn").addEventListener("click", function () {
      // Never suggest a dish rated 1 star. Fall back to the full list only
      // in the (unlikely) case every single recipe has been rated 1 star.
      var pool = RECIPES.filter(function (r) { return state.ratings[r.id] !== 1; });
      if (!pool.length) pool = RECIPES;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      applyPick(ctx, pick.id, "surprise");
      onStateChanged();
      closePicker();
    });
  }
  function closePicker() { pickerBackdrop.hidden = true; pickerModal.innerHTML = ""; }
  pickerBackdrop.addEventListener("click", function (e) { if (e.target === pickerBackdrop) closePicker(); });

  /* ============================= STATS ============================= */
  function capitalise(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function fmtDuration(totalMinutes) {
    var h = Math.floor(totalMinutes / 60);
    var m = Math.round(totalMinutes % 60);
    if (h === 0) return m + " min";
    return h + "h " + (m ? m + "m" : "");
  }

  function countBy(list, keyFn) {
    var counts = {};
    list.forEach(function (item) {
      var k = keyFn(item);
      if (k === null || k === undefined) return;
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }

  function topEntries(counts, limit) {
    return Object.keys(counts)
      .map(function (k) { return { key: k, count: counts[k] }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, limit || Object.keys(counts).length);
  }

  function statTile(value, label) {
    return '<div class="stat-tile"><span class="stat-value">' + value + '</span><span class="stat-label">' + label + "</span></div>";
  }

  // entries: [{ key, count, label? }] already sorted; label falls back to key
  function rankList(entries) {
    if (!entries.length) return "";
    var max = entries[0].count;
    return '<div class="rank-list">' + entries.map(function (e) {
      var pct = max ? Math.round((e.count / max) * 100) : 0;
      var label = e.label || e.key;
      return '<div class="rank-row">' +
        '<span class="rank-label">' + label + '</span>' +
        '<span class="rank-bar-track"><span class="rank-bar-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="rank-value">' + e.count + '</span>' +
        "</div>";
    }).join("") + "</div>";
  }

  function renderStats() {
    var el = document.getElementById("stats-content");
    var history = state.history;
    var cookLog = state.cookLog;
    var html = "";

    /* ---- Your kitchen (personal, built from confirmed cooks + history + ratings) ---- */
    html += '<div class="stats-section"><h2>Your kitchen</h2>';

    /* Actually cooked: only counts a dish once you tick the checkmark on its
       day, so these numbers never assume a planned dinner got made. */
    html += '<h3 class="stats-subhead">What you’ve actually cooked</h3>';
    var validCooked = cookLog.filter(function (h) { return !!RECIPES_BY_ID[h.id]; });
    if (!validCooked.length) {
      html += '<p class="stats-empty">Nothing confirmed yet. Tick the &#10003; on a day once you’ve actually made it, and this fills in: planning a dinner alone doesn’t count here.</p>';
    } else {
      var cookedMinutes = validCooked.reduce(function (sum, h) {
        var r = RECIPES_BY_ID[h.id];
        return sum + r.prep + r.cook;
      }, 0);
      var cookedCountryCounts = countBy(validCooked, function (h) { return RECIPES_BY_ID[h.id].cuisine; });
      var cookedDistinctCountries = Object.keys(cookedCountryCounts).length;

      html += '<div class="stat-tile-row">' +
        statTile(validCooked.length, validCooked.length === 1 ? "dinner cooked" : "dinners cooked") +
        statTile(cookedDistinctCountries, cookedDistinctCountries === 1 ? "country cooked" : "countries cooked") +
        statTile(fmtDuration(cookedMinutes), "kitchen time logged") +
        "</div>";

      html += "<h3>Countries you’ve cooked most</h3>" + rankList(topEntries(cookedCountryCounts, 8));

      var cookedDishCounts = countBy(validCooked, function (h) { return h.id; });
      var cookedDishEntries = topEntries(cookedDishCounts, 8).map(function (e) {
        return { key: e.key, count: e.count, label: RECIPES_BY_ID[e.key].title };
      });
      html += "<h3>Your most-cooked dishes</h3>" + rankList(cookedDishEntries);
    }

    /* How you've planned: everything ever assigned to a day, whether or not
       it was confirmed as cooked - this is about planning habits, not proof
       of what ended up on a plate. */
    html += '<h3 class="stats-subhead">How you’ve planned</h3>';
    if (!history.length) {
      html += '<p class="stats-empty">You haven’t planned a dinner yet. Fill in a week, or hit Surprise me, and your own stats will start building up here.</p>';
    } else {
      var validHistory = history.filter(function (h) { return !!RECIPES_BY_ID[h.id]; });

      html += '<div class="stat-tile-row">' +
        statTile(validHistory.length, validHistory.length === 1 ? "dinner planned" : "dinners planned") +
        "</div>";

      var dishCounts = countBy(validHistory, function (h) { return h.id; });
      var dishEntries = topEntries(dishCounts, 8).map(function (e) {
        return { key: e.key, count: e.count, label: RECIPES_BY_ID[e.key].title };
      });
      html += "<h3>Your most-planned dishes</h3>" + rankList(dishEntries);

      var surpriseHistory = validHistory.filter(function (h) { return h.via === "surprise"; });
      if (surpriseHistory.length) {
        var surpriseCounts = countBy(surpriseHistory, function (h) { return h.id; });
        var surpriseEntries = topEntries(surpriseCounts, 5).map(function (e) {
          return { key: e.key, count: e.count, label: RECIPES_BY_ID[e.key].title };
        });
        html += "<h3>Surprise me’s favourites</h3>" + rankList(surpriseEntries);
      } else {
        html += '<h3>Surprise me’s favourites</h3><p class="stats-empty">Use the Surprise me button when you fill a day and this fills in.</p>';
      }

      var viaCounts = countBy(validHistory, function (h) { return h.via; });
      var viaLabel = { pick: "Chosen by hand", fill: "Filled automatically", surprise: "Surprise me" };
      var viaEntries = topEntries(viaCounts, 3).map(function (e) {
        return { key: e.key, count: e.count, label: viaLabel[e.key] || capitalise(e.key) };
      });
      html += "<h3>How you plan your week</h3>" + rankList(viaEntries);
    }

    var ratedIds = Object.keys(state.ratings);
    if (ratedIds.length) {
      var sum = ratedIds.reduce(function (s, id) { return s + state.ratings[id]; }, 0);
      var avg = (sum / ratedIds.length).toFixed(1);
      var favourites = ratedIds.filter(function (id) { return state.ratings[id] === 5 && RECIPES_BY_ID[id]; })
        .map(function (id) { return RECIPES_BY_ID[id].title; });
      var avoided = ratedIds.filter(function (id) { return state.ratings[id] === 1; }).length;

      html += "<h3 class=\"stats-subhead\">Your ratings</h3><div class=\"stat-tile-row\">" +
        statTile(ratedIds.length, ratedIds.length === 1 ? "dish rated" : "dishes rated") +
        statTile(avg, "average rating") +
        "</div>";
      if (favourites.length) {
        html += '<p class="stats-note"><strong>5-star favourites:</strong> ' + favourites.join(", ") + "</p>";
      }
      if (avoided) {
        html += '<p class="stats-note">' + avoided + (avoided === 1 ? " dish is" : " dishes are") + " rated 1 star, so Surprise me and Fill empty days are steering around " + (avoided === 1 ? "it" : "them") + ".</p>";
      }
    }
    html += "</div>";

    /* ---- The recipe book (static, always available) ---- */
    var totalPrep = RECIPES.reduce(function (s, r) { return s + r.prep; }, 0);
    var totalTimeAll = RECIPES.reduce(function (s, r) { return s + r.prep + r.cook; }, 0);
    var avgPrep = Math.round(totalPrep / RECIPES.length);
    var fastest = RECIPES.reduce(function (best, r) { return (r.prep + r.cook) < (best.prep + best.cook) ? r : best; }, RECIPES[0]);
    var bookCountryCounts = countBy(RECIPES, function (r) { return r.cuisine; });
    var bookProteinCounts = countBy(RECIPES, function (r) { return r.protein; });
    var proteinLabel = { "plant-based": "Plant-based", chicken: "Chicken", beef: "Beef", pork: "Pork", lamb: "Lamb", turkey: "Turkey", duck: "Duck", fish: "Fish" };

    html += '<div class="stats-section"><h2>The recipe book</h2>';
    html += '<div class="stat-tile-row">' +
      statTile(RECIPES.length, "dinners in the book") +
      statTile(Object.keys(bookCountryCounts).length, "countries represented") +
      statTile(avgPrep + " min", "average prep time") +
      "</div>";
    html += '<p class="stats-note">Quickest of the lot: <strong>' + fastest.title + "</strong> (" + (fastest.prep + fastest.cook) + " min start to finish). The whole book, cooked once each, comes to about " + fmtDuration(totalTimeAll) + " of kitchen time.</p>";

    html += "<h3>Countries in the book</h3>" + rankList(topEntries(bookCountryCounts, 30));

    var proteinEntries = topEntries(bookProteinCounts, 8).map(function (e) {
      return { key: e.key, count: e.count, label: proteinLabel[e.key] || capitalise(e.key) };
    });
    html += "<h3>What's in the book</h3>" + rankList(proteinEntries);

    var dietCounts = {
      vegetarian: RECIPES.filter(function (r) { return r.tags.indexOf("vegetarian") !== -1; }).length,
      vegan: RECIPES.filter(function (r) { return r.tags.indexOf("vegan") !== -1; }).length,
      pescatarian: RECIPES.filter(function (r) { return r.tags.indexOf("pescatarian") !== -1; }).length,
      spicy: RECIPES.filter(function (r) { return r.tags.indexOf("spicy") !== -1; }).length,
      quick: RECIPES.filter(function (r) { return r.tags.indexOf("quick") !== -1; }).length
    };
    html += "<h3>Diet &amp; style</h3><div class=\"stat-tile-row\">" +
      statTile(dietCounts.vegetarian, "vegetarian") +
      statTile(dietCounts.vegan, "vegan") +
      statTile(dietCounts.pescatarian, "pescatarian") +
      statTile(dietCounts.spicy, "spicy") +
      statTile(dietCounts.quick, "quick") +
      "</div>";
    html += "</div>";

    el.innerHTML = html;
  }

  /* ============================= INIT ============================= */
  function renderAll() {
    document.getElementById("servings-value").textContent = state.servings;
    renderPlanner();
    renderRecipeGrid();
    if (!panels.shopping.hidden) renderShopping();
    if (!panels.stats.hidden) renderStats();
  }
  renderTagChips();
  initPersistence();
})();
