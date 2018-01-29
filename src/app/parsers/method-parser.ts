import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';

@Injectable()
export class MethodParser {
	public method: any[] = [];

	constructor(private normalize: NormalizeService) { }
	
	getMethod(): any[] { return this.method; }

	parse(sig: string): void {
		this.method = [];
		this.getPatterns().forEach(p => {
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
	private methods: any[] = [
		{ code: 417924000, display: 'apply' },
		{ code: 418283001, display: 'administer' },
		{ code: 419385000, display: 'use' },
		{ code: 419582001, display: 'give' },
		{ code: 419652001, display: 'take' },
		{ code: 419747000, display: 'chew' },
		{ code: 420045007, display: 'suck' },
		{ code: 420246001, display: 'at' },
		{ code: 420247005, display: 'dosing instruction imperative' },
		{ code: 420295001, display: 'only' },
		{ code: 420341009, display: 'constant' },
		{ code: 420360002, display: 'sniff' },
		{ code: 420484009, display: 'subtract - dosing instruction fragment' },
		{ code: 420503003, display: 'as' },
		{ code: 420561004, display: 'or' },
		{ code: 420604000, display: 'finish' },
		{ code: 420606003, display: 'shampoo' },
		{ code: 420620005, display: 'push' },
		{ code: 420652005, display: 'until gone' },
		{ code: 420771004, display: 'upon' },
		{ code: 420806001, display: 'per' },
		{ code: 420883007, display: 'sparingly' },
		{ code: 420942008, display: 'call' },
		{ code: 420974001, display: 'when' },
		{ code: 421035004, display: 'to' },
		{ code: 421066005, display: 'place' },
		{ code: 421067001, display: 'then' },
		{ code: 421134003, display: 'inhale' },
		{ code: 421139008, display: 'hold' },
		{ code: 421206002, display: 'multiply' },
		{ code: 421257003, display: 'insert' },
		{ code: 421286000, display: 'discontinue' },
		{ code: 421298005, display: 'swish and swallow' },
		{ code: 421399004, display: 'dilute' },
		{ code: 421463005, display: 'with' },
		{ code: 421484000, display: 'then discontinue' },
		{ code: 421521009, display: 'swallow' },
		{ code: 421538008, display: 'instill' },
		{ code: 421548005, display: 'until' },
		{ code: 421612001, display: 'every' },
		{ code: 421682005, display: 'dissolve' },
		{ code: 421718005, display: 'before' },
		{ code: 421723005, display: 'now' },
		{ code: 421769005, display: 'follow directions' },
		{ code: 421803000, display: 'if' },
		{ code: 421805007, display: 'swish' },
		{ code: 421829000, display: 'and' },
		{ code: 421832002, display: 'twice' },
		{ code: 421939007, display: 'follow' },
		{ code: 421984009, display: 'until finished' },
		{ code: 421994004, display: 'during' },
		{ code: 422033008, display: 'divide' },
		{ code: 422106007, display: 'add' },
		{ code: 422114001, display: 'once' },
		{ code: 422145002, display: 'inject' },
		{ code: 422152000, display: 'wash' },
		{ code: 422219000, display: 'sprinkle' },
		{ code: 422327006, display: 'then stop' }
	];
}