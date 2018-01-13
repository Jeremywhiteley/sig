export class DoseParser {
	public doses: any[] = [];

	constructor(private sig: string) {
		// if this parser accepts a FrequencyParser object, maybe modify the 'sig' string to start before the frequency?
		
		this.parse();
	}

	parse(): void {
		this.getRegexDosePatterns().forEach(regexDosePattern => {
			var match: any[] = [];
			while (match = regexDosePattern.pattern.exec(this.sig)) {
				this.doses.push(match);
			}
		});		
	}

	getRegexDosePatterns(): any[] {
		var regexDosePatterns: any[] = [
		{ 	
			pattern: new RegExp('(tablet|tab|capsule|cap)', 'ig'),
			standardize: (match: any[]) => {
				return match;
			}
		}
		
		return regexDosePatterns;
	}
}
