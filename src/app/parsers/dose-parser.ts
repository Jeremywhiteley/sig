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
		this.patterns.forEach(p => {
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

		var patterns: any[] = [];
		
		var p: string[] = [];
		
		this.doseUnits.map(d => {
			patterns.push({
				// TODO: add all possible synonyms and names for dosage forms
				pattern: new RegExp('(?<!(?:no more than|do not exceed|not to exceed|\\bnmt|\\bnte)\\s*)\\(*\\**(' + regexRange + ')\\**\\)*(?:\\s*(' + d.display + (d.synonyms ? '|' + d.synonyms.join('|') : '') + '))', 'ig'),
				standardize: (match: any[]) => {
					var value = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
					var dose = value.length > 1 ? { doseRange: { low: { value: value[0], unit: d.display, system: 'http://snomed.info/sct', code: d.code }, high: { value: value[1], unit: d.display, system: 'http://snomed.info/sct', code: d.code } } } : { doseQuantity: { value: value[0], unit: d.display, system: 'http://snomed.info/sct', code: d.code } }; 
					return dose;
				}
			});
		});
		
		
		patterns.push({
			// TODO: standardize these mL / mg doseUnits like the ones below
			pattern: new RegExp('(?<!(?:no more than|do not exceed|not to exceed|\\bnmt|\\bnte)\\s*)\\(*\\**(' + regexRange + ')\\**\\)*(?:\\s*(milligram|microgram|gram|ounce|milliliter|liter|international unit|unit|tablespoonful|tablespoon|teaspoonful|teaspoon|tbsp|tsp|iu\\b|un\\b|mcg\\b|mg\\b|gm\\b|g\\b|ml\\b|l\\b))', 'ig'),
			standardize: (match: any[]) => {
				// TODO: maybe standardize tsp / tbsp / ounce / etc to mL?
				// TODO: add symbol for microgram
				var value = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				var dose = value.length > 1 ? { doseRange: { low: { value: value[0], unit: match[2] }, high: { value: value[1], unit: match[2] } } } : { doseQuantity: { value: value[0], unit: match[2] } };
				return dose;
			}
		});
		
		return patterns;
	}
	
	private doseUnits: any[] = [
		/* patch */
		{ code: 36875001, display: 'drug patch', synonyms: ['(?<!transdermal )patch'] },
		{ code: 385114002, display: 'transdermal patch' },
		/* tablet */
		{ code: 385055001, display: 'tablet', synonyms: ['(?:(?<!film-coated|effervescentgastro-resistant|orodispersible|prolonged-release|vaginal|effervescent vaginal|modified-release|chewable|sublingual|buccalmuco-adhesive buccal|soluble|dispersible|delayed-release particles|oral|inhalation vapor|implantation|extended-release film coated|ultramicronized|extended-release|extended-release enteric coated|delayed-release|coated particles|sustained-release buccal|multilayer) )tablet'] },
		{ code: 385057009, display: 'film-coated tablet' },
		{ code: 385058004, display: 'effervescent tablet' },
		{ code: 385059007, display: 'gastro-resistant tablet' },
		{ code: 447079001, display: 'orodispersible tablet' }
		{ code: 385060002, display: 'prolonged-release tablet' },
		{ code: 385173001, display: 'tablet for vaginal solution' },
		{ code: 385178005, display: 'vaginal tablet' },
		{ code: 385192004, display: 'tablet for rectal solution' },
		{ code: 385193009, display: 'tablet for rectal suspension' },
		{ code: 385179002, display: 'effervescent vaginal tablet' },
		{ code: 385061003, display: 'modified-release tablet' },
		{ code: 66076007, display: 'chewable tablet' },
		{ code: 385084005, display: 'sublingual tablet' },
		{ code: 385085006, display: 'buccal tablet' },
		{ code: 385086007, display: 'muco-adhesive buccal tablet' },
		{ code: 385035002, display: 'soluble tablet' },
		{ code: 385036001, display: 'dispersible tablet' },
		{ code: 421535006, display: 'delayed-release particles tablet' },
		{ code: 421026006, display: 'oral tablet' },
		{ code: 385214006, display: 'inhalation vapor tablet' },
		{ code: 385236009, display: 'implantation tablet' },
		{ code: 420378007, display: 'extended-release film coated tablet' },
		{ code: 420956005, display: 'ultramicronized tablet' },
		{ code: 420627008, display: 'extended-release tablet', synonyms: ['(?:extended release|er|e.r.) tablet'] },
		{ code: 421155001, display: 'extended-release enteric coated tablet', synonyms: ['(?:extended release|extended release|er|e.r.) (?:enteric coated|enteric-coated|e.c.|ec) tablet'] },
		{ code: 421366001, display: 'tablet for oral suspension' },
		{ code: 421374000, display: 'delayed-release tablet', synonyms: ['(?:delayed release|d.r.|dr) tablet'] },
		{ code: 421721007, display: 'coated particles tablet' },
		{ code: 422201009, display: 'tablet for cutaneous solution' },
		{ code: 421620004, display: 'sustained-release buccal tablet' },
		{ code: 421932003, display: 'multilayer tablet' },
		{ code: 421701006, display: 'tablet for oral solution' },
		
		
		/* drops */
		{ code: 385018001, display: 'oral drops' },
		{ code: 420636007, display: 'eye/ear drops' },
		{ code: 385124005, display: 'eye drops' },
		{ code: 385128008, display: 'prolonged-release eye drops' },
		{ code: 385152001, display: 'nasal drops' },
		{ code: 385163003, display: 'eye/ear/nose drops' },
		{ code: 385136004, display: 'ear drops' },
		{ code: 426684005, display: 'drops dose form' },
		{ code: 427609008, display: 'modified release drops dose form' },
		/* capsule */
		{ code: 385049006, display: 'capsule' },
		{ code: 385050006, display: 'hard capsule' },
		{ code: 385051005, display: 'soft capsule' },
		{ code: 385175008, display: 'vaginal capsule' },
		{ code: 385208004, display: 'hard capsule inhalation powder' },
		{ code: 385176009, display: 'hard vaginal capsule' },
		{ code: 385177000, display: 'soft vaginal capsule' },
		{ code: 385195002, display: 'rectal capsule' },
		{ code: 385212005, display: 'inhalation vapor capsule' },
		{ code: 385052003, display: 'gastro-resistant capsule' },
		{ code: 385053008, display: 'prolonged-release capsule' },
		{ code: 420293008, display: 'coated pellets capsule' },
		{ code: 421027002, display: 'delayed-release capsule' },
		{ code: 420692007, display: 'oral capsule' },
		{ code: 421300005, display: 'extended-release film coated capsule' },
		{ code: 421338009, display: 'extended-release coated capsule' },
		{ code: 421618002, display: 'extended-release capsule' },
		{ code: 427129005, display: 'coated capsule' },
		{ code: 421752008, display: 'extended-release enteric coated capsule' },
		{ code: 420767002, display: 'delayed-release pellets capsule' },
		{ code: 385054002, display: 'modified-release capsule' },
		{ code: 385083004, display: 'oromucosal capsule' },
		/* spray */
		{ code: 385073003, display: 'oromucosal spray' },
		{ code: 385074009, display: 'sublingual spray' },
		{ code: 385105007, display: 'cutaneous spray' },
		{ code: 385278003, display: 'cutaneous powder spray' },
		{ code: 421606006, display: 'aerosol spray' },
		{ code: 421340004, display: 'powder spray' },
		{ code: 385140008, display: 'ear spray' },
		{ code: 426823003, display: 'vaginal spray' },
		{ code: 425965000, display: 'rectal spray' },
		{ code: 426969004, display: 'metered spray' },
		{ code: 427564005, display: 'pressurized spray' },
		{ code: 421720008, display: 'spray dose form' },
		{ code: 385157007, display: 'nasal spray' },
		{ code: 385279006, display: 'cutaneous suspension spray' },
		{ code: 385106008, display: 'cutaneous solution spray' },
		/* inhalation */
		{ code: 385203008, display: 'pressurised inhalation' },
		{ code: 385204002, display: 'pressurised inhalation solution' },
		{ code: 385205001, display: 'pressurised inhalation suspension' },
		{ code: 385206000, display: 'pressurised inhalation emulsion' },
		{ code: 385207009, display: 'inhalation powder' },
		{ code: 385210002, display: 'inhalation vapor' },
		{ code: 385211003, display: 'inhalation vapor powder' },
		{ code: 385213000, display: 'inhalation vapor solution' },
		{ code: 385215007, display: 'inhalation vapor ointment' },
		{ code: 385216008, display: 'inhalation vapor liquid' },
		{ code: 385217004, display: 'inhalation gas' },
		/* aerosol */
		{ code: 424179000, display: 'aerosol generator' },
		{ code: 421759004, display: 'metered dose aerosol inhaler' },
		{ code: 420610000, display: 'nasal aerosol' },
		{ code: 421104008, display: 'aerosol powder' },
		{ code: 421347001, display: 'cutaneous aerosol' },
		{ code: 420847003, display: 'metered dose aerosol' },
		/* gum */
		{ code: 426210003, display: 'gum' },
		{ code: 385063000, display: 'oral gum' },
		{ code: 385080001, display: 'medicated chewing-gum' },
		/* film */
		{ code: 420460001, display: 'film' },
		{ code: 421043009, display: 'extended-release film' },
		/* cone */
		{ code: 421504000, display: 'cone' },
		{ code: 422199007, display: 'dental cone' },
		/* sponge */
		{ code: 421288004, display: 'sponge' },
		{ code: 424552006, display: 'vaginal sponge' },
		{ code: 385119007, display: 'cutaneous sponge' },
		/* pellet */
		{ code: 420992009, display: 'implantable pellet' },
		{ code: 420768007, display: 'pellet' },
		/* inhaler */
		{ code: 422054001, display: 'metered dose powder inhaler' },
		{ code: 422059006, display: 'metered dose inhaler' },
		{ code: 422151007, display: 'breath activated powder inhaler' },
		{ code: 422197009, display: 'breath activated inhaler' },
		{ code: 420317006, display: 'inhaler' },
		/* stick */
		{ code: 385148001, display: 'ear stick' },
		{ code: 385162008, display: 'nasal stick' },
		{ code: 11190007, display: 'drug stick' },
		{ code: 385089000, display: 'dental stick' },
		{ code: 385118004, display: 'cutaneous stick' },
		{ code: 385246006, display: 'urethral stick' },
		{ code: 385261007, display: 'wound stick' },
		/* tampon */
		{ code: 385147006, display: 'ear tampon' },
		{ code: 385180004, display: 'medicated vaginal tampon' },
		{ code: 385196001, display: 'rectal tampon' },
		{ code: 420243009, display: 'tampon dose form' },
		/* paste */
		{ code: 385039008, display: 'oral paste' },
		{ code: 37937005, display: 'drug paste', synonyms: ['(?<!oral )paste'] },
		{ code: 385079004, display: 'oromucosal paste' },
		{ code: 385082009, display: 'gingival paste' },		
		
		{ code: 17519006, display: 'lotion' },
		{ code: 30843009, display: 'drug aerosol foam', synonyms: ['foam'] },
		{ code: 46992007, display: 'pill\\b' },
		{ code: 48582000, display: 'caplet' },
		{ code: 52262001, display: 'drug aerosol' },
		{ code: 385048003, display: 'cachet' },
		{ code: 63316001, display: 'liniment' },
		{ code: 64241004, display: 'drug pledget' },
		{ code: 385062005, display: 'oral lyophilisate' },
		{ code: 385064006, display: 'pillule' },
		{ code: 385078007, display: 'oromucosal gel' },
		{ code: 385081002, display: 'gingival gel' },
		{ code: 385087003, display: 'lozenge' },
		{ code: 385088008, display: 'dental gel' },
		{ code: 385090009, display: 'dental insert' },
		{ code: 385091008, display: 'dental powder' },
		{ code: 385104006, display: 'shampoo' },
		{ code: 385115001, display: 'collodion' },
		{ code: 385116000, display: 'medicated nail laquer' },
		{ code: 385117009, display: 'poultice' },
		{ code: 385132002, display: 'ophthalmic insert' },
		{ code: 385139006, display: 'ear powder' },
		{ code: 385156003, display: 'nasal powder' },
		{ code: 385164009, display: 'eye/ear/nose ointment' },
		{ code: 385174007, display: 'pessary' },
		{ code: 385186005, display: 'enema' },
		{ code: 385194003, display: 'suppository' },
		{ code: 385237000, display: 'implantation chain' },
		{ code: 385286003, display: 'implant dosage form' },
		{ code: 420385006, display: 'extended-release insert' },
		{ code: 420631002, display: 'vaginal insert' },
		{ code: 420699003, display: 'liquid dose form' },
		{ code: 420761001, display: 'urethral suppository' },
		{ code: 420927005, display: 'metered powder' },
		{ code: 420929008, display: 'rectal suppository' },
		{ code: 421034000, display: 'extended-release suppository' },
		{ code: 421079001, display: 'pastille' },
		{ code: 421131006, display: 'gaseous dose form' },
		{ code: 421195004, display: 'vaginal suppository' },
		{ code: 421271006, display: 'extended-release bead implant' },
		{ code: 421378002, display: 'solid dose form' },
		{ code: 421427005, display: 'eye/ear ointment' },
		{ code: 421716009, display: 'transdermal drug delivery system' },
		{ code: 421937009, display: 'medicated toothpaste' },
		{ code: 422186009, display: 'tincture' },
		{ code: 422259002, display: 'spirit' },
		{ code: 422301006, display: 'modified-release pessary' },
		{ code: 429885007, display: 'bar' },
		{ code: 443424002, display: 'buccal film' },
		{ code: 447050008, display: 'orodispersible film' },
	];
	
	private patterns: any[] = this.getPatterns();

}

/*
[
	'(?:extended release|delayed release|buccal|sustained release buccal|chewable|disintegrating|enteric coated|extended release enteric coated|sublingual|vaginal)?\\s*(?:oral)?\\s*tablet',
	'spray',
	'actuation',
	'applicatorful',
	'capful',
	'puff',
	'drop',
	'bar',
	'capsule',
	'pad\\b',
	'patch',
	'tape',
	'gum',
	'gel',
	'lozenge',
	'strip',
	'film',
	'tab(?:s)?\\b',
	'cap\\b',
	'stick'
];
*/