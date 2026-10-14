// Solo Supper recipe data: every built-in dinner, each written for one person.
// Shared by the planner (app.js) and the static site generator (scripts/build-site.js).
// Each ingredient is ing(amount, unit, item, shopping category).
window.SOLO_RECIPES = (function () {
  "use strict";
  function ing(amt, unit, item, cat) { return { amt: amt, unit: unit, item: item, cat: cat }; }
  return [
    {
      id: "d1", title: "Sticky Hoisin Pork with Egg-Fried Rice", tags: ["quick"], cuisine: "China", protein: "pork",
      prep: 8, cook: 10,
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
        "Season to taste, then return the pork to the pan, toss everything together, and scatter with sliced spring onion."
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
        "While the salmon cooks, bring the stock to the boil in a small pan (or make it up with just-boiled water from the kettle), then put the couscous in a bowl and pour the stock over. Cover and leave for 5 minutes until absorbed.",
        "Finely grate the zest from the lemon. Fluff the couscous with a fork, then stir through the zest, a squeeze of lemon juice, olive oil and chopped parsley.",
        "Season to taste, then serve the salmon on top of the couscous."
      ]
    },
    {
      id: "d3", title: "Thai Green Curry with Chicken", tags: ["spicy"], cuisine: "Thailand", protein: "chicken",
      prep: 8, cook: 15,
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
        "Pour in the remaining coconut milk and the green beans, and simmer for 6–8 minutes until the chicken is cooked through (75°C in the thickest part) and the sauce has thickened slightly.",
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
        "Season to taste, then add the noodles, toss well to combine, and serve immediately."
      ]
    },
    {
      id: "d5", title: "Spiced Chickpea & Spinach Curry", tags: ["vegetarian"], cuisine: "India", protein: "plant-based",
      prep: 8, cook: 19,
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
        "Heat the oil in a saucepan over medium heat and fry the onion for 8 minutes until soft and translucent.",
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
        "Heat a frying pan over medium-high heat and cook the chicken for 4 minutes each side until charred and cooked through (75°C in the thickest part). Rest for 2 minutes, then slice.",
        "Meanwhile, dry-fry the sweetcorn in a separate small pan over high heat for 3–4 minutes until lightly charred.",
        "Stir the charred corn through the salsa with the remaining olive oil and a squeeze of lime.",
        "Serve the sliced chicken with the corn salsa spooned over."
      ]
    },
    {
      id: "d7", title: "Quick Matar Paneer", tags: ["vegetarian"], cuisine: "India", protein: "plant-based",
      prep: 10, cook: 20,
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
        "Finely chop the onion and garlic. Heat the remaining oil in the same pan and fry the onion for 8 minutes until soft and translucent.",
        "Add the garlic, ginger, garam masala and turmeric, and cook for 1 minute until fragrant.",
        "Stir in the chopped tomatoes and simmer for 5 minutes until thickened.",
        "Season to taste, then add the peas and paneer, and simmer for 2–3 minutes until the peas are cooked through. Serve with the rice."
      ]
    },
    {
      id: "d8", title: "One-Pan Chorizo & Butter Bean Stew", tags: ["quick"], cuisine: "Spain", protein: "pork",
      prep: 8, cook: 16,
      ingredients: [
        ing(60, "g", "cooking chorizo", "meat"), ing(200, "g", "butter beans, drained", "store"),
        ing(200, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(null, "small handful", "fresh parsley, chopped", "produce"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Slice the chorizo and finely chop the onion and garlic.",
        "Fry the chorizo in a dry saucepan over medium heat for 2–3 minutes until it releases its red oil.",
        "Add the onion and cook for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the smoked paprika for 30 seconds until fragrant, then add the chopped tomatoes and butter beans and simmer for 8–10 minutes until thickened.",
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
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(40, "g", "panko breadcrumbs", "store"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "plain flour", "store"),
        ing(150, "g", "shop-bought katsu curry sauce", "store"),
        ing(3, "tbsp", "vegetable oil, for frying", "store"), ing(70, "g", "jasmine rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Flatten the chicken breast slightly, then coat in flour, dip in beaten egg, and press into the panko breadcrumbs to coat all over.",
        "Heat the vegetable oil in a frying pan over medium heat and fry the chicken for 4–5 minutes each side until deep golden and cooked through (75°C in the thickest part). Drain on kitchen paper and slice.",
        "Meanwhile, warm the katsu sauce through in a small pan.",
        "Season to taste, then serve the sliced katsu chicken over the rice, spooning the warmed curry sauce over the top."
      ]
    },
    {
      id: "d11", title: "Creamy Garlic Mushroom Tagliatelle", tags: ["vegetarian"], cuisine: "Italy", protein: "plant-based",
      prep: 7, cook: 10,
      ingredients: [
        ing(80, "g", "tagliatelle", "store"), ing(150, "g", "chestnut mushrooms, sliced", "produce"),
        ing(2, "", "garlic cloves, finely chopped", "produce"), ing(80, "ml", "double cream", "dairy"),
        ing(20, "g", "parmesan, grated", "dairy"), ing(15, "g", "butter", "dairy"),
        ing(null, "few sprigs", "fresh thyme", "produce"), ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Cook the tagliatelle in salted boiling water according to the packet instructions.",
        "Slice the mushrooms and finely chop the garlic.",
        "Heat the butter and olive oil in a large frying pan over medium-high heat, add the mushrooms and fry for 4–5 minutes until golden and any liquid has evaporated.",
        "Add the garlic and thyme leaves and cook for 30 seconds until fragrant.",
        "Pour in the cream, bring to a gentle simmer, and stir in the parmesan until melted into a silky sauce.",
        "Scoop out a splash of the cooking water, then drain the pasta and toss it through the sauce, loosening with the pasta water if needed."
      ]
    },
    {
      id: "d12", title: "Moroccan-Spiced Lamb with Couscous", tags: [], cuisine: "Morocco", protein: "lamb",
      prep: 8, cook: 16,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(60, "g", "couscous", "store"),
        ing(80, "ml", "vegetable stock", "store"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.25, "tsp", "ground cinnamon", "spice"), ing(3, "", "dried apricots", "store"),
        ing(0.25, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(null, "small handful", "fresh mint, torn", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Bring the stock to the boil in a small pan (or make it up with just-boiled water from the kettle). Put the couscous in a bowl, pour the stock over, cover and leave for 5 minutes until absorbed.",
        "Finely chop the onion, garlic and dried apricots.",
        "Heat the olive oil in a frying pan over medium-high heat and fry the onion for 8 minutes until soft and translucent.",
        "Add the lamb mince, breaking it up with a spoon, and fry for 4–5 minutes until browned.",
        "Stir in the garlic, cumin, cinnamon and apricots, and cook for 2 more minutes.",
        "Season to taste, then fluff the couscous with a fork and serve the spiced lamb on top, scattered with torn mint leaves."
      ]
    },
    {
      id: "d13", title: "Peri-Peri Chicken with Charred Tenderstem", tags: ["spicy"], cuisine: "Portugal", protein: "chicken",
      prep: 5, cook: 15,
      ingredients: [
        ing(180, "g", "boneless chicken thighs", "meat"), ing(2, "tbsp", "peri-peri sauce", "store"),
        ing(100, "g", "tenderstem broccoli", "produce"), ing(70, "g", "jasmine rice", "store"),
        ing(0.25, "", "lemon", "produce"), ing(2, "tsp", "olive oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Season the chicken thighs with salt and rub with half the olive oil.",
        "Heat a frying pan over medium-high heat and cook the chicken for 5–6 minutes each side until charred and cooked through (75°C in the thickest part), adding the peri-peri sauce for the last 1–2 minutes to glaze.",
        "While the chicken cooks, toss the broccoli in the remaining olive oil and cook in a separate hot griddle or frying pan for 4–5 minutes, turning, until charred and just tender.",
        "Season to taste, then slice the chicken and serve over the rice with the charred broccoli, finished with a squeeze of lemon."
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
      prep: 8, cook: 20,
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
        "Heat the oil in a saucepan over medium heat and fry the onion for 8 minutes until soft and translucent.",
        "Add the turkey mince and garlic, breaking up the mince with a spoon, and cook for 4–5 minutes until browned.",
        "Stir in the chilli powder and cumin for 30 seconds until fragrant, then add the chopped tomatoes, kidney beans and sweetcorn. Simmer for 8–10 minutes until thickened.",
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
        "Roast for a further 15–18 minutes until the chicken is cooked through (75°C in the thickest part) and the potatoes are tender, turning everything halfway.",
        "Taste and adjust the seasoning before serving."
      ]
    },
    {
      id: "d17", title: "Teriyaki Salmon with Sesame Greens", tags: ["fish"], cuisine: "Japan", protein: "fish",
      prep: 4, cook: 15,
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
        "Season to taste, then serve the salmon and its glaze over the rice with the greens, scattered with sesame seeds."
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
        "Season to taste, then scatter with sliced spring onion and serve."
      ]
    },
    {
      id: "d19", title: "Spiced Red Lentil Dahl with Flatbread", tags: ["vegetarian", "vegan"], cuisine: "India", protein: "plant-based",
      prep: 8, cook: 20,
      ingredients: [
        ing(75, "g", "red lentils", "store"), ing(100, "g", "chopped tomatoes", "store"),
        ing(0.25, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(250, "ml", "vegetable stock", "store"),
        ing(1, "", "flatbread", "bakery"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Rinse the red lentils under cold water.",
        "Finely chop the onion and garlic. Heat the oil in a saucepan over medium heat and fry the onion for 8 minutes until soft and translucent.",
        "Add the garlic, ginger, turmeric and cumin, and cook for 1 minute until fragrant.",
        "Stir in the lentils, chopped tomatoes and stock, and bring to the boil.",
        "Reduce the heat and simmer for 12–15 minutes, stirring occasionally, until the lentils are soft and the dahl has thickened.",
        "Season to taste and serve with the warmed flatbread."
      ]
    },
    {
      id: "d20", title: "Chicken Fajita Bowl", tags: ["quick"], cuisine: "Mexico", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "chicken breast, sliced", "meat"), ing(0.5, "", "pepper, sliced", "produce"),
        ing(0.5, "", "red onion, sliced", "produce"), ing(1.5, "tsp", "fajita seasoning", "spice"),
        ing(0.5, "", "lime", "produce"), ing(60, "g", "basmati rice", "store"),
        ing(null, "small handful", "fresh coriander, chopped", "produce"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Slice the chicken, pepper and red onion into strips.",
        "Toss the chicken with the fajita seasoning and oil. Heat a frying pan over high heat and fry the chicken for 5–6 minutes until cooked through with no pink inside, then set aside.",
        "Add the pepper and onion to the pan and cook for 3–4 minutes until softened and charred at the edges, then return the chicken and toss well.",
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
        "Meanwhile, season the pork chop and fry in the olive oil over medium-high heat for 4–5 minutes each side until cooked through (65–70°C in the middle). Rest on a plate for 3 minutes.",
        "Thinly slice the apple and add to the same pan with the butter, frying for 2 minutes until just softened.",
        "Stir in the mustard sauce and simmer for 2–3 minutes until warmed through.",
        "Drain the potatoes and serve alongside the pork chop, spooning the apple and mustard sauce over the top."
      ]
    },
    {
      id: "d22", title: "Butternut Squash & Feta Traybake", tags: ["vegetarian"], cuisine: "Greece", protein: "plant-based",
      prep: 8, cook: 30,
      ingredients: [
        ing(200, "g", "butternut squash, cubed", "produce"), ing(50, "g", "feta cheese", "dairy"),
        ing(0.5, "", "red onion, cut into wedges", "produce"), ing(1.5, "tbsp", "olive oil", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(null, "pinch", "chilli flakes", "spice"),
        ing(null, "small handful", "fresh parsley, chopped", "produce"), ing(50, "g", "couscous", "store"),
        ing(75, "ml", "vegetable stock", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the squash and red onion wedges with the olive oil, cumin and chilli flakes on a baking tray.",
        "Roast for 25 minutes, then crumble the feta over the top and roast for a further 5 minutes.",
        "While the vegetables finish roasting, bring the stock to the boil in a small pan (or make it up with just-boiled water from the kettle), then pour it over the couscous, cover and leave for 5 minutes, then fluff with a fork.",
        "Season to taste, then serve the roasted squash and feta over the couscous, scattered with chopped parsley."
      ]
    },
    {
      id: "d23", title: "Sausage & Butter Bean Cassoulet", tags: [], cuisine: "France", protein: "pork",
      prep: 8, cook: 19,
      ingredients: [
        ing(2, "", "pork sausages", "meat"), ing(200, "g", "butter beans, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(1, "", "small carrot, finely diced", "produce"),
        ing(0.25, "", "onion, finely diced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(null, "few sprigs", "fresh thyme", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Finely dice the carrot and onion, and chop the garlic.",
        "Heat the oil in a saucepan over medium heat and brown the sausages all over, about 4–5 minutes, then remove and slice into thick chunks.",
        "Add the carrot and onion to the same pan and cook for 8 minutes until soft and translucent.",
        "Add the garlic and thyme, then stir in the chopped tomatoes and butter beans, and return the sausage to the pan.",
        "Simmer for 8–10 minutes until the sauce has thickened and the sausage is cooked through.",
        "Taste and adjust the seasoning before serving."
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
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "beef frying strips", "meat"), ing(2, "tbsp", "massaman or red curry paste", "store"),
        ing(200, "ml", "coconut milk", "store"), ing(1, "", "small potato, diced", "produce"),
        ing(1, "tbsp", "roasted peanuts", "store"), ing(70, "g", "jasmine rice", "store"),
        ing(1, "tsp", "fish sauce", "store"), ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Dice the potato into 1.5cm chunks.",
        "Heat the oil in a saucepan over high heat and fry the beef strips for 1–2 minutes until browned all over. Tip onto a plate.",
        "Lower the heat to medium, add a splash of the coconut milk and the curry paste to the pan, and fry for 1 minute until fragrant.",
        "Add the potato and stir to coat, then pour in the remaining coconut milk. Simmer for 15 minutes, stirring now and then, until the potato is tender when pierced with a knife.",
        "Return the beef and any juices to the pan and simmer for 1 minute to warm through.",
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
        "Meanwhile, bring the stock to the boil in a small pan (or make it up with just-boiled water from the kettle), then put the couscous in a bowl, pour the stock over, cover and leave for 5 minutes.",
        "Fluff the couscous, stir through the remaining olive oil, lemon juice and chopped mint.",
        "Season to taste, then top with the roasted vegetables and grilled halloumi."
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
        "Heat a frying pan over medium-high heat and cook the chicken for 6–7 minutes, turning occasionally, until browned and cooked through (75°C in the thickest part).",
        "Meanwhile, thinly slice the red onion and warm the flatbread.",
        "Spread the tzatziki over the flatbread, top with the spiced chicken and red onion, then fold or roll to serve."
      ]
    },
    {
      id: "d28", title: "Sausage & Lentil One-Pot", tags: [], cuisine: "France", protein: "pork",
      prep: 8, cook: 21,
      ingredients: [
        ing(2, "", "pork sausages", "meat"), ing(150, "g", "green or brown lentils, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(1, "", "small carrot, diced", "produce"),
        ing(0.25, "", "onion, diced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(null, "few sprigs", "fresh rosemary", "produce"), ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Dice the carrot and onion, and chop the garlic.",
        "Heat the oil in a saucepan over medium heat and brown the sausages all over, about 5 minutes, then remove and slice.",
        "Add the carrot and onion to the pan and cook for 8 minutes until soft and translucent.",
        "Add the garlic and rosemary, then stir in the chopped tomatoes and lentils, and return the sausage to the pan.",
        "Simmer for 8–10 minutes until thickened and the sausage is cooked through.",
        "Taste and adjust the seasoning before serving."
      ]
    },
    {
      id: "d29", title: "Sweet & Sour Pork", tags: [], cuisine: "China", protein: "pork",
      prep: 7, cook: 15,
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
        "Season to taste, then return the pork to the pan, toss to coat, and serve over the rice."
      ]
    },
    {
      id: "d30", title: "Baked Feta Pasta", tags: ["vegetarian"], cuisine: "Greece", protein: "plant-based",
      prep: 6, cook: 20,
      ingredients: [
        ing(200, "g", "cherry tomatoes", "produce"), ing(80, "g", "feta cheese, block", "dairy"),
        ing(2, "", "garlic cloves, whole", "produce"), ing(2, "tbsp", "olive oil", "store"),
        ing(null, "pinch", "chilli flakes", "spice"), ing(80, "g", "fusilli or penne", "store"),
        ing(null, "small handful", "fresh basil, torn", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Put the cherry tomatoes and whole garlic cloves in a small baking dish, sit the block of feta in the middle, and drizzle everything with the olive oil and chilli flakes.",
        "Bake for 20 minutes until the tomatoes have burst and the feta is soft and lightly golden.",
        "Meanwhile, cook the pasta in salted boiling water according to the packet instructions, scoop out a splash of the cooking water, then drain.",
        "Mash the roasted garlic, tomatoes and feta together in the dish to make a sauce, loosening with the pasta water if needed.",
        "Toss through the pasta and scatter with torn basil."
      ]
    },
    {
      id: "d31", title: "Chicken & Chorizo Jambalaya", tags: ["spicy"], cuisine: "USA", protein: "chicken",
      prep: 11, cook: 35,
      ingredients: [
        ing(100, "g", "chicken thigh, diced", "meat"), ing(40, "g", "cooking chorizo, sliced", "meat"),
        ing(70, "g", "basmati or long-grain rice", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "pepper, diced", "produce"), ing(0.25, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(1, "tsp", "Cajun seasoning", "spice"),
        ing(150, "ml", "chicken stock", "store")
      ],
      steps: [
        "Dice the onion and pepper, and chop the garlic.",
        "Heat a saucepan over medium heat and fry the chorizo for 2 minutes until it releases its oil, then add the chicken and brown for 3–4 minutes.",
        "Add the onion and pepper and cook for 8 minutes until soft, adding the garlic for the last minute.",
        "Stir in the rice and Cajun seasoning for 1 minute until the rice is coated and the spices smell toasty, then add the chopped tomatoes and stock.",
        "Bring to a simmer, cover and cook for 15–18 minutes, stirring occasionally, until the rice is tender and the liquid is absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork."
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
      prep: 8, cook: 20,
      ingredients: [
        ing(250, "g", "butternut squash, cubed", "produce"), ing(150, "ml", "coconut milk", "store"),
        ing(250, "ml", "vegetable stock", "store"), ing(0.25, "", "onion, finely chopped", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "tsp", "mild curry powder", "spice"), ing(1, "slice", "crusty bread", "bakery"),
        ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Finely chop the onion and garlic.",
        "Heat the oil in a saucepan over medium heat and fry the onion for 8 minutes until soft and translucent.",
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
        "Heat a griddle or frying pan over medium-high heat and cook the chicken for 8–10 minutes, turning regularly, until charred and cooked through with no pink inside.",
        "Taste and adjust the seasoning.",
        "Warm the flatbread and serve alongside the chicken with the mint yoghurt dip for dipping."
      ]
    },
    {
      id: "d36", title: "Beef & Broccoli in Oyster Sauce", tags: ["quick"], cuisine: "China", protein: "beef",
      prep: 8, cook: 15,
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
        "Season to taste, then serve over the rice."
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
        "Taste and adjust the seasoning.",
        "Warm the pitta and serve alongside the skewers with the tzatziki."
      ]
    },
    {
      id: "d38", title: "Duck Breast with Plum Sauce and Egg Noodles", tags: [], cuisine: "China", protein: "duck",
      prep: 6, cook: 16,
      ingredients: [
        ing(1, "", "duck breast (about 150g)", "meat"), ing(2, "tbsp", "plum sauce", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(1, "", "spring onion, sliced", "produce"),
        ing(70, "g", "egg noodles", "store"), ing(80, "g", "pak choi or greens", "produce"),
        ing(1, "tsp", "sesame oil", "store")
      ],
      steps: [
        "Score the duck skin in a criss-cross pattern and season with salt.",
        "Place skin-side down in a cold frying pan and place over medium heat. Cook for 8–10 minutes until the fat has rendered and the skin is crisp, then flip and cook for 2–3 minutes more. Rest for 5 minutes, then slice.",
        "Meanwhile, cook the noodles according to the packet instructions, adding the pak choi for the last 2 minutes to wilt.",
        "Warm the plum sauce with the soy sauce in a small pan.",
        "Drain the noodles and greens, toss with the sesame oil, and top with the sliced duck. Spoon over the plum sauce and scatter with sliced spring onion."
      ]
    },
    {
      id: "d39", title: "Sausage, Kale & White Bean Stew", tags: [], cuisine: "Italy", protein: "pork",
      prep: 7, cook: 19,
      ingredients: [
        ing(2, "", "pork sausages", "meat"), ing(200, "g", "cannellini beans, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(null, "large handful", "kale or cavolo nero", "produce"),
        ing(0.25, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Chop the onion and garlic, and roughly tear the kale.",
        "Heat the oil in a saucepan over medium heat and brown the sausages all over, about 5 minutes, then remove and slice.",
        "Add the onion to the pan and cook for 8 minutes until soft and translucent, adding the garlic for the last minute.",
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
        "Season to taste, then serve the roasted cauliflower and chickpeas drizzled with the tahini and scattered with coriander."
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
        "Add the sliced chicken and simmer for 5–6 minutes until cooked through with no pink inside.",
        "Add the noodles and pak choi, and cook for a further 3–4 minutes until the noodles are tender.",
        "Season to taste, then ladle into a bowl and scatter with sliced spring onion."
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
        "Season to taste, then spoon the beef into the lettuce leaves, scatter with sliced spring onion and sesame seeds, and eat wrapped like a taco."
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
        "Heat the remaining oil in a frying pan over medium-high heat and cook the chicken for 6–7 minutes each side until golden and cooked through (75°C in the thickest part).",
        "Roughly chop the dried apricots and stir through the cooked rice.",
        "Season to taste, then slice the chicken and serve over the saffron rice."
      ]
    },
    {
      id: "d44", title: "Pork Meatballs in Tomato Sauce with Spaghetti", tags: [], cuisine: "Italy", protein: "pork",
      prep: 7, cook: 15,
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
      prep: 8, cook: 20,
      ingredients: [
        ing(180, "g", "chicken thigh fillets", "meat"), ing(1.5, "tbsp", "jerk seasoning", "spice"),
        ing(60, "g", "basmati rice", "store"), ing(100, "ml", "coconut milk", "store"),
        ing(80, "g", "kidney beans, drained", "store"), ing(1, "", "spring onion, sliced", "produce"),
        ing(0.25, "", "lime", "produce")
      ],
      steps: [
        "Rub the chicken all over with the jerk seasoning.",
        "Put the rice in a small pan with the coconut milk, 80 ml water and a pinch of salt. Cover and simmer gently for 12 minutes, stirring in the kidney beans for the last 5 minutes to heat through, until the rice is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Meanwhile, heat a frying pan over medium-high heat and cook the chicken for 6–7 minutes each side until charred and cooked through (75°C in the thickest part).",
        "Slice the chicken and serve over the rice and peas, scattered with sliced spring onion and a squeeze of lime."
      ]
    },
    {
      id: "d47", title: "Spiced Sweet Potato & Black Bean Bowl", tags: ["vegetarian", "vegan"], cuisine: "Mexico", protein: "plant-based",
      prep: 8, cook: 20,
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
        "Season to taste, then build the bowl with the roasted sweet potato, black beans and avocado, scattered with chopped coriander."
      ]
    },
    {
      id: "d48", title: "Beef Ragu with Pappardelle", tags: [], cuisine: "Italy", protein: "beef",
      prep: 10, cook: 24,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(200, "g", "chopped tomatoes", "store"),
        ing(1, "", "small carrot, finely diced", "produce"), ing(0.25, "", "onion, finely diced", "produce"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(0.5, "tsp", "dried oregano", "spice"),
        ing(15, "g", "parmesan, grated", "dairy"), ing(80, "g", "pappardelle or tagliatelle", "store"),
        ing(1, "tbsp", "olive oil", "store")
      ],
      steps: [
        "Finely dice the carrot and onion, and chop the garlic.",
        "Heat the oil in a saucepan over medium heat and fry the carrot and onion for 8 minutes until soft and translucent.",
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
        "Heat the olive oil in a frying pan over medium-high heat and fry the chicken for 3 minutes each side until golden and cooked through (75°C in the thickest part). Remove to a plate.",
        "Add the butter, capers, stock and a squeeze of lemon to the pan, scraping up any bits, and simmer for 1–2 minutes until slightly thickened.",
        "Meanwhile, cook the green beans in boiling water for 4–5 minutes until just tender.",
        "Season to taste, then spoon the caper sauce over the chicken and serve with the green beans."
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
        "Slice the sweet potato into 5 mm rounds and microwave them for 3 minutes to soften. Coat in the flour, then the milk, then press into the panko breadcrumbs.",
        "Heat the vegetable oil in a frying pan over medium heat and fry the sweet potato rounds for 3–4 minutes each side until golden and tender. Drain on kitchen paper.",
        "Meanwhile, warm the katsu sauce through in a small pan.",
        "Season to taste, then serve the crispy sweet potato over the rice, spooning the warmed curry sauce over the top."
      ]
    },
    {
      id: "d51", title: "Sticky Sesame Tofu with Rice", tags: ["vegetarian", "vegan"], cuisine: "China", protein: "plant-based",
      prep: 8, cook: 15,
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
        "Season to taste, then serve over the rice, scattered with sesame seeds and sliced spring onion."
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
        "Season to taste, then serve the koftas with the flatbread and tzatziki, scattered with a few mint leaves."
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
        "Season to taste, then scatter with sesame seeds to serve."
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
        "Season to taste, then serve straight from the tray."
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
        "Season to taste, then scatter with coriander to serve."
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
        "Season to taste, then scatter with coriander to serve."
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
        "Season to taste, then scatter with sesame seeds to serve."
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
        "Finely grate the zest from the lemon. Toss the chicken with the remaining oil, the dried herbs, crushed garlic and the zest, then add to the tray with the potatoes.",
        "Squeeze over the lemon juice and roast for a further 16–18 minutes until the chicken is cooked through (75°C in the thickest part) and the potatoes are tender.",
        "Taste and adjust the seasoning before serving."
      ]
    },
    {
      id: "d60", title: "Chorizo & New Potato Traybake with Peppers", tags: ["spicy"], cuisine: "Spain", protein: "pork",
      prep: 7, cook: 25,
      ingredients: [
        ing(80, "g", "cooking chorizo, sliced", "meat"), ing(150, "g", "new potatoes, halved", "produce"),
        ing(1, "", "pepper, sliced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tsp", "smoked paprika", "spice")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the potatoes with the oil and smoked paprika on a baking tray, and roast for 12 minutes.",
        "Add the chorizo and pepper to the tray, and roast for a further 13 minutes until the potatoes are tender and the chorizo is crisping at the edges.",
        "Taste and adjust the seasoning before serving."
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
        "Taste and adjust the seasoning.",
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
        "Roast for 20–22 minutes until the chicken is cooked through (75°C in the thickest part).",
        "Season to taste, then scatter over the feta and olives and roast for a final 3 minutes to warm through."
      ]
    },
    {
      id: "d63", title: "Filipino-Style Pork Adobo with Rice", tags: [], cuisine: "Philippines", protein: "pork",
      prep: 8, cook: 14,
      ingredients: [
        ing(180, "g", "pork loin steak, cut into 2cm cubes", "meat"), ing(2, "tbsp", "soy sauce", "store"),
        ing(2, "tbsp", "white or rice vinegar", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "", "bay leaf", "spice"), ing(0.25, "tsp", "black peppercorns", "spice"),
        ing(150, "g", "cooked rice", "store"),
        ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Brown the pork in the oil over high heat for 2–3 minutes, then tip onto a plate.",
        "Add the soy sauce, vinegar, garlic, bay leaf, peppercorns and 3 tbsp water to the pan.",
        "Simmer uncovered for 5 minutes until the sauce has reduced slightly, then return the pork and simmer for 3–4 minutes until cooked through and glazed.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d64", title: "Vietnamese-Style Caramel Pork with Rice", tags: [], cuisine: "Vietnam", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1.5, "tbsp", "fish sauce", "store"),
        ing(1.5, "tbsp", "brown sugar", "store"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "spring onion, sliced", "produce"),
        ing(150, "g", "cooked rice", "store"),
        ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat the oil in a saucepan over medium-high heat and brown the pork mince for 3–4 minutes, breaking it up as it cooks, until no pink remains.",
        "Sprinkle over the sugar and cook for 1–2 minutes, stirring, until it melts, darkens and coats the meat.",
        "Stir in the fish sauce, garlic and ginger with a splash of water, and simmer for 5 minutes until sticky.",
        "Season to taste, then serve over the rice, scattered with sliced spring onion."
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
        ing(150, "g", "cooked rice", "store"),
        ing(1, "tsp", "sugar", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Toss the chicken in the cornflour to coat.",
        "Heat a splash of oil in a wok over high heat and stir-fry the chicken for 4–5 minutes until browned and cooked through with no pink inside.",
        "Add the pepper, garlic and chilli flakes, and stir-fry for 2 minutes.",
        "Pour in the soy sauce, vinegar and sugar, simmer for 1–2 minutes, then stir through the peanuts.",
        "Season to taste, then serve over the rice."
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
        "Season to taste, then fold the egg back through and drizzle with sesame oil to serve."
      ]
    },
    {
      id: "d67", title: "Char Siu-Style Pork Steaks with Steamed Rice", tags: [], cuisine: "China", protein: "pork",
      prep: 6, cook: 10,
      ingredients: [
        ing(180, "g", "pork loin steak", "meat"), ing(2, "tbsp", "hoisin sauce", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(0.5, "tsp", "Chinese five spice", "spice"), ing(150, "g", "cooked rice", "store")
      ],
      steps: [
        "Mix the hoisin, soy sauce, honey and five spice, and coat the pork all over.",
        "Heat a frying pan or griddle over a medium heat (the sugary glaze burns on high) and cook the pork for 4–5 minutes each side, basting with any extra marinade, until glazed and cooked through.",
        "Season to taste, then rest for 2 minutes, then slice and serve with the rice."
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
        ing(150, "g", "cooked rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the crushed garlic and sliced chilli in a splash of oil over high heat for 30 seconds.",
        "Add the pork mince and brown for 4–5 minutes, breaking it up as it cooks.",
        "Stir in the fish sauce, soy sauce and sugar, and cook for 1–2 minutes, then stir through the basil leaves.",
        "Fry the egg separately in a little oil, keeping the yolk runny.",
        "Season to taste, then serve the pork over the rice, topped with the fried egg."
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
        "Season to taste, then add the noodles and beansprouts to the pan with the tofu, pour over the sauce, and toss for 1–2 minutes until well coated."
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
        "Stir in the passata and simmer for 6–8 minutes until the chicken is cooked through with no pink inside.",
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
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d72", title: "Chana Masala with Rice", tags: ["vegetarian", "vegan"], cuisine: "India", protein: "plant-based",
      prep: 8, cook: 20,
      ingredients: [
        ing(200, "g", "tinned chickpeas, drained", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tbsp", "medium curry powder", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(70, "g", "basmati rice", "store"), ing(null, "small handful", "fresh coriander, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion in a splash of oil for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the curry powder and cumin, and fry for 1 minute until fragrant.",
        "Add the chickpeas and chopped tomatoes, and simmer for 10 minutes until thickened.",
        "Season to taste, then serve over the rice, scattered with coriander."
      ]
    },
    {
      id: "d73", title: "Lamb Keema Curry with Peas", tags: [], cuisine: "India", protein: "lamb",
      prep: 8, cook: 23,
      ingredients: [
        ing(180, "g", "lamb mince", "meat"), ing(60, "g", "frozen peas", "frozen"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "tbsp", "medium curry powder or garam masala", "spice"),
        ing(70, "g", "basmati rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion in a splash of oil for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the lamb mince and brown for 4–5 minutes, breaking it up as it cooks.",
        "Stir in the curry powder, then add the chopped tomatoes and simmer for 8 minutes.",
        "Season to taste, then stir through the peas and cook for a final 2 minutes, then serve over the rice."
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
        "Heat a griddle or frying pan over medium-high heat and cook the chicken for 5–6 minutes, turning occasionally, until charred and cooked through with no pink inside.",
        "Season to taste, then serve over the minted rice with a squeeze of lemon."
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
        "Season to taste, then serve the falafel with the hummus, salad and flatbread."
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
        "Cook the rice according to the packet instructions, then finely grate in the zest of the lemon and stir it through with a squeeze of the juice and the chopped parsley.",
        "Toss the chicken with the za'atar and olive oil.",
        "Heat a frying pan over medium-high heat and cook the chicken for 6–7 minutes, turning occasionally, until cooked through with no pink inside.",
        "Season to taste, then serve the chicken over the lemon rice."
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
        "Heat a frying pan over medium-high heat and cook the turkey for 3–4 minutes each side until cooked through with no pink inside.",
        "Warm the flatbread and spread with the hummus.",
        "Season to taste, then top with the sliced turkey and drained pickled onion."
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
        "Season to taste, then build the bowl with the rice, beans and sweetcorn, beef, salsa and sliced avocado."
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
        "Season to taste, then cut into wedges and serve with the salsa."
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
        "Warm the salsa in a small frying pan with a lid over medium heat.",
        "Make two wells in the salsa and crack in the eggs.",
        "Scatter over the cheese, cover, and cook gently for 5–6 minutes until the eggs are just set.",
        "Season to taste, then scatter the tortilla chips over the top just before serving, with coriander."
      ]
    },
    {
      id: "d81", title: "Jamaican-Style Chicken Curry with Rice and Peas", tags: ["spicy"], cuisine: "Jamaica", protein: "chicken",
      prep: 8, cook: 25,
      ingredients: [
        ing(180, "g", "chicken thigh, diced", "meat"), ing(1.5, "tbsp", "curry powder", "spice"),
        ing(150, "ml", "coconut milk", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(70, "g", "rice", "store"),
        ing(80, "g", "tinned kidney beans, drained", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions, stirring in the kidney beans for the last 5 minutes.",
        "Fry the onion in a splash of oil for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the curry powder and fry for 1 minute, then add the chicken and brown for 3–4 minutes.",
        "Pour in the coconut milk and simmer for 12–15 minutes until the chicken is cooked through with no pink inside and the sauce has thickened.",
        "Season to taste, then serve with the rice and peas."
      ]
    },
    {
      id: "d82", title: "Cuban-Style Black Bean Rice Bowl", tags: ["vegetarian", "vegan", "quick"], cuisine: "Cuba", protein: "plant-based",
      prep: 7, cook: 14,
      ingredients: [
        ing(150, "g", "tinned black beans, drained", "store"), ing(150, "g", "cooked rice", "store"),
        ing(0.5, "", "pepper, diced", "produce"), ing(0.25, "", "red onion, diced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "", "lime", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the pepper and onion in a splash of oil for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the cumin for 30 seconds until fragrant, then add the black beans and a splash of water and simmer for 5 minutes until the beans are hot and the liquid has mostly gone.",
        "Season to taste, then serve over the rice with a squeeze of lime."
      ]
    },
    {
      id: "d83", title: "Spanish-Style Chicken and Chorizo Rice", tags: ["spicy"], cuisine: "Spain", protein: "chicken",
      prep: 10, cook: 25,
      ingredients: [
        ing(100, "g", "chicken thigh, diced", "meat"), ing(40, "g", "cooking chorizo, sliced", "meat"),
        ing(70, "g", "paella or short-grain rice", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "pepper, sliced", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(200, "ml", "chicken stock", "store")
      ],
      steps: [
        "Fry the chorizo in a saucepan for 2 minutes until it releases its oil, then add the chicken and brown for 3–4 minutes.",
        "Add the pepper and garlic, and cook for 2 minutes.",
        "Stir in the rice and smoked paprika for 1 minute until the rice is coated and the paprika smells toasty, then add the chopped tomatoes and stock.",
        "Bring to a simmer, cover and cook for 15–18 minutes, stirring occasionally, until the rice is tender. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Taste and adjust the seasoning before serving."
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
      prep: 6, cook: 30,
      ingredients: [
        ing(200, "g", "potato, cubed", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(100, "g", "chopped tomatoes", "store"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(1, "", "egg", "dairy")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the potato with the oil on a baking tray and roast for 25–30 minutes until crisp, turning halfway.",
        "Meanwhile, simmer the chopped tomatoes with the smoked paprika and chilli flakes for 8–10 minutes until thickened.",
        "Fry the egg to your liking.",
        "Season to taste, then serve the potatoes with the spiced tomato sauce spooned over and the fried egg on top."
      ]
    },
    {
      id: "d86", title: "Greek-Style Lamb Gyros Bowl with Tzatziki", tags: [], cuisine: "Greece", protein: "lamb",
      prep: 8, cook: 15,
      ingredients: [
        ing(180, "g", "lamb mince", "meat"), ing(1, "tsp", "dried oregano", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(70, "g", "basmati rice", "store"), ing(4, "tbsp", "shop-bought tzatziki", "store"),
        ing(80, "g", "cherry tomatoes, halved", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the lamb mince with ¼ tsp salt, the oregano, cumin and crushed garlic.",
        "Fry over medium-high heat for 6–7 minutes, breaking it up, until browned and cooked through.",
        "Season to taste, then serve over the rice with the tzatziki and cherry tomatoes."
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
        "Cook the orzo in salted boiling water according to the packet instructions, scoop out a splash of the cooking water, then drain.",
        "Finely grate the zest from the lemon. Toss the warm orzo with the olive oil, the zest and a squeeze of the juice, loosening with the reserved water if needed.",
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
        "Season to taste, then remove from the heat, stir through the parmesan, and rest for a minute before serving."
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
        "Cook the pasta in salted boiling water according to the packet instructions, scoop out a splash of the cooking water, then drain.",
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
        "Cook the gnocchi in salted boiling water according to the packet instructions until they float, scoop out a splash of the cooking water, then drain.",
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
        "Cook the spaghetti in salted boiling water according to the packet instructions, scoop out a splash of the cooking water, then drain.",
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
        ing(30, "g", "mixed salad leaves", "produce"), ing(1, "tsp", "olive oil", "store"),
        ing(10, "g", "butter", "dairy")
      ],
      steps: [
        "Spread one slice of bread with the mustard and layer with the ham and all the cheese, then top with the second slice.",
        "Spread the outside of the sandwich thinly with the butter.",
        "Fry in a frying pan over medium heat for 3 minutes each side until golden and the cheese has melted.",
        "Season to taste, then serve with the salad leaves tossed in the olive oil."
      ]
    },
    {
      id: "d93", title: "French-Style Chicken Chasseur", tags: [], cuisine: "France", protein: "chicken",
      prep: 8, cook: 24,
      ingredients: [
        ing(180, "g", "chicken thigh", "meat"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(100, "g", "chopped tomatoes", "store"),
        ing(100, "ml", "chicken stock", "store"), ing(1, "tsp", "dried tarragon or mixed herbs", "spice"),
        ing(150, "g", "new potatoes, halved", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the new potatoes in boiling salted water for 15–18 minutes until tender, then drain.",
        "Meanwhile, brown the chicken in a splash of oil for 4–5 minutes, then set aside.",
        "Fry the onion and mushrooms in the same pan for 8 minutes until the onion is soft and the mushrooms golden.",
        "Return the chicken to the pan with the tomatoes, stock and tarragon, and simmer for 10–12 minutes until the chicken is cooked through (75°C in the thickest part) and the sauce has thickened.",
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
        "Season to taste, then spoon the curry sauce over the sausages and serve with the fries."
      ]
    },
    {
      id: "d95", title: "Speedy Cottage Pie Mash Cup", tags: [], cuisine: "UK", protein: "beef",
      prep: 8, cook: 24,
      ingredients: [
        ing(180, "g", "beef mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "carrot, diced", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(150, "ml", "beef stock", "store"), ing(250, "g", "potato, peeled and cubed", "produce"),
        ing(15, "g", "butter", "dairy")
      ],
      steps: [
        "Cook the potato in boiling salted water for 15 minutes until tender, then drain and mash with the butter and a splash of milk if you have it.",
        "Meanwhile, brown the beef mince with the onion and carrot in a hot pan for 6–8 minutes, breaking it up, until no pink remains and the onion has softened.",
        "Stir in the tomato purée and fry for 1 minute until it darkens, then add the stock and simmer for 10 minutes until thickened.",
        "Heat the grill to high. Spoon the mince into a small ovenproof dish or a large mug, top with the mash and rough up the surface with a fork. Grill for 3–4 minutes until golden and crisp on top."
      ]
    },
    {
      id: "d96", title: "Bangers and Colcannon Mash with Onion Gravy", tags: [], cuisine: "Ireland", protein: "pork",
      prep: 7, cook: 24,
      ingredients: [
        ing(3, "", "pork sausages", "meat"), ing(250, "g", "potato, peeled and cubed", "produce"),
        ing(60, "g", "cabbage or kale, shredded", "produce"), ing(15, "g", "butter", "dairy"),
        ing(0.5, "", "onion, sliced", "produce"), ing(150, "ml", "beef or vegetable stock", "store"),
        ing(1, "tsp", "cornflour", "store")
      ],
      steps: [
        "Cook the potato in boiling salted water for 15 minutes until tender.",
        "Meanwhile, grill or fry the sausages for 12–15 minutes, turning occasionally, until browned and cooked through.",
        "Fry the onion in a splash of oil for 10 minutes until soft and golden, then stir in the stock and cornflour mixed with a splash of water, and simmer for 2 minutes until thickened into a gravy.",
        "Steam or boil the cabbage for the final 3 minutes of the potatoes' cooking time, then drain everything and mash together with the butter.",
        "Serve the sausages over the colcannon mash with the onion gravy."
      ]
    },
    {
      id: "d97", title: "Miso Butter Salmon with Steamed Rice", tags: ["fish"], cuisine: "Japan", protein: "fish",
      prep: 6, cook: 15,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(1, "tbsp", "miso paste", "store"),
        ing(15, "g", "butter, softened", "dairy"), ing(1, "tsp", "soy sauce", "store"),
        ing(70, "g", "jasmine rice", "store"), ing(1, "", "spring onion, sliced", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Cook the rice according to the packet instructions.",
        "Mash the miso paste into the softened butter with the soy sauce.",
        "Spread over the salmon and place on a lined baking tray.",
        "Roast for 10–12 minutes until just cooked through.",
        "Season to taste, then serve over the rice, scattered with sliced spring onion."
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
        "Season to taste, then return the beef to the wok, toss together, and drizzle with sesame oil to serve."
      ]
    },
    {
      id: "d99", title: "Bibimbap-Style Beef Rice Bowl", tags: [], cuisine: "Korea", protein: "beef",
      prep: 8, cook: 15,
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
        "Season to taste, then drizzle the rice with sesame oil, top with the egg, and scatter with sliced spring onion."
      ]
    },
    {
      id: "d101", title: "Ethiopian-Inspired Spiced Red Lentil Stew", tags: ["vegetarian", "vegan"], cuisine: "Ethiopia", protein: "plant-based",
      prep: 8, cook: 24,
      ingredients: [
        ing(80, "g", "dried red lentils", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "smoked paprika", "spice"), ing(0.5, "tsp", "ground ginger", "spice"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Rinse the lentils well.",
        "Fry the onion in a splash of oil for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the paprika, ginger, cinnamon and chilli flakes, and cook for 1 minute until fragrant.",
        "Season to taste, then add the lentils, chopped tomatoes and 300ml water, and simmer for 15 minutes, stirring occasionally, until the lentils are tender and the stew has thickened."
      ]
    },
    {
      id: "d102", title: "Tofu Satay Bowl with Peanut Sauce", tags: ["vegetarian", "vegan"], cuisine: "Indonesia", protein: "plant-based",
      prep: 8, cook: 15,
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
        "Season to taste, then serve the tofu over the rice with the cucumber, drizzled with the peanut sauce."
      ]
    },
    {
      id: "d103", title: "Polish Sausage & Sauerkraut Skillet", tags: ["quick"], cuisine: "Poland", protein: "pork",
      prep: 7, cook: 12,
      ingredients: [
        ing(2, "", "pork sausages, sliced", "meat"), ing(150, "g", "sauerkraut, drained", "store"),
        ing(1, "", "small potato, diced", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "tsp", "caraway seeds", "spice"), ing(1, "tsp", "Dijon mustard", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the diced potato for 8–10 minutes until tender, then drain.",
        "Fry the sausage slices and onion in a splash of oil over medium-high heat for 5–6 minutes until browned.",
        "Stir in the sauerkraut, caraway seeds and boiled potato, and cook for 3–4 minutes until hot through.",
        "Season to taste, then serve with the mustard stirred through or on the side."
      ]
    },
    {
      id: "d104", title: "Polish-Style Potato & Curd Cheese Bake", tags: ["vegetarian"], cuisine: "Poland", protein: "plant-based",
      prep: 8, cook: 25,
      ingredients: [
        ing(250, "g", "potato, sliced thin", "produce"), ing(100, "g", "cottage cheese or curd cheese", "dairy"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "butter", "dairy"), ing(null, "small handful", "chives, chopped", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Boil the potato slices in salted water for 6 minutes until just tender, then drain. Meanwhile, fry the onion in the butter over medium heat for 10 minutes until soft and golden.",
        "Layer the potato slices in a small ovenproof dish with the fried onion and cottage cheese.",
        "Bake for 14 minutes until bubbling and golden on top.",
        "Dollop with soured cream and scatter with chives to serve."
      ]
    },
    {
      id: "d105", title: "Polish Dill Chicken with Soured Cream", tags: ["quick"], cuisine: "Poland", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "chicken breast, sliced", "meat"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(1, "tsp", "plain flour", "store"), ing(100, "ml", "chicken stock", "store"),
        ing(null, "handful", "fresh dill, chopped", "produce"), ing(70, "g", "new potatoes", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Halve any larger new potatoes and boil for 12–15 minutes until a knife slides in easily, then drain.",
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until browned and cooked through with no pink inside.",
        "Stir in the flour, then pour in the stock and simmer for 2 minutes until slightly thickened.",
        "Season to taste, then stir in the soured cream and most of the dill, and serve over the potatoes, scattered with the rest of the dill."
      ]
    },
    {
      id: "d106", title: "Hungarian-Style Chicken Paprikash", tags: ["quick"], cuisine: "Hungary", protein: "chicken",
      prep: 8, cook: 19,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "tbsp", "sweet paprika", "spice"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(150, "g", "chopped tomatoes", "store"), ing(70, "g", "egg noodles or pasta", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the noodles according to the packet instructions.",
        "Fry the onion in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Add the chicken and cook for 6–7 minutes until browned.",
        "Taste and adjust the seasoning.",
        "Take off the heat and stir in the paprika (it burns easily), then add the chopped tomatoes and simmer for 4 minutes, then take off the heat, stir through the soured cream and serve over the noodles."
      ]
    },
    {
      id: "d107", title: "Hungarian Beef Goulash-Style Stew", tags: [], cuisine: "Hungary", protein: "beef",
      prep: 9, cook: 24,
      ingredients: [
        ing(160, "g", "beef rump steak, cut into strips", "meat"), ing(1, "", "small potato, cut into 1.5cm cubes", "produce"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(1.5, "tbsp", "sweet paprika", "spice"),
        ing(250, "ml", "beef stock", "store"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Sear the beef in a splash of oil in a saucepan over high heat for 1–2 minutes until browned but still pink inside. Tip onto a plate.",
        "Lower the heat to medium, add the onion and red pepper and cook for 8 minutes until soft and translucent, then add the garlic for 1 minute.",
        "Stir in the paprika for 30 seconds until fragrant, then add the potato and stock. Cover and simmer for 12–15 minutes until a knife slides easily into the potato.",
        "Return the beef and its juices and simmer for 1 minute to heat through. Season and serve in a bowl, with bread if you like."
      ]
    },
    {
      id: "d108", title: "Hungarian Cabbage & Sausage Skillet", tags: ["quick"], cuisine: "Hungary", protein: "pork",
      prep: 7, cook: 13,
      ingredients: [
        ing(2, "", "smoked sausages, sliced", "meat"), ing(200, "g", "white cabbage, shredded", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "tsp", "sweet paprika", "spice"),
        ing(1, "tsp", "caraway seeds", "spice"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the sausage and onion in a splash of oil over medium-high heat for 4 minutes.",
        "Add the cabbage, paprika and caraway seeds, and cook for 8–9 minutes, stirring often, until the cabbage has softened.",
        "Season to taste, then stir through the soured cream off the heat and serve."
      ]
    },
    {
      id: "d109", title: "Israeli-Style Shakshuka", tags: ["vegetarian", "spicy", "quick"], cuisine: "Israel", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(200, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "", "flatbread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion and red pepper in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Stir in the cumin and chilli flakes for 30 seconds until fragrant, then add the chopped tomatoes and simmer for 5 minutes until thickened.",
        "Make two wells in the sauce, crack in the eggs, cover and cook for 4–5 minutes until the whites are set.",
        "Season to taste, then serve straight from the pan with the flatbread."
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
        "Season to taste, then top with the fried halloumi to serve."
      ]
    },
    {
      id: "d111", title: "Israeli-Style Chicken Skewers with Tahini", tags: ["quick"], cuisine: "Israel", protein: "chicken",
      prep: 9, cook: 9,
      ingredients: [
        ing(160, "g", "chicken breast, cubed", "meat"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(2, "tbsp", "tahini", "store"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "flatbread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Toss the chicken with the cumin, paprika and a splash of oil.",
        "Thread onto skewers (or leave loose) and griddle or fry over medium-high heat for 8–9 minutes, turning, until cooked through.",
        "Whisk the tahini with the lemon juice and a splash of water until smooth and drizzly.",
        "Season to taste, then serve the chicken in the flatbread, drizzled with the tahini sauce."
      ]
    },
    {
      id: "d112", title: "Egyptian-Style Koshari Bowl", tags: ["vegetarian", "vegan"], cuisine: "Egypt", protein: "plant-based",
      prep: 8, cook: 22,
      ingredients: [
        ing(50, "g", "dried brown lentils", "store"), ing(50, "g", "rice", "store"),
        ing(30, "g", "small dried pasta", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, thinly sliced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(2, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Simmer the lentils in plenty of water for 8 minutes, add the rice and cook for 4 minutes, then add the pasta and cook for a further 8–10 minutes until all are tender. Drain.",
        "Meanwhile, fry the onion in the oil over medium heat for 8–10 minutes until deep golden and crisp.",
        "Warm the chopped tomatoes with the cumin in a small pan for 5 minutes.",
        "Season to taste, then serve the lentil, rice and pasta mix topped with the tomato sauce and crispy onions."
      ]
    },
    {
      id: "d113", title: "Egyptian-Style Spiced Beef Rice", tags: ["quick"], cuisine: "Egypt", protein: "beef",
      prep: 7, cook: 14,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(70, "g", "rice", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(150, "g", "chopped tomatoes", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince, until browned.",
        "Stir in the cumin and cinnamon for 30 seconds until fragrant, then add the chopped tomatoes and simmer for 5 minutes until thickened.",
        "Season to taste, then serve the spiced beef over the rice."
      ]
    },
    {
      id: "d114", title: "Tunisian-Style Harissa Chickpea Stew", tags: ["vegetarian", "vegan", "spicy", "quick"], cuisine: "Tunisia", protein: "plant-based",
      prep: 7, cook: 12,
      ingredients: [
        ing(1, "tin", "chickpeas, drained", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(1, "tbsp", "harissa paste", "store"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "slice", "crusty bread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the red pepper and garlic in a splash of oil over medium heat for 4 minutes.",
        "Stir in the harissa, then add the chickpeas and chopped tomatoes.",
        "Simmer for 8 minutes, stirring occasionally, until thickened.",
        "Season to taste, then serve with the crusty bread for scooping."
      ]
    },
    {
      id: "d115", title: "Tunisian-Style Spiced Lamb with Couscous", tags: ["spicy", "quick"], cuisine: "Tunisia", protein: "lamb",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(60, "g", "couscous", "store"),
        ing(1, "tsp", "harissa paste", "store"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "", "courgette, diced", "produce"), ing(null, "small handful", "fresh coriander, chopped", "produce"),
        ing(90, "ml", "vegetable stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Bring the stock to the boil in a small pan (or make it up with just-boiled water from the kettle). Pour it over the couscous, cover and leave for 5 minutes, then fluff with a fork.",
        "Fry the lamb mince and courgette in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince.",
        "Stir in the harissa and cumin, and cook for 1 minute more.",
        "Season to taste, then serve the spiced lamb over the couscous, scattered with coriander."
      ]
    }
,
    {
      id: "d116", title: "West African-Style Jollof Rice with Chicken", tags: ["spicy"], cuisine: "Nigeria", protein: "chicken",
      prep: 8, cook: 27,
      ingredients: [
        ing(150, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion and red pepper in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Add the chicken and cook for 5 minutes until browned.",
        "Stir in the paprika and chilli flakes for 30 seconds until fragrant, then add the chopped tomatoes, rice and 150ml water.",
        "Cover and simmer for 15–16 minutes, stirring once, until the rice is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Taste and adjust the seasoning before serving."
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
        "Simmer the sweet potato in 150ml water for 8 minutes until nearly tender, then add the chopped tomatoes and simmer for 2 minutes.",
        "Stir in the peanut butter and chilli flakes until smooth, then simmer for 3 minutes.",
        "Season to taste, then stir in the spinach until wilted and serve over the rice."
      ]
    },
    {
      id: "d118", title: "West African-Style Spiced Beef Skewers", tags: ["spicy", "quick"], cuisine: "Nigeria", protein: "beef",
      prep: 9, cook: 9,
      ingredients: [
        ing(160, "g", "beef rump steak, cubed", "meat"), ing(1, "tsp", "ground ginger", "spice"),
        ing(0.5, "tsp", "cayenne pepper", "spice"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "", "flatbread", "bakery"), ing(60, "g", "cabbage, shredded", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Toss the beef with the ginger, cayenne, paprika and a splash of oil.",
        "Griddle or fry over high heat for 3–4 minutes, turning, until charred and cooked to your liking.",
        "Rest for 2 minutes, then slice.",
        "Season to taste, then serve in the flatbread with the shredded cabbage."
      ]
    },
    {
      id: "d119", title: "Sri Lankan-Style Coconut Chicken Curry", tags: ["spicy", "quick"], cuisine: "Sri Lanka", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(1, "tsp", "curry powder", "spice"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken with the curry powder, turmeric and chilli flakes in a splash of oil over medium-high heat for 5 minutes.",
        "Pour in the coconut milk and simmer for 10 minutes until the chicken is cooked through with no pink inside and the sauce has thickened.",
        "Season to taste, then serve over the rice."
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
        "Rinse the lentils, then simmer with the turmeric, chilli flakes, garlic and 250ml water for 12 minutes until soft.",
        "Stir in the coconut milk and simmer for 3 minutes until thickened.",
        "Season and serve with the flatbread."
      ]
    },
    {
      id: "d121", title: "Sri Lankan-Style Spiced Fish", tags: ["fish", "spicy", "quick"], cuisine: "Sri Lanka", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(1, "tsp", "curry powder", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(0.5, "", "lime", "produce"),
        ing(70, "g", "rice", "store"), ing(60, "g", "green beans", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions, adding the green beans for the last 4 minutes.",
        "Rub the fish with curry powder and turmeric.",
        "Fry in a splash of oil over medium-high heat for 3–4 minutes each side until just cooked through and flaking easily.",
        "Season to taste, then serve over the rice and beans with a squeeze of lime."
      ]
    },
    {
      id: "d122", title: "Malaysian-Style Chicken Satay", tags: ["spicy", "quick"], cuisine: "Malaysia", protein: "chicken",
      prep: 9, cook: 15,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(1, "tsp", "curry powder", "spice"),
        ing(2, "tbsp", "peanut butter", "store"), ing(1, "tbsp", "soy sauce", "store"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the curry powder and a splash of oil, then fry over medium-high heat for 6–7 minutes until cooked through with no pink inside.",
        "Whisk the peanut butter, soy sauce, chilli flakes and a splash of hot water into a smooth sauce.",
        "Season to taste, then serve the chicken over the rice, drizzled with the satay sauce."
      ]
    },
    {
      id: "d123", title: "Malaysian-Style Nasi Goreng", tags: ["spicy", "quick"], cuisine: "Malaysia", protein: "chicken",
      prep: 7, cook: 8,
      ingredients: [
        ing(150, "g", "cooked rice, cold", "store"), ing(100, "g", "chicken breast, diced", "meat"),
        ing(1, "", "egg", "dairy"), ing(1, "tbsp", "soy sauce", "store"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(60, "g", "frozen peas", "frozen"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken in a splash of oil over high heat for 5 minutes until cooked through with no pink inside, then push to one side.",
        "Add the cold rice, peas, soy sauce and chilli flakes, and stir-fry for 3–4 minutes until hot through.",
        "Season to taste and pile onto a plate.",
        "Fry the egg in a little oil until the white is set and the edges crisp, keeping the yolk runny, then serve on top of the rice."
      ]
    },
    {
      id: "d124", title: "Malaysian-Style Coconut Laksa", tags: ["spicy", "quick"], cuisine: "Malaysia", protein: "chicken",
      prep: 8, cook: 10,
      ingredients: [
        ing(120, "g", "chicken breast, sliced", "meat"), ing(70, "g", "rice noodles", "store"),
        ing(150, "ml", "coconut milk", "store"), ing(1, "tbsp", "laksa or red curry paste", "store"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(60, "g", "beansprouts", "produce"),
        ing(1, "tsp", "fish sauce", "store"), ing(0.5, "", "lime", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Soak the rice noodles in boiling water for 5 minutes, then drain.",
        "Fry the chicken with the curry paste and chilli flakes in a splash of oil over medium-high heat for 5–6 minutes.",
        "Pour in the coconut milk and 100ml water, and simmer for 3 minutes.",
        "Season to taste, then stir in the noodles and beansprouts and warm through, then add the fish sauce and a squeeze of lime to serve."
      ]
    },
    {
      id: "d125", title: "Singapore-Style Chilli Chicken Noodles", tags: ["spicy", "quick"], cuisine: "Singapore", protein: "chicken",
      prep: 8, cook: 8,
      ingredients: [
        ing(120, "g", "chicken breast, sliced", "meat"), ing(70, "g", "egg noodles", "store"),
        ing(1, "tbsp", "tomato ketchup", "store"), ing(1, "tsp", "chilli sauce", "store"),
        ing(1, "tsp", "curry powder", "spice"), ing(60, "g", "beansprouts", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the noodles according to the packet instructions, then drain.",
        "Fry the chicken with the curry powder in a splash of oil over high heat for 5–6 minutes until cooked through with no pink inside.",
        "Stir in the ketchup and chilli sauce, then add the noodles and beansprouts and toss for 2 minutes.",
        "Season to taste, then serve hot."
      ]
    },
    {
      id: "d126", title: "Singapore-Style Turmeric Rice Bowl", tags: ["quick"], cuisine: "Singapore", protein: "chicken",
      prep: 7, cook: 20,
      ingredients: [
        ing(150, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(175, "ml", "chicken stock", "store"), ing(60, "g", "cucumber, sliced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken and garlic in a splash of oil over medium-high heat for 5 minutes.",
        "Stir in the turmeric and rice, then pour in the stock.",
        "Cover and simmer for 14–15 minutes until the rice is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Season to taste, then serve with the sliced cucumber."
      ]
    },
    {
      id: "d127", title: "Pakistani-Style Chicken Karahi", tags: ["spicy", "quick"], cuisine: "Pakistan", protein: "chicken",
      prep: 10, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(1, "", "green chilli, sliced", "produce"), ing(1, "tsp", "ground ginger", "spice"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(1, "", "flatbread", "bakery"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"), ing(0.5, "tsp", "garam masala", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken in a splash of oil over medium-high heat for 5 minutes until browned.",
        "Add the garlic, fresh ginger, ground ginger and cumin and fry for 1 minute, then add the chopped tomatoes and green chilli.",
        "Simmer for 10 minutes until the chicken is cooked through with no pink inside and the sauce has thickened, then stir in the garam masala.",
        "Season to taste, then serve with the flatbread."
      ]
    },
    {
      id: "d128", title: "Pakistani-Style Spiced Lentil Dhal", tags: ["vegetarian", "vegan", "spicy"], cuisine: "Pakistan", protein: "plant-based",
      prep: 6, cook: 15,
      ingredients: [
        ing(80, "g", "dried red lentils", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Rinse the lentils, then simmer with the turmeric and 300ml water for 12 minutes until soft.",
        "Meanwhile, fry the onion in a splash of oil for 10 minutes until soft and golden, adding the garlic for the last minute.",
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
        "Mix the beef mince with ¼ tsp salt, the cumin, chilli flakes and garlic, and shape into two long kebabs.",
        "Fry or griddle over medium-high heat for 8–9 minutes, turning, until cooked through.",
        "Warm the flatbread.",
        "Season to taste, then serve the kebabs in the flatbread with a dollop of yoghurt."
      ]
    }
,
    {
      id: "d130", title: "Swedish-Style Meatballs with Lingonberry", tags: ["quick"], cuisine: "Sweden", protein: "beef",
      prep: 10, cook: 15,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(1, "tbsp", "breadcrumbs", "store"),
        ing(1, "", "egg yolk", "dairy"), ing(100, "ml", "beef stock", "store"),
        ing(2, "tbsp", "soured cream", "dairy"), ing(1, "tbsp", "cranberry sauce", "store"),
        ing(200, "g", "potatoes, peeled and chopped, for mash", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the potatoes for 15 minutes until tender, then drain and mash with the butter.",
        "Meanwhile, mix the mince with ¼ tsp salt, the breadcrumbs and egg yolk, and shape into small meatballs.",
        "Fry in a splash of oil over medium heat for 8–9 minutes, turning, until browned and cooked through.",
        "Pour in the stock and simmer for 2 minutes, then take off the heat and stir in the soured cream until the sauce comes together.",
        "Season to taste, then serve the meatballs and sauce with the mash and the cranberry sauce on the side."
      ]
    },
    {
      id: "d131", title: "Swedish-Style Dill Salmon with New Potatoes", tags: ["fish", "quick"], cuisine: "Sweden", protein: "fish",
      prep: 7, cook: 15,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(120, "g", "new potatoes, halved", "produce"),
        ing(null, "handful", "fresh dill, chopped", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(0.5, "", "lemon", "produce")
      ],
      steps: [
        "Boil the halved new potatoes for 12–15 minutes until a knife slides in easily, then drain.",
        "Meanwhile, fry the salmon skin-side down in the butter over medium heat for 4 minutes, then flip and cook for 3–4 minutes more.",
        "Toss the potatoes with the dill and a squeeze of lemon.",
        "Season to taste, then serve the salmon with the potatoes."
      ]
    },
    {
      id: "d132", title: "Brazilian-Style Black Bean & Rice Bowl", tags: ["vegetarian", "vegan", "quick"], cuisine: "Brazil", protein: "plant-based",
      prep: 7, cook: 19,
      ingredients: [
        ing(1, "tin", "black beans, drained", "store"), ing(70, "g", "rice", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(0.5, "", "orange, segmented", "produce"), ing(null, "small handful", "fresh coriander, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion in a splash of oil over medium heat for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the black beans and a splash of water, and simmer for 6–7 minutes, mashing some of the beans for a thicker sauce.",
        "Season to taste, then serve over the rice with the orange segments and coriander."
      ]
    },
    {
      id: "d133", title: "Brazilian-Style Lime Chicken with Rice", tags: ["quick"], cuisine: "Brazil", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(1, "", "lime", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(null, "small handful", "fresh coriander, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the paprika, garlic and a squeeze of lime juice.",
        "Fry in a splash of oil over medium-high heat for 7–8 minutes until browned and cooked through.",
        "Season to taste, then serve over the rice with the remaining lime and coriander."
      ]
    },
    {
      id: "d134", title: "Brazilian-Style Beef & Pepper Skewers", tags: ["quick"], cuisine: "Brazil", protein: "beef",
      prep: 9, cook: 17,
      ingredients: [
        ing(160, "g", "beef rump steak, cubed", "meat"), ing(0.5, "", "red pepper, chunked", "produce"),
        ing(0.5, "", "onion, chunked", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the beef, pepper and onion with the garlic and a splash of oil.",
        "Thread onto skewers (or leave loose) and griddle over high heat for 5–6 minutes, turning, until charred outside and pink inside, then rest for 2 minutes.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d135", title: "Peruvian-Style Lomo Saltado", tags: ["quick"], cuisine: "Peru", protein: "beef",
      prep: 8, cook: 10,
      ingredients: [
        ing(160, "g", "beef rump steak, sliced", "meat"), ing(0.5, "", "red onion, sliced", "produce"),
        ing(1, "", "tomato, wedged", "produce"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "", "small potato, cut into chips, par-cooked", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Microwave or par-boil the potato chips for 4 minutes, then drain.",
        "Fry the beef over high heat for 2–3 minutes until browned, then remove.",
        "Fry the potato chips in the oil for 5 minutes until golden, then add the onion, tomato and paprika and toss for 1–2 minutes.",
        "Return the beef to the pan with the soy sauce, toss for 1 minute and serve."
      ]
    },
    {
      id: "d136", title: "Peruvian-Style Chicken with Green Sauce", tags: ["spicy", "quick"], cuisine: "Peru", protein: "chicken",
      prep: 9, cook: 15,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(null, "handful", "fresh coriander, finely chopped", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(2, "tbsp", "natural yoghurt", "dairy"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until cooked through with no pink inside.",
        "Blitz or finely chop the coriander with the garlic, yoghurt and chilli flakes into a sauce.",
        "Season to taste, then serve the chicken over the rice with the green sauce."
      ]
    },
    {
      id: "d137", title: "Argentinian-Style Chimichurri Steak", tags: ["quick"], cuisine: "Argentina", protein: "beef",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "beef sirloin steak", "meat"), ing(null, "handful", "fresh parsley, chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "red wine vinegar", "store"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(120, "g", "new potatoes", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Halve any larger new potatoes and boil for 12–15 minutes until a knife slides in easily, then drain.",
        "Mix the parsley, garlic, vinegar, chilli flakes and a splash of oil into a chimichurri sauce.",
        "Fry the steak over high heat for 2–3 minutes each side for medium (60°C in the middle, or 55°C for medium-rare), then rest for 3 minutes.",
        "Season to taste, then slice the steak and serve with the potatoes and chimichurri spooned over."
      ]
    },
    {
      id: "d138", title: "Argentinian-Style Empanada Bowl", tags: ["quick"], cuisine: "Argentina", protein: "beef",
      prep: 8, cook: 10,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(30, "g", "raisins", "store"), ing(1, "", "flatbread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince, until browned.",
        "Stir in the cumin, chilli flakes and raisins, and cook for 2 minutes more.",
        "Warm the flatbread.",
        "Season to taste, then serve the spiced beef spooned over the flatbread."
      ]
    },
    {
      id: "d139", title: "Australian-Style Barramundi with Salad", tags: ["fish", "quick"], cuisine: "Australia", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(60, "g", "mixed salad leaves", "produce"),
        ing(0.5, "", "avocado, sliced", "produce"), ing(0.5, "", "lemon", "produce"),
        ing(70, "g", "new potatoes", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Halve any larger new potatoes and boil for 12–15 minutes until a knife slides in easily, then drain.",
        "Fry the fish in a splash of oil over medium-high heat for 3–4 minutes each side until just cooked through and flaking easily.",
        "Toss the salad leaves and avocado with a squeeze of lemon.",
        "Season to taste, then serve the fish with the potatoes and salad."
      ]
    },
    {
      id: "d140", title: "Australian-Style Lamb Chops with Mint", tags: ["quick"], cuisine: "Australia", protein: "lamb",
      prep: 7, cook: 18,
      ingredients: [
        ing(2, "", "lamb chops", "meat"), ing(null, "handful", "fresh mint, chopped", "produce"),
        ing(1, "tbsp", "natural yoghurt", "dairy"), ing(120, "g", "new potatoes", "produce"),
        ing(60, "g", "green beans", "produce")
      ],
      steps: [
        "Boil the potatoes for 12–15 minutes, adding the green beans for the last 4 minutes, until a knife slides easily into the potatoes, then drain.",
        "Fry the lamb chops over medium-high heat for 3–4 minutes each side until browned and cooked to your liking (about 55°C in the middle for pink), then rest for 3 minutes.",
        "Stir the mint through the yoghurt.",
        "Season to taste, then serve the chops with the potatoes, beans and minted yoghurt."
      ]
    },
    {
      id: "d141", title: "Russian-Style Beetroot Soup", tags: ["vegetarian", "quick"], cuisine: "Russia", protein: "plant-based",
      prep: 7, cook: 16,
      ingredients: [
        ing(150, "g", "cooked beetroot, diced", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(300, "ml", "vegetable stock", "store"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(null, "small handful", "fresh dill, chopped", "produce"), ing(1, "slice", "crusty bread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Add the beetroot and stock, and simmer for 8 minutes.",
        "Blitz or mash roughly to your preferred texture.",
        "Season to taste, then serve with a dollop of soured cream, dill and the crusty bread."
      ]
    },
    {
      id: "d142", title: "Russian-Style Chicken & Mushroom Skillet", tags: ["quick"], cuisine: "Russia", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(1, "tsp", "Dijon mustard", "store"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken in a splash of oil over medium-high heat for 5–6 minutes until cooked through with no pink inside, then set aside. Fry the onion and mushrooms in the same pan for 4 minutes until golden.",
        "Return the chicken with the soured cream, mustard and a splash of water, and warm through for 1 minute.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d143", title: "Austrian-Style Chicken Schnitzel", tags: ["quick"], cuisine: "Austria", protein: "chicken",
      prep: 9, cook: 9,
      ingredients: [
        ing(150, "g", "chicken breast, flattened", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(3, "tbsp", "breadcrumbs", "store"),
        ing(0.5, "", "lemon", "produce"), ing(60, "g", "mixed salad leaves", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Coat the chicken in flour, then the beaten egg, then the breadcrumbs.",
        "Fry in a generous splash of oil over medium heat for 3–4 minutes each side until golden and cooked through.",
        "Rest for 1 minute on kitchen paper.",
        "Season to taste, then serve with a squeeze of lemon and the salad leaves."
      ]
    },
    {
      id: "d144", title: "Austrian-Style Sausage & Potato Salad", tags: ["quick"], cuisine: "Austria", protein: "pork",
      prep: 7, cook: 12,
      ingredients: [
        ing(2, "", "frankfurter or pork sausages", "meat"), ing(150, "g", "new potatoes, sliced", "produce"),
        ing(1, "tsp", "Dijon mustard", "store"), ing(1, "tbsp", "red wine vinegar", "store"),
        ing(0.5, "", "onion, thinly sliced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the potatoes for 12 minutes until tender, then drain and slice while warm.",
        "Meanwhile, warm the sausages in simmering water or fry for 6–7 minutes until hot through.",
        "Whisk the mustard and vinegar with a splash of oil, and toss through the warm potatoes and onion.",
        "Season to taste, then slice the sausages and serve over the potato salad."
      ]
    },
    {
      id: "d145", title: "Dutch-Style Kale & Sausage Mash", tags: ["quick"], cuisine: "Netherlands", protein: "pork",
      prep: 8, cook: 17,
      ingredients: [
        ing(2, "", "pork sausages, sliced", "meat"), ing(200, "g", "potato, chunked", "produce"),
        ing(60, "g", "kale, shredded", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(1, "tbsp", "milk", "dairy")
      ],
      steps: [
        "Boil the potato for 15 minutes until tender, adding the kale for the final 3 minutes.",
        "Meanwhile, fry the sausage slices over medium-high heat for 6–7 minutes until browned.",
        "Drain and mash the potato and kale with the butter and milk.",
        "Season to taste, then serve the mash topped with the sausage."
      ]
    },
    {
      id: "d146", title: "Dutch-Style Pea Soup with Sausage", tags: ["quick"], cuisine: "Netherlands", protein: "pork",
      prep: 7, cook: 17,
      ingredients: [
        ing(1, "", "smoked sausage, sliced", "meat"), ing(150, "g", "frozen peas", "frozen"),
        ing(0.5, "", "onion, diced", "produce"), ing(250, "ml", "vegetable stock", "store"),
        ing(1, "slice", "crusty bread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Add the stock and peas, and simmer for 6 minutes.",
        "Blitz or mash roughly, then stir in the sausage slices and warm through for 2 minutes.",
        "Season to taste, then serve with the crusty bread."
      ]
    },
    {
      id: "d147", title: "South African-Style Bobotie-Inspired Mince Bake", tags: ["quick"], cuisine: "South Africa", protein: "beef",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "tsp", "mild curry powder", "spice"), ing(20, "g", "raisins", "store"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(70, "g", "rice", "store"), ing(0.25, "tsp", "ground turmeric", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Preheat the oven to 190°C (fan 170°C).",
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince, until browned with no pink left.",
        "Stir in the curry powder and raisins, then spoon into a small ovenproof dish.",
        "Whisk the egg with the milk and pour over the top.",
        "Bake for 12–14 minutes until the egg topping is set and golden.",
        "Meanwhile, cook the rice according to the packet instructions with the turmeric stirred into the water.",
        "Taste and adjust the seasoning, then serve the bake with the yellow rice."
      ]
    },
    {
      id: "d148", title: "South African-Style Peri-Peri Chicken", tags: ["spicy", "quick"], cuisine: "South Africa", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(1, "tsp", "smoked paprika", "spice"),
        ing(0.5, "tsp", "chilli flakes", "spice"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(0.5, "", "lemon", "produce"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the paprika, chilli flakes, garlic and a squeeze of lemon.",
        "Fry in a splash of oil over medium-high heat for 8–9 minutes until browned and cooked through.",
        "Season to taste, then serve over the rice with the remaining lemon."
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
        "Use fish sold for eating raw, or fish that has been frozen first (check the label).",
        "Toss the salmon cubes with the soy sauce and sesame oil.",
        "Spoon the cold rice into a bowl.",
        "Top with the marinated salmon, avocado and cucumber.",
        "Serve straight away."
      ]
    },
    {
      id: "d150", title: "Hawaiian-Style Teriyaki Chicken Rice Bowl", tags: ["quick"], cuisine: "Hawaii", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(2, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "honey", "store"), ing(70, "g", "rice", "store"),
        ing(60, "g", "pineapple chunks", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until browned.",
        "Stir in the soy sauce and honey, and cook for 2 minutes until glazed and sticky.",
        "Season to taste, then serve over the rice with the pineapple chunks."
      ]
    }
,
    {
      id: "d151", title: "Mapo Tofu-Inspired Spiced Pork & Tofu", tags: ["spicy", "quick"], cuisine: "China", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(100, "g", "pork mince", "meat"), ing(200, "g", "firm tofu, cubed", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "chilli bean sauce or chilli flakes", "store"),
        ing(1, "", "spring onion, sliced", "produce"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the pork mince in a splash of oil over high heat for 4 minutes, breaking it up, until browned.",
        "Stir in the chilli bean sauce and soy sauce, then add the tofu and a splash of water and simmer for 4 minutes.",
        "Season to taste, then scatter with spring onion and serve over the rice."
      ]
    },
    {
      id: "d152", title: "Chinese-Style Steamed Fish with Ginger", tags: ["fish", "quick"], cuisine: "China", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "spring onion, shredded", "produce"),
        ing(0.5, "tsp", "sesame oil", "store"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Place the fish on a plate with the ginger, and steam over a pan of simmering water, covered, for 8–9 minutes until just cooked through.",
        "Scatter with spring onion, drizzle with soy sauce and sesame oil.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d153", title: "Moroccan-Style Chicken Tagine with Apricots", tags: ["quick"], cuisine: "Morocco", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(30, "g", "dried apricots, chopped", "store"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(150, "g", "chopped tomatoes", "store"), ing(60, "g", "couscous", "store"),
        ing(90, "ml", "vegetable stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Bring the stock to the boil in a small pan (or make it up with just-boiled water from the kettle). Pour it over the couscous, cover and leave for 5 minutes, then fluff with a fork.",
        "Fry the chicken with the cinnamon and cumin in a splash of oil over medium-high heat for 5 minutes.",
        "Add the apricots and chopped tomatoes, and simmer for 8–9 minutes until the chicken is cooked through with no pink inside.",
        "Season to taste, then serve over the couscous."
      ]
    },
    {
      id: "d154", title: "Moroccan-Style Beef Kefta with Couscous", tags: ["spicy", "quick"], cuisine: "Morocco", protein: "beef",
      prep: 9, cook: 9,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(60, "g", "couscous", "store"), ing(null, "small handful", "fresh coriander, chopped", "produce"),
        ing(90, "ml", "vegetable stock", "store")
      ],
      steps: [
        "Bring the stock to the boil in a small pan (or make it up with just-boiled water from the kettle). Pour it over the couscous, cover and leave for 5 minutes, then fluff with a fork.",
        "Mix the mince with ¼ tsp salt, the cumin, paprika and chilli flakes, and shape into small oval koftas.",
        "Fry over medium-high heat for 7–8 minutes, turning, until browned and cooked through.",
        "Season to taste, then serve over the couscous, scattered with coriander."
      ]
    },
    {
      id: "d155", title: "Thai Red Curry with Chicken", tags: ["spicy", "quick"], cuisine: "Thailand", protein: "chicken",
      prep: 7, cook: 15,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(1.5, "tbsp", "red curry paste", "store"), ing(60, "g", "green beans", "produce"),
        ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the curry paste in a splash of oil over medium heat for 1 minute until fragrant.",
        "Add the chicken and cook for 3–4 minutes, then pour in the coconut milk and add the green beans.",
        "Simmer for 6–7 minutes until the chicken is cooked through with no pink inside, then serve over the rice.",
        "Taste and adjust the seasoning before serving."
      ]
    },
    {
      id: "d156", title: "Thai-Style Pineapple Fried Rice", tags: ["quick"], cuisine: "Thailand", protein: "chicken",
      prep: 7, cook: 8,
      ingredients: [
        ing(100, "g", "chicken breast, diced", "meat"), ing(150, "g", "cooked rice, cold", "store"),
        ing(60, "g", "pineapple chunks", "produce"), ing(1, "tbsp", "soy sauce", "store"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(60, "g", "frozen peas", "frozen"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken in a splash of oil over high heat for 5 minutes until cooked through with no pink inside.",
        "Add the cold rice and peas, and stir-fry for 3–4 minutes until hot through.",
        "Stir in the pineapple, soy sauce and chilli flakes, and toss for 1 minute.",
        "Season to taste, then serve hot."
      ]
    },
    {
      id: "d157", title: "Indian-Style Egg Curry", tags: ["vegetarian", "spicy", "quick"], cuisine: "India", protein: "plant-based",
      prep: 7, cook: 19,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "tsp", "mild curry powder", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Boil the eggs for 8 minutes, then cool, peel and halve.",
        "Fry the onion in a splash of oil over medium heat for 8 minutes until soft and translucent, then stir in the curry powder and turmeric.",
        "Season to taste, then add the chopped tomatoes and simmer for 6 minutes, then nestle in the eggs and warm through before serving over the rice."
      ]
    },
    {
      id: "d158", title: "Indian-Style Spiced Potato Bowl", tags: ["vegetarian", "vegan", "spicy", "quick"], cuisine: "India", protein: "plant-based",
      prep: 7, cook: 13,
      ingredients: [
        ing(250, "g", "potato, diced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "", "flatbread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the potato for 8 minutes until nearly tender, then drain.",
        "Fry the garlic with the cumin, turmeric and chilli flakes in a splash of oil for 1 minute.",
        "Add the potato and fry for 5 minutes, turning occasionally, until golden and coated in spice.",
        "Season to taste, then serve with the flatbread."
      ]
    },
    {
      id: "d159", title: "American-Style BBQ Pulled Chicken", tags: ["quick"], cuisine: "USA", protein: "chicken",
      prep: 7, cook: 12,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(2, "tbsp", "barbecue sauce", "store"),
        ing(1, "", "burger bun", "bakery"), ing(60, "g", "coleslaw mix", "produce"),
        ing(1, "tbsp", "mayonnaise", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until cooked through with no pink inside.",
        "Shred with two forks, then stir through the barbecue sauce and warm for 2 minutes.",
        "Toss the coleslaw mix with the mayonnaise.",
        "Season to taste, then pile the pulled chicken into the bun with the coleslaw."
      ]
    },
    {
      id: "d160", title: "American Diner-Style Turkey Burger", tags: [], cuisine: "USA", protein: "turkey",
      prep: 8, cook: 25,
      ingredients: [
        ing(150, "g", "turkey mince", "meat"), ing(1, "", "burger bun", "bakery"),
        ing(0.5, "", "sweet potato, cut into wedges", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "tbsp", "tomato ketchup", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the sweet potato wedges with the paprika and a splash of oil, and roast for 20–25 minutes, turning once, until tender and golden.",
        "Shape the turkey mince into a patty and fry over medium-high heat for 4–5 minutes each side until cooked through with no pink inside.",
        "Toast the bun.",
        "Season to taste, then build the burger with the patty and ketchup, and serve with the wedges."
      ]
    },
    {
      id: "d161", title: "Spanish-Style Garlic Mushrooms Tapas Bowl", tags: ["vegetarian", "vegan", "quick"], cuisine: "Spain", protein: "plant-based",
      prep: 7, cook: 8,
      ingredients: [
        ing(200, "g", "chestnut mushrooms, halved", "produce"), ing(2, "", "garlic cloves, sliced", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(null, "small handful", "fresh parsley, chopped", "produce"),
        ing(1, "slice", "crusty bread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the mushrooms in a generous splash of oil over medium-high heat for 5–6 minutes until golden and tender.",
        "Add the garlic and paprika and fry for 1 minute until fragrant.",
        "Scatter with parsley.",
        "Season to taste, then serve with the crusty bread for mopping up the juices."
      ]
    },
    {
      id: "d162", title: "Spanish-Style Baked Cod with Romesco", tags: ["fish", "quick"], cuisine: "Spain", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "cod fillet", "meat"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(1, "tbsp", "flaked almonds", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(70, "g", "new potatoes", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Halve any larger new potatoes and boil for 12–15 minutes until a knife slides in easily, then drain.",
        "Simmer the red pepper, tomatoes, almonds and garlic for 8 minutes, then blitz or mash into a rough romesco sauce.",
        "Meanwhile, bake the cod for 12 minutes until just cooked through.",
        "Season to taste, then serve the cod with the romesco sauce and potatoes."
      ]
    },
    {
      id: "d163", title: "British-Style Breaded Fish Finger Sandwich", tags: ["fish", "quick"], cuisine: "UK", protein: "fish",
      prep: 8, cook: 8,
      ingredients: [
        ing(150, "g", "white fish fillet, cut into strips", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(3, "tbsp", "breadcrumbs", "store"),
        ing(2, "slices", "white bread", "bakery"), ing(1, "tbsp", "tartare sauce or mayonnaise", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Coat the fish strips in flour, then egg, then breadcrumbs.",
        "Fry in a splash of oil over medium heat for 3–4 minutes each side until golden and cooked through.",
        "Spread the bread with tartare sauce.",
        "Season to taste, then build the sandwich with the fish fingers."
      ]
    },
    {
      id: "d164", title: "British-Style Leek & Potato Soup", tags: ["vegetarian", "quick"], cuisine: "UK", protein: "plant-based",
      prep: 7, cook: 23,
      ingredients: [
        ing(1, "", "leek, sliced", "produce"), ing(200, "g", "potato, chunked", "produce"),
        ing(300, "ml", "vegetable stock", "store"), ing(1, "tbsp", "butter", "dairy"),
        ing(1, "tbsp", "double cream", "dairy"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Melt the butter in a saucepan and fry the leek over medium heat for 8 minutes until soft and translucent.",
        "Add the potato and stock, and simmer for 15 minutes until the potato is tender.",
        "Blitz or mash until smooth, then stir through the cream.",
        "Season to taste, then serve with the crusty bread."
      ]
    },
    {
      id: "d165", title: "Japanese-Style Chicken Teriyaki Rice Bowl", tags: ["quick"], cuisine: "Japan", protein: "chicken",
      prep: 7, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, sliced", "meat"), ing(2, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "honey", "store"), ing(70, "g", "rice", "store"),
        ing(60, "g", "pak choi or greens", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions, steaming the pak choi over the top for the last 3 minutes.",
        "Fry the chicken in a splash of oil over medium-high heat for 6–7 minutes until browned and cooked through with no pink inside.",
        "Stir in the soy sauce and honey, and cook for 2 minutes until glazed.",
        "Season to taste, then serve over the rice with the pak choi."
      ]
    },
    {
      id: "d166", title: "Japanese-Style Ginger Pork (Shogayaki)", tags: ["quick"], cuisine: "Japan", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "pork loin steak, sliced thin", "meat"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "honey", "store"),
        ing(70, "g", "rice", "store"), ing(60, "g", "cabbage, shredded", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the soy sauce, ginger and honey together.",
        "Fry the pork over medium-high heat for 1–2 minutes each side, then pour in the sauce and cook for 1 minute until glazed.",
        "Season to taste, then serve over the rice with the shredded cabbage."
      ]
    },
    {
      id: "d167", title: "Italian-Style Chicken Cacciatore", tags: ["quick"], cuisine: "Italy", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(60, "g", "pasta", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the pasta according to the packet instructions.",
        "Fry the chicken and onion in a splash of oil over medium-high heat for 5 minutes.",
        "Add the mushrooms and cook for 3 minutes, then stir in the tomatoes and oregano.",
        "Simmer for 8 minutes until the chicken is cooked through with no pink inside, then serve over the pasta.",
        "Taste and adjust the seasoning before serving."
      ]
    },
    {
      id: "d168", title: "Italian Caprese-Style Chicken Traybake", tags: [], cuisine: "Italy", protein: "chicken",
      prep: 7, cook: 28,
      ingredients: [
        ing(160, "g", "chicken breast", "meat"), ing(100, "g", "cherry tomatoes", "produce"),
        ing(60, "g", "mozzarella, torn", "dairy"), ing(null, "handful", "fresh basil leaves", "produce"),
        ing(1, "tbsp", "balsamic vinegar", "store"), ing(120, "g", "new potatoes, halved", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the potatoes and cherry tomatoes with a splash of oil on a baking tray, and roast for 10 minutes.",
        "Add the chicken to the tray and roast for a further 15–18 minutes until cooked through (75°C in the thickest part).",
        "Top the chicken with the mozzarella for the final 3 minutes to melt.",
        "Season to taste, then scatter with basil and drizzle with balsamic vinegar to serve."
      ]
    },
    {
      id: "d169", title: "Portuguese-Style Chouriço & Bean Stew", tags: ["spicy", "quick"], cuisine: "Portugal", protein: "pork",
      prep: 8, cook: 16,
      ingredients: [
        ing(1, "", "chorizo sausage, sliced", "meat"), ing(1, "tin", "butter beans, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(1, "slice", "crusty bread", "bakery")
      ],
      steps: [
        "Fry the chorizo and onion in a splash of oil over medium heat for 8 minutes until the onion is soft and the chorizo has released its oil.",
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
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d171", title: "French-Style Summer Vegetable Stew", tags: ["vegetarian", "vegan", "quick"], cuisine: "France", protein: "plant-based",
      prep: 10, cook: 16,
      ingredients: [
        ing(0.5, "", "courgette, diced", "produce"), ing(0.5, "", "red pepper, diced", "produce"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "dried herbes de Provence or mixed herbs", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion, courgette and red pepper in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Add the garlic and herbs, and cook for 1 minute.",
        "Stir in the chopped tomatoes and simmer for 8 minutes until the vegetables are tender.",
        "Season and serve, with crusty bread if you like."
      ]
    },
    {
      id: "d172", title: "French Onion Soup with Cheese Toast", tags: ["vegetarian"], cuisine: "France", protein: "plant-based",
      prep: 7, cook: 25,
      ingredients: [
        ing(1.5, "", "onions, thinly sliced", "produce"), ing(300, "ml", "beef or vegetable stock", "store"),
        ing(1, "tbsp", "butter", "dairy"), ing(1, "slice", "crusty bread", "bakery"),
        ing(30, "g", "cheddar cheese, grated", "dairy")
      ],
      steps: [
        "Melt the butter in a saucepan and fry the onions with a pinch of salt over medium-low heat for 18–20 minutes, stirring often, until deep golden.",
        "Pour in the stock and simmer for 5 minutes.",
        "Toast the bread and top with the cheese, then grill for 2 minutes until melted and bubbling.",
        "Season to taste, then ladle the soup into a bowl and float the cheese toast on top."
      ]
    },
    {
      id: "d173", title: "Greek-Style Chicken Souvlaki Bowl", tags: ["quick"], cuisine: "Greece", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken breast, cubed", "meat"), ing(1, "tsp", "dried oregano", "spice"),
        ing(0.5, "", "lemon", "produce"), ing(70, "g", "rice", "store"),
        ing(60, "g", "cucumber, diced", "produce"), ing(2, "tbsp", "shop-bought tzatziki", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the oregano, a squeeze of lemon and a splash of oil.",
        "Fry over medium-high heat for 7–8 minutes until browned and cooked through.",
        "Season to taste, then serve over the rice with the cucumber and a dollop of tzatziki."
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
        "Preheat the oven to 200°C (fan 180°C).",
        "Wilt the spinach in a dry pan for 2 minutes, then squeeze out excess water and chop.",
        "Mix the spinach with the feta and egg.",
        "Layer the filo sheets, brushing with oil between each, spoon the filling in and fold into a parcel.",
        "Bake for 12–14 minutes until golden and crisp."
      ]
    },
    {
      id: "d175", title: "Mexican-Style Chicken Tinga Tacos", tags: ["spicy", "quick"], cuisine: "Mexico", protein: "chicken",
      prep: 8, cook: 16,
      ingredients: [
        ing(160, "g", "chicken breast, shredded after cooking", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "tsp", "chipotle paste", "store"),
        ing(2, "", "soft tortillas", "bakery"), ing(null, "small handful", "fresh coriander, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Slice the chicken breast in half horizontally, then poach or fry until cooked through with no pink inside, about 8 minutes. Shred with two forks.",
        "Fry the onion in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Stir in the chipotle paste and chopped tomatoes, add the shredded chicken and simmer for 5 minutes.",
        "Season to taste, then serve in the tortillas, scattered with coriander."
      ]
    },
    {
      id: "d176", title: "Mexican-Style Turkey & Black Bean Chilli", tags: ["spicy", "quick"], cuisine: "Mexico", protein: "turkey",
      prep: 8, cook: 14,
      ingredients: [
        ing(150, "g", "turkey mince", "meat"), ing(1, "tin", "black beans, drained", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the turkey mince in a splash of oil over medium-high heat for 5 minutes, breaking it up, until browned with no pink left.",
        "Stir in the paprika and chilli flakes for 30 seconds until fragrant, then add the black beans and chopped tomatoes and simmer for 8 minutes until thickened.",
        "Taste and adjust the seasoning, then serve over the rice."
      ]
    },
    {
      id: "d177", title: "Cypriot-Style Pork Souvlaki with Pitta", tags: ["quick"], cuisine: "Cyprus", protein: "pork",
      prep: 8, cook: 9,
      ingredients: [
        ing(160, "g", "pork loin, cubed", "meat"), ing(1, "tsp", "dried oregano", "spice"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "pitta bread", "bakery"),
        ing(2, "tbsp", "shop-bought tzatziki", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Toss the pork with the oregano, a squeeze of lemon and a splash of oil.",
        "Fry or griddle over medium-high heat for 8–9 minutes, turning, until cooked through.",
        "Warm the pitta.",
        "Season to taste, then serve the pork in the pitta with the tzatziki."
      ]
    },
    {
      id: "d178", title: "Cypriot-Style Lemon Chicken with Bulgur", tags: ["quick"], cuisine: "Cyprus", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(60, "g", "bulgur wheat", "store"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "dried oregano", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the bulgur wheat according to the packet instructions.",
        "Fry the chicken and garlic in a splash of oil over medium-high heat for 8 minutes until browned and cooked through with no pink inside.",
        "Stir in the oregano and a squeeze of lemon.",
        "Season to taste, then serve the chicken over the bulgur."
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
        "Mix the mince with ¼ tsp salt, the cumin and cinnamon, and shape into small koftas.",
        "Fry over medium-high heat for 7–8 minutes, turning, until browned and cooked through.",
        "Season to taste, then serve over the bulgur, scattered with parsley."
      ]
    },
    {
      id: "d180", title: "Lebanese-Style Lentil & Rice (Mujadara)", tags: ["vegetarian", "vegan", "quick"], cuisine: "Lebanon", protein: "plant-based",
      prep: 7, cook: 22,
      ingredients: [
        ing(60, "g", "dried brown lentils", "store"), ing(50, "g", "rice", "store"),
        ing(1, "", "onion, thinly sliced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(60, "g", "mixed salad leaves", "produce"),
        ing(2, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Simmer the lentils in plenty of water for 10 minutes, then add the rice and cook for a further 12 minutes until both are tender. Drain.",
        "Meanwhile, fry the onion in the oil over medium heat for 10 minutes until deep golden and crisp.",
        "Stir the cumin through the lentils and rice.",
        "Season to taste, then serve topped with the crispy onions and salad leaves."
      ]
    },
    {
      id: "d181", title: "Korean-Style Spicy Pork Bulgogi", tags: ["spicy", "quick"], cuisine: "Korea", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "pork loin steak, sliced thin", "meat"), ing(1, "tbsp", "gochujang paste", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(70, "g", "rice", "store"), ing(60, "g", "beansprouts", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the gochujang, soy sauce and honey together.",
        "Fry the pork over high heat for 4–5 minutes, then stir in the sauce and cook for 1 minute until glazed.",
        "Season to taste, then serve over the rice with the beansprouts."
      ]
    },
    {
      id: "d182", title: "Korean-Style Tofu & Kimchi Stew", tags: ["vegetarian", "spicy", "quick"], cuisine: "Korea", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(200, "g", "firm tofu, cubed", "store"), ing(100, "g", "kimchi, chopped", "store"),
        ing(1, "tsp", "gochujang paste", "store"), ing(200, "ml", "vegetable stock", "store"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Simmer the kimchi and gochujang paste with the stock for 5 minutes.",
        "Add the tofu and simmer for 5 minutes more until hot through.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d183", title: "Persian-Style Herb & Bean Rice", tags: ["vegetarian", "vegan", "quick"], cuisine: "Iran", protein: "plant-based",
      prep: 8, cook: 14,
      ingredients: [
        ing(70, "g", "rice", "store"), ing(1, "tin", "cannellini beans, drained", "store"),
        ing(null, "handful", "fresh parsley, chopped", "produce"), ing(null, "handful", "fresh coriander, chopped", "produce"),
        ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice with the turmeric according to the packet instructions.",
        "Warm the beans in a splash of oil for 3–4 minutes.",
        "Stir the herbs through the rice.",
        "Season to taste, then serve the herbed rice topped with the warmed beans."
      ]
    },
    {
      id: "d184", title: "Persian-Style Lamb & Split Pea Stew", tags: ["quick"], cuisine: "Iran", protein: "lamb",
      prep: 8, cook: 22,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(40, "g", "dried red lentils", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the lamb mince in a splash of oil over medium-high heat for 5 minutes, breaking it up, until browned with no pink left.",
        "Stir in the turmeric, cinnamon, rinsed lentils and chopped tomatoes, plus 200ml water.",
        "Taste and adjust the seasoning.",
        "Simmer for 15 minutes, stirring often, until the lentils are soft, then serve over the rice."
      ]
    },
    {
      id: "d185", title: "Jamaican-Style Jerk Pork Chops", tags: ["spicy", "quick"], cuisine: "Jamaica", protein: "pork",
      prep: 8, cook: 18,
      ingredients: [
        ing(1, "", "pork chop", "meat"), ing(1, "tsp", "jerk seasoning", "spice"),
        ing(0.5, "", "lime", "produce"), ing(70, "g", "rice", "store"),
        ing(80, "g", "tinned kidney beans, drained", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions, stirring in the kidney beans for the last 5 minutes to heat through.",
        "Rub the pork chop with the jerk seasoning and a squeeze of lime.",
        "Fry or griddle over medium-high heat for 5–6 minutes each side until cooked through (65–70°C in the middle), then rest for 3 minutes.",
        "Serve with the rice and beans and the rest of the lime."
      ]
    },
    {
      id: "d186", title: "Jamaican-Style Callaloo-Inspired Greens", tags: ["vegetarian", "vegan", "quick"], cuisine: "Jamaica", protein: "plant-based",
      prep: 7, cook: 18,
      ingredients: [
        ing(150, "g", "kale or spinach, shredded", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and red pepper in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Add the greens and chilli flakes, and cook for 4–5 minutes until wilted.",
        "Season to taste, then serve over the rice."
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
        "Simmer for 15 minutes until the chicken is cooked through with no pink inside and the sauce has reduced.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d188", title: "Filipino-Style Garlic Fried Rice with Sausage", tags: ["quick"], cuisine: "Philippines", protein: "pork",
      prep: 7, cook: 9,
      ingredients: [
        ing(2, "", "pork sausages, sliced", "meat"), ing(150, "g", "cooked rice, cold", "store"),
        ing(2, "", "garlic cloves, finely chopped", "produce"), ing(1, "", "egg", "dairy"),
        ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the sausage slices in a splash of oil over medium-high heat for 5–6 minutes until browned.",
        "Add the garlic and fry for 1 minute, then add the cold rice and soy sauce, stir-frying for 3–4 minutes.",
        "Season to taste and pile onto a plate.",
        "Fry the egg in a little oil until the white is set and the edges crisp, keeping the yolk runny, then serve on top of the rice."
      ]
    },
    {
      id: "d189", title: "Vietnamese-Style Beef Noodle Soup", tags: ["quick"], cuisine: "Vietnam", protein: "beef",
      prep: 8, cook: 12,
      ingredients: [
        ing(150, "g", "beef sirloin, thinly sliced", "meat"), ing(70, "g", "rice noodles", "store"),
        ing(300, "ml", "beef stock", "store"), ing(1, "", "star anise", "spice"),
        ing(1, "", "spring onion, sliced", "produce"), ing(null, "small handful", "fresh coriander, chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "fish sauce", "store"), ing(0.5, "", "lime", "produce")
      ],
      steps: [
        "Soak the rice noodles in boiling water for 5 minutes, then drain.",
        "Simmer the stock with the star anise and ginger for 5 minutes, then remove the star anise and stir in the fish sauce.",
        "Add the beef slices to the hot stock and poach for 1–2 minutes until just cooked.",
        "Season to taste, then serve the noodles in the broth with the beef, spring onion, coriander and a squeeze of lime."
      ]
    },
    {
      id: "d190", title: "Vietnamese-Style Lemongrass Chicken", tags: ["quick"], cuisine: "Vietnam", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, sliced", "meat"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(70, "g", "rice", "store"), ing(60, "g", "cucumber, sliced", "produce"),
        ing(1, "tsp", "lemongrass paste", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the lemongrass paste, ginger, soy sauce and honey.",
        "Fry over medium-high heat for 7–8 minutes until browned and cooked through.",
        "Season to taste, then serve over the rice with the cucumber."
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
        "Fry the chicken in a splash of oil over medium-high heat for 7–8 minutes until browned and cooked through with no pink inside.",
        "Warm the chopped tomatoes in a separate small pan for 4 minutes.",
        "Tear the flatbread onto a plate, top with the chicken and tomato sauce.",
        "Taste and adjust the seasoning.",
        "Melt the butter and drizzle over, with a dollop of yoghurt on the side."
      ]
    },
    {
      id: "d192", title: "Turkish-Style Red Lentil Soup", tags: ["vegetarian", "quick"], cuisine: "Turkey", protein: "plant-based",
      prep: 6, cook: 19,
      ingredients: [
        ing(80, "g", "dried red lentils", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.5, "", "lemon", "produce"), ing(1, "slice", "crusty bread", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Stir in the cumin and paprika for 30 seconds until fragrant, then add the rinsed lentils and 400ml water.",
        "Simmer for 12 minutes until the lentils are soft, then blitz or mash until smooth.",
        "Season to taste, then serve with a squeeze of lemon and the crusty bread."
      ]
    },
    {
      id: "d193", title: "Cuban-Style Mojo Chicken with Rice", tags: ["quick"], cuisine: "Cuba", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(0.5, "", "lime", "produce"),
        ing(0.5, "", "orange, juiced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the lime juice, orange juice, garlic and cumin.",
        "Fry over medium-high heat for 8–9 minutes until browned and cooked through.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d194", title: "Cuban-Style Picadillo Beef Hash", tags: ["quick"], cuisine: "Cuba", protein: "beef",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(20, "g", "raisins", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6–7 minutes, breaking up the mince, until browned with no pink left.",
        "Stir in the cumin for 30 seconds until fragrant, then add the raisins and chopped tomatoes and simmer for 5 minutes until thickened.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d195", title: "German-Style Bratwurst with Braised Red Cabbage", tags: ["quick"], cuisine: "Germany", protein: "pork",
      prep: 7, cook: 19,
      ingredients: [
        ing(2, "", "bratwurst sausages", "meat"), ing(200, "g", "red cabbage, shredded", "produce"),
        ing(0.5, "", "apple, sliced", "produce"), ing(1, "tbsp", "red wine vinegar", "store"),
        ing(1, "tsp", "Dijon mustard", "store"),
        ing(1, "tsp", "sugar", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the cabbage and apple in a splash of oil over medium heat for 2 minutes, then add the sugar and 3 tbsp water, cover and cook for 12–15 minutes, stirring occasionally, until softened.",
        "Stir in the vinegar and cook for 2 minutes more.",
        "Meanwhile, fry or grill the sausages for 10–12 minutes, turning, until cooked through.",
        "Season to taste, then serve the sausages with the braised cabbage and mustard."
      ]
    },
    {
      id: "d196", title: "German-Style Pork Schnitzel with Potato Salad", tags: ["quick"], cuisine: "Germany", protein: "pork",
      prep: 9, cook: 10,
      ingredients: [
        ing(150, "g", "pork loin steak, flattened", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg, beaten", "dairy"), ing(3, "tbsp", "breadcrumbs", "store"),
        ing(150, "g", "new potatoes, sliced", "produce"), ing(1, "tsp", "Dijon mustard", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the potatoes for 12 minutes until tender, then drain and slice while warm.",
        "Coat the pork in flour, then egg, then breadcrumbs.",
        "Fry in a generous splash of oil over medium heat for 3–4 minutes each side until golden and cooked through.",
        "Season to taste, then toss the warm potatoes with the mustard and a splash of oil, and serve alongside."
      ]
    },
    {
      id: "d197", title: "Irish-Style Beef & Stout Stew", tags: [], cuisine: "Ireland", protein: "beef",
      prep: 8, cook: 20,
      ingredients: [
        ing(160, "g", "beef rump steak, cut into strips", "meat"), ing(100, "ml", "stout or dark ale", "store"),
        ing(1, "", "small potato, cut into 2cm cubes", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(100, "ml", "beef stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the potato cubes in salted water for 10–12 minutes until a knife slides in easily, then drain.",
        "Meanwhile, fry the onion in a splash of oil over a medium heat for 10 minutes until soft and golden. Tip onto a plate.",
        "Turn the heat to high and sear the beef for 1–2 minutes until browned but still pink inside. Add to the onion.",
        "Pour the stout and stock into the pan and bubble for 4–5 minutes until reduced by about a third.",
        "Return the beef, onion and potato, heat through for 1 minute, season and serve, with bread if you like."
      ]
    },
    {
      id: "d198", title: "Irish-Style Smoked Fish Chowder", tags: ["fish", "quick"], cuisine: "Ireland", protein: "fish",
      prep: 8, cook: 18,
      ingredients: [
        ing(150, "g", "smoked haddock fillet", "meat"), ing(1, "", "leek, sliced", "produce"),
        ing(150, "g", "potato, diced", "produce"), ing(150, "ml", "milk", "dairy"),
        ing(1, "tbsp", "butter", "dairy")
      ],
      steps: [
        "Melt the butter and fry the leek over medium heat for 8 minutes until soft and translucent.",
        "Add the potato and 150ml water, and simmer for 8 minutes until nearly tender.",
        "Add the fish and milk, and simmer gently for 5–6 minutes until the fish flakes easily.",
        "Season and serve."
      ]
    },
    {
      id: "d199", title: "Ethiopian-Style Spiced Chicken (Doro Wat)", tags: ["spicy", "quick"], cuisine: "Ethiopia", protein: "chicken",
      prep: 8, cook: 19,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(0.25, "tsp", "ground ginger", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "", "egg", "dairy"), ing(1, "", "flatbread (or injera if you can find it)", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the egg for 8 minutes, then cool, peel and score the white a few times with a knife.",
        "Fry the onion in a splash of oil over medium heat for 8 minutes until soft and translucent.",
        "Add the chicken and cook for 5 minutes until browned.",
        "Stir in the paprika, ginger and chilli flakes for 30 seconds until fragrant, then add the chopped tomatoes.",
        "Add the egg and simmer for 8 minutes until the chicken is cooked through with no pink inside and the sauce has thickened.",
        "Taste and adjust the seasoning, then serve with the warm flatbread for scooping."
      ]
    },
    {
      id: "d200", title: "Ethiopian-Style Spiced Collard Greens", tags: ["vegetarian", "vegan", "quick"], cuisine: "Ethiopia", protein: "plant-based",
      prep: 8, cook: 17,
      ingredients: [
        ing(150, "g", "kale or spring greens, shredded", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "", "carrot, sliced", "produce"), ing(0.25, "tsp", "ground ginger", "spice"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and carrot in a splash of oil over medium heat for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the greens and ginger, and cook for 5–6 minutes until wilted and tender.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d201", title: "Indonesian-Style Beef Rendang Stew", tags: ["spicy", "quick"], cuisine: "Indonesia", protein: "beef",
      prep: 8, cook: 18,
      ingredients: [
        ing(160, "g", "beef sirloin, thinly sliced", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(1, "tsp", "curry powder", "spice"), ing(0.5, "tsp", "ground ginger", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Sear the beef in a splash of oil over high heat for 1–2 minutes until browned. Tip onto a plate.",
        "Lower the heat, stir in the curry powder, ginger and chilli flakes for 30 seconds, then pour in the coconut milk.",
        "Simmer uncovered for 8–10 minutes, stirring often, until thick and clinging to the spoon.",
        "Season to taste, then return the beef and its juices, toss for 1 minute, then serve over the rice."
      ]
    },
    {
      id: "d202", title: "Indonesian-Style Sweet Soy Nasi Goreng", tags: ["spicy", "quick"], cuisine: "Indonesia", protein: "chicken",
      prep: 7, cook: 8,
      ingredients: [
        ing(100, "g", "chicken breast, diced", "meat"), ing(150, "g", "cooked rice, cold", "store"),
        ing(1, "tbsp", "dark soy sauce", "store"), ing(1, "tsp", "sweet soy sauce (kecap manis) or honey with soy", "store"),
        ing(1, "", "egg", "dairy"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken in a splash of oil over high heat for 5 minutes until cooked through with no pink inside, then push to one side.",
        "Add the cold rice, soy sauce, sweet soy sauce and chilli flakes, and stir-fry for 3–4 minutes.",
        "Season to taste and pile onto a plate.",
        "Fry the egg in a little oil until the white is set and the edges crisp, keeping the yolk runny, then serve on top of the rice."
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
        "Preheat the oven to 200°C (fan 180°C).",
        "Scatter the mozzarella and feta over the flatbread and fold the edges in slightly to make a boat shape.",
        "Bake for 8 minutes until the cheese has melted.",
        "Crack the egg into the centre and dot with butter, then bake for 5–6 minutes more until the white is just set.",
        "Season to taste, then serve straight away, stirring the yolk through the melted cheese."
      ]
    },
    {
      id: "d204", title: "Georgian-Style Walnut Chicken", tags: ["quick"], cuisine: "Georgia", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(30, "g", "walnuts, chopped", "store"),
        ing(1, "", "garlic clove, finely chopped", "produce"), ing(0.5, "tsp", "ground coriander", "spice"),
        ing(100, "ml", "chicken stock", "store"), ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken and garlic in a splash of oil over medium-high heat for 6 minutes until browned.",
        "Stir in the ground coriander for 30 seconds until fragrant, then add the walnuts and stock and simmer for 6–7 minutes until the chicken is cooked through with no pink inside and the sauce has thickened.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d205", title: "Armenian-Style Lamb & Bulgur Pilaf", tags: ["quick"], cuisine: "Armenia", protein: "lamb",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(60, "g", "bulgur wheat", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion and lamb mince in a splash of oil over medium-high heat for 6 minutes, breaking up the mince, until browned with no pink left.",
        "Stir in the cumin for 30 seconds until fragrant, then add the chopped tomatoes, bulgur and 150ml water.",
        "Cover and simmer for 10–12 minutes until the bulgur is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Season and serve."
      ]
    },
    {
      id: "d206", title: "Armenian-Style Stuffed Pepper Bowl", tags: [], cuisine: "Armenia", protein: "beef",
      prep: 9, cook: 35,
      ingredients: [
        ing(1, "", "red pepper, halved and deseeded", "produce"), ing(120, "g", "beef mince", "meat"),
        ing(50, "g", "rice", "store"), ing(0.5, "tsp", "ground cinnamon", "spice"),
        ing(100, "g", "chopped tomatoes", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Preheat the oven to 190°C (fan 170°C).",
        "Part-cook the rice for 8 minutes, then drain.",
        "Meanwhile, fry the beef mince with the cinnamon in a splash of oil for 5 minutes until browned, then mix with the rice and pile into the pepper halves.",
        "Place in a small ovenproof dish, spoon over the chopped tomatoes, cover with foil.",
        "Bake for 25 minutes until the pepper is tender.",
        "Taste and adjust the seasoning before serving."
      ]
    },
    {
      id: "d207", title: "Ukrainian-Style Beetroot & Beef Stew", tags: ["quick"], cuisine: "Ukraine", protein: "beef",
      prep: 8, cook: 17,
      ingredients: [
        ing(150, "g", "beef rump steak, cut into strips", "meat"), ing(100, "g", "cooked beetroot, diced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(200, "ml", "beef stock", "store"),
        ing(2, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Sear the beef in a splash of oil over high heat for 1–2 minutes until browned but still pink inside. Tip onto a plate.",
        "Add the onion and cook over a medium heat for 8 minutes until soft and translucent, then pour in the stock and simmer for 5 minutes until reduced by about a third.",
        "Stir in the beetroot and warm through for 2 minutes, then return the beef for 1 minute.",
        "Season to taste, then serve with a dollop of soured cream."
      ]
    },
    {
      id: "d208", title: "Ukrainian-Style Cabbage Rolls Bowl", tags: ["quick"], cuisine: "Ukraine", protein: "pork",
      prep: 12, cook: 18,
      ingredients: [
        ing(120, "g", "pork mince", "meat"), ing(50, "g", "rice", "store"),
        ing(3, "", "large cabbage leaves", "produce"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Part-cook the rice for 8 minutes, adding the cabbage leaves for the last 3 minutes to soften, then drain. Cut out the thick stem from each leaf.",
        "Meanwhile, fry the onion in a splash of oil for 5 minutes until soft, then tip half into a bowl.",
        "Mix the pork mince, rice and the onion in the bowl with ¼ tsp salt. Divide between the leaves, fold in the sides and roll up.",
        "Add the chopped tomatoes and a splash of water to the onion left in the pan, sit the rolls in the sauce seam-side down, cover and simmer for 15 minutes until the pork is cooked through.",
        "Season to taste, then serve the rolls in the sauce with the soured cream."
      ]
    },
    {
      id: "d209", title: "Uzbek-Style Beef Plov Rice", tags: [], cuisine: "Uzbekistan", protein: "beef",
      prep: 8, cook: 31,
      ingredients: [
        ing(150, "g", "beef rump steak, cut into 2cm cubes", "meat"), ing(70, "g", "rice", "store"),
        ing(0.5, "", "carrot, grated", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(150, "ml", "beef stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Sear the beef in a splash of oil over high heat for 3 minutes, turning, until browned all over. Tip onto a plate.",
        "Fry the onion over a medium heat for 8 minutes until soft and translucent, then add the carrot and cumin and cook for 2 minutes.",
        "Stir in the rice and stock, cover and simmer for 14–15 minutes until the rice is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Scatter the beef over the rice, cover, take off the heat and leave for 2 minutes to warm through. Season and serve."
      ]
    },
    {
      id: "d210", title: "Uzbek-Style Chicken & Chickpea Rice", tags: ["quick"], cuisine: "Uzbekistan", protein: "chicken",
      prep: 7, cook: 20,
      ingredients: [
        ing(150, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(1, "tin", "chickpeas, drained", "store"), ing(0.5, "", "carrot, grated", "produce"),
        ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken with the cumin in a splash of oil over medium-high heat for 5 minutes.",
        "Add the carrot and chickpeas, and cook for 2 minutes.",
        "Stir in the rice and 150ml water, cover and simmer for 14 minutes until tender. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Season to taste, then serve hot."
      ]
    },
    {
      id: "d211", title: "Colombian-Style Chicken & Rice (Arroz con Pollo)", tags: ["quick"], cuisine: "Colombia", protein: "chicken",
      prep: 8, cook: 21,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(70, "g", "rice", "store"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken and red pepper in a splash of oil over medium-high heat for 5 minutes.",
        "Stir in the cumin for 30 seconds until fragrant, then add the chopped tomatoes, rice and 150ml water.",
        "Cover and simmer for 14–15 minutes until the rice is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Season and serve."
      ]
    },
    {
      id: "d212", title: "Colombian-Style Beef & Potato Stew", tags: ["quick"], cuisine: "Colombia", protein: "beef",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(1, "", "small potato, diced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6 minutes, breaking up the mince, until browned with no pink left.",
        "Add the potato, cumin and 150ml water, cover and simmer for 8 minutes, then add the chopped tomatoes.",
        "Simmer for 5 minutes until the potato is tender.",
        "Season and serve."
      ]
    },
    {
      id: "d213", title: "Chilean-Style Beef & Corn Bowl (Pastel-Inspired)", tags: ["quick"], cuisine: "Chile", protein: "beef",
      prep: 8, cook: 18,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(100, "g", "sweetcorn", "frozen"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "", "egg", "dairy"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 7 minutes, stirring in the paprika for the last minute (it burns if fried longer).",
        "Meanwhile, boil the egg for 8 minutes, then cool, peel and quarter.",
        "Heat the grill to high. Blitz or roughly mash the sweetcorn with a pinch of salt.",
        "Season the beef to taste, spoon into a small ovenproof dish, tuck in the egg quarters and spread the corn over the top.",
        "Grill for 4–5 minutes until the corn is golden in places, then serve."
      ]
    },
    {
      id: "d214", title: "Chilean-Style Fish with Tomato Salsa", tags: ["fish", "quick"], cuisine: "Chile", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(1, "", "tomato, diced", "produce"),
        ing(0.5, "", "red onion, diced", "produce"), ing(0.5, "", "lime", "produce"),
        ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Mix the tomato, onion and lime juice into a fresh salsa.",
        "Fry the fish in a splash of oil over medium-high heat for 3–4 minutes each side until just cooked through.",
        "Season to taste, then serve the fish over the rice, topped with the salsa."
      ]
    },
    {
      id: "d215", title: "Trinidadian-Style Curry Chicken", tags: ["spicy", "quick"], cuisine: "Trinidad", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(1, "tbsp", "curry powder", "spice"),
        ing(1, "", "small potato, diced", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and chicken with the curry powder in a splash of oil over medium heat for 5 minutes.",
        "Add the potato and 150ml water, cover and simmer for 10 minutes until the chicken and potato are tender.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d216", title: "Trinidadian-Style Curried Chickpea Flatbread (Doubles-Inspired)", tags: ["vegetarian", "vegan", "spicy", "quick"], cuisine: "Trinidad", protein: "plant-based",
      prep: 8, cook: 12,
      ingredients: [
        ing(1, "tin", "chickpeas, drained", "store"), ing(0.5, "tsp", "curry powder", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(1, "", "flatbread", "bakery"),
        ing(60, "g", "cucumber, diced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Warm the chickpeas with the curry powder and chilli flakes in a splash of oil for 8 minutes, mashing some as you go.",
        "Warm the flatbread.",
        "Pile the spiced chickpeas onto the flatbread.",
        "Season to taste, then top with the diced cucumber to serve."
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
        "Season to taste, then stir in the peanut butter until smooth, simmer for 3 minutes, and serve over the rice."
      ]
    },
    {
      id: "d218", title: "Ghanaian-Style Spiced Rice (Waakye-Inspired)", tags: ["vegetarian", "vegan", "quick"], cuisine: "Ghana", protein: "plant-based",
      prep: 7, cook: 15,
      ingredients: [
        ing(60, "g", "rice", "store"), ing(1, "tin", "black-eyed beans, drained", "store"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(60, "g", "cabbage, shredded", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Warm the black-eyed beans with the paprika and chilli flakes in a splash of oil for 5 minutes.",
        "Stir the beans through the rice.",
        "Season to taste, then serve with the shredded cabbage."
      ]
    },
    {
      id: "d219", title: "Kenyan-Style Coconut Chicken Stew", tags: ["spicy", "quick"], cuisine: "Kenya", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(0.5, "tsp", "curry powder", "spice"),
        ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the chicken with the curry powder in a splash of oil over medium-high heat for 5 minutes.",
        "Add the chopped tomatoes and coconut milk, and simmer for 8–9 minutes until the chicken is cooked through with no pink inside.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d220", title: "Kenyan-Style Spiced Beef Greens (Sukuma Wiki-Inspired)", tags: ["quick"], cuisine: "Kenya", protein: "beef",
      prep: 8, cook: 15,
      ingredients: [
        ing(120, "g", "beef mince", "meat"), ing(150, "g", "kale, shredded", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(70, "g", "rice", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Fry the onion and beef mince in a splash of oil over medium-high heat for 6 minutes, stirring in the paprika for the last minute.",
        "Add the kale and a splash of water, and cook for 5–6 minutes until wilted and tender.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d221", title: "Senegalese-Style Spiced Fish with Rice", tags: ["fish", "spicy"], cuisine: "Senegal", protein: "fish",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(70, "g", "rice", "store"),
        ing(150, "g", "chopped tomatoes", "store"), ing(1, "", "carrot, cut into chunks", "produce"),
        ing(1, "", "small potato, cut into 2cm cubes", "produce"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(1, "tbsp", "tomato puree", "store"), ing(0.5, "", "lime", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the tomato puree and chilli flakes in a splash of oil for 1 minute, then add the chopped tomatoes, carrot, potato and 250ml water. Simmer for 5 minutes.",
        "Stir in the rice, cover and simmer gently for 12–15 minutes until the rice is tender and red from the sauce and the vegetables are soft.",
        "Meanwhile, season the fish and fry in a little oil over medium-high heat for 3–4 minutes each side until golden and just cooked through.",
        "Season to taste, then serve the fish on the rice and vegetables with a wedge of lime."
      ]
    },
    {
      id: "d222", title: "Senegalese-Style Peanut & Vegetable Rice (Maafe-Inspired)", tags: ["vegetarian", "vegan", "quick"], cuisine: "Senegal", protein: "plant-based",
      prep: 8, cook: 16,
      ingredients: [
        ing(2, "tbsp", "peanut butter", "store"), ing(150, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "sweet potato, diced", "produce"), ing(0.5, "", "carrot, sliced", "produce"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Simmer the sweet potato and carrot in 150ml water for 8 minutes until nearly tender, then add the chopped tomatoes and simmer for 2 minutes.",
        "Stir in the peanut butter until smooth, and simmer for 4 minutes.",
        "Season to taste, then serve over the rice."
      ]
    },
    {
      id: "d223", title: "Belgian-Style Beef & Beer Stew (Carbonnade-Inspired)", tags: ["quick"], cuisine: "Belgium", protein: "beef",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "beef rump steak, cut into strips", "meat"), ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "", "small potato, cut into 2cm cubes", "produce"), ing(100, "ml", "brown ale or stout", "store"),
        ing(100, "ml", "beef stock", "store"), ing(1, "tsp", "Dijon mustard", "store"),
        ing(1, "tsp", "brown sugar", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the potato cubes in salted water for 10–12 minutes until a knife slides in easily, then drain.",
        "Meanwhile, fry the onion in a splash of oil over a medium heat for 10 minutes until soft and golden. Tip onto a plate.",
        "Turn the heat to high and sear the beef for 1–2 minutes until browned but still pink inside. Add to the onion.",
        "Pour the ale, stock, mustard and sugar into the pan and bubble for 4 minutes until slightly reduced and glossy.",
        "Return the beef, onion and potato, heat through for 1 minute, season and serve."
      ]
    },
    {
      id: "d224", title: "Belgian-Style Chicken Waterzooi-Inspired Stew", tags: ["quick"], cuisine: "Belgium", protein: "chicken",
      prep: 8, cook: 14,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(0.5, "", "leek, sliced", "produce"),
        ing(0.5, "", "carrot, sliced", "produce"), ing(150, "ml", "chicken stock", "store"),
        ing(2, "tbsp", "double cream", "dairy"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the chicken, leek and carrot in a splash of oil over medium heat for 5 minutes.",
        "Pour in the stock and simmer for 8–9 minutes until the chicken is cooked through with no pink inside.",
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
        "Squeeze excess moisture from the grated potato, then mix in a pinch of salt.",
        "Melt the butter in a frying pan and press in the potato, cooking over medium heat for 6–7 minutes until golden underneath.",
        "Flip carefully, scatter the cheese over the cooked side, cover with a lid and cook for 5–6 minutes more until golden underneath and the cheese has melted.",
        "Season to taste, then serve with the salad leaves."
      ]
    },
    {
      id: "d226", title: "Swiss-Style Chicken & Mushroom in Cream Sauce", tags: ["quick"], cuisine: "Switzerland", protein: "chicken",
      prep: 8, cook: 12,
      ingredients: [
        ing(160, "g", "chicken breast, sliced", "meat"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(100, "ml", "double cream", "dairy"), ing(1, "tsp", "Dijon mustard", "store"),
        ing(70, "g", "pasta", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the pasta according to the packet instructions.",
        "Fry the chicken and mushrooms in a splash of oil over medium-high heat for 8 minutes until the chicken is cooked through with no pink inside.",
        "Stir in the cream and mustard, and simmer for 2 minutes until thickened.",
        "Season to taste, then serve over the pasta."
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
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(1, "tbsp", "breadcrumbs", "store"),
        ing(1, "", "egg yolk", "dairy"), ing(150, "g", "new potatoes", "produce"),
        ing(1, "tbsp", "cranberry sauce", "store")
      ],
      steps: [
        "Halve any larger new potatoes and boil for 12–15 minutes until a knife slides in easily, then drain.",
        "Mix the pork mince with ¼ tsp salt, the breadcrumbs and egg yolk, and shape into small meatballs.",
        "Fry over medium heat for 8–9 minutes, turning, until browned and cooked through.",
        "Season to taste, then serve with the potatoes and cranberry sauce."
      ]
    },
    {
      id: "d229", title: "Danish-Style Open Rye Sandwich (Smørrebrød-Inspired)", tags: ["fish", "quick"], cuisine: "Denmark", protein: "fish",
      prep: 8, cook: 0,
      ingredients: [
        ing(2, "slices", "rye bread", "bakery"), ing(80, "g", "smoked mackerel, flaked", "meat"),
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
      id: "d230", title: "Danish-Style Pork Meatballs (Frikadeller-Inspired)", tags: [], cuisine: "Denmark", protein: "pork",
      prep: 10, cook: 20,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg yolk", "dairy"), ing(150, "g", "new potatoes", "produce"),
        ing(1, "tbsp", "butter", "dairy"), ing(80, "g", "red cabbage, shredded", "produce"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(1, "tsp", "sugar", "store"),
        ing(100, "ml", "beef stock", "store")
      ],
      steps: [
        "Simmer the red cabbage with the vinegar, sugar and 2 tbsp water in a covered pan for 15 minutes, stirring now and then, until soft and glossy.",
        "Meanwhile, boil the new potatoes whole for 15 minutes until a knife slides in easily, then drain and toss with half the butter.",
        "Mix the pork mince with ¼ tsp salt, 1 tbsp of the flour and the egg yolk, and shape into oval patties.",
        "Fry in the rest of the butter over medium heat for 4–5 minutes each side until browned and cooked through, then lift onto a plate.",
        "Stir the remaining flour into the pan juices for 30 seconds, then whisk in the stock and bubble for 2 minutes into a smooth gravy.",
        "Season to taste, then serve the meatballs with the potatoes, gravy and red cabbage."
      ]
    },
    {
      id: "d231", title: "Norwegian-Style Baked Salmon with Dill Sauce", tags: ["fish", "quick"], cuisine: "Norway", protein: "fish",
      prep: 7, cook: 15,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(null, "handful", "fresh dill, chopped", "produce"), ing(120, "g", "new potatoes", "produce"),
        ing(60, "g", "green beans", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Boil the potatoes for 12–15 minutes, adding the green beans for the last 4 minutes, until a knife slides easily into the potatoes, then drain.",
        "Bake the salmon for 12–14 minutes until just cooked through.",
        "Stir the dill through the soured cream.",
        "Season to taste, then serve the salmon with the potatoes, beans and dill sauce."
      ]
    },
    {
      id: "d232", title: "New Zealand-Style Lamb with Mint Sauce", tags: ["quick"], cuisine: "New Zealand", protein: "lamb",
      prep: 7, cook: 15,
      ingredients: [
        ing(160, "g", "lamb leg steak", "meat"), ing(null, "handful", "fresh mint, chopped", "produce"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(1, "tsp", "honey", "store"),
        ing(120, "g", "new potatoes", "produce")
      ],
      steps: [
        "Halve any larger new potatoes and boil for 12–15 minutes until a knife slides in easily, then drain.",
        "Mix the mint, vinegar and honey into a sauce.",
        "Fry the lamb over medium-high heat for 3–4 minutes each side, then rest for 2 minutes and slice.",
        "Season to taste, then serve the lamb with the potatoes and mint sauce."
      ]
    },
    {
      id: "d233", title: "Canadian-Style Maple Pork Chops", tags: ["quick"], cuisine: "Canada", protein: "pork",
      prep: 7, cook: 18,
      ingredients: [
        ing(1, "", "pork chop", "meat"), ing(1.5, "tbsp", "maple syrup", "store"),
        ing(1, "tsp", "Dijon mustard", "store"), ing(120, "g", "new potatoes", "produce"),
        ing(60, "g", "green beans", "produce")
      ],
      steps: [
        "Boil the potatoes for 12–15 minutes, adding the green beans for the last 4 minutes, until a knife slides easily into the potatoes, then drain.",
        "Fry the pork chop over medium-high heat for 4–5 minutes each side until nearly cooked through.",
        "Stir the maple syrup and mustard together, pour over the chop and cook for 1–2 minutes until glazed and cooked through (65–70°C in the middle). Rest for 3 minutes.",
        "Season to taste, then serve with the potatoes and beans."
      ]
    },
    {
      id: "d234", title: "Puerto Rican-Style Rice with Pigeon Peas", tags: ["vegetarian", "vegan", "quick"], cuisine: "Puerto Rico", protein: "plant-based",
      prep: 7, cook: 20,
      ingredients: [
        ing(70, "g", "rice", "store"), ing(1, "tin", "pigeon peas or black-eyed beans, drained", "store"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Fry the red pepper and garlic in a splash of oil over medium heat for 4 minutes.",
        "Stir in the cumin for 30 seconds until fragrant, then add the rice, pigeon peas and 150ml water.",
        "Cover and simmer for 14 minutes until the rice is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Season and serve."
      ]
    },
    {
      id: "d235", title: "Puerto Rican-Style Mojo Pork", tags: ["quick"], cuisine: "Puerto Rico", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(160, "g", "pork loin, sliced", "meat"), ing(0.5, "", "lime, juiced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "dried oregano", "spice"),
        ing(70, "g", "rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the pork with the lime juice, garlic and oregano.",
        "Fry over medium-high heat for 4–5 minutes, turning once, until browned and cooked through.",
        "Season to taste, then serve over the rice."
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
        "Slice the chicken and arrange over the rice with the sliced cucumber, then spoon the ginger and spring onion oil over the top."
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
        "Season to taste, then return the beans to the wok, toss to coat and cook for a further 1–2 minutes. Serve with the rice."
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
        "Season to taste, then scatter with the remaining spring onion and serve with rice."
      ]
    },
    {
      id: "d239", title: "Chinese-Style Cumin Lamb Stir-Fry with Peppers", tags: ["quick", "spicy"], cuisine: "China", protein: "lamb",
      prep: 10, cook: 10,
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
        "Season to taste, then scatter with coriander and serve with rice."
      ]
    },
    {
      id: "d240", title: "Greek Avgolemono Chicken & Orzo Soup", tags: [], cuisine: "Greece", protein: "chicken",
      prep: 8, cook: 24,
      ingredients: [
        ing(150, "g", "chicken breast, diced", "meat"), ing(500, "ml", "chicken stock", "store"),
        ing(40, "g", "orzo", "store"), ing(1, "", "egg", "dairy"),
        ing(1, "", "lemon, juiced", "produce"), ing(0.5, "", "onion, finely diced", "produce"),
        ing(1, "", "carrot, diced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "sprig", "fresh dill, chopped", "produce")
      ],
      steps: [
        "Heat the olive oil in a saucepan and sauté the onion and carrot for 8 minutes until soft and translucent.",
        "Add the stock and bring to the boil, then add the chicken and orzo and simmer for 10–12 minutes until the chicken is cooked and the orzo is tender.",
        "Whisk the egg and lemon juice together in a bowl. Ladle a little hot stock into the egg mixture, whisking constantly to temper it.",
        "Remove the soup from the heat and stir in the egg-lemon mixture, stirring until silky (do not let it boil again or it will curdle).",
        "Season and scatter with the chopped dill to serve."
      ]
    },
    {
      id: "d241", title: "Greek-Style Baked Cod Plaki with Tomatoes and Olives", tags: ["fish"], cuisine: "Greece", protein: "fish",
      prep: 8, cook: 24,
      ingredients: [
        ing(1, "", "cod fillet, about 180g", "meat"), ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "", "garlic clove, sliced", "produce"), ing(200, "g", "chopped tomatoes (tinned)", "store"),
        ing(1, "handful", "Kalamata olives", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tsp", "dried oregano", "spice"), ing(0.5, "", "lemon", "produce"),
        ing(1, "handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (180°C fan).",
        "Heat the olive oil in an ovenproof pan and sauté the onion for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the chopped tomatoes, oregano and olives and simmer for 5 minutes.",
        "Nestle the cod fillet into the sauce and spoon a little sauce over the top.",
        "Transfer to the oven and bake for 12–15 minutes until the fish flakes easily.",
        "Season to taste, then squeeze over the lemon juice and scatter with parsley to serve."
      ]
    },
    {
      id: "d242", title: "Greek Beef Giouvetsi with Orzo", tags: [], cuisine: "Greece", protein: "beef",
      prep: 10, cook: 25,
      ingredients: [
        ing(150, "g", "beef rump steak, cut into 2cm pieces", "meat"), ing(60, "g", "orzo", "store"),
        ing(200, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.25, "tsp", "ground cinnamon", "spice"), ing(200, "ml", "beef stock", "store"),
        ing(20, "g", "hard cheese (kefalotyri or parmesan), grated", "dairy"), ing(1, "handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Heat the olive oil in a saucepan over high heat and sear the beef for 1–2 minutes until browned. Tip onto a plate.",
        "Lower the heat, add the onion and cook for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the cinnamon for 30 seconds until fragrant, then add the chopped tomatoes and stock and bring to a simmer.",
        "Add the orzo and cook for 8–10 minutes, stirring often, until tender and the sauce has thickened. Add a splash of water if it dries out.",
        "Season to taste, then return the beef and its juices for 1–2 minutes, then spoon into a bowl and scatter with the cheese and parsley."
      ]
    },
    {
      id: "d243", title: "Greek Gigantes-Style Butter Beans in Tomato Sauce", tags: ["vegetarian", "vegan"], cuisine: "Greece", protein: "plant-based",
      prep: 8, cook: 24,
      ingredients: [
        ing(400, "g", "butter beans (tinned), drained", "store"), ing(200, "g", "chopped tomatoes", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, minced", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "tsp", "dried oregano", "spice"),
        ing(0.5, "tsp", "sweet paprika", "spice"), ing(1, "handful", "fresh parsley, chopped", "produce"),
        ing(1, "slice", "crusty bread, to serve", "bakery")
      ],
      steps: [
        "Heat the olive oil in a saucepan and sauté the onion for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the paprika and oregano for 30 seconds until fragrant, then add the chopped tomatoes and bring to a simmer.",
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
      prep: 9, cook: 19,
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
        "Add the remaining oil to the pan and fry the chorizo, onion, pepper and celery for 8 minutes until soft and translucent.",
        "Stir in the cooked rice and toss well for 2–3 minutes to heat through and pick up the spiced oil.",
        "Season to taste, then serve the dirty rice topped with the blackened fish."
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
        ing(1, "tsp", "Dijon mustard", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Rub the pork slices with the brown sugar, smoked paprika and garlic powder.",
        "Heat a splash of oil in a frying pan over medium heat and cook the pork for 4–5 minutes per side until deeply browned and cooked through.",
        "Add 1 tbsp of the cider vinegar with the ketchup and hot sauce to the pan, toss to coat, then shred the pork with two forks in the sauce and simmer for 2–3 minutes until sticky.",
        "Meanwhile, toss the shredded cabbage with the mayonnaise, mustard and remaining vinegar to make a quick slaw.",
        "Season to taste, then pile the pulled pork into the bun and top with the vinegar slaw."
      ]
    },
    {
      id: "d247", title: "Korean Dak Galbi-Style Spicy Chicken with Rice Cakes", tags: ["quick", "spicy"], cuisine: "Korea", protein: "chicken",
      prep: 11, cook: 16,
      ingredients: [
        ing(180, "g", "chicken thigh, diced", "meat"), ing(100, "g", "Korean rice cakes (tteok)", "frozen"),
        ing(1, "tbsp", "gochujang", "store"), ing(1, "tsp", "gochugaru (Korean chilli flakes)", "spice"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "honey", "store"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(0.25, "", "white cabbage, shredded", "produce"), ing(0.5, "", "carrot, sliced", "produce"),
        ing(1, "", "spring onion, sliced", "produce"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Soak the rice cakes in warm water for 10 minutes (unless the pack says otherwise), then drain.",
        "Mix the gochujang, gochugaru, soy sauce, honey, garlic and ginger in a bowl. Toss the chicken in half the sauce.",
        "Heat the oil in a frying pan or wok over medium-high heat, add the chicken and stir-fry for 5–6 minutes until browned and nearly cooked through.",
        "Add the cabbage and carrot and stir-fry for 2–3 minutes until starting to soften.",
        "Add the rice cakes, remaining sauce and a splash of water, and cook for 4–5 minutes, stirring, until the rice cakes are soft and the chicken is cooked through with no pink inside.",
        "Season to taste, then scatter with spring onion to serve."
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
        "Season to taste, then scatter with spring onion and serve with rice."
      ]
    },
    {
      id: "d249", title: "Korean Japchae Glass Noodles with Pork", tags: ["quick"], cuisine: "Korea", protein: "pork",
      prep: 10, cook: 12,
      ingredients: [
        ing(60, "g", "sweet potato glass noodles (dangmyeon)", "store"), ing(120, "g", "pork loin, thinly sliced", "meat"),
        ing(0.5, "", "carrot, julienned", "produce"), ing(0.25, "", "onion, sliced", "produce"),
        ing(60, "g", "spinach", "produce"), ing(1, "", "spring onion, sliced", "produce"),
        ing(2, "tbsp", "soy sauce", "store"), ing(1, "tbsp", "sesame oil", "store"),
        ing(1, "tbsp", "sugar", "store"), ing(1, "tsp", "toasted sesame seeds", "spice"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Boil the glass noodles for 6–7 minutes until tender, then drain, rinse and snip into shorter lengths with scissors.",
        "Heat the vegetable oil in a wok over high heat and stir-fry the pork for 3–4 minutes until browned. Remove and set aside.",
        "Add the carrot and onion to the wok and stir-fry for 2–3 minutes, then add the spinach and wilt for 1 minute. Remove and set aside with the pork.",
        "Toss the drained noodles in the wok with the soy sauce, sesame oil, sugar and garlic for 1–2 minutes until glossy.",
        "Season to taste, then return the pork and vegetables to the wok, toss everything together, and scatter with spring onion and sesame seeds."
      ]
    },
    {
      id: "d250", title: "Vietnamese-Style Turmeric Dill Fish (Chả Cá) with Rice Noodles", tags: ["quick", "fish"], cuisine: "Vietnam", protein: "fish",
      prep: 11, cook: 10,
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
        "Season to taste, then serve the fish and dill over the rice noodles, scattered with chopped peanuts and coriander, with a squeeze of lime."
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
        ing(1, "handful", "fresh Thai basil or coriander", "produce"), ing(0.5, "", "lime", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Simmer the vegetable stock with the star anise, cinnamon stick, ginger and garlic for 8–10 minutes to infuse, then stir in the soy sauce.",
        "Meanwhile, cook the rice noodles according to the packet instructions and drain.",
        "Pan-fry the tofu cubes in a little oil for 4–5 minutes until golden on the outside.",
        "Strain the spices out of the stock (or leave them in for extra flavour) and bring it back to a simmer.",
        "Divide the noodles and beansprouts into a bowl, pour over the hot broth, and top with the tofu, sliced chilli and herbs.",
        "Season to taste, then serve with a lime wedge."
      ]
    },
    {
      id: "d252", title: "Irish-Style Lamb Shepherd's Pie Mash Cup", tags: [], cuisine: "Ireland", protein: "lamb",
      prep: 9, cook: 24,
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
        "Meanwhile, heat the oil in a frying pan and brown the lamb mince for 4–5 minutes, breaking it up as it cooks, until no pink remains.",
        "Add the onion and carrot and cook for 8 minutes until soft and translucent.",
        "Stir in the tomato purée and fry for 1 minute until it darkens, then add the stock, Worcestershire sauce and thyme and simmer for 6–8 minutes until thickened.",
        "Heat the grill to high. Spoon the lamb mixture into a small ovenproof dish or a large mug, top with the mash and rough up the surface with a fork. Grill for 3–4 minutes until golden and crisp on top."
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
      id: "d254", title: "Hungarian-Style Paprika Fish Soup (Halászlé)", tags: ["spicy", "fish"], cuisine: "Hungary", protein: "fish",
      prep: 10, cook: 23,
      ingredients: [
        ing(180, "g", "white fish fillet (e.g. pollock or haddock), cut into chunks", "meat"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(1, "tbsp", "sweet paprika", "spice"), ing(0.5, "tsp", "hot paprika", "spice"),
        ing(1, "", "tomato, chopped", "produce"), ing(0.5, "", "green pepper, chopped", "produce"),
        ing(400, "ml", "fish or vegetable stock", "store"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(1, "handful", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Heat the oil in a saucepan and sauté the onion for 8 minutes until soft and translucent.",
        "Remove the pan from the heat and stir in the sweet and hot paprika (this stops it burning and turning bitter).",
        "Add the tomato, green pepper and stock, return to the heat and simmer for 10 minutes.",
        "Add the fish chunks and simmer gently for 6–8 minutes until just cooked through.",
        "Season to taste and scatter with parsley to serve."
      ]
    },
    {
      id: "d255", title: "Hungarian Stuffed Peppers with Pork and Rice (Töltött Paprika)", tags: [], cuisine: "Hungary", protein: "pork",
      prep: 9, cook: 40,
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
        "Cover with foil and bake for 35–40 minutes until the pepper is tender and the filling is piping hot and cooked through.",
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
        "Grill or griddle the skewers over medium-high heat for 3–4 minutes per side until charred and cooked through.",
        "Season to taste, then serve with the raw onion wedges and sliced tomato."
      ]
    },
    {
      id: "d257", title: "Nigerian-Style Efo Riro Spinach & Turkey Stew", tags: ["spicy"], cuisine: "Nigeria", protein: "turkey",
      prep: 13, cook: 20,
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
        "Add the turkey and cook for 8–10 minutes until cooked through with no pink inside.",
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
        "Season to taste, then serve with the sliced red onion and a scatter of fresh coriander."
      ]
    },
    {
      id: "d259", title: "Pakistani-Style Chapli Kebab with Yoghurt Chutney", tags: ["quick", "spicy"], cuisine: "Pakistan", protein: "beef",
      prep: 13, cook: 12,
      ingredients: [
        ing(180, "g", "beef mince", "meat"), ing(0.25, "", "onion, finely diced", "produce"),
        ing(1, "", "tomato, finely diced (seeds removed)", "produce"), ing(1, "", "green chilli, finely chopped", "produce"),
        ing(1, "tsp", "coriander seeds, crushed", "spice"), ing(1, "tsp", "cumin seeds, crushed", "spice"),
        ing(0.5, "tsp", "chilli powder", "spice"), ing(1, "tbsp", "gram flour", "store"),
        ing(1, "handful", "fresh coriander, chopped", "produce"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(3, "tbsp", "natural yoghurt", "dairy"), ing(0.5, "tsp", "fresh mint, chopped", "produce")
      ],
      steps: [
        "Mix the beef mince with ¼ tsp salt, the onion, tomato, chilli, coriander seeds, cumin seeds, chilli powder, gram flour and fresh coriander until well combined.",
        "Shape into 2 flat, wide patties.",
        "Heat the oil in a frying pan over medium heat and fry the patties for 4–5 minutes per side until well browned and cooked through.",
        "Mix the yoghurt with the mint to make a quick chutney.",
        "Season to taste, then serve the chapli kebabs with the minted yoghurt chutney."
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
        "Heat the vegetable oil in a frying pan over medium heat and fry the chicken for 3–4 minutes per side until golden and cooked through (75°C in the thickest part).",
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
      prep: 8, cook: 12,
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
        "Season to taste, then serve piled onto the rye bread."
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
        "Season the chicken breast and pan-fry in the vegetable oil over medium heat for 6–7 minutes per side until cooked through (75°C in the thickest part). Rest and slice.",
        "Meanwhile, boil the potatoes, carrots and onion together in salted water for 15–18 minutes until very tender.",
        "Drain well and mash together with the butter, milk and mustard until smooth-ish (a little texture is traditional).",
        "Season the hutspot mash to taste.",
        "Serve the sliced chicken over the carrot and onion mash."
      ]
    },
    {
      id: "d264", title: "Armenian-Style Chicken Khorovats Skewers", tags: ["quick"], cuisine: "Armenia", protein: "chicken",
      prep: 10, cook: 12,
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
        "Season to taste, then scatter with chopped parsley before serving."
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
        "Blitz or finely chop the walnuts, garlic and herbs together with the vinegar, chilli flakes and 1 tbsp of the olive oil to make a chunky walnut sauce. Season to taste.",
        "Dust the trout fillet lightly in flour.",
        "Heat the remaining oil in a frying pan over medium-high heat and fry the trout, skin-side down, for 3–4 minutes, then flip and cook for 2 minutes more until just cooked through.",
        "Spoon the walnut herb sauce over the trout to serve."
      ]
    },
    {
      id: "d266", title: "Chilean-Style Pork Chop with Pebre Salsa", tags: ["quick"], cuisine: "Chile", protein: "pork",
      prep: 10, cook: 12,
      ingredients: [
        ing(1, "", "pork loin chop", "meat"), ing(1, "", "tomato, finely diced", "produce"),
        ing(0.25, "", "red onion, finely diced", "produce"), ing(1, "", "garlic clove, minced", "produce"),
        ing(0.5, "", "red chilli, finely chopped", "produce"), ing(1, "handful", "fresh coriander, chopped", "produce"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(2, "tbsp", "olive oil", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Mix the tomato, red onion, garlic, chilli and coriander with the red wine vinegar and olive oil to make the pebre salsa. Season and set aside.",
        "Season the pork chop and pan-fry in the vegetable oil over medium-high heat for 4–5 minutes per side until cooked through (65–70°C in the middle) and golden, then rest for 3 minutes.",
        "Rest the pork chop for a couple of minutes.",
        "Serve topped with a generous spoonful of pebre salsa."
      ]
    },
    {
      id: "d267", title: "Chilean-Style Porotos Granados Bean & Squash Stew", tags: ["vegetarian", "vegan"], cuisine: "Chile", protein: "plant-based",
      prep: 9, cook: 23,
      ingredients: [
        ing(400, "g", "borlotti or cannellini beans (tinned), drained", "store"), ing(150, "g", "butternut squash, diced", "produce"),
        ing(80, "g", "sweetcorn kernels", "frozen"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(1, "", "garlic clove, minced", "produce"),
        ing(1, "tsp", "smoked paprika", "spice"), ing(1, "tbsp", "olive oil", "store"),
        ing(200, "ml", "vegetable stock", "store"), ing(1, "handful", "fresh basil, torn", "produce")
      ],
      steps: [
        "Heat the olive oil in a saucepan and sauté the onion and pepper for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the squash, paprika and stock, bring to a simmer, cover and cook for 10–12 minutes until the squash is tender.",
        "Stir in the beans and sweetcorn and simmer for a further 5 minutes until heated through and the stew has thickened slightly.",
        "Season to taste and scatter with torn basil to serve."
      ]
    },
    {
      id: "d268", title: "Senegalese-Style Chicken Yassa with Onions and Lemon", tags: [], cuisine: "Senegal", protein: "chicken",
      prep: 9, cook: 28,
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
        "Return the chicken and marinade to the pan, cover and simmer for 8–10 minutes until the chicken is cooked through (75°C in the thickest part).",
        "Season to taste, then serve over rice, scattered with parsley."
      ]
    },
    {
      id: "d269", title: "Senegalese-Style Beef Mafé Peanut Stew with Rice", tags: ["spicy"], cuisine: "Senegal", protein: "beef",
      prep: 10, cook: 22,
      ingredients: [
        ing(180, "g", "beef rump steak, cut into 2cm pieces", "meat"), ing(2, "tbsp", "smooth peanut butter", "store"),
        ing(200, "g", "chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, minced", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(0.5, "tsp", "chilli powder", "spice"), ing(150, "ml", "beef stock", "store"),
        ing(150, "g", "cooked rice", "store"), ing(1, "handful", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Heat a little oil in a saucepan and sear the beef over high heat for 1–2 minutes until browned. Tip onto a plate.",
        "Lower the heat, add the onion and cook for 8 minutes until soft and translucent, adding the garlic and ginger for the last minute.",
        "Stir in the chilli powder for 30 seconds until fragrant, then add the chopped tomatoes and stock and simmer for 8 minutes until slightly thickened.",
        "Stir in the peanut butter until dissolved and simmer for 3 minutes until thickened.",
        "Season to taste, then return the beef and its juices for 1–2 minutes, then serve over rice scattered with coriander."
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
        "Melt half the butter in a frying pan over medium-high heat and fry the plaice for 2 minutes, then flip and cook for 1 minute more until golden and just cooked through. Remove.",
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
        "Season the chicken breast and pan-fry in the vegetable oil over medium heat for 6–7 minutes per side until cooked through (75°C in the thickest part). Rest and slice.",
        "Blanch the kale in boiling water for 2–3 minutes, then drain well, squeezing out excess water, and chop finely.",
        "Melt the butter in a small pan, stir in the flour and cook for 1 minute, then gradually whisk in the milk to make a smooth sauce.",
        "Stir the kale into the sauce with a pinch of nutmeg and simmer for 2–3 minutes until thickened.",
        "Serve the sliced chicken with the creamed kale."
      ]
    },
    {
      id: "d272", title: "Puerto Rican-Style Pollo Guisado Chicken Stew", tags: [], cuisine: "Puerto Rico", protein: "chicken",
      prep: 11, cook: 29,
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
        "Add the onion and pepper and cook for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the tomato purée, oregano and cumin, cook for 1 minute, then add the stock and potato.",
        "Bring to a simmer, cover and cook for 15–18 minutes until the potato and chicken are cooked through with no pink inside.",
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
      prep: 10, cook: 23,
      ingredients: [
        ing(180, "g", "pork loin steak, cut into 2cm cubes", "meat"), ing(2, "tbsp", "vindaloo curry paste", "store"),
        ing(1, "tbsp", "malt vinegar", "store"), ing(1, "", "onion, sliced", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "tsp", "ground cumin", "spice"), ing(1, "", "tomato, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(70, "g", "basmati rice", "store"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Toss the pork with the vindaloo paste and vinegar in a bowl and set aside to marinate while you prep everything else.",
        "Heat the oil in a pan and fry the onion for 8 minutes until soft and translucent, then add the garlic and ginger and cook for 1 minute.",
        "Stir in the cumin for 30 seconds until fragrant, then add the tomato and 100ml water and simmer for 6–8 minutes until thick.",
        "Add the pork with its marinade and simmer for 5–6 minutes, stirring, until cooked through. Add a splash of water if it looks dry.",
        "Meanwhile, cook the rice according to the packet instructions.",
        "Season to taste, then serve the vindaloo over the rice, scattered with coriander."
      ]
    },
    {
      id: "d275", title: "Bengali Mustard Fish (Shorshe Maach)", tags: ["quick", "fish"], cuisine: "India", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "white fish fillet (e.g. pollock or basa)", "meat"), ing(1, "tbsp", "black mustard seeds", "spice"),
        ing(1, "tsp", "yellow mustard powder", "spice"), ing(2, "", "green chillies, sliced", "produce"),
        ing(0.5, "tsp", "turmeric", "spice"), ing(2, "tbsp", "mustard oil (or vegetable oil)", "store"),
        ing(70, "g", "basmati rice", "store"), ing(null, "pinch", "salt", "spice")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Grind the mustard seeds, mustard powder, one chilli and a splash of water into a smooth paste using a pestle and mortar or small blender.",
        "Rub the fish with turmeric and a pinch of salt.",
        "Heat the mustard oil in a pan until hot, then fry the fish for 2 minutes on each side until lightly coloured. Remove and set aside.",
        "Add the mustard paste to the pan with 100ml water and the remaining chilli, and simmer for 3 minutes.",
        "Return the fish to the pan, spoon the sauce over and simmer gently for 4–5 minutes until cooked through.",
        "Serve with the rice."
      ]
    },
    {
      id: "d276", title: "Chettinad Chicken with Curry Leaves", tags: ["spicy"], cuisine: "India", protein: "chicken",
      prep: 13, cook: 23,
      ingredients: [
        ing(160, "g", "chicken thigh, diced", "meat"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(0.5, "tsp", "mustard seeds", "spice"), ing(10, "", "fresh curry leaves", "produce"),
        ing(1, "", "onion, finely sliced", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(2, "", "dried red chillies", "spice"),
        ing(1, "tsp", "ground coriander", "spice"), ing(0.5, "tsp", "fennel seeds, crushed", "spice"),
        ing(0.5, "tsp", "black peppercorns, crushed", "spice"), ing(1, "", "tomato, chopped", "produce"),
        ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Heat the oil in a pan and splutter the mustard seeds and curry leaves for 30 seconds.",
        "Add the onion and cook for 10 minutes until soft and golden, then add the garlic, ginger and dried chillies and cook for 1 minute.",
        "Stir in the coriander, fennel, pepper and chicken, and cook for 4–5 minutes until browned.",
        "Add the chopped tomato and 100ml water, cover and simmer for 10–12 minutes until the chicken is cooked through with no pink inside and the sauce has thickened.",
        "Meanwhile cook the rice according to the packet instructions.",
        "Season to taste, then serve the chicken over the rice."
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
        ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Whisk the yoghurt with the gram flour, turmeric and 200ml water until completely smooth.",
        "Heat the oil in a pan and splutter the mustard and cumin seeds, then add the curry leaves, asafoetida, ginger and chilli.",
        "Pour in the yoghurt mixture and bring to a gentle simmer, stirring constantly so it doesn't split. Stir in the sugar.",
        "Simmer for 8–10 minutes, stirring often, until slightly thickened.",
        "Meanwhile cook the rice according to the packet instructions.",
        "Season to taste, then serve the kadhi over the rice, scattered with coriander."
      ]
    },
    {
      id: "d278", title: "Pork Carnitas Bowl with Pineapple Salsa", tags: ["quick"], cuisine: "Mexico", protein: "pork",
      prep: 8, cook: 12,
      ingredients: [
        ing(180, "g", "pork loin steak, cut into 1.5cm pieces", "meat"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(1, "", "orange, juiced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(80, "g", "tinned pineapple chunks, drained and chopped", "store"), ing(0.5, "", "red onion, finely diced", "produce"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce"), ing(1, "", "lime", "produce"),
        ing(100, "g", "cooked rice", "store"), ing(null, "pinch", "chilli flakes", "spice")
      ],
      steps: [
        "Toss the pork with the cumin, oregano, garlic and orange juice.",
        "Heat the oil in a pan, lift the pork out of the juice and fry over high heat for 6–8 minutes, turning occasionally, until crisp at the edges and cooked through. Pour in the juice for the last minute to glaze, then roughly chop.",
        "Meanwhile mix the pineapple, red onion, coriander, a squeeze of lime juice and chilli flakes for the salsa.",
        "Warm the rice.",
        "Season to taste, then serve the shredded pork over the rice, topped with the pineapple salsa and remaining lime wedges."
      ]
    },
    {
      id: "d279", title: "Chicken Mole Poblano-Style", tags: ["spicy"], cuisine: "Mexico", protein: "chicken",
      prep: 9, cook: 24,
      ingredients: [
        ing(180, "g", "chicken breast", "meat"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tbsp", "mole paste (or 1 tbsp chilli powder blended with the cocoa below)", "store"),
        ing(1, "tsp", "chilli powder", "spice"), ing(0.5, "tsp", "ground cinnamon", "spice"),
        ing(1, "tsp", "smooth peanut butter", "store"), ing(150, "ml", "chicken stock", "store"),
        ing(1, "tsp", "cocoa powder", "store"), ing(70, "g", "basmati rice", "store"),
        ing(1, "tsp", "sesame seeds", "spice")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Season the chicken and fry in the oil for 3–4 minutes on each side until browned. Remove and set aside.",
        "Soften the onion in the same pan for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the mole paste (or chilli powder) and cinnamon for 30 seconds until fragrant, then add the peanut butter and stock and simmer for 3 minutes until smooth.",
        "Return the chicken to the pan, cover and simmer for 6–8 minutes until cooked through (75°C in the thickest part), stirring in the cocoa powder to deepen the sauce.",
        "Slice the chicken, spoon the sauce over and scatter with sesame seeds. Serve with the rice."
      ]
    },
    {
      id: "d280", title: "Huevos Rancheros with Refried Beans", tags: ["vegetarian", "quick"], cuisine: "Mexico", protein: "plant-based",
      prep: 10, cook: 16,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(2, "", "small corn tortillas", "bakery"), ing(200, "g", "tinned chopped tomatoes", "store"),
        ing(0.5, "", "onion, finely chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(0.5, "tsp", "chilli powder", "spice"), ing(120, "g", "tinned refried beans", "store"),
        ing(30, "g", "cheese, grated", "dairy"), ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Heat half the oil and soften the onion for 8 minutes until soft and translucent, adding the garlic for the last minute. Add the tomatoes and chilli powder, and simmer for 8 minutes to a thick sauce.",
        "Meanwhile warm the refried beans in a small pan with a splash of water.",
        "Warm the tortillas in a dry pan.",
        "Fry the eggs in the remaining oil to your liking.",
        "Season to taste, then spread the beans over the tortillas, top with the tomato sauce, fried eggs, cheese and coriander."
      ]
    },
    {
      id: "d281", title: "Beef Birria Tacos with Consommé", tags: ["spicy"], cuisine: "Mexico", protein: "beef",
      prep: 13, cook: 25,
      ingredients: [
        ing(180, "g", "beef rump steak, thinly sliced", "meat"), ing(1, "tbsp", "chipotle paste", "store"),
        ing(1, "tsp", "ground cumin", "spice"), ing(0.5, "tsp", "dried oregano", "spice"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "", "onion, chopped", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(300, "ml", "beef stock", "store"),
        ing(3, "", "small corn tortillas", "bakery"), ing(40, "g", "cheese, grated", "dairy"),
        ing(1, "", "lime, cut into wedges", "produce"), ing(1, "tbsp", "fresh coriander, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Put the chipotle paste, cumin, oregano, garlic, onion, tomato and stock in a pan and simmer for 12–15 minutes until the onion is soft. Mash well or blend for a smoother consommé.",
        "Meanwhile, sear the beef in a hot pan with a splash of oil for 1–2 minutes until browned. Stir it into the consommé for 1 minute, then lift it out and chop roughly.",
        "Dip the tortillas in the consommé, fill with beef and cheese, fold and fry in a little oil for 1–2 minutes each side until crisp.",
        "Season to taste, then serve the tacos with the consommé for dipping, lime wedges and coriander."
      ]
    },
    {
      id: "d282", title: "Spanish Albóndigas in Almond-Tomato Sauce", tags: [], cuisine: "Spain", protein: "pork",
      prep: 9, cook: 24,
      ingredients: [
        ing(150, "g", "pork mince", "meat"), ing(2, "tbsp", "breadcrumbs", "bakery"),
        ing(1, "tbsp", "milk", "dairy"), ing(1, "", "egg yolk", "dairy"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tbsp", "fresh parsley, chopped", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(200, "g", "tinned chopped tomatoes", "store"), ing(1, "tbsp", "flaked almonds", "store"),
        ing(null, "pinch", "smoked paprika", "spice"), ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Soak the breadcrumbs in the milk, then mix with the pork mince, ¼ tsp salt, egg yolk, half the garlic and the parsley. Shape into small meatballs.",
        "Heat half the oil and brown the meatballs all over, 4–5 minutes. Remove and set aside.",
        "Add the remaining oil and soften the onion for 8 minutes until soft and translucent, adding the garlic for the last minute, then stir in the paprika, tomatoes and almonds. Simmer for 5 minutes.",
        "Return the meatballs to the sauce, cover and simmer for 8–10 minutes until cooked through.",
        "Season to taste, then serve with the crusty bread."
      ]
    },
    {
      id: "d283", title: "Catalan-Style Chicken with Almonds and Sherry", tags: [], cuisine: "Spain", protein: "chicken",
      prep: 8, cook: 26,
      ingredients: [
        ing(200, "g", "chicken thighs", "meat"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(50, "ml", "dry sherry (or dry white wine)", "store"), ing(150, "ml", "chicken stock", "store"),
        ing(1, "tbsp", "flaked almonds", "store"), ing(1, "", "slice bread, torn", "bakery"),
        ing(1, "tsp", "fresh parsley, chopped", "produce"), ing(1, "", "bay leaf", "spice")
      ],
      steps: [
        "Heat the oil in a pan and brown the chicken all over, 5–6 minutes. Remove and set aside.",
        "Soften the onion in the same pan for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the almonds and torn bread and toast for 1–2 minutes, then pour in the sherry and let it bubble for 1 minute.",
        "Add the stock and bay leaf, return the chicken to the pan, cover and simmer for 15–18 minutes until the chicken is cooked through (75°C in the thickest part).",
        "Taste and adjust the seasoning.",
        "Mash some of the almonds and bread into the sauce with a fork to thicken slightly, stir through the parsley and serve."
      ]
    },
    {
      id: "d284", title: "Spanish White Bean & Spinach Stew (Potaje)", tags: ["vegetarian", "vegan", "quick"], cuisine: "Spain", protein: "plant-based",
      prep: 8, cook: 18,
      ingredients: [
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "onion, chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "", "red pepper, chopped", "produce"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(1, "tsp", "ground cumin", "spice"),
        ing(200, "g", "tinned butter beans, drained", "store"), ing(100, "g", "tinned chopped tomatoes", "store"),
        ing(80, "g", "spinach", "produce"), ing(150, "ml", "vegetable stock", "store"),
        ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Heat the oil and soften the onion and pepper for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the paprika and cumin and cook for 30 seconds.",
        "Add the tomatoes, butter beans and stock, and simmer for 10 minutes.",
        "Stir in the spinach and cook for 2–3 minutes until wilted.",
        "Season to taste, then serve with the crusty bread."
      ]
    },
    {
      id: "d285", title: "Bacalhau à Brás-Style Salt Cod with Potato and Egg", tags: ["fish", "quick"], cuisine: "Portugal", protein: "fish",
      prep: 9, cook: 18,
      ingredients: [
        ing(150, "g", "skinless white fish fillet", "meat"), ing(150, "g", "potatoes, cut into thin matchsticks", "produce"),
        ing(2, "tbsp", "olive oil", "store"), ing(0.5, "", "onion, thinly sliced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(2, "", "eggs, beaten", "dairy"),
        ing(1, "tbsp", "black olives", "store"), ing(1, "tbsp", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Fry the potato matchsticks in 1 tbsp of the oil over medium heat for 8–10 minutes until golden and tender. Drain on paper and set aside.",
        "Poach or pan-fry the fish for 3–4 minutes until just cooked, then flake into pieces.",
        "In the same pan, heat the remaining oil and soften the onion for 8 minutes until soft and translucent, adding the garlic for the last minute.",
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
        "Season to taste, then ladle into a bowl, top with the reserved crispy chorizo and a drizzle of olive oil."
      ]
    },
    {
      id: "d287", title: "Kuku Sabzi (Persian Herb Frittata)", tags: ["vegetarian", "quick"], cuisine: "Iran", protein: "plant-based",
      prep: 10, cook: 12,
      ingredients: [
        ing(3, "", "eggs", "dairy"), ing(1, "handful", "fresh parsley, chopped", "produce"),
        ing(1, "handful", "fresh coriander, chopped", "produce"), ing(1, "small handful", "fresh dill, chopped", "produce"),
        ing(2, "", "spring onions, chopped", "produce"), ing(0.5, "tsp", "turmeric", "spice"),
        ing(1, "tbsp", "plain flour", "store"), ing(1, "tbsp", "chopped walnuts", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(null, "pinch", "salt", "spice")
      ],
      steps: [
        "Whisk the eggs with the turmeric, flour and a pinch of salt until smooth.",
        "Stir in all the chopped herbs, spring onions and walnuts.",
        "Heat the oil in a small non-stick pan over medium heat and pour in the mixture.",
        "Cook for 4–5 minutes until the base is set and golden, then flip using a plate, or finish under the grill for 3–4 minutes until fully set.",
        "Slide onto a plate, cut into wedges and serve warm or at room temperature."
      ]
    },
    {
      id: "d288", title: "Fesenjan-Style Chicken with Pomegranate and Walnut", tags: [], cuisine: "Iran", protein: "chicken",
      prep: 8, cook: 26,
      ingredients: [
        ing(180, "g", "chicken thighs", "meat"), ing(40, "g", "walnuts, finely ground", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(0.5, "", "onion, chopped", "produce"),
        ing(2, "tbsp", "pomegranate molasses", "store"), ing(150, "ml", "chicken stock", "store"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(null, "pinch", "sugar", "store"),
        ing(1, "tbsp", "pomegranate seeds", "produce"), ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Heat the oil in a pan and brown the chicken pieces all over, 4–5 minutes. Remove and set aside.",
        "Soften the onion in the same pan for 8 minutes until soft and translucent.",
        "Add the ground walnuts and toast for 1–2 minutes, then stir in the stock, pomegranate molasses and cinnamon.",
        "Return the chicken to the pan, cover and simmer for 15 minutes until cooked through (75°C in the thickest part) and the sauce is thick and glossy, adding a pinch of sugar to balance if needed.",
        "Season to taste, then serve the chicken and sauce over the rice, scattered with pomegranate seeds."
      ]
    },
    {
      id: "d289", title: "Turkish Menemen with Feta and Crusty Bread", tags: ["vegetarian", "quick"], cuisine: "Turkey", protein: "plant-based",
      prep: 8, cook: 13,
      ingredients: [
        ing(2, "", "eggs", "dairy"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.5, "", "green pepper, sliced", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(30, "g", "feta, crumbled", "dairy"), ing(1, "tbsp", "fresh parsley, chopped", "produce"),
        ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Heat the oil and soften the onion and pepper for 8 minutes until soft and translucent.",
        "Add the tomato and chilli flakes, and cook for 4–5 minutes until softened and saucy.",
        "Beat the eggs lightly and pour into the pan, stirring gently until just set but still soft, about 2–3 minutes.",
        "Scatter with feta and parsley.",
        "Season to taste, then serve with the crusty bread."
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
        "Mix the beef mince with ¼ tsp salt, the grated onion, garlic, cumin, cinnamon and parsley, and shape into 4–5 oval köfte.",
        "Heat the oil in a pan and fry the köfte for 8–10 minutes, turning occasionally, until browned and cooked through.",
        "Meanwhile mix the yoghurt with the extra garlic and a pinch of salt.",
        "Warm the flatbread.",
        "Serve the köfte on the flatbread with the garlic yoghurt, dusted with sumac."
      ]
    },
    {
      id: "d291", title: "Ethiopian Beef Tibs with Peppers and Rosemary", tags: ["spicy", "quick"], cuisine: "Ethiopia", protein: "beef",
      prep: 12, cook: 12,
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
        "Season to taste, then serve with warm flatbread."
      ]
    },
    {
      id: "d292", title: "Ethiopian Shiro Wat (Spiced Chickpea Flour Stew)", tags: ["vegan", "vegetarian", "spicy"], cuisine: "Ethiopia", protein: "plant-based",
      prep: 8, cook: 19,
      ingredients: [
        ing(3, "tbsp", "gram (chickpea) flour", "store"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, finely chopped", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "berbere spice blend", "spice"),
        ing(1, "", "tomato, chopped", "produce"), ing(250, "ml", "vegetable stock", "store"),
        ing(1, "", "flatbread", "bakery")
      ],
      steps: [
        "Heat the oil and cook the onion for 10 minutes until soft and golden.",
        "Add the garlic, ginger and berbere, and cook for 1 minute until fragrant.",
        "Stir in the chopped tomato and cook for 2 minutes.",
        "Whisk the gram flour with a splash of the stock to make a smooth paste, then stir into the pan with the remaining stock.",
        "Simmer for 6–8 minutes, stirring often, until thickened to a smooth, glossy stew.",
        "Season to taste, then serve with warm flatbread for scooping."
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
        "Season to taste, then drizzle with tahini and amba (or mango chutney with lemon) and scatter over the chopped pickled cucumber."
      ]
    },
    {
      id: "d294", title: "Israeli-Style Za'atar Baked Salmon with Tahini", tags: ["fish", "quick"], cuisine: "Israel", protein: "fish",
      prep: 6, cook: 14,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "tbsp", "za'atar", "spice"), ing(1, "tbsp", "tahini", "store"),
        ing(0.5, "", "lemon", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "handful", "cherry tomatoes", "produce"), ing(60, "g", "couscous", "store"), ing(90, "ml", "vegetable stock", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Rub the salmon with the oil and za'atar and place on a tray with the cherry tomatoes.",
        "Bake for 12–14 minutes until the salmon flakes easily and the tomatoes have softened.",
        "Meanwhile mix the tahini with the garlic, a squeeze of lemon juice and enough water to loosen to a drizzling consistency.",
        "Taste and adjust the seasoning.",
        "Bring the stock to the boil in a small pan (or make it up with just-boiled water from the kettle). Pour it over the couscous, cover and leave for 5 minutes, then fluff with a fork and serve alongside the salmon and tomatoes, drizzled with the tahini sauce."
      ]
    },
    {
      id: "d295", title: "Sri Lankan-Style Devilled Chicken", tags: ["spicy", "quick"], cuisine: "Sri Lanka", protein: "chicken",
      prep: 13, cook: 15,
      ingredients: [
        ing(180, "g", "chicken breast, diced", "meat"), ing(0.5, "tsp", "curry powder", "spice"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(0.5, "", "green pepper, sliced", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1, "", "green chilli, sliced", "produce"), ing(1, "tbsp", "tomato ketchup", "store"),
        ing(1, "tsp", "soy sauce", "store"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Toss the chicken with the curry powder and a pinch of salt.",
        "Heat the oil in a wok or frying pan and stir-fry the chicken for 5–6 minutes until browned and cooked through with no pink inside. Remove and set aside.",
        "Add the onion and peppers to the pan and stir-fry for 4–5 minutes until slightly charred at the edges.",
        "Add the garlic, ginger and chilli, and cook for 1 minute.",
        "Return the chicken to the pan with the ketchup, soy sauce and chilli flakes, tossing to coat well. Cook for 2 minutes.",
        "Serve with the rice."
      ]
    },
    {
      id: "d296", title: "Sri Lankan-Style Black Pepper Beef Curry", tags: ["spicy"], cuisine: "Sri Lanka", protein: "beef",
      prep: 10, cook: 21,
      ingredients: [
        ing(180, "g", "beef sirloin, thinly sliced", "meat"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(2, "", "garlic cloves, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "black peppercorns, coarsely crushed", "spice"),
        ing(0.5, "tsp", "ground coriander", "spice"), ing(0.25, "tsp", "turmeric", "spice"),
        ing(1, "sprig", "fresh curry leaves", "produce"), ing(150, "ml", "coconut milk", "store"),
        ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Heat the oil over high heat and sear the beef for 1–2 minutes until browned. Tip onto a plate.",
        "Lower the heat and soften the onion and curry leaves for 8 minutes until the onion is soft and translucent, adding the garlic and ginger for the last minute.",
        "Stir in the black pepper, coriander and turmeric and cook for 1 minute.",
        "Pour in the coconut milk and 50ml water and simmer uncovered for 6–8 minutes until thickened.",
        "Season to taste, then return the beef and its juices for 1–2 minutes, then serve with the rice."
      ]
    },
    {
      id: "d297", title: "Swedish Pytt i Panna with Fried Egg", tags: [], cuisine: "Sweden", protein: "pork",
      prep: 10, cook: 23,
      ingredients: [
        ing(150, "g", "potatoes, diced", "produce"), ing(100, "g", "cooked ham, diced", "meat"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "tbsp", "butter", "dairy"),
        ing(1, "", "egg", "dairy"), ing(2, "tbsp", "chopped pickled beetroot", "store"),
        ing(1, "tbsp", "fresh chives, chopped", "produce")
      ],
      steps: [
        "Boil the diced potatoes in salted water for 8 minutes until just tender, then drain well and let them steam dry for a minute.",
        "Melt the butter in a frying pan and fry the diced potato for 6–8 minutes until golden and crisp, stirring occasionally.",
        "Add the onion and diced ham and cook for a further 5 minutes until the onion is soft and everything is heated through and lightly crisp.",
        "In a separate small pan, fry the egg to your liking.",
        "Pile the hash onto a plate and top with the fried egg.",
        "Serve with the pickled beetroot and a scatter of chives."
      ]
    },
    {
      id: "d298", title: "Swedish Kalops-Style Beef and Root Vegetable Stew", tags: [], cuisine: "Sweden", protein: "beef",
      prep: 9, cook: 25,
      ingredients: [
        ing(180, "g", "beef rump steak, cut into 2cm cubes", "meat"), ing(1, "tbsp", "butter", "dairy"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(4, "", "whole allspice berries", "spice"), ing(1, "", "bay leaf", "spice"),
        ing(200, "ml", "beef stock", "store"), ing(1, "tsp", "plain flour", "store"),
        ing(150, "g", "potatoes, halved", "produce"), ing(2, "tbsp", "pickled beetroot", "store")
      ],
      steps: [
        "Boil the potatoes in salted water for 15–18 minutes until tender.",
        "Meanwhile, melt the butter in a pan over high heat and sear the beef for 1–2 minutes until browned. Tip onto a plate.",
        "Soften the onion and carrot in the same pan for 8 minutes until soft and translucent.",
        "Stir the flour into the vegetables, then gradually add the stock, stirring to avoid lumps. Add the allspice and bay leaf and simmer for 10 minutes until the carrot is tender.",
        "Return the beef and its juices for 1–2 minutes, then remove the bay leaf.",
        "Serve with the potatoes and pickled beetroot."
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
        "Preheat the oven to 200°C (fan 180°C).",
        "Coat the chicken breast in flour, then beaten egg, then breadcrumbs.",
        "Heat the oil in an ovenproof pan and fry the chicken for 3 minutes each side until golden.",
        "Mix the passata with the oregano and spread over the chicken, then top with the mozzarella.",
        "Transfer to the oven and bake for 8–10 minutes until the chicken is cooked through (75°C in the thickest part) and the cheese is melted and bubbling.",
        "Season to taste, then serve with a side salad."
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
      prep: 8, cook: 22,
      ingredients: [
        ing(150, "g", "boerewors sausage (or good pork sausage)", "meat"), ing(60, "g", "quick-cook polenta or maize meal", "store"),
        ing(200, "ml", "water", "store"), ing(1, "tbsp", "butter", "dairy"),
        ing(0.5, "", "onion, sliced", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "carrot, grated", "produce"), ing(1, "tsp", "curry powder", "spice"),
        ing(100, "g", "tinned chopped tomatoes", "store"), ing(null, "pinch", "chilli flakes", "spice"),
        ing(1, "tsp", "vegetable oil", "store")
      ],
      steps: [
        "Grill or fry the sausage over medium heat for 12–15 minutes, turning occasionally, until cooked through and browned.",
        "Meanwhile bring the water to the boil, whisk in the polenta and cook for 5–6 minutes, stirring, until thick (ordinary maize meal needs 15 minutes, covered, on a low heat). Stir in the butter.",
        "For the chakalaka, heat the oil and soften the onion, pepper and carrot for 8 minutes until soft and translucent.",
        "Stir in the curry powder and chilli flakes, cook for 1 minute, then add the tomatoes and simmer for 5 minutes.",
        "Season to taste, then serve the sausage with the pap and chakalaka spooned alongside."
      ]
    },
    {
      id: "d302", title: "South African-Style Cape Malay Fish Curry", tags: ["quick"], cuisine: "South Africa", protein: "fish",
      prep: 8, cook: 21,
      ingredients: [
        ing(180, "g", "white fish fillet, cut into chunks", "meat"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "curry powder", "spice"),
        ing(0.5, "tsp", "turmeric", "spice"), ing(1, "tbsp", "apricot jam", "store"),
        ing(1, "tbsp", "lemon juice", "produce"), ing(1, "", "bay leaf", "spice"),
        ing(150, "ml", "coconut milk", "store"), ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Heat the oil and soften the onion for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the ginger, curry powder and turmeric, and cook for 1 minute.",
        "Add the apricot jam, lemon juice, bay leaf and coconut milk, and simmer for 5 minutes.",
        "Add the fish chunks and simmer gently for 6–8 minutes until just cooked through.",
        "Season to taste, then serve with the rice."
      ]
    },
    {
      id: "d303", title: "Ukrainian-Style Chicken Kyiv", tags: [], cuisine: "Ukraine", protein: "chicken",
      prep: 9, cook: 22,
      ingredients: [
        ing(180, "g", "chicken breast, butterflied and flattened", "meat"), ing(30, "g", "butter, softened", "dairy"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "fresh parsley, chopped", "produce"),
        ing(2, "tbsp", "plain flour", "store"), ing(1, "", "egg, beaten", "dairy"),
        ing(40, "g", "breadcrumbs", "bakery"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(1, "handful", "green salad leaves", "produce")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Mix the softened butter with the garlic and parsley, roll into a small log and chill in the freezer for 5 minutes to firm up.",
        "Place the butter in the centre of the flattened chicken breast and roll up tightly to enclose it, securing with a cocktail stick.",
        "Coat the chicken parcel in flour, then beaten egg, then breadcrumbs.",
        "Heat the oil in an ovenproof pan and brown the chicken on all sides, 3–4 minutes.",
        "Transfer to the oven for 15–18 minutes until cooked through and the juices run clear.",
        "Season to taste, then rest for 2 minutes before cutting, and serve with a green salad."
      ]
    },
    {
      id: "d304", title: "Ukrainian-Style Varenyky (Potato and Cheese Dumplings)", tags: ["vegetarian"], cuisine: "Ukraine", protein: "plant-based",
      prep: 10, cook: 25,
      ingredients: [
        ing(8, "", "ready-made dumpling or wonton wrappers", "bakery"), ing(120, "g", "floury potato, peeled and chopped", "produce"),
        ing(30, "g", "curd cheese", "dairy"), ing(0.5, "", "small onion, finely diced", "produce"),
        ing(1, "tbsp", "butter", "dairy"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "fresh chives, chopped", "produce")
      ],
      steps: [
        "Boil the potato in salted water for 12–15 minutes until tender, then drain, mash and leave to cool slightly.",
        "Mix the mashed potato with the curd cheese and a little of the diced onion to make the filling.",
        "Place a spoonful of filling in the centre of each wrapper, dampen the edges with water and fold into a half-moon, pressing to seal.",
        "Bring a pan of water to a gentle boil and cook the dumplings for 3–4 minutes until they float and are cooked through.",
        "Meanwhile melt the butter in a small pan and fry the remaining onion for 10 minutes until soft and golden.",
        "Drain the dumplings, toss through the buttery onion, and serve with soured cream and chives."
      ]
    },
    {
      id: "d305", title: "Trinidadian-Style Beef Pelau", tags: [], cuisine: "Trinidad", protein: "beef",
      prep: 9, cook: 35,
      ingredients: [
        ing(150, "g", "beef rump steak, cut into 2cm cubes", "meat"), ing(1, "tbsp", "brown sugar", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(0.5, "", "onion, chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "dried thyme", "spice"),
        ing(1, "", "green chilli, chopped", "produce"), ing(75, "g", "basmati rice", "store"),
        ing(100, "g", "tinned pigeon peas, drained", "store"), ing(200, "ml", "coconut milk", "store"),
        ing(0.5, "", "carrot, diced", "produce")
      ],
      steps: [
        "Heat the oil in a pot until hot, add the sugar and let it caramelise to a dark brown, 1–2 minutes, watching closely so it doesn't burn.",
        "Add the beef immediately and stir to coat in the caramel for 1–2 minutes. Lift the beef onto a plate.",
        "Add the onion, thyme and chilli to the pot and cook for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the rice, peas and carrot, then pour in the coconut milk and 100ml water.",
        "Cover and simmer for 18–20 minutes until the rice is tender, stirring once halfway through and stirring the beef back in for the last 2 minutes. Take off the heat and leave covered for 5 minutes.",
        "Taste and adjust the seasoning before serving."
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
        "Drain, then mash the potatoes and kale together with the butter, milk and mustard until roughly mashed, and season with salt and pepper.",
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
        "Preheat the oven to 200°C (fan 180°C).",
        "Simmer the chicory halves in a pan of water for 8–10 minutes until just tender. Drain well and place in an ovenproof dish.",
        "Melt the butter in a small pan, stir in the flour and cook for 1 minute, then gradually whisk in the milk to make a smooth sauce.",
        "Stir in the mustard, nutmeg and half the cheese until melted.",
        "Taste and adjust the seasoning.",
        "Pour the sauce over the chicory, scatter with the remaining cheese, and bake for 10–12 minutes until golden and bubbling."
      ]
    },
    {
      id: "d309", title: "Norwegian-Style Fish Cakes with Creamed Cabbage", tags: ["fish", "quick"], cuisine: "Norway", protein: "fish",
      prep: 9, cook: 15,
      ingredients: [
        ing(180, "g", "white fish fillet (e.g. haddock or cod), roughly chopped", "meat"), ing(2, "tbsp", "plain flour", "store"),
        ing(1, "", "egg", "dairy"),
        ing(null, "pinch", "nutmeg", "spice"), ing(2, "tbsp", "butter", "dairy"),
        ing(100, "g", "white cabbage, shredded", "produce"), ing(2, "tbsp", "double cream", "dairy"),
        ing(1, "tbsp", "fresh dill, chopped", "produce")
      ],
      steps: [
        "Blitz the fish with the flour, egg and nutmeg until thick and sticky (or chop very finely and mix well).",
        "Heat half the butter in a pan and fry spoonfuls of the fish mixture for 3–4 minutes each side until golden and cooked through.",
        "Meanwhile melt the remaining butter in another pan and soften the cabbage for 6–8 minutes until tender.",
        "Stir the cream into the cabbage and simmer for 2 minutes until slightly thickened.",
        "Season to taste, then serve the fish cakes with the creamed cabbage, scattered with dill."
      ]
    },
    {
      id: "d310", title: "Norwegian-Style Lapskaus (Beef and Cabbage Stew)", tags: [], cuisine: "Norway", protein: "beef",
      prep: 9, cook: 28,
      ingredients: [
        ing(180, "g", "beef rump steak, cut into 2cm cubes", "meat"), ing(1, "tbsp", "butter", "dairy"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(1, "", "potato, cut into 1.5cm cubes", "produce"), ing(80, "g", "white cabbage, shredded", "produce"),
        ing(250, "ml", "beef stock", "store"), ing(1, "", "bay leaf", "spice"),
        ing(1, "tbsp", "fresh parsley, chopped", "produce")
      ],
      steps: [
        "Melt the butter in a pot over high heat and sear the beef for 1–2 minutes until browned. Tip onto a plate.",
        "Soften the onion and carrot in the same pot for 8 minutes until soft and translucent.",
        "Add the potato, stock and bay leaf, cover and simmer for 10 minutes.",
        "Add the cabbage and simmer for 6–8 minutes until the potato and cabbage are tender.",
        "Return the beef and its juices for 1–2 minutes, season and scatter with parsley to serve."
      ]
    },
    {
      id: "d311", title: "Lancashire Hotpot with Lamb and Sliced Potatoes", tags: [], cuisine: "UK", protein: "lamb",
      prep: 10, cook: 35,
      ingredients: [
        ing(180, "g", "lamb leg steak, diced", "meat"), ing(1, "", "onion, sliced", "produce"),
        ing(1, "", "carrot, sliced", "produce"), ing(2, "", "potatoes, thinly sliced", "produce"),
        ing(150, "ml", "lamb or chicken stock", "store"), ing(1, "tsp", "Worcestershire sauce", "store"),
        ing(1, "tsp", "fresh thyme leaves", "produce"), ing(15, "g", "butter, melted", "dairy"),
        ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Preheat the oven to 180°C (fan 160°C).",
        "Brown the lamb in a little of the butter in a frying pan over high heat for 2 minutes.",
        "Layer the onion, carrot and lamb in a small ovenproof dish, tucking in the thyme and seasoning as you go, then pour over the stock and Worcestershire sauce.",
        "Arrange the sliced potatoes on top in overlapping layers and brush with the melted butter.",
        "Cover with foil and bake for 25 minutes, then uncover and bake a further 10 minutes until the potatoes are golden and tender."
      ]
    },
    {
      id: "d312", title: "Cullen Skink-Style Smoked Haddock Chowder", tags: ["quick", "fish"], cuisine: "UK", protein: "fish",
      prep: 8, cook: 19,
      ingredients: [
        ing(150, "g", "smoked haddock fillet", "meat"), ing(1, "", "potato, diced", "produce"),
        ing(1, "", "small onion, chopped", "produce"), ing(15, "g", "butter", "dairy"),
        ing(100, "ml", "milk", "dairy"), ing(100, "ml", "fish or vegetable stock", "store"),
        ing(1, "", "bay leaf", "spice"), ing(1, "tbsp", "chives, chopped", "produce"),
        ing(null, "to taste", "black pepper", "spice")
      ],
      steps: [
        "Melt the butter in a saucepan and soften the onion for 8 minutes until soft and translucent.",
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
        "Mix the cheddar, mustard, ale or milk and Worcestershire sauce into a thick paste, and season with black pepper.",
        "Place the tomato halves under the grill for 2–3 minutes to soften slightly.",
        "Spread the cheese mixture thickly over the toast and grill for 3–4 minutes until bubbling and golden.",
        "Serve with the grilled tomatoes."
      ]
    },
    {
      id: "d314", title: "Coronation Chicken with Basmati Rice", tags: ["quick"], cuisine: "UK", protein: "chicken",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(60, "g", "basmati rice", "store"),
        ing(2, "tbsp", "mayonnaise", "store"), ing(1, "tsp", "mild curry powder", "spice"),
        ing(1, "tsp", "mango chutney", "store"), ing(1, "tsp", "lemon juice", "produce"),
        ing(15, "g", "sultanas", "store"), ing(10, "g", "flaked almonds", "store"),
        ing(1, "", "spring onion, sliced", "produce")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Meanwhile, poach the chicken breast in a pan of gently simmering water for 10–12 minutes until cooked through (75°C in the thickest part), then drain, cool slightly and dice.",
        "Mix the mayonnaise, curry powder, mango chutney and lemon juice in a bowl.",
        "Fold the diced chicken and sultanas through the dressing.",
        "Season to taste, then spoon over the warm rice and scatter with flaked almonds and spring onion."
      ]
    },
    {
      id: "d315", title: "Duck Confit-Style Duck Leg with Sautéed Potatoes", tags: [], cuisine: "France", protein: "duck",
      prep: 6, cook: 60,
      ingredients: [
        ing(1, "", "duck leg (about 200g)", "meat"), ing(2, "", "potatoes, diced", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "fresh thyme leaves", "produce"),
        ing(null, "to taste", "salt", "spice")
      ],
      steps: [
        "Preheat the oven to 190°C (fan 170°C).",
        "Score the duck skin, season well with salt and place skin-side down in a cold ovenproof frying pan.",
        "Set over low-medium heat for 5 minutes to render the fat and crisp the skin, then transfer the pan to the oven and roast for 50–55 minutes until tender and crisp.",
        "Meanwhile, parboil the diced potatoes for 5 minutes, then drain.",
        "Fry the potatoes in a little of the rendered duck fat with the garlic and thyme for 8–10 minutes until golden.",
        "Rest the duck for 3 minutes before serving with the potatoes."
      ]
    },
    {
      id: "d316", title: "Beef Bourguignon-Style Beef with Mushrooms", tags: [], cuisine: "France", protein: "beef",
      prep: 10, cook: 29,
      ingredients: [
        ing(180, "g", "beef rump steak, cut into 2cm cubes", "meat"), ing(1, "", "rasher smoked bacon, chopped", "meat"),
        ing(1, "", "small onion, sliced", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(60, "g", "chestnut mushrooms, halved", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(150, "ml", "red wine", "store"), ing(100, "ml", "beef stock", "store"),
        ing(1, "tsp", "tomato purée", "store"), ing(1, "tsp", "fresh thyme leaves", "produce"),
        ing(1, "", "bay leaf", "spice"), ing(10, "g", "butter", "dairy")
      ],
      steps: [
        "Melt the butter over high heat and sear the beef for 1–2 minutes until browned. Tip onto a plate.",
        "Fry the bacon and mushrooms in the same pan for 4 minutes until golden. Add to the beef.",
        "Soften the onion and carrot for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the tomato purée and fry for 1 minute until it darkens, then add the wine, stock, thyme and bay leaf and simmer uncovered for 12–15 minutes until the carrot is tender and the sauce has reduced by half.",
        "Return the beef, bacon and mushrooms for 1–2 minutes. Remove the bay leaf, season and serve."
      ]
    },
    {
      id: "d317", title: "Salmon en Papillote with Fennel and Lemon", tags: ["quick", "fish"], cuisine: "France", protein: "fish",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "salmon fillet", "meat"), ing(0.5, "", "fennel bulb, thinly sliced", "produce"),
        ing(0.5, "", "lemon, thinly sliced", "produce"), ing(60, "g", "cherry tomatoes, halved", "produce"),
        ing(1, "tbsp", "white wine or water", "store"), ing(1, "tsp", "dill, chopped", "produce"),
        ing(1, "tsp", "olive oil", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Lay a large sheet of baking paper on a tray and arrange the fennel slices in the centre.",
        "Top with the salmon, lemon slices, cherry tomatoes and dill, then drizzle with olive oil and the wine or water, and season with salt and pepper.",
        "Fold and scrunch the paper to seal into a parcel.",
        "Bake for 15 minutes until the salmon is just cooked through, then open carefully and serve."
      ]
    },
    {
      id: "d318", title: "French Green Lentil Salad with Soft-Boiled Egg and Dijon Dressing", tags: ["quick", "vegetarian"], cuisine: "France", protein: "plant-based",
      prep: 7, cook: 8,
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
        "Season to taste, then halve the egg and place on top, scattering with parsley to serve."
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
        "Season to taste, then drizzle with brown sauce and mayonnaise, and scatter with bonito flakes and the remaining spring onion."
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
        "Season to taste, then serve over the shredded cabbage, scattered with sesame seeds and a lemon wedge."
      ]
    },
    {
      id: "d321", title: "Chirashi-Style Salmon Rice Bowl", tags: ["quick", "fish"], cuisine: "Japan", protein: "fish",
      prep: 10, cook: 15,
      ingredients: [
        ing(75, "g", "sushi rice", "store"), ing(1, "tbsp", "rice vinegar", "store"),
        ing(1, "tsp", "sugar", "store"), ing(100, "g", "very fresh salmon fillet, thinly sliced", "meat"),
        ing(0.25, "", "cucumber, sliced", "produce"), ing(0.5, "", "avocado, sliced", "produce"),
        ing(30, "g", "frozen edamame beans, cooked", "frozen"), ing(1, "tbsp", "soy sauce", "store"),
        ing(1, "tsp", "pickled ginger", "store"), ing(0.5, "sheet", "nori, shredded", "store")
      ],
      steps: [
        "Use fish sold for eating raw, or fish that has been frozen first (check the label).",
        "Cook the sushi rice according to the packet instructions.",
        "While still warm, stir the rice vinegar and sugar through the rice, then leave to cool slightly.",
        "Cook the edamame in boiling water for 2–3 minutes, then drain.",
        "Spoon the rice into a bowl and arrange the salmon, cucumber, avocado and edamame on top.",
        "Season to taste, then scatter with pickled ginger and shredded nori, and serve with soy sauce for drizzling."
      ]
    },
    {
      id: "d322", title: "Cypriot Kleftiko-Style Lamb with Lemon and Oregano", tags: [], cuisine: "Cyprus", protein: "lamb",
      prep: 8, cook: 40,
      ingredients: [
        ing(180, "g", "lamb leg steak, cut into chunks", "meat"), ing(1, "", "potato, cut into wedges", "produce"),
        ing(2, "", "garlic cloves, sliced", "produce"), ing(1, "", "lemon, juiced", "produce"),
        ing(1, "tsp", "dried oregano", "spice"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "bay leaf", "spice"), ing(null, "to taste", "salt and pepper", "spice")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C). Parboil the potato wedges in salted water for 8 minutes, then drain.",
        "Toss the lamb and potato wedges with the garlic, lemon juice, oregano, olive oil, bay leaf and seasoning in an ovenproof dish.",
        "Add a small splash of water and cover tightly with foil.",
        "Roast for 20 minutes, then uncover and roast for a further 10 minutes until the lamb is cooked and the potatoes are tender and golden."
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
        "Season to taste, then serve with crusty bread."
      ]
    },
    {
      id: "d324", title: "Jamaican-Style Escovitch Fish with Pickled Peppers", tags: ["quick", "spicy", "fish"], cuisine: "Jamaica", protein: "fish",
      prep: 9, cook: 15,
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
        "In the same pan, soften the onion, carrot and peppers for 8 minutes until soft, adding the allspice, chilli flakes and thyme for the last minute.",
        "Add the vinegar and a splash of water, and simmer for 3–4 minutes.",
        "Spoon the pickled vegetables over the fish to serve."
      ]
    },
    {
      id: "d325", title: "Jamaican-Style Brown Stew Chicken", tags: [], cuisine: "Jamaica", protein: "chicken",
      prep: 10, cook: 35,
      ingredients: [
        ing(2, "", "chicken thighs, bone-in", "meat"), ing(1, "tsp", "brown sugar", "store"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "tsp", "ground allspice", "spice"),
        ing(1, "sprig", "thyme", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "onion, sliced", "produce"),
        ing(0.5, "", "pepper, sliced", "produce"), ing(150, "ml", "chicken stock", "store"),
        ing(1, "", "spring onion, sliced", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Marinate the chicken in the soy sauce, garlic, ginger and allspice for 5 minutes.",
        "Heat the oil and sugar in a pan over medium-high heat until the sugar turns dark amber, then add the chicken and brown well on all sides.",
        "Add the onion, pepper and thyme, and cook for 8 minutes until soft and translucent.",
        "Pour in the stock, cover and simmer for 20–25 minutes until the chicken is tender and the sauce has thickened.",
        "Season to taste, then scatter with spring onion to serve."
      ]
    },
    {
      id: "d326", title: "Cuban-Style Ropa Vieja-Inspired Beef and Peppers", tags: [], cuisine: "Cuba", protein: "beef",
      prep: 10, cook: 22,
      ingredients: [
        ing(180, "g", "beef rump steak, thinly sliced", "meat"), ing(1, "", "onion, sliced", "produce"),
        ing(0.5, "", "each red and green pepper, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(200, "g", "tinned chopped tomatoes", "store"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(1, "", "bay leaf", "spice"),
        ing(15, "g", "green olives", "store"), ing(60, "g", "white rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Sear the beef strips in a hot pan for 1–2 minutes until browned, then set aside.",
        "Soften the onion and peppers in the same pan for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the tomatoes, cumin, paprika and bay leaf and simmer for 10 minutes until thick.",
        "Season to taste, then return the beef with the olives for 1–2 minutes, remove the bay leaf and serve with the rice."
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
        "Season to taste, then serve over the rice and black beans, spooning over any pan juices."
      ]
    },
    {
      id: "d328", title: "Indonesian-Style Chicken Satay with Peanut Sauce", tags: ["quick", "spicy"], cuisine: "Indonesia", protein: "chicken",
      prep: 9, cook: 15,
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
        "Season to taste, then serve the skewers with the peanut sauce and rice."
      ]
    },
    {
      id: "d329", title: "Indonesian-Style Grilled Fish with Sambal (Ikan Bakar)", tags: ["quick", "spicy", "fish"], cuisine: "Indonesia", protein: "fish",
      prep: 9, cook: 15,
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
        "Season to taste, then top the beans with the chopped tomato and parsley, and serve with the warm pitta."
      ]
    },
    {
      id: "d331", title: "Egyptian-Style Chicken Kofta with Rice", tags: ["quick"], cuisine: "Egypt", protein: "chicken",
      prep: 9, cook: 15,
      ingredients: [
        ing(150, "g", "chicken mince", "meat"), ing(0.5, "", "onion, grated", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "ground coriander", "spice"), ing(1, "tbsp", "parsley, chopped", "produce"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(60, "g", "white rice", "store"),
        ing(1, "tbsp", "tahini, to drizzle", "store"),
        ing(1, "tbsp", "breadcrumbs", "bakery")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Squeeze the grated onion dry, then mix it with the chicken mince, breadcrumbs, garlic, cumin, coriander, parsley, chilli flakes and seasoning.",
        "Shape into small freeform ovals.",
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
        "Stir in the turmeric for 30 seconds, then add the tamarind paste and stock and simmer for 5 minutes.",
        "Add the fish and green beans, and simmer gently for 6–8 minutes until the fish is just cooked through.",
        "Season to taste, then serve with the rice."
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
        "Season to taste, then add the beansprouts and chives, toss for 1–2 minutes more, and serve immediately."
      ]
    },
    {
      id: "d334", title: "Brazilian-Style Moqueca Fish Stew", tags: ["fish"], cuisine: "Brazil", protein: "fish",
      prep: 11, cook: 21,
      ingredients: [
        ing(150, "g", "white fish fillet, cubed", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(1, "", "tomato, chopped", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(1, "", "lime, juiced", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Marinate the fish briefly in half the lime juice and a pinch of salt.",
        "Soften the onion and pepper in the oil for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the tomato, chilli flakes and coconut milk, and simmer for 5 minutes.",
        "Add the fish and simmer gently for 5–6 minutes until just cooked through.",
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
        "Sear the steak for 3–4 minutes each side for medium (60°C in the middle, or 55°C for medium-rare), then rest for 5 minutes and slice.",
        "Meanwhile, melt the butter in a small pan and fry the onion for 8 minutes until soft and translucent.",
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
        "Sear the beef strips in a hot pan for 2 minutes until browned, then remove and set aside.",
        "Fry the onion and mushrooms in the same pan for 8 minutes until the onion is soft and the mushrooms golden.",
        "Add the garlic and paprika and fry for 30 seconds until fragrant, then pour in the stock and simmer for 3–4 minutes until reduced by about a third.",
        "Take the pan off the heat and stir in the soured cream and mustard, then return the beef and warm through gently for 2 minutes without boiling.",
        "Season to taste, then scatter with parsley and serve with the tagliatelle."
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
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(60, "g", "white rice", "store"),
        ing(1, "", "egg", "dairy"), ing(50, "g", "mushrooms, sliced", "produce"),
        ing(100, "ml", "beef stock", "store"), ing(1, "tsp", "soy sauce", "store"),
        ing(1, "tsp", "cornflour", "store"), ing(10, "g", "butter", "dairy")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Shape the beef mince into a patty, season and fry for 4–5 minutes each side until cooked through, then keep warm.",
        "In the same pan, fry the mushrooms in the butter for 2–3 minutes.",
        "Add the stock and soy sauce, thicken with a cornflour and water slurry, and simmer for 2–3 minutes into a gravy.",
        "Fry the egg sunny-side up in a separate pan.",
        "Serve the patty over the rice, topped with the fried egg and gravy."
      ]
    },
    {
      id: "d339", title: "Hawaiian-Style Spam Musubi Bowl", tags: ["quick"], cuisine: "Hawaii", protein: "pork",
      prep: 8, cook: 15,
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
        "Season to taste, then scatter with torn nori, sesame seeds and spring onion."
      ]
    },
    {
      id: "d340", title: "Uzbek-Style Lamb Shashlik Skewers", tags: ["quick"], cuisine: "Uzbekistan", protein: "lamb",
      prep: 9, cook: 12,
      ingredients: [
        ing(150, "g", "lamb leg steak, cut into 2.5cm cubes", "meat"), ing(0.5, "", "onion, grated", "produce"),
        ing(1, "tsp", "ground cumin", "spice"), ing(1, "tsp", "coriander seeds, crushed", "spice"),
        ing(0.5, "tsp", "paprika", "spice"), ing(1, "tbsp", "olive oil", "store"),
        ing(1, "", "flatbread", "bakery"), ing(0.25, "", "onion, thinly sliced, for serving", "produce"),
        ing(0.5, "tsp", "sumac", "spice")
      ],
      steps: [
        "Toss the lamb cubes with the grated onion, cumin, coriander seeds, paprika, oil and salt.",
        "Leave to marinate briefly while the grill or a griddle pan heats.",
        "Thread the lamb onto skewers and grill or griddle for 8–10 minutes, turning, until charred and cooked to preference, then rest for 2 minutes.",
        "Toss the sliced onion with the sumac.",
        "Serve the skewers with warm flatbread and the sumac onion."
      ]
    },
    {
      id: "d341", title: "Uzbek-Style Lagman Noodle Soup with Beef", tags: [], cuisine: "Uzbekistan", protein: "beef",
      prep: 11, cook: 21,
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
        "Soften the onion, carrot and pepper in the same pan for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the cumin and chilli flakes and fry for 30 seconds until fragrant, then add the tomato and stock and simmer for 10 minutes.",
        "Return the beef for 1–2 minutes to heat through.",
        "Meanwhile, cook the noodles according to the packet instructions, drain and divide into a bowl.",
        "Season to taste, then ladle the soup over the noodles and scatter with coriander."
      ]
    },
    {
      id: "d342", title: "Ghanaian-Style Red Red Bean Stew with Fried Plantain", tags: ["vegan", "vegetarian"], cuisine: "Ghana", protein: "plant-based",
      prep: 9, cook: 24,
      ingredients: [
        ing(400, "g", "tinned black-eyed beans", "store"), ing(1, "tbsp", "tomato purée", "store"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(0.25, "tsp", "chilli flakes", "spice"),
        ing(0.5, "tsp", "paprika", "spice"), ing(2, "tbsp", "vegetable oil", "store"),
        ing(1, "", "ripe plantain, sliced", "produce")
      ],
      steps: [
        "Soften the onion in half the oil for 8 minutes until soft and translucent, adding the garlic, ginger and chilli flakes for the last minute.",
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
      prep: 8, cook: 15,
      ingredients: [
        ing(80, "g", "Gruyère, grated", "dairy"), ing(40, "g", "Emmental, grated", "dairy"),
        ing(1, "tsp", "cornflour", "store"), ing(60, "ml", "white wine or apple juice", "store"),
        ing(1, "", "garlic clove, halved", "produce"), ing(1, "tsp", "lemon juice", "produce"),
        ing(null, "pinch", "ground nutmeg", "spice"), ing(1, "", "small potato, boiled", "produce"),
        ing(1, "slice", "crusty bread, cubed", "bakery")
      ],
      steps: [
        "Boil the potato in salted water for 12–15 minutes until tender, then drain and cut into chunks. Meanwhile, rub the inside of a small pan with the cut garlic clove.",
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
      id: "d346", title: "Kiwi-Style Fish and Chips", tags: ["fish"], cuisine: "New Zealand", protein: "fish",
      prep: 9, cook: 30,
      ingredients: [
        ing(150, "g", "white fish fillet", "meat"), ing(50, "g", "plain flour", "store"),
        ing(80, "ml", "sparkling water", "store"), ing(1, "", "baking potato, cut into chips", "produce"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(100, "ml", "vegetable oil, for shallow frying", "store"), ing(1, "tbsp", "malt vinegar", "store"),
        ing(1, "", "lemon wedge", "produce"), ing(1, "tbsp", "tartare sauce or mayonnaise", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the potato chips with the oil and seasoning, and oven-bake for about 25–30 minutes, turning once, until golden and crisp.",
        "Whisk the flour with the sparkling water into a light batter, and season.",
        "Dip the fish in the batter and shallow-fry in the frying oil for 4–5 minutes, turning once, until golden and cooked through.",
        "Drain and serve with the chips, malt vinegar, lemon wedge and tartare sauce."
      ]
    },
    {
      id: "d347", title: "New Zealand-Style Chicken and Kumara Hangi-Inspired Traybake", tags: [], cuisine: "New Zealand", protein: "chicken",
      prep: 9, cook: 40,
      ingredients: [
        ing(2, "", "chicken thighs, bone-in", "meat"), ing(1, "", "kumara or sweet potato, cubed", "produce"),
        ing(1, "", "carrot, chunked", "produce"), ing(1, "", "wedge cabbage", "produce"),
        ing(2, "", "garlic cloves, crushed", "produce"), ing(1, "tsp", "fresh thyme leaves", "produce"),
        ing(1, "tbsp", "olive oil", "store"), ing(2, "tbsp", "chicken stock", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Toss the chicken thighs, kumara and carrot with the oil, garlic, thyme and seasoning in a roasting tray.",
        "Roast for 30 minutes.",
        "Add the cabbage wedge and a splash of stock to the tray, and return to the oven for a further 10 minutes until the chicken is cooked through (75°C in the thickest part) and the vegetables are tender."
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
        "Heat the oil in a frying pan over medium-high heat and fry the chicken, prosciutto-side down first, for 2–3 minutes each side until golden and cooked through with no pink inside. Remove and keep warm.",
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
      id: "d351", title: "Pork with Gremolata (Milanese Ossobuco-Style)", tags: [], cuisine: "Italy", protein: "pork",
      prep: 13, cook: 25,
      ingredients: [
        ing(180, "g", "pork loin steak", "meat"), ing(1, "tbsp", "plain flour", "store"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(0.5, "", "carrot, diced", "produce"), ing(1, "", "celery stick, diced", "produce"),
        ing(100, "g", "tinned chopped tomatoes", "store"), ing(100, "ml", "chicken stock", "store"),
        ing(50, "ml", "white wine", "store"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "", "lemon, zested", "produce"), ing(1, "tbsp", "parsley, chopped", "produce")
      ],
      steps: [
        "Dust the pork in flour and season. Heat the oil in a pan over medium-high heat and brown the pork for 2 minutes each side, then remove.",
        "Add the onion, carrot and celery to the pan and soften for 8 minutes until soft and translucent.",
        "Add the tomatoes, stock and wine and simmer uncovered for 8 minutes. Return the pork, cover and cook gently for 6–8 minutes until just cooked through.",
        "Meanwhile, mix the garlic, lemon zest and parsley together for the gremolata.",
        "Scatter the gremolata over the pork just before serving."
      ]
    },
    {
      id: "d352", title: "Moroccan-Style Fish Tagine with Chermoula", tags: ["fish"], cuisine: "Morocco", protein: "fish",
      prep: 10, cook: 22,
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
        "Boil the potato slices for 5 minutes until nearly tender, then drain. Layer the potato and pepper in a small pan, pour over the chopped tomatoes and a splash of water, and simmer covered for 5 minutes.",
        "Lay the fish on top, spoon over any remaining chermoula, cover and simmer for 8–10 minutes more until the fish flakes easily.",
        "Season to taste, then scatter with olives and serve straight from the pan."
      ]
    },
    {
      id: "d353", title: "Moroccan Harira-Style Lentil & Chickpea Soup", tags: ["vegan", "vegetarian"], cuisine: "Morocco", protein: "plant-based",
      prep: 10, cook: 25,
      ingredients: [
        ing(40, "g", "red lentils", "store"), ing(100, "g", "tinned chickpeas, drained", "store"),
        ing(200, "g", "tinned chopped tomatoes", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "celery stick, diced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(0.5, "tsp", "ground ginger", "spice"), ing(0.5, "tsp", "ground cinnamon", "spice"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(300, "ml", "vegetable stock", "store"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(1, "", "lemon wedge", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Soften the onion and celery in a splash of oil over medium heat for 8 minutes until soft and translucent, then add the garlic and spices and cook for 1 minute.",
        "Add the lentils, chickpeas, tomatoes and stock. Bring to a simmer.",
        "Cook for 18–20 minutes, stirring occasionally, until the lentils are soft and the soup has thickened.",
        "Season to taste, then stir through the coriander and a squeeze of lemon before serving."
      ]
    },
    {
      id: "d354", title: "Moroccan-Style Grilled Lamb Chops (Mechoui-Spiced)", tags: ["quick"], cuisine: "Morocco", protein: "lamb",
      prep: 10, cook: 10,
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
        "Season to taste, then toss the tomato, cucumber, red onion and mint together and serve alongside the chops with the flatbread."
      ]
    },
    {
      id: "d355", title: "Thai-Style Tom Yum Soup with Chicken and Mushrooms", tags: ["quick", "spicy"], cuisine: "Thailand", protein: "chicken",
      prep: 10, cook: 12,
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
        "Add the chicken, mushrooms and cherry tomatoes, and simmer for 6–8 minutes until the chicken is cooked through with no pink inside.",
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
        "Season to taste, then spoon into lettuce leaves to serve."
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
        "Season to taste, then serve immediately."
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
        "Season to taste, then serve the chicken with the garlic sauce and warm flatbread."
      ]
    },
    {
      id: "d359", title: "Lebanese-Style Spiced Fish with Tahini (Samke Harra-Inspired)", tags: ["quick", "fish", "spicy"], cuisine: "Lebanon", protein: "fish",
      prep: 9, cook: 15,
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
        "In the same pan, soften the onion and pepper for 8 minutes until soft, adding the chilli and cumin for the last minute.",
        "Season to taste, then spoon the tahini sauce over the fish, top with the onion and pepper mixture, and scatter with pine nuts and coriander."
      ]
    },
    {
      id: "d360", title: "Lebanese-Style Fattoush Salad with Grilled Halloumi", tags: ["quick", "vegetarian"], cuisine: "Lebanon", protein: "plant-based",
      prep: 11, cook: 8,
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
        "Season to taste, then top with the halloumi and pitta chips to serve."
      ]
    },
    {
      id: "d361", title: "Filipino-Style Sinigang na Baboy (Sour Pork & Vegetable Soup)", tags: [], cuisine: "Philippines", protein: "pork",
      prep: 11, cook: 18,
      ingredients: [
        ing(150, "g", "pork tenderloin, thinly sliced", "meat"), ing(400, "ml", "water or light stock", "store"),
        ing(1, "tbsp", "tamarind paste", "store"), ing(0.5, "", "onion, sliced", "produce"),
        ing(0.5, "", "tomato, chopped", "produce"), ing(0.5, "", "radish (mooli), sliced", "produce"),
        ing(50, "g", "green beans, halved", "produce"), ing(1, "handful", "spinach", "produce"),
        ing(1, "tbsp", "fish sauce", "store"), ing(1, "", "green chilli, finely chopped", "produce")
      ],
      steps: [
        "Simmer the onion and tomato in the water or stock for 8 minutes.",
        "Stir in the tamarind paste until dissolved.",
        "Add the radish and green beans, and simmer for a further 6–8 minutes until tender.",
        "Add the pork and simmer for 3–4 minutes until cooked through. Stir in the spinach and chilli, and season with fish sauce.",
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
        "Season to taste, then plate the garlic rice, beef and fried egg together with the sliced tomato."
      ]
    },
    {
      id: "d363", title: "German-Style Chicken Jäger-Style with Creamy Mushroom Sauce", tags: ["quick"], cuisine: "Germany", protein: "chicken",
      prep: 9, cook: 18,
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
        "Heat the oil in a frying pan and fry the chicken for 4–5 minutes each side until golden and cooked through (75°C in the thickest part). Remove and keep warm.",
        "In the same pan, melt the butter and fry the onion and mushrooms for 8 minutes until the onion is soft and the mushrooms golden.",
        "Add the stock and simmer for 2–3 minutes until reduced by about a third, then take off the heat and stir in the soured cream.",
        "Season to taste, then spoon the mushroom sauce over the schnitzel and scatter with parsley."
      ]
    },
    {
      id: "d364", title: "German-Style Potato & Leek Soup (Kartoffelsuppe-Inspired)", tags: ["vegetarian"], cuisine: "Germany", protein: "plant-based",
      prep: 8, cook: 23,
      ingredients: [
        ing(200, "g", "potato, diced", "produce"), ing(1, "", "leek, sliced", "produce"),
        ing(15, "g", "butter", "dairy"), ing(400, "ml", "vegetable stock", "store"),
        ing(2, "tbsp", "milk or single cream", "dairy"), ing(1, "pinch", "nutmeg, grated", "spice"),
        ing(1, "tbsp", "chives, chopped", "produce")
      ],
      steps: [
        "Melt the butter in a pan and soften the leek for 8 minutes until soft and translucent.",
        "Add the potato and stock, bring to a simmer, and cook for 15–18 minutes until the potato is tender.",
        "Roughly mash some of the potato in the pan to thicken the soup slightly.",
        "Stir in the milk or cream and nutmeg, and season to taste.",
        "Top with chives to serve."
      ]
    },
    {
      id: "d365", title: "Polish-Style Bigos (Hunter's Stew) with Pork and Sausage", tags: [], cuisine: "Poland", protein: "pork",
      prep: 9, cook: 30,
      ingredients: [
        ing(100, "g", "pork loin steak, diced", "meat"), ing(60, "g", "smoked sausage, sliced", "meat"),
        ing(150, "g", "sauerkraut, drained", "store"), ing(80, "g", "white cabbage, shredded", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "bay leaf", "spice"),
        ing(1, "tsp", "paprika", "spice"), ing(1, "tbsp", "tomato puree", "store"),
        ing(100, "ml", "stock", "store"), ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat the oil in a pan and brown the pork and sausage for 2–3 minutes, then tip onto a plate.",
        "Add the onion and soften for 8 minutes until soft and translucent.",
        "Stir in the tomato purée and paprika and fry for 1 minute until the purée darkens, then add the sauerkraut, cabbage, bay leaf and stock.",
        "Cover and simmer for 18–20 minutes, stirring occasionally, until the cabbage is tender and the stew has thickened.",
        "Season to taste, then return the pork and sausage for the last 4–5 minutes until the pork is cooked through. Remove the bay leaf before serving."
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
      prep: 10, cook: 21,
      ingredients: [
        ing(2, "", "merguez sausages (about 120g)", "meat"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(200, "g", "tinned chopped tomatoes", "store"), ing(1, "tsp", "harissa paste", "store"),
        ing(0.5, "tsp", "ground cumin", "spice"), ing(2, "", "eggs", "dairy"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Fry the sliced merguez in a pan over medium heat for 4–5 minutes until browned. Remove and set aside.",
        "In the same pan, soften the pepper and onion for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the tomatoes, harissa and cumin, return the sausage to the pan, and simmer for 8–10 minutes.",
        "Make two wells in the sauce and crack in the eggs. Cover and cook for 4–5 minutes until the eggs are just set.",
        "Season to taste, then scatter with coriander and serve with crusty bread."
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
        "Season to taste, then serve the fish on top of the salad."
      ]
    },
    {
      id: "d369", title: "Singapore-Style Bak Kut Teh (Peppery Pork Rib Soup)", tags: [], cuisine: "Singapore", protein: "pork",
      prep: 8, cook: 75,
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
        "Bring to a simmer, cover, and cook gently for 60–75 minutes until the pork is very tender, skimming occasionally and topping up with water if needed.",
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
        "Season to taste, then add the beansprouts and spring onion, toss for 1 minute until just wilted, and serve immediately."
      ]
    },
    {
      id: "d371", title: "Peruvian-Style Fish Ceviche with Sweet Potato and Corn", tags: ["quick", "fish"], cuisine: "Peru", protein: "fish",
      prep: 10, cook: 12,
      ingredients: [
        ing(150, "g", "firm white fish fillet (sea bass, bream or cod), diced", "meat"), ing(4, "", "limes, juiced", "produce"),
        ing(0.25, "", "red onion, very thinly sliced", "produce"), ing(1, "", "red chilli, finely sliced", "produce"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(1, "", "small sweet potato, peeled and cubed", "produce"),
        ing(0.5, "", "corn on the cob", "produce"), ing(1, "pinch", "salt", "spice")
      ],
      steps: [
        "Use fish sold for eating raw, or fish that has been frozen first (check the label). The lime juice firms the fish but does not cook it.",
        "Boil the sweet potato and corn in salted water for 10–12 minutes until tender, then drain and cool slightly.",
        "Toss the diced fish with the lime juice, red onion, chilli and salt.",
        "Leave to marinate in the fridge for 8–10 minutes, until the fish turns opaque and firms up.",
        "Stir through the coriander and serve with the sweet potato and corn alongside."
      ]
    },
    {
      id: "d372", title: "Peruvian-Style Beef Anticuchos with Aji Panca", tags: ["quick", "spicy"], cuisine: "Peru", protein: "beef",
      prep: 8, cook: 20,
      ingredients: [
        ing(150, "g", "beef rump or sirloin, cubed", "meat"), ing(1, "tbsp", "aji panca paste (or smoked paprika and chilli paste)", "store"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "tbsp", "red wine vinegar", "store"), ing(1, "tbsp", "olive oil", "store"),
        ing(0.5, "", "corn on the cob, halved", "produce"), ing(1, "", "small potato, boiled and sliced", "produce")
      ],
      steps: [
        "Boil the potato and corn in salted water for 12–15 minutes until a knife slides easily into the potato, then drain and slice the potato.",
        "Meanwhile, mix the aji panca paste (or paprika and chilli paste), garlic, cumin, vinegar and oil into a marinade, coat the beef and leave for 5 minutes.",
        "Thread the beef onto skewers.",
        "Grill or fry over high heat for 2–3 minutes each side until charred and cooked to your liking, then rest for 2 minutes.",
        "Serve the skewers with the corn and potato."
      ]
    },
    {
      id: "d373", title: "Austrian-Style Beef Goulash (Saftgulasch)", tags: [], cuisine: "Austria", protein: "beef",
      prep: 9, cook: 22,
      ingredients: [
        ing(150, "g", "beef rump steak, cut into strips", "meat"), ing(1, "", "onion, sliced", "produce"),
        ing(1, "tbsp", "sweet paprika", "spice"), ing(0.5, "tsp", "caraway seeds", "spice"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(200, "ml", "beef stock", "store"), ing(0.5, "tsp", "dried marjoram", "spice"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "crusty bread roll, to serve", "bakery")
      ],
      steps: [
        "Heat the oil over high heat and sear the beef for 1–2 minutes until browned. Tip onto a plate.",
        "Lower the heat, add the onion and cook for 10 minutes until soft and golden.",
        "Stir in the tomato purée and fry for 1 minute until it darkens, then add the paprika, caraway and garlic for 30 seconds before pouring in the stock.",
        "Simmer uncovered for 8–10 minutes until reduced and glossy.",
        "Season to taste, then return the beef and its juices for 1–2 minutes, stir through the marjoram and serve with crusty bread."
      ]
    },
    {
      id: "d374", title: "Austrian-Style Mushroom & Herb Dumpling (Semmelknödel) in Mushroom Sauce", tags: ["vegetarian"], cuisine: "Austria", protein: "plant-based",
      prep: 10, cook: 21,
      ingredients: [
        ing(100, "g", "stale bread or bread roll, cubed", "bakery"), ing(80, "ml", "warm milk", "dairy"),
        ing(1, "", "egg", "dairy"), ing(0.25, "", "onion, finely chopped", "produce"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(100, "g", "chestnut mushrooms, sliced", "produce"),
        ing(150, "ml", "vegetable stock", "store"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(15, "g", "butter", "dairy"), ing(1, "tbsp", "chives, chopped", "produce")
      ],
      steps: [
        "Soak the bread cubes in the warm milk for 5 minutes.",
        "Fry the onion in a little butter for 8 minutes until soft and translucent, then mix into the bread with the egg and parsley. Shape into one large dumpling.",
        "Lower the dumpling into a pan of gently simmering salted water, cover, and cook for 15 minutes until firm.",
        "Meanwhile, fry the mushrooms in the remaining butter for 4–5 minutes until golden, add the stock and simmer for 2–3 minutes, then take off the heat and stir in the soured cream.",
        "Slice the dumpling and serve with the mushroom sauce, scattered with chives."
      ]
    },
    {
      id: "d375", title: "Georgian-Style Kharcho Soup (Spiced Beef & Rice Soup)", tags: [], cuisine: "Georgia", protein: "beef",
      prep: 10, cook: 29,
      ingredients: [
        ing(120, "g", "beef mince", "meat"), ing(40, "g", "rice", "store"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(150, "g", "tinned chopped tomatoes", "store"), ing(20, "g", "walnuts, crushed", "store"),
        ing(400, "ml", "beef stock", "store"), ing(0.5, "tsp", "ground coriander", "spice"),
        ing(0.5, "tsp", "dried thyme", "spice"), ing(0.5, "tsp", "chilli flakes", "spice"),
        ing(1, "tbsp", "coriander, chopped", "produce")
      ],
      steps: [
        "Brown the mince in a pan over medium-high heat for 4–5 minutes, breaking it up as it cooks.",
        "Add the onion and soften for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the ground coriander, thyme and chilli flakes for 30 seconds until fragrant, then add the tomatoes and stock and simmer for 10 minutes.",
        "Add the rice and simmer for a further 12–15 minutes until the rice is tender.",
        "Season to taste, then stir in the crushed walnuts and finish with fresh coriander."
      ]
    },
    {
      id: "d376", title: "Georgian-Style Lobio (Spiced Bean Stew) with Cornbread", tags: ["vegan", "vegetarian"], cuisine: "Georgia", protein: "plant-based",
      prep: 8, cook: 18,
      ingredients: [
        ing(200, "g", "tinned red kidney beans, drained", "store"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, chopped", "produce"), ing(20, "g", "walnuts, crushed", "store"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(0.5, "tsp", "ground fenugreek", "spice"),
        ing(0.5, "tsp", "ground coriander", "spice"), ing(1, "tsp", "red wine vinegar", "store"),
        ing(100, "ml", "vegetable stock", "store"), ing(1, "", "slice cornbread or flatbread, to serve", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Soften the onion in a splash of oil for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the beans and stock, and simmer for 8–10 minutes.",
        "Mash a few of the beans against the side of the pan to thicken the stew slightly.",
        "Stir in the crushed walnuts, fenugreek, ground coriander and vinegar.",
        "Season to taste, then finish with fresh coriander and serve with cornbread or flatbread."
      ]
    },
    {
      id: "d377", title: "Colombian-Style Crispy Pork with Rice and Avocado (Chicharrón)", tags: [], cuisine: "Colombia", protein: "pork",
      prep: 10, cook: 15,
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
      prep: 8, cook: 21,
      ingredients: [
        ing(160, "g", "white fish fillet", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(0.5, "", "red pepper, sliced", "produce"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(0.5, "tsp", "paprika", "spice"), ing(1, "", "lime, juiced", "produce"),
        ing(1, "tbsp", "coriander, chopped", "produce"), ing(150, "g", "cooked rice, to serve", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Soften the onion and pepper in a splash of oil for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the cumin and paprika and cook for 1 minute.",
        "Pour in the coconut milk and simmer for 5 minutes.",
        "Add the fish, cover, and cook gently for 8–10 minutes until it flakes easily.",
        "Season to taste, then finish with lime juice and coriander, and serve over the rice."
      ]
    },
    {
      id: "d379", title: "Kenyan-Style Grilled Spiced Lamb (Nyama Choma-Inspired)", tags: ["quick"], cuisine: "Kenya", protein: "lamb",
      prep: 11, cook: 10,
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
        "Marinate for 5 minutes, then grill or fry over high heat for 3–4 minutes each side until charred and cooked to your liking. Rest for 2 minutes.",
        "Meanwhile, toss the tomato, red onion, chilli, coriander and remaining lemon juice for a kachumbari-style salad.",
        "Season to taste, then serve the lamb with the salad."
      ]
    },
    {
      id: "d380", title: "Kenyan-Style Coastal Coconut Fish Curry (Swahili-Style)", tags: ["fish"], cuisine: "Kenya", protein: "fish",
      prep: 11, cook: 19,
      ingredients: [
        ing(160, "g", "white fish fillet", "meat"), ing(150, "ml", "coconut milk", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, chopped", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "", "tomato, chopped", "produce"),
        ing(0.5, "tsp", "ground turmeric", "spice"), ing(1, "tsp", "curry powder", "spice"),
        ing(1, "", "green chilli, sliced", "produce"), ing(1, "tbsp", "coriander, chopped", "produce"),
        ing(150, "g", "cooked rice, to serve", "store"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Soften the onion in a splash of oil for 8 minutes until soft and translucent, adding the garlic and ginger for the last minute.",
        "Add the tomato, turmeric, curry powder and chilli, and cook for 2–3 minutes.",
        "Pour in the coconut milk and simmer for 5 minutes.",
        "Add the fish, cover, and cook gently for 8 minutes until it flakes easily.",
        "Season to taste, then scatter with coriander and serve with rice."
      ]
    },
    {
      id: "d381", title: "Finnish-Style Creamy Mushroom & Barley Stew (Sienimuhennos-Inspired)", tags: ["quick", "vegetarian"], cuisine: "Finland", protein: "plant-based",
      prep: 8, cook: 14,
      ingredients: [
        ing(150, "g", "cooked pearl barley (pouch)", "store"), ing(150, "g", "chestnut mushrooms, sliced", "produce"),
        ing(0.5, "", "onion, diced", "produce"), ing(15, "g", "butter", "dairy"),
        ing(100, "ml", "vegetable stock", "store"), ing(2, "tbsp", "soured cream", "dairy"),
        ing(1, "pinch", "ground allspice", "spice"), ing(1, "tbsp", "dill, chopped", "produce")
      ],
      steps: [
        "Melt the butter in a pan and fry the onion and mushrooms for 10 minutes until soft and golden.",
        "Add the barley and stock, and simmer for 4–5 minutes until warmed through and slightly thickened.",
        "Stir in the soured cream and allspice.",
        "Season to taste, then finish with dill and serve."
      ]
    },
    {
      id: "d382", title: "Finnish-Style Pork & Swede Bake (Lanttulaatikko-Inspired)", tags: [], cuisine: "Finland", protein: "pork",
      prep: 9, cook: 35,
      ingredients: [
        ing(250, "g", "swede, peeled and cubed", "produce"), ing(120, "g", "pork mince", "meat"),
        ing(0.5, "", "onion, diced", "produce"), ing(1, "", "egg", "dairy"),
        ing(15, "g", "butter", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(1, "pinch", "nutmeg, grated", "spice"), ing(2, "tbsp", "breadcrumbs", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C). Boil the swede (in 2 cm cubes) in salted water for 18–20 minutes until tender, then drain.",
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
        "Season to taste, then serve the salmon over the rice with the green beans, spooning over any extra glaze, with the lemon wedge for squeezing."
      ]
    },
    {
      id: "d385", title: "Norwegian-Style Fårikål (Lamb and Cabbage Stew)", tags: [], cuisine: "Norway", protein: "lamb",
      prep: 9, cook: 22,
      ingredients: [
        ing(180, "g", "lamb leg steak, cut into 2cm cubes", "meat"), ing(200, "g", "white cabbage, cut into wedges", "produce"),
        ing(1, "tsp", "whole black peppercorns", "spice"), ing(1, "", "bay leaf", "spice"),
        ing(300, "ml", "chicken or lamb stock", "store"), ing(15, "g", "butter", "dairy"),
        ing(1, "tsp", "plain flour", "store"), ing(200, "g", "potatoes, peeled and quartered", "produce"),
        ing(null, "to taste", "salt", "spice")
      ],
      steps: [
        "Boil the potatoes in salted water for 15–18 minutes until tender.",
        "Meanwhile, put the cabbage wedges, peppercorns and bay leaf in a small saucepan, pour over the stock, cover and simmer for 12–15 minutes until the cabbage is tender.",
        "While the cabbage cooks, sear the lamb in a hot pan with a little of the butter for 2–3 minutes until browned but still pink inside, then add it to the cabbage for the last 2 minutes.",
        "Melt the rest of the butter in the lamb pan, stir in the flour to make a paste, then whisk in a ladleful of the cooking liquid; stir this back into the stew to thicken slightly.",
        "Season with salt and serve the lamb and cabbage with the boiled potatoes alongside."
      ]
    },
    {
      id: "d386", title: "Norwegian-Style Creamy Fish Soup (Fiskesuppe)", tags: ["fish"], cuisine: "Norway", protein: "fish",
      prep: 10, cook: 23,
      ingredients: [
        ing(150, "g", "skinless cod or haddock fillet, cut into chunks", "meat"), ing(1, "", "small carrot, diced", "produce"),
        ing(0.5, "", "leek, sliced", "produce"), ing(1, "", "small potato, diced", "produce"),
        ing(400, "ml", "fish or vegetable stock", "store"), ing(100, "ml", "double cream", "dairy"),
        ing(15, "g", "butter", "dairy"), ing(1, "tbsp", "fresh dill, chopped", "produce"),
        ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Melt the butter in a saucepan, add the carrot, leek and potato, and cook gently for 8 minutes until the leek is soft.",
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
        "Meanwhile, heat the oil in a frying pan and cook the onion for 8 minutes until soft and translucent.",
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
        "Season to taste, then cut in half and serve with the gherkin on the side."
      ]
    },
    {
      id: "d389", title: "Singapore-Style Hainanese Chicken Rice with Ginger-Chilli Sauce", tags: [], cuisine: "Singapore", protein: "chicken",
      prep: 10, cook: 32,
      ingredients: [
        ing(180, "g", "chicken thigh fillets", "meat"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(20, "g", "fresh ginger, finely grated", "produce"), ing(1, "", "spring onion, sliced", "produce"),
        ing(75, "g", "jasmine rice", "store"), ing(300, "ml", "chicken stock", "store"),
        ing(1, "tsp", "sesame oil", "store"), ing(1, "tbsp", "light soy sauce", "store"),
        ing(1, "", "red chilli, finely chopped", "produce"), ing(0.5, "", "lime", "produce"),
        ing(50, "g", "cucumber, sliced", "produce")
      ],
      steps: [
        "Put the chicken, half the ginger (bashed) and the garlic into a small pan, cover with the stock and bring to a gentle simmer. Poach for 15–18 minutes until cooked through (75°C in the thickest part), then remove the chicken and rest.",
        "Skim a little fat from the poaching liquid and use it to fry the rice for 1 minute, then add 150 ml of the hot poaching liquid, cover and cook gently for 12–15 minutes until tender. Keep the rest of the liquid hot to serve as a little broth.",
        "Meanwhile, finely grate the remaining ginger, mix with the chilli, sesame oil, soy sauce and a squeeze of lime to make the dipping sauce.",
        "Season to taste, then slice the chicken and serve on the rice with the cucumber, spring onion and dipping sauce on the side."
      ]
    },
    {
      id: "d390", title: "Peruvian-Style Aji de Gallina (Creamy Spiced Chicken)", tags: [], cuisine: "Peru", protein: "chicken",
      prep: 9, cook: 33,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "aji amarillo paste", "store"),
        ing(15, "g", "walnuts, crushed", "store"), ing(1, "", "slice white bread, crusts removed and torn", "bakery"),
        ing(100, "ml", "milk", "dairy"), ing(50, "ml", "chicken stock", "store"),
        ing(15, "g", "hard cheese, grated", "dairy"), ing(75, "g", "rice", "store"),
        ing(3, "", "black olives", "store"), ing(0.5, "", "boiled egg", "dairy"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Poach the chicken breast in gently simmering water for 12–15 minutes until cooked through (75°C in the thickest part), then shred with two forks.",
        "Meanwhile, cook the rice according to packet instructions, and boil the egg for 8 minutes, then cool and peel.",
        "Soak the torn bread in the milk for a few minutes to soften.",
        "Heat a little oil in a pan and fry the onion for 8 minutes until soft and translucent, adding the garlic for the last minute, then stir in the aji amarillo paste and cook for 1 minute.",
        "Add the soaked bread and milk, the stock, crushed walnuts and cheese, and simmer for 5 minutes, stirring, until thickened into a smooth sauce.",
        "Stir in the shredded chicken and warm through for 3–4 minutes.",
        "Season to taste, then serve over the rice, topped with the olives and boiled egg."
      ]
    },
    {
      id: "d391", title: "Australian-Style Beef & Gravy Pie with Mash and Peas", tags: [], cuisine: "Australia", protein: "beef",
      prep: 9, cook: 30,
      ingredients: [
        ing(150, "g", "beef rump steak, diced", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(200, "ml", "beef stock", "store"), ing(1, "tsp", "Worcestershire sauce", "store"),
        ing(1, "tsp", "tomato puree", "store"), ing(1, "tsp", "plain flour", "store"),
        ing(80, "g", "ready-rolled puff pastry", "bakery"), ing(200, "g", "potatoes, peeled and chopped", "produce"),
        ing(15, "g", "butter", "dairy"), ing(2, "tbsp", "milk", "dairy"),
        ing(60, "g", "frozen peas", "frozen")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C). Cut the puff pastry into a small lid shape and bake on a lined tray for 12–15 minutes until golden and puffed; set aside.",
        "Meanwhile, boil the potatoes for the mash for 15–18 minutes until tender.",
        "Heat a little oil in a saucepan, sear the beef over high heat for 1–2 minutes, then tip onto a plate. Add the onion and cook for 8 minutes until soft and translucent.",
        "Stir in the flour and tomato purée and cook for 1 minute until the purée darkens, then add the Worcestershire sauce and stock. Simmer for 8–10 minutes until thickened, then return the beef for 1–2 minutes.",
        "Cook the peas in boiling water for 2–3 minutes, then drain. Mash the potatoes with the butter and milk and season.",
        "Spoon the beef and gravy over the mash, top with the pastry lid, and serve with the peas."
      ]
    },
    {
      id: "d392", title: "Austrian-Style Zwiebelrostbraten (Onion-Smothered Beef Steak)", tags: ["quick"], cuisine: "Austria", protein: "beef",
      prep: 8, cook: 22,
      ingredients: [
        ing(150, "g", "beef sirloin or rump steak", "meat"), ing(1, "", "large onion, thinly sliced", "produce"),
        ing(1, "tbsp", "plain flour", "store"), ing(15, "g", "butter", "dairy"),
        ing(100, "ml", "beef stock", "store"), ing(0.5, "tsp", "paprika", "spice"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(200, "g", "new potatoes, halved", "produce")
      ],
      steps: [
        "Boil the new potatoes in salted water for 15–18 minutes until tender.",
        "Toss the sliced onion in the flour. Heat the oil in a frying pan and fry the onions for 10 minutes, stirring occasionally, until golden and crisp; remove and set aside.",
        "Season the steak, add to the same pan and fry for 2–3 minutes each side (55°C in the middle for medium-rare), then remove and rest for 3 minutes.",
        "Add the butter and paprika to the pan, pour in the stock and simmer for 2 minutes, scraping up any bits, to make a quick gravy.",
        "Slice the steak, spoon over the gravy, and pile the crispy onions on top. Serve with the potatoes."
      ]
    },
    {
      id: "d393", title: "South African-Style Bunny Chow with Spiced Lamb Curry", tags: ["spicy"], cuisine: "South Africa", protein: "lamb",
      prep: 10, cook: 29,
      ingredients: [
        ing(150, "g", "lamb mince", "meat"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "fresh ginger, grated", "produce"),
        ing(1.5, "tbsp", "curry powder", "spice"), ing(0.5, "tsp", "ground turmeric", "spice"),
        ing(100, "g", "tinned chopped tomatoes", "store"), ing(1, "", "small potato, cut into 1cm dice", "produce"),
        ing(100, "ml", "lamb or vegetable stock", "store"), ing(1, "", "small crusty bread roll", "bakery"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat a little oil in a saucepan and fry the onion for 8 minutes until soft and translucent. Add the garlic, ginger, curry powder and turmeric, and cook for 1 minute.",
        "Add the lamb mince and brown for 4–5 minutes, breaking it up.",
        "Stir in the potato and stock, cover and simmer for 8 minutes, then add the tomatoes and simmer uncovered for 8–10 minutes until the potato is tender and the sauce has thickened.",
        "Slice the top off the bread roll and hollow out most of the middle to make a bowl.",
        "Season to taste, then spoon the curry into the hollowed bread, scatter with coriander, and serve with the reserved bread for dipping."
      ]
    },
    {
      id: "d394", title: "Georgian-Style Chakapuli (Lamb and Herb Stew)", tags: [], cuisine: "Georgia", protein: "lamb",
      prep: 11, cook: 16,
      ingredients: [
        ing(180, "g", "lamb leg steak, cut into 2cm cubes", "meat"), ing(3, "", "spring onions, chopped", "produce"),
        ing(2, "", "garlic cloves, sliced", "produce"), ing(1, "tbsp", "fresh tarragon, chopped", "produce"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce"), ing(1, "tbsp", "fresh dill, chopped", "produce"),
        ing(2, "tbsp", "white wine vinegar", "store"), ing(1, "tsp", "plum jam", "store"),
        ing(200, "ml", "vegetable or lamb stock", "store"), ing(1, "", "bay leaf", "spice"),
        ing(0.5, "", "green chilli, sliced", "produce"), ing(1, "", "crusty bread roll", "bakery"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat a splash of oil in a saucepan over high heat and sear the lamb for 2–3 minutes until browned but still pink inside. Tip onto a plate.",
        "Add the spring onions and garlic and cook for 2 minutes.",
        "Stir in the vinegar, plum jam, bay leaf, chilli and stock and simmer for 6–8 minutes until reduced by about a third.",
        "Return the lamb and its juices with the tarragon, coriander and dill, and simmer for 2 minutes. Season to taste.",
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
      prep: 10, cook: 25,
      ingredients: [
        ing(150, "g", "chicken breast", "meat"), ing(100, "g", "waxy potato, diced", "produce"),
        ing(100, "g", "floury potato, diced", "produce"), ing(80, "g", "sweetcorn kernels", "frozen"),
        ing(400, "ml", "chicken stock", "store"), ing(1, "", "spring onion, sliced", "produce"),
        ing(0.5, "tsp", "dried oregano", "spice"), ing(1, "", "garlic clove, finely chopped", "produce"),
        ing(1, "tsp", "capers", "store"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(0.25, "", "avocado, sliced", "produce")
      ],
      steps: [
        "Put the chicken, stock, garlic and half the diced potato into a pan, bring to a simmer and cook for 12–15 minutes until the chicken is cooked through (75°C in the thickest part).",
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
      prep: 10, cook: 34,
      ingredients: [
        ing(150, "g", "chicken thigh fillets, diced", "meat"), ing(75, "g", "basmati rice", "store"),
        ing(1, "", "onion, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "cumin seeds", "spice"),
        ing(3, "", "whole cloves", "spice"), ing(1, "", "cinnamon stick", "spice"),
        ing(3, "", "green cardamom pods", "spice"), ing(150, "ml", "chicken stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "tbsp", "fresh coriander, chopped", "produce")
      ],
      steps: [
        "Heat the oil in a saucepan and fry the onion for 10 minutes until soft and golden.",
        "Add the garlic, ginger, cumin seeds, cloves, cinnamon and cardamom, and cook for 1 minute until fragrant.",
        "Add the chicken and cook for 4–5 minutes until browned.",
        "Stir in the rice to coat in the spices, then pour in the stock. Bring to the boil, cover, reduce the heat and simmer for 15 minutes until the rice is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Season to taste, then fluff with a fork and scatter with coriander to serve."
      ]
    },
    {
      id: "d399", title: "Belgian-Style Flemish Meatballs in Spiced Beer Gravy (Vlaamse Balletjes)", tags: [], cuisine: "Belgium", protein: "beef",
      prep: 9, cook: 30,
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
        "Add the remaining onion to the pan and cook for 8 minutes until soft and translucent, stir in the flour, then pour in the beer, stock, sugar and bay leaf.",
        "Return the meatballs to the pan, cover and simmer for 12–15 minutes until cooked through and the sauce has thickened slightly.",
        "Season to taste and serve the meatballs and gravy over the mash."
      ]
    },
    {
      id: "d400", title: "Finnish-Style Karjalanpaisti (Beef and Pork Stew)", tags: [], cuisine: "Finland", protein: "beef",
      prep: 9, cook: 27,
      ingredients: [
        ing(90, "g", "beef rump steak, cut into 2cm cubes", "meat"), ing(90, "g", "pork loin steak, cut into 2cm cubes", "meat"),
        ing(1, "", "onion, sliced", "produce"), ing(1, "", "carrot, sliced", "produce"),
        ing(1, "tsp", "whole black peppercorns", "spice"), ing(1, "", "bay leaf", "spice"),
        ing(250, "ml", "beef stock", "store"), ing(15, "g", "butter", "dairy"),
        ing(150, "g", "potatoes, halved", "produce"), ing(null, "to taste", "salt", "spice")
      ],
      steps: [
        "Boil the potatoes in salted water for 15–18 minutes until tender.",
        "Meanwhile, heat the butter in a saucepan over high heat and sear the beef and pork for 2–3 minutes until browned. Tip onto a plate.",
        "Add the onion and carrot and cook for 8 minutes until soft and translucent.",
        "Add the peppercorns, bay leaf and stock and simmer uncovered for 10 minutes until the carrot is tender and the liquid has reduced a little.",
        "Return the meat and its juices and simmer for 2–3 minutes until the pork is cooked through. Season with salt, remove the bay leaf and serve with the potatoes."
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
      prep: 10, cook: 20,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.25, "", "onion, grated", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tsp", "ground cumin", "spice"),
        ing(0.25, "tsp", "ground cinnamon", "spice"), ing(1, "tbsp", "fresh parsley, chopped", "produce"),
        ing(1, "tbsp", "fresh coriander, chopped", "produce"), ing(200, "g", "tinned chopped tomatoes", "store"),
        ing(0.5, "tsp", "paprika", "spice"), ing(1, "", "egg", "dairy"),
        ing(1, "tbsp", "olive oil", "store"), ing(1, "", "crusty bread roll", "bakery")
      ],
      steps: [
        "Mix the beef mince with ¼ tsp salt, the grated onion, garlic, cumin, cinnamon and half the herbs. Season and shape into small meatballs.",
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
        "Heat the oil in a wok over high heat and stir-fry the chicken for 3–4 minutes until cooked through with no pink inside.",
        "Push to one side, crack in the egg and scramble briefly, then add the garlic and noodles and toss together.",
        "Pour in the sauce, add the beansprouts and spring onion, and toss for 1–2 minutes until well coated and hot.",
        "Season to taste, then serve scattered with the crushed peanuts, chilli flakes, and the lime wedge."
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
        "Add the beef slices and simmer for 1–2 minutes until no longer pink, skimming any froth.",
        "Spoon the hot rice into a bowl and ladle over the beef, onion and sauce.",
        "Season to taste, then top with the spring onion and pickled ginger to serve."
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
        "Season to taste, then toss the carrot and cucumber briefly through the dipping sauce, then arrange the noodles, lettuce, herbs and pork patties in a bowl, and spoon over the dressing."
      ]
    },
    {
      id: "d406", title: "Sri Lankan-Style Chicken Kottu Roti with Vegetables", tags: ["spicy", "quick"], cuisine: "Sri Lanka", protein: "chicken",
      prep: 13, cook: 12,
      ingredients: [
        ing(2, "", "shop-bought roti or paratha, sliced into strips", "bakery"), ing(130, "g", "chicken breast, diced", "meat"),
        ing(0.5, "", "onion, sliced", "produce"), ing(0.5, "", "red pepper, sliced", "produce"),
        ing(0.5, "", "carrot, sliced", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(1, "tsp", "fresh ginger, grated", "produce"), ing(1, "tsp", "curry powder", "spice"),
        ing(1, "tbsp", "soy sauce", "store"), ing(1, "", "egg", "dairy"),
        ing(2, "tbsp", "vegetable oil", "store"), ing(1, "", "green chilli, sliced", "produce")
      ],
      steps: [
        "Heat 1 tbsp of the oil in a wok or large pan and stir-fry the chicken for 4–5 minutes until browned and cooked through with no pink inside; remove and set aside.",
        "Add the remaining oil, then the onion, pepper, carrot, garlic, ginger and chilli, and stir-fry for 3–4 minutes until softened.",
        "Push the vegetables aside, crack in the egg and scramble briefly.",
        "Add the roti strips, curry powder, soy sauce and the cooked chicken to the pan, and toss everything together vigorously for 2–3 minutes until well combined and hot through.",
        "Season to taste, then serve hot, with extra chilli or a wedge of lime if you like."
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
      prep: 13, cook: 25,
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
        "Add the sweet potato and simmer for a further 10–12 minutes until the chicken is cooked through (75°C in the thickest part) and the sweet potato is tender.",
        "Season to taste with salt.",
        "Ladle into a bowl and scatter with the spring onion and coriander to serve."
      ]
    },
    {
      id: "d409", title: "Filipino-Style Pancit Bihon (Stir-Fried Rice Noodles with Chicken and Vegetables)", tags: ["quick"], cuisine: "Philippines", protein: "chicken",
      prep: 11, cook: 12,
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
        "Heat the oil in a wok and stir-fry the chicken for 3–4 minutes until cooked through with no pink inside.",
        "Add the garlic, carrot, cabbage and green beans, and stir-fry for 2–3 minutes.",
        "Pour in the soy sauce and stock, add the drained noodles, and toss everything together for 2–3 minutes until the noodles have absorbed the liquid and are tender.",
        "Season to taste, then scatter with the spring onion and serve with the lime wedge."
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
        "Heat 1 tbsp of the oil in a frying pan and fry the diced potato (cut into 1 cm dice), covered for the first 5 minutes, for 12–15 minutes, turning occasionally, until golden and cooked through; remove and set aside.",
        "Add the remaining oil to the pan and fry the marinated pork for 5–6 minutes until browned and cooked through.",
        "Pour in the wine and let it bubble for 1–2 minutes, scraping up any bits from the pan.",
        "Return the potatoes to the pan, toss everything together, and stir through the chopped coriander.",
        "Season to taste, then serve with the lemon wedge."
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
        "Boil the egg for 8 minutes, then cool and peel. Put the chicken, stock, turmeric, garlic, ginger and lemongrass into a saucepan, bring to a simmer and cook for 15 minutes until the chicken is cooked through (75°C in the thickest part).",
        "Remove the chicken, shred it, and return it to the pan.",
        "Meanwhile, soak the noodles in boiled water for 4–5 minutes until tender, then drain and place in a bowl.",
        "Ladle the hot soup and shredded chicken over the noodles.",
        "Season to taste, then top with the boiled egg, beansprouts and spring onion, and serve with the lime wedge and chilli sauce on the side."
      ]
    },
    {
      id: "d412", title: "Kiwi-Style Mince and Cheese Pie", tags: [], cuisine: "New Zealand", protein: "beef",
      prep: 8, cook: 27,
      ingredients: [
        ing(150, "g", "beef mince", "meat"), ing(0.5, "", "onion, finely chopped", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(1, "tsp", "Worcestershire sauce", "store"), ing(100, "ml", "beef stock", "store"),
        ing(1, "tsp", "cornflour", "store"), ing(40, "g", "mature cheddar, grated", "dairy"),
        ing(0.3, "sheet", "ready-rolled puff pastry", "bakery"), ing(1, "", "egg, beaten", "dairy"),
        ing(null, "pinch", "salt and pepper", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Preheat the oven to 200°C (fan 180°C).",
        "Heat a little oil in a pan and fry the onion for 8 minutes until soft and translucent, adding the garlic for the last minute, then add the mince and brown well.",
        "Stir in the tomato purée and fry for 1 minute until it darkens, then add the Worcestershire sauce and stock and simmer for 8–10 minutes until thickened. Mix the cornflour with a splash of water, stir in to thicken further, then season and stir through the cheddar.",
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
        "Preheat the oven to 200°C (fan 180°C). Toss the kumara wedges in 1 tablespoon of the oil and a pinch of salt, and roast for 20 minutes, turning halfway, until tender and golden.",
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
        "Season to taste, then drain briefly on kitchen paper and serve with the lemon wedge."
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
        "Preheat the oven to 200°C (fan 180°C).",
        "Layer the potato, onion and chopped anchovies in a small baking dish, seasoning with pepper as you go (the anchovies are salty, so no extra salt is needed).",
        "Pour the cream over, dot with the butter and scatter the breadcrumbs on top.",
        "Bake for 35–38 minutes until the potatoes are tender and the top is golden."
      ]
    },
    {
      id: "d417", title: "Argentinian-Style Locro Corn, Bean and Pork Stew", tags: [], cuisine: "Argentina", protein: "pork",
      prep: 11, cook: 31,
      ingredients: [
        ing(100, "g", "pork loin steak, diced small", "meat"), ing(40, "g", "chorizo, sliced", "meat"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(100, "g", "butternut squash, diced", "produce"), ing(100, "g", "tinned sweetcorn", "store"),
        ing(100, "g", "tinned butter beans, drained", "store"), ing(200, "ml", "chicken stock", "store"),
        ing(1, "tsp", "smoked paprika", "spice"), ing(0.5, "tsp", "ground cumin", "spice"),
        ing(1, "", "spring onion, sliced", "produce"), ing(null, "pinch", "chilli flakes", "spice")
      ],
      steps: [
        "Heat a splash of oil in a pan and brown the pork and chorizo for 2–3 minutes, then tip onto a plate.",
        "Add the onion and soften for 8 minutes until soft and translucent, adding the garlic for the last minute, then stir in the paprika and cumin and cook for 30 seconds.",
        "Add the squash, sweetcorn, beans and stock. Simmer for 20–25 minutes until the squash is tender and the stew has thickened.",
        "Return the pork and chorizo for the last 4–5 minutes until the pork is cooked through. Season to taste and scatter with spring onion and chilli flakes to serve."
      ]
    },
    {
      id: "d418", title: "Russian-Style Beef and Cabbage Solyanka Soup", tags: [], cuisine: "Russia", protein: "beef",
      prep: 10, cook: 20,
      ingredients: [
        ing(120, "g", "beef sirloin, thinly sliced", "meat"), ing(40, "g", "salami, chopped", "meat"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "gherkin, chopped", "store"),
        ing(1, "tbsp", "tomato puree", "store"), ing(300, "ml", "beef stock", "store"),
        ing(1, "tsp", "capers", "store"), ing(1, "", "bay leaf", "spice"),
        ing(2, "", "thin slices lemon", "produce"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tbsp", "dill, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat a little oil in a pan over high heat and sear the beef strips for 1 minute until browned, then tip onto a plate.",
        "Lower the heat to medium and fry the onion in the same pan for 8 minutes until soft and translucent.",
        "Add the salami and fry for 2 minutes.",
        "Stir in the tomato puree, cook for 1 minute, then add the stock, gherkin, capers and bay leaf. Simmer for 12 minutes, then return the beef and any juices for 1 minute until just cooked.",
        "Season to taste, then ladle into a bowl, top with a slice of lemon, a spoonful of soured cream and a scattering of dill."
      ]
    },
    {
      id: "d419", title: "Dutch-Style Beef Croquettes (Bitterballen-Inspired) with Mustard", tags: [], cuisine: "Netherlands", protein: "beef",
      prep: 25, cook: 10,
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
        "Taste the mixture and adjust the seasoning.",
        "Spread the mixture onto a plate and chill in the freezer for 15 minutes until firm enough to shape.",
        "Roll into 4–5 balls, dip each in beaten egg then breadcrumbs.",
        "Heat the oil in a pan and fry the croquettes for 3–4 minutes, turning, until deep golden and crisp. Serve hot with mustard."
      ]
    },
    {
      id: "d420", title: "Hawaiian-Style Huli Huli Chicken Thighs with Pineapple Rice", tags: ["quick"], cuisine: "Hawaii", protein: "chicken",
      prep: 8, cook: 14,
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
        "Heat a griddle or frying pan and cook the chicken for 5–6 minutes each side, brushing with the remaining marinade, until sticky and cooked through (75°C in the thickest part).",
        "Rest for 2 minutes, then slice.",
        "Taste and adjust the seasoning.",
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
        "Preheat the oven to 220°C (fan 200°C).",
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
        "Mix the lamb mince with ¼ tsp salt, the onion, cumin and pepper.",
        "Place a teaspoon of filling in the centre of each wrapper, dampen the edges with water and pinch closed into small parcels.",
        "Steam the dumplings in a steamer basket over simmering water for 12–14 minutes until the lamb is cooked through.",
        "Season to taste, then drizzle with the melted butter and serve topped with soured cream, a scattering of dill and a pinch of paprika."
      ]
    },
    {
      id: "d423", title: "Chilean-Style Chorrillana Loaded Fries with Beef and Fried Egg", tags: [], cuisine: "Chile", protein: "beef",
      prep: 8, cook: 24,
      ingredients: [
        ing(200, "g", "frozen chips", "frozen"), ing(120, "g", "beef sirloin, thinly sliced", "meat"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "", "egg", "dairy"),
        ing(40, "g", "cheddar, grated", "dairy"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Cook the chips in the oven according to the packet instructions until golden and crisp.",
        "Meanwhile, heat a little oil in a frying pan and fry the onion for 12 minutes until soft and starting to caramelise. Remove and set aside.",
        "Season the beef with the paprika, add to the hot pan and fry for 2–3 minutes until browned.",
        "Fry the egg in a separate pan to your liking.",
        "Pile the chips onto a plate, top with the beef, onion and grated cheese, then finish with the fried egg."
      ]
    },
    {
      id: "d424", title: "Ghanaian-Style Kontomire Stew with Smoked Mackerel", tags: ["fish"], cuisine: "Ghana", protein: "fish",
      prep: 8, cook: 17,
      ingredients: [
        ing(150, "g", "spinach, chopped", "produce"), ing(100, "g", "smoked mackerel fillet, flaked", "meat"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "", "tomato, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "", "garlic clove, crushed", "produce"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(0.5, "", "stock cube", "store")
      ],
      steps: [
        "Heat the oil in a pan and fry the onion for 8 minutes until soft and translucent, adding the garlic and chilli flakes for the last minute.",
        "Add the chopped tomato and cook for 2 minutes until pulpy.",
        "Crumble in the stock cube with a splash of water, then stir in the spinach and cook for 3–4 minutes until wilted.",
        "Season to taste, then fold through the flaked smoked mackerel and warm through for 2 minutes. Serve hot, with rice if you like."
      ]
    },
    {
      id: "d425", title: "Senegalese-Style Ndambe Black-Eyed Bean Stew", tags: ["vegan"], cuisine: "Senegal", protein: "plant-based",
      prep: 8, cook: 21,
      ingredients: [
        ing(240, "g", "tinned black-eyed beans, drained", "store"), ing(0.5, "", "onion, chopped", "produce"),
        ing(1, "", "tomato, chopped", "produce"), ing(1, "tbsp", "tomato puree", "store"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "ground ginger", "spice"),
        ing(0.25, "tsp", "chilli flakes", "spice"), ing(100, "ml", "vegetable stock", "store"),
        ing(150, "g", "sweet potato, cubed", "produce"), ing(1, "", "lime, juiced", "produce"), ing(1, "tbsp", "coriander, chopped", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat a splash of oil in a pan and fry the onion for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Stir in the tomato, tomato puree, ginger and chilli flakes, and cook for 2 minutes.",
        "Add the sweet potato, black-eyed beans and stock, cover and simmer for 12–15 minutes until the sweet potato is tender and the stew has thickened.",
        "Squeeze in the lime juice and season to taste. Scatter with coriander to serve."
      ]
    },
    {
      id: "d426", title: "Swiss-Style Älplermagronen (Alpine Macaroni Bake with Bacon and Cheese)", tags: [], cuisine: "Switzerland", protein: "pork",
      prep: 8, cook: 14,
      ingredients: [
        ing(100, "g", "macaroni", "store"), ing(100, "g", "potato, peeled and diced small", "produce"),
        ing(40, "g", "smoked bacon lardons", "meat"), ing(0.5, "", "onion, sliced", "produce"),
        ing(60, "ml", "double cream", "dairy"), ing(60, "g", "Gruyère, grated", "dairy"),
        ing(null, "pinch", "nutmeg, grated", "spice"), ing(1, "tbsp", "apple sauce, to serve", "store")
      ],
      steps: [
        "Cook the macaroni and diced potato together in a pan of boiling salted water for 8–10 minutes until both are tender, then drain.",
        "Meanwhile, fry the bacon and onion in a dry pan for 10 minutes until the bacon is crisp and the onion golden.",
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
        "Meanwhile, season the pork belly slices and fry in a dry pan over medium heat for 6–8 minutes each side until deeply golden and crisp. Remove and keep warm.",
        "For the parsley sauce, melt the butter in a small pan, stir in the flour and cook for 1 minute, then gradually whisk in the milk. Simmer for 2–3 minutes until thickened, then stir through the parsley and season.",
        "Serve the crispy pork belly with the potatoes and parsley sauce spooned over."
      ]
    },
    {
      id: "d428", title: "Lebanese-Style Freekeh Pilaf with Spiced Chicken", tags: [], cuisine: "Lebanon", protein: "chicken",
      prep: 8, cook: 30,
      ingredients: [
        ing(150, "g", "chicken thigh fillets, diced", "meat"), ing(75, "g", "cracked freekeh", "store"),
        ing(0.5, "", "onion, chopped", "produce"), ing(1, "tbsp", "toasted flaked almonds", "store"),
        ing(0.5, "tsp", "ground cinnamon", "spice"), ing(0.5, "tsp", "ground allspice", "spice"),
        ing(1, "tbsp", "olive oil", "store"), ing(200, "ml", "chicken stock", "store"),
        ing(1, "tbsp", "parsley, chopped", "produce"), ing(1, "", "lemon wedge", "produce")
      ],
      steps: [
        "Rinse the freekeh. Heat the oil in a pan and fry the onion for 8 minutes until soft and translucent.",
        "Add the diced chicken and spices, and cook for 3–4 minutes until the chicken starts to colour.",
        "Stir in the freekeh and stock, bring to a simmer, cover and cook for 15–18 minutes until the freekeh is tender and the liquid absorbed. Take off the heat and leave covered for 5 minutes, then fluff up with a fork.",
        "Season to taste, then fluff through with a fork, scatter with the toasted almonds and parsley, and finish with a squeeze of lemon."
      ]
    },
    {
      id: "d429", title: "Korean-Style Spicy Squid Stir-Fry (Ojingeo Bokkeum)", tags: ["spicy", "fish"], cuisine: "Korea", protein: "fish",
      prep: 10, cook: 8,
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
        "Season to taste, then scatter with spring onion and sesame seeds, and serve with rice."
      ]
    },
    {
      id: "d430", title: "Spanish-Style Pisto Manchego with Fried Egg", tags: ["vegetarian"], cuisine: "Spain", protein: "plant-based",
      prep: 11, cook: 21,
      ingredients: [
        ing(1, "", "courgette, diced", "produce"), ing(0.5, "", "red pepper, diced", "produce"),
        ing(0.5, "", "green pepper, diced", "produce"), ing(0.5, "", "onion, diced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(200, "g", "tinned chopped tomatoes", "store"),
        ing(1, "tbsp", "olive oil", "store"), ing(0.5, "tsp", "smoked paprika", "spice"),
        ing(1, "", "egg", "dairy"), ing(1, "slice", "crusty bread, to serve", "bakery")
      ],
      steps: [
        "Heat the olive oil in a pan and fry the onion and peppers for 8 minutes until soft and translucent, adding the garlic for the last minute.",
        "Add the courgette and cook for a further 3–4 minutes.",
        "Stir in the smoked paprika for 30 seconds, then add the tinned tomatoes, season, and simmer for 12–15 minutes until thick and jammy.",
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
        "Shallow-fry the chicken in hot oil for 4–5 minutes each side until golden, crisp and cooked through (75°C in the thickest part).",
        "Warm 2 tablespoons of the frying oil with the hot sauce, remaining cayenne and brown sugar to make the Nashville glaze, and brush generously over the hot chicken.",
        "Split the bun and toast it cut-side down in a dry pan for 1 minute, then pile the chicken in with mayonnaise and gherkin slices."
      ]
    },
    {
      id: "d432", title: "Malaysian-Style Nasi Lemak with Sambal Chicken", tags: ["spicy"], cuisine: "Malaysia", protein: "chicken",
      prep: 9, cook: 30,
      ingredients: [
        ing(70, "g", "basmati rice", "store"), ing(100, "ml", "coconut milk", "store"),
        ing(1, "", "chicken breast, sliced", "meat"), ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "tbsp", "sambal oelek or chilli paste", "store"), ing(1, "tsp", "tamarind paste", "store"),
        ing(1, "tsp", "sugar", "store"), ing(0.25, "", "cucumber, sliced", "produce"),
        ing(1, "", "egg", "dairy"), ing(15, "g", "roasted peanuts", "store"),
        ing(1, "", "lime wedge", "produce"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Rinse the rice, then put it in a small pan with the coconut milk, 50 ml water and a pinch of salt. Cover and cook on a low heat for 12 minutes until tender, then take off the heat and leave covered for 5 minutes.",
        "Meanwhile, boil the egg for 8 minutes, then cool in cold water, peel and halve.",
        "Fry the onion in a little oil for 8 minutes until soft, then stir in the sambal, tamarind paste and sugar to make a quick sauce. Simmer for 2–3 minutes.",
        "Add the sliced chicken and cook for 6–7 minutes until cooked through with no pink inside and coated in the sauce.",
        "Serve the coconut rice with the sambal chicken, cucumber slices, halved boiled egg, peanuts and a lime wedge."
      ]
    },
    {
      id: "d433", title: "Persian-Style Ghormeh Sabzi Herb & Lamb Stew", tags: [], cuisine: "Iran", protein: "lamb",
      prep: 10, cook: 20,
      ingredients: [
        ing(120, "g", "lamb leg steak, cut into 2cm cubes", "meat"), ing(20, "g", "parsley, chopped", "produce"),
        ing(20, "g", "coriander, chopped", "produce"), ing(1, "", "spring onion, chopped", "produce"),
        ing(50, "g", "spinach, chopped", "produce"), ing(0.5, "", "onion, chopped", "produce"),
        ing(100, "g", "tinned red kidney beans, drained", "store"), ing(0.5, "tsp", "turmeric", "spice"),
        ing(1, "tbsp", "lemon juice", "produce"), ing(200, "ml", "stock", "store"),
        ing(1, "tbsp", "vegetable oil", "store"),
        ing(70, "g", "basmati rice", "store")
      ],
      steps: [
        "Cook the rice according to the packet instructions.",
        "Heat the oil in a pan over high heat, add the lamb and turmeric and sear for 2–3 minutes until browned but still pink inside. Tip onto a plate.",
        "Fry the onion until soft, then add the herbs and spinach and fry for 3–4 minutes until darkened and fragrant.",
        "Add the stock, lemon juice and kidney beans and simmer for 10 minutes until thickened.",
        "Return the lamb and its juices for 2 minutes. Season to taste and serve with rice."
      ]
    },
    {
      id: "d434", title: "Dublin Coddle-Style Sausage & Potato Stew", tags: [], cuisine: "Ireland", protein: "pork",
      prep: 10, cook: 30,
      ingredients: [
        ing(2, "", "pork sausages, thickly sliced", "meat"), ing(2, "", "smoked bacon rashers, chopped", "meat"),
        ing(200, "g", "potatoes, sliced", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(200, "ml", "chicken stock", "store"), ing(1, "tsp", "thyme, chopped", "produce"),
        ing(null, "pinch", "black pepper", "spice"),
        ing(1, "tbsp", "vegetable oil", "store")
      ],
      steps: [
        "Heat a splash of oil in a pan and brown the sausage pieces and bacon for 3–4 minutes.",
        "Layer the potatoes and onion over the meat, pour in the stock, and add the thyme and a good grind of pepper.",
        "Cover and simmer gently for 25–30 minutes until the potatoes are tender and the stock has reduced to a thick gravy.",
        "Season to taste, then serve hot straight from the pot with crusty bread."
      ]
    },
    {
      id: "d435", title: "Pakistani-Style Chicken Biryani", tags: ["spicy"], cuisine: "Pakistan", protein: "chicken",
      prep: 9, cook: 34,
      ingredients: [
        ing(1, "", "chicken thigh, diced", "meat"), ing(75, "g", "basmati rice, rinsed", "store"),
        ing(0.5, "", "onion, sliced", "produce"), ing(1, "tbsp", "plain yoghurt", "dairy"),
        ing(1, "tsp", "ginger garlic paste", "produce"), ing(0.5, "tsp", "garam masala", "spice"),
        ing(0.5, "tsp", "chilli powder", "spice"), ing(0.25, "tsp", "turmeric", "spice"),
        ing(1, "tbsp", "warm milk with a pinch of saffron", "dairy"), ing(1, "tbsp", "ghee or butter", "dairy"),
        ing(1, "tbsp", "coriander and mint, chopped", "produce")
      ],
      steps: [
        "Marinate the chicken in the yoghurt, ginger garlic paste, garam masala, chilli powder and turmeric for a few minutes.",
        "Fry the onion in the ghee for 12 minutes until golden and crisp; set half aside for garnish.",
        "Add the marinated chicken to the pan and cook for 5–6 minutes until browned.",
        "Meanwhile, part-cook the rice in boiling salted water for 6 minutes, then drain. Layer the rice over the chicken and drizzle with the saffron milk.",
        "Add 4 tbsp water, cover tightly and cook on low heat for 12–15 minutes until the rice is fully tender and fragrant. Take off the heat and leave covered for 5 minutes, then fluff through and scatter with the reserved fried onion, coriander and mint."
      ]
    },
    {
      id: "d436", title: "Polish-Style Pierogi Ruskie with Soured Cream and Bacon", tags: [], cuisine: "Poland", protein: "pork",
      prep: 10, cook: 28,
      ingredients: [
        ing(10, "", "fresh dumpling or wonton wrappers", "store"), ing(150, "g", "potato, peeled and chopped", "produce"),
        ing(50, "g", "curd cheese or cream cheese", "dairy"), ing(0.25, "", "onion, finely chopped", "produce"),
        ing(2, "", "bacon rashers, chopped", "meat"), ing(15, "g", "butter", "dairy"),
        ing(2, "tbsp", "soured cream", "dairy"), ing(1, "tbsp", "chives, chopped", "produce")
      ],
      steps: [
        "Boil the potato in salted water for 12–15 minutes until tender, then drain, mash and leave to cool slightly.",
        "Mix the mashed potato with the curd cheese and a little of the chopped onion, and season well.",
        "Place a spoonful of the potato mixture in the centre of each wrapper, dampen the edges and fold into half-moons, pressing to seal.",
        "Cook the pierogi in a pan of simmering water for 3–4 minutes until they float, then drain.",
        "Meanwhile, fry the bacon and remaining onion in the butter for 10 minutes until crisp and golden.",
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
        "Mix the beef mince with ¼ tsp salt, the grated onion, cumin and pepper.",
        "Place a small teaspoon of filling in the centre of each wrapper, dampen the edges and fold into small parcels, pinching to seal.",
        "Bring the stock to a simmer in a wide pan and poach the dumplings for 5–6 minutes until the filling is cooked through.",
        "Meanwhile, stir the crushed garlic into the yoghurt and season. Melt the butter in a small pan with the chilli flakes until sizzling and red.",
        "Drain the dumplings, spoon over the garlic yoghurt, drizzle with the chilli butter and scatter with dried mint."
      ]
    },
    {
      id: "d438", title: "Romanian Mici with Mustard and Crispy Potatoes", tags: [], cuisine: "Romania", protein: "beef",
      prep: 10, cook: 15,
      ingredients: [
        ing(75, "g", "beef mince", "meat"), ing(75, "g", "pork mince", "meat"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(0.5, "tsp", "dried thyme", "spice"),
        ing(0.5, "tsp", "smoked paprika", "spice"), ing(0.25, "tsp", "bicarbonate of soda", "store"),
        ing(1, "tbsp", "beef stock or water", "store"), ing(150, "g", "new potatoes, halved", "produce"),
        ing(1, "tbsp", "vegetable oil", "store"), ing(1, "tbsp", "yellow mustard", "store"),
        ing(1, "", "pickled pepper or gherkin", "store"), ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Boil the halved potatoes in salted water for 10 minutes until just tender, then drain.",
        "Meanwhile, mix both minces with the garlic, thyme, paprika, bicarbonate of soda, stock and a good pinch of salt and pepper. Knead for a minute until sticky, then shape into three short, fat sausages.",
        "Heat half the oil in a frying pan or griddle over a medium-high heat and cook the mici for 8–10 minutes, turning often, until browned and cooked through.",
        "Push them to one side, add the rest of the oil and the drained potatoes, and fry for 4–5 minutes until golden and crisp at the edges.",
        "Serve the mici with the potatoes, a spoonful of mustard and the pickled pepper on the side."
      ]
    },
    {
      id: "d439", title: "Tochitură with Polenta and a Fried Egg", tags: [], cuisine: "Romania", protein: "pork",
      prep: 8, cook: 15,
      ingredients: [
        ing(150, "g", "pork shoulder or loin, diced", "meat"), ing(50, "g", "smoked sausage, sliced", "meat"),
        ing(1, "", "garlic clove, sliced", "produce"), ing(0.5, "tsp", "sweet paprika", "spice"),
        ing(2, "tbsp", "passata", "store"), ing(50, "ml", "white wine or stock", "store"),
        ing(50, "g", "quick-cook polenta", "store"), ing(200, "ml", "water", "store"),
        ing(10, "g", "butter", "dairy"), ing(1, "", "egg", "dairy"),
        ing(20, "g", "feta, crumbled", "dairy"), ing(1, "tbsp", "vegetable oil", "store"),
        ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Heat the oil in a frying pan over a high heat and brown the pork for 4–5 minutes. Add the sausage and fry for 2 minutes more.",
        "Stir in the garlic and paprika for 30 seconds, then add the passata and wine. Simmer for 8 minutes until the sauce coats the meat.",
        "Meanwhile, bring the water to the boil with a pinch of salt, whisk in the polenta and cook, stirring, for 3–5 minutes until thick. Stir in the butter.",
        "Push the meat to one side of the pan, crack in the egg and fry until the white is set.",
        "Spoon the polenta onto a plate, top with the tochitură and the egg, and scatter with the crumbled cheese."
      ]
    },
    {
      id: "d440", title: "Ciorbă de Perișoare (Sour Meatball Soup)", tags: [], cuisine: "Romania", protein: "pork",
      prep: 10, cook: 23,
      ingredients: [
        ing(120, "g", "pork mince", "meat"), ing(1, "tbsp", "long-grain rice", "store"),
        ing(0.5, "", "onion, finely chopped", "produce"), ing(1, "", "small carrot, diced", "produce"),
        ing(0.5, "", "red pepper, diced", "produce"), ing(1, "tbsp", "tomato purée", "store"),
        ing(450, "ml", "chicken stock", "store"), ing(1, "tbsp", "lemon juice", "produce"),
        ing(null, "small handful", "fresh dill or lovage, chopped", "produce"), ing(1, "tbsp", "soured cream", "dairy"),
        ing(1, "tsp", "vegetable oil", "store"), ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Mix the pork mince with the rice, half the onion and a pinch of salt and pepper, then roll into 8 small meatballs.",
        "Heat the oil in a saucepan and soften the rest of the onion, the carrot and the pepper for 8 minutes until soft. Stir in the tomato purée and fry for 1 minute until it darkens.",
        "Pour in the stock and bring to a simmer. Drop in the meatballs and simmer gently for 15 minutes until they and the rice inside are cooked through.",
        "Stir in the lemon juice, then taste and adjust the seasoning so the broth is pleasantly sour.",
        "Ladle into a bowl and finish with the dill and a spoonful of soured cream."
      ]
    },
    {
      id: "d441", title: "Mămăligă with Cheese, Soured Cream and a Fried Egg", tags: ["vegetarian", "quick"], cuisine: "Romania", protein: "plant-based",
      prep: 5, cook: 10,
      ingredients: [
        ing(60, "g", "quick-cook polenta", "store"), ing(250, "ml", "water", "store"),
        ing(15, "g", "butter", "dairy"), ing(60, "g", "feta, crumbled", "dairy"),
        ing(2, "tbsp", "soured cream", "dairy"), ing(1, "", "egg", "dairy"),
        ing(1, "", "spring onion, sliced", "produce"), ing(1, "tsp", "vegetable oil", "store"),
        ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Bring the water to the boil with a pinch of salt. Whisk in the polenta and cook, stirring, for 3–5 minutes until thick and smooth. Stir in the butter and half the cheese.",
        "Meanwhile, heat the oil in a small frying pan and fry the egg until the white is set and the yolk still runny.",
        "Spoon the polenta onto a plate and make a dip in the middle.",
        "Fill it with the soured cream, scatter over the rest of the cheese and the spring onion, then top with the fried egg and a grind of black pepper."
      ]
    },
    {
      id: "d442", title: "Tocăniță de Ciuperci (Mushroom Stew) with Polenta", tags: ["vegetarian", "vegan"], cuisine: "Romania", protein: "plant-based",
      prep: 8, cook: 20,
      ingredients: [
        ing(200, "g", "chestnut mushrooms, quartered", "produce"), ing(0.5, "", "onion, sliced", "produce"),
        ing(1, "", "garlic clove, crushed", "produce"), ing(1, "tbsp", "tomato purée", "store"),
        ing(0.5, "tsp", "sweet paprika", "spice"), ing(0.5, "tsp", "dried thyme", "spice"),
        ing(100, "ml", "vegetable stock", "store"), ing(1.5, "tbsp", "olive oil", "store"),
        ing(50, "g", "quick-cook polenta", "store"), ing(200, "ml", "water", "store"),
        ing(null, "small handful", "fresh parsley or dill, chopped", "produce"), ing(null, "pinch", "salt and pepper", "spice")
      ],
      steps: [
        "Heat 1 tbsp of the oil in a frying pan over a medium-high heat and fry the onion for 8 minutes until soft and translucent. Add the mushrooms and fry for 5 minutes until browned.",
        "Stir in the garlic, paprika, thyme and tomato purée for 1 minute, then pour in the stock. Simmer for 6–8 minutes until saucy.",
        "Meanwhile, bring the water to the boil with a pinch of salt, whisk in the polenta and cook, stirring, for 3–5 minutes until thick. Stir in the rest of the oil.",
        "Taste the stew and adjust the seasoning.",
        "Spoon the polenta onto a plate, top with the mushroom stew and scatter with the herbs."
      ]
    }

  ];
})();

// Swaps for ingredients that aren't in every supermarket. Each entry matches
// ingredient lines exactly (lower case). "use" lists what goes on the shopping
// list instead: factor scales the original amount (same unit), or amt/unit
// give a fixed amount. An empty "use" means leave it out; no "use" at all
// means there's no good swap (worth seeking out). tier: "hard" is specialist
// or Asian/world food shops; "some" is bigger supermarkets but not all.
window.SOLO_SWAPS = [
  { id: "freekeh", tier: "hard", match: ["cracked freekeh"],
    tip: "Use the same weight of bulgur wheat and simmer about 5 minutes less. You lose the smoky edge; the texture is the same.",
    use: [{ factor: 1, item: "bulgur wheat", cat: "store" }] },
  { id: "berbere", tier: "hard", match: ["berbere spice blend"],
    tip: "For each teaspoon, mix ½ tsp smoked paprika, ¼ tsp cayenne and a pinch each of cumin, coriander and cinnamon. Close, just a little less complex.",
    use: [{ factor: 0.5, item: "smoked paprika", cat: "spice" }, { factor: 0.25, item: "cayenne pepper", cat: "spice" },
      { amt: 1, unit: "pinch", item: "ground cumin", cat: "spice" }, { amt: 1, unit: "pinch", item: "ground coriander", cat: "spice" }, { amt: 1, unit: "pinch", item: "ground cinnamon", cat: "spice" }] },
  { id: "aji-amarillo", tier: "hard", match: ["aji amarillo paste"],
    tip: "Use 1 tsp chilli paste with ½ tsp turmeric and a squeeze of lime. Less fruity, and the sauce stays golden.",
    use: [{ amt: 1, unit: "tsp", item: "chilli paste", cat: "store" }, { amt: 0.5, unit: "tsp", item: "ground turmeric", cat: "spice" }, { amt: 1, unit: "tsp", item: "lime juice", cat: "produce" }] },
  { id: "asafoetida", tier: "hard", match: ["asafoetida"],
    tip: "Leave it out and add a pinch of garlic powder instead. You'll barely notice.",
    use: [{ amt: 1, unit: "pinch", item: "garlic powder", cat: "spice" }] },
  { id: "chaat-masala", tier: "hard", match: ["chaat masala"],
    tip: "Use a pinch each of ground cumin, chilli powder and salt, plus a squeeze of lemon. It misses the sulphury tang but stays bright.",
    use: [{ amt: 1, unit: "pinch", item: "ground cumin", cat: "spice" }, { amt: 1, unit: "pinch", item: "chilli powder", cat: "spice" }, { amt: 1, unit: "tsp", item: "lemon juice", cat: "produce" }] },
  { id: "black-vinegar", tier: "hard", match: ["chinese black vinegar"],
    tip: "Use half balsamic and half rice vinegar. Very close.",
    use: [{ factor: 0.5, item: "balsamic vinegar", cat: "store" }, { factor: 0.5, item: "rice vinegar", cat: "store" }] },
  { id: "chinese-sausage", tier: "hard", match: ["chinese sausage, sliced"],
    tip: "Use about 60 g cooking chorizo with ½ tsp honey. Smokier and a little less sweet.",
    use: [{ amt: 60, unit: "g", item: "cooking chorizo, sliced", cat: "meat" }, { amt: 0.5, unit: "tsp", item: "honey", cat: "store" }] },
  { id: "curry-leaves", tier: "hard", match: ["fresh curry leaves"],
    tip: "Use twice as many dried curry leaves if you have them, or leave them out. The dish is still good without.",
    use: [] },
  { id: "wrappers", tier: "hard", match: ["ready-made dumpling or wonton wrappers", "fresh dumpling or wonton wrappers"],
    tip: "Worth seeking out: look in the freezer at larger Tesco and Sainsbury's stores, or any Asian grocer. There's no good swap." },
  { id: "fenugreek", tier: "hard", match: ["ground fenugreek"],
    tip: "Use half as much medium curry powder, or leave it out. Slightly less earthy.",
    use: [{ factor: 0.5, item: "medium curry powder", cat: "spice" }] },
  { id: "gochugaru", tier: "hard", match: ["gochugaru (korean chilli flakes)", "gochugaru", "gochugaru or chilli flakes"],
    tip: "Use half chilli flakes and half sweet paprika. Same colour, a little hotter.",
    use: [{ factor: 0.5, item: "chilli flakes", cat: "spice" }, { factor: 0.5, item: "sweet paprika", cat: "spice" }] },
  { id: "tteok", tier: "hard", match: ["korean rice cakes (tteok)"],
    tip: "Use the same weight of fresh gnocchi and pan-fry it instead of soaking. Softer chew; works well.",
    use: [{ factor: 1, item: "fresh gnocchi", cat: "store" }] },
  { id: "glass-noodles", tier: "hard", match: ["sweet potato glass noodles (dangmyeon)"],
    tip: "Use the same weight of thin rice vermicelli and cook it as the pack says. Less bouncy.",
    use: [{ factor: 1, item: "thin rice vermicelli noodles", cat: "store" }] },
  { id: "green-plantain", tier: "hard", match: ["large green (unripe) plantain, peeled and sliced"],
    tip: "Worth seeking out (Caribbean and African grocers, some big supermarkets). Otherwise fry and mash a large floury potato the same way; it becomes more like garlic mash.",
    use: [{ amt: 250, unit: "g", item: "floury potato, peeled and chopped", cat: "produce" }] },
  { id: "lime-leaves", tier: "hard", match: ["kaffir lime leaves"],
    tip: "Use the zest of half a lime, stirred in at the end. Close.",
    use: [{ amt: 0.5, unit: "", item: "lime", cat: "produce" }] },
  { id: "merguez", tier: "hard", match: ["merguez sausages (about 120g)"],
    tip: "Use spicy lamb or pork sausages rubbed with ½ tsp harissa. Close.",
    use: [{ factor: 1, item: "pork sausages", cat: "meat" }, { amt: 0.5, unit: "tsp", item: "harissa paste", cat: "store" }] },
  { id: "doubanjiang", tier: "hard", match: ["sichuan chilli bean paste (doubanjiang)"],
    tip: "Use 1 tbsp black bean sauce with 1 tsp chilli paste. Close.",
    use: [{ factor: 1, item: "black bean sauce", cat: "store" }, { amt: 1, unit: "tsp", item: "chilli paste", cat: "store" }] },
  { id: "sichuan-pepper", tier: "hard", match: ["sichuan peppercorns, crushed"],
    tip: "Use coarse black pepper and a little lime zest. You lose the tingle.",
    use: [{ factor: 0.5, item: "black peppercorns, coarsely crushed", cat: "spice" }, { amt: 0.25, unit: "", item: "lime", cat: "produce" }] },
  { id: "fava", tier: "hard", match: ["tinned fava beans"],
    tip: "Use tinned butter or borlotti beans. Milder and creamier.",
    use: [{ factor: 1, item: "tinned butter beans, drained", cat: "store" }] },
  { id: "pigeon-peas", tier: "hard", match: ["tinned pigeon peas, drained"],
    tip: "Use tinned black-eyed beans. Very close.",
    use: [{ factor: 1, item: "tinned black-eyed beans, drained", cat: "store" }] },
  { id: "curd-cheese", tier: "hard", match: ["curd cheese", "curd cheese or cream cheese"],
    tip: "Use ricotta, or cottage cheese pressed through a sieve. Very close.",
    use: [{ factor: 1, item: "ricotta", cat: "dairy" }] },
  { id: "mooli", tier: "hard", match: ["radish (mooli), sliced"],
    tip: "Use a few ordinary radishes, halved. More peppery, and they cook faster.",
    use: [{ amt: 4, unit: "", item: "radishes, sliced", cat: "produce" }] },
  { id: "herring", tier: "hard", match: ["soused herring fillets"],
    tip: "Rollmops (often by the deli counter) are the same thing. Otherwise smoked mackerel, which makes it richer and smokier.",
    use: [{ factor: 1, item: "smoked mackerel fillet, flaked", cat: "meat" }] },
  { id: "raw-salmon", tier: "hard", match: ["sushi-grade salmon, cubed", "very fresh salmon fillet, thinly sliced"],
    tip: "Only eat salmon raw if the pack or fishmonger says it's sushi-grade. Otherwise use hot-smoked salmon flakes: cooked rather than raw, still very good.",
    use: [{ factor: 1, item: "hot-smoked salmon, flaked", cat: "meat" }] },
  { id: "scotch-bonnet", tier: "hard", match: ["scotch bonnet chilli, finely chopped"],
    tip: "Use one bird's eye chilli. Less fruity, similar heat.",
    use: [{ amt: 1, unit: "", item: "red chilli, finely chopped", cat: "produce" }] },
  { id: "pom-molasses", tier: "some", match: ["pomegranate molasses"],
    tip: "Use 2 parts balsamic vinegar to 1 part honey, with a squeeze of lemon.",
    use: [{ factor: 0.67, item: "balsamic vinegar", cat: "store" }, { factor: 0.33, item: "honey", cat: "store" }, { amt: 1, unit: "tsp", item: "lemon juice", cat: "produce" }] },
  { id: "sumac", tier: "some", match: ["sumac"],
    tip: "Use finely grated lemon zest with a pinch of salt.",
    use: [{ amt: 0.5, unit: "", item: "lemon", cat: "produce" }] },
  { id: "zaatar", tier: "some", match: ["za'atar"],
    tip: "Use equal parts dried thyme and sesame seeds, plus some lemon zest.",
    use: [{ factor: 0.5, item: "dried thyme", cat: "spice" }, { factor: 0.5, item: "sesame seeds", cat: "spice" }, { amt: 0.5, unit: "", item: "lemon", cat: "produce" }] },
  { id: "tamarind", tier: "some", match: ["tamarind paste"],
    tip: "For each tablespoon, use 2 tsp lime juice and 1 tsp soft brown sugar.",
    use: [{ factor: 0.67, item: "lime juice", cat: "produce" }, { factor: 0.33, item: "soft brown sugar", cat: "store" }] },
  { id: "ras-el-hanout", tier: "some", match: ["ras el hanout"],
    tip: "Use ¼ tsp each of ground cumin, coriander, cinnamon and paprika.",
    use: [{ factor: 0.25, item: "ground cumin", cat: "spice" }, { factor: 0.25, item: "ground coriander", cat: "spice" }, { factor: 0.25, item: "ground cinnamon", cat: "spice" }, { factor: 0.25, item: "paprika", cat: "spice" }] },
  { id: "bonito", tier: "some", match: ["bonito flakes, optional"],
    tip: "Leave them out, or scatter with shredded nori.",
    use: [] }
];

// Kitchen conventions every recipe assumes, shown as "Cook's notes" under the
// method in the app and on the recipe pages.
window.SOLO_COOK_NOTES = [
  ["Sizes", "Vegetables, fruit and eggs are medium unless the recipe says otherwise. A tin is a standard 400g tin."],
  ["Dairy", "Salted or unsalted butter both work; with salted, go easy on any extra salt. Use full-fat soured cream, crème fraîche and yoghurt in anything hot, as low-fat versions split."],
  ["Stock", "A cube or pot made up as the packet says. Cubes are salty, so taste before adding more salt."],
  ["Heat", "Medium means a gentle sizzle, not spitting. High means the oil shimmers before the food goes in. A simmer is a few lazy bubbles, not a rolling boil. Leave the lid off unless the recipe says to cover."],
  ["Pans", "A small saucepan is about 16cm and a frying pan about 24cm. Sauces reduce faster in a wider pan, so go by how it looks rather than the clock."],
  ["Doneness", "Chicken and turkey should reach 75°C in the thickest part, pork 65 to 70°C, and beef steak 55°C for medium-rare. Rest steaks and chops for a few minutes before slicing."],
  ["Finishing", "Taste before serving. Most dishes want a pinch more salt, and a squeeze of lemon or a splash of vinegar lifts anything rich."],
  ["Leftovers", "Cool quickly, cover and keep in the fridge for up to 2 days, then reheat until piping hot. Cooked rice keeps for 1 day and should only be reheated once."]
];
