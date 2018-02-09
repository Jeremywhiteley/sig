import { Injectable } from '@angular/core';

import { NormalizeService } from '../services/normalize.service';
import { FrequencyParser } from '../parsers/frequency-parser';
import { DoseParser } from '../parsers/dose-parser';
import { RouteParser } from '../parsers/route-parser';
import { DurationParser } from '../parsers/duration-parser';
import { IndicationParser } from '../parsers/indication-parser';
import { MethodParser } from '../parsers/method-parser';

@Injectable()
export class SigParser {
	public sig: any[] = [];
	public fhirDosage: any;

	constructor(
			private normalize: NormalizeService, 
			private frequencyParser: FrequencyParser,
			private routeParser: RouteParser,
			private doseParser: DoseParser,
			private indicationParser: IndicationParser,
			private durationParser: DurationParser,
			private methodParser: MethodParser
		) {	}
	
	getSig(): any { return this.sig; }

	parse(sig: string): void {
		this.sig = [];
		var sigs: string[] = this.splitSig(sig);
		var sigObj: any;
		var standardize: any;
		
		// indication should apply to all pieces of the sig, even complex sigs
		// TODO: do we need to make parse return the values so we don't need to duplicate getValue() type functions
		// TODO: do we need to have these services be one-time use and call the providers at the app level?
		// 		 could still keep SigParser at the component level...
		this.indicationParser.parse(sig);
		var indication = this.indicationParser.getIndication();
		
		sigs.forEach((s, i) => {				
			this.frequencyParser.parse(s);
			this.routeParser.parse(s);
			this.doseParser.parse(s);
			this.durationParser.parse(s);
			this.methodParser.parse(s);
			
			sigObj = {
				text: s,
				sequence: i,
				frequency: this.frequencyParser.getFrequency(),
				route: this.routeParser.getRoute(),
				dose: this.doseParser.getDose(),
				duration: this.durationParser.getDuration(),
				indication: indication,
				method: this.methodParser.getMethod()
			};
			
			sigObj.standardized = this.standardize(sigObj);

			this.sig.push(sigObj);			
		}); 

		this.fhirDosage = this.standardize(this.sig[0]);
		
		console.log('sig', this.sig);
		console.log('fhirDosage', this.fhirDosage);
	}

	// split sig by 'then' occurrences
	splitSig(sig: string): string[] {
		var sigs: string[] = [];
		
		var pattern = new RegExp('\\s*(?:,|\\.)?\\s*then\\s*', 'ig');

		var split: any[] = [];
		var match: any;
		while (match = pattern.exec(sig)) { split.push(match); }		
		
		if (split.length > 0) {
			var index: number = 0;
			split.forEach((s, i) => {
				sigs.push(sig.substring(index, s.index));
				index = s.index;
				if (i == split.length - 1) sigs.push(sig.substring(index));
			})
		} else {
			sigs.push(sig);
		}

		return sigs;
	}
	
	standardize(sig: any): any {
		var dosage: any = {
			resourceType: 'Dosage',
			// from Element: extension
			text: sig.text, // Free text dosage instructions e.g. SIG
		};
		
		/* Technique for administering medication */
		if (sig.method && sig.method.length > 0) dosage.method = sig.method[0].standardized;
		
		/* The order of the dosage instructions */
		if (sig.sequence) dosage.sequence = sig.sequence;
		
		/* dose[x]: Amount of medication per dose. One of these 2:
		"doseRange" : { Range },
		"doseQuantity" : { Quantity(SimpleQuantity) }, */
		if (sig.dose && sig.dose.length > 0) {
			if (sig.dose[0].standardized.doseRange) {
				dosage.doseRange = sig.dose[0].standardized.doseRange;
			} else if (sig.dose[0].standardized.doseQuantity) {
				dosage.doseQuantity = sig.dose[0].standardized.doseQuantity;
			}
		}
				
		/* How drug should enter body */
		if (sig.route && sig.route.length > 0) dosage.route = sig.route[0].standardized;
				
		// When medication should be administered
		if (sig.frequency && sig.frequency.length > 0 && sig.duration && sig.duration.length > 0) {
			dosage.timing = Object.assign(sig.frequency[0].standardized, sig.duration[0].standardized)
		} else if (sig.frequency && sig.frequency.length > 0) {
			dosage.timing = sig.frequency[0].standardized;
		} else if (sig.duration && sig.duration.length > 0) {
			dosage.timing = sig.duration[0].standardized;
		}
		
		/* asNeeded[x]: Take "as needed" (for x). One of these 2:
		"asNeededBoolean" : <boolean>,
		"asNeededCodeableConcept" : { CodeableConcept }, */
		if (sig.indication && sig.indication.length > 0) {
			if (sig.indication[0].standardized.asNeededCodeableConcept) {
				dosage.asNeededCodeableConcept = sig.indication[0].standardized.asNeededCodeableConcept;
			} else if (sig.indication[0].standardized.asNeededBoolean) {
				dosage.asNeededBoolean = sig.indication[0].standardized.asNeededBoolean;
			}
		}

		
		/* rate[x]: Amount of medication per unit of time. One of these 3:
		"rateRatio" : { Ratio }
		"rateRange" : { Range }
		"rateQuantity" : { Quantity(SimpleQuantity) }		
		additionalInstruction: [{ CodeableConcept }], // Supplemental instruction - e.g. "with meals"
		patientInstruction: "<string>", // Patient or consumer oriented instructions
		site: { CodeableConcept }, // Body site to administer to
		"maxDosePerPeriod" : { Ratio }, // Upper limit on medication per unit of time
		"maxDosePerAdministration" : { Quantity(SimpleQuantity) }, // Upper limit on medication per administration
		"maxDosePerLifetime" : { Quantity(SimpleQuantity) }, // Upper limit on medication per lifetime of the patient */

		
		return dosage;
	}
	
}