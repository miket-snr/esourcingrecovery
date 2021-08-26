export interface TenderReference {
     guid: string;
     email: string;
     bidGuid: string;
}
export interface BidItem {
   ITEMNO?: string;
  ASSUMPTION?: string;
  BIDPRICE?: number;
  LEADTIME?: string;
  VALIDITY?: string;
  BIDDATE?: string;
  CLEAN?: boolean;
  QUANTITY?: number;
  UOM?: string;
  LINEPRICE?: number;
  REJECTED?: string;
  }

export interface BidResponse  extends TenderReference {
     longtext?: string;
     quality?: string;
     lastdate?: string;
  }
export interface BidPriceResponse extends TenderReference, BidItem {
  lastdate?: string;
}
export interface TenderInfo {
    ITEMNO?: string;
    MATERIAL?: string;
    MTEXT?: string;
    MLONGTEXT?: string;
    QUANTITY?: number;
    UOM?: string;
    VALIDITY?: string;

  }

export interface Bid   {
    response?: string;
    acceptance?: string;
    validity?: string;
  }

export interface TenderItem extends TenderInfo, BidItem {
  clean?: boolean ;
  }

export interface Tender  extends TenderReference {
  vendor?: string;
   refNo?: string;
   refType?: string;
   rfqNo?: string;
   refText?: string;
   reqText?: string;
   cutoff?: string ;
   cutofftime?: string;
   locationname?: string;
   locationgps?: string;
   validity?: string ;
   contactEmail?: string;
   contactTel?: string;
   contactName?: string ;
   tenderItems?: TenderItem[];
   response?: Bid;
}
