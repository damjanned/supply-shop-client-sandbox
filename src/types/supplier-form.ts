export type BranchDetails = {
  name: string;
  availableDays: string[];
  cutoffTimeForNextDay?: string;
  estimatedDeliveryTime: string;
  deliveryCost: string;
  pickupAvailable: boolean;
  pickupDetails?: {
    pickupHours: string;
    pickupLocation?: string;
  };
};

export type PricingDetails = {
  DeliveryAndPackagingRules: string;
  PackagingCharges: string;
  MiscellaneousCharges: string;
  DeliveryConditions: string;
  Definitions: string;
};
