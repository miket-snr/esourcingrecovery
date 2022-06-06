import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { of, BehaviorSubject, Subject, Observable, Subscription } from 'rxjs';
import { RFQHeader, RFQItem, DMSHeader, APIReply, RFQDocs, RfcObj, RfqControl, Tender, Bid, BidItem, TenderItem } from '@app/_models';
// import { AuthService } from '../auth/auth.service';
import { User } from 'src/app/_models';
import { map } from 'rxjs/internal/operators/map';
import { AuthenticateService } from './authenticate.service';

@Injectable({
  providedIn: 'root'
})
export class RfqAPIService {

  RFQList = new BehaviorSubject<RFQHeader[]>(null);
  rfqList = this.RFQList.asObservable();
  selectedRFQ = new BehaviorSubject<RFQHeader>(null);
  public rfqDoc = this.selectedRFQ.asObservable();
  devproddetermine = window.location.href;
  devprod = '';

  public tender = new BehaviorSubject<Tender>(null);
  public currentTender = this.tender.asObservable();
  private docsOwingBS = new BehaviorSubject('');
  public docsoutstanding = this.docsOwingBS.asObservable();
  private devProdBS = new BehaviorSubject('ECD');
  public devProdOBS = this.devProdBS.asObservable();
  public bid: Bid;
  public apiReply: APIReply[];
  public replyDocs: RFQDocs[];
  public tenderDocs: RFQDocs[];
  public tenderHeader: BehaviorSubject<RfcObj> = new BehaviorSubject(null);
  public tenderLine: BehaviorSubject<RfcObj> = new BehaviorSubject(null);
  public infoControl: RfqControl;
  public openitems = 0;
  public orchlist = { show: 'baselist' };
  public currentRFQDoc: BehaviorSubject<RFQHeader> = new BehaviorSubject(null);

  public currentRFQItems: BehaviorSubject<TenderItem[]>;
  public RFQItemsSub: Subscription;
  public rfqItems: TenderItem[];

  public currentfocusItem: BehaviorSubject<TenderItem>;
  public focusItem: Subscription;
  public currentfocusItemval: TenderItem;

  public currentUser: User;
  private headerTextBS = new BehaviorSubject<string>('Request for Quotation');
  public headerTextOB = this.headerTextBS.asObservable();
  private standardTextBS = new BehaviorSubject<string[]>([`With almost 2 decades of experience within the facilities management sector,
  we are renowned for having the most competent technical skills and experience within this sector,
  covering all aspects of facilities management services generally, mechanical and electrical maintenance and
  engineering, environmental health & safety, energy and project management.`,
  `Your company has been selected to be eligible to quote us for work and services.
  By selecting you as a bidder, we know that you have the same culture of service and quality`]);
  public standardTextOB = this.standardTextBS.asObservable();
  public tenderdoclist = new BehaviorSubject<any>(null);
  public biddoclist = new BehaviorSubject<any>(null);
  public currentblob = new BehaviorSubject<Blob>(null);
  private rfqcommentsBS = new BehaviorSubject([]);
  public rfqcommentsOB = this.rfqcommentsBS.asObservable();

  constructor(private http: HttpClient, private auths: AuthenticateService) {

    // tslint:disable-next-line:max-line-length
    this.devprod =  (this.devproddetermine.toUpperCase().includes('DEV') || this.devproddetermine.toUpperCase().includes('LOCAL') ) ? 'DEV' : 'PROD' ;
    this.auths.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.getStandards();

    this.selectedRFQ.subscribe(data => {
      if (data) {
        this.getRfq(data.RFQNO, data.GUID).subscribe(datax => {
          console.log(datax);
        });
      } else {
        this.tender.next(null);
      }
    });

    this.currentRFQItems = new BehaviorSubject<TenderItem[]>(null);
    this.RFQItemsSub = this.currentRFQItems.subscribe(data => {
      this.rfqItems = data;
      if (Array.isArray(this.rfqItems)) {
        this.rfqItems.forEach(itemof => {
          itemof.QUANTITY = (itemof.QUANTITY === 0) ? 1 : itemof.QUANTITY;
          itemof.UOM = (itemof.UOM === '') ? 'ea' : itemof.UOM;
        });
      }
    });
    this.currentfocusItem = new BehaviorSubject<TenderItem>(null);
    this.focusItem = this.currentfocusItem.subscribe(data => {
      this.currentfocusItemval = data;
    });
  }
  /***************************************************** */
  getStandards() {
  //  this.tenderLine.KEYS = JSON.stringify(this.rfqItems);
    // Call API //
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        token: 'BK175mqMN0',
      })
    };
    const call2 = {
          context: {
            CLASS: 'RFQ',
            TOKEN: 'BK175mqMN0',
            METHOD: 'RFQ_GETSTANDARDTEXT'
                },
           data: {STANDARDS: 'Yes',
                  CONTEXT: ' '}
      };
    this.http.post('https://io.bidvestfm.co.za/BIDVESTFM_API_ZRFC/request?sys=' + this.devprod,
          call2 , httpOptions).subscribe( data => {
        // tslint:disable-next-line:no-string-literal
        this.standardTextBS.next(data['RESULT']['RESULT'] );
      });

  }
  /***************************************************** */
  putReassignment(newuser: any): Observable<any> {
    //  this.tenderLine.KEYS = JSON.stringify(this.rfqItems);
      // Call API //
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          token: 'BK175mqMN0',
        })
      };
      const call2 = {
            context: {
              CLASS: 'RFQ',
              TOKEN: 'BK175mqMN0',
              METHOD: 'REASSIGN'
                  },
             data: { CONTEXT: JSON.stringify(newuser)}
        };
      return this.http.post('https://io.bidvestfm.co.za/BIDVESTFM_API_ZRFC/request?sys=' + this.devprod ,
            call2 , httpOptions);

    }
    /***************************************************** */
  getRfqList(vendor: string) {
    const lrfqList: RFQHeader[] = [];
    let rfqtokenstring = '';


    const rfqtoken = localStorage.getItem('BFMtoken');
    if (rfqtoken) {
      rfqtokenstring = ',RFQTOKEN:' + rfqtoken;
    } else {
      rfqtokenstring = ' ';
    }
    const context = '{' + 'EMAIL:' +
      this.auths.currentUserValue.username +
      rfqtokenstring +
      ',VENDOR:' + vendor + ',HEADER:X }';
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer 123456')
      .set('apikey', 'GENAPP')
      .set('runon', this.devprod);
    const params = new HttpParams()
      .set('Partner', 'ALL')
      .set('Class', 'RFQL')
      .set('CallContext', context);
    this.http
      .get<any>(environment.BASE_API + '/api/sap/rfq/getlist/email', {
        params , headers
      })
      .subscribe(data => {
        if (data.ServicesList instanceof Array) {
          for (const rfqdoc of data.ServicesList) {
            const tobj = JSON.parse(rfqdoc.JsonsetJstext);
            const rfqline: RFQHeader = new RFQHeader();
            rfqline.SUBMI = tobj.SUBMI;
            rfqline.RFQNO = tobj.RFQNO;
            rfqline.CUTOFF = tobj.CUTOFF.substring(0, 4) + '-' + tobj.CUTOFF.substring(4, 6) + '-' + tobj.CUTOFF.substring(6, 8) +
              ' at ' + tobj.CUTOFFTIME.substring(0, 2) + 'h' + tobj.CUTOFFTIME.substring(2, 4);
            rfqline.VENDORNO = tobj.VENDORNO;
            rfqline.VENDOR = tobj.VENDOR;
            rfqline.GUID = tobj.GUID;
            rfqline.OBJTYPE = tobj.OBJTYPE;
            rfqline.REQUEST = tobj.REQUEST;
            lrfqList.push(rfqline);
          }
          this.RFQList.next(lrfqList);
        }
      });
  }
  /***************************************************** */
  getRfq(rfqno: string, guid = 'UNKOWN', email = this.auths.currentUserValue.username) {
    const lrfqItems: RFQItem[] = [];
    const lclchosenlist: RFQDocs[] = [];
    const lclsubmilist: RFQDocs[] = [];
    const context = '{' + 'RFQNO:' + rfqno + ',GUID:' + guid + ',EMAIL:' + email + ',DETAILS:X }';
    this.tenderDocs = [];
    this.replyDocs = [];
    this.tenderHeader.next(null);
    this.tenderLine.next(null);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        token: 'BK175mqMN0',
      })
    };
    const call2 = {
      context: {
        CLASS: 'RFQ',
        TOKEN: 'BK175mqMN0',
        METHOD: 'RFQ_GETDETAIL'
      },
      data: {
        REF: 'Empty',
        CONTEXT: context
      }
    };
    return this.http.post<any>('https://io.bidvestfm.co.za/BIDVESTFM_API_ZRFC/request?sys=' + this.devprod,
      call2, httpOptions)
      .pipe(map(data => {
        // tslint:disable-next-line:no-string-literal
        if (Array.isArray(data['RESULT'])) {
          // tslint:disable-next-line:no-string-literal
          data['RESULT'].forEach(rfqobj => {
            // tslint:disable-next-line:no-string-literal
            switch (rfqobj['JSONSET_NAME']) {
              case 'OBJDOCS': {
                // tslint:disable-next-line:no-string-literal
                lclsubmilist.push(JSON.parse(rfqobj['JSONSET_JSTEXT']));
                break;
              }
              case 'OBJITEMDOCS': {
                // tslint:disable-next-line:no-string-literal
                lclchosenlist.push(JSON.parse(rfqobj['JSONSET_JSTEXT']));
                break;
              }
              case 'OBJHEAD': {
                // tslint:disable-next-line:no-string-literal
                this.tenderHeader.next(JSON.parse(rfqobj['JSONSET_JSTEXT']));
                break;
              }
              case 'OBJITEMS': {
                // tslint:disable-next-line:no-string-literal
                this.tenderLine.next(JSON.parse(rfqobj['JSONSET_JSTEXT']));
                break;
              }
              case 'DOCSREQ': {
                // tslint:disable-next-line:no-string-literal
                this.docsOwingBS.next(rfqobj['JSONSET_JSTEXT']);
                break;
              }
              case 'DEVPROD': {
                // tslint:disable-next-line:no-string-literal
                this.devProdBS.next(rfqobj['JSONSET_JSTEXT']);
                break;
              }
              case 'HEADERTEXT': {
                // tslint:disable-next-line:no-string-literal
                this.headerTextBS.next(rfqobj['JSONSET_JSTEXT']);
                break;
              }

              case 'STANDARDTEXT': {
                // tslint:disable-next-line:no-string-literal
                this.standardTextBS.next(JSON.parse(rfqobj['JSONSET_JSTEXT']));
                break;
              }
              case 'COMMENTS': {
                // tslint:disable-next-line:no-string-literal
                this.rfqcommentsBS.next(JSON.parse(rfqobj['JSONSET_JSTEXT']));
              }
            }
          });
        }
        this.tenderdoclist.next(lclchosenlist);
        this.biddoclist.next(lclsubmilist);
        this.buildTender();
      }));
  }
  /***************************************************** */
  postValidity(validity: string) {
    return this.postBidItems('VALIDITY', validity);
  }

  /***************************************************** */
  postResponse(responsetext: string) {
    return this.postBidItems('RESPONSETEXT', responsetext);
  }
  /***************************************************** */
  postRejection(responsetext: string) {
    return this.postBidItems('REJECTION', responsetext);
  }
  /***************************************************** */
  postCommit(responsetext: string) {
    return this.postBidItems('COMMIT', responsetext);
  }
  /***************************************************** */
  postPricing(pricing: TenderItem) {
    const pricelist: BidItem[] = [];
    // JSON.parse(this.tenderLine.value.KEYS);
    let prices = '';
    const date = new Date();
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd = date.getDate();
    const lcldatestr = [date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('');
    pricelist.push({
      ITEMNO: pricing.ITEMNO, ASSUMPTION: pricing.ASSUMPTION, LEADTIME: pricing.LEADTIME,
      BIDPRICE: pricing.BIDPRICE, VALIDITY: pricing.VALIDITY, QUANTITY: pricing.QUANTITY,
      UOM: pricing.UOM, REJECTED: pricing.REJECTED, BIDDATE: lcldatestr
    });
    prices = JSON.stringify(pricelist);
    this.postBidItems('PRICE', prices).subscribe(data => {
      const x = data;
    });

  }
  /***************************************************** */
  postBidItems(fieldname = '', fieldvalue = '') {
    const context = '{' + 'RFQNO:' + this.tenderLine.value.CONTEXT + ',GUID:' + this.tenderLine.value.GUID +
      ',EMAIL:' + this.currentUser.username + ',FIELD:' + fieldname + ' }';


    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        token: 'BK175mqMN0',
      })
    };
    const call2 = {
      context: {
        CLASS: 'RFQ',
        TOKEN: 'BK175mqMN0',
        METHOD: 'RFQ_RESPONSE'
      },
      data: {
        REF: fieldvalue,
        CONTEXT: context
      }
    };
    return this.http.post<any>('https://io.bidvestfm.co.za/BIDVESTFM_API_ZRFC/request?sys=' + this.devprod ,
      call2, httpOptions);
  }
   /***************************************************** */
    removeBidmDoc(rfqdoc) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          token: 'BK175mqMN0',
        })
      };
      const call2 = {
        context: {
          CLASS: 'RFQ',
          TOKEN: 'BK175mqMN0',
          METHOD: 'RFQ_REMOVEDOC'
        },
        data: rfqdoc
      };
      return this.http.post<any>('https://io.bidvestfm.co.za/BIDVESTFM_API_ZRFC/request?sys=' + this.devprod ,
        call2, httpOptions);
    }
    /*************************************************/
  buildTender() {
    let lcltender: Tender;
    if (this.tenderHeader.value !== null && this.tenderLine.value !== null) {
      const info: TenderItem[] = JSON.parse(this.tenderHeader.value.KEYS);
      const bid: BidItem[] = JSON.parse(this.tenderLine.value.KEYS);

      lcltender = { ...this.getKeyIndex() };
      lcltender.tenderItems = [];
      info.forEach(element => {
        const tempbid = bid.find(el => {
          return el.ITEMNO === element.ITEMNO;
        }) || {
          ITEMNO: element.ITEMNO, ASSUMPTION: '', BIDPRICE: 0, LEADTIME: '', VALIDITY: '',
          BIDDATE: '', clean: true, QUANTITY: 0, UOM: ''
        };
        tempbid.ASSUMPTION = tempbid.ASSUMPTION.replace(/\\n/g, '\n');
        tempbid.UOM = (tempbid.UOM === '') ? 'ea' : tempbid.UOM;
        tempbid.QUANTITY = (tempbid.QUANTITY === 0) ? 1 : tempbid.QUANTITY;
        lcltender.tenderItems.push({ ...element, ...tempbid });
      });
      lcltender.response = { acceptance: '', validity: '', response: '' };
      lcltender.rfqNo = this.tenderLine.value.CONTEXT;
      lcltender.vendor = this.tenderLine.value.OBJ;
      lcltender.refText = this.tenderHeader.value.TAGS;
      lcltender.reqText = this.tenderHeader.value.TAGS;
      lcltender.refNo = this.tenderHeader.value.OBJ;
      lcltender.refType = this.tenderHeader.value.SUB_CONTEXT;
      const controldates: RfqControl = JSON.parse(this.tenderHeader.value.DATA);
      lcltender.cutoff = controldates.CUTOFFDATE;
      lcltender.cutofftime = controldates.CUTOFFTIME;
      lcltender.validity = controldates.VALIDITY;
      lcltender.contactEmail = controldates.CONTACTMAIL;
      lcltender.contactTel = controldates.CONTACTTEL;
      lcltender.contactName = controldates.CONTACTNAME;
      lcltender.altcontactEmail = controldates.ALTCONTACTMAIL;
      lcltender.altcontactTel = controldates.ALTCONTACTTEL;
      lcltender.altcontactName = controldates.ALTCONTACTNAME;
      lcltender.locationname = controldates.LOCATIONNAME;
      lcltender.locationgps = controldates.LOCATIONGPS;
      const responsetemp = JSON.parse(this.tenderLine.value.DATA);
      // tslint:disable-next-line:max-line-length
      lcltender.response = { acceptance: 'true', validity: responsetemp.VALIDITY, response: this.tenderLine.value.TAGS.replace(/\\n/g, '\n') };
    } else {
      lcltender = { guid: 'na', email: 'na', bidGuid: 'na' };
    }
    this.tender.next({ ...lcltender });
  }

  getKeyIndex() {
    return { guid: this.tenderHeader.value.GUID, email: this.tenderLine.value.OBJ, bidGuid: this.tenderLine.value.SUB_CONTEXT };
  }
  /***************************************************** */
  getRfqAttachments(rfqno: string) {
    const lclsubmilist = [];
    const lclchosenlist = [];
    const context = '{APIKEY:RFQ, DOCNO:' + rfqno + ',COUNTER:0 }';
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json; charset=utf-8')
    .set('Authorization', 'Bearer 123456')
    .set('apikey', 'GENAPP')
    .set('runon', this.devprod);
    const params = new HttpParams()
      .set('Partner', 'ALL')
      .set('Class', 'RFDL')
      .set('CallContext', context);
    this.http
      .get<any>(environment.BASE_API + '/api/GETFLEX', { params , headers})
      .subscribe(data => {
        if (data.ServicesList instanceof Array) {
          for (const rfqdoc of data.ServicesList) {
            const tobj = JSON.parse(rfqdoc.JsonsetJstext);
            const docItem: DMSHeader = new DMSHeader();
            docItem.id = tobj.COUNTER;
            docItem.DOCNO = tobj.DOCNO;
            docItem.COUNTER = tobj.COUNTER;
            docItem.ORIGINALNAME = tobj.ORIGINALNAME;
            docItem.FILESIZE = tobj.FILESIZE;
            docItem.MIMETYPE = tobj.MIMETYPE;
            docItem.APIKEY = tobj.APIKEY;
            if (docItem.APIKEY === 'RFQQUOTE') {
              lclsubmilist.push(docItem);
            } else {
              lclchosenlist.push(docItem);
            }
          }
          //     this.tenderdoclist.next(lclchosenlist);
          //     this.biddoclist.next(lclsubmilist);
        }
      });
  }
  /********************************************** */
  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    if (b64Data === 'undefined') {
      return;
    }
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {
      type: contentType
    });
    return blob;
  }
  /***************************************************** */
  getvendordoc(docref: DMSHeader) {
    let datain = '';
    const context = docref.APIKEY + '-' + docref.DOCNO + '-' + docref.COUNTER;
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json; charset=utf-8')
    .set('Authorization', 'Bearer 123456')
    .set('apikey', 'GENAPP')
    .set('runon', this.devprod);
    const params = new HttpParams()
      .set('Partner', 'ALL')
      .set('Class', 'RFQD')
      .set('runon', this.devprod)
      .set('CallContext', context);
    this.http
      .get<any>(environment.BASE_API + '/api/GETFLEX', { params , headers})
      .subscribe(data => {
        if (data.ServicesList instanceof Array) {
          for (const dmsdoc of data.ServicesList) {
            const tobj = JSON.parse(dmsdoc.JsonsetJstext);
            datain = datain + tobj.ROLES;
          }
          const b64Data = datain;
          if (b64Data !== undefined) {
            this.currentblob.next(
              this.b64toBlob(b64Data, docref.MIMETYPE, 512)
            );
          }
        }
      });
  }
  /***************************************************** */
  // UpdateRfqItem(itemno: string) {
  //     const lrfqItems: RFQItem[] = [];
  //     const context = itemno;
  //     const params = new HttpParams()
  //       .set('Partner', 'ALL')
  //       .set('Class', 'RFQL')
  //       .set('CallContext', context);
  //     this.http
  //       .get<any>(environment.BASE_API + '/api/GETFLEX', { params })
  //       .subscribe(data => {
  //         // if (data.ServicesList instanceof Array) {
  //         //   for (const rfqdoc of data.ServicesList) {
  //         //     const tobj = JSON.parse(rfqdoc.JSONSET_JSTEXT);
  //         //     const rfqItem: RFQItem = {};
  //         //     rfqItem.SUBMI = tobj.SUBMI;
  //         //     rfqItem.RFQNO = tobj.RFQNO;
  //         //     rfqItem.ITEMNO = tobj.ITEMNO;
  //         //     rfqItem.CUTOFF = tobj.CUTOFF;
  //         //     rfqItem.MTEXT = tobj.MTEXT;
  //         //     rfqItem.QUANTITY = tobj.PROMISEQTY;
  //         //     rfqItem.PRICE = tobj.PROMISEPRICE;
  //         //     lrfqItems.push(rfqItem);
  //         //   }
  //         //   this.currentRFQItems.next(lrfqItems);
  //         // }
  //       });
  //   }
  /******************************************* */
  uploadQuoteFile2SAP(file, resultobj, filerefer, vendor) {
    const filedata = resultobj.split(',').pop();

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ='
      })
    };
    const uploadvar = {
      callType: 'post',
      chContext: {
        CLASS: 'ATTACH',
        METHOD: ''
      },
      chData: {
        fileName: file[0].name,
        fileSize: file[0].size,
        fileType: file[0].type,
        fileContent: filedata,
        uname: this.currentUser.username,
        targetObjId: filerefer,
        targetObjType: 'RFQDOC',
        extras: vendor,
        apikey: 'RFQQUOTE'
      }
    };
    return   this.http
      .post<any>(environment.BASE_POST + '?sys=' + this.devprod , uploadvar, httpOptions);
  }
  /*********************************** */

  getQuoteDocs(callist) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        token: 'BK175mqMN0',
      })
    };
    const call2 = {
      context: {
        CLASS: 'RFQ',
        TOKEN: 'BK175mqMN0',
        METHOD: 'RFQ_GETDOCLIST'
      },
      data: callist
    };
    return this.http.post<any>('https://io.bidvestfm.co.za/BIDVESTFM_API_ZRFC/request?sys=' + this.devprod ,
      call2, httpOptions);
  }
  // updateSAPItem(line: TenderItem) {
  //     let lcldatestr = '';
  //     const date = new Date();
  //     const mm = date.getMonth() + 1; // getMonth() is zero-based
  //     const dd = date.getDate();

  //     lcldatestr = [date.getFullYear(),
  //             (mm > 9 ? '' : '0') + mm,
  //             (dd > 9 ? '' : '0') + dd
  //            ].join('');

  //     const httpOptions = {
  //       headers: new HttpHeaders({
  //         'Content-Type': 'application/json',
  //         Authorization: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ='
  //       })
  //     };
  //     const uploadvar = {
  //       callType: 'post',
  //       chContext: {
  //         CLASS: 'UPDATEQUOTE',
  //         METHOD: 'RFQP'
  //       },
  //       chData: {
  //         EBELN: this.tenderHeader.value.OBJ,
  //         EBELP: line.ITEMNO,
  //         NETPR: line.BIDPRICE,
  //         EINDT: lcldatestr,
  //         KTMNG: line.QUANTITY,
  //         CREATEDBY: this.currentUser.username
  //       }
  //     };
  //     this.http
  //       .post<any>(environment.BASE_POST, uploadvar, httpOptions)
  //       .subscribe(
  //         data => {
  //           console.log(data);
  //         },
  //         e => {
  //           console.log(e);
  //         }
  //       );
  //   }
}
