// Solo Supper app logic
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
  var TAG_COLOR = { vegetarian: "good", vegan: "good", spicy: "spicy", fish: "info", quick: "accent-2", yours: "accent-2" };

  function ing(amt, unit, item, cat) { return { amt: amt, unit: unit, item: item, cat: cat }; }

  var RECIPES = [
    {
      id: "d1", title: "Sticky Hoisin Pork with Egg-Fried Rice", tags: ["quick"], cuisine: "China", protein: "pork",
      prep: 6, cook: 10,
      ingredients: [
        ing(150, "g", "pork loin steak, sliced into strips", "meat"), ing(2, "tbsp", "hoisin sauce", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(150, "g", "cooked rice, cold", "store"),
        ing(1, "", "egg", "dairy"), ing(60, "g", "frozen peas", "frozen"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "spring onion, sliced", "produce")
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
      id: "d2", title: "Harissa Salmon with Lemon Couscous", tags: ["fish"], cuisine: "Morocco", protein: "fish",
      prep: 5, cook: 12,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(1.5, "tbsp", "harissa paste", "store"),
        ing(60, "g", "couscous", "store"), ing(80, "ml", "vegetable stock", "store"),
        ing(0.5, "", "lemon", "produce"), ing(null, "small handful", "fresh parsley, chopped", "produce"),
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
        ing(0.5, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "garam masala", "spice"),
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
        ing(150, "g", "chopped tomatoes", "store"), ing(0.25, "", "onion, finely chopped", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
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
        ing(200, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(null, "small handful", "fresh parsley, chopped", "produce"), ing(1, "slice", "crusty bread", "bakery")
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
      id: "d9", title: "Lemon & Herb Cod with Crushed Potatoes", tags: ["fish"], cuisine: "UK", protein: "fish",
      prep: 6, cook: 15,
      ingredients: [
        ing(150, "g", "cod fillet (or other firm white fish)", "meat"), ing(150, "g", "new potatoes", "produce"),
        ing(15, "g", "butter", "dairy"), ing(0.5, "", "lemon", "produce"),
        ing(null, "small handful", "fresh parsley, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
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
        ing(80, "g", "tagliatelle", "store"), ing(150, "g", "chestnut mushrooms, sliced", "produce"),
        ing(2, "", "garlic clove, finely chopped", "produce"), ing(80, "ml", "double cream", "dairy"),
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
        ing(0.25, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(null, "small handful", "fresh mint, torn", "produce"), ing(1, "tsp", "olive oil", "store")
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
        ing(0.25, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
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
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "red onion, cut into wedges", "produce"),
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
      id: "d17", title: "Teriyaki Salmon with Sesame Greens", tags: ["fish"], cuisine: "Japan", protein: "fish",
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
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "", "pepper, sliced", "produce"),
        ing(1, "", "spring onion, sliced", "produce"), ing(70, "g", "egg noodles", "store"),
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
        ing(0.25, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(0.5, "tsp", "ground turmeric", "spice"),
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
        ing(150, "g", "chicken breast, sliced", "meat"), ing(0.5, "", "pepper, sliced", "produce"),
        ing(0.5, "", "red onion, sliced", "produce"), ing(1.5, "tsp", "fajita seasoning", "spice"),
        ing(0.5, "", "lime", "produce"), ing(60, "g", "basmati rice", "store"),
        ing(null, "small handful", "fresh coriander, chopped", "produce"), ing(1, "tbsp", "vegetable oil", "store")
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
        ing(180, "g", "pork chop", "meat"), ing(0.5, "", "apple, thinly sliced", "produce"),
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
        ing(0.5, "", "red onion, finely chopped", "produce"), ing(1.5, "tbsp", "olive oil", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(null, "pinch", "chilli flakes", "spice"),
        ing(null, "small handful", "fresh parsley, chopped", "produce"), ing(50, "g", "couscous", "store")
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
        ing(150, "g", "chopped tomatoes", "store"), ing(1, "", "small carrot, finely diced", "produce"),
        ing(0.25, "", "onion, finely diced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
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
      id: "d24", title: "White Fish Tacos with Lime Slaw", tags: ["fish"], cuisine: "Mexico", protein: "fish",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "white fish fillet (pollock or cod)", "meat"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(2, "", "soft tortillas", "bakery"),
        ing(60, "g", "red cabbage, shredded", "produce"), ing(0.5, "", "lime", "produce"),
        ing(1, "tbsp", "soured cream", "dairy"), ing(null, "small handful", "fresh coriander, chopped", "produce"),
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
        ing(100, "g", "halloumi", "dairy"), ing(0.5, "", "courgette, sliced", "produce"),
        ing(8, "", "cherry tomatoes", "produce"), ing(60, "g", "couscous", "store"),
        ing(80, "ml", "vegetable stock", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(null, "small handful", "fresh mint, chopped", "produce"), ing(0.5, "", "lemon", "produce")
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
        ing(0.25, "", "red onion, thinly sliced", "produce"), ing(1, "tbsp", "olive oil", "store")
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
        ing(150, "g", "chopped tomatoes", "store"), ing(1, "", "small carrot, diced", "produce"),
        ing(0.25, "", "onion, diced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
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
        ing(0.5, "", "pepper, sliced", "produce"), ing(150, "g", "shop-bought sweet and sour sauce", "store"),
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
        ing(2, "", "garlic clove, whole", "produce"), ing(2, "tbsp", "olive oil", "store"),
        ing(null, "pinch", "chilli flakes", "spice"), ing(80, "g", "fusilli or penne", "store"),
        ing(null, "small handful", "fresh basil, torn", "produce")
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
        ing(0.5, "", "pepper, diced", "produce"), ing(0.25, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(1, "tsp", "Cajun seasoning", "spice"),
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
      id: "d33", title: "Pan-Seared Trout with Almonds", tags: ["fish"], cuisine: "France", protein: "fish",
      prep: 5, cook: 8,
      ingredients: [
        ing(150, "g", "trout fillet", "meat"), ing(1, "tbsp", "flaked almonds", "store"),
        ing(20, "g", "butter", "dairy"), ing(0.5, "", "lemon", "produce"),
        ing(80, "g", "green beans", "produce"), ing(1, "tbsp", "plain flour", "store"),
        ing(null, "small handful", "fresh parsley, chopped", "produce")
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
        ing(250, "ml", "vegetable stock", "store"), ing(0.25, "", "onion, finely chopped", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
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
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(70, "g", "jasmine rice", "store"),
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
        ing(100, "g", "halloumi, cubed", "dairy"), ing(0.5, "", "courgette, cubed", "produce"),
        ing(6, "", "cherry tomatoes", "produce"), ing(0.5, "", "pepper, cubed", "produce"),
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
        ing(1, "tsp", "soy sauce", "store"), ing(1, "", "spring onion, sliced", "produce"),
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
        ing(0.25, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
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
        ing(null, "small handful", "fresh coriander, chopped", "produce"), ing(1, "tbsp", "tahini", "store")
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
        ing(1, "", "thumb-sized piece fresh ginger, finely sliced", "produce"), ing(1, "", "garlic clove, finely sliced", "produce"),
        ing(1, "tbsp", "soy sauce", "store"), ing(60, "g", "egg noodles", "store"),
        ing(null, "handful", "pak choi or spinach", "produce"), ing(1, "", "spring onion, sliced", "produce")
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
        ing(1, "", "little gem lettuce", "produce"), ing(1, "", "spring onion, sliced", "produce"),
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
        ing(0.5, "", "lemon", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
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
        ing(6, "", "shop-bought pork meatballs", "meat"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(200, "g", "chopped tomatoes", "store"),
        ing(15, "g", "parmesan, grated", "dairy"), ing(80, "g", "spaghetti", "store"),
        ing(null, "small handful", "fresh basil, torn", "produce"), ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Heat the olive oil in a frying pan over medium heat and fry the meatballs for 5–6 minutes, turning, until browned all over.",
        "Add the garlic, oregano and chopped tomatoes, and simmer for 8–10 minutes until the meatballs are cooked through and the sauce has thickened.",
        "Meanwhile, cook the spaghetti in salted boiling water according to the packet instructions, then drain.",
        "Toss the spaghetti through the sauce, top with grated Parmesan and torn basil."
      ]
    },
    {
      id: "d45", title: "Smoked Mackerel & Beetroot Salad", tags: ["fish", "quick"], cuisine: "UK", protein: "fish",
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
        ing(80, "g", "kidney beans, drained", "store"), ing(1, "", "spring onion, sliced", "produce"),
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
        ing(1, "", "medium sweet potato, cubed", "produce"), ing(150, "g", "black beans, drained", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.5, "", "lime", "produce"), ing(0.5, "", "avocado, sliced", "produce"),
        ing(null, "small handful", "fresh coriander, chopped", "produce"), ing(1, "tbsp", "olive oil", "store")
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
        ing(1, "", "small carrot, finely diced", "produce"), ing(0.25, "", "onion, finely diced", "produce"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(0.5, "tsp", "dried oregano", "spice"),
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
        ing(1, "tsp", "sesame seeds", "store"), ing(1, "", "spring onion, sliced", "produce"),
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
        ing(null, "small handful", "fresh mint, chopped", "produce")
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
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "sesame seeds", "store")
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
      id: "d55", title: "Moroccan-Spiced Cod Traybake with Chickpeas", tags: ["fish"], cuisine: "Morocco", protein: "fish",
      prep: 7, cook: 18,
      ingredients: [
        ing(150, "g", "cod fillet", "meat"), ing(200, "g", "tinned chickpeas, drained", "store"),
        ing(100, "g", "cherry tomatoes", "produce"), ing(1, "tsp", "ras el hanout", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "lemon", "produce"),
        ing(null, "small handful", "fresh coriander, chopped", "produce")
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
        ing(0.5, "", "red onion, cut into wedges", "produce"), ing(null, "small handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the sweet potato with the oil and half the harissa on a baking tray, and roast for 15 minutes.",
        "Add the chickpeas and red onion, tossed through the remaining harissa, and roast for a further 10 minutes until the sweet potato is tender and caramelised at the edges.",
        "Scatter with coriander to serve."
      ]
    },
    {
      id: "d57", title: "Sticky Soy Salmon Traybake with Broccoli", tags: ["fish", "quick"], cuisine: "China", protein: "fish",
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
        ing(1, "tsp", "dried mixed herbs", "spice"), ing(1, "", "garlic clove, crushed", "produce")
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
        ing(1.5, "tbsp", "brown sugar", "store"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "spring onion, sliced", "produce"),
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
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "tsp", "cornflour", "store"),
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
        ing(1, "tsp", "sesame oil", "store"), ing(1, "", "garlic clove, finely chopped", "produce")
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
        ing(1, "", "red chilli, sliced", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
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
        ing(1, "", "garlic clove, crushed", "produce"), ing(70, "g", "basmati rice", "store"),
        ing(null, "small handful", "fresh coriander, chopped", "produce")
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
        ing(1, "tbsp", "medium curry powder", "spice"), ing(1, "", "garlic clove, crushed", "produce"),
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
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tbsp", "medium curry powder", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(70, "g", "basmati rice", "store"), ing(null, "small handful", "fresh coriander, chopped", "produce")
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
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "tbsp", "medium curry powder or garam masala", "spice"),
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
        ing(null, "small handful", "fresh mint, chopped", "produce"), ing(0.5, "", "lemon", "produce")
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
        ing(0.5, "", "lemon", "produce"), ing(null, "small handful", "fresh parsley, chopped", "produce")
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
        ing(0.5, "", "avocado, sliced", "produce")
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
        ing(2, "", "flour tortillas", "bakery"), ing(50, "g", "cheddar, grated", "dairy"),
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
        ing(40, "g", "tortilla chips", "store"), ing(30, "g", "cheddar, grated", "dairy"),
        ing(null, "small handful", "fresh coriander, chopped", "produce")
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
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(70, "g", "rice", "store"),
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
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
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
        ing(0.5, "", "pepper, sliced", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
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
        ing(0.5, "tsp", "ground cumin", "spice"), ing(1, "", "garlic clove, crushed", "produce"),
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
        ing(15, "g", "parmesan, grated", "dairy")
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
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(30, "g", "rocket", "produce"), ing(15, "g", "parmesan, grated", "dairy")
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
        ing(100, "g", "cherry tomatoes, halved", "produce"), ing(15, "g", "parmesan, grated", "dairy")
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
        ing(2, "tbsp", "breadcrumbs", "store"), ing(null, "small handful", "fresh parsley, chopped", "produce")
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
        ing(40, "g", "cheddar or gruyere, grated", "dairy"), ing(1, "tsp", "dijon mustard", "store"),
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
        ing(60, "g", "cabbage or kale, shredded", "produce"), ing(15, "g", "butter", "dairy"),
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
      id: "d97", title: "Miso Butter Salmon with Steamed Rice", tags: ["fish"], cuisine: "Japan", protein: "fish",
      prep: 6, cook: 12,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(1, "tbsp", "miso paste", "store"),
        ing(15, "g", "butter, softened", "dairy"), ing(1, "tsp", "soy sauce", "store"),
        ing(70, "g", "jasmine rice", "store"), ing(1, "", "spring onion, sliced", "produce")
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
        ing(1, "tsp", "sesame oil", "store"), ing(1, "", "garlic clove, finely chopped", "produce")
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
        ing(1, "", "egg", "dairy"), ing(1, "", "spring onion, sliced", "produce")
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
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
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
    },
    {
      id: "d103", title: "Polish Sausage & Sauerkraut Skillet", tags: ["quick"], cuisine: "Poland", protein: "pork",
      prep: 7, cook: 12,
      ingredients: [
        ing(2, "", "pork sausages, sliced", "meat"), ing(150, "g", "sauerkraut, drained", "store"),
        ing(1, "", "small potato, diced", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "tsp", "caraway seeds", "spice"), ing(1, "tsp", "Dijon mustard", "store")
      ],
      steps: [
        "Boil the diced potato for 8–10 minutes until tender, then drain.",
        "Fry the sausage slices and onion in a splash of oil over medium-high heat for 5–6 minutes until browned.",
        "Stir in the sauerkraut, caraway seeds and boiled potato, and cook for 3–4 minutes until hot through.",
        "Serve with the mustard stirred through or on the side."
      ]
    },
    {
      id: "d104", title: "Polish-Style Potato & Curd Cheese Bake", tags: ["vegetarian", "quick"], cuisine: "Poland", protein: "plant-based",
      prep: 8, cook: 14,
      ingredients: [
        ing(250, "g", "potato, sliced thin", "produce"), ing(100, "g", "cottage cheese or curd cheese", "dairy"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "butter", "dairy"), ing(null, "small handful", "chives, chopped", "produce")
      ],
      steps: [
        "Fry the onion in the butter over medium heat for 5 minutes until soft and golden.",
        "Layer the potato slices in a small ovenproof dish with the fried onion and cottage cheese.",
        "Bake at 200°C (fan 180°C) for 14 minutes until the potato is tender and the top is golden.",
        "Dollop with soured cream and scatter with chives to serve."
      ]
    },
    {
      id: "d105", title: "Polish Dill Chicken with Soured Cream", tags: ["quick"], cuisine: "Poland", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "chicken breast, sliced", "meat"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(1, "tsp", "plain flour", "store"), ing(100, "ml", "chicken stock", "store"),
        ing(null, "handful", "fresh dill, chopped", "produce"), ing(70, "g", "new potatoes", "produce")
      ],
      steps: [
        "Boil the new potatoes for 12 minutes until tender, then drain.",
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until browned and cooked through.",
        "Stir in the flour, then pour in the stock and simmer for 2 minutes until slightly thickened.",
        "Stir in the soured cream and most of the dill, and serve over the potatoes, scattered with the rest of the dill."
      ]
    },
    {
      id: "d106", title: "Hungarian-Style Chicken Paprikash", tags: ["quick"], cuisine: "Hungary", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "tbsp", "sweet paprika", "spice"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(150, "g", "chopped tomatoes", "store"), ing(70, "g", "egg noodles or pasta", "store")
      ],
      steps: [
        "Cook the noodles according to the packet instructions.",
        "Fry the onion in a splash of oil over medium heat for 4 minutes until soft.",
        "Add the chicken and paprika, and cook for 6–7 minutes until the chicken is browned.",
        "Stir in the chopped tomatoes and simmer for 4 minutes, then stir through the soured cream and serve over the noodles."
      ]
    },
    {
      id: "d107", title: "Hungarian Beef Goulash-Style Stew", tags: [], cuisine: "Hungary", protein: "beef",
      prep: 9, cook: 20,
      ingredients: [
        ing(160, "g", "beef stewing steak, diced", "meat"), ing(1, "", "small potato, chunked", "produce"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(1.5, "tbsp", "sweet paprika", "spice"),
        ing(200, "ml", "beef stock", "store"), ing(1, "", "garlic clove, finely chopped", "produce")
      ],
      steps: [
        "Brown the beef in a splash of oil in a saucepan over high heat for 3–4 minutes.",
        "Add the potato, red pepper and garlic, and cook for 2 minutes.",
        "Stir in the paprika, then pour in the stock, cover and simmer for 15 minutes until the beef and potato are tender.",
        "Season and serve in a bowl, with bread if you like."
      ]
    },
    {
      id: "d108", title: "Hungarian Cabbage & Sausage Skillet", tags: ["quick"], cuisine: "Hungary", protein: "pork",
      prep: 7, cook: 13,
      ingredients: [
        ing(2, "", "smoked sausages, sliced", "meat"), ing(200, "g", "white cabbage, shredded", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "tsp", "sweet paprika", "spice"),
        ing(1, "tsp", "caraway seeds", "spice"), ing(1, "tbsp", "soured cream", "dairy")
      ],
      steps: [
        "Fry the sausage and onion in a splash of oil over medium-high heat for 4 minutes.",
        "Add the cabbage, paprika and caraway seeds, and cook for 8–9 minutes, stirring often, until the cabbage has softened.",
        "Stir through the soured cream off the heat and serve."
      ]
    },
    {
      id: "d109", title: "Israeli-Style Shakshuka", tags: ["vegetarian", "spicy", "quick"], cuisine: "Israel", protein: "plant-based",
      prep: 6, cook: 12,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(200, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Fry the onion and red pepper in a splash of oil over medium heat for 5 minutes until softening.",
        "Stir in the cumin and chilli flakes, then add the chopped tomatoes and simmer for 5 minutes until thickened.",
        "Make two wells in the sauce, crack in the eggs, cover and cook for 4–5 minutes until the whites are set.",
        "Serve straight from the pan with the flatbread."
      ]
    },
    {
      id: "d110", title: "Israeli Couscous Salad with Halloumi", tags: ["vegetarian", "quick"], cuisine: "Israel", protein: "plant-based",
      prep: 8, cook: 8,
      ingredients: [
        ing(70, "g", "giant couscous", "store"), ing(80, "g", "halloumi, sliced", "dairy"),
        ing(60, "g", "cucumber, diced", "produce"), ing(50, "g", "cherry tomatoes, halved", "produce"),
        ing(0.5, "", "lemon", "produce"), ing(null, "small handful", "fresh mint, chopped", "produce")
      ],
      steps: [
        "Cook the giant couscous according to the packet instructions, then drain and cool slightly.",
        "Fry the halloumi slices in a dry pan for 1–2 minutes each side until golden.",
        "Toss the couscous with the cucumber, tomatoes, lemon juice and mint.",
        "Top with the fried halloumi to serve."
      ]
    },
    {
      id: "d111", title: "Israeli-Style Chicken Skewers with Tahini", tags: ["quick"], cuisine: "Israel", protein: "chicken",
      prep: 9, cook: 9,
      ingredients: [
        ing(160, "g", "chicken breast, cubed", "meat"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(2, "tbsp", "tahini", "store"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Toss the chicken with the cumin, paprika and a splash of oil.",
        "Thread onto skewers (or leave loose) and griddle or fry over medium-high heat for 8–9 minutes, turning, until cooked through.",
        "Whisk the tahini with the lemon juice and a splash of water until smooth and drizzly.",
        "Serve the chicken in the flatbread, drizzled with the tahini sauce."
      ]
    },
    {
      id: "d112", title: "Egyptian-Style Koshari Bowl", tags: ["vegetarian", "vegan"], cuisine: "Egypt", protein: "plant-based",
      prep: 8, cook: 15,
      ingredients: [
        ing(50, "g", "dried brown lentils", "store"), ing(50, "g", "rice", "store"),
        ing(30, "g", "small dried pasta", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, thinly sliced", "produce"), ing(0.5, "tsp", "ground cumin", "spice")
      ],
      steps: [
        "Cook the lentils, rice and pasta together in plenty of water for 12–15 minutes until all are tender, then drain.",
        "Meanwhile, fry the onion in a splash of oil over medium heat for 8–10 minutes until deep golden and crisp.",
        "Warm the chopped tomatoes with the cumin in a small pan for 5 minutes.",
        "Serve the lentil, rice and pasta mix topped with the tomato sauce and crispy onions."
      ]
    },
    {
      id: "d113", title: "Egyptian-Style Spiced Beef Rice", tags: ["quick"], cuisine: "Egypt", protein: "beef",
      prep: 7, cook: 14,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(70, "g", "rice", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(150, "g", "chopped tomatoes", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince, until browned.",
        "Stir in the cumin and cinnamon, then add the chopped tomatoes and simmer for 5 minutes.",
        "Serve the spiced beef over the rice."
      ]
    },
    {
      id: "d114", title: "Tunisian-Style Harissa Chickpea Stew", tags: ["vegetarian", "vegan", "spicy", "quick"], cuisine: "Tunisia", protein: "plant-based",
      prep: 7, cook: 12,
      ingredients: [
        ing(1, "tin", "chickpeas, drained", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(1, "tbsp", "harissa paste", "store"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Fry the red pepper and garlic in a splash of oil over medium heat for 4 minutes.",
        "Stir in the harissa, then add the chickpeas and chopped tomatoes.",
        "Simmer for 8 minutes, stirring occasionally, until thickened.",
        "Serve with the crusty bread for scooping."
      ]
    },
    {
      id: "d115", title: "Tunisian-Style Spiced Lamb with Couscous", tags: ["spicy", "quick"], cuisine: "Tunisia", protein: "lamb",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(60, "g", "couscous", "store"),
        ing(1, "tsp", "harissa paste", "store"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "", "courgette, diced", "produce"), ing(null, "small handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Cover the couscous with boiling water, cover and leave for 5 minutes, then fluff with a fork.",
        "Fry the lamb mince and courgette in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince.",
        "Stir in the harissa and cumin, and cook for 1 minute more.",
        "Serve the spiced lamb over the couscous, scattered with coriander."
      ]
    }
,
    {
      id: "d116", title: "West African-Style Jollof Rice with Chicken", tags: ["spicy", "quick"], cuisine: "Nigeria", protein: "chicken",
      prep: 8, cook: 18,
      ingredients: [
        ing(150, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice")
      ],
      steps: [
        "Fry the onion and red pepper in a splash of oil over medium heat for 4 minutes.",
        "Add the chicken and cook for 5 minutes until browned.",
        "Stir in the paprika, chilli flakes, chopped tomatoes and rice, then add 150ml water.",
        "Cover and simmer for 15–16 minutes, stirring once, until the rice is tender and the liquid absorbed."
      ]
    },
    {
      id: "d117", title: "West African-Style Peanut & Vegetable Stew", tags: ["vegetarian", "vegan", "spicy"], cuisine: "Nigeria", protein: "plant-based",
      prep: 8, cook: 15,
      ingredients: [
        ing(2, "tbsp", "peanut butter", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "sweet potato, diced", "produce"), ing(60, "g", "spinach or kale", "produce"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Simmer the sweet potato in the chopped tomatoes with 100ml water for 10 minutes until nearly tender.",
        "Stir in the peanut butter and chilli flakes until smooth, then simmer for 3 minutes.",
        "Stir in the spinach until wilted and serve over the rice."
      ]
    },
    {
      id: "d118", title: "West African-Style Spiced Beef Skewers", tags: ["spicy", "quick"], cuisine: "Nigeria", protein: "beef",
      prep: 9, cook: 9,
      ingredients: [
        ing(160, "g", "beef rump steak, cubed", "meat"), ing(1, "tsp", "ground ginger", "spice"),
        ing(0.5, "tsp", "cayenne pepper", "spice"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "", "flatbread", "bakery"), ing(60, "g", "cabbage, shredded", "produce")
      ],
      steps: [
        "Toss the beef with the ginger, cayenne, paprika and a splash of oil.",
        "Griddle or fry over high heat for 3–4 minutes, turning, until charred and cooked to your liking.",
        "Rest for 2 minutes, then slice.",
        "Serve in the flatbread with the shredded cabbage."
      ]
    },
    {
      id: "d119", title: "Sri Lankan-Style Coconut Chicken Curry", tags: ["spicy", "quick"], cuisine: "Sri Lanka", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(1, "tsp", "curry powder", "spice"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken with the curry powder, turmeric and chilli flakes in a splash of oil over medium-high heat for 5 minutes.",
        "Pour in the coconut milk and simmer for 10 minutes until the chicken is cooked through and the sauce has thickened.",
        "Serve over the rice."
      ]
    },
    {
      id: "d120", title: "Sri Lankan-Style Coconut Dhal", tags: ["vegetarian", "vegan", "spicy"], cuisine: "Sri Lanka", protein: "plant-based",
      prep: 6, cook: 15,
      ingredients: [
        ing(80, "g", "dried red lentils", "store"), ing(150, "ml", "coconut milk", "store"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Rinse the lentils, then simmer with the turmeric, chilli flakes, garlic and 200ml water for 12 minutes until soft.",
        "Stir in the coconut milk and simmer for 3 minutes until thickened.",
        "Season and serve with the flatbread."
      ]
    },
    {
      id: "d121", title: "Sri Lankan-Style Spiced Fish", tags: ["fish", "spicy", "quick"], cuisine: "Sri Lanka", protein: "fish",
      prep: 8, cook: 9,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(1, "tsp", "curry powder", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(0.5, "", "lime", "produce"),
        ing(70, "g", "rice", "store"), ing(60, "g", "green beans", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions, adding the green beans for the last 4 minutes.",
        "Rub the fish with curry powder and turmeric.",
        "Fry in a splash of oil over medium-high heat for 3–4 minutes each side until just cooked through and flaking easily.",
        "Serve over the rice and beans with a squeeze of lime."
      ]
    },
    {
      id: "d122", title: "Malaysian-Style Chicken Satay", tags: ["spicy", "quick"], cuisine: "Malaysia", protein: "chicken",
      prep: 9, cook: 9,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(1, "tsp", "curry powder", "spice"),
        ing(2, "tbsp", "peanut butter", "store"), ing(1, "tbsp", "soy sauce", "store"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the curry powder and a splash of oil, then fry over medium-high heat for 6–7 minutes until cooked through.",
        "Whisk the peanut butter, soy sauce, chilli flakes and a splash of hot water into a smooth sauce.",
        "Serve the chicken over the rice, drizzled with the satay sauce."
      ]
    },
    {
      id: "d123", title: "Malaysian-Style Nasi Goreng", tags: ["spicy", "quick"], cuisine: "Malaysia", protein: "chicken",
      prep: 7, cook: 8,
      ingredients: [
        ing(150, "g", "cooked rice, cold", "store"), ing(100, "g", "chicken breast, diced", "meat"),
        ing(1, "", "egg", "dairy"), ing(1, "tbsp", "soy sauce", "store"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(60, "g", "frozen peas", "frozen")
      ],
      steps: [
        "Fry the chicken in a splash of oil over high heat for 5 minutes until cooked through, then push to one side.",
        "Add the cold rice, peas, soy sauce and chilli flakes, and stir-fry for 3–4 minutes until hot through.",
        "Push everything to one side, crack in the egg and scramble until just set, then mix through.",
        "Serve hot."
      ]
    },
    {
      id: "d124", title: "Malaysian-Style Coconut Laksa", tags: ["spicy", "quick"], cuisine: "Malaysia", protein: "chicken",
      prep: 8, cook: 10,
      ingredients: [
        ing(120, "g", "chicken breast, sliced", "meat"), ing(70, "g", "rice noodles", "store"),
        ing(150, "ml", "coconut milk", "store"), ing(1, "tsp", "curry powder", "spice"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(60, "g", "beansprouts", "produce")
      ],
      steps: [
        "Soak the rice noodles in boiling water for 5 minutes, then drain.",
        "Fry the chicken with the curry powder and chilli flakes in a splash of oil over medium-high heat for 5–6 minutes.",
        "Pour in the coconut milk and 100ml water, and simmer for 3 minutes.",
        "Stir in the noodles and beansprouts, warm through and serve."
      ]
    },
    {
      id: "d125", title: "Singapore-Style Chilli Chicken Noodles", tags: ["spicy", "quick"], cuisine: "Singapore", protein: "chicken",
      prep: 8, cook: 8,
      ingredients: [
        ing(120, "g", "chicken breast, sliced", "meat"), ing(70, "g", "egg noodles", "store"),
        ing(1, "tbsp", "tomato ketchup", "store"), ing(1, "tsp", "chilli sauce", "store"),
        ing(1, "tsp", "curry powder", "spice"), ing(60, "g", "beansprouts", "produce")
      ],
      steps: [
        "Cook the noodles according to the packet instructions, then drain.",
        "Fry the chicken with the curry powder in a splash of oil over high heat for 5–6 minutes until cooked through.",
        "Stir in the ketchup and chilli sauce, then add the noodles and beansprouts and toss for 2 minutes.",
        "Serve hot."
      ]
    },
    {
      id: "d126", title: "Singapore-Style Turmeric Rice Bowl", tags: ["quick"], cuisine: "Singapore", protein: "chicken",
      prep: 7, cook: 15,
      ingredients: [
        ing(150, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(100, "ml", "chicken stock", "store"), ing(60, "g", "cucumber, sliced", "produce")
      ],
      steps: [
        "Fry the chicken and garlic in a splash of oil over medium-high heat for 5 minutes.",
        "Stir in the turmeric and rice, then pour in the stock.",
        "Cover and simmer for 14–15 minutes until the rice is tender and the liquid absorbed.",
        "Serve with the sliced cucumber."
      ]
    },
    {
      id: "d127", title: "Pakistani-Style Chicken Karahi", tags: ["spicy", "quick"], cuisine: "Pakistan", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(1, "", "green chilli, sliced", "produce"), ing(1, "tsp", "ground ginger", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Fry the chicken in a splash of oil over medium-high heat for 5 minutes until browned.",
        "Stir in the ginger and cumin, then add the chopped tomatoes and green chilli.",
        "Simmer for 10 minutes until the chicken is cooked through and the sauce has thickened.",
        "Serve with the flatbread."
      ]
    },
    {
      id: "d128", title: "Pakistani-Style Spiced Lentil Dhal", tags: ["vegetarian", "vegan", "spicy"], cuisine: "Pakistan", protein: "plant-based",
      prep: 6, cook: 15,
      ingredients: [
        ing(80, "g", "dried red lentils", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(1, "", "garlic clove, finely chopped", "produce")
      ],
      steps: [
        "Rinse the lentils, then simmer with the turmeric and 300ml water for 12 minutes until soft.",
        "Meanwhile, fry the onion and garlic in a splash of oil for 5 minutes until golden.",
        "Stir the cumin and chilli flakes into the onions, then stir this through the cooked lentils.",
        "Season and serve."
      ]
    },
    {
      id: "d129", title: "Pakistani-Style Beef Seekh Kebabs", tags: ["spicy", "quick"], cuisine: "Pakistan", protein: "beef",
      prep: 9, cook: 9,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "", "flatbread", "bakery"), ing(2, "tbsp", "natural yoghurt", "dairy")
      ],
      steps: [
        "Mix the beef mince with the cumin, chilli flakes and garlic, and shape into two long kebabs.",
        "Fry or griddle over medium-high heat for 8–9 minutes, turning, until cooked through.",
        "Warm the flatbread.",
        "Serve the kebabs in the flatbread with a dollop of yoghurt."
      ]
    }
,
    {
      id: "d130", title: "Swedish-Style Meatballs with Lingonberry", tags: ["quick"], cuisine: "Sweden", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(1, "tbsp", "breadcrumbs", "store"),
        ing(1, "", "egg yolk", "dairy"), ing(100, "ml", "beef stock", "store"),
        ing(2, "tbsp", "soured cream", "dairy"), ing(1, "tbsp", "cranberry sauce", "store")
      ],
      steps: [
        "Mix the mince with the breadcrumbs and egg yolk, and shape into small meatballs.",
        "Fry in a splash of oil over medium heat for 8–9 minutes, turning, until browned and cooked through.",
        "Pour in the stock and soured cream, and simmer for 2 minutes until the sauce comes together.",
        "Serve with the cranberry sauce on the side."
      ]
    },
    {
      id: "d131", title: "Swedish-Style Dill Salmon with New Potatoes", tags: ["fish", "quick"], cuisine: "Sweden", protein: "fish",
      prep: 7, cook: 12,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(120, "g", "new potatoes, halved", "produce"),
        ing(null, "handful", "fresh dill, chopped", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(0.5, "", "lemon", "produce")
      ],
      steps: [
        "Boil the new potatoes for 12 minutes until tender, then drain.",
        "Meanwhile, fry the salmon skin-side down in the butter over medium heat for 4 minutes, then flip and cook for 3–4 minutes more.",
        "Toss the potatoes with the dill and a squeeze of lemon.",
        "Serve the salmon with the potatoes."
      ]
    },
    {
      id: "d132", title: "Brazilian-Style Black Bean & Rice Bowl", tags: ["vegetarian", "vegan", "quick"], cuisine: "Brazil", protein: "plant-based",
      prep: 7, cook: 12,
      ingredients: [
        ing(1, "tin", "black beans, drained", "store"), ing(70, "g", "rice", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(0.5, "", "orange, segmented", "produce"), ing(null, "small handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and garlic in a splash of oil over medium heat for 4 minutes.",
        "Add the black beans and a splash of water, and simmer for 6–7 minutes, mashing some of the beans for a thicker sauce.",
        "Serve over the rice with the orange segments and coriander."
      ]
    },
    {
      id: "d133", title: "Brazilian-Style Lime Chicken with Rice", tags: ["quick"], cuisine: "Brazil", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(1, "", "lime", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(null, "small handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the paprika, garlic and a squeeze of lime juice.",
        "Fry in a splash of oil over medium-high heat for 7–8 minutes until browned and cooked through.",
        "Serve over the rice with the remaining lime and coriander."
      ]
    },
    {
      id: "d134", title: "Brazilian-Style Beef & Pepper Skewers", tags: ["quick"], cuisine: "Brazil", protein: "beef",
      prep: 9, cook: 9,
      ingredients: [
        ing(160, "g", "beef rump steak, cubed", "meat"), ing(0.5, "", "red pepper, chunked", "produce"),
        ing(0.5, "", "onion, chunked", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the beef, pepper and onion with the garlic and a splash of oil.",
        "Thread onto skewers (or leave loose) and griddle over high heat for 3–4 minutes each side until charred.",
        "Serve over the rice."
      ]
    },
    {
      id: "d135", title: "Peruvian-Style Lomo Saltado", tags: ["quick"], cuisine: "Peru", protein: "beef",
      prep: 8, cook: 10,
      ingredients: [
        ing(160, "g", "beef rump steak, sliced", "meat"), ing(0.5, "", "red onion, sliced", "produce"),
        ing(1, "", "tomato, wedged", "produce"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "", "small potato, cut into chips, par-cooked", "produce"), ing(0.5, "tsp", "smoked paprika", "spice")
      ],
      steps: [
        "Microwave or par-boil the potato chips for 4 minutes, then drain.",
        "Fry the beef over high heat for 2–3 minutes until browned, then remove.",
        "Fry the potato chips, onion and tomato with the paprika for 5 minutes until the potato is golden.",
        "Return the beef to the pan with the soy sauce, toss for 1 minute and serve."
      ]
    },
    {
      id: "d136", title: "Peruvian-Style Chicken with Green Sauce", tags: ["spicy", "quick"], cuisine: "Peru", protein: "chicken",
      prep: 9, cook: 9,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(null, "handful", "fresh coriander, finely chopped", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(2, "tbsp", "natural yoghurt", "dairy"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until cooked through.",
        "Blitz or finely chop the coriander with the garlic, yoghurt and chilli flakes into a sauce.",
        "Serve the chicken over the rice with the green sauce."
      ]
    },
    {
      id: "d137", title: "Argentinian-Style Chimichurri Steak", tags: ["quick"], cuisine: "Argentina", protein: "beef",
      prep: 8, cook: 7,
      ingredients: [
        ing(160, "g", "beef sirloin steak", "meat"), ing(null, "handful", "fresh parsley, chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "red wine vinegar", "store"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(120, "g", "new potatoes", "produce")
      ],
      steps: [
        "Boil the new potatoes for 12 minutes until tender, then drain.",
        "Mix the parsley, garlic, vinegar, chilli flakes and a splash of oil into a chimichurri sauce.",
        "Fry the steak over high heat for 2–3 minutes each side for medium, then rest for 3 minutes.",
        "Slice the steak and serve with the potatoes and chimichurri spooned over."
      ]
    },
    {
      id: "d138", title: "Argentinian-Style Empanada Bowl", tags: ["quick"], cuisine: "Argentina", protein: "beef",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(30, "g", "raisins", "store"), ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince, until browned.",
        "Stir in the cumin, chilli flakes and raisins, and cook for 2 minutes more.",
        "Warm the flatbread.",
        "Serve the spiced beef spooned over the flatbread."
      ]
    },
    {
      id: "d139", title: "Australian-Style Barramundi with Salad", tags: ["fish", "quick"], cuisine: "Australia", protein: "fish",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(60, "g", "mixed salad leaves", "produce"),
        ing(0.5, "", "avocado, sliced", "produce"), ing(0.5, "", "lemon", "produce"),
        ing(70, "g", "new potatoes", "produce")
      ],
      steps: [
        "Boil the new potatoes for 12 minutes until tender, then drain.",
        "Fry the fish in a splash of oil over medium-high heat for 3–4 minutes each side until just cooked through and flaking easily.",
        "Toss the salad leaves and avocado with a squeeze of lemon.",
        "Serve the fish with the potatoes and salad."
      ]
    },
    {
      id: "d140", title: "Australian-Style Lamb Chops with Mint", tags: ["quick"], cuisine: "Australia", protein: "lamb",
      prep: 7, cook: 9,
      ingredients: [
        ing(2, "", "lamb chops", "meat"), ing(null, "handful", "fresh mint, chopped", "produce"),
        ing(1, "tbsp", "natural yoghurt", "dairy"), ing(120, "g", "new potatoes", "produce"),
        ing(60, "g", "green beans", "produce")
      ],
      steps: [
        "Boil the potatoes and green beans together for 10–12 minutes until tender, then drain.",
        "Fry the lamb chops over medium-high heat for 3–4 minutes each side until browned and cooked to your liking.",
        "Stir the mint through the yoghurt.",
        "Serve the chops with the potatoes, beans and minted yoghurt."
      ]
    },
    {
      id: "d141", title: "Russian-Style Beetroot Soup", tags: ["vegetarian", "quick"], cuisine: "Russia", protein: "plant-based",
      prep: 7, cook: 12,
      ingredients: [
        ing(150, "g", "cooked beetroot, diced", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(300, "ml", "vegetable stock", "store"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(null, "small handful", "fresh dill, chopped", "produce"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Fry the onion in a splash of oil over medium heat for 4 minutes until soft.",
        "Add the beetroot and stock, and simmer for 8 minutes.",
        "Blitz or mash roughly to your preferred texture.",
        "Serve with a dollop of soured cream, dill and the crusty bread."
      ]
    },
    {
      id: "d142", title: "Russian-Style Chicken & Mushroom Skillet", tags: ["quick"], cuisine: "Russia", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(1, "tsp", "Dijon mustard", "store"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken, mushrooms and onion in a splash of oil over medium-high heat for 8–9 minutes until the chicken is cooked through.",
        "Stir in the soured cream and mustard, and warm through for 1 minute.",
        "Serve over the rice."
      ]
    },
    {
      id: "d143", title: "Austrian-Style Chicken Schnitzel", tags: ["quick"], cuisine: "Austria", protein: "chicken",
      prep: 9, cook: 9,
      ingredients: [
        ing(150, "g", "chicken breast, flattened", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(3, "tbsp", "breadcrumbs", "store"),
        ing(0.5, "", "lemon", "produce"), ing(60, "g", "mixed salad leaves", "produce")
      ],
      steps: [
        "Coat the chicken in flour, then the beaten egg, then the breadcrumbs.",
        "Fry in a generous splash of oil over medium heat for 3–4 minutes each side until golden and cooked through.",
        "Rest for 1 minute on kitchen paper.",
        "Serve with a squeeze of lemon and the salad leaves."
      ]
    },
    {
      id: "d144", title: "Austrian-Style Sausage & Potato Salad", tags: ["quick"], cuisine: "Austria", protein: "pork",
      prep: 7, cook: 12,
      ingredients: [
        ing(2, "", "frankfurter or pork sausages", "meat"), ing(150, "g", "new potatoes, sliced", "produce"),
        ing(1, "tsp", "Dijon mustard", "store"), ing(1, "tbsp", "red wine vinegar", "store"),
        ing(0.5, "", "onion, thinly sliced", "produce")
      ],
      steps: [
        "Boil the potatoes for 12 minutes until tender, then drain and slice while warm.",
        "Meanwhile, warm the sausages in simmering water or fry for 6–7 minutes until hot through.",
        "Whisk the mustard and vinegar with a splash of oil, and toss through the warm potatoes and onion.",
        "Slice the sausages and serve over the potato salad."
      ]
    },
    {
      id: "d145", title: "Dutch-Style Kale & Sausage Mash", tags: ["quick"], cuisine: "Netherlands", protein: "pork",
      prep: 8, cook: 14,
      ingredients: [
        ing(2, "", "pork sausages, sliced", "meat"), ing(200, "g", "potato, chunked", "produce"),
        ing(60, "g", "kale, shredded", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(1, "tbsp", "milk", "dairy")
      ],
      steps: [
        "Boil the potato for 12 minutes until tender, adding the kale for the final 3 minutes.",
        "Meanwhile, fry the sausage slices over medium-high heat for 6–7 minutes until browned.",
        "Drain and mash the potato and kale with the butter and milk.",
        "Serve the mash topped with the sausage."
      ]
    },
    {
      id: "d146", title: "Dutch-Style Pea Soup with Sausage", tags: ["quick"], cuisine: "Netherlands", protein: "pork",
      prep: 7, cook: 13,
      ingredients: [
        ing(1, "", "smoked sausage, sliced", "meat"), ing(150, "g", "frozen peas", "frozen"),
        ing(0.5, "", "onion, diced", "produce"), ing(250, "ml", "vegetable stock", "store"),
        ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Fry the onion in a splash of oil over medium heat for 4 minutes until soft.",
        "Add the stock and peas, and simmer for 6 minutes.",
        "Blitz or mash roughly, then stir in the sausage slices and warm through for 2 minutes.",
        "Serve with the crusty bread."
      ]
    },
    {
      id: "d147", title: "South African-Style Bobotie-Inspired Mince Bake", tags: ["quick"], cuisine: "South Africa", protein: "beef",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "tsp", "mild curry powder", "spice"), ing(20, "g", "raisins", "store"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "milk", "dairy")
      ],
      steps: [
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince.",
        "Stir in the curry powder and raisins, then spoon into a small ovenproof dish.",
        "Whisk the egg with the milk and pour over the top.",
        "Bake at 190°C (fan 170°C) for 12–14 minutes until the egg topping is set and golden."
      ]
    },
    {
      id: "d148", title: "South African-Style Peri-Peri Chicken", tags: ["spicy", "quick"], cuisine: "South Africa", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(1, "tsp", "smoked paprika", "spice"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(0.5, "", "lemon", "produce"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the paprika, chilli flakes, garlic and a squeeze of lemon.",
        "Fry in a splash of oil over medium-high heat for 8–9 minutes until browned and cooked through.",
        "Serve over the rice with the remaining lemon."
      ]
    },
    {
      id: "d149", title: "Hawaiian-Style Salmon Poke Bowl", tags: ["fish", "quick"], cuisine: "Hawaii", protein: "fish",
      prep: 9, cook: 0,
      ingredients: [
        ing(120, "g", "sushi-grade salmon, cubed", "meat"), ing(150, "g", "cooked rice, cold", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(0.5, "tsp", "sesame oil", "store"),
        ing(0.5, "", "avocado, sliced", "produce"), ing(60, "g", "cucumber, diced", "produce")
      ],
      steps: [
        "Toss the salmon cubes with the soy sauce and sesame oil.",
        "Spoon the cold rice into a bowl.",
        "Top with the marinated salmon, avocado and cucumber.",
        "Serve straight away."
      ]
    },
    {
      id: "d150", title: "Hawaiian-Style Teriyaki Chicken Rice Bowl", tags: ["quick"], cuisine: "Hawaii", protein: "chicken",
      prep: 8, cook: 10,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(2, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "honey", "store"), ing(70, "g", "rice", "store"),
        ing(60, "g", "pineapple chunks", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until browned.",
        "Stir in the soy sauce and honey, and cook for 2 minutes until glazed and sticky.",
        "Serve over the rice with the pineapple chunks."
      ]
    }
,
    {
      id: "d151", title: "Mapo Tofu-Inspired Spiced Pork & Tofu", tags: ["spicy", "quick"], cuisine: "China", protein: "pork",
      prep: 8, cook: 10,
      ingredients: [
        ing(100, "g", "pork mince", "meat"), ing(200, "g", "firm tofu, cubed", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "chilli bean sauce or chilli flakes", "store"),
        ing(1, "", "spring onion, sliced", "produce"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the pork mince in a splash of oil over high heat for 4 minutes, breaking it up, until browned.",
        "Stir in the chilli bean sauce and soy sauce, then add the tofu and a splash of water and simmer for 4 minutes.",
        "Scatter with spring onion and serve over the rice."
      ]
    },
    {
      id: "d152", title: "Chinese-Style Steamed Fish with Ginger", tags: ["fish", "quick"], cuisine: "China", protein: "fish",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "spring onion, shredded", "produce"),
        ing(0.5, "tsp", "sesame oil", "store"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Place the fish on a plate with the ginger, and steam over a pan of simmering water, covered, for 8–9 minutes until just cooked through.",
        "Scatter with spring onion, drizzle with soy sauce and sesame oil.",
        "Serve over the rice."
      ]
    },
    {
      id: "d153", title: "Moroccan-Style Chicken Tagine with Apricots", tags: ["quick"], cuisine: "Morocco", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(30, "g", "dried apricots, chopped", "store"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(150, "g", "chopped tomatoes", "store"), ing(60, "g", "couscous", "store")
      ],
      steps: [
        "Cover the couscous with boiling water, cover and leave for 5 minutes, then fluff with a fork.",
        "Fry the chicken with the cinnamon and cumin in a splash of oil over medium-high heat for 5 minutes.",
        "Add the apricots and chopped tomatoes, and simmer for 8–9 minutes until the chicken is cooked through.",
        "Serve over the couscous."
      ]
    },
    {
      id: "d154", title: "Moroccan-Style Beef Kefta with Couscous", tags: ["spicy", "quick"], cuisine: "Morocco", protein: "beef",
      prep: 9, cook: 9,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(60, "g", "couscous", "store"), ing(null, "small handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Cover the couscous with boiling water, cover and leave for 5 minutes, then fluff with a fork.",
        "Mix the mince with the cumin, paprika and chilli flakes, and shape into small oval koftas.",
        "Fry over medium-high heat for 7–8 minutes, turning, until browned and cooked through.",
        "Serve over the couscous, scattered with coriander."
      ]
    },
    {
      id: "d155", title: "Thai Red Curry with Chicken", tags: ["spicy", "quick"], cuisine: "Thailand", protein: "chicken",
      prep: 7, cook: 12,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(1.5, "tbsp", "red curry paste", "store"), ing(60, "g", "green beans", "produce"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the curry paste in a splash of oil over medium heat for 1 minute until fragrant.",
        "Add the chicken and cook for 3–4 minutes, then pour in the coconut milk and add the green beans.",
        "Simmer for 6–7 minutes until the chicken is cooked through, then serve over the rice."
      ]
    },
    {
      id: "d156", title: "Thai-Style Pineapple Fried Rice", tags: ["quick"], cuisine: "Thailand", protein: "chicken",
      prep: 7, cook: 8,
      ingredients: [
        ing(100, "g", "chicken breast, diced", "meat"), ing(150, "g", "cooked rice, cold", "store"),
        ing(60, "g", "pineapple chunks", "produce"), ing(1, "tbsp", "soy sauce", "store"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(60, "g", "frozen peas", "frozen")
      ],
      steps: [
        "Fry the chicken in a splash of oil over high heat for 5 minutes until cooked through.",
        "Add the cold rice and peas, and stir-fry for 3–4 minutes until hot through.",
        "Stir in the pineapple, soy sauce and chilli flakes, and toss for 1 minute.",
        "Serve hot."
      ]
    },
    {
      id: "d157", title: "Indian-Style Egg Curry", tags: ["vegetarian", "spicy", "quick"], cuisine: "India", protein: "plant-based",
      prep: 7, cook: 13,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "tsp", "mild curry powder", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Boil the eggs for 8 minutes, then cool, peel and halve.",
        "Fry the onion in a splash of oil over medium heat for 4 minutes, then stir in the curry powder and turmeric.",
        "Add the chopped tomatoes and simmer for 6 minutes, then nestle in the eggs and warm through before serving over the rice."
      ]
    },
    {
      id: "d158", title: "Indian-Style Spiced Potato Bowl", tags: ["vegetarian", "vegan", "spicy", "quick"], cuisine: "India", protein: "plant-based",
      prep: 7, cook: 13,
      ingredients: [
        ing(250, "g", "potato, diced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Boil the potato for 8 minutes until nearly tender, then drain.",
        "Fry the garlic with the cumin, turmeric and chilli flakes in a splash of oil for 1 minute.",
        "Add the potato and fry for 5 minutes, turning occasionally, until golden and coated in spice.",
        "Serve with the flatbread."
      ]
    },
    {
      id: "d159", title: "American-Style BBQ Pulled Chicken", tags: ["quick"], cuisine: "USA", protein: "chicken",
      prep: 7, cook: 12,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(2, "tbsp", "barbecue sauce", "store"),
        ing(1, "", "burger bun", "bakery"), ing(60, "g", "coleslaw mix", "produce"),
        ing(1, "tbsp", "mayonnaise", "store")
      ],
      steps: [
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until cooked through.",
        "Shred with two forks, then stir through the barbecue sauce and warm for 2 minutes.",
        "Toss the coleslaw mix with the mayonnaise.",
        "Pile the pulled chicken into the bun with the coleslaw."
      ]
    },
    {
      id: "d160", title: "American Diner-Style Turkey Burger", tags: ["quick"], cuisine: "USA", protein: "turkey",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "turkey mince", "meat"), ing(1, "", "burger bun", "bakery"),
        ing(0.5, "", "sweet potato, cut into wedges", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "tbsp", "tomato ketchup", "store")
      ],
      steps: [
        "Toss the sweet potato wedges with the paprika and a splash of oil, and roast at 200°C (fan 180°C) for 12 minutes, turning once.",
        "Shape the turkey mince into a patty and fry over medium-high heat for 4–5 minutes each side until cooked through.",
        "Toast the bun.",
        "Build the burger with the patty and ketchup, and serve with the wedges."
      ]
    },
    {
      id: "d161", title: "Spanish-Style Garlic Mushrooms Tapas Bowl", tags: ["vegetarian", "vegan", "quick"], cuisine: "Spain", protein: "plant-based",
      prep: 6, cook: 8,
      ingredients: [
        ing(200, "g", "chestnut mushrooms, halved", "produce"), ing(2, "", "garlic cloves, sliced", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(null, "small handful", "fresh parsley, chopped", "produce"),
        ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Fry the garlic in a generous splash of oil over medium heat for 1 minute until fragrant.",
        "Add the mushrooms and paprika, and fry for 6–7 minutes until golden and tender.",
        "Scatter with parsley.",
        "Serve with the crusty bread for mopping up the juices."
      ]
    },
    {
      id: "d162", title: "Spanish-Style Baked Cod with Romesco", tags: ["fish", "quick"], cuisine: "Spain", protein: "fish",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "cod fillet", "meat"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(1, "tbsp", "flaked almonds", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(70, "g", "new potatoes", "produce")
      ],
      steps: [
        "Boil the new potatoes for 12 minutes until tender, then drain.",
        "Simmer the red pepper, tomatoes, almonds and garlic for 8 minutes, then blitz or mash into a rough romesco sauce.",
        "Meanwhile, bake the cod at 200°C (fan 180°C) for 12 minutes until just cooked through.",
        "Serve the cod with the romesco sauce and potatoes."
      ]
    },
    {
      id: "d163", title: "British-Style Breaded Fish Finger Sandwich", tags: ["fish", "quick"], cuisine: "UK", protein: "fish",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "white fish fillet, cut into strips", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(3, "tbsp", "breadcrumbs", "store"),
        ing(2, "slice", "white bread", "bakery"), ing(1, "tbsp", "tartare sauce or mayonnaise", "store")
      ],
      steps: [
        "Coat the fish strips in flour, then egg, then breadcrumbs.",
        "Fry in a splash of oil over medium heat for 3–4 minutes each side until golden and cooked through.",
        "Spread the bread with tartare sauce.",
        "Build the sandwich with the fish fingers."
      ]
    },
    {
      id: "d164", title: "British-Style Leek & Potato Soup", tags: ["vegetarian", "quick"], cuisine: "UK", protein: "plant-based",
      prep: 7, cook: 14,
      ingredients: [
        ing(1, "", "leek, sliced", "produce"), ing(200, "g", "potato, chunked", "produce"),
        ing(300, "ml", "vegetable stock", "store"), ing(1, "tbsp", "butter", "dairy"),
        ing(1, "tbsp", "double cream", "dairy"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Melt the butter in a saucepan and fry the leek over medium heat for 4 minutes until soft.",
        "Add the potato and stock, and simmer for 10 minutes until the potato is tender.",
        "Blitz or mash until smooth, then stir through the cream.",
        "Serve with the crusty bread."
      ]
    },
    {
      id: "d165", title: "Japanese-Style Chicken Teriyaki Rice Bowl", tags: ["quick"], cuisine: "Japan", protein: "chicken",
      prep: 7, cook: 10,
      ingredients: [
        ing(160, "g", "chicken thigh, sliced", "meat"), ing(2, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "honey", "store"), ing(70, "g", "rice", "store"),
        ing(60, "g", "pak choi or greens", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions, steaming the pak choi over the top for the last 3 minutes.",
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until browned and cooked through.",
        "Stir in the soy sauce and honey, and cook for 2 minutes until glazed.",
        "Serve over the rice with the pak choi."
      ]
    },
    {
      id: "d166", title: "Japanese-Style Ginger Pork (Shogayaki)", tags: ["quick"], cuisine: "Japan", protein: "pork",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "pork loin steak, sliced thin", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "honey", "store"),
        ing(70, "g", "rice", "store"), ing(60, "g", "cabbage, shredded", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the soy sauce, ginger and honey together.",
        "Fry the pork over medium-high heat for 2–3 minutes each side, then pour in the sauce and cook for 1 minute until glazed.",
        "Serve over the rice with the shredded cabbage."
      ]
    },
    {
      id: "d167", title: "Italian-Style Chicken Cacciatore", tags: ["quick"], cuisine: "Italy", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(60, "g", "pasta", "store")
      ],
      steps: [
        "Cook the pasta according to the packet instructions.",
        "Fry the chicken and onion in a splash of oil over medium-high heat for 5 minutes.",
        "Add the mushrooms and cook for 3 minutes, then stir in the tomatoes and oregano.",
        "Simmer for 8 minutes until the chicken is cooked through, then serve over the pasta."
      ]
    },
    {
      id: "d168", title: "Italian Caprese-Style Chicken Traybake", tags: ["quick"], cuisine: "Italy", protein: "chicken",
      prep: 7, cook: 20,
      ingredients: [
        ing(160, "g", "chicken breast", "meat"), ing(100, "g", "cherry tomatoes", "produce"),
        ing(60, "g", "mozzarella, torn", "dairy"), ing(null, "handful", "fresh basil leaves", "produce"),
        ing(1, "tbsp", "balsamic vinegar", "store"), ing(120, "g", "new potatoes, halved", "produce")
      ],
      steps: [
        "Toss the potatoes and cherry tomatoes with a splash of oil on a baking tray, and roast at 200°C (fan 180°C) for 10 minutes.",
        "Add the chicken to the tray and roast for a further 15–18 minutes until cooked through.",
        "Top the chicken with the mozzarella for the final 3 minutes to melt.",
        "Scatter with basil and drizzle with balsamic vinegar to serve."
      ]
    },
    {
      id: "d169", title: "Portuguese-Style Chouriço & Bean Stew", tags: ["spicy", "quick"], cuisine: "Portugal", protein: "pork",
      prep: 7, cook: 13,
      ingredients: [
        ing(1, "", "chorizo sausage, sliced", "meat"), ing(1, "tin", "butter beans, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Fry the chorizo and onion in a splash of oil over medium heat for 5 minutes until the chorizo releases its oil.",
        "Add the garlic, butter beans and chopped tomatoes, and simmer for 8 minutes.",
        "Season and serve with the crusty bread."
      ]
    },
    {
      id: "d170", title: "Portuguese-Style Baked Fish with Peppers", tags: ["fish", "quick"], cuisine: "Portugal", protein: "fish",
      prep: 8, cook: 14,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(150, "g", "chopped tomatoes", "store"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Simmer the pepper, tomatoes, garlic and paprika for 8 minutes until thickened.",
        "Nestle in the fish, cover and simmer for 6 minutes until just cooked through.",
        "Serve over the rice."
      ]
    },
    {
      id: "d171", title: "French-Style Summer Vegetable Stew", tags: ["vegetarian", "vegan", "quick"], cuisine: "France", protein: "plant-based",
      prep: 8, cook: 14,
      ingredients: [
        ing(0.5, "", "courgette, diced", "produce"), ing(0.5, "", "red pepper, diced", "produce"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "dried herbes de Provence or mixed herbs", "spice")
      ],
      steps: [
        "Fry the onion, courgette and red pepper in a splash of oil over medium heat for 6 minutes.",
        "Add the garlic and herbs, and cook for 1 minute.",
        "Stir in the chopped tomatoes and simmer for 8 minutes until the vegetables are tender.",
        "Season and serve, with crusty bread if you like."
      ]
    },
    {
      id: "d172", title: "French Onion Soup with Cheese Toast", tags: ["vegetarian", "quick"], cuisine: "France", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(1.5, "", "onions, thinly sliced", "produce"), ing(300, "ml", "beef or vegetable stock", "store"),
        ing(1, "tbsp", "butter", "dairy"), ing(1, "slice", "crusty bread", "bakery"),
        ing(30, "g", "cheddar cheese, grated", "dairy")
      ],
      steps: [
        "Melt the butter in a saucepan and fry the onions over medium heat for 12 minutes, stirring often, until deep golden.",
        "Pour in the stock and simmer for 5 minutes.",
        "Toast the bread and top with the cheese, then grill for 2 minutes until melted and bubbling.",
        "Ladle the soup into a bowl and float the cheese toast on top."
      ]
    },
    {
      id: "d173", title: "Greek-Style Chicken Souvlaki Bowl", tags: ["quick"], cuisine: "Greece", protein: "chicken",
      prep: 8, cook: 9,
      ingredients: [
        ing(160, "g", "chicken breast, cubed", "meat"), ing(1, "tsp", "dried oregano", "spice"),
        ing(0.5, "", "lemon", "produce"), ing(70, "g", "rice", "store"),
        ing(60, "g", "cucumber, diced", "produce"), ing(2, "tbsp", "shop-bought tzatziki", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the oregano, a squeeze of lemon and a splash of oil.",
        "Fry over medium-high heat for 7–8 minutes until browned and cooked through.",
        "Serve over the rice with the cucumber and a dollop of tzatziki."
      ]
    },
    {
      id: "d174", title: "Greek-Style Spinach & Feta Filo Bake", tags: ["vegetarian", "quick"], cuisine: "Greece", protein: "plant-based",
      prep: 9, cook: 15,
      ingredients: [
        ing(100, "g", "spinach", "produce"), ing(60, "g", "feta cheese, crumbled", "dairy"),
        ing(1, "", "egg", "dairy"), ing(2, "", "sheets filo pastry", "bakery"),
        ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Wilt the spinach in a dry pan for 2 minutes, then squeeze out excess water and chop.",
        "Mix the spinach with the feta and egg.",
        "Layer the filo sheets, brushing with oil between each, spoon the filling in and fold into a parcel.",
        "Bake at 200°C (fan 180°C) for 12–14 minutes until golden and crisp."
      ]
    },
    {
      id: "d175", title: "Mexican-Style Chicken Tinga Tacos", tags: ["spicy", "quick"], cuisine: "Mexico", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken breast, shredded after cooking", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "tsp", "chipotle paste", "store"),
        ing(2, "", "soft tortillas", "bakery"), ing(null, "small handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Poach or fry the chicken until cooked through, about 8 minutes, then shred with two forks.",
        "Fry the onion in a splash of oil over medium heat for 4 minutes.",
        "Stir in the chipotle paste and chopped tomatoes, add the shredded chicken and simmer for 5 minutes.",
        "Serve in the tortillas, scattered with coriander."
      ]
    },
    {
      id: "d176", title: "Mexican-Style Turkey & Black Bean Chilli", tags: ["spicy", "quick"], cuisine: "Mexico", protein: "turkey",
      prep: 8, cook: 14,
      ingredients: [
        ing(150, "g", "turkey mince", "meat"), ing(1, "tin", "black beans, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the turkey mince in a splash of oil over medium-high heat for 5 minutes, breaking it up, until browned.",
        "Stir in the paprika and chilli flakes, then add the black beans and chopped tomatoes.",
        "Simmer for 8 minutes and serve over the rice."
      ]
    },
    {
      id: "d177", title: "Cypriot-Style Pork Souvlaki with Pitta", tags: ["quick"], cuisine: "Cyprus", protein: "pork",
      prep: 8, cook: 9,
      ingredients: [
        ing(160, "g", "pork loin, cubed", "meat"), ing(1, "tsp", "dried oregano", "spice"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "pitta bread", "bakery"),
        ing(2, "tbsp", "shop-bought tzatziki", "store")
      ],
      steps: [
        "Toss the pork with the oregano, a squeeze of lemon and a splash of oil.",
        "Fry or griddle over medium-high heat for 8–9 minutes, turning, until cooked through.",
        "Warm the pitta.",
        "Serve the pork in the pitta with the tzatziki."
      ]
    },
    {
      id: "d178", title: "Cypriot-Style Lemon Chicken with Bulgur", tags: ["quick"], cuisine: "Cyprus", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(60, "g", "bulgur wheat", "store"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "dried oregano", "spice")
      ],
      steps: [
        "Cook the bulgur wheat according to the packet instructions.",
        "Fry the chicken and garlic in a splash of oil over medium-high heat for 8 minutes until browned and cooked through.",
        "Stir in the oregano and a squeeze of lemon.",
        "Serve the chicken over the bulgur."
      ]
    },
    {
      id: "d179", title: "Lebanese-Style Beef Kofta with Bulgur", tags: ["quick"], cuisine: "Lebanon", protein: "beef",
      prep: 9, cook: 9,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(60, "g", "bulgur wheat", "store"),
        ing(null, "small handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Cook the bulgur wheat according to the packet instructions.",
        "Mix the mince with the cumin and cinnamon, and shape into small koftas.",
        "Fry over medium-high heat for 7–8 minutes, turning, until browned and cooked through.",
        "Serve over the bulgur, scattered with parsley."
      ]
    },
    {
      id: "d180", title: "Lebanese-Style Lentil & Rice (Mujadara)", tags: ["vegetarian", "vegan", "quick"], cuisine: "Lebanon", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(60, "g", "dried brown lentils", "store"), ing(50, "g", "rice", "store"),
        ing(1, "", "onion, thinly sliced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(60, "g", "mixed salad leaves", "produce")
      ],
      steps: [
        "Cook the lentils and rice together in plenty of water for 15 minutes until tender, then drain.",
        "Meanwhile, fry the onion in a splash of oil over medium heat for 10 minutes until deep golden and crisp.",
        "Stir the cumin through the lentils and rice.",
        "Serve topped with the crispy onions and salad leaves."
      ]
    },
    {
      id: "d181", title: "Korean-Style Spicy Pork Bulgogi", tags: ["spicy", "quick"], cuisine: "Korea", protein: "pork",
      prep: 8, cook: 9,
      ingredients: [
        ing(150, "g", "pork loin steak, sliced thin", "meat"), ing(1, "tbsp", "gochujang paste", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(70, "g", "rice", "store"), ing(60, "g", "beansprouts", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the gochujang, soy sauce and honey together.",
        "Fry the pork over high heat for 4–5 minutes, then stir in the sauce and cook for 1 minute until glazed.",
        "Serve over the rice with the beansprouts."
      ]
    },
    {
      id: "d182", title: "Korean-Style Tofu & Kimchi Stew", tags: ["vegetarian", "spicy", "quick"], cuisine: "Korea", protein: "plant-based",
      prep: 7, cook: 12,
      ingredients: [
        ing(200, "g", "firm tofu, cubed", "store"), ing(100, "g", "kimchi, chopped", "store"),
        ing(1, "tsp", "gochujang paste", "store"), ing(200, "ml", "vegetable stock", "store"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Simmer the kimchi and gochujang paste with the stock for 5 minutes.",
        "Add the tofu and simmer for 5 minutes more until hot through.",
        "Serve over the rice."
      ]
    },
    {
      id: "d183", title: "Persian-Style Herb & Bean Rice", tags: ["vegetarian", "vegan", "quick"], cuisine: "Iran", protein: "plant-based",
      prep: 8, cook: 14,
      ingredients: [
        ing(70, "g", "rice", "store"), ing(1, "tin", "cannellini beans, drained", "store"),
        ing(null, "handful", "fresh parsley, chopped", "produce"), ing(null, "handful", "fresh coriander, chopped", "produce"),
        ing(0.5, "tsp", "ground turmeric", "spice")
      ],
      steps: [
        "Cook the rice with the turmeric according to the packet instructions.",
        "Warm the beans in a splash of oil for 3–4 minutes.",
        "Stir the herbs through the rice.",
        "Serve the herbed rice topped with the warmed beans."
      ]
    },
    {
      id: "d184", title: "Persian-Style Lamb & Split Pea Stew", tags: ["quick"], cuisine: "Iran", protein: "lamb",
      prep: 8, cook: 16,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(40, "g", "dried yellow split peas", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the lamb mince in a splash of oil over medium-high heat for 5 minutes, breaking it up.",
        "Stir in the turmeric, cinnamon, split peas and chopped tomatoes, plus 100ml water.",
        "Simmer for 10 minutes until the split peas are tender, then serve over the rice."
      ]
    },
    {
      id: "d185", title: "Jamaican-Style Jerk Pork Chops", tags: ["spicy", "quick"], cuisine: "Jamaica", protein: "pork",
      prep: 8, cook: 12,
      ingredients: [
        ing(2, "", "pork chops", "meat"), ing(1, "tsp", "jerk seasoning", "spice"),
        ing(0.5, "", "lime", "produce"), ing(70, "g", "rice", "store"),
        ing(60, "g", "frozen peas", "frozen")
      ],
      steps: [
        "Cook the rice with the peas according to the packet instructions.",
        "Rub the pork chops with the jerk seasoning and a squeeze of lime.",
        "Fry or griddle over medium-high heat for 5–6 minutes each side until cooked through.",
        "Serve with the rice and peas."
      ]
    },
    {
      id: "d186", title: "Jamaican-Style Callaloo-Inspired Greens", tags: ["vegetarian", "vegan", "quick"], cuisine: "Jamaica", protein: "plant-based",
      prep: 7, cook: 10,
      ingredients: [
        ing(150, "g", "kale or spinach, shredded", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and red pepper in a splash of oil over medium heat for 5 minutes.",
        "Add the greens and chilli flakes, and cook for 4–5 minutes until wilted.",
        "Serve over the rice."
      ]
    },
    {
      id: "d187", title: "Filipino-Style Chicken Adobo", tags: ["quick"], cuisine: "Philippines", protein: "chicken",
      prep: 7, cook: 16,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(2, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "white wine vinegar", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "", "bay leaf", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Combine the chicken, soy sauce, vinegar, garlic and bay leaf in a pan with 100ml water.",
        "Simmer for 15 minutes until the chicken is cooked through and the sauce has reduced.",
        "Serve over the rice."
      ]
    },
    {
      id: "d188", title: "Filipino-Style Garlic Fried Rice with Sausage", tags: ["quick"], cuisine: "Philippines", protein: "pork",
      prep: 7, cook: 9,
      ingredients: [
        ing(2, "", "pork sausages, sliced", "meat"), ing(150, "g", "cooked rice, cold", "store"),
        ing(2, "", "garlic cloves, finely chopped", "produce"), ing(1, "", "egg", "dairy"),
        ing(1, "tbsp", "soy sauce", "store")
      ],
      steps: [
        "Fry the sausage slices in a splash of oil over medium-high heat for 5–6 minutes until browned.",
        "Add the garlic and fry for 1 minute, then add the cold rice and soy sauce, stir-frying for 3–4 minutes.",
        "Push to one side, crack in the egg and scramble until just set, then mix through.",
        "Serve hot."
      ]
    },
    {
      id: "d189", title: "Vietnamese-Style Beef Noodle Soup", tags: ["quick"], cuisine: "Vietnam", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef sirloin, thinly sliced", "meat"), ing(70, "g", "rice noodles", "store"),
        ing(300, "ml", "beef stock", "store"), ing(1, "", "star anise", "spice"),
        ing(1, "", "spring onion, sliced", "produce"), ing(null, "small handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Soak the rice noodles in boiling water for 5 minutes, then drain.",
        "Simmer the stock with the star anise for 5 minutes, then remove the star anise.",
        "Add the beef slices to the hot stock and poach for 1–2 minutes until just cooked.",
        "Serve the noodles in the broth with the beef, spring onion and coriander."
      ]
    },
    {
      id: "d190", title: "Vietnamese-Style Lemongrass Chicken", tags: ["quick"], cuisine: "Vietnam", protein: "chicken",
      prep: 8, cook: 9,
      ingredients: [
        ing(160, "g", "chicken thigh, sliced", "meat"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(70, "g", "rice", "store"), ing(60, "g", "cucumber, sliced", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the ginger, soy sauce and honey.",
        "Fry over medium-high heat for 7–8 minutes until browned and cooked through.",
        "Serve over the rice with the cucumber."
      ]
    },
    {
      id: "d191", title: "Turkish-Style Chicken Iskender", tags: ["quick"], cuisine: "Turkey", protein: "chicken",
      prep: 8, cook: 10,
      ingredients: [
        ing(160, "g", "chicken thigh, sliced", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(1, "", "flatbread", "bakery"), ing(2, "tbsp", "natural yoghurt", "dairy"),
        ing(1, "tbsp", "butter", "dairy")
      ],
      steps: [
        "Fry the chicken in a splash of oil over medium-high heat for 7–8 minutes until browned and cooked through.",
        "Warm the chopped tomatoes in a separate small pan for 4 minutes.",
        "Tear the flatbread onto a plate, top with the chicken and tomato sauce.",
        "Melt the butter and drizzle over, with a dollop of yoghurt on the side."
      ]
    },
    {
      id: "d192", title: "Turkish-Style Red Lentil Soup", tags: ["vegetarian", "quick"], cuisine: "Turkey", protein: "plant-based",
      prep: 6, cook: 15,
      ingredients: [
        ing(80, "g", "dried red lentils", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.5, "", "lemon", "produce"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Fry the onion in a splash of oil over medium heat for 4 minutes until soft.",
        "Rinse the lentils, add to the pan with the cumin, paprika and 400ml water.",
        "Simmer for 12 minutes until the lentils are soft, then blitz or mash until smooth.",
        "Serve with a squeeze of lemon and the crusty bread."
      ]
    },
    {
      id: "d193", title: "Cuban-Style Mojo Chicken with Rice", tags: ["quick"], cuisine: "Cuba", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(0.5, "", "lime", "produce"),
        ing(0.5, "", "orange, juiced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the lime juice, orange juice, garlic and cumin.",
        "Fry over medium-high heat for 8–9 minutes until browned and cooked through.",
        "Serve over the rice."
      ]
    },
    {
      id: "d194", title: "Cuban-Style Picadillo Beef Hash", tags: ["quick"], cuisine: "Cuba", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(20, "g", "raisins", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince.",
        "Stir in the cumin, raisins and chopped tomatoes, and simmer for 5 minutes.",
        "Serve over the rice."
      ]
    },
    {
      id: "d195", title: "German-Style Bratwurst with Braised Red Cabbage", tags: ["quick"], cuisine: "Germany", protein: "pork",
      prep: 7, cook: 14,
      ingredients: [
        ing(2, "", "bratwurst sausages", "meat"), ing(200, "g", "red cabbage, shredded", "produce"),
        ing(0.5, "", "apple, sliced", "produce"), ing(1, "tbsp", "red wine vinegar", "store"),
        ing(1, "tsp", "Dijon mustard", "store")
      ],
      steps: [
        "Fry the cabbage and apple in a splash of oil over medium heat for 10 minutes, stirring occasionally, until softened.",
        "Stir in the vinegar and cook for 2 minutes more.",
        "Meanwhile, fry or grill the sausages for 10–12 minutes, turning, until cooked through.",
        "Serve the sausages with the braised cabbage and mustard."
      ]
    },
    {
      id: "d196", title: "German-Style Pork Schnitzel with Potato Salad", tags: ["quick"], cuisine: "Germany", protein: "pork",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "pork loin steak, flattened", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(3, "tbsp", "breadcrumbs", "store"),
        ing(150, "g", "new potatoes, sliced", "produce"), ing(1, "tsp", "Dijon mustard", "store")
      ],
      steps: [
        "Boil the potatoes for 12 minutes until tender, then drain and slice while warm.",
        "Coat the pork in flour, then egg, then breadcrumbs.",
        "Fry in a generous splash of oil over medium heat for 3–4 minutes each side until golden and cooked through.",
        "Toss the warm potatoes with the mustard and a splash of oil, and serve alongside."
      ]
    },
    {
      id: "d197", title: "Irish-Style Beef & Stout Stew", tags: [], cuisine: "Ireland", protein: "beef",
      prep: 8, cook: 18,
      ingredients: [
        ing(160, "g", "beef stewing steak, diced", "meat"), ing(100, "ml", "stout or dark ale", "store"),
        ing(1, "", "small potato, chunked", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(100, "ml", "beef stock", "store")
      ],
      steps: [
        "Brown the beef in a splash of oil over high heat for 3–4 minutes.",
        "Add the onion and potato, and cook for 2 minutes.",
        "Pour in the stout and stock, cover and simmer for 15 minutes until the beef is tender.",
        "Season and serve, with bread if you like."
      ]
    },
    {
      id: "d198", title: "Irish-Style Smoked Fish Chowder", tags: ["fish", "quick"], cuisine: "Ireland", protein: "fish",
      prep: 8, cook: 14,
      ingredients: [
        ing(150, "g", "smoked haddock fillet", "meat"), ing(1, "", "leek, sliced", "produce"),
        ing(150, "g", "potato, diced", "produce"), ing(150, "ml", "milk", "dairy"),
        ing(1, "tbsp", "butter", "dairy")
      ],
      steps: [
        "Melt the butter and fry the leek over medium heat for 4 minutes until soft.",
        "Add the potato and 150ml water, and simmer for 8 minutes until nearly tender.",
        "Add the fish and milk, and simmer gently for 5–6 minutes until the fish flakes easily.",
        "Season and serve."
      ]
    },
    {
      id: "d199", title: "Ethiopian-Style Spiced Chicken (Doro Wat)", tags: ["spicy", "quick"], cuisine: "Ethiopia", protein: "chicken",
      prep: 8, cook: 16,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.25, "tsp", "ground ginger", "spice"), ing(0.25, "tsp", "chilli flakes", "spice")
      ],
      steps: [
        "Fry the onion in a splash of oil over medium heat for 5 minutes until soft.",
        "Add the chicken and cook for 5 minutes until browned.",
        "Stir in the paprika, ginger and chilli flakes, then add the chopped tomatoes.",
        "Simmer for 8 minutes until the chicken is cooked through, and serve."
      ]
    },
    {
      id: "d200", title: "Ethiopian-Style Spiced Collard Greens", tags: ["vegetarian", "vegan", "quick"], cuisine: "Ethiopia", protein: "plant-based",
      prep: 7, cook: 12,
      ingredients: [
        ing(150, "g", "kale or spring greens, shredded", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "", "carrot, sliced", "produce"), ing(0.25, "tsp", "ground ginger", "spice"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion, carrot and garlic in a splash of oil over medium heat for 6 minutes.",
        "Add the greens and ginger, and cook for 5–6 minutes until wilted and tender.",
        "Serve over the rice."
      ]
    },
    {
      id: "d201", title: "Indonesian-Style Beef Rendang Stew", tags: ["spicy", "quick"], cuisine: "Indonesia", protein: "beef",
      prep: 8, cook: 18,
      ingredients: [
        ing(160, "g", "beef stewing steak, diced", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(1, "tsp", "curry powder", "spice"), ing(0.5, "tsp", "ground ginger", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the beef in a splash of oil over high heat for 3–4 minutes until browned.",
        "Stir in the curry powder, ginger and chilli flakes, then pour in the coconut milk.",
        "Cover and simmer for 12–13 minutes until the beef is tender and the sauce has thickened, then serve over the rice."
      ]
    },
    {
      id: "d202", title: "Indonesian-Style Sweet Soy Nasi Goreng", tags: ["spicy", "quick"], cuisine: "Indonesia", protein: "chicken",
      prep: 7, cook: 8,
      ingredients: [
        ing(100, "g", "chicken breast, diced", "meat"), ing(150, "g", "cooked rice, cold", "store"),
        ing(1, "tbsp", "dark soy sauce", "store"), ing(1, "tsp", "sweet soy sauce (kecap manis) or honey with soy", "store"),
        ing(1, "", "egg", "dairy"), ing(0.25, "tsp", "chilli flakes", "spice")
      ],
      steps: [
        "Fry the chicken in a splash of oil over high heat for 5 minutes until cooked through, then push to one side.",
        "Add the cold rice, soy sauce, sweet soy sauce and chilli flakes, and stir-fry for 3–4 minutes.",
        "Push everything to one side, crack in the egg and scramble until just set, then mix through.",
        "Serve hot."
      ]
    },
    {
      id: "d203", title: "Georgian-Style Cheese-Filled Bread (Khachapuri-Inspired)", tags: ["vegetarian", "quick"], cuisine: "Georgia", protein: "plant-based",
      prep: 8, cook: 12,
      ingredients: [
        ing(1, "", "flatbread", "bakery"), ing(80, "g", "mozzarella, grated", "dairy"),
        ing(40, "g", "feta cheese, crumbled", "dairy"), ing(1, "", "egg", "dairy"),
        ing(1, "tbsp", "butter", "dairy")
      ],
      steps: [
        "Scatter the mozzarella and feta over the flatbread and fold the edges in slightly to make a boat shape.",
        "Bake at 200°C (fan 180°C) for 8 minutes until the cheese has melted.",
        "Crack the egg into the centre and dot with butter, then bake for 3–4 minutes more until the white is just set.",
        "Serve straight away, stirring the yolk through the melted cheese."
      ]
    },
    {
      id: "d204", title: "Georgian-Style Walnut Chicken", tags: ["quick"], cuisine: "Georgia", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(30, "g", "walnuts, chopped", "store"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "ground coriander", "spice"),
        ing(100, "ml", "chicken stock", "store"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken and garlic in a splash of oil over medium-high heat for 6 minutes until browned.",
        "Stir in the coriander, walnuts and stock, and simmer for 6–7 minutes until the chicken is cooked through and the sauce has thickened.",
        "Serve over the rice."
      ]
    },
    {
      id: "d205", title: "Armenian-Style Lamb & Bulgur Pilaf", tags: ["quick"], cuisine: "Armenia", protein: "lamb",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(60, "g", "bulgur wheat", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "tsp", "ground cumin", "spice")
      ],
      steps: [
        "Fry the onion and lamb mince in a splash of oil over medium-high heat for 6 minutes, breaking up the mince.",
        "Stir in the cumin, chopped tomatoes and bulgur, then add 150ml water.",
        "Cover and simmer for 10–12 minutes until the bulgur is tender and the liquid absorbed.",
        "Season and serve."
      ]
    },
    {
      id: "d206", title: "Armenian-Style Stuffed Pepper Bowl", tags: ["quick"], cuisine: "Armenia", protein: "beef",
      prep: 9, cook: 15,
      ingredients: [
        ing(1, "", "red pepper, halved and deseeded", "produce"), ing(120, "g", "beef mince", "meat"),
        ing(50, "g", "rice", "store"), ing(0.5, "tsp", "ground cinnamon", "spice"),
        ing(100, "g", "chopped tomatoes", "store")
      ],
      steps: [
        "Part-cook the rice for 8 minutes, then drain.",
        "Mix the beef mince with the part-cooked rice and cinnamon, and pile into the pepper halves.",
        "Place in a small ovenproof dish, spoon over the chopped tomatoes, cover with foil.",
        "Bake at 190°C (fan 170°C) for 20 minutes until the pepper is tender and the filling cooked through."
      ]
    },
    {
      id: "d207", title: "Ukrainian-Style Beetroot & Beef Stew", tags: ["quick"], cuisine: "Ukraine", protein: "beef",
      prep: 8, cook: 16,
      ingredients: [
        ing(150, "g", "beef stewing steak, diced", "meat"), ing(100, "g", "cooked beetroot, diced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(200, "ml", "beef stock", "store"),
        ing(2, "tbsp", "soured cream", "dairy")
      ],
      steps: [
        "Brown the beef in a splash of oil over high heat for 3–4 minutes.",
        "Add the onion and cook for 3 minutes, then pour in the stock and simmer for 10 minutes.",
        "Stir in the beetroot and warm through for 2 minutes.",
        "Serve with a dollop of soured cream."
      ]
    },
    {
      id: "d208", title: "Ukrainian-Style Cabbage Rolls Bowl", tags: ["quick"], cuisine: "Ukraine", protein: "pork",
      prep: 9, cook: 15,
      ingredients: [
        ing(120, "g", "pork mince", "meat"), ing(50, "g", "rice", "store"),
        ing(150, "g", "cabbage, shredded", "produce"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce")
      ],
      steps: [
        "Part-cook the rice for 8 minutes, then drain.",
        "Fry the onion and pork mince in a splash of oil over medium-high heat for 5 minutes.",
        "Add the cabbage and rice, and cook for 4 minutes until the cabbage softens.",
        "Stir in the chopped tomatoes and simmer for 5 minutes before serving."
      ]
    },
    {
      id: "d209", title: "Uzbek-Style Beef Plov Rice", tags: ["quick"], cuisine: "Uzbekistan", protein: "beef",
      prep: 8, cook: 16,
      ingredients: [
        ing(150, "g", "beef stewing steak, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(0.5, "", "carrot, grated", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(150, "ml", "beef stock", "store")
      ],
      steps: [
        "Fry the beef and onion in a splash of oil over high heat for 4 minutes until browned.",
        "Add the carrot and cumin, and cook for 2 minutes.",
        "Stir in the rice and stock, cover and simmer for 14–15 minutes until the rice is tender and liquid absorbed.",
        "Season and serve."
      ]
    },
    {
      id: "d210", title: "Uzbek-Style Chicken & Chickpea Rice", tags: ["quick"], cuisine: "Uzbekistan", protein: "chicken",
      prep: 7, cook: 15,
      ingredients: [
        ing(150, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(1, "tin", "chickpeas, drained", "store"), ing(0.5, "", "carrot, grated", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice")
      ],
      steps: [
        "Fry the chicken with the cumin in a splash of oil over medium-high heat for 5 minutes.",
        "Add the carrot and chickpeas, and cook for 2 minutes.",
        "Stir in the rice and 150ml water, cover and simmer for 14 minutes until tender.",
        "Serve hot."
      ]
    },
    {
      id: "d211", title: "Colombian-Style Chicken & Rice (Arroz con Pollo)", tags: ["quick"], cuisine: "Colombia", protein: "chicken",
      prep: 8, cook: 16,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "tsp", "ground cumin", "spice")
      ],
      steps: [
        "Fry the chicken and red pepper in a splash of oil over medium-high heat for 5 minutes.",
        "Stir in the cumin, chopped tomatoes and rice, then add 150ml water.",
        "Cover and simmer for 14–15 minutes until the rice is tender and the liquid absorbed.",
        "Season and serve."
      ]
    },
    {
      id: "d212", title: "Colombian-Style Beef & Potato Stew", tags: ["quick"], cuisine: "Colombia", protein: "beef",
      prep: 8, cook: 16,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(1, "", "small potato, diced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "tsp", "ground cumin", "spice")
      ],
      steps: [
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6 minutes, breaking up the mince.",
        "Add the potato, cumin and chopped tomatoes, plus 100ml water.",
        "Simmer for 12 minutes until the potato is tender.",
        "Season and serve."
      ]
    },
    {
      id: "d213", title: "Chilean-Style Beef & Corn Bowl (Pastel-Inspired)", tags: ["quick"], cuisine: "Chile", protein: "beef",
      prep: 8, cook: 14,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(100, "g", "sweetcorn", "frozen"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "", "egg", "dairy")
      ],
      steps: [
        "Fry the onion and beef mince with the paprika in a splash of oil over medium-high heat for 7 minutes.",
        "Meanwhile, boil the egg for 8 minutes, then cool, peel and quarter.",
        "Warm the sweetcorn through in the pan with the beef for 2 minutes.",
        "Serve the beef and corn topped with the boiled egg."
      ]
    },
    {
      id: "d214", title: "Chilean-Style Fish with Tomato Salsa", tags: ["fish", "quick"], cuisine: "Chile", protein: "fish",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(1, "", "tomato, diced", "produce"),
        ing(0.5, "", "red onion, diced", "produce"), ing(0.5, "", "lime", "produce"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the tomato, onion and lime juice into a fresh salsa.",
        "Fry the fish in a splash of oil over medium-high heat for 3–4 minutes each side until just cooked through.",
        "Serve the fish over the rice, topped with the salsa."
      ]
    },
    {
      id: "d215", title: "Trinidadian-Style Curry Chicken", tags: ["spicy", "quick"], cuisine: "Trinidad", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(1, "tbsp", "curry powder", "spice"),
        ing(1, "", "small potato, diced", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and chicken with the curry powder in a splash of oil over medium heat for 5 minutes.",
        "Add the potato and 150ml water, cover and simmer for 10 minutes until the chicken and potato are tender.",
        "Serve over the rice."
      ]
    },
    {
      id: "d216", title: "Trinidadian-Style Split Pea Fritter Bowl (Doubles-Inspired)", tags: ["vegetarian", "vegan", "spicy", "quick"], cuisine: "Trinidad", protein: "plant-based",
      prep: 8, cook: 12,
      ingredients: [
        ing(1, "tin", "chickpeas, drained", "store"), ing(0.5, "tsp", "curry powder", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(1, "", "flatbread", "bakery"),
        ing(60, "g", "cucumber, diced", "produce")
      ],
      steps: [
        "Warm the chickpeas with the curry powder and chilli flakes in a splash of oil for 8 minutes, mashing some as you go.",
        "Warm the flatbread.",
        "Pile the spiced chickpeas onto the flatbread.",
        "Top with the diced cucumber to serve."
      ]
    },
    {
      id: "d217", title: "Ghanaian-Style Peanut Chicken Stew", tags: ["spicy", "quick"], cuisine: "Ghana", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(2, "tbsp", "peanut butter", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken in a splash of oil over medium-high heat for 5 minutes until browned.",
        "Stir in the chopped tomatoes and chilli flakes, and simmer for 5 minutes.",
        "Stir in the peanut butter until smooth, simmer for 3 minutes, and serve over the rice."
      ]
    },
    {
      id: "d218", title: "Ghanaian-Style Spiced Rice (Waakye-Inspired)", tags: ["vegetarian", "vegan", "quick"], cuisine: "Ghana", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(60, "g", "rice", "store"), ing(1, "tin", "black-eyed beans, drained", "store"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(60, "g", "cabbage, shredded", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Warm the black-eyed beans with the paprika and chilli flakes in a splash of oil for 5 minutes.",
        "Stir the beans through the rice.",
        "Serve with the shredded cabbage."
      ]
    },
    {
      id: "d219", title: "Kenyan-Style Coconut Chicken Stew", tags: ["spicy", "quick"], cuisine: "Kenya", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "tsp", "curry powder", "spice"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken with the curry powder in a splash of oil over medium-high heat for 5 minutes.",
        "Add the chopped tomatoes and coconut milk, and simmer for 8–9 minutes until the chicken is cooked through.",
        "Serve over the rice."
      ]
    },
    {
      id: "d220", title: "Kenyan-Style Spiced Beef Greens (Sukuma Wiki-Inspired)", tags: ["quick"], cuisine: "Kenya", protein: "beef",
      prep: 8, cook: 13,
      ingredients: [
        ing(120, "g", "beef mince", "meat"), ing(150, "g", "kale, shredded", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and beef mince with the paprika in a splash of oil over medium-high heat for 6 minutes.",
        "Add the kale and a splash of water, and cook for 5–6 minutes until wilted and tender.",
        "Serve over the rice."
      ]
    },
    {
      id: "d221", title: "Senegalese-Style Spiced Fish with Rice", tags: ["fish", "spicy", "quick"], cuisine: "Senegal", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(70, "g", "rice", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.25, "tsp", "chilli flakes", "spice")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Simmer the red pepper, chopped tomatoes and chilli flakes for 6 minutes.",
        "Nestle in the fish, cover and simmer for 6–7 minutes until just cooked through.",
        "Serve over the rice."
      ]
    },
    {
      id: "d222", title: "Senegalese-Style Peanut & Vegetable Rice (Maafe-Inspired)", tags: ["vegetarian", "vegan", "quick"], cuisine: "Senegal", protein: "plant-based",
      prep: 8, cook: 14,
      ingredients: [
        ing(2, "tbsp", "peanut butter", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "sweet potato, diced", "produce"), ing(0.5, "", "carrot, sliced", "produce"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Simmer the sweet potato and carrot in the chopped tomatoes with 100ml water for 8 minutes.",
        "Stir in the peanut butter until smooth, and simmer for 4 minutes.",
        "Serve over the rice."
      ]
    },
    {
      id: "d223", title: "Belgian-Style Beef & Beer Stew (Carbonnade-Inspired)", tags: ["quick"], cuisine: "Belgium", protein: "beef",
      prep: 8, cook: 16,
      ingredients: [
        ing(150, "g", "beef stewing steak, diced", "meat"), ing(0.5, "", "onion, sliced", "produce"),
        ing(100, "ml", "brown ale or stout", "store"), ing(1, "tsp", "Dijon mustard", "store"),
        ing(1, "", "small potato, chunked", "produce")
      ],
      steps: [
        "Brown the beef and onion in a splash of oil over high heat for 4 minutes.",
        "Add the potato, ale and mustard, cover and simmer for 12 minutes until the beef and potato are tender.",
        "Season and serve."
      ]
    },
    {
      id: "d224", title: "Belgian-Style Chicken Waterzooi-Inspired Stew", tags: ["quick"], cuisine: "Belgium", protein: "chicken",
      prep: 8, cook: 14,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(0.5, "", "leek, sliced", "produce"),
        ing(0.5, "", "carrot, sliced", "produce"), ing(150, "ml", "chicken stock", "store"),
        ing(2, "tbsp", "double cream", "dairy")
      ],
      steps: [
        "Fry the chicken, leek and carrot in a splash of oil over medium heat for 5 minutes.",
        "Pour in the stock and simmer for 8–9 minutes until the chicken is cooked through.",
        "Stir in the cream and warm through.",
        "Season and serve, with bread if you like."
      ]
    },
    {
      id: "d225", title: "Swiss-Style Cheese & Potato Bake (Rösti-Inspired)", tags: ["vegetarian", "quick"], cuisine: "Switzerland", protein: "plant-based",
      prep: 8, cook: 14,
      ingredients: [
        ing(250, "g", "potato, grated", "produce"), ing(60, "g", "gruyere or cheddar cheese, grated", "dairy"),
        ing(1, "tbsp", "butter", "dairy"), ing(60, "g", "mixed salad leaves", "produce")
      ],
      steps: [
        "Squeeze excess moisture from the grated potato.",
        "Melt the butter in a frying pan and press in the potato, cooking over medium heat for 6–7 minutes until golden underneath.",
        "Scatter over the cheese, flip carefully, and cook for 5–6 minutes more until golden and the cheese has melted.",
        "Serve with the salad leaves."
      ]
    },
    {
      id: "d226", title: "Swiss-Style Chicken & Mushroom in Cream Sauce", tags: ["quick"], cuisine: "Switzerland", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(100, "ml", "double cream", "dairy"), ing(1, "tsp", "Dijon mustard", "store"),
        ing(70, "g", "pasta", "store")
      ],
      steps: [
        "Cook the pasta according to the packet instructions.",
        "Fry the chicken and mushrooms in a splash of oil over medium-high heat for 8 minutes until the chicken is cooked through.",
        "Stir in the cream and mustard, and simmer for 2 minutes until thickened.",
        "Serve over the pasta."
      ]
    },
    {
      id: "d227", title: "Finnish-Style Salmon & Potato Soup", tags: ["fish", "quick"], cuisine: "Finland", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "salmon fillet, cubed", "meat"), ing(150, "g", "potato, diced", "produce"),
        ing(0.5, "", "leek, sliced", "produce"), ing(150, "ml", "milk", "dairy"),
        ing(null, "small handful", "fresh dill, chopped", "produce")
      ],
      steps: [
        "Simmer the potato and leek in 200ml water for 8 minutes until nearly tender.",
        "Add the salmon and milk, and simmer gently for 5–6 minutes until the fish is just cooked through.",
        "Season and scatter with dill.",
        "Serve hot."
      ]
    },
    {
      id: "d228", title: "Finnish-Style Meatballs with Lingonberry", tags: ["quick"], cuisine: "Finland", protein: "pork",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1, "tbsp", "breadcrumbs", "store"),
        ing(1, "", "egg yolk", "dairy"), ing(150, "g", "new potatoes", "produce"),
        ing(1, "tbsp", "cranberry sauce", "store")
      ],
      steps: [
        "Boil the new potatoes for 12 minutes until tender, then drain.",
        "Mix the pork mince with the breadcrumbs and egg yolk, and shape into small meatballs.",
        "Fry over medium heat for 8–9 minutes, turning, until browned and cooked through.",
        "Serve with the potatoes and cranberry sauce."
      ]
    },
    {
      id: "d229", title: "Danish-Style Open Rye Sandwich (Smørrebrød-Inspired)", tags: ["fish", "quick"], cuisine: "Denmark", protein: "fish",
      prep: 8, cook: 0,
      ingredients: [
        ing(2, "slice", "rye bread", "bakery"), ing(80, "g", "smoked mackerel, flaked", "meat"),
        ing(1, "tbsp", "soured cream", "dairy"), ing(null, "small handful", "fresh dill, chopped", "produce"),
        ing(60, "g", "cucumber, sliced", "produce")
      ],
      steps: [
        "Spread the rye bread with soured cream.",
        "Top with the flaked mackerel and cucumber slices.",
        "Scatter with dill.",
        "Serve open-faced."
      ]
    },
    {
      id: "d230", title: "Danish-Style Pork Meatballs (Frikadeller-Inspired)", tags: ["quick"], cuisine: "Denmark", protein: "pork",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1, "tbsp", "plain flour", "store"),
        ing(1, "", "egg", "dairy"), ing(150, "g", "potato, chunked", "produce"),
        ing(1, "tbsp", "butter", "dairy")
      ],
      steps: [
        "Boil the potato for 12 minutes until tender, then drain and mash with the butter.",
        "Mix the pork mince with the flour and egg, and shape into oval patties.",
        "Fry over medium heat for 4–5 minutes each side until browned and cooked through.",
        "Serve with the mash."
      ]
    },
    {
      id: "d231", title: "Norwegian-Style Baked Salmon with Dill Sauce", tags: ["fish", "quick"], cuisine: "Norway", protein: "fish",
      prep: 7, cook: 14,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(null, "handful", "fresh dill, chopped", "produce"), ing(120, "g", "new potatoes", "produce"),
        ing(60, "g", "green beans", "produce")
      ],
      steps: [
        "Boil the potatoes and green beans together for 12 minutes until tender, then drain.",
        "Bake the salmon at 200°C (fan 180°C) for 12–14 minutes until just cooked through.",
        "Stir the dill through the soured cream.",
        "Serve the salmon with the potatoes, beans and dill sauce."
      ]
    },
    {
      id: "d232", title: "New Zealand-Style Lamb with Mint Sauce", tags: ["quick"], cuisine: "New Zealand", protein: "lamb",
      prep: 7, cook: 10,
      ingredients: [
        ing(160, "g", "lamb leg steak", "meat"), ing(null, "handful", "fresh mint, chopped", "produce"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(1, "tsp", "honey", "store"),
        ing(120, "g", "new potatoes", "produce")
      ],
      steps: [
        "Boil the new potatoes for 12 minutes until tender, then drain.",
        "Mix the mint, vinegar and honey into a sauce.",
        "Fry the lamb over medium-high heat for 3–4 minutes each side, then rest for 2 minutes and slice.",
        "Serve the lamb with the potatoes and mint sauce."
      ]
    },
    {
      id: "d233", title: "Canadian-Style Maple Pork Chops", tags: ["quick"], cuisine: "Canada", protein: "pork",
      prep: 7, cook: 10,
      ingredients: [
        ing(2, "", "pork chops", "meat"), ing(1.5, "tbsp", "maple syrup", "store"),
        ing(1, "tsp", "Dijon mustard", "store"), ing(120, "g", "new potatoes", "produce"),
        ing(60, "g", "green beans", "produce")
      ],
      steps: [
        "Boil the potatoes and green beans together for 12 minutes until tender, then drain.",
        "Fry the pork chops over medium-high heat for 3–4 minutes each side until nearly cooked through.",
        "Stir the maple syrup and mustard together, pour over the chops and cook for 1–2 minutes until glazed.",
        "Serve with the potatoes and beans."
      ]
    },
    {
      id: "d234", title: "Puerto Rican-Style Rice with Pigeon Peas", tags: ["vegetarian", "vegan", "quick"], cuisine: "Puerto Rico", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(70, "g", "rice", "store"), ing(1, "tin", "pigeon peas or black-eyed beans, drained", "store"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "", "garlic clove, finely chopped", "produce")
      ],
      steps: [
        "Fry the red pepper and garlic in a splash of oil over medium heat for 4 minutes.",
        "Stir in the cumin, then add the rice and pigeon peas, plus 150ml water.",
        "Cover and simmer for 14 minutes until the rice is tender and the liquid absorbed.",
        "Season and serve."
      ]
    },
    {
      id: "d235", title: "Puerto Rican-Style Mojo Pork", tags: ["quick"], cuisine: "Puerto Rico", protein: "pork",
      prep: 8, cook: 10,
      ingredients: [
        ing(160, "g", "pork loin, sliced", "meat"), ing(0.5, "", "lime, juiced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "dried oregano", "spice"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the pork with the lime juice, garlic and oregano.",
        "Fry over medium-high heat for 7–8 minutes until browned and cooked through.",
        "Serve over the rice."
      ]
    },
    {
      id: "d236", title: "Cantonese White-Cut Chicken with Ginger-Scallion Oil", tags: ["quick"], cuisine: "China", protein: "chicken",
      prep: 8, cook: 18,
      ingredients: [
        ing(1, "", "chicken breast (about 170g)", "meat"), ing(2, "", "spring onions, finely shredded", "produce"),
        ing(1, "thumb", "fresh ginger, finely grated", "produce"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(1, "tsp", "sesame oil", "store"), ing(1, "tbsp", "light soy sauce", "store"),
        ing(1, "pinch", "salt", "spice"), ing(150, "g", "cooked jasmine rice", "store"),
        ing(0.5, "", "cucumber, sliced", "produce")
      ],
      steps: [
        "Bring a small pan of water to the boil with a pinch of salt, then lower in the chicken breast and reduce to a gentle simmer.",
        "Poach the chicken for 12–15 minutes until cooked through (juices run clear), then remove and rest for 5 minutes before slicing.",
        "While the chicken poaches, mix the shredded spring onion and grated ginger in a heatproof bowl with a pinch of salt.",
        "Heat the vegetable oil in a small pan until just smoking, then carefully pour it over the ginger and spring onion so it sizzles. Stir in the sesame oil and soy sauce.",
        "Slice the chicken and arrange over the rice with the sliced cucumber, then spoon the ginger-scallion oil over the top."
      ]
    },
    {
      id: "d237", title: "Sichuan Dry-Fried Green Beans with Pork Mince", tags: ["quick", "spicy"], cuisine: "China", protein: "pork",
      prep: 8, cook: 14,
      ingredients: [
        ing(200, "g", "green beans, trimmed", "produce"), ing(100, "g", "pork mince", "meat"),
        ing(2, "", "garlic cloves, minced", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "tbsp", "Sichuan chilli bean paste (doubanjiang)", "store"), ing(1, "tsp", "Sichuan peppercorns, crushed", "spice"),
        ing(1, "tbsp", "light soy sauce", "store"), ing(1, "tsp", "sugar", "store"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Heat the oil in a wok until hot, add the green beans and stir-fry for 5–6 minutes, tossing often, until blistered and slightly wrinkled. Remove and set aside.",
        "Add a touch more oil to the wok, add the pork mince and stir-fry for 3–4 minutes, breaking it up, until browned and starting to crisp.",
        "Add the garlic, ginger and crushed Sichuan peppercorns, and stir-fry for 30 seconds until fragrant.",
        "Stir in the chilli bean paste, soy sauce and sugar, and cook for 1 minute.",
        "Return the beans to the wok, toss to coat and cook for a further 1–2 minutes. Serve with the rice."
      ]
    },
    {
      id: "d238", title: "Shandong-Style Braised Fish in Brown Sauce", tags: ["quick", "fish"], cuisine: "China", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(1, "", "white fish fillet, about 180g (e.g. seabass or cod)", "meat"), ing(1, "tbsp", "cornflour", "store"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "", "garlic clove, sliced", "produce"),
        ing(1, "thumb", "fresh ginger, sliced", "produce"), ing(2, "", "spring onions, cut into batons", "produce"),
        ing(1, "tbsp", "light soy sauce", "store"), ing(1, "tbsp", "dark soy sauce", "store"),
        ing(1, "tsp", "Chinese black vinegar", "store"), ing(1, "tsp", "sugar", "store"),
        ing(100, "ml", "chicken or vegetable stock", "store"), ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Pat the fish dry and dust lightly all over with cornflour.",
        "Heat the oil in a frying pan over medium-high heat and fry the fish for 2–3 minutes each side until golden and just cooked. Remove and set aside.",
        "Add the garlic, ginger and half the spring onion to the pan and stir-fry for 30 seconds.",
        "Add the soy sauces, vinegar, sugar and stock, bring to a simmer and cook for 2 minutes until slightly thickened.",
        "Return the fish to the pan, spoon the sauce over and simmer for 1–2 minutes to heat through.",
        "Scatter with the remaining spring onion and serve with rice."
      ]
    },
    {
      id: "d239", title: "Chinese-Style Cumin Lamb Stir-Fry with Peppers", tags: ["quick", "spicy"], cuisine: "China", protein: "lamb",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "lamb leg steak, thinly sliced", "meat"), ing(1, "tsp", "cumin seeds", "spice"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(1, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "white onion, sliced", "produce"), ing(2, "", "garlic cloves, minced", "produce"),
        ing(1, "tbsp", "light soy sauce", "store"), ing(1, "tsp", "Shaoxing wine (or dry sherry)", "store"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "handful", "fresh coriander, chopped", "produce"),
        ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Toss the lamb with the soy sauce and Shaoxing wine and set aside to marinate briefly.",
        "Heat the oil in a wok over high heat, add the lamb and stir-fry for 2–3 minutes until browned. Remove and set aside.",
        "Add the onion and pepper to the wok and stir-fry for 2–3 minutes until starting to soften.",
        "Add the garlic, cumin seeds and chilli flakes and stir-fry for 30 seconds until fragrant.",
        "Return the lamb to the wok and toss everything together for 1–2 minutes until piping hot.",
        "Scatter with coriander and serve with rice."
      ]
    },
    {
      id: "d240", title: "Greek Avgolemono Chicken & Rice Soup", tags: ["quick"], cuisine: "Greece", protein: "chicken",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "chicken breast, diced", "meat"), ing(500, "ml", "chicken stock", "store"),
        ing(40, "g", "orzo", "store"), ing(1, "", "egg", "dairy"),
        ing(1, "", "lemon, juiced", "produce"), ing(0.5, "", "onion, finely diced", "produce"),
        ing(1, "", "carrot, diced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "sprig", "fresh dill, chopped", "produce")
      ],
      steps: [
        "Heat the olive oil in a saucepan and sauté the onion and carrot for 3–4 minutes until softened.",
        "Add the stock and bring to the boil, then add the chicken and orzo and simmer for 10–12 minutes until the chicken is cooked and the orzo is tender.",
        "Whisk the egg and lemon juice together in a bowl. Ladle a little hot stock into the egg mixture, whisking constantly to temper it.",
        "Remove the soup from the heat and stir in the egg-lemon mixture, stirring until silky (do not let it boil again or it will curdle).",
        "Season and scatter with the chopped dill to serve."
      ]
    },
    {
      id: "d241", title: "Greek-Style Baked Cod Plaki with Tomatoes and Olives", tags: ["quick", "fish"], cuisine: "Greece", protein: "fish",
      prep: 8, cook: 20,
      ingredients: [
        ing(1, "", "cod fillet, about 180g", "meat"), ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "", "garlic clove, sliced", "produce"), ing(200, "g", "chopped tomatoes (tinned)", "store"),
        ing(1, "handful", "Kalamata olives", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tsp", "dried oregano", "spice"), ing(0.5, "", "lemon", "produce"),
        ing(1, "handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (180°C fan).",
        "Heat the olive oil in an ovenproof pan and sauté the onion and garlic for 3–4 minutes until soft.",
        "Stir in the chopped tomatoes, oregano and olives and simmer for 5 minutes.",
        "Nestle the cod fillet into the sauce and spoon a little sauce over the top.",
        "Transfer to the oven and bake for 12–15 minutes until the fish flakes easily.",
        "Squeeze over the lemon juice and scatter with parsley to serve."
      ]
    },
    {
      id: "d242", title: "Greek Beef Giouvetsi with Orzo", tags: ["quick"], cuisine: "Greece", protein: "beef",
      prep: 9, cook: 28,
      ingredients: [
        ing(150, "g", "beef (braising steak), diced", "meat"), ing(60, "g", "orzo", "store"),
        ing(200, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.25, "tsp", "ground cinnamon", "spice"), ing(150, "ml", "beef stock", "store"),
        ing(20, "g", "hard cheese (kefalotyri or parmesan), grated", "dairy"), ing(1, "handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Heat the olive oil in a saucepan over medium-high heat and brown the beef pieces for 3–4 minutes.",
        "Add the onion and garlic and cook for 2–3 minutes until softened.",
        "Stir in the chopped tomatoes, cinnamon and stock, bring to a simmer, cover and cook for 15–18 minutes until the beef is tender, adding a splash more stock if it dries out.",
        "Stir in the orzo and cook for a further 8–10 minutes, stirring occasionally, until the orzo is tender and the sauce has thickened.",
        "Spoon into a bowl, scatter with the grated cheese and parsley."
      ]
    },
    {
      id: "d243", title: "Greek Gigantes-Style Butter Beans in Tomato Sauce", tags: ["vegetarian", "vegan", "quick"], cuisine: "Greece", protein: "plant-based",
      prep: 7, cook: 20,
      ingredients: [
        ing(400, "g", "butter beans (tinned), drained", "store"), ing(200, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, minced", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "tsp", "dried oregano", "spice"),
        ing(0.5, "tsp", "sweet paprika", "spice"), ing(1, "handful", "fresh parsley, chopped", "produce"),
        ing(1, "slice", "crusty bread, to serve", "bakery")
      ],
      steps: [
        "Heat the olive oil in a saucepan and sauté the onion and garlic for 3–4 minutes until softened.",
        "Stir in the chopped tomatoes, oregano and paprika and bring to a simmer.",
        "Add the drained butter beans and simmer gently for 12–15 minutes, stirring occasionally, until the sauce has thickened and the beans are heated through.",
        "Season to taste and scatter with chopped parsley.",
        "Serve with crusty bread."
      ]
    },
    {
      id: "d244", title: "Philly-Style Cheesesteak Hoagie", tags: ["quick"], cuisine: "USA", protein: "beef",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "beef sirloin or rump steak, very thinly sliced", "meat"), ing(0.5, "", "white onion, sliced", "produce"),
        ing(0.5, "", "green pepper, sliced", "produce"), ing(1, "", "sub roll", "bakery"),
        ing(40, "g", "provolone or cheddar cheese slices", "dairy"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Heat the oil in a frying pan over high heat. Add the onion and pepper and fry for 4–5 minutes until softened and lightly browned, then remove and set aside.",
        "Add the thinly sliced beef to the hot pan in a single layer and fry for 2–3 minutes, chopping it up with a spatula as it cooks, until browned.",
        "Return the onion and pepper to the pan, season with salt and pepper, and toss together.",
        "Lay the cheese slices over the beef mixture and let it melt for 1 minute.",
        "Split the sub roll and pile in the cheesy beef and vegetables."
      ]
    },
    {
      id: "d245", title: "New Orleans-Style Blackened Fish with Dirty Rice", tags: ["quick", "spicy", "fish"], cuisine: "USA", protein: "fish",
      prep: 9, cook: 16,
      ingredients: [
        ing(1, "", "white fish fillet, about 180g (e.g. haddock)", "meat"), ing(1, "tsp", "paprika", "spice"),
        ing(0.5, "tsp", "cayenne pepper", "spice"), ing(0.5, "tsp", "garlic powder", "spice"),
        ing(0.5, "tsp", "dried thyme", "spice"), ing(0.5, "tsp", "dried oregano", "spice"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(150, "g", "cooked rice", "store"),
        ing(30, "g", "chorizo or smoked sausage, finely diced", "meat"), ing(0.5, "", "green pepper, diced", "produce"),
        ing(0.25, "", "onion, diced", "produce"), ing(1, "stick", "celery, diced", "produce")
      ],
      steps: [
        "Mix the paprika, cayenne, garlic powder, thyme and oregano together and press firmly onto both sides of the fish fillet.",
        "Heat half the oil in a frying pan over high heat and cook the fish for 2–3 minutes per side until blackened and cooked through. Set aside.",
        "Add the remaining oil to the pan and fry the chorizo, onion, pepper and celery for 4–5 minutes until softened.",
        "Stir in the cooked rice and toss well for 2–3 minutes to heat through and pick up the spiced oil.",
        "Serve the dirty rice topped with the blackened fish."
      ]
    },
    {
      id: "d246", title: "Carolina-Style Pulled Pork Sandwich with Vinegar Slaw", tags: ["quick"], cuisine: "USA", protein: "pork",
      prep: 9, cook: 18,
      ingredients: [
        ing(200, "g", "pork shoulder steak, thinly sliced", "meat"), ing(1, "tbsp", "brown sugar", "store"),
        ing(1, "tsp", "smoked paprika", "spice"), ing(0.5, "tsp", "garlic powder", "spice"),
        ing(2, "tbsp", "cider vinegar", "store"), ing(1, "tbsp", "ketchup", "store"),
        ing(1, "tsp", "hot sauce", "store"), ing(1, "", "burger bun", "bakery"),
        ing(100, "g", "white cabbage, shredded", "produce"), ing(1, "tbsp", "mayonnaise", "store"),
        ing(1, "tsp", "Dijon mustard", "store")
      ],
      steps: [
        "Rub the pork slices with the brown sugar, smoked paprika and garlic powder.",
        "Heat a splash of oil in a frying pan over medium heat and cook the pork for 4–5 minutes per side until deeply browned and cooked through.",
        "Add 1 tbsp of the cider vinegar with the ketchup and hot sauce to the pan, toss to coat, then shred the pork with two forks in the sauce and simmer for 2–3 minutes until sticky.",
        "Meanwhile, toss the shredded cabbage with the mayonnaise, mustard and remaining vinegar to make a quick slaw.",
        "Pile the pulled pork into the bun and top with the vinegar slaw."
      ]
    },
    {
      id: "d247", title: "Korean Dak Galbi-Style Spicy Chicken with Rice Cakes", tags: ["quick", "spicy"], cuisine: "Korea", protein: "chicken",
      prep: 9, cook: 16,
      ingredients: [
        ing(180, "g", "chicken thigh, diced", "meat"), ing(100, "g", "Korean rice cakes (tteok)", "frozen"),
        ing(1, "tbsp", "gochujang", "store"), ing(1, "tsp", "gochugaru (Korean chilli flakes)", "spice"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(0.25, "", "white cabbage, shredded", "produce"), ing(0.5, "", "carrot, sliced", "produce"),
        ing(1, "", "spring onion, sliced", "produce"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Mix the gochujang, gochugaru, soy sauce, honey, garlic and ginger in a bowl. Toss the chicken in half the sauce.",
        "Heat the oil in a frying pan or wok over medium-high heat, add the chicken and stir-fry for 5–6 minutes until browned and nearly cooked through.",
        "Add the cabbage and carrot and stir-fry for 2–3 minutes until starting to soften.",
        "Add the rice cakes, remaining sauce and a splash of water, and cook for 4–5 minutes, stirring, until the rice cakes are soft and the chicken is cooked through.",
        "Scatter with spring onion to serve."
      ]
    },
    {
      id: "d248", title: "Korean-Style Braised Mackerel with Gochugaru (Godeungeo Jorim)", tags: ["quick", "spicy", "fish"], cuisine: "Korea", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(1, "", "mackerel fillet, about 150g", "meat"), ing(0.5, "", "daikon radish or 1 potato, thinly sliced", "produce"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tbsp", "gochugaru", "spice"),
        ing(1, "tsp", "gochujang", "store"), ing(1, "", "garlic clove, minced", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "sugar", "store"),
        ing(100, "ml", "water", "store"), ing(1, "", "spring onion, sliced", "produce"),
        ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Layer the sliced daikon (or potato) in the base of a small pan.",
        "Mix the soy sauce, gochugaru, gochujang, garlic, ginger, sugar and water together and pour half over the vegetables.",
        "Lay the mackerel fillet on top, skin-side up, and pour over the remaining sauce.",
        "Bring to a simmer, cover and cook for 10–12 minutes until the vegetables are tender and the fish is cooked through, spooning sauce over occasionally.",
        "Scatter with spring onion and serve with rice."
      ]
    },
    {
      id: "d249", title: "Korean Japchae Glass Noodles with Pork", tags: ["quick"], cuisine: "Korea", protein: "pork",
      prep: 9, cook: 12,
      ingredients: [
        ing(60, "g", "sweet potato glass noodles (dangmyeon)", "store"), ing(120, "g", "pork loin, thinly sliced", "meat"),
        ing(0.5, "", "carrot, julienned", "produce"), ing(0.25, "", "onion, sliced", "produce"),
        ing(60, "g", "spinach", "produce"), ing(1, "", "spring onion, sliced", "produce"),
        ing(2, "tbsp", "soy sauce", "store"), ing(1, "tbsp", "sesame oil", "store"),
        ing(1, "tbsp", "sugar", "store"), ing(1, "tsp", "toasted sesame seeds", "spice"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Soak the glass noodles in boiling water for 6–8 minutes until tender, then drain and snip into shorter lengths with scissors.",
        "Heat the vegetable oil in a wok over high heat and stir-fry the pork for 3–4 minutes until browned. Remove and set aside.",
        "Add the carrot and onion to the wok and stir-fry for 2–3 minutes, then add the spinach and wilt for 1 minute. Remove and set aside with the pork.",
        "Toss the drained noodles in the wok with the soy sauce, sesame oil, sugar and garlic for 1–2 minutes until glossy.",
        "Return the pork and vegetables to the wok, toss everything together, and scatter with spring onion and sesame seeds."
      ]
    },
    {
      id: "d250", title: "Vietnamese-Style Turmeric Dill Fish (Chả Cá) with Rice Noodles", tags: ["quick", "fish"], cuisine: "Vietnam", protein: "fish",
      prep: 9, cook: 10,
      ingredients: [
        ing(180, "g", "white fish fillet (e.g. haddock), cut into chunks", "meat"), ing(1, "tsp", "ground turmeric", "spice"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "garlic clove, minced", "produce"),
        ing(1, "tbsp", "fish sauce", "store"), ing(1, "large handful", "fresh dill, chopped", "produce"),
        ing(2, "", "spring onions, cut into lengths", "produce"), ing(100, "g", "rice noodles (vermicelli)", "store"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "handful", "roasted peanuts, chopped", "store"),
        ing(1, "handful", "fresh coriander, chopped", "produce"), ing(0.5, "", "lime", "produce")
      ],
      steps: [
        "Toss the fish chunks with the turmeric, ginger, garlic and fish sauce and set aside to marinate briefly.",
        "Cook the rice noodles according to the packet instructions, then drain and set aside.",
        "Heat the oil in a frying pan over medium-high heat and fry the fish for 4–5 minutes, turning gently, until golden and cooked through.",
        "Add the spring onions and dill to the pan and toss for 1 minute until wilted.",
        "Serve the fish and dill over the rice noodles, scattered with chopped peanuts and coriander, with a squeeze of lime."
      ]
    },
    {
      id: "d251", title: "Vietnamese-Style Tofu & Vegetable Pho", tags: ["vegetarian", "vegan", "quick"], cuisine: "Vietnam", protein: "plant-based",
      prep: 9, cook: 15,
      ingredients: [
        ing(120, "g", "firm tofu, cubed", "store"), ing(500, "ml", "vegetable stock", "store"),
        ing(1, "", "star anise", "spice"), ing(1, "", "cinnamon stick", "spice"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tbsp", "soy sauce", "store"), ing(60, "g", "flat rice noodles (pho-style)", "store"),
        ing(50, "g", "beansprouts", "produce"), ing(0.5, "", "red chilli, sliced", "produce"),
        ing(1, "handful", "fresh Thai basil or coriander", "produce"), ing(0.5, "", "lime", "produce")
      ],
      steps: [
        "Simmer the vegetable stock with the star anise, cinnamon stick, ginger and garlic for 8–10 minutes to infuse, then stir in the soy sauce.",
        "Meanwhile, cook the rice noodles according to the packet instructions and drain.",
        "Pan-fry the tofu cubes in a little oil for 4–5 minutes until golden on the outside.",
        "Strain the spices out of the stock (or leave them in for extra flavour) and bring it back to a simmer.",
        "Divide the noodles and beansprouts into a bowl, pour over the hot broth, and top with the tofu, sliced chilli and herbs.",
        "Serve with a lime wedge."
      ]
    },
    {
      id: "d252", title: "Irish-Style Lamb Shepherd's Pie Mash Cup", tags: ["quick"], cuisine: "Ireland", protein: "lamb",
      prep: 9, cook: 20,
      ingredients: [
        ing(180, "g", "lamb mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "carrot, diced", "produce"), ing(1, "tbsp", "tomato purée", "store"),
        ing(100, "ml", "lamb or beef stock", "store"), ing(1, "tsp", "Worcestershire sauce", "store"),
        ing(1, "tsp", "dried thyme", "spice"), ing(250, "g", "potatoes, peeled and chopped", "produce"),
        ing(20, "g", "butter", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Boil the potatoes in salted water for 12–15 minutes until tender, then drain and mash with the butter and milk.",
        "Meanwhile, heat the oil in a frying pan and brown the lamb mince for 4–5 minutes, breaking it up as it cooks.",
        "Add the onion and carrot and cook for 3–4 minutes until softened.",
        "Stir in the tomato purée, stock, Worcestershire sauce and thyme, and simmer for 6–8 minutes until thickened.",
        "Spoon the lamb mixture into a mug or small dish, top with the mash, and serve (or flash under a hot grill for 3–4 minutes to brown the top)."
      ]
    },
    {
      id: "d253", title: "Irish Boxty Potato Pancakes with Bacon and Cabbage", tags: ["quick"], cuisine: "Ireland", protein: "pork",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "potatoes, peeled", "produce"), ing(1, "", "egg", "dairy"),
        ing(2, "tbsp", "plain flour", "store"), ing(1, "tbsp", "milk", "dairy"),
        ing(2, "rashers", "streaky bacon, chopped", "meat"), ing(60, "g", "cabbage or kale, shredded", "produce"),
        ing(1, "tbsp", "butter", "dairy"), ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Grate half the potatoes and boil and mash the other half, then squeeze excess liquid from the grated potato.",
        "Mix the grated and mashed potato with the egg, flour and milk to form a thick batter, and season well.",
        "Heat the butter in a frying pan, fry the bacon for 3–4 minutes until crisp, then add the cabbage and cook for 3–4 minutes until wilted. Remove and set aside.",
        "Wipe the pan, add a little more butter, and spoon in the potato batter to form 2–3 pancakes. Fry for 3–4 minutes per side until golden and cooked through.",
        "Serve the boxty pancakes topped with the bacon and cabbage."
      ]
    },
    {
      id: "d254", title: "Hungarian-Style Paprika Fish Soup (Halászlé)", tags: ["quick", "spicy", "fish"], cuisine: "Hungary", protein: "fish",
      prep: 9, cook: 20,
      ingredients: [
        ing(180, "g", "white fish fillet (e.g. pollock or haddock), cut into chunks", "meat"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(1, "tbsp", "sweet paprika", "spice"), ing(0.5, "tsp", "hot paprika", "spice"),
        ing(1, "", "tomato, chopped", "produce"), ing(0.5, "", "green pepper, chopped", "produce"),
        ing(400, "ml", "fish or vegetable stock", "store"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(1, "handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Heat the oil in a saucepan and sauté the onion for 4–5 minutes until soft.",
        "Remove the pan from the heat and stir in the sweet and hot paprika (this stops it burning and turning bitter).",
        "Add the tomato, green pepper and stock, return to the heat and simmer for 10 minutes.",
        "Add the fish chunks and simmer gently for 6–8 minutes until just cooked through.",
        "Season to taste and scatter with parsley to serve."
      ]
    },
    {
      id: "d255", title: "Hungarian Stuffed Peppers with Pork and Rice (Töltött Paprika)", tags: ["quick"], cuisine: "Hungary", protein: "pork",
      prep: 9, cook: 30,
      ingredients: [
        ing(1, "", "large bell pepper, top cut off and deseeded", "produce"), ing(120, "g", "pork mince", "meat"),
        ing(40, "g", "cooked rice", "store"), ing(0.25, "", "onion, finely diced", "produce"),
        ing(1, "", "garlic clove, minced", "produce"), ing(0.5, "tsp", "sweet paprika", "spice"),
        ing(200, "g", "passata", "store"), ing(1, "tsp", "tomato purée", "store"),
        ing(1, "tbsp", "soured cream", "dairy"), ing(1, "handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Preheat the oven to 190°C (170°C fan).",
        "Mix the pork mince, cooked rice, onion, garlic and paprika together and season well.",
        "Stuff the mixture into the hollowed pepper and stand it upright in a small ovenproof dish.",
        "Mix the passata with the tomato purée and pour around the pepper.",
        "Cover with foil and bake for 25–30 minutes until the pepper is tender and the filling is cooked through.",
        "Serve with the tomato sauce spooned over, a dollop of soured cream and a scatter of parsley."
      ]
    },
    {
      id: "d256", title: "Nigerian Suya-Spiced Chicken Skewers with Onions", tags: ["quick", "spicy"], cuisine: "Nigeria", protein: "chicken",
      prep: 9, cook: 10,
      ingredients: [
        ing(180, "g", "chicken breast, cut into strips", "meat"), ing(2, "tbsp", "roasted peanuts, crushed", "store"),
        ing(1, "tsp", "paprika", "spice"), ing(0.5, "tsp", "cayenne pepper", "spice"),
        ing(0.5, "tsp", "ground ginger", "spice"), ing(0.25, "tsp", "garlic powder", "spice"),
        ing(0.25, "tsp", "onion powder", "spice"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, cut into wedges", "produce"), ing(0.5, "", "tomato, sliced", "produce"),
        ing(2, "", "wooden skewers", "store")
      ],
      steps: [
        "Crush the roasted peanuts to a coarse powder and mix with the paprika, cayenne, ginger, garlic powder and onion powder to make the suya spice mix (yaji).",
        "Toss the chicken strips in the vegetable oil, then coat thoroughly in the spice mix.",
        "Thread the chicken onto the skewers.",
        "Grill or griddle the skewers over high heat for 4–5 minutes per side until charred and cooked through.",
        "Serve with the raw onion wedges and sliced tomato."
      ]
    },
    {
      id: "d257", title: "Nigerian-Style Efo Riro Spinach & Turkey Stew", tags: ["quick", "spicy"], cuisine: "Nigeria", protein: "turkey",
      prep: 9, cook: 20,
      ingredients: [
        ing(150, "g", "turkey breast, diced", "meat"), ing(200, "g", "spinach, roughly chopped", "produce"),
        ing(0.5, "", "onion, chopped", "produce"), ing(0.5, "", "red pepper, chopped", "produce"),
        ing(0.5, "", "scotch bonnet chilli, finely chopped", "produce"), ing(200, "g", "chopped tomatoes", "store"),
        ing(1, "tbsp", "red palm oil (or vegetable oil)", "store"), ing(1, "tsp", "vegetable stock powder", "store"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce")
      ],
      steps: [
        "Finely chop the onion, red pepper and chilli together (or blitz in a food processor) to form a base paste.",
        "Heat the palm oil in a saucepan over medium heat, add the pepper paste, garlic and ginger, and cook for 5–6 minutes until softened and fragrant.",
        "Add the chopped tomatoes and stock powder and simmer for 5 minutes.",
        "Add the turkey and cook for 8–10 minutes until cooked through.",
        "Stir in the spinach and cook for a further 2–3 minutes until just wilted.",
        "Season to taste and serve."
      ]
    },
    {
      id: "d258", title: "Pakistani-Style Spiced Fried Fish with Chaat Masala", tags: ["quick", "spicy", "fish"], cuisine: "Pakistan", protein: "fish",
      prep: 8, cook: 10,
      ingredients: [
        ing(1, "", "white fish fillet, about 180g", "meat"), ing(1, "tbsp", "gram flour (besan)", "store"),
        ing(1, "tsp", "ground cumin", "spice"), ing(1, "tsp", "chilli powder", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(0.5, "tsp", "chaat masala", "spice"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "tbsp", "lemon juice", "produce"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "red onion, sliced", "produce"), ing(1, "handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Mix the gram flour, cumin, chilli powder, turmeric, garlic, ginger and lemon juice into a thick paste and coat the fish fillet all over.",
        "Heat the oil in a frying pan over medium-high heat and fry the fish for 3–4 minutes per side until crisp and cooked through.",
        "Sprinkle with the chaat masala as soon as it comes out of the pan.",
        "Serve with the sliced red onion and a scatter of fresh coriander."
      ]
    },
    {
      id: "d259", title: "Pakistani-Style Chapli Kebab with Yoghurt Chutney", tags: ["quick", "spicy"], cuisine: "Pakistan", protein: "beef",
      prep: 9, cook: 12,
      ingredients: [
        ing(180, "g", "beef mince", "meat"), ing(0.25, "", "onion, finely diced", "produce"),
        ing(1, "", "tomato, finely diced (seeds removed)", "produce"), ing(1, "", "green chilli, finely chopped", "produce"),
        ing(1, "tsp", "coriander seeds, crushed", "spice"), ing(1, "tsp", "cumin seeds, crushed", "spice"),
        ing(0.5, "tsp", "chilli powder", "spice"), ing(1, "tbsp", "gram flour", "store"),
        ing(1, "handful", "fresh coriander, chopped", "produce"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(3, "tbsp", "natural yoghurt", "dairy"), ing(0.5, "tsp", "fresh mint, chopped", "produce")
      ],
      steps: [
        "Mix the beef mince with the onion, tomato, chilli, coriander seeds, cumin seeds, chilli powder, gram flour and fresh coriander until well combined.",
        "Shape into 2 flat, wide patties.",
        "Heat the oil in a frying pan over medium heat and fry the patties for 4–5 minutes per side until well browned and cooked through.",
        "Mix the yoghurt with the mint to make a quick chutney.",
        "Serve the chapli kebabs with the minted yoghurt chutney."
      ]
    },
    {
      id: "d260", title: "Argentinian-Style Chicken Milanesa with Tomato Salad", tags: ["quick"], cuisine: "Argentina", protein: "chicken",
      prep: 9, cook: 10,
      ingredients: [
        ing(1, "", "chicken breast, butterflied and flattened", "meat"), ing(30, "g", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(40, "g", "breadcrumbs", "bakery"),
        ing(20, "g", "parmesan, grated", "dairy"), ing(1, "tsp", "dried oregano", "spice"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "", "tomato, sliced", "produce"),
        ing(0.25, "", "red onion, thinly sliced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.5, "", "lemon", "produce")
      ],
      steps: [
        "Mix the breadcrumbs with the parmesan and oregano on a plate.",
        "Dust the flattened chicken breast in flour, dip in the beaten egg, then coat well in the breadcrumb mixture.",
        "Heat the vegetable oil in a frying pan over medium heat and fry the chicken for 3–4 minutes per side until golden and cooked through.",
        "Toss the sliced tomato and red onion with the olive oil, a squeeze of lemon and seasoning.",
        "Serve the milanesa with the tomato salad alongside."
      ]
    },
    {
      id: "d261", title: "Argentinian-Style Choripán Sausage Sandwich with Chimichurri", tags: ["quick", "spicy"], cuisine: "Argentina", protein: "pork",
      prep: 8, cook: 10,
      ingredients: [
        ing(1, "", "chorizo or spicy pork sausage", "meat"), ing(1, "", "crusty bread roll", "bakery"),
        ing(1, "handful", "fresh parsley, finely chopped", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(3, "tbsp", "olive oil", "store"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(0.25, "", "red onion, finely sliced", "produce")
      ],
      steps: [
        "Finely chop the parsley and garlic and mix with the red wine vinegar, olive oil, oregano and chilli flakes to make a chimichurri. Season to taste.",
        "Butterfly the sausage lengthways and grill or fry over medium heat for 8–10 minutes, turning, until cooked through and charred at the edges.",
        "Split the bread roll and warm briefly in the pan.",
        "Fill the roll with the sausage, spoon over plenty of chimichurri, and top with the sliced red onion."
      ]
    },
    {
      id: "d262", title: "Dutch-Style Herring Salad with Pickled Onion and Apple", tags: ["quick", "fish"], cuisine: "Netherlands", protein: "fish",
      prep: 7, cook: 12,
      ingredients: [
        ing(120, "g", "soused herring fillets", "meat"), ing(0.5, "", "apple, diced", "produce"),
        ing(0.25, "", "red onion, finely sliced", "produce"), ing(2, "", "baby potatoes, boiled and diced", "produce"),
        ing(1, "tbsp", "soured cream", "dairy"), ing(1, "tsp", "Dijon mustard", "store"),
        ing(1, "tsp", "chives, chopped", "produce"), ing(2, "slices", "rye bread", "bakery")
      ],
      steps: [
        "Boil the baby potatoes for 10–12 minutes until tender, then drain and cool slightly before dicing.",
        "Slice the herring fillets into bite-sized pieces.",
        "Mix the soured cream with the Dijon mustard and chives to make a light dressing.",
        "Toss the herring, potato, apple and red onion with the dressing.",
        "Serve piled onto the rye bread."
      ]
    },
    {
      id: "d263", title: "Dutch-Style Chicken Hutspot with Carrot & Onion Mash", tags: ["quick"], cuisine: "Netherlands", protein: "chicken",
      prep: 9, cook: 20,
      ingredients: [
        ing(1, "", "chicken breast", "meat"), ing(250, "g", "potatoes, peeled and chopped", "produce"),
        ing(2, "", "carrots, chopped", "produce"), ing(1, "", "onion, chopped", "produce"),
        ing(20, "g", "butter", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(1, "tsp", "mustard", "store"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Season the chicken breast and pan-fry in the vegetable oil over medium heat for 6–7 minutes per side until cooked through. Rest and slice.",
        "Meanwhile, boil the potatoes, carrots and onion together in salted water for 15–18 minutes until very tender.",
        "Drain well and mash together with the butter, milk and mustard until smooth-ish (a little texture is traditional).",
        "Season the hutspot mash to taste.",
        "Serve the sliced chicken over the carrot and onion mash."
      ]
    },
    {
      id: "d264", title: "Armenian-Style Chicken Khorovats Skewers", tags: ["quick"], cuisine: "Armenia", protein: "chicken",
      prep: 9, cook: 12,
      ingredients: [
        ing(180, "g", "chicken thigh, cut into chunks", "meat"), ing(0.5, "", "onion, cut into wedges", "produce"),
        ing(0.5, "", "red pepper, cut into chunks", "produce"), ing(2, "tbsp", "olive oil", "store"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "dried thyme", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(1, "tbsp", "lemon juice", "produce"),
        ing(1, "handful", "fresh parsley, chopped", "produce"), ing(2, "", "wooden skewers", "store")
      ],
      steps: [
        "Mix the olive oil, garlic, thyme, paprika and lemon juice together and toss with the chicken. Marinate briefly if time allows.",
        "Thread the chicken, onion and pepper alternately onto the skewers.",
        "Grill or griddle over high heat for 5–6 minutes per side until charred and cooked through.",
        "Scatter with chopped parsley before serving."
      ]
    },
    {
      id: "d265", title: "Armenian-Style Trout with Walnut Herb Sauce", tags: ["quick", "fish"], cuisine: "Armenia", protein: "fish",
      prep: 8, cook: 10,
      ingredients: [
        ing(1, "", "trout fillet, about 180g", "meat"), ing(30, "g", "walnuts", "store"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "handful", "fresh coriander or parsley", "produce"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(2, "tbsp", "olive oil", "store"),
        ing(1, "pinch", "chilli flakes", "spice"), ing(1, "tbsp", "plain flour", "store")
      ],
      steps: [
        "Blitz or finely chop the walnuts, garlic and herbs together with the vinegar and 1 tbsp of the olive oil to make a chunky walnut sauce. Season to taste.",
        "Dust the trout fillet lightly in flour.",
        "Heat the remaining oil in a frying pan over medium-high heat and fry the trout, skin-side down, for 3–4 minutes, then flip and cook for 2 minutes more until just cooked through.",
        "Spoon the walnut herb sauce over the trout to serve."
      ]
    },
    {
      id: "d266", title: "Chilean-Style Pork Chop with Pebre Salsa", tags: ["quick"], cuisine: "Chile", protein: "pork",
      prep: 8, cook: 12,
      ingredients: [
        ing(1, "", "pork loin chop", "meat"), ing(1, "", "tomato, finely diced", "produce"),
        ing(0.25, "", "red onion, finely diced", "produce"), ing(1, "", "garlic clove, minced", "produce"),
        ing(0.5, "", "red chilli, finely chopped", "produce"), ing(1, "handful", "fresh coriander, chopped", "produce"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(2, "tbsp", "olive oil", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Mix the tomato, red onion, garlic, chilli and coriander with the red wine vinegar and olive oil to make the pebre salsa. Season and set aside.",
        "Season the pork chop and pan-fry in the vegetable oil over medium-high heat for 4–5 minutes per side until cooked through and golden.",
        "Rest the pork chop for a couple of minutes.",
        "Serve topped with a generous spoonful of pebre salsa."
      ]
    },
    {
      id: "d267", title: "Chilean-Style Porotos Granados Bean & Squash Stew", tags: ["vegetarian", "vegan", "quick"], cuisine: "Chile", protein: "plant-based",
      prep: 9, cook: 20,
      ingredients: [
        ing(400, "g", "borlotti or cannellini beans (tinned), drained", "store"), ing(150, "g", "butternut squash, diced", "produce"),
        ing(80, "g", "sweetcorn kernels", "frozen"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(1, "", "garlic clove, minced", "produce"),
        ing(1, "tsp", "smoked paprika", "spice"), ing(1, "tbsp", "olive oil", "store"),
        ing(200, "ml", "vegetable stock", "store"), ing(1, "handful", "fresh basil, torn", "produce")
      ],
      steps: [
        "Heat the olive oil in a saucepan and sauté the onion, pepper and garlic for 4–5 minutes until softened.",
        "Add the squash, paprika and stock, bring to a simmer, cover and cook for 10–12 minutes until the squash is tender.",
        "Stir in the beans and sweetcorn and simmer for a further 5 minutes until heated through and the stew has thickened slightly.",
        "Season to taste and scatter with torn basil to serve."
      ]
    },
    {
      id: "d268", title: "Senegalese-Style Chicken Yassa with Onions and Lemon", tags: ["quick"], cuisine: "Senegal", protein: "chicken",
      prep: 9, cook: 20,
      ingredients: [
        ing(180, "g", "chicken thigh", "meat"), ing(1, "", "onion, thinly sliced", "produce"),
        ing(1, "", "lemon, juiced", "produce"), ing(1, "tbsp", "Dijon mustard", "store"),
        ing(1, "", "garlic clove, minced", "produce"), ing(0.5, "", "scotch bonnet chilli, finely chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(150, "g", "cooked rice", "store"),
        ing(1, "handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Mix the lemon juice, mustard, garlic and chilli together and toss with the chicken and half the sliced onion. Marinate for 10 minutes if time allows.",
        "Heat the oil in a frying pan over medium-high heat and brown the chicken, 3–4 minutes per side, then remove and set aside.",
        "Add the remaining onion to the pan and cook over medium heat for 8–10 minutes, stirring often, until soft and golden.",
        "Return the chicken and marinade to the pan, cover and simmer for 8–10 minutes until the chicken is cooked through.",
        "Serve over rice, scattered with parsley."
      ]
    },
    {
      id: "d269", title: "Senegalese-Style Beef Mafé Peanut Stew with Rice", tags: ["quick", "spicy"], cuisine: "Senegal", protein: "beef",
      prep: 9, cook: 25,
      ingredients: [
        ing(180, "g", "beef (braising steak), diced", "meat"), ing(2, "tbsp", "smooth peanut butter", "store"),
        ing(200, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(0.5, "tsp", "chilli powder", "spice"), ing(150, "ml", "beef stock", "store"),
        ing(150, "g", "cooked rice", "store"), ing(1, "handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Heat a little oil in a saucepan and brown the beef pieces over medium-high heat for 4–5 minutes.",
        "Add the onion, garlic and ginger and cook for 3–4 minutes until softened.",
        "Stir in the chopped tomatoes, chilli powder and stock, bring to a simmer, cover and cook for 15–18 minutes until the beef is tender.",
        "Stir in the peanut butter until fully dissolved and simmer, uncovered, for a further 3–4 minutes until thickened.",
        "Serve over rice, scattered with coriander."
      ]
    },
    {
      id: "d270", title: "Danish-Style Pan-Fried Plaice with Parsley Butter", tags: ["quick", "fish"], cuisine: "Denmark", protein: "fish",
      prep: 7, cook: 15,
      ingredients: [
        ing(1, "", "plaice fillet, about 180g", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(20, "g", "butter", "dairy"), ing(1, "handful", "fresh parsley, chopped", "produce"),
        ing(0.5, "", "lemon", "produce"), ing(2, "", "baby potatoes, boiled", "produce"),
        ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Boil the baby potatoes for 10–12 minutes until tender, then drain.",
        "Season the flour and dust the plaice fillet lightly all over.",
        "Melt half the butter in a frying pan over medium-high heat and fry the plaice for 2–3 minutes per side until golden and just cooked through. Remove.",
        "Add the remaining butter to the pan, let it foam, then stir in the parsley and a squeeze of lemon.",
        "Pour the parsley butter over the fish and serve with the boiled potatoes."
      ]
    },
    {
      id: "d271", title: "Danish-Style Chicken with Creamed Kale", tags: ["quick"], cuisine: "Denmark", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(1, "", "chicken breast", "meat"), ing(100, "g", "curly kale, chopped", "produce"),
        ing(1, "tbsp", "butter", "dairy"), ing(1, "tbsp", "plain flour", "store"),
        ing(100, "ml", "milk", "dairy"), ing(1, "pinch", "ground nutmeg", "spice"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Season the chicken breast and pan-fry in the vegetable oil over medium heat for 6–7 minutes per side until cooked through. Rest and slice.",
        "Blanch the kale in boiling water for 2–3 minutes, then drain well, squeezing out excess water, and chop finely.",
        "Melt the butter in a small pan, stir in the flour and cook for 1 minute, then gradually whisk in the milk to make a smooth sauce.",
        "Stir the kale into the sauce with a pinch of nutmeg and simmer for 2–3 minutes until thickened.",
        "Serve the sliced chicken with the creamed kale."
      ]
    },
    {
      id: "d272", title: "Puerto Rican-Style Pollo Guisado Chicken Stew", tags: ["quick"], cuisine: "Puerto Rico", protein: "chicken",
      prep: 9, cook: 25,
      ingredients: [
        ing(180, "g", "chicken thigh, diced", "meat"), ing(0.25, "", "onion, diced", "produce"),
        ing(0.25, "", "green pepper, diced", "produce"), ing(1, "", "garlic clove, minced", "produce"),
        ing(1, "tbsp", "tomato purée", "store"), ing(150, "ml", "chicken stock", "store"),
        ing(1, "", "small potato, diced", "produce"), ing(1, "handful", "green olives", "store"),
        ing(1, "tsp", "dried oregano", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Heat the olive oil in a saucepan and brown the chicken pieces over medium-high heat for 3–4 minutes.",
        "Add the onion, pepper and garlic and cook for 3–4 minutes until softened.",
        "Stir in the tomato purée, oregano and cumin, cook for 1 minute, then add the stock and potato.",
        "Bring to a simmer, cover and cook for 15–18 minutes until the potato and chicken are cooked through.",
        "Stir in the olives, season to taste, and scatter with coriander to serve."
      ]
    },
    {
      id: "d273", title: "Puerto Rican-Style Codfish Fritters (Bacalaitos-Inspired)", tags: ["quick", "fish"], cuisine: "Puerto Rico", protein: "fish",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "cod fillet, flaked", "meat"), ing(80, "g", "plain flour", "store"),
        ing(0.5, "tsp", "baking powder", "store"), ing(1, "", "garlic clove, minced", "produce"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce"), ing(100, "ml", "water", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(4, "tbsp", "vegetable oil, for frying", "store"),
        ing(0.5, "", "lime", "produce")
      ],
      steps: [
        "Poach or steam the cod for 4–5 minutes until just cooked, then flake into small pieces.",
        "Whisk the flour, baking powder, cumin and water together to make a thick batter, and season well.",
        "Stir the flaked cod, garlic and coriander into the batter.",
        "Heat a shallow layer of vegetable oil in a frying pan over medium-high heat and spoon in the batter to form 3–4 fritters. Fry for 2–3 minutes per side until golden and crisp.",
        "Drain briefly on kitchen paper and serve with a squeeze of lime."
      ]
    },
    {
      id: "d274", title: "Goan Pork Vindaloo with Rice", tags: ["spicy"], cuisine: "India", protein: "pork",
      prep: 8, cook: 25,
      ingredients: [
        ing(180, "g", "pork shoulder, diced", "meat"), ing(2, "tbsp", "vindaloo curry paste", "store"),
        ing(1, "tbsp", "malt vinegar", "store"), ing(1, "", "onion, sliced", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "tsp", "ground cumin", "spice"), ing(1, "", "tomato, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(120, "g", "basmati rice", "store"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Toss the pork with the vindaloo paste and vinegar in a bowl and set aside to marinate while you prep everything else.",
        "Heat the oil in a pan and fry the onion for 5 minutes until soft, then add the garlic and ginger and cook for 1 minute.",
        "Add the pork and cook for 3–4 minutes until browned all over.",
        "Stir in the tomato, cumin and 100ml water. Cover and simmer for 15–18 minutes until the pork is tender, stirring occasionally and topping up with a splash of water if it looks dry.",
        "Meanwhile, cook the rice according to the packet instructions.",
        "Serve the vindaloo over the rice, scattered with coriander."
      ]
    },
    {
      id: "d275", title: "Bengali Mustard Fish (Shorshe Maach)", tags: ["quick", "fish"], cuisine: "India", protein: "fish",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "white fish fillet (e.g. pollock or basa)", "meat"), ing(1, "tbsp", "black mustard seeds", "spice"),
        ing(1, "tsp", "yellow mustard powder", "spice"), ing(2, "", "green chillies, sliced", "produce"),
        ing(0.5, "tsp", "turmeric", "spice"), ing(2, "tbsp", "mustard oil (or vegetable oil)", "store"),
        ing(120, "g", "basmati rice", "store"), ing(null, "pinch", "salt", "spice")
      ],
      steps: [
        "Grind the mustard seeds, mustard powder, one chilli and a splash of water into a smooth paste using a pestle and mortar or small blender.",
        "Rub the fish with turmeric and a pinch of salt.",
        "Heat the mustard oil in a pan until hot, then fry the fish for 2 minutes on each side until lightly coloured. Remove and set aside.",
        "Add the mustard paste to the pan with 100ml water and the remaining chilli, and simmer for 3 minutes.",
        "Return the fish to the pan, spoon the sauce over and simmer gently for 4–5 minutes until cooked through.",
        "Cook the rice according to the packet instructions and serve alongside the fish."
      ]
    },
    {
      id: "d276", title: "Chettinad Chicken with Curry Leaves", tags: ["spicy", "quick"], cuisine: "India", protein: "chicken",
      prep: 9, cook: 18,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(0.5, "tsp", "mustard seeds", "spice"), ing(10, "", "fresh curry leaves", "produce"),
        ing(1, "", "onion, finely sliced", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(2, "", "dried red chillies", "spice"),
        ing(1, "tsp", "ground coriander", "spice"), ing(0.5, "tsp", "fennel seeds, crushed", "spice"),
        ing(0.5, "tsp", "black peppercorns, crushed", "spice"), ing(1, "", "tomato, chopped", "produce"),
        ing(120, "g", "basmati rice", "store")
      ],
      steps: [
        "Heat the oil in a pan and splutter the mustard seeds and curry leaves for 30 seconds.",
        "Add the onion and cook for 5 minutes until golden, then add the garlic, ginger and dried chillies and cook for 1 minute.",
        "Stir in the coriander, fennel, pepper and chicken, and cook for 4–5 minutes until browned.",
        "Add the chopped tomato and 100ml water, cover and simmer for 10–12 minutes until the chicken is cooked through and the sauce has thickened.",
        "Meanwhile cook the rice according to the packet instructions.",
        "Serve the chicken over the rice."
      ]
    },
    {
      id: "d277", title: "Gujarati Chickpea Flour Kadhi with Rice", tags: ["vegetarian", "quick"], cuisine: "India", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(150, "g", "natural yoghurt", "dairy"), ing(2, "tbsp", "gram (chickpea) flour", "store"),
        ing(0.5, "tsp", "turmeric", "spice"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "", "green chilli, chopped", "produce"), ing(0.5, "tsp", "mustard seeds", "spice"),
        ing(0.25, "tsp", "cumin seeds", "spice"), ing(null, "pinch", "asafoetida", "spice"),
        ing(6, "", "fresh curry leaves", "produce"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(1, "tsp", "sugar", "store"), ing(1, "tbsp", "fresh coriander, chopped", "produce"),
        ing(120, "g", "basmati rice", "store")
      ],
      steps: [
        "Whisk the yoghurt with the gram flour, turmeric and 200ml water until completely smooth.",
        "Heat the oil in a pan and splutter the mustard and cumin seeds, then add the curry leaves, asafoetida, ginger and chilli.",
        "Pour in the yoghurt mixture and bring to a gentle simmer, stirring constantly so it doesn't split. Stir in the sugar.",
        "Simmer for 8–10 minutes, stirring often, until slightly thickened.",
        "Meanwhile cook the rice according to the packet instructions.",
        "Serve the kadhi over the rice, scattered with coriander."
      ]
    },
    {
      id: "d278", title: "Pork Carnitas Bowl with Pineapple Salsa", tags: ["quick"], cuisine: "Mexico", protein: "pork",
      prep: 8, cook: 20,
      ingredients: [
        ing(180, "g", "pork shoulder, diced", "meat"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(1, "", "orange, juiced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(80, "g", "tinned pineapple chunks, drained and chopped", "store"), ing(0.5, "", "red onion, finely diced", "produce"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce"), ing(1, "", "lime", "produce"),
        ing(100, "g", "cooked rice", "store"), ing(null, "pinch", "chilli flakes", "spice")
      ],
      steps: [
        "Toss the pork with the cumin, oregano, garlic and orange juice.",
        "Heat the oil in a pan and fry the pork over medium-high heat for 12–15 minutes, turning occasionally, until browned and cooked through. Shred with two forks.",
        "Meanwhile mix the pineapple, red onion, coriander, a squeeze of lime juice and chilli flakes for the salsa.",
        "Warm the rice.",
        "Serve the shredded pork over the rice, topped with the pineapple salsa and remaining lime wedges."
      ]
    },
    {
      id: "d279", title: "Chicken Mole Poblano-Style", tags: ["spicy"], cuisine: "Mexico", protein: "chicken",
      prep: 9, cook: 20,
      ingredients: [
        ing(180, "g", "chicken breast", "meat"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tbsp", "mole paste (or 1 tbsp chilli powder blended with the cocoa below)", "store"),
        ing(1, "tsp", "chilli powder", "spice"), ing(0.5, "tsp", "ground cinnamon", "spice"),
        ing(1, "tsp", "smooth peanut butter", "store"), ing(150, "ml", "chicken stock", "store"),
        ing(1, "tsp", "cocoa powder", "store"), ing(100, "g", "basmati rice", "store"),
        ing(1, "tsp", "sesame seeds", "spice")
      ],
      steps: [
        "Season the chicken and fry in the oil for 3–4 minutes on each side until browned. Remove and set aside.",
        "Soften the onion and garlic in the same pan for 4 minutes.",
        "Stir in the mole paste (or chilli powder), cinnamon, peanut butter and stock, and simmer for 3 minutes.",
        "Return the chicken to the pan, cover and simmer for 10–12 minutes until cooked through, stirring in the cocoa powder to deepen the sauce.",
        "Cook the rice according to the packet instructions.",
        "Slice the chicken, spoon the sauce over and scatter with sesame seeds. Serve with the rice."
      ]
    },
    {
      id: "d280", title: "Huevos Rancheros with Refried Beans", tags: ["vegetarian", "quick"], cuisine: "Mexico", protein: "plant-based",
      prep: 7, cook: 12,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(2, "", "small corn tortillas", "bakery"), ing(200, "g", "tinned chopped tomatoes", "store"),
        ing(0.5, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(0.5, "tsp", "chilli powder", "spice"), ing(120, "g", "tinned refried beans", "store"),
        ing(30, "g", "cheese, grated", "dairy"), ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Heat half the oil and soften the onion and garlic for 4 minutes. Add the tomatoes and chilli powder, and simmer for 8 minutes to a thick sauce.",
        "Meanwhile warm the refried beans in a small pan with a splash of water.",
        "Warm the tortillas in a dry pan.",
        "Fry the eggs in the remaining oil to your liking.",
        "Spread the beans over the tortillas, top with the tomato sauce, fried eggs, cheese and coriander."
      ]
    },
    {
      id: "d281", title: "Beef Birria Tacos with Consommé", tags: ["spicy"], cuisine: "Mexico", protein: "beef",
      prep: 9, cook: 30,
      ingredients: [
        ing(180, "g", "beef shin or brisket, diced", "meat"), ing(1, "tbsp", "chipotle paste", "store"),
        ing(1, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "dried oregano", "spice"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "", "onion, chopped", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(300, "ml", "beef stock", "store"),
        ing(3, "", "small corn tortillas", "bakery"), ing(40, "g", "cheese, grated", "dairy"),
        ing(1, "", "lime, cut into wedges", "produce"), ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Brown the beef in a hot, dry pan for 3–4 minutes.",
        "Add the chipotle paste, cumin, oregano, garlic, onion, tomato and stock. Cover and simmer for 20–25 minutes until the beef is tender, topping up with water if needed.",
        "Shred the beef in the sauce, keeping some of the broth aside as a consommé for dipping.",
        "Dip the tortillas in a little of the fat from the top of the broth, fill with beef and cheese, fold and fry in a dry pan for 1–2 minutes each side until crisp.",
        "Serve the tacos with the reserved consommé for dipping, lime wedges and coriander."
      ]
    },
    {
      id: "d282", title: "Spanish Albóndigas in Almond-Tomato Sauce", tags: ["quick"], cuisine: "Spain", protein: "pork",
      prep: 9, cook: 20,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1, "tbsp", "breadcrumbs", "bakery"),
        ing(1, "tbsp", "milk", "dairy"), ing(1, "", "small egg", "dairy"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tbsp", "fresh parsley, chopped", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(200, "g", "tinned chopped tomatoes", "store"), ing(1, "tbsp", "flaked almonds", "store"),
        ing(null, "pinch", "smoked paprika", "spice"), ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Soak the breadcrumbs in the milk, then mix with the pork mince, egg, half the garlic and the parsley. Shape into small meatballs.",
        "Heat half the oil and brown the meatballs all over, 4–5 minutes. Remove and set aside.",
        "Add the remaining oil and soften the onion and remaining garlic for 4 minutes, then stir in the paprika, tomatoes and almonds. Simmer for 5 minutes.",
        "Return the meatballs to the sauce, cover and simmer for 8–10 minutes until cooked through.",
        "Serve with the crusty bread."
      ]
    },
    {
      id: "d283", title: "Catalan-Style Chicken with Almonds and Sherry", tags: [], cuisine: "Spain", protein: "chicken",
      prep: 8, cook: 22,
      ingredients: [
        ing(200, "g", "chicken thighs", "meat"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(50, "ml", "dry sherry (or dry white wine)", "store"), ing(150, "ml", "chicken stock", "store"),
        ing(1, "tbsp", "flaked almonds", "store"), ing(1, "", "slice bread, torn", "bakery"),
        ing(1, "tsp", "fresh parsley, chopped", "produce"), ing(1, "", "bay leaf", "spice")
      ],
      steps: [
        "Heat the oil in a pan and brown the chicken all over, 5–6 minutes. Remove and set aside.",
        "Soften the onion and garlic in the same pan for 4 minutes.",
        "Add the almonds and torn bread and toast for 1–2 minutes, then pour in the sherry and let it bubble for 1 minute.",
        "Add the stock and bay leaf, return the chicken to the pan, cover and simmer for 15–18 minutes until the chicken is cooked through.",
        "Mash some of the almonds and bread into the sauce with a fork to thicken slightly, stir through the parsley and serve."
      ]
    },
    {
      id: "d284", title: "Spanish White Bean & Spinach Stew (Potaje)", tags: ["vegetarian", "vegan", "quick"], cuisine: "Spain", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "onion, chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "", "red pepper, chopped", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(1, "tsp", "ground cumin", "spice"),
        ing(200, "g", "tinned butter beans, drained", "store"), ing(100, "g", "tinned chopped tomatoes", "store"),
        ing(80, "g", "spinach", "produce"), ing(150, "ml", "vegetable stock", "store"),
        ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Heat the oil and soften the onion, garlic and pepper for 5 minutes.",
        "Stir in the paprika and cumin and cook for 30 seconds.",
        "Add the tomatoes, butter beans and stock, and simmer for 10 minutes.",
        "Stir in the spinach and cook for 2–3 minutes until wilted.",
        "Serve with the crusty bread."
      ]
    },
    {
      id: "d285", title: "Bacalhau à Brás-Style Salt Cod with Potato and Egg", tags: ["fish", "quick"], cuisine: "Portugal", protein: "fish",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "skinless white fish fillet", "meat"), ing(150, "g", "potatoes, cut into thin matchsticks", "produce"),
        ing(2, "tbsp", "olive oil", "store"), ing(0.5, "", "onion, thinly sliced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(2, "", "eggs, beaten", "dairy"),
        ing(1, "tbsp", "black olives", "store"), ing(1, "tbsp", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Fry the potato matchsticks in 1 tbsp of the oil over medium heat for 8–10 minutes until golden and tender. Drain on paper and set aside.",
        "Poach or pan-fry the fish for 3–4 minutes until just cooked, then flake into pieces.",
        "In the same pan, heat the remaining oil and soften the onion and garlic for 5 minutes.",
        "Add the flaked fish and fried potatoes to the pan, then pour in the beaten eggs.",
        "Stir gently over low heat for 1–2 minutes until the eggs are just set but still creamy, taking care not to scramble too far.",
        "Scatter with olives and parsley to serve."
      ]
    },
    {
      id: "d286", title: "Caldo Verde with Chorizo", tags: ["quick"], cuisine: "Portugal", protein: "pork",
      prep: 8, cook: 20,
      ingredients: [
        ing(1, "", "large potato, peeled and chopped", "produce"), ing(400, "ml", "vegetable stock", "store"),
        ing(60, "g", "chorizo, sliced", "meat"), ing(80, "g", "kale, finely shredded", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "", "garlic clove, crushed", "produce")
      ],
      steps: [
        "Simmer the potato and garlic in the stock for 12–15 minutes until very soft.",
        "Mash the potato in the pan to thicken the soup, or blitz briefly with a stick blender.",
        "Meanwhile fry the chorizo slices in a dry pan for 2–3 minutes until crisp. Set half aside for topping.",
        "Add the remaining chorizo and its oil to the soup, then stir in the shredded kale and simmer for 3–4 minutes until tender.",
        "Ladle into a bowl, top with the reserved crispy chorizo and a drizzle of olive oil."
      ]
    },
    {
      id: "d287", title: "Kuku Sabzi (Persian Herb Frittata)", tags: ["vegetarian", "quick"], cuisine: "Iran", protein: "plant-based",
      prep: 9, cook: 12,
      ingredients: [
        ing(3, "", "eggs", "dairy"), ing(1, "handful", "fresh parsley, chopped", "produce"),
        ing(1, "handful", "fresh coriander, chopped", "produce"), ing(1, "small handful", "fresh dill, chopped", "produce"),
        ing(2, "", "spring onions, chopped", "produce"), ing(0.5, "tsp", "turmeric", "spice"),
        ing(1, "tbsp", "plain flour", "store"), ing(1, "tbsp", "chopped walnuts", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(null, "pinch", "salt", "spice")
      ],
      steps: [
        "Whisk the eggs with the turmeric and flour until smooth.",
        "Stir in all the chopped herbs, spring onions and walnuts.",
        "Heat the oil in a small non-stick pan over medium heat and pour in the mixture.",
        "Cook for 4–5 minutes until the base is set and golden, then flip using a plate, or finish under the grill for 3–4 minutes until fully set.",
        "Slide onto a plate, cut into wedges and serve warm or at room temperature."
      ]
    },
    {
      id: "d288", title: "Fesenjan-Style Chicken with Pomegranate and Walnut", tags: [], cuisine: "Iran", protein: "chicken",
      prep: 8, cook: 22,
      ingredients: [
        ing(180, "g", "chicken thighs", "meat"), ing(40, "g", "walnuts, finely ground", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(0.5, "", "onion, chopped", "produce"),
        ing(2, "tbsp", "pomegranate molasses", "store"), ing(150, "ml", "chicken stock", "store"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(null, "pinch", "sugar", "store"),
        ing(1, "tbsp", "pomegranate seeds", "produce"), ing(100, "g", "basmati rice", "store")
      ],
      steps: [
        "Heat the oil in a pan and brown the chicken pieces all over, 4–5 minutes. Remove and set aside.",
        "Soften the onion in the same pan for 4 minutes.",
        "Add the ground walnuts and toast for 1–2 minutes, then stir in the stock, pomegranate molasses and cinnamon.",
        "Return the chicken to the pan, cover and simmer for 15 minutes until cooked through and the sauce is thick and glossy, adding a pinch of sugar to balance if needed.",
        "Cook the rice according to the packet instructions.",
        "Serve the chicken and sauce over the rice, scattered with pomegranate seeds."
      ]
    },
    {
      id: "d289", title: "Turkish Menemen with Feta and Crusty Bread", tags: ["vegetarian", "quick"], cuisine: "Turkey", protein: "plant-based",
      prep: 7, cook: 10,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.5, "", "green pepper, sliced", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(30, "g", "feta, crumbled", "dairy"), ing(1, "tbsp", "fresh parsley, chopped", "produce"),
        ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Heat the oil and soften the onion and pepper for 5 minutes.",
        "Add the tomato and chilli flakes, and cook for 4–5 minutes until softened and saucy.",
        "Beat the eggs lightly and pour into the pan, stirring gently until just set but still soft, about 2–3 minutes.",
        "Scatter with feta and parsley.",
        "Serve with the crusty bread."
      ]
    },
    {
      id: "d290", title: "Turkish Beef Köfte with Garlic Yoghurt and Sumac", tags: ["quick"], cuisine: "Turkey", protein: "beef",
      prep: 9, cook: 12,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, grated", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(1, "tbsp", "fresh parsley, chopped", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(100, "g", "natural yoghurt", "dairy"),
        ing(0.5, "", "garlic clove, crushed, extra", "produce"), ing(0.5, "tsp", "sumac", "spice"),
        ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Mix the beef mince with the grated onion, garlic, cumin, cinnamon and parsley, and shape into 4–5 oval köfte.",
        "Heat the oil in a pan and fry the köfte for 8–10 minutes, turning occasionally, until browned and cooked through.",
        "Meanwhile mix the yoghurt with the extra garlic and a pinch of salt.",
        "Warm the flatbread.",
        "Serve the köfte on the flatbread with the garlic yoghurt, dusted with sumac."
      ]
    },
    {
      id: "d291", title: "Ethiopian Beef Tibs with Peppers and Rosemary", tags: ["spicy", "quick"], cuisine: "Ethiopia", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(180, "g", "beef sirloin, thinly sliced", "meat"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "green pepper, sliced", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "sprig", "fresh rosemary", "produce"),
        ing(0.5, "tsp", "berbere spice blend", "spice"), ing(1, "", "tomato, chopped", "produce"),
        ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Heat the oil in a hot pan or wok and sear the beef strips for 2–3 minutes until browned. Remove and set aside.",
        "Add the onion and peppers to the pan and cook for 4–5 minutes until softened and starting to char.",
        "Add the garlic, ginger, rosemary and berbere, and cook for 1 minute.",
        "Return the beef to the pan with the tomato, toss together and cook for 2–3 minutes until the beef is cooked through.",
        "Serve with warm flatbread."
      ]
    },
    {
      id: "d292", title: "Ethiopian Shiro Wat (Spiced Chickpea Flour Stew)", tags: ["vegan", "vegetarian", "spicy"], cuisine: "Ethiopia", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(3, "tbsp", "gram (chickpea) flour", "store"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, finely chopped", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "berbere spice blend", "spice"),
        ing(1, "", "tomato, chopped", "produce"), ing(250, "ml", "vegetable stock", "store"),
        ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Heat the oil and cook the onion for 5–6 minutes until soft and golden.",
        "Add the garlic, ginger and berbere, and cook for 1 minute until fragrant.",
        "Stir in the chopped tomato and cook for 2 minutes.",
        "Whisk the gram flour with a splash of the stock to make a smooth paste, then stir into the pan with the remaining stock.",
        "Simmer for 6–8 minutes, stirring often, until thickened to a smooth, glossy stew.",
        "Serve with warm flatbread for scooping."
      ]
    },
    {
      id: "d293", title: "Israeli-Style Sabich Pitta with Potato, Egg and Amba", tags: ["vegetarian", "quick"], cuisine: "Israel", protein: "plant-based",
      prep: 9, cook: 12,
      ingredients: [
        ing(1, "", "potato, sliced", "produce"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(1, "", "egg", "dairy"), ing(1, "", "pitta bread", "bakery"),
        ing(2, "tbsp", "hummus", "store"), ing(1, "tbsp", "amba (pickled mango sauce) or mango chutney with a squeeze of lemon", "store"),
        ing(1, "handful", "cabbage, shredded", "produce"), ing(1, "tbsp", "tahini", "store"),
        ing(1, "tbsp", "pickled cucumber, chopped", "produce")
      ],
      steps: [
        "Fry the sliced potato in the oil over medium heat for 8–10 minutes, turning, until golden and tender.",
        "Boil the egg for 8 minutes for a firm yolk, then cool, peel and slice.",
        "Warm the pitta and split it open.",
        "Spread hummus inside the pitta and fill with the fried potato, sliced egg and shredded cabbage.",
        "Drizzle with tahini and amba (or mango chutney with lemon) and scatter over the chopped pickled cucumber."
      ]
    },
    {
      id: "d294", title: "Israeli-Style Za'atar Baked Salmon with Tahini", tags: ["fish", "quick"], cuisine: "Israel", protein: "fish",
      prep: 6, cook: 14,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tbsp", "za'atar", "spice"), ing(1, "tbsp", "tahini", "store"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "handful", "cherry tomatoes", "produce"), ing(100, "g", "couscous", "store")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C).",
        "Rub the salmon with the oil and za'atar and place on a tray with the cherry tomatoes.",
        "Bake for 12–14 minutes until the salmon flakes easily and the tomatoes have softened.",
        "Meanwhile mix the tahini with the garlic, a squeeze of lemon juice and enough water to loosen to a drizzling consistency.",
        "Cook the couscous according to the packet instructions and serve alongside the salmon and tomatoes, drizzled with the tahini sauce."
      ]
    },
    {
      id: "d295", title: "Sri Lankan-Style Devilled Chicken", tags: ["spicy", "quick"], cuisine: "Sri Lanka", protein: "chicken",
      prep: 9, cook: 15,
      ingredients: [
        ing(180, "g", "chicken breast, diced", "meat"), ing(0.5, "tsp", "curry powder", "spice"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(0.5, "", "green pepper, sliced", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "", "green chilli, sliced", "produce"), ing(1, "tbsp", "tomato ketchup", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(100, "g", "basmati rice", "store")
      ],
      steps: [
        "Toss the chicken with the curry powder and a pinch of salt.",
        "Heat the oil in a wok or frying pan and stir-fry the chicken for 5–6 minutes until browned and cooked through. Remove and set aside.",
        "Add the onion and peppers to the pan and stir-fry for 4–5 minutes until slightly charred at the edges.",
        "Add the garlic, ginger and chilli, and cook for 1 minute.",
        "Return the chicken to the pan with the ketchup, soy sauce and chilli flakes, tossing to coat well. Cook for 2 minutes.",
        "Cook the rice according to the packet instructions and serve hot alongside."
      ]
    },
    {
      id: "d296", title: "Sri Lankan-Style Black Pepper Beef Curry", tags: ["spicy"], cuisine: "Sri Lanka", protein: "beef",
      prep: 8, cook: 25,
      ingredients: [
        ing(180, "g", "stewing beef, diced", "meat"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "black peppercorns, coarsely crushed", "spice"),
        ing(0.5, "tsp", "ground coriander", "spice"), ing(0.25, "tsp", "turmeric", "spice"),
        ing(1, "sprig", "fresh curry leaves", "produce"), ing(150, "ml", "coconut milk", "store"),
        ing(100, "g", "basmati rice", "store")
      ],
      steps: [
        "Heat the oil and brown the beef in batches, 4–5 minutes. Remove and set aside.",
        "Soften the onion, garlic, ginger and curry leaves in the same pan for 5 minutes.",
        "Stir in the black pepper, coriander and turmeric, and cook for 1 minute.",
        "Return the beef to the pan with the coconut milk and 100ml water. Cover and simmer for 18–20 minutes until the beef is tender, stirring occasionally.",
        "Uncover and simmer for a further 3–4 minutes to thicken slightly.",
        "Cook the rice according to the packet instructions and serve alongside."
      ]
    },
    {
      id: "d297", title: "Swedish Pytt i Panna with Fried Egg", tags: ["quick"], cuisine: "Sweden", protein: "pork",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "cooked potatoes, diced", "produce"), ing(100, "g", "cooked ham, diced", "meat"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "chopped pickled beetroot", "store"),
        ing(1, "tbsp", "fresh chives, chopped", "produce")
      ],
      steps: [
        "Melt the butter in a frying pan and fry the diced potato for 6–8 minutes until golden and crisp, stirring occasionally.",
        "Add the onion and diced ham and cook for a further 5 minutes until the onion is soft and everything is heated through and lightly crisp.",
        "In a separate small pan, fry the egg to your liking.",
        "Pile the hash onto a plate and top with the fried egg.",
        "Serve with the pickled beetroot and a scatter of chives."
      ]
    },
    {
      id: "d298", title: "Swedish Kalops-Style Beef and Root Vegetable Stew", tags: [], cuisine: "Sweden", protein: "beef",
      prep: 9, cook: 30,
      ingredients: [
        ing(180, "g", "stewing beef, diced", "meat"), ing(1, "tbsp", "butter", "dairy"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(4, "", "whole allspice berries", "spice"), ing(1, "", "bay leaf", "spice"),
        ing(200, "ml", "beef stock", "store"), ing(1, "tsp", "plain flour", "store"),
        ing(150, "g", "potatoes, boiled", "produce"), ing(2, "tbsp", "pickled beetroot", "store")
      ],
      steps: [
        "Melt the butter in a pan and brown the beef in batches, 4–5 minutes. Remove and set aside.",
        "Soften the onion and carrot in the same pan for 5 minutes.",
        "Stir the flour into the vegetables, then gradually add the stock, stirring to avoid lumps.",
        "Return the beef to the pan with the allspice and bay leaf. Cover and simmer for 20–25 minutes until the beef is tender.",
        "Meanwhile boil the potatoes until tender.",
        "Serve the stew with the boiled potatoes and pickled beetroot."
      ]
    },
    {
      id: "d299", title: "Australian-Style Chicken Parmigiana", tags: ["quick"], cuisine: "Australia", protein: "chicken",
      prep: 9, cook: 18,
      ingredients: [
        ing(180, "g", "chicken breast, butterflied", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(40, "g", "breadcrumbs", "bakery"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(3, "tbsp", "tomato passata", "store"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(30, "g", "mozzarella, sliced", "dairy"),
        ing(1, "handful", "salad leaves", "produce")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C).",
        "Coat the chicken breast in flour, then beaten egg, then breadcrumbs.",
        "Heat the oil in an ovenproof pan and fry the chicken for 3 minutes each side until golden.",
        "Mix the passata with the oregano and spread over the chicken, then top with the mozzarella.",
        "Transfer to the oven and bake for 8–10 minutes until the chicken is cooked through and the cheese is melted and bubbling.",
        "Serve with a side salad."
      ]
    },
    {
      id: "d300", title: "Australian-Style Beef and Beetroot Burger", tags: ["quick"], cuisine: "Australia", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "tsp", "salt and pepper", "spice"),
        ing(1, "", "burger bun", "bakery"), ing(1, "", "slice cooked beetroot", "store"),
        ing(1, "", "slice cheese", "dairy"), ing(1, "tsp", "mayonnaise", "store"),
        ing(1, "tsp", "tomato ketchup", "store"), ing(1, "", "lettuce leaf", "produce"),
        ing(1, "", "slice tomato", "produce"), ing(0.5, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Shape the beef mince into a patty and season well.",
        "Heat the oil in a pan and fry the patty for 4–5 minutes each side until cooked through, topping with the cheese slice for the last minute to melt.",
        "Toast the burger bun cut-side down in the same pan for 1 minute.",
        "Spread the bun with mayonnaise and ketchup.",
        "Build the burger with the lettuce, the patty and cheese, and a slice of beetroot and tomato."
      ]
    },
    {
      id: "d301", title: "South African-Style Boerewors with Pap and Chakalaka", tags: ["spicy"], cuisine: "South Africa", protein: "beef",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "boerewors sausage (or good pork sausage)", "meat"), ing(60, "g", "maize meal", "store"),
        ing(200, "ml", "water", "store"), ing(1, "tbsp", "butter", "dairy"),
        ing(0.5, "", "onion, sliced", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "carrot, grated", "produce"), ing(1, "tsp", "curry powder", "spice"),
        ing(100, "g", "tinned chopped tomatoes", "store"), ing(null, "pinch", "chilli flakes", "spice"),
        ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Grill or fry the sausage over medium heat for 12–15 minutes, turning occasionally, until cooked through and browned.",
        "Meanwhile bring the water to the boil, whisk in the maize meal and cook for 5–6 minutes, stirring, until thick. Stir in the butter.",
        "For the chakalaka, heat the oil and soften the onion, pepper and carrot for 5–6 minutes.",
        "Stir in the curry powder and chilli flakes, cook for 1 minute, then add the tomatoes and simmer for 5 minutes.",
        "Serve the sausage with the pap and chakalaka spooned alongside."
      ]
    },
    {
      id: "d302", title: "South African-Style Cape Malay Fish Curry", tags: ["quick"], cuisine: "South Africa", protein: "fish",
      prep: 8, cook: 18,
      ingredients: [
        ing(180, "g", "white fish fillet, cut into chunks", "meat"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "curry powder", "spice"),
        ing(0.5, "tsp", "turmeric", "spice"), ing(1, "tbsp", "apricot jam", "store"),
        ing(1, "tbsp", "lemon juice", "produce"), ing(1, "", "bay leaf", "spice"),
        ing(150, "ml", "coconut milk", "store"), ing(100, "g", "basmati rice", "store")
      ],
      steps: [
        "Heat the oil and soften the onion and garlic for 5 minutes.",
        "Stir in the ginger, curry powder and turmeric, and cook for 1 minute.",
        "Add the apricot jam, lemon juice, bay leaf and coconut milk, and simmer for 5 minutes.",
        "Add the fish chunks and simmer gently for 6–8 minutes until just cooked through.",
        "Cook the rice according to the packet instructions and serve alongside."
      ]
    },
    {
      id: "d303", title: "Ukrainian-Style Chicken Kyiv", tags: ["quick"], cuisine: "Ukraine", protein: "chicken",
      prep: 9, cook: 18,
      ingredients: [
        ing(180, "g", "chicken breast, butterflied and flattened", "meat"), ing(30, "g", "butter, softened", "dairy"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "fresh parsley, chopped", "produce"),
        ing(2, "tbsp", "plain flour", "store"), ing(1, "", "egg, beaten", "dairy"),
        ing(40, "g", "breadcrumbs", "bakery"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(1, "handful", "green salad leaves", "produce")
      ],
      steps: [
        "Mix the softened butter with the garlic and parsley, roll into a small log and chill in the freezer for 5 minutes to firm up.",
        "Place the butter in the centre of the flattened chicken breast and roll up tightly to enclose it, securing with a cocktail stick.",
        "Coat the chicken parcel in flour, then beaten egg, then breadcrumbs.",
        "Heat the oil in an ovenproof pan and brown the chicken on all sides, 3–4 minutes.",
        "Transfer to a 200C (fan 180C) oven for 10–12 minutes until cooked through.",
        "Rest for 2 minutes before cutting, and serve with a green salad."
      ]
    },
    {
      id: "d304", title: "Ukrainian-Style Varenyky (Potato and Cheese Dumplings)", tags: ["vegetarian", "quick"], cuisine: "Ukraine", protein: "plant-based",
      prep: 10, cook: 12,
      ingredients: [
        ing(8, "", "ready-made dumpling or wonton wrappers", "bakery"), ing(100, "g", "mashed potato", "produce"),
        ing(30, "g", "curd cheese", "dairy"), ing(0.5, "", "small onion, finely diced", "produce"),
        ing(1, "tbsp", "butter", "dairy"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "fresh chives, chopped", "produce")
      ],
      steps: [
        "Mix the mashed potato with the curd cheese and a little of the diced onion to make the filling.",
        "Place a spoonful of filling in the centre of each wrapper, dampen the edges with water and fold into a half-moon, pressing to seal.",
        "Bring a pan of water to a gentle boil and cook the dumplings for 3–4 minutes until they float and are cooked through.",
        "Meanwhile melt the butter in a small pan and fry the remaining onion for 4–5 minutes until golden.",
        "Drain the dumplings, toss through the buttery onion, and serve with soured cream and chives."
      ]
    },
    {
      id: "d305", title: "Trinidadian-Style Beef Pelau", tags: ["quick"], cuisine: "Trinidad", protein: "beef",
      prep: 9, cook: 25,
      ingredients: [
        ing(150, "g", "stewing beef, diced", "meat"), ing(1, "tbsp", "brown sugar", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(0.5, "", "onion, chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "dried thyme", "spice"),
        ing(1, "", "green chilli, chopped", "produce"), ing(100, "g", "basmati rice", "store"),
        ing(100, "g", "tinned pigeon peas, drained", "store"), ing(200, "ml", "coconut milk", "store"),
        ing(0.5, "", "carrot, diced", "produce")
      ],
      steps: [
        "Heat the oil in a pot until hot, add the sugar and let it caramelise to a dark brown, 1–2 minutes, watching closely so it doesn't burn.",
        "Add the beef immediately and stir to coat in the caramel, browning for 2–3 minutes.",
        "Add the onion, garlic, thyme and chilli, and cook for 3 minutes.",
        "Stir in the rice, peas and carrot, then pour in the coconut milk and 100ml water.",
        "Cover and simmer for 18–20 minutes until the rice and beef are tender, stirring once halfway through."
      ]
    },
    {
      id: "d306", title: "Trinidadian-Style Fried Fish Bake with Tamarind Sauce", tags: ["fish", "quick"], cuisine: "Trinidad", protein: "fish",
      prep: 9, cook: 12,
      ingredients: [
        ing(150, "g", "firm white fish fillet (e.g. pollock or coley)", "meat"), ing(60, "g", "self-raising flour", "store"),
        ing(0.25, "tsp", "baking powder", "store"), ing(null, "pinch", "salt", "spice"),
        ing(80, "ml", "water", "store"), ing(3, "tbsp", "vegetable oil, for frying", "store"),
        ing(1, "tbsp", "tamarind sauce or chutney", "store"), ing(1, "handful", "lettuce, shredded", "produce"),
        ing(1, "", "tomato, sliced", "produce")
      ],
      steps: [
        "Mix the flour, baking powder, salt and water into a smooth batter for the fried bake, and let it rest for 5 minutes.",
        "Fry spoonfuls of the batter in the hot oil for 2–3 minutes each side until golden and cooked through. Drain on paper.",
        "Season the fish and shallow-fry in a little oil for 3–4 minutes each side until golden and cooked through.",
        "Split the bakes open and fill with the fried fish, lettuce and tomato.",
        "Drizzle with the tamarind sauce to serve."
      ]
    },
    {
      id: "d307", title: "Belgian-Style Stoemp with Pork Sausage", tags: ["quick"], cuisine: "Belgium", protein: "pork",
      prep: 8, cook: 18,
      ingredients: [
        ing(150, "g", "pork sausages", "meat"), ing(200, "g", "potatoes, peeled and chopped", "produce"),
        ing(80, "g", "curly kale, shredded", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(2, "tbsp", "milk", "dairy"), ing(0.5, "tsp", "grain mustard", "store"),
        ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Grill or fry the sausages for 12–15 minutes, turning occasionally, until browned and cooked through.",
        "Meanwhile boil the potatoes for 12–15 minutes until tender.",
        "Add the kale to the potato pan for the last 3–4 minutes of cooking to wilt and soften.",
        "Drain, then mash the potatoes and kale together with the butter, milk and mustard until roughly mashed.",
        "Serve the stoemp topped with the sausages."
      ]
    },
    {
      id: "d308", title: "Belgian-Style Chicory and Cheese Gratin (Witloof)", tags: ["vegetarian", "quick"], cuisine: "Belgium", protein: "plant-based",
      prep: 8, cook: 20,
      ingredients: [
        ing(2, "", "heads chicory, halved", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(1, "tbsp", "plain flour", "store"), ing(150, "ml", "milk", "dairy"),
        ing(40, "g", "cheese, grated", "dairy"), ing(null, "pinch", "nutmeg", "spice"),
        ing(1, "tsp", "Dijon mustard", "store")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C).",
        "Simmer the chicory halves in a pan of water for 8–10 minutes until just tender. Drain well and place in an ovenproof dish.",
        "Melt the butter in a small pan, stir in the flour and cook for 1 minute, then gradually whisk in the milk to make a smooth sauce.",
        "Stir in the mustard, nutmeg and half the cheese until melted.",
        "Pour the sauce over the chicory, scatter with the remaining cheese, and bake for 10–12 minutes until golden and bubbling."
      ]
    },
    {
      id: "d309", title: "Norwegian-Style Fish Cakes with Creamed Cabbage", tags: ["fish", "quick"], cuisine: "Norway", protein: "fish",
      prep: 9, cook: 15,
      ingredients: [
        ing(180, "g", "white fish fillet (e.g. haddock or cod), roughly chopped", "meat"), ing(1, "tbsp", "plain flour", "store"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(null, "pinch", "nutmeg", "spice"), ing(2, "tbsp", "butter", "dairy"),
        ing(100, "g", "white cabbage, shredded", "produce"), ing(2, "tbsp", "double cream", "dairy"),
        ing(1, "tbsp", "fresh dill, chopped", "produce")
      ],
      steps: [
        "Blitz or finely chop the fish, then mix with the flour, egg, milk and nutmeg to make a smooth, spoonable mixture.",
        "Heat half the butter in a pan and fry spoonfuls of the fish mixture for 3–4 minutes each side until golden and cooked through.",
        "Meanwhile melt the remaining butter in another pan and soften the cabbage for 6–8 minutes until tender.",
        "Stir the cream into the cabbage and simmer for 2 minutes until slightly thickened.",
        "Serve the fish cakes with the creamed cabbage, scattered with dill."
      ]
    },
    {
      id: "d310", title: "Norwegian-Style Lapskaus (Beef and Cabbage Stew)", tags: [], cuisine: "Norway", protein: "beef",
      prep: 9, cook: 28,
      ingredients: [
        ing(180, "g", "stewing beef, diced", "meat"), ing(1, "tbsp", "butter", "dairy"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(1, "", "potato, diced", "produce"), ing(80, "g", "white cabbage, shredded", "produce"),
        ing(250, "ml", "beef stock", "store"), ing(1, "", "bay leaf", "spice"),
        ing(1, "tbsp", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Melt the butter in a pot and brown the beef for 4–5 minutes. Remove and set aside.",
        "Soften the onion and carrot in the same pot for 5 minutes.",
        "Return the beef to the pot with the potato, stock and bay leaf. Cover and simmer for 15 minutes.",
        "Add the cabbage and simmer for a further 8–10 minutes until the beef and vegetables are tender.",
        "Season to taste and scatter with parsley to serve."
      ]
    },
    {
      id: "d311", title: "Lancashire Hotpot with Lamb and Sliced Potatoes", tags: [], cuisine: "UK", protein: "lamb",
      prep: 10, cook: 35,
      ingredients: [
        ing(180, "g", "lamb neck or leg, diced", "meat"), ing(1, "", "onion, sliced", "produce"),
        ing(1, "", "carrot, sliced", "produce"), ing(2, "", "potatoes, thinly sliced", "produce"),
        ing(150, "ml", "lamb or chicken stock", "store"), ing(1, "tsp", "Worcestershire sauce", "store"),
        ing(1, "tsp", "fresh thyme leaves", "produce"), ing(15, "g", "butter, melted", "dairy"),
        ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Preheat the oven to 180C (fan 160C).",
        "In an ovenproof dish, brown the lamb in a little butter over high heat, then remove.",
        "Layer the onion, carrot and lamb in the dish, tucking in the thyme and seasoning as you go, then pour over the stock and Worcestershire sauce.",
        "Arrange the sliced potatoes on top in overlapping layers and brush with the melted butter.",
        "Cover with foil and bake for 25 minutes, then uncover and bake a further 10 minutes until the potatoes are golden and the lamb is tender."
      ]
    },
    {
      id: "d312", title: "Cullen Skink-Style Smoked Haddock Chowder", tags: ["quick", "fish"], cuisine: "UK", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "smoked haddock fillet", "meat"), ing(1, "", "potato, diced", "produce"),
        ing(1, "", "small onion, chopped", "produce"), ing(15, "g", "butter", "dairy"),
        ing(100, "ml", "milk", "dairy"), ing(100, "ml", "fish or vegetable stock", "store"),
        ing(1, "", "bay leaf", "spice"), ing(1, "tbsp", "chives, chopped", "produce"),
        ing(null, "to taste", "black pepper", "spice")
      ],
      steps: [
        "Melt the butter in a saucepan and soften the onion for 3–4 minutes.",
        "Add the potato, stock and bay leaf, cover and simmer for 10 minutes until the potato is tender.",
        "Pour in the milk and lay the haddock on top, then poach gently for 5–6 minutes until the fish flakes easily.",
        "Lift out the fish, remove the skin and flake it back into the soup, lightly crushing some potato as you stir.",
        "Season with black pepper and scatter with chives to serve."
      ]
    },
    {
      id: "d313", title: "Welsh Rarebit with Grilled Tomatoes", tags: ["quick", "vegetarian"], cuisine: "UK", protein: "plant-based",
      prep: 7, cook: 6,
      ingredients: [
        ing(2, "slices", "bread", "bakery"), ing(70, "g", "mature cheddar, grated", "dairy"),
        ing(1, "tsp", "English mustard", "store"), ing(1, "tbsp", "brown ale or milk", "store"),
        ing(1, "tsp", "Worcestershire sauce", "store"), ing(2, "", "tomatoes, halved", "produce"),
        ing(null, "to taste", "black pepper", "spice")
      ],
      steps: [
        "Preheat the grill to high.",
        "Toast the bread lightly on both sides.",
        "Mix the cheddar, mustard, ale or milk and Worcestershire sauce into a thick paste.",
        "Place the tomato halves under the grill for 2–3 minutes to soften slightly.",
        "Spread the cheese mixture thickly over the toast and grill for 3–4 minutes until bubbling and golden.",
        "Serve with the grilled tomatoes."
      ]
    },
    {
      id: "d314", title: "Coronation Chicken with Basmati Rice", tags: ["quick"], cuisine: "UK", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(60, "g", "basmati rice", "store"),
        ing(2, "tbsp", "mayonnaise", "store"), ing(1, "tsp", "mild curry powder", "spice"),
        ing(1, "tsp", "mango chutney", "store"), ing(1, "tsp", "lemon juice", "produce"),
        ing(15, "g", "sultanas", "store"), ing(10, "g", "flaked almonds", "store"),
        ing(1, "", "spring onion, sliced", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Meanwhile, poach the chicken breast in a pan of gently simmering water for 10–12 minutes until cooked through, then drain, cool slightly and dice.",
        "Mix the mayonnaise, curry powder, mango chutney and lemon juice in a bowl.",
        "Fold the diced chicken and sultanas through the dressing.",
        "Spoon over the warm rice and scatter with flaked almonds and spring onion."
      ]
    },
    {
      id: "d315", title: "Duck Confit-Style Duck Leg with Sautéed Potatoes", tags: [], cuisine: "France", protein: "duck",
      prep: 6, cook: 30,
      ingredients: [
        ing(1, "", "duck leg (about 200g)", "meat"), ing(2, "", "potatoes, diced", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "fresh thyme leaves", "produce"),
        ing(null, "to taste", "salt", "spice")
      ],
      steps: [
        "Preheat the oven to 190C (fan 170C).",
        "Score the duck skin, season well with salt and place skin-side down in a cold ovenproof frying pan.",
        "Set over low-medium heat for 5 minutes to render the fat and crisp the skin, then transfer the pan to the oven and roast for 25 minutes until cooked through and crisp.",
        "Meanwhile, parboil the diced potatoes for 5 minutes, then drain.",
        "Fry the potatoes in a little of the rendered duck fat with the garlic and thyme for 8–10 minutes until golden.",
        "Rest the duck for 3 minutes before serving with the potatoes."
      ]
    },
    {
      id: "d316", title: "Beef Bourguignon-Style Braised Beef with Mushrooms", tags: [], cuisine: "France", protein: "beef",
      prep: 9, cook: 35,
      ingredients: [
        ing(180, "g", "beef stewing steak, diced", "meat"), ing(1, "", "rasher smoked bacon, chopped", "meat"),
        ing(1, "", "small onion, sliced", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(60, "g", "chestnut mushrooms, halved", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(150, "ml", "red wine", "store"), ing(100, "ml", "beef stock", "store"),
        ing(1, "tsp", "tomato purée", "store"), ing(1, "tsp", "fresh thyme leaves", "produce"),
        ing(1, "", "bay leaf", "spice"), ing(10, "g", "butter", "dairy")
      ],
      steps: [
        "Brown the beef and bacon in the butter over high heat, then remove and set aside.",
        "Soften the onion, carrot and garlic in the same pan for 3–4 minutes.",
        "Return the beef and bacon, then add the wine, stock, tomato purée, thyme and bay leaf.",
        "Cover and simmer gently for 25 minutes, stirring occasionally.",
        "Add the mushrooms and simmer uncovered for a further 8–10 minutes until the beef is tender and the sauce has thickened.",
        "Remove the bay leaf, season and serve."
      ]
    },
    {
      id: "d317", title: "Salmon en Papillote with Fennel and Lemon", tags: ["quick", "fish"], cuisine: "France", protein: "fish",
      prep: 7, cook: 15,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(0.5, "", "fennel bulb, thinly sliced", "produce"),
        ing(0.5, "", "lemon, thinly sliced", "produce"), ing(60, "g", "cherry tomatoes, halved", "produce"),
        ing(1, "tbsp", "white wine or water", "store"), ing(1, "tsp", "dill, chopped", "produce"),
        ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C).",
        "Lay a large sheet of baking paper on a tray and arrange the fennel slices in the centre.",
        "Top with the salmon, lemon slices, cherry tomatoes and dill, then drizzle with olive oil and the wine or water.",
        "Fold and scrunch the paper to seal into a parcel.",
        "Bake for 15 minutes until the salmon is just cooked through, then open carefully and serve."
      ]
    },
    {
      id: "d318", title: "French Green Lentil Salad with Soft-Boiled Egg and Dijon Dressing", tags: ["quick", "vegetarian"], cuisine: "France", protein: "plant-based",
      prep: 6, cook: 8,
      ingredients: [
        ing(250, "g", "ready-cooked puy lentils", "store"), ing(1, "", "egg", "dairy"),
        ing(20, "g", "rocket", "produce"), ing(60, "g", "cherry tomatoes, halved", "produce"),
        ing(1, "", "small shallot, finely chopped", "produce"), ing(1, "tsp", "Dijon mustard", "store"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(2, "tbsp", "olive oil", "store"),
        ing(1, "tbsp", "parsley, chopped", "produce")
      ],
      steps: [
        "Bring a small pan of water to the boil and cook the egg for 6–7 minutes, then cool in cold water and peel.",
        "Warm the lentils in a pan or microwave according to the pack instructions.",
        "Whisk the Dijon mustard, vinegar, olive oil and shallot together for the dressing.",
        "Toss the warm lentils with the rocket, tomatoes and dressing.",
        "Halve the egg and place on top, scattering with parsley to serve."
      ]
    },
    {
      id: "d319", title: "Okonomiyaki-Style Cabbage Pancake with Bacon", tags: ["quick"], cuisine: "Japan", protein: "pork",
      prep: 9, cook: 10,
      ingredients: [
        ing(100, "g", "plain flour", "store"), ing(1, "", "egg", "dairy"),
        ing(80, "ml", "water", "store"), ing(150, "g", "white cabbage, shredded", "produce"),
        ing(2, "", "rashers streaky bacon", "meat"), ing(1, "", "spring onion, sliced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(2, "tbsp", "brown sauce or okonomiyaki sauce", "store"),
        ing(1, "tbsp", "mayonnaise", "store"), ing(1, "tsp", "bonito flakes, optional", "store")
      ],
      steps: [
        "Whisk the flour, egg and water together into a smooth batter.",
        "Fold the shredded cabbage and most of the spring onion through the batter.",
        "Heat the oil in a non-stick frying pan over medium heat, pour in the batter and spread evenly, then lay the bacon on top.",
        "Cook for 4–5 minutes until set and golden underneath, then carefully flip and cook a further 4–5 minutes until the bacon is cooked and the pancake is golden.",
        "Drizzle with brown sauce and mayonnaise, and scatter with bonito flakes and the remaining spring onion."
      ]
    },
    {
      id: "d320", title: "Chicken Karaage with Sesame Slaw", tags: ["quick"], cuisine: "Japan", protein: "chicken",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "chicken thigh fillets, diced", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "garlic clove, grated", "produce"),
        ing(2, "tbsp", "potato starch or cornflour", "store"), ing(100, "ml", "vegetable oil, for frying", "store"),
        ing(80, "g", "cabbage, shredded", "produce"), ing(1, "tsp", "sesame seeds", "spice"),
        ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Marinate the chicken in the soy sauce, ginger and garlic for 5 minutes.",
        "Heat the oil in a small saucepan or deep frying pan over medium-high heat.",
        "Coat the marinated chicken pieces in the potato starch, shaking off any excess.",
        "Fry in batches for 6–7 minutes, turning, until golden and cooked through, then drain on kitchen paper.",
        "Serve over the shredded cabbage, scattered with sesame seeds and a lemon wedge."
      ]
    },
    {
      id: "d321", title: "Chirashi-Style Salmon Rice Bowl", tags: ["quick", "fish"], cuisine: "Japan", protein: "fish",
      prep: 10, cook: 12,
      ingredients: [
        ing(75, "g", "sushi rice", "store"), ing(1, "tbsp", "rice vinegar", "store"),
        ing(1, "tsp", "sugar", "store"), ing(100, "g", "very fresh salmon fillet, thinly sliced", "meat"),
        ing(0.25, "", "cucumber, sliced", "produce"), ing(0.5, "", "avocado, sliced", "produce"),
        ing(30, "g", "frozen edamame beans, cooked", "frozen"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "pickled ginger", "store"), ing(0.5, "sheet", "nori, shredded", "store")
      ],
      steps: [
        "Cook the sushi rice according to the packet instructions.",
        "While still warm, stir the rice vinegar and sugar through the rice, then leave to cool slightly.",
        "Cook the edamame in boiling water for 2–3 minutes, then drain.",
        "Spoon the rice into a bowl and arrange the salmon, cucumber, avocado and edamame on top.",
        "Scatter with pickled ginger and shredded nori, and serve with soy sauce for drizzling."
      ]
    },
    {
      id: "d322", title: "Cypriot Kleftiko-Style Lamb with Lemon and Oregano", tags: [], cuisine: "Cyprus", protein: "lamb",
      prep: 8, cook: 35,
      ingredients: [
        ing(180, "g", "lamb leg steak, cut into chunks", "meat"), ing(1, "", "potato, cut into wedges", "produce"),
        ing(2, "", "garlic cloves, sliced", "produce"), ing(1, "", "lemon, juiced", "produce"),
        ing(1, "tsp", "dried oregano", "spice"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "bay leaf", "spice"), ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Preheat the oven to 180C (fan 160C).",
        "Toss the lamb and potato wedges with the garlic, lemon juice, oregano, olive oil, bay leaf and seasoning in an ovenproof dish.",
        "Add a small splash of water and cover tightly with foil.",
        "Roast for 30 minutes, then uncover and roast for a further 5–8 minutes until the lamb is tender and the potatoes are golden."
      ]
    },
    {
      id: "d323", title: "Cypriot Halloumi and Village Salad", tags: ["quick", "vegetarian"], cuisine: "Cyprus", protein: "plant-based",
      prep: 8, cook: 5,
      ingredients: [
        ing(100, "g", "halloumi, sliced", "dairy"), ing(0.5, "", "cucumber, chopped", "produce"),
        ing(2, "", "tomatoes, chopped", "produce"), ing(0.25, "", "red onion, sliced", "produce"),
        ing(30, "g", "kalamata olives", "store"), ing(1, "tsp", "dried oregano", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "", "lemon, juiced", "produce"),
        ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Heat a dry frying pan and fry the halloumi slices for 2–3 minutes each side until golden.",
        "Meanwhile, toss the cucumber, tomato and red onion with the olives, oregano, olive oil and lemon juice.",
        "Arrange the salad on a plate and top with the grilled halloumi.",
        "Serve with crusty bread."
      ]
    },
    {
      id: "d324", title: "Jamaican-Style Escovitch Fish with Pickled Peppers", tags: ["quick", "spicy", "fish"], cuisine: "Jamaica", protein: "fish",
      prep: 9, cook: 12,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(2, "tbsp", "white wine vinegar", "store"),
        ing(1, "", "carrot, julienned", "produce"), ing(0.5, "", "each red and yellow pepper, sliced", "produce"),
        ing(1, "", "onion, sliced", "produce"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(0.25, "tsp", "ground allspice", "spice"), ing(1, "sprig", "thyme", "produce")
      ],
      steps: [
        "Season the fish and dust lightly in flour.",
        "Fry in the oil for 3–4 minutes each side until golden and cooked through, then set aside.",
        "In the same pan, soften the onion, carrot and peppers with the allspice, chilli flakes and thyme for 4–5 minutes.",
        "Add the vinegar and a splash of water, and simmer for 3–4 minutes.",
        "Spoon the pickled vegetables over the fish to serve."
      ]
    },
    {
      id: "d325", title: "Jamaican-Style Brown Stew Chicken", tags: [], cuisine: "Jamaica", protein: "chicken",
      prep: 9, cook: 30,
      ingredients: [
        ing(2, "", "chicken thighs, bone-in", "meat"), ing(1, "tsp", "brown sugar", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "ground allspice", "spice"),
        ing(1, "sprig", "thyme", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "onion, sliced", "produce"),
        ing(0.5, "", "pepper, sliced", "produce"), ing(150, "ml", "chicken stock", "store"),
        ing(1, "", "spring onion, sliced", "produce")
      ],
      steps: [
        "Marinate the chicken in the soy sauce, garlic, ginger and allspice for 5 minutes.",
        "Melt the sugar in a hot pan until caramelised, then add the chicken and brown well on all sides.",
        "Add the onion, pepper and thyme, and cook for 2–3 minutes.",
        "Pour in the stock, cover and simmer for 20–25 minutes until the chicken is tender and the sauce has thickened.",
        "Scatter with spring onion to serve."
      ]
    },
    {
      id: "d326", title: "Cuban-Style Ropa Vieja Shredded Beef", tags: [], cuisine: "Cuba", protein: "beef",
      prep: 9, cook: 30,
      ingredients: [
        ing(180, "g", "beef skirt or flank steak, thinly sliced", "meat"), ing(1, "", "onion, sliced", "produce"),
        ing(0.5, "", "each red and green pepper, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(200, "g", "tinned chopped tomatoes", "store"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(1, "", "bay leaf", "spice"),
        ing(15, "g", "green olives", "store"), ing(60, "g", "white rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Brown the beef strips in a hot pan, then set aside.",
        "Soften the onion, peppers and garlic in the same pan for 3–4 minutes.",
        "Add the tomatoes, cumin, paprika, bay leaf and beef, cover and simmer for 20–25 minutes until the beef is tender.",
        "Stir in the olives and shred the beef with two forks, then serve with the rice."
      ]
    },
    {
      id: "d327", title: "Cuban-Style Mojo Pork with Rice and Black Beans", tags: ["quick"], cuisine: "Cuba", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "pork loin steak", "meat"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(2, "tbsp", "orange juice", "produce"), ing(1, "tbsp", "lime juice", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "dried oregano", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(60, "g", "white rice", "store"),
        ing(100, "g", "tinned black beans, drained", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions, and warm the black beans in a small pan.",
        "Mix the garlic, orange juice, lime juice, cumin, oregano and olive oil for the marinade, and coat the pork.",
        "Leave to marinate for 5 minutes while a pan heats.",
        "Sear the pork for 4–5 minutes each side until cooked through and lightly charred, then rest for 2 minutes and slice.",
        "Serve over the rice and black beans, spooning over any pan juices."
      ]
    },
    {
      id: "d328", title: "Indonesian-Style Chicken Satay with Peanut Sauce", tags: ["quick", "spicy"], cuisine: "Indonesia", protein: "chicken",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "chicken thigh, cubed", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(0.5, "tsp", "ground coriander", "spice"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(2, "tbsp", "peanut butter", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "lime juice", "produce"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(2, "tbsp", "coconut milk", "store"),
        ing(60, "g", "white rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Marinate the chicken cubes in the soy sauce, turmeric, coriander and garlic for 5 minutes.",
        "Thread onto skewers and griddle or grill for 8–10 minutes, turning, until charred and cooked through.",
        "Meanwhile, whisk the peanut butter, soy sauce, lime juice, chilli flakes and coconut milk with a splash of hot water into a smooth sauce.",
        "Serve the skewers with the peanut sauce and rice."
      ]
    },
    {
      id: "d329", title: "Indonesian-Style Grilled Fish with Sambal (Ikan Bakar)", tags: ["quick", "spicy", "fish"], cuisine: "Indonesia", protein: "fish",
      prep: 9, cook: 12,
      ingredients: [
        ing(150, "g", "sea bass or white fish fillet", "meat"), ing(1, "", "shallot, chopped", "produce"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(1, "", "red chilli, chopped", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(1, "tsp", "tamarind paste", "store"),
        ing(0.5, "tsp", "sugar", "store"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(1, "", "lime, juiced", "produce"), ing(60, "g", "white rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Finely chop the shallot, garlic, chilli and tomato for the sambal.",
        "Fry the sambal mixture in the oil for 5 minutes until softened and jammy, then stir in the tamarind paste and sugar.",
        "Season the fish and grill or pan-fry for 3–4 minutes each side until cooked through.",
        "Spoon the sambal over the fish, squeeze over the lime and serve with rice."
      ]
    },
    {
      id: "d330", title: "Egyptian-Style Ful Medames with Warm Pitta", tags: ["quick", "vegan", "vegetarian"], cuisine: "Egypt", protein: "plant-based",
      prep: 7, cook: 8,
      ingredients: [
        ing(400, "g", "tinned fava beans", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tbsp", "lemon juice", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "", "tomato, chopped", "produce"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(1, "", "pitta bread", "bakery")
      ],
      steps: [
        "Warm the fava beans with a splash of their tin liquid, the garlic and cumin in a small pan for 6–8 minutes, lightly mashing some of the beans.",
        "Stir in the lemon juice and olive oil.",
        "Warm the pitta bread.",
        "Top the beans with the chopped tomato and parsley, and serve with the warm pitta."
      ]
    },
    {
      id: "d331", title: "Egyptian-Style Chicken Kofta with Rice", tags: ["quick"], cuisine: "Egypt", protein: "chicken",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "chicken mince", "meat"), ing(0.5, "", "onion, grated", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "ground coriander", "spice"), ing(1, "tbsp", "parsley, chopped", "produce"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(60, "g", "white rice", "store"),
        ing(1, "tbsp", "tahini, to drizzle", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the chicken mince with the grated onion, garlic, cumin, coriander, parsley, chilli flakes and seasoning.",
        "Shape into small kofta shapes around skewers, or freeform ovals.",
        "Fry or grill for 8–10 minutes, turning, until cooked through and browned.",
        "Serve over the rice with a drizzle of tahini."
      ]
    },
    {
      id: "d332", title: "Malaysian-Style Assam Fish Curry", tags: ["spicy", "fish"], cuisine: "Malaysia", protein: "fish",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(1, "tbsp", "tamarind paste", "store"),
        ing(1, "tsp", "sambal oelek or chilli paste", "store"), ing(1, "", "shallot, sliced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "lemongrass paste", "store"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(80, "g", "green beans, trimmed", "produce"),
        ing(150, "ml", "fish or vegetable stock", "store"), ing(60, "g", "white rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the shallot, garlic, sambal and lemongrass paste for 2–3 minutes until fragrant.",
        "Stir in the tamarind paste, turmeric and stock, and simmer for 5 minutes.",
        "Add the fish and green beans, and simmer gently for 6–8 minutes until the fish is just cooked through.",
        "Serve with the rice."
      ]
    },
    {
      id: "d333", title: "Malaysian-Style Char Kway Teow with Egg and Chinese Sausage", tags: ["quick", "spicy"], cuisine: "Malaysia", protein: "pork",
      prep: 9, cook: 8,
      ingredients: [
        ing(150, "g", "flat rice noodles", "store"), ing(1, "", "Chinese sausage, sliced", "meat"),
        ing(1, "", "egg", "dairy"), ing(50, "g", "beansprouts", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "dark soy sauce", "store"),
        ing(1, "tbsp", "light soy sauce", "store"), ing(1, "tsp", "chilli paste or sambal", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "tbsp", "chives, chopped", "produce")
      ],
      steps: [
        "Prepare the noodles according to the packet instructions.",
        "Heat the oil in a wok and fry the Chinese sausage for 2–3 minutes until fragrant.",
        "Push to one side, crack in the egg and scramble briefly, then stir through the sausage.",
        "Add the noodles, garlic, dark and light soy sauce and chilli paste, and toss over high heat for 3–4 minutes.",
        "Add the beansprouts and chives, toss for 1–2 minutes more, and serve immediately."
      ]
    },
    {
      id: "d334", title: "Brazilian-Style Moqueca Fish Stew", tags: ["fish"], cuisine: "Brazil", protein: "fish",
      prep: 9, cook: 18,
      ingredients: [
        ing(150, "g", "white fish fillet, cubed", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(1, "", "tomato, chopped", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(1, "", "lime, juiced", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.25, "tsp", "chilli flakes", "spice")
      ],
      steps: [
        "Marinate the fish briefly in half the lime juice and a pinch of salt.",
        "Soften the onion, garlic and pepper in the oil for 4–5 minutes.",
        "Add the tomato, chilli flakes and coconut milk, and simmer for 5 minutes.",
        "Add the fish and simmer gently for 8–10 minutes until just cooked through.",
        "Stir through the coriander and remaining lime juice, and serve with rice."
      ]
    },
    {
      id: "d335", title: "Brazilian-Style Picanha Steak with Farofa", tags: [], cuisine: "Brazil", protein: "beef",
      prep: 9, cook: 12,
      ingredients: [
        ing(150, "g", "beef rump or sirloin steak", "meat"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "coarse sea salt", "spice"), ing(40, "g", "cassava flour or dried breadcrumbs", "store"),
        ing(15, "g", "butter", "dairy"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(1, "", "spring onion, sliced", "produce")
      ],
      steps: [
        "Season the steak generously with the garlic and coarse salt, and rest at room temperature while a pan heats.",
        "Sear the steak for 3–4 minutes each side for medium, then rest for 5 minutes and slice.",
        "Meanwhile, melt the butter in a small pan and fry the onion until soft.",
        "Stir in the cassava flour and toast for 3–4 minutes until golden and crumbly, seasoning to taste.",
        "Serve the sliced steak with the farofa, scattered with spring onion and any pan juices."
      ]
    },
    {
      id: "d336", title: "Russian-Style Beef Stroganoff", tags: [], cuisine: "Russia", protein: "beef",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "beef sirloin, cut into strips", "meat"), ing(80, "g", "mushrooms, sliced", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(100, "ml", "beef stock", "store"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(1, "tsp", "Dijon mustard", "store"), ing(0.5, "tsp", "paprika", "spice"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(80, "g", "tagliatelle", "store")
      ],
      steps: [
        "Cook the tagliatelle according to the packet instructions.",
        "Sear the beef strips in a hot pan for 2 minutes, then remove and set aside.",
        "Fry the onion and mushrooms in the same pan for 4–5 minutes until golden.",
        "Add the garlic, paprika and stock, and simmer for 3–4 minutes.",
        "Stir in the soured cream and mustard, return the beef and warm through for 2 minutes without boiling.",
        "Scatter with parsley and serve with the tagliatelle."
      ]
    },
    {
      id: "d337", title: "Russian-Style Salmon Kotleti with Soured Cream", tags: ["quick", "fish"], cuisine: "Russia", protein: "fish",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "salmon fillet, finely chopped", "meat"), ing(20, "g", "breadcrumbs", "store"),
        ing(1, "", "egg", "dairy"), ing(0.25, "", "onion, finely grated", "produce"),
        ing(1, "tsp", "dill, chopped", "produce"), ing(15, "g", "butter, for frying", "dairy"),
        ing(2, "tbsp", "soured cream", "dairy"), ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Finely chop the salmon to a coarse mince using a knife.",
        "Mix with the breadcrumbs, egg, grated onion, dill and seasoning.",
        "Shape into two patties.",
        "Fry in the butter for 3–4 minutes each side until golden and cooked through.",
        "Serve with a dollop of soured cream and a lemon wedge."
      ]
    },
    {
      id: "d338", title: "Hawaiian-Style Loco Moco", tags: ["quick"], cuisine: "Hawaii", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(60, "g", "white rice", "store"),
        ing(1, "", "egg", "dairy"), ing(50, "g", "mushrooms, sliced", "produce"),
        ing(100, "ml", "beef stock", "store"), ing(1, "tsp", "soy sauce", "store"),
        ing(1, "tsp", "cornflour", "store"), ing(10, "g", "butter", "dairy")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Shape the beef mince into a patty, season and fry for 3–4 minutes each side until cooked to preference, then keep warm.",
        "In the same pan, fry the mushrooms in the butter for 2–3 minutes.",
        "Add the stock and soy sauce, thicken with a cornflour and water slurry, and simmer for 2–3 minutes into a gravy.",
        "Fry the egg sunny-side up in a separate pan.",
        "Serve the patty over the rice, topped with the fried egg and gravy."
      ]
    },
    {
      id: "d339", title: "Hawaiian-Style Spam Musubi Bowl", tags: ["quick"], cuisine: "Hawaii", protein: "pork",
      prep: 8, cook: 6,
      ingredients: [
        ing(100, "g", "tinned spam, sliced", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "brown sugar", "store"), ing(75, "g", "sushi rice", "store"),
        ing(1, "tbsp", "rice vinegar", "store"), ing(0.5, "sheet", "nori, torn", "store"),
        ing(1, "tsp", "sesame seeds", "spice"), ing(1, "", "spring onion, sliced", "produce")
      ],
      steps: [
        "Cook the sushi rice according to the packet instructions and stir through the rice vinegar.",
        "Fry the spam slices for 2–3 minutes each side until browned.",
        "Mix the soy sauce and brown sugar, add to the pan in the last minute and toss to glaze the spam.",
        "Spoon the rice into a bowl and top with the glazed spam.",
        "Scatter with torn nori, sesame seeds and spring onion."
      ]
    },
    {
      id: "d340", title: "Uzbek-Style Lamb Shashlik Skewers", tags: ["quick"], cuisine: "Uzbekistan", protein: "lamb",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "lamb shoulder, cubed", "meat"), ing(0.5, "", "onion, grated", "produce"),
        ing(1, "tsp", "ground cumin", "spice"), ing(1, "tsp", "coriander seeds, crushed", "spice"),
        ing(0.5, "tsp", "paprika", "spice"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "flatbread", "bakery"), ing(0.25, "", "onion, thinly sliced, for serving", "produce"),
        ing(0.5, "tsp", "sumac", "spice")
      ],
      steps: [
        "Toss the lamb cubes with the grated onion, cumin, coriander seeds, paprika, oil and salt.",
        "Leave to marinate briefly while the grill or a griddle pan heats.",
        "Thread the lamb onto skewers and grill or griddle for 8–10 minutes, turning, until charred and cooked to preference.",
        "Toss the sliced onion with the sumac.",
        "Serve the skewers with warm flatbread and the sumac onion."
      ]
    },
    {
      id: "d341", title: "Uzbek-Style Lagman Noodle Soup with Beef", tags: [], cuisine: "Uzbekistan", protein: "beef",
      prep: 9, cook: 20,
      ingredients: [
        ing(150, "g", "beef sirloin, cut into strips", "meat"), ing(100, "g", "udon noodles", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(0.5, "", "pepper, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(300, "ml", "beef stock", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "tbsp", "coriander, chopped", "produce")
      ],
      steps: [
        "Brown the beef strips in a hot pan, then set aside.",
        "Soften the onion, carrot, pepper and garlic in the same pan for 4–5 minutes.",
        "Add the tomato, stock, cumin and chilli flakes, and simmer for 10 minutes.",
        "Return the beef and simmer a further 5 minutes until tender.",
        "Meanwhile, cook the noodles according to the packet instructions, drain and divide into a bowl.",
        "Ladle the soup over the noodles and scatter with coriander."
      ]
    },
    {
      id: "d342", title: "Ghanaian-Style Red Red Bean Stew with Fried Plantain", tags: ["quick", "vegan", "vegetarian"], cuisine: "Ghana", protein: "plant-based",
      prep: 9, cook: 20,
      ingredients: [
        ing(400, "g", "tinned black-eyed beans", "store"), ing(1, "tbsp", "tomato purée", "store"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(0.5, "tsp", "paprika", "spice"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(1, "", "ripe plantain, sliced", "produce")
      ],
      steps: [
        "Soften the onion, garlic, ginger and chilli flakes in half the oil for 3–4 minutes.",
        "Stir in the tomato purée and paprika, and cook for 2 minutes.",
        "Add the beans with a little of their tin liquid, and simmer for 10 minutes until thickened, seasoning to taste.",
        "Meanwhile, fry the plantain slices in the remaining oil for 3–4 minutes each side until golden and caramelised.",
        "Serve the beans topped with the fried plantain."
      ]
    },
    {
      id: "d343", title: "Ghanaian-Style Fried Fish with Kelewele Spiced Plantain", tags: ["spicy", "fish"], cuisine: "Ghana", protein: "fish",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "", "ripe plantain, sliced", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(null, "pinch", "ground nutmeg", "spice"), ing(null, "pinch", "ground cinnamon", "spice"),
        ing(1, "tsp", "sugar", "store")
      ],
      steps: [
        "Toss the plantain slices with the ginger, chilli flakes, nutmeg, cinnamon and sugar.",
        "Fry the plantain in half the oil for 3–4 minutes each side until caramelised and tender, then drain.",
        "Season the fish and dust lightly in flour.",
        "Fry in the remaining oil for 3–4 minutes each side until golden and cooked through.",
        "Serve the fish with the spiced plantain."
      ]
    },
    {
      id: "d344", title: "Swiss Cheese Fondue for One", tags: ["quick", "vegetarian"], cuisine: "Switzerland", protein: "plant-based",
      prep: 8, cook: 8,
      ingredients: [
        ing(80, "g", "Gruyère, grated", "dairy"), ing(40, "g", "Emmental, grated", "dairy"),
        ing(1, "tsp", "cornflour", "store"), ing(60, "ml", "white wine or apple juice", "store"),
        ing(1, "", "garlic clove, halved", "produce"), ing(1, "tsp", "lemon juice", "produce"),
        ing(null, "pinch", "ground nutmeg", "spice"), ing(1, "", "small potato, boiled", "produce"),
        ing(1, "slice", "crusty bread, cubed", "bakery")
      ],
      steps: [
        "Rub the inside of a small pan with the cut garlic clove.",
        "Warm the wine or apple juice gently over low heat.",
        "Toss the grated cheeses with the cornflour, then add gradually to the pan, stirring constantly until melted and smooth.",
        "Stir in the lemon juice and a pinch of nutmeg.",
        "Serve immediately with the cubed bread and boiled potato for dipping."
      ]
    },
    {
      id: "d345", title: "Swiss-Style Pork Cordon Bleu with Green Beans", tags: [], cuisine: "Switzerland", protein: "pork",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "pork loin steak, butterflied", "meat"), ing(1, "slice", "ham", "meat"),
        ing(1, "slice", "Emmental or Gruyère", "dairy"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(30, "g", "breadcrumbs", "store"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(80, "g", "green beans", "produce")
      ],
      steps: [
        "Flatten the butterflied pork steak and season.",
        "Layer the ham and cheese over one half, then fold over and press the edges to seal.",
        "Coat in flour, then egg, then breadcrumbs.",
        "Shallow fry in the oil for 5–6 minutes each side until golden, cooked through and the cheese has melted.",
        "Rest for 2 minutes, and serve with steamed green beans."
      ]
    },
    {
      id: "d346", title: "Kiwi-Style Fish and Chips", tags: ["quick", "fish"], cuisine: "New Zealand", protein: "fish",
      prep: 9, cook: 25,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(50, "g", "plain flour", "store"),
        ing(80, "ml", "sparkling water", "store"), ing(1, "", "baking potato, cut into chips", "produce"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "tbsp", "malt vinegar", "store"),
        ing(1, "", "lemon wedge", "produce"), ing(1, "tbsp", "tartare sauce or mayonnaise", "store")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C).",
        "Toss the potato chips with the oil and seasoning, and oven-bake for about 20 minutes, turning once, until golden and crisp.",
        "Whisk the flour with the sparkling water into a light batter, and season.",
        "Dip the fish in the batter and fry in hot oil for 4–5 minutes, turning once, until golden and cooked through.",
        "Drain and serve with the chips, malt vinegar, lemon wedge and tartare sauce."
      ]
    },
    {
      id: "d347", title: "New Zealand-Style Chicken and Kumara Hangi-Inspired Traybake", tags: [], cuisine: "New Zealand", protein: "chicken",
      prep: 9, cook: 30,
      ingredients: [
        ing(2, "", "chicken thighs, bone-in", "meat"), ing(1, "", "kumara or sweet potato, cubed", "produce"),
        ing(1, "", "carrot, chunked", "produce"), ing(1, "", "wedge cabbage", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "fresh thyme leaves", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(2, "tbsp", "chicken stock", "store")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C).",
        "Toss the chicken thighs, kumara and carrot with the oil, garlic, thyme and seasoning in a roasting tray.",
        "Roast for 20 minutes.",
        "Add the cabbage wedge and a splash of stock to the tray, and return to the oven for a further 10 minutes until the chicken is cooked through and the vegetables are tender."
      ]
    },
    {
      id: "d348", title: "Cacio e Pepe", tags: ["quick", "vegetarian"], cuisine: "Italy", protein: "plant-based",
      prep: 5, cook: 10,
      ingredients: [
        ing(100, "g", "spaghetti", "store"), ing(40, "g", "pecorino, finely grated", "dairy"),
        ing(1, "tsp", "coarsely cracked black pepper", "spice"), ing(15, "g", "butter", "dairy")
      ],
      steps: [
        "Cook the spaghetti in salted boiling water until al dente, reserving a mugful of the starchy cooking water before draining.",
        "Meanwhile, toast the cracked black pepper in a dry frying pan over medium heat for 1 minute until fragrant.",
        "Add a splash of the pasta water and the butter to the pepper, then tip in the drained spaghetti.",
        "Remove from the heat and toss in the pecorino a little at a time, adding more pasta water as needed, until you have a glossy, creamy sauce.",
        "Serve immediately with extra black pepper."
      ]
    },
    {
      id: "d349", title: "Chicken Saltimbocca alla Romana", tags: ["quick"], cuisine: "Italy", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "chicken breast, sliced thin and flattened", "meat"), ing(2, "", "slices prosciutto", "meat"),
        ing(4, "", "sage leaves", "produce"), ing(1, "tbsp", "plain flour", "store"),
        ing(15, "g", "butter", "dairy"), ing(1, "tbsp", "olive oil", "store"),
        ing(50, "ml", "white wine", "store"), ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Lay a sage leaf or two on each piece of flattened chicken and wrap tightly with a slice of prosciutto.",
        "Dust lightly with flour, shaking off any excess.",
        "Heat the oil in a frying pan over medium-high heat and fry the chicken, prosciutto-side down first, for 3–4 minutes each side until golden and cooked through. Remove and keep warm.",
        "Add the wine and butter to the pan, scraping up any bits, and let it bubble for 1–2 minutes until slightly reduced.",
        "Spoon the sauce over the chicken and serve with a lemon wedge."
      ]
    },
    {
      id: "d350", title: "Sicilian-Style Pan-Fried Cod with Capers and Raisins", tags: ["quick", "fish"], cuisine: "Italy", protein: "fish",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "cod fillet", "meat"), ing(1, "tbsp", "plain flour", "store"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "tbsp", "capers", "store"),
        ing(1, "tbsp", "raisins", "store"), ing(1, "tbsp", "white wine vinegar", "store"),
        ing(1, "tbsp", "pine nuts", "store"), ing(1, "", "garlic clove, sliced", "produce"),
        ing(1, "tbsp", "parsley, chopped", "produce")
      ],
      steps: [
        "Soak the raisins in a little warm water for 5 minutes, then drain.",
        "Dust the cod in flour and season. Heat the oil in a frying pan over medium-high heat and fry the cod for 3–4 minutes each side until golden and cooked through. Remove and keep warm.",
        "In the same pan, fry the garlic, capers and pine nuts for 1 minute until fragrant.",
        "Add the raisins and vinegar, let it bubble for 30 seconds, then spoon the mixture over the cod.",
        "Scatter with parsley and serve."
      ]
    },
    {
      id: "d351", title: "Braised Pork with Gremolata (Milanese Ossobuco-Style)", tags: [], cuisine: "Italy", protein: "pork",
      prep: 9, cook: 30,
      ingredients: [
        ing(180, "g", "pork shoulder steak", "meat"), ing(1, "tbsp", "plain flour", "store"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "", "carrot, diced", "produce"), ing(1, "", "celery stick, diced", "produce"),
        ing(100, "g", "tinned chopped tomatoes", "store"), ing(100, "ml", "chicken stock", "store"),
        ing(50, "ml", "white wine", "store"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "", "lemon, zested", "produce"), ing(1, "tbsp", "parsley, chopped", "produce")
      ],
      steps: [
        "Dust the pork in flour and season. Heat the oil in a pan over medium-high heat and brown the pork on both sides, then remove.",
        "Add the onion, carrot and celery to the pan and soften for 4–5 minutes.",
        "Return the pork to the pan with the tomatoes, stock and wine. Bring to a simmer, cover and cook gently for 25 minutes, until the pork is tender.",
        "Meanwhile, mix the garlic, lemon zest and parsley together for the gremolata.",
        "Scatter the gremolata over the pork just before serving."
      ]
    },
    {
      id: "d352", title: "Moroccan-Style Fish Tagine with Chermoula", tags: ["quick", "fish"], cuisine: "Morocco", protein: "fish",
      prep: 9, cook: 20,
      ingredients: [
        ing(160, "g", "white fish fillet (cod or haddock)", "meat"), ing(2, "", "garlic cloves, finely chopped", "produce"),
        ing(2, "tbsp", "coriander, chopped", "produce"), ing(1, "tsp", "ground cumin", "spice"),
        ing(1, "tsp", "paprika", "spice"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(1, "", "lemon, juiced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "small potato, thinly sliced", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(100, "g", "tinned chopped tomatoes", "store"), ing(1, "tbsp", "green olives", "store")
      ],
      steps: [
        "Blitz or finely chop the garlic, coriander, cumin, paprika, chilli flakes, lemon juice and oil into a chermoula paste. Coat the fish and set aside.",
        "Layer the sliced potato and pepper in a small pan, pour over the chopped tomatoes and a splash of water, and simmer covered for 8–10 minutes until the potato is nearly tender.",
        "Lay the fish on top, spoon over any remaining chermoula, cover and simmer for 8–10 minutes more until the fish flakes easily.",
        "Scatter with olives and serve straight from the pan."
      ]
    },
    {
      id: "d353", title: "Moroccan Harira-Style Lentil & Chickpea Soup", tags: ["vegan", "vegetarian", "quick"], cuisine: "Morocco", protein: "plant-based",
      prep: 8, cook: 22,
      ingredients: [
        ing(40, "g", "red lentils", "store"), ing(100, "g", "tinned chickpeas, drained", "store"),
        ing(200, "g", "tinned chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "celery stick, diced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(0.5, "tsp", "ground ginger", "spice"), ing(0.5, "tsp", "ground cinnamon", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(300, "ml", "vegetable stock", "store"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Soften the onion and celery in a splash of oil over medium heat for 4–5 minutes, then add the garlic and spices and cook for 1 minute.",
        "Add the lentils, chickpeas, tomatoes and stock. Bring to a simmer.",
        "Cook for 18–20 minutes, stirring occasionally, until the lentils are soft and the soup has thickened.",
        "Stir through the coriander and a squeeze of lemon before serving."
      ]
    },
    {
      id: "d354", title: "Moroccan-Style Grilled Lamb Chops (Mechoui-Spiced)", tags: ["quick"], cuisine: "Morocco", protein: "lamb",
      prep: 8, cook: 10,
      ingredients: [
        ing(2, "", "lamb chops (about 200g)", "meat"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "ground cumin", "spice"), ing(1, "tsp", "paprika", "spice"),
        ing(0.5, "tsp", "ground coriander", "spice"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "lemon, juiced", "produce"), ing(1, "", "flatbread", "bakery"),
        ing(1, "", "tomato, sliced", "produce"), ing(0.25, "", "cucumber, sliced", "produce"),
        ing(0.25, "", "red onion, sliced", "produce"), ing(1, "tbsp", "mint, chopped", "produce")
      ],
      steps: [
        "Mix the garlic, cumin, paprika, coriander, oil and lemon juice into a paste and rub over the lamb chops. Leave to marinate for 5 minutes if time allows.",
        "Heat a griddle or frying pan over high heat and cook the chops for 3–4 minutes each side, until charred and cooked to your liking.",
        "Rest for 2 minutes while you warm the flatbread.",
        "Toss the tomato, cucumber, red onion and mint together and serve alongside the chops with the flatbread."
      ]
    },
    {
      id: "d355", title: "Thai-Style Tom Yum Soup with Chicken and Mushrooms", tags: ["quick", "spicy"], cuisine: "Thailand", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(120, "g", "chicken breast, sliced", "meat"), ing(400, "ml", "chicken stock", "store"),
        ing(1, "", "lemongrass stalk, bruised", "produce"), ing(2, "", "kaffir lime leaves", "produce"),
        ing(2, "", "slices fresh ginger", "produce"), ing(80, "g", "chestnut mushrooms, sliced", "produce"),
        ing(1, "", "red chilli, sliced", "produce"), ing(1, "tbsp", "fish sauce", "store"),
        ing(1, "", "lime, juiced", "produce"), ing(50, "g", "cherry tomatoes, halved", "produce"),
        ing(1, "tbsp", "coriander, chopped", "produce")
      ],
      steps: [
        "Bring the stock to a simmer with the lemongrass, lime leaves and ginger, and simmer for 5 minutes to infuse.",
        "Add the chicken, mushrooms and cherry tomatoes, and simmer for 6–8 minutes until the chicken is cooked through.",
        "Stir in the fish sauce, lime juice and chilli, and taste, adjusting the balance of sour, salty and hot.",
        "Ladle into a bowl and scatter with coriander to serve."
      ]
    },
    {
      id: "d356", title: "Thai-Style Pork Larb Salad (Larb Moo)", tags: ["quick", "spicy"], cuisine: "Thailand", protein: "pork",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1, "", "shallot, thinly sliced", "produce"),
        ing(1, "", "lime, juiced", "produce"), ing(1, "tbsp", "fish sauce", "store"),
        ing(1, "tbsp", "toasted rice powder (or crushed toasted rice)", "store"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(1, "tbsp", "mint, chopped", "produce"), ing(1, "tbsp", "coriander, chopped", "produce"),
        ing(4, "", "lettuce leaves", "produce")
      ],
      steps: [
        "Dry-fry the pork mince in a hot pan for 6–7 minutes, breaking it up, until cooked through and lightly browned.",
        "Take off the heat and stir in the shallot, chilli flakes, fish sauce and lime juice.",
        "Fold through the toasted rice powder, mint and coriander.",
        "Spoon into lettuce leaves to serve."
      ]
    },
    {
      id: "d357", title: "Thai-Style Pad See Ew with Beef", tags: ["quick"], cuisine: "Thailand", protein: "beef",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "beef rump or sirloin, thinly sliced", "meat"), ing(150, "g", "flat rice noodles (fresh or soaked)", "store"),
        ing(1, "tbsp", "dark soy sauce", "store"), ing(1, "tbsp", "light soy sauce", "store"),
        ing(1, "tsp", "sugar", "store"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(1, "", "egg", "dairy"), ing(60, "g", "tenderstem broccoli, sliced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat the oil in a wok over high heat and stir-fry the beef and garlic for 2–3 minutes until browned. Push to one side.",
        "Crack in the egg and scramble briefly, then stir through the beef.",
        "Add the noodles, broccoli, soy sauces and sugar. Toss over high heat for 3–4 minutes, letting the noodles catch slightly, until everything is well combined.",
        "Serve immediately."
      ]
    },
    {
      id: "d358", title: "Lebanese-Style Chicken Shish Taouk with Garlic Sauce", tags: ["quick"], cuisine: "Lebanon", protein: "chicken",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "chicken thigh fillets, cubed", "meat"), ing(2, "tbsp", "yoghurt", "dairy"),
        ing(1, "", "lemon, juiced", "produce"), ing(1, "tsp", "tomato puree", "store"),
        ing(1, "tsp", "paprika", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "garlic clove, extra, crushed, for the sauce", "produce"), ing(2, "tbsp", "yoghurt, extra, for the sauce", "dairy"),
        ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Mix the yoghurt, lemon juice, tomato puree, paprika, cumin, garlic and oil, and coat the chicken. Marinate for at least 5 minutes.",
        "Thread onto skewers or leave loose, and fry or grill over high heat for 8–10 minutes, turning, until charred and cooked through.",
        "Meanwhile, mix the extra garlic through the extra yoghurt to make a simple garlic sauce.",
        "Serve the chicken with the garlic sauce and warm flatbread."
      ]
    },
    {
      id: "d359", title: "Lebanese-Style Spiced Fish with Tahini (Samke Harra-Inspired)", tags: ["quick", "fish", "spicy"], cuisine: "Lebanon", protein: "fish",
      prep: 9, cook: 12,
      ingredients: [
        ing(160, "g", "white fish fillet", "meat"), ing(1, "tbsp", "olive oil", "store"),
        ing(2, "tbsp", "tahini", "store"), ing(1, "", "lemon, juiced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.5, "", "red onion, sliced", "produce"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(1, "tbsp", "pine nuts", "store"),
        ing(1, "tbsp", "coriander, chopped", "produce")
      ],
      steps: [
        "Heat the oil in a frying pan and fry the fish for 3–4 minutes each side until just cooked. Remove and keep warm.",
        "Whisk the tahini with the lemon juice, garlic and a splash of water until smooth and pourable.",
        "In the same pan, soften the onion and pepper with the chilli and cumin for 4–5 minutes.",
        "Spoon the tahini sauce over the fish, top with the onion and pepper mixture, and scatter with pine nuts and coriander."
      ]
    },
    {
      id: "d360", title: "Lebanese-Style Fattoush Salad with Grilled Halloumi", tags: ["quick", "vegetarian"], cuisine: "Lebanon", protein: "plant-based",
      prep: 9, cook: 8,
      ingredients: [
        ing(100, "g", "halloumi, sliced", "dairy"), ing(1, "", "pitta bread", "bakery"),
        ing(2, "handfuls", "mixed salad leaves", "produce"), ing(1, "", "tomato, chopped", "produce"),
        ing(0.5, "", "cucumber, chopped", "produce"), ing(2, "", "radishes, sliced", "produce"),
        ing(1, "", "spring onion, sliced", "produce"), ing(1, "tsp", "sumac", "spice"),
        ing(1, "tsp", "pomegranate molasses", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "lemon, juiced", "produce"), ing(1, "tbsp", "mint, chopped", "produce")
      ],
      steps: [
        "Toast or fry the pitta until crisp, then tear into pieces.",
        "Fry the halloumi slices in a dry pan for 2 minutes each side until golden.",
        "Toss the salad leaves, tomato, cucumber, radish and spring onion with the mint.",
        "Whisk the oil, lemon juice, sumac and pomegranate molasses for the dressing, and toss through the salad.",
        "Top with the halloumi and pitta chips to serve."
      ]
    },
    {
      id: "d361", title: "Filipino-Style Sinigang na Baboy (Sour Pork & Vegetable Soup)", tags: [], cuisine: "Philippines", protein: "pork",
      prep: 9, cook: 25,
      ingredients: [
        ing(150, "g", "pork shoulder, cubed", "meat"), ing(400, "ml", "water or light stock", "store"),
        ing(1, "tbsp", "tamarind paste", "store"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "", "tomato, chopped", "produce"), ing(0.5, "", "radish (mooli), sliced", "produce"),
        ing(50, "g", "green beans, halved", "produce"), ing(1, "handful", "spinach", "produce"),
        ing(1, "tbsp", "fish sauce", "store"), ing(1, "", "green chilli, finely chopped", "produce")
      ],
      steps: [
        "Simmer the pork in the water or stock with the onion and tomato for 15 minutes, skimming any foam.",
        "Stir in the tamarind paste until dissolved.",
        "Add the radish and green beans, and simmer for a further 6–8 minutes until tender.",
        "Stir in the spinach and chilli, and season with fish sauce.",
        "Serve hot in a deep bowl."
      ]
    },
    {
      id: "d362", title: "Filipino-Style Beef Tapa with Garlic Rice and Fried Egg (Tapsilog)", tags: ["quick"], cuisine: "Philippines", protein: "beef",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "beef sirloin, thinly sliced", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "lime juice", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "sugar", "store"), ing(150, "g", "cooked rice", "store"),
        ing(1, "", "garlic clove, extra, finely chopped, for the rice", "produce"), ing(1, "", "egg", "dairy"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "tomato, sliced, to serve", "produce")
      ],
      steps: [
        "Marinate the beef in the soy sauce, lime juice, garlic and sugar for 5 minutes.",
        "Heat half the oil in a pan and fry the extra garlic until golden, then stir through the rice until fragrant. Set aside.",
        "Wipe the pan, heat the rest of the oil until very hot, and fry the beef for 1–2 minutes each side until well browned.",
        "In the same pan, fry the egg to your liking.",
        "Plate the garlic rice, beef and fried egg together with the sliced tomato."
      ]
    },
    {
      id: "d363", title: "German-Style Chicken Jäger-Style with Creamy Mushroom Sauce", tags: ["quick"], cuisine: "Germany", protein: "chicken",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "chicken breast, flattened", "meat"), ing(1, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(30, "g", "breadcrumbs", "store"),
        ing(100, "g", "chestnut mushrooms, sliced", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(100, "ml", "chicken stock", "store"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(15, "g", "butter", "dairy"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(1, "tbsp", "parsley, chopped", "produce")
      ],
      steps: [
        "Coat the chicken in flour, then egg, then breadcrumbs.",
        "Heat the oil in a frying pan and fry the chicken for 4–5 minutes each side until golden and cooked through. Remove and keep warm.",
        "In the same pan, melt the butter and fry the onion and mushrooms for 4–5 minutes until softened.",
        "Add the stock and simmer for 2–3 minutes to reduce slightly, then stir in the soured cream.",
        "Spoon the mushroom sauce over the schnitzel and scatter with parsley."
      ]
    },
    {
      id: "d364", title: "German-Style Potato & Leek Soup (Kartoffelsuppe-Inspired)", tags: ["quick", "vegetarian"], cuisine: "Germany", protein: "plant-based",
      prep: 8, cook: 20,
      ingredients: [
        ing(200, "g", "potato, diced", "produce"), ing(1, "", "leek, sliced", "produce"),
        ing(15, "g", "butter", "dairy"), ing(400, "ml", "vegetable stock", "store"),
        ing(2, "tbsp", "milk or single cream", "dairy"), ing(1, "pinch", "nutmeg, grated", "spice"),
        ing(1, "tbsp", "chives, chopped", "produce")
      ],
      steps: [
        "Melt the butter in a pan and soften the leek for 4–5 minutes.",
        "Add the potato and stock, bring to a simmer, and cook for 15–18 minutes until the potato is tender.",
        "Roughly mash some of the potato in the pan to thicken the soup slightly.",
        "Stir in the milk or cream and nutmeg, and season to taste.",
        "Top with chives to serve."
      ]
    },
    {
      id: "d365", title: "Polish-Style Bigos (Hunter's Stew) with Pork and Sausage", tags: [], cuisine: "Poland", protein: "pork",
      prep: 9, cook: 25,
      ingredients: [
        ing(100, "g", "pork shoulder, diced", "meat"), ing(60, "g", "smoked sausage, sliced", "meat"),
        ing(150, "g", "sauerkraut, drained", "store"), ing(80, "g", "white cabbage, shredded", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "bay leaf", "spice"),
        ing(1, "tsp", "paprika", "spice"), ing(1, "tbsp", "tomato puree", "store"),
        ing(100, "ml", "stock", "store"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat the oil in a pan and brown the pork and sausage for 4–5 minutes.",
        "Add the onion and soften for 2–3 minutes.",
        "Stir in the sauerkraut, cabbage, tomato puree, paprika and bay leaf, then pour in the stock.",
        "Cover and simmer for 18–20 minutes, stirring occasionally, until the cabbage is tender and the stew has thickened.",
        "Remove the bay leaf before serving."
      ]
    },
    {
      id: "d366", title: "Polish-Style Potato Pancakes (Placki Ziemniaczane) with Apple Sauce", tags: ["quick", "vegetarian"], cuisine: "Poland", protein: "plant-based",
      prep: 9, cook: 12,
      ingredients: [
        ing(200, "g", "potato, peeled and grated", "produce"), ing(0.5, "", "onion, grated", "produce"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "pinch", "salt", "spice"), ing(3, "tbsp", "vegetable oil, for frying", "store"),
        ing(3, "tbsp", "apple sauce", "store"), ing(1, "tbsp", "soured cream", "dairy")
      ],
      steps: [
        "Squeeze as much liquid as possible out of the grated potato and onion using a clean tea towel.",
        "Mix with the egg, flour and a pinch of salt.",
        "Heat the oil in a frying pan and fry spoonfuls of the mixture, flattened slightly, for 3–4 minutes each side until golden and crisp.",
        "Drain on kitchen paper and serve hot with apple sauce and soured cream."
      ]
    },
    {
      id: "d367", title: "Tunisian-Style Ojja with Merguez and Eggs", tags: ["spicy"], cuisine: "Tunisia", protein: "lamb",
      prep: 8, cook: 18,
      ingredients: [
        ing(2, "", "merguez sausages (about 120g)", "meat"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(200, "g", "tinned chopped tomatoes", "store"), ing(1, "tsp", "harissa paste", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(2, "", "eggs", "dairy"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Fry the sliced merguez in a pan over medium heat for 4–5 minutes until browned. Remove and set aside.",
        "In the same pan, soften the pepper, onion and garlic for 4–5 minutes.",
        "Stir in the tomatoes, harissa and cumin, return the sausage to the pan, and simmer for 8–10 minutes.",
        "Make two wells in the sauce and crack in the eggs. Cover and cook for 4–5 minutes until the eggs are just set.",
        "Scatter with coriander and serve with crusty bread."
      ]
    },
    {
      id: "d368", title: "Tunisian-Style Harissa-Grilled Fish with Tomato & Olive Salad", tags: ["quick", "fish", "spicy"], cuisine: "Tunisia", protein: "fish",
      prep: 8, cook: 10,
      ingredients: [
        ing(160, "g", "white fish fillet", "meat"), ing(1, "tbsp", "harissa paste", "store"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "", "lemon, juiced", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(0.25, "", "cucumber, chopped", "produce"),
        ing(0.25, "", "red onion, sliced", "produce"), ing(1, "tbsp", "black olives", "store"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(0.5, "tsp", "ground cumin", "spice")
      ],
      steps: [
        "Mix the harissa, half the oil and half the lemon juice, and coat the fish.",
        "Grill or fry the fish for 3–4 minutes each side until cooked through.",
        "Meanwhile, toss the tomato, cucumber, onion, olives and parsley with the remaining oil, lemon juice and cumin.",
        "Serve the fish on top of the salad."
      ]
    },
    {
      id: "d369", title: "Singapore-Style Bak Kut Teh (Peppery Pork Rib Soup)", tags: [], cuisine: "Singapore", protein: "pork",
      prep: 8, cook: 35,
      ingredients: [
        ing(200, "g", "pork ribs", "meat"), ing(3, "", "garlic cloves, whole", "produce"),
        ing(1, "tsp", "white peppercorns, lightly crushed", "spice"), ing(1, "", "star anise", "spice"),
        ing(0.5, "", "cinnamon stick", "spice"), ing(1, "tbsp", "dark soy sauce", "store"),
        ing(1, "tbsp", "light soy sauce", "store"), ing(400, "ml", "stock", "store"),
        ing(1, "", "spring onion, sliced", "produce"), ing(1, "tbsp", "coriander, chopped", "produce")
      ],
      steps: [
        "Toast the peppercorns, star anise and cinnamon in a dry pot over medium heat for 1 minute until fragrant.",
        "Add the stock, garlic, pork ribs and both soy sauces.",
        "Bring to a simmer, cover, and cook gently for 30–35 minutes until the pork is very tender, skimming occasionally.",
        "Taste and adjust the seasoning, then scatter with spring onion and coriander to serve."
      ]
    },
    {
      id: "d370", title: "Singapore-Style Char Kway Teow with Egg and Beansprouts", tags: ["quick", "vegetarian"], cuisine: "Singapore", protein: "plant-based",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "flat rice noodles", "store"), ing(1, "", "egg", "dairy"),
        ing(60, "g", "beansprouts", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(1, "tbsp", "dark soy sauce", "store"), ing(1, "tbsp", "light soy sauce", "store"),
        ing(1, "tsp", "chilli paste", "store"), ing(1, "", "spring onion, sliced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Prepare the noodles according to the packet instructions.",
        "Heat the oil in a wok over high heat and stir-fry the garlic for 30 seconds.",
        "Push to one side, crack in the egg, and scramble briefly.",
        "Add the noodles, soy sauces and chilli paste, and toss over high heat for 2–3 minutes.",
        "Add the beansprouts and spring onion, toss for 1 minute until just wilted, and serve immediately."
      ]
    },
    {
      id: "d371", title: "Peruvian-Style Fish Ceviche with Sweet Potato and Corn", tags: ["quick", "fish"], cuisine: "Peru", protein: "fish",
      prep: 9, cook: 12,
      ingredients: [
        ing(150, "g", "firm white fish fillet (sea bass, bream or cod), diced", "meat"), ing(4, "", "limes, juiced", "produce"),
        ing(0.25, "", "red onion, very thinly sliced", "produce"), ing(1, "", "red chilli, finely sliced", "produce"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(1, "", "small sweet potato, peeled and cubed", "produce"),
        ing(0.5, "", "corn on the cob", "produce"), ing(1, "pinch", "salt", "spice")
      ],
      steps: [
        "Boil the sweet potato and corn in salted water for 10–12 minutes until tender, then drain and cool slightly.",
        "Toss the diced fish with the lime juice, red onion, chilli and salt.",
        "Leave to marinate in the fridge for 8–10 minutes, until the fish turns opaque and firms up.",
        "Stir through the coriander and serve with the sweet potato and corn alongside."
      ]
    },
    {
      id: "d372", title: "Peruvian-Style Beef Anticuchos with Aji Panca", tags: ["quick", "spicy"], cuisine: "Peru", protein: "beef",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "beef rump or sirloin, cubed", "meat"), ing(1, "tbsp", "aji panca paste (or smoked paprika and chilli paste)", "store"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.5, "", "corn on the cob, halved", "produce"), ing(1, "", "small potato, boiled and sliced", "produce")
      ],
      steps: [
        "Mix the aji panca paste (or paprika and chilli paste), garlic, cumin, vinegar and oil into a marinade and coat the beef. Marinate for 5 minutes.",
        "Thread the beef onto skewers.",
        "Grill or fry over high heat for 2–3 minutes each side until charred and cooked to your liking.",
        "Boil the corn and potato until tender, and serve alongside the skewers."
      ]
    },
    {
      id: "d373", title: "Austrian-Style Beef Goulash (Saftgulasch)", tags: [], cuisine: "Austria", protein: "beef",
      prep: 9, cook: 35,
      ingredients: [
        ing(150, "g", "beef shin or braising steak, diced", "meat"), ing(1, "", "onion, sliced", "produce"),
        ing(1, "tbsp", "sweet paprika", "spice"), ing(0.5, "tsp", "caraway seeds", "spice"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(200, "ml", "beef stock", "store"), ing(0.5, "tsp", "dried marjoram", "spice"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "crusty bread roll, to serve", "bakery")
      ],
      steps: [
        "Heat the oil in a pan and brown the beef in batches, then remove.",
        "Add the onion and soften for 5–6 minutes until golden.",
        "Stir in the paprika, caraway and garlic, cooking for 1 minute, then add the tomato puree, stock and beef.",
        "Cover and simmer gently for 30 minutes, stirring occasionally, until the beef is tender.",
        "Stir through the marjoram and serve with crusty bread."
      ]
    },
    {
      id: "d374", title: "Austrian-Style Mushroom & Herb Dumpling (Semmelknödel) in Mushroom Sauce", tags: ["vegetarian"], cuisine: "Austria", protein: "plant-based",
      prep: 9, cook: 18,
      ingredients: [
        ing(100, "g", "stale bread or bread roll, cubed", "bakery"), ing(80, "ml", "warm milk", "dairy"),
        ing(1, "", "egg", "dairy"), ing(0.25, "", "onion, finely chopped", "produce"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(150, "ml", "vegetable stock", "store"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(15, "g", "butter", "dairy"), ing(1, "tbsp", "chives, chopped", "produce")
      ],
      steps: [
        "Soak the bread cubes in the warm milk for 5 minutes.",
        "Fry the onion in a little butter until soft, then mix into the bread with the egg and parsley. Shape into one large dumpling.",
        "Lower the dumpling into a pan of gently simmering salted water, cover, and cook for 15 minutes until firm.",
        "Meanwhile, fry the mushrooms in the remaining butter for 4–5 minutes, add the stock, simmer for 2–3 minutes, then stir in the soured cream.",
        "Slice the dumpling and serve with the mushroom sauce, scattered with chives."
      ]
    },
    {
      id: "d375", title: "Georgian-Style Kharcho Soup (Spiced Beef & Rice Soup)", tags: [], cuisine: "Georgia", protein: "beef",
      prep: 8, cook: 25,
      ingredients: [
        ing(120, "g", "beef mince or diced stewing beef", "meat"), ing(40, "g", "rice", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(150, "g", "tinned chopped tomatoes", "store"), ing(20, "g", "walnuts, crushed", "store"),
        ing(400, "ml", "beef stock", "store"), ing(0.5, "tsp", "ground coriander", "spice"),
        ing(0.5, "tsp", "dried thyme", "spice"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(1, "tbsp", "coriander, chopped", "produce")
      ],
      steps: [
        "Brown the beef in a pan over medium-high heat for 4–5 minutes.",
        "Add the onion and garlic and soften for 3–4 minutes.",
        "Stir in the tomatoes, stock, ground coriander, thyme and chilli flakes, and simmer for 10 minutes.",
        "Add the rice and simmer for a further 12–15 minutes until the rice is tender.",
        "Stir in the crushed walnuts and finish with fresh coriander."
      ]
    },
    {
      id: "d376", title: "Georgian-Style Lobio (Spiced Bean Stew) with Cornbread", tags: ["vegan", "vegetarian"], cuisine: "Georgia", protein: "plant-based",
      prep: 8, cook: 15,
      ingredients: [
        ing(200, "g", "tinned red kidney beans, drained", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(20, "g", "walnuts, crushed", "store"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(0.5, "tsp", "ground fenugreek", "spice"),
        ing(0.5, "tsp", "ground coriander", "spice"), ing(1, "tsp", "red wine vinegar", "store"),
        ing(100, "ml", "vegetable stock", "store"), ing(1, "", "slice cornbread or flatbread, to serve", "bakery")
      ],
      steps: [
        "Soften the onion and garlic in a splash of oil for 4–5 minutes.",
        "Add the beans and stock, and simmer for 8–10 minutes.",
        "Mash a few of the beans against the side of the pan to thicken the stew slightly.",
        "Stir in the crushed walnuts, fenugreek, ground coriander and vinegar.",
        "Finish with fresh coriander and serve with cornbread or flatbread."
      ]
    },
    {
      id: "d377", title: "Colombian-Style Crispy Pork with Rice and Avocado (Chicharrón)", tags: [], cuisine: "Colombia", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(180, "g", "pork belly slices", "meat"), ing(1, "pinch", "salt", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(150, "g", "cooked rice", "store"), ing(0.5, "", "avocado, sliced", "produce"),
        ing(1, "", "lime, cut into wedges", "produce"), ing(1, "tbsp", "coriander, chopped", "produce"),
        ing(0.25, "", "red onion, thinly sliced", "produce")
      ],
      steps: [
        "Season the pork belly with salt, cumin and garlic.",
        "Fry skin-side down in a hot, dry pan for 8–10 minutes until deeply golden and crisp.",
        "Turn and cook for a further 4–5 minutes until cooked through. Rest for 2 minutes, then slice.",
        "Serve over the rice with sliced avocado, red onion, coriander and lime wedges."
      ]
    },
    {
      id: "d378", title: "Colombian-Style Coconut Fish with Rice (Coastal-Style)", tags: ["fish"], cuisine: "Colombia", protein: "fish",
      prep: 8, cook: 18,
      ingredients: [
        ing(160, "g", "white fish fillet", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "paprika", "spice"), ing(1, "", "lime, juiced", "produce"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(150, "g", "cooked rice, to serve", "store")
      ],
      steps: [
        "Soften the onion, pepper and garlic in a splash of oil for 4–5 minutes.",
        "Stir in the cumin and paprika and cook for 1 minute.",
        "Pour in the coconut milk and simmer for 5 minutes.",
        "Add the fish, cover, and cook gently for 8–10 minutes until it flakes easily.",
        "Finish with lime juice and coriander, and serve over the rice."
      ]
    },
    {
      id: "d379", title: "Kenyan-Style Grilled Spiced Lamb (Nyama Choma-Inspired)", tags: ["quick"], cuisine: "Kenya", protein: "lamb",
      prep: 8, cook: 10,
      ingredients: [
        ing(180, "g", "lamb leg steak or chops", "meat"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "ground coriander", "spice"),
        ing(1, "tsp", "paprika", "spice"), ing(1, "", "lemon, juiced", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "", "tomato, diced", "produce"),
        ing(0.25, "", "red onion, diced", "produce"), ing(1, "", "red chilli, finely chopped", "produce"),
        ing(1, "tbsp", "coriander, chopped", "produce")
      ],
      steps: [
        "Mix the garlic, ginger, ground coriander, paprika, half the lemon juice and the oil into a paste and rub over the lamb.",
        "Marinate for 5 minutes, then grill or fry over high heat for 4–5 minutes each side until charred and cooked to your liking. Rest for 2 minutes.",
        "Meanwhile, toss the tomato, red onion, chilli, coriander and remaining lemon juice for a kachumbari-style salad.",
        "Serve the lamb with the salad."
      ]
    },
    {
      id: "d380", title: "Kenyan-Style Coastal Coconut Fish Curry (Swahili-Style)", tags: ["fish"], cuisine: "Kenya", protein: "fish",
      prep: 8, cook: 16,
      ingredients: [
        ing(160, "g", "white fish fillet", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "tomato, chopped", "produce"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(1, "tsp", "curry powder", "spice"),
        ing(1, "", "green chilli, sliced", "produce"), ing(1, "tbsp", "coriander, chopped", "produce"),
        ing(150, "g", "cooked rice, to serve", "store")
      ],
      steps: [
        "Soften the onion, garlic and ginger in a splash of oil for 4–5 minutes.",
        "Add the tomato, turmeric, curry powder and chilli, and cook for 2–3 minutes.",
        "Pour in the coconut milk and simmer for 5 minutes.",
        "Add the fish, cover, and cook gently for 8 minutes until it flakes easily.",
        "Scatter with coriander and serve with rice."
      ]
    },
    {
      id: "d381", title: "Finnish-Style Creamy Mushroom & Barley Stew (Sienimuhennos-Inspired)", tags: ["quick", "vegetarian"], cuisine: "Finland", protein: "plant-based",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "cooked pearl barley (pouch)", "store"), ing(150, "g", "chestnut mushrooms, sliced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(15, "g", "butter", "dairy"),
        ing(100, "ml", "vegetable stock", "store"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(1, "pinch", "ground allspice", "spice"), ing(1, "tbsp", "dill, chopped", "produce")
      ],
      steps: [
        "Melt the butter in a pan and fry the onion and mushrooms for 6–8 minutes until golden.",
        "Add the barley and stock, and simmer for 4–5 minutes until warmed through and slightly thickened.",
        "Stir in the soured cream and allspice.",
        "Finish with dill and serve."
      ]
    },
    {
      id: "d382", title: "Finnish-Style Pork & Swede Bake (Lanttulaatikko-Inspired)", tags: [], cuisine: "Finland", protein: "pork",
      prep: 9, cook: 30,
      ingredients: [
        ing(250, "g", "swede, peeled and cubed", "produce"), ing(120, "g", "pork mince", "meat"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "egg", "dairy"),
        ing(15, "g", "butter", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(1, "pinch", "nutmeg, grated", "spice"), ing(2, "tbsp", "breadcrumbs", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C). Boil the swede in salted water for 12 minutes until tender, then drain.",
        "Mash the swede with the butter, milk, nutmeg and egg.",
        "Meanwhile, brown the pork mince and onion in a pan for 5–6 minutes, season, and spoon into a small ovenproof dish.",
        "Top with the mashed swede, sprinkle with breadcrumbs, and bake for 15 minutes until golden on top."
      ]
    },
    {
      id: "d383", title: "Canadian-Style Chicken Poutine with Cheese Curds", tags: ["quick"], cuisine: "Canada", protein: "chicken",
      prep: 8, cook: 20,
      ingredients: [
        ing(200, "g", "frozen chips", "frozen"), ing(100, "g", "chicken breast, diced", "meat"),
        ing(200, "ml", "chicken stock", "store"), ing(1, "tsp", "cornflour", "store"),
        ing(60, "g", "cheese curds or mozzarella, torn", "dairy"), ing(15, "g", "butter", "dairy"),
        ing(1, "pinch", "black pepper", "spice"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the chips in the oven according to the packet instructions until crisp.",
        "Meanwhile, heat the oil in a pan and fry the diced chicken for 6–7 minutes until cooked and golden.",
        "For the gravy, melt the butter in a small pan, whisk in the cornflour, then gradually add the stock, whisking until smooth. Simmer for 3–4 minutes until thickened. Season with black pepper.",
        "Pile the chips onto a plate, scatter over the chicken and cheese curds, and pour over the hot gravy so the cheese starts to melt."
      ]
    },
    {
      id: "d384", title: "Canadian-Style Maple Salmon with Wild Rice", tags: ["quick", "fish"], cuisine: "Canada", protein: "fish",
      prep: 7, cook: 15,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(1, "tbsp", "maple syrup", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(150, "g", "cooked wild rice (pouch)", "store"), ing(1, "", "lemon wedge", "produce"),
        ing(80, "g", "green beans", "produce")
      ],
      steps: [
        "Mix the maple syrup, soy sauce and garlic for the glaze.",
        "Heat a frying pan over medium-high heat and cook the salmon, skin-side down, for 4 minutes.",
        "Flip, brush with the glaze, and cook for 3–4 minutes more until glazed and cooked through.",
        "Meanwhile, steam the green beans for 4–5 minutes and warm the wild rice.",
        "Serve the salmon over the rice with the green beans, spooning over any extra glaze."
      ]
    },
    {
      id: "d385", title: "Norwegian-Style Fårikål (Lamb and Cabbage Stew)", tags: [], cuisine: "Norway", protein: "lamb",
      prep: 9, cook: 35,
      ingredients: [
        ing(180, "g", "lamb shoulder, diced", "meat"), ing(200, "g", "white cabbage, cut into wedges", "produce"),
        ing(1, "tsp", "whole black peppercorns", "spice"), ing(1, "", "bay leaf", "spice"),
        ing(300, "ml", "chicken or lamb stock", "store"), ing(15, "g", "butter", "dairy"),
        ing(1, "tsp", "plain flour", "store"), ing(200, "g", "potatoes, peeled and quartered", "produce"),
        ing(null, "to taste", "salt", "spice")
      ],
      steps: [
        "Peel and quarter the potatoes and boil in salted water for 15–18 minutes until tender.",
        "Meanwhile, in a small saucepan, layer the lamb and cabbage wedges, sprinkling the peppercorns between layers, and tuck in the bay leaf.",
        "Pour over the stock, bring to a simmer, cover and cook gently for 30–35 minutes until the lamb is tender.",
        "Melt the butter in a small pan, stir in the flour to make a paste, then whisk in a ladleful of the cooking liquid; stir this back into the stew to thicken slightly.",
        "Season with salt and serve the lamb and cabbage with the boiled potatoes alongside."
      ]
    },
    {
      id: "d386", title: "Norwegian-Style Creamy Fish Soup (Fiskesuppe)", tags: ["fish"], cuisine: "Norway", protein: "fish",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "skinless cod or haddock fillet, cut into chunks", "meat"), ing(1, "", "small carrot, diced", "produce"),
        ing(0.5, "", "leek, sliced", "produce"), ing(1, "", "small potato, diced", "produce"),
        ing(400, "ml", "fish or vegetable stock", "store"), ing(100, "ml", "double cream", "dairy"),
        ing(15, "g", "butter", "dairy"), ing(1, "tbsp", "fresh dill, chopped", "produce"),
        ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Melt the butter in a saucepan, add the carrot, leek and potato, and cook gently for 5 minutes until starting to soften.",
        "Pour in the stock, bring to a simmer and cook for 10 minutes until the vegetables are tender.",
        "Stir in the cream and bring back to a gentle simmer, then add the fish and poach for 4–5 minutes until just cooked through.",
        "Stir through most of the dill and season to taste.",
        "Ladle into a bowl, scatter with the remaining dill, and serve with the lemon wedge."
      ]
    },
    {
      id: "d387", title: "Canadian-Style Tourtière-Inspired Spiced Pork Mince with Mash", tags: [], cuisine: "Canada", protein: "pork",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1, "", "small onion, finely diced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.25, "tsp", "ground cinnamon", "spice"),
        ing(null, "pinch", "ground cloves", "spice"), ing(0.5, "tsp", "dried thyme", "spice"),
        ing(80, "g", "potato, finely diced", "produce"), ing(100, "ml", "chicken stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(250, "g", "potatoes, peeled and chopped, for mash", "produce"),
        ing(20, "g", "butter", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Boil the mash potatoes in salted water for 15–18 minutes until tender, then drain and mash with the butter and milk. Season and keep warm.",
        "Meanwhile, heat the oil in a frying pan and cook the onion for 3–4 minutes until soft.",
        "Add the garlic, cinnamon, cloves and thyme, and cook for 30 seconds until fragrant.",
        "Add the pork mince and diced potato, breaking up the mince, and cook for 5–6 minutes until browned.",
        "Pour in the stock, cover and simmer for 8–10 minutes until the potato is tender and the liquid has mostly reduced. Season to taste.",
        "Spoon the spiced pork mince over the mash to serve."
      ]
    },
    {
      id: "d388", title: "Canadian-Style Montreal Smoked Meat Sandwich with Mustard", tags: ["quick"], cuisine: "Canada", protein: "beef",
      prep: 7, cook: 8,
      ingredients: [
        ing(120, "g", "smoked beef brisket or pastrami-style deli meat, sliced", "meat"), ing(2, "", "slices rye bread", "bakery"),
        ing(1, "tbsp", "deli mustard", "store"), ing(1, "", "gherkin", "store")
      ],
      steps: [
        "Warm a frying pan or griddle over medium heat.",
        "Pile the smoked beef into the pan and warm through for 2–3 minutes, tossing, until heated and slightly crisped at the edges.",
        "Lightly toast the rye bread.",
        "Spread one slice with mustard, pile on the hot smoked beef, and top with the second slice.",
        "Cut in half and serve with the gherkin on the side."
      ]
    },
    {
      id: "d389", title: "Singapore-Style Hainanese Chicken Rice with Ginger-Chilli Sauce", tags: [], cuisine: "Singapore", protein: "chicken",
      prep: 9, cook: 25,
      ingredients: [
        ing(180, "g", "chicken thigh fillets", "meat"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(20, "g", "fresh ginger, finely grated", "produce"), ing(1, "", "spring onion, sliced", "produce"),
        ing(75, "g", "jasmine rice", "store"), ing(300, "ml", "chicken stock", "store"),
        ing(1, "tsp", "sesame oil", "store"), ing(1, "tbsp", "light soy sauce", "store"),
        ing(1, "", "red chilli, finely chopped", "produce"), ing(0.5, "", "lime", "produce"),
        ing(50, "g", "cucumber, sliced", "produce")
      ],
      steps: [
        "Put the chicken, half the ginger (bashed) and the garlic into a small pan, cover with the stock and bring to a gentle simmer. Poach for 15–18 minutes until cooked through, then remove the chicken and rest.",
        "Skim a little fat from the poaching liquid and use it to fry the rice for 1 minute, then add the hot poaching liquid and cook according to packet instructions, about 12–15 minutes, until tender.",
        "Meanwhile, finely grate the remaining ginger, mix with the chilli, sesame oil, soy sauce and a squeeze of lime to make the dipping sauce.",
        "Slice the chicken and serve on the rice with the cucumber, spring onion and dipping sauce on the side."
      ]
    },
    {
      id: "d390", title: "Peruvian-Style Aji de Gallina (Creamy Spiced Chicken)", tags: [], cuisine: "Peru", protein: "chicken",
      prep: 9, cook: 20,
      ingredients: [
        ing(150, "g", "cooked chicken breast, shredded", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "aji amarillo paste", "store"),
        ing(15, "g", "walnuts, crushed", "store"), ing(1, "", "slice white bread, crusts removed and torn", "bakery"),
        ing(100, "ml", "milk", "dairy"), ing(50, "ml", "chicken stock", "store"),
        ing(15, "g", "hard cheese, grated", "dairy"), ing(75, "g", "rice", "store"),
        ing(3, "", "black olives", "store"), ing(0.5, "", "boiled egg", "dairy")
      ],
      steps: [
        "Cook the rice according to packet instructions.",
        "Soak the torn bread in the milk for a few minutes to soften.",
        "Heat a little oil in a pan and fry the onion and garlic for 4–5 minutes until soft, then stir in the aji amarillo paste and cook for 1 minute.",
        "Add the soaked bread and milk, the stock, crushed walnuts and cheese, and simmer for 5 minutes, stirring, until thickened into a smooth sauce.",
        "Stir in the shredded chicken and warm through for 3–4 minutes.",
        "Serve over the rice, topped with the olives and boiled egg."
      ]
    },
    {
      id: "d391", title: "Australian-Style Beef & Gravy Pie with Mash and Peas", tags: [], cuisine: "Australia", protein: "beef",
      prep: 9, cook: 25,
      ingredients: [
        ing(150, "g", "beef steak, diced", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(200, "ml", "beef stock", "store"), ing(1, "tsp", "Worcestershire sauce", "store"),
        ing(1, "tsp", "tomato puree", "store"), ing(1, "tsp", "plain flour", "store"),
        ing(80, "g", "ready-rolled puff pastry", "bakery"), ing(200, "g", "potatoes, peeled and chopped", "produce"),
        ing(15, "g", "butter", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(60, "g", "frozen peas", "frozen")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C). Cut the puff pastry into a small lid shape and bake on a lined tray for 12–15 minutes until golden and puffed; set aside.",
        "Meanwhile, boil the potatoes for the mash for 15–18 minutes until tender.",
        "Heat a little oil in a saucepan, brown the beef for 3–4 minutes, then add the onion and cook for 3 minutes until softened.",
        "Stir in the flour, tomato puree and Worcestershire sauce, then pour in the stock. Simmer for 8–10 minutes until thickened and the beef is tender.",
        "Cook the peas in boiling water for 2–3 minutes, then drain. Mash the potatoes with the butter and milk and season.",
        "Spoon the beef and gravy over the mash, top with the pastry lid, and serve with the peas."
      ]
    },
    {
      id: "d392", title: "Austrian-Style Zwiebelrostbraten (Onion-Smothered Beef Steak)", tags: ["quick"], cuisine: "Austria", protein: "beef",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "beef sirloin or rump steak", "meat"), ing(1, "", "large onion, thinly sliced", "produce"),
        ing(1, "tbsp", "plain flour", "store"), ing(15, "g", "butter", "dairy"),
        ing(100, "ml", "beef stock", "store"), ing(0.5, "tsp", "paprika", "spice"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(200, "g", "new potatoes, halved", "produce")
      ],
      steps: [
        "Boil the new potatoes in salted water for 15–18 minutes until tender.",
        "Toss the sliced onion in the flour. Heat the oil in a frying pan and fry the onions for 6–8 minutes, stirring occasionally, until golden and crisp; remove and set aside.",
        "Season the steak, add to the same pan and fry for 2–3 minutes each side, then remove and rest.",
        "Add the butter and paprika to the pan, pour in the stock and simmer for 2 minutes, scraping up any bits, to make a quick gravy.",
        "Slice the steak, spoon over the gravy, and pile the crispy onions on top. Serve with the potatoes."
      ]
    },
    {
      id: "d393", title: "South African-Style Bunny Chow with Spiced Lamb Curry", tags: ["spicy"], cuisine: "South Africa", protein: "lamb",
      prep: 9, cook: 25,
      ingredients: [
        ing(150, "g", "lamb or lamb mince, diced", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1.5, "tbsp", "curry powder", "spice"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(100, "g", "tinned chopped tomatoes", "store"), ing(1, "", "small potato, diced", "produce"),
        ing(100, "ml", "lamb or vegetable stock", "store"), ing(1, "", "small crusty bread roll", "bakery"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Heat a little oil in a saucepan and fry the onion for 3–4 minutes until soft. Add the garlic, ginger, curry powder and turmeric, and cook for 1 minute.",
        "Add the lamb and brown for 4–5 minutes.",
        "Stir in the tomatoes, potato and stock, cover and simmer for 15–18 minutes until the lamb and potato are tender and the sauce has thickened.",
        "Slice the top off the bread roll and hollow out most of the middle to make a bowl.",
        "Spoon the curry into the hollowed bread, scatter with coriander, and serve with the reserved bread for dipping."
      ]
    },
    {
      id: "d394", title: "Georgian-Style Chakapuli (Lamb and Herb Stew)", tags: [], cuisine: "Georgia", protein: "lamb",
      prep: 9, cook: 30,
      ingredients: [
        ing(180, "g", "lamb shoulder, diced", "meat"), ing(3, "", "spring onions, chopped", "produce"),
        ing(2, "", "garlic cloves, sliced", "produce"), ing(1, "tbsp", "fresh tarragon, chopped", "produce"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce"), ing(1, "tbsp", "fresh dill, chopped", "produce"),
        ing(2, "tbsp", "white wine vinegar", "store"), ing(1, "tsp", "plum jam", "store"),
        ing(200, "ml", "vegetable or lamb stock", "store"), ing(1, "", "bay leaf", "spice"),
        ing(0.5, "", "green chilli, sliced", "produce"), ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Heat a splash of oil in a saucepan and brown the lamb for 4–5 minutes.",
        "Add the spring onions and garlic and cook for 2 minutes.",
        "Stir in the vinegar, plum jam, bay leaf and chilli, then pour in enough stock to just cover the lamb.",
        "Cover and simmer gently for 25–30 minutes until the lamb is tender.",
        "Stir through the tarragon, coriander and dill in the final few minutes of cooking, and season to taste.",
        "Serve in a bowl with the crusty bread."
      ]
    },
    {
      id: "d395", title: "Ukrainian-Style Deruny (Potato Pancakes) with Bacon and Soured Cream", tags: ["quick"], cuisine: "Ukraine", protein: "pork",
      prep: 10, cook: 12,
      ingredients: [
        ing(250, "g", "potatoes, peeled and grated", "produce"), ing(0.25, "", "onion, grated", "produce"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "plain flour", "store"),
        ing(2, "", "streaky bacon rashers, chopped", "meat"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(2, "tbsp", "soured cream", "dairy"), ing(1, "tbsp", "chives, chopped", "produce"),
        ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Grate the potatoes and onion, then squeeze out as much excess liquid as you can through a clean tea towel.",
        "Mix the grated potato and onion with the egg, flour, salt and pepper to make a batter.",
        "Fry the chopped bacon in a frying pan for 3–4 minutes until crisp, then remove and set aside, leaving the fat in the pan.",
        "Add the oil to the pan and spoon in the potato mixture in small rounds, flattening slightly. Fry for 3–4 minutes each side until golden and cooked through.",
        "Scatter the bacon over the pancakes and serve with a dollop of soured cream and the chives."
      ]
    },
    {
      id: "d396", title: "Colombian-Style Ajiaco Chicken and Potato Soup with Corn", tags: [], cuisine: "Colombia", protein: "chicken",
      prep: 9, cook: 25,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(100, "g", "waxy potato, diced", "produce"),
        ing(100, "g", "floury potato, diced", "produce"), ing(80, "g", "sweetcorn kernels", "frozen"),
        ing(400, "ml", "chicken stock", "store"), ing(1, "", "spring onion, sliced", "produce"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "capers", "store"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(0.25, "", "avocado, sliced", "produce")
      ],
      steps: [
        "Put the chicken, stock, garlic and half the diced potato into a pan, bring to a simmer and cook for 12–15 minutes until the chicken is cooked through.",
        "Remove the chicken, shred it, and return to the pan along with the remaining potato and the corn.",
        "Simmer for a further 10–12 minutes, mashing some of the potato against the side of the pan to thicken the soup slightly.",
        "Stir in the oregano and spring onion, and season to taste.",
        "Ladle into a bowl and top with the capers, a spoonful of soured cream, and the avocado slices."
      ]
    },
    {
      id: "d397", title: "Trinidadian-Style Buljol Saltfish Salad with Fried Bake", tags: ["fish"], cuisine: "Trinidad", protein: "fish",
      prep: 9, cook: 12,
      ingredients: [
        ing(120, "g", "skinless cod fillet", "meat"), ing(1, "", "small tomato, diced", "produce"),
        ing(0.5, "", "small onion, finely diced", "produce"), ing(0.5, "", "red pepper, finely diced", "produce"),
        ing(1, "", "lime", "produce"), ing(2, "tbsp", "olive oil", "store"),
        ing(1, "", "spring onion, sliced", "produce"), ing(100, "g", "self-raising flour", "store"),
        ing(60, "ml", "water", "store"), ing(null, "pinch", "salt", "spice"),
        ing(2, "tbsp", "vegetable oil, for frying", "store")
      ],
      steps: [
        "Poach the cod in a pan of gently simmering water for 6–8 minutes until cooked through, then drain and flake into large chunks.",
        "Toss the flaked cod with the tomato, onion, red pepper, spring onion, a good squeeze of lime juice and the olive oil. Season to taste.",
        "Mix the flour with a pinch of salt and enough water to bring together into a soft dough, then knead briefly and flatten into a round.",
        "Heat the vegetable oil in a frying pan and fry the bake for 3–4 minutes each side until golden and cooked through.",
        "Serve the buljol salad alongside the warm fried bake."
      ]
    },
    {
      id: "d398", title: "Kenyan-Style Chicken Pilau Rice with Whole Spices", tags: [], cuisine: "Kenya", protein: "chicken",
      prep: 8, cook: 25,
      ingredients: [
        ing(150, "g", "chicken thigh fillets, diced", "meat"), ing(75, "g", "basmati rice", "store"),
        ing(1, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "cumin seeds", "spice"),
        ing(3, "", "whole cloves", "spice"), ing(1, "", "cinnamon stick", "spice"),
        ing(3, "", "green cardamom pods", "spice"), ing(200, "ml", "chicken stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Heat the oil in a saucepan and fry the onion for 5–6 minutes until golden.",
        "Add the garlic, ginger, cumin seeds, cloves, cinnamon and cardamom, and cook for 1 minute until fragrant.",
        "Add the chicken and cook for 4–5 minutes until browned.",
        "Stir in the rice to coat in the spices, then pour in the stock. Bring to the boil, cover, reduce the heat and simmer for 15 minutes until the rice is tender and the liquid absorbed.",
        "Fluff with a fork and scatter with coriander to serve."
      ]
    },
    {
      id: "d399", title: "Belgian-Style Flemish Meatballs in Spiced Beer Gravy (Vlaamse Balletjes)", tags: [], cuisine: "Belgium", protein: "beef",
      prep: 9, cook: 20,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(20, "g", "breadcrumbs", "store"),
        ing(1, "", "egg", "dairy"), ing(0.5, "", "onion, finely diced", "produce"),
        ing(null, "pinch", "ground nutmeg", "spice"), ing(100, "ml", "brown ale or stout", "store"),
        ing(100, "ml", "beef stock", "store"), ing(1, "tsp", "brown sugar", "store"),
        ing(1, "", "bay leaf", "spice"), ing(1, "tsp", "plain flour", "store"),
        ing(15, "g", "butter", "dairy"), ing(200, "g", "potatoes, peeled and chopped, for mash", "produce"),
        ing(2, "tbsp", "milk", "dairy")
      ],
      steps: [
        "Mix the beef mince with the breadcrumbs, egg, half the diced onion, nutmeg, salt and pepper, and shape into 4–5 small meatballs.",
        "Boil the potatoes for the mash for 15–18 minutes until tender, then drain and mash with a little milk and butter; keep warm.",
        "Heat the butter in a frying pan and brown the meatballs for 5–6 minutes, turning, then remove.",
        "Add the remaining onion to the pan and cook for 3 minutes until soft, stir in the flour, then pour in the beer, stock, sugar and bay leaf.",
        "Return the meatballs to the pan, cover and simmer for 12–15 minutes until cooked through and the sauce has thickened slightly.",
        "Season to taste and serve the meatballs and gravy over the mash."
      ]
    },
    {
      id: "d400", title: "Finnish-Style Karjalanpaisti (Slow-Cooked Beef and Pork Stew)", tags: [], cuisine: "Finland", protein: "beef",
      prep: 9, cook: 35,
      ingredients: [
        ing(90, "g", "stewing beef, diced", "meat"), ing(90, "g", "pork shoulder, diced", "meat"),
        ing(1, "", "onion, sliced", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(1, "tsp", "whole black peppercorns", "spice"), ing(1, "", "bay leaf", "spice"),
        ing(250, "ml", "beef stock", "store"), ing(15, "g", "butter", "dairy"),
        ing(150, "g", "potatoes, boiled, to serve", "produce"), ing(null, "to taste", "salt", "spice")
      ],
      steps: [
        "Heat the butter in a saucepan and brown the beef and pork for 4–5 minutes.",
        "Add the onion and carrot and cook for 3 minutes.",
        "Add the peppercorns, bay leaf and stock, bring to a simmer, cover and cook gently for 30–35 minutes until the meat is tender.",
        "Meanwhile, boil the potatoes in salted water for 15–18 minutes until tender.",
        "Season the stew with salt, remove the bay leaf, and serve with the boiled potatoes."
      ]
    },
    {
      id: "d401", title: "Puerto Rican-Style Mofongo with Garlic Pork Crackling", tags: [], cuisine: "Puerto Rico", protein: "pork",
      prep: 9, cook: 20,
      ingredients: [
        ing(1, "", "large green (unripe) plantain, peeled and sliced", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(2, "tbsp", "olive oil", "store"), ing(100, "g", "pork belly slices or lardons", "meat"),
        ing(2, "tbsp", "chicken stock", "store"), ing(1, "", "lime wedge", "produce"),
        ing(null, "to taste", "salt", "spice")
      ],
      steps: [
        "Fry the plantain slices in the olive oil for 8–10 minutes, turning, until golden and tender.",
        "Meanwhile, fry the pork in a dry pan for 6–8 minutes until crisp and golden; remove, keeping the fat in the pan.",
        "Fry the crushed garlic in the pork fat for 30 seconds until fragrant.",
        "In a bowl, mash the fried plantain with the garlic, a little of the pork fat, and a splash of stock until roughly mashed. Season with salt.",
        "Stir most of the crispy pork through the mash, pack into a bowl, and top with the remaining pork. Serve with the lime wedge."
      ]
    },
    {
      id: "d402", title: "Moroccan-Style Kefta Mkaouara (Spiced Meatball and Egg Tagine)", tags: ["spicy"], cuisine: "Morocco", protein: "beef",
      prep: 9, cook: 20,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.25, "", "onion, grated", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.25, "tsp", "ground cinnamon", "spice"), ing(1, "tbsp", "fresh parsley, chopped", "produce"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce"), ing(200, "g", "tinned chopped tomatoes", "store"),
        ing(0.5, "tsp", "paprika", "spice"), ing(1, "", "egg", "dairy"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Mix the beef mince with the grated onion, garlic, cumin, cinnamon and half the herbs. Season and shape into small meatballs.",
        "Heat the oil in a frying pan, add the tomatoes and paprika, and simmer for 5 minutes.",
        "Nestle the meatballs into the sauce, cover and simmer for 10–12 minutes, turning occasionally, until cooked through.",
        "Make a small well in the sauce, crack in the egg, cover and cook for 3–4 minutes until the white is set but the yolk still soft.",
        "Scatter with the remaining herbs and serve with the crusty bread for dipping."
      ]
    },
    {
      id: "d403", title: "Thai-Style Chicken Pad Thai with Beansprouts and Lime", tags: ["quick"], cuisine: "Thailand", protein: "chicken",
      prep: 9, cook: 10,
      ingredients: [
        ing(100, "g", "flat rice noodles", "store"), ing(130, "g", "chicken breast, sliced", "meat"),
        ing(1, "", "egg", "dairy"), ing(60, "g", "beansprouts", "produce"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(1, "", "spring onion, sliced", "produce"),
        ing(1, "tbsp", "tamarind paste", "store"), ing(1, "tbsp", "fish sauce", "store"),
        ing(1, "tsp", "soft brown sugar", "store"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(1, "tbsp", "crushed roasted peanuts", "store"), ing(1, "", "lime wedge", "produce"),
        ing(null, "pinch", "dried chilli flakes", "spice")
      ],
      steps: [
        "Soak the rice noodles in boiled water according to packet instructions until just tender, then drain.",
        "Mix the tamarind paste, fish sauce and sugar in a small bowl to make the sauce.",
        "Heat the oil in a wok over high heat and stir-fry the chicken for 3–4 minutes until cooked through.",
        "Push to one side, crack in the egg and scramble briefly, then add the garlic and noodles and toss together.",
        "Pour in the sauce, add the beansprouts and spring onion, and toss for 1–2 minutes until well coated and hot.",
        "Serve scattered with the crushed peanuts, chilli flakes, and the lime wedge."
      ]
    },
    {
      id: "d404", title: "Japanese-Style Gyudon Beef and Onion Rice Bowl", tags: ["quick"], cuisine: "Japan", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef sirloin, thinly sliced", "meat"), ing(0.5, "", "onion, thinly sliced", "produce"),
        ing(2, "tbsp", "soy sauce", "store"), ing(2, "tbsp", "mirin", "store"),
        ing(1, "tbsp", "sake or dry sherry", "store"), ing(1, "tsp", "caster sugar", "store"),
        ing(100, "ml", "dashi or beef stock", "store"), ing(150, "g", "cooked rice", "store"),
        ing(1, "", "spring onion, sliced", "produce"), ing(1, "tbsp", "pickled ginger", "store")
      ],
      steps: [
        "Combine the soy sauce, mirin, sake, sugar and stock in a small saucepan and bring to a simmer.",
        "Add the sliced onion and simmer for 4–5 minutes until softened.",
        "Add the beef slices and simmer for 3–4 minutes until just cooked through, skimming any froth.",
        "Spoon the hot rice into a bowl and ladle over the beef, onion and sauce.",
        "Top with the spring onion and pickled ginger to serve."
      ]
    },
    {
      id: "d405", title: "Vietnamese-Style Bún Chả (Grilled Pork Patties with Noodles and Herbs)", tags: ["quick"], cuisine: "Vietnam", protein: "pork",
      prep: 10, cook: 12,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "", "shallot, finely chopped", "produce"), ing(2, "tbsp", "fish sauce", "store"),
        ing(1, "tbsp", "caster sugar", "store"), ing(75, "g", "vermicelli rice noodles", "store"),
        ing(2, "", "lettuce leaves", "produce"), ing(1, "tbsp", "fresh mint and coriander leaves", "produce"),
        ing(50, "g", "cucumber, sliced", "produce"), ing(0.5, "", "carrot, julienned", "produce"),
        ing(1, "tbsp", "rice vinegar", "store"), ing(0.5, "", "lime", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(0.5, "", "red chilli, sliced", "produce")
      ],
      steps: [
        "Mix the pork mince with the garlic, shallot, 1 tbsp fish sauce and 1 tsp of the sugar, then shape into small flat patties.",
        "Heat the oil in a frying pan and cook the patties for 3–4 minutes each side until charred and cooked through.",
        "Meanwhile, soak the noodles in boiled water for 4–5 minutes until tender, then drain and rinse in cold water.",
        "Mix the remaining fish sauce and sugar with the rice vinegar, lime juice and a splash of water to make a dipping sauce; stir in the chilli.",
        "Toss the carrot and cucumber briefly through the dipping sauce, then arrange the noodles, lettuce, herbs and pork patties in a bowl, and spoon over the dressing."
      ]
    },
    {
      id: "d406", title: "Sri Lankan-Style Chicken Kottu Roti with Vegetables", tags: ["spicy", "quick"], cuisine: "Sri Lanka", protein: "chicken",
      prep: 9, cook: 12,
      ingredients: [
        ing(2, "", "shop-bought roti or paratha, sliced into strips", "bakery"), ing(130, "g", "chicken breast, diced", "meat"),
        ing(0.5, "", "onion, sliced", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "carrot, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "curry powder", "spice"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "", "egg", "dairy"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "", "green chilli, sliced", "produce")
      ],
      steps: [
        "Heat 1 tbsp of the oil in a wok or large pan and stir-fry the chicken for 4–5 minutes until browned and cooked through; remove and set aside.",
        "Add the remaining oil, then the onion, pepper, carrot, garlic, ginger and chilli, and stir-fry for 3–4 minutes until softened.",
        "Push the vegetables aside, crack in the egg and scramble briefly.",
        "Add the roti strips, curry powder, soy sauce and the cooked chicken to the pan, and toss everything together vigorously for 2–3 minutes until well combined and hot through.",
        "Serve hot, with extra chilli or a wedge of lime if you like."
      ]
    },
    {
      id: "d407", title: "Israeli-Style Chicken Schnitzel with Israeli Salad", tags: [], cuisine: "Israel", protein: "chicken",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(40, "g", "breadcrumbs", "store"),
        ing(3, "tbsp", "vegetable oil, for frying", "store"), ing(1, "", "tomato, diced", "produce"),
        ing(0.5, "", "cucumber, diced", "produce"), ing(0.25, "", "red onion, finely diced", "produce"),
        ing(1, "tbsp", "fresh parsley, chopped", "produce"), ing(1, "tbsp", "lemon juice", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(null, "pinch", "salt", "spice")
      ],
      steps: [
        "Bash the chicken breast to an even thickness between two sheets of cling film.",
        "Set up three shallow dishes: flour, beaten egg, and breadcrumbs. Coat the chicken in flour, then egg, then breadcrumbs.",
        "Heat the vegetable oil in a frying pan and fry the schnitzel for 3–4 minutes each side until golden and cooked through.",
        "Meanwhile, toss the tomato, cucumber, red onion and parsley with the lemon juice, olive oil and a pinch of salt to make the Israeli salad.",
        "Serve the schnitzel with the salad alongside."
      ]
    },
    {
      id: "d408", title: "Nigerian-Style Pepper Soup with Chicken and Yam", tags: ["spicy"], cuisine: "Nigeria", protein: "chicken",
      prep: 9, cook: 25,
      ingredients: [
        ing(180, "g", "chicken thighs, skin removed", "meat"), ing(150, "g", "sweet potato (or yam), peeled and cubed", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(0.5, "", "scotch bonnet or bird's eye chilli, finely chopped", "produce"),
        ing(0.5, "tsp", "ground nutmeg", "spice"), ing(2, "", "whole cloves", "spice"),
        ing(0.5, "tsp", "cayenne pepper", "spice"), ing(400, "ml", "chicken stock", "store"),
        ing(1, "", "spring onion, sliced", "produce"), ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Put the chicken, onion, garlic, ginger, chilli, nutmeg, cloves and cayenne into a saucepan with the stock.",
        "Bring to a simmer, cover and cook for 15 minutes.",
        "Add the sweet potato and simmer for a further 10–12 minutes until the chicken is cooked through and the sweet potato is tender.",
        "Season to taste with salt.",
        "Ladle into a bowl and scatter with the spring onion and coriander to serve."
      ]
    },
    {
      id: "d409", title: "Filipino-Style Pancit Bihon (Stir-Fried Rice Noodles with Chicken and Vegetables)", tags: ["quick"], cuisine: "Philippines", protein: "chicken",
      prep: 9, cook: 12,
      ingredients: [
        ing(100, "g", "thin rice vermicelli noodles", "store"), ing(120, "g", "chicken breast, thinly sliced", "meat"),
        ing(0.5, "", "carrot, julienned", "produce"), ing(80, "g", "cabbage, shredded", "produce"),
        ing(40, "g", "green beans, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(2, "tbsp", "soy sauce", "store"), ing(100, "ml", "chicken stock", "store"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "", "lime wedge", "produce"),
        ing(1, "", "spring onion, sliced", "produce")
      ],
      steps: [
        "Soak the noodles in warm water for 8–10 minutes until softened, then drain.",
        "Heat the oil in a wok and stir-fry the chicken for 3–4 minutes until cooked through.",
        "Add the garlic, carrot, cabbage and green beans, and stir-fry for 2–3 minutes.",
        "Pour in the soy sauce and stock, add the drained noodles, and toss everything together for 2–3 minutes until the noodles have absorbed the liquid and are tender.",
        "Scatter with the spring onion and serve with the lime wedge."
      ]
    },
    {
      id: "d410", title: "Portuguese-Style Alentejana Pork with Potatoes and Coriander", tags: [], cuisine: "Portugal", protein: "pork",
      prep: 9, cook: 20,
      ingredients: [
        ing(150, "g", "pork loin, diced", "meat"), ing(200, "g", "potatoes, diced", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "paprika", "spice"),
        ing(1, "", "bay leaf", "spice"), ing(50, "ml", "white wine", "store"),
        ing(1, "tbsp", "white wine vinegar", "store"), ing(2, "tbsp", "olive oil", "store"),
        ing(2, "tbsp", "fresh coriander, chopped", "produce"), ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Toss the pork with the garlic, paprika, bay leaf and vinegar, and leave to marinate while you prep the rest.",
        "Heat 1 tbsp of the oil in a frying pan and fry the diced potato for 8–10 minutes, turning occasionally, until golden and cooked through; remove and set aside.",
        "Add the remaining oil to the pan and fry the marinated pork for 5–6 minutes until browned and cooked through.",
        "Pour in the wine and let it bubble for 1–2 minutes, scraping up any bits from the pan.",
        "Return the potatoes to the pan, toss everything together, and stir through the chopped coriander.",
        "Serve with the lemon wedge."
      ]
    },
    {
      id: "d411", title: "Indonesian-Style Soto Ayam (Turmeric Chicken Soup with Noodles and Egg)", tags: [], cuisine: "Indonesia", protein: "chicken",
      prep: 9, cook: 20,
      ingredients: [
        ing(150, "g", "chicken thigh fillets", "meat"), ing(400, "ml", "chicken stock", "store"),
        ing(1, "tsp", "ground turmeric", "spice"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "lemongrass stalk, bruised", "produce"),
        ing(50, "g", "vermicelli noodles", "store"), ing(1, "", "hard-boiled egg, halved", "dairy"),
        ing(40, "g", "beansprouts", "produce"), ing(1, "", "spring onion, sliced", "produce"),
        ing(1, "", "lime wedge", "produce"), ing(1, "tsp", "chilli sauce or sambal", "store")
      ],
      steps: [
        "Put the chicken, stock, turmeric, garlic, ginger and lemongrass into a saucepan, bring to a simmer and cook for 15 minutes until the chicken is cooked through.",
        "Remove the chicken, shred it, and return it to the pan.",
        "Meanwhile, soak the noodles in boiled water for 4–5 minutes until tender, then drain and place in a bowl.",
        "Ladle the hot soup and shredded chicken over the noodles.",
        "Top with the boiled egg, beansprouts and spring onion, and serve with the lime wedge and chilli sauce on the side."
      ]
    },
    {
      id: "d412", title: "Kiwi-Style Mince and Cheese Pie", tags: [], cuisine: "New Zealand", protein: "beef",
      prep: 8, cook: 22,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(1, "tsp", "Worcestershire sauce", "store"), ing(100, "ml", "beef stock", "store"),
        ing(1, "tsp", "cornflour", "store"), ing(40, "g", "mature cheddar, grated", "dairy"),
        ing(0.3, "sheet", "ready-rolled puff pastry", "bakery"), ing(1, "", "egg, beaten", "dairy"),
        ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C).",
        "Heat a little oil in a pan and fry the onion and garlic for 2–3 minutes until soft, then add the mince and brown well.",
        "Stir in the tomato puree, Worcestershire sauce and stock, and simmer for 8–10 minutes until thickened. Mix the cornflour with a splash of water, stir in to thicken further, then season and stir through the cheddar.",
        "Spoon the mince into a small ovenproof dish, top with the pastry trimmed to fit, and press the edges to seal.",
        "Brush the pastry with beaten egg and cut a small slit in the top. Bake for 18–20 minutes until golden and puffed."
      ]
    },
    {
      id: "d413", title: "New Zealand-Style Pan-Fried Snapper with Kumara Wedges", tags: ["fish"], cuisine: "New Zealand", protein: "fish",
      prep: 8, cook: 20,
      ingredients: [
        ing(200, "g", "kumara (sweet potato), cut into wedges", "produce"), ing(2, "tbsp", "olive oil", "store"),
        ing(150, "g", "snapper or sea bream fillet", "meat"), ing(15, "g", "butter", "dairy"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "", "lemon", "produce"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C). Toss the kumara wedges in 1 tablespoon of the oil and a pinch of salt, and roast for 20 minutes, turning halfway, until tender and golden.",
        "Pat the fish dry and season both sides.",
        "Heat the remaining oil and the butter in a frying pan over medium-high heat. Fry the fish for 3–4 minutes per side until golden and cooked through, adding the garlic for the last minute.",
        "Squeeze the lemon over the fish and scatter with parsley. Serve with the kumara wedges."
      ]
    },
    {
      id: "d414", title: "Egyptian-Style Ta'ameya Fava Bean Falafel with Tahini", tags: ["vegan"], cuisine: "Egypt", protein: "plant-based",
      prep: 9, cook: 8,
      ingredients: [
        ing(200, "g", "tinned broad beans, drained and skins removed", "store"), ing(0.5, "", "small onion, roughly chopped", "produce"),
        ing(2, "", "garlic cloves, finely chopped", "produce"), ing(15, "g", "fresh coriander, chopped", "produce"),
        ing(15, "g", "fresh parsley, chopped", "produce"), ing(1, "tsp", "ground cumin", "spice"),
        ing(1, "tsp", "ground coriander", "spice"), ing(0.5, "tsp", "baking powder", "store"),
        ing(2, "tbsp", "plain flour", "store"), ing(3, "tbsp", "vegetable oil, for frying", "store"),
        ing(2, "tbsp", "tahini", "store"), ing(1, "tbsp", "lemon juice", "produce"),
        ing(1, "", "pitta bread", "bakery")
      ],
      steps: [
        "Blitz the broad beans, onion, garlic, herbs, cumin and ground coriander in a food processor to a coarse paste.",
        "Stir in the flour and baking powder, season well, then shape into 5–6 small patties.",
        "Heat the oil in a frying pan and shallow-fry the patties for 2–3 minutes each side until golden and crisp.",
        "Whisk the tahini with the lemon juice and a splash of water to a drizzling consistency.",
        "Serve the patties in warmed pitta with the tahini sauce spooned over."
      ]
    },
    {
      id: "d415", title: "Tunisian-Style Brik Pastry with Tuna and Egg", tags: ["fish"], cuisine: "Tunisia", protein: "fish",
      prep: 9, cook: 6,
      ingredients: [
        ing(2, "sheets", "filo pastry", "bakery"), ing(1, "small tin", "tuna, drained", "store"),
        ing(1, "", "egg", "dairy"), ing(1, "tbsp", "capers, chopped", "store"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(0.25, "", "onion, finely chopped", "produce"),
        ing(1, "tsp", "harissa paste", "store"), ing(3, "tbsp", "vegetable oil, for frying", "store"),
        ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "In a bowl, mix the tuna, onion, capers, parsley and harissa.",
        "Lay the filo sheets stacked together, spoon the tuna mixture into the centre and make a small well.",
        "Crack the egg into the well, then fold the pastry over into a semi-circle, sealing the edges with a little water and keeping the egg intact.",
        "Heat the oil in a frying pan and fry the brik for 2 minutes each side until golden and crisp, with the egg still soft inside.",
        "Drain briefly on kitchen paper and serve with the lemon wedge."
      ]
    },
    {
      id: "d416", title: "Swedish-Style Jansson's Frestelse Potato & Anchovy Gratin", tags: ["fish"], cuisine: "Sweden", protein: "fish",
      prep: 8, cook: 38,
      ingredients: [
        ing(250, "g", "potatoes, peeled and cut into matchsticks", "produce"), ing(0.5, "", "onion, thinly sliced", "produce"),
        ing(8, "", "anchovy fillets, chopped", "store"), ing(100, "ml", "double cream", "dairy"),
        ing(15, "g", "butter", "dairy"), ing(2, "tbsp", "breadcrumbs", "store"),
        ing(null, "pinch", "black pepper", "spice")
      ],
      steps: [
        "Preheat the oven to 200C (fan 180C).",
        "Layer the potato, onion and chopped anchovies in a small baking dish, seasoning with pepper as you go (the anchovies are salty, so no extra salt is needed).",
        "Pour the cream over, dot with the butter and scatter the breadcrumbs on top.",
        "Bake for 35–38 minutes until the potatoes are tender and the top is golden."
      ]
    },
    {
      id: "d417", title: "Argentinian-Style Locro Corn, Bean and Pork Stew", tags: [], cuisine: "Argentina", protein: "pork",
      prep: 9, cook: 25,
      ingredients: [
        ing(100, "g", "pork shoulder, diced small", "meat"), ing(40, "g", "chorizo, sliced", "meat"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(100, "g", "butternut squash, diced", "produce"), ing(100, "g", "tinned sweetcorn", "store"),
        ing(100, "g", "tinned butter beans, drained", "store"), ing(200, "ml", "chicken stock", "store"),
        ing(1, "tsp", "smoked paprika", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "", "spring onion, sliced", "produce"), ing(null, "pinch", "chilli flakes", "spice")
      ],
      steps: [
        "Heat a splash of oil in a pan and brown the pork and chorizo for 3–4 minutes.",
        "Add the onion and garlic and soften for 2 minutes, then stir in the paprika and cumin and cook for 30 seconds.",
        "Add the squash, sweetcorn, beans and stock. Simmer for 20–25 minutes until the squash is tender and the stew has thickened.",
        "Season to taste and scatter with spring onion and chilli flakes to serve."
      ]
    },
    {
      id: "d418", title: "Russian-Style Beef and Cabbage Solyanka Soup", tags: [], cuisine: "Russia", protein: "beef",
      prep: 9, cook: 18,
      ingredients: [
        ing(120, "g", "beef sirloin, thinly sliced", "meat"), ing(40, "g", "salami, chopped", "meat"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "gherkin, chopped", "store"),
        ing(1, "tbsp", "tomato puree", "store"), ing(300, "ml", "beef stock", "store"),
        ing(1, "tsp", "capers", "store"), ing(1, "", "bay leaf", "spice"),
        ing(2, "", "thin slices lemon", "produce"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "dill, chopped", "produce")
      ],
      steps: [
        "Heat a little oil in a pan and fry the onion until soft.",
        "Add the beef and salami and brown for 2–3 minutes.",
        "Stir in the tomato puree, cook for 1 minute, then add the stock, gherkin, capers and bay leaf. Simmer for 15 minutes until the beef is tender.",
        "Ladle into a bowl, top with a slice of lemon, a spoonful of soured cream and a scattering of dill."
      ]
    },
    {
      id: "d419", title: "Dutch-Style Beef Croquettes (Bitterballen-Inspired) with Mustard", tags: [], cuisine: "Netherlands", protein: "beef",
      prep: 9, cook: 10,
      ingredients: [
        ing(100, "g", "cooked roast beef or beef mince, finely chopped", "meat"), ing(15, "g", "butter", "dairy"),
        ing(15, "g", "plain flour", "store"), ing(150, "ml", "beef stock", "store"),
        ing(1, "tsp", "Dijon mustard", "store"), ing(null, "pinch", "nutmeg, grated", "spice"),
        ing(1, "", "egg, beaten", "dairy"), ing(40, "g", "breadcrumbs", "store"),
        ing(3, "tbsp", "vegetable oil, for frying", "store"), ing(1, "tsp", "mustard, to serve", "store")
      ],
      steps: [
        "Melt the butter in a small pan, stir in the flour and cook for 1 minute to make a roux.",
        "Gradually whisk in the stock until smooth and thick, then stir in the chopped beef, mustard and nutmeg. Cook for 2–3 minutes until very thick.",
        "Spread the mixture onto a plate and chill in the freezer for 15 minutes until firm enough to shape.",
        "Roll into 4–5 balls, dip each in beaten egg then breadcrumbs.",
        "Heat the oil in a pan and fry the croquettes for 3–4 minutes, turning, until deep golden and crisp. Serve hot with mustard."
      ]
    },
    {
      id: "d420", title: "Hawaiian-Style Huli Huli Chicken Thighs with Pineapple Rice", tags: ["quick"], cuisine: "Hawaii", protein: "chicken",
      prep: 7, cook: 14,
      ingredients: [
        ing(2, "", "boneless chicken thighs", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "ketchup", "store"), ing(1, "tbsp", "brown sugar", "store"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tbsp", "pineapple juice", "store"), ing(150, "g", "cooked rice", "store"),
        ing(60, "g", "tinned pineapple chunks", "store"), ing(1, "", "spring onion, sliced", "produce"),
        ing(1, "tsp", "sesame seeds", "spice")
      ],
      steps: [
        "Mix the soy sauce, ketchup, brown sugar, ginger, garlic and pineapple juice for the marinade. Toss the chicken thighs in half of it.",
        "Heat a griddle or frying pan and cook the chicken for 5–6 minutes each side, brushing with the remaining marinade, until sticky and cooked through.",
        "Rest for 2 minutes, then slice.",
        "Warm the rice with the pineapple chunks. Serve the chicken over the pineapple rice, scattered with spring onion and sesame seeds."
      ]
    },
    {
      id: "d421", title: "Armenian-Style Lahmacun Flatbread with Spiced Beef Mince", tags: ["quick"], cuisine: "Armenia", protein: "beef",
      prep: 9, cook: 9,
      ingredients: [
        ing(1, "", "large flatbread or pitta", "bakery"), ing(100, "g", "beef mince", "meat"),
        ing(0.5, "", "onion, finely chopped", "produce"), ing(0.5, "", "red pepper, finely chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "paprika", "spice"),
        ing(null, "pinch", "chilli flakes", "spice"), ing(1, "tbsp", "parsley, chopped", "produce"),
        ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Preheat the oven to 220C (fan 200C).",
        "Mix the onion, pepper and garlic with the beef mince, tomato puree, cumin, paprika, chilli flakes and half the parsley. Season well.",
        "Spread the mince mixture thinly and evenly over the flatbread, right to the edges.",
        "Bake on a tray for 8–9 minutes until the meat is cooked and the edges are crisp.",
        "Scatter with the remaining parsley, squeeze over lemon and roll or fold to eat."
      ]
    },
    {
      id: "d422", title: "Uzbek-Style Manti Dumplings with Soured Cream", tags: [], cuisine: "Uzbekistan", protein: "lamb",
      prep: 10, cook: 14,
      ingredients: [
        ing(100, "g", "lamb mince", "meat"), ing(0.5, "", "onion, very finely chopped", "produce"),
        ing(1, "tsp", "ground cumin", "spice"), ing(null, "pinch", "black pepper", "spice"),
        ing(10, "", "fresh dumpling or wonton wrappers", "store"), ing(1, "tbsp", "butter, melted", "dairy"),
        ing(2, "tbsp", "soured cream", "dairy"), ing(1, "tbsp", "dill, chopped", "produce"),
        ing(null, "pinch", "paprika", "spice")
      ],
      steps: [
        "Mix the lamb mince with the onion, cumin and pepper.",
        "Place a teaspoon of filling in the centre of each wrapper, dampen the edges with water and pinch closed into small parcels.",
        "Steam the dumplings in a steamer basket over simmering water for 12–14 minutes until the lamb is cooked through.",
        "Drizzle with the melted butter and serve topped with soured cream, a scattering of dill and a pinch of paprika."
      ]
    },
    {
      id: "d423", title: "Chilean-Style Chorrillana Loaded Fries with Beef and Fried Egg", tags: [], cuisine: "Chile", protein: "beef",
      prep: 8, cook: 18,
      ingredients: [
        ing(200, "g", "frozen chips", "frozen"), ing(120, "g", "beef sirloin, thinly sliced", "meat"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "egg", "dairy"),
        ing(40, "g", "cheddar, grated", "dairy"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the chips in the oven according to the packet instructions until golden and crisp.",
        "Meanwhile, heat a little oil in a frying pan and fry the onion until soft and starting to caramelise. Remove and set aside.",
        "Season the beef with the paprika, add to the hot pan and fry for 2–3 minutes until browned.",
        "Fry the egg in a separate pan to your liking.",
        "Pile the chips onto a plate, top with the beef, onion and grated cheese, then finish with the fried egg."
      ]
    },
    {
      id: "d424", title: "Ghanaian-Style Kontomire Stew with Smoked Mackerel", tags: ["fish"], cuisine: "Ghana", protein: "fish",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "spinach, chopped", "produce"), ing(100, "g", "smoked mackerel fillet, flaked", "meat"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "tomato, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(0.5, "", "stock cube", "store")
      ],
      steps: [
        "Heat the oil in a pan and fry the onion, garlic and chilli flakes for 2–3 minutes until softened.",
        "Add the chopped tomato and cook for 2 minutes until pulpy.",
        "Crumble in the stock cube with a splash of water, then stir in the spinach and cook for 3–4 minutes until wilted.",
        "Fold through the flaked smoked mackerel and warm through for 2 minutes. Serve hot, with rice if you like."
      ]
    },
    {
      id: "d425", title: "Senegalese-Style Ndambe Black-Eyed Bean Stew", tags: ["vegan"], cuisine: "Senegal", protein: "plant-based",
      prep: 7, cook: 16,
      ingredients: [
        ing(240, "g", "tinned black-eyed beans, drained", "store"), ing(0.5, "", "onion, chopped", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "ground ginger", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(100, "ml", "vegetable stock", "store"),
        ing(1, "", "lime, juiced", "produce"), ing(1, "tbsp", "coriander, chopped", "produce")
      ],
      steps: [
        "Heat a splash of oil in a pan and fry the onion and garlic for 2–3 minutes until soft.",
        "Stir in the tomato, tomato puree, ginger and chilli flakes, and cook for 2 minutes.",
        "Add the black-eyed beans and stock, and simmer for 12–15 minutes until thickened.",
        "Squeeze in the lime juice and season to taste. Scatter with coriander to serve."
      ]
    },
    {
      id: "d426", title: "Swiss-Style Älplermagronen (Alpine Macaroni Bake with Bacon and Cheese)", tags: [], cuisine: "Switzerland", protein: "pork",
      prep: 8, cook: 12,
      ingredients: [
        ing(100, "g", "macaroni", "store"), ing(100, "g", "potato, peeled and diced small", "produce"),
        ing(40, "g", "smoked bacon lardons", "meat"), ing(0.5, "", "onion, sliced", "produce"),
        ing(60, "ml", "double cream", "dairy"), ing(60, "g", "Gruyère, grated", "dairy"),
        ing(null, "pinch", "nutmeg, grated", "spice"), ing(1, "tbsp", "apple sauce, to serve", "store")
      ],
      steps: [
        "Cook the macaroni and diced potato together in a pan of boiling salted water for 8–10 minutes until both are tender, then drain.",
        "Meanwhile, fry the bacon and onion in a dry pan until the bacon is crisp and the onion golden.",
        "Return the pasta and potato to the pan, stir through the cream and most of the cheese until melted and creamy, and season with nutmeg.",
        "Top with the bacon, onion and remaining cheese. Serve with a spoonful of apple sauce on the side."
      ]
    },
    {
      id: "d427", title: "Danish-Style Stegt Flæsk (Crispy Pork Belly) with Parsley Potatoes", tags: [], cuisine: "Denmark", protein: "pork",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "pork belly slices", "meat"), ing(250, "g", "new potatoes", "produce"),
        ing(15, "g", "butter", "dairy"), ing(1, "tbsp", "plain flour", "store"),
        ing(150, "ml", "milk", "dairy"), ing(1, "tbsp", "parsley, chopped", "produce"),
        ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Boil the new potatoes for 12–15 minutes until tender, then drain.",
        "Meanwhile, season the pork belly slices and fry in a dry pan over medium-high heat for 4–5 minutes each side until deeply golden and crisp. Remove and keep warm.",
        "For the parsley sauce, melt the butter in a small pan, stir in the flour and cook for 1 minute, then gradually whisk in the milk. Simmer for 2–3 minutes until thickened, then stir through the parsley and season.",
        "Serve the crispy pork belly with the potatoes and parsley sauce spooned over."
      ]
    },
    {
      id: "d428", title: "Lebanese-Style Freekeh Pilaf with Spiced Chicken", tags: [], cuisine: "Lebanon", protein: "chicken",
      prep: 8, cook: 20,
      ingredients: [
        ing(1, "", "chicken breast, diced", "meat"), ing(75, "g", "freekeh", "store"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "tbsp", "toasted flaked almonds", "store"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(0.5, "tsp", "ground allspice", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(200, "ml", "chicken stock", "store"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Rinse the freekeh. Heat the oil in a pan and fry the onion for 2–3 minutes until soft.",
        "Add the diced chicken and spices, and cook for 3–4 minutes until the chicken starts to colour.",
        "Stir in the freekeh and stock, bring to a simmer, cover and cook for 15–18 minutes until the freekeh is tender and the liquid absorbed.",
        "Fluff through with a fork, scatter with the toasted almonds and parsley, and finish with a squeeze of lemon."
      ]
    },
    {
      id: "d429", title: "Korean-Style Spicy Squid Stir-Fry (Ojingeo Bokkeum)", tags: ["spicy", "fish"], cuisine: "Korea", protein: "fish",
      prep: 9, cook: 8,
      ingredients: [
        ing(150, "g", "squid rings, defrosted if frozen", "frozen"), ing(1, "tbsp", "gochujang", "store"),
        ing(1, "tsp", "gochugaru or chilli flakes", "spice"), ing(1, "tsp", "soy sauce", "store"),
        ing(1, "tsp", "sesame oil", "store"), ing(1, "tsp", "honey", "store"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "", "carrot, julienned", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(1, "", "spring onion, sliced", "produce"), ing(1, "tsp", "sesame seeds", "spice"),
        ing(150, "g", "cooked rice, to serve", "store")
      ],
      steps: [
        "Mix the gochujang, gochugaru, soy sauce, sesame oil, honey and garlic for the sauce.",
        "Heat a splash of oil in a hot wok or frying pan and stir-fry the onion, carrot and pepper for 2–3 minutes until just softened.",
        "Add the squid and stir-fry for 1–2 minutes only, until just opaque (do not overcook or it will turn rubbery).",
        "Pour in the sauce and toss everything together for 1 minute until glossy.",
        "Scatter with spring onion and sesame seeds, and serve with rice."
      ]
    },
    {
      id: "d430", title: "Spanish-Style Pisto Manchego with Fried Egg", tags: ["vegetarian"], cuisine: "Spain", protein: "plant-based",
      prep: 9, cook: 18,
      ingredients: [
        ing(1, "", "courgette, diced", "produce"), ing(0.5, "", "red pepper, diced", "produce"),
        ing(0.5, "", "green pepper, diced", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(200, "g", "tinned chopped tomatoes", "store"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "", "egg", "dairy"), ing(1, "slice", "crusty bread, to serve", "bakery")
      ],
      steps: [
        "Heat the olive oil in a pan and fry the onion, peppers and garlic for 4–5 minutes until softened.",
        "Add the courgette and cook for a further 3–4 minutes.",
        "Stir in the tinned tomatoes and smoked paprika, season, and simmer for 12–15 minutes until thick and jammy.",
        "Meanwhile, fry the egg in a little oil until the white is set.",
        "Spoon the pisto into a bowl, top with the fried egg and serve with crusty bread."
      ]
    },
    {
      id: "d431", title: "Nashville-Style Hot Chicken Sandwich", tags: ["spicy"], cuisine: "USA", protein: "chicken",
      prep: 9, cook: 12,
      ingredients: [
        ing(1, "", "chicken breast, flattened", "meat"), ing(100, "ml", "buttermilk", "dairy"),
        ing(40, "g", "plain flour", "store"), ing(0.5, "tsp", "cayenne pepper", "spice"),
        ing(0.5, "tsp", "paprika", "spice"), ing(4, "tbsp", "vegetable oil, for frying", "store"),
        ing(1, "tbsp", "hot sauce", "store"), ing(1, "tsp", "brown sugar", "store"),
        ing(1, "", "burger bun", "bakery"), ing(3, "", "gherkin slices", "store"),
        ing(1, "tbsp", "mayonnaise", "store")
      ],
      steps: [
        "Marinate the chicken in the buttermilk while you prepare everything else.",
        "Mix the flour with half the cayenne and paprika. Coat the chicken in the seasoned flour, pressing to adhere.",
        "Shallow-fry the chicken in hot oil for 4–5 minutes each side until golden, crisp and cooked through.",
        "Warm 2 tablespoons of the frying oil with the hot sauce, remaining cayenne and brown sugar to make the Nashville glaze, and brush generously over the hot chicken.",
        "Pile into the toasted bun with mayonnaise and gherkin slices."
      ]
    },
    {
      id: "d432", title: "Malaysian-Style Nasi Lemak with Sambal Chicken", tags: ["spicy"], cuisine: "Malaysia", protein: "chicken",
      prep: 9, cook: 20,
      ingredients: [
        ing(120, "g", "basmati rice", "store"), ing(100, "ml", "coconut milk", "store"),
        ing(1, "", "chicken breast, sliced", "meat"), ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "tbsp", "sambal oelek or chilli paste", "store"), ing(1, "tsp", "tamarind paste", "store"),
        ing(1, "tsp", "sugar", "store"), ing(0.25, "", "cucumber, sliced", "produce"),
        ing(1, "", "egg, hard-boiled", "dairy"), ing(15, "g", "roasted peanuts", "store"),
        ing(1, "", "lime wedge", "produce")
      ],
      steps: [
        "Rinse the rice and cook with the coconut milk and a pinch of salt according to the packet timings until tender and fragrant.",
        "Meanwhile, fry the onion in a little oil until soft, then stir in the sambal, tamarind paste and sugar to make a quick sauce. Simmer for 2–3 minutes.",
        "Add the sliced chicken and cook for 6–7 minutes until cooked through and coated in the sauce.",
        "Serve the coconut rice with the sambal chicken, cucumber slices, halved boiled egg, peanuts and a lime wedge."
      ]
    },
    {
      id: "d433", title: "Persian-Style Ghormeh Sabzi Herb & Lamb Stew", tags: [], cuisine: "Iran", protein: "lamb",
      prep: 10, cook: 30,
      ingredients: [
        ing(120, "g", "lamb shoulder, diced", "meat"), ing(20, "g", "parsley, chopped", "produce"),
        ing(20, "g", "coriander, chopped", "produce"), ing(1, "", "spring onion, chopped", "produce"),
        ing(50, "g", "spinach, chopped", "produce"), ing(0.5, "", "onion, chopped", "produce"),
        ing(100, "g", "tinned red kidney beans, drained", "store"), ing(0.5, "tsp", "turmeric", "spice"),
        ing(1, "tbsp", "lemon juice", "produce"), ing(200, "ml", "stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat the oil in a pan and fry the onion until soft, then add the lamb and turmeric and brown for 3–4 minutes.",
        "Add the stock and lemon juice, bring to a simmer, cover and cook for 20 minutes.",
        "Meanwhile, fry the chopped herbs and spinach in a little oil for 3–4 minutes until darkened and fragrant, then stir into the stew along with the kidney beans.",
        "Simmer for a further 10 minutes until the lamb is tender and the sauce has thickened. Season to taste and serve with rice."
      ]
    },
    {
      id: "d434", title: "Dublin Coddle-Style Sausage & Potato Stew", tags: [], cuisine: "Ireland", protein: "pork",
      prep: 8, cook: 30,
      ingredients: [
        ing(2, "", "pork sausages, thickly sliced", "meat"), ing(2, "", "smoked bacon rashers, chopped", "meat"),
        ing(200, "g", "potatoes, sliced", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(200, "ml", "chicken stock", "store"), ing(1, "tsp", "thyme, chopped", "produce"),
        ing(null, "pinch", "black pepper", "spice")
      ],
      steps: [
        "Heat a splash of oil in a pan and brown the sausage pieces and bacon for 3–4 minutes.",
        "Layer the potatoes and onion over the meat, pour in the stock, and add the thyme and a good grind of pepper.",
        "Cover and simmer gently for 25–30 minutes until the potatoes are tender and the stock has reduced to a thick gravy.",
        "Serve hot straight from the pot with crusty bread."
      ]
    },
    {
      id: "d435", title: "Pakistani-Style Chicken Biryani", tags: ["spicy"], cuisine: "Pakistan", protein: "chicken",
      prep: 9, cook: 25,
      ingredients: [
        ing(1, "", "chicken thigh, diced", "meat"), ing(100, "g", "basmati rice, rinsed", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "tbsp", "plain yoghurt", "dairy"),
        ing(1, "tsp", "ginger garlic paste", "produce"), ing(0.5, "tsp", "garam masala", "spice"),
        ing(0.5, "tsp", "chilli powder", "spice"), ing(0.25, "tsp", "turmeric", "spice"),
        ing(1, "tbsp", "warm milk with a pinch of saffron", "dairy"), ing(1, "tbsp", "ghee or butter", "dairy"),
        ing(1, "tbsp", "coriander and mint, chopped", "produce")
      ],
      steps: [
        "Marinate the chicken in the yoghurt, ginger garlic paste, garam masala, chilli powder and turmeric for a few minutes.",
        "Fry the onion in the ghee until golden and crisp; set half aside for garnish.",
        "Add the marinated chicken to the pan and cook for 5–6 minutes until browned.",
        "Meanwhile, part-cook the rice in boiling salted water for 6 minutes, then drain. Layer the rice over the chicken and drizzle with the saffron milk.",
        "Cover tightly and cook on low heat for 12–15 minutes until the rice is fully tender and fragrant. Fluff through and scatter with the reserved fried onion, coriander and mint."
      ]
    },
    {
      id: "d436", title: "Polish-Style Pierogi Ruskie with Soured Cream and Bacon", tags: [], cuisine: "Poland", protein: "pork",
      prep: 10, cook: 12,
      ingredients: [
        ing(10, "", "fresh dumpling or wonton wrappers", "store"), ing(150, "g", "potato, boiled and mashed", "produce"),
        ing(50, "g", "curd cheese or cream cheese", "dairy"), ing(0.25, "", "onion, finely chopped", "produce"),
        ing(2, "", "bacon rashers, chopped", "meat"), ing(15, "g", "butter", "dairy"),
        ing(2, "tbsp", "soured cream", "dairy"), ing(1, "tbsp", "chives, chopped", "produce")
      ],
      steps: [
        "Mix the mashed potato with the curd cheese and a little of the chopped onion, and season well.",
        "Place a spoonful of the potato mixture in the centre of each wrapper, dampen the edges and fold into half-moons, pressing to seal.",
        "Cook the pierogi in a pan of simmering water for 3–4 minutes until they float, then drain.",
        "Meanwhile, fry the bacon and remaining onion in the butter until crisp and golden.",
        "Toss the drained pierogi through the bacon and butter, and serve with a dollop of soured cream and a scattering of chives."
      ]
    },
    {
      id: "d437", title: "Turkish-Style Mantı Dumplings with Garlic Yoghurt and Chilli Butter", tags: [], cuisine: "Turkey", protein: "beef",
      prep: 10, cook: 12,
      ingredients: [
        ing(100, "g", "beef mince", "meat"), ing(0.25, "", "onion, grated", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(null, "pinch", "black pepper", "spice"),
        ing(12, "", "fresh dumpling or wonton wrappers", "store"), ing(100, "g", "natural yoghurt", "dairy"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(15, "g", "butter", "dairy"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(1, "tsp", "dried mint", "spice"),
        ing(200, "ml", "stock, for poaching", "store")
      ],
      steps: [
        "Mix the beef mince with the grated onion, cumin and pepper.",
        "Place a small teaspoon of filling in the centre of each wrapper, dampen the edges and fold into small parcels, pinching to seal.",
        "Bring the stock to a simmer in a wide pan and poach the dumplings for 8–10 minutes until the filling is cooked through.",
        "Meanwhile, stir the crushed garlic into the yoghurt and season. Melt the butter in a small pan with the chilli flakes until sizzling and red.",
        "Drain the dumplings, spoon over the garlic yoghurt, drizzle with the chilli butter and scatter with dried mint."
      ]
    }

  ];
  var BUILTIN_COUNT = RECIPES.length;
  var RECIPES_BY_ID = {};
  RECIPES.forEach(function (r) { RECIPES_BY_ID[r.id] = r; });

  /* ============================= FREE TIER / PAYWALL =============================
   * The plain website (this file, opened in a browser) is Neil's own free,
   * personal build - it always has full access, no purchase involved.
   * The Android app wraps this same file with Capacitor and loads an extra
   * native-bridge.js that defines window.SSNative - only then does a free
   * tier apply. FREE_RECIPE_IDS is one flagship dish from every cuisine in
   * the book (plus a couple of bonus picks) so the free experience already
   * shows the full breadth of the collection; buying unlocks the depth.
   */
  var FREE_RECIPE_IDS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "d11", "d13", "d14",
    "d16", "d20", "d21", "d22", "d24", "d26", "d27", "d39", "d42", "d43", "d46", "d63", "d64", "d77", "d82",
    "d94", "d96", "d101", "d102", "d103", "d106", "d109", "d112", "d114", "d116", "d119", "d122", "d125",
    "d127", "d130", "d132", "d135", "d137", "d139", "d141", "d143", "d145", "d147", "d149", "d203", "d205",
    "d207", "d209", "d211", "d213", "d215", "d217", "d219", "d221", "d223", "d225", "d227", "d229", "d231",
    "d232", "d233", "d234", "d315"];
  var FREE_RECIPE_SET = {};
  FREE_RECIPE_IDS.forEach(function (id) { FREE_RECIPE_SET[id] = true; });
  var UNLOCK_PRICE = "£1.99";

  function isNativeApp() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  }
  function isPro() {
    if (!isNativeApp()) return true; // the website itself is always fully unlocked
    return !!(window.SSNative && window.SSNative.isPro());
  }
  function isRecipeLocked(recipeId) {
    return !isPro() && !FREE_RECIPE_SET[recipeId] && !(RECIPES_BY_ID[recipeId] && RECIPES_BY_ID[recipeId].custom);
  }
  function freeRecipePool(list) {
    return isPro() ? list : list.filter(function (r) { return FREE_RECIPE_SET[r.id] || r.custom; });
  }

  var paywallBackdrop, paywallModal; // wired up once the DOM helpers below exist
  function renderPaywallModal() {
    if (!paywallModal) return;
    paywallModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="paywall-close-btn" aria-label="Close">✕</button></div>' +
      '<h2>Unlock the full collection</h2>' +
      '<p style="color:var(--ink-muted); font-size:14px;">You\'re seeing ' + FREE_RECIPE_IDS.length + ' of ' + BUILTIN_COUNT +
      ' dinners for free, one from every cuisine in the book. Unlock the rest for ' + UNLOCK_PRICE +
      ' - a single one-time payment, no subscription, yours forever.</p>' +
      '<button class="btn btn-primary" id="paywall-unlock-btn" style="width:100%; margin-top:10px;">Unlock for ' + UNLOCK_PRICE + '</button>' +
      '<button class="btn btn-ghost" id="paywall-restore-btn" style="width:100%; margin-top:8px;">Restore previous purchase</button>';
    document.getElementById("paywall-close-btn").addEventListener("click", closePaywall);
    document.getElementById("paywall-unlock-btn").addEventListener("click", function (ev) {
      var btn = ev.currentTarget; btn.disabled = true; btn.textContent = "Opening checkout…";
      var done = function () { btn.disabled = false; btn.textContent = "Unlock for " + UNLOCK_PRICE; };
      if (window.SSNative && window.SSNative.purchase) {
        window.SSNative.purchase().then(function (ok) {
          done();
          if (ok) { closePaywall(); onStateChanged(); }
        }).catch(done);
      } else { done(); }
    });
    document.getElementById("paywall-restore-btn").addEventListener("click", function (ev) {
      var btn = ev.currentTarget; btn.disabled = true; btn.textContent = "Checking…";
      var done = function () { btn.disabled = false; btn.textContent = "Restore previous purchase"; };
      if (window.SSNative && window.SSNative.restore) {
        window.SSNative.restore().then(function (ok) {
          done();
          if (ok) { closePaywall(); onStateChanged(); } else { btn.textContent = "Nothing found to restore"; setTimeout(done, 1800); }
        }).catch(done);
      } else { done(); }
    });
  }
  function openPaywall() {
    if (!paywallBackdrop) return;
    renderPaywallModal();
    paywallBackdrop.hidden = false;
  }
  function closePaywall() { if (paywallBackdrop) { paywallBackdrop.hidden = true; paywallModal.innerHTML = ""; } }

  /* ============================= STATE ============================= */
  var DOW_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var state = {
    servings: 1,
    mode: "days", // "days" (7-slot week planner) or "batch" (a plain list, not tied to days)
    plan: [null, null, null, null, null, null, null],
    batch: [],   // batch-mode dinners: [{ uid, id, cookedAt }] - no day attached
    checked: {},
    ratings: {},
    noSeafood: false, // "No fish or seafood" preference: hides those dishes everywhere
    history: [], // log of every dinner a day slot has been filled with: { id, ts, via }
    cooked: {},  // which of THIS week's day slots have been confirmed cooked: { dayIdx: { id, ts } }
    cookLog: [], // durable log of confirmed cooks only, separate from planning: { id, ts }
    planWeek: null,      // "YYYY-MM-DD" of the Monday the plan belongs to
    leftovers: {},       // { dayIdx: true } - that day is leftovers of the day before
    staples: {},         // shopping keys the person always has in the cupboard
    avoid: {},           // "never show me" preferences, e.g. { mushrooms: true }
    customRecipes: [],   // the person's own recipes
    lastWeek: null,      // { week, plan } kept for "Copy last week"
    newWeekNotice: false
  };
  var HISTORY_LIMIT = 400; // keep this bounded so it never grows the saved state unreasonably

  // Fish and seafood you can see on the plate. Background seasonings (fish
  // sauce, oyster sauce, dashi, bonito flakes) don't count.
  var SEAFOOD_RE = /\b(prawns?|shrimps?|squid|calamari|anchov|tuna|salmon|cod|haddock|mackerel|fish|crab|mussels?|clams?|scallops?|oysters?|herring|trout|sea ?bass|bream|plaice|pollock|snapper|seafood|lobster|sardines?|basa|coley|kippers?|hake|monkfish)/i;
  var SEAFOOD_SEASONING_RE = /fish sauce|oyster sauce|bonito|dashi/i;
  var seafoodCache = {};
  function hasSeafood(r) {
    if (seafoodCache[r.id] === undefined) {
      seafoodCache[r.id] = r.protein === "fish" || r.ingredients.some(function (i) {
        return SEAFOOD_RE.test(i.item) && !SEAFOOD_SEASONING_RE.test(i.item);
      });
    }
    return seafoodCache[r.id];
  }
  function allowedByPrefs(r) {
    if (state.noSeafood && hasSeafood(r)) return false;
    var av = state.avoid || {};
    for (var k in av) { if (av[k] && AVOID_TESTS[k] && recipeHas(r, k)) return false; }
    return true;
  }
  // Recipes eligible for random suggestions: never 1-star dishes, never
  // seafood when that's switched off. Falls back gracefully if that's empty.
  function suggestPool(base) {
    var src = base || RECIPES;
    var pool = src.filter(function (r) { return allowedByPrefs(r) && state.ratings[r.id] !== 1; });
    if (!pool.length) pool = src.filter(allowedByPrefs);
    if (!pool.length) pool = src;
    return pool;
  }

  function newUid() { return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  var currentUser = null;       // Firebase auth user, or null when signed out
  var saveTimer = null;
  var suppressSave = false;     // true while applying an incoming snapshot, to avoid re-saving it
  var LOCAL_KEY = "soloSupper.state.v1";
  var LEGACY_LOCAL_KEY = "plateAndList.state.v1"; // old key from the app's previous name, Plate & List
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
      localStorage.setItem(LOCAL_KEY, JSON.stringify(syncPayload()));
    } catch (e) { /* localStorage unavailable - ignore */ }
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) {
        // One-time migration from the app's previous name (Plate & List), so
        // returning users don't lose their planned week or history on rebrand.
        raw = localStorage.getItem(LEGACY_LOCAL_KEY);
        if (raw) localStorage.setItem(LOCAL_KEY, raw);
      }
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
    if (typeof data.noSeafood === "boolean") state.noSeafood = data.noSeafood;
    if (Array.isArray(data.history)) state.history = data.history;
    if (data.cooked && typeof data.cooked === "object") state.cooked = data.cooked;
    if (Array.isArray(data.cookLog)) state.cookLog = data.cookLog;
    if (typeof data.planWeek === "string") state.planWeek = data.planWeek;
    state.leftovers = (data.leftovers && typeof data.leftovers === "object") ? data.leftovers : {};
    if (data.staples && typeof data.staples === "object") state.staples = data.staples;
    if (data.avoid && typeof data.avoid === "object") state.avoid = data.avoid;
    if (state.noSeafood) { state.avoid = state.avoid || {}; state.avoid.seafood = true; }
    if (Array.isArray(data.customRecipes)) state.customRecipes = data.customRecipes;
    if (data.lastWeek !== undefined) state.lastWeek = data.lastWeek;
    if (typeof data.newWeekNotice === "boolean") state.newWeekNotice = data.newWeekNotice;
    registerCustomRecipes();
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
    if (state.leftovers) delete state.leftovers[dayIdx];
  }
  function isLeftover(idx) {
    return !!(state.leftovers && state.leftovers[idx] && idx > 0 && state.plan[idx] && state.plan[idx] === state.plan[idx - 1]);
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
      if (entry.ts) unlogCook(entry.id, entry.ts);
      delete state.cooked[dayIdx];
    } else if (isLeftover(dayIdx)) {
      state.cooked[dayIdx] = { id: recipeId, ts: 0 }; // eaten, but not a new cook
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


  function stopCloudSync() {
    if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
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
function getDeviceId() {
  try {
    var id = localStorage.getItem("ssDeviceId");
    if (!id) {
      id = "dev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("ssDeviceId", id);
    }
    return id;
  } catch (e) {
    return null;
  }
}

function pingDevice(user) {
  var deviceId = getDeviceId();
  if (!deviceId || !window.firebaseDb) return;
  window.firebaseDb.collection("users").doc(user.uid)
    .collection("deviceLog").doc("main")
    .set({
      ids: firebase.firestore.FieldValue.arrayUnion(deviceId),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .catch(function () {});
}
  function initPersistence() {
    applyState(loadLocal());
  if (window.gtag) {
    gtag("set", "user_properties", { app_platform: isNativeApp() ? "android_app" : "web" });
  }
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
        // A popup window is blocked by Google inside an app's WebView, so the
        // Android build signs in via native-bridge.js (Credential Manager)
        // instead and bridges the result into this same compat SDK. The
        // website (no Capacitor present) keeps the ordinary popup flow.
        var signIn = (isNativeApp() && window.SSNative && window.SSNative.signInWithGoogle)
          ? window.SSNative.signInWithGoogle()
          : window.firebaseAuth.signInWithPopup(provider);
        signIn.catch(function (err) {
          console.error("Sign-in failed:", err);
          setSyncStatus("Sign-in failed");
        });
      });
    }
    if (signoutBtn) {
      signoutBtn.addEventListener("click", function () {
        window.firebaseAuth.signOut();
        if (isNativeApp() && window.SSNative && window.SSNative.signOutNative) window.SSNative.signOutNative();
      });
    }

    window.firebaseAuth.onAuthStateChanged(function (user) {
      currentUser = user;
      updateAccountUI(user);
  if (user) {
    startCloudSync(user);
    pingDevice(user);
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
      try { btn.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) { /* older browsers */ }
    });
  });
  // Fade the tab row's right edge only while there are tabs off-screen.
  var tabsNav = document.querySelector(".tabs");
  function updateTabsFade() {
    if (!tabsNav) return;
    tabsNav.classList.toggle("can-scroll-right", tabsNav.scrollLeft + tabsNav.clientWidth < tabsNav.scrollWidth - 2);
  }
  if (tabsNav) {
    tabsNav.addEventListener("scroll", updateTabsFade, { passive: true });
    window.addEventListener("resize", updateTabsFade);
    window.addEventListener("load", updateTabsFade);
    updateTabsFade();
  }

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
    renderPlannerBanner();
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
        '<span class="info"><span class="title">' + esc(r.title) + (isCooked ? ' <span class="cooked-badge">&#10003; Cooked</span>' : '') + '</span>' +
        '<span class="meta">' + r.prep + '+' + r.cook + ' min' + (displayTags(r).length ? ' &middot; ' + displayTags(r).join(", ") : "") + '</span></span>';
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
      removeBtn.addEventListener("click", function (uid) { return function () { withUndo("Dinner removed", function () { removeFromBatch(uid); }); }; }(item.uid));
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
    var eligible = freeRecipePool(RECIPES);
    var likedIds = suggestPool(eligible).map(function (r) { return r.id; });
    var basePool = likedIds.length ? likedIds : eligible.map(function (r) { return r.id; });
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
    if (!state.batch.length) return;
    withUndo("List cleared", function () { state.batch = []; state.checked = {}; onStateChanged(); });
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
        var leftover = isLeftover(idx);
        var assigned = document.createElement("button");
        assigned.className = "assigned";
        assigned.innerHTML =
          '<span class="swatch" style="background:var(--' + (TAG_COLOR[r.tags[0]] || "border") + ')"></span>' +
          '<span class="info"><span class="title">' + esc(r.title) + (isCooked ? ' <span class="cooked-badge">&#10003; ' + (leftover ? "Eaten" : "Cooked") + '</span>' : '') + '</span>' +
          '<span class="meta">' + (leftover ? "Leftovers from " + DOW_NAMES[idx - 1] + " &middot; no cooking"
            : r.prep + '+' + r.cook + ' min' + (displayTags(r).length ? ' &middot; ' + displayTags(r).join(", ") : "")) + '</span></span>';
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
        removeBtn.addEventListener("click", function (i) { return function () { withUndo("Dinner removed", function () { clearCooked(i); state.plan[i] = null; onStateChanged(); }); }; }(idx));
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
    if (state.plan.every(Boolean)) { toast("Every day already has a dinner."); return; }
    var undoSnap = JSON.stringify(syncPayload());
    state.newWeekNotice = false;
    setTimeout(function () { toast("Week filled", "Undo", function () { applyState(JSON.parse(undoSnap)); onStateChanged(); }); }, 0);
    var used = state.plan.filter(Boolean);
    // Never fill a day with a 1-star dish, same rule as Surprise me. Only
    // fall back to the full list (including 1-star dishes) if every single
    // recipe has been rated 1 star, so the week can still be filled.
    var eligible = freeRecipePool(RECIPES);
    var likedIds = suggestPool(eligible).map(function (r) { return r.id; });
    var basePool = likedIds.length ? likedIds : eligible.map(function (r) { return r.id; });
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
    if (!state.plan.some(Boolean)) return;
    withUndo("Week cleared", function () {
      state.plan = [null, null, null, null, null, null, null];
      state.cooked = {}; state.leftovers = {}; state.checked = {};
      onStateChanged();
    });
  });

  /* ============================= SHOPPING LIST ============================= */
  /* ============================= SHOPPING LIST CONSOLIDATION ============================= */
  // Recipes describe ingredients the way you cook them ("onion, finely
  // diced", "2 tbsp chopped fresh parsley", "160 g shredded white cabbage").
  // The shopping list needs them the way you BUY them. shopCanon() reduces
  // each ingredient to a canonical product + unit; shopBuild() then merges
  // everything that is the same product, converting units where it makes
  // sense (g/kg, ml/tsp/tbsp, grams of cabbage -> cabbages, lemon juice ->
  // lemons, handfuls of herbs -> grams, and so on).

  var SHOP_SINGULAR = {
    onions: "onion", tomatoes: "tomato", potatoes: "potato", chillies: "chilli", carrots: "carrot",
    eggs: "egg", limes: "lime", lemons: "lemon", radishes: "radish", thighs: "thigh", breasts: "breast",
    fillets: "fillet", sausages: "sausage", chops: "chop", rashers: "rasher", peppers: "pepper",
    courgettes: "courgette", shallots: "shallot", apples: "apple", avocados: "avocado", cloves: "clove",
    heads: "head", mushrooms: "mushroom", tortillas: "tortilla", koftas: "kofta", meatballs: "meatball",
    gherkins: "gherkin", apricots: "apricot", slices: "slice", sheets: "sheet", handfuls: "handful"
  };
  // Nouns that should keep their plural form (never singularised).
  var SHOP_KEEP_PLURAL = /(salad leaves|curry leaves|lime leaves|sage leaves|whole cloves|green cardamom pods)$/;
  var SHOP_PLURAL = { chilli: "chillies", tomato: "tomatoes", potato: "potatoes", radish: "radishes", leaf: "leaves" };

  var SHOP_HERBS = { coriander: 1, parsley: 1, dill: 1, mint: 1, basil: 1, chives: 1, tarragon: 1, thyme: 1, rosemary: 1, "thai basil": 1 };

  // Approximate weight of one whole item, used to reconcile "300 g" with "1".
  var SHOP_EACH_G = {
    "onion": 150, "red onion": 150, "white onion": 150, "shallot": 40, "tomato": 100, "potato": 200,
    "baking potato": 300, "floury potato": 200, "waxy potato": 200, "sweet potato": 250, "carrot": 80,
    "courgette": 200, "pepper": 160, "red pepper": 160, "green pepper": 160, "yellow pepper": 160,
    "white cabbage": 900, "red cabbage": 900, "cabbage": 900, "cauliflower": 600, "cucumber": 300,
    "butternut squash": 1000, "swede": 700, "avocado": 150, "apple": 150, "leek": 200,
    "chicken breast": 170, "chicken thigh": 100, "boneless chicken thigh": 100, "pork chop": 200,
    "pork loin chop": 200, "lamb chop": 100, "pork sausage": 65, "duck breast": 150,
    "cod fillet": 150, "salmon fillet": 130, "white fish fillet": 150, "egg": 55, "cherry tomato": 15
  };
  // Things you buy whole: grams get converted to a count of the item.
  var SHOP_BUY_WHOLE = {
    "onion": 1, "red onion": 1, "white onion": 1, "shallot": 1, "tomato": 1, "carrot": 1, "courgette": 1,
    "pepper": 1, "red pepper": 1, "green pepper": 1, "yellow pepper": 1, "white cabbage": 1, "red cabbage": 1,
    "cabbage": 1, "cauliflower": 1, "cucumber": 1, "butternut squash": 1, "swede": 1, "avocado": 1,
    "apple": 1, "leek": 1, "sweet potato": 1, "lemon": 1, "lime": 1, "orange": 1, "egg": 1
  };
  var SHOP_ALIAS = {
    "cabbage": "white cabbage", "egg yolk": "egg", "boiled egg": "egg", "hard-boiled egg": "egg",
    "cheddar cheese": "cheddar", "mature cheddar": "cheddar", "feta cheese": "feta",
    "plain yoghurt": "natural yoghurt", "yoghurt": "natural yoghurt",
    "tomato puree": "tomato purée", "tomato ketchup": "ketchup", "orzo pasta": "orzo",
    "gochujang paste": "gochujang", "red kidney beans": "kidney beans", "tomato passata": "passata",
    "basil leaves": "basil", "thyme leaves": "thyme", "mint and coriander leaves": "mint and coriander",
    "thumb-sized piece ginger": "ginger", "piece ginger": "ginger", "lettuce leaf": "lettuce leaf",
    "garlic clove": "garlic", "celery stick": "celery", "lemongrass stalk": "lemongrass",
    "corn on the cob": "corn on the cob", "gruyere": "gruyère", "boneless chicken thigh": "chicken thigh",
    "chicken thigh fillet": "chicken thigh", "streaky bacon rasher": "streaky bacon",
    "kumara": "sweet potato", "scotch bonnet": "scotch bonnet chilli", "lettuce leaves": "lettuce leaf",
    "bacon rasher": "bacon", "smoked bacon rasher": "smoked bacon"
  };
  // Ingredients sold as a whole fruit: juice/zest/wedges become fractions of one.
  var SHOP_CITRUS = { lemon: 3, lime: 2, orange: 6 }; // tbsp of juice per fruit

  function shopSingular(phrase) {
    if (SHOP_KEEP_PLURAL.test(phrase)) return phrase;
    var words = phrase.split(" ");
    var last = words[words.length - 1];
    if (SHOP_SINGULAR[last]) words[words.length - 1] = SHOP_SINGULAR[last];
    if (words[0] === "slices" || words[0] === "sheets" || words[0] === "rashers" || words[0] === "heads") words[0] = SHOP_SINGULAR[words[0]];
    return words.join(" ");
  }
  function shopPlural(phrase) {
    if (/s$|(anise|falafel|fish|spam|lettuce|swede|squash|garlic|ginger|celery|kale|spinach|rocket|pak choi|cauliflower|broccoli)$/.test(phrase)) return phrase;
    var words = phrase.split(" ");
    var last = words[words.length - 1];
    words[words.length - 1] = SHOP_PLURAL[last] || (/(ch|sh|x)$/.test(last) ? last + "es" : last + "s");
    return words.join(" ");
  }

  // One recipe ingredient -> { key, label, cat, unit, amt, herb, drained, tinned }
  function shopCanon(i, servings) {
    var cat = i.cat;
    var unit = (i.unit || "").toLowerCase();
    var amt = i.amt === null || i.amt === undefined ? null : i.amt * servings;
    var raw = String(i.item);
    var drained = /drained/i.test(raw);
    var tinnedWord = /\btinned\b|\(tinned\)/i.test(raw);
    var eachG = null;
    var m = raw.match(/about (\d+)\s*g/i);
    if (m) eachG = parseInt(m[1], 10);

    var s = raw.replace(/\([^)]*\)/g, " ");                        // drop "(tinned)", "(e.g. cod)"
    var comma = s.indexOf(",");
    var head = comma === -1 ? s : s.slice(0, comma);
    head = head.replace(/\s+/g, " ").trim();
    var label = head;
    var k = head.toLowerCase();

    // "X or Y" alternatives in fresh produce: shop for the first option.
    if (cat === "produce" && / or /.test(k) && !/^each /.test(k)) {
      k = k.split(" or ")[0].trim();
      label = label.split(/ or /i)[0].trim();
    }
    // Leading prep/size words on fresh and dairy items.
    if (cat === "produce" || cat === "dairy" || cat === "meat") {
      var prev;
      do {
        prev = k;
        k = k.replace(/^(finely |thinly |roughly |coarsely |very )?(chopped|shredded|grated|sliced|diced|minced|crushed|torn|cooked(?= (chicken|ham)))\s+/, "")
             .replace(/^(fresh|small|medium|large|ripe|mature|skinless|very fresh)\s+/, "");
      } while (k !== prev);
      label = label.slice(label.length - k.length);
    }
    // "tinned chickpeas" and "chickpeas" are the same tin.
    if (cat === "store" && /^tinned /.test(k)) { k = k.slice(7); label = label.slice(7); tinnedWord = true; }
    if (cat === "store" && / pasta$/.test(k) && k !== "pasta") { /* keep e.g. "orzo pasta" via alias */ }

    // Unit words hiding in the name: "slices ham", "sheets filo pastry", "rashers streaky bacon".
    var um = k.match(/^(slices?|sheets?|rashers?|heads?|thin slices|wedge|slice) (.+)$/);
    if (um && (unit === "" || unit === um[1])) {
      unit = um[1].replace(/^thin /, "");
      k = um[2]; label = label.slice(label.length - k.length);
    }
    var rm = k.match(/^(.+) rashers?$/);
    if (rm) { unit = "rasher"; k = rm[1]; label = label.slice(0, rm[1].length); }
    if (unit === "rashers") unit = "rasher";

    k = shopSingular(k);
    if (SHOP_ALIAS[k] && SHOP_ALIAS[k] !== k) { k = SHOP_ALIAS[k]; label = k; }
    if (unit && SHOP_SINGULAR[unit]) unit = SHOP_SINGULAR[unit];

    // Fresh ginger in any form -> grams of ginger.
    if (cat === "produce" && /ginger$/.test(k) && !/paste|pickled/.test(k)) {
      k = "ginger"; label = "fresh ginger";
      if (unit === "thumb") { unit = "g"; amt = amt === null ? 25 : amt * 25; }
      else if (unit === "slice") { unit = "g"; amt = amt === null ? 3 : amt * 3; }
      else if (unit === "") { unit = "g"; amt = amt === null ? 25 : amt * 25; } // "thumb-sized piece"
      else if (unit === "tsp") { unit = "g"; amt = amt * 5; }
      else if (unit === "tbsp") { unit = "g"; amt = amt * 15; }
    }
    // Garlic is counted in cloves, celery in sticks.
    if (k === "garlic" && unit === "") { unit = "clove"; label = "garlic"; }
    if (k === "celery" && unit === "") unit = "stick";
    // A slice or wedge of something you buy whole is a fraction of one.
    if (SHOP_BUY_WHOLE[k] && (unit === "slice" || unit === "wedge") && amt !== null) {
      amt = amt / (unit === "slice" ? 8 : 6); unit = "";
    }

    // Citrus: juice, wedges and slices become fractions of a fruit.
    var cm = k.match(/^(lemon|lime|orange)( juice| wedge| slice)?$/);
    if (cat === "produce" && cm) {
      var fruit = cm[1], part = (cm[2] || "").trim();
      if (part === "juice") {
        var tbsp = unit === "tbsp" ? amt : unit === "tsp" ? amt / 3 : unit === "ml" ? amt / 15 : amt;
        amt = tbsp / SHOP_CITRUS[fruit];
      } else if (part === "wedge") { amt = (amt || 1) / 6; }
      else if (part === "slice" || unit === "slice") { amt = (amt || 1) / 8; }
      unit = ""; k = fruit; label = fruit;
    }

    var herb = cat === "produce" && !!SHOP_HERBS[k];
    if (herb) label = "fresh " + k;
    // "a small handful of parsley" has no number but is still something to buy.
    if (amt === null && cat === "produce" && /handful|sprig/.test(unit)) amt = servings;
    // "2 lamb chops (about 200g)" gives the weight of the whole amount, so
    // it scales with servings, not with the count.
    if (eachG && unit === "" && amt !== null) { unit = "g"; amt = eachG * (i.amt ? amt / i.amt : 1); }

    return { key: cat + "|" + k, name: k, label: label, cat: cat, unit: unit, amt: amt, herb: herb,
             drained: drained, tinned: tinnedWord || unit === "tin" };
  }

  var SHOP_SPOON = { tsp: 1, tbsp: 3 };
  var SHOP_HANDFUL_G = { "small handful": 15, "handful": 30, "large handful": 45 };
  var SHOP_HERB_G = { "small handful": 5, "handful": 10, "large handful": 15, "sprig": 1, "few sprigs": 3, "tbsp": 4, "tsp": 1.3 };

  // Merge parts {unit: amount} for one product into the fewest sensible units.
  function shopReconcile(e) {
    var p = e.parts, u;
    function move(from, to, factor) { if (p[from] !== undefined) { p[to] = (p[to] || 0) + p[from] * factor; delete p[from]; } }
    move("kg", "g", 1000); move("l", "ml", 1000);
    // spoons -> tsp
    Object.keys(SHOP_SPOON).forEach(function (sp) { move(sp, "_tsp", SHOP_SPOON[sp]); });
    if (e.herb) {
      // Herbs are bought by the pack, so everything becomes grams.
      Object.keys(SHOP_HERB_G).forEach(function (h) { if (h !== "tbsp" && h !== "tsp") move(h, "g", SHOP_HERB_G[h]); });
      move("_tsp", "g", SHOP_HERB_G.tsp);
    }
    if (p.ml !== undefined && p.g !== undefined) move("ml", "g", 1);
    if (p._tsp !== undefined && p.ml !== undefined) move("_tsp", "ml", 5);
    if (p._tsp !== undefined && p.g !== undefined) move("_tsp", "g", 5);
    if (p.g !== undefined) Object.keys(SHOP_HANDFUL_G).forEach(function (h) { move(h, "g", SHOP_HANDFUL_G[h]); });
    // tins vs grams of the same tinned thing
    if (p.tin !== undefined && p.g !== undefined) move("g", "tin", 1 / (e.drained ? 240 : 400));
    // whole items vs grams
    var each = SHOP_EACH_G[e.name];
    if (each && p.g !== undefined && (p[""] !== undefined || SHOP_BUY_WHOLE[e.name])) {
      if (SHOP_BUY_WHOLE[e.name]) move("g", "", 1 / each);
      else move("", "g", each);
    }
    u = Object.keys(p);
    return u;
  }

  function shopRoundG(x) {
    if (x >= 1000) return fmtAmt(Math.round(x / 100) / 10) + " kg";
    if (x >= 100) return Math.round(x / 10) * 10 + " g";
    return Math.max(1, Math.round(x)) + " g";
  }
  function shopFmtSpoons(tsp) {
    if (tsp < 3) return fmtAmt(Math.round(tsp * 4) / 4) + " tsp";
    return fmtAmt(Math.max(1, Math.round(tsp / 1.5) / 2)) + " tbsp"; // nearest ½ tbsp
  }

  // Returns { cat: { key: { label, amt } } }
  function shopBuild(recipeIds) {
    var entries = {};
    recipeIds.forEach(function (rid) {
      var r = RECIPES_BY_ID[rid];
      if (!r) return;
      r.ingredients.forEach(function (i) {
        var c = shopCanon(i, state.servings);
        var e = entries[c.key];
        if (!e) e = entries[c.key] = { cat: c.cat, name: c.name, label: c.label, herb: c.herb, parts: {}, notes: {}, drained: false, labels: {} };
        e.labels[c.label] = (e.labels[c.label] || 0) + 1;
        if (c.drained) e.drained = true;
        if (c.amt === null) { if (c.unit) e.notes[c.unit] = true; return; }
        e.parts[c.unit] = (e.parts[c.unit] || 0) + c.amt;
      });
    });

    var groups = {};
    Object.keys(entries).forEach(function (key) {
      var e = entries[key];
      var units = shopReconcile(e);
      // most common wording wins for the label
      var label = e.herb ? e.label : Object.keys(e.labels).sort(function (a, b) { return e.labels[b] - e.labels[a]; })[0];
      var pieces = [];
      var countOnly = units.length === 1 && units[0] === "";
      units.forEach(function (u) {
        var v = e.parts[u];
        if (u === "") {
          var n = Math.max(1, Math.ceil(v - 0.15)); // you can't buy half an onion
          pieces.push(fmtAmt(n));
          if (countOnly) label = n > 1 ? shopPlural(shopSingular(label)) : shopSingular(label);
        } else if (u === "g") {
          if (e.herb) {
            // Supermarket herb packs are ~30 g.
            var packs = Math.max(1, Math.ceil(v / 30 - 0.1));
            pieces.push(packs + " pack" + (packs > 1 ? "s" : ""));
            label += " (≈ " + Math.max(5, Math.round(v / 5) * 5) + " g needed)";
          } else pieces.push(shopRoundG(v));
          if (units.length === 1 && e.cat === "produce" && SHOP_EACH_G[e.name] && !/s$/.test(label)) label = shopPlural(label);
        }
        else if (u === "ml") pieces.push(v >= 1000 ? fmtAmt(Math.round(v / 100) / 10) + " l" : Math.round(v / 5) * 5 + " ml");
        else if (u === "_tsp") pieces.push(shopFmtSpoons(v));
        else if (u === "tin" || u === "small tin") { var t = Math.max(1, Math.ceil(v - 0.15)); pieces.push(t + " " + u + (t > 1 ? "s" : "")); }
        else if (u === "clove") {
          var cl = Math.ceil(v - 0.01);
          pieces.push(cl + " clove" + (cl > 1 ? "s" : ""));
          if (cl >= 8) label += " (≈ " + Math.ceil(cl / 10) + " bulb" + (cl > 10 ? "s" : "") + ")";
        }
        else pieces.push(fmtAmt(v) + " " + (v > 1 && !/ /.test(u) ? shopPlural(u) : u));
      });
      var noteKeys = Object.keys(e.notes);
      if (!pieces.length && noteKeys.length) pieces.push(noteKeys.indexOf("to taste") !== -1 ? "to taste" : noteKeys[0]);
      groups[e.cat] = groups[e.cat] || {};
      groups[e.cat][key] = { label: label.charAt(0).toLowerCase() === label.charAt(0) ? label : label, amt: pieces.join(" + ") };
    });
    return groups;
  }

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
    var groups = shopBuild(recipeIds); // cat -> map(key -> {label, amt}), see SHOPPING LIST CONSOLIDATION
    var staples = state.staples || {}, stapleRows = [];

    var total = 0, checkedCount = 0;
    var html = "";
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var keys = Object.keys(groups[cat]).sort(function (a, b) { return groups[cat][a].label.localeCompare(groups[cat][b].label); });
      keys = keys.filter(function (k) { if (staples[k] && !shopCupboardMode) { stapleRows.push({ key: k, g: groups[cat][k] }); return false; } return true; });
      if (!keys.length) return;
      html += '<div class="shop-section"><h3>' + CAT_LABEL[cat] + "</h3>";
      keys.forEach(function (key) {
        var g = groups[cat][key];
        var itemKey = key;
        if (shopCupboardMode) {
          html += '<button type="button" class="shop-item cupboard-item' + (staples[key] ? " is-staple" : "") + '" data-staple="' + itemKey.replace(/"/g, "&quot;") + '">' +
            '<span class="cupboard-mark">' + (staples[key] ? "✓" : "+") + '</span><span class="amt">' + g.amt + '</span><span class="name">' + g.label + "</span></button>";
          return;
        }
        total++;
        var isChecked = !!state.checked[itemKey];
        if (isChecked) checkedCount++;
        html += '<label class="shop-item' + (isChecked ? " checked" : "") + '" data-key="' + itemKey.replace(/"/g, "&quot;") + '">' +
          '<input type="checkbox" ' + (isChecked ? "checked" : "") + '>' +
          '<span class="amt">' + g.amt + '</span>' +
          '<span class="name">' + g.label + '</span></label>';
      });
      html += "</div>";
    });
    if (shopCupboardMode) {
      html = '<div class="banner-card"><div><strong>Tap anything you always have in.</strong><p>It stays off your list until you tap it again.</p></div>' +
        '<div class="banner-actions"><button type="button" class="btn btn-sm" id="shop-basics-btn">Add the usual basics</button>' +
        '<button type="button" class="btn btn-primary btn-sm" id="shop-cupboard-done">Done</button></div></div>' + html;
    } else if (stapleRows.length) {
      html += '<details class="shop-staples"><summary>In your cupboard (' + stapleRows.length + ')</summary>' +
        stapleRows.map(function (x) {
          return '<div class="shop-item staple-row"><span class="amt">' + x.g.amt + '</span><span class="name">' + x.g.label + '</span>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-unstaple="' + x.key.replace(/"/g, "&quot;") + '">Need it</button></div>';
        }).join("") + "</details>";
    }
    content.innerHTML = html;
    document.getElementById("shop-progress").textContent = shopCupboardMode ? "" : checkedCount + " of " + total + " ticked off";
    var cupBtn = document.getElementById("shop-cupboard-btn");
    if (cupBtn) cupBtn.setAttribute("aria-pressed", shopCupboardMode ? "true" : "false");
    content.querySelectorAll("[data-staple]").forEach(function (b) { b.addEventListener("click", function () { toggleStaple(b.dataset.staple); }); });
    content.querySelectorAll("[data-unstaple]").forEach(function (b) { b.addEventListener("click", function () { toggleStaple(b.dataset.unstaple); }); });
    var basicsBtn = document.getElementById("shop-basics-btn");
    if (basicsBtn) basicsBtn.addEventListener("click", addUsualBasics);
    var doneBtn = document.getElementById("shop-cupboard-done");
    if (doneBtn) doneBtn.addEventListener("click", function () { shopCupboardMode = false; renderShopping(); });

    content.querySelectorAll(".shop-item[data-key]").forEach(function (el) {
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
  var ALL_TAGS = ["vegetarian", "vegan", "fish", "spicy"];
  var activeTime = 0, favOnly = false, yoursOnly = false;

  function renderTagChips() {
    var wrap = document.getElementById("tag-chips");
    wrap.innerHTML = "";
    var add = function (text, on, fn) {
      var chip = document.createElement("button");
      chip.className = "chip"; chip.type = "button"; chip.textContent = text;
      chip.setAttribute("aria-pressed", on ? "true" : "false");
      chip.addEventListener("click", function () { fn(); renderTagChips(); renderRecipeGrid(); });
      wrap.appendChild(chip);
    };
    add("★ favourites", favOnly, function () { favOnly = !favOnly; });
    if ((state.customRecipes || []).length) add("yours", yoursOnly, function () { yoursOnly = !yoursOnly; });
    TIME_OPTIONS.forEach(function (m) { add("≤ " + m + " min", activeTime === m, function () { activeTime = activeTime === m ? 0 : m; }); });
    ALL_TAGS.forEach(function (t) { add(t, !!activeTags[t], function () { activeTags[t] = !activeTags[t]; }); });
    add("no fish or seafood", !!(state.avoid && state.avoid.seafood), function () { toggleAvoid("seafood"); });
  }

  function renderRecipeGrid() {
    var grid = document.getElementById("recipe-grid");
    var activeList = Object.keys(activeTags).filter(function (t) { return activeTags[t]; });
    var term = searchTerm.trim().toLowerCase();
    var filtered = RECIPES.filter(function (r) {
      if (!allowedByPrefs(r)) return false;
      if (favOnly && !isFavourite(r)) return false;
      if (yoursOnly && !r.custom) return false;
      if (!withinTime(r, activeTime)) return false;
      if (activeList.length && !activeList.every(function (t) { return r.tags.indexOf(t) !== -1; })) return false;
      if (!term) return true;
      if (r.title.toLowerCase().indexOf(term) !== -1) return true;
      return r.ingredients.some(function (i) { return i.item.toLowerCase().indexOf(term) !== -1; });
    });
    grid.innerHTML = "";
    if (!filtered.length) {
      grid.innerHTML = '<p class="empty-state">' + (favOnly && !term ? "No favourites yet. Rate a dinner 4 or 5 stars and it shows up here." : "Nothing matches that search.") + '</p>';
    }
    filtered.forEach(function (r) {
      var locked = isRecipeLocked(r.id);
      var card = document.createElement("button");
      card.className = "recipe-card" + (locked ? " is-locked" : "");
      var rated = state.ratings[r.id] ? ratingStars(r.id, false) : "";
      card.innerHTML = recipeArt(r, false) +
        '<div class="top-row"><span class="title">' + esc(r.title) + '</span><span class="time">' + (locked ? '<span class="lock-badge" aria-label="Locked">&#128274;</span> ' : '') + r.prep + "+" + r.cook + " min</span></div>" +
        '<div class="tag-row">' + displayTags(r).map(tagPill).join("") + "</div>" +
        (rated ? '<div class="card-rating">' + rated + "</div>" : "");
      card.addEventListener("click", function () { openRecipeModal(r.id, { fromLibrary: true }); });
      grid.appendChild(card);
    });
    document.getElementById("recipes-count").textContent = RECIPES.length;
    var banner = document.getElementById("paywall-banner");
    if (isPro()) {
      banner.hidden = true;
    } else {
      banner.hidden = false;
      banner.querySelector("span").textContent =
        FREE_RECIPE_IDS.length + " of " + BUILTIN_COUNT + " dinners unlocked – one from every cuisine in the book.";
    }
  }
  document.getElementById("paywall-banner-btn").addEventListener("click", openPaywall);
  document.getElementById("recipe-search").addEventListener("input", function (e) { searchTerm = e.target.value; renderRecipeGrid(); });

  /* ============================= RECIPE MODAL ============================= */
  var recipeBackdrop = document.getElementById("recipe-modal-backdrop");
  var recipeModal = document.getElementById("recipe-modal");

  function openRecipeModal(recipeId, ctx) {
    var r = RECIPES_BY_ID[recipeId];
    if (!r) return;
    // A recipe already sitting in the plan/batch (opened via its assigned
    // card) is always viewable in full - the lock only applies when browsing
    // or picking something new, so buying never orphans a dish already on
    // someone's list.
    var alreadyAssigned = !!(ctx && (ctx.dayIdx !== undefined || ctx.batchUid !== undefined));
    var locked = !alreadyAssigned && isRecipeLocked(recipeId);
    var servingsNote = state.servings > 1
      ? "Written for one; scaled here ×" + state.servings + "."
      : "Written for one.";

    var bodyHtml, actionsHtml;
    if (locked) {
      bodyHtml =
        '<div class="rating-block"><span class="rating-label">Your rating</span>' + ratingStars(r.id, true) + '<span class="rating-hint">Tap a star again to clear it. 1 star is never suggested by Surprise me.</span></div>' +
        '<div class="locked-panel">' +
        '<p><span class="lock-badge" aria-label="Locked">&#128274;</span> This one\'s part of the full collection.</p>' +
        '<p style="color:var(--ink-muted); font-size:13px;">Unlock all ' + BUILTIN_COUNT + ' dinners for ' + UNLOCK_PRICE + ' – a single one-time payment, no subscription, yours forever.</p>' +
        '<button class="btn btn-primary" id="modal-unlock-btn" style="width:100%;">Unlock for ' + UNLOCK_PRICE + '</button>' +
        "</div>";
      actionsHtml = "";
    } else {
      var ingredientsHtml = r.ingredients.map(function (i) {
        return '<div class="ingredient-row"><span class="amt">' + scaledAmtOnly(i) + '</span><span>' + esc(i.item) + "</span></div>";
      }).join("");
      var stepsHtml = r.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
      var note = seasoningNote(r);
      bodyHtml =
        '<div class="rating-block"><span class="rating-label">Your rating</span>' + ratingStars(r.id, true) + '<span class="rating-hint">Tap a star again to clear it. 1 star is never suggested by Surprise me.</span></div>' +
        '<button type="button" class="btn btn-primary cook-mode-btn" id="modal-cook-btn">Start cooking</button>' +
        (note ? '<p class="seasoning-note">' + esc(note) + "</p>" : "") +
        "<h3>Ingredients</h3>" + ingredientsHtml +
        "<h3>Method</h3><ol class=\"steps\">" + stepsHtml + "</ol>" +
        (r.custom ? '<div class="modal-actions"><button type="button" class="btn btn-ghost btn-sm" id="modal-edit-btn">Edit your recipe</button></div>' : "");

      if (ctx && ctx.dayIdx !== undefined) {
        var canLeftover = ctx.dayIdx < 6 && !isLeftover(ctx.dayIdx) && !(state.plan[ctx.dayIdx + 1] === r.id && isLeftover(ctx.dayIdx + 1));
        actionsHtml = '<div class="modal-actions">' +
          '<button class="btn btn-primary" id="modal-swap-btn">Swap for something else</button>' +
          (canLeftover ? '<button class="btn" id="modal-leftover-btn">Cook double: leftovers ' + DOW_NAMES[ctx.dayIdx + 1] + '</button>' : "") +
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
    }

    recipeModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="modal-close-btn" aria-label="Close">✕</button></div>' +
      recipeArt(r, true) +
      "<h2>" + esc(r.title) + "</h2>" +
      '<div class="tag-row">' + displayTags(r).map(tagPill).join("") + "</div>" +
      '<div class="modal-meta"><span>Prep ' + r.prep + ' min</span><span>Cook ' + r.cook + ' min</span><span>Serves ' + state.servings + '</span>' +
      (function () { var k = kcalPerServing(r); return k ? '<span title="Rough estimate from the ingredients">≈ ' + k + ' kcal per serving (estimate)</span>' : ""; })() +
      '</div>' +
      '<p style="color:var(--ink-muted); font-size:13px;">' + servingsNote + "</p>" +
      bodyHtml +
      actionsHtml;

    recipeBackdrop.hidden = false;
    document.getElementById("modal-close-btn").addEventListener("click", closeRecipeModal);
    wireRatingStars(recipeModal, r.id);

    if (!locked) {
      document.getElementById("modal-cook-btn").addEventListener("click", function () { openCookMode(r.id, ctx || {}); });
      if (r.custom) document.getElementById("modal-edit-btn").addEventListener("click", function () { closeRecipeModal(); openCustomForm(r.id); });
    }
    if (locked) {
      document.getElementById("modal-unlock-btn").addEventListener("click", function () { closeRecipeModal(); openPaywall(); });
    } else if (ctx && ctx.dayIdx !== undefined) {
      document.getElementById("modal-swap-btn").addEventListener("click", function () { closeRecipeModal(); openPicker({ type: "day", dayIdx: ctx.dayIdx }); });
      var lb = document.getElementById("modal-leftover-btn");
      if (lb) lb.addEventListener("click", function () {
        var next = ctx.dayIdx + 1;
        closeRecipeModal();
        withUndo("Leftovers added to " + DOW_NAMES[next], function () {
          clearCooked(next);
          state.plan[next] = r.id;
          state.leftovers = state.leftovers || {};
          state.leftovers[next] = true;
          onStateChanged();
        });
      });
      document.getElementById("modal-remove-btn").addEventListener("click", function () { closeRecipeModal(); withUndo("Dinner removed", function () { clearCooked(ctx.dayIdx); state.plan[ctx.dayIdx] = null; onStateChanged(); }); });
    } else if (ctx && ctx.batchUid !== undefined) {
      document.getElementById("modal-swap-btn").addEventListener("click", function () { closeRecipeModal(); openPicker({ type: "batchReplace", uid: ctx.batchUid }); });
      document.getElementById("modal-remove-btn").addEventListener("click", function () { closeRecipeModal(); withUndo("Dinner removed", function () { removeFromBatch(ctx.batchUid); }); });
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
    var pickerTerm = "", pickerFav = false, pickerTags = {}, pickerTime = 0;
    var PICKER_TAGS = ["vegetarian", "fish", "spicy"];
    function pickerRowsHtml() {
      var term = pickerTerm.trim().toLowerCase();
      var tags = Object.keys(pickerTags).filter(function (t) { return pickerTags[t]; });
      var list = RECIPES.filter(function (r) {
        if (!allowedByPrefs(r)) return false;
        if (pickerFav && !isFavourite(r)) return false;
        if (!withinTime(r, pickerTime)) return false;
        if (tags.length && !tags.every(function (t) { return r.tags.indexOf(t) !== -1; })) return false;
        if (!term) return true;
        if (r.title.toLowerCase().indexOf(term) !== -1) return true;
        if ((r.cuisine || "").toLowerCase().indexOf(term) !== -1) return true;
        return r.ingredients.some(function (i) { return i.item.toLowerCase().indexOf(term) !== -1; });
      });
      if (!list.length) {
        return '<p class="empty-state">' + (pickerFav && !term && !tags.length
          ? "No favourites yet. Rate a dinner 4 or 5 stars and it shows up here."
          : "Nothing matches that.") + "</p>";
      }
      return list.map(function (r) {
        var rated = state.ratings[r.id] ? ratingStars(r.id, false) : "";
        var locked = typeof isRecipeLocked === "function" && isRecipeLocked(r.id);
        return '<button class="picker-row' + (locked ? " is-locked" : "") + '" data-id="' + r.id + '">' +
          '<span class="swatch" style="background:var(--' + (TAG_COLOR[r.tags[0]] || "border") + ')"></span>' +
          '<span><span class="title">' + (locked ? '<span class="lock-badge" aria-label="Locked">&#128274;</span> ' : '') + esc(r.title) + '</span><br><span class="meta">' + r.prep + '+' + r.cook + ' min' + (displayTags(r).length ? " · " + displayTags(r).join(", ") : "") + '</span></span>' +
          (rated ? '<span class="picker-rating">' + rated + '</span>' : "") +
          "</button>";
      }).join("");
    }
    function pickerChipsHtml() {
      var chip = function (id, text, on) {
        return '<button type="button" class="chip" data-chip="' + id + '" aria-pressed="' + (on ? "true" : "false") + '">' + text + "</button>";
      };
      return chip("fav", "★ favourites", pickerFav) +
        TIME_OPTIONS.map(function (m) { return chip("time:" + m, "≤ " + m + " min", pickerTime === m); }).join("") +
        PICKER_TAGS.map(function (t) { return chip("tag:" + t, t, !!pickerTags[t]); }).join("") +
        chip("sea", "no fish or seafood", !!(state.avoid && state.avoid.seafood));
    }
    pickerModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="picker-close-btn" aria-label="Close">✕</button></div>' +
      "<h2>" + titleText + "</h2>" +
      '<p style="color:var(--ink-muted); font-size:13px;">' + subText + "</p>" +
      '<input type="search" class="search-input" id="picker-search" placeholder="Search dinners or ingredients" style="margin-top:12px; width:100%; box-sizing:border-box;">' +
      '<div id="picker-chips" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">' + pickerChipsHtml() + "</div>" +
      '<div class="picker-list" id="picker-list">' + pickerRowsHtml() + "</div>" +
      '<button class="btn btn-ghost" id="picker-surprise-btn" style="margin-top:14px;">Surprise me</button>';
    pickerBackdrop.hidden = false;
    document.getElementById("picker-close-btn").addEventListener("click", closePicker);
    function wirePickerRows() {
      pickerModal.querySelectorAll(".picker-row").forEach(function (row) {
        row.addEventListener("click", function () {
          if (isRecipeLocked(row.dataset.id)) { closePicker(); openPaywall(); return; }
          var replacing = (ctx.type === "day" && state.plan[ctx.dayIdx]) || ctx.type === "batchReplace";
          closePicker();
          if (replacing) withUndo("Dinner swapped", function () { applyPick(ctx, row.dataset.id, "pick"); onStateChanged(); });
          else { applyPick(ctx, row.dataset.id, "pick"); onStateChanged(); }
        });
      });
    }
    function refreshPicker() {
      document.getElementById("picker-list").innerHTML = pickerRowsHtml();
      document.getElementById("picker-chips").innerHTML = pickerChipsHtml();
      wirePickerRows();
    }
    wirePickerRows();
    document.getElementById("picker-search").addEventListener("input", function (e) {
      pickerTerm = e.target.value;
      refreshPicker();
    });
    document.getElementById("picker-chips").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-chip]");
      if (!btn) return;
      var c = btn.dataset.chip;
      if (c === "fav") pickerFav = !pickerFav;
      else if (c === "sea") {
        toggleAvoid("seafood");
      } else if (c.indexOf("time:") === 0) {
        var m = parseInt(c.slice(5), 10); pickerTime = pickerTime === m ? 0 : m;
      } else if (c.indexOf("tag:") === 0) {
        var t = c.slice(4); pickerTags[t] = !pickerTags[t];
      }
      refreshPicker();
    });
    document.getElementById("picker-surprise-btn").addEventListener("click", function () {
      // Never suggest a dish rated 1 star. Fall back to the full list only
      // in the (unlikely) case every single recipe has been rated 1 star.
      // When not unlocked, only ever surprise with something already free.
      var pool = suggestPool(freeRecipePool(RECIPES));
      var pick = pool[Math.floor(Math.random() * pool.length)];
      applyPick(ctx, pick.id, "surprise");
      onStateChanged();
      closePicker();
    });
  }
  function closePicker() { pickerBackdrop.hidden = true; pickerModal.innerHTML = ""; }
  pickerBackdrop.addEventListener("click", function (e) { if (e.target === pickerBackdrop) closePicker(); });

  paywallBackdrop = document.getElementById("paywall-modal-backdrop");
  paywallModal = document.getElementById("paywall-modal");
  paywallBackdrop.addEventListener("click", function (e) { if (e.target === paywallBackdrop) closePaywall(); });
  // If the native layer restores a purchase (or completes one) outside of an
  // open paywall modal - e.g. an automatic restore on launch - re-render so
  // locks disappear immediately without needing a manual refresh.
  if (window.SSNative && window.SSNative.onProChange) {
    window.SSNative.onProChange(function () { onStateChanged(); });
  }

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
      statTile(BUILTIN_COUNT, "dinners in the book") +
      statTile(Object.keys(bookCountryCounts).length, "countries represented") +
      statTile(avgPrep + " min", "average prep time") +
      "</div>";
    if (!isPro()) {
      html += '<p class="stats-note">You’ve unlocked ' + FREE_RECIPE_IDS.length + ' of them so far, one from every cuisine. <a href="#" id="stats-unlock-link">Unlock the rest for ' + UNLOCK_PRICE + '</a>.</p>';
    }
    html += '<p class="stats-note">Quickest of the lot: <strong>' + fastest.title + "</strong> (" + (fastest.prep + fastest.cook) + " min start to finish). The whole book, cooked once each, comes to about " + fmtDuration(totalTimeAll) + " of kitchen time.</p>";

    html += "<h3>Countries in the book</h3>" + rankList(topEntries(bookCountryCounts, 100));

    var proteinEntries = topEntries(bookProteinCounts, 8).map(function (e) {
      return { key: e.key, count: e.count, label: proteinLabel[e.key] || capitalise(e.key) };
    });
    html += "<h3>What's in the book</h3>" + rankList(proteinEntries);

    var dietCounts = {
      vegetarian: RECIPES.filter(function (r) { return r.tags.indexOf("vegetarian") !== -1; }).length,
      vegan: RECIPES.filter(function (r) { return r.tags.indexOf("vegan") !== -1; }).length,
      fish: RECIPES.filter(function (r) { return r.tags.indexOf("fish") !== -1; }).length,
      spicy: RECIPES.filter(function (r) { return r.tags.indexOf("spicy") !== -1; }).length,
      quick: RECIPES.filter(function (r) { return r.tags.indexOf("quick") !== -1; }).length
    };
    html += "<h3>Diet &amp; style</h3><div class=\"stat-tile-row\">" +
      statTile(dietCounts.vegetarian, "vegetarian") +
      statTile(dietCounts.vegan, "vegan") +
      statTile(dietCounts.fish, "fish") +
      statTile(dietCounts.spicy, "spicy") +
      statTile(dietCounts.quick, "quick") +
      "</div>";
    html += "</div>";

    el.innerHTML = html;
    var unlockLink = document.getElementById("stats-unlock-link");
    if (unlockLink) unlockLink.addEventListener("click", function (e) { e.preventDefault(); openPaywall(); });
  }

  /* ============================= CALORIE ESTIMATE ============================= */
  // A rough kcal-per-serving estimate from the ingredient list, using typical
  // UK values per 100 g. It is shown clearly as an estimate, and only when
  // almost every ingredient in the recipe is recognised.
  var KCAL = [
    // [pattern, kcal per 100 g]
    [/^(salt|black pepper|salt and pepper|water|ice|sparkling water)$|peppercorn/, 0],
    [/stock cube|stock powder/, 250], [/stock|dashi|broth/, 5],
    [/soy sauce|fish sauce|oyster sauce|vinegar|worcestershire|hot sauce|sriracha|chilli sauce|lemon juice|lime juice|mustard|horseradish|tamarind|capers|gherkin|pickled|kimchi|sauerkraut|salsa|pico de gallo|passata|tomato purée|tomato puree|chopped tomatoes/, 40],
    [/olive oil|vegetable oil|sesame oil|mustard oil|red palm oil|oil/, 884],
    [/ghee/, 876], [/^butter$|butter, /, 740], [/peanut butter/, 590],
    [/double cream/, 445], [/single cream/, 190], [/soured cream|crème fraîche|creme fraiche/, 190],
    [/buttermilk/, 40], [/coconut milk/, 170], [/plant milk|milk/, 50],
    [/natural yoghurt|yoghurt|yogurt/, 80], [/tzatziki|raita/, 110],
    [/cheddar|hard cheese|gruy|emmental|parmesan|pecorino|provolone|kefalotyri|grated cheese|cheese slice|^cheese$/, 410],
    [/mozzarella/, 280], [/feta/, 265], [/halloumi/, 320], [/paneer/, 320], [/goat's cheese/, 300],
    [/cream cheese/, 250], [/cottage cheese|curd cheese|cheese curds/, 100],
    [/^egg$|egg yolk/, 145],
    [/chicken breast|turkey breast|chicken mince|turkey mince/, 110], [/chicken thigh|chicken/, 180],
    [/duck/, 200], [/beef mince|lamb mince|pork mince/, 250], [/mince/, 220],
    [/steak|beef|brisket/, 190], [/lamb/, 230], [/pork belly/, 500], [/pork|ham/, 190],
    [/bacon|lardons|pancetta/, 300], [/chorizo|salami|pepperoni/, 450], [/sausage|frankfurter|bratwurst|boerewors|merguez|kofta|meatball/, 280],
    [/prosciutto|pastrami|deli meat|spam/, 250],
    [/salmon|trout|mackerel|herring|sardine/, 200], [/tuna/, 110], [/prawn|shrimp|squid|calamari/, 90],
    [/cod|haddock|white fish|pollock|coley|basa|plaice|sea bass|bream|snapper|hake|fish/, 90],
    [/anchov/, 210], [/tofu/, 130], [/falafel/, 330],
    [/cooked rice|rice, cold|cooked jasmine|cooked wild|cooked pearl barley|pouch/, 150],
    [/rice noodles|glass noodles|vermicelli|flat rice noodles/, 360], [/udon|straight-to-wok|fresh noodles/, 140],
    [/noodles/, 360], [/rice cakes|tteok/, 230], [/rice/, 355],
    [/gnocchi/, 150], [/couscous|bulgur|freekeh|orzo|pasta|spaghetti|tagliatelle|pappardelle|penne|fusilli|macaroni/, 355],
    [/flour|cornflour|starch|maize meal/, 350], [/breadcrumbs|panko/, 380],
    [/tortilla chips/, 490], [/taco shell/, 470], [/tortilla|wrap|flatbread|pitta|roti|paratha|naan/, 290],
    [/bread|roll|bun|cornbread/, 250], [/puff pastry/, 400], [/filo/, 300], [/dumpling|wonton/, 280],
    [/lentils, drained|puy lentils|ready-cooked/, 110], [/dried .*lentils|red lentils|split peas|lentils/, 340],
    [/chickpeas|beans, drained|black beans|kidney beans|butter beans|cannellini|borlotti|black-eyed|pigeon peas|fava|broad beans|refried/, 110],
    [/edamame/, 120], [/peas/, 80], [/sweetcorn|corn on the cob/, 90],
    [/potato|chips|fries|plantain|kumara|cassava|yam/, 90], [/sweet potato/, 86],
    [/avocado/, 160], [/olive/, 145], [/walnut|almond|peanut|pine nut|cashew|pistachio|hazelnut|sesame seeds/, 600],
    [/raisins|sultanas|apricot|dates/, 280], [/sugar|honey|maple syrup|jam|molasses/, 330],
    [/pesto/, 450], [/mayonnaise/, 680], [/tahini/, 600], [/hummus/, 300],
    [/ketchup|barbecue|brown sauce|sweet and sour|teriyaki|hoisin|plum sauce|chutney|cranberry|apple sauce|okonomiyaki|sweet chilli|marinade/, 180],
    [/curry paste|paste|gochujang|harissa|miso|doubanjiang|sambal/, 150],
    [/curry sauce|katsu|peppercorn sauce|mustard sauce|dressing/, 120],
    [/wine|sherry|mirin|sake|shaoxing|ale|stout/, 90], [/juice/, 45], [/cocoa/, 230],
    [/coconut/, 350],
    // vegetables, fruit and herbs
    [/onion|shallot|leek|garlic|ginger|lemongrass/, 40], [/mushroom/, 22], [/spinach|kale|greens|pak choi|chard|cabbage|lettuce|salad|rocket|chicory|coleslaw/, 25],
    [/tomato|pepper|chilli|courgette|cucumber|celery|radish|daikon|fennel|beansprouts|broccoli|tenderstem|cauliflower|green beans|asparagus|aubergine|stir-fry veg|vegetable/, 25],
    [/carrot|squash|swede|beetroot|parsnip|pumpkin/, 40], [/apple|pear|orange|pineapple|pomegranate|mango|banana|lemon|lime/, 50],
    [/coriander|parsley|dill|mint|basil|chives|tarragon|thyme|rosemary|sage|curry leaves|lime leaves|bay|herbs/, 0],
    [/./, null]
  ];
  // grams for one unit of each kind of measure
  function kcalGrams(c, i) {
    var amt = c.amt, u = c.unit, n = c.name;
    if (amt === null || amt === undefined) {
      if (/handful|sprig|pinch|to taste/.test(u)) return 0; // garnish, negligible
      amt = 1;
    }
    var spoon = /oil|ghee|butter/.test(n) ? 13 : /flour|cornflour|starch|breadcrumbs|cocoa/.test(n) ? 8
      : /sugar|honey|syrup|jam|molasses|paste|sauce|ketchup|mayonnaise|yoghurt|cream|milk|juice|vinegar|wine|tahini|hummus|pesto|peanut butter|mustard/.test(n) ? 15 : 3;
    switch (u) {
      case "g": return amt;
      case "kg": return amt * 1000;
      case "ml": return amt;
      case "l": return amt * 1000;
      case "tbsp": return amt * spoon;
      case "tsp": return amt * spoon / 3;
      case "pinch": return amt * 0.3;
      case "clove": return amt * 5;
      case "tin": return amt * (c.drained ? 240 : 400);
      case "small tin": return amt * 110;
      case "slice": return amt * (/bread|bread roll|ham|prosciutto|cheese|emmental|gruy/.test(n) ? 30 : 20);
      case "sheet": return amt * (/puff/.test(n) ? 320 : /nori/.test(n) ? 3 : 30);
      case "rasher": return amt * 25;
      case "stick": return amt * (/celery/.test(n) ? 40 : 0);
      case "thumb": return amt * 25;
      case "small handful": return amt * 15;
      case "handful": case "handfuls": return amt * 30;
      case "large handful": return amt * 45;
      case "sprig": case "few sprigs": case "to taste": return 0;
      case "": {
        var each = SHOP_EACH_G[n] || KCAL_EACH_G[n];
        if (!each) { for (var k in KCAL_EACH_G) { if (n.indexOf(k) !== -1) { each = KCAL_EACH_G[k]; break; } } }
        return each ? amt * each : null;
      }
      default: return null;
    }
  }
  var KCAL_EACH_G = {
    "lime": 60, "lemon": 100, "orange": 150, "spring onion": 15, "red chilli": 10, "green chilli": 10, "chilli": 10,
    "scotch bonnet chilli": 10, "bird's eye chilli": 3, "tortilla": 40, "flour tortilla": 40, "corn tortilla": 30,
    "pitta bread": 60, "flatbread": 80, "burger bun": 60, "bread roll": 60, "crusty bread roll": 70, "sub roll": 80,
    "taco shell": 13, "roti": 70, "paratha": 80, "wrapper": 8, "anchovy fillet": 4, "gherkin": 30, "olive": 4,
    "dried apricot": 8, "bay leaf": 0, "cinnamon stick": 0, "star anise": 0, "cardamom pod": 0, "clove": 0,
    "lettuce leaf": 10, "little gem lettuce": 100, "heads chicory": 100, "chicory": 100, "fennel bulb": 250,
    "corn on the cob": 150, "plantain": 200, "green plantain": 200, "baby potato": 40, "small potato": 120,
    "stock cube": 10, "kaffir lime leave": 0, "lime leave": 0, "curry leave": 0, "sage leave": 0, "lemongrass": 20,
    "falafel": 20, "kofta": 50, "meatball": 25, "sausage": 65, "frankfurter": 50, "bratwurst": 100,
    "chorizo sausage": 60, "smoked sausage": 60, "chinese sausage": 40, "duck leg": 200, "lamb chop": 100,
    "pork loin chop": 200, "mackerel fillet": 150, "trout fillet": 180, "plaice fillet": 180, "white fish fillet": 180,
    "bell pepper": 160, "radish": 15, "daikon radish": 200, "shallot": 40, "garlic": 5, "egg": 55, "avocado": 150,
    "wooden skewer": 0, "whole allspice berrie": 0, "dried red chilli": 1, "green cardamom pod": 0
  };
  var kcalCache = {};
  function kcalPerServing(r) {
    if (kcalCache[r.id] !== undefined) return kcalCache[r.id];
    var total = 0, known = 0, lines = 0;
    r.ingredients.forEach(function (i) {
      var c = shopCanon(i, 1);
      lines++;
      var per100 = null;
      for (var k = 0; k < KCAL.length; k++) { if (KCAL[k][0].test(c.name)) { per100 = KCAL[k][1]; break; } }
      if (c.cat === "spice") per100 = 0;
      if (per100 === 0) { known++; return; }
      var g = kcalGrams(c, i);
      if (per100 === null || g === null) return;
      known++;
      // Oil "for frying" is mostly left in the pan; count what the food absorbs.
      if (/for (deep-?)?frying/.test(i.item) && g > 40) g = g * 0.15;
      total += g * per100 / 100;
    });
    var result = (lines && known / lines >= 0.85) ? Math.round(total / 10) * 10 : null;
    kcalCache[r.id] = result;
    return result;
  }

  /* ============================= SHARED HELPERS ============================= */
  function esc(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var NativeExtras = (isNativeApp() && window.Capacitor && window.Capacitor.registerPlugin)
    ? window.Capacitor.registerPlugin("NativeExtras") : null;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* ---------- toast with optional action (used for Undo) ---------- */
  var toastTimer = null;
  function toast(message, actionLabel, actionFn) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.innerHTML = '<span>' + esc(message) + '</span>' + (actionLabel ? '<button type="button" class="toast-action">' + esc(actionLabel) + '</button>' : "");
    el.hidden = false;
    if (actionLabel) {
      el.querySelector(".toast-action").addEventListener("click", function () {
        el.hidden = true;
        if (toastTimer) clearTimeout(toastTimer);
        actionFn();
      });
    }
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, actionLabel ? 6000 : 3000);
  }
  // Runs a change and offers to undo it for a few seconds afterwards.
  function withUndo(label, fn) {
    var snap = JSON.stringify(syncPayload());
    fn();
    toast(label, "Undo", function () {
      applyState(JSON.parse(snap));
      onStateChanged();
    });
  }

  /* ============================= WEEK ROLLOVER ============================= */
  function weekKey(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  // Moves the planner on to the current week when a new Monday arrives.
  // Returns true if anything changed (so the caller can save).
  function checkWeekRollover() {
    var now = weekMonday();
    if (now.getTime() !== MONDAY.getTime()) {
      MONDAY = now;
      todayIdx = (function () { var d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();
    }
    var key = weekKey(MONDAY);
    if (!state.planWeek) { state.planWeek = key; return true; } // older saves: adopt this week
    if (state.planWeek >= key) return false;
    var had = state.plan.some(Boolean);
    state.lastWeek = had ? { week: state.planWeek, plan: state.plan.slice() } : null;
    state.plan = [null, null, null, null, null, null, null];
    state.cooked = {};
    state.leftovers = {};
    state.checked = {};
    state.planWeek = key;
    state.newWeekNotice = had;
    return true;
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && checkWeekRollover()) onStateChanged();
  });

  function copyLastWeek() {
    if (!state.lastWeek) return;
    withUndo("Copied last week's dinners", function () {
      state.lastWeek.plan.forEach(function (id, i) {
        if (id && RECIPES_BY_ID[id] && !isRecipeLocked(id) && allowedByPrefs(RECIPES_BY_ID[id])) {
          state.plan[i] = id; logHistory(id, "copy");
        }
      });
      state.newWeekNotice = false;
      onStateChanged();
    });
  }
  function fillWeek() { document.getElementById("fill-week-btn").click(); }

  function renderPlannerBanner() {
    var el = document.getElementById("planner-banner");
    if (!el) return;
    if (state.mode !== "days") { el.innerHTML = ""; return; }
    if (state.newWeekNotice) {
      el.innerHTML = '<div class="banner-card"><div><strong>New week, fresh start.</strong>' +
        '<p>Last week\'s dinners and shopping ticks have been cleared.</p></div>' +
        '<div class="banner-actions">' +
        (state.lastWeek ? '<button type="button" class="btn btn-sm" id="banner-copy-btn">Copy last week</button>' : "") +
        '<button type="button" class="btn btn-primary btn-sm" id="banner-fill-btn">Fill my week</button>' +
        '<button type="button" class="icon-btn" id="banner-close-btn" aria-label="Dismiss">✕</button></div></div>';
      if (state.lastWeek) document.getElementById("banner-copy-btn").addEventListener("click", copyLastWeek);
      document.getElementById("banner-fill-btn").addEventListener("click", function () { state.newWeekNotice = false; fillWeek(); });
      document.getElementById("banner-close-btn").addEventListener("click", function () { state.newWeekNotice = false; onStateChanged(); });
    } else if (!state.plan.some(Boolean)) {
      el.innerHTML = '<div class="banner-card banner-hero"><div><strong>Plan your week in one tap.</strong>' +
        '<p>Get seven dinners picked for you, then swap any you don\'t fancy. Or tap a day below to choose yourself.</p></div>' +
        '<div class="banner-actions"><button type="button" class="btn btn-primary" id="banner-fill-btn">Fill my week</button></div></div>';
      document.getElementById("banner-fill-btn").addEventListener("click", fillWeek);
    } else {
      el.innerHTML = "";
    }
  }

  /* ============================= DISLIKES & ALLERGIES ============================= */
  var AVOID_OPTIONS = [
    ["seafood", "fish & seafood"], ["pork", "pork"], ["beef", "beef"], ["lamb", "lamb"], ["chicken", "chicken"],
    ["mushrooms", "mushrooms"], ["nuts", "nuts"], ["dairy", "dairy"], ["eggs", "eggs"], ["gluten", "gluten"], ["spicy", "spicy food"]
  ];
  var AVOID_TESTS = {
    seafood: function (r) { return hasSeafood(r); },
    pork: function (r, s) { return r.protein === "pork" || /\b(pork|bacon|ham|chorizo|salami|prosciutto|pancetta|lardons|spam|frankfurter|bratwurst|sausages?)\b/.test(s); },
    beef: function (r, s) { return r.protein === "beef" || /\b(beef|brisket|pastrami|sirloin|rump|boerewors)\b/.test(s); },
    lamb: function (r, s) { return r.protein === "lamb" || /\b(lamb|mutton|merguez)\b/.test(s); },
    chicken: function (r) { return r.protein === "chicken" || r.ingredients.some(function (i) { return /chicken/i.test(i.item) && !/stock/i.test(i.item); }); },
    mushrooms: function (r, s) { return /mushroom/.test(s); },
    nuts: function (r, s) { return /\b(peanuts?|almonds?|walnuts?|cashews?|pistachios?|hazelnuts?|pecans?|pine nuts|macadamia|satay|praline)\b|peanut butter/.test(s); },
    dairy: function (r) {
      return r.ingredients.some(function (i) {
        var t = i.item.toLowerCase();
        if (/coconut|peanut butter|butter beans|butternut|plant milk|dairy-free/.test(t)) return false;
        return i.cat === "dairy" && !/\begg/.test(t) || /\b(butter|cheese|cheddar|parmesan|mozzarella|feta|halloumi|paneer|milk|cream|yoghurt|yogurt|ghee|buttermilk|gruy|emmental|pecorino|curd|ricotta|mascarpone|provolone)\b/.test(t);
      });
    },
    eggs: function (r, s) { return /\beggs?\b|egg yolk|egg noodles|egg-fried/.test(s); },
    gluten: function (r, s) {
      return /\b(bread|breadcrumbs|panko|pasta|spaghetti|tagliatelle|pappardelle|penne|fusilli|macaroni|orzo|couscous|bulgur|freekeh|pitta|flatbread|naan|roti|paratha|pastry|filo|buns?|rolls?|barley|soy sauce|beer|ale|stout|gnocchi|dumpling|wonton|udon|egg noodles|plain flour|self-raising flour|tortillas?|wraps?|croutons|seitan|hoisin|teriyaki|worcestershire)\b/.test(s)
        && !/\bgluten-free\b/.test(s);
    },
    spicy: function (r) { return r.tags.indexOf("spicy") !== -1; }
  };
  var avoidCache = {};
  function recipeHas(r, key) {
    var ck = r.id + "|" + key;
    if (avoidCache[ck] === undefined) {
      var s = r.ingredients.map(function (i) { return i.item.toLowerCase(); }).join(" | ");
      avoidCache[ck] = !!AVOID_TESTS[key](r, s);
    }
    return avoidCache[ck];
  }
  function toggleAvoid(key) {
    state.avoid = state.avoid || {};
    if (state.avoid[key]) delete state.avoid[key]; else state.avoid[key] = true;
    state.noSeafood = !!state.avoid.seafood;
    scheduleSave();
    renderTagChips(); renderRecipeGrid(); renderPlanner();
  }
  function seasoningNote(r) {
    var found = [];
    r.ingredients.forEach(function (i) {
      var m = i.item.match(SEAFOOD_SEASONING_RE);
      if (m && found.indexOf(m[0].toLowerCase()) === -1) found.push(m[0].toLowerCase());
    });
    return found.length ? "Contains " + found.join(" and ") + " (made from fish or shellfish)." : "";
  }

  /* ============================= TIME FILTERS & TAGS ============================= */
  var TIME_OPTIONS = [15, 20, 30];
  function displayTags(r) { return r.tags.filter(function (t) { return t !== "quick"; }); }
  function withinTime(r, mins) { return !mins || (r.prep + r.cook) <= mins; }
  function isFavourite(r) { return (state.ratings[r.id] || 0) >= 4; }

  /* ============================= CUISINE CARDS ============================= */
  var ART_ICONS = {
    fish: '<path d="M2.5 12c2.6-3.8 7-5.3 11-3.6L18 5v14l-4.5-3.4c-4 1.7-8.4.2-11-3.6z"/><circle cx="7.2" cy="11" r="0.9" fill="currentColor" stroke="none"/>',
    chicken: '<path d="M15.5 3.5a5 5 0 0 1 3.6 8.5c-1.9 1.9-4.6 2.2-6.6 1.1l-3.2 3.2a2.1 2.1 0 1 1-2.9 2.9 2.1 2.1 0 1 1-1.2-3.6l3.2-3.2c-1.1-2-.8-4.7 1.1-6.6a5 5 0 0 1 6-.3"/>',
    meat: '<path d="M4 10.5C4 6.4 8 4 12.5 4S20 7 20 11.5 16.5 20 11.5 20C7.4 20 4 17 4 13.5z"/><circle cx="14.5" cy="10" r="2"/>',
    plant: '<path d="M5 19c0-8.3 5.9-14 14-14 0 8.1-5.7 14-14 14z"/><path d="M5 19l8-8"/>'
  };
  function artIcon(protein) {
    var key = protein === "fish" ? "fish" : (protein === "chicken" || protein === "turkey" || protein === "duck") ? "chicken"
      : protein === "plant-based" ? "plant" : "meat";
    return '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ART_ICONS[key] + "</svg>";
  }
  function cuisineHue(c) {
    var h = 0, s = String(c || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }
  function recipeArt(r, big) {
    return '<div class="recipe-art' + (big ? " recipe-art-big" : "") + '" style="--h:' + cuisineHue(r.cuisine) + '" aria-hidden="true">' +
      '<span class="art-text"><span class="art-cuisine">' + esc(r.custom ? "Your recipe" : r.cuisine) + '</span>' +
      '<span class="art-protein">' + esc(r.protein === "plant-based" ? "plant-based" : r.protein) + "</span></span>" +
      artIcon(r.protein) + "</div>";
  }

  /* ============================= CUPBOARD STAPLES & SHARING ============================= */
  var USUAL_BASICS = ["spice|salt", "spice|black pepper", "spice|salt and pepper", "store|olive oil", "store|vegetable oil",
    "store|soy sauce", "store|plain flour", "store|sugar", "spice|chilli flakes", "spice|ground cumin", "spice|paprika", "spice|smoked paprika"];
  var shopCupboardMode = false;
  function toggleStaple(key) {
    state.staples = state.staples || {};
    if (state.staples[key]) delete state.staples[key]; else state.staples[key] = true;
    scheduleSave();
    renderShopping();
  }
  function addUsualBasics() {
    state.staples = state.staples || {};
    USUAL_BASICS.forEach(function (k) { state.staples[k] = true; });
    scheduleSave();
    renderShopping();
    if (settingsOpen()) renderSettings();
  }
  function shoppingText() {
    var groups = shopBuild(currentRecipeIds());
    var lines = ["Solo Supper shopping list", ""];
    CAT_ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var keys = Object.keys(groups[cat]).filter(function (k) { return !state.checked[k] && !(state.staples && state.staples[k]); })
        .sort(function (a, b) { return groups[cat][a].label.localeCompare(groups[cat][b].label); });
      if (!keys.length) return;
      lines.push(CAT_LABEL[cat]);
      keys.forEach(function (k) { lines.push("- " + groups[cat][k].amt + " " + groups[cat][k].label); });
      lines.push("");
    });
    return lines.join("\n").trim();
  }
  function shareText(title, text) {
    if (NativeExtras) {
      NativeExtras.share({ title: title, text: text }).catch(function () { toast("Couldn't open sharing."); });
    } else if (navigator.share) {
      navigator.share({ title: title, text: text }).catch(function () { /* cancelled */ });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Shopping list copied."); }, function () { toast("Couldn't copy the list."); });
    } else {
      toast("Sharing isn't supported here.");
    }
  }

  /* ============================= COOKING MODE ============================= */
  var cook = null; // { r, ctx, step, timers: [{id, label, end, done}], ticker, wake }
  function stepDurations(text) {
    var out = [], re = /(\d+)\s*(?:[–-]|to)\s*(\d+)\s*(minutes?|mins?|seconds?|secs?)\b|(\d+)\s*(minutes?|mins?|seconds?|secs?)\b/gi, m;
    while ((m = re.exec(text))) {
      var n = parseInt(m[1] || m[4], 10), unit = (m[3] || m[5]).toLowerCase();
      var secs = /^s/.test(unit) ? n : n * 60;
      if (secs > 0 && secs <= 4 * 3600) out.push({ secs: secs, label: m[0] });
    }
    return out;
  }
  function keepAwake(on) {
    if (NativeExtras) { NativeExtras.keepAwake({ on: on }).catch(function () {}); return; }
    try {
      if (on && navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { if (cook) cook.wake = l; }).catch(function () {});
      if (!on && cook && cook.wake) { cook.wake.release(); cook.wake = null; }
    } catch (e) { /* not supported */ }
  }
  function beep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx(), o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } catch (e) { /* no audio */ }
    try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { /* no vibration */ }
  }
  function fmtClock(s) { s = Math.max(0, Math.ceil(s)); var m = Math.floor(s / 60), r = s % 60; return m + ":" + (r < 10 ? "0" : "") + r; }
  function openCookMode(recipeId, ctx) {
    var r = RECIPES_BY_ID[recipeId];
    if (!r) return;
    cook = { r: r, ctx: ctx || {}, step: 0, timers: [], ticker: null, wake: null, showIng: false };
    document.getElementById("cook-overlay").hidden = false;
    keepAwake(true);
    cook.ticker = setInterval(tickCook, 500);
    renderCook();
  }
  function closeCookMode() {
    if (!cook) return;
    clearInterval(cook.ticker);
    keepAwake(false);
    cook = null;
    var el = document.getElementById("cook-overlay");
    el.hidden = true; el.innerHTML = "";
  }
  function tickCook() {
    if (!cook) return;
    var now = Date.now(), changed = false;
    cook.timers.forEach(function (t) {
      if (!t.done && now >= t.end) { t.done = true; changed = true; beep(); toast("Timer done: " + t.label); }
    });
    var tl = document.getElementById("cook-timers");
    if (tl) tl.innerHTML = timersHtml();
    if (changed) wireTimerList();
  }
  function timersHtml() {
    if (!cook || !cook.timers.length) return "";
    return cook.timers.map(function (t) {
      return '<span class="cook-timer' + (t.done ? " is-done" : "") + '">' + (t.done ? "Done: " : "") + esc(t.label) +
        (t.done ? "" : " · " + fmtClock((t.end - Date.now()) / 1000)) +
        ' <button type="button" class="timer-x" data-timer="' + t.id + '" aria-label="Stop timer">✕</button></span>';
    }).join("");
  }
  function wireTimerList() {
    var tl = document.getElementById("cook-timers");
    if (!tl) return;
    tl.onclick = function (e) {
      var b = e.target.closest("[data-timer]");
      if (!b || !cook) return;
      cook.timers = cook.timers.filter(function (t) { return String(t.id) !== b.dataset.timer; });
      tl.innerHTML = timersHtml();
    };
  }
  function renderCook() {
    var el = document.getElementById("cook-overlay");
    if (!cook || !el) return;
    var r = cook.r, n = r.steps.length, i = cook.step, text = r.steps[i];
    var timers = stepDurations(text).map(function (d, k) {
      var nice = d.secs >= 60 ? Math.round(d.secs / 60) + " min" : d.secs + " sec";
      return '<button type="button" class="btn btn-sm cook-start-timer" data-secs="' + d.secs + '" data-label="' + esc("Step " + (i + 1) + " · " + nice) + '">⏱ Start ' + nice + " timer</button>";
    }).join("");
    var ings = r.ingredients.map(function (x) { return '<li><span class="amt">' + scaledAmtOnly(x) + "</span> " + esc(x.item) + "</li>"; }).join("");
    var last = i === n - 1;
    el.innerHTML =
      '<div class="cook-inner">' +
      '<div class="cook-top"><span class="cook-title">' + esc(r.title) + '</span><button type="button" class="icon-btn" id="cook-close-btn" aria-label="Close cooking mode">✕</button></div>' +
      '<div class="cook-timers" id="cook-timers">' + timersHtml() + "</div>" +
      '<div class="cook-progress">Step ' + (i + 1) + " of " + n + "</div>" +
      '<div class="cook-bar"><span style="width:' + Math.round(((i + 1) / n) * 100) + '%"></span></div>' +
      '<p class="cook-step">' + esc(text) + "</p>" +
      (timers ? '<div class="cook-timer-row">' + timers + "</div>" : "") +
      '<button type="button" class="btn btn-ghost btn-sm" id="cook-ing-btn">' + (cook.showIng ? "Hide ingredients" : "Show ingredients") + "</button>" +
      (cook.showIng ? '<ul class="cook-ings">' + ings + "</ul>" : "") +
      '<div class="cook-nav">' +
      '<button type="button" class="btn" id="cook-prev-btn"' + (i === 0 ? " disabled" : "") + ">← Back</button>" +
      (last ? '<button type="button" class="btn btn-primary" id="cook-done-btn">Finished ✓</button>'
            : '<button type="button" class="btn btn-primary" id="cook-next-btn">Next →</button>') +
      "</div></div>";
    document.getElementById("cook-close-btn").addEventListener("click", closeCookMode);
    document.getElementById("cook-ing-btn").addEventListener("click", function () { cook.showIng = !cook.showIng; renderCook(); });
    if (i > 0) document.getElementById("cook-prev-btn").addEventListener("click", function () { cook.step--; renderCook(); });
    if (!last) document.getElementById("cook-next-btn").addEventListener("click", function () { cook.step++; renderCook(); });
    else document.getElementById("cook-done-btn").addEventListener("click", function () {
      var ctx = cook.ctx;
      closeCookMode();
      if (ctx.dayIdx !== undefined) {
        var c = state.cooked[ctx.dayIdx];
        if (!(c && c.id === state.plan[ctx.dayIdx])) toggleCooked(ctx.dayIdx);
        toast("Enjoy! Marked as cooked.");
      } else if (ctx.batchUid !== undefined) {
        var item = state.batch.filter(function (b) { return b.uid === ctx.batchUid; })[0];
        if (item && !item.cookedAt) toggleCookedBatch(ctx.batchUid);
        toast("Enjoy! Marked as cooked.");
      } else {
        toast("Enjoy your dinner!");
      }
    });
    el.querySelectorAll(".cook-start-timer").forEach(function (b) {
      b.addEventListener("click", function () {
        cook.timers.push({ id: Date.now(), label: b.dataset.label, end: Date.now() + parseInt(b.dataset.secs, 10) * 1000, done: false });
        document.getElementById("cook-timers").innerHTML = timersHtml();
        wireTimerList();
      });
    });
    wireTimerList();
  }

  /* ============================= ANALYTICS CONSENT ============================= */
  var GA_ID = "G-JF54HQGVLT";
  var CONSENT_KEY = "soloSupper.analyticsConsent";
  function analyticsConsent() { return lsGet(CONSENT_KEY); } // "yes" | "no" | null
  function loadAnalytics() {
    window["ga-disable-" + GA_ID] = false;
    if (window.__ssGaLoaded) return;
    window.__ssGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
    var sc = document.createElement("script");
    sc.async = true;
    sc.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(sc);
  }
  function stopAnalytics() {
    window["ga-disable-" + GA_ID] = true;
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (/^_ga/.test(name)) document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });
  }
  function setAnalyticsConsent(yes) {
    lsSet(CONSENT_KEY, yes ? "yes" : "no");
    if (yes) loadAnalytics(); else stopAnalytics();
    var b = document.getElementById("consent-banner");
    if (b) b.hidden = true;
  }
  function initConsent() {
    var c = analyticsConsent();
    if (c === "yes") { loadAnalytics(); return; }
    if (c === "no") return;
    var b = document.getElementById("consent-banner");
    if (!b) return;
    b.innerHTML = '<p><strong>Help improve Solo Supper?</strong> Allow anonymous usage statistics (Google Analytics). ' +
      'No personal details, never sold. You can change this any time in Settings.</p>' +
      '<div class="consent-actions"><button type="button" class="btn btn-sm" id="consent-no">No thanks</button>' +
      '<button type="button" class="btn btn-primary btn-sm" id="consent-yes">Allow</button></div>';
    b.hidden = false;
    document.getElementById("consent-no").addEventListener("click", function () { setAnalyticsConsent(false); });
    document.getElementById("consent-yes").addEventListener("click", function () { setAnalyticsConsent(true); });
  }

  /* ============================= WEEKLY REMINDER (app only, opt-in) ============================= */
  var REMINDER_KEY = "soloSupper.reminder";
  function reminderPrefs() {
    var d = { on: false, weekday: 7, hour: 18 };
    try { var raw = JSON.parse(lsGet(REMINDER_KEY) || "null"); if (raw) { d.on = !!raw.on; d.weekday = raw.weekday || 7; d.hour = raw.hour === undefined ? 18 : raw.hour; } } catch (e) { /* defaults */ }
    return d;
  }
  function saveReminder(p, statusEl) {
    lsSet(REMINDER_KEY, JSON.stringify(p));
    if (!NativeExtras) return;
    NativeExtras.setReminder({ enabled: p.on, weekday: p.weekday, hour: p.hour, minute: 0 }).then(function (res) {
      if (p.on && res && res.enabled === false) {
        p.on = false; lsSet(REMINDER_KEY, JSON.stringify(p));
        if (statusEl) statusEl.textContent = "Notifications are blocked for Solo Supper. You can allow them in Android Settings › Apps › Solo Supper › Notifications.";
        var cb = document.getElementById("reminder-on"); if (cb) cb.checked = false;
      } else if (statusEl) {
        statusEl.textContent = p.on ? "Reminder set for " + DOW_NAMES[p.weekday - 1] + "s at " + p.hour + ":00." : "Reminder is off.";
      }
    }).catch(function () { if (statusEl) statusEl.textContent = "Couldn't update the reminder."; });
  }

  /* ============================= SETTINGS ============================= */
  var settingsBackdrop = document.getElementById("settings-modal-backdrop");
  var settingsModal = document.getElementById("settings-modal");
  function settingsOpen() { return settingsBackdrop && !settingsBackdrop.hidden; }
  function openSettings() { renderSettings(); settingsBackdrop.hidden = false; }
  function closeSettings() { settingsBackdrop.hidden = true; settingsModal.innerHTML = ""; }
  function renderSettings() {
    var avoid = state.avoid || {};
    var staples = Object.keys(state.staples || {}).sort();
    var rp = reminderPrefs();
    var hours = ""; for (var h = 6; h <= 21; h++) hours += '<option value="' + h + '"' + (h === rp.hour ? " selected" : "") + ">" + (h < 10 ? "0" : "") + h + ":00</option>";
    var days = DOW_NAMES.map(function (d, i) { return '<option value="' + (i + 1) + '"' + (i + 1 === rp.weekday ? " selected" : "") + ">" + d + "</option>"; }).join("");
    settingsModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="settings-close-btn" aria-label="Close">✕</button></div>' +
      "<h2>Settings</h2>" +
      "<h3>Never show me</h3>" +
      '<div class="chip-row">' + AVOID_OPTIONS.map(function (o) {
        return '<button type="button" class="chip" data-avoid="' + o[0] + '" aria-pressed="' + (avoid[o[0]] ? "true" : "false") + '">' + esc(o[1]) + "</button>";
      }).join("") + "</div>" +
      '<p class="settings-note">Hidden from browsing, picking and Surprise me. This works from each recipe\'s ingredient list, so if you have an allergy, always check labels and the full recipe.</p>' +
      "<h3>In your cupboard</h3>" +
      '<p class="settings-note">These stay off your shopping list. Tap Cupboard on the shopping list to add more.</p>' +
      (staples.length ? '<ul class="staple-list">' + staples.map(function (k) {
        return '<li><span>' + esc(k.split("|")[1]) + '</span><button type="button" class="btn btn-ghost btn-sm" data-unstaple="' + esc(k) + '">Remove</button></li>';
      }).join("") + "</ul>" : '<p class="settings-note">Nothing yet.</p>') +
      '<button type="button" class="btn btn-sm" id="settings-basics-btn">Add the usual basics (salt, pepper, oil…)</button>' +
      (NativeExtras ?
        "<h3>Weekly planning reminder</h3>" +
        '<label class="switch-row"><input type="checkbox" id="reminder-on"' + (rp.on ? " checked" : "") + '> Remind me to plan next week</label>' +
        '<div class="reminder-when"><select id="reminder-day" aria-label="Day">' + days + '</select><select id="reminder-hour" aria-label="Time">' + hours + "</select></div>" +
        '<p class="settings-note" id="reminder-status">' + (rp.on ? "Reminder set for " + DOW_NAMES[rp.weekday - 1] + "s at " + rp.hour + ":00." : "Off unless you switch it on.") + "</p>"
        : "") +
      "<h3>Privacy</h3>" +
      '<label class="switch-row"><input type="checkbox" id="analytics-on"' + (analyticsConsent() === "yes" ? " checked" : "") + "> Share anonymous usage statistics</label>" +
      '<p class="settings-note">Helps show which features get used. No personal details, never sold.</p>';
    document.getElementById("settings-close-btn").addEventListener("click", closeSettings);
    settingsModal.querySelectorAll("[data-avoid]").forEach(function (b) {
      b.addEventListener("click", function () { toggleAvoid(b.dataset.avoid); renderSettings(); });
    });
    settingsModal.querySelectorAll("[data-unstaple]").forEach(function (b) {
      b.addEventListener("click", function () { toggleStaple(b.dataset.unstaple); renderSettings(); });
    });
    document.getElementById("settings-basics-btn").addEventListener("click", addUsualBasics);
    document.getElementById("analytics-on").addEventListener("change", function (e) { setAnalyticsConsent(e.target.checked); });
    if (NativeExtras) {
      var status = document.getElementById("reminder-status");
      var update = function () {
        saveReminder({
          on: document.getElementById("reminder-on").checked,
          weekday: parseInt(document.getElementById("reminder-day").value, 10),
          hour: parseInt(document.getElementById("reminder-hour").value, 10)
        }, status);
      };
      document.getElementById("reminder-on").addEventListener("change", update);
      document.getElementById("reminder-day").addEventListener("change", function () { if (document.getElementById("reminder-on").checked) update(); });
      document.getElementById("reminder-hour").addEventListener("change", function () { if (document.getElementById("reminder-on").checked) update(); });
    }
  }
  if (settingsBackdrop) settingsBackdrop.addEventListener("click", function (e) { if (e.target === settingsBackdrop) closeSettings(); });
  var settingsBtn = document.getElementById("settings-btn");
  if (settingsBtn) settingsBtn.addEventListener("click", openSettings);

  /* ============================= YOUR OWN RECIPES ============================= */
  var customBackdrop = document.getElementById("custom-modal-backdrop");
  var customModal = document.getElementById("custom-modal");
  function registerCustomRecipes() {
    for (var i = RECIPES.length - 1; i >= 0; i--) {
      if (RECIPES[i].custom) { delete RECIPES_BY_ID[RECIPES[i].id]; RECIPES.splice(i, 1); }
    }
    (state.customRecipes || []).forEach(function (r) {
      if (!r || !r.id || !r.title || !Array.isArray(r.ingredients) || !Array.isArray(r.steps)) return;
      var copy = JSON.parse(JSON.stringify(r));
      copy.custom = true;
      if (copy.tags.indexOf("yours") === -1) copy.tags.push("yours");
      RECIPES.push(copy);
      RECIPES_BY_ID[copy.id] = copy;
      Object.keys(avoidCache).forEach(function (k) { if (k.indexOf(copy.id + "|") === 0) delete avoidCache[k]; });
      delete seafoodCache[copy.id];
      delete kcalCache[copy.id];
    });
  }
  var FRAC_CHARS = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 0.33, "⅔": 0.67, "⅛": 0.125 };
  function parseAmount(s) {
    if (!s) return null;
    s = s.trim();
    if (FRAC_CHARS[s] !== undefined) return FRAC_CHARS[s];
    var f = s.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (f) return parseInt(f[1], 10) / parseInt(f[2], 10);
    var n = parseFloat(s.replace(",", "."));
    return isNaN(n) ? null : n;
  }
  function guessCat(item) {
    var s = item.toLowerCase();
    if (/\b(chicken|beef|pork|lamb|mince|steak|bacon|ham|sausages?|chorizo|turkey|duck|salmon|cod|haddock|fish|prawns?|tuna|mackerel|trout|squid)\b/.test(s)) return "meat";
    if (/\bfrozen\b/.test(s)) return "frozen";
    if (/\b(milk|cheese|cheddar|butter|cream|yoghurt|yogurt|eggs?|feta|mozzarella|parmesan|halloumi|paneer)\b/.test(s) && !/coconut|peanut|butter beans|butternut/.test(s)) return "dairy";
    if (/\b(bread|rolls?|buns?|pitta|tortillas?|wraps?|naan|bagels?|pastry)\b/.test(s)) return "bakery";
    if (/\b(red|green|yellow|orange|bell) peppers?\b/.test(s)) return "produce";
    if (/\b(ground|dried|seeds|paprika|cumin|turmeric|cinnamon|nutmeg|oregano|chilli flakes|chilli powder|curry powder|garam masala|salt|black pepper|seasoning|spice|mixed herbs)\b/.test(s)) return "spice";
    if (/\b(onions?|garlic|ginger|carrots?|potato(es)?|tomato(es)?|chillies|chilli|courgettes?|mushrooms?|spinach|kale|cabbage|lettuce|cucumber|lemons?|limes?|apples?|avocados?|parsley|coriander|basil|mint|dill|leeks?|celery|broccoli|green beans|squash|spring onions?|salad|rocket|aubergines?|beansprouts|pak choi)\b/.test(s)
      && !/\b(tinned|chopped tomatoes|purée|puree|paste|juice)\b/.test(s)) return "produce";
    return "store";
  }
  function parseIngredientLine(line) {
    var t = line.trim().replace(/^[-•*]\s*/, "");
    if (!t) return null;
    var m = t.match(/^(\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔⅛])?\s*(kg|g|ml|l|tsp|tbsp|tins?|pinch(?:es)?|small handfuls?|large handfuls?|handfuls?|slices?|cloves?|rashers?|sheets?)?\.?\s+(?:of\s+)?(.+)$/i);
    var amt = null, unit = "", item = t;
    if (m && (m[1] || m[2])) {
      amt = parseAmount(m[1]);
      unit = (m[2] || "").toLowerCase().replace(/^(tin|pinch|handful|slice|rasher|sheet)(e?s)$/, "$1").replace(/^(small|large) handfuls$/, "$1 handful").replace(/^cloves$/, "clove");
      item = m[3];
      if (amt === null && unit) amt = 1;
    }
    return { amt: amt, unit: unit, item: item, cat: guessCat(item) };
  }
  function guessProtein(ings) {
    var s = ings.map(function (i) { return i.item.toLowerCase(); }).join(" ");
    if (/chicken/.test(s)) return "chicken";
    if (/\b(beef|steak|brisket)\b/.test(s)) return "beef";
    if (/\b(pork|bacon|ham|chorizo|sausage)\b/.test(s)) return "pork";
    if (/\blamb\b/.test(s)) return "lamb";
    if (/turkey/.test(s)) return "turkey";
    if (/duck/.test(s)) return "duck";
    if (SEAFOOD_RE.test(s)) return "fish";
    return "plant-based";
  }
  function openCustomForm(existingId) {
    if (!isPro()) { openPaywall(); return; }
    var r = existingId ? RECIPES_BY_ID[existingId] : null;
    var ingText = r ? r.ingredients.map(function (i) { return (i.amt !== null ? fmtAmt(i.amt) + " " : "") + (i.unit ? i.unit + " " : "") + i.item; }).join("\n") : "";
    var tags = r ? r.tags : [];
    var tagBox = function (t) { return '<label class="tick"><input type="checkbox" data-tag="' + t + '"' + (tags.indexOf(t) !== -1 ? " checked" : "") + "> " + t + "</label>"; };
    customModal.innerHTML =
      '<div class="modal-close-row"><button class="icon-btn" id="custom-close-btn" aria-label="Close">✕</button></div>' +
      "<h2>" + (r ? "Edit your recipe" : "Add your own recipe") + "</h2>" +
      '<p class="settings-note">Write it for one person. The app scales it and adds it to your shopping list like any other dinner.</p>' +
      '<label class="field">Name<input type="text" id="cr-title" maxlength="80" value="' + esc(r ? r.title : "") + '"></label>' +
      '<div class="field-row"><label class="field">Cuisine<input type="text" id="cr-cuisine" maxlength="30" placeholder="e.g. Italy" value="' + esc(r && r.cuisine !== "Your own" ? r.cuisine : "") + '"></label>' +
      '<label class="field">Prep (min)<input type="number" id="cr-prep" min="0" max="240" value="' + (r ? r.prep : 10) + '"></label>' +
      '<label class="field">Cook (min)<input type="number" id="cr-cook" min="0" max="480" value="' + (r ? r.cook : 15) + '"></label></div>' +
      '<div class="chip-row">' + ["vegetarian", "vegan", "fish", "spicy"].map(tagBox).join("") + "</div>" +
      '<label class="field">Ingredients, one per line<textarea id="cr-ings" rows="7" placeholder="150 g chicken thigh, diced&#10;1 onion, sliced&#10;1 tbsp olive oil&#10;salt and pepper">' + esc(ingText) + "</textarea></label>" +
      '<label class="field">Method, one step per line<textarea id="cr-steps" rows="7" placeholder="Fry the onion for 5 minutes.&#10;Add the chicken and cook for 8 minutes.">' + esc(r ? r.steps.join("\n") : "") + "</textarea></label>" +
      '<p class="form-error" id="cr-error" hidden></p>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary" id="cr-save-btn">Save recipe</button>' +
      (r ? '<button type="button" class="btn btn-ghost" id="cr-delete-btn">Delete</button>' : "") + "</div>";
    customBackdrop.hidden = false;
    document.getElementById("custom-close-btn").addEventListener("click", closeCustomForm);
    document.getElementById("cr-save-btn").addEventListener("click", function () {
      var title = document.getElementById("cr-title").value.trim();
      var ings = document.getElementById("cr-ings").value.split("\n").map(parseIngredientLine).filter(Boolean);
      var steps = document.getElementById("cr-steps").value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      var err = document.getElementById("cr-error");
      if (!title || !ings.length || !steps.length) {
        err.textContent = "Add a name, at least one ingredient and at least one step.";
        err.hidden = false;
        return;
      }
      var chosen = [];
      customModal.querySelectorAll("[data-tag]").forEach(function (c) { if (c.checked) chosen.push(c.dataset.tag); });
      var rec = {
        id: r ? r.id : "u" + newUid(), title: title, tags: chosen,
        cuisine: document.getElementById("cr-cuisine").value.trim() || "Your own",
        protein: guessProtein(ings),
        prep: Math.max(0, parseInt(document.getElementById("cr-prep").value, 10) || 0),
        cook: Math.max(0, parseInt(document.getElementById("cr-cook").value, 10) || 0),
        ingredients: ings, steps: steps
      };
      state.customRecipes = (state.customRecipes || []).filter(function (x) { return x.id !== rec.id; });
      state.customRecipes.push(rec);
      registerCustomRecipes();
      closeCustomForm();
      onStateChanged();
      toast(r ? "Recipe updated." : "Recipe added. Find it under \"yours\" in Recipes.");
    });
    if (r) {
      var del = document.getElementById("cr-delete-btn");
      del.addEventListener("click", function () {
        if (del.dataset.confirm !== "1") { del.dataset.confirm = "1"; del.textContent = "Tap again to delete"; return; }
        closeCustomForm();
        withUndo("Recipe deleted.", function () {
          state.customRecipes = (state.customRecipes || []).filter(function (x) { return x.id !== r.id; });
          registerCustomRecipes();
          onStateChanged();
        });
      });
    }
  }
  function closeCustomForm() { customBackdrop.hidden = true; customModal.innerHTML = ""; }
  if (customBackdrop) customBackdrop.addEventListener("click", function (e) { if (e.target === customBackdrop) closeCustomForm(); });
  var addRecipeBtn = document.getElementById("add-recipe-btn");
  if (addRecipeBtn) addRecipeBtn.addEventListener("click", function () { openCustomForm(null); });

  /* ============================= MODALS: BACK BUTTON, ESCAPE, FOCUS ============================= */
  var MODALS = [
    { el: function () { return document.getElementById("cook-overlay"); }, close: closeCookMode },
    { el: function () { return document.getElementById("custom-modal-backdrop"); }, close: function () { closeCustomForm(); } },
    { el: function () { return document.getElementById("paywall-modal-backdrop"); }, close: function () { closePaywall(); } },
    { el: function () { return document.getElementById("picker-modal-backdrop"); }, close: function () { closePicker(); } },
    { el: function () { return document.getElementById("recipe-modal-backdrop"); }, close: function () { closeRecipeModal(); } },
    { el: function () { return document.getElementById("settings-modal-backdrop"); }, close: function () { closeSettings(); } }
  ];
  var modalStack = [], lastFocus = [];
  function topModal() { return modalStack.length ? modalStack[modalStack.length - 1] : null; }
  MODALS.forEach(function (m) {
    var el = m.el();
    if (!el) return;
    new MutationObserver(function () {
      var open = !el.hidden, idx = modalStack.indexOf(m);
      if (open && idx === -1) {
        modalStack.push(m);
        lastFocus.push(document.activeElement);
        setTimeout(function () {
          var f = el.querySelector("button, [href], input, select, textarea");
          if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
        }, 0);
      } else if (!open && idx !== -1) {
        modalStack.splice(idx, 1);
        var prev = lastFocus.pop();
        if (prev && prev.focus && document.body.contains(prev)) try { prev.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
      document.body.classList.toggle("modal-open", modalStack.length > 0);
    }).observe(el, { attributes: true, attributeFilter: ["hidden"] });
  });
  // Android back button (called from MainActivity) and Escape share this.
  window.SSBack = function () {
    var m = topModal();
    if (m) { m.close(); return true; }
    var plannerTab = document.getElementById("tab-planner-btn");
    if (plannerTab && plannerTab.getAttribute("aria-selected") !== "true") { plannerTab.click(); return true; }
    return false;
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && topModal()) { e.preventDefault(); topModal().close(); return; }
    if (e.key === "Tab" && topModal()) {
      var box = topModal().el();
      var f = Array.prototype.filter.call(box.querySelectorAll("button, [href], input, select, textarea"), function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ============================= CLOUD SYNC ============================= */
  var SYNC_FIELDS = ["servings", "mode", "plan", "batch", "checked", "ratings", "noSeafood", "history", "cooked", "cookLog",
    "planWeek", "leftovers", "staples", "avoid", "customRecipes", "lastWeek", "newWeekNotice"];
  var UNSYNCED_KEY = "soloSupper.unsynced";
  var lastSyncedJson = {};
  var savePending = false;
  function syncPayload() {
    var o = {};
    SYNC_FIELDS.forEach(function (f) { o[f] = state[f] === undefined ? null : state[f]; });
    return JSON.parse(JSON.stringify(o));
  }
  function markUnsynced(v) { lsSet(UNSYNCED_KEY, v ? "1" : "0"); }
  function hasUnsynced() { return lsGet(UNSYNCED_KEY) === "1"; }
  function cloudRef() { return window.firebaseDb.collection("users").doc(currentUser.uid).collection("planner").doc("state"); }
  function rememberSynced(data) {
    SYNC_FIELDS.forEach(function (f) { lastSyncedJson[f] = JSON.stringify(data[f] === undefined ? null : data[f]); });
  }
  function unionBy(a, b, keyFn) {
    var seen = {}, out = [];
    (a || []).concat(b || []).forEach(function (x) { if (!x) return; var k = keyFn(x); if (!seen[k]) { seen[k] = true; out.push(x); } });
    return out;
  }
  // Local changes made while signed out (or offline) are merged into the
  // cloud copy instead of being overwritten by it.
  function mergeStates(L, C) {
    var M = JSON.parse(JSON.stringify(C));
    Object.keys(L).forEach(function (f) { if (M[f] === undefined || M[f] === null) M[f] = L[f]; });
    ["ratings", "staples", "avoid"].forEach(function (f) { M[f] = Object.assign({}, C[f] || {}, L[f] || {}); });
    var byTs = function (x) { return x.id + "@" + x.ts; };
    M.history = unionBy(C.history, L.history, byTs).sort(function (a, b) { return a.ts - b.ts; }).slice(-HISTORY_LIMIT);
    M.cookLog = unionBy(C.cookLog, L.cookLog, byTs).sort(function (a, b) { return a.ts - b.ts; }).slice(-HISTORY_LIMIT);
    M.customRecipes = unionBy(L.customRecipes, C.customRecipes, function (x) { return x.id; });
    M.batch = unionBy(C.batch, L.batch, function (x) { return x.uid; });
    if (L.planWeek && L.planWeek === C.planWeek) {
      M.plan = (C.plan || []).map(function (c, i) { return (L.plan && L.plan[i]) || c; });
      ["cooked", "leftovers", "checked"].forEach(function (f) { M[f] = Object.assign({}, C[f] || {}, L[f] || {}); });
    } else if (L.planWeek && (!C.planWeek || L.planWeek > C.planWeek)) {
      ["plan", "cooked", "leftovers", "checked", "planWeek", "lastWeek", "newWeekNotice"].forEach(function (f) { M[f] = L[f]; });
    }
    M.servings = L.servings; M.mode = L.mode;
    M.noSeafood = !!(L.noSeafood || C.noSeafood);
    return M;
  }
  function scheduleSave() {
    saveLocal();
    if (suppressSave) return;
    markUnsynced(true);
    if (!currentUser || !window.firebaseDb) return;
    setSyncStatus("Saving…");
    savePending = true;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      var payload = syncPayload(), changed = {}, n = 0;
      SYNC_FIELDS.forEach(function (f) {
        var j = JSON.stringify(payload[f]);
        if (lastSyncedJson[f] !== j) { changed[f] = payload[f]; n++; }
      });
      if (!n) { savePending = false; markUnsynced(false); setSyncStatus("Synced"); return; }
      changed.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      var ref = cloudRef();
      // update() replaces each changed field whole (so a removed rating stays removed);
      // it only fails if the document doesn't exist yet, in which case create it.
      ref.update(changed).catch(function () {
        payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        return ref.set(payload);
      }).then(function () {
        Object.keys(changed).forEach(function (f) { if (f !== "updatedAt") lastSyncedJson[f] = JSON.stringify(payload[f]); });
        savePending = false;
        if (!saveTimer) markUnsynced(false);
        setSyncStatus("Synced");
      }).catch(function () {
        savePending = false;
        setSyncStatus("Sync failed");
      });
    }, 400);
  }
  function startCloudSync(user) {
    stopCloudSync();
    if (!window.firebaseDb) return;
    var ref = window.firebaseDb.collection("users").doc(user.uid).collection("planner").doc("state");
    var first = true;
    setSyncStatus("Syncing…");
    firestoreUnsub = ref.onSnapshot({ includeMetadataChanges: true }, function (snap) {
      if (snap.metadata.hasPendingWrites || savePending) return; // our own write in flight; wait for the confirmed copy
      if (!snap.exists) {
        var payload = syncPayload();
        payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        ref.set(payload).then(function () { rememberSynced(syncPayload()); markUnsynced(false); setSyncStatus("Synced"); }).catch(function () { setSyncStatus("Sync failed"); });
        first = false;
        return;
      }
      var cloud = snap.data();
      if (first && hasUnsynced()) {
        first = false;
        var merged = mergeStates(syncPayload(), cloud);
        rememberSynced(cloud);
        suppressSave = true; applyState(merged); suppressSave = false;
        saveLocal(); renderAll();
        scheduleSave(); // pushes whatever the merge added
        return;
      }
      first = false;
      rememberSynced(cloud);
      suppressSave = true; applyState(cloud); suppressSave = false;
      markUnsynced(false);
      saveLocal(); renderAll();
      setSyncStatus("Synced");
    }, function () {
      setSyncStatus("Sync failed");
    });
  }

  /* ============================= LOCAL PRICE FROM GOOGLE PLAY ============================= */
  if (window.SSNative && window.SSNative.getPrice) {
    window.SSNative.getPrice().then(function (p) { if (p) UNLOCK_PRICE = p; }).catch(function () {});
  }

  var shopShareBtn = document.getElementById("shop-share-btn");
  if (shopShareBtn) shopShareBtn.addEventListener("click", function () {
    if (!currentRecipeIds().length) { toast("Add some dinners first."); return; }
    shareText("Shopping list", shoppingText());
  });
  var shopCupBtn = document.getElementById("shop-cupboard-btn");
  if (shopCupBtn) shopCupBtn.addEventListener("click", function () { shopCupboardMode = !shopCupboardMode; renderShopping(); });

  /* ============================= INIT ============================= */
  function renderAll() {
    if (checkWeekRollover()) setTimeout(scheduleSave, 0);
    document.getElementById("servings-value").textContent = state.servings;
    renderTagChips();
    renderPlanner();
    renderRecipeGrid();
    if (!panels.shopping.hidden) renderShopping();
    if (!panels.stats.hidden) renderStats();
  }
  initPersistence();
  renderTagChips();
  initConsent();
})();
