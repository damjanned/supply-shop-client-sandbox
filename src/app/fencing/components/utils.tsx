import type {
  FencingDetailResponse,
  GateDetailResponse,
} from "@/types/fencing";
import type { Fence } from "./Container";
import { AppState } from "@/redux/app";
import { FormattedFenceType } from "./Container/builder";
import { DropdownOption } from "@/components/Dropdown";

export const terrainOptions = [
  {
    id: "soft_clay",
    label: "Soft Clay, Loose Sand",
  },
  {
    id: "medium_dense_sand",
    label: " Medium Dense Sand",
  },
  {
    id: "rock_concrete",
    label: "Rock",
  },
];

export const gateSizeOptions = [
  {
    label: "Standard (Approx 905mm)",
    id: "standard",
  },
  {
    label: "Extra Wide (Approx 1665mm)",
    id: "xwide",
  },
];

export const gateAccKitOptions = [
  {
    label: "Economic",
    id: "economic",
  },
  {
    label: "Standard",
    id: "standard",
  },
  {
    label: "Premium",
    id: "premium",
  },
];

export function getWidthOptions(widths: Array<number>) {
  return widths.map((width) => {
    let image: string;
    let size: { width: number; height: number };
    switch (width) {
      case 1582:
        image = "2Panels.svg";
        size = {
          width: 60,
          height: 62,
        };
        break;
      case 2350:
        image = "3Panels.svg";
        size = {
          width: 81,
          height: 62,
        };
        break;
      default:
        image = "4Panels.svg";
        size = {
          width: 97,
          height: 62,
        };
    }
    return {
      id: width.toString(),
      label: `${width}MM`,
      extraData: {
        image,
        count: Math.ceil(width / 800),
        ...size,
      },
    };
  });
}

export function getHeightOptions(width: number, heightOptions: Array<number>) {
  const options = [
    {
      id: heightOptions[0].toString(),
      label: `${heightOptions[0]}MM`,
      extraData: {
        image: "1500MM.svg",
        width: 86,
        height: 50,
      },
    },
    {
      id: heightOptions[1].toString(),
      label: `${heightOptions[1]}MM`,
      extraData: {
        image: "1800MM.svg",
        width: 80,
        height: 59,
      },
    },
    {
      id: heightOptions[2].toString(),
      label: `${heightOptions[2]}MM`,
      extraData: {
        image: "2500MM.svg",
        width: 73,
        height: 66,
      },
    },
  ];
  if (width === 3100) {
    return options.slice(0, 2);
  } else {
    return options;
  }
}

export function getGateHeightOptions(
  selectedFence: {
    heights: Array<{ gate: number; sheet: number }>;
    extensionHeights: Array<{ gate: number; sheet: number }>;
  },
  extension: boolean,
  fence: Fence,
) {
  if (selectedFence) {
    const options = extension
      ? selectedFence.extensionHeights
      : selectedFence.heights;
    options.sort((a, b) => a.gate - b.gate);
    const maxAllowedHeight = Math.min(
      3150 - (fence.footingDepth as number) - (fence.groundClearance as number),
      extension ? 2390 : 2090,
    );
    let i = options.length - 1;
    while (i >= 0) {
      if (options[i].sheet > maxAllowedHeight) {
        i--;
      } else {
        break;
      }
    }
    return options.slice(0, i + 1).map((height) => {
      return {
        id: height.gate.toString(),
        label: `${height.gate}MM`,
        sheet: height.sheet,
      };
    });
  } else {
    return [];
  }
}

export const footingDepthGuide: {
  [key: string]: Array<{ [key: string]: number }>;
} = {
  soft_clay: [
    { "2": 400, "3": 600, "4": 700 },
    { "2": 500, "3": 600 },
  ],
  medium_dense_sand: [
    { "2": 300, "3": 400, "4": 400 },
    { "2": 300, "3": 400 },
  ],
  rock_concrete: [
    { "2": 200, "3": 200, "4": 300 },
    { "2": 200, "3": 300 },
  ],
};

export function getItems(
  details: FencingDetailResponse,
  fence: Fence,
  gateDetails: { [key: string]: GateDetailResponse },
) {
  const items: Array<AppState["cart"][0]> = [];
  const panelWidth = fence.panelWidth as number;
  const panelHeight = fence.panelHeight as number;
  const fenceType = fence.fenceType!.toLowerCase();
  const panelsCount = Math.floor(
    ((fence.totalFenceLength as number) * 1000) / panelWidth,
  );
  const remainingWidth =
    ((fence.totalFenceLength as number) * 1000) % panelWidth;
  let shorterPanelConfig;
  if (remainingWidth > 750) {
    shorterPanelConfig = {
      sheets: 2,
    };
  } else if (remainingWidth !== 0) {
    shorterPanelConfig = {
      sheets: 1,
    };
  }
  const sheetsPerPanel = Math.ceil(panelWidth / 800);

  // infill_sheets
  const sheetHeight = fence.extension ? panelHeight - 300 : panelHeight;
  const fenceSheet = getInfillSheet(fenceType, sheetHeight, details);

  items.push({
    qty: panelsCount * sheetsPerPanel + (shorterPanelConfig?.sheets || 0),
    product: fenceSheet!.itemId,
    variant: fenceSheet!.variantId,
    price: fenceSheet!.price,
    type: "standard",
    name: "",
    itemName: fenceSheet!.description,
    colour: fenceSheet!.colour?.Colour_Name || "Unpainted",
  });

  // extensions
  if (fence.extension) {
    const extension = getExtension(fence.extension, sheetsPerPanel, details);
    items.push({
      qty: panelsCount,
      product: extension!.itemId,
      variant: extension!.variantId,
      price: extension!.price,
      type: "standard",
      name: "",
      itemName: extension!.description,
      colour: extension!.colour?.Colour_Name || "Unpainted",
    });
    if (shorterPanelConfig) {
      const shorterPanelExtension = getExtension(
        fence.extension,
        shorterPanelConfig.sheets,
        details,
      );
      items.push({
        qty: 1,
        product: shorterPanelExtension!.itemId,
        variant: shorterPanelExtension!.variantId,
        price: shorterPanelExtension!.price,
        type: "standard",
        name: "",
        itemName: shorterPanelExtension!.description,
        colour: shorterPanelExtension!.colour?.Colour_Name || "Unpainted",
      });
    }
  }

  // universal rail
  const standardUVRail = details.rail.find(
    (item) => item.type.toLowerCase() === fenceType && item.width >= panelWidth,
  );
  const railsPerPanel = fence.extension ? 3 : 2;

  items.push({
    qty: panelsCount * railsPerPanel,
    product: standardUVRail!.itemId,
    variant: standardUVRail!.variantId,
    price: standardUVRail!.price,
    type: "standard",
    name: "",
    itemName: standardUVRail!.description,
    colour: standardUVRail!.colour?.Colour_Name || "Unpainted",
  });

  if (shorterPanelConfig) {
    const shorterPanelRail = details.rail.find(
      (item) =>
        item.type.toLowerCase() === fenceType && item.width >= remainingWidth,
    );
    items.push({
      qty: fence.extension ? 3 : 2,
      product: shorterPanelRail!.itemId,
      variant: shorterPanelRail!.variantId,
      price: shorterPanelRail!.price,
      type: "standard",
      name: "",
      itemName: shorterPanelRail!.description,
      colour: shorterPanelRail!.colour?.Colour_Name || "Unpainted",
    });
  }

  // central rail
  const miniscreenRegex = /^miniscreen/i;
  if (miniscreenRegex.test(fenceType)) {
    const standardCRail = details.centre_rail.find(
      (item) => item.width >= panelWidth,
    );

    items.push({
      qty: panelsCount,
      product: standardCRail!.itemId,
      variant: standardCRail!.variantId,
      price: standardCRail!.price,
      type: "standard",
      name: "",
      itemName: standardCRail!.description,
      colour: standardCRail!.colour?.Colour_Name || "Unpainted",
    });

    if (shorterPanelConfig) {
      const shorterPanelCRail = details.centre_rail.find(
        (item) => item.width >= remainingWidth,
      );

      items.push({
        qty: 1,
        product: shorterPanelCRail!.itemId,
        variant: shorterPanelCRail!.variantId,
        price: shorterPanelCRail!.price,
        type: "standard",
        name: "",
        itemName: shorterPanelCRail!.description,
        colour: shorterPanelCRail!.colour?.Colour_Name || "Unpainted",
      });
    }
  }

  // posts
  // screws for posts
  const screwsToColours = details.screws.reduce(
    (acc, curr) => {
      if (!acc[curr.type]) {
        acc[curr.type] = curr.colour?.Colour_Code || "Unpainted";
      }
      return acc;
    },
    {} as Record<string, string>,
  );
  let s10x16x16 = { [screwsToColours["s10x16x16"]]: 0 };
  let s12x24x32 = { [screwsToColours["s12x24x32"]]: 0 };
  const runEnds = fence.runEnds as number;
  const corners = fence.corners as number;
  const intermediateJoints =
    panelsCount + 1 + (shorterPanelConfig ? 1 : 0) - runEnds - corners;

  let posts = 2 * intermediateJoints;
  let squarePosts = 0;
  let postStiffeners = 0;

  if (fence.postStiffners) {
    s10x16x16[screwsToColours["s10x16x16"]] += 4 * intermediateJoints;
    s12x24x32[screwsToColours["s12x24x32"]] += 4 * intermediateJoints;
    postStiffeners += 2 * intermediateJoints;
  } else {
    s10x16x16[screwsToColours["s10x16x16"]] += 7 * intermediateJoints;
  }

  if (fence.runEndsConfig === "square") {
    posts += runEnds;
    squarePosts += runEnds;
    s10x16x16[screwsToColours["s10x16x16"]] += 4 * runEnds;
  } else {
    posts += 2 * runEnds;
    if (fence.postStiffners) {
      postStiffeners += fence.postStiffners ? 2 * runEnds : 0;
      s10x16x16[screwsToColours["s10x16x16"]] += 4 * runEnds;
      s12x24x32[screwsToColours["s12x24x32"]] += 4 * runEnds;
    } else {
      s10x16x16[screwsToColours["s10x16x16"]] += 7 * runEnds;
    }
  }

  if (fence.cornersConfig === "square") {
    posts += 2 * corners;
    squarePosts += corners;
    s10x16x16[screwsToColours["s10x16x16"]] += 8 * corners;
  } else {
    posts += 3 * corners;
    if (fence.postStiffners) {
      postStiffeners += 3 * corners;
      s10x16x16[screwsToColours["s10x16x16"]] = 12 * corners;
      s12x24x32[screwsToColours["s12x24x32"]] = 8 * corners;
    } else {
      s10x16x16[screwsToColours["s10x16x16"]] += 15 * corners;
    }
  }
  const minPostHeight =
    panelHeight +
    (fence.footingDepth as number) +
    (fence.groundClearance as number) -
    150;
  const maxPostHeight =
    panelHeight +
    (fence.footingDepth as number) +
    (fence.groundClearance as number) -
    40;
  const standardPost = details.standard_post.find(
    (item) =>
      item.type.toLowerCase() === fenceType &&
      item.height >= minPostHeight &&
      item.height <= maxPostHeight,
  );

  if (standardPost) {
    items.push({
      qty: posts,
      product: standardPost.itemId,
      variant: standardPost.variantId,
      price: standardPost.price,
      type: "standard",
      name: "",
      itemName: standardPost.description,
      colour: standardPost!.colour?.Colour_Name || "Unpainted",
    });
  } else {
    const largerPost = details.standard_post.find(
      (item) =>
        item.type.toLowerCase() === fenceType && item.height >= minPostHeight,
    );
    items.push({
      qty: posts,
      product: largerPost!.itemId,
      variant: largerPost!.variantId,
      price: largerPost!.price,
      type: "standard",
      name: "",
      itemName: largerPost!.description,
      colour: largerPost!.colour?.Colour_Name || "Unpainted",
    });
  }

  if (squarePosts > 0) {
    const post = details.square_post.find(
      (item) =>
        item.width === 60 &&
        item.height >= minPostHeight &&
        item.height <= maxPostHeight,
    );
    if (post) {
      items.push({
        qty: squarePosts,
        product: post.itemId,
        variant: post.variantId,
        price: post.price,
        type: "standard",
        name: "",
        itemName: post.description,
        colour: post.colour?.Colour_Name || "Unpainted",
      });
    } else {
      const largerPost = details.square_post.find(
        (item) => item.width === 60 && item.height >= minPostHeight,
      );
      items.push({
        qty: squarePosts,
        product: largerPost!.itemId,
        variant: largerPost!.variantId,
        price: largerPost!.price,
        type: "standard",
        name: "",
        itemName: largerPost!.description,
        colour: largerPost!.colour?.Colour_Name || "Unpainted",
      });
    }
  }

  // post caps
  const standardCap =
    details.post_cap.length > 0 ? details.post_cap[0] : undefined;
  if (standardCap) {
    items.push({
      qty: Math.ceil(posts / 2),
      product: standardCap.itemId,
      variant: standardCap.variantId,
      price: standardCap.price,
      type: "standard",
      name: "",
      itemName: standardCap.description,
      colour: standardCap!.colour?.Colour_Name || "Unpainted",
    });
  }

  const squareCap = details.square_post_cap.find((item) => item.width === 60);
  if (squareCap && squarePosts > 0) {
    items.push({
      qty: squarePosts,
      product: squareCap!.itemId,
      variant: squareCap!.variantId,
      price: squareCap!.price,
      type: "standard",
      name: "",
      itemName: squareCap!.description,
      colour: squareCap!.colour?.Colour_Name || "Unpainted",
    });
  }

  // post stiffners
  if (postStiffeners > 0) {
    const standardPostStiffner =
      details.post_stiffener.length > 0 ? details.post_stiffener[0] : undefined;
    if (standardPostStiffner) {
      items.push({
        qty: postStiffeners,
        product: standardPostStiffner.itemId,
        variant: standardPostStiffner.variantId,
        price: standardPostStiffner.price,
        type: "standard",
        name: "",
        itemName: standardPostStiffner.description,
        colour: standardPostStiffner!.colour?.Colour_Name || "Unpainted",
      });
    }
  }

  // screws
  let s12x14x45 = { [screwsToColours["s12x14x45"]]: 0 };
  let s10x16x20 = { [screwsToColours["s10x16x20"]]: 0 };

  // for rails
  s10x16x16[screwsToColours["s10x16x16"]] +=
    8 * (panelsCount + (shorterPanelConfig ? 1 : 0));

  if (fence.extension) {
    s10x16x16[screwsToColours["s10x16x16"]] +=
      10 * (panelsCount + (shorterPanelConfig ? 1 : 0));
  }

  if (miniscreenRegex.test(fenceType)) {
    s10x16x20[screwsToColours["s10x16x20"]] +=
      7 * (panelsCount + (shorterPanelConfig ? 1 : 0));
  }

  // for post cap
  s10x16x16[screwsToColours["s10x16x16"]] += posts;

  if (sheetsPerPanel === 4) {
    // sheet to rail with 4 sheets
    s12x14x45[screwsToColours["s12x14x45"]] +=
      3 * (panelsCount + (shorterPanelConfig ? 1 : 0));
  }

  // gates
  fence.gates.forEach((gate) => {
    const details = gateDetails[gate.colour as string];
    const screwsToColours = details.screws.reduce(
      (acc, curr) => {
        if (!acc[curr.type]) {
          acc[curr.type] = curr.colour?.Colour_Code || "Unpainted";
        }
        return acc;
      },
      {} as Record<string, string>,
    );
    if (!s10x16x16[screwsToColours["s10x16x16"]]) {
      s10x16x16[screwsToColours["s10x16x16"]] = 0;
    }
    if (!s12x14x45[screwsToColours["s12x14x45"]]) {
      s12x14x45[screwsToColours["s12x14x45"]] = 0;
    }
    if (!s10x16x20[screwsToColours["s10x16x20"]]) {
      s10x16x20[screwsToColours["s10x16x20"]] = 0;
    }
    // infill_sheet
    const gateSheetHeight = gate.extension
      ? (gate.sheetHeight as number) - 300
      : (gate.sheetHeight as number);
    const sheet = getInfillSheet(gate.type as string, gateSheetHeight, details);
    const sheetsPerGate = gate.size === "standard" ? 1 : 2;
    items.push({
      qty: sheetsPerGate,
      product: sheet!.itemId,
      variant: sheet!.variantId,
      price: sheet!.price,
      type: "standard",
      name: "",
      itemName: sheet!.description,
      colour: sheet!.colour?.Colour_Name || "Unpainted",
    });

    // extension
    if (gate.extension) {
      const extension = getExtension(gate.extension, sheetsPerGate, details);
      items.push({
        qty: 1,
        product: extension!.itemId,
        variant: extension!.variantId,
        price: extension!.price,
        type: "standard",
        name: "",
        itemName: extension!.description,
        colour: extension!.colour?.Colour_Name || "Unpainted",
      });
    }

    // gate accessory kit
    const kit = details.gate_acc_kit.find(
      (item) => item.size === gate.size && item.accKitType === gate.accKitType,
    );
    items.push({
      qty: 1,
      product: kit!.itemId,
      variant: kit!.variantId,
      price: kit!.price,
      type: "standard",
      name: "",
      itemName: kit!.description,
      colour: kit!.colour?.Colour_Name || "Unpainted",
    });

    // gate kit
    const gateKit = details.gate_kit.find(
      (item) =>
        item.type.toLowerCase() === gate.type!.toLowerCase() &&
        item.size === gate.size &&
        item.height === gate.height &&
        item.extension === !!gate.extension,
    );
    items.push({
      qty: 1,
      product: gateKit!.itemId,
      variant: gateKit!.variantId,
      price: gateKit!.price,
      type: "standard",
      name: "",
      itemName: gateKit!.description,
      colour: gateKit!.colour?.Colour_Name || "Unpainted",
    });
    // posts
    const minPostHeight =
      (gate.height as number) +
      (fence.footingDepth as number) +
      (fence.groundClearance as number) -
      150;
    const maxPostHeight =
      (gate.height as number) +
      (fence.footingDepth as number) +
      (fence.groundClearance as number) -
      40;

    const post = details.square_post.find(
      (item) =>
        item.width === (gate.size === "xwide" ? 65 : 60) &&
        item.height >= minPostHeight &&
        item.height <= maxPostHeight,
    );

    if (post) {
      items.push({
        qty: 2,
        product: post!.itemId,
        variant: post!.variantId,
        price: post!.price,
        type: "standard",
        name: "",
        itemName: post!.description,
        colour: post!.colour?.Colour_Name || "Unpainted",
      });
    } else {
      const largerPost = details.square_post.find(
        (item) =>
          item.width === (gate.size === "xwide" ? 65 : 60) &&
          item.height >= minPostHeight,
      );
      items.push({
        qty: 2,
        product: largerPost!.itemId,
        variant: largerPost!.variantId,
        price: largerPost!.price,
        type: "standard",
        name: "",
        itemName: largerPost!.description,
        colour: largerPost!.colour?.Colour_Name || "Unpainted",
      });
    }

    // post cap
    const postCap = details.square_post_cap.find(
      (item) => item.width === (gate.size === "xwide" ? 65 : 60),
    );
    if (postCap) {
      items.push({
        qty: 2,
        product: postCap!.itemId,
        variant: postCap!.variantId,
        price: postCap!.price,
        type: "standard",
        name: "",
        itemName: postCap!.description,
        colour: postCap!.colour?.Colour_Name || "Unpainted",
      });
    }

    // edge cover strip
    if (gate.edgeCoverStrip) {
      const coverStrip = details.edge_cover_strip.find(
        (item) => item.sheetHeight === gateSheetHeight,
      );
      if (coverStrip) {
        items.push({
          qty: 1,
          product: coverStrip!.itemId,
          variant: coverStrip!.variantId,
          price: coverStrip!.price,
          type: "standard",
          name: "",
          itemName: coverStrip!.description,
          colour: coverStrip!.colour?.Colour_Name || "Unpainted",
        });
      }
    }

    // additional screws for gates
    if (gate.size === "xwide") {
      // stiching sheets together
      s10x16x16[screwsToColours["s10x16x16"]] += 2;
      // rails to stile
      s10x16x16[screwsToColours["s10x16x16"]] += 12;
      s12x14x45[screwsToColours["s12x14x45"]] += 4;

      if (gate.extension) {
        // gate clip to stile
        s10x16x16[screwsToColours["s10x16x16"]] += 4;
        // additional for rails to stile
        s10x16x16[screwsToColours["s10x16x16"]] += 4;
        s12x14x45[screwsToColours["s12x14x45"]] += 4;
        // lattice to rail
        s12x14x45[screwsToColours["s12x14x45"]] += 6;
      }
    } else {
      // rails to stile
      s10x16x16[screwsToColours["s10x16x16"]] += 16;

      if (gate.extension) {
        // gate clip to stile
        s10x16x16[screwsToColours["s10x16x16"]] += 4;
        // additional for rails to stile
        s12x14x45[screwsToColours["s12x14x45"]] += 2;
        // lattice to rail
        s10x16x16[screwsToColours["s10x16x16"]] += 5;
      }
    }
    // only for miniscreen
    if (miniscreenRegex.test(gate.type as string)) {
      // centre rail clip to stile
      s10x16x16[screwsToColours["s10x16x16"]] += 2;
      // centre rail to sheet
      s10x16x20[screwsToColours["s10x16x20"]] += gate.size === "xwide" ? 5 : 3;
    }
  });

  const screwsToSizes = details.screws.reduce(
    (acc, curr) => {
      const colour = curr.colour?.Colour_Code || "Unpainted";
      if (!acc[curr.type]) {
        acc[curr.type] = {
          [colour]: [],
        };
      }
      acc[curr.type][colour].push({ ...curr, qty: curr.size });
      return acc;
    },
    {} as {
      [key: string]: {
        [key: string]: Array<
          FencingDetailResponse["screws"][0] & { qty: number }
        >;
      };
    },
  );

  for (const details of Object.values(gateDetails)) {
    details.screws.forEach((screw) => {
      const type = screw.type;
      const colour = screw.colour?.Colour_Code || "Unpainted";
      if (!screwsToSizes[type]) {
        screwsToSizes[type] = {
          [colour]: [],
        };
      } else if (!screwsToSizes[type][colour]) {
        screwsToSizes[type][colour] = [{ ...screw, qty: screw.size }];
      } else if (
        screwsToSizes[type][colour].findIndex(
          (item) => item.size === screw.size,
        ) === -1
      ) {
        screwsToSizes[type][colour].push({ ...screw, qty: screw.size });
      }
    });
  }

  for (const [col, qty] of Object.entries(s10x16x16)) {
    const sizes = screwsToSizes["s10x16x16"]
      ? screwsToSizes["s10x16x16"][col] || []
      : [];
    if (qty > 0 && sizes.length > 0) {
      getScrewPktCounts(qty, sizes, items);
    }
  }

  for (const [col, qty] of Object.entries(s10x16x20)) {
    const sizes = screwsToSizes["s10x16x20"]
      ? screwsToSizes["s10x16x20"][col] || []
      : [];
    if (qty > 0 && sizes.length > 0) {
      getScrewPktCounts(qty, sizes, items);
    }
  }

  for (const [col, qty] of Object.entries(s12x14x45)) {
    const sizes = screwsToSizes["s12x14x45"]
      ? screwsToSizes["s12x14x45"][col] || []
      : [];
    if (qty > 0 && sizes.length > 0) {
      getScrewPktCounts(qty, sizes, items);
    }
  }
  for (const [col, qty] of Object.entries(s12x24x32)) {
    const sizes = screwsToSizes["s12x24x32"]
      ? screwsToSizes["s12x24x32"][col] || []
      : [];
    if (qty > 0 && sizes.length > 0) {
      getScrewPktCounts(qty, sizes, items);
    }
  }

  // de-dupe items
  const idToItem = items.reduce(
    (acc, curr) => {
      const id = `${curr.product}-${curr.variant}`;
      if (!acc[id]) {
        acc[id] = curr;
      } else {
        const otherItem = acc[id];
        if (otherItem.type === "standard" && curr.type === "standard") {
          otherItem.qty += curr.qty;
        } else {
          (curr as any).cuttingList.forEach((record: any) => {
            const existing = (otherItem as any).cuttingList.find(
              (item: { size: number }) => item.size === record.size,
            );
            if (existing) {
              existing.qty += record.qty;
            } else {
              (otherItem as any).cuttingList.push(record);
            }
          });
        }
      }
      return acc;
    },
    {} as { [key: string]: (typeof items)[0] },
  );

  return Object.values(idToItem);
}

function getInfillSheet(
  fenceType: string,
  height: number,
  details: { infill_sheet: FencingDetailResponse["infill_sheet"] },
) {
  const sheet = details.infill_sheet.find(
    (item) =>
      item.type.toLowerCase() === fenceType.toLowerCase() &&
      item.height >= height,
  );
  return sheet;
}

function getExtension(
  extension: string,
  sheetCount: number,
  details: { extension: FencingDetailResponse["extension"] },
) {
  const extensionObj = details.extension.find(
    (item) =>
      item.type.toLowerCase() === extension.toLowerCase() &&
      item.sheets === sheetCount,
  );
  return extensionObj;
}

export function getColourOptions(
  item: Pick<FormattedFenceType, "colours" | "extensions"> | undefined,
  extension?: string,
) {
  if (!item) {
    return [];
  }
  let colours = item.colours;
  if (extension) {
    const extensionObj = item.extensions.find(
      (item) => item.type === extension,
    );
    if (extensionObj && extensionObj.colours) {
      colours = extensionObj.colours;
    }
  }
  return colours.map((option) => ({
    label: option.Colour_Name,
    id: option._id,
    extraData: {
      code: option.Colour_Code,
    },
  }));
}

export function renderColour(
  item: DropdownOption<{ code: string }>,
  selected?: string,
) {
  return (
    <div
      className={`flex items-center px-9 py-4 cursor-pointer justify-between ${
        item.id !== selected ? "bg-on-primary" : "bg-surface"
      } hover:bg-surface`}
    >
      <div className="flex">
        <div
          className={`rounded-full w-6 h-6`}
          style={{ backgroundColor: `#${item.extraData!.code}` }}
        />
        <div className="text-sm font-semibold ml-2">{item.label}</div>
      </div>
    </div>
  );
}

function getScrewPktCounts(
  requirements: number,
  sizes: Array<FencingDetailResponse["screws"][0] & { qty: number }>,
  items: Array<any>,
) {
  const tempItems = [];
  let left = requirements;
  const screwPkgs = sizes;
  let extra = 0;
  for (let i = screwPkgs.length - 1; i >= 0; i--) {
    if (left > screwPkgs[i].qty) {
      if (i > 0) {
        const count = Math.floor(left / screwPkgs[i].qty);
        tempItems.push({
          qty: count,
          product: screwPkgs[i]!.itemId,
          variant: screwPkgs[i]!.variantId,
          price: screwPkgs[i]!.price,
          type: "standard",
          name: "",
          itemName: screwPkgs[i]!.description,
          colour: screwPkgs[i]!.colour?.Colour_Name || "Unpainted",
        });
        left -= count * screwPkgs[i].qty;
      } else {
        const count = Math.ceil(left / screwPkgs[i].qty);
        tempItems.push({
          qty: count,
          product: screwPkgs[i]!.itemId,
          variant: screwPkgs[i]!.variantId,
          price: screwPkgs[i]!.price,
          type: "standard",
          name: "",
          itemName: screwPkgs[i]!.description,
          colour: screwPkgs[i]!.colour?.Colour_Name || "Unpainted",
        });
        left -= count * screwPkgs[i].qty;
        extra = -left;
      }
    }
  }

  if (tempItems.length === 0) {
    items.push({
      qty: 1,
      product: screwPkgs[0]!.itemId,
      variant: screwPkgs[0]!.variantId,
      price: screwPkgs[0]!.price,
      type: "standard",
      name: "",
      itemName: screwPkgs[0]!.description,
      colour: screwPkgs[0]!.colour?.Colour_Name || "Unpainted",
    });
    return;
  }

  if (extra < 50) {
    if (tempItems[tempItems.length - 1].variant === screwPkgs[0]!.variantId) {
      tempItems[tempItems.length - 1].qty++;
    } else {
      tempItems.push({
        qty: 1,
        product: screwPkgs[0]!.itemId,
        variant: screwPkgs[0]!.variantId,
        price: screwPkgs[0]!.price,
        type: "standard",
        name: "",
        itemName: screwPkgs[0]!.description,
        colour: screwPkgs[0]!.colour?.Colour_Name || "Unpainted",
      });
    }
  }

  // optimise cost
  // for each size, if (larger pack / smaller pack) = x,
  // then number of smaller packs would be between 1 to x
  // if cost of large one pack is less then x smaller ones, replace
  // the smaller ones with one large pack. Large one will have enough
  // units to be >= x smaller packs
  for (let i = tempItems.length - 1; i > 0; i--) {
    const cost = tempItems[i].qty * tempItems[i].price;
    const largerCost = tempItems[i - 1].qty * tempItems[i - 1].price;
    if (largerCost <= cost) {
      tempItems[i - 1].qty++;
      tempItems[i].qty = 0;
    }
  }
  items.push(...tempItems.filter((record) => record.qty > 0));
}
