import { Component, OnInit } from '@angular/core';
import {  
  FormBuilder,  
  FormGroup, 
  FormControl,  
  Validators,  
  AbstractControl  
} from '@angular/forms';
import { FrequencyParser } from '../parsers/frequency-parser';
import { DoseParser } from '../parsers/dose-parser';
import { RouteParser } from '../parsers/route-parser';
import { DurationParser } from '../parsers/duration-parser';
import { PrnParser } from '../parsers/prn-parser';
import { MethodParser } from '../parsers/method-parser';

@Component({
  selector: 'app-sig',
  templateUrl: './sig.component.html',
  styleUrls: ['./sig.component.css'],
  providers: [
	FrequencyParser,
	RouteParser,
	DoseParser,
	PrnParser,
	DurationParser,
	MethodParser
  ]
})
export class SigComponent implements OnInit {
  sigForm: FormGroup;
  sigControl: AbstractControl;
  
  sig: string;
  frequency: any[] = [];
  route: any[] = [];
  dose: any[] = [];
  prn: any[] = [];
  duration: any[] = [];
  method: any[] = [];

  constructor(
			private fb: FormBuilder,
			private frequencyParser: FrequencyParser,
			private routeParser: RouteParser,
			private doseParser: DoseParser,
			private prnParser: PrnParser,
			private durationParser: DurationParser,
			private methodParser: MethodParser
		) {
    this.sigForm = fb.group({
      'sigControl':  '1 po qd x 10 days'
    });

    this.sigControl = this.sigForm.controls['sigControl'];
	  
    this.sigControl.valueChanges.subscribe(
      (value: string) => {
		this.sig = value;
	    this.parseSig();
      }
    );
	
	this.sig = this.sigControl.value;
	this.parseSig();
  }

  parseSig(): void {
	 this.frequencyParser.parse(this.sig);
	 this.routeParser.parse(this.sig);
	 this.doseParser.parse(this.sig);
	 this.durationParser.parse(this.sig);
	 this.prnParser.parse(this.sig);
	 this.methodParser.parse(this.sig);
	 
	 this.frequency = this.frequencyParser.getFrequency();
	 this.route = this.routeParser.getRoute();
	 this.dose = this.doseParser.getDose();
	 this.duration = this.durationParser.getDuration();
	 this.prn = this.prnParser.getPrn();
	 this.method = this.methodParser.getMethod();
  }

  ngOnInit() { } 
}