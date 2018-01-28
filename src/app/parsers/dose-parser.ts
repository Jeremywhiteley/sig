import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';
import { FrequencyParser } from '../parsers/frequency-parser';
import { RouteParser } from '../parsers/route-parser';

@Injectable()
export class DoseParser {
	public dose: any[] = [];

	constructor(private normalize: NormalizeService, private frequency: FrequencyParser, private route: RouteParser) {
		// if this parser accepts a FrequencyParser object, maybe modify the 'sig' string to start before the frequency?
		// also - could use the index of the frequency to include a pattern of a number immediately before the start of a frequency (i.e. 1 qd 2bid)
		// TODO: allow for multiple frequencies
		//if (frequency && frequency.length > 0) this.sig = this.sig.substring(0, frequency[0].match.index);
	}
	
	getDose(): any[] { return this.dose; }

	parse(sig: string): void {
		this.dose = [];
		this.getPatterns().forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(sig)) {
				this.dose.push({
					match: match,
					standardized: p.standardize(match)
				});
			}
		});
		
		// don't forget about the potential for '1 po qd' or '1 qd' or 'one by mouth daily', etc
		this.parseLoneNumericDose(sig);
	}
	
	// handle sigs like 1 qd or 1 po qd or one by mouth daily or one daily
	// in these cases, we know the 'value' (i.e. 1 or one) but not the 'dose.unit' (i.e. tablet, mL, etc)
	parseLoneNumericDose(sig: string): void {
		var regexRange = this.normalize.getRegexRange();
		var frequency = this.frequency.getFrequency();
		var route = this.route.getRoute();
		var index: number[] = [];
		
		frequency.map(f => index.push(f.match.index));
		route.map(r => index.push(r.match.index));
		
		// this pattern is similar to others, but doesn't list a 'unit' in the standardize function
		var p: any = {
			pattern: new RegExp('(?<!(?:no more than|do not exceed|not to exceed|\\bnmt|\\bnte)\\s*)\\**(' + regexRange + ')\\**\\s*', 'ig'),
			standardize: (match: any[]) => {
				var value = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				var dose = value.length > 1 ? { doseRange: { low: { value: value[0] }, high: { value: value[1] } } } : { doseQuantity: { value: value[0] } }; 
				return dose;
			}
		};

		var match: any;
		while (match = p.pattern.exec(sig)) {
			// if the last character of the match is just before the start of a route or frequency
			// then add it to the list of doses
			if (index.indexOf(match.index + match[0].length) > -1) {
				this.dose.push({
					match: match,
					standardized: p.standardize(match)
				});
			}
		}
	}

	getPatterns(): any[] {
		var regexRange = this.normalize.getRegexRange();

		var patterns: any[] = [
		{
			// TODO: add all possible synonyms and names for dosage forms
			pattern: new RegExp('(?<!(?:no more than|do not exceed|not to exceed|\\bnmt|\\bnte)\\s*)\\(*\\**(' + regexRange + ')\\**\\)*(?:\\s*(spray|actuation|applicatorful|capful|puff|drop|bar|capsule|tablet|pad\\b|patch|tape|gum|gel|lozenge|strip|film|tab(?:s)?\\b|cap\\b))', 'ig'),
			standardize: (match: any[]) => {
				var value = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				var dose = value.length > 1 ? { doseRange: { low: { value: value[0], unit: match[2] }, high: { value: value[1], unit: match[2] } } } : { doseQuantity: { value: value[0], unit: match[2] } }; 
				return dose;
			}
		},
		{
			pattern: new RegExp('(?<!(?:no more than|do not exceed|not to exceed|\\bnmt|\\bnte)\\s*)\\(*\\**(' + regexRange + ')\\**\\)*(?:\\s*(milligram|microgram|gram|ounce|milliliter|liter|international unit|unit|tablespoonful|tablespoon|teaspoonful|teaspoon|tbsp|tsp|iu\\b|un\\b|mcg\\b|mg\\b|gm\\b|g\\b|ml\\b|l\\b))', 'ig'),
			standardize: (match: any[]) => {
				// TODO: maybe standardize tsp / tbsp / ounce / etc to mL?
				// TODO: add symbol for microgram
				var value = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				var dose = value.length > 1 ? { doseRange: { low: { value: value[0], unit: match[2] }, high: { value: value[1], unit: match[2] } } } : { doseQuantity: { value: value[0], unit: match[2] } };
				return dose;
			}
		}
		];
		
		return patterns;
	}
}