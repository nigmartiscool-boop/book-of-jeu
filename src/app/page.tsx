'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */
interface Lore {
  title: string
  body: string
}
interface Hotspot {
  id: string
  label: string
  brief: string
  detail: string
  icon: string
}
interface TreasuryPage {
  id: string
  nav: string
  title: string
  ref: string
  desc: string
  lore: Lore[]
  hotspots: Hotspot[]
}

/* ═══════════════════════════════════════════════════
   TREASURY DATA
   ═══════════════════════════════════════════════════ */
const PAGES: TreasuryPage[] = [
  {
    id: 'treasury',
    nav: 'I \u00b7 Treasury of Light',
    title: 'The Treasury of the Light',
    ref: 'Book of Jeu I \u00b7 Chapters 1\u201315 \u00b7 Bruce Codex ff. 1r\u201317v',
    desc: 'The supreme abode of the Divine \u2014 source of all spiritual light. Structured as twelve concentric aeons each sealed by a guardian, enclosing three great curtains, and at the innermost, the Great Invisible: the unknowable source from which all light and life flows downward into creation.',
    lore: [
      { title: 'Origin of the Text', body: 'The Book of Jeu was preserved in the Codex Brucianus, discovered in Egypt and acquired by James Bruce in 1769. Written in Coptic, it likely translates earlier Greek originals. The diagrams it contains are unique survivals of actual initiatory seals used in Sethian Gnostic ritual.' },
      { title: 'The Pleroma', body: 'The Pleroma ("Fullness") is the totality of divine light, comprising all aeons in their perfection. The Treasury stands at its apex. The fall of Sophia and the formation of the material world are understood as a leak of light downward out of the Pleroma.' },
      { title: 'The Twelve Aeons', body: 'Each of the twelve outer chambers is presided over by an aeon-ruler. Their names include Harmozel (light of grace), Oroiael (light of thought), Daveithe (light of understanding), and Eleleth (light of perception). Each presides over a class of souls.' },
      { title: 'The Three Curtains', body: 'Three veils separate the inner sanctum from the Pleroma. The outer veil is penetrable by higher archons; the middle by perfect souls of the elect; the innermost veil can only be crossed by those who have received all five seals of the baptismal rite.' }
    ],
    hotspots: [
      { id: 'harmozel', label: 'Harmozel', brief: 'First Aeon \u2013 Light of Grace', icon: '\u2726', detail: 'Harmozel is the first of the twelve aeon-rulers, governing the Light of Grace. He presides over the eastern quarter of the Treasury and is invoked first in the baptismal rite. His seal is a simple circle containing a single point \u2014 the origin of all emanation. Souls under his dominion are those who first received the divine spark.' },
      { id: 'oroiael', label: 'Oroiael', brief: 'Second Aeon \u2013 Light of Thought', icon: '\u25C7', detail: 'Oroiael governs the Light of Thought, the second emanation from the Treasury. His name means "Light of God" and his domain encompasses all intellectual and contemplative souls. His seal is a circle bisected by a horizontal line, representing the division between the higher and lower mind.' },
      { id: 'daveithe', label: 'Daveithe', brief: 'Third Aeon \u2013 Light of Understanding', icon: '\u25B3', detail: 'Daveithe, the third aeon, presides over the Light of Understanding. Where Oroiael governs thought, Daveithe governs comprehension \u2014 the moment when thought crystallizes into knowledge. His seal is a triangle within a circle, the three points representing the knower, the known, and the act of knowing.' },
      { id: 'eleleth', label: 'Eleleth', brief: 'Fourth Aeon \u2013 Light of Perception', icon: '\u2741', detail: 'Eleleth is the fourth aeon-ruler, governing the Light of Perception \u2014 the faculty by which the soul perceives divine truth directly, without mediation. His seal is a four-petaled flower within a circle, representing the opening of the soul\'s inner eye to the four directions of divine light.' },
      { id: 'gamaliel', label: 'Gamaliel', brief: 'Fifth Aeon \u2013 Light of Revealment', icon: '\u263D', detail: 'Gamaliel, the fifth aeon, governs the Light of Revealment. He is the revealer of hidden mysteries and the patron of prophetic souls. His seal contains a crescent within a circle \u2014 the moon that receives and reflects the light of the sun, just as the prophet receives and reflects the light of the Pleroma.' },
      { id: 'gabriel', label: 'Gabriel', brief: 'Sixth Aeon \u2013 Light of Strength', icon: '\u2720', detail: 'Gabriel is the sixth aeon, governing the Light of Strength. Not physical strength but spiritual fortitude \u2014 the power to stand before the Archons and speak the passwords without fear. His seal is a cross patt\u00e9e within a circle, the cross of the soul that has endured the baptism of fire.' },
      { id: 'samblo', label: 'Samblo', brief: 'Seventh Aeon \u2013 Light of Peace', icon: '\u25CB', detail: 'Samblo is the seventh aeon, presiding over the Light of Peace \u2014 the deep stillness that descends upon the soul after it has passed through the first six gates. His seal is a simple void circle, representing the emptiness that contains all possibilities, the silence from which all sacred names emerge.' },
      { id: 'abrasax', label: 'Abrasax', brief: 'Eighth Aeon \u2013 Light of the Year', icon: '\u2160', detail: 'Abrasax is perhaps the most famous of the aeon-rulers. His name enumerates to 365 in Greek numerals (A=1, B=2, R=100, A=1, S=200, A=1, X=60), making him lord of the solar year and the 365 heavens. His seal traditionally bears a cock-headed, serpent-footed figure \u2014 the Abraxas of the Gnostic gems.' },
      { id: 'iaoth', label: 'Iaoth', brief: 'Ninth Aeon \u2013 Light of the Name', icon: '\u25A1', detail: 'Iaoth is the ninth aeon, governing the Light of the Name. He is the keeper of the divine name that must be spoken at the ninth gate. His seal is a square within a circle \u2014 the four-letter name inscribed within the perfection of the Pleroma. The name Iaoth itself echoes the tetragrammaton.' },
      { id: 'sabaoth', label: 'Sabaoth', brief: 'Tenth Aeon \u2013 Light of Hosts', icon: '\u2606', detail: 'Sabaoth, the tenth aeon, governs the Light of Hosts \u2014 the angelic orders that serve the Treasury. Unlike the Archons, these hosts are luminous beings who aid the ascending soul. His seal is a six-pointed star, representing the six orders of angels who minister at the gates of the Treasury.' },
      { id: 'adonaios', label: 'Adonaios', brief: 'Eleventh Aeon \u2013 Light of Lordship', icon: '\u25C6', detail: 'Adonaios is the eleventh aeon, governing the Light of Lordship \u2014 divine authority exercised in service rather than domination. His name echoes the Hebrew Adonai ("My Lord"). His seal is a diamond within a circle, the gem of authority that refracts the single light of the Treasury into the many colors of the aeons.' },
      { id: 'sabaoth2', label: 'Sabaoth the Lesser', brief: 'Twelfth Aeon \u2013 Light of Completion', icon: '\u25CE', detail: 'Sabaoth the Lesser, the twelfth aeon, governs the Light of Completion. He stands at the innermost point of the outer ring, the final guardian before the three veils. His seal is a double circle \u2014 the completion of one cycle and the beginning of the next, the ouroboros of the aeonic procession.' },
      { id: 'veils', label: 'The Three Veils', brief: 'Curtains separating the inner sanctum', icon: '\u2261', detail: 'The three veils are boundaries of increasing sanctity. The outermost veil filters the light of the Pleroma so that the lower aeons are not consumed. The middle veil admits only those who have received the baptism of fire. The innermost veil opens solely for the soul bearing all five seals \u2014 water, fire, spirit, chrism, and the seal of the name of Jeu himself.' },
      { id: 'spark', label: 'The Divine Spark', brief: 'Seed of light within the soul', icon: '\u2736', detail: 'At the heart of every human soul lies a fragment of divine light \u2014 a spark that fell from the Pleroma when Sophia erred. This spark is the reason the Archons cannot fully possess the soul, and it is the beacon by which the Treasury draws the ascending spirit back toward its source. The baptismal rite awakens and fans this spark into a flame.' },
      { id: 'invisible', label: 'The Great Invisible', brief: 'The unknowable source of all', icon: '\u25C9', detail: 'At the innermost point of the Treasury dwells the Great Invisible \u2014 the Unknowable Father, beyond all names, beyond all aeons, beyond even the Pleroma itself. No mind can comprehend it; no tongue can name it. It is the silence from which all sound emanates, the darkness from which all light shines forth.' }
    ]
  },
  {
    id: 'jeu',
    nav: 'II \u00b7 Jeu, the True God',
    title: 'Jeu, the True God \u2014 Father of the Treasury',
    ref: 'Book of Jeu I \u00b7 Chapters 2\u20134 \u00b7 Bruce Codex ff. 2r\u20135v',
    desc: 'Jeu is the Great Overseer, the Father who stands at the apex of the aeons and administers the Treasury. He begat 49 powers arranged in a seven-by-seven matrix, inscribed his name upon the living water, and sent emanations of light into the lower worlds.',
    lore: [
      { title: 'Who Is Jeu?', body: 'Jeu (also Ieu or Ieou) occupies a position analogous to the Gnostic figure of Barbelo \u2014 the first self-manifestation of the unknowable God. He is not the Demiurge (the ignorant creator of matter) but the first-born of the highest light. The text states: "Jeu established himself and observed himself and saw that he was alone, and he appointed his powers."' },
      { title: 'The 49 Powers', body: 'Jeu\'s 49 powers are arranged in a seven-by-seven grid, mirroring the sacred geometry of the Heptad. Each power rules a domain: some govern the movement of souls, others administer the seals of the aeons, others oversee the baptismal waters. Each power has a name, a face, and a number.' },
      { title: 'The Living Water', body: 'Jeu inscribed his unutterable name upon "the living water" \u2014 a concept related to the baptismal rite. The Book of Jeu II contains extensive rubrics for a "baptism with water, fire, and holy spirit," in which the baptismal water becomes the vehicle for the divine seal.' },
      { title: 'The Manuscript Diagrams', body: 'The Bruce Codex actually contains circular seal diagrams at this point in the text, with radial divisions, names in Coptic and Greek, and concentric rings \u2014 making the Book of Jeu one of the very few Gnostic texts to survive with its original ritual diagrams intact.' }
    ],
    hotspots: [
      { id: 'central', label: 'The Name of Jeu', brief: 'The unutterable tetragrammaton', icon: '\u2726', detail: 'At the center of Jeu\'s seal burns his name \u2014 ΙΕΥ \u2014 a tetragrammaton of power that may only be spoken during the baptismal rite and never in the hearing of the Archons. The name is the key to all the Treasury\'s gates and the seal upon every soul that has been baptized in the living water.' },
      { id: 'halo', label: 'The Twelve Emanations', brief: 'Rays of the aeons radiating outward', icon: '\u2605', detail: 'Twelve rays emanate from the name of Jeu, one for each of the aeons. Each ray carries a different quality of divine light \u2014 grace, thought, understanding, perception, revealment, strength, peace, the year, the name, hosts, lordship, and completion. Together they form the complete spectrum of the Pleroma\'s radiance.' },
      { id: 'ring7', label: 'The Seven Heavens', brief: 'Concentric rings of divine administration', icon: '\u25CE', detail: 'Seven concentric rings surround the name of Jeu, each representing one of the seven heavens of the Gnostic cosmos. The rings are inscribed with the seven sacred vowels \u2014 I, E, O, Y, O, A, O \u2014 which are both the names of the heavens and the sounds spoken during the baptismal invocation.' },
      { id: 'powers49', label: 'The 49 Powers', brief: 'Seven-by-seven matrix of emanations', icon: '\u25A0', detail: 'Jeu\'s 49 powers are arranged in a seven-by-seven grid, mirroring the sacred geometry of the Heptad. Each power rules a domain: some govern the movement of souls, others administer the seals of the aeons, others oversee the baptismal waters. The 49 dots inscribed around the outer ring represent these powers.' },
      { id: 'innertri', label: 'The Triple Flame', brief: 'Three fires of purification, sealing, and illumination', icon: '\u25B2', detail: 'At the heart of Jeu\'s seal, three triangular flames point inward \u2014 the fires of purification, sealing, and illumination. These are the three fires of the baptismal rite, the three aspects of the divine seal, and the three ways in which the light of the Treasury transforms the soul that approaches it.' }
    ]
  },
  {
    id: 'archons',
    nav: 'III \u00b7 Archon Seals',
    title: 'The Seals of the Archons \u2014 Gates of Ascent',
    ref: 'Book of Jeu I \u00b7 Chapters 30\u201350 \u00b7 Bruce Codex ff. 20r\u201339v',
    desc: 'Between the soul and the Treasury stand the Archons \u2014 rulers of the planetary spheres who guard the gates of ascent. Each Archon demands a password, a seal, and a name. The Book of Jeu provides the complete liturgy for passing every gate.',
    lore: [
      { title: 'The Archons and Their Origin', body: 'The Archons were created when Ialdabaoth, the Demiurge, formed the material cosmos. Each planet and sphere received an Archon as its ruler. In the Sethian system these rulers are not evil per se but ignorant \u2014 they block the soul\'s ascent not out of malice but because they believe the material realm is the highest reality.' },
      { title: 'The Baptism of Fire', body: 'Book of Jeu II contains the full ritual script for the baptism of fire, which equips the soul with the counter-seals needed to pass the archonic gates. The text describes the priest anointing the candidate with "the unction of the mysteries of the repentance," followed by sealing with the fire-seal.' },
      { title: 'Passwords and Seals', body: 'For each gate the initiate must: (1) name the archon correctly, (2) present the appropriate counter-seal, (3) speak the password in the archon\'s own language, and (4) recite the name of the higher aeon who commissioned the soul\'s ascent. Only then does the gate open.' },
      { title: 'Ialdabaoth the Demiurge', body: 'Ialdabaoth (also Saklas, "the fool," and Samael, "blind god") is the ignorant creator who formed the material world believing himself to be the highest god. The ascending soul must address him: "Withdraw, Saklas, for I descend not into your realm; I come from the height of the Father of the Treasury of Light."' }
    ],
    hotspots: [
      { id: 'treasury_top', label: 'The Treasury of Light', brief: 'Destination of the ascending soul', icon: '\u2726', detail: 'The Treasury of Light sits above all gates, the destination toward which every ascending soul strives. From its apex Jeu watches the progress of the soul through each archonic gate, and his seal opens the way when the correct passwords are spoken.' },
      { id: 'ialdabaoth', label: 'Ialdabaoth', brief: 'Lion-faced Demiurge \u2013 Outermost Gate', icon: '\u264C', detail: 'Ialdabaoth stands at the outermost gate of the material world. His seal is a lion-faced serpent biting its own tail. The ascending soul must know his true name (Saklas), his counter-name (Samael), and speak: "I am from before the beginning; thy realm has no power over me." His gate is the most complex, for he is the most powerful of the Archons.' },
      { id: 'gate3', label: 'Third Gate', brief: 'Eagle-headed Archon \u2013 Fixed-star sphere', icon: '\u2660', detail: 'The third gate marks the boundary of the fixed-star sphere. Its Archon is eagle-headed, and its seal is a seven-pointed star within a hexagonal frame. The initiate must present the fire-seal and recite: "I ascend beyond the seven stars, for I bear the seal of the eighth day." The gate\'s complexity is moderate \u2014 a hexagon with inscribed star.' },
      { id: 'gate2', label: 'Second Gate', brief: 'Ram-headed Archon \u2013 Aetheric boundary', icon: '\u2648', detail: 'The second gate separates the material aether from the celestial realm proper. Its Archon bears a ram\'s head and its seal is a pentagram within concentric circles. The soul must speak the second password: "I shed my aetheric body; I come clothed only in light." The pentagram represents the five seals of baptism.' },
      { id: 'gate1', label: 'First Gate', brief: 'Crocodile-headed Archon \u2013 Outermost sphere', icon: '\u2625', detail: 'The first gate is the simplest, marking the boundary of the sublunary material world. Its Archon is crocodile-headed, and its seal is a simple cross within a circle. The initiate recites: "Withdraw, judge of falsehood, I am clothed in the garment of the light of my father, the Treasury of Light."' },
      { id: 'counter', label: 'The Counter-Seal', brief: 'Baptismal seal \u2013 Passport of the soul', icon: '\u2726', detail: 'The counter-seal is imprinted on the soul during the baptismal rite. The Book of Jeu describes it as a seal "in the form of the name of Jeu written in fire upon the garment of light." It functions as a passport through each archonic gate \u2014 each Archon recognizes the seal as a mark of divine authority and is compelled to step aside.' }
    ]
  },
  {
    id: 'baptism',
    nav: 'IV \u00b7 Baptism Rite',
    title: 'The Rite of Baptism with Fire and Water',
    ref: 'Book of Jeu II \u00b7 Chapters 42\u201352 \u00b7 Bruce Codex ff. 103r\u2013114v',
    desc: 'Book of Jeu II preserves a nearly complete ritual script for the Gnostic baptism \u2014 one of the earliest surviving liturgical documents of Gnostic Christianity. It describes the sealing of candidates with fire, anointing with oil, the binding of vine branches, and the recitation of the names of the aeons.',
    lore: [
      { title: 'Three Baptisms', body: 'The Book of Jeu II describes three baptisms performed in sequence: the baptism of water (purification), the baptism of fire (sealing and empowerment), and the baptism of the Holy Spirit (the final reception of the divine name). Each leaves an invisible seal upon the soul\'s "luminous garment."' },
      { title: 'The Ritual Script', body: 'The text provides direct speech: "Hear me, Father, father of all fatherhood, boundless light: let the light-seal descend upon [name], that they may pass through all the rulers of the world and all the rulers of the darkness." Scholars regard this as an actual liturgical formula.' },
      { title: 'The Vine Branches', body: 'An unusual element is the instruction to bind vine branches around the hands of the candidate \u2014 a possible echo of Dionysiac mystery rites absorbed into the Gnostic synthesis. The vine, associated with the blood of Christ in mainstream Christianity, here becomes a seal-bearer and symbol of enclosed divine light.' },
      { title: 'The Role of the Priest', body: 'The officiating priest speaks the names of the aeons over the candidate while placing a seal on their forehead, mouth, and chest. The candidate must keep their eyes closed throughout and respond only with "Amen." The priest concludes: "Go in peace, for I set the seal upon you from the Treasury of the Light."' }
    ],
    hotspots: [
      { id: 'fire', label: 'Baptism of Fire', brief: 'The sealing empowerment of the soul', icon: '\u2736', detail: 'The baptism of fire is administered after the water baptism. The priest recites a long invocation calling upon Jeu and the 49 powers. A seal of fire is then symbolically traced upon the candidate\'s luminous garment \u2014 described as "living fire that does not consume the soul but illuminates it and makes it invincible before the archons."' },
      { id: 'water', label: 'Baptism of Water', brief: 'Purification and first sealing', icon: '\u224b', detail: 'The water baptism comes first and performs a cleansing function. The candidate confesses their entrapment in matter and calls upon the name of Jeu. The water used is "living water" \u2014 water sealed with the name of Jeu and thus charged with divine power. The baptism is performed by full immersion.' },
      { id: 'spirit', label: 'Baptism of Spirit', brief: 'Final reception of the divine name', icon: '\u2726', detail: 'The third and final baptism is that of the Holy Spirit, in which the divine name itself descends upon the candidate. This is the culmination of the rite \u2014 the moment when the soul receives its luminous garment in full and is sealed for all eternity against the powers of the Archons.' },
      { id: 'vine', label: 'The Vine Branches', brief: 'Symbol of enclosed divine light', icon: '\u2618', detail: 'The ritual instruction reads: "Bind vine branches around their hands." The vine is a symbol of divine life enclosed in material form \u2014 just as wine contains the spirit of the grape, the initiate\'s body contains the divine spark. This has no direct parallel in mainstream Christian baptismal rites.' },
      { id: 'names', label: 'The Sacred Names', brief: 'Living words spoken over the candidate', icon: '\u2735', detail: 'The baptismal invocation includes voces magicae \u2014 sacred sound-words combining Greek vowels and Coptic divine names. These represent the names of the 49 powers of Jeu and function as the verbal component of the seal imprinted upon the soul.' }
    ]
  },
  {
    id: 'ch33',
    nav: 'Ch. 33 \u2022 55th Treasury',
    title: 'The 55th Treasury of Light',
    ref: 'First Book of Jeu \u2022 Chapter 33 \u2022 Bruce Codex ff. 25r\u201326v',
    desc: 'The 55th Treasury is sealed with the sign of the cross-and-circle \u2014 a hieroglyph of the intersection of divine will and cosmic perfection. Six places surround the central figure, each guarded by a watcher who holds a cipher. The initiate must seal themselves with this seal while the cipher is in their hand, speaking the name of the treasury\'s guardian thrice.',
    lore: [
      { title: 'The Cross-and-Circle Seal', body: 'The cross within a circle is one of the oldest symbols in Gnostic iconography, predating Christianity by centuries. In the Book of Jeu it represents the intersection of the four directions of divine emanation with the perfection of the Pleroma. The horizontal axis signifies the extension of divine light across all creation; the vertical axis marks the path of the soul\'s ascent and descent.' },
      { title: 'The Six Watchers', body: 'Six places surround the central figure of the 55th Treasury, each occupied by a watcher. These watchers hold ciphers \u2014 coded names that must be spoken aloud in sequence. The text instructs: "Seal yourselves with this seal while the cipher is in your hand," suggesting a physical gesture accompanying the verbal formula.' },
      { title: 'The Cipher Ritual', body: 'Unlike the more elaborate baptismal rites of Book II, the cipher ritual of the 55th Treasury is brief and self-administered. The initiate traces the cross-and-circle upon their own forehead while reciting the guardian\'s name. This act of self-sealing is unique in the Book of Jeu and may represent a more democratized form of Gnostic practice.' },
      { title: 'Context in the Codex', body: 'Chapter 33 falls within the central sequence of the First Book of Jeu, where individual treasuries are described with their seals, names, and ritual instructions. The 55th Treasury is notable for its geometric simplicity \u2014 a single cross and circle \u2014 compared to the more elaborate multi-ring seals of other treasuries.' }
    ],
    hotspots: [
      { id: 'cross', label: 'The Sacred Cross', brief: 'Axis of divine will and emanation', icon: '\u2720', detail: 'The vertical stroke of the cross represents the descent of divine light from the Unknowable Father through Jeu into creation, and the ascent of the soul back toward its source. The horizontal stroke marks the extension of grace across all realms of being. Together they form the most ancient seal of the Treasury.' },
      { id: 'circle55', label: 'The Enclosing Circle', brief: 'Perfection of the Pleroma', icon: '\u25CB', detail: 'The circle represents the Pleroma in its totality \u2014 perfect, self-contained, without beginning or end. When the cross is inscribed within the circle, it signifies that divine will (the cross) operates within and never exceeds the bounds of divine perfection (the circle).' },
      { id: 'watchers55', label: 'The Six Watchers', brief: 'Guardians holding the ciphers', icon: '\u2629', detail: 'The six watchers occupy the cardinal and intercardinal positions around the central cross. Each holds a cipher \u2014 a coded name that must be decoded and spoken. The ciphers are given in a mixture of Coptic and Greek letters, and their pronunciation transforms them from inert symbols into active keys that unlock the treasury\'s gate.' },
      { id: 'cipher', label: 'The Cipher', brief: 'The coded name held in hand', icon: '\u25A3', detail: 'The cipher of the 55th Treasury is described as being "in your hand" \u2014 possibly a small inscribed tablet or parchment carried by the initiate during the ritual. The physical presence of the cipher during the act of sealing creates a connection between the material and spiritual realms.' }
    ]
  },
  {
    id: 'ch36',
    nav: 'Ch. 36 \u2022 58th Treasury',
    title: 'The 58th Treasury of Light',
    ref: 'First Book of Jeu \u2022 Chapter 36 \u2022 Bruce Codex ff. 28r\u201329v',
    desc: 'The 58th Treasury reveals the great wheel of emanation \u2014 twelve rays radiating from an inner ring, bounded by an outer circle. Six places surround it, and the initiate must invoke the name three times while tracing the wheel upon the air. This treasury governs the rotation of the aeons and the cycling of souls through purification.',
    lore: [
      { title: 'The Wheel of Emanation', body: 'The twelve-rayed wheel is a cosmological diagram showing how the divine light emanates outward from the central point through twelve channels \u2014 one for each of the aeons. The rotation of the wheel represents the eternal cycling of light outward into creation and inward back toward the Treasury.' },
      { title: 'The Twelve Rays', body: 'Each of the twelve rays corresponds to one of the aeon-rulers. The ray of each aeon is a conduit for a specific quality of divine light \u2014 grace, thought, understanding, perception, and so on.' },
      { title: 'The Triple Invocation', body: 'The instruction to "invoke the name three times" mirrors the three-fold baptismal structure. Each repetition seals a different layer of the initiate\'s luminous garment. The first invocation opens the outer gate; the second activates the inner ring; the third draws the central light outward.' },
      { title: 'Rotation of the Aeons', body: 'The 58th Treasury governs the rotation of the aeons \u2014 the cosmic cycle by which each aeon takes its turn presiding over the Pleroma. This rotation ensures that no single aeon dominates eternally, maintaining the harmony of the divine Fullness.' }
    ],
    hotspots: [
      { id: 'outer58', label: 'The Outer Circle', brief: 'Boundary of the treasury', icon: '\u25CE', detail: 'The outer circle of the 58th Treasury marks its boundary with the surrounding aeons. Unlike the 55th Treasury\'s simple circle, this outer ring is inscribed with the names of all twelve aeon-rulers, making it both a boundary and a map.' },
      { id: 'inner58', label: 'The Inner Ring', brief: 'Nexus of the twelve emanations', icon: '\u25C9', detail: 'The inner ring is where the twelve rays converge. It represents the point of origin from which all divine light radiates outward \u2014 the "navel" of the Treasury. In the ritual, the priest traces this ring upon the candidate\'s chest.' },
      { id: 'rays58', label: 'The Twelve Rays', brief: 'Channels of aeonic emanation', icon: '\u2726', detail: 'Each ray is a channel for a specific quality of divine light. The ray of Harmozel carries the light of grace; the ray of Oroiael carries the light of thought; and so forth. The initiate must ascend through the rays in the correct order, following the rotation of the wheel.' },
      { id: 'rotation', label: 'The Rotation', brief: 'Cosmic cycling of the aeons', icon: '\u27F3', detail: 'The 58th Treasury is unique in that it governs not a static structure but a dynamic process \u2014 the rotation of the aeons. Understanding this rotation allows the initiate to time their ascent for maximum alignment with the presiding aeon.' }
    ]
  }
]

/* ═══════════════════════════════════════════════════
   SVG HELPERS
   ═══════════════════════════════════════════════════ */
const INK = '#1a1208'
const INK2 = 'rgba(26,18,8,0.55)'
const INK3 = 'rgba(26,18,8,0.25)'
const INK4 = 'rgba(26,18,8,0.1)'
const GOLD = '#c8a84a'
const CINZEL = 'Cinzel,serif'

/* ═══════════════════════════════════════════════════
   SVG DIAGRAM COMPONENTS
   ═══════════════════════════════════════════════════ */

function TreasuryDiagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260, cy = 280
  const sealData = [
    { id: 'harmozel', name: 'Harmozel', angle: -90 },
    { id: 'oroiael', name: 'Oroiael', angle: -60 },
    { id: 'daveithe', name: 'Daveithe', angle: -30 },
    { id: 'eleleth', name: 'Eleleth', angle: 0 },
    { id: 'gamaliel', name: 'Gamaliel', angle: 30 },
    { id: 'gabriel', name: 'Gabriel', angle: 60 },
    { id: 'samblo', name: 'Samblo', angle: 90 },
    { id: 'abrasax', name: 'Abrasax', angle: 120 },
    { id: 'iaoth', name: 'Iaoth', angle: 150 },
    { id: 'sabaoth', name: 'Sabaoth', angle: 180 },
    { id: 'adonaios', name: 'Adonaios', angle: 210 },
    { id: 'sabaoth2', name: 'Sabaoth II', angle: 240 },
  ]

  return (
    <svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: CINZEL }}>
      {/* Decorative frame */}
      <rect x={12} y={12} width={496} height={536} fill="none" stroke={INK3} strokeWidth={0.5} rx={3} />
      <rect x={18} y={18} width={484} height={524} fill="none" stroke={INK4} strokeWidth={0.3} rx={2} />

      {/* Rotating outer glow */}
      <circle cx={cx} cy={cy} r={228} fill="none" stroke="rgba(200,168,74,0.1)" strokeWidth={0.8} className="svg-rotate" />
      <circle cx={cx} cy={cy} r={222} fill="none" stroke="rgba(200,168,74,0.06)" strokeWidth={0.4} strokeDasharray="4,6" className="svg-rotate" style={{ animationDirection: 'reverse', animationDuration: '90s' }} />

      {/* Outermost ring */}
      <circle cx={cx} cy={cy} r={210} fill="none" stroke={INK2} strokeWidth={0.6} />

      {/* 12 individual seal hotspots */}
      {sealData.map((s, i) => {
        const a = (s.angle * Math.PI) / 180
        const sx = cx + Math.cos(a) * 210
        const sy = cy + Math.sin(a) * 210
        const lx = cx + Math.cos(a) * 236
        const ly = cy + Math.sin(a) * 236
        const la = s.angle + 90

        return (
          <g key={s.id}
            className={`svg-clickable ${selected === s.id ? 'selected' : ''}`}
            onClick={() => onSelect(s.id)}
            style={{ cursor: 'pointer' }}
          >
            <line x1={cx + Math.cos(a) * 55} y1={cy + Math.sin(a) * 55} x2={cx + Math.cos(a) * 200} y2={cy + Math.sin(a) * 200} stroke={INK4} strokeWidth={0.35} />
            <circle cx={sx} cy={sy} r={14} fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={0.8} />
            <circle cx={sx} cy={sy} r={6} fill="rgba(200,168,74,0.15)" stroke={GOLD} strokeWidth={0.5} />
            <text x={sx} y={sy + 3} fontSize={7} textAnchor="middle" fill={INK} fontWeight={600} style={{ fontFamily: CINZEL }}>{i + 1}</text>
            <text x={lx} y={ly} fontSize={6.5} textAnchor="middle" dominantBaseline="central" fill={INK2} style={{ fontFamily: CINZEL, letterSpacing: '0.04em' }} transform={`rotate(${la},${lx},${ly})`}>{s.name}</text>
          </g>
        )
      })}

      <text x={cx} y={cy - 224} fontSize={6.5} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.14em' }}>TWELVE SEALS OF THE OUTER RING</text>

      {/* Second veil */}
      <g className={`svg-clickable ${selected === 'veils' ? 'selected' : ''}`} onClick={() => onSelect('veils')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={160} fill="rgba(26,18,8,0.015)" stroke={INK2} strokeWidth={0.7} />
        <text x={cx} y={cy - 164} fontSize={7} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.18em' }}>SECOND VEIL</text>
      </g>

      {/* Third veil */}
      <g className={`svg-clickable ${selected === 'veils' ? 'selected' : ''}`} onClick={() => onSelect('veils')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={108} fill="rgba(26,18,8,0.02)" stroke={INK} strokeWidth={0.8} />
        <text x={cx} y={cy - 112} fontSize={6.5} textAnchor="middle" fill={INK2} style={{ fontFamily: CINZEL, letterSpacing: '0.14em' }}>THIRD VEIL</text>
      </g>

      {/* Hexagram - clickable as spark */}
      <g className={`svg-clickable ${selected === 'spark' ? 'selected' : ''}`} onClick={() => onSelect('spark')} style={{ cursor: 'pointer' }}>
        {[0, 1].map(tri => {
          const pts = [0, 1, 2].map(i => {
            const a = i * 120 * Math.PI / 180 - Math.PI / 2 + (tri * Math.PI / 3)
            return `${cx + Math.cos(a) * 68},${cy + Math.sin(a) * 68}`
          }).join(' ')
          return <polygon key={tri} points={pts} fill="rgba(26,18,8,0.04)" stroke={INK} strokeWidth={0.5} />
        })}
      </g>

      {/* Inner sanctum - Great Invisible */}
      <g className={`svg-clickable ${selected === 'invisible' ? 'selected' : ''}`} onClick={() => onSelect('invisible')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={46} fill="rgba(26,18,8,0.07)" stroke={INK} strokeWidth={1.2} className="svg-glow" />
        <text x={cx} y={cy - 10} fontSize={8} textAnchor="middle" style={{ fontFamily: 'Cinzel Decorative,serif', fontWeight: 700, letterSpacing: '0.1em', fill: INK }}>THE GREAT</text>
        <text x={cx} y={cy + 4} fontSize={8} textAnchor="middle" style={{ fontFamily: 'Cinzel Decorative,serif', fontWeight: 700, letterSpacing: '0.1em', fill: INK }}>INVISIBLE</text>
        <text x={cx} y={cy + 19} fontSize={8} textAnchor="middle" fill={INK2} fontStyle="italic">{'\u1f08\u03cc\u03c1\u03b1\u03c4\u03bf\u03c2'}</text>
        <circle cx={cx} cy={cy - 16} r={5} fill="rgba(26,18,8,0.25)" stroke={INK} strokeWidth={0.8} className="svg-pulse" />
        <circle cx={cx} cy={cy - 16} r={2} fill={INK} />
      </g>

      {/* Divine spark label */}
      <g className={`svg-clickable ${selected === 'spark' ? 'selected' : ''}`} onClick={() => onSelect('spark')} style={{ cursor: 'pointer' }}>
        <text x={cx + 55} y={cy - 16} fontSize={7} fill={INK3} fontStyle="italic" textAnchor="start">{'Divine Spark \u203a'}</text>
        <line x1={cx + 5} y1={cy - 16} x2={cx + 52} y2={cy - 16} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,2" />
      </g>

      {/* Caption */}
      <line x1={60} y1={548} x2={460} y2={548} stroke={INK3} strokeWidth={0.5} />
      <text x={cx} y={557} fontSize={8.5} textAnchor="middle" fill={INK2} fontStyle="italic">{'\u03c4\u1f78 \u0398\u03b7\u03c3\u03b1\u03c5\u03c1\u03bf\u03c6\u03c5\u03bb\u03ac\u03ba\u03b9\u03bf\u03bd \u03c4\u03bf\u1fe6 \u03a6\u03c9\u03c4\u03cc\u03c2 \u2014 The Treasury of the Light'}</text>
    </svg>
  )
}

function JeuDiagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260, cy = 280

  return (
    <svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: CINZEL }}>
      {/* Frame */}
      <rect x={12} y={12} width={496} height={536} fill="none" stroke={INK3} strokeWidth={0.5} rx={3} />
      <rect x={18} y={18} width={484} height={524} fill="none" stroke={INK4} strokeWidth={0.3} rx={2} />

      {/* Outermost rotating ring */}
      <circle cx={cx} cy={cy} r={238} fill="none" stroke="rgba(200,168,74,0.08)" strokeWidth={0.5} className="svg-rotate" />

      {/* 49 dots around outer ring (7x7 powers) */}
      <g className={`svg-clickable ${selected === 'powers49' ? 'selected' : ''}`} onClick={() => onSelect('powers49')} style={{ cursor: 'pointer' }}>
        {Array.from({ length: 49 }, (_, i) => {
          const a = (i / 49) * Math.PI * 2 - Math.PI / 2
          const r = 218
          return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={3.5}
            fill={`rgba(26,18,8,${0.04 + (i % 7) * 0.025})`} stroke={INK} strokeWidth={0.35} />
        })}
      </g>

      {/* Seven concentric heavens */}
      <g className={`svg-clickable ${selected === 'ring7' ? 'selected' : ''}`} onClick={() => onSelect('ring7')} style={{ cursor: 'pointer' }}>
        {[190, 165, 140, 115, 90, 65, 42].map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={i % 2 === 0 ? INK2 : INK3}
            strokeWidth={i === 3 ? 0.8 : 0.5} />
        ))}
        {/* Vowel labels on rings */}
        {['I', 'E', 'O', 'Y', 'O', 'A', 'O'].map((v, i) => {
          const r = 190 - i * 25
          return <text key={i} x={cx + r - 3} y={cy + 3} fontSize={5.5} fill={INK3} style={{ fontFamily: CINZEL }}>{v}</text>
        })}
      </g>

      {/* 12 emanation rays */}
      <g className={`svg-clickable ${selected === 'halo' ? 'selected' : ''}`} onClick={() => onSelect('halo')} style={{ cursor: 'pointer' }}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2
          return <line key={i}
            x1={cx + Math.cos(a) * 42} y1={cy + Math.sin(a) * 42}
            x2={cx + Math.cos(a) * 190} y2={cy + Math.sin(a) * 190}
            stroke={GOLD} strokeWidth={0.6} strokeDasharray="2,4" />
        })}
      </g>

      {/* Inner triangle (Triple Flame) */}
      <g className={`svg-clickable ${selected === 'innertri' ? 'selected' : ''}`} onClick={() => onSelect('innertri')} style={{ cursor: 'pointer' }}>
        {[0, 1, 2].map(i => {
          const a = (i * 120 * Math.PI) / 180 - Math.PI / 2
          return <line key={i}
            x1={cx + Math.cos(a) * 30} y1={cy + Math.sin(a) * 30}
            x2={cx + Math.cos(a + 2 * Math.PI / 3) * 30} y2={cy + Math.sin(a + 2 * Math.PI / 3) * 30}
            stroke={GOLD} strokeWidth={1} />
        })}
        <circle cx={cx} cy={cy} r={30} fill="rgba(200,168,74,0.06)" stroke={GOLD} strokeWidth={0.6} className="svg-glow" />
      </g>

      {/* Central name of Jeu */}
      <g className={`svg-clickable ${selected === 'central' ? 'selected' : ''}`} onClick={() => onSelect('central')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={22} fill="rgba(26,18,8,0.08)" stroke={INK} strokeWidth={1.2} className="svg-glow" />
        <text x={cx} y={cy + 6} fontSize={16} textAnchor="middle" style={{ fontFamily: CINZEL, fontWeight: 700, letterSpacing: '0.08em', fill: INK }}>{'\u0399\u0395\u03a5'}</text>
      </g>

      {/* Title */}
      <text x={cx} y={30} fontSize={7} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.15em' }}>{'\u2726 SEAL OF JEU, THE TRUE GOD \u2726'}</text>
      <text x={cx} y={540} fontSize={8.5} textAnchor="middle" fill={INK2} fontStyle="italic">{'\u1f38\u03b5\u03cd \u1f41 \u1f08\u03bb\u03b7\u03b8\u03b9\u03bd\u1f78\u03c2 \u0398\u03b5\u03cc\u03c2 \u2014 Jeu, the True God'}</text>
    </svg>
  )
}

function ArchonsDiagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260

  const gates = [
    {
      y: 460, id: 'gate1', label: 'FIRST GATE', sub: 'Crocodile-headed',
      shape: 'simple', password: 'Withdraw, judge of falsehood',
      sealSymbol: '\u2625', sealDesc: 'Cross-in-Circle'
    },
    {
      y: 340, id: 'gate2', label: 'SECOND GATE', sub: 'Ram-headed',
      shape: 'medium', password: 'I shed my aetheric body',
      sealSymbol: '\u2648', sealDesc: 'Pentagram-in-Circles'
    },
    {
      y: 220, id: 'gate3', label: 'THIRD GATE', sub: 'Eagle-headed',
      shape: 'complex', password: 'I ascend beyond the seven stars',
      sealSymbol: '\u2660', sealDesc: 'Star-in-Hexagon'
    },
    {
      y: 100, id: 'ialdabaoth', label: 'IALDABAOTH', sub: 'Lion-faced Demiurge',
      shape: 'supreme', password: 'I am from before the beginning',
      sealSymbol: '\u264C', sealDesc: 'Ouroboros-in-Diamond'
    },
  ]

  return (
    <svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: CINZEL }}>
      {/* Frame */}
      <rect x={12} y={12} width={496} height={536} fill="none" stroke={INK3} strokeWidth={0.5} rx={3} />

      {/* Treasury at top */}
      <g className={`svg-clickable ${selected === 'treasury_top' ? 'selected' : ''}`} onClick={() => onSelect('treasury_top')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={38} r={24} fill="rgba(26,18,8,0.07)" stroke={INK} strokeWidth={0.9} className="svg-glow" />
        <circle cx={cx} cy={38} r={14} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} />
        <text x={cx} y={42} fontSize={8} textAnchor="middle" style={{ fontFamily: CINZEL, fontWeight: 700 }}>{'JEU'}</text>
        <text x={cx} y={22} fontSize={6} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.1em' }}>TREASURY OF LIGHT</text>
      </g>

      {/* Ascent axis */}
      <line x1={cx} y1={64} x2={cx} y2={510} stroke={INK3} strokeWidth={0.5} strokeDasharray="5,4" />

      {/* Ascent arrows */}
      {[140, 220, 300, 380, 460].map(y => (
        <text key={y} x={cx + 16} y={y} fontSize={14} fill={INK3} textAnchor="start">{'\u2191'}</text>
      ))}

      {/* Gates with increasing complexity */}
      {gates.map(g => {
        const hw = g.shape === 'simple' ? 50 : g.shape === 'medium' ? 55 : g.shape === 'complex' ? 60 : 65
        const hh = g.shape === 'simple' ? 30 : g.shape === 'medium' ? 36 : g.shape === 'complex' ? 42 : 50

        return (
          <g key={g.id} className={`svg-clickable ${selected === g.id ? 'selected' : ''}`} onClick={() => onSelect(g.id)} style={{ cursor: 'pointer' }}>
            {/* Gate shape - increasingly complex */}
            {g.shape === 'simple' && (
              <>
                <circle cx={cx} cy={g.y} r={38} fill="rgba(26,18,8,0.05)" stroke={INK} strokeWidth={0.8} />
                <line x1={cx - 25} y1={g.y} x2={cx + 25} y2={g.y} stroke={INK2} strokeWidth={0.6} />
                <line x1={cx} y1={g.y - 25} x2={cx} y2={g.y + 25} stroke={INK2} strokeWidth={0.6} />
              </>
            )}
            {g.shape === 'medium' && (
              <>
                <circle cx={cx} cy={g.y} r={46} fill="rgba(26,18,8,0.04)" stroke={INK} strokeWidth={0.8} />
                <circle cx={cx} cy={g.y} r={38} fill="none" stroke={INK2} strokeWidth={0.5} />
                {/* Pentagram */}
                {[0, 1, 2, 3, 4].map(i => {
                  const a1 = (i * 144 * Math.PI) / 180 - Math.PI / 2
                  const a2 = ((i + 2) * 144 * Math.PI) / 180 - Math.PI / 2
                  return <line key={i} x1={cx + Math.cos(a1) * 30} y1={g.y + Math.sin(a1) * 30} x2={cx + Math.cos(a2) * 30} y2={g.y + Math.sin(a2) * 30} stroke={INK} strokeWidth={0.7} />
                })}
              </>
            )}
            {g.shape === 'complex' && (
              <>
                <polygon
                  points={[0, 1, 2, 3, 4, 5].map(i => {
                    const a = (i * 60 * Math.PI) / 180 - Math.PI / 2
                    return `${cx + Math.cos(a) * 48},${g.y + Math.sin(a) * 42}`
                  }).join(' ')}
                  fill="rgba(26,18,8,0.05)" stroke={INK} strokeWidth={0.9} />
                {/* 7-pointed star inside */}
                {[0, 1, 2, 3, 4, 5, 6].map(i => {
                  const a1 = (i * (360 / 7) * Math.PI) / 180 - Math.PI / 2
                  const a2 = ((i + 3) * (360 / 7) * Math.PI) / 180 - Math.PI / 2
                  return <line key={i} x1={cx + Math.cos(a1) * 32} y1={g.y + Math.sin(a1) * 32} x2={cx + Math.cos(a2) * 32} y2={g.y + Math.sin(a2) * 32} stroke={INK} strokeWidth={0.6} />
                })}
                <circle cx={cx} cy={g.y} r={20} fill="none" stroke={INK2} strokeWidth={0.4} />
              </>
            )}
            {g.shape === 'supreme' && (
              <>
                {/* Diamond (outermost) */}
                <polygon points={`${cx},${g.y - 54} ${cx + 62},${g.y} ${cx},${g.y + 54} ${cx - 62},${g.y}`} fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={1} />
                <polygon points={`${cx},${g.y - 44} ${cx + 52},${g.y} ${cx},${g.y + 44} ${cx - 52},${g.y}`} fill="rgba(26,18,8,0.03)" stroke={INK2} strokeWidth={0.5} />
                {/* Ouroboros circle inside */}
                <circle cx={cx} cy={g.y} r={28} fill="rgba(200,168,74,0.06)" stroke={GOLD} strokeWidth={0.9} className="svg-glow" />
                {/* Serpent biting tail - simplified as arc */}
                <path d={`M ${cx + 18} ${g.y - 18} A 20 20 0 1 0 ${cx + 18} ${g.y + 18}`} fill="none" stroke={INK} strokeWidth={0.8} />
                <circle cx={cx + 18} cy={g.y - 18} r={3} fill={INK} />
              </>
            )}

            {/* Gate label */}
            <text x={cx} y={g.y - 4} fontSize={9} textAnchor="middle" style={{ fontFamily: CINZEL, fontWeight: 600, letterSpacing: '0.08em', fill: INK }}>{g.label}</text>
            <text x={cx} y={g.y + 10} fontSize={6.5} textAnchor="middle" fontStyle="italic" fill={INK2}>{g.sub}</text>

            {/* Seal on left */}
            <g>
              <circle cx={68} cy={g.y} r={24} fill="rgba(26,18,8,0.04)" stroke={INK} strokeWidth={0.6} />
              <circle cx={68} cy={g.y} r={14} fill="none" stroke={INK2} strokeWidth={0.4} />
              <text x={68} y={g.y + 5} fontSize={13} textAnchor="middle" fill={INK2}>{g.sealSymbol}</text>
              <text x={68} y={g.y + 34} fontSize={5.5} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.08em' }}>SEAL</text>
              <text x={68} y={g.y + 42} fontSize={5} textAnchor="middle" fill={INK3} fontStyle="italic">{g.sealDesc}</text>
              <line x1={92} y1={g.y} x2={cx - hw} y2={g.y} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,2" />
            </g>

            {/* Password on right */}
            <g>
              <rect x={362} y={g.y - 22} width={120} height={44} fill="rgba(26,18,8,0.03)" stroke={INK3} strokeWidth={0.4} rx={2} />
              <text x={422} y={g.y - 8} fontSize={5.5} textAnchor="middle" style={{ fontFamily: CINZEL, fill: INK3, letterSpacing: '0.06em' }}>PASSWORD</text>
              <line x1={374} y1={g.y - 2} x2={470} y2={g.y - 2} stroke={INK4} strokeWidth={0.3} />
              <text x={422} y={g.y + 10} fontSize={5.5} textAnchor="middle" fontStyle="italic" fill={INK2}>{g.password}</text>
              <line x1={cx + hw} y1={g.y} x2={362} y2={g.y} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,2" />
            </g>
          </g>
        )
      })}

      {/* Counter-seal at bottom */}
      <g className={`svg-clickable ${selected === 'counter' ? 'selected' : ''}`} onClick={() => onSelect('counter')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={520} r={22} fill="rgba(26,18,8,0.08)" stroke={INK} strokeWidth={0.9} className="svg-glow" />
        <circle cx={cx} cy={520} r={12} fill="rgba(200,168,74,0.1)" stroke={GOLD} strokeWidth={0.5} />
        <text x={cx} y={524} fontSize={12} textAnchor="middle" fill={INK}>{'\u2726'}</text>
        <text x={cx} y={500} fontSize={6.5} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.08em' }}>COUNTER-SEAL</text>
      </g>

      <text x={cx} y={550} fontSize={8.5} textAnchor="middle" fill={INK2} fontStyle="italic">{'\u1f21 \u1f08\u03bd\u03bf\u03b4\u03bf\u03c2 \u03c4\u1fc6\u03c2 \u03a8\u03c5\u03c7\u1fc6\u03c2 \u2014 The Ascent of the Soul'}</text>
    </svg>
  )
}

function BaptismDiagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260, cy = 240

  return (
    <svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: CINZEL }}>
      {/* Frame */}
      <rect x={12} y={12} width={496} height={536} fill="none" stroke={INK3} strokeWidth={0.5} rx={3} />

      {/* Title */}
      <text x={cx} y={38} fontSize={8} textAnchor="middle" fill={INK2} style={{ fontFamily: CINZEL, letterSpacing: '0.15em' }}>{'\u2726 \u03a4\u0395\u039b\u0395\u03a4\u0397 \u0392\u0391\u03a0\u03a4\u0399\u03a3\u039c\u0391\u03a4\u039f\u03a3 \u2726'}</text>
      <text x={cx} y={54} fontSize={7.5} textAnchor="middle" fontStyle="italic" fill={INK3}>The Rite of Holy Baptism {'\u2014'} Three-fold Sealing</text>
      <line x1={60} y1={62} x2={460} y2={62} stroke={INK3} strokeWidth={0.5} />

      {/* Three concentric ritual circles */}
      <circle cx={cx} cy={cy} r={155} fill="none" stroke={INK3} strokeWidth={0.4} className="svg-pulse" />
      <circle cx={cx} cy={cy} r={115} fill="none" stroke={INK2} strokeWidth={0.5} />
      <circle cx={cx} cy={cy} r={75} fill="none" stroke={INK2} strokeWidth={0.7} className="svg-glow" />

      {/* Three baptism stations around the circle */}
      {[
        { a: -Math.PI / 2, label: 'WATER', sub: 'Purification', id: 'water', sym: '\u224b' },
        { a: Math.PI / 6, label: 'FIRE', sub: 'Sealing', id: 'fire', sym: '\u2736' },
        { a: Math.PI - Math.PI / 6, label: 'SPIRIT', sub: 'Divine Name', id: 'spirit', sym: '\u2726' },
      ].map(s => {
        const x = cx + Math.cos(s.a) * 115
        const y = cy + Math.sin(s.a) * 115
        return (
          <g key={s.id} className={`svg-clickable ${selected === s.id ? 'selected' : ''}`} onClick={() => onSelect(s.id)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={32} fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={0.9} />
            <circle cx={x} cy={y} r={20} fill="rgba(26,18,8,0.03)" stroke={INK2} strokeWidth={0.4} />
            <text x={x} y={y + 5} fontSize={16} textAnchor="middle" fill={INK2}>{s.sym}</text>
            <text x={x} y={y + 42} fontSize={8} textAnchor="middle" style={{ fontFamily: CINZEL, fontWeight: 600, letterSpacing: '0.1em', fill: INK }}>{s.label}</text>
            <text x={x} y={y + 53} fontSize={6.5} textAnchor="middle" fontStyle="italic" fill={INK3}>{s.sub}</text>
            <line x1={cx + Math.cos(s.a) * 32} y1={cy + Math.sin(s.a) * 32} x2={x - Math.cos(s.a) * 32} y2={y - Math.sin(s.a) * 32} stroke={INK4} strokeWidth={0.5} strokeDasharray="4,3" />
          </g>
        )
      })}

      {/* Central candidate with sealing points */}
      <ellipse cx={cx} cy={cy} rx={28} ry={36} fill="rgba(26,18,8,0.05)" stroke={INK} strokeWidth={0.8} />
      {/* Sealing points on brow, lips, heart */}
      {[
        { dy: -16, label: 'Brow' },
        { dy: 2, label: 'Lips' },
        { dy: 18, label: 'Heart' },
      ].map((s, i) => (
        <g key={i}>
          <circle cx={cx} cy={cy + s.dy} r={4} fill="rgba(200,168,74,0.2)" stroke={GOLD} strokeWidth={0.6} className="svg-pulse" />
          <text x={cx + 10} y={cy + s.dy + 3} fontSize={6} fill={INK3} fontStyle="italic" textAnchor="start">{s.label}</text>
        </g>
      ))}

      {/* Vine branches */}
      <g className={`svg-clickable ${selected === 'vine' ? 'selected' : ''}`} onClick={() => onSelect('vine')} style={{ cursor: 'pointer' }}>
        <rect x={60} y={400} width={400} height={36} fill="rgba(26,18,8,0.03)" stroke={INK2} strokeWidth={0.4} rx={2} />
        {/* Vine leaves */}
        {Array.from({ length: 11 }, (_, i) => {
          const x = 80 + i * 38
          return (
            <g key={i}>
              <ellipse cx={x} cy={392} rx={7} ry={12} fill="rgba(26,18,8,0.06)" stroke={INK2} strokeWidth={0.4} transform={`rotate(-30,${x},392)`} />
              <line x1={x} y1={398} x2={x} y2={405} stroke={INK3} strokeWidth={0.3} />
            </g>
          )
        })}
        <text x={cx} y={424} fontSize={7} textAnchor="middle" style={{ fontFamily: CINZEL, fill: INK2, letterSpacing: '0.06em' }}>{'VINE BRANCHES \u2014 bound upon the hands of the candidate'}</text>
      </g>

      {/* Voces magicae */}
      <g className={`svg-clickable ${selected === 'names' ? 'selected' : ''}`} onClick={() => onSelect('names')} style={{ cursor: 'pointer' }}>
        <rect x={60} y={440} width={400} height={80} fill="rgba(26,18,8,0.03)" stroke={INK2} strokeWidth={0.4} rx={2} />
        <text x={cx} y={460} fontSize={7} textAnchor="middle" style={{ fontFamily: CINZEL, fill: INK2, letterSpacing: '0.08em' }}>Sacred Invocation {'\u2014'} Voces Magicae</text>
        <line x1={80} y1={466} x2={440} y2={466} stroke={INK4} strokeWidth={0.3} />
        <text x={cx} y={484} fontSize={10} textAnchor="middle" fill={INK} fontWeight={700}>{'\u03c8\u03b5 \u03b1\u03b9\u03a9 \u03b1\u03b9\u03a9 \u03b1\u03a9 \u03c8\u03b5 \u03b1\u03c1\u03a9 \u03b1\u03c1\u03a9 \u03a9 \u03c8\u03b5 \u03a9\u03a9\u03a9'}</text>
        <text x={cx} y={500} fontSize={7} textAnchor="middle" fontStyle="italic" fill={INK2}>{'"Hear me, Father of all fatherhood, boundless Light:'}</text>
        <text x={cx} y={512} fontSize={7} textAnchor="middle" fontStyle="italic" fill={INK2}>{'let the light-seal descend upon thy servant."'}</text>
      </g>

      <text x={cx} y={545} fontSize={8.5} textAnchor="middle" fill={INK2} fontStyle="italic">{'\u0392\u03ac\u03c0\u03c4\u03b9\u03c3\u03bc\u03b1 \u1f55\u03b4\u03b1\u03c4\u03bf\u03c2 \u03ba\u03b1\u1f76 \u03c0\u03c5\u03c1\u03cc\u03c2 \u2014 Baptism of Water and Fire'}</text>
    </svg>
  )
}

function Treasury55Diagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260, cy = 270

  return (
    <svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: CINZEL }}>
      {/* Frame */}
      <rect x={12} y={12} width={496} height={536} fill="none" stroke={INK3} strokeWidth={0.5} rx={3} />

      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={200} fill="none" stroke="rgba(200,168,74,0.1)" strokeWidth={0.6} className="svg-pulse" />

      {/* Cross - thick ornate strokes */}
      <g className={`svg-clickable ${selected === 'cross' ? 'selected' : ''}`} onClick={() => onSelect('cross')} style={{ cursor: 'pointer' }}>
        {/* Vertical bar */}
        <rect x={cx - 12} y={cy - 145} width={24} height={290} fill="rgba(26,18,8,0.07)" stroke={INK} strokeWidth={0.8} rx={2} />
        {/* Horizontal bar */}
        <rect x={cx - 145} y={cy - 12} width={290} height={24} fill="rgba(26,18,8,0.07)" stroke={INK} strokeWidth={0.8} rx={2} />
        {/* Decorative serifs */}
        <rect x={cx - 16} y={cy - 149} width={32} height={8} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} rx={1} />
        <rect x={cx - 16} y={cy + 141} width={32} height={8} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} rx={1} />
        <rect x={cx - 149} y={cy - 16} width={8} height={32} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} rx={1} />
        <rect x={cx + 141} y={cy - 16} width={8} height={32} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} rx={1} />
      </g>

      {/* Enclosing circle */}
      <g className={`svg-clickable ${selected === 'circle55' ? 'selected' : ''}`} onClick={() => onSelect('circle55')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={95} fill="none" stroke={GOLD} strokeWidth={12} className="svg-glow" />
        <circle cx={cx} cy={cy} r={100} fill="none" stroke="rgba(200,168,74,0.2)" strokeWidth={0.6} />
        <circle cx={cx} cy={cy} r={88} fill="none" stroke="rgba(200,168,74,0.15)" strokeWidth={0.4} />
      </g>

      {/* Six watchers around the cross */}
      <g className={`svg-clickable ${selected === 'watchers55' ? 'selected' : ''}`} onClick={() => onSelect('watchers55')} style={{ cursor: 'pointer' }}>
        {[0, 1, 2, 3, 4, 5].map(i => {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2
          const wx = cx + Math.cos(a) * 185
          const wy = cy + Math.sin(a) * 185
          const watcherNames = ['PHARMAKON', 'PARAKLETOS', 'PHOSTER', 'SOTER', 'HIEREUS', 'PROPHETES']
          return (
            <g key={i}>
              <circle cx={wx} cy={wy} r={20} fill="rgba(26,18,8,0.05)" stroke={INK} strokeWidth={0.7} />
              <circle cx={wx} cy={wy} r={10} fill="rgba(200,168,74,0.1)" stroke={GOLD} strokeWidth={0.5} />
              <text x={wx} y={wy + 3.5} fontSize={8} textAnchor="middle" fill={INK2}>{'\u2629'}</text>
              <text x={wx} y={wy + 28} fontSize={5} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.04em' }}>{watcherNames[i]}</text>
              <line x1={wx - Math.cos(a) * 20} y1={wy - Math.sin(a) * 20} x2={cx + Math.cos(a) * 100} y2={cy + Math.sin(a) * 100} stroke={INK4} strokeWidth={0.3} strokeDasharray="3,2" />
            </g>
          )
        })}
      </g>

      {/* Cipher at center */}
      <g className={`svg-clickable ${selected === 'cipher' ? 'selected' : ''}`} onClick={() => onSelect('cipher')} style={{ cursor: 'pointer' }}>
        <rect x={cx - 38} y={cy - 14} width={76} height={28} fill="rgba(26,18,8,0.08)" stroke={GOLD} strokeWidth={0.9} rx={2} className="svg-glow" />
        <text x={cx} y={cy + 4} fontSize={9} textAnchor="middle" style={{ fontFamily: CINZEL, fontWeight: 700, fill: GOLD, letterSpacing: '0.12em' }}>CIPHER</text>
      </g>

      {/* Labels */}
      <text x={cx} y={30} fontSize={7} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.14em' }}>THE 55TH TREASURY {'\u2014'} CROSS-AND-CIRCLE SEAL</text>
      <text x={cx} y={540} fontSize={8} textAnchor="middle" fontStyle="italic" fill={INK2}>{'Seal yourselves with this seal while the cipher is in your hand'}</text>
    </svg>
  )
}

function Treasury58Diagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260, cy = 270
  const aeonNames = ['Harmozel', 'Oroiael', 'Daveithe', 'Eleleth', 'Gamaliel', 'Gabriel', 'Samblo', 'Abrasax', 'Iaoth', 'Sabaoth', 'Adonaios', 'Sabaoth II']

  return (
    <svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: CINZEL }}>
      {/* Frame */}
      <rect x={12} y={12} width={496} height={536} fill="none" stroke={INK3} strokeWidth={0.5} rx={3} />

      {/* Outer rotating glow */}
      <circle cx={cx} cy={cy} r={215} fill="none" stroke="rgba(200,168,74,0.08)" strokeWidth={0.5} className="svg-rotate" />

      {/* Outer circle */}
      <g className={`svg-clickable ${selected === 'outer58' ? 'selected' : ''}`} onClick={() => onSelect('outer58')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={160} fill="none" stroke="#5c3f20" strokeWidth={16} className="svg-glow" />
        <circle cx={cx} cy={cy} r={168} fill="none" stroke="rgba(200,168,74,0.15)" strokeWidth={0.5} />
        {/* Aeon names around outer ring */}
        {aeonNames.map((name, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2
          const lx = cx + Math.cos(a) * 160, ly = cy + Math.sin(a) * 160
          const la = a * (180 / Math.PI) + 90
          return <text key={i} x={lx} y={ly} fontSize={5.5} textAnchor="middle" dominantBaseline="central" fill={INK2} style={{ fontFamily: CINZEL, letterSpacing: '0.03em' }} transform={`rotate(${la},${lx},${ly})`}>{name}</text>
        })}
      </g>

      {/* Inner ring */}
      <g className={`svg-clickable ${selected === 'inner58' ? 'selected' : ''}`} onClick={() => onSelect('inner58')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={105} fill="none" stroke={GOLD} strokeWidth={12} />
        <circle cx={cx} cy={cy} r={111} fill="none" stroke="rgba(200,168,74,0.15)" strokeWidth={0.4} />
        <circle cx={cx} cy={cy} r={96} fill="rgba(26,18,8,0.02)" stroke={INK2} strokeWidth={0.3} />
      </g>

      {/* Twelve rays */}
      <g className={`svg-clickable ${selected === 'rays58' ? 'selected' : ''}`} onClick={() => onSelect('rays58')} style={{ cursor: 'pointer' }}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180
          const x1 = cx + Math.cos(a) * 105, y1 = cy + Math.sin(a) * 105
          const x2 = cx + Math.cos(a) * 150, y2 = cy + Math.sin(a) * 150
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
        })}
      </g>

      {/* Center wheel symbol */}
      <g className={`svg-clickable ${selected === 'rotation' ? 'selected' : ''}`} onClick={() => onSelect('rotation')} style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={50} fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={0.9} className="svg-glow" />
        <circle cx={cx} cy={cy} r={38} fill="none" stroke={INK2} strokeWidth={0.5} />
        <text x={cx} y={cy - 6} fontSize={8} textAnchor="middle" style={{ fontFamily: CINZEL, fontWeight: 700, letterSpacing: '0.1em', fill: INK }}>THE</text>
        <text x={cx} y={cy + 7} fontSize={8} textAnchor="middle" style={{ fontFamily: CINZEL, fontWeight: 700, letterSpacing: '0.1em', fill: INK }}>WHEEL</text>
        <text x={cx} y={cy + 22} fontSize={7} textAnchor="middle" fontStyle="italic" fill={INK2}>{'\u03a0\u03b5\u03c1\u03b9\u03c3\u03c4\u03c1\u03bf\u03c6\u03ae'}</text>
      </g>

      {/* Labels */}
      <text x={cx} y={30} fontSize={7} textAnchor="middle" fill={INK3} style={{ fontFamily: CINZEL, letterSpacing: '0.14em' }}>THE 58TH TREASURY {'\u2014'} WHEEL OF EMANATION</text>
      <text x={cx} y={540} fontSize={8} textAnchor="middle" fontStyle="italic" fill={INK2}>{'Invoke the name three times while tracing the wheel upon the air'}</text>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════
   DIAGRAM ROUTER
   ═══════════════════════════════════════════════════ */
function TreasuryDiagramRenderer({ pageId, selected, onSelect }: { pageId: string, selected: string | null, onSelect: (id: string) => void }) {
  switch (pageId) {
    case 'treasury': return <TreasuryDiagram selected={selected} onSelect={onSelect} />
    case 'jeu': return <JeuDiagram selected={selected} onSelect={onSelect} />
    case 'archons': return <ArchonsDiagram selected={selected} onSelect={onSelect} />
    case 'baptism': return <BaptismDiagram selected={selected} onSelect={onSelect} />
    case 'ch33': return <Treasury55Diagram selected={selected} onSelect={onSelect} />
    case 'ch36': return <Treasury58Diagram selected={selected} onSelect={onSelect} />
    default: return null
  }
}

/* ═══════════════════════════════════════════════════
   FLOATING PARTICLES
   ═══════════════════════════════════════════════════ */
function Particles() {
  const [mounted, setMounted] = useState(false)
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 14 + Math.random() * 16,
    size: 1 + Math.random() * 2.5,
  })), [])

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div className="particle-field">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`,
          animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
        }} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════ */
export default function Home() {
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedHs, setSelectedHs] = useState<string | null>(null)
  const [isChanting, setIsChanting] = useState(false)
  const [chantText, setChantText] = useState('')
  const revRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const page = PAGES[currentPage]

  const handlePageChange = useCallback((idx: number) => {
    setCurrentPage(idx)
    setSelectedHs(null)
    setChantText('')
    if (mainRef.current) {
      mainRef.current.classList.remove('page-enter')
      void mainRef.current.offsetWidth
      mainRef.current.classList.add('page-enter')
    }
  }, [])

  const handleSelectHs = useCallback((id: string) => {
    setSelectedHs(id)
    if (revRef.current) {
      revRef.current.classList.remove('revealed')
      void revRef.current.offsetWidth
      revRef.current.classList.add('revealed')
    }
  }, [])

  const chantSacredNames = useCallback(() => {
    if (isChanting) return
    setIsChanting(true)
    const names = [
      'Ieou \u00b7 the True God',
      'Harmozel \u00b7 Light of Grace',
      'Oroiael \u00b7 Light of Thought',
      'Daveithe \u00b7 Light of Understanding',
      'Eleleth \u00b7 Light of Perception',
      'Gamaliel \u00b7 Light of Revealment',
      'Gabriel \u00b7 Light of Strength',
      'Samblo \u00b7 Light of Peace',
      'Abrasax \u00b7 Light of the Year',
      'Iaoth \u00b7 Light of the Name',
    ]
    let i = 0
    const interval = setInterval(() => {
      setChantText(names[i])
      i++
      if (i >= names.length) {
        clearInterval(interval)
        setTimeout(() => { setIsChanting(false); setChantText('') }, 1200)
      }
    }, 800)
  }, [isChanting])

  const selectedHotspot = page.hotspots.find(h => h.id === selectedHs)

  return (
    <div className="treasury-app">
      <Particles />

      {/* Top Roller */}
      <div className="roller">
        <span className="roller-text">{'CODEX BRUCIANUS \u00b7 BODLEIAN LIBRARY OXFORD \u00b7 MS BRUCE 96'}</span>
      </div>

      {/* Header */}
      <header className="treasury-header">
        <div className="greek-subtitle">{'\u0392\u03af\u03b2\u03bb\u03bf\u03c2 \u03c4\u03bf\u1fe6 \u1f38\u03b5\u03cd \u2014 Sacred Diagrams of the Pleroma'}</div>
        <h1>The Book of Jeu</h1>
      </header>

      {/* Navigation */}
      <nav className="treasury-nav">
        {PAGES.map((p, i) => (
          <button key={p.id} className={`nav-btn ${i === currentPage ? 'active' : ''}`} onClick={() => handlePageChange(i)}>
            {p.nav}
          </button>
        ))}
      </nav>

      {/* Main Layout */}
      <div className="treasury-layout">
        <div className="main-col" ref={mainRef}>
          <div className="page-header">
            <div className="divider-line"><span>{'\u2726'}</span></div>
            <h2>{page.title}</h2>
            <div className="page-ref">{page.ref}</div>
            <div className="divider-line"><span>{'\u2726'}</span></div>
          </div>

          <div className="diagram-wrap">
            <TreasuryDiagramRenderer pageId={page.id} selected={selectedHs} onSelect={handleSelectHs} />
          </div>

          <button className={`chant-btn ${isChanting ? 'chanting' : ''}`} onClick={chantSacredNames} disabled={isChanting}>
            {isChanting ? <>{'\u2726'} {chantText || 'CHANTING...'} {'\u2726'}</> : <>{'\u2726 CHANT THE SACRED NAMES \u2726'}</>}
          </button>

          <div className="lore-section">
            <h3>Scholarly Commentary</h3>
            <div className="lore-grid">
              {page.lore.map((l, i) => (
                <div key={i} className="lore-card">
                  <strong>{l.title}</strong>
                  <p>{l.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="side-col">
          <div className="side-section">
            <h3>Context</h3>
            <p>{page.desc}</p>
          </div>

          <div className="side-section">
            <h3>Sacred Elements</h3>
            <div className="hs-list">
              {page.hotspots.map(hs => (
                <div key={hs.id} className={`hs-item ${selectedHs === hs.id ? 'selected' : ''}`} onClick={() => handleSelectHs(hs.id)}>
                  <span className="hs-icon">{hs.icon}</span>
                  <span className="hs-name">{hs.label}</span>
                  <span className="hs-brief">{hs.brief}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="side-section">
            <h3>Revelation</h3>
            <div ref={revRef} className={`revelation ${selectedHs ? 'revealed' : ''}`}>
              {selectedHotspot ? (
                <>
                  <span className="rev-label">{'\u2014 Hidden Teaching \u2014'}</span>
                  <span className="rev-title">{selectedHotspot.icon} {selectedHotspot.label}</span>
                  <span className="rev-detail">{selectedHotspot.detail}</span>
                </>
              ) : (
                <>
                  <span className="rev-label">{'\u2014'}</span>
                  Click upon any element within the diagram to receive its hidden teaching.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="roller">
        <span className="roller-text">{'\u0392\u03af\u03b2\u03bb\u03bf\u03c2 \u03c4\u03bf\u1fe6 \u1f38\u03b5\u03cd \u00b7 THE TWO BOOKS OF JEU'}</span>
      </div>
    </div>
  )
}
