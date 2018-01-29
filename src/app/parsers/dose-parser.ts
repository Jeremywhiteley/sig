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
			pattern: new RegExp('(?<!(?:no more than|do not exceed|not to exceed|\\bnmt|\\bnte)\\s*)\\(*\\**(' + regexRange + ')\\**\\)*(?:\\s*(' + this.doseUnits.join('|') + '))', 'ig'),
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
	
	private doseUnits: string[] = [
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
}

/*
Code	Display	Definition
7946007 	Drug suspension	
11190007 	Drug stick	
17519006 	Lotion	
30843009 	Drug aerosol foam	
36875001 	Drug patch	
37937005 	Drug paste	
46992007 	Pill	
48582000 	Caplet	
52262001 	Drug aerosol	
63316001 	Liniment	
64241004 	Drug pledget	
66076007 	Chewable tablet	
77899000 	Drug solution	
85581007 	Drug powder	
385018001 	Oral drops	
385019009 	Oral drops solution	
385020003 	Oral drops suspension	
385021004 	Oral drops emulsion	
385022006 	Oral liquid	
385023001 	Oral solution	
385024007 	Oral suspension	
385025008 	Oral emulsion	
385026009 	Powder for oral solution	
385027000 	Powder for oral suspension	
385028005 	Granules for oral solution	
385029002 	Granules for oral suspension	
385032004 	Syrup	
385033009 	Powder for syrup	
385034003 	Granules for syrup	
385035002 	Soluble tablet	
385036001 	Dispersible tablet	
385038000 	Oral gel	
385039008 	Oral paste	
385041009 	Oral powder	
385042002 	Effervescent powder	
385043007 	Granules	
385044001 	Effervescent granules	
385045000 	Gastro-resistant granules	
385046004 	Prolonged-release granules	
385047008 	Modified-release granules	
385048003 	Cachet	
385049006 	Capsule	
385050006 	Hard capsule	
385051005 	Soft capsule	
385052003 	Gastro-resistant capsule	
385053008 	Prolonged-release capsule	
385054002 	Modified-release capsule	
385055001 	Tablet	
385057009 	Film-coated tablet	
385058004 	Effervescent tablet	
385059007 	Gastro-resistant tablet	
385060002 	Prolonged-release tablet	
385061003 	Modified-release tablet	
385062005 	Oral lyophilisate	
385063000 	Oral gum	
385064006 	Pillule	
385069001 	Oromucosal liquid	
385070000 	Oromucosal solution	
385071001 	Oromucosal suspension	
385073003 	Oromucosal spray	
385074009 	Sublingual spray	
385077002 	Gingival solution	
385078007 	Oromucosal gel	
385079004 	Oromucosal paste	
385080001 	Medicated chewing-gum	
385081002 	Gingival gel	
385082009 	Gingival paste	
385083004 	Oromucosal capsule	
385084005 	Sublingual tablet	
385085006 	Buccal tablet	
385086007 	Muco-adhesive buccal tablet	
385087003 	Lozenge	
385088008 	Dental gel	
385089000 	Dental stick	
385090009 	Dental insert	
385091008 	Dental powder	
385092001 	Dental liquid	
385094000 	Dental solution	
385095004 	Dental suspension	
385096003 	Dental emulsion	
385098002 	Bath additive	
385099005 	Cream	
385100002 	Gel	
385101003 	Ointment	
385102005 	Cutaneous paste	
385103000 	Cutaneous foam	
385104006 	Shampoo	
385105007 	Cutaneous spray	
385106008 	Cutaneous solution spray	
385107004 	Cutaneous liquid	
385108009 	Cutaneous solution	
385110006 	Cutaneous suspension	
385111005 	Cutaneous emulsion	
385112003 	Cutaneous powder	
385113008 	Solution for iontophoresis	
385114002 	Transdermal patch	
385115001 	Collodion	
385116000 	Medicated nail laquer	
385117009 	Poultice	
385118004 	Cutaneous stick	
385119007 	Cutaneous sponge	
385121002 	Eye cream	
385122009 	Eye gel	
385123004 	Eye ointment	
385124005 	Eye drops	
385125006 	Eye drops solution	
385128008 	Prolonged-release eye drops	
385130005 	Eye lotion	
385132002 	Ophthalmic insert	
385133007 	Ear cream	
385134001 	Ear gel	
385135000 	Ear ointment	
385136004 	Ear drops	
385137008 	Ear drops solution	
385138003 	Ear drops emulsion	
385139006 	Ear powder	
385140008 	Ear spray	
385141007 	Ear spray solution	
385142000 	Ear spray suspension	
385143005 	Ear spray emulsion	
385147006 	Ear tampon	
385148001 	Ear stick	
385149009 	Nasal cream	
385150009 	Nasal gel	
385151008 	Nasal ointment	
385152001 	Nasal drops	
385153006 	Nasal drops solution	
385154000 	Nasal drops suspension	
385155004 	Nasal drops emulsion	
385156003 	Nasal powder	
385157007 	Nasal spray	
385158002 	Nasal spray solution	
385159005 	Nasal spray suspension	
385160000 	Nasal spray emulsion	
385162008 	Nasal stick	
385163003 	Eye/ear/nose drops	
385164009 	Eye/ear/nose ointment	
385165005 	Vaginal cream	
385166006 	Vaginal gel	
385167002 	Vaginal ointment	
385168007 	Vaginal foam	
385169004 	Vaginal liquid	
385170003 	Vaginal solution	
385171004 	Vaginal suspension	
385172006 	Vaginal emulsion	
385173001 	Tablet for vaginal solution	
385174007 	Pessary	
385175008 	Vaginal capsule	
385176009 	Hard vaginal capsule	
385177000 	Soft vaginal capsule	
385178005 	Vaginal tablet	
385179002 	Effervescent vaginal tablet	
385180004 	Medicated vaginal tampon	
385182007 	Rectal cream	
385183002 	Rectal gel	
385184008 	Rectal ointment	
385185009 	Rectal foam	
385186005 	Enema	
385187001 	Rectal solution	
385188006 	Rectal suspension	
385189003 	Rectal emulsion	
385191006 	Powder for rectal suspension	
385192004 	Tablet for rectal solution	
385193009 	Tablet for rectal suspension	
385194003 	Suppository	
385195002 	Rectal capsule	
385196001 	Rectal tampon	
385197005 	Nebulizer liquid	
385198000 	Nebulizer solution	
385199008 	Nebulizer suspension	
385200006 	Powder for nebulizer suspension	
385201005 	Powder for nebulizer solution	
385202003 	Nebulizer emulsion	
385203008 	Pressurised inhalation	
385204002 	Pressurised inhalation solution	
385205001 	Pressurised inhalation suspension	
385206000 	Pressurised inhalation emulsion	
385207009 	Inhalation powder	
385208004 	Hard capsule inhalation powder	
385210002 	Inhalation vapor	
385211003 	Inhalation vapor powder	
385212005 	Inhalation vapor capsule	
385213000 	Inhalation vapor solution	
385214006 	Inhalation vapor tablet	
385215007 	Inhalation vapor ointment	
385216008 	Inhalation vapor liquid	
385217004 	Inhalation gas	
385219001 	Injection solution	
385220007 	Injection suspension	
385221006 	Injection emulsion	
385222004 	Injection powder	
385223009 	Powder for injection solution	
385224003 	Powder for injection suspension	
385229008 	Infusion solution	
385230003 	Infusion powder	
385231004 	Powder for infusion solution	
385236009 	Implantation tablet	
385237000 	Implantation chain	
385242008 	Intravesical solution	
385245005 	Urethral gel	
385246006 	Urethral stick	
385247002 	Endotracheopulmonary instillation solution	
385248007 	Powder for endotracheopulmonary instillation solution	
385250004 	Endotracheopulmonary instillation suspension	
385251000 	Endocervical gel	
385257001 	Gastroenteral liquid	
385258006 	Gastroenteral solution	
385259003 	Gastroenteral suspension	
385260008 	Gastroenteral emulsion	
385261007 	Wound stick	
385262000 	Organ preservation solution	
385278003 	Cutaneous powder spray	
385279006 	Cutaneous suspension spray	
385286003 	Implant dosage form	
414951009 	Oral elixir	
420243009 	Tampon dose form	
420253005 	Oil injection	
420275007 	Semi-solid dose form	
420283001 	Nasal emulsion	
420292003 	Rectal powder	
420293008 	Coated pellets capsule	
420305009 	Powder for oral liquid	
420317006 	Inhaler	
420378007 	Extended-release film coated tablet	
420385006 	Extended-release insert	
420386007 	Emulsion	
420407000 	Inhalation aerosol solution	
420430006 	Lyophilized powder for injectable extended release liposomal suspension	
420450005 	Pressurized nebulizer suspension	
420460001 	Film	
420509004 	Oral granules	
420536002 	Vaginal powder	
420540006 	Cutaneous oil	
420610000 	Nasal aerosol	
420627008 	Extended-release tablet	
420631002 	Vaginal insert	
420634005 	Microspheres for injectable suspension	
420636007 	Eye/ear drops	
420641004 	Solution for inhalation	
420656008 	Lyophilized powder for injectable liposomal suspension	
420692007 	Oral capsule	
420699003 	Liquid dose form	
420705007 	Inhalation aerosol suspension	
420736004 	Eye suspension	
420757007 	Delayed-release granules	
420761001 	Urethral suppository	
420767002 	Delayed-release pellets capsule	
420768007 	Pellet	
420802004 	Extended-release liquid	
420828001 	Powder for reconstitution for drug product	
420847003 	Metered dose aerosol	
420873008 	Extended release injectable suspension	
420887008 	Intrathecal suspension	
420891003 	Ear drops suspension	
420901005 	Ear emulsion	
420927005 	Metered powder	
420929008 	Rectal suppository	
420955009 	Powder for solution	
420956005 	Ultramicronized tablet	
420992009 	Implantable pellet	
421026006 	Oral tablet	
421027002 	Delayed-release capsule	
421034000 	Extended-release suppository	
421043009 	Extended-release film	
421051007 	Sonicated injectable suspension	
421056002 	Emulsion for inhalation	
421079001 	Pastille	
421080003 	Powder for suspension	
421104008 	Aerosol powder	
421131006 	Gaseous dose form	
421155001 	Extended-release enteric coated tablet	
421166008 	Foam	
421195004 	Vaginal suppository	
421221008 	Suspension for inhalation	
421271006 	Extended-release bead implant	
421288004 	Sponge	
421300005 	Extended-release film coated capsule	
421316007 	Powder for eye drops	
421338009 	Extended-release coated capsule	
421340004 	Powder spray	
421343002 	Powder for cutaneous solution	
421347001 	Cutaneous aerosol	
421366001 	Tablet for oral suspension	
421374000 	Delayed-release tablet	
421378002 	Solid dose form	
421382000 	Ear suspension	
421410002 	Intravenous solution	
421425002 	Powder for inhalation solution	
421427005 	Eye/ear ointment	
421428000 	Injectable oil suspension	
421446006 	Extended-release granules for suspension	
421504000 	Cone	
421522002 	Liposomal injectable suspension	
421532009 	Insert	
421535006 	Delayed-release particles tablet	
421575003 	Powder for ear drops	
421606006 	Aerosol spray	
421607002 	Powder for nasal drops	
421618002 	Extended-release capsule	
421620004 	Sustained-release buccal tablet	
421628006 	Cutaneous cream	
421637006 	Lyophilized powder for injectable solution	
421669002 	Metered gel	
421701006 	Tablet for oral solution	
421713001 	Ear solution	
421716009 	Transdermal drug delivery system	
421720008 	Spray dose form	
421721007 	Coated particles tablet	
421752008 	Extended-release enteric coated capsule	
421759004 	Metered dose aerosol inhaler	
421765004 	Intraperitoneal solution	
421857007 	Powder for ophthalmic solution	
421873001 	Oral cream	
421890007 	Oil	
421932003 	Multilayer tablet	
421937009 	Medicated toothpaste	
421943006 	Lyophilized powder for injectable suspension	
421949005 	Cutaneous gel	
421987002 	Intraocular solution	
421999009 	Extended-release coated pellets	
422054001 	Metered dose powder inhaler	
422059006 	Metered dose inhaler	
422060001 	Ophthalmic solution	
422068008 	Eye drops suspension	
422080000 	Nasal suspension	
422085005 	Powder for ophthalmic suspension	
422151007 	Breath activated powder inhaler	
422186009 	Tincture	
422197009 	Breath activated inhaler	
422199007 	Dental cone	
422201009 	Tablet for cutaneous solution	
422202002 	Colloidal suspension for injection	
422259002 	Spirit	
422264003 	Powder for injectable extended release suspension	
422301006 	Modified-release pessary	
422336005 	Nasal solution	
422353003 	Extended-release suspension	
424179000 	Aerosol generator	
424552006 	Vaginal sponge	
425753008 	Topical ointment	
425965000 	Rectal spray	
426210003 	Gum	
426684005 	Drops dose form	
426823003 	Vaginal spray	
426969004 	Metered spray	
427129005 	Coated capsule	
427564005 	Pressurized spray	
427609008 	Modified release drops dose form	
429885007 	Bar	
443424002 	Buccal film	
447050008 	Orodispersible film	
447079001 	Orodispersible tablet	
*/