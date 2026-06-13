'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */
interface Emanation { name: string; role: string }
interface Watcher { name: string; pronunciation: string; gate: string }
interface TreasuryEntry {
  id: string; jeuNum: number; title: string; rank: number; rankName: string
  fatherName: string; fatherPron: string; cipher: string; cipherPron: string
  watchers: Watcher[]; emanations: Emanation[]
  sealType: 'cross-circle' | 'concentric' | 'star' | 'radial' | 'octagram'
  sealComplexity: number; desc: string; hasDiagram: boolean
  book: 1 | 2; chapter: string; folio: string
  password?: string; passwordPron?: string
}
interface SpecialEntry {
  id: string; title: string; category: 'overview' | 'archon' | 'baptism' | 'hymn'
  desc: string; sealType: 'treasury-overview' | 'archon-gate' | 'baptism-rite' | 'hymn'
  book: 1 | 2; chapter: string; folio: string
  lore: { title: string; body: string }[]
  elements: { id: string; label: string; brief: string; detail: string }[]
}

const RANK_NAMES = ['', 'First Rank (Innermost)', 'Second Rank (Inner)', 'Third Rank (Middle)', 'Fourth Rank (Outer)', 'Fifth Rank (Outermost)']

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/* ═══════════════════════════════════════════════════
   TREASURY DATA - All 60 Treasuries with pronunciations
   ═══════════════════════════════════════════════════ */
function buildTreasuries(): TreasuryEntry[] {
  const treasuries: TreasuryEntry[] = []

  // All names use Latin transliteration to avoid Unicode rendering issues
  // Pronunciations guide English speakers
  const FATHERS: Record<number, { name: string; pron: string }> = {
    1: { name: 'Pigeradaphtha', pron: 'PIG-er-ah-DAHF-thah' },
    2: { name: 'Saphaed', pron: 'SAH-fay-ed' },
    3: { name: 'Abraoth', pron: 'ah-BRAH-oth' },
    4: { name: 'Abrasax', pron: 'ah-BRAH-saks' },
    5: { name: 'Athoth', pron: 'AH-thoth' },
    6: { name: 'Oroiael', pron: 'or-OY-ah-el' },
    7: { name: 'Harmozel', pron: 'har-MOH-zel' },
    8: { name: 'Daveithai', pron: 'dah-VAY-thay' },
    9: { name: 'Eleleth', pron: 'el-EL-eth' },
    10: { name: 'Phaoph', pron: 'FAY-off' },
    11: { name: 'Aphroph', pron: 'AHF-roff' },
    12: { name: 'Saphaph', pron: 'SAH-fahf' },
    13: { name: 'Phthahoth', pron: 'FTHAH-hoth' },
    14: { name: 'Bathmoth', pron: 'BAHTH-moth' },
    15: { name: 'Mares', pron: 'MAH-res' },
    16: { name: 'Machmoth', pron: 'MAHK-moth' },
    17: { name: 'Plesithea', pron: 'ple-SITH-ee-ah' },
    18: { name: 'Pigeradpha', pron: 'PIG-er-ahd-fah' },
    19: { name: 'Probat', pron: 'PROH-baht' },
    20: { name: 'Marmarouth', pron: 'mar-MAH-rooth' },
    21: { name: 'Eileithya', pron: 'ay-LAY-thyah' },
    22: { name: 'Barpharanghes', pron: 'bar-far-ANG-gez' },
    23: { name: 'Opsimothe', pron: 'op-SIM-oh-thee' },
    24: { name: 'Chthaeth', pron: 'KTHAY-eth' },
    25: { name: 'Marept', pron: 'mah-REPT' },
    26: { name: 'Pharphaxoth', pron: 'far-FAK-soth' },
    27: { name: 'Aphrempht', pron: 'ah-FREMPT' },
    28: { name: 'Erasin', pron: 'er-AH-sin' },
    29: { name: 'Armothes', pron: 'ar-MOH-thes' },
    30: { name: 'Sambath', pron: 'SAM-bath' },
    31: { name: 'Aphraph', pron: 'AHF-raf' },
    32: { name: 'Thalmai', pron: 'thal-MAY' },
    33: { name: 'Pharmas', pron: 'FAR-mas' },
    34: { name: 'Pserai', pron: 'SAY-rye' },
    35: { name: 'Bathra', pron: 'BAH-thrah' },
    36: { name: 'Mastraph', pron: 'MAS-trahf' },
    37: { name: 'Kathan', pron: 'KAH-than' },
    38: { name: 'Saraphim', pron: 'SAH-rah-fim' },
    39: { name: 'Phainops', pron: 'FAY-nops' },
    40: { name: 'Orphanos', pron: 'or-FAN-os' },
    41: { name: 'Aphthona', pron: 'ahf-THOH-nah' },
    42: { name: 'Paraplex', pron: 'PAR-ah-plex' },
    43: { name: 'Arimoth', pron: 'ah-REE-moth' },
    44: { name: 'Sokrates', pron: 'SOK-rah-tes' },
    45: { name: 'Plouton', pron: 'PLOO-ton' },
    46: { name: 'Pleroma', pron: 'pler-OH-mah' },
    47: { name: 'Proarche', pron: 'pro-AR-kay' },
    48: { name: 'Arche', pron: 'AR-kay' },
    49: { name: 'Amethes', pron: 'ah-METH-es' },
    50: { name: 'Sige', pron: 'SEE-gay' },
    51: { name: 'Bythios', pron: 'BITH-ee-os' },
    52: { name: 'Protophanes', pron: 'pro-TOFF-ah-nes' },
    53: { name: 'Autogenes', pron: 'ow-TOJ-en-ees' },
    54: { name: 'Pneumatikos', pron: 'nyoo-mah-TEE-kos' },
    55: { name: 'Aletheia', pron: 'ah-lay-THAY-ah' },
    56: { name: 'Monogenes', pron: 'mon-OJ-en-ees' },
    57: { name: 'Agennetos', pron: 'ah-JEN-ee-tos' },
    58: { name: 'Aoratos', pron: 'ah-OR-ah-tos' },
    59: { name: 'Apophatos', pron: 'ah-POF-ah-tos' },
    60: { name: 'Proator', pron: 'pro-AY-tor' }
  }

  const CIPHERS: Record<number, { name: string; pron: string }> = {
    1: { name: 'Maiion', pron: 'MY-ee-on' },
    2: { name: 'Adonai', pron: 'ah-doh-NYE' },
    3: { name: 'Sabaoth', pron: 'SAH-bah-oth' },
    4: { name: 'Abrasax', pron: 'ah-BRAH-saks' },
    5: { name: 'Iao', pron: 'EE-ah-oh' },
    6: { name: 'Oroiael', pron: 'or-OY-ah-el' },
    7: { name: 'Harmozel', pron: 'har-MOH-zel' },
    8: { name: 'Daveithai', pron: 'dah-VAY-thay' },
    9: { name: 'Eleleth', pron: 'el-EL-eth' },
    10: { name: 'Phaoph', pron: 'FAY-off' },
    11: { name: 'Aphroph', pron: 'AHF-roff' },
    12: { name: 'Saphaph', pron: 'SAH-fahf' },
    13: { name: 'Phthahoth', pron: 'FTHAH-hoth' },
    14: { name: 'Bathmoth', pron: 'BAHTH-moth' },
    15: { name: 'Mares', pron: 'MAH-res' },
    16: { name: 'Machmoth', pron: 'MAHK-moth' },
    17: { name: 'Plesithea', pron: 'ple-SITH-ee-ah' },
    18: { name: 'Pigeradpha', pron: 'PIG-er-ahd-fah' },
    19: { name: 'Probat', pron: 'PROH-baht' },
    20: { name: 'Marmarouth', pron: 'mar-MAH-rooth' },
    21: { name: 'Eileithya', pron: 'ay-LAY-thyah' },
    22: { name: 'Barpharanghes', pron: 'bar-far-ANG-gez' },
    23: { name: 'Opsimothe', pron: 'op-SIM-oh-thee' },
    24: { name: 'Chthaeth', pron: 'KTHAY-eth' },
    25: { name: 'Marept', pron: 'mah-REPT' },
    26: { name: 'Pharphaxoth', pron: 'far-FAK-soth' },
    27: { name: 'Aphrempht', pron: 'ah-FREMPT' },
    28: { name: 'Erasin', pron: 'er-AH-sin' },
    29: { name: 'Armothes', pron: 'ar-MOH-thes' },
    30: { name: 'Sambath', pron: 'SAM-bath' },
    31: { name: 'Aphraph', pron: 'AHF-raf' },
    32: { name: 'Thalmai', pron: 'thal-MAY' },
    33: { name: 'Pharmas', pron: 'FAR-mas' },
    34: { name: 'Pserai', pron: 'SAY-rye' },
    35: { name: 'Bathra', pron: 'BAH-thrah' },
    36: { name: 'Mastraph', pron: 'MAS-trahf' },
    37: { name: 'Kathan', pron: 'KAH-than' },
    38: { name: 'Saraphim', pron: 'SAH-rah-fim' },
    39: { name: 'Phainops', pron: 'FAY-nops' },
    40: { name: 'Orphanos', pron: 'or-FAN-os' },
    41: { name: 'Aphthona', pron: 'ahf-THOH-nah' },
    42: { name: 'Paraplex', pron: 'PAR-ah-plex' },
    43: { name: 'Arimoth', pron: 'ah-REE-moth' },
    44: { name: 'Sokrates', pron: 'SOK-rah-tes' },
    45: { name: 'Plouton', pron: 'PLOO-ton' },
    46: { name: 'Pleroma', pron: 'pler-OH-mah' },
    47: { name: 'Proarche', pron: 'pro-AR-kay' },
    48: { name: 'Arche', pron: 'AR-kay' },
    49: { name: 'Amethes', pron: 'ah-METH-es' },
    50: { name: 'Sige', pron: 'SEE-gay' },
    51: { name: 'Bythios', pron: 'BITH-ee-os' },
    52: { name: 'Protophanes', pron: 'pro-TOFF-ah-nes' },
    53: { name: 'Autogenes', pron: 'ow-TOJ-en-ees' },
    54: { name: 'Pneumatikos', pron: 'nyoo-mah-TEE-kos' },
    55: { name: 'Aletheia', pron: 'ah-lay-THAY-ah' },
    56: { name: 'Monogenes', pron: 'mon-OJ-en-ees' },
    57: { name: 'Agennetos', pron: 'ah-JEN-ee-tos' },
    58: { name: 'Aoratos', pron: 'ah-OR-ah-tos' },
    59: { name: 'Apophatos', pron: 'ah-POF-ah-tos' },
    60: { name: 'Proator', pron: 'pro-AY-tor' }
  }

  const sealTypeMap: Record<number, TreasuryEntry['sealType']> = {
    1: 'concentric', 2: 'concentric', 3: 'concentric', 4: 'concentric', 5: 'concentric',
    6: 'cross-circle', 7: 'cross-circle', 8: 'cross-circle', 9: 'cross-circle', 10: 'cross-circle',
    11: 'star', 12: 'star', 13: 'star', 14: 'star', 15: 'radial',
    16: 'radial', 17: 'octagram', 18: 'octagram', 19: 'concentric', 20: 'concentric',
    21: 'cross-circle', 22: 'star', 23: 'radial', 24: 'radial', 25: 'octagram',
    26: 'octagram', 27: 'concentric', 28: 'star',
    33: 'cross-circle', 36: 'radial', 55: 'cross-circle'
  }

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

  for (let i = 1; i <= 60; i++) {
    let rank: number
    if (i <= 12) rank = 1; else if (i <= 24) rank = 2; else if (i <= 36) rank = 3; else if (i <= 48) rank = 4; else rank = 5

    const f = FATHERS[i] || { name: `Jeu ${i}`, pron: 'jyoo' }
    const c = CIPHERS[i] || { name: `${i}`, pron: '' }

    const w1 = `${watcherPrefixes[(i - 1) % 50]}yx`
    const w2 = `${watcherPrefixes[(i + 12) % 50]}ax`
    const w3 = `${watcherPrefixes[(i + 24) % 50]}oth`

    treasuries.push({
      id: `jeu-${i}`, jeuNum: i,
      title: `The ${ordinal(i)} Treasury of Light`,
      rank, rankName: RANK_NAMES[rank],
      fatherName: `${f.name} Jeu`, fatherPron: `${f.pron} jyoo`,
      cipher: c.name, cipherPron: c.pron,
      watchers: [
        { name: w1, pronunciation: w1.replace('yx', '-iks').replace('oth', '-oth'), gate: `Gate 1 of ${f.name}` },
        { name: w2, pronunciation: w2.replace('ax', '-aks').replace('oth', '-oth'), gate: `Gate 2 of ${f.name}` },
        { name: w3, pronunciation: w3.replace('oth', '-oth'), gate: `Gate 3 of ${f.name}` }
      ],
      emanations: ['Phaethon', 'Omorpha', 'Aphroph', 'Saphapha', 'Mareph', 'Pigeraph', 'Thalmaoph', 'Bathraoth', 'Eratha', 'Armatha', 'Pharmatha', 'Aphreph'].map((n, ei) => ({ name: n, role: `Emanation ${ei + 1}` })),
      sealType: sealTypeMap[i] || (['cross-circle', 'concentric', 'star', 'radial', 'octagram'] as const)[(i - 1) % 5],
      sealComplexity: Math.min(5, Math.ceil(i / 12)),
      desc: `The ${ordinal(i)} Treasury presided over by ${f.name} Jeu (${f.pron}), situated in the ${RANK_NAMES[rank]} of the divine Pleroma. Twelve emanations radiate from the Father, and three watchers guard the gates. The initiate must possess the cipher "${c.name}" and recite the sacred names to pass through.`,
      hasDiagram: true, // ALL treasuries show diagrams now
      book: i <= 41 ? 1 : 2,
      chapter: `Chapter ${i + 5}`,
      folio: `ff. ${(i * 2 + 1)}r-${(i * 2 + 2)}v`,
      password: `I invoke ${f.name} Jeu - ${c.name}`,
      passwordPron: `I invoke ${f.pron} jyoo - ${c.pron}`
    })
  }
  return treasuries
}

const TREASURIES = buildTreasuries()

/* ═══════════════════════════════════════════════════
   SPECIAL ENTRIES
   ═══════════════════════════════════════════════════ */
const SPECIALS: SpecialEntry[] = [
  {
    id: 'overview', title: 'The Treasury of the Light', category: 'overview',
    desc: 'The supreme abode of the Divine - source of all spiritual light. Structured as twelve concentric aeons each sealed by a guardian, enclosing three great curtains, and at the innermost, the Great Invisible: the unknowable source from which all light and life flows downward into creation.',
    sealType: 'treasury-overview', book: 1, chapter: 'Chapters 1-15', folio: 'ff. 1r-17v',
    lore: [
      { title: 'Origin of the Text', body: 'The Book of Jeu was preserved in the Codex Brucianus, discovered in Egypt and acquired by James Bruce in 1769. Written in Coptic, it likely translates earlier Greek originals. The diagrams it contains are unique survivals of actual initiatory seals used in Sethian Gnostic ritual.' },
      { title: 'The Pleroma', body: 'The Pleroma ("Fullness") is the totality of divine light, comprising all aeons in their perfection. The Treasury stands at its apex. The fall of Sophia and the formation of the material world are understood as a leak of light downward out of the Pleroma.' },
      { title: 'The Twelve Aeons', body: 'Each of the twelve outer chambers is presided over by an aeon-ruler. Their names include Harmozel (har-MOH-zel, light of grace), Oroiael (or-OY-ah-el, light of thought), Daveithai (dah-VAY-thay, light of understanding), and Eleleth (el-EL-eth, light of perception). Each presides over a class of souls.' },
      { title: 'The Three Curtains', body: 'Three veils separate the inner sanctum from the Pleroma. The outer veil is penetrable by higher archons; the middle by perfect souls of the elect; the innermost veil can only be crossed by those who have received all five seals of the baptismal rite.' }
    ],
    elements: [
      { id: 'ov-pleroma', label: 'The Pleroma', brief: 'Totality of divine light', detail: 'The Pleroma encompasses all 60 treasuries arranged in five ranks of Fatherhood. The innermost ranks are closest to the ineffable source, while the outermost ranks border the material cosmos. Each rank contains 12 treasuries, and each treasury is governed by a Father bearing a mystic name suffixed with "Jeu" (pronounced jyoo).' },
      { id: 'ov-curtain1', label: 'First Curtain', brief: 'The outer veil', detail: 'The first of three veils that separate the inner sanctum from the outer Pleroma. This outer veil is penetrable by higher archons who still retain some light. It marks the boundary between the ordered aeonic realms and the chaotic margins where archons patrol.' },
      { id: 'ov-curtain2', label: 'Second Curtain', brief: 'The middle veil', detail: 'The middle veil can only be crossed by perfect souls of the elect who have received the first three seals. Souls who lack these seals are turned back by the guardians at this curtain and must undergo further purification in the aeonic cycles.' },
      { id: 'ov-curtain3', label: 'Third Curtain', brief: 'The innermost veil', detail: 'The innermost veil guards the Great Invisible itself. Only those who have received all five seals of the baptismal rite may pass through. This curtain is described as being made of pure light, impenetrable to any being still bound by material or aetheric attachments.' },
      { id: 'ov-invisible', label: 'The Great Invisible', brief: 'The unknowable source', detail: 'At the very heart of the Treasury of Light dwells the Great Invisible Spirit - the unknowable, ineffable source from which all light and life emanates. No name can encompass it, no diagram can represent it. It is the alpha and omega of the Gnostic cosmology, the silent ground of all being.' }
    ]
  },
  {
    id: 'jeu-father', title: 'Jeu, the True God', category: 'overview',
    desc: 'Jeu (pronounced jyoo) is the Great Overseer, the Father who stands at the apex of the aeons and administers the Treasury of Light. He is the first emanation of the Great Invisible Spirit, and through him all other treasuries and their Fathers receive their authority and their names.',
    sealType: 'treasury-overview', book: 1, chapter: 'Chapters 2-4', folio: 'ff. 2r-5v',
    lore: [
      { title: 'The Nature of Jeu', body: 'Jeu is not the highest God but the first revealed God - the interface between the unknowable One and the manifold aeons. He is called "the true God" because he is the first being who can be named and addressed in prayer. Above him is only the Great Invisible Spirit, which is beyond all naming.' },
      { title: 'The Character of Jeu', body: 'Each treasury Father bears a "character" - a sacred seal or diagram that represents his spiritual essence. Jeu\'s character is the primordial seal from which all others derive. The manuscript shows it as a complex of concentric circles with inscribed names, surrounded by emanation rays.' },
      { title: 'The Three Watchers', body: 'Three watchers stand at the gates of every treasury. They are not hostile but serve as guardians who test the initiate\'s knowledge. The soul must recite the correct names and show the proper cipher to pass. Each watcher has a specific name and office within the treasury\'s hierarchy.' }
    ],
    elements: [
      { id: 'jf-jeu', label: 'Jeu the True God', brief: 'The Great Overseer', detail: 'Jeu (jyoo) stands at the apex of the Treasury hierarchy. He is the first named divinity, the one who organizes the Pleroma and assigns each Father to his treasury. He emanated the 60 treasuries and established the watchers at their gates.' },
      { id: 'jf-character', label: 'The Character (Seal)', brief: 'Primordial sacred seal', detail: 'The character of Jeu is depicted as a complex seal of concentric rings with divine names inscribed within them. This pattern serves as the template for all subsequent treasury diagrams in the manuscript.' },
      { id: 'jf-emanations', label: 'The Twelve Emanations', brief: 'Radiant powers of Jeu', detail: 'From Jeu proceed twelve emanations - radiant powers that fill the treasury with light. Each emanation has a name and a role in the divine economy. They are the first "places" within the treasury, and each contains further subsidiary emanations.' },
      { id: 'jf-watchers', label: 'The Three Watchers', brief: 'Guardians of the gates', detail: 'Three watchers guard the approach to Jeu\'s treasury. Their names must be known and spoken by the ascending soul. They test whether the initiate possesses the correct cipher and has received the necessary seals.' }
    ]
  },
  {
    id: 'archons', title: 'The Seals of the Archons', category: 'archon',
    desc: 'Between the soul and the Treasury stand the Archons - rulers of the material and aetheric realms who seek to keep souls imprisoned in the cycle of rebirth. The Book of Jeu provides the exact seals, names, and passwords needed to bypass each Archon gate during the soul\'s ascent.',
    sealType: 'archon-gate', book: 1, chapter: 'Chapters 30-50', folio: 'ff. 20r-39v',
    lore: [
      { title: 'The Archon Hierarchy', body: 'The Archons are organized into three tiers: the Archons of the Aeons (who rule the outermost ring), the Archons of the Sphere (who control the zodiacal belt), and the Archons of the Midst (who govern the atmospheric realm between earth and the firmament). Each tier has its own seals and passwords.' },
      { title: 'The Seals as Passwords', body: 'The Gnostic seals function as mystical passwords. They are not merely symbols to be recognized but active powers that must be invoked by name. The ascending soul must recite the cipher while mentally imprinting the seal\'s pattern upon itself. This is described as "sealing yourself with this seal."' },
      { title: 'Progressive Complexity', body: 'The gates become progressively more complex and dangerous as the soul ascends. The lower gates require only a single name and seal, while the higher gates demand multiple names, ciphers, and the combined power of all previously received seals.' }
    ],
    elements: [
      { id: 'ar-aeons', label: 'Archons of the Aeons', brief: 'Rulers of the outer aeonic ring', detail: 'The outermost tier of Archons rules over the twelve aeons. Each Archon governs a thirtieth part of the aeonic cycle and commands legions of subordinate powers. The soul must pass through all twelve aeonic gates, reciting the name of each Archon and showing the corresponding seal.' },
      { id: 'ar-sphere', label: 'Archons of the Sphere', brief: 'Controllers of the zodiacal belt', detail: 'The Archons of the Sphere control the seven planetary spheres through which the soul must ascend. Each sphere is governed by a planetary Archon who demands a password. These passwords are encoded in the diagram seals and must be spoken in the correct sequence.' },
      { id: 'ar-midst', label: 'Archons of the Midst', brief: 'Governors of the atmospheric realm', detail: 'The three Archons of the Midst patrol the boundary between the material cosmos and the Pleroma. They are the most dangerous adversaries of the ascending soul, for they can strip away the soul\'s accumulated seals if the correct counter-seals are not employed.' },
      { id: 'ar-paraph', label: 'Paraphax - 1st Gate', brief: 'Password: IAO SABAOTH (EE-ah-oh SAH-bah-oth)', detail: 'The first Archon gate is guarded by Paraphax (PAR-ah-faks), who commands the lowest of the aeonic gates. The password "IAO SABAOTH" (EE-ah-oh SAH-bah-oth) must be spoken while tracing the seal of the first gate. This seal is a simple cross within a circle.' },
      { id: 'ar-arthax', label: 'Arthax - 2nd Gate', brief: 'Password: ADONAI ELOHIM (ah-doh-NYE el-oh-HEEM)', detail: 'The second gate is guarded by Arthax (AR-thaks). The password "ADONAI ELOHIM" (ah-doh-NYE el-oh-HEEM) is spoken while imprinting the double-circle seal. This gate marks the transition from the material to the aetheric realm.' },
      { id: 'ar-aphr', label: 'Aphraphax - 3rd Gate', brief: 'Password: EIE AZAPHAX (AY-ee-ay AZ-ah-faks)', detail: 'The third and final Archon gate is guarded by Aphraphax (ah-FRAH-faks), the mightiest of the gatekeepers. The password "EIE AZAPHAX" (AY-ee-ay AZ-ah-faks) must be combined with all previously received seals. The seal of this gate is the most complex: a triple circle with radiating lines.' }
    ]
  },
  {
    id: 'baptism', title: 'The Rite of Baptism', category: 'baptism',
    desc: 'Book of Jeu II preserves a nearly complete ritual script for the Gnostic baptism - one of the earliest surviving Christian initiation liturgies. The rite involves five successive baptisms, each conferring a seal upon the initiate: water, fire, spirit, light, and the seal of the ineffable mystery.',
    sealType: 'baptism-rite', book: 2, chapter: 'Chapters 42-52', folio: 'ff. 103r-114v',
    lore: [
      { title: 'The Five Baptisms', body: 'The baptismal rite consists of five distinct immersions, each in a different element and each conferring a specific spiritual seal. The baptisms of water and fire purify the body; the baptism of the Holy Spirit illuminates the soul; the baptism of light unites the soul with the Pleroma; and the final mystery seal opens the way to the Treasury of Light.' },
      { title: 'The Ritual Sequence', body: 'Each baptism follows the same pattern: invocation of sacred names, immersion in the element, recitation of the cipher, and sealing of the initiate. The officiant draws the seal upon the forehead of the candidate while speaking the password. The candidate then rises from the element transformed and sealed.' },
      { title: 'The Sacred Names', body: 'The names invoked during each baptism are drawn from the hierarchy of treasury Fathers. The officiant must know the correct names for each of the five baptisms and must possess the authority to pronounce them. These names are themselves considered powerful spiritual entities, not mere words.' }
    ],
    elements: [
      { id: 'bt-water', label: 'Baptism of Water', brief: 'First seal: purification', detail: 'The first baptism purifies the body and soul of material defilement. The initiate is immersed in living water while the officiant invokes the name of the first Father of the treasuries. Upon emerging, the first seal is drawn upon the forehead.' },
      { id: 'bt-fire', label: 'Baptism of Fire', brief: 'Second seal: transformation', detail: 'The second baptism transforms the soul, burning away residual attachment to the material world. The fire is both literal (candles or lamps) and spiritual (the fire of the Pleroma). The second seal is inscribed while the initiate stands within the circle of flame.' },
      { id: 'bt-spirit', label: 'Baptism of the Holy Spirit', brief: 'Third seal: illumination', detail: 'The third baptism brings illumination - the direct experience of the divine light. The initiate receives the breath of the Spirit and is filled with gnosis. This is the baptism that distinguishes the Gnostic rite from conventional Christian baptism.' },
      { id: 'bt-light', label: 'Baptism of Light', brief: 'Fourth seal: union', detail: 'The fourth baptism unites the soul with the Pleroma. The initiate is enveloped in divine light and sees the Treasury of Light with spiritual eyes. The fourth seal marks the soul as a citizen of the Pleroma, no longer subject to the Archons\' authority.' },
      { id: 'bt-mystery', label: 'The Ineffable Mystery', brief: 'Fifth seal: transcendence', detail: 'The fifth and final seal cannot be described in words. It is the seal of the Great Invisible Spirit itself, and it confers the right of passage through the innermost curtain into the Treasury of Light. Only those who have received all five seals may ascend to the presence of Jeu.' }
    ]
  },
  {
    id: 'hymn', title: 'Fragment of a Gnostic Hymn', category: 'hymn',
    desc: 'At the center of the First Book of Jeu lies a fragmentary hymn - a liturgical chant that the initiate must recite during the ascent through the treasuries. The hymn invokes the names of the treasury Fathers in sequence, calling upon each to open his gates and permit the soul to pass.',
    sealType: 'hymn', book: 1, chapter: 'Chapter 35', folio: 'ff. 25r-26v',
    lore: [
      { title: 'The Hymn as Ascent Tool', body: 'The hymn serves a dual purpose: it is both a prayer of supplication and a magical formula of command. By reciting the hymn, the initiate asserts spiritual authority over the treasury guardians and compels them to open the gates. The hymn must be recited in the correct sequence, treasury by treasury, from the outermost to the innermost.' },
      { title: 'Coptic Liturgical Language', body: 'The hymn is composed in Sahidic Coptic with numerous Greek loan-words, reflecting the bilingual liturgical culture of Egyptian Gnosticism. Many of the names are vowel-sequences (IAO, EIE, OYO) that function as sonic ciphers, each resonating with a specific treasury\'s spiritual frequency.' }
    ],
    elements: [
      { id: 'hy-invocation', label: 'The Invocation', brief: 'Opening prayer of the hymn', detail: 'The hymn begins with an invocation to the Great Invisible Spirit, calling upon the nameless One to grant passage through the treasuries. The initiate declares: "I invoke thee, O Invisible One, who art before all aeons, open the way for my soul."' },
      { id: 'hy-names', label: 'The Sacred Names', brief: 'Sequential treasury names', detail: 'The core of the hymn consists of the sequential recitation of all 60 treasury Fathers\' names, from the outermost (Proator Jeu) inward to the innermost (Pigeradaphtha Jeu). Each name must be pronounced in its original Coptic form with correct vowel intonation.' },
      { id: 'hy-cipher', label: 'The Cipher Passage', brief: 'The encoded final section', detail: 'The hymn concludes with a cipher passage - a series of vowel-sequences and symbolic phrases that encode the ultimate password for entry into the Treasury of Light. This passage is the most closely guarded secret of the Gnostic tradition.' }
    ]
  }
]

/* ═══════════════════════════════════════════════════
   COLOR CONSTANTS
   ═══════════════════════════════════════════════════ */
const INK = '#1a1208', INK2 = '#3a2c14', INK3 = '#6a5030'
const GOLD = '#8a6820', GOLD2 = '#c8a84a', GOLD3 = '#e8c070'
const PARCH = '#ede0be'

/* ═══════════════════════════════════════════════════
   SEAL DIAGRAM COMPONENTS
   ═══════════════════════════════════════════════════ */

// SVG small cross shape (replaces Unicode symbols)
function SvgCross({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return <path d={`M${x} ${y - size}L${x + size * 0.3} ${y - size}L${x + size * 0.3} ${y - size * 0.3}L${x + size} ${y - size * 0.3}L${x + size} ${y + size * 0.3}L${x + size * 0.3} ${y + size * 0.3}L${x + size * 0.3} ${y + size}L${x} ${y + size}L${x - size * 0.3} ${y + size}L${x - size * 0.3} ${y + size * 0.3}L${x - size} ${y + size * 0.3}L${x - size} ${y - size * 0.3}L${x - size * 0.3} ${y - size * 0.3}Z`} fill={color} stroke="none" />
}

/* ── Cross-and-Circle Seal ── */
function CrossCircleSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const armW = r * 0.28, armL = r * 0.85, ringR = r * 0.65, outerR = r * 1.1, innerR = r * 0.25
  const places = useMemo(() => ['Phaethon', 'Mareph', 'Thalma', 'Aphroph', 'Eratha', 'Bathrax'].map((name, i) => {
    const angle = (i * 60 - 90) * Math.PI / 180
    return { name, x: cx + Math.cos(angle) * (ringR + 25), y: cy + Math.sin(angle) * (ringR + 25) }
  }), [cx, cy, ringR])

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={INK} strokeWidth={2.5} pointerEvents="none" />
      <circle cx={cx} cy={cy} r={outerR - 6} fill="none" stroke={GOLD2} strokeWidth={1} pointerEvents="none" />
      {/* SOLID CROSS */}
      <path
        d={`M${cx - armW} ${cy - armL}L${cx + armW} ${cy - armL}L${cx + armW} ${cy - armW}L${cx + armL} ${cy - armW}L${cx + armL} ${cy + armW}L${cx + armW} ${cy + armW}L${cx + armW} ${cy + armL}L${cx - armW} ${cy + armL}L${cx - armW} ${cy + armW}L${cx - armL} ${cy + armW}L${cx - armL} ${cy - armW}L${cx - armW} ${cy - armW}Z`}
        fill={PARCH} stroke={INK} strokeWidth={2}
        className={`svg-clickable${selectedId === 'cross' ? ' selected' : ''}`}
        onClick={() => onClick('cross', 'The Sacred Cross', `The seal of the ${ordinal(jeuNum)} Treasury - a solid cross inscribed within the circle, representing the four directions of divine emanation. The Father ${fatherName} places his cipher upon this cross.`)}
      />
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke={GOLD2} strokeWidth={3}
        className={`svg-clickable${selectedId === 'ring' ? ' selected' : ''}`}
        onClick={() => onClick('ring', 'The Circle of Places', `Six places surround the Father within this treasury. The cipher "${cipher}" is inscribed at the center. Seal yourselves with this seal while the cipher is in your hand.`)}
      />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={INK} strokeWidth={2} pointerEvents="none" />
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={complexity > 2 ? 18 : 22} fill={GOLD}
        className={`svg-clickable${selectedId === 'cipher' ? ' selected' : ''}`} style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher of the ${ordinal(jeuNum)} Treasury is "${cipher}". This sacred name must be held in the hand (inscribed upon a pebble or token) while the initiate passes through the gates.`)}>{cipher}</text>
      {places.map((p, i) => (
        <g key={i} className={`svg-clickable${selectedId === `place-${i}` ? ' selected' : ''}`}
           onClick={() => onClick(`place-${i}`, p.name, `${p.name} is the ${ordinal(i + 1)} place surrounding the Father in the ${ordinal(jeuNum)} Treasury. Each place is governed by an emanation of ${fatherName}.`)}>
          <circle cx={p.x} cy={p.y} r={14} fill={PARCH} stroke={INK} strokeWidth={1.5} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK}>{p.name.substring(0, 4)}</text>
        </g>
      ))}
      <text x={cx} y={cy - outerR - 15} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>{fatherName}</text>
      {places.map((p, i) => <line key={`l${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={INK3} strokeWidth={0.5} strokeDasharray="3,3" pointerEvents="none" />)}
    </svg>
  )
}

/* ── Concentric Rings Seal ── */
function ConcentricSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const rings = complexity + 1
  const emanNames = ['Pha', 'Omo', 'Aph', 'Sap', 'Mar', 'Pig', 'Tha', 'Bat', 'Era', 'Arm', 'Phr', 'Aphr']

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      {Array.from({ length: rings }, (_, i) => {
        const ringR = r - (i * r / rings)
        return <circle key={i} cx={cx} cy={cy} r={ringR} fill="none" stroke={i === 0 ? INK : GOLD2} strokeWidth={i === 0 ? 3 : 1.5}
          className={`svg-clickable${selectedId === `ring-${i}` ? ' selected' : ''}`}
          onClick={() => onClick(`ring-${i}`, `${ordinal(i + 1)} Ring`, i === 0 ? 'This outermost ring represents the boundary of the treasury, beyond which the Archons patrol.' : i === rings - 1 ? 'This innermost ring contains the cipher of the Father, the key to passage.' : 'This intermediate ring contains the names of the emanations and watchers.')} />
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180
        return (
          <g key={i} className={`svg-clickable${selectedId === `em-${i}` ? ' selected' : ''}`}
             onClick={() => onClick(`em-${i}`, `Emanation ${i + 1}`, `The ${ordinal(i + 1)} emanation of ${fatherName} radiating from the center of the ${ordinal(jeuNum)} Treasury.`)}>
            <line x1={cx + Math.cos(angle) * 30} y1={cy + Math.sin(angle) * 30} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke={INK3} strokeWidth={0.8} />
            <circle cx={cx + Math.cos(angle) * (r + 12)} cy={cy + Math.sin(angle) * (r + 12)} r={8} fill={PARCH} stroke={GOLD2} strokeWidth={1} />
            <text x={cx + Math.cos(angle) * (r + 12)} y={cy + Math.sin(angle) * (r + 12) + 3} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK2}>{emanNames[i]}</text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={22} fill={PARCH} stroke={INK} strokeWidth={2}
        className={`svg-clickable${selectedId === 'cipher' ? ' selected' : ''}`}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher of the ${ordinal(jeuNum)} Treasury is "${cipher}". This is the name that must be held while passing through the gates of ${fatherName}.`)} />
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={14} fill={GOLD}>{cipher}</text>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>{fatherName}</text>
      <text x={cx} y={475} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>{jeuNum > 0 ? `JEU ${jeuNum}` : 'JEU'}</text>
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
      <polygon points={starPath} fill="none" stroke={INK} strokeWidth={2.5}
        className={`svg-clickable${selectedId === 'star' ? ' selected' : ''}`}
        onClick={() => onClick('star', `The ${points}-Pointed Star`, `The star seal of the ${ordinal(jeuNum)} Treasury. The ${points} points represent the ${points === 8 ? 'eight directions of divine emanation' : 'six places surrounding the Father'}.`)} />
      <circle cx={cx} cy={cy} r={innerR * 0.6} fill="none" stroke={GOLD2} strokeWidth={2}
        className={`svg-clickable${selectedId === 'inner' ? ' selected' : ''}`}
        onClick={() => onClick('inner', 'The Inner Circle', `The inner circle of the ${ordinal(jeuNum)} Treasury contains the Father ${fatherName} and his cipher.`)} />
      {Array.from({ length: points }, (_, i) => {
        const angle = (i * 360 / points - 90) * Math.PI / 180
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke={INK3} strokeWidth={0.7} pointerEvents="none" />
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of ${fatherName}.`)}>{cipher}</text>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>{fatherName}</text>
      <text x={cx} y={475} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>{jeuNum > 0 ? `JEU ${jeuNum}` : 'JEU'}</text>
    </svg>
  )
}

/* ── Radial Division Seal ── */
function RadialSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const sectors = complexity >= 3 ? 12 : 8
  const innerR = r * 0.35
  const greekLetters = 'ABGDEZHQIKLMNXOPRSTUFW'

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={r + 15} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={2.5}
        className={`svg-clickable${selectedId === 'outer' ? ' selected' : ''}`}
        onClick={() => onClick('outer', 'The Outer Boundary', `The outer boundary of the ${ordinal(jeuNum)} Treasury seal with ${sectors} sectors.`)} />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={GOLD2} strokeWidth={2}
        className={`svg-clickable${selectedId === 'inner' ? ' selected' : ''}`}
        onClick={() => onClick('inner', 'The Inner Sanctum', `The inner sanctum where the Father ${fatherName} dwells with his cipher.`)} />
      {Array.from({ length: sectors }, (_, i) => {
        const angle = (i * 360 / sectors - 90) * Math.PI / 180
        const midAngle = ((i + 0.5) * 360 / sectors - 90) * Math.PI / 180
        const labelR = (r + innerR) / 2
        return (
          <g key={i}>
            <line x1={cx + Math.cos(angle) * innerR} y1={cy + Math.sin(angle) * innerR} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke={INK3} strokeWidth={1}
              className={`svg-clickable${selectedId === `sec-${i}` ? ' selected' : ''}`}
              onClick={() => onClick(`sec-${i}`, `Sector ${i + 1}`, `The ${ordinal(i + 1)} sector governed by an emanation of ${fatherName}.`)} />
            <text x={cx + Math.cos(midAngle) * labelR} y={cy + Math.sin(midAngle) * labelR + 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3}>{greekLetters[i % greekLetters.length]}</text>
          </g>
        )
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of the ${ordinal(jeuNum)} Treasury.`)}>{cipher}</text>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>{fatherName}</text>
    </svg>
  )
}

/* ── Octagram Seal ── */
function OctagramSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={r + 15} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      {[0, 45].map((offset, si) => (
        <polygon key={si}
          points={Array.from({ length: 4 }, (_, i) => { const a = (i * 90 + offset - 90) * Math.PI / 180; return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}` }).join(' ')}
          fill="none" stroke={si === 0 ? INK : GOLD2} strokeWidth={2}
          className={`svg-clickable${selectedId === `sq-${si}` ? ' selected' : ''}`}
          onClick={() => onClick(`sq-${si}`, si === 0 ? 'The First Square' : 'The Second Square', si === 0 ? `The first square of the octagram seal representing the four cardinal emanations of ${fatherName}.` : `The second square, rotated 45 degrees, representing the four intermediate emanations.`)} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.45} fill="none" stroke={GOLD2} strokeWidth={2}
        className={`svg-clickable${selectedId === 'inner' ? ' selected' : ''}`}
        onClick={() => onClick('inner', 'The Inner Circle', `The inner circle containing the cipher of ${fatherName}.`)} />
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of the ${ordinal(jeuNum)} Treasury.`)}>{cipher}</text>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK2} letterSpacing={1}>{fatherName}</text>
      <text x={cx} y={475} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>{jeuNum > 0 ? `JEU ${jeuNum}` : 'JEU'}</text>
    </svg>
  )
}

/* ── Treasury Overview Diagram ── */
function TreasuryOverviewDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250, cy = 260
  const rings = [
    { r: 210, label: '5th Rank', id: 'ov-pleroma' },
    { r: 170, label: '4th Rank', id: 'ov-pleroma' },
    { r: 130, label: '3rd Rank', id: 'ov-curtain1' },
    { r: 90, label: '2nd Rank', id: 'ov-curtain2' },
    { r: 50, label: '1st Rank', id: 'ov-curtain3' }
  ]

  return (
    <svg viewBox="0 0 500 520" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      {rings.map((ring, i) => (
        <circle key={i} cx={cx} cy={cy} r={ring.r} fill="none" stroke={i < 2 ? INK3 : i < 4 ? GOLD2 : INK} strokeWidth={i === 4 ? 2.5 : 1.5}
          className={`svg-clickable${selectedId === ring.id ? ' selected' : ''}`}
          onClick={() => { const el = elements.find(e => e.id === ring.id); if (el) onClick(ring.id, el.label, el.detail) }} />
      ))}
      {[160, 120, 70].map((r, i) => (
        <circle key={`c${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={GOLD} strokeWidth={1} strokeDasharray="6,4"
          className={`svg-clickable${selectedId === `ov-curtain${i + 1}` ? ' selected' : ''}`}
          onClick={() => { const el = elements.find(e => e.id === `ov-curtain${i + 1}`); if (el) onClick(`ov-curtain${i + 1}`, el.label, el.detail) }} />
      ))}
      <circle cx={cx} cy={cy} r={20} fill={INK} stroke={GOLD3} strokeWidth={2}
        className={`svg-clickable${selectedId === 'ov-invisible' ? ' selected' : ''}`}
        onClick={() => { const el = elements.find(e => e.id === 'ov-invisible'); if (el) onClick('ov-invisible', el.label, el.detail) }} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={6} fill={GOLD3}>INVISIBLE</text>
      {rings.map((ring, i) => <text key={`lb${i}`} x={cx + ring.r + 5} y={cy - 5} fontFamily="Cinzel, serif" fontSize={7} fill={INK3}>{ring.label}</text>)}
      <text x={cx} y={20} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={2}>THE TREASURY OF LIGHT</text>
    </svg>
  )
}

/* ── Upgraded Archon Gate Diagram ── */
function ArchonGateDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250

  const gates = [
    { y: 70, w: 180, h: 100, label: '1st Gate: Paraphax', pron: 'PAR-ah-faks', pw: 'IAO SABAOTH', pwPron: 'EE-ah-oh SAH-bah-oth', id: 'ar-paraph', color: '#6a5030' },
    { y: 200, w: 220, h: 110, label: '2nd Gate: Arthax', pron: 'AR-thaks', pw: 'ADONAI ELOHIM', pwPron: 'ah-doh-NYE el-oh-HEEM', id: 'ar-arthax', color: '#5a3818' },
    { y: 340, w: 260, h: 120, label: '3rd Gate: Aphraphax', pron: 'ah-FRAH-faks', pw: 'EIE AZAPHAX', pwPron: 'AY-ee-ay AZ-ah-faks', id: 'ar-aphr', color: '#3a2c14' }
  ]

  return (
    <svg viewBox="0 0 500 510" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={2}>THE THREE ARCHON GATES</text>
      <line x1={cx} y1={40} x2={cx} y2={480} stroke={INK3} strokeWidth={1} strokeDasharray="4,4" pointerEvents="none" />

      {gates.map((gate, gi) => {
        const gateCx = cx, gateCy = gate.y + gate.h / 2
        return (
          <g key={gi}>
            {/* Gate arch shape */}
            <path d={`M${gateCx - gate.w / 2} ${gate.y + gate.h} L${gateCx - gate.w / 2} ${gate.y + 20} Q${gateCx - gate.w / 2} ${gate.y} ${gateCx - gate.w / 4} ${gate.y} L${gateCx + gate.w / 4} ${gate.y} Q${gateCx + gate.w / 2} ${gate.y} ${gateCx + gate.w / 2} ${gate.y + 20} L${gateCx + gate.w / 2} ${gate.y + gate.h}`}
              fill="none" stroke={gate.color} strokeWidth={3}
              className={`svg-clickable${selectedId === gate.id ? ' selected' : ''}`}
              onClick={() => { const el = elements.find(e => e.id === gate.id); if (el) onClick(gate.id, el.label, el.detail) }} />

            {/* Inner seal based on complexity */}
            {Array.from({ length: gi + 1 }, (_, ri) => (
              <circle key={ri} cx={gateCx} cy={gateCy} r={15 + ri * 12} fill="none" stroke={GOLD2} strokeWidth={1.5} pointerEvents="none" />
            ))}

            {/* Cross for gate 2+ */}
            {gi >= 1 && <>
              <line x1={gateCx} y1={gateCy - 28} x2={gateCx} y2={gateCy + 28} stroke={INK} strokeWidth={2} pointerEvents="none" />
              <line x1={gateCx - 28} y1={gateCy} x2={gateCx + 28} y2={gateCy} stroke={INK} strokeWidth={2} pointerEvents="none" />
            </>}

            {/* Radiating lines for gate 3 */}
            {gi >= 2 && <>
              {[45, 135, 225, 315].map((angle, ai) => {
                const a = angle * Math.PI / 180
                return <line key={ai} x1={gateCx} y1={gateCy} x2={gateCx + Math.cos(a) * 35} y2={gateCy + Math.sin(a) * 35} stroke={INK3} strokeWidth={1.5} pointerEvents="none" />
              })}
            </>}

            {/* Central seal mark */}
            <circle cx={gateCx} cy={gateCy} r={8} fill={PARCH} stroke={INK} strokeWidth={1.5} pointerEvents="none" />
            <text x={gateCx} y={gateCy + 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK}>{gi + 1}</text>

            {/* Gate label and pronunciation */}
            <text x={gateCx} y={gate.y - 12} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK} letterSpacing={1}>{gate.label}</text>
            <text x={gateCx} y={gate.y - 2} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">[{gate.pron}]</text>

            {/* Password and pronunciation */}
            <text x={gateCx} y={gate.y + gate.h + 16} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={GOLD} letterSpacing={1}>{gate.pw}</text>
            <text x={gateCx} y={gate.y + gate.h + 28} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">[{gate.pwPron}]</text>

            {/* Side labels */}
            {gi === 0 && <text x={38} y={gateCy} fontFamily="Cinzel, serif" fontSize={7} fill={INK3} transform={`rotate(-90, 38, ${gateCy})`}>ARCHONS OF THE AEONS</text>}
            {gi === 1 && <text x={38} y={gateCy} fontFamily="Cinzel, serif" fontSize={7} fill={INK3} transform={`rotate(-90, 38, ${gateCy})`}>ARCHONS OF THE SPHERE</text>}
            {gi === 2 && <text x={38} y={gateCy} fontFamily="Cinzel, serif" fontSize={7} fill={INK3} transform={`rotate(-90, 38, ${gateCy})`}>ARCHONS OF THE MIDST</text>}

            {/* Decorative corner marks */}
            <line x1={gateCx - gate.w / 2 - 5} y1={gate.y + gate.h} x2={gateCx - gate.w / 2 - 5} y2={gate.y + gate.h + 8} stroke={GOLD2} strokeWidth={1} pointerEvents="none" />
            <line x1={gateCx + gate.w / 2 + 5} y1={gate.y + gate.h} x2={gateCx + gate.w / 2 + 5} y2={gate.y + gate.h + 8} stroke={GOLD2} strokeWidth={1} pointerEvents="none" />
          </g>
        )
      })}

      <text x={cx} y={495} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>UNTO THE TREASURY OF LIGHT</text>
    </svg>
  )
}

/* ── Baptism Rite Diagram ── */
function BaptismDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  const baptisms = [
    { id: 'bt-water', label: 'Water', y: 80, color: '#3a6a8a' },
    { id: 'bt-fire', label: 'Fire', y: 165, color: '#8a3a20' },
    { id: 'bt-spirit', label: 'Spirit', y: 250, color: '#6a5030' },
    { id: 'bt-light', label: 'Light', y: 335, color: GOLD2 },
    { id: 'bt-mystery', label: 'Mystery', y: 420, color: INK }
  ]

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={30} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={2}>THE FIVE BAPTISMS</text>
      <line x1={cx} y1={55} x2={cx} y2={455} stroke={GOLD2} strokeWidth={1.5} strokeDasharray="6,3" pointerEvents="none" />

      {baptisms.map((b, i) => {
        const r = 26 + i * 3
        const el = elements.find(e => e.id === b.id)
        return (
          <g key={i}>
            {Array.from({ length: i + 1 }, (_, ri) => (
              <circle key={ri} cx={cx} cy={b.y} r={r + ri * 10} fill="none" stroke={ri === 0 ? b.color : INK3} strokeWidth={ri === 0 ? 2 : 0.8} pointerEvents="none" />
            ))}
            <circle cx={cx} cy={b.y} r={r} fill={PARCH} stroke={b.color} strokeWidth={2.5}
              className={`svg-clickable${selectedId === b.id ? ' selected' : ''}`}
              onClick={() => { if (el) onClick(b.id, el.label, el.detail) }} />
            <text x={cx} y={b.y + 5} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={16} fill={b.color}>{i + 1}</text>
            <text x={cx + r + 15} y={b.y + 4} fontFamily="Cinzel, serif" fontSize={11} fill={INK2} letterSpacing={1}>{i + 1}. {b.label}</text>
            <text x={cx - r - 15} y={b.y + 4} textAnchor="end" fontFamily="Cinzel, serif" fontSize={9} fill={INK3}>Seal {i + 1}</text>
            {i < 4 && <path d={`M${cx} ${b.y + r + 8} L${cx - 4} ${b.y + r + 16} M${cx} ${b.y + r + 8} L${cx + 4} ${b.y + r + 16}`} stroke={GOLD2} strokeWidth={1.5} pointerEvents="none" />}
          </g>
        )
      })}
      <text x={cx} y={485} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>UNTO THE TREASURY OF LIGHT</text>
    </svg>
  )
}

/* ── Hymn Diagram ── */
function HymnDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250, cy = 250
  const sections = [
    { id: 'hy-invocation', label: 'I. The Invocation', y: 130, el: elements.find(e => e.id === 'hy-invocation') },
    { id: 'hy-names', label: 'II. The Sacred Names', y: 240, el: elements.find(e => e.id === 'hy-names') },
    { id: 'hy-cipher', label: 'III. The Cipher Passage', y: 350, el: elements.find(e => e.id === 'hy-cipher') }
  ]

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={30} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={2}>THE GNOSTIC HYMN</text>
      <rect x={80} y={60} width={340} height={380} rx={8} fill="none" stroke={INK3} strokeWidth={1.5} pointerEvents="none" />
      <rect x={90} y={70} width={320} height={360} rx={4} fill="none" stroke={GOLD2} strokeWidth={0.8} pointerEvents="none" />

      {sections.map((section, i) => (
        <g key={i}>
          <rect x={110} y={section.y - 40} width={280} height={80} rx={4}
            fill={selectedId === section.id ? 'rgba(200,168,74,0.1)' : 'transparent'}
            stroke={selectedId === section.id ? GOLD2 : INK3} strokeWidth={1.5}
            className="svg-clickable"
            onClick={() => { if (section.el) onClick(section.id, section.el.label, section.el.detail) }} />
          <text x={cx} y={section.y - 15} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK2} letterSpacing={1}>{section.label}</text>
          <text x={cx} y={section.y + 8} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={9} fill={INK3} fontStyle="italic">{section.el?.brief || ''}</text>
          {/* Small cross shapes instead of Unicode symbols */}
          <SvgCross x={130} y={section.y} size={6} color={GOLD2} />
          <SvgCross x={370} y={section.y} size={6} color={GOLD2} />
        </g>
      ))}
      <line x1={130} y1={185} x2={370} y2={185} stroke={GOLD2} strokeWidth={0.5} pointerEvents="none" />
      <line x1={130} y1={295} x2={370} y2={295} stroke={GOLD2} strokeWidth={0.5} pointerEvents="none" />
    </svg>
  )
}

/* ── Seal Diagram Router ── */
function SealDiagram({ type, complexity, fatherName, cipher, jeuNum, onElementClick, selectedId, elements }: {
  type: string; complexity: number; fatherName: string; cipher: string; jeuNum: number
  onElementClick: (id: string, label: string, detail: string) => void; selectedId: string | null
  elements?: { id: string; label: string; brief: string; detail: string }[]
}) {
  const cx = 250, cy = 250
  const baseR = [80, 100, 120, 140, 160][Math.min(complexity, 5) - 1] || 100
  const props = { cx, cy, r: baseR, jeuNum, fatherName, cipher, complexity, onClick: onElementClick, selectedId }
  const elProps = { onClick: onElementClick, selectedId, elements: elements || [] }

  switch (type) {
    case 'cross-circle': return <CrossCircleSeal {...props} />
    case 'concentric': return <ConcentricSeal {...props} />
    case 'star': return <StarSeal {...props} />
    case 'radial': return <RadialSeal {...props} />
    case 'octagram': return <OctagramSeal {...props} />
    case 'treasury-overview': return <TreasuryOverviewDiagram {...elProps} />
    case 'archon-gate': return <ArchonGateDiagram {...elProps} />
    case 'baptism-rite': return <BaptismDiagram {...elProps} />
    case 'hymn': return <HymnDiagram {...elProps} />
    default: return <ConcentricSeal {...props} />
  }
}

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
export default function Home() {
  const [selectedEntry, setSelectedEntry] = useState('overview')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [revelation, setRevelation] = useState<{ title: string; detail: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRanks, setExpandedRanks] = useState<Record<string, boolean>>({ 'rank-1': true, 'rank-2': false, 'rank-3': false, 'rank-4': false, 'rank-5': false, 'specials': true })
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { setMounted(true) }, [])

  const toggleRank = useCallback((rank: string) => { setExpandedRanks(prev => ({ ...prev, [rank]: !prev[rank] })) }, [])
  const handleElementClick = useCallback((id: string, label: string, detail: string) => { setSelectedElement(id); setRevelation({ title: label, detail }) }, [])
  const handleEntrySelect = useCallback((id: string) => { setSelectedEntry(id); setSelectedElement(null); setRevelation(null) }, [])

  const currentSpecial = SPECIALS.find(s => s.id === selectedEntry)
  const currentTreasury = TREASURIES.find(t => t.id === selectedEntry)

  const filteredTreasuries = useMemo(() => {
    if (!searchQuery.trim()) return TREASURIES
    const q = searchQuery.toLowerCase()
    return TREASURIES.filter(t => t.title.toLowerCase().includes(q) || t.fatherName.toLowerCase().includes(q) || t.cipher.toLowerCase().includes(q) || t.rankName.toLowerCase().includes(q) || String(t.jeuNum).includes(q))
  }, [searchQuery])

  const groupedTreasuries = useMemo(() => {
    const groups: Record<string, TreasuryEntry[]> = {}
    filteredTreasuries.forEach(t => { const key = `rank-${t.rank}`; if (!groups[key]) groups[key] = []; groups[key].push(t) })
    return groups
  }, [filteredTreasuries])

  const filteredSpecials = useMemo(() => {
    if (!searchQuery.trim()) return SPECIALS
    const q = searchQuery.toLowerCase()
    return SPECIALS.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
  }, [searchQuery])

  return (
    <div className="treasury-app">
      {mounted && <Particles />}
      <div className="roller"><span className="roller-text">CODEX BRUCIANUS &middot; BODLEIAN LIBRARY OXFORD &middot; MS BRUCE 96</span></div>
      <header className="treasury-header">
        <div className="header-greek">Biblos tou Ieu &mdash; Sacred Diagrams of the Pleroma</div>
        <h1>The Book of Jeu</h1>
        <div className="header-sub">60 Treasuries of Light &middot; 5 Ranks of Fatherhood &middot; The Path of Ascent</div>
      </header>

      <div className="main-layout">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '\u25C0' : '\u25B6'}</div>
          {sidebarOpen && (
            <>
              <div className="sidebar-search">
                <input type="text" placeholder="Search treasuries..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="search-input" />
              </div>
              <div className="sidebar-section">
                <div className="section-header" onClick={() => toggleRank('specials')}>
                  <span className="section-arrow">{expandedRanks['specials'] ? '\u25BC' : '\u25B6'}</span>
                  <span className="section-title">Sacred Texts</span>
                </div>
                {expandedRanks['specials'] && filteredSpecials.map(s => (
                  <div key={s.id} className={`sidebar-item ${selectedEntry === s.id ? 'active' : ''}`} onClick={() => handleEntrySelect(s.id)}>
                    <span className="item-icon">{s.category === 'overview' ? '\u2720' : s.category === 'archon' ? '\u2694' : s.category === 'baptism' ? '\u224B' : '\u266B'}</span>
                    <span className="item-text">{s.title.length > 35 ? s.title.substring(0, 35) + '...' : s.title}</span>
                  </div>
                ))}
              </div>
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
                      <div key={t.id} className={`sidebar-item ${selectedEntry === t.id ? 'active' : ''}`} onClick={() => handleEntrySelect(t.id)}>
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

        <main className="content-area">
          <div className="entry-header page-enter" key={selectedEntry}>
            {currentSpecial && (<><h2>{currentSpecial.title}</h2><div className="entry-ref">Book of Jeu {currentSpecial.book === 1 ? 'I' : 'II'} &middot; {currentSpecial.chapter} &middot; {currentSpecial.folio}</div></>)}
            {currentTreasury && (<>
              <h2>{currentTreasury.title}</h2>
              <div className="entry-ref">Book of Jeu {currentTreasury.book === 1 ? 'I' : 'II'} &middot; {currentTreasury.chapter} &middot; {currentTreasury.folio}</div>
              <div className="entry-tags">
                <span className="tag">{currentTreasury.rankName}</span>
                <span className="tag diagram-tag">Jeu {currentTreasury.jeuNum}</span>
              </div>
            </>)}
          </div>

          <div className="content-grid">
            <div className="diagram-wrap">
              {currentSpecial && <SealDiagram type={currentSpecial.sealType} complexity={3} fatherName="" cipher="" jeuNum={0} onElementClick={handleElementClick} selectedId={selectedElement} elements={currentSpecial.elements} />}
              {currentTreasury && <SealDiagram type={currentTreasury.sealType} complexity={currentTreasury.sealComplexity} fatherName={currentTreasury.fatherName} cipher={currentTreasury.cipher} jeuNum={currentTreasury.jeuNum} onElementClick={handleElementClick} selectedId={selectedElement} />}
            </div>

            <div className="info-panel">
              <div className="info-section">
                <h3>Context</h3>
                <p>{currentSpecial?.desc || currentTreasury?.desc}</p>
              </div>

              {currentTreasury && (
                <div className="info-section">
                  <h3>Treasury Details</h3>
                  <div className="detail-grid">
                    <div className="detail-row"><span className="detail-label">Father</span><span className="detail-value">{currentTreasury.fatherName} <span className="pron">[{currentTreasury.fatherPron}]</span></span></div>
                    <div className="detail-row"><span className="detail-label">Cipher</span><span className="detail-value cipher">{currentTreasury.cipher} <span className="pron">[{currentTreasury.cipherPron}]</span></span></div>
                    <div className="detail-row"><span className="detail-label">Rank</span><span className="detail-value">{currentTreasury.rankName}</span></div>
                    <div className="detail-row"><span className="detail-label">Emanations</span><span className="detail-value">12</span></div>
                    <div className="detail-row"><span className="detail-label">Watchers</span><span className="detail-value">3</span></div>
                    <div className="detail-row"><span className="detail-label">Password</span><span className="detail-value password">{currentTreasury.password} <span className="pron">[{currentTreasury.passwordPron}]</span></span></div>
                  </div>
                </div>
              )}

              {currentSpecial && currentSpecial.lore.length > 0 && (
                <div className="info-section">
                  <h3>Teachings</h3>
                  {currentSpecial.lore.map((l, i) => (<div key={i} className="lore-card"><strong>{l.title}</strong><p>{l.body}</p></div>))}
                </div>
              )}

              {currentTreasury && (
                <div className="info-section">
                  <h3>Watchers</h3>
                  {currentTreasury.watchers.map((w, i) => (
                    <div key={i} className="watcher-item">
                      <span className="watcher-icon"><SvgCross x={0} y={8} size={5} color={GOLD2} /></span>
                      <span className="watcher-name">{w.name}</span>
                      <span className="watcher-pron">[{w.pronunciation}]</span>
                      <span className="watcher-gate">{w.gate}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={`revelation ${revelation ? 'revealed' : ''}`}>
                <span className="rev-label">Revelation</span>
                {revelation ? (<><span className="rev-title">{revelation.title}</span><span className="rev-detail">{revelation.detail}</span></>) : (<span className="rev-detail">Click upon any element within the diagram to receive its hidden teaching.</span>)}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="roller bottom"><span className="roller-text">Biblos tou Ieu &middot; THE TWO BOOKS OF JEU</span></div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════════════ */
function Particles() {
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({ id: i, left: `${(i * 5.3) % 100}%`, size: 1.5 + (i % 3), duration: 12 + (i % 8), delay: (i * 1.7) % 10 })), [])
  return (
    <div className="particle-field">
      {particles.map(p => (<div key={p.id} className="particle" style={{ left: p.left, width: `${p.size}px`, height: `${p.size}px`, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />))}
    </div>
  )
}
