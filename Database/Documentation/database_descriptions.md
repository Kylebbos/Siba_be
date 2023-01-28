# Descriptions of the database tables

<details><summary>AllocCurrentRoundUser</summary>

***Not in use, at least not yet**

|Column			|	Datatype		|	Keys 	|	Description					
|:-----			| :------- 		| 	------- 	|	------ 					
|<u>allocId</u>	| INTEGER		| PK 			| 			
|<u>UserId</u>	| INTEGER		| PK, FK   		| Viittaus User taulun Id	

</details>

<details><summary>AllocRound</summary>
<small> (Laskenta tietylle kaudelle. Esimerkiksi kesä 2022 kurssit) </small>

Column			|	Datatype		|	Keys		|	Description
:-----			|	:---		|	-------		|	------
 <u>id</u>		| INTEGER		| PK			| Yksilöivä pääavain
 date			| TIMESTAMP 	|				| Laskennan luontiaika
 name			| VARCHAR(255)	|				| Laskennan nimi. eg. "Syksyn 2022 virallinen"			
 isSeasonAlloc	| BOOLEAN 		|				| Onko kausi aktiviinen *EI KÄYTÖSSÄ*
 userId			| INTEGER		| FK(User.id)	| Laskennan luoja/ylläpitäjä
 description 	| VARCHAR(16000)|				| Mahdollinen kuvaus laskentaa varten
 lastModified 	| TIMESTAMP 	|				| Viimeinen muokkaus laskennassa
 isAllocated    | BOOLEAN       |               | Onko allokointi suoritettu
 processOn      | BOOLEAN       |               | Onko allokointi käynnissä tällä hetkellä
 abortProcess   | BOOLEAN       |               | TRUE = pääkäyttäjä on antanut käskyn lopettaa allokointi kesken
 requireReset   | BOOLEAN       |               | Pitääkö allokointi resetoida, ennen kuin allokoinnin voi suorittaa uudestaan

</details>

<details><summary>AllocSpace</summary>
<small> (Tilanvaraukset laskennassa) </small>

 Column			|	Datatype		|	Keys			            	|	Description
 :-----			|	:----		|	------			            	|	------
 subjectId      | INTEGER		| PK, FK(allocSubject.subjectId)	| Opetus
 allocRound     | INTEGER		| PK, FK(allocSubject.allocRound)	| Laskenta esim. Syksy 2022
 spaceId 		| INTEGER		| PK, FK(space.id)	            	| Varattu tila
 totalTime		| TIME			|					            	| Opetusta varten varattu aika tilassa

</details>

<details><summary>AllocSubject</summary>
<small> (Opetukset laskentaa varten) </small>

Column			    |	Datatype		|	Keys		    |	Description
:-----			    |	:----		|	------		    |	------
<u>subjectId</u>    | INTEGER		|PK,FK(subject.id)  | Laskentaan lisätty opetus
<u>allocRound</u>   | INTEGER		|PK,FK(allocRound)  | Laskentatoteutus esim. Kevät 2022
isAllocated 	    | BOOLEAN		|				    | Onko kurssitoteutus jo lisätty laskentaan/allocSpace tauluun (0/1)
cantAllocate 	    | BOOLEAN		|				    | Merkitään True(1) kun kurssille ei löydy sopivia tiloja
priority		    | INTEGER		|				    | Opetuksien prioriteetti (arvoasteikko) - Missä järjestyksessä opetukset lisätään allocSpace-tauluun
allocatedDate 	    | TIMESTAMP		|				    | Päivämäärä, jolloin opetus on lisätty laskentaan

</details>

<details><summary>AllocSubjectSuitableSpace</summary>
<small>(Lisätään kaikki opetukseen soveltuvat tilat)</small>

Column			    |	Datatype		|	Keys		                    |	Description
:-----			    |	:----		|	------		                    |	------
<u>allocRound</u>   |  INTEGER      | PK, FK(AllocSubject.allocRound)   | Laskenta
<u>subjectId</u>    |  INTEGER      | PK, FK(AllocSubject.subjectId)    | Opetus
<u>spaceId</u>      |  INTEGER      | PK, FK(Space.id)                  | Tila
 missingItems       |  INTEGER		|									| Puuttuvien varusteiden lkm
</details>


<details><summary>Building</summary>
<small> (Rakennus) </small>

Column			|	Datatype		|	Keys		|	Description
:-----			|	:----		|	------		|	------
<u>id</u>		| INTEGER		| PK			| 
name			| VARCHAR(255)	|				| Rakennuksen nimi / Tunnus (Esim. N-Talo)
description		| VARCHAR(16000)|				| Rakennuksen vapaaehtoinen kuvaus

</details>


<details><summary>Department</summary>
Rakennus

Column			|	Datatype		|	Keys		|	Description
:-----			|	:----		|	------		|	------
<u>id</u>		| INTEGER		| PK			|
name			| VARCHAR(255)	|				| Aineryhmän nimi (esim. Jazz)
description		| VARCHAR(16000)|				| Aineryhmän kuvaus

</details>

<details><summary>DepartmentPlanner</summary>
<small> (aineryhmän suunnittelija) </small>

Column				|	Datatype		|	Keys				|	Description
:-----				|	:----		|	------				|	------
<u>departmentId</u> | INTEGER		| PK, FK(deparment.id)	| Suunnittelijalla oikeudet aineryhmän opetusten lisäykselle ja muokkaukselle.
<u>userId</u>		| INTEGER		| PK, FK(user.id)		| Suunnittelijan käyttäjätunnus

</details>

<details><summary>Equipment</summary>
<small> (Varustelista, josta lisätään yksittäisiä varusteita/soittimia tiloihin ja opetuksiin) </small>

Column			|	Datatype		|	Keys		|	Description
:-----			|	:----		|	------		|	------
<u>id</u>		| INTEGER		| PK			|
name			| VARCHAR(255)	| 				| Soittimen/varusteen nimi
isMovable		| BOOLEAN		| 				| Onko varuste siirreltävissä. Esim. Urut ei tod.näk ole
priority		| INTEGER		|				| IN PROGRESS
description		| VARCHAR(16000)|				| kuvaus

</details>

<details><summary>GlobalSettings</summary>
<small> (Yleiset asetukset järjestelmässä. Ehkä lisätään AllocSettings-taulu laskentaa varten erikseen) </small>

Column			|	Datatype		|	Keys		|	Description
:-----			|	:----		|	------		|	------
<u>id</u>		| INTEGER		| PK			|
name			| VARCHAR(255)	| 				| Asetukselle nimi
description		| VARCHAR(16000)|				| Description asetusta varten
numberValue		| INTEGER		| 				| Asetukseen kokonaisluku arvona
textValue		| VARCHAR(255)	|				| Asetukseen kiinteä tekstiarvo

</details>

<details><summary>Program</summary>
<small> (Pääaine) </small>

Column			|	Datatype		|	Keys			|	Description
:-----			|	:----		|	------			|	------
<u>id</u>		| INTEGER		| PK				|
name			| VARCHAR(255)	|					| Pääaineen nimi
departmentId	| INTEGER		| FK(department.id)	| Mihin aineryhmään pääaine sisältyy

</details>

<details><summary>Space</summary>
<small> (Tila - huone, studio, luokka jne.) </small>

Column			|	Datatype		|	Keys			|	Description
:-----			|	:----		|	------			|	------
<u>id</u>		| INTEGER		|PK					|
name			| VARCHAR(255)	|					| Nimi (Esim. R-5322 Musiikkiluokka)
area			| DECIMAL(5,1)	|					| Tilan tilavuus (neliömetreissä/m²)
info			| VARCHAR(16000)|					| Tilan lisätietoja / Description
personLimit 	| INTEGER		|					| Tilan maksimi henkilömäärä
buildingId		| INTEGER		|FK(building.id)	| Missä rakennuksessa tila sijaitsee
availableFrom	| TIME			|					| Aika, mistä lähtien tila on käytettävissä
availableTo		| TIME			|					| Aika, mihin asti tila on käytettävissä
classesFrom		| TIME			|					| Aika, mistä lähtien tila on käytettävissä opetusta varten
classesTo		| TIME			|					| Aika, mihin asti tila on käytettävissä opetusta varten
inUse			| BOOLEAN		|					| Onko tila käytettävissä vai pois käytöstä
spaceTypeId		| INTEGER		|FK(spaceType.id)	| Minkälainen opetustila kyseessä (Esim. Luentotila, soittotila, studio, jne.)

</details>

<details><summary>SpaceEquipment</summary>
<small> (Tilan varustus (soittimet, laitteistot yms.) </small>

Column				|	Datatype		|	Keys				|	Description
:-----				|	:----		|	------				|	------
<u>spaceId</u>		| INTEGER		|PK, FK(space.id)		| Tila
<u>equipmentId</u>	| INTEGER		|PK, FK(equipment.id)	| Varauste/Soitin

</details>

<details><summary>SpaceType</summary>
<small> (Tilatyyppi - Esim. luentotila, soittotila, studio jne.)</small>

Column			|	Datatype		|	Keys		|	Description
:-----			|	:----		|	------		|	------
<u>id</u>		| INTEGER		| PK			| 
name			| VARCHAR(255)	|				| Nimi (Esim. Studio)
description		| VARCHAR(16000)|				| Vapaaehtoinen kuvaus

</details>

<details><summary>Subject</summary>
<small> (Opetus) </small>

Column			|	Datatype		|	Keys			|	Description
:-----			|	:----		|	------			|	------
<u>id</u>		| INTEGER		| PK				|
name			| VARCHAR(255)	|					| Opetuksen nimi (esim. Huilunsoitto, Taso A)
groupSize		| INTEGER		|					| Ryhmän koko, yksittäiselle opetukselle
groupCount		| INTEGER		|					| Montako ryhmää. Esim. 2x groupSize
sessionLength	| TIME			|					| Opetuksen yksittäisen opetuksen pituus
sessionCount	| INTEGER		|					| Montako opetusta per viikko
area			| DECIMAL(5,1)	|					| Opetukseen tarvittava tilan koko (m²)
programId		| INTEGER		|FK(program.id)		| Mihin pääaineeseen opetus kuuluu
spaceTypeId		| INTEGER		|FK(spaceType.id)	| Minkälaisen tilan opetus tarvitsee (soitto/luento)

</details>

<details><summary>SubjectEquipment</summary>
<small> (Opetukseen tarvittavat soittimet / varusteet) </small>

Column				|	Datatype		|	Keys				|	Description
:-----				|	:----		|	------				|	------
<u>subjectId</u>	| INTEGER		| PK, FK(subject.id)	| Opetus
<u>equipmentId</u>	| INTEGER		| PK, FK(equipment.id)	| Varuste / Soitin
priority			| INTEGER		|						| Varusteen tärkeys (korkeampi numero on suurempi tarve)
obligatory			| BOOLEAN		|						| Onko varuste pakollinen kurssin kannalta (nostaa prioriteettia) ***Ei ainakaan vielä käytössä**

</details>

<details><summary>User</summary>

Column			| Datatype		| Keys		| Description
:-----			| :----			| ------		| ------
<u>id</u>		| INTEGER		| PK			|
email			| VARCHAR(255)	|				| Käyttäjän sähköpostiosoite
isAdmin			| BOOLEAN		|				| Onko käyttäjällä pääkäyttäjän oikeuksia

</details>

<details><summary>log_event</summary>

Merkitä lokissa.
Column			| Datatype		| Keys		| Description
:-----			| :----			| ------		| ------
<u>id</u>       | INTEGER       | PK            |
log_id          | INTEGER       |               | Lokin tunniste
stage           | VARCHAR(255)  |               | Vaihe (esim. priorisointi allokoinnissa)
status          | VARCHAR(255)  |               | Status eli esim. OK tai Error
information     | VARCHAR(16000)|               | Lisätieto
created_at      | TIMESTAMP     |               | Merkinnän aika

</details>

<details><summary>log_type</summary>

Lokin tyyppi, tällä hetkellä käytössä vain allokointi (allocation).
Column			| Datatype		| Keys		| Description
:-----			| :----			| ------		| ------
<u>id</u>		| INTEGER		|  PK			|
name			| VARCHAR(255)	| 				| nimi

</details>

<details>
<summary>log_list</summary>

Lista lokeista, jotta voi löytää helpommin esim. tiettyyn kelloon aikaan tehdyn laskennan.
Column			| Datatype		| Keys		| Description
:-----			| :----			| ------		| ------
<u>id</u>       | INTEGER       | PK            |
log_type        | INTEGER      	| FK            | Lokityyppi (esim. allocation)
created_at      | TIMETAMP     	|               | Listan luontiaika
</details>