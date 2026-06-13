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
      { title: 'The Three Curtains', body: 'Three veils (\u03ba\u03b1\u03c4\u03b1\u03c0\u03b5\u03c4\u03ac\u03c3\u03bc\u03b1\u03c4\u03b1) separate the inner sanctum from the Pleroma. The outer veil is penetrable by higher archons; the middle by perfect souls of the elect; the innermost veil can only be crossed by those who have received all five seals of the baptismal rite.' }
    ],
    hotspots: [
      { id: 'aeons', label: 'The Twelve Seals', brief: 'Outer ring of aeon-rulers', detail: 'Twelve seals encircle the Treasury, each governed by an aeon-ruler who acts as guardian of that domain. The ascending soul must know the name of each ruler and present the corresponding counter-seal. The names \u2014 Harmozel, Oroiael, Daveithe, Eleleth, and their companions \u2014 are not mere labels but living words of power, each a key to a specific gate of light.' },
      { id: 'veils', label: 'The Three Veils', brief: 'Curtains separating the inner sanctum', detail: 'The three veils are boundaries of increasing sanctity. The outermost veil filters the light of the Pleroma so that the lower aeons are not consumed. The middle veil admits only those who have received the baptism of fire. The innermost veil opens solely for the soul bearing all five seals \u2014 water, fire, spirit, chrism, and the seal of the name of Jeu himself.' },
      { id: 'spark', label: 'The Divine Spark', brief: 'Seed of light within the soul', detail: 'At the heart of every human soul lies a fragment of divine light \u2014 a spark that fell from the Pleroma when Sophia erred. This spark is the reason the Archons cannot fully possess the soul, and it is the beacon by which the Treasury draws the ascending spirit back toward its source. The baptismal rite awakens and fans this spark into a flame.' },
      { id: 'invisible', label: 'The Great Invisible', brief: 'The unknowable source of all', detail: 'At the innermost point of the Treasury dwells the Great Invisible (\u1f08\u03cc\u03c1\u03b1\u03c4\u03bf\u03c2) \u2014 the Unknowable Father, beyond all names, beyond all aeons, beyond even the Pleroma itself. No mind can comprehend it; no tongue can name it. It is the silence from which all sound emanates, the darkness from which all light shines forth.' }
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
      { title: 'The Manuscript Diagrams', body: 'The Bruce Codex actually contains circular seal diagrams at this point in the text, with radial divisions, names in Coptic and Greek, and concentric rings \u2014 making the Book of Jeu one of the very few Gnostic texts to survive with its original ritual diagrams intact. Schmidt and MacDermot edited the critical edition in 1978.' }
    ],
    hotspots: [
      { id: 'throne', label: 'The Throne of Jeu', brief: 'Seat of divine authority', detail: 'Jeu sits upon a throne at the apex of the aeonic hierarchy. The throne is not merely a seat but a nexus of power \u2014 the point at which the will of the Unknowable Father is translated into the administration of the Treasury. From this throne Jeu dispatches the 49 powers, receives the ascending souls, and inscribes the seals upon the luminous garments of the redeemed.' },
      { id: 'head', label: 'The Head of Jeu', brief: 'The first manifestation of divine light', detail: 'The head of Jeu radiates twelve rays, one for each of the aeons. In the center of his brow is inscribed the tetragrammaton of his name \u2014 \u0399\u0395\u03a5 \u2014 a name so sacred it may only be spoken during the baptismal rite and never in the hearing of the Archons, who would use it to bar the soul\'s ascent rather than facilitate it.' },
      { id: 'staff', label: 'The Staff of Fire', brief: 'Instrument of divine will', detail: 'Jeu holds a staff of fire tipped with a triple flame \u2014 the three fires of purification, sealing, and illumination. With this staff he inscribes his name upon the living water, opens the gates of the Treasury, and brands the counter-seal upon the souls of the baptized. The staff is the instrument by which will becomes action in the realm of light.' },
      { id: 'powers7', label: 'The 49 Powers (Right)', brief: 'Seven-by-seven matrix of emanations', detail: 'The 49 powers on the right hand of Jeu represent the emanations of grace and blessing. Each of the seven rows corresponds to one of the seven vowels of the sacred name (I E O Y O A O), and each column to one of the seven heavens. Together they form a complete map of the divine administration through which souls are guided back to the Treasury.' }
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
      { id: 'ialdabaoth', label: 'Ialdabaoth', brief: 'The lion-faced Demiurge', detail: 'Ialdabaoth stands at the outermost gate of the material world. His seal is a lion-faced serpent biting its own tail \u2014 an image that appears in a number of Gnostic gems from the 2nd\u20134th centuries (the so-called Abraxas gems). The ascending soul must know his true name (Saklas), his counter-name (Samael), and the password: "I am from before the beginning; thy realm has no power over me."' },
      { id: 'gate1', label: 'First Gate \u00b7 Outermost Sphere', brief: 'Boundary of the material world', detail: 'The first gate marks the boundary between the sublunary material world and the aetheric realm. Its Archon bears the form of a crocodile (a common image of Egyptian origin absorbed into Gnostic iconography). The initiate must present the counter-seal of the first baptism and recite: "Withdraw, judge of falsehood, I am clothed in the garment of the light of my father, the Treasury of Light."' },
      { id: 'gate2', label: 'Second Gate \u00b7 Aetheric Boundary', brief: 'Entry into the realm of the aethers', detail: 'The second gate separates the material aether from the celestial realm proper. Its Archon bears a ram\'s head. The soul must present the counter-seal of the baptism of fire and speak the second password. The Book of Jeu notes that at this gate the soul sheds its "aetheric body" and proceeds clothed only in light.' },
      { id: 'gate3', label: 'Third Gate \u00b7 Celestial Boundary', brief: 'Entry into the aeon of the stars', detail: 'The third gate marks the boundary of the fixed-star sphere. Its Archon is described as eagle-headed, and its seal incorporates a seven-pointed star. The initiate must present the fire-seal and recite the names of all seven planetary archons from below. Beyond this gate the soul begins to encounter the lower aeons proper.' },
      { id: 'counter', label: 'The Counter-Seal', brief: 'Baptismal seal granted to initiates', detail: 'The counter-seal (\u1f00\u03bd\u03c4\u03b9-\u03c3\u03c6\u03c1\u03b1\u03b3\u1f77\u03c2) is imprinted on the soul during the baptismal rite. The Book of Jeu II describes it as a seal "in the form of the name of Jeu written in fire upon the garment of light." It functions as a passport through each archonic gate \u2014 each Archon recognizes the seal as a mark of divine authority and is compelled by the higher power of Jeu to step aside.' }
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
      { title: 'The Ritual Script', body: 'The text provides direct speech: "Hear me, Father, father of all fatherhood, boundless light: \u03c8\u03b5 \u03b1\u03b9\u03a9 \u03b1\u03b9\u03a9 \u03b1\u03a9\u2026 Let the light-seal descend upon [name], that they may pass through all the rulers of the world and all the rulers of the darkness." Scholars regard this as an actual liturgical formula.' },
      { title: 'The Vine Branches', body: 'An unusual element is the instruction to bind vine branches around the hands of the candidate \u2014 a possible echo of Dionysiac mystery rites absorbed into the Gnostic synthesis. The vine, associated with the blood of Christ in mainstream Christianity, here becomes a seal-bearer and symbol of enclosed divine light.' },
      { title: 'The Role of the Priest', body: 'The officiating priest speaks the names of the aeons over the candidate while placing a seal on their forehead, mouth, and chest. The candidate must keep their eyes closed throughout and respond only with "Amen." The priest concludes: "Go in peace, for I set the seal upon you from the Treasury of the Light."' }
    ],
    hotspots: [
      { id: 'fire', label: 'Baptism of Fire', brief: 'The sealing empowerment of the soul', detail: 'The baptism of fire (\u03b2\u03ac\u03c0\u03c4\u03b9\u03c3\u03bc\u03b1 \u03c0\u03c5\u03c1\u03cc\u03c2) is administered after the water baptism. The priest recites a long invocation calling upon Jeu and the 49 powers. A seal of fire is then symbolically traced upon the candidate\'s luminous garment \u2014 described as "living fire that does not consume the soul but illuminates it and makes it invincible before the archons."' },
      { id: 'water', label: 'Baptism of Water', brief: 'Purification and first sealing', detail: 'The water baptism comes first and performs a cleansing function. The candidate confesses their entrapment in matter and calls upon the name of Jeu. The water used is described as "living water" \u2014 water that has been sealed with the name of Jeu and thus charged with divine power. The baptism is performed by full immersion, after which the candidate receives the anointing with oil.' },
      { id: 'oil', label: 'Anointing with Oil', brief: 'The unction of the mysteries', detail: 'Between the water and fire baptisms the candidate is anointed with "the unction of the mysteries of the repentance." This anointing corresponds to the Gnostic interpretation of the chrism (\u03c7\u03c1\u1f77\u03c3\u03bc\u03b1). It seals the candidate\'s body against re-infiltration by archonic powers during the remainder of their earthly life, and prepares the luminous garment for the fire-seal to follow.' },
      { id: 'vine', label: 'The Vine Branches', brief: 'Symbol of enclosed divine light', detail: 'The ritual instruction reads: "Bind vine branches around their hands." This has no direct parallel in mainstream Christian baptismal rites and likely derives from pre-Christian mystery traditions. The vine is a symbol of divine life enclosed in material form \u2014 just as wine contains the spirit of the grape, the initiate\'s body contains the divine spark.' },
      { id: 'names', label: 'The Sacred Names', brief: 'Living words spoken over the candidate', detail: 'The baptismal invocation includes voces magicae \u2014 sacred sound-words combining Greek vowels, Coptic divine names, and phonetic representations of divine names: \u03c8\u03b5 \u03b1\u03b9\u03a9 \u03b1\u03b9\u03a9 \u03b1\u03a9 \u03c8\u03b5 \u03b1\u03c1\u03a9 \u03b1\u03c1\u03a9 \u03a9 \u03c8\u03b5 \u03a9\u03a9\u03a9. These represent the names of the 49 powers of Jeu and function as the verbal component of the seal imprinted upon the soul.' }
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
      { title: 'The Six Watchers', body: 'Six places surround the central figure of the 55th Treasury, each occupied by a watcher (\u03c0\u03b1\u03c1\u03b1\u03c4\u03ae\u03c1\u03b7\u03c4\u03b7\u03c2). These watchers hold ciphers \u2014 coded names that must be spoken aloud in sequence. The text instructs: "Seal yourselves with this seal while the cipher is in your hand," suggesting a physical gesture accompanying the verbal formula.' },
      { title: 'The Cipher Ritual', body: 'Unlike the more elaborate baptismal rites of Book II, the cipher ritual of the 55th Treasury is brief and self-administered. The initiate traces the cross-and-circle upon their own forehead while reciting the guardian\'s name. This act of self-sealing is unique in the Book of Jeu and may represent a more democratized form of Gnostic practice.' },
      { title: 'Context in the Codex', body: 'Chapter 33 falls within the central sequence of the First Book of Jeu, where individual treasuries are described with their seals, names, and ritual instructions. The 55th Treasury is notable for its geometric simplicity \u2014 a single cross and circle \u2014 compared to the more elaborate multi-ring seals of other treasuries, suggesting it may represent a foundational or primordial seal.' }
    ],
    hotspots: [
      { id: 'cross', label: 'The Sacred Cross', brief: 'Axis of divine will and emanation', detail: 'The vertical stroke of the cross represents the descent of divine light from the Unknowable Father through Jeu into creation, and the ascent of the soul back toward its source. The horizontal stroke marks the extension of grace across all realms of being. Together they form the most ancient seal of the Treasury \u2014 a sign that predates even the twelve aeons.' },
      { id: 'circle55', label: 'The Enclosing Circle', brief: 'Perfection of the Pleroma', detail: 'The circle represents the Pleroma in its totality \u2014 perfect, self-contained, without beginning or end. When the cross is inscribed within the circle, it signifies that divine will (the cross) operates within and never exceeds the bounds of divine perfection (the circle). This is the fundamental law of the Treasury: no emanation can exceed its source.' },
      { id: 'watchers55', label: 'The Six Watchers', brief: 'Guardians holding the ciphers', detail: 'The six watchers occupy the cardinal and intercardinal positions around the central cross. Each holds a cipher \u2014 a coded name that must be decoded and spoken. The ciphers are given in a mixture of Coptic and Greek letters, and their pronunciation transforms them from inert symbols into active keys that unlock the treasury\'s gate.' },
      { id: 'cipher', label: 'The Cipher', brief: 'The coded name held in hand', detail: 'The cipher of the 55th Treasury is described as being "in your hand" \u2014 possibly a small inscribed tablet or parchment carried by the initiate during the ritual. The physical presence of the cipher during the act of sealing creates a connection between the material and spiritual realms, allowing the divine name to bridge the gap between flesh and light.' }
    ]
  },
  {
    id: 'ch36',
    nav: 'Ch. 36 \u2022 58th Treasury',
    title: 'The 58th Treasury of Light',
    ref: 'First Book of Jeu \u2022 Chapter 36 \u2022 Bruce Codex ff. 28r\u201329v',
    desc: 'The 58th Treasury reveals the great wheel of emanation \u2014 twelve rays radiating from an inner ring, bounded by an outer circle. Six places surround it, and the initiate must invoke the name three times while tracing the wheel upon the air. This treasury governs the rotation of the aeons and the cycling of souls through purification.',
    lore: [
      { title: 'The Wheel of Emanation', body: 'The twelve-rayed wheel is a cosmological diagram showing how the divine light emanates outward from the central point through twelve channels \u2014 one for each of the aeons. The rotation of the wheel represents the eternal cycling of light outward into creation and inward back toward the Treasury, a process that sustains all existence.' },
      { title: 'The Twelve Rays', body: 'Each of the twelve rays corresponds to one of the aeon-rulers: Harmozel, Oroiael, Daveithe, Eleleth, Gamaliel, Gabriel, Samblo, Abrasax, Iaoth, Sabaoth, Adonaios, and Sabaoth the Second. The ray of each aeon is a conduit for a specific quality of divine light \u2014 grace, thought, understanding, perception, and so on.' },
      { title: 'The Triple Invocation', body: 'The instruction to "invoke the name three times" mirrors the three-fold baptismal structure of water, fire, and spirit. Each repetition seals a different layer of the initiate\'s luminous garment. The first invocation opens the outer gate; the second activates the inner ring; the third draws the central light outward to meet the ascending soul.' },
      { title: 'Rotation of the Aeons', body: 'The 58th Treasury governs the rotation (\u03c0\u03b5\u03c1\u03b9\u03c3\u03c4\u03c1\u03bf\u03c6\u03ae) of the aeons \u2014 the cosmic cycle by which each aeon takes its turn presiding over the Pleroma. This rotation ensures that no single aeon dominates eternally, maintaining the harmony and balance of the divine Fullness. The initiate who understands this rotation can align their ascent with the current presiding aeon.' }
    ],
    hotspots: [
      { id: 'outer58', label: 'The Outer Circle', brief: 'Boundary of the treasury', detail: 'The outer circle of the 58th Treasury marks its boundary with the surrounding aeons. Unlike the 55th Treasury\'s simple circle, this outer ring is inscribed with the names of all twelve aeon-rulers, making it both a boundary and a map. The initiate who can read this ring knows the order of the aeons and the direction of their rotation.' },
      { id: 'inner58', label: 'The Inner Ring', brief: 'Nexus of the twelve emanations', detail: 'The inner ring is where the twelve rays converge. It represents the point of origin from which all divine light radiates outward \u2014 the "navel" of the Treasury, so to speak. In the ritual, the priest traces this ring upon the candidate\'s chest, symbolically placing the nexus of emanation within their own heart.' },
      { id: 'rays58', label: 'The Twelve Rays', brief: 'Channels of aeonic emanation', detail: 'Each ray is a channel for a specific quality of divine light. The ray of Harmozel carries the light of grace; the ray of Oroiael carries the light of thought; and so forth. The initiate must know which ray corresponds to which aeon, for the soul must ascend through the rays in the correct order \u2014 not randomly, but following the rotation of the wheel.' },
      { id: 'rotation', label: 'The Rotation', brief: 'Cosmic cycling of the aeons', detail: 'The 58th Treasury is unique in that it governs not a static structure but a dynamic process \u2014 the rotation of the aeons. This rotation is the heartbeat of the Pleroma, the rhythm by which divine light circulates eternally. Understanding this rotation allows the initiate to time their ascent for maximum alignment with the presiding aeon, dramatically easing the passage through the archonic gates.' }
    ]
  }
]

/* ═══════════════════════════════════════════════════
   SVG CONSTANTS
   ═══════════════════════════════════════════════════ */
const INK = '#1a1208'
const INK2 = 'rgba(26,18,8,0.55)'
const INK3 = 'rgba(26,18,8,0.25)'
const INK4 = 'rgba(26,18,8,0.1)'
const GOLD = '#c8a84a'
const GOLD2 = '#8a6820'
const CINZEL = 'Cinzel,serif'
const BASK = 'Libre Baskerville,Georgia,serif'

/* ═══════════════════════════════════════════════════
   SVG DIAGRAM COMPONENTS
   ═══════════════════════════════════════════════════ */

function TreasuryDiagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260, cy = 268
  const sealNames = ['Harmozel','Oroiael','Daveithe','Eleleth','Gamaliel','Gabriel','Samblo','Abrasax','Iaoth','Sabaoth','Adonaios','Sabaoth II']

  return (
    <svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg">
      {/* Decorative frame */}
      <rect x={12} y={12} width={496} height={536} fill="none" stroke={INK3} strokeWidth={0.4} rx={3} />
      <rect x={18} y={18} width={484} height={524} fill="none" stroke={INK4} strokeWidth={0.3} rx={2} />
      {[[22,22],[510,22],[22,546],[510,546]].map(([ox,oy], i) => {
        const dx = i%2===0?1:-1, dy = i<2?1:-1
        return <g key={`corner-${i}`}>
          <line x1={ox} y1={oy} x2={ox+dx*22} y2={oy} stroke={INK} strokeWidth={0.6} />
          <line x1={ox} y1={oy} x2={ox} y2={oy+dy*22} stroke={INK} strokeWidth={0.6} />
          <line x1={ox+dx*6} y1={oy+dy*6} x2={ox+dx*18} y2={oy+dy*6} stroke={INK3} strokeWidth={0.4} />
          <line x1={ox+dx*6} y1={oy+dy*6} x2={ox+dx*6} y2={oy+dy*18} stroke={INK3} strokeWidth={0.4} />
        </g>
      })}

      {/* Rotating outer glow */}
      <circle cx={cx} cy={cy} r={220} fill="none" stroke="rgba(200,168,74,0.12)" strokeWidth={0.8} className="svg-rotate" />
      <circle cx={cx} cy={cy} r={215} fill="none" stroke="rgba(200,168,74,0.08)" strokeWidth={0.4} strokeDasharray="4,6" className="svg-rotate" style={{animationDirection:'reverse', animationDuration:'90s'}} />

      {/* Outermost ring: 12 seals */}
      <circle cx={cx} cy={cy} r={205} fill="none" stroke={INK2} strokeWidth={0.5} />
      <g className={`svg-clickable ${selected==='aeons'?'selected':''}`} onClick={() => onSelect('aeons')}>
        {sealNames.map((name, i) => {
          const a = (i/12)*Math.PI*2 - Math.PI/2
          const sx = cx+Math.cos(a)*205, sy = cy+Math.sin(a)*205
          const lx = cx+Math.cos(a)*228, ly = cy+Math.sin(a)*228
          const la = a*(180/Math.PI)+90
          return <g key={`seal-${i}`}>
            <line x1={cx+Math.cos(a)*50} y1={cy+Math.sin(a)*50} x2={cx+Math.cos(a)*196} y2={cy+Math.sin(a)*196} stroke={INK4} strokeWidth={0.4} />
            <circle cx={sx} cy={sy} r={9} fill="rgba(26,18,8,0.08)" stroke={INK} strokeWidth={0.8} />
            <circle cx={sx} cy={sy} r={4} fill="rgba(26,18,8,0.15)" />
            <text x={lx} y={ly} fontSize={7.5} fill={INK2} textAnchor="middle" dominantBaseline="central"
              fontFamily={CINZEL} letterSpacing="0.06em" transform={`rotate(${la},${lx},${ly})`}>{name}</text>
          </g>
        })}
      </g>
      <text x={cx} y={cy-218} fontSize={7} fill={INK3} textAnchor="middle" fontFamily={CINZEL} letterSpacing="0.12em">TWELVE SEALS OF THE OUTER RING</text>

      {/* Second veil */}
      <g className={`svg-clickable ${selected==='veils'?'selected':''}`} onClick={() => onSelect('veils')}>
        <circle cx={cx} cy={cy} r={155} fill="rgba(26,18,8,0.02)" stroke={INK2} strokeWidth={0.6} />
        <text x={cx} y={cy-158} fontSize={7.5} fill={INK3} textAnchor="middle" fontFamily={CINZEL} letterSpacing="0.15em">SECOND VEIL</text>
      </g>

      {/* Third veil */}
      <g className={`svg-clickable ${selected==='veils'?'selected':''}`} onClick={() => onSelect('veils')}>
        <circle cx={cx} cy={cy} r={100} fill="rgba(26,18,8,0.03)" stroke={INK} strokeWidth={0.7} />
        <text x={cx} y={cy-103} fontSize={7} fill={INK2} textAnchor="middle" fontFamily={CINZEL} letterSpacing="0.12em">THIRD VEIL</text>
      </g>

      {/* Hexagram */}
      <g className={`svg-clickable ${selected==='spark'?'selected':''}`} onClick={() => onSelect('spark')}>
        {[0,1].map(tri => {
          const pts = [0,1,2].map(i => {
            const a = i*120*Math.PI/180 - Math.PI/2 + (tri*Math.PI/3)
            return `${cx+Math.cos(a)*64},${cy+Math.sin(a)*64}`
          }).join(' ')
          return <polygon key={tri} points={pts} fill="rgba(26,18,8,0.05)" stroke={INK} strokeWidth={0.5} />
        })}
      </g>

      {/* Inner sanctum */}
      <g className={`svg-clickable ${selected==='invisible'?'selected':''}`} onClick={() => onSelect('invisible')}>
        <circle cx={cx} cy={cy} r={42} fill="rgba(26,18,8,0.08)" stroke={INK} strokeWidth={1.2} className="svg-glow" />
        <text x={cx} y={cy-10} fontSize={8.5} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} letterSpacing="0.1em">THE GREAT</text>
        <text x={cx} y={cy+4} fontSize={8.5} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} letterSpacing="0.1em">INVISIBLE</text>
        <text x={cx} y={cy+19} fontSize={8} textAnchor="middle" fill={INK2} fontStyle="italic">\u1f08\u03cc\u03c1\u03b1\u03c4\u03bf\u03c2</text>
        <circle cx={cx} cy={cy-16} r={5} fill="rgba(26,18,8,0.25)" stroke={INK} strokeWidth={0.8} className="svg-pulse" />
        <circle cx={cx} cy={cy-16} r={2} fill={INK} />
      </g>

      {/* Divine spark label */}
      <g className={`svg-clickable ${selected==='spark'?'selected':''}`} onClick={() => onSelect('spark')}>
        <text x={cx+52} y={cy-16} fontSize={7.5} fill={INK3} fontStyle="italic" textAnchor="start">Divine Spark \u203a</text>
        <line x1={cx+5} y1={cy-16} x2={cx+50} y2={cy-16} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,2" />
      </g>

      {/* Caption */}
      <line x1={60} y1={548} x2={460} y2={548} stroke={INK3} strokeWidth={0.5} />
      <text x={cx} y={557} fontSize={8.5} textAnchor="middle" fill={INK2} fontStyle="italic">\u03c4\u1f78 \u0398\u03b7\u03c3\u03b1\u03c5\u03c1\u03bf\u03c6\u03c5\u03bb\u03ac\u03ba\u03b9\u03bf\u03bd \u03c4\u03bf\u1fe6 \u03a6\u03c9\u03c4\u03cc\u03c2 \u2014 The Treasury of the Light</text>
    </svg>
  )
}

function JeuDiagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260
  return (
    <svg viewBox="0 0 520 610" xmlns="http://www.w3.org/2000/svg">
      {/* Frame */}
      <rect x={12} y={12} width={496} height={586} fill="none" stroke={INK3} strokeWidth={0.4} rx={3} />
      <rect x={18} y={18} width={484} height={574} fill="none" stroke={INK4} strokeWidth={0.3} rx={2} />
      {[[22,22],[510,22],[22,598],[510,598]].map(([ox,oy], i) => {
        const dx = i%2===0?1:-1, dy = i<2?1:-1
        return <g key={`c-${i}`}>
          <line x1={ox} y1={oy} x2={ox+dx*22} y2={oy} stroke={INK} strokeWidth={0.6} />
          <line x1={ox} y1={oy} x2={ox} y2={oy+dy*22} stroke={INK} strokeWidth={0.6} />
        </g>
      })}

      {/* Throne */}
      <g className={`svg-clickable ${selected==='throne'?'selected':''}`} onClick={() => onSelect('throne')}>
        <rect x={180} y={530} width={160} height={20} fill="rgba(26,18,8,0.07)" stroke={INK} strokeWidth={0.8} rx={2} />
        <rect x={170} y={525} width={180} height={12} fill="rgba(26,18,8,0.05)" stroke={INK} strokeWidth={0.5} rx={1} />
        <rect x={190} y={545} width={140} height={8} fill="rgba(26,18,8,0.04)" stroke={INK2} strokeWidth={0.4} rx={1} />
        <text x={cx} y={541} fontSize={7.5} textAnchor="middle" fontFamily={CINZEL} letterSpacing="0.12em" fill={INK2}>\u2726 THRONE OF JEU \u2726</text>
      </g>

      {/* Body */}
      <ellipse cx={cx} cy={400} rx={68} ry={88} fill="rgba(26,18,8,0.04)" stroke={INK} strokeWidth={0.7} />
      {[-3,-2,-1,0,1,2,3].map(i => (
        <line key={`body-${i}`} x1={cx+i*12} y1={330} x2={cx+i*9+3} y2={518} stroke={INK4} strokeWidth={0.35} />
      ))}

      {/* Arms */}
      <line x1={192} y1={390} x2={120} y2={360} stroke={INK} strokeWidth={0.7} />
      <line x1={328} y1={390} x2={400} y2={360} stroke={INK} strokeWidth={0.7} />
      <circle cx={120} cy={360} r={6} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} />
      <circle cx={400} cy={360} r={6} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} />

      {/* Staff */}
      <g className={`svg-clickable ${selected==='staff'?'selected':''}`} onClick={() => onSelect('staff')}>
        <line x1={406} y1={360} x2={432} y2={528} stroke={INK} strokeWidth={1.1} />
        <polygon points="422,355 432,322 442,355" fill="rgba(26,18,8,0.18)" stroke={INK} strokeWidth={0.6} />
        <polygon points="426,348 432,318 438,348" fill="rgba(26,18,8,0.1)" stroke={INK2} strokeWidth={0.4} />
        <text x={448} y={420} fontSize={7} fill={INK3} fontStyle="italic" textAnchor="start">Staff of</text>
        <text x={448} y={432} fontSize={7} fill={INK3} fontStyle="italic" textAnchor="start">Fire</text>
      </g>

      {/* Halo rings */}
      <circle cx={cx} cy={200} r={95} fill="none" stroke={INK3} strokeWidth={0.4} className="svg-pulse" />
      <circle cx={cx} cy={200} r={80} fill="none" stroke={INK3} strokeWidth={0.5} />
      <circle cx={cx} cy={200} r={68} fill="none" stroke={INK2} strokeWidth={0.6} className="svg-glow" />

      {/* Head */}
      <g className={`svg-clickable ${selected==='head'?'selected':''}`} onClick={() => onSelect('head')}>
        <circle cx={cx} cy={200} r={52} fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={1} />
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
          const a = (i/12)*Math.PI*2 - Math.PI/2
          return <line key={`ray-${i}`} x1={cx+Math.cos(a)*53} y1={200+Math.sin(a)*53} x2={cx+Math.cos(a)*68} y2={200+Math.sin(a)*68} stroke={INK} strokeWidth={0.6} />
        })}
        <text x={cx} y={196} fontSize={18} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} letterSpacing="0.08em">\u0399\u0395\u03a5</text>
        <text x={cx} y={214} fontSize={7.5} textAnchor="middle" fontStyle="italic" fill={INK2}>\u1f38\u03b5\u03cd \u1f41 \u1f08\u03bb\u03b7\u03b8\u03b9\u03bd\u1f78\u03c2 \u0398\u03b5\u03cc\u03c2</text>
      </g>

      {/* 49 Powers LEFT */}
      <g className={`svg-clickable ${selected==='powers7'?'selected':''}`} onClick={() => onSelect('powers7')}>
        <text x={90} y={298} fontSize={7} fontFamily={CINZEL} fill={INK3} letterSpacing="0.06em">Powers of</text>
        <text x={90} y={309} fontSize={7} fontFamily={CINZEL} fill={INK3} letterSpacing="0.06em">the Right</text>
        {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => (
          <circle key={`pl-${r}-${c}`} cx={44+c*15} cy={320+r*15} r={4.5}
            fill={`rgba(26,18,8,${0.06+(r+c)*0.022})`} stroke={INK} strokeWidth={0.4} />
        )))}
        <line x1={192} y1={400} x2={150} y2={325} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,3" />
      </g>

      {/* 49 Powers RIGHT */}
      <g className={`svg-clickable ${selected==='powers7'?'selected':''}`} onClick={() => onSelect('powers7')}>
        <text x={430} y={298} fontSize={7} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.06em">Powers of</text>
        <text x={430} y={309} fontSize={7} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.06em">the Left</text>
        {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => (
          <circle key={`pr-${r}-${c}`} cx={376+c*15} cy={320+r*15} r={4.5}
            fill={`rgba(26,18,8,${0.02+(r+c)*0.014})`} stroke={INK2} strokeWidth={0.35} />
        )))}
        <line x1={328} y1={400} x2={370} y2={325} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,3" />
      </g>

      <text x={cx} y={605} fontSize={8.5} textAnchor="middle" fontStyle="italic" fill={INK2}>\u1f38\u03b5\u03cd \u1f41 \u1f08\u03bb\u03b7\u03b8\u03b9\u03bd\u1f78\u03c2 \u0398\u03b5\u03cc\u03c2 \u2014 Jeu, the True God, Father of the Treasury</text>
    </svg>
  )
}

function ArchonsDiagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260
  const gateData = [
    { y: 105, label: 'IALDABAOTH', sub: 'Lion-faced Demiurge \u00b7 Saklas \u00b7 Samael', id: 'ialdabaoth', diamond: true },
    { y: 220, label: 'THIRD GATE', sub: 'Eagle-headed \u00b7 Fixed-star sphere', id: 'gate3', diamond: false },
    { y: 340, label: 'SECOND GATE', sub: 'Ram-headed \u00b7 Aetheric boundary', id: 'gate2', diamond: false },
    { y: 455, label: 'FIRST GATE', sub: 'Crocodile-headed \u00b7 Outermost sphere', id: 'gate1', diamond: false },
  ]

  return (
    <svg viewBox="0 0 520 610" xmlns="http://www.w3.org/2000/svg">
      {/* Frame */}
      <rect x={12} y={12} width={496} height={586} fill="none" stroke={INK3} strokeWidth={0.4} rx={3} />
      <rect x={18} y={18} width={484} height={574} fill="none" stroke={INK4} strokeWidth={0.3} rx={2} />
      {[[22,22],[510,22],[22,598],[510,598]].map(([ox,oy], i) => {
        const dx = i%2===0?1:-1, dy = i<2?1:-1
        return <g key={`c-${i}`}>
          <line x1={ox} y1={oy} x2={ox+dx*22} y2={oy} stroke={INK} strokeWidth={0.6} />
          <line x1={ox} y1={oy} x2={ox} y2={oy+dy*22} stroke={INK} strokeWidth={0.6} />
        </g>
      })}

      {/* Treasury at top */}
      <circle cx={cx} cy={46} r={26} fill="rgba(26,18,8,0.07)" stroke={INK} strokeWidth={0.8} className="svg-glow" />
      <circle cx={cx} cy={46} r={16} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} />
      <text x={cx} y={50} fontSize={8} textAnchor="middle" fontFamily={CINZEL} fontWeight={700}>JEU</text>
      <text x={cx} y={30} fontSize={6.5} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.1em">TREASURY OF LIGHT</text>

      {/* Ascent axis */}
      <line x1={cx} y1={72} x2={cx} y2={538} stroke={INK3} strokeWidth={0.5} strokeDasharray="5,4" />

      {/* Ascent arrows */}
      {[130,210,290,370,450].map(y => (
        <text key={`arr-${y}`} x={cx+18} y={y} fontSize={15} fill={INK3} textAnchor="start">\u2191</text>
      ))}

      {/* Gates */}
      {gateData.map(g => (
        <g key={g.id} className={`svg-clickable ${selected===g.id?'selected':''}`} onClick={() => onSelect(g.id)}>
          {g.diamond ? (
            <>
              <polygon points={`${cx},${g.y-44} ${cx+52},${g.y} ${cx},${g.y+44} ${cx-52},${g.y}`} fill="rgba(26,18,8,0.08)" stroke={INK} strokeWidth={0.9} />
              <polygon points={`${cx},${g.y-36} ${cx+44},${g.y} ${cx},${g.y+36} ${cx-44},${g.y}`} fill="rgba(26,18,8,0.04)" stroke={INK2} strokeWidth={0.4} />
            </>
          ) : (
            <polygon
              points={[0,1,2,3,4,5].map(i => {
                const a = i*60*Math.PI/180 - Math.PI/2
                return `${cx+Math.cos(a)*42},${g.y+Math.sin(a)*36}`
              }).join(' ')}
              fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={0.8}
            />
          )}
          <text x={cx} y={g.y-3} fontSize={10} textAnchor="middle" fontFamily={CINZEL} fontWeight={600} letterSpacing="0.08em">{g.label}</text>
          <text x={cx} y={g.y+12} fontSize={7} textAnchor="middle" fontStyle="italic" fill={INK2}>{g.sub}</text>

          {/* Seal symbol */}
          <circle cx={82} cy={g.y} r={22} fill="rgba(26,18,8,0.05)" stroke={INK} strokeWidth={0.6} />
          <circle cx={82} cy={g.y} r={14} fill="none" stroke={INK2} strokeWidth={0.4} />
          <line x1={60} y1={g.y} x2={104} y2={g.y} stroke={INK3} strokeWidth={0.3} />
          <line x1={82} y1={g.y-22} x2={82} y2={g.y+22} stroke={INK3} strokeWidth={0.3} />
          <text x={82} y={g.y+5} fontSize={13} textAnchor="middle" fill={INK2}>\u2629</text>
          <text x={82} y={g.y+32} fontSize={6} textAnchor="middle" fill={INK3} fontFamily={CINZEL} letterSpacing="0.1em">SEAL</text>
          <line x1={104} y1={g.y} x2={cx-44} y2={g.y} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,2" />

          {/* Password box */}
          <rect x={362} y={g.y-18} width={92} height={36} fill="rgba(26,18,8,0.04)" stroke={INK3} strokeWidth={0.4} rx={2} />
          <text x={408} y={g.y-4} fontSize={6.5} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.06em">Password</text>
          <text x={408} y={g.y+9} fontSize={6.5} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.06em">Required</text>
          <line x1={cx+44} y1={g.y} x2={362} y2={g.y} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,2" />
        </g>
      ))}

      {/* Counter-seal */}
      <g className={`svg-clickable ${selected==='counter'?'selected':''}`} onClick={() => onSelect('counter')}>
        <circle cx={cx} cy={560} r={26} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.9} className="svg-glow" />
        <circle cx={cx} cy={560} r={16} fill="none" stroke={INK} strokeWidth={0.5} />
        <text x={cx} y={564} fontSize={15} textAnchor="middle" fill={INK}>\u2726</text>
        <text x={cx} y={540} fontSize={7} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.1em">Counter-Seal \u00b7 Passport of the Soul</text>
      </g>

      <text x={cx} y={602} fontSize={8.5} textAnchor="middle" fontStyle="italic" fill={INK2}>\u1f21 \u1f08\u03bd\u03bf\u03b4\u03bf\u03c2 \u03c4\u1fc6\u03c2 \u03a8\u03c5\u03c7\u1fc6\u03c2 \u2014 The Ascent of the Soul</text>
    </svg>
  )
}

function BaptismDiagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260
  const stations = [
    { a: -Math.PI/2, label: 'WATER', sub: 'Purification', id: 'water', sym: '\u224b' },
    { a: Math.PI/6, label: 'FIRE', sub: 'Sealing', id: 'fire', sym: '\u22c6' },
    { a: Math.PI - Math.PI/6, label: 'OIL', sub: 'Anointing', id: 'oil', sym: '\u2726' },
  ]

  return (
    <svg viewBox="0 0 520 590" xmlns="http://www.w3.org/2000/svg">
      {/* Frame */}
      <rect x={12} y={12} width={496} height={566} fill="none" stroke={INK3} strokeWidth={0.4} rx={3} />
      <rect x={18} y={18} width={484} height={554} fill="none" stroke={INK4} strokeWidth={0.3} rx={2} />
      {[[22,22],[510,22],[22,578],[510,578]].map(([ox,oy], i) => {
        const dx = i%2===0?1:-1, dy = i<2?1:-1
        return <g key={`c-${i}`}>
          <line x1={ox} y1={oy} x2={ox+dx*22} y2={oy} stroke={INK} strokeWidth={0.6} />
          <line x1={ox} y1={oy} x2={ox} y2={oy+dy*22} stroke={INK} strokeWidth={0.6} />
        </g>
      })}

      <text x={cx} y={36} fontSize={8.5} textAnchor="middle" fontFamily={CINZEL} fill={INK2} letterSpacing="0.15em">\u2726 \u03a4\u0395\u039b\u0395\u03a4\u0397 \u0392\u0391\u03a0\u03a4\u0399\u03a3\u039c\u0391\u03a4\u039f\u03a3 \u2726</text>
      <text x={cx} y={52} fontSize={8} textAnchor="middle" fontStyle="italic" fill={INK3}>The Rite of Holy Baptism \u2014 Three-fold Sealing</text>
      <line x1={60} y1={60} x2={460} y2={60} stroke={INK3} strokeWidth={0.5} />

      {/* Ritual circles */}
      <circle cx={cx} cy={200} r={155} fill="none" stroke={INK3} strokeWidth={0.4} className="svg-pulse" />
      <circle cx={cx} cy={200} r={110} fill="none" stroke={INK2} strokeWidth={0.5} />
      <circle cx={cx} cy={200} r={70} fill="none" stroke={INK2} strokeWidth={0.6} className="svg-glow" />

      {/* Candidate */}
      <ellipse cx={cx} cy={200} rx={30} ry={40} fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={0.8} />
      <line x1={230} y1={200} x2={310} y2={196} stroke={INK} strokeWidth={0.7} />
      <line x1={190} y1={200} x2={110} y2={196} stroke={INK} strokeWidth={0.7} />
      <circle cx={110} cy={196} r={6} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} />
      <circle cx={310} cy={196} r={6} fill="rgba(26,18,8,0.1)" stroke={INK} strokeWidth={0.5} />
      <text x={cx} y={193} fontSize={7} textAnchor="middle" fontFamily={CINZEL} fontWeight={600}>CAND-</text>
      <text x={cx} y={206} fontSize={7} textAnchor="middle" fontFamily={CINZEL} fontWeight={600}>IDATE</text>

      {/* Sealing points */}
      {[[cx,164,'Brow'],[cx,188,'Lips'],[cx,216,'Heart']].map(([x,y,l], i) => (
        <g key={`seal-${i}`}>
          <circle cx={Number(x)} cy={Number(y)} r={5} fill="rgba(26,18,8,0.15)" stroke={INK} strokeWidth={0.6} className="svg-pulse" />
          <text x={Number(x)+9} y={Number(y)+4} fontSize={6.5} fill={INK3} fontStyle="italic" textAnchor="start">{l}</text>
        </g>
      ))}

      {/* Three stations */}
      {stations.map(s => {
        const x = cx+Math.cos(s.a)*110, y = 200+Math.sin(s.a)*110
        return (
          <g key={s.id} className={`svg-clickable ${selected===s.id?'selected':''}`} onClick={() => onSelect(s.id)}>
            <circle cx={x} cy={y} r={30} fill="rgba(26,18,8,0.07)" stroke={INK} strokeWidth={0.8} />
            <circle cx={x} cy={y} r={20} fill="rgba(26,18,8,0.04)" stroke={INK2} strokeWidth={0.4} />
            <text x={x} y={y+5} fontSize={14} textAnchor="middle" fill={INK2}>{s.sym}</text>
            <text x={x} y={y+40} fontSize={8} textAnchor="middle" fontFamily={CINZEL} fontWeight={600} letterSpacing="0.1em">{s.label}</text>
            <text x={x} y={y+52} fontSize={7} textAnchor="middle" fontStyle="italic" fill={INK3}>{s.sub}</text>
            <line x1={cx+Math.cos(s.a)*30} y1={200+Math.sin(s.a)*30} x2={x-Math.cos(s.a)*30} y2={y-Math.sin(s.a)*30} stroke={INK4} strokeWidth={0.5} strokeDasharray="4,3" />
          </g>
        )
      })}

      {/* Vine branches */}
      <g className={`svg-clickable ${selected==='vine'?'selected':''}`} onClick={() => onSelect('vine')}>
        <rect x={75} y={388} width={370} height={30} fill="rgba(26,18,8,0.04)" stroke={INK2} strokeWidth={0.4} rx={2} />
        {[0,1,2,3,4,5,6,7,8].map(i => {
          const x = 90+i*40
          return <g key={`vine-${i}`}>
            <ellipse cx={x} cy={378} rx={8} ry={13} fill="rgba(26,18,8,0.07)" stroke={INK2} strokeWidth={0.4} transform={`rotate(-35,${x},378)`} />
            <line x1={x} y1={385} x2={x} y2={392} stroke={INK3} strokeWidth={0.4} />
          </g>
        })}
        <text x={cx} y={407} fontSize={7.5} textAnchor="middle" fontFamily={CINZEL} fill={INK2} letterSpacing="0.06em">VINE BRANCHES \u2014 bound upon the hands of the candidate</text>
      </g>

      {/* Voces magicae */}
      <g className={`svg-clickable ${selected==='names'?'selected':''}`} onClick={() => onSelect('names')}>
        <rect x={75} y={428} width={370} height={90} fill="rgba(26,18,8,0.04)" stroke={INK2} strokeWidth={0.4} rx={2} />
        <text x={cx} y={448} fontSize={7.5} textAnchor="middle" fontFamily={CINZEL} fill={INK2} letterSpacing="0.08em">Sacred Invocation \u2014 Voces Magicae</text>
        <line x1={100} y1={455} x2={420} y2={455} stroke={INK4} strokeWidth={0.4} />
        <text x={cx} y={472} fontSize={10} textAnchor="middle" fill={INK} fontWeight={700}>\u03c8\u03b5 \u03b1\u03b9\u03a9 \u03b1\u03b9\u03a9 \u03b1\u03a9 \u03c8\u03b5 \u03b1\u03c1\u03a9 \u03b1\u03c1\u03a9 \u03a9 \u03c8\u03b5 \u03a9\u03a9\u03a9</text>
        <text x={cx} y={490} fontSize={7.5} textAnchor="middle" fontStyle="italic" fill={INK2}>&quot;Hear me, Father of all fatherhood, boundless Light:</text>
        <text x={cx} y={504} fontSize={7.5} textAnchor="middle" fontStyle="italic" fill={INK2}>let the light-seal descend upon thy servant.&quot;</text>
      </g>

      {/* Soul names */}
      <rect x={75} y={530} width={370} height={36} fill="rgba(26,18,8,0.03)" stroke={INK3} strokeWidth={0.3} rx={2} />
      <text x={cx} y={546} fontSize={7.5} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.04em">Names spoken: Jeu \u00b7 Harmozel \u00b7 Oroiael \u00b7 Daveithe \u00b7 Eleleth \u00b7 Sabaoth</text>
      <text x={cx} y={560} fontSize={7} textAnchor="middle" fontStyle="italic" fill={INK3}>&quot;Go in peace, for I set the seal upon you from the Treasury of the Light.&quot;</text>

      <text x={cx} y={583} fontSize={8.5} textAnchor="middle" fontStyle="italic" fill={INK2}>\u0392\u03ac\u03c0\u03c4\u03b9\u03c3\u03bc\u03b1 \u1f55\u03b4\u03b1\u03c4\u03bf\u03c2 \u03ba\u03b1\u1f76 \u03c0\u03c5\u03c1\u03cc\u03c2 \u2014 Baptism of Water and Fire</text>
    </svg>
  )
}

function Treasury55Diagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260, cy = 260

  return (
    <svg viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg">
      {/* Frame */}
      <rect x={12} y={12} width={496} height={496} fill="none" stroke={INK3} strokeWidth={0.4} rx={3} />
      <rect x={18} y={18} width={484} height={484} fill="none" stroke={INK4} strokeWidth={0.3} rx={2} />

      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={200} fill="none" stroke="rgba(200,168,74,0.1)" strokeWidth={0.6} className="svg-pulse" />

      {/* Cross */}
      <g className={`svg-clickable ${selected==='cross'?'selected':''}`} onClick={() => onSelect('cross')}>
        <line x1={cx} y1={cy-150} x2={cx} y2={cy+150} stroke="#5c3f20" strokeWidth={26} strokeLinecap="round" />
        <line x1={cx-150} y1={cy} x2={cx+150} y2={cy} stroke="#5c3f20" strokeWidth={26} strokeLinecap="round" />
      </g>

      {/* Circle */}
      <g className={`svg-clickable ${selected==='circle55'?'selected':''}`} onClick={() => onSelect('circle55')}>
        <circle cx={cx} cy={cy} r={95} fill="none" stroke={GOLD} strokeWidth={16} className="svg-glow" />
      </g>

      {/* Six watchers */}
      <g className={`svg-clickable ${selected==='watchers55'?'selected':''}`} onClick={() => onSelect('watchers55')}>
        {[0,1,2,3,4,5].map(i => {
          const a = (i/6)*Math.PI*2 - Math.PI/2
          const wx = cx+Math.cos(a)*185, wy = cy+Math.sin(a)*185
          return <g key={`w55-${i}`}>
            <circle cx={wx} cy={wy} r={18} fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={0.7} />
            <circle cx={wx} cy={wy} r={8} fill="rgba(26,18,8,0.1)" stroke={INK2} strokeWidth={0.4} />
            <line x1={wx-Math.cos(a)*18} y1={wy-Math.sin(a)*18} x2={cx+Math.cos(a)*100} y2={cy+Math.sin(a)*100} stroke={INK4} strokeWidth={0.4} strokeDasharray="3,2" />
            <text x={wx} y={wy+3} fontSize={9} textAnchor="middle" fill={INK2}>\u2629</text>
          </g>
        })}
      </g>

      {/* Cipher marker */}
      <g className={`svg-clickable ${selected==='cipher'?'selected':''}`} onClick={() => onSelect('cipher')}>
        <rect x={cx-40} y={cy-16} width={80} height={32} fill="rgba(26,18,8,0.08)" stroke={GOLD} strokeWidth={0.8} rx={2} />
        <text x={cx} y={cy+4} fontSize={10} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fill={GOLD} letterSpacing="0.1em">CIPHER</text>
      </g>

      {/* Labels */}
      <text x={cx} y={30} fontSize={7.5} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.12em">THE 55TH TREASURY \u2014 CROSS-AND-CIRCLE SEAL</text>
      <text x={cx} y={500} fontSize={8} textAnchor="middle" fontStyle="italic" fill={INK2}>Seal yourselves with this seal while the cipher is in your hand</text>
    </svg>
  )
}

function Treasury58Diagram({ selected, onSelect }: { selected: string | null, onSelect: (id: string) => void }) {
  const cx = 260, cy = 260

  return (
    <svg viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg">
      {/* Frame */}
      <rect x={12} y={12} width={496} height={496} fill="none" stroke={INK3} strokeWidth={0.4} rx={3} />
      <rect x={18} y={18} width={484} height={484} fill="none" stroke={INK4} strokeWidth={0.3} rx={2} />

      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={210} fill="none" stroke="rgba(200,168,74,0.08)" strokeWidth={0.5} className="svg-rotate" />

      {/* Outer circle */}
      <g className={`svg-clickable ${selected==='outer58'?'selected':''}`} onClick={() => onSelect('outer58')}>
        <circle cx={cx} cy={cy} r={155} fill="none" stroke="#5c3f20" strokeWidth={18} className="svg-glow" />
        {/* Aeon names around outer ring */}
        {['Harmozel','Oroiael','Daveithe','Eleleth','Gamaliel','Gabriel','Samblo','Abrasax','Iaoth','Sabaoth','Adonaios','Sabaoth II'].map((name, i) => {
          const a = (i/12)*Math.PI*2 - Math.PI/2
          const lx = cx+Math.cos(a)*155, ly = cy+Math.sin(a)*155
          const la = a*(180/Math.PI)+90
          return <text key={`aeon-${i}`} x={lx} y={ly} fontSize={6} textAnchor="middle" dominantBaseline="central"
            fill={INK2} fontFamily={CINZEL} letterSpacing="0.04em" transform={`rotate(${la},${lx},${ly})`}>{name}</text>
        })}
      </g>

      {/* Inner ring */}
      <g className={`svg-clickable ${selected==='inner58'?'selected':''}`} onClick={() => onSelect('inner58')}>
        <circle cx={cx} cy={cy} r={105} fill="none" stroke={GOLD} strokeWidth={14} />
        <circle cx={cx} cy={cy} r={95} fill="rgba(26,18,8,0.03)" stroke={INK2} strokeWidth={0.4} />
      </g>

      {/* Twelve rays */}
      <g className={`svg-clickable ${selected==='rays58'?'selected':''}`} onClick={() => onSelect('rays58')}>
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
          const a = i*30*Math.PI/180
          const x1 = cx+Math.cos(a)*105, y1 = cy+Math.sin(a)*105
          const x2 = cx+Math.cos(a)*170, y2 = cy+Math.sin(a)*170
          return <line key={`ray-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
        })}
      </g>

      {/* Rotation symbol */}
      <g className={`svg-clickable ${selected==='rotation'?'selected':''}`} onClick={() => onSelect('rotation')}>
        <circle cx={cx} cy={cy} r={50} fill="rgba(26,18,8,0.06)" stroke={INK} strokeWidth={0.8} className="svg-glow" />
        <text x={cx} y={cy-6} fontSize={8} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} letterSpacing="0.08em">THE</text>
        <text x={cx} y={cy+8} fontSize={8} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} letterSpacing="0.08em">WHEEL</text>
        <text x={cx} y={cy+22} fontSize={7} textAnchor="middle" fontStyle="italic" fill={INK2}>\u03a0\u03b5\u03c1\u03b9\u03c3\u03c4\u03c1\u03bf\u03c6\u03ae</text>
      </g>

      {/* Labels */}
      <text x={cx} y={30} fontSize={7.5} textAnchor="middle" fontFamily={CINZEL} fill={INK3} letterSpacing="0.12em">THE 58TH TREASURY \u2014 WHEEL OF EMANATION</text>
      <text x={cx} y={500} fontSize={8} textAnchor="middle" fontStyle="italic" fill={INK2}>Invoke the name three times while tracing the wheel upon the air</text>
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
  const particles = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 12 + Math.random() * 18,
    size: 1 + Math.random() * 3,
  })), [])

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div className="particle-field">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
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
      "\u2c81\u2c93\u2c71\u2c81\u2c65\u2c74 \u2c01\u2c2b\u2c71\u2c01\u2c25\u2c1f\u2c25\u2c1d",
      "\u2c2b\u2c71\u2c65 \u2c3d\u2c4b\u2c65 \u2c71\u2c71\u2c65 \u2c3a\u2c01\u2c65\u2c71\u2c13\u2c53\u2c17",
      "\u2c71\u2c65\u2c2d\u2c71\u2c65\u2c1d",
      "\u2c5f\u2c71\u2c65\u2c71\u2c65\u2c19\u2c71",
      "\u2c71\u2c3d\u2c3d\u2c01\u2c65\u2c01",
      "\u2c3d\u2c01\u2c71\u2c01\u2c01\u2c65\u2c4b",
      "\u2c71\u2c3d\u2c01\u2c3d\u2c4b\u2c71\u2c3d",
      "\u2c71\u2c2b\u2c01\u2c3a\u2c71\u2c71\u2c3d",
      "\u2c3d\u2c71\u2c13\u2c71\u2c19\u2c4b\u2c17\u2c13",
      "\u2c3d\u2c71\u2c01\u2c2b\u2c01\u2c3d\u2c13"
    ]
    let i = 0
    const interval = setInterval(() => {
      setChantText(names[i])
      i++
      if (i >= names.length) {
        clearInterval(interval)
        setTimeout(() => {
          setIsChanting(false)
          setChantText('')
        }, 1200)
      }
    }, 800)
  }, [isChanting])

  const selectedHotspot = page.hotspots.find(h => h.id === selectedHs)

  return (
    <div className="treasury-app">
      <Particles />

      {/* Top Roller */}
      <div className="roller">
        <span className="roller-text">CODEX BRUCIANUS \u00b7 BODLEIAN LIBRARY OXFORD \u00b7 MS BRUCE 96</span>
      </div>

      {/* Header */}
      <header className="treasury-header">
        <div className="greek-subtitle">\u0392\u03af\u03b2\u03bb\u03bf\u03c2 \u03c4\u03bf\u1fe6 \u1f38\u03b5\u03cd \u2014 Sacred Diagrams of the Pleroma</div>
        <h1>The Book of Jeu</h1>
      </header>

      {/* Navigation */}
      <nav className="treasury-nav">
        {PAGES.map((p, i) => (
          <button
            key={p.id}
            className={`nav-btn ${i === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {p.nav}
          </button>
        ))}
      </nav>

      {/* Main Layout */}
      <div className="treasury-layout">
        <div className="main-col" ref={mainRef}>
          {/* Page Header */}
          <div className="page-header">
            <div className="divider-line"><span>\u2726</span></div>
            <h2>{page.title}</h2>
            <div className="page-ref">{page.ref}</div>
            <div className="divider-line"><span>\u2726</span></div>
          </div>

          {/* Interactive Diagram */}
          <div className="diagram-wrap">
            <TreasuryDiagramRenderer
              pageId={page.id}
              selected={selectedHs}
              onSelect={handleSelectHs}
            />
          </div>

          {/* Chant Button */}
          <button
            className={`chant-btn ${isChanting ? 'chanting' : ''}`}
            onClick={chantSacredNames}
            disabled={isChanting}
          >
            {isChanting ? (
              <>\u2726 {chantText || 'CHANTING...'} \u2726</>
            ) : (
              <>\u2726 CHANT THE SACRED NAMES \u2726</>
            )}
          </button>

          {/* Lore Section */}
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

        {/* Side Column */}
        <div className="side-col">
          {/* Context */}
          <div className="side-section">
            <h3>Context</h3>
            <p>{page.desc}</p>
          </div>

          {/* Sacred Elements */}
          <div className="side-section">
            <h3>Sacred Elements</h3>
            <div className="hs-list">
              {page.hotspots.map(hs => (
                <div
                  key={hs.id}
                  className={`hs-item ${selectedHs === hs.id ? 'selected' : ''}`}
                  data-id={hs.id}
                  onClick={() => handleSelectHs(hs.id)}
                >
                  <span className="hs-name">{hs.label}</span>
                  <span className="hs-brief">{hs.brief}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revelation */}
          <div className="side-section">
            <h3>Revelation</h3>
            <div
              ref={revRef}
              className={`revelation ${selectedHs ? 'revealed' : ''}`}
            >
              {selectedHotspot ? (
                <>
                  <span className="rev-label">\u2014 Hidden Teaching \u2014</span>
                  <span className="rev-title">{selectedHotspot.label}</span>
                  <span className="rev-detail">{selectedHotspot.detail}</span>
                </>
              ) : (
                <>
                  <span className="rev-label">\u2014</span>
                  Click upon any element within the diagram to receive its hidden teaching.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Roller */}
      <div className="roller">
        <span className="roller-text">\u0392\u03af\u03b2\u03bb\u03bf\u03c2 \u03c4\u03bf\u1fe6 \u1f38\u03b5\u03cd \u00b7 THE TWO BOOKS OF JEU</span>
      </div>
    </div>
  )
}
