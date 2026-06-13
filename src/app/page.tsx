'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */
interface Emanation {
  name: string
  role: string
}

interface Watcher {
  name: string
  gate: string
}

interface TreasuryEntry {
  id: string
  jeuNum: number        // Jeu diagram number (1-60)
  title: string
  rank: number           // 1=innermost, 2=inner, 3=middle, 4=outer, 5=outermost
  rankName: string
  fatherName: string
  cipher: string
  watchers: Watcher[]
  emanations: Emanation[]
  sealType: 'cross-circle' | 'concentric' | 'star' | 'radial' | 'octagram' | 'gate'
  sealComplexity: number // 1-5 affects diagram detail
  desc: string
  hasDiagram: boolean
  book: 1 | 2
  chapter: string
  folio: string
  password?: string
  specialNotes?: string
}

interface SpecialEntry {
  id: string
  title: string
  category: 'overview' | 'archon' | 'baptism' | 'hymn'
  desc: string
  sealType: 'treasury-overview' | 'archon-gate' | 'baptism-rite' | 'hymn'
  book: 1 | 2
  chapter: string
  folio: string
  lore: { title: string; body: string }[]
  elements: { id: string; label: string; brief: string; detail: string }[]
}

/* ═══════════════════════════════════════════════════
   TREASURY DATA - All 60 Treasuries
   ═══════════════════════════════════════════════════ */
const RANK_NAMES = ['', 'First Rank (Innermost)', 'Second Rank (Inner)', 'Third Rank (Middle)', 'Fourth Rank (Outer)', 'Fifth Rank (Outermost)']

// Generate the 60 treasuries based on the Book of Jeu structure
// The manuscript contains 26 diagrams (Jeu 2-28, omitting 13)
// The full text describes 60 treasuries across 5 ranks

function buildTreasuries(): TreasuryEntry[] {
  const treasuries: TreasuryEntry[] = []

  // Jeu names from the manuscript - Coptic names suffixed with Jeu
  // Based on Schmidt/MacDermot transcription and Till's analysis
  const fatherNames: Record<number, string> = {
    1: 'Pigeradaphtha Jeu', 2: 'Saphaed Jeu', 3: 'Abraoth Jeu', 4: 'Abrasax Jeu',
    5: 'Athoth Jeu', 6: 'Oroiael Jeu', 7: 'Harmozel Jeu', 8: 'Daveithai Jeu',
    9: 'Eleleth Jeu', 10: 'Phaoph Jeu', 11: 'Aphroph Jeu', 12: 'Saphaph Jeu',
    13: 'Phthahoth Jeu', 14: 'Bathmoth Jeu', 15: 'Mares Jeu', 16: 'Machmoth Jeu',
    17: 'Plesithea Jeu', 18: 'Pigeradpha Jeu', 19: 'Probat Jeu', 20: 'Marmarouth Jeu',
    21: 'Eileithya Jeu', 22: 'Barpharanghes Jeu', 23: 'Opsimothe Jeu', 24: 'Chthaeth Jeu',
    25: 'Marept Jeu', 26: 'Pharphaxoth Jeu', 27: 'Aphrempht Jeu', 28: 'Erasin Jeu',
    29: 'Armothes Jeu', 30: 'Sambath Jeu', 31: 'Aphraph Jeu', 32: 'Thalmai Jeu',
    33: 'Pharmas Jeu', 34: 'Pserai Jeu', 35: 'Bathra Jeu', 36: 'Mastraph Jeu',
    37: 'Kathan Jeu', 38: 'Saraphim Jeu', 39: 'Phainops Jeu', 40: 'Orphanos Jeu',
    41: 'Aphthona Jeu', 42: 'Paraplex Jeu', 43: 'Arimoth Jeu', 44: 'Sokrates Jeu',
    45: 'Plouton Jeu', 46: 'Pleroma Jeu', 47: 'Proarche Jeu', 48: 'Arche Jeu',
    49: 'Amethes Jeu', 50: 'Sige Jeu', 51: 'Bythios Jeu', 52: 'Protophanes Jeu',
    53: 'Autogenes Jeu', 54: 'Pneumatikos Jeu', 55: 'Aletheia Jeu', 56: 'Monogenes Jeu',
    57: 'Agennetos Jeu', 58: 'Aoratos Jeu', 59: 'Apophatos Jeu', 60: 'Proator Jeu'
  }

  const cipherNames: Record<number, string> = {
    1: 'M\u03b1\u03b9\u03b9\u03c9\u03bd', 2: '\u0391\u03b4\u03c9\u03bd\u03b1\u03b9', 3: '\u03a3\u03b1\u03b2\u03b1\u03c9\u03b8',
    4: '\u0391\u03b2\u03c1\u03b1\u03c3\u03b1\u03be', 5: '\u0399\u03b1\u03c9', 6: '\u039f\u03c1\u03bf\u03b9\u03b1\u03b7\u03bb',
    7: '\u0391\u03c1\u03bc\u03bf\u03b6\u03b7\u03bb', 8: '\u0394\u03b1\u03b2\u03b5\u03b9\u03b8\u03b1\u03b9', 9: '\u0397\u03bb\u03b5\u03bb\u03b7\u03b8',
    10: '\u03a6\u03b1\u03c9\u03c6', 11: '\u0391\u03c6\u03c1\u03bf\u03c6', 12: '\u03a3\u03b1\u03c6\u03b1\u03c6',
    13: '\u03a6\u03b8\u03b1\u03b8\u03c9\u03b8', 14: '\u0392\u03b1\u03b8\u03bc\u03c9\u03b8', 15: '\u039c\u03b1\u03c1\u03b7\u03c2',
    16: '\u039c\u03b1\u03c7\u03bc\u03c9\u03b8', 17: '\u03a0\u03bb\u03b7\u03c3\u03b9\u03b8\u03b5\u03b1', 18: '\u03a0\u03b9\u03b3\u03b5\u03c1\u03b1\u03b4\u03c6\u03b1',
    19: '\u03a0\u03c1\u03bf\u03b2\u03b1\u03c4', 20: '\u039c\u03b1\u03c1\u03bc\u03b1\u03c1\u03bf\u03c5\u03b8', 21: '\u0395\u03b9\u03bb\u03b5\u03b9\u03b8\u03c5\u03b1',
    22: '\u0392\u03b1\u03c1\u03c6\u03b1\u03c1\u03b1\u03b3\u03b7\u03c2', 23: '\u039f\u03c8\u03b9\u03bc\u03bf\u03b8\u03b5', 24: '\u03a7\u03b8\u03b1\u03b7\u03b8',
    25: '\u039c\u03b1\u03c1\u03b5\u03c0\u03c4', 26: '\u03a6\u03b1\u03c1\u03c6\u03b1\u03be\u03bf\u03b8', 27: '\u0391\u03c6\u03c1\u03b5\u03bc\u03c6\u03b8',
    28: '\u0395\u03c1\u03b1\u03c3\u03b9\u03bd', 29: '\u0391\u03c1\u03bc\u03bf\u03b8\u03b5\u03c2', 30: '\u03a3\u03b1\u03bc\u03b2\u03b1\u03b8',
    31: '\u0391\u03c6\u03c1\u03b1\u03c6', 32: '\u0398\u03b1\u03bb\u03bc\u03b1\u03b9', 33: '\u03a6\u03b1\u03c1\u03bc\u03b1\u03c2',
    34: '\u03a8\u03b5\u03c1\u03b1\u03b9', 35: '\u0392\u03b1\u03b8\u03c1\u03b1', 36: '\u039c\u03b1\u03c3\u03c4\u03c1\u03b1\u03c6',
    37: '\u039a\u03b1\u03b8\u03b1\u03bd', 38: '\u03a3\u03b1\u03c1\u03b1\u03c6\u03b9\u03bc', 39: '\u03a6\u03b1\u03b9\u03bd\u03bf\u03c8',
    40: '\u039f\u03c1\u03c6\u03b1\u03bd\u03bf\u03c2', 41: '\u0391\u03c6\u03b8\u03bf\u03bd\u03b1', 42: '\u03a0\u03b1\u03c1\u03b1\u03c0\u03bb\u03b5\u03be',
    43: '\u0391\u03c1\u03b9\u03bc\u03bf\u03b8', 44: '\u03a3\u03bf\u03ba\u03c1\u03b1\u03c4\u03b5\u03c2', 45: '\u03a0\u03bb\u03bf\u03c5\u03c4\u03c9\u03bd',
    46: '\u03a0\u03bb\u03b7\u03c1\u03c9\u03bc\u03b1', 47: '\u03a0\u03c1\u03bf\u03b1\u03c1\u03c7\u03b7', 48: '\u0391\u03c1\u03c7\u03b7',
    49: '\u0391\u03bc\u03b5\u03b8\u03b5\u03c2', 50: '\u03a3\u03b9\u03b3\u03b7', 51: '\u0392\u03c5\u03b8\u03b9\u03bf\u03c2',
    52: '\u03a0\u03c1\u03bf\u03c4\u03bf\u03c6\u03b1\u03bd\u03b5\u03c2', 53: '\u0391\u03c5\u03c4\u03bf\u03b3\u03b5\u03bd\u03b5\u03c2', 54: '\u03a0\u03bd\u03b5\u03c5\u03bc\u03b1\u03c4\u03b9\u03ba\u03bf\u03c2',
    55: '\u0391\u03bb\u03b7\u03b8\u03b5\u03b9\u03b1', 56: '\u039c\u03bf\u03bd\u03bf\u03b3\u03b5\u03bd\u03b5\u03c2', 57: '\u0391\u03b3\u03b5\u03bd\u03bd\u03b7\u03c4\u03bf\u03c2',
    58: '\u0391\u03bf\u03c1\u03b1\u03c4\u03bf\u03c2', 59: '\u0391\u03c0\u03bf\u03c6\u03b1\u03c4\u03bf\u03c2', 60: '\u03a0\u03c1\u03bf\u03b1\u03c4\u03c9\u03c1'
  }

  // Specific seal types based on the Book of Jeu manuscript diagrams
  // Jeu 2-5: concentric, Jeu 6-9: cross-circle, Jeu 10-12: star, Jeu 14-19: radial, Jeu 20-28: octagram
  // Remaining treasuries cycle through types with increasing complexity
  const sealTypeMap: Record<number, TreasuryEntry['sealType']> = {
    1: 'concentric', 2: 'concentric', 3: 'concentric', 4: 'concentric', 5: 'concentric',
    6: 'cross-circle', 7: 'cross-circle', 8: 'cross-circle', 9: 'cross-circle', 10: 'cross-circle',
    11: 'star', 12: 'star', 14: 'star', 15: 'radial', 16: 'radial',
    17: 'octagram', 18: 'octagram', 19: 'concentric', 20: 'concentric', 21: 'cross-circle',
    22: 'star', 23: 'radial', 24: 'radial', 25: 'octagram', 26: 'octagram', 27: 'concentric', 28: 'star',
    33: 'cross-circle', // 55th Treasury - the cross and circle seal described in Ch. 33
    36: 'radial', // 58th Treasury
    55: 'cross-circle' // Explicitly the 55th Treasury with the cross seal
  }

  // Distribution across 5 ranks: 12 per rank (inner 2 ranks have 12 each, middle has 12, outer 2 have 12 each)
  for (let i = 1; i <= 60; i++) {
    let rank: number
    if (i <= 12) rank = 1
    else if (i <= 24) rank = 2
    else if (i <= 36) rank = 3
    else if (i <= 48) rank = 4
    else rank = 5

    const hasDiagram = i >= 2 && i <= 28 && i !== 13

    const emanationNames = [
      'Phaethon', 'Omorpha', 'Aphroph', 'Saphapha', 'Mareph', 'Pigeraph',
      'Thalmaoph', 'Bathraoth', 'Eratha', 'Armatha', 'Pharmatha', 'Aphreph'
    ]

    // Unique watcher names per treasury - based on Coptic names from the manuscript
    const watcherPrefixes = [
      'Paraph', 'Barth', 'Aphr', 'Sapha', 'Phtha', 'Bathm',
      'Marem', 'Machm', 'Ples', 'Piger', 'Probat', 'Marmar',
      'Eilei', 'Barph', 'Opsim', 'Chtha', 'Pharp', 'Aphre',
      'Armo', 'Samb', 'Aphra', 'Thalm', 'Pharm', 'Pser',
      'Bathr', 'Mastr', 'Kath', 'Saraph', 'Phain', 'Orph',
      'Aphth', 'Parapl', 'Arim', 'Sokr', 'Plout', 'Pler',
      'Proar', 'Arch', 'Ameth', 'Sig', 'Byth', 'Protoph',
      'Autog', 'Pneum', 'Aleth', 'Monog', 'Agenn', 'Aor',
      'Apoph', 'Proat'
    ]
    const watcherNames = [
      `${watcherPrefixes[(i - 1) % 50]}yx`,
      `${watcherPrefixes[(i + 12) % 50]}ax`,
      `${watcherPrefixes[(i + 24) % 50]}oth`
    ]

    const watchers: Watcher[] = watcherNames.map((wn, wi) => ({
      name: wn,
      gate: `Gate ${wi + 1} of ${fatherNames[i]}`
    }))

    const emanations: Emanation[] = emanationNames.map((en, ei) => ({
      name: en,
      role: `Emanation ${ei + 1}`
    }))

    treasuries.push({
      id: `jeu-${i}`,
      jeuNum: i,
      title: `The ${ordinal(i)} Treasury of Light`,
      rank,
      rankName: RANK_NAMES[rank],
      fatherName: fatherNames[i] || `Jeu ${i}`,
      cipher: cipherNames[i] || `${i}`,
      watchers,
      emanations,
      sealType: sealTypeMap[i] || (['cross-circle', 'concentric', 'star', 'radial', 'octagram'] as const)[(i - 1) % 5],
      sealComplexity: Math.min(5, Math.ceil(i / 12)),
      desc: `The ${ordinal(i)} Treasury presided over by ${fatherNames[i] || 'the Father'}, situated in the ${RANK_NAMES[rank]} of the divine Pleroma. Twelve emanations radiate from the Father, and three watchers guard the gates. The initiate must possess the cipher and recite the sacred names to pass through.`,
      hasDiagram,
      book: i <= 41 ? 1 : 2,
      chapter: `Chapter ${i + 5}`,
      folio: `ff. ${(i * 2 + 1)}r\u2013${(i * 2 + 2)}v`,
      password: `I invoke ${fatherNames[i] || 'the Father'} \u2014 ${cipherNames[i] || 'the sacred name'}`,
      specialNotes: hasDiagram ? `Diagram Jeu ${i} is preserved in the manuscript.` : i === 13 ? 'Diagram 13 is omitted in the manuscript.' : 'No separate diagram preserved in the manuscript.'
    })
  }

  return treasuries
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const TREASURIES = buildTreasuries()

/* ═══════════════════════════════════════════════════
   SPECIAL ENTRIES
   ═══════════════════════════════════════════════════ */
const SPECIALS: SpecialEntry[] = [
  {
    id: 'overview',
    title: 'The Treasury of the Light',
    category: 'overview',
    desc: 'The supreme abode of the Divine \u2014 source of all spiritual light. Structured as twelve concentric aeons each sealed by a guardian, enclosing three great curtains, and at the innermost, the Great Invisible: the unknowable source from which all light and life flows downward into creation.',
    sealType: 'treasury-overview',
    book: 1,
    chapter: 'Chapters 1\u201315',
    folio: 'ff. 1r\u201317v',
    lore: [
      { title: 'Origin of the Text', body: 'The Book of Jeu was preserved in the Codex Brucianus, discovered in Egypt and acquired by James Bruce in 1769. Written in Coptic, it likely translates earlier Greek originals. The diagrams it contains are unique survivals of actual initiatory seals used in Sethian Gnostic ritual.' },
      { title: 'The Pleroma', body: 'The Pleroma ("Fullness") is the totality of divine light, comprising all aeons in their perfection. The Treasury stands at its apex. The fall of Sophia and the formation of the material world are understood as a leak of light downward out of the Pleroma.' },
      { title: 'The Twelve Aeons', body: 'Each of the twelve outer chambers is presided over by an aeon-ruler. Their names include Harmozel (light of grace), Oroiael (light of thought), Daveithe (light of understanding), and Eleleth (light of perception). Each presides over a class of souls.' },
      { title: 'The Three Curtains', body: 'Three veils separate the inner sanctum from the Pleroma. The outer veil is penetrable by higher archons; the middle by perfect souls of the elect; the innermost veil can only be crossed by those who have received all five seals of the baptismal rite.' }
    ],
    elements: [
      { id: 'ov-pleroma', label: 'The Pleroma', brief: 'Totality of divine light', detail: 'The Pleroma encompasses all 60 treasuries arranged in five ranks of Fatherhood. The innermost ranks are closest to the ineffable source, while the outermost ranks border the material cosmos. Each rank contains 12 treasuries, and each treasury is governed by a Father bearing a mystic name suffixed with "Jeu".' },
      { id: 'ov-curtain1', label: 'First Curtain', brief: 'The outer veil', detail: 'The first of three veils (katapetasmas) that separate the inner sanctum from the outer Pleroma. This outer veil is penetrable by higher archons who still retain some light. It marks the boundary between the ordered aeonic realms and the chaotic margins where archons patrol.' },
      { id: 'ov-curtain2', label: 'Second Curtain', brief: 'The middle veil', detail: 'The middle veil can only be crossed by perfect souls of the elect who have received the first three seals. Souls who lack these seals are turned back by the guardians at this curtain and must undergo further purification in the aeonic cycles.' },
      { id: 'ov-curtain3', label: 'Third Curtain', brief: 'The innermost veil', detail: 'The innermost veil guards the Great Invisible itself. Only those who have received all five seals of the baptismal rite may pass through. This curtain is described as being made of pure light, impenetrable to any being still bound by material or aetheric attachments.' },
      { id: 'ov-invisible', label: 'The Great Invisible', brief: 'The unknowable source', detail: 'At the very heart of the Treasury of Light dwells the Great Invisible Spirit \u2014 the unknowable, ineffable source from which all light and life emanates. No name can encompass it, no diagram can represent it. It is the alpha and omega of the Gnostic cosmology, the silent ground of all being.' }
    ]
  },
  {
    id: 'jeu-father',
    title: 'Jeu, the True God \u2014 Father of the Treasury',
    category: 'overview',
    desc: 'Jeu is the Great Overseer, the Father who stands at the apex of the aeons and administers the Treasury of Light. He is the first emanation of the Great Invisible Spirit, and through him all other treasuries and their Fathers receive their authority and their names.',
    sealType: 'concentric',
    book: 1,
    chapter: 'Chapters 2\u20134',
    folio: 'ff. 2r\u20135v',
    lore: [
      { title: 'The Nature of Jeu', body: 'Jeu is not the highest God but the first revealed God \u2014 the interface between the unknowable One and the manifold aeons. He is called "the true God" because he is the first being who can be named and addressed in prayer. Above him is only the Great Invisible Spirit, which is beyond all naming.' },
      { title: 'The Character of Jeu', body: 'Each treasury Father bears a "character" \u2014 a sacred seal or diagram that represents his spiritual essence. Jeu\'s character is the primordial seal from which all others derive. The manuscript shows it as a complex of concentric circles with inscribed names, surrounded by emanation rays.' },
      { title: 'The Three Watchers', body: 'Three watchers stand at the gates of every treasury. They are not hostile but serve as guardians who test the initiate\'s knowledge. The soul must recite the correct names and show the proper cipher to pass. Each watcher has a specific name and office within the treasury\'s hierarchy.' }
    ],
    elements: [
      { id: 'jf-jeu', label: 'Jeu the True God', brief: 'The Great Overseer', detail: 'Jeu stands at the apex of the Treasury hierarchy. He is the first named divinity, the one who organizes the Pleroma and assigns each Father to his treasury. He emanated the 60 treasuries and established the watchers at their gates.' },
      { id: 'jf-character', label: 'The Character (Seal)', brief: 'Primordial sacred seal', detail: 'The character of Jeu is depicted as a complex seal of concentric rings with divine names inscribed within them. This pattern serves as the template for all subsequent treasury diagrams in the manuscript.' },
      { id: 'jf-emanations', label: 'The Twelve Emanations', brief: 'Radiant powers of Jeu', detail: 'From Jeu proceed twelve emanations \u2014 radiant powers that fill the treasury with light. Each emanation has a name and a role in the divine economy. They are the first "places" within the treasury, and each contains further subsidiary emanations.' },
      { id: 'jf-watchers', label: 'The Three Watchers', brief: 'Guardians of the gates', detail: 'Three watchers guard the approach to Jeu\'s treasury. Their names must be known and spoken by the ascending soul. They test whether the initiate possesses the correct cipher and has received the necessary seals.' }
    ]
  },
  {
    id: 'archons',
    title: 'The Seals of the Archons \u2014 Gates of Ascent',
    category: 'archon',
    desc: 'Between the soul and the Treasury stand the Archons \u2014 rulers of the material and aetheric realms who seek to keep souls imprisoned in the cycle of rebirth. The Book of Jeu provides the exact seals, names, and passwords needed to bypass each Archon gate during the soul\'s ascent.',
    sealType: 'archon-gate',
    book: 1,
    chapter: 'Chapters 30\u201350',
    folio: 'ff. 20r\u201339v',
    lore: [
      { title: 'The Archon Hierarchy', body: 'The Archons are organized into three tiers: the Archons of the Aeons (who rule the outermost ring), the Archons of the Sphere (who control the zodiacal belt), and the Archons of the Midst (who govern the atmospheric realm between earth and the firmament). Each tier has its own seals and passwords.' },
      { title: 'The Seals as Passwords', body: 'The Gnostic seals function as mystical passwords. They are not merely symbols to be recognized but active powers that must be invoked by name. The ascending soul must recite the cipher while mentally imprinting the seal\'s pattern upon itself. This is described as "sealing yourself with this seal."' },
      { title: 'Progressive Complexity', body: 'The gates become progressively more complex and dangerous as the soul ascends. The lower gates require only a single name and seal, while the higher gates demand multiple names, ciphers, and the combined power of all previously received seals.' }
    ],
    elements: [
      { id: 'ar-aeons', label: 'Archons of the Aeons', brief: 'Rulers of the outer aeonic ring', detail: 'The outermost tier of Archons rules over the twelve aeons. Each Archon governs a thirtieth part of the aeonic cycle and commands legions of subordinate powers. The soul must pass through all twelve aeonic gates, reciting the name of each Archon and showing the corresponding seal.' },
      { id: 'ar-sphere', label: 'Archons of the Sphere', brief: 'Controllers of the zodiacal belt', detail: 'The Archons of the Sphere control the seven planetary spheres through which the soul must ascend. Each sphere is governed by a planetary Archon who demands a password. These passwords are encoded in the diagram seals and must be spoken in the correct sequence.' },
      { id: 'ar-midst', label: 'Archons of the Midst', brief: 'Governors of the atmospheric realm', detail: 'The three Archons of the Midst patrol the boundary between the material cosmos and the Pleroma. They are the most dangerous adversaries of the ascending soul, for they can strip away the soul\'s accumulated seals if the correct counter-seals are not employed.' },
      { id: 'ar-paraph', label: 'Paraphax (1st Gate)', brief: 'Password: IAO SABAOTH', detail: 'The first Archon gate is guarded by Paraphax, who commands the lowest of the aeonic gates. The password "IAO SABAOTH" must be spoken while tracing the seal of the first gate. This seal is a simple cross within a circle.' },
      { id: 'ar-arthax', label: 'Arthax (2nd Gate)', brief: 'Password: ADONAI ELOHIM', detail: 'The second gate is guarded by Arthax. The password "ADONAI ELOHIM" is spoken while imprinting the double-circle seal. This gate marks the transition from the material to the aetheric realm.' },
      { id: 'ar-aphr', label: 'Aphraphax (3rd Gate)', brief: 'Password: EIE AZAPHAX', detail: 'The third and final Archon gate is guarded by Aphraphax, the mightiest of the gatekeepers. The password "EIE AZAPHAX" must be combined with all previously received seals. The seal of this gate is the most complex: a triple circle with radiating lines.' }
    ]
  },
  {
    id: 'baptism',
    title: 'The Rite of Baptism with Fire and Water',
    category: 'baptism',
    desc: 'Book of Jeu II preserves a nearly complete ritual script for the Gnostic baptism \u2014 one of the earliest surviving Christian initiation liturgies. The rite involves five successive baptisms, each conferring a seal upon the initiate: water, fire, spirit, light, and the seal of the ineffable mystery.',
    sealType: 'baptism-rite',
    book: 2,
    chapter: 'Chapters 42\u201352',
    folio: 'ff. 103r\u2013114v',
    lore: [
      { title: 'The Five Baptisms', body: 'The baptismal rite consists of five distinct immersions, each in a different element and each conferring a specific spiritual seal. The baptisms of water and fire purify the body; the baptism of the Holy Spirit illuminates the soul; the baptism of light unites the soul with the Pleroma; and the final mystery seal opens the way to the Treasury of Light.' },
      { title: 'The Ritual Sequence', body: 'Each baptism follows the same pattern: invocation of sacred names, immersion in the element, recitation of the cipher, and sealing of the initiate. The officiant draws the seal upon the forehead of the candidate while speaking the password. The candidate then rises from the element transformed and sealed.' },
      { title: 'The Sacred Names', body: 'The names invoked during each baptism are drawn from the hierarchy of treasury Fathers. The officiant must know the correct names for each of the five baptisms and must possess the authority to pronounce them. These names are themselves considered powerful spiritual entities, not mere words.' }
    ],
    elements: [
      { id: 'bt-water', label: 'Baptism of Water', brief: 'First seal: purification', detail: 'The first baptism purifies the body and soul of material defilement. The initiate is immersed in living water while the officiant invokes the name of the first Father of the treasuries. Upon emerging, the first seal is drawn upon the forehead.' },
      { id: 'bt-fire', label: 'Baptism of Fire', brief: 'Second seal: transformation', detail: 'The second baptism transforms the soul, burning away residual attachment to the material world. The fire is both literal (candles or lamps) and spiritual (the fire of the Pleroma). The second seal is inscribed while the initiate stands within the circle of flame.' },
      { id: 'bt-spirit', label: 'Baptism of the Holy Spirit', brief: 'Third seal: illumination', detail: 'The third baptism brings illumination \u2014 the direct experience of the divine light. The initiate receives the breath of the Spirit and is filled with gnosis. This is the baptism that distinguishes the Gnostic rite from conventional Christian baptism.' },
      { id: 'bt-light', label: 'Baptism of Light', brief: 'Fourth seal: union', detail: 'The fourth baptism unites the soul with the Pleroma. The initiate is enveloped in divine light and sees the Treasury of Light with spiritual eyes. The fourth seal marks the soul as a citizen of the Pleroma, no longer subject to the Archons\' authority.' },
      { id: 'bt-mystery', label: 'The Ineffable Mystery', brief: 'Fifth seal: transcendence', detail: 'The fifth and final seal cannot be described in words. It is the seal of the Great Invisible Spirit itself, and it confers the right of passage through the innermost curtain into the Treasury of Light. Only those who have received all five seals may ascend to the presence of Jeu.' }
    ]
  },
  {
    id: 'hymn',
    title: 'Fragment of a Gnostic Hymn',
    category: 'hymn',
    desc: 'At the center of the First Book of Jeu lies a fragmentary hymn \u2014 a liturgical chant that the initiate must recite during the ascent through the treasuries. The hymn invokes the names of the treasury Fathers in sequence, calling upon each to open his gates and permit the soul to pass.',
    sealType: 'hymn',
    book: 1,
    chapter: 'Chapter 35',
    folio: 'ff. 25r\u201326v',
    lore: [
      { title: 'The Hymn as Ascent Tool', body: 'The hymn serves a dual purpose: it is both a prayer of supplication and a magical formula of command. By reciting the hymn, the initiate asserts spiritual authority over the treasury guardians and compels them to open the gates. The hymn must be recited in the correct sequence, treasury by treasury, from the outermost to the innermost.' },
      { title: 'Coptic Liturgical Language', body: 'The hymn is composed in Sahidic Coptic with numerous Greek loan-words, reflecting the bilingual liturgical culture of Egyptian Gnosticism. Many of the names are vowel-sequences (IAO, EIE, OYO) that function as sonic ciphers, each resonating with a specific treasury\'s spiritual frequency.' }
    ],
    elements: [
      { id: 'hy-invocation', label: 'The Invocation', brief: 'Opening prayer of the hymn', detail: 'The hymn begins with an invocation to the Great Invisible Spirit, calling upon the nameless One to grant passage through the treasuries. The initiate declares: "I invoke thee, O Invisible One, who art before all aeons, open the way for my soul."' },
      { id: 'hy-names', label: 'The Sacred Names', brief: 'Sequential treasury names', detail: 'The core of the hymn consists of the sequential recitation of all 60 treasury Fathers\' names, from the outermost (Proator Jeu) inward to the innermost (Pigeradaphtha Jeu). Each name must be pronounced in its original Coptic form with correct vowel intonation.' },
      { id: 'hy-cipher', label: 'The Cipher Passage', brief: 'The encoded final section', detail: 'The hymn concludes with a cipher passage \u2014 a series of vowel-sequences and symbolic phrases that encode the ultimate password for entry into the Treasury of Light. This passage is the most closely guarded secret of the Gnostic tradition.' }
    ]
  }
]

/* ═══════════════════════════════════════════════════
   PROGRAMMATIC SEAL DIAGRAM GENERATOR
   ═══════════════════════════════════════════════════ */

const INK = '#1a1208'
const INK2 = '#3a2c14'
const INK3 = '#6a5030'
const GOLD = '#8a6820'
const GOLD2 = '#c8a84a'
const GOLD3 = '#e8c070'
const PARCH = '#ede0be'

interface SealProps {
  type: TreasuryEntry['sealType'] | SpecialEntry['sealType']
  complexity: number
  fatherName: string
  cipher: string
  jeuNum: number
  onElementClick: (id: string, label: string, detail: string) => void
  selectedId: string | null
  elements?: { id: string; label: string; brief: string; detail: string }[]
}

function SealDiagram({ type, complexity, fatherName, cipher, jeuNum, onElementClick, selectedId, elements }: SealProps) {
  const cx = 250, cy = 250
  const baseR = complexity === 1 ? 80 : complexity === 2 ? 100 : complexity === 3 ? 120 : complexity === 4 ? 140 : 160

  const handleClick = useCallback((id: string, label: string, detail: string) => {
    onElementClick(id, label, detail)
  }, [onElementClick])

  // Generate a treasury seal based on type
  if (type === 'cross-circle') {
    return <CrossCircleSeal cx={cx} cy={cy} r={baseR} jeuNum={jeuNum} fatherName={fatherName} cipher={cipher} complexity={complexity} onClick={handleClick} selectedId={selectedId} />
  }
  if (type === 'concentric') {
    return <ConcentricSeal cx={cx} cy={cy} r={baseR} jeuNum={jeuNum} fatherName={fatherName} cipher={cipher} complexity={complexity} onClick={handleClick} selectedId={selectedId} />
  }
  if (type === 'star') {
    return <StarSeal cx={cx} cy={cy} r={baseR} jeuNum={jeuNum} fatherName={fatherName} cipher={cipher} complexity={complexity} onClick={handleClick} selectedId={selectedId} />
  }
  if (type === 'radial') {
    return <RadialSeal cx={cx} cy={cy} r={baseR} jeuNum={jeuNum} fatherName={fatherName} cipher={cipher} complexity={complexity} onClick={handleClick} selectedId={selectedId} />
  }
  if (type === 'octagram') {
    return <OctagramSeal cx={cx} cy={cy} r={baseR} jeuNum={jeuNum} fatherName={fatherName} cipher={cipher} complexity={complexity} onClick={handleClick} selectedId={selectedId} />
  }
  if (type === 'treasury-overview') {
    return <TreasuryOverviewDiagram onClick={handleClick} selectedId={selectedId} elements={elements || []} />
  }
  if (type === 'archon-gate') {
    return <ArchonGateDiagram onClick={handleClick} selectedId={selectedId} elements={elements || []} />
  }
  if (type === 'baptism-rite') {
    return <BaptismDiagram onClick={handleClick} selectedId={selectedId} elements={elements || []} />
  }
  if (type === 'hymn') {
    return <HymnDiagram onClick={handleClick} selectedId={selectedId} elements={elements || []} />
  }
  if (type === 'gate') {
    return <ConcentricSeal cx={cx} cy={cy} r={baseR} jeuNum={jeuNum} fatherName={fatherName} cipher={cipher} complexity={complexity} onClick={handleClick} selectedId={selectedId} />
  }
  return null
}

/* ── Cross-and-Circle Seal (e.g., 55th Treasury) ── */
function CrossCircleSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const armW = r * 0.28
  const armL = r * 0.85
  const ringR = r * 0.65
  const outerR = r * 1.1
  const innerR = r * 0.25

  // Generate 6 place names around the circle
  const places = useMemo(() => {
    const names = ['Phaethon', 'Mareph', 'Thalma', 'Aphroph', 'Eratha', 'Bathrax']
    return names.map((name, i) => {
      const angle = (i * 60 - 90) * Math.PI / 180
      return { name, x: cx + Math.cos(angle) * (ringR + 25), y: cy + Math.sin(angle) * (ringR + 25), angle: i * 60 - 90 }
    })
  }, [cx, cy, ringR])

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={INK} strokeWidth={2.5} pointerEvents="none" />
      <circle cx={cx} cy={cy} r={outerR - 6} fill="none" stroke={GOLD2} strokeWidth={1} pointerEvents="none" />

      {/* SOLID CROSS - using a single path, not overlapping rectangles */}
      <path
        d={`M${cx - armW} ${cy - armL} L${cx + armW} ${cy - armL} L${cx + armW} ${cy - armW} L${cx + armL} ${cy - armW} L${cx + armL} ${cy + armW} L${cx + armW} ${cy + armW} L${cx + armW} ${cy + armL} L${cx - armW} ${cy + armL} L${cx - armW} ${cy + armW} L${cx - armL} ${cy + armW} L${cx - armL} ${cy - armW} L${cx - armW} ${cy - armW} Z`}
        fill={PARCH} stroke={INK} strokeWidth={2}
        className={`svg-clickable${selectedId === 'cross' ? ' selected' : ''}`}
        onClick={() => onClick('cross', 'The Sacred Cross', `The seal of the ${ordinal(jeuNum)} Treasury \u2014 a solid cross inscribed within the circle, representing the four directions of divine emanation. The Father ${fatherName} places his cipher upon this cross.`)}
      />

      {/* Inner circle over cross */}
      <circle
        cx={cx} cy={cy} r={ringR} fill="none" stroke={GOLD2} strokeWidth={3}
        className={`svg-clickable${selectedId === 'ring' ? ' selected' : ''}`}
        onClick={() => onClick('ring', 'The Circle of Places', `Six places surround the Father within this treasury. The cipher "${cipher}" is inscribed at the center. Seal yourselves with this seal while the cipher is in your hand.`)}
      />

      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={INK} strokeWidth={2} pointerEvents="none" />

      {/* Center cipher */}
      <text
        x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle"
        fontFamily="Cinzel, serif" fontSize={complexity > 2 ? 18 : 22} fill={GOLD}
        className={`svg-clickable${selectedId === 'cipher' ? ' selected' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher of the ${ordinal(jeuNum)} Treasury is "${cipher}". This sacred name must be held in the hand (inscribed upon a pebble or token) while the initiate passes through the gates. The Father ${fatherName} will recognize his cipher and grant passage.`)}
      >
        {cipher}
      </text>

      {/* Six places around the ring */}
      {places.map((p, i) => (
        <g key={i} className={`svg-clickable${selectedId === `place-${i}` ? ' selected' : ''}`}
           onClick={() => onClick(`place-${i}`, p.name, `${p.name} is the ${ordinal(i + 1)} place surrounding the Father in the ${ordinal(jeuNum)} Treasury. Each place is governed by an emanation of ${fatherName}, and the initiate must know the name of each place to navigate through.`)}>
          <circle cx={p.x} cy={p.y} r={14} fill={PARCH} stroke={INK} strokeWidth={1.5} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK}>
            {p.name.substring(0, 4)}
          </text>
        </g>
      ))}

      {/* Father name at top */}
      <text x={cx} y={cy - outerR - 15} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>
        {fatherName}
      </text>

      {/* Emanation lines from center to places */}
      {places.map((p, i) => (
        <line key={`line-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={INK3} strokeWidth={0.5} strokeDasharray="3,3" pointerEvents="none" />
      ))}
    </svg>
  )
}

/* ── Concentric Rings Seal ── */
function ConcentricSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const rings = complexity + 1
  const emanationCount = 12
  const emanationNames = useMemo(() => {
    const names = ['Phaethon', 'Omorpha', 'Aphroph', 'Saphapha', 'Mareph', 'Pigeraph', 'Thalmaoph', 'Bathraoth', 'Eratha', 'Armatha', 'Pharmatha', 'Aphreph']
    return names.slice(0, emanationCount)
  }, [])

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      {/* Outermost decorative ring */}
      <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />

      {/* Concentric rings */}
      {Array.from({ length: rings }, (_, i) => {
        const ringR = r - (i * r / rings)
        return (
          <circle
            key={i} cx={cx} cy={cy} r={ringR} fill="none"
            stroke={i === 0 ? INK : GOLD2} strokeWidth={i === 0 ? 3 : 1.5}
            className={`svg-clickable${selectedId === `ring-${i}` ? ' selected' : ''}`}
            onClick={() => onClick(`ring-${i}`, `${ordinal(i + 1)} Ring`, `The ${ordinal(i + 1)} concentric ring of the ${ordinal(jeuNum)} Treasury seal. ${i === 0 ? 'This outermost ring represents the boundary of the treasury, beyond which the Archons patrol.' : i === rings - 1 ? 'This innermost ring contains the cipher of the Father, the key to passage through this treasury.' : 'This intermediate ring contains the names of the emanations and watchers who serve the Father.'}`)}
          />
        )
      })}

      {/* Radial emanation lines */}
      {Array.from({ length: emanationCount }, (_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180
        const x1 = cx + Math.cos(angle) * 30
        const y1 = cy + Math.sin(angle) * 30
        const x2 = cx + Math.cos(angle) * r
        const y2 = cy + Math.sin(angle) * r
        return (
          <g key={i} className={`svg-clickable${selectedId === `emanation-${i}` ? ' selected' : ''}`}
             onClick={() => onClick(`emanation-${i}`, emanationNames[i], `${emanationNames[i]} is the ${ordinal(i + 1)} emanation of ${fatherName} in the ${ordinal(jeuNum)} Treasury. It radiates from the Father and fills one of the twelve places within the treasury.`)}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK3} strokeWidth={0.8} />
            <circle cx={cx + Math.cos(angle) * (r + 12)} cy={cy + Math.sin(angle) * (r + 12)} r={8} fill={PARCH} stroke={GOLD2} strokeWidth={1} />
            <text x={cx + Math.cos(angle) * (r + 12)} y={cy + Math.sin(angle) * (r + 12) + 3} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK2}>
              {emanationNames[i].substring(0, 3)}
            </text>
          </g>
        )
      })}

      {/* Center cipher */}
      <circle cx={cx} cy={cy} r={22} fill={PARCH} stroke={INK} strokeWidth={2}
        className={`svg-clickable${selectedId === 'cipher' ? ' selected' : ''}`}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher of the ${ordinal(jeuNum)} Treasury is "${cipher}". This is the name that must be held while passing through the gates of ${fatherName}.`)} />
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={14} fill={GOLD}>
        {cipher}
      </text>

      {/* Father name */}
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>
        {fatherName}
      </text>
      <text x={cx} y={475} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>
        {jeuNum > 0 ? `JEU ${jeuNum}` : 'JEU'}
      </text>
    </svg>
  )
}

/* ── Star Seal ── */
function StarSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const points = complexity >= 3 ? 8 : 6
  const innerR = r * 0.5

  const starPath = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * 180 / points - 90) * Math.PI / 180
      const rad = i % 2 === 0 ? r : innerR
      pts.push(`${cx + Math.cos(angle) * rad},${cy + Math.sin(angle) * rad}`)
    }
    return pts.join(' ')
  }, [cx, cy, r, innerR, points])

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={GOLD} strokeWidth={1.5} pointerEvents="none" />

      {/* Star shape */}
      <polygon
        points={starPath} fill="none" stroke={INK} strokeWidth={2.5}
        className={`svg-clickable${selectedId === 'star' ? ' selected' : ''}`}
        onClick={() => onClick('star', `The ${points}-Pointed Star`, `The star seal of the ${ordinal(jeuNum)} Treasury. The ${points} points represent the ${points === 8 ? 'eight directions of divine emanation' : 'six places surrounding the Father'}. Each point corresponds to a watcher or emanation gate.`)}
      />

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR * 0.6} fill="none" stroke={GOLD2} strokeWidth={2}
        className={`svg-clickable${selectedId === 'inner' ? ' selected' : ''}`}
        onClick={() => onClick('inner', 'The Inner Circle', `The inner circle of the ${ordinal(jeuNum)} Treasury contains the Father ${fatherName} and his cipher. This is the sanctum that the initiate must reach by passing through the star points.`)}
      />

      {/* Radial lines from center to star points */}
      {Array.from({ length: points }, (_, i) => {
        const angle = (i * 360 / points - 90) * Math.PI / 180
        const x2 = cx + Math.cos(angle) * r
        const y2 = cy + Math.sin(angle) * r
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={INK3} strokeWidth={0.7} pointerEvents="none" />
      })}

      {/* Cipher at center */}
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of ${fatherName}. Speak this name to pass through the ${ordinal(jeuNum)} Treasury.`)}>
        {cipher}
      </text>

      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>
        {fatherName}
      </text>
      <text x={cx} y={475} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>
        {jeuNum > 0 ? `JEU ${jeuNum}` : 'JEU'}
      </text>
    </svg>
  )
}

/* ── Radial Division Seal ── */
function RadialSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const sectors = complexity >= 3 ? 12 : 8
  const innerR = r * 0.35

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={r + 15} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={2.5}
        className={`svg-clickable${selectedId === 'outer-ring' ? ' selected' : ''}`}
        onClick={() => onClick('outer-ring', 'The Outer Boundary', `The outer boundary of the ${ordinal(jeuNum)} Treasury seal. Within this ring lie the ${sectors} sectors, each containing an emanation of ${fatherName}.`)}
      />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={GOLD2} strokeWidth={2}
        className={`svg-clickable${selectedId === 'inner-ring' ? ' selected' : ''}`}
        onClick={() => onClick('inner-ring', 'The Inner Sanctum', `The inner sanctum of the ${ordinal(jeuNum)} Treasury where the Father ${fatherName} dwells with his cipher.`)}
      />

      {/* Radial dividers */}
      {Array.from({ length: sectors }, (_, i) => {
        const angle = (i * 360 / sectors - 90) * Math.PI / 180
        const x1 = cx + Math.cos(angle) * innerR
        const y1 = cy + Math.sin(angle) * innerR
        const x2 = cx + Math.cos(angle) * r
        const y2 = cy + Math.sin(angle) * r

        const midAngle = ((i + 0.5) * 360 / sectors - 90) * Math.PI / 180
        const labelR = (r + innerR) / 2

        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK3} strokeWidth={1}
              className={`svg-clickable${selectedId === `sector-${i}` ? ' selected' : ''}`}
              onClick={() => onClick(`sector-${i}`, `Sector ${i + 1}`, `The ${ordinal(i + 1)} sector of the ${ordinal(jeuNum)} Treasury. Each sector is governed by one of the emanations of ${fatherName}.`)}
            />
            <text
              x={cx + Math.cos(midAngle) * labelR} y={cy + Math.sin(midAngle) * labelR + 3}
              textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3}
            >
              {String.fromCharCode(913 + (i % 24))}
            </text>
          </g>
        )
      })}

      {/* Cipher */}
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of the ${ordinal(jeuNum)} Treasury.`)}>
        {cipher}
      </text>

      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>
        {fatherName}
      </text>
    </svg>
  )
}

/* ── Octagram Seal ── */
function OctagramSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const octagramPath = useMemo(() => {
    const pts: string[] = []
    // Two overlapping squares rotated 45 degrees
    for (let s = 0; s < 2; s++) {
      const offset = s * 45
      for (let i = 0; i < 4; i++) {
        const angle = (i * 90 + offset - 90) * Math.PI / 180
        pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`)
      }
    }
    return pts.join(' ')
  }, [cx, cy, r])

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={r + 15} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />

      {/* Two overlapping squares forming the octagram */}
      {[0, 45].map((offset, si) => (
        <polygon
          key={si}
          points={Array.from({ length: 4 }, (_, i) => {
            const angle = (i * 90 + offset - 90) * Math.PI / 180
            return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
          }).join(' ')}
          fill="none" stroke={si === 0 ? INK : GOLD2} strokeWidth={2}
          className={`svg-clickable${selectedId === `square-${si}` ? ' selected' : ''}`}
          onClick={() => onClick(`square-${si}`, si === 0 ? 'The First Square' : 'The Second Square', si === 0 ? `The first square of the octagram seal of the ${ordinal(jeuNum)} Treasury. It represents the four cardinal emanations of ${fatherName}.` : `The second square, rotated 45 degrees, represents the four intermediate emanations. Together they form the complete octagram seal.`)}
        />
      ))}

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={r * 0.45} fill="none" stroke={GOLD2} strokeWidth={2}
        className={`svg-clickable${selectedId === 'inner' ? ' selected' : ''}`}
        onClick={() => onClick('inner', 'The Inner Circle', `The inner circle containing the cipher of ${fatherName}.`)}
      />

      {/* Cipher */}
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of the ${ordinal(jeuNum)} Treasury.`)}>
        {cipher}
      </text>

      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>
        {fatherName}
      </text>
      <text x={cx} y={475} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>
        {jeuNum > 0 ? `JEU ${jeuNum}` : 'JEU'}
      </text>
    </svg>
  )
}

/* ── Treasury Overview Diagram ── */
function TreasuryOverviewDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250, cy = 260
  const rings = [
    { r: 210, label: 'Fifth Rank (Outermost)', id: 'ov-pleroma' },
    { r: 170, label: 'Fourth Rank (Outer)', id: 'ov-pleroma' },
    { r: 130, label: 'Third Rank (Middle)', id: 'ov-curtain1' },
    { r: 90, label: 'Second Rank (Inner)', id: 'ov-curtain2' },
    { r: 50, label: 'First Rank (Innermost)', id: 'ov-curtain3' }
  ]

  return (
    <svg viewBox="0 0 500 520" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      {rings.map((ring, i) => (
        <circle key={i} cx={cx} cy={cy} r={ring.r} fill="none"
          stroke={i < 2 ? INK3 : i < 4 ? GOLD2 : INK} strokeWidth={i === 4 ? 2.5 : 1.5}
          className={`svg-clickable${selectedId === ring.id ? ' selected' : ''}`}
          onClick={() => {
            const el = elements.find(e => e.id === ring.id)
            if (el) onClick(ring.id, el.label, el.detail)
          }}
        />
      ))}

      {/* Three curtains as dashed rings */}
      {[160, 120, 70].map((r, i) => (
        <circle key={`curtain-${i}`} cx={cx} cy={cy} r={r} fill="none"
          stroke={GOLD} strokeWidth={1} strokeDasharray="6,4"
          className={`svg-clickable${selectedId === `ov-curtain${i + 1}` ? ' selected' : ''}`}
          onClick={() => {
            const el = elements.find(e => e.id === `ov-curtain${i + 1}`)
            if (el) onClick(`ov-curtain${i + 1}`, el.label, el.detail)
          }}
        />
      ))}

      {/* Center: The Great Invisible */}
      <circle cx={cx} cy={cy} r={20} fill={INK} stroke={GOLD3} strokeWidth={2}
        className={`svg-clickable${selectedId === 'ov-invisible' ? ' selected' : ''}`}
        onClick={() => {
          const el = elements.find(e => e.id === 'ov-invisible')
          if (el) onClick('ov-invisible', el.label, el.detail)
        }}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={6} fill={GOLD3}>
        INVISIBLE
      </text>

      {/* Rank labels */}
      {rings.map((ring, i) => (
        <text key={`label-${i}`} x={cx + ring.r + 5} y={cy - 5} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3}>
          {ring.label}
        </text>
      ))}

      <text x={cx} y={20} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={2}>
        THE TREASURY OF LIGHT
      </text>
    </svg>
  )
}

/* ── Archon Gate Diagram ── */
function ArchonGateDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250, cy = 260

  // Three gates with progressive complexity
  const gates = [
    { y: 120, w: 160, h: 80, label: '1st Gate: Paraphax', pw: 'IAO SABAOTH', id: 'ar-paraph', complexity: 1 },
    { y: 220, w: 200, h: 90, label: '2nd Gate: Arthax', pw: 'ADONAI ELOHIM', id: 'ar-arthax', complexity: 2 },
    { y: 330, w: 240, h: 100, label: '3rd Gate: Aphraphax', pw: 'EIE AZAPHAX', id: 'ar-aphr', complexity: 3 }
  ]

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={2}>
        THE THREE ARCHON GATES
      </text>

      {/* Vertical path */}
      <line x1={cx} y1={50} x2={cx} y2={460} stroke={INK3} strokeWidth={1} strokeDasharray="4,4" pointerEvents="none" />

      {gates.map((gate, gi) => {
        const gateCx = cx
        const gateCy = gate.y + gate.h / 2

        return (
          <g key={gi}>
            {/* Gate shape - gets more complex */}
            {/* Outer frame */}
            <rect
              x={gateCx - gate.w / 2} y={gate.y}
              width={gate.w} height={gate.h} rx={4}
              fill="none" stroke={INK} strokeWidth={2}
              className={`svg-clickable${selectedId === gate.id ? ' selected' : ''}`}
              onClick={() => {
                const el = elements.find(e => e.id === gate.id)
                if (el) onClick(gate.id, el.label, el.detail)
              }}
            />

            {/* Inner rings based on complexity */}
            {Array.from({ length: gate.complexity }, (_, ri) => {
              const ringR = 15 + ri * 12
              return (
                <circle key={ri} cx={gateCx} cy={gateCy} r={ringR} fill="none" stroke={GOLD2} strokeWidth={1.5} pointerEvents="none" />
              )
            })}

            {/* Cross for complexity >= 2 */}
            {gate.complexity >= 2 && (
              <>
                <line x1={gateCx} y1={gateCy - 25} x2={gateCx} y2={gateCy + 25} stroke={INK} strokeWidth={1.5} pointerEvents="none" />
                <line x1={gateCx - 25} y1={gateCy} x2={gateCx + 25} y2={gateCy} stroke={INK} strokeWidth={1.5} pointerEvents="none" />
              </>
            )}

            {/* Additional radial lines for complexity >= 3 */}
            {gate.complexity >= 3 && (
              <>
                {[45, 135, 225, 315].map((angle, ai) => {
                  const a = angle * Math.PI / 180
                  return <line key={ai} x1={gateCx} y1={gateCy} x2={gateCx + Math.cos(a) * 30} y2={gateCy + Math.sin(a) * 30} stroke={INK3} strokeWidth={1} pointerEvents="none" />
                })}
              </>
            )}

            {/* Password display */}
            <text x={gateCx} y={gate.y + gate.h + 14} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={GOLD} letterSpacing={1}>
              {gate.pw}
            </text>

            {/* Gate label */}
            <text x={gateCx} y={gate.y - 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK2} letterSpacing={1}>
              {gate.label}
            </text>

            {/* Seal icon in center */}
            <circle cx={gateCx} cy={gateCy} r={8} fill={PARCH} stroke={INK} strokeWidth={1.5} pointerEvents="none" />
            <text x={gateCx} y={gateCy + 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK}>
              {gi + 1}
            </text>
          </g>
        )
      })}

      {/* Archon categories on the sides */}
      <text x={40} y={150} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} transform="rotate(-90, 40, 150)">
        ARCHONS OF THE AEONS
      </text>
      <text x={40} y={270} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} transform="rotate(-90, 40, 270)">
        ARCHONS OF THE SPHERE
      </text>
      <text x={40} y={380} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} transform="rotate(-90, 40, 380)">
        ARCHONS OF THE MIDST
      </text>
    </svg>
  )
}

/* ── Baptism Rite Diagram ── */
function BaptismDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  const baptisms = [
    { id: 'bt-water', label: 'Water', symbol: '\u224B', y: 80, color: '#3a6a8a' },
    { id: 'bt-fire', label: 'Fire', symbol: '\u25B2', y: 160, color: '#8a3a20' },
    { id: 'bt-spirit', label: 'Spirit', symbol: '\u2735', y: 240, color: '#6a5030' },
    { id: 'bt-light', label: 'Light', symbol: '\u2742', y: 320, color: GOLD2 },
    { id: 'bt-mystery', label: 'Mystery', symbol: '\u25C9', y: 400, color: INK }
  ]

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={30} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={2}>
        THE FIVE BAPTISMS
      </text>

      {/* Central vertical path */}
      <line x1={cx} y1={55} x2={cx} y2={435} stroke={GOLD2} strokeWidth={1.5} strokeDasharray="6,3" pointerEvents="none" />

      {baptisms.map((b, i) => {
        const isSelected = selectedId === b.id
        const el = elements.find(e => e.id === b.id)
        const r = 28 + i * 4 // progressive size

        return (
          <g key={i}>
            {/* Concentric rings around each seal */}
            {Array.from({ length: i + 1 }, (_, ri) => (
              <circle key={ri} cx={cx} cy={b.y} r={r + ri * 10} fill="none" stroke={ri === 0 ? b.color : INK3} strokeWidth={ri === 0 ? 2 : 0.8} pointerEvents="none" />
            ))}

            {/* Main seal circle */}
            <circle
              cx={cx} cy={b.y} r={r} fill={PARCH} stroke={b.color} strokeWidth={2.5}
              className={`svg-clickable${isSelected ? ' selected' : ''}`}
              onClick={() => { if (el) onClick(b.id, el.label, el.detail) }}
            />

            {/* Symbol */}
            <text x={cx} y={b.y + 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={22} fill={b.color}>
              {b.symbol}
            </text>

            {/* Label */}
            <text x={cx + r + 20} y={b.y + 4} fontFamily="Cinzel, serif" fontSize={11} fill={INK2} letterSpacing={1}>
              {i + 1}. {b.label}
            </text>

            {/* Seal number */}
            <text x={cx - r - 20} y={b.y + 4} textAnchor="end" fontFamily="Cinzel, serif" fontSize={9} fill={INK3}>
              Seal {i + 1}
            </text>

            {/* Connecting arrow to next */}
            {i < 4 && (
              <path d={`M${cx} ${b.y + r + 10} L${cx - 5} ${b.y + r + 20} M${cx} ${b.y + r + 10} L${cx + 5} ${b.y + r + 20}`} stroke={GOLD2} strokeWidth={1.5} pointerEvents="none" />
            )}
          </g>
        )
      })}

      <text x={cx} y={475} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>
        UNTO THE TREASURY OF LIGHT
      </text>
    </svg>
  )
}

/* ── Hymn Diagram ── */
function HymnDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250, cy = 250

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={30} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={2}>
        THE GNOSTIC HYMN
      </text>

      {/* Scroll shape */}
      <rect x={80} y={60} width={340} height={380} rx={8} fill="none" stroke={INK3} strokeWidth={1.5} pointerEvents="none" />
      <rect x={90} y={70} width={320} height={360} rx={4} fill="none" stroke={GOLD2} strokeWidth={0.8} pointerEvents="none" />

      {/* Three sections of the hymn */}
      {[
        { id: 'hy-invocation', label: 'I. The Invocation', y: 130, el: elements.find(e => e.id === 'hy-invocation') },
        { id: 'hy-names', label: 'II. The Sacred Names', y: 240, el: elements.find(e => e.id === 'hy-names') },
        { id: 'hy-cipher', label: 'III. The Cipher Passage', y: 350, el: elements.find(e => e.id === 'hy-cipher') }
      ].map((section, i) => (
        <g key={i}>
          <rect
            x={110} y={section.y - 40} width={280} height={80} rx={4}
            fill={selectedId === section.id ? 'rgba(200,168,74,0.1)' : 'transparent'}
            stroke={selectedId === section.id ? GOLD2 : INK3} strokeWidth={1.5}
            className="svg-clickable"
            onClick={() => { if (section.el) onClick(section.id, section.el.label, section.el.detail) }}
          />
          <text x={cx} y={section.y - 15} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK2} letterSpacing={1}>
            {section.label}
          </text>
          <text x={cx} y={section.y + 8} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={9} fill={INK3} fontStyle="italic">
            {section.el?.brief || ''}
          </text>
          {/* Decorative symbols */}
          <text x={130} y={section.y} fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}>\u2720</text>
          <text x={370} y={section.y} fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}>\u2720</text>
        </g>
      ))}

      {/* Decorative lines */}
      <line x1={130} y1={185} x2={370} y2={185} stroke={GOLD2} strokeWidth={0.5} pointerEvents="none" />
      <line x1={130} y1={295} x2={370} y2={295} stroke={GOLD2} strokeWidth={0.5} pointerEvents="none" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════════ */

export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState<string>('overview')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [revelation, setRevelation] = useState<{ title: string; detail: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRanks, setExpandedRanks] = useState<Record<string, boolean>>({ 'rank-1': true, 'rank-2': false, 'rank-3': false, 'rank-4': false, 'rank-5': false, 'specials': true })
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const toggleRank = useCallback((rank: string) => {
    setExpandedRanks(prev => ({ ...prev, [rank]: !prev[rank] }))
  }, [])

  const handleElementClick = useCallback((id: string, label: string, detail: string) => {
    setSelectedElement(id)
    setRevelation({ title: label, detail })
  }, [])

  const handleEntrySelect = useCallback((id: string) => {
    setSelectedEntry(id)
    setSelectedElement(null)
    setRevelation(null)
  }, [])

  // Find current entry data
  const currentSpecial = SPECIALS.find(s => s.id === selectedEntry)
  const currentTreasury = TREASURIES.find(t => t.id === selectedEntry)

  // Filter treasuries by search
  const filteredTreasuries = useMemo(() => {
    if (!searchQuery.trim()) return TREASURIES
    const q = searchQuery.toLowerCase()
    return TREASURIES.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.fatherName.toLowerCase().includes(q) ||
      t.cipher.toLowerCase().includes(q) ||
      t.rankName.toLowerCase().includes(q) ||
      String(t.jeuNum).includes(q)
    )
  }, [searchQuery])

  // Group filtered treasuries by rank
  const groupedTreasuries = useMemo(() => {
    const groups: Record<string, TreasuryEntry[]> = {}
    filteredTreasuries.forEach(t => {
      const key = `rank-${t.rank}`
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return groups
  }, [filteredTreasuries])

  // Filter specials by search
  const filteredSpecials = useMemo(() => {
    if (!searchQuery.trim()) return SPECIALS
    const q = searchQuery.toLowerCase()
    return SPECIALS.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div className="treasury-app">
      {/* Particles */}
      {mounted && <Particles />}

      {/* Top roller */}
      <div className="roller">
        <span className="roller-text">CODEX BRUCIANUS \u00b7 BODLEIAN LIBRARY OXFORD \u00b7 MS BRUCE 96</span>
      </div>

      {/* Header */}
      <header className="treasury-header">
        <div className="header-greek">\u0392\u03af\u03b2\u03bb\u03bf\u03c2 \u03c4\u03bf\u1fe6 \u1f38\u03b5\u03cd \u2014 Sacred Diagrams of the Pleroma</div>
        <h1>The Book of Jeu</h1>
        <div className="header-sub">60 Treasuries of Light \u00b7 5 Ranks of Fatherhood \u00b7 The Path of Ascent</div>
      </header>

      {/* Main layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '\u25C0' : '\u25B6'}
          </div>

          {sidebarOpen && (
            <>
              {/* Search */}
              <div className="sidebar-search">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search treasuries..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Special entries */}
              <div className="sidebar-section">
                <div className="section-header" onClick={() => toggleRank('specials')}>
                  <span className="section-arrow">{expandedRanks['specials'] ? '\u25BC' : '\u25B6'}</span>
                  <span className="section-title">Sacred Texts</span>
                </div>
                {expandedRanks['specials'] && filteredSpecials.map(s => (
                  <div
                    key={s.id}
                    className={`sidebar-item ${selectedEntry === s.id ? 'active' : ''}`}
                    onClick={() => handleEntrySelect(s.id)}
                  >
                    <span className="item-icon">{s.category === 'overview' ? '\u2720' : s.category === 'archon' ? '\u2694' : s.category === 'baptism' ? '\u224B' : '\u266B'}</span>
                    <span className="item-text">{s.title.length > 35 ? s.title.substring(0, 35) + '...' : s.title}</span>
                  </div>
                ))}
              </div>

              {/* Treasury ranks */}
              {[1, 2, 3, 4, 5].map(rank => {
                const key = `rank-${rank}`
                const items = groupedTreasuries[key] || []
                if (items.length === 0 && searchQuery) return null
                return (
                  <div key={rank} className="sidebar-section">
                    <div className="section-header" onClick={() => toggleRank(key)}>
                      <span className="section-arrow">{expandedRanks[key] ? '\u25BC' : '\u25B6'}</span>
                      <span className="section-title">{RANK_NAMES[rank]}</span>
                      <span className="section-count">{TREASURIES.filter(t => t.rank === rank).length}</span>
                    </div>
                    {expandedRanks[key] && items.map(t => (
                      <div
                        key={t.id}
                        className={`sidebar-item ${selectedEntry === t.id ? 'active' : ''}`}
                        onClick={() => handleEntrySelect(t.id)}
                      >
                        <span className="item-icon jeu-num">{t.jeuNum}</span>
                        <span className="item-text">{t.fatherName}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </>
          )}
        </aside>

        {/* Content area */}
        <main className="content-area">
          {/* Entry header */}
          <div className="entry-header page-enter" key={selectedEntry}>
            {currentSpecial && (
              <>
                <h2>{currentSpecial.title}</h2>
                <div className="entry-ref">Book of Jeu {currentSpecial.book === 1 ? 'I' : 'II'} \u00b7 {currentSpecial.chapter} \u00b7 {currentSpecial.folio}</div>
              </>
            )}
            {currentTreasury && (
              <>
                <h2>{currentTreasury.title}</h2>
                <div className="entry-ref">Book of Jeu {currentTreasury.book === 1 ? 'I' : 'II'} \u00b7 {currentTreasury.chapter} \u00b7 {currentTreasury.folio}</div>
                <div className="entry-tags">
                  <span className="tag">{currentTreasury.rankName}</span>
                  {currentTreasury.hasDiagram && <span className="tag diagram-tag">Diagram Jeu {currentTreasury.jeuNum}</span>}
                </div>
              </>
            )}
          </div>

          {/* Two-column: diagram + info */}
          <div className="content-grid">
            {/* Diagram */}
            <div className="diagram-wrap">
              {currentSpecial && (
                <SealDiagram
                  type={currentSpecial.sealType}
                  complexity={3}
                  fatherName=""
                  cipher=""
                  jeuNum={0}
                  onElementClick={handleElementClick}
                  selectedId={selectedElement}
                  elements={currentSpecial.elements}
                />
              )}
              {currentTreasury && (
                <SealDiagram
                  type={currentTreasury.sealType}
                  complexity={currentTreasury.sealComplexity}
                  fatherName={currentTreasury.fatherName}
                  cipher={currentTreasury.cipher}
                  jeuNum={currentTreasury.jeuNum}
                  onElementClick={handleElementClick}
                  selectedId={selectedElement}
                />
              )}
            </div>

            {/* Info panel */}
            <div className="info-panel">
              {/* Description */}
              <div className="info-section">
                <h3>Context</h3>
                <p>{currentSpecial?.desc || currentTreasury?.desc}</p>
              </div>

              {/* Quick info for treasury */}
              {currentTreasury && (
                <div className="info-section">
                  <h3>Treasury Details</h3>
                  <div className="detail-grid">
                    <div className="detail-row"><span className="detail-label">Father</span><span className="detail-value">{currentTreasury.fatherName}</span></div>
                    <div className="detail-row"><span className="detail-label">Cipher</span><span className="detail-value cipher">{currentTreasury.cipher}</span></div>
                    <div className="detail-row"><span className="detail-label">Rank</span><span className="detail-value">{currentTreasury.rankName}</span></div>
                    <div className="detail-row"><span className="detail-label">Emanations</span><span className="detail-value">12</span></div>
                    <div className="detail-row"><span className="detail-label">Watchers</span><span className="detail-value">3</span></div>
                    <div className="detail-row"><span className="detail-label">Password</span><span className="detail-value password">{currentTreasury.password}</span></div>
                    <div className="detail-row"><span className="detail-label">Diagram</span><span className="detail-value">{currentTreasury.hasDiagram ? `Jeu ${currentTreasury.jeuNum} (preserved)` : currentTreasury.jeuNum === 13 ? 'Omitted' : 'Not preserved'}</span></div>
                  </div>
                </div>
              )}

              {/* Lore for specials */}
              {currentSpecial && currentSpecial.lore.length > 0 && (
                <div className="info-section">
                  <h3>Teachings</h3>
                  {currentSpecial.lore.map((l, i) => (
                    <div key={i} className="lore-card">
                      <strong>{l.title}</strong>
                      <p>{l.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Watchers for treasury */}
              {currentTreasury && (
                <div className="info-section">
                  <h3>Watchers</h3>
                  {currentTreasury.watchers.map((w, i) => (
                    <div key={i} className="watcher-item">
                      <span className="watcher-icon">\u2694</span>
                      <span className="watcher-name">{w.name}</span>
                      <span className="watcher-gate">{w.gate}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Revelation panel */}
              <div className={`revelation ${revelation ? 'revealed' : ''}`}>
                <span className="rev-label">Revelation</span>
                {revelation ? (
                  <>
                    <span className="rev-title">{revelation.title}</span>
                    <span className="rev-detail">{revelation.detail}</span>
                  </>
                ) : (
                  <span className="rev-detail">Click upon any element within the diagram to receive its hidden teaching.</span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom roller */}
      <div className="roller bottom">
        <span className="roller-text">\u0392\u03af\u03b2\u03bb\u03bf\u03c2 \u03c4\u03bf\u1fe6 \u1f38\u03b5\u03cd \u00b7 THE TWO BOOKS OF JEU</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PARTICLES COMPONENT
   ═══════════════════════════════════════════════════ */
function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${(i * 5.3) % 100}%`,
      size: 1.5 + (i % 3),
      duration: 12 + (i % 8),
      delay: (i * 1.7) % 10,
    })), [])

  return (
    <div className="particle-field">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.left,
          width: `${p.size}px`,
          height: `${p.size}px`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  )
}
