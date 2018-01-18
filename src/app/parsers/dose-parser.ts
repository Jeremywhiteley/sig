import { FrequencyParser } from '../parsers/frequency-parser';

export class DoseParser {
	public dose: any[] = [];

	constructor(private sig: string, private frequency: any[]) {
		// if this parser accepts a FrequencyParser object, maybe modify the 'sig' string to start before the frequency?
		// TODO: allow for multiple frequencies
		//if (frequency && frequency.length > 0) this.sig = this.sig.substring(0, frequency[0].match.index);
		
		this.parse();
	}

	parse(): void {
		this.getPatterns().forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(this.sig)) {
				this.dose.push({
					match: match,
					standardized: p.standardize(match)
				});
			}
		});
	}

	getPatterns(): any[] {
		var regexOneToTwentyfour: string = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twentyone|twenty one|twenty-one|twentytwo|twenty two|twenty-two|twentythree|twenty three|twenty-three|twentyfour|twenty four|twenty-four';
		// NOTE: keep the x-y at the beginning and x at the end so that it finds the x-y first without stopping
		var regexRange: string = '(?:(?:' + regexOneToTwentyfour + '|(?:(?:\\d+\\s*)*(?:\\.|/))?\\d+)\\s*(?:to|-|or)\\s*(?:' + regexOneToTwentyfour + '|(?:(?:\\d+\\s*)*(?:\\.|/))?\\d+)|(?:(?:\\d+\\s*)*(?:\\.|/))?\\d+|(?:' + regexOneToTwentyfour + '))';

		var patterns: any[] = [
		{
			pattern: new RegExp('(?<!(?:no more than|do not exceed|not to exceed|\\bnmt)\\s*)' + regexRange + '(?=\\s+(?:\\w*\\s+)*(spray|actuation|capful|puff|drop|bar|capsule|tablet|pad\\b|patch|tape|gum|gel|lozenge|strip|film|tab(?:s)*\\b|cap(?:s)*\\b))', 'ig'),
			standardize: (match: any[]) => {
				var value = match[0].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				var dose = value.length > 1 ? { doseRange: { low: { value: value[0], unit: match[1] }, high: { value: value[1], unit: match[1] } } } : { doseQuantity: { value: value[0], unit: match[1] } };
				return dose;
			}
		},
		{
			pattern: new RegExp('(?<!(?:no more than|do not exceed|not to exceed|\\bnmt)\\s*)' + regexRange + '(?=\\s*(milligram|microgram|gram|ounce|milliliter|liter|international unit|unit|tablespoonful|tablespoon|teaspoonful|teaspoon|tbsp|tsp|iu\\b|un\\b|mcg\\b|mg\\b|gm\\b|g\\b|ml\\b|l\\b))', 'ig'),
			standardize: (match: any[]) => {
				var value = match[0].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				var dose = value.length > 1 ? { doseRange: { low: { value: value[0], unit: match[1] }, high: { value: value[1], unit: match[1] } } } : { doseQuantity: { value: value[0], unit: match[1] } };
				return dose;
			}
		}
		];
		
		return patterns;
	}
}