export class PrnParser {
	public prn: any[] = [];

	constructor(private sig: string) {	
		this.parse();
	}

	parse(): void {
		this.getPatterns().forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(this.sig)) {
				this.prn.push({
					match: match
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
			pattern: new RegExp('(?:as needed for|as needed|p.r.n. for|prn for|p.r.n.|prn)((?:\\s\\w*)*)', 'ig'),
			standardize: (match: any[]) => {
				var reasons = match[1].split(' ');
				// TODO: match each word against a database of diagnoses (ICD-10 / UMLS?)
				// https://documentation.uts.nlm.nih.gov/rest/search/
				return {
					asNeededBoolean: true,
					asNeededCodeableConcept: reasons
				}
			}
		}
		];
		
		return patterns;
	}
}