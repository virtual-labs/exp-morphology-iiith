### Morph Analyser


#### Definition

Morphemes are considered as smallest meaningful units of language. These morphemes can either be a root word(play) or affix(-ed). Combination of these morphemes is called morphological process. So, word "played" is made out of 2 morphemes "play" and "-ed". Thus finding all parts of a word(morphemes) and thus describing properties of a word is called "Morphological Analysis". For example, "played" has information verb "play" and "past tense", so given word is past tense form of verb "play".

#### Analysis of a word :

बच्चों (bachchoM) = बच्चा(bachchaa)(root) + ओं(oM)(suffix)
(ओं=3 plural oblique)
A linguistic paradigm is the complete set of variants of a given lexeme. These variants can be classified according to shared inflectional categories (eg: number, case etc) and arranged into tables.

### Paradigm for बच्चा

|Case/num|Singular|Plural|
|---|---|---|
|Direct|बच्चा(bachchaa)|बच्चे(bachche)|
|oblique|बच्चे(bachche)|बच्चों (bachchoM)|

#### Algorithm to get बच्चों(bachchoM) from बच्चा(bachchaa)

1. Take Root बच्च(bachch)आ(aa)
2. Delete आ(aa)
3. output बच्च(bachch)
4. Add ओं(oM) to output
5. Return बच्चों (bachchoM)

 Therefore आ is deleted and ओं is added to get बच्चों

#### Add-Delete table for बच्चा

|Delete|Add|Number|Case|Variants|
|---|---|---|---|---|
|आ(aa)|आ(aa)|sing|dr|बच्चा(bachchaa)|
|आ(aa)|ए(e)|Plu|dr|बच्चे(bachche)|
|आ(aa)|ए(e)|Sing|ob|बच्चे(bachche)|
|आ(aa)|ओं(oM)|Plu|ob|बच्चों(bachchoM)|

###  Paradigm Class

Words in the same paradigm class behave similarly, for Example लड़क is in the same paradigm class as बच्च, so लड़का would behave similarly as बच्चा as they share the same paradigm class.