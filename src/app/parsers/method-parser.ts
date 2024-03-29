import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';

@Injectable()
export class MethodParser {
	public method: any[] = [];

	constructor(private normalize: NormalizeService) { }
	
	getMethod(): any[] { return this.method; }

	parse(sig: string): void {
		this.method = [];
		this.patterns.forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(sig)) {
				this.method.push({
					match: match,
					standardized: p.standardize(match)
				});
			}
		});
	}

	getPatterns(): any[] {
		var patterns: any[] = [];
		
		this.methods.map(m => {
			patterns.push({
				pattern: new RegExp('\\b(' + m.display + ')\\b', 'ig'),
				standardize: (match: any[]) => {
					return {
						coding: {
							 system: 'http://snomed.info/sct',
							code: m.code,
							display: m.display
						},
						text: m.display
					}
				}
			});
		});
		
		return patterns;
	}
	
	// https://www.hl7.org/fhir/valueset-administration-method-codes.html
	// eStar system = urn:oid:1.2.840.114350.1.13.478.2.7.4.798268.8600
	private methods: any[] = [
		{ code: 421298005, display: 'swish and swallow' },
		{ code: 421399004, display: 'dilute' },
		{ code: 422145002, epic: 4, display: 'inject' },
		{ code: 422152000, display: 'wash' },
		{ code: 422219000, epic: 7, display: 'sprinkle' },
		{ code: 417924000, epic: 1, display: 'apply' },
		{ code: 418283001, display: 'administer' },
		{ code: 421682005, epic: 10, display: 'dissolve' },
		{ code: 420606003, display: 'shampoo' },
		{ code: 421134003, display: 'inhale' },
		{ code: 421257003, epic: 5, display: 'insert' },
		{ code: 419385000, display: 'use' },
		{ code: 420620005, display: 'push' },
		{ code: 419582001, epic: 7, display: 'give' },
		{ code: 419652001, epic: 11, display: 'take' },
		{ code: 421521009, epic: 2, display: 'swallow' },
		{ code: 421538008, display: 'instill' },
		{ code: 419747000, epic: 6, display: 'chew' },
		{ code: 421805007, epic: 3, display: 'swish' },
		{ code: 420045007, display: 'suck' },
		{ code: 420360002, display: 'sniff' },
		{ code: 421066005, display: 'place' },
		{ code: 450851000124103, display: 'spray' },
		{ code: 450841000124100, display: 'implant' }
		/*
		{ code: 420484009, display: 'subtract - dosing instruction fragment' },
		{ code: 420503003, display: 'as' },
		{ code: 420561004, display: 'or' },
		{ code: 420604000, display: 'finish' },
		{ code: 420652005, display: 'until gone' },
		{ code: 420771004, display: 'upon' },
		{ code: 420806001, display: 'per' },
		{ code: 420883007, display: 'sparingly' },
		{ code: 420942008, display: 'call' },
		{ code: 420974001, display: 'when' },
		{ code: 421035004, display: 'to' },
		{ code: 421067001, display: 'then' },
		{ code: 421206002, display: 'multiply' },
		{ code: 421286000, display: 'discontinue' },
		{ code: 421463005, display: 'with' },
		{ code: 421484000, display: 'then discontinue' },
		{ code: 421548005, display: 'until' },
		{ code: 421612001, display: 'every' },
		{ code: 421718005, display: 'before' },
		{ code: 421723005, display: 'now' },
		{ code: 421769005, display: 'follow directions' },
		{ code: 421803000, display: 'if' },
		{ code: 421829000, display: 'and' },
		{ code: 421832002, display: 'twice' },
		{ code: 421939007, display: 'follow' },
		{ code: 421984009, display: 'until finished' },
		{ code: 421994004, display: 'during' },
		{ code: 420246001, display: 'at' },
		{ code: 420247005, display: 'dosing instruction imperative' },
		{ code: 420295001, display: 'only' },
		{ code: 421139008, display: 'hold' },
		{ code: 420341009, display: 'constant' },
		{ code: 422033008, display: 'divide' },
		{ code: 422106007, display: 'add' },
		{ code: 422114001, display: 'once' },
		{ code: 422327006, display: 'then stop' }
		*/
	];
	
	private patterns: any[] = this.getPatterns();
}