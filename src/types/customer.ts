export interface CustomerProfile {
  Customer_Name: string;
  Customer_Email: string;
  Customer_Phone: string;
  Business?: {
    Business_ABN: string;
    Business_Address: string;
    Business_Name: string;
    Business_Phone: string;
    Business_Email: string;
    Credit_Limit_Amount?: number;
    Credit_Limit_Available_Amount?: number;
  };
}

export interface Customer {
  Customer_Name: string;
  Customer_Type: "Individual" | "Business";
  Customer_Email: string;
  Customer_Phone: string;
  Customer_Business_ABN: string;
  Customer_Business_Name: string;
  Customer_Business_Address: string;
  Customer_Business_Phone: string;
  Customer_Business_Email: string;
  Credit_Limit_Amount?: number;
  Credit_Limit_Available_Amount?: number;
}
