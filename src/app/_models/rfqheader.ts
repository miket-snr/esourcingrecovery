export class RFQHeader {
  GUID: string;
  SUBMI: string;
  RFQNO: string;
  CUTOFF: string;
  VENDORNO: string;
  VENDOR: string;
  OBJTYPE: string;
  REQUEST: string;
}

export class RFQDocs {
   MANDT: string;
   APIKEY: string;
   DOCNO: string;
   PARTNER: string;
   COUNTER: string;
   CONTENT: string;
   DATELOADED: string;
   LOADEDBY: string;
   IMPORTED: string;
   ORIGINALNAME: string;
   FILESIZE: string;
   MIMETYPE: string;
   CHARSHOLDER: string;
}

export class RfcObj {
     MANDT: string;
     GUID: string;
     OBJ: string;
     OBJ_TYPE: string;
     CONTEXT: string;
     SUB_CONTEXT: string;
     CREATED: number;
     DATA: string;
     DATA_TYPE: string;
     MODIFIED: number;
     DATA_MD5: string;
     TAGS: string;
     KEYS: string;
}

export class RfqControl {
  CREATED: string;
  STARTDATE: string;
  CUTOFFDATE: string;
  CUTOFFTIME: string;
  RELEASED: string;
  CREATEDBY: string;
  RELEASEDBY: string;
  CONTACTMAIL: string;
  CONTACTTEL: string;
  CONTACTNAME: string;
  DELIVERYDATE: string;
  CLOSED: string;
  CLOSEDBY: string;
  VALIDITY?: string ;
}
