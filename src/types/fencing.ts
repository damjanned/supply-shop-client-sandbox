export interface FenceType {
  type: string;
  name: string;
  widths: Array<number>;
  heights: Array<number>;
  extensions: Array<{
    image: string;
    name: string;
    type: string;
    colours?: string[];
  }>;
  colours: string[];
  image: string;
}

export interface GateType
  extends Pick<FenceType, "type" | "extensions" | "colours"> {
  edge_cover: boolean;
  heights: Array<{ gate: number; sheet: number }>;
  extensionHeights: Array<{ gate: number; sheet: number }>;
}

export interface FencingDetailResponse {
  infill_sheet: Array<InfillSheetsDetails>;
  extension: Array<ExtensionDetails>;
  rail: Array<RailDetails>;
  centre_rail: Array<CentreRailDetails>;
  standard_post: Array<PostDetails>;
  square_post: Array<SquarePostDetails>;
  post_stiffener: Array<FenceItemDetails>;
  post_cap: Array<FenceItemDetails>;
  square_post_cap: Array<SquarePostCapDetails>;
  screws: Array<ScrewsDetails>;
}

export interface GateDetailResponse {
  gate_kit: Array<GateKitDetails>;
  gate_acc_kit: Array<GateAccessoryKitDetails>;
  edge_cover_strip: Array<EdgeCoverStripDetails>;
  infill_sheet: Array<InfillSheetsDetails>;
  extension: Array<ExtensionDetails>;
  square_post: Array<SquarePostDetails>;
  square_post_cap: Array<SquarePostCapDetails>;
  screws: Array<ScrewsDetails>;
}

interface FenceItemDetails {
  description: string;
  itemId: string;
  variantId: string;
  price: number;
  colour: {
    _id: string;
    Colour_Code: string;
    Colour_Name: string;
  };
}

interface InfillSheetsDetails extends FenceItemDetails {
  type: string;
  height: number;
}
interface ExtensionDetails extends FenceItemDetails {
  type: string;
  sheets: number;
}

interface RailDetails extends FenceItemDetails {
  type: string;
  width: number;
}

interface PostDetails extends FenceItemDetails {
  height: number;
  type: string;
}

interface SquarePostDetails extends PostDetails {
  width: number;
}

interface SquarePostCapDetails extends FenceItemDetails {
  width: number;
}

interface ScrewsDetails extends FenceItemDetails {
  size: number;
  type: string;
}

interface GateAccessoryKitDetails extends FenceItemDetails {
  size: "standard" | "xwide";
  accKitType: "standard" | "economic" | "premium";
}

interface GateKitDetails extends FenceItemDetails {
  type: string;
  height: number;
  extension: boolean;
  size: "standard" | "xwide";
}

interface EdgeCoverStripDetails extends FenceItemDetails {
  sheetHeight: number;
}

type CentreRailDetails = Omit<RailDetails, "type">;
