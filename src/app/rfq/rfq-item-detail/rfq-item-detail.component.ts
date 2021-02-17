import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { RFQItem, RFQHeader, TenderItem } from '@app/_models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rfq-item-detail',
  templateUrl: './rfq-item-detail.component.html',
  styleUrls: ['./rfq-item-detail.component.less']
})
export class RfqItemDetailComponent implements OnInit {
  public lclRFQItem: TenderItem;
  public lclRFQItemCopy: TenderItem;
  public lclRFQItemBackup: TenderItem;
  public itemForm: FormGroup;
  public list = 'X';
  public lclDate: Date;
  subscriber: Subscription;
  @Output() closer = new EventEmitter();
  /*  Handle Documents load or download */
  submitted = false;
  vams = ['7 days', '14 days', '21 days' , '28 days' , '60 days' , '90 days' , '120 days' , '180+ days' ];


  constructor(private apirfq: RfqAPIService ,private formBuilder: FormBuilder) {
    this.itemForm = this.formBuilder.group( {
      bidprice: ['', Validators.min(0)],
      validity: [''],
      leadtime: [''],
      assumption: ['',  Validators.maxLength(1000)]
   } );

  }

  onSubmit() {
    const tempObj = this.itemForm.value;
    this.lclRFQItemCopy.BIDPRICE = tempObj.bidprice;
    this.lclRFQItemCopy.VALIDITY = tempObj.validity;
    this.lclRFQItemCopy.LEADTIME = tempObj.leadtime;
    this.lclRFQItemCopy.ASSUMPTION = tempObj.assumption;
    this.apirfq.currentfocusItem.next(this.lclRFQItemCopy);
    this.apirfq.postPricing(this.lclRFQItemCopy);
    this.closeModal(this.lclRFQItemCopy);
  }

  ngOnInit() {
    this.apirfq.currentfocusItem.subscribe(data => {
    if (data) {  this.lclRFQItem = data;
                 this.lclRFQItemCopy = { ...data };
                 this.itemForm.setValue({
        bidprice: this.lclRFQItem.BIDPRICE,
        validity: this.lclRFQItem.VALIDITY,
        assumption: this.lclRFQItem.ASSUMPTION,
        leadtime: this.lclRFQItem.LEADTIME
      });
    }
  });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() {}
  ok(item) {}
  resetModal() {
    this.lclRFQItemCopy = { ...this.lclRFQItem };
  }
  closeModal(itemback) {
    this.closer.emit(itemback);
  }
}
/*  end of Handle Documents load or download */
