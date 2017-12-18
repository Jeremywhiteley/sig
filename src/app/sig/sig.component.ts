import { Component, OnInit } from '@angular/core';
import {  
  FormBuilder,  
  FormGroup, 
  FormControl,  
  Validators,  
  AbstractControl  
} from '@angular/forms';
import { FrequencyParser } from '../frequency-parser';

@Component({
  selector: 'app-sig',
  templateUrl: './sig.component.html',
  styleUrls: ['./sig.component.css']
})
export class SigComponent implements OnInit {
  sigForm: FormGroup;
  sigControl: AbstractControl;
  sig: string;
  frequency: Array<any>;

  constructor(fb: FormBuilder) {
    this.sigForm = fb.group({
      'sigControl':  '1 tablet by mouth three times a day for 7 days as needed for muscle spasms'
    });

    this.sigControl = this.sigForm.controls['sigControl'];
	  
    this.sigControl.valueChanges.subscribe(
      (value: string) => {
	    this.updateSig(value);
      }
    );
	
	this.updateSig(this.sigControl.value);
  }

	frequencyParser(sig: string): any {
      return sig.match(/(?:once daily|twice daily)/);
    }

  	updateSig(sig: string): void {
	  this.sig = sig;
	 // this.frequency = this.frequencyParser(this.sig);
	  this.frequency = new FrequencyParser(sig).frequencies;
	  console.log(new FrequencyParser(sig));
      console.log('sig changed to:', this.sigControl);  
      console.log('frequency:', this.frequency);  
	}

  ngOnInit() {
   }
 
}
