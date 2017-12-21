export class FrequencyParser {
  public frequencies: any[] = [];
  
  constructor(private sig: string) {
	this.parse();
  }
  
  parse(): void {
	this.getRegexFrequencyPatterns().forEach(regexFrequencyPattern => {
		var regexFrequency: any = new RegExp(regexFrequencyPattern, 'ig');
		var match: any[] = [];
		while (match = regexFrequency.exec(this.sig)) {
			this.frequencies.push(match);
		}
	});
  }
  
  getRegexFrequencyPatterns(): string[] {
		var regexOneToTwentyfour: string = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twentyone|twenty one|twenty-one|twentytwo|twenty two|twenty-two|twentythree|twenty three|twenty-three|twentyfour|twenty four|twenty-four';
		// NOTE: keep the x-y at the beginning and x at the end so that it finds the x-y first without stopping
		var regexRange: string = '(?:' + regexOneToTwentyfour + '|\\d+)\\s*(?:to|-|or)\\s*(?:' + regexOneToTwentyfour + '|\\d+)|\\d+|(?:' + regexOneToTwentyfour + ')';
		var regexDaysOfWeek: string = 'monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon\\b|tue\\b|tues\\b|wed\\b|thu\\b|thur\\b|thurs\\b|fri\\b|sat\\b|sun\\b|m\\b|tu\\b|w\\b|th\\b|t\\b|f\\b|sa\\b|su\\b|s\\b';

		var regexFrequencyPatterns: string[] = [
		// bid | tid | qid
		// bid-tid
		// frequency = a (2 if b, 3 if t, 4 if q), period = 1, periodUnit = d
		'(?:(?:\\s*(?:to|-|or)\\s*)?(b|t|q)\\.?i\\.?d\\b\\.?)+',

		// q | every | each
		// 4 | 4-6 | 4 to 6 | four | four-six | four to six
		// hours | days | weeks | h | hrs | hr | min | mins
		// (a: normalize 'to' to '-', and explode)
		// frequency = 1, period = a[0], periodUnit = b (normalize to h, d, wk, min), [periodMax = a[1]]
		'(?:q|every|each)\\s*(' + regexRange + ')\\s*(hours|days|weeks|h\\b|hrs\\b|hr\\b|min|mins)',

		// qam | qpm | qhs | qday | qdaily
		// frequency = 1, period = 1, periodUnit = d, [when = a (normalize to MORN, AFT, EVE]
		'q\\.?\\s*(a\\.?m\\.?|p\\.?m\\.?|h\\.?s\\.?|day|daily)',

		// in the
		// morning | evening | afternoon
		// frequency = 1, duration = 1, when = a
		'in the\\s*(morning|evening|afternoon)',

		// every | each
		// [other]
		// day | week | month | morning | afternoon | evening | night | hs
		// TODO: combine with the qpm/qhs/qday/qdaily group above
		// frequency = 1, period = 1 (or 2 if a is not null), periodUnit = b (normalize to d, wk, mo), [when = b (normalize to MORN, AFT, EVE, etc]
		'(?:every|each|q)\\s*(other\\b|o\\b)?\\s*(day|week|month|morning|afternoon|evening|night|hs\\b|d\\b)',

		// with | before | after
		// breakfast | lunch | dinner | meals | each meal
		// when = a + b (normalize to AC / PC / CM / etc)
		'(with|before|after)\\s*(breakfast|lunch|dinner|meals|each meal)',

		// at
		// bedtime | night
		// frequency = 1, duration = 1, when = a (normalize to HS)
		'at\\s*(bedtime|night)',

		// [once | twice]
		// daily | nightly | weekly | monthly | yearly
		// once daily, twice monthly, daily
		// (a: remove 'times' or 'x')
		// frequency = a[0], frequencyMax = a[1], period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// frequency = a (1 if once, 2 if twice, 1 if null), period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// NOTE: this is where 'daily' and 'nightly' match
		'(' + regexRange + '\\s*(?:time(?:s)|x)|once|twice)?\\s*(daily|nightly|weekly|monthly|yearly)',
		
		// 4 | four | 4-6 | 4 to 6 | 4 or 6 | four-six | four to six | four or six
		// time(s) | x
		// [per | a | each | /]
		// day | daily | week | weekly | month | monthly
		// 2-3 times daily
		// (a: remove 'times' or 'x', normalize 'to' to '-', and explode)
		// frequency = a[0], frequencyMax = a[1], period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// frequency = a (1 if once, 2 if twice), period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// NOTE: 'daily' won't match this pattern
		'(' + regexRange + '\\s*(?:time(?:s)|x)|once|twice)\\s*(?:per|a|each|\/)\\s*(day|week|month|year|d\\b|w\\b|mon|m\\b|yr\\b)',
				
		// x1 | x 1
		// exclude if followed by: day | week | month
		// frequency = 1, period = 1, periodUnit = d
		'x\\s*1(?!(?:day| day|d\\b| d\\b|week| week|w\\b| w\\b|month| month|mon|m\\b| m\\b| mon\\b))',

		// every | on
		// Thursday
		// Monday, Tuesday, Wednesday, and Friday
		// dayOfWeek = a
		'(?:every|on|q)\\s*(?:(' + regexDaysOfWeek + ')\\s*,?\\s*(?:and|&|\\+)?\\s*)+',

		// qd | daily | nightly | weekly | monthly | one time only
		// NOTE: hard code these? these are the oddballs
		'(?:qd|one time only)'
		];
		
		/* ISSUES
		*/
		
		// on day(s)
		// 1 | one | 1-2 | one to two | one-two
		// (a: normalize 'to' to '-', and explode)
		// NOTE: this should move to the duration parser
		// if length of a > 1, then duration = a[1] - a[0]; else duration = 1
		//'on day(s)?\\s*(' + regexRange + ')',
		
	  return regexFrequencyPatterns;
  }
}