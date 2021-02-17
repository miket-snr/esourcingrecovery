import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from '@app/_modal/modal.service';

@Component({
  selector: 'app-rfq-info',
  templateUrl: './rfq-info.component.html',
  styleUrls: ['./rfq-info.component.less']
})
export class RfqInfoComponent implements OnInit {
  @Input() infoinput: string;
  public preview = '';
  public lclrequest = '';
  constructor(public modalService: ModalService) { }

  ngOnInit() {
    const requestarray  = this.infoinput.replace('\\n', '').split('\\n');
    this.lclrequest = requestarray.join('<br />');
    if ( requestarray.length > 2) {
        this.preview = requestarray[0] + '<br />' ;
        const mystr = (requestarray[1].length > 45) ? requestarray[1].substr(0, 44 )  : requestarray[1];
        this.preview = this.preview + mystr + '( ...<b>Read More</b> )';
     } else {
        this.preview = requestarray.join('<br />');
    }
  }

}
