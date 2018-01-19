export class DurationParser {
	public duration: any[] = [];

	constructor(private sig: string) {
		this.parse();
	}

	parse(): void {
		this.getPatterns().forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(this.sig)) {
				this.duration.push({
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
			pattern: new RegExp('(?:for|x)\\s*(' + regexRange + ')\\s*(year|month|week|day|yr\\b|mon\\b|wk\\b|d\\b)', 'ig'),
			standardize: (match: any[]) => {
				var duration = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				// TODO: standardize unit of time
				return {
					duration: duration[0],
					durationMax: duration[1],
					durationUnit: match[2]
				};
			}
		}
		];
		
		return patterns;
	}
}

/*

Code	Display	Definition
s	second	second
min	minute	minute
h	hour	hour
d	day	day
wk	week	week
mo	month	month
a	year	year
*/