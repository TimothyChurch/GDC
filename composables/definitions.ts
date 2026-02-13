export const estimateCocktailPrice = (cost: number): number =>
  ((cost - 1.5) / 2.5) * 4 + 7;

export const liquorClasses = [
  {
    class: "Neutral Spirits or Alcohol",
    definition:
      "Spirits distilled from any material at or above 95% alcohol by volume (190 proof), and if bottled, bottled at not less than 40% alcohol by volume (80 proof)",
    types: [
      {
        type: "Vodka",
        definition:
          "Neutral spirits distilled or treated after distillation with charcoal or other materials so as to be without distinctive character, aroma, taste or color",
      },
      {
        type: "Grain Spirits",
        definition:
          "Neutral spirits distilled from a fermented mash of grain and stored in oak containers",
      },
    ],
  },
  {
    class: "Whisky",
    definition:
      "Spirits distilled from a fermented mash of grain at less than 95% alcohol by volume (190 proof) having the taste, aroma and characteristics generally attributed to whisky and bottled at not less than 40% alcohol by volume (80 proof)",
    types: [
      {
        type: "Bourbon Whisky",
        definition:
          "Whisky produced in the U.S. at not exceeding 80% alcohol by volume (160 proof) from a fermented mash of not less than 51 percent corn and stored at not more than 62.5% alcohol by volume (125 proof) in charred new oak containers",
      },
      {
        type: "Rye Whisky",
        definition:
          "Whisky produced at not exceeding 80% alcohol by volume (160 proof) from a fermented mash of not less than 51 percent rye and stored at not more than 62.5% alcohol by volume (125 proof) in charred new oak containers",
      },
      {
        type: "Wheat Whisky",
        definition:
          "Whisky produced at not exceeding 80% alcohol by volumen (160 proof) from a fermented mash of not less than 51 percent wheat and stored at not more than 62.5% alcohol by volume (125 proof) in charred new oak containers",
      },
      {
        type: "Malt Whisky",
        definition:
          "Whisky produced at not exceeding 80% alcohol by volume (160 proof) from a fermented mash of not less than 51 percent malted barley and stored at not more than 62.5% alcohol by volume (125 proof) in charred new oak containers",
      },
      {
        type: "Rye Malt Whisky",
        definition:
          "Whisky produced at not exceeding 80% alcohol by volume (160 proof) from a fermented mash of not less than 51 percent malted rye and stored at not more than 62.5% alcohol by volume (125 proof) in charred new oak containers",
      },
      {
        type: "Corn Whisky",
        definition:
          "Whisky produced at not exceeding 80% alcohol by volume (160 proof) from a fermented mash of not less than 80 percent corn and if stored in oak containers stored at not more than 62.5% alcohol by volume (125 proof) in used or uncharred new oak containers and not subjected in any manner to treatment with charred wood",
      },
    ],
  },
  {
    class: "Gin",
    definition:
      "Spirits with a main characteristic flavor derived from juniper berries produced by distillation or mixing of spirits with juniper berries and other aromatics or extracts derived from these materials and bottled at not less than 40% alcohol by volume (80 proof)",
    types: [
      {
        type: "Distilled Gin",
        definition:
          "Gin produced by original distillation from mash with or over juniper berries and other aromatics or their extracts, essences, or flavors",
      },
      {
        type: "Redistilled Gin",
        definition:
          "Gin produced by redistillation of distilled spirits with or over juniper berries and other aromatics or their extracts, essences, or flavors",
      },
      {
        type: "Compounded Gin",
        definition:
          "Gin produced by mixing neutral spirits with juniper berries and other aromatics or their extracts, essences, or flavors",
      },
    ],
  },
  {
    class: "Brandy",
    definition:
      "Spirits distilled from the fermented juice, mash or wine of fruit or from its residue at less than 95% alcohol by volume (190 proof) having the taste, aroma and characteristics generally attributed to brandy and bottled at not less than 40% alcohol by volume (80 proof)",
    types: [
      {
        type: "Fruit Brandy",
        definition:
          "Brandy distilled solely from the fermented juice or mash of whole, sound, ripe fruit or from standard fruit wine, with or without the addition of not more than 20 percent by weight of the pomace of such juice or wine or 30 percent by volume of the lees of such wine or both. Such brandy may include up to 30% on a proof gallon basis of lees brandy · “Brandy” is grape brandy. Other types of fruit brandy must be further identified, e.g., “Peach Brandy”· Grape brandy must be stored in oak containers for a minimum of 2 years",
      },
      {
        type: "Applejack/Apple Brandy",
        definition: "Type of Fruit Brandy made from apples",
      },
    ],
  },
  {
    class: "Rum",
    definition:
      "Spirits distilled from the fermented juice of sugar cane, sugar cane syrup, sugar cane molasses or other sugar cane by-products at less than 95% alcohol by volume (190 proof) having the taste, aroma and characteristics generally attributed to rum and bottled at not less than 40% alcohol by volume (80 proof)",
    types: [{ type: "N/A", definition: "N/A" }],
  },
  {
    class: "Liqueur/Cordial",
    definition:
      "Flavored spirits product containing not less than 2½% by weight sugar, dextrose, levulose or a combination thereof made by mixing or redistilling any class or type of spirits with or over fruits, flowers, plants or pure juices therefrom or other natural flavoring materials or with extracts derived from infusions, percolation or maceration of such materials",
    types: [
      { type: "Amaretto", definition: "Almost flavored liqueur/cordial" },
      { type: "Ouzo", definition: "Anise flavored liqueur/cordial" },
      {
        type: "Peppermint Schnapps",
        definition: "Peppermint flavored liqueur/cordial",
      },
      { type: "Triple Sec", definition: "Orange flavored liqueur/cordial" },
      {
        type: "Creme de ______",
        definition:
          "Liqueur/cordial with the predominant flavor as indicated in the name",
      },
    ],
  },
  {
    class: "Flavored Vodka",
    definition:
      "Vodka flavored with natural flavoring materials, with or without the addition of sugar, bottled at not less than 30% alcohol by volume (60 proof) · The name of the predominant flavor shall appear as part of the class and type designation, e.g., “Orange Flavored Vodka” · Wine may be added but if the addition exceeds 2½% by volume of the finished product, the classes and/or types and percentages (by volume) of wine must be stated as part of the class and type designation",
    types: [{ type: "N/A", definition: "N/A" }],
  },
  {
    class: "Distilled Spirits Specialty",
    definition:
      "Distilled spirits not defined under any other class · Generally, any class and/or type of distilled spirits that contain or are treated with flavoring and/or coloring materials and/or nonstandard blending or treating materials or processes",
    types: [{ type: "N/A", definition: "N/A" }],
  },
];
