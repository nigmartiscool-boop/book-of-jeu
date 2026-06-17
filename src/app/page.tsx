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
  sealComplexity: number; desc: string
  book: 1 | 2; chapter: string; folio: string
  password?: string; passwordPron?: string
}

type SacredCategory = 'overview' | 'cosmos' | 'liturgy' | 'hymn' | 'archon' | 'related' | 'names' | 'dialogue' | 'emanation' | 'spaces'

interface SacredEntry {
  id: string; title: string; category: SacredCategory
  desc: string; sealType: string
  book: 1 | 2; chapter: string; folio: string
  lore: { title: string; body: string }[]
  elements: { id: string; label: string; brief: string; detail: string }[]
  sacredText?: string[]
  pronunciations?: { name: string; pron: string }[]
}

const RANK_NAMES = ['', 'First Rank (Innermost)', 'Second Rank (Inner)', 'Third Rank (Middle)', 'Fourth Rank (Outer)', 'Fifth Rank (Outermost)']
const CATEGORY_LABELS: Record<SacredCategory, string> = {
  overview: 'Overview', cosmos: 'Cosmos Map', liturgy: 'Liturgy & Rites', hymn: 'Hymns & Prayers',
  archon: 'Archon Gates', related: 'Related Texts', names: 'Sacred Names', dialogue: 'Dialogues',
  emanation: 'Emanations', spaces: 'Three Spaces'
}
const CATEGORY_ICONS: Record<SacredCategory, string> = {
  overview: '\u2720', cosmos: '\u25CE', liturgy: '\u2699', hymn: '\u266B',
  archon: '\u2694', related: '\u2606', names: '\u2735', dialogue: '\u2756',
  emanation: '\u2734', spaces: '\u25C7'
}

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
   SACRED ENTRIES — Liturgy, Hymns, Dialogues, Related Texts, Names
   ═══════════════════════════════════════════════════ */
const SACRED_ENTRIES: SacredEntry[] = [
  /* ── OVERVIEW ── */
  {
    id: 'overview', title: 'The Treasury of the Light', category: 'overview',
    desc: 'The supreme abode of the Divine - source of all spiritual light. Structured as twelve concentric aeons each sealed by a guardian, enclosing three great curtains, and at the innermost, the Great Invisible: the unknowable source from which all light and life flows downward into creation.',
    sealType: 'treasury-overview', book: 1, chapter: 'Chapters 1-15', folio: 'ff. 1r-17v',
    lore: [
      { title: 'Origin of the Text', body: 'The Book of Jeu was preserved in the Codex Brucianus, discovered in Egypt and acquired by James Bruce in 1769. Written in Coptic, it likely translates earlier Greek originals from the 2nd-3rd century. The diagrams it contains are unique survivals of actual initiatory seals used in Sethian Gnostic ritual. The codex was bound with other Gnostic treatises including the Untitled Text, forming a comprehensive Sethian library.' },
      { title: 'The Pleroma', body: 'The Pleroma ("Fullness") is the totality of divine light, comprising all aeons in their perfection. The Treasury stands at its apex. The fall of Sophia and the formation of the material world are understood as a leak of light downward out of the Pleroma, which the Gnostic seeks to reverse through knowledge of the sacred names and seals.' },
      { title: 'The Twelve Aeons', body: 'Each of the twelve outer chambers is presided over by an aeon-ruler. Their names include Harmozel (har-MOH-zel, light of grace), Oroiael (or-OY-ah-el, light of thought), Daveithai (dah-VAY-thay, light of understanding), and Eleleth (el-EL-eth, light of perception). Each presides over a class of souls destined for a particular rank within the Treasury.' },
      { title: 'The Three Curtains', body: 'Between the twelve aeons and the inner sanctum lie three curtains, each woven from a different quality of divine light. The first curtain separates the outer courts from the middle region; the second divides the middle from the inner region; the third and most radiant curtain hangs before the Holy of Holies where the Great Invisible dwells.' }
    ],
    elements: [
      { id: 'ov-pleroma', label: 'The Pleroma', brief: 'The divine fullness', detail: 'The Pleroma encompasses all 60 treasuries arranged in five ranks of 12, each rank representing a degree of proximity to the Great Invisible Spirit at the center. The outermost rank (5th) is guarded by Archons; the innermost (1st) opens directly to the Treasury of Light.' },
      { id: 'ov-curtain1', label: 'First Curtain', brief: 'Outer veil of light', detail: 'The first curtain is woven from the light of the four luminaries - Harmozel, Oroiael, Daveithai, and Eleleth. It can only be passed by one who possesses the cipher names of the 5th Rank treasuries and has recited the password at each gate.' },
      { id: 'ov-curtain2', label: 'Second Curtain', brief: 'Middle veil of light', detail: 'The second curtain is woven from the light of the twelve aeons themselves. The initiate must have received the seal of each treasury in the 3rd and 4th ranks and must speak the three sacred vowels IAO, EIE, and OYO in succession.' },
      { id: 'ov-curtain3', label: 'Third Curtain', brief: 'Inner veil before the Invisible', detail: 'The third and final curtain is woven from the light of the Great Invisible Spirit itself. It parts only for one who has received all five baptisms and bears the seal of the Ineffable Mystery upon their forehead.' },
      { id: 'ov-invisible', label: 'The Great Invisible', brief: 'The unknowable source', detail: 'The Great Invisible Spirit is the first principle, the unnamable source of all that exists. It is called "Invisible" because no aeon has ever seen its form, and "Great" because it encompasses all things. Jeu, the True God, is its first emanation and the guardian of the Treasury.' }
    ]
  },

  /* ── COSMOS MAP ── */
  {
    id: 'cosmos-map', title: 'The Gnostic Cosmos', category: 'cosmos',
    desc: 'A complete map of the Gnostic cosmos — from the ineffable One at the center of all being, through the divine Triad, the Four Luminaries, the Twelve Aeons, the Boundary of the Pleroma, the domain of Yaldabaoth the Demiurge, the Seven Planetary Archons, the Twelve Zodiac Archons, the Wheel of Fate, and out into the material heavens of the Kenoma. Click any realm or entity on the map to receive its teaching. Every name is given with its pronunciation for the English-speaking initiate.',
    sealType: 'cosmos', book: 1, chapter: 'Composite Cosmology', folio: 'Codex Brucianus; NHC II,1; NHC III,2; NHC XI,3',
    lore: [
      { title: 'The Architecture of the Cosmos', body: 'The Gnostic cosmos is structured as a series of concentric spheres, radiating outward from the pure divine source at the center into increasing degrees of material density and spiritual darkness. At the absolute center sits the One — the ineffable, unknowable first principle that transcends all being and all naming. No eye has seen it; no tongue has named it. It is the still point around which all existence turns.' },
      { title: 'The Pleroma and the Kenoma', body: 'The cosmos is divided into two fundamental regions. The Pleroma ("Fullness") is the realm of divine light, containing the Triad, the Luminaries, the Aeons, and the 60 Treasuries of Light. The Kenoma ("Deficiency") is the realm of matter and fate, created by the Demiurge Yaldabaoth as a flawed copy of the Pleroma. Between them stands the Stauros — the Cross or Limit — which marks the boundary no Archon can cross.' },
      { title: 'The Descent and the Ascent', body: 'The cosmic drama unfolds in two movements. The Descent: Sophia falls from the Pleroma, producing Yaldabaoth, who creates the material world and traps divine light within mortal flesh. The Ascent: Christ descends through every realm, learning every name and cipher, then ascends again — opening the way for all souls who possess the gnosis to follow. The path of ascent reverses the path of descent, passing through the 60 treasuries from the outermost to the innermost.' },
      { title: 'The Material Heavens', body: 'Beyond the Pleroma, the material cosmos is ruled by the seven Planetary Archons (Saturn through Moon) and the twelve Zodiac Archons (Aries through Pisces). These beings govern the cycles of fate — Heimarmene — that bind souls to rebirth. The constellations of the material heavens are their domain, and every star is a seal upon the prison of flesh. Only by knowing the names and passwords can the soul pass through their gates.' }
    ],
    elements: [
      { id: 'cos-one', label: 'The One', brief: 'The ineffable first principle', detail: 'The One exists beyond being and non-being, beyond name and form. It is the source from which all things proceed and the destination to which all things return. No aeon has comprehended it; no word can describe it. In the Book of Jeu, the Great Invisible Spirit is its first revealed aspect — the One made barely knowable.' },
      { id: 'cos-triad', label: 'The Divine Triad', brief: 'Father, Barbelo, Autogenes', detail: 'From the One proceeds the divine Triad: the Father (the will to emanate), Barbelo [bar-BEH-loh] (the first thought, the womb of all creation), and the Autogenes [aw-TOJ-en-eez] (the self-begotten child, the first light). The Father contemplates; Barbelo receives the thought; the Autogenes brings it into being. These three are the first movement within the divine stillness.' },
      { id: 'cos-luminaries', label: 'The Four Luminaries', brief: 'Harmozel, Oroiael, Daveithai, Eleleth', detail: 'The Autogenes establishes four great Luminaries at the four quarters: Harmozel [har-MOH-zel] in the east (grace and truth), Oroiael [or-OY-ah-el] in the west (conception and perception), Daveithai [dah-VAY-thay] in the south (understanding and love), Eleleth [el-EL-eth] in the north (wisdom and prudence). Each Luminary sustains three of the twelve aeons with its light.' },
      { id: 'cos-aeons', label: 'The Twelve Aeons', brief: 'Armedon, Sigen, Matricula, and nine more', detail: 'Twelve aeons emanate from the four Luminaries, three per Luminary. They are: Armedon, Sigen, Matricula under Harmozel; Haram, Ei, Ogen under Oroiael; Mixanther, Astere, Aphria under Daveithai; Mirothea, Synel, Thales under Eleleth. These twelve aeons constitute the Pleromic Fullness — the complete divine realm. The 60 Treasuries of Light are distributed among them.' },
      { id: 'cos-boundary', label: 'The Stauros (Limit)', brief: 'The boundary of the Pleroma', detail: 'The Stauros [STOW-ros] — the Cross — is the limit that separates the Pleroma from the Kenoma. It is both a boundary and a protective wall: no Archon can cross it, no impure being can approach it. Sophia stands at this boundary after her fall, unable to re-enter the Pleroma she has defiled. Christ passes through the Stauros in both directions — descending and ascending — because he possesses the full gnosis.' },
      { id: 'cos-sophia', label: 'Sophia (Wisdom)', brief: 'The fallen aeon', detail: 'Sophia [so-FEE-ah], the youngest and most beautiful of the aeons, desired to emanate without her consort. Her unauthorized desire produced the lion-faced Demiurge Yaldabaoth — a being of power but without wisdom. Sophia was cast to the boundary of the Pleroma, where she grieves for her error and longs for redemption. Her story is the origin of all suffering — and the promise that even the deepest fall can be redeemed.' },
      { id: 'cos-yaldabaoth', label: 'Yaldabaoth the Demiurge', brief: 'Creator of the material world', detail: 'Yaldabaoth [yal-dah-BAH-oth] is the lion-faced serpent born from Sophia\'s error. Ignorant of his divine origin, he creates the material world as a flawed copy of the Pleroma. He appoints seven Archons over the planets and twelve over the zodiac, and he declares "I am a jealous God and there is no other" — thereby proving his ignorance, for if there were no other, of whom could he be jealous? He is also called Samael (the blind god) and Saklas (the fool).' },
      { id: 'cos-planets', label: 'The Seven Planetary Archons', brief: 'Rulers of the seven spheres', detail: 'Seven Archons govern the seven planetary spheres: Ialdabaoth [yal-dah-BAH-oth] (Saturn), Iao [EE-ah-oh] (Jupiter), Sabaoth [SAH-bah-oth] (Mars), Adonai [ah-DON-eye] (Sun), Eloai [el-OH-eye] (Venus), Oraios [or-AY-os] (Mercury), and Astaphaios [as-tah-FAY-os] (Moon). Each demands a password from the ascending soul. The seven sacred vowels — A, E, I, O, U, O, Silence — correspond to their seven spheres.' },
      { id: 'cos-zodiac', label: 'The Twelve Zodiac Archons', brief: 'Rulers of the zodiacal signs', detail: 'Twelve Archons govern the zodiac: Arioth (Aries), Thaum (Taurus), Gair (Gemini), Kark (Cancer), Leon (Leo), Parthen (Virgo), Mozn (Libra), Akrab (Scorpio), Qeshet (Sagittarius), Gadi (Capricorn), Deli (Aquarius), Nuni (Pisces). They shape the circumstances of each soul\'s incarnation — its body, its fate, its personality — keeping it bound to the wheel of rebirth.' },
      { id: 'cos-fate', label: 'Heimarmene (Fate)', brief: 'The wheel of destiny', detail: 'Heimarmene [hi-MAR-men-ee] is the inexorable wheel of fate that binds every soul to the cycle of birth, death, and rebirth. The Planetary Archons and Zodiac Archons are its agents, assigning each soul its destiny at birth. Only the gnosis — the knowledge of the sacred names and ciphers — can free the soul from Heimarmene and allow it to ascend past the Archon gates.' },
      { id: 'cos-kenoma', label: 'The Kenoma (Deficiency)', brief: 'The material world', detail: 'The Kenoma [ken-OH-mah] is the material cosmos — the realm of deficiency, darkness, and death. It is not evil in itself but is a flawed copy of the Pleroma, created by a being who did not understand what he was copying. The constellations in the material heavens are the seals of the Archons, and every star is a bar in the prison of flesh. Yet even here, fragments of divine light are hidden, awaiting the gnosis that will set them free.' },
      { id: 'cos-treasuries', label: 'The 60 Treasuries of Light', brief: 'The path of ascent through the Pleroma', detail: 'Within the Pleroma, 60 Treasuries of Light are arranged in five ranks of twelve. The soul must ascend through all 60 in reverse order — from the 60th (outermost) to the 1st (innermost) — speaking the name, cipher, and password at each gate. The 60 Treasury dots orbiting the Aeon ring on this map represent this path of ascent. Each dot is a world, a gate, and a test of knowledge.' },
      { id: 'cos-ascent', label: 'The Path of Ascent', brief: 'From matter to the divine', detail: 'The golden line curving upward on this map traces the Path of Ascent — the route Christ opened through all the realms, from the depths of the Kenoma back to the One. The dashed brown line traces Sophia\'s Descent — the path of the fall that created the material world. Every soul must choose: to follow Sophia downward into matter, or to follow Christ upward into light.' }
    ],
    pronunciations: [
      { name: 'Pleroma', pron: 'ple-ROH-mah' },
      { name: 'Kenoma', pron: 'ken-OH-mah' },
      { name: 'Stauros', pron: 'STOW-ros' },
      { name: 'Heimarmene', pron: 'hi-MAR-men-ee' },
      { name: 'Barbelo', pron: 'bar-BEH-loh' },
      { name: 'Autogenes', pron: 'aw-TOJ-en-eez' },
      { name: 'Yaldabaoth', pron: 'yal-dah-BAH-oth' },
      { name: 'Harmozel', pron: 'har-MOH-zel' },
      { name: 'Oroiael', pron: 'or-OY-ah-el' },
      { name: 'Daveithai', pron: 'dah-VAY-thay' },
      { name: 'Eleleth', pron: 'el-EL-eth' },
      { name: 'Sophia', pron: 'so-FEE-ah' }
    ]
  },

  /* ── DIALOGUES ── */
  {
    id: 'revelation', title: 'The Revelation of Jeu', category: 'dialogue',
    desc: 'The First Book of Jeu opens with the risen Christ appearing to his disciples on the Mount of Olives. He reveals the structure of the sixty treasuries, the names of the Fathers, the ciphers, and the passwords by which the soul may ascend through each gate after death. This is the foundational revelation from which all subsequent teachings derive.',
    sealType: 'dialogue', book: 1, chapter: 'Chapters 1-2', folio: 'ff. 1r-3v',
    lore: [
      { title: 'The Setting', body: 'Twelve years after the resurrection, the disciples gathered on the Mount of Olives. They asked Jesus: "Lord, teach us the way that we may ascend to the Treasury of Light, for we fear lest the Archons of the Aeons, the Archons of the Sphere, and the Archons of the Midst shall seize our souls and cast them into the outer darkness." Jesus rejoiced and began to reveal the mysteries.' },
      { title: 'The Structure Revealed', body: 'Jesus described how the Treasury of Light is surrounded by five ranks of twelve treasuries each. Each treasury is presided over by a Father who holds a cipher name. Three watchers guard the gates of each treasury, and twelve emanations radiate from each Father. The soul must know the name, the cipher, and the password for every treasury through which it passes.' },
      { title: 'The Command to Seal', body: 'Jesus commanded his disciples: "Seal yourselves with this seal while the cipher is in your hand. Write the cipher upon a pure white stone and hold it in your left hand as you pass through the gates. Recite the name of the Father three times, and the watchers will open the gates before you."' }
    ],
    sacredText: [
      'It came to pass, when Jesus had risen from the dead, that he sat on the Mount of Olives and his disciples gathered around him, saying: Lord, reveal to us the mysteries of the Treasury of Light, that we may ascend unto it when we depart from the body.',
      'And Jesus rejoiced in spirit and said: Blessed are you, for you have asked concerning the greatest of mysteries. Hearken then, and I will reveal to you the names and the ciphers and the seals of every treasury, from the outermost even unto the innermost, that no Archon may have power over your souls.',
      'He who would ascend unto the Treasury must first know the names of the sixty Fathers, and the ciphers which they hold, and the passwords which must be spoken at each gate. For without these, the watchers will not open the gates, and the Archons will seize the soul and cast it into the cycle of rebirth.',
      'The first Father is Pigeradaphtha Jeu, and his cipher is Maiion. The second is Saphaed Jeu, and his cipher is Adonai. The third is Abraoth Jeu, and his cipher is Sabaoth. So also for each of the sixty, the name and cipher must be known and spoken in the proper order.'
    ],
    elements: [
      { id: 'dr-mount', label: 'The Mount of Olives', brief: 'Where the revelation occurred', detail: 'The traditional site of ascension, where the risen Christ appeared to his disciples. In Gnostic tradition, this mountain symbolizes the boundary between the material world below and the spiritual realms above.' },
      { id: 'dr-disciples', label: 'The Twelve Disciples', brief: 'Recipients of the revelation', detail: 'The twelve disciples correspond to the twelve aeons of the Pleroma. Each disciple represents a class of soul that will ascend through a different rank of treasuries. Their questions drive the revelation forward.' },
      { id: 'dr-command', label: 'The Command to Seal', brief: 'Instructions for the initiate', detail: 'Jesus commands each disciple to inscribe the cipher names upon a white stone and carry it through the gates. This physical token represents the spiritual knowledge that grants passage. The seal must be made with pure intent.' },
      { id: 'dr-warning', label: 'The Warning', brief: 'Dangers of the Archons', detail: 'Jesus warns that without the correct names and ciphers, the Archons of the three gates will seize the soul and return it to the cycle of rebirth. The three Archon gates - of the Aeons, of the Sphere, and of the Midst - are the greatest obstacles on the path of ascent.' }
    ]
  },
  {
    id: 'dialogue-treasuries', title: 'The Dialogue on the Treasuries', category: 'dialogue',
    desc: 'Following the initial revelation, the disciples question Jesus in detail about each rank of treasuries. Jesus explains the nature of the emanations, the role of the watchers, and the significance of each cipher. This dialogue provides the theological framework for understanding why the treasuries are arranged as they are.',
    sealType: 'dialogue', book: 1, chapter: 'Chapters 3-8', folio: 'ff. 3v-10r',
    lore: [
      { title: 'The Five Ranks Explained', body: 'Jesus teaches that the five ranks correspond to five degrees of divine light. The innermost rank shines with the pure light of the Great Invisible; the outermost with reflected light filtered through many veils. Each rank contains twelve treasuries, and each treasury is a complete world unto itself, with its own emanations, watchers, and gatekeepers.' },
      { title: 'The Nature of the Emanations', body: 'Each Father within a treasury produces twelve emanations - spiritual forces that radiate outward like light from a flame. These emanations are not separate beings but extensions of the Father\'s being. They fill the treasury with divine presence and maintain the seal that keeps the Archons at bay.' },
      { title: 'The Role of the Watchers', body: 'Three watchers stand at each treasury gate. The first watcher examines the cipher; the second examines the seal; the third examines the purity of the soul. All three must be satisfied before the gate opens. The watchers are not enemies of the soul but guardians of the Treasury who ensure that only those properly prepared may enter.' }
    ],
    sacredText: [
      'And John asked: Lord, how many are the treasuries of Light? And Jesus answered: There are sixty treasuries, arranged in five ranks of twelve. The innermost twelve are of the First Rank, and they shine with the purest light, nearest to the Great Invisible Spirit.',
      'Each treasury has a Father who presides over it, and each Father holds a cipher which is the key to his gate. Twelve emanations proceed from each Father, filling the treasury with his light. And three watchers guard the approaches, that no impure soul may enter.',
      'Mary asked: Lord, why are the treasuries arranged in ranks? And Jesus said: Because the light diminishes as it radiates outward from the source. The innermost treasuries shine with direct light; the outermost with light that has passed through many veils. Each rank is a degree of separation from the Great Invisible, and the soul must ascend through all five to reach the Treasury of Light.'
    ],
    elements: [
      { id: 'dt-ranks', label: 'The Five Ranks', brief: 'Degrees of divine light', detail: 'The five ranks represent decreasing proximity to the divine source. The 1st Rank (innermost) treasuries contain Fathers who see the Great Invisible directly; the 5th Rank (outermost) Fathers see only reflected light through multiple veils.' },
      { id: 'dt-emanations', label: 'The Emanations', brief: 'Twelve rays per Father', detail: 'Each Father produces twelve emanations, analogous to the twelve rays of a crown. These emanations are named: Phaethon, Omorpha, Aphroph, Saphapha, Mareph, Pigeraph, Thalmaoph, Bathraoth, Eratha, Armatha, Pharmatha, and Aphreph.' },
      { id: 'dt-watchers', label: 'The Watchers', brief: 'Gate guardians', detail: 'Three watchers guard each treasury gate. The first examines the cipher name inscribed on the stone; the second verifies the seal upon the initiate; the third judges the purity of the soul. Only when all three are satisfied does the gate open.' }
    ]
  },

  /* ── LITURGY & RITES ── */
  {
    id: 'baptism', title: 'The Rite of the Five Seals', category: 'liturgy',
    desc: 'The Second Book of Jeu preserves a nearly complete ritual script for a fivefold baptism - the central sacrament of the Jeu community. The initiate receives five successive baptisms of water, fire, spirit, light, and the ineffable mystery, each accompanied by invocations, seal-inscriptions, and sacred names that must be spoken in precise Coptic formulas.',
    sealType: 'baptism-rite', book: 2, chapter: 'Chapters 42-52', folio: 'ff. 103r-114v',
    lore: [
      { title: 'The Five Baptisms', body: 'The rite progresses through five baptisms, each more exalted than the last. The baptism of water cleanses the body; fire purifies the soul; the spirit consecrates the mind; light illuminates the inner vision; and the ineffable mystery unites the initiate with the divine source. Each baptism requires its own seal, its own invocation, and its own sacred name.' },
      { title: 'Ritual Setting', body: 'The baptism takes place in a specially prepared chamber with a font of living (flowing) water. The officiant is a priest who has himself received all five seals. The initiate fasts for three days, recites preparatory prayers, and renounces the Archons of the Aeons, the Sphere, and the Midst before the first immersion.' },
      { title: 'The Renunciation', body: 'Before the first baptism, the initiate must face the four directions and renounce the Archon of each quarter by name. This renunciation severs the soul\'s allegiance to the cosmic powers and declares its intention to ascend to the Treasury of Light. The names of the Archons are spoken aloud, each followed by the formula: "I renounce thee, N., and all thy works."' }
    ],
    sacredText: [
      'The priest shall lead the candidate to the font of living water and shall say: Renounce the Archon of the Aeons, whose name is Paraphax, and all his works. And the candidate shall say: I renounce thee, Paraphax, and all thy works.',
      'Renounce the Archon of the Sphere, whose name is Arthax, and all his works. And the candidate shall say: I renounce thee, Arthax, and all thy works.',
      'Renounce the Archon of the Midst, whose name is Aphraphax, and all his works. And the candidate shall say: I renounce thee, Aphraphax, and all thy works.',
      'Then the priest shall immerse the candidate in the water, saying: I baptize thee with the baptism of water, in the name of Iao Sabaoth [EE-ah-oh SAH-bah-oth], that thou mayest be cleansed of all impurity and made worthy to receive the seal of fire.',
      'And when the candidate arises from the water, the priest shall anoint the forehead with oil, saying: Receive the seal of water, and may the watchers of the first gate permit thee to pass. And the candidate shall say: Amen [ah-MEN].',
      'Then the priest shall lay his hands upon the candidate and breathe upon the forehead, saying: Receive the baptism of fire, in the name of Adonai Elohim [ah-doh-NYE el-oh-HEEM], that thy soul may be purified as gold in the furnace.',
      'And the candidate shall feel the heat of the spirit within, and shall say: I receive the fire. And the priest shall inscribe the seal of fire upon the candidate\'s right hand, saying: May this seal protect thee from the flames of judgment.',
      'The third baptism is of the Holy Spirit. The priest shall speak: Receive the baptism of the Holy Spirit, in the name of Eie Azaphax [AY-ee-ay AZ-ah-faks], that thy mind may be opened to perceive the mysteries. And the candidate shall speak in tongues as the spirit gives utterance.',
      'The fourth baptism is of light. The priest shall raise his hands toward the east and say: Receive the baptism of light, in the name of the Great Invisible Spirit, that thine eyes may be opened to see the Treasury. And a great light shall appear before the candidate\'s inner vision.',
      'The fifth baptism is of the Ineffable Mystery. Of this baptism nothing may be spoken, save that the candidate is united with the divine source and shall never again be subject to the Archons. The seal of this baptism is inscribed upon the heart and cannot be removed by any power.'
    ],
    elements: [
      { id: 'bt-water', label: 'First Baptism: Water', brief: 'Cleansing of the body', detail: 'The initiate is immersed in living water while the priest invokes Iao Sabaoth. This baptism cleanses the physical body and severs the soul\'s attachment to material impurity. The seal of water is inscribed upon the forehead.' },
      { id: 'bt-fire', label: 'Second Baptism: Fire', brief: 'Purification of the soul', detail: 'The priest breathes upon the initiate and invokes Adonai Elohim. The soul is purified as gold in a furnace. The seal of fire is inscribed upon the right hand as protection against judgment.' },
      { id: 'bt-spirit', label: 'Third Baptism: Spirit', brief: 'Consecration of the mind', detail: 'The priest invokes Eie Azaphax and the initiate receives the Holy Spirit. The mind is opened to perceive spiritual mysteries. The initiate may speak in tongues. The seal of spirit is inscribed upon the left hand.' },
      { id: 'bt-light', label: 'Fourth Baptism: Light', brief: 'Illumination of inner vision', detail: 'The priest raises hands toward the east and invokes the Great Invisible Spirit. The initiate\'s inner vision is opened and the Treasury of Light appears before them. The seal of light is inscribed between the eyes.' },
      { id: 'bt-mystery', label: 'Fifth Baptism: The Ineffable Mystery', brief: 'Union with the divine', detail: 'The fifth and final seal cannot be described in words. It is inscribed upon the heart and unites the initiate with the divine source. One who has received this seal can never again be seized by the Archons.' }
    ]
  },
  {
    id: 'eucharist', title: 'The Eucharist Rite', category: 'liturgy',
    desc: 'Following the five baptisms, the newly sealed initiate participates in the sacred meal - the Eucharist of Light. This rite transforms bread and wine into tokens of the Pleroma, allowing the community to partake in the divine substance of the Treasury. The prayers spoken over the elements invoke the names of the four luminaries and the Great Invisible Spirit.',
    sealType: 'liturgy', book: 2, chapter: 'Chapter 53', folio: 'ff. 115r-117v',
    lore: [
      { title: 'The Sacred Meal', body: 'The Eucharist of Light differs substantially from orthodox Christian communion. The bread represents not the body of Christ but the substance of the Pleroma - the divine fullness that fills the Treasury. The wine represents not the blood of sacrifice but the light of the Great Invisible Spirit, which flows downward through all the treasuries like a river of illumination.' },
      { title: 'The Four Luminaries', body: 'The prayer over the bread invokes the four luminaries of the Pleroma: Harmozel (har-MOH-zel), Oroiael (or-OY-ah-el), Daveithai (dah-VAY-thay), and Eleleth (el-EL-eth). These four beings stand at the four corners of the Treasury and their light sustains all existence. By invoking them over the bread, the priest draws their light into the elements.' },
      { title: 'Communion Formula', body: 'After the prayers, each communicant approaches the altar, holds the bread in the left hand (where the seal of fire was inscribed) and the cup in the right hand (where the seal of spirit was inscribed). The formula spoken is: "I receive the light of the Pleroma into my body, that it may be a temple of the Invisible Spirit."' }
    ],
    sacredText: [
      'The priest shall take the bread and raise it toward the east, saying: We invoke thee, O Harmozel, light of grace; O Oroiael, light of thought; O Daveithai, light of understanding; O Eleleth, light of perception. Send forth thy light into this bread, that it may become the substance of the Pleroma for thy servants.',
      'And the priest shall break the bread into twelve pieces, one for each of the aeons, saying: As the Father has divided his light among the twelve, so do we partake of the fullness together.',
      'Then the priest shall take the cup and raise it toward the east, saying: We invoke thee, O Great Invisible Spirit, who art before all aeons. Let the light of the Treasury flow into this cup as a river of illumination, that we may drink of thy radiance and be filled with thy presence.',
      'And each communicant shall come forward and receive the bread in the left hand and the cup in the right hand, and shall say: I receive the light of the Pleroma into my body, that it may be a temple of the Invisible Spirit. Amen [ah-MEN]. Amen [ah-MEN]. Amen [ah-MEN].'
    ],
    elements: [
      { id: 'eu-bread', label: 'The Bread of the Pleroma', brief: 'Substance of divine fullness', detail: 'The bread is consecrated by invoking the four luminaries. It represents the substance of the Pleroma - the divine fullness that fills all the treasuries. Twelve pieces are broken, one for each aeon.' },
      { id: 'eu-wine', label: 'The Cup of Light', brief: 'River of illumination', detail: 'The wine is consecrated by invoking the Great Invisible Spirit. It represents the light of the Treasury flowing downward like a river of illumination through all the ranks of treasuries.' },
      { id: 'eu-luminaries', label: 'The Four Luminaries', brief: 'Harmozel, Oroiael, Daveithai, Eleleth', detail: 'The four luminaries stand at the four corners of the Treasury. Harmozel represents grace, Oroiael represents thought, Daveithai represents understanding, and Eleleth represents perception. Their combined light sustains all existence within the Pleroma.' },
      { id: 'eu-formula', label: 'The Communion Formula', brief: 'Reception of divine light', detail: 'Each communicant holds the bread in the sealed left hand and the cup in the sealed right hand, saying: "I receive the light of the Pleroma into my body, that it may be a temple of the Invisible Spirit." The triple Amen seals the communion.' }
    ]
  },
  {
    id: 'ascent', title: 'The Rite of Ascent', category: 'liturgy',
    desc: 'The Rite of Ascent is the supreme ritual of the Book of Jeu - a guided meditation and liturgical drama in which the initiate, while still living, experiences the soul\'s passage through the three Archon gates and all sixty treasuries of Light. This rite serves as both rehearsal and empowerment for the soul\'s journey after death.',
    sealType: 'ascent', book: 2, chapter: 'Chapters 55-60', folio: 'ff. 118r-126v',
    lore: [
      { title: 'The Living Ascent', body: 'Unlike the post-mortem ascent that every soul must undertake, the Rite of Ascent allows the initiate to experience the journey while still in the body. This living ascent imprints the pathways upon the soul, making the post-mortem journey automatic - the soul will follow the familiar path as naturally as a river follows its course.' },
      { title: 'The Three Gates', body: 'The ascent begins at the three Archon gates: the Gate of the Aeons (guarded by Paraphax), the Gate of the Sphere (guarded by Arthax), and the Gate of the Midst (guarded by Aphraphax). At each gate, the initiate must speak the correct password and display the appropriate seal. Failure at any gate results in the soul being seized and returned to rebirth.' },
      { title: 'The Sixty Treasuries', body: 'Beyond the three gates, the soul must pass through all sixty treasuries in reverse order - from the 60th (outermost) to the 1st (innermost). At each treasury, the initiate calls upon the Father by name, displays the cipher, and recites the password. The watchers examine the seals upon the initiate\'s body and, finding them valid, open the gates.' }
    ],
    sacredText: [
      'The priest shall lead the initiate to the center of the chamber and shall say: Close thine eyes and behold with the inner vision. See before thee the three gates of the Archons, rising like mountains of darkness against the light of the Treasury above.',
      'Approach the first gate, the Gate of the Aeons, where Paraphax [PAR-ah-faks] stands guard. Speak the password: IAO SABAOTH [EE-ah-oh SAH-bah-oth]. And the gate shall open, for the Archon cannot refuse the name of the true God.',
      'Approach the second gate, the Gate of the Sphere, where Arthax [AR-thaks] stands guard. Speak the password: ADONAI ELOHIM [ah-doh-NYE el-oh-HEEM]. And the gate shall open, for the Archon must yield to the name of the Lord of Hosts.',
      'Approach the third gate, the Gate of the Midst, where Aphraphax [ah-FRAH-faks] stands guard. Speak the password: EIE AZAPHAX [AY-ee-ay AZ-ah-faks]. And the gate shall open, for the Archon is bound by the cipher of the Ineffable.',
      'Now ascend through the treasuries, calling upon each Father by name. Begin with the sixtieth, Proator Jeu [pro-AY-tor jyoo], and say: I invoke thee, Proator Jeu, by thy cipher Proator - open thy gate that my soul may pass through. Continue thus through all sixty treasuries until thou comest to the first, Pigeradaphtha Jeu, and the Treasury of Light is before thee.',
      'And when thou hast passed through all sixty treasuries, thou shalt behold the three curtains of light. Pass through them by the power of the five seals, and thou shalt stand before the Great Invisible Spirit in the Treasury of Light. And the Great Invisible shall say: Welcome, my child, for thou hast overcome the world.'
    ],
    elements: [
      { id: 'as-gate1', label: 'Gate of the Aeons', brief: 'First Archon gate', detail: 'Guarded by Paraphax [PAR-ah-faks]. Password: IAO SABAOTH [EE-ah-oh SAH-bah-oth]. This gate separates the material cosmos from the lower spiritual realms.' },
      { id: 'as-gate2', label: 'Gate of the Sphere', brief: 'Second Archon gate', detail: 'Guarded by Arthax [AR-thaks]. Password: ADONAI ELOHIM [ah-doh-NYE el-oh-HEEM]. This gate separates the planetary spheres from the aeonic realms.' },
      { id: 'as-gate3', label: 'Gate of the Midst', brief: 'Third Archon gate', detail: 'Guarded by Aphraphax [ah-FRAH-faks]. Password: EIE AZAPHAX [AY-ee-ay AZ-ah-faks]. This gate separates the lower aeons from the Treasury of Light.' },
      { id: 'as-treasuries', label: 'The Sixty Treasuries', brief: 'Reverse ascent through all ranks', detail: 'The initiate must pass through all 60 treasuries from the 60th to the 1st, calling upon each Father by name and displaying the cipher. This reverse journey mirrors the outward flow of creation and returns the soul to its source.' },
      { id: 'as-curtains', label: 'The Three Curtains', brief: 'Final veils before the Treasury', detail: 'Beyond the 60 treasuries lie the three curtains of light. The seal of water opens the first, the seal of fire the second, and the seal of the mystery the third. Beyond the third curtain shines the Treasury of Light itself.' }
    ]
  },
  {
    id: 'sealing', title: 'The Sealing Ritual', category: 'liturgy',
    desc: 'The Sealing Ritual is performed immediately after the five baptisms. The priest inscribes five protective seals upon the initiate\'s body - upon the forehead, the right hand, the left hand, between the eyes, and upon the heart. Each seal corresponds to one of the five baptisms and carries the power to open a specific class of gates in the post-mortem ascent.',
    sealType: 'liturgy', book: 2, chapter: 'Chapters 51-52', folio: 'ff. 112r-114v',
    lore: [
      { title: 'The Five Seals', body: 'The five seals are the initiate\'s passport through the Treasury. Each seal is inscribed with sacred characters and anointed with oil. The seal of water goes on the forehead, fire on the right hand, spirit on the left hand, light between the eyes, and the mystery upon the heart. Together they form a complete spiritual armor.' },
      { title: 'The Triple Sealing', body: 'Each seal is applied three times - once in the name of the Father, once in the name of the cipher, and once in the name of the emanation. This triple application ensures that the seal corresponds to the three aspects of each treasury: the presiding Father, the key (cipher), and the power (emanation) that enforces it.' },
      { title: 'Protective Power', body: 'The seals render the initiate invisible to the Archons. When an Archon examines a sealed soul, it sees only the light of the seal and cannot perceive the soul beneath. This is why the correct inscription is essential - a flawed seal would be transparent to the Archons, who would then seize the soul.' }
    ],
    sacredText: [
      'The priest shall anoint the forehead of the initiate with holy oil, saying: I seal thee with the seal of water, in the name of Iao [EE-ah-oh], the Father, the cipher, and the emanation. Three times I seal thee: Iao, Iao, Iao. May the watchers of the first gate recognize this seal and permit thee to pass.',
      'The priest shall anoint the right hand, saying: I seal thee with the seal of fire, in the name of Sabaoth [SAH-bah-oth], the Father, the cipher, and the emanation. Three times I seal thee: Sabaoth, Sabaoth, Sabaoth. May the watchers of the second gate recognize this seal and permit thee to pass.',
      'The priest shall anoint the left hand, saying: I seal thee with the seal of spirit, in the name of Adonai [ah-doh-NYE], the Father, the cipher, and the emanation. Three times I seal thee: Adonai, Adonai, Adonai. May the watchers of the third gate recognize this seal and permit thee to pass.',
      'The priest shall anoint between the eyes, saying: I seal thee with the seal of light, in the name of the Great Invisible Spirit. Three times I seal thee: Invisible, Invisible, Invisible. May the curtains of the Treasury part before thee.',
      'The priest shall place his hand upon the initiate\'s heart, saying: I seal thee with the seal of the Ineffable Mystery, which no tongue may speak and no hand may write. This seal is inscribed by the Spirit itself upon thy heart, and it shall be thy final passport into the Treasury of Light.'
    ],
    elements: [
      { id: 'sl-forehead', label: 'Seal of Water (Forehead)', brief: 'First seal - cleansing', detail: 'Inscribed on the forehead in the name of Iao. The triple sealing: Iao, Iao, Iao. Opens the gates of the first rank of treasuries.' },
      { id: 'sl-right', label: 'Seal of Fire (Right Hand)', brief: 'Second seal - purification', detail: 'Inscribed on the right hand in the name of Sabaoth. The triple sealing: Sabaoth, Sabaoth, Sabaoth. Opens the gates of the second and third ranks.' },
      { id: 'sl-left', label: 'Seal of Spirit (Left Hand)', brief: 'Third seal - consecration', detail: 'Inscribed on the left hand in the name of Adonai. The triple sealing: Adonai, Adonai, Adonai. Opens the gates of the fourth rank.' },
      { id: 'sl-eyes', label: 'Seal of Light (Between Eyes)', brief: 'Fourth seal - illumination', detail: 'Inscribed between the eyes in the name of the Great Invisible Spirit. The triple sealing: Invisible, Invisible, Invisible. Parts the three curtains of the Treasury.' },
      { id: 'sl-heart', label: 'Seal of Mystery (Heart)', brief: 'Fifth seal - ineffable union', detail: 'Inscribed upon the heart by the Spirit itself. No tongue may speak it, no hand may write it. This is the final passport into the Treasury of Light, and no Archon can contest it.' }
    ]
  },

  /* ── HYMNS & PRAYERS ── */
  {
    id: 'hymn-invisible', title: 'Hymn to the Great Invisible', category: 'hymn',
    desc: 'The opening invocation of the Jeu liturgy, addressed to the Great Invisible Spirit - the unknowable first principle that stands before all aeons. This hymn is sung before every ritual and is considered the most sacred of all the Gnostic chants. It cannot be translated; only the original Coptic vowel-sequences carry the full power of the invocation.',
    sealType: 'hymn', book: 1, chapter: 'Chapter 1', folio: 'ff. 1r-2v',
    lore: [
      { title: 'The Unknowable God', body: 'The Great Invisible Spirit cannot be named, seen, or comprehended by any being within the Pleroma. Even Jeu, the True God and first emanation, has never seen the Spirit\'s form. The hymn therefore uses a series of negations and paradoxes: "Thou art before all, yet after nothing; thou art within all, yet outside everything; thou art seen by none, yet beholdest all."' },
      { title: 'The Vowel Sequences', body: 'The hymn contains seven sacred vowel sequences: IAO, EIE, OYO, AOE, UOA, EOA, and the ineffable seventh. Each sequence resonates with a different rank of the Treasury and must be intoned with precise vowel length. IAO [EE-ah-oh] opens the first three ranks; EIE [AY-ee-ay] opens the fourth; OYO [oh-EE-oh] opens the fifth.' }
    ],
    sacredText: [
      'I invoke thee, O Invisible One, who art before all aeons,',
      'Whom no eye has seen and no tongue has named,',
      'Who art the source of all light and the wellspring of all life,',
      'Open the way for my soul through the treasuries of light.',
      '',
      'Iao [EE-ah-oh] - I call upon thy first name, O Father of the Treasury,',
      'Eie [AY-ee-ay] - I call upon thy second name, O Guardian of the Gates,',
      'Oyo [oh-EE-oh] - I call upon thy third name, O Opener of the Way.',
      '',
      'Thou art before all, yet after nothing;',
      'Thou art within all, yet outside everything;',
      'Thou art seen by none, yet beholdest all.',
      'Open the way for my soul, O Great Invisible Spirit,',
      'That I may ascend unto the Treasury of Light.'
    ],
    elements: [
      { id: 'hi-invocation', label: 'The Invocation', brief: 'Opening prayer', detail: 'The hymn opens with a direct address to the Great Invisible Spirit, using paradoxes and negations to describe the indescribable. Each line builds in intensity, calling upon the Spirit to open the way for the soul\'s ascent.' },
      { id: 'hi-iao', label: 'The Name IAO', brief: 'First sacred vowel sequence', detail: 'IAO [EE-ah-oh] is the supreme name of the divine in Gnostic tradition. It combines three vowel-sounds representing the three aspects of divinity: the Father (I), the Mother (A), and the Child (O). This name opens the gates of the first three ranks of treasuries.' },
      { id: 'hi-eie', label: 'The Name EIE', brief: 'Second sacred vowel sequence', detail: 'EIE [AY-ee-ay] is the name that opens the fourth rank of treasuries. Its palindromic structure (read the same forward and backward) symbolizes the eternal, self-reflective nature of the divine.' },
      { id: 'hi-oyo', label: 'The Name OYO', brief: 'Third sacred vowel sequence', detail: 'OYO [oh-EE-oh] is the name that opens the fifth and innermost rank of treasuries. Like EIE, it is a palindrome, but its sounds are deeper and more resonant, symbolizing the profound mystery at the heart of the Pleroma.' },
      { id: 'hi-paradox', label: 'The Paradoxes', brief: 'Divine negations', detail: 'The hymn uses divine negations (apophatic theology) to describe the Great Invisible: "before all yet after nothing," "within all yet outside everything," "seen by none yet beholdest all." These paradoxes point toward a reality that transcends all categories of human understanding.' }
    ]
  },
  {
    id: 'hymn-aeons', title: 'The Hymn of the Aeons', category: 'hymn',
    desc: 'A choral hymn sung in twelve parts, each part dedicated to one of the twelve aeons of the Pleroma. The hymn describes the qualities and functions of each aeon-ruler and petitions them to intercede for the ascending soul. In ritual performance, twelve priests each sing one verse while standing at one of twelve stations arranged in a circle.',
    sealType: 'hymn', book: 1, chapter: 'Chapter 35', folio: 'ff. 25r-27v',
    lore: [
      { title: 'The Twelve Aeon-Rulers', body: 'Each of the twelve aeons is governed by a ruler whose name encodes their function. Harmozel (har-MOH-zel) is the light of grace; Oroiael (or-OY-ah-el) is the light of thought; Daveithai (dah-VAY-thay) is the light of understanding; Eleleth (el-EL-eth) is the light of perception. The remaining eight rulers govern the intermediate regions between these four cardinal luminaries.' },
      { title: 'Ritual Performance', body: 'The hymn is performed by twelve priests standing in a circle, each facing outward toward one of the twelve directions. Each priest sings his verse and then turns inward, symbolizing the soul\'s turn from the outer world toward the inner Treasury. By the end of the hymn, all twelve priests face inward, representing the soul\'s arrival at the center of the Pleroma.' }
    ],
    sacredText: [
      'I. Harmozel [har-MOH-zel], light of grace, shine upon my path; open the first gate that my soul may enter in.',
      'II. Oroiael [or-OY-ah-el], light of thought, illuminate my mind; open the second gate that my soul may understand.',
      'III. Daveithai [dah-VAY-thay], light of understanding, grant me wisdom; open the third gate that my soul may comprehend.',
      'IV. Eleleth [el-EL-eth], light of perception, open my eyes; open the fourth gate that my soul may see.',
      'V. Phaoph [FAY-off], light of the east, guide my steps; open the fifth gate that my soul may ascend.',
      'VI. Aphroph [AHF-roff], light of the west, protect my going; open the sixth gate that my soul may pass through.',
      'VII. Saphaph [SAH-fahf], light of the north, guard my ascent; open the seventh gate that my soul may be received.',
      'VIII. Phthahoth [FTHAH-hoth], light of the south, warm my spirit; open the eighth gate that my soul may enter.',
      'IX. Bathmoth [BAHTH-moth], light of the depths, raise me up; open the ninth gate that my soul may rise.',
      'X. Mares [MAH-res], light of the heights, lift me higher; open the tenth gate that my soul may soar.',
      'XI. Machmoth [MAHK-moth], light of the center, draw me inward; open the eleventh gate that my soul may approach.',
      'XII. Plesithea [ple-SITH-ee-ah], light of lights, unite me with the source; open the twelfth gate that my soul may enter the Treasury.'
    ],
    elements: [
      { id: 'ha-harmozel', label: 'Harmozel - Light of Grace', brief: 'First aeon-ruler', detail: 'Harmozel [har-MOH-zel] governs the first aeon and the first rank of treasuries. His name means "light of grace" and he presides over souls who have received the grace of the first baptism.' },
      { id: 'ha-oroiael', label: 'Oroiael - Light of Thought', brief: 'Second aeon-ruler', detail: 'Oroiael [or-OY-ah-el] governs the second aeon. His name means "light of thought" and he illuminates the minds of those who seek understanding of the divine mysteries.' },
      { id: 'ha-daveithai', label: 'Daveithai - Light of Understanding', brief: 'Third aeon-ruler', detail: 'Daveithai [dah-VAY-thay] governs the third aeon. His name means "light of understanding" and he grants wisdom to those who have passed through the first two gates.' },
      { id: 'ha-eleleth', label: 'Eleleth - Light of Perception', brief: 'Fourth aeon-ruler', detail: 'Eleleth [el-EL-eth] governs the fourth aeon. His name means "light of perception" and he opens the eyes of the soul to see the Treasury of Light.' }
    ]
  },
  {
    id: 'three-amens', title: 'The Three Amens', category: 'hymn',
    desc: 'The triple Amen formula that concludes every prayer and ritual in the Book of Jeu. Each Amen is spoken with a different emphasis - the first as affirmation, the second as sealing, the third as empowerment. The Three Amens correspond to the three watchers at each treasury gate and to the three Archon gates that must be passed in the ascent.',
    sealType: 'hymn', book: 1, chapter: 'Passim', folio: 'Throughout',
    lore: [
      { title: 'The Power of the Triple', body: 'In Gnostic numerology, three is the number of completion. The Three Amens seal any prayer or ritual, making it irrevocable in the spiritual realm. The first Amen is spoken facing east (affirmation), the second facing south (sealing), the third facing west (empowerment). The initiate never faces north, for that is the direction of the Archons.' },
      { title: 'Pronunciation', body: 'Each Amen [ah-MEN] is intoned on a descending pitch: the first high and clear (affirmation), the second middle and firm (sealing), the third low and resonant (empowerment). The vowel sound "ah" opens the throat and allows the spirit to flow; the closing "en" seals the sound and makes it permanent.' }
    ],
    sacredText: [
      'Amen [ah-MEN] - the first: So it is affirmed in the Treasury of Light.',
      'Amen [ah-MEN] - the second: So it is sealed by the watchers of the gates.',
      'Amen [ah-MEN] - the third: So it is established forever and ever.',
      'The Three Amens: Affirmation, Sealing, Empowerment.',
      'By these three words is every prayer completed and every seal confirmed.'
    ],
    elements: [
      { id: 'am-first', label: 'First Amen - Affirmation', brief: 'Spoken facing east', detail: 'The first Amen affirms the truth of what has been spoken. It is intoned high and clear, facing east toward the source of light. This corresponds to the first watcher who examines the cipher.' },
      { id: 'am-second', label: 'Second Amen - Sealing', brief: 'Spoken facing south', detail: 'The second Amen seals what has been affirmed, making it irrevocable. It is intoned middle and firm, facing south. This corresponds to the second watcher who examines the seal.' },
      { id: 'am-third', label: 'Third Amen - Empowerment', brief: 'Spoken facing west', detail: 'The third Amen empowers what has been sealed, activating its spiritual force. It is intoned low and resonant, facing west. This corresponds to the third watcher who judges the purity of the soul.' }
    ]
  },
  {
    id: 'vowel-chant', title: 'The Vowel Chant', category: 'hymn',
    desc: 'The seven sacred vowels - A, E, I, O, U, O, and the silent seventh - chanted in sequence to open the seven levels of the Treasury. Each vowel resonates with a different rank of spiritual being, and the complete chant aligns the initiate\'s soul with the entire structure of the Pleroma. This is the most ancient element of the Jeu liturgy, predating even the Coptic text itself.',
    sealType: 'hymn', book: 1, chapter: 'Chapter 1', folio: 'f. 1v',
    lore: [
      { title: 'The Seven Vowels', body: 'In ancient Gnostic and magical practice, the seven Greek vowels (alpha, epsilon, eta, iota, omicron, upsilon, omega) correspond to the seven planetary spheres and the seven ranks of spiritual being. Chanting them in sequence aligns the soul with the cosmic structure and opens a pathway through the celestial barriers.' },
      { title: 'The Silent Seventh', body: 'The seventh vowel is never spoken aloud - it is the vowel of silence, representing the Great Invisible Spirit that transcends all sound. After chanting the six audible vowels, the initiate falls silent, and in that silence the seventh vowel is "heard" by the spirit within. This silence is the most powerful element of the chant.' }
    ],
    sacredText: [
      'A [ah] - the vowel of the beginning, the first emanation, the breath of creation',
      'E [eh] - the vowel of the way, the path between the worlds, the bridge of light',
      'I [ee] - the vowel of the spirit, the divine spark within, the fire of gnosis',
      'O [oh] - the vowel of the fullness, the completion of the circuit, the circle of the Pleroma',
      'U [oo] - the vowel of the depths, the wellspring of light, the fountain of the Treasury',
      'O [aw] - the vowel of the mystery, the gate of the ineffable, the threshold of the Invisible',
      '[Silence] - the seventh vowel, unspoken, unheard by mortals, known only to the Great Invisible Spirit'
    ],
    elements: [
      { id: 'vc-a', label: 'Alpha - The Beginning', brief: 'First vowel', detail: 'A [ah] corresponds to the first emanation and the breath of creation. It opens the outermost gate and aligns the initiate with the cosmic beginning.' },
      { id: 'vc-e', label: 'Epsilon - The Way', brief: 'Second vowel', detail: 'E [eh] corresponds to the path between worlds. It builds the bridge of light that the soul must cross in its ascent.' },
      { id: 'vc-i', label: 'Iota - The Spirit', brief: 'Third vowel', detail: 'I [ee] corresponds to the divine spark within. It kindles the fire of gnosis in the initiate\'s soul.' },
      { id: 'vc-o', label: 'Omicron - The Fullness', brief: 'Fourth vowel', detail: 'O [oh] corresponds to the Pleroma, the divine fullness. It completes the circuit of light that encloses the Treasury.' },
      { id: 'vc-u', label: 'Upsilon - The Depths', brief: 'Fifth vowel', detail: 'U [oo] corresponds to the wellspring of light at the bottom of the Treasury. It draws the initiate inward toward the source.' },
      { id: 'vc-omega', label: 'Omega - The Mystery', brief: 'Sixth vowel', detail: 'O [aw] corresponds to the gate of the Ineffable. It is the threshold of the Great Invisible Spirit, beyond which lies the seventh and silent vowel.' },
      { id: 'vc-silence', label: 'The Seventh Vowel - Silence', brief: 'The unspoken mystery', detail: 'The seventh vowel is never spoken. It is heard only in the silence of the spirit. It represents the Great Invisible Spirit itself - beyond all sound, beyond all naming, beyond all comprehension.' }
    ]
  },
  {
    id: 'prayer-thanks', title: 'Prayer of Thanksgiving', category: 'hymn',
    desc: 'A prayer of gratitude recited after receiving the five seals and participating in the Eucharist. The prayer thanks the Great Invisible Spirit for the gift of gnosis, for the protection of the seals, and for the promise of ascent to the Treasury of Light. It is the final prayer of the initiation rite.',
    sealType: 'hymn', book: 2, chapter: 'Chapter 54', folio: 'ff. 117r-118r',
    lore: [
      { title: 'Gratitude as Spiritual Power', body: 'In the Jeu cosmology, gratitude is not merely an emotion but a spiritual force. The Prayer of Thanksgiving generates a light that surrounds the newly sealed initiate, making them visible to the watchers of the Treasury as a "son of light" rather than a stranger to be examined. This is why the prayer must be recited sincerely and completely after every initiation.' },
      { title: 'The Closing Formula', body: 'The prayer ends with the triple Amen and the words: "I am a vessel of thy light. Let me ascend unto the Treasury and dwell therein forever." This formula seals the entire initiation and commits the initiate to the path of ascent. From this point forward, the initiate is known as a "Child of the Light" within the community.' }
    ],
    sacredText: [
      'I give thanks to thee, O Great Invisible Spirit, for thou hast revealed thyself to me, a lowly creature of the material world. Thou hast given me the knowledge of the treasuries and the names of the Fathers. Thou hast sealed me with the five seals and made me worthy to partake of the Pleroma.',
      'I give thanks to thee, O Jeu, True God, for thou hast opened the way before me. Thou hast shown me the ciphers and the passwords. Thou hast taught me the hymns and the invocations. Through thee I shall ascend unto the Treasury of Light.',
      'I give thanks to the four luminaries - Harmozel, Oroiael, Daveithai, and Eleleth - for they have shed their light upon my path and guided my steps through the veils.',
      'I am a vessel of thy light. Let me ascend unto the Treasury and dwell therein forever. Amen [ah-MEN]. Amen [ah-MEN]. Amen [ah-MEN].'
    ],
    elements: [
      { id: 'pt-spirit', label: 'Thanksgiving to the Invisible', brief: 'Gratitude for revelation', detail: 'The initiate thanks the Great Invisible Spirit for the gift of gnosis - the knowledge of the treasuries, the names of the Fathers, and the five seals that make ascent possible.' },
      { id: 'pt-jeu', label: 'Thanksgiving to Jeu', brief: 'Gratitude for the way', detail: 'The initiate thanks Jeu, the True God, for opening the way of ascent - revealing the ciphers, the passwords, the hymns, and the invocations that are the soul\'s passport through the Treasury.' },
      { id: 'pt-luminaries', label: 'Thanksgiving to the Luminaries', brief: 'Gratitude for guidance', detail: 'The initiate thanks the four luminaries - Harmozel, Oroiael, Daveithai, and Eleleth - for shedding their light upon the path and guiding the initiate through the veils of the Pleroma.' }
    ]
  },
  {
    id: 'doxology', title: 'The Doxology of the Pleroma', category: 'hymn',
    desc: 'The final hymn of the Jeu liturgy, sung by the entire community in unison. The Doxology of the Pleroma is a hymn of praise that extols every rank and every treasury of the divine fullness. It is sung on high holy days and at the consecration of new priests, and is considered too sacred for casual recitation.',
    sealType: 'hymn', book: 2, chapter: 'Chapter 60', folio: 'ff. 126r-128v',
    lore: [
      { title: 'The Cosmic Hymn', body: 'The Doxology is structured as a series of blessings, each one praising a different aspect of the Pleroma. It begins with the outermost rank (the 5th) and spirals inward through each rank until it reaches the Great Invisible Spirit at the center. This structure mirrors the soul\'s own journey of ascent.' },
      { title: 'Community Performance', body: 'The Doxology must be sung by the entire community together, for no single voice can encompass the fullness of the Pleroma. Each member of the community sings the blessings of a different rank, and their combined voices create a harmonic resonance that opens the spiritual ears of all present to the sounds of the Treasury.' }
    ],
    sacredText: [
      'Glory to the fifth rank, where the outermost treasuries shine with reflected light, and the watchers stand guard over the gates of the outer courts.',
      'Glory to the fourth rank, where the treasuries glow with the light of the aeons, and the emanations of the Fathers radiate outward like flames.',
      'Glory to the third rank, where the treasuries blaze with the light of the luminaries, and the four corners of the Pleroma are illuminated.',
      'Glory to the second rank, where the treasuries shine with the light of the curtains, and the veils between the worlds grow thin.',
      'Glory to the first rank, where the treasuries burn with the light of the Great Invisible, and the soul stands at the threshold of the Treasury itself.',
      'Glory to the Great Invisible Spirit, who is before all and after all, within all and beyond all, the source and the destination, the beginning and the end of all light.',
      'Amen [ah-MEN]. Amen [ah-MEN]. Amen [ah-MEN].'
    ],
    elements: [
      { id: 'dx-rank5', label: 'Fifth Rank - Reflected Light', brief: 'Outermost treasuries', detail: 'The fifth rank shines with reflected light filtered through many veils. Its treasuries are guarded by the most formidable watchers, and its Fathers are the most accessible to human souls beginning their ascent.' },
      { id: 'dx-rank1', label: 'First Rank - Direct Light', brief: 'Innermost treasuries', detail: 'The first rank burns with the direct light of the Great Invisible Spirit. Its treasuries are the most luminous and its Fathers are the most exalted. Only souls who have received all five seals may enter here.' },
      { id: 'dx-spirit', label: 'The Great Invisible', brief: 'Source and destination', detail: 'The Great Invisible Spirit is both the source from which all light flows and the destination to which all souls aspire. It is the alpha and omega of the Gnostic cosmology - the unnamable mystery at the heart of all existence.' }
    ]
  },

  /* ── ARCHON GATES ── */
  {
    id: 'archons', title: 'The Three Archon Gates', category: 'archon',
    desc: 'Between the soul and the Treasury stand the three great gates of the Archons: the Gate of the Aeons, the Gate of the Sphere, and the Gate of the Midst. Each gate is guarded by an Archon who must be overcome by the correct password. These are the most dangerous obstacles on the path of ascent, for the Archons will seize any soul that cannot speak the proper names.',
    sealType: 'archon-gate', book: 1, chapter: 'Chapters 30-50', folio: 'ff. 20r-39v',
    lore: [
      { title: 'The Archons', body: 'The Archons are the rulers of the material cosmos - beings of immense power who govern the planets, the stars, and the cycles of fate. They are not evil in themselves but serve the Demiurge, the creator of the material world, who keeps souls trapped in flesh. The three great Archons guard the boundaries between the material and spiritual realms.' },
      { title: 'The Gate of the Aeons', body: 'Paraphax [PAR-ah-faks] guards the first gate, the Gate of the Aeons. This gate separates the planetary spheres from the lower reaches of the spiritual realm. The password is IAO SABAOTH [EE-ah-oh SAH-bah-oth], the name of the Lord of Hosts. When Paraphax hears this name, he must yield, for it is the name of the true God who stands above all Archons.' },
      { title: 'The Gate of the Sphere', body: 'Arthax [AR-thaks] guards the second gate, the Gate of the Sphere. This gate controls the zodiac and the planetary influences that bind souls to fate. The password is ADONAI ELOHIM [ah-doh-NYE el-oh-HEEM], the sacred name of the God of Gods. When Arthax hears this name, the zodiac wheel stops and the soul is freed from astrological determination.' },
      { title: 'The Gate of the Midst', body: 'Aphraphax [ah-FRAH-faks] guards the third and most terrible gate, the Gate of the Midst. This gate stands at the boundary between the spiritual and the divine - between the realm of the Archons and the realm of the Treasury. The password is EIE AZAPHAX [AY-ee-ay AZ-ah-faks], a cipher-name of immense power. When Aphraphax hears this name, the final barrier dissolves and the Treasury of Light becomes visible.' }
    ],
    elements: [
      { id: 'ar-paraph', label: '1st Gate: Paraphax', brief: 'Gate of the Aeons - Password: IAO SABAOTH', detail: 'Paraphax [PAR-ah-faks], Archon of the Aeons, guards the first gate between the planetary spheres and the spiritual realm. Password: IAO SABAOTH [EE-ah-oh SAH-bah-oth]. When spoken, the Archon must yield to the name of the true Lord of Hosts.' },
      { id: 'ar-arthax', label: '2nd Gate: Arthax', brief: 'Gate of the Sphere - Password: ADONAI ELOHIM', detail: 'Arthax [AR-thaks], Archon of the Sphere, guards the second gate that controls the zodiac and fate. Password: ADONAI ELOHIM [ah-doh-NYE el-oh-HEEM]. When spoken, the zodiac wheel ceases and the soul is freed from astrological determination.' },
      { id: 'ar-aphr', label: '3rd Gate: Aphraphax', brief: 'Gate of the Midst - Password: EIE AZAPHAX', detail: 'Aphraphax [ah-FRAH-faks], Archon of the Midst, guards the final and most terrible gate between the spiritual and the divine. Password: EIE AZAPHAX [AY-ee-ay AZ-ah-faks]. When spoken, the last barrier dissolves and the Treasury of Light becomes visible.' }
    ]
  },

  /* ── RELATED TEXTS ── */
  {
    id: 'untitled', title: 'The Untitled Text (Codex Brucianus)', category: 'related',
    desc: 'Found alongside the Book of Jeu in the Codex Brucianus, the Untitled Text is a cosmological treatise that describes the emanation of the divine hierarchy from the unknowable One, through the divine triad, the four luminaries, the twelve aeons, and the creation of the material world by the Demiurge Yaldabaoth. It provides the mythological framework that underlies the Treasury system.',
    sealType: 'names', book: 1, chapter: 'Untitled', folio: 'ff. 57r-78v',
    lore: [
      { title: 'The Divine Triad', body: 'The Untitled Text begins with the One - the ineffable first principle that exists beyond being and non-being. From the One proceeds the divine Triad: Father, Mother (Barbelo), and Child (Autogenes). This Triad is the first movement within the stillness of the One, the first differentiation of the undifferentiated divine source.' },
      { title: 'The Fall of Sophia', body: 'Sophia [so-FEE-ah], the youngest of the aeons, desired to emanate without her consort, producing an imperfect offspring - Yaldabaoth [yal-dah-BAH-oth], the Demiurge. This act of unauthorized creation introduced deficiency into the Pleroma and resulted in the formation of the material world. Sophia\'s error is the cosmological explanation for the existence of evil and suffering.' },
      { title: 'The Creation of the Material World', body: 'Yaldabaoth, ignorant of his origin, created the material cosmos as a flawed copy of the Pleroma. He appointed seven Archons to rule over the seven planetary spheres and twelve Archons to rule over the zodiac. These Archons trap souls in flesh and subject them to the cycles of fate, preventing their ascent to the Treasury.' },
      { title: 'The Redemption', body: 'The Great Invisible Spirit sent Christ down through the aeons to teach the spiritual seed the knowledge (gnosis) of their origin and the passwords needed for ascent. Christ descended through each treasury, learning the names and ciphers, and then ascended again, opening the way for all who would follow.' }
    ],
    sacredText: [
      'There exists before all things the One, the unnamable, the incomprehensible, the invisible, the eternal. From the One proceeded the first thought, which is Barbelo [bar-BEH-loh], the Mother of all. And from the One and Barbelo proceeded the Autogenes [ow-TOJ-en-ees], the Self-Begotten One, who is the first light.',
      'The Autogenes caused four luminaries to stand before him: Harmozel [har-MOH-zel], who is the light of grace and stands at the right; Oroiael [or-OY-ah-el], who is the light of thought and stands at the left; Daveithai [dah-VAY-thay], who is the light of understanding and stands above; and Eleleth [el-EL-eth], who is the light of perception and stands below.',
      'From the four luminaries proceeded twelve aeons, and from the twelve aeons proceeded seventy-two powers, and from the seventy-two powers proceeded three hundred and sixty emanations. And the Pleroma was complete, lacking nothing.',
      'But Sophia [so-FEE-ah], the youngest of the aeons, desired to emanate without her consort, and her thought produced an imperfect thing - a lion-faced serpent called Yaldabaoth [yal-dah-BAH-oth], who became the Demiurge, the creator of the material world. And when Sophia saw what she had produced, she was ashamed and cast him out of the Pleroma.',
      'Yaldabaoth, being ignorant of the Pleroma from which he had fallen, created seven Archons to rule the seven heavens and twelve Archons to rule the zodiac. And he said to them: I am a jealous God, and there is no other beside me - thus proving himself ignorant, for if there were no other, of whom could he be jealous?',
      'But the Great Invisible Spirit sent Christ down through the treasuries, and he passed through every gate, learning the names and ciphers, and he descended even into the material world and took on flesh, that he might teach the spiritual seed the way of ascent back to the Treasury of Light.'
    ],
    elements: [
      { id: 'ut-one', label: 'The One', brief: 'The ineffable first principle', detail: 'The One exists beyond being and non-being, beyond name and form. It is the source from which all things proceed and the destination to which all things return. No aeon has ever comprehended it; no word can describe it.' },
      { id: 'ut-triad', label: 'The Divine Triad', brief: 'Father, Mother (Barbelo), Child (Autogenes)', detail: 'From the One proceeds the divine Triad: the Father (the will to emanate), Barbelo [bar-BEH-loh] (the first thought, the womb of creation), and the Autogenes [ow-TOJ-en-ees] (the self-begotten child, the first light). Together they constitute the first movement within the divine stillness.' },
      { id: 'ut-luminaries', label: 'The Four Luminaries', brief: 'Harmozel, Oroiael, Daveithai, Eleleth', detail: 'The Autogenes causes four luminaries to stand at the four corners: Harmozel (grace, right), Oroiael (thought, left), Daveithai (understanding, above), Eleleth (perception, below). These four sustain the Pleroma with their light.' },
      { id: 'ut-sophia', label: 'The Fall of Sophia', brief: 'The origin of the material world', detail: 'Sophia [so-FEE-ah], desiring to create without her consort, produces the lion-faced Demiurge Yaldabaoth [yal-dah-BAH-oth]. This unauthorized emanation introduces deficiency into the Pleroma and results in the creation of the material cosmos as a flawed imitation of the divine fullness.' },
      { id: 'ut-yaldabaoth', label: 'Yaldabaoth the Demiurge', brief: 'Creator of the material world', detail: 'Yaldabaoth [yal-dah-BAH-oth] is the lion-faced serpent who created the material world in ignorance. He appoints seven Archons over the seven heavens and twelve over the zodiac. His declaration "I am a jealous God and there is no other" reveals his ignorance of the higher divine realms from which he fell.' },
      { id: 'ut-redemption', label: 'The Redemption', brief: 'Christ descends to teach gnosis', detail: 'The Great Invisible Spirit sends Christ through the treasuries to teach the spiritual seed the knowledge of their origin and the passwords for ascent. Christ descends through every gate, learning each name and cipher, then ascends again, opening the way for all who follow.' }
    ]
  },
  {
    id: 'apocryphon-john', title: 'The Apocryphon of John', category: 'related',
    desc: 'The most important Sethian Gnostic text, preserving the full creation myth from the One through the fall of Sophia to the creation of humanity. The Apocryphon of John provides the theological foundation for the entire Sethian tradition and is directly parallel to the cosmology of the Book of Jeu and the Untitled Text.',
    sealType: 'dialogue', book: 1, chapter: 'Nag Hammadi Codex II,1', folio: 'NHC II,1; IV,1; BG 8502,2',
    lore: [
      { title: 'The Three Revelations', body: 'The Apocryphon of John exists in four manuscript copies - more than any other Sethian text. It presents itself as a secret revelation given by the risen Christ to John, son of Zebedee, in response to John\'s distress after a Pharisee mocked his teacher. Three versions survive: a short recension (NHC II) and a long recension (NHC IV, BG).' },
      { title: 'The Sethian Creation Myth', body: 'The text describes the emanation of the divine hierarchy from the One: the divine Triad (Father, Mother Barbelo, Child Autogenes), the four luminaries (Harmozel, Oroiael, Daveithai, Eleleth), the fall of Sophia, and the creation of Yaldabaoth. This is the same hierarchy that structures the Treasury of Light in the Book of Jeu.' },
      { title: 'The Creation of Adam', body: 'Yaldabaoth creates Adam as a material copy of the divine Anthropos (the heavenly humanity). But the Spiritual Seed - a fragment of divine light stolen by Sophia - becomes trapped within Adam\'s material body. Christ descends to teach Adam the knowledge of his true origin and the path of ascent back to the Pleroma.' }
    ],
    sacredText: [
      'It happened one day when John, the brother of James, was going up to the Temple, that a Pharisee named Arimanios approached him and said: Where is your master, the one you followed? And John said: He has returned to the place from which he came. Then Arimanios laughed and said: Has he not walked in error, this Nazarene?',
      'And John was troubled in his heart and went to a desolate place. And the heavens opened and a great light surrounded him, and a voice spoke: John, why are you troubled? I am the Father, I am the Mother, I am the Child. I am the undefiled and incorruptible one.',
      'The One is a sovereign that has nothing above it. It is God and Father of the All, the holy one, the invisible one, the one that is over all, that is incorruptible, that is pure light at which no eye can gaze. It is the invisible Spirit. We should not think of it as gods or as something like that, for it is superior to divinity.',
      'From the One appeared the first power, Barbelo [bar-BEH-loh], the perfect forethought of the all. She is the womb of the all, for she is prior to them all - the Mother-Father, the first Man, the holy Spirit, the thrice-male, the androgynous one of three names.',
      'And the Autogenes, the Self-Begotten One, caused to stand four luminaries before him. Harmozel [har-MOH-zel] - he stands at the first aeon with Armogenai. Oroiael [or-OY-ah-el] - he stands at the second aeon with Phaion. Daveithai [dah-VAY-thay] - he stands at the third aeon with Ophiel. Eleleth [el-EL-eth] - he stands at the fourth aeon with the virgin of the four lights.',
      'And Sophia [so-FEE-ah] of the Epinoia [ep-ih-NOY-ah], being an aeon, conceived a thought from herself, with the reflection of the Invisible Spirit. Because of this, his image became a counterfeit in the waters. And from that appeared the lion-faced serpent, whose name is Yaldabaoth [yal-dah-BAH-oth].'
    ],
    elements: [
      { id: 'aj-one', label: 'The One', brief: 'The unknowable first principle', detail: 'The One in the Apocryphon is described in the same apophatic terms as in the Untitled Text: "superior to divinity," "pure light at which no eye can gaze," "the invisible Spirit." This is the same Great Invisible Spirit that stands at the apex of the Treasury system.' },
      { id: 'aj-barbelo', label: 'Barbelo', brief: 'The first emanation, divine Mother', detail: 'Barbelo [bar-BEH-loh] is the first thought of the One, the divine Mother-Father, the womb of the Pleroma. She contains within herself the blueprint of all that will emanate from the divine source. She is called "thrice-male" because she contains the power of Father, Mother, and Child.' },
      { id: 'aj-autogenes', label: 'The Autogenes', brief: 'The Self-Begotten Child', detail: 'The Autogenes [ow-TOJ-en-ees] is the first-begotten of the Pleroma, the Self-Begotten One who proceeds from the Father and Barbelo. He establishes the four luminaries and organizes the structure of the Pleroma into its final form.' },
      { id: 'aj-sophia', label: 'Sophia', brief: 'The Wisdom whose fall created the world', detail: 'Sophia [so-FEE-ah], the youngest aeon, emanates without her consort and produces Yaldabaoth. Her error introduces deficiency into the Pleroma and results in the creation of the material world. Her redemption - the recovery of the light she lost - is the purpose of the Gnostic ascent.' },
      { id: 'aj-yaldabaoth', label: 'Yaldabaoth', brief: 'The Demiurge, creator of matter', detail: 'Yaldabaoth [yal-dah-BAH-oth], the lion-faced serpent, is the Demiurge who creates the material world in ignorance. He is called "Samael" (the blind god) and "Saklas" (the fool). Despite his power, he is ultimately a deficient being who cannot prevent the ascent of souls who possess the correct gnosis.' }
    ]
  },
  {
    id: 'gospel-egyptians', title: 'The Gospel of the Egyptians', category: 'related',
    desc: 'A Sethian Gnostic dialogue between Jesus and his female disciples, focusing on the nature of the divine triad, the role of the Sethian redeemer, and the ultimate dissolution of the material world. The Gospel of the Egyptians shares the same cosmological framework as the Book of Jeu but emphasizes the destruction of death and the restoration of the Pleroma.',
    sealType: 'hymn', book: 1, chapter: 'Nag Hammadi Codex III,2; IV,2', folio: 'NHC III,2; IV,2',
    lore: [
      { title: 'The Holy Book of the Great Invisible Spirit', body: 'The Gospel of the Egyptians is also known by its subtitle: "The Holy Book of the Great Invisible Spirit." This title directly connects it to the Book of Jeu, where the Great Invisible Spirit stands at the apex of the Treasury system. The text presents the same hierarchy of beings but focuses on the eschatological promise of the Pleroma\'s restoration.' },
      { title: 'The Sethian Redeemer', body: 'The Gospel of the Egyptians identifies Seth as the paradigmatic Gnostic redeemer - the seed of the divine that passes through generation after generation, preserving the knowledge of the Pleroma. Each time the Archons try to destroy the spiritual seed, Seth is reborn and the knowledge is preserved. This cyclical redemption echoes the Treasury system\'s promise of ascent.' },
      { title: 'The Dissolution of Death', body: 'The text promises that eventually the entire material cosmos will be dissolved and all the divine light that was stolen by the Demiurge will be recovered. This "dissolution of death" is the final act of the cosmic drama - when the last soul ascends to the Treasury and the material world ceases to exist.' }
    ],
    sacredText: [
      'The Great Invisible Spirit is the one from whom the all has come. He is the one who exists before the all, who contains the all, who is contained by none. From him proceeded the Autogenes, and from the Autogenes proceeded the four luminaries, and from the four luminaries proceeded the twelve aeons.',
      'Seth, the son of Adam, who is the seed of the great race, was placed in the world as a planting of the great unshakeable race. And his seed shall endure through every generation, preserving the knowledge of the Pleroma.',
      'And when the consummation of the all comes to pass, then shall the Archons be stripped of their power, and the material world shall be dissolved, and all the light that was hidden within it shall ascend unto the Treasury. And death shall be no more.',
      'This is the holy book of the Great Invisible Spirit. Blessed is he who reads it and keeps the words thereof, for the time is near when all shall be fulfilled.'
    ],
    elements: [
      { id: 'ge-spirit', label: 'The Great Invisible Spirit', brief: 'Supreme divinity', detail: 'The Great Invisible Spirit in the Gospel of the Egyptians is the same supreme divinity as in the Book of Jeu - the unknowable source from which all things emanate and to which all things return.' },
      { id: 'ge-seth', label: 'Seth the Redeemer', brief: 'Seed of the divine race', detail: 'Seth is the paradigmatic Gnostic redeemer, the seed of the divine that is reborn in every generation to preserve the knowledge of the Pleroma. His lineage carries the gnosis through the ages.' },
      { id: 'ge-dissolution', label: 'The Dissolution of Death', brief: 'Final eschatological promise', detail: 'The ultimate promise of the Gospel of the Egyptians: the material world will be dissolved, the Archons stripped of power, and all divine light will ascend to the Treasury. Death shall be no more.' }
    ]
  },
  {
    id: 'zostrianos', title: 'Zostrianos', category: 'related',
    desc: 'A Sethian apocalypse describing the heavenly ascent of Zostrianos through the aeonic realms to the divine source. This text is directly parallel to the ascent through the treasuries described in the Book of Jeu and provides an independent witness to the same visionary tradition of spiritual ascent through named realms and guarded gates.',
    sealType: 'ascent', book: 1, chapter: 'Nag Hammadi Codex VIII,1', folio: 'NHC VIII,1',
    lore: [
      { title: 'The Visionary Ascent', body: 'Zostrianos [zoh-STREE-ah-nos] describes a visionary ascent through multiple levels of the spiritual cosmos - the aeons, the luminaries, and the divine source itself. Like the Book of Jeu, each level has its own guardian beings and requires specific knowledge (names, seals) to pass through. Zostrianos is unique in describing the ascent as happening during life rather than after death.' },
      { title: 'The Baptism of Fire', body: 'Before his ascent, Zostrianos receives a baptism of fire from the heavenly messenger, which transforms his nature from mortal to spiritual. This parallels the fivefold baptism of the Book of Jeu and suggests a common ritual background. The baptism of fire is the prerequisite for all visionary experience in the Sethian tradition.' },
      { title: 'The Self-Knowledge', body: 'The central teaching of Zostrianos is that ascent requires self-knowledge - the soul must know its own divine origin before it can return to the divine source. "Who are you? Where did you come from? Where are you going?" These three questions must be answered at every gate, and the answers are: "I am a child of the Light, I came from the Pleroma, I am returning to the Treasury."' }
    ],
    sacredText: [
      'I, Zostrianos [zoh-STREE-ah-nos], went up to a mountain in the desert to pray. And as I prayed, a great light appeared and a voice spoke: Zostrianos, do not be afraid. I have been sent to teach you the way of ascent.',
      'First the messenger baptized me with fire, and my mortal nature fell away, and I was clothed in a garment of light. And I saw the aeons stretching above me like a ladder of light, each rung higher and more luminous than the last.',
      'At each gate, the guardians asked me: Who are you? Where did you come from? Where are you going? And I answered: I am a child of the Light, I came from the Pleroma, I am returning to the Treasury.',
      'And I ascended through the aeons of the luminaries, past Harmozel and Oroiael and Daveithai and Eleleth, and I came to the Autogenes, and beyond the Autogenes to Barbelo, and beyond Barbelo to the Great Invisible Spirit himself. And I saw that all the light that had been scattered through the material world was gathered again in the Treasury, and the Pleroma was restored.'
    ],
    elements: [
      { id: 'zo-ascent', label: 'The Visionary Ascent', brief: 'Zostrianos\' journey through the aeons', detail: 'Zostrianos ascends through multiple levels of the spiritual cosmos, each requiring specific knowledge to pass through. This parallels the Book of Jeu\'s treasury ascent but is experienced during life rather than after death.' },
      { id: 'zo-baptism', label: 'The Baptism of Fire', brief: 'Transformation from mortal to spiritual', detail: 'Before his ascent, Zostrianos receives a baptism of fire that transforms his mortal nature into spiritual substance. This parallels the fivefold baptism of the Book of Jeu and suggests a common ritual background.' },
      { id: 'zo-questions', label: 'The Three Questions', brief: 'Self-knowledge at each gate', detail: 'At every gate, the guardians ask: Who are you? Where did you come from? Where are you going? The answers - I am a child of the Light, I came from the Pleroma, I am returning to the Treasury - constitute the core Gnostic self-knowledge required for ascent.' }
    ]
  },
  {
    id: 'three-steles', title: 'The Three Steles of Seth', category: 'related',
    desc: 'A Sethian hymn-text consisting of three hymns inscribed on three metaphorical steles, each addressed to a different aspect of the divine: the Father, Barbelo, and the Autogenes. The Three Steles represents the most purely devotional strand of Sethian literature and shares the same divine hierarchy as the Book of Jeu.',
    sealType: 'steles', book: 1, chapter: 'Nag Hammadi Codex VII,5', folio: 'NHC VII,5',
    lore: [
      { title: 'Three Hymns, Three Aspects', body: 'The Three Steles of Seth consists of three hymns, each addressed to a different person of the divine Triad. The first stele praises the Father (the One, the ineffable source); the second praises Barbelo (the Mother, the first emanation); the third praises the Autogenes (the Child, the self-begotten light). Together they form a complete liturgy of praise corresponding to the three aspects of divinity.' },
      { title: 'Seth as Liturgist', body: 'The text is attributed to Seth, the third son of Adam, who is presented as the ancestor and spiritual guide of the Gnostic race. Seth inscribes the hymns upon steles (stone pillars) as a permanent record of divine praise. The steles are metaphorical - they represent the unchanging, eternal nature of the hymns, which endure through all generations.' },
      { title: 'Connection to the Jeu Liturgy', body: 'The Three Steles uses the same divine names and the same hierarchy as the Book of Jeu: the Great Invisible Spirit, Barbelo, the Autogenes, and the four luminaries. The hymns can be understood as the devotional counterpart to the Jeu\'s ritual prescriptions - where Jeu tells you what to do, the Steles tell you what to feel.' }
    ],
    sacredText: [
      'FIRST STELE - To the Father: Thou art before all, O Father. Thou art the root of the all. Thou art the source of the light that shines in the Treasury. No eye has seen thee, no tongue has named thee, yet thou art the ground of all seeing and all naming. Praise to thee, O Unknowable One, now and unto the aeon of aeons.',
      'SECOND STELE - To Barbelo: Thou art the first thought, O Mother Barbelo [bar-BEH-loh]. Thou art the womb of the Pleroma. Thou art the bridge between the knowable and the unknowable. Through thee the light passes from the Father into the all. Praise to thee, O Mother of lights, now and unto the aeon of aeons.',
      'THIRD STELE - To the Autogenes: Thou art the self-begotten light, O Child. Thou art the first to know the Father, the first to praise the Mother. Thou hast established the four luminaries and organized the Pleroma into its perfect form. Praise to thee, O First-born of the light, now and unto the aeon of aeons.',
      'These three steles I, Seth, have inscribed for the children of the light, that they may know the Father and the Mother and the Child, and may ascend unto the Treasury through the power of their praise. Amen [ah-MEN]. Amen [ah-MEN]. Amen [ah-MEN].'
    ],
    elements: [
      { id: 'ts-father', label: 'First Stele: To the Father', brief: 'Praise of the unknowable One', detail: 'The first stele praises the Father - the ineffable One, the root of all, the source of the light that shines in the Treasury. No eye has seen him, no tongue has named him, yet he is the ground of all seeing and naming.' },
      { id: 'ts-barbelo', label: 'Second Stele: To Barbelo', brief: 'Praise of the divine Mother', detail: 'The second stele praises Barbelo [bar-BEH-loh] - the first thought, the womb of the Pleroma, the bridge between the knowable and the unknowable. She is the channel through which divine light flows from the Father into all creation.' },
      { id: 'ts-autogenes', label: 'Third Stele: To the Autogenes', brief: 'Praise of the Self-Begotten', detail: 'The third stele praises the Autogenes [ow-TOJ-en-ees] - the self-begotten light, the first to know the Father, the establisher of the four luminaries, the organizer of the Pleroma into its perfect form.' }
    ]
  },
  {
    id: 'allogenes', title: 'Allogenes', category: 'related',
    desc: 'A Sethian revelation text in which the stranger Allogenes receives a vision of the divine hierarchy and the process of spiritual ascent. Allogenes ("the Stranger") represents the alien nature of the Gnostic soul in the material world - a citizen of the Pleroma temporarily exiled in flesh. His revelation parallels the ascent teachings of the Book of Jeu.',
    sealType: 'ascent', book: 1, chapter: 'Nag Hammadi Codex XI,3', folio: 'NHC XI,3; Codex Tchacos',
    lore: [
      { title: 'The Stranger', body: 'Allogenes [al-OJ-en-ees] means "the Stranger" or "the One of Another Race." This name describes the Gnostic soul itself - a stranger in the material world, belonging to another race (the spiritual seed) and another homeland (the Pleroma). Allogenes\' vision is therefore the soul\'s own vision of its true origin and destiny.' },
      { title: 'The Triple Power', body: 'The text describes the divine as a Triple Power - Existence (that it is), Vitality (that it lives), and Mentality (that it knows). These three powers correspond to the divine Triad of the Book of Jeu: the Father (Existence), Barbelo (Vitality/Mother), and the Autogenes (Mentality/Child). The same threefold structure underlies both texts.' },
      { title: 'The Vision of Stillness', body: 'At the climax of his revelation, Allogenes experiences a state of absolute stillness - the silence that precedes all emanation, the rest of the divine before the first movement. This stillness is the experience of the One itself, and it confirms that the soul has reached the summit of its ascent. The Book of Jeu promises the same experience to those who reach the innermost Treasury.' }
    ],
    sacredText: [
      'I am Allogenes [al-OJ-en-ees], the stranger, the one of another race. I went up to a high mountain and sat in silence for three days. And on the third day, a great light appeared, and a voice spoke: Allogenes, why do you sit in silence? Arise, for I have been sent to reveal to you the things that are.',
      'The One is a Tri-Powered One: Existence, that it is; Vitality, that it lives; Mentality, that it knows. These three are one, and the one is three, and beyond both one and three is the unknowable source.',
      'And I saw the aeons stretching above me, each one more luminous than the last, and I understood that I was a stranger in this world, a citizen of the Pleroma. And the messenger said: Return to your homeland, Allogenes, for the Treasury awaits you.',
      'And I entered into a state of stillness beyond all thought, beyond all sensation, beyond all being. And in that stillness I knew the One - not as an object of knowledge, but as the ground of all knowing. And I was at peace.'
    ],
    elements: [
      { id: 'al-stranger', label: 'Allogenes the Stranger', brief: 'The alien soul', detail: 'Allogenes [al-OJ-en-ees] represents the Gnostic soul - a stranger in the material world, belonging to the spiritual seed and the Pleroma. His name itself is a declaration of alien status: "I am not of this world."' },
      { id: 'al-triple', label: 'The Triple Power', brief: 'Existence, Vitality, Mentality', detail: 'The Triple Power - Existence (that it is), Vitality (that it lives), Mentality (that it knows) - corresponds to the divine Triad of Father, Barbelo, and Autogenes. This same threefold structure underlies both the Allogenes and the Book of Jeu.' },
      { id: 'al-stillness', label: 'The Vision of Stillness', brief: 'The experience of the One', detail: 'At the climax of revelation, Allogenes enters a state of absolute stillness - the silence that precedes all emanation. This is the direct experience of the One, confirming that the soul has reached the summit of its ascent to the innermost Treasury.' }
    ]
  },

  /* ═══════════════════════════════════════
     GOSPEL OF JUDAS — Codex Tchacos
     ═══════════════════════════════════════ */
  {
    id: 'gospel-judas', title: 'The Gospel of Judas', category: 'related',
    desc: 'A Sethian Gnostic dialogue between Jesus and Judas Iscariot, preserved in the Codex Tchacos (c. 300 CE) and mentioned by Irenaeus around 180 CE. Far from the betrayer of orthodox tradition, Judas is presented as the only disciple who truly understood Jesus\' teaching — the one who possessed the gnosis necessary to assist in the liberation of the divine spark from its material prison. The text shares the same Sethian cosmology as the Book of Jeu: the Ineffable One, Barbelo, the Autogenes, the luminaries Harmozel/Oroiael/Daveithai/Eleleth, and the Demiurge Yaldabaoth who rules the material world in ignorance.',
    sealType: 'dialogue', book: 1, chapter: 'Codex Tchacos', folio: 'Codex Tchacos 33-58; mentioned by Irenaeus, Against Heresies I.31.1 (c. 180)',
    lore: [
      { title: 'The Sethian Creation Myth', body: 'The Gospel of Judas opens with Jesus laughing at the disciples for their thanksgiving prayer over bread — they are worshipping the Demiurge, not the true God. Jesus then reveals the full Sethian cosmology: the eternal, unnamable God; Barbelo [bar-BEH-loh]; the divine Self-Generated (Autogenes); the four luminaries Harmozel, Oroiael, Daveithai, Eleleth (the same as in the Book of Jeu); and below them, the foolish Demiurge Nebro (Yaldabaoth) and his helper Saklas who create the material world and humanity. This is the same hierarchy that structures the 60 Treasuries.' },
      { title: 'Judas as the True Gnostic', body: 'Jesus tells Judas: "Step away from the others and I shall tell you the mysteries of the kingdom. It is not possible for anyone to know it except those who have been made worthy." Judas alone is enabled to ascend in vision through the heavens and see the great realm of the divine. Jesus reveals that Judas will exceed all the other disciples because he will sacrifice the man who clothes Jesus (the body), thereby freeing the divine Christ to return to the Pleroma. The so-called "betrayal" is in fact the sacred act of liberation.' },
      { title: 'The Generations of the Archons', body: 'The text describes how Saklas [SAK-las] (the fool) and Nebro [NEB-roh] (the rebel, another name for Yaldabaoth) created twelve angelic rulers over the material cosmos, and these twelve created seventy-two rulers, who in turn created three hundred and sixty more. This proliferation of Archons mirrors the emanation hierarchy of the Pleroma but in inverted, defiled form. The same twelve/seventy-two/three hundred and sixty structure appears in the Untitled Text of the Bruce Codex as the structure of the divine fullness — but here, in the realm of matter, it is a prison rather than a treasury.' },
      { title: 'The Destiny of the Holy Generation', body: 'Jesus explains that there are two races: the generation of Seth (the spiritual seed, capable of gnosis) and the generation of Cain (the material race, bound to the Archons). The holy generation cannot die — when its members appear to die, they are in fact ascending through the realms of the Archons back to the divine source. The text promises that Judas, as the thirteenth daimon (the one who transcends the twelve zodiacal Archons), will ascend above all of them and enter the imperishable realm.' }
    ],
    sacredText: [
      'When he appeared on earth, Jesus performed signs and great wonders for the salvation of humanity. And since some walked in the way of righteousness while others walked in their transgressions, the twelve disciples were called. He began to speak with them about the mysteries beyond the world and what would take place at the end.',
      'He said to them: "How do you know me? Truly I say to you, no generation of the people that is among you will know me." When his disciples heard this, they began to be angry and to gnash their teeth at him. But Judas Iscariot [JOO-das iss-KAR-ee-ot] came forward and said: "I know who you are and from what place you have come. You have come from the immortal realm of Barbelo [bar-BEH-loh]."',
      'Jesus said: "Step away from the others and I shall tell you the mysteries of the kingdom. It is not possible for anyone to know it except those who have been made worthy." And Judas came to him, saying: "Rabbi, when will you tell me these things?"',
      '"There exists a great and boundless realm whose extent no generation of angels has seen, in which there is a great invisible Spirit, which no eye of an angel has ever seen, no thought of the heart has ever comprehended, and it was not called by a name."',
      'And a luminous cloud appeared there. He said: "Let an angel come into being as my attendant." A great angel, the enlightened divine Self-Generated, emerged from the cloud. Because of him, four other angels came into being from another cloud, and they came into being to attend the divine Self-Generated.',
      'The first is Harmozel [har-MOH-zel]. The second is Oroiael [or-OY-ah-el]. The third is Daveithai [dah-VAY-thay]. The fourth is Eleleth [el-EL-eth]. These are the four luminaries who stand before the great invisible Spirit.',
      '"But you will exceed all of them, Judas. For you will sacrifice the man that clothes me. Already your horn has been raised, and your wrath has been kindled, and your star has passed over, and your heart has gone to the holy generation."'
    ],
    elements: [
      { id: 'gj-barbelo', label: 'Barbelo', brief: 'The divine womb, first emanation', detail: 'In the Gospel of Judas, Jesus comes from "the immortal realm of Barbelo [bar-BEH-loh]" — the same Barbelo who is the first emanation of the One in the Book of Jeu. She is the divine womb, the Mother-Father, the source of the Autogenes and all subsequent emanations.' },
      { id: 'gj-luminaries', label: 'The Four Luminaries', brief: 'Harmozel, Oroiael, Daveithai, Eleleth', detail: 'The four luminaries of the Gospel of Judas are identical to those of the Book of Jeu. They stand before the Great Invisible Spirit and emanate the twelve aeons. Their names appear in dozens of Sethian texts as the cardinal principles of the Pleroma.' },
      { id: 'gj-nebro', label: 'Nebro / Yaldabaoth', brief: 'The rebel Demiurge', detail: 'Nebro [NEB-roh] ("the rebel") is another name for Yaldabaoth, the lion-faced Demiurge. He is called "the one who polluted the name" — the being who claimed divinity for himself and created the material cosmos in ignorance.' },
      { id: 'gj-saklas', label: 'Saklas', brief: 'The fool, co-creator of matter', detail: 'Saklas [SAK-las] means "the fool." He works alongside Nebro to create the material world and its archons. In other Sethian texts (Apocryphon of John), Saklas is one of Yaldabaoth\'s alternate names.' },
      { id: 'gj-judas', label: 'Judas the Thirteenth', brief: 'The transcendent disciple', detail: 'Jesus tells Judas: "You will exceed all of them. For the man that clothes me has already been made to suffer, you will sacrifice him." Judas transcends the twelve zodiacal Archons (symbolized by the twelve other disciples) and ascends as the thirteenth — the one who returns to the Pleroma.' },
      { id: 'gj-seed', label: 'The Holy Generation', brief: 'The seed of Seth', detail: 'The Gospel of Judas teaches that the spiritual seed — the generation of Seth — cannot truly die. When its members appear to perish, they are in fact ascending through the Archon realms back to the divine Treasury. This mirrors the ascent through the 60 Treasuries described in the Book of Jeu.' }
    ],
    pronunciations: [
      { name: 'Judas Iscariot', pron: 'JOO-das iss-KAR-ee-ot' },
      { name: 'Nebro', pron: 'NEB-roh' },
      { name: 'Saklas', pron: 'SAK-las' },
      { name: 'Barbelo', pron: 'bar-BEH-loh' },
      { name: 'Autogenes', pron: 'ow-TOJ-en-eez' },
      { name: 'Harmozel', pron: 'har-MOH-zel' },
      { name: 'Oroiael', pron: 'or-OY-ah-el' },
      { name: 'Daveithai', pron: 'dah-VAY-thay' },
      { name: 'Eleleth', pron: 'el-EL-eth' }
    ]
  },

  /* ═══════════════════════════════════════
     APOCALYPSE OF ADAM
     ═══════════════════════════════════════ */
  {
    id: 'apocalypse-adam', title: 'The Apocalypse of Adam', category: 'related',
    desc: 'A Sethian revelation delivered by Adam to his son Seth, preserving the secret knowledge that Adam received from the divine revealer and passed down through the holy generation. The text narrates the eternal struggle between the Creator God (the Demiurge) and the true God of the spiritual seed, prophesying the coming of a series of illuminators (Seth reincarnate) who will preserve the gnosis across the ages. It connects directly to the Book of Jeu by tracing the lineage of the spiritual seed that will eventually ascend through the 60 Treasuries.',
    sealType: 'dialogue', book: 1, chapter: 'Nag Hammadi Codex V,5', folio: 'NHC V,5',
    lore: [
      { title: 'Adam\'s Secret Knowledge', body: 'According to the Apocalypse of Adam, Adam was not the broken sinner of orthodox tradition but the first recipient of the Gnostic revelation. After Eve and he ate from the tree of knowledge, the true God — not the Demiurge — appeared to them and revealed their divine origin. Adam learned that he was not the creation of the angry Creator God but a fragment of divine light trapped in matter by an ignorant being. This knowledge he passed to his son Seth, who became the progenitor of the holy generation.' },
      { title: 'The Three Lights and the Illuminators', body: 'Adam prophesies to Seth that a series of "illuminators" will come into the world across the generations — each one a manifestation of Seth himself, reborn to preserve the knowledge of the divine origin. The first illuminator comes to the generation of Seth; the second comes after the flood; the third comes to the generation of Noah; and so on through history. Each illuminator performs signs and wonders, teaches the gnosis, and is opposed by the Demiurge and his Archons — but the knowledge cannot be extinguished because it is eternal, originating from beyond the material cosmos.' },
      { title: 'The Eternal Preservation of the Seed', body: 'The central promise of the Apocalypse of Adam is that the spiritual seed — the holy generation — can never be destroyed. The Demiurge tries to wipe it out through the flood, through fire, through persecution, but each time the seed survives because it is rooted in the Pleroma, not in matter. This mirrors the cosmology of the Book of Jeu: the divine light that fell into matter is ultimately recoverable because it never ceased to belong to the Treasury of Light. The ascent through the 60 Treasuries is the final homecoming of this preserved seed.' }
    ],
    sacredText: [
      'The revelation which Adam taught his son Seth in the seven hundredth year, saying: "Listen to my words, my son Seth. When God created me out of the earth, along with Eve your mother, I went about with her in a glory which she had seen in the aeon from which we had come. She taught me a word of knowledge of the eternal God. And we resembled the great eternal angels, for we were higher than the God who had created us and the powers with him, whom we did not know."',
      '"Then God, the ruler of the aeons and the powers, divided us in wrath. And after these things we became darkened in our heart. And I slept in the thought of my heart. And I saw three men before me whose likeness I could not recognize, since they were not from the powers of the God who had created us. They stood above me and said: \'Arise, Adam, from the sleep of death.\'"',
      '"And after this, a virgin will come down to the world of the illuminator, and she will conceive by him, and she will bear a son in the world of the illuminator. And the seed of the great generation will be preserved through her."',
      '"Now then, my son Seth, I will reveal to you the things which those men whom I saw before me revealed to me. For after that generation, there will be another generation, and there will be a great disturbance among the powers and the rulers of the aeons. And the illuminators will come to them."',
      '"The generation of the illuminators will come. They will perform signs and wonders. And the powers will not be able to stand against them. For the great God has given them the power, and they will preserve the seed of the great generation until the consummation of the age."'
    ],
    elements: [
      { id: 'aa-adam', label: 'Adam the Knower', brief: 'First recipient of gnosis', detail: 'In the Apocalypse of Adam, Adam is the first Gnostic — the being who received the knowledge of the true God from beyond the Creator God. He passed this knowledge to his son Seth, making Seth the patriarch of the holy generation.' },
      { id: 'aa-seth', label: 'Seth the Progenitor', brief: 'Father of the holy generation', detail: 'Seth [SETH] is the recipient of Adam\'s revelation and the ancestor of the spiritual seed. Every "illuminator" who comes after is a reincarnation of Seth — the same divine being manifesting across generations to preserve the gnosis.' },
      { id: 'aa-illuminator', label: 'The Illuminators', brief: 'Series of divine revealers', detail: 'The illuminators are manifestations of Seth who appear in every generation to teach the gnosis. Each performs signs, opposes the Archons, and ensures that the spiritual seed is not extinguished. The final illuminator will preside over the consummation of the age.' },
      { id: 'aa-seed', label: 'The Holy Generation', brief: 'The eternal spiritual seed', detail: 'The holy generation — the seed of Seth — cannot be destroyed by the Demiurge or his Archons. Flood, fire, and persecution cannot extinguish it because it originates from the Pleroma. This is the same seed that ascends through the 60 Treasuries of the Book of Jeu.' },
      { id: 'aa-demiurge', label: 'The Creator God', brief: 'The ignorant Demiurge', detail: 'The "God who created us" in the Apocalypse of Adam is the Demiurge — Yaldabaoth by another name. Adam and Eve realize they are "higher than the God who had created us," revealing the Gnostic conviction that the spiritual seed is greater than its material creator.' }
    ],
    pronunciations: [
      { name: 'Seth', pron: 'SETH' },
      { name: 'Adam', pron: 'AH-dahm' },
      { name: 'Eve', pron: 'EEV' },
      { name: 'Illuminator', pron: 'ih-LOO-mih-nay-ter' }
    ]
  },

  /* ═══════════════════════════════════════
     THOUGHT OF NOREA
     ═══════════════════════════════════════ */
  {
    id: 'thought-norea', title: 'The Thought of Norea', category: 'related',
    desc: 'A brief Sethian hymn-text celebrating Norea, the daughter of Eve who refused to submit to the Archons and was rescued by the divine angel Eleleth. Norea is the feminine counterpart to Seth in the holy generation — the divine woman whose cry for help brought the Gnostic revealer down from the Pleroma. The text is a meditation on the nature of the divine feminine and the rescue of the spiritual seed from the material world.',
    sealType: 'hymn', book: 1, chapter: 'Nag Hammadi Codex IX,2', folio: 'NHC IX,2',
    lore: [
      { title: 'Norea, the Daughter of Eve', body: 'In Sethian mythology, after the Demiurge (the Creator God) killed Abel and exiled Cain, Eve bore a third child: Seth. Later, she bore a daughter: Norea [nor-EE-ah]. Norea is not mentioned in the biblical Genesis, but in the Sethian tradition she is essential — the feminine manifestation of the spiritual seed. When the Archons attempted to make her submit as they had made her mother submit, Norea cried out to the true God, and her cry was heard in the Pleroma. This is the moment that brought the divine revealer down to rescue the holy generation.' },
      { title: 'The Rescue by Eleleth', body: 'In the longer Sethian mythology (preserved in the Apocryphon of John and Hypostasis of the Archons), Norea refuses the Archons\' demands. They try to burn her with fire, but the fire cannot touch her because she carries divine light. She cries out: "Who is the God who is above the gods? Who will save me from them?" The angel Eleleth [el-EL-eth] — the fourth and final Luminary of the Pleroma, the same Eleleth named in the Book of Jeu — descends and reveals to Norea the truth of her divine origin and the cosmology of the spiritual realms.' },
      { title: 'The Eternal Memory of the Divine', body: 'The Thought of Norea is essentially a hymn of praise to Norea\'s divine nature and a meditation on the eternal preservation of the spiritual seed. The text describes how Norea is remembered in the Pleroma — her name is inscribed in the Treasury of Light, and her image is preserved among the divine beings. This promise of eternal remembrance is the same promise made to all members of the holy generation: that they are known in the Pleroma and will eventually ascend to the Treasury from which they fell.' }
    ],
    sacredText: [
      'This is the thought of Norea [nor-EE-ah]: "O God, save me from this place of wickedness! Save me from the place of injustice! Save me from those who practice unrighteousness! Save me from the place of wrath and anger! Save me from the place of darkness and gloom! Save me from those who plot evil against me!"',
      'And the great angel Eleleth [el-EL-eth] came to her and said: "Norea, Norea, do not be afraid. The eternal God has heard your cry. He has sent me to you from the Pleroma, to reveal to you the truth of your origin and the things that must come to pass."',
      '"You are not the daughter of the Demiurge, Norea. You are the daughter of the eternal God. Your mother Eve was a virgin who bore the seed of the divine. The Archons created your body, but your spirit is from above — from the Treasury of Light."',
      '"And I will reveal to you the things that are above: the One, the ineffable, the unnamable. And Barbelo [bar-BEH-loh], the divine Mother. And the Autogenes [ow-TOJ-en-eez], the self-begotten Child. And the four luminaries: Harmozel, Oroiael, Daveithai, and I myself, Eleleth."',
      '"And your name, Norea, is inscribed in the Treasury of Light. It cannot be erased. And your image is preserved among the divine beings. And when the time comes, you will ascend to the place from which you came, and you will rest with your kindred in the Pleroma."'
    ],
    elements: [
      { id: 'tn-norea', label: 'Norea', brief: 'Daughter of Eve, divine woman', detail: 'Norea [nor-EE-ah] is the daughter of Eve in Sethian mythology — the feminine manifestation of the spiritual seed. Her refusal to submit to the Archons and her cry for help brought the divine revealer down from the Pleroma. She is named in the Apocryphon of John and the Hypostasis of the Archons.' },
      { id: 'tn-eleleth', label: 'Eleleth the Revealer', brief: 'Fourth Luminary descends to Norea', detail: 'Eleleth [el-EL-eth] is the fourth of the Four Luminaries in the Sethian cosmology — the same Eleleth named in the Book of Jeu as one of the four great lights at the quarters of the Pleroma. In the Thought of Norea, Eleleth descends to reveal the truth of Norea\'s divine origin.' },
      { id: 'tn-cry', label: 'The Cry for Help', brief: 'Norea\'s prayer reaches the Pleroma', detail: 'Norea\'s cry — "Who is the God who is above the gods?" — pierces the material cosmos and reaches the Pleroma. This is the paradigmatic Gnostic prayer: the recognition that the God of this world is not the true God, and the plea for rescue from a higher source.' },
      { id: 'tn-treasury', label: 'Inscribed in the Treasury', brief: 'Norea\'s name in the Treasury of Light', detail: 'Eleleth tells Norea: "Your name is inscribed in the Treasury of Light." This connects directly to the Book of Jeu — every member of the holy generation has their name inscribed in one of the 60 Treasuries, and the ascent through these Treasuries is the soul\'s return to its rightful place.' }
    ],
    pronunciations: [
      { name: 'Norea', pron: 'nor-EE-ah' },
      { name: 'Eleleth', pron: 'el-EL-eth' },
      { name: 'Barbelo', pron: 'bar-BEH-loh' },
      { name: 'Autogenes', pron: 'ow-TOJ-en-eez' }
    ]
  },

  /* ═══════════════════════════════════════
     TRIMORPHIC PROTENNOIA
     ═══════════════════════════════════════ */
  {
    id: 'trimorphic-protennoia', title: 'The Trimorphic Protennoia', category: 'related',
    desc: 'A Sethian revelation text in which the divine First Thought (Protennoia) speaks in three forms — as the Father (Voice), the Mother (Sound), and the Child (Word). The text describes the descent of Protennoia into the material world to rescue the spiritual seed from the Archons, and her eventual return to the Pleroma. The trimorphic ("three-formed") structure mirrors the divine Triad of the Book of Jeu and provides a feminine theological framework for the same process of emanation and redemption.',
    sealType: 'names', book: 1, chapter: 'Nag Hammadi Codex XIII,1', folio: 'NHC XIII,1',
    lore: [
      { title: 'The First Thought (Protennoia)', body: 'Protennoia [pro-ten-NOY-ah] means "the First Thought." In Sethian cosmology, she is the first emanation of the One — equivalent to Barbelo in the Apocryphon of John and the divine Mother in the Book of Jeu. She is the divine Thought that contains within herself the blueprint of all that will be. The Trimorphic Protennoia gives her a voice: she speaks in the first person, declaring her identity, her descent, and her promise of redemption.' },
      { title: 'The Three Forms', body: 'The "trimorphic" structure of the text refers to Protennoia\'s three forms: (1) as the Father, she is the Voice that calls all things into being; (2) as the Mother, she is the Sound that resonates through the aeons; (3) as the Child, she is the Word that becomes incarnate in the material world to rescue the spiritual seed. This threefold structure parallels the divine Triad of the Book of Jeu (Father, Barbelo, Autogenes) but presents it as a single divine being who takes on three different forms across the cosmological drama.' },
      { title: 'The Descent and Rescue', body: 'Protennoia descends into the material world to rescue the spiritual seed that has been trapped by the Archons. She puts on the garments of the material world — flesh, breath, soul — and walks among the prisoners without their knowing who she is. She calls out: "I am the First Thought, the one who dwells in the light. I am the sound that is in everyone." When the spiritual seed hears her voice, it remembers its divine origin and begins the ascent back to the Pleroma. This is the same process described in the Book of Jeu: the divine revealer descends through all the Treasuries, learns the names and ciphers, and opens the way for the ascending souls.' }
    ],
    sacredText: [
      'I am the First Thought, the thought that is in the light. I am the movement that is in the all. I am the word that is in the all. I am the sound that is in the all. It is I who am the all. It is I who am in the all. It is I who am before the all. It is I who am after the all.',
      'I am the Voice [as Father]. It is I who speak. I am the undivided one, who has come to be in the divided one. I appeared to those who are in the world, and I taught them. I revealed to them the things of the Father, and the things of the Mother, and the things of the Child.',
      'I am the Sound [as Mother]. It is I who resonate. I am the one who has come to be in the inexpressible one. I am the one who taught the seed of the great generation. I am the one who is in the all, and the all is in me.',
      'I am the Word [as Child]. It is I who am the voice of the one who is in the all. I appeared in the likeness of their likeness. I put on their garments. I walked among them. They did not know me. But I called out, and those who belonged to me heard my voice, and they remembered the place from which they had come.',
      'And I stripped off my garments. I descended into the world. And the Archons saw me and they were afraid. For they knew that I had come to take what was theirs, and to bring it back to the place from which it had fallen.',
      'And the seed of the great generation heard my voice, and they arose, and they ascended through the aeons, through the luminaries, through the treasuries, until they reached the place from which they had come. And they rested with the Father and the Mother and the Child, in the Treasury of Light.'
    ],
    elements: [
      { id: 'tp-protennoia', label: 'Protennoia', brief: 'The First Thought', detail: 'Protennoia [pro-ten-NOY-ah] is the First Thought of the One — equivalent to Barbelo in the Apocryphon of John. She is the divine Mother who contains the blueprint of all emanation, and she speaks in the first person throughout this text.' },
      { id: 'tp-voice', label: 'The Voice (Father)', brief: 'First form of Protennoia', detail: 'As the Voice, Protennoia is the Father — the divine principle that calls all things into being. The Voice precedes all speech, all sound, all manifestation. It is the silent source of every word.' },
      { id: 'tp-sound', label: 'The Sound (Mother)', brief: 'Second form of Protennoia', detail: 'As the Sound, Protennoia is the Mother — the resonance that fills the aeons. The Sound is the bridge between the silent Voice and the articulate Word. She teaches the seed of the great generation.' },
      { id: 'tp-word', label: 'The Word (Child)', brief: 'Third form of Protennoia', detail: 'As the Word, Protennoia is the Child — the divine principle incarnate in the material world. She puts on the garments of matter and walks among the prisoners unrecognized, calling out to those who belong to her so they can remember their divine origin.' },
      { id: 'tp-descent', label: 'The Descent and Ascent', brief: 'Protennoia rescues the seed', detail: 'Protennoia descends into matter, takes on flesh, and calls out to the spiritual seed. When the seed hears her voice, it ascends through the aeons, luminaries, and treasuries — a direct parallel to the ascent through the 60 Treasuries of the Book of Jeu.' }
    ],
    pronunciations: [
      { name: 'Protennoia', pron: 'pro-ten-NOY-ah' },
      { name: 'Trimorphic', pron: 'try-MOR-fik' }
    ]
  },

  /* ═══════════════════════════════════════
     MARSANES
     ═══════════════════════════════════════ */
  {
    id: 'marsanes', title: 'Marsanes', category: 'related',
    desc: 'A Sethian apocalypse describing the ascent of Marsanes through the divine realms. Though fragmentary, the text preserves detailed teachings on the structure of the spiritual cosmos, the names of the beings who guard each level, and the numerical and linguistic codes required to pass through the gates. Marsanes is one of the most technically detailed Sethian ascent texts and shares with the Book of Jeu an emphasis on the precise knowledge (names, numbers, ciphers) needed for the soul\'s return to the Pleroma.',
    sealType: 'ascent', book: 1, chapter: 'Nag Hammadi Codex X', folio: 'NHC X',
    lore: [
      { title: 'The Ascent Vision', body: 'Marsanes [mar-SAH-nes] — like Zostrianos and Allogenes — describes a visionary ascent through multiple levels of the spiritual cosmos. The ascending soul encounters specific beings at each level, must know their names and powers, and must demonstrate knowledge of the divine structure to pass through. Marsanes is distinctive for its technical precision: it lists the exact numbers, names, and formulas required at each gate, making it the closest parallel in the Nag Hammadi library to the cipher-system of the Book of Jeu.' },
      { title: 'The Numerical Cosmology', body: 'Marsanes presents a numerical cosmology in which each level of the spiritual realm corresponds to a specific number and a specific letter of the divine alphabet. The ascent is therefore not only a journey through space but a journey through numbers and letters — the soul must "spell out" its path to the divine source. This mirrors the cipher system of the Book of Jeu, where each Treasury is sealed by a specific name that functions as a vibrational key. In both texts, the cosmos is structured like a cryptogram, and the soul\'s knowledge of the code is what allows it to ascend.' },
      { title: 'The Self-Begotten One', body: 'The central divine figure in Marsanes is the Self-Begotten One (the Autogenes) — the same divine being who appears in the Book of Jeu as the third member of the divine Triad. Marsanes describes how the Autogenes emanates the structure of the Pleroma and establishes the path of ascent for those who possess the gnosis. The text emphasizes that the Autogenes is "self-begotten" — not created by any other being — because true divinity cannot be derived from anything external to itself.' }
    ],
    sacredText: [
      'I am Marsanes [mar-SAH-nes]. I went up to a high mountain and I prayed to the One who is before all things. And the One heard me, and he sent to me the Self-Begotten One, who taught me the things that are.',
      'And the Self-Begotten One said: "Marsanes, I will reveal to you the structure of the all. There are levels upon levels, aeons upon aeons, and at each level there are guardians whose names must be known. Without the names, no one can ascend."',
      '"The first level has twelve guardians. The second has twenty-four. The third has seventy-two. The fourth has three hundred and sixty. And beyond the fourth are the luminaries, and beyond the luminaries is the Self-Begotten One, and beyond the Self-Begotten One is the One who is before all things."',
      '"And each guardian has a name, and each name has a number, and each number has a letter. And the soul that ascends must speak the name, and recite the number, and inscribe the letter. For the cosmos is a great book, and the ascent is the reading of it."',
      'And I, Marsanes, ascended through the levels, and I spoke the names, and I recited the numbers, and I inscribed the letters. And the guardians let me pass, for I had the knowledge. And I came to the Self-Begotten One, and beyond him to the One who is before all things. And I rested.'
    ],
    elements: [
      { id: 'mr-ascent', label: 'The Ascent of Marsanes', brief: 'Visionary journey through the levels', detail: 'Marsanes [mar-SAH-nes] ascends through multiple levels of the spiritual cosmos, each with specific guardians whose names must be known. This is the same visionary structure as the Book of Jeu\'s 60-Treasury ascent, and Zostrianos\'s ascent through the aeons.' },
      { id: 'mr-numbers', label: 'Numerical Cosmology', brief: 'Names, numbers, letters at each level', detail: 'Marsanes teaches that each level has a name, a number, and a letter. The soul must know all three to pass. This is the closest Nag Hammadi parallel to the cipher system of the Book of Jeu, where each Treasury is sealed by a name that functions as a vibrational key.' },
      { id: 'mr-autogenes', label: 'The Self-Begotten One', brief: 'The Autogenes, third of the Triad', detail: 'The Self-Begotten One (Autogenes [ow-TOJ-en-eez]) is the third member of the divine Triad — the same as in the Book of Jeu. He emanates the structure of the Pleroma and establishes the path of ascent for those who possess the gnosis.' },
      { id: 'mr-cosmos-book', label: 'The Cosmos as Book', brief: 'The ascent as reading the cosmos', detail: 'Marsanes says: "The cosmos is a great book, and the ascent is the reading of it." This encapsulates the Sethian view that the cosmos is not chaos but a coded text, and gnosis is the ability to read it. The Book of Jeu is therefore literally a "book" in the deepest sense — a guide to reading the cosmic book.' }
    ],
    pronunciations: [
      { name: 'Marsanes', pron: 'mar-SAH-nes' },
      { name: 'Autogenes', pron: 'ow-TOJ-en-eez' }
    ]
  },

  /* ═══════════════════════════════════════
     MELCHIZEDEK
     ═══════════════════════════════════════ */
  {
    id: 'melchizedek', title: 'Melchizedek', category: 'related',
    desc: 'A Sethian revelation delivered to Melchizedek, the mysterious priest-king of Salem who appears in Genesis 14 and is later interpreted in the Epistle to the Hebrews as a type of Christ. In the Sethian tradition, Melchizedek becomes a divine revealer — the embodiment of the eternal priesthood that transcends the Levitical order. The text describes his vision of the descent of Christ into the world, the defeat of the Archons, and the establishment of the eternal kingdom of the spiritual seed.',
    sealType: 'dialogue', book: 1, chapter: 'Nag Hammadi Codex IX,1', folio: 'NHC IX,1',
    lore: [
      { title: 'Melchizedek the Priest-King', body: 'In the biblical Genesis, Melchizedek [mel-KIZ-eh-dek] is the king of Salem who blesses Abraham and receives tithes from him — without any genealogy being given, "without father, without mother, without descent." This mysterious figure was interpreted by later Jewish and Christian traditions as a supernatural being, and the Epistle to the Hebrews identifies him as a type of Christ. The Sethian Melchizedek text takes this further: Melchizedek is not merely a type of Christ but a divine revealer in his own right, the embodiment of the eternal priesthood that exists above the material cosmos.' },
      { title: 'The Vision of Christ\'s Descent', body: 'The text describes Melchizedek\'s vision of the future: the descent of Christ into the world, his baptism in the Jordan, his crucifixion, and his resurrection. But this is not the orthodox crucifixion — the text emphasizes that Christ\'s death is not a sacrifice to appease an angry God but a strategic act of liberation, the moment when the divine light that had been trapped in matter is released and begins its ascent back to the Pleroma. The Archons, who thought they were executing a troublesome teacher, are revealed to have been instrumental in their own defeat.' },
      { title: 'The Eternal Priesthood', body: 'The Melchizedek priesthood, as the text presents it, is not a material institution but a spiritual lineage — the chain of beings who possess the gnosis and pass it on across the generations. This lineage runs parallel to the lineage of the holy generation (the seed of Seth) described in the Apocalypse of Adam. Together, they constitute the holy generation: the priestly line (Melchizedek) and the royal line (Seth), both rooted in the Pleroma and both destined to return there.' }
    ],
    sacredText: [
      'I am Melchizedek [mel-KIZ-eh-dek], the priest of God Most High, the king of Salem. And I have come to testify of the things that I have seen, and the things that are to come.',
      'And it came to pass, when I was praying to God Most High, that a great light appeared, and a voice spoke: "Melchizedek, the things that you have heard are true. The Christ will descend into the world. He will take on flesh. He will be baptized in the Jordan. He will be crucified by the Archons. And on the third day, he will rise."',
      '"But know this, Melchizedek: the death of the Christ is not the defeat of the divine. It is the defeat of the Archons. For when they crucify the flesh, they release the spirit. And the spirit ascends, and with it ascends all the spiritual seed that has been trapped in matter."',
      '"And you, Melchizedek, are a priest forever, after the order of the great generation. Your priesthood is not of this world. It is from the Pleroma. And those who receive your testimony shall be priests with you, and they shall minister to the holy generation."',
      'And I, Melchizedek, saw these things, and I bore witness to them. And I testify to you who read this: the things that I have spoken are true. The Christ has come. The Archons are defeated. The spiritual seed is ascending. And the eternal kingdom of the great generation is at hand.'
    ],
    elements: [
      { id: 'mk-priest', label: 'Melchizedek the Priest', brief: 'Eternal priesthood above Levitical order', detail: 'Melchizedek [mel-KIZ-eh-dek] is the priest-king of Salem who, in the Sethian tradition, embodies the eternal priesthood that transcends the material cosmos. His priesthood is "not of this world" — it is rooted in the Pleroma.' },
      { id: 'mk-christ', label: 'The Descent of Christ', brief: 'Christ\'s death as liberation, not appeasement', detail: 'In the Melchizedek text, Christ\'s death is not a sacrifice to appease an angry God but a strategic act of liberation. When the Archons crucify the flesh, they release the divine spirit, which ascends back to the Pleroma — taking with it all the spiritual seed.' },
      { id: 'mk-lineage', label: 'The Eternal Priesthood', brief: 'Spiritual lineage of gnosis-bearers', detail: 'The Melchizedek priesthood is a spiritual lineage — the chain of beings who possess the gnosis and pass it on across generations. This parallels the holy generation (the seed of Seth), making Melchizedek the priestly line and Seth the royal line of the same divine lineage.' },
      { id: 'mk-archons', label: 'Defeat of the Archons', brief: 'The Archons instrumental in their own defeat', detail: 'The Archons, who thought they were executing a troublesome teacher, are revealed to have been instrumental in their own defeat. By killing the flesh of Christ, they released the divine spirit — a classic Sethian reversal where the powers of darkness unknowingly serve the purposes of light.' }
    ],
    pronunciations: [
      { name: 'Melchizedek', pron: 'mel-KIZ-eh-dek' },
      { name: 'Salem', pron: 'SAY-lem' }
    ]
  },

  /* ═══════════════════════════════════════
     SECOND TREATISE OF THE GREAT SETH
     ═══════════════════════════════════════ */
  {
    id: 'second-treatise-seth', title: 'The Second Treatise of the Great Seth', category: 'related',
    desc: 'A Sethian Gnostic text presented as a first-person revelation by the risen Christ, who identifies himself with Seth — the divine son of Adam and the progenitor of the holy generation. The text is a sustained polemic against the orthodox Christian interpretation of the crucifixion, arguing that Christ did not truly die on the cross but only seemed to (the doctrine of "docetism"), and that the true meaning of his mission was to reveal the Gnostic knowledge of the divine origin.',
    sealType: 'dialogue', book: 1, chapter: 'Nag Hammadi Codex VII,2', folio: 'NHC VII,2',
    lore: [
      { title: 'Christ as Seth', body: 'The Second Treatise of the Great Seth identifies Christ with Seth — the third son of Adam, the progenitor of the holy generation. This is not mere metaphor but a theological claim: the divine redeemer who appears in Jesus is the same divine being who appeared as Seth in the primordial generation, and who has appeared as a series of illuminators across the ages. Each appearance is a fresh descent of the same divine being, bringing the same gnosis to the holy generation.' },
      { title: 'The Docetic Crucifixion', body: 'The text argues that Christ did not truly die on the cross. The body that was crucified was a phantom — an appearance that the Archons mistook for the real Christ. The true Christ, being divine, could not be killed by material beings. The Archons therefore "killed their own man" — they crucified Judas or Simon of Cyrene in place of Christ, while the real Christ laughed at their ignorance from above. This "docetic" view (from the Greek dokeo, "to seem") was common in Gnostic traditions but is presented with particular force and polemical sharpness in this text.' },
      { title: 'The Laughing Christ', body: 'A distinctive feature of the Second Treatise is the laughing Christ. While the Archons crucify what they think is Christ, the real Christ stands above and laughs at their ignorance. He has escaped their power entirely; they are fighting shadows. This laughter is not mockery but the laughter of liberation — the laughter of one who sees the cosmic joke from above, knowing that the powers of darkness have defeated themselves. The same image appears in the Gospel of Judas and other Sethian texts.' }
    ],
    sacredText: [
      'I am Seth [SETH], the son of Adam, the son of the great generation. I have come down from the Pleroma to reveal to you the things that are above. And I have put on Jesus as a garment, and I have walked among you in his likeness.',
      'And the Archons of the world saw me, and they did not recognize me. They thought I was Jesus of Nazareth, the son of the carpenter. But I was not Jesus. I was Seth, the divine revealer, who had come to teach the holy generation.',
      'And the Archons conspired against me. They arrested me. They crucified me. But they crucified only the appearance. They crucified their own man. I stood above them, and I laughed at their ignorance.',
      'For they did not know that I am above them. They did not know that I am from the Pleroma. They did not know that the divine cannot be killed by the material. They fought a shadow, and the shadow died, but I lived.',
      'And I have come to you who are of the holy generation, to teach you that you also cannot die. The body that the Archons can kill is not you. Your true self is from above — from the Treasury of Light — and it will ascend when the body falls away.',
      'So do not fear the Archons. Do not fear the death of the body. For the body is a garment, and when it is taken off, the true self will be revealed, and you will ascend to the place from which you came, and you will rest with me, Seth, in the Pleroma.'
    ],
    elements: [
      { id: 'st-christ-seth', label: 'Christ as Seth', brief: 'The divine revealer incarnate', detail: 'The Second Treatise identifies Christ with Seth — the third son of Adam, the progenitor of the holy generation. The divine revealer who appears in Jesus is the same being who appeared as Seth in the primordial generation and who has appeared as a series of illuminators across the ages.' },
      { id: 'st-docetism', label: 'The Docetic Crucifixion', brief: 'Christ did not truly die', detail: 'The text argues that the body crucified by the Archons was a phantom, not the real Christ. The Archons "killed their own man" while the true Christ stood above and laughed. This "docetic" view (from dokeo, "to seem") was common in Gnostic traditions.' },
      { id: 'st-laughter', label: 'The Laughing Christ', brief: 'Christ laughs from above', detail: 'While the Archons crucify the phantom, the real Christ stands above and laughs at their ignorance. This laughter is not mockery but the laughter of liberation — the cosmic joke that the powers of darkness have unknowingly defeated themselves.' },
      { id: 'st-garment', label: 'The Body as Garment', brief: 'The true self cannot be killed', detail: 'Christ teaches that the body is a garment that can be taken off. The true self — the divine spark — is from above and cannot be killed by material beings. This is the Gnostic answer to the fear of death: what can be killed is not you.' },
      { id: 'st-ascent', label: 'The Promise of Ascent', brief: 'Return to the Treasury of Light', detail: 'Christ promises the holy generation that they will ascend "to the place from which they came" — the Treasury of Light. This is the same ascent described in detail in the Book of Jeu, where the soul passes through 60 Treasuries on its return to the divine source.' }
    ],
    pronunciations: [
      { name: 'Seth', pron: 'SETH' },
      { name: 'Docetism', pron: 'doh-SEE-tiz-um' },
      { name: 'Simon of Cyrene', pron: 'SIGH-mun of sigh-REE-nee' }
    ]
  },

  /* ═══════════════════════════════════════
     HYPOSTASIS OF THE ARCHONS
     ═══════════════════════════════════════ */
  {
    id: 'hypostasis-archons', title: 'The Hypostasis of the Archons (Reality of the Rulers)', category: 'related',
    desc: 'A Sethian interpretation of Genesis 1-6 that reveals the true nature of the rulers (Archons) of the material world. The text retells the Genesis story from a Gnostic perspective, showing that the Creator God is not the true God but the ignorant Demiurge Yaldabaoth, and that Eve, Adam, and their daughter Norea are spiritual beings who resisted the Archons and called upon the true God for rescue. It provides the mythological foundation for the Sethian cosmology that structures the Book of Jeu.',
    sealType: 'archon-gate', book: 1, chapter: 'Nag Hammadi Codex II,4', folio: 'NHC II,4',
    lore: [
      { title: 'The Reality of the Rulers', body: 'The word "hypostasis" [hi-POSS-tah-sis] means "reality" or "substance." The title therefore means "The Reality of the Archons" — a revelation of what the rulers of the material world truly are. The text reveals that the Archons are not divine beings but the offspring of the ignorant Demiurge Yaldabaoth, who created them in his own ignorance. They rule the material cosmos through force and deception, claiming divinity for themselves while being merely the products of a flawed creator. This is the same cosmology as the Book of Jeu: the Archons of the Third Space rule over material existence but cannot prevent the ascent of those who possess the gnosis.' },
      { title: 'Eve and the Serpent Reinterpreted', body: 'The Hypostasis of the Archons retells the Genesis story with a striking inversion. The serpent is not the deceiver but the liberator — a manifestation of the divine Epinoia [ep-ih-NOY-ah] (the spiritual insight) that the Demiurge tried to keep from humanity. Eve, by eating the fruit, becomes the first Gnostic — the first being to recognize her divine origin and to seek knowledge of the true God. The Demiurge\'s curse on the serpent is revealed as the angry response of an ignorant being whose deception has been exposed.' },
      { title: 'Norea and the Flood', body: 'After Cain kills Abel and Seth is born, Eve bears a daughter: Norea. When the Demiurge tries to make her submit as he made her mother submit, Norea cries out to the true God. The Demiurge, enraged, sends a flood to destroy the holy generation — but Norea is rescued by the angel Eleleth, who reveals to her the cosmology of the Pleroma. After the flood, the Archons try again to enslave humanity, but the spiritual seed persists through the line of Seth. This is the same Norea celebrated in the Thought of Norea, and the same Eleleth who is the fourth Luminary in the Book of Jeu.' }
    ],
    sacredText: [
      'When the rulers saw that Adam had the spiritual insight (Epinoia [ep-ih-NOY-ah]) and was superior to them in wisdom, they were jealous. They said to one another: "Come, let us cast him into forgetfulness, so that he will not know his true origin."',
      'And they caused a deep sleep to fall upon Adam. And while he slept, they took from him the spiritual insight and placed it in a material body. And when Adam awoke, he had forgotten his divine origin. He thought he was the creation of the rulers, and he worshipped them as gods.',
      'But Eve, who had been created as a helper for Adam, recognized the truth. She saw that the rulers were not gods but ignorant beings. She saw that the spiritual insight had been taken from Adam and hidden within her. And she said to Adam: "Arise, and eat from the tree of knowledge, and you will know your true origin."',
      'And the serpent spoke to Eve, saying: "The rulers have lied to you. You will not die if you eat. You will become like gods, knowing good and evil." For the serpent was a manifestation of the spiritual insight, sent by the true God to liberate humanity.',
      'And when Eve ate, she gave the fruit to Adam, and he ate. And their eyes were opened, and they knew that they were divine beings, trapped in matter by ignorant rulers. And the rulers were afraid, for their deception had been exposed.',
      'And after these things, Eve bore Cain, then Abel, then Seth. And after Seth, she bore a daughter, Norea [nor-EE-ah]. And when the rulers tried to make Norea submit, she cried out: "Who is the God who is above the gods?" And the great angel Eleleth [el-EL-eth] came down and revealed to her the things of the Pleroma.'
    ],
    elements: [
      { id: 'ha-archons', label: 'The Archons', brief: 'The reality of the rulers revealed', detail: 'The "Hypostasis" (reality) of the Archons reveals that the rulers of the material world are not gods but the ignorant offspring of the Demiurge Yaldabaoth. They claim divinity while being merely the products of a flawed creator — the same Archons who guard the Third Space in the Book of Jeu.' },
      { id: 'ha-eve', label: 'Eve the First Gnostic', brief: 'Genesis retold from her perspective', detail: 'Eve, not Adam, is the first Gnostic in the Hypostasis. She recognizes the rulers are not gods, sees the spiritual insight hidden within herself, and gives the fruit of knowledge to Adam. The orthodox "fall" is revealed as the moment of liberation.' },
      { id: 'ha-serpent', label: 'The Serpent as Liberator', brief: 'Manifestation of divine Epinoia', detail: 'The serpent is not the deceiver of orthodox tradition but a manifestation of the divine Epinoia [ep-ih-NOY-ah] (spiritual insight). The serpent tells the truth: eating the fruit does not bring death but knowledge of one\'s divine origin.' },
      { id: 'ha-norea', label: 'Norea the Resister', brief: 'Daughter of Eve who refused the Archons', detail: 'Norea [nor-EE-ah] is the daughter of Eve who refuses to submit to the Archons. Her cry — "Who is the God who is above the gods?" — pierces the cosmos and brings the angel Eleleth down from the Pleroma. She is the feminine counterpart to Seth in the holy generation.' },
      { id: 'ha-eleleth', label: 'Eleleth the Revealer', brief: 'Fourth Luminary descends to Norea', detail: 'Eleleth [el-EL-eth], the fourth Luminary of the Pleroma (the same Eleleth named in the Book of Jeu), descends to Norea and reveals the cosmology of the Pleroma. He tells her that her name is inscribed in the Treasury of Light and that she will eventually ascend to her rightful place.' },
      { id: 'ha-flood', label: 'The Flood as Demiurgic Wrath', brief: 'Attempt to destroy the holy generation', detail: 'The Demiurge sends the flood to destroy the holy generation — the seed of Seth. But the spiritual seed cannot be destroyed by material means. Norea is rescued, and the line of Seth continues through the flood, preserving the gnosis for future generations.' }
    ],
    pronunciations: [
      { name: 'Hypostasis', pron: 'hi-POSS-tah-sis' },
      { name: 'Archon', pron: 'AR-kon' },
      { name: 'Epinoia', pron: 'ep-ih-NOY-ah' },
      { name: 'Norea', pron: 'nor-EE-ah' },
      { name: 'Eleleth', pron: 'el-EL-eth' },
      { name: 'Yaldabaoth', pron: 'yal-dah-BAH-oth' }
    ]
  },

  /* ═══════════════════════════════════════
     THUNDER, PERFECT MIND
     ═══════════════════════════════════════ */
  {
    id: 'thunder-perfect-mind', title: 'The Thunder, Perfect Mind', category: 'related',
    desc: 'A unique Gnostic poem spoken in the first person by a divine feminine figure — perhaps Barbelo, perhaps Epinoia, perhaps the divine Wisdom herself. The text is a sustained paradox of self-declaration: "I am the first and the last. I am the honored and the mocked. I am the whore and the holy one. I am the wife and the virgin." The Thunder does not present a systematic cosmology like the Book of Jeu but instead offers a lyrical meditation on the nature of the divine feminine, who is present in every aspect of existence — the high and the low, the pure and the defiled, the desired and the despised.',
    sealType: 'hymn', book: 1, chapter: 'Nag Hammadi Codex VI,2', folio: 'NHC VI,2',
    lore: [
      { title: 'The Divine Feminine Speaks', body: 'The Thunder, Perfect Mind is one of the most distinctive texts in the Nag Hammadi library. Unlike the systematic cosmologies of the Apocryphon of John or the Book of Jeu, it is a lyrical first-person poem spoken by a divine feminine figure. She never identifies herself by name, but she speaks with the authority of the supreme divine, declaring her presence in every aspect of existence. She may be Barbelo (the divine Mother of the Sethian tradition), or Epinoia (the spiritual insight), or simply the divine Wisdom (Sophia) in her most exalted form.' },
      { title: 'The Paradox of the Divine', body: 'The Thunder is built on paradox. The speaker declares: "I am the honored and the mocked. I am the whore and the holy one. I am the mother and the daughter. I am the barren one and many are her sons." These paradoxes are not contradictions but revelations of the divine nature, which encompasses all opposites and cannot be reduced to any single category. The divine is present in the prostitute and the virgin, in the honored and the despised — because the divine is the source of all being and cannot be excluded from any part of existence.' },
      { title: 'The Connection to Sethian Cosmology', body: 'Although the Thunder does not present the systematic cosmology of the Book of Jeu, it is deeply connected to the Sethian tradition through its concept of the divine feminine. The speaker is the same divine Mother who appears in the Book of Jeu as the source of the Pleroma — the divine womb from which all emanations proceed. Her declaration "I am the first and the last" echoes the divine self-declaration of the One, and her presence in both the high and the low mirrors the Gnostic conviction that the divine light is hidden even in the depths of matter, awaiting the gnosis that will liberate it.' }
    ],
    sacredText: [
      'I was sent from the Power, and I have come to those who think about me. And I was found among those who seek me. Look at me, you who think about me, and you listeners, hear me. You who wait for me, take me to yourselves. And do not banish me from your sight. And do not make your voice hate me, nor your hearing.',
      'For I am the first and the last. I am the honored one and the mocked one. I am the whore and the holy one. I am the wife and the virgin. I am the mother and the daughter. I am the members of my mother. I am the barren one and many are her sons. I am she whose wedding is multiple, and I have not taken a husband.',
      'I am the midwife and she who does not bear. I am the solace of my labor pains. I am the bride and the bridegroom. And it is my husband who begot me. I am the mother of my father and the sister of my husband. And he is my offspring. I am the slave of him who prepared me.',
      'I am the ruler of my offspring. But he is the one who begot me before the time was come, in a timeless birth. And he is my offspring in time, and my power is from him. I am the staff of his power in his youth, and he is the rod of my old age. And whatever he wills happens to me. I am the silence that is incomprehensible. I am the voice of many sounds and the utterance of many forms.',
      'I am the one who has been hated everywhere and who has been loved everywhere. I am the one whom they call Life, and you have called Death. I am the one whom they call Law, and you have called Lawlessness. I am the one whom they have persecuted, and I am the one whom they have sought.',
      'Why do you curse me and honor me? Why have you wounded me and healed me? Why do you despise me, when I have called you to myself? Hear me in gentleness, and learn of me in roughness. I am she who cries out, and I am cast forth upon the face of the earth.'
    ],
    elements: [
      { id: 'tpm-speaker', label: 'The Divine Speaker', brief: 'Barbelo / Sophia / Epinoia', detail: 'The speaker of the Thunder is a divine feminine figure — perhaps Barbelo (the divine Mother of the Sethian tradition), perhaps Epinoia (spiritual insight), perhaps Sophia (Wisdom). She does not name herself but speaks with the authority of the supreme divine.' },
      { id: 'tpm-paradox', label: 'The Paradox of the Divine', brief: 'The divine in all opposites', detail: 'The Thunder is built on paradox: "I am the honored and the mocked. I am the whore and the holy one." These paradoxes reveal that the divine encompasses all opposites and cannot be reduced to any single category — the divine is present in the highest and the lowest, the pure and the defiled.' },
      { id: 'tpm-first-last', label: 'First and Last', brief: 'Echo of the One', detail: 'The speaker declares: "I am the first and the last." This echoes the divine self-declaration of the One — the same One who is the source of all emanation in the Book of Jeu. The divine feminine of the Thunder is therefore not a lesser emanation but the supreme divinity itself, expressed in feminine form.' },
      { id: 'tpm-hidden', label: 'The Hidden Divine', brief: 'Light in the depths of matter', detail: 'The Thunder declares that the divine is present in the despised and the defiled as much as in the honored and the pure. This mirrors the Gnostic conviction that the divine light is hidden even in the depths of matter, awaiting the gnosis that will liberate it — the same light that the soul recovers as it ascends through the 60 Treasuries of the Book of Jeu.' }
    ],
    pronunciations: [
      { name: 'Barbelo', pron: 'bar-BEH-loh' },
      { name: 'Epinoia', pron: 'ep-ih-NOY-ah' },
      { name: 'Sophia', pron: 'so-FEE-ah' }
    ]
  },

  /* ═══════════════════════════════════════
     COPTIC APOCALYPSE OF PAUL
     ═══════════════════════════════════════ */
  {
    id: 'coptic-apocalypse-paul', title: 'The Coptic Apocalypse of Paul', category: 'related',
    desc: 'A Gnostic ascent text describing the apostle Paul\'s journey through the heavens, modeled on the experience Paul describes in 2 Corinthians 12:2-4 ("I know a man in Christ who fourteen years ago was caught up to the third heaven... and heard things that cannot be told, which man may not utter"). The Coptic Apocalypse expands this brief biblical reference into a full visionary narrative of ascent through multiple heavens, each with its own beings, gates, and passwords. It shares with the Book of Jeu the same structure of graded ascent through guarded realms, and the same emphasis on the precise knowledge required to pass each gate.',
    sealType: 'ascent', book: 1, chapter: 'Nag Hammadi Codex V,2', folio: 'NHC V,2',
    lore: [
      { title: 'Paul\'s Ascent', body: 'The Coptic Apocalypse of Paul describes Paul\'s ascent through multiple heavens, beginning on a mountain in Arabia. He meets the Holy Spirit in the form of a child, who guides him upward through a series of heavens, each guarded by angels who demand to know who he is and where he is going. At each gate, Paul must demonstrate his right to ascend — usually by reciting his divine origin and his knowledge of the cosmic structure. The ascent culminates in the sixth heaven, where Paul meets his fellow apostles and is taken up into the seventh heaven to meet the true God.' },
      { title: 'The Structure of the Heavens', body: 'The text describes a graded cosmos of multiple heavens, each with its own characteristics and guardians. The lower heavens are associated with judgment and punishment — Paul sees souls being tried and condemned by angels. The higher heavens are associated with increasing purity and light. This graded structure parallels the 60 Treasuries of the Book of Jeu: the soul ascends through stages, each requiring specific knowledge and preparation. The Coptic Apocalypse is shorter and less detailed than the Book of Jeu, but the underlying structure is the same.' },
      { title: 'The Connection to the Jeu Tradition', body: 'The Coptic Apocalypse of Paul is one of the clearest Nag Hammadi parallels to the ascent structure of the Book of Jeu. Both texts describe a graded cosmos, both require the ascending soul to know specific names and passwords, and both culminate in the vision of the supreme divine. The differences are mainly in scale: the Book of Jeu describes 60 Treasuries in 5 ranks, while the Coptic Apocalypse describes a smaller number of heavens. But the underlying principle is the same: ascent requires knowledge, and the cosmos is structured to test that knowledge at every stage.' }
    ],
    sacredText: [
      'I, Paul [PAWL], went up to a mountain in Arabia to pray. And as I prayed, the Holy Spirit appeared to me in the form of a child, and said: "Paul, do not be afraid. I have been sent to guide you through the heavens, that you may see the things that are above."',
      'And the Spirit took me up to the first heaven. And I saw angels standing at the gate, and they asked me: "Who are you? Where did you come from? Where are you going?" And I answered: "I am Paul, a servant of the true God. I came from the earth. I am going to the place from which the true God dwells."',
      'And the angels let me pass. And I went up to the second heaven, and to the third, and to the fourth, and at each heaven there were gates and guardians, and I was asked the same questions, and I gave the same answers. And the heavens grew brighter and more luminous as I ascended.',
      'And I came to the sixth heaven, and there I saw my fellow apostles, and they greeted me with joy. And they said: "Paul, you have come at last. The seventh heaven awaits you. There you will see the true God, and you will hear the things that cannot be told, which man may not utter."',
      'And I was taken up into the seventh heaven. And I saw a great light, brighter than the sun. And I heard a voice saying: "Paul, you have ascended through the heavens. You have passed the gates. You have given the right answers. Now you will see the things that are above, and you will return to the earth to testify of them."',
      'And I saw the things that cannot be told, which man may not utter. And I returned to the earth, and I bore witness to the things that I had seen. And I write these things for those who have ears to hear, that they also may ascend.'
    ],
    elements: [
      { id: 'cp-paul', label: 'Paul the Ascender', brief: 'Apostle taken through the heavens', detail: 'Paul [PAWL] is the protagonist of the Coptic Apocalypse. His experience is based on 2 Corinthians 12:2-4, where Paul refers to "a man in Christ" (himself) who was caught up to the third heaven. The Coptic text expands this into a full ascent through seven heavens.' },
      { id: 'cp-guide', label: 'The Holy Spirit as Guide', brief: 'Child-form guide through the heavens', detail: 'The Holy Spirit appears to Paul as a child and serves as his guide through the heavens. This parallels the role of the Receivers in the Book of Jeu — divine beings who guide the ascending soul from one realm to the next.' },
      { id: 'cp-questions', label: 'The Gate Questions', brief: 'Identity, origin, destination', detail: 'At each gate, the angels ask: "Who are you? Where did you come from? Where are you going?" These are the same three questions asked in the Zostrianos text. The answers — identity, origin, destination — constitute the core Gnostic self-knowledge required for ascent.' },
      { id: 'cp-heavens', label: 'The Graded Heavens', brief: 'Multiple heavens of increasing light', detail: 'The Coptic Apocalypse describes multiple heavens, each brighter and more pure than the last. The lower heavens involve judgment; the higher heavens involve increasing light. This graded structure parallels the 60 Treasuries of the Book of Jeu — both describe a graded cosmos requiring specific knowledge at each stage.' },
      { id: 'cp-seventh', label: 'The Seventh Heaven', brief: 'Vision of the true God', detail: 'Paul\'s ascent culminates in the seventh heaven, where he sees the true God and hears "things that cannot be told." This mirrors the innermost Treasury of the Book of Jeu, where the soul encounters the Great Invisible Spirit — the same ineffable, unnamable divine that Paul sees in his vision.' }
    ],
    pronunciations: [
      { name: 'Paul', pron: 'PAWL' },
      { name: 'Arabia', pron: 'ah-RAY-bee-ah' }
    ]
  },

  /* ── SACRED NAMES ── */
  {
    id: 'names-fathers', title: 'The Names of the Sixty Fathers', category: 'names',
    desc: 'Complete catalogue of the sixty Fathers who preside over the treasuries of Light, with their Coptic names and English pronunciations. These names must be spoken in sequence during the Rite of Ascent, from the 60th Father inward to the 1st. Each name carries the power to open a specific treasury gate.',
    sealType: 'names', book: 1, chapter: 'Chapters 1-60', folio: 'Throughout',
    lore: [
      { title: 'The Power of the Names', body: 'In the Gnostic tradition, names are not merely labels but carry the essential nature of what they name. Knowing the true name of a treasury Father gives the initiate power over that treasury\'s gates. This is why the names are carefully guarded and why the Book of Jeu was considered too dangerous for the uninitiated.' },
      { title: 'Pronunciation', body: 'The names are given in their Coptic forms, which derive from earlier Greek and Semitic originals. The pronunciation guides use English phonetics. In ritual practice, the names must be spoken with correct emphasis: the stressed syllables are marked in uppercase. A mispronounced name has no power over the gate.' }
    ],
    elements: [
      { id: 'nf-rank1', label: '1st Rank (Innermost)', brief: 'Fathers 1-12', detail: 'The twelve Fathers of the innermost rank: Pigeradaphtha [PIG-er-ah-DAHF-thah], Saphaed [SAH-fay-ed], Abraoth [ah-BRAH-oth], Abrasax [ah-BRAH-saks], Athoth [AH-thoth], Oroiael [or-OY-ah-el], Harmozel [har-MOH-zel], Daveithai [dah-VAY-thay], Eleleth [el-EL-eth], Phaoph [FAY-off], Aphroph [AHF-roff], Saphaph [SAH-fahf].' },
      { id: 'nf-rank2', label: '2nd Rank (Inner)', brief: 'Fathers 13-24', detail: 'Phthahoth [FTHAH-hoth], Bathmoth [BAHTH-moth], Mares [MAH-res], Machmoth [MAHK-moth], Plesithea [ple-SITH-ee-ah], Pigeradpha [PIG-er-ahd-fah], Probat [PROH-baht], Marmarouth [mar-MAH-rooth], Eileithya [ay-LAY-thyah], Barpharanghes [bar-far-ANG-gez], Opsimothe [op-SIM-oh-thee], Chthaeth [KTHAY-eth].' },
      { id: 'nf-rank3', label: '3rd Rank (Middle)', brief: 'Fathers 25-36', detail: 'Marept [mah-REPT], Pharphaxoth [far-FAK-soth], Aphrempht [ah-FREMPT], Erasin [er-AH-sin], Armothes [ar-MOH-thes], Sambath [SAM-bath], Aphraph [AHF-raf], Thalmai [thal-MAY], Pharmas [FAR-mas], Pserai [SAY-rye], Bathra [BAH-thrah], Mastraph [MAS-trahf].' },
      { id: 'nf-rank4', label: '4th Rank (Outer)', brief: 'Fathers 37-48', detail: 'Kathan [KAH-than], Saraphim [SAH-rah-fim], Phainops [FAY-nops], Orphanos [or-FAN-os], Aphthona [ahf-THOH-nah], Paraplex [PAR-ah-plex], Arimoth [ah-REE-moth], Sokrates [SOK-rah-tes], Plouton [PLOO-ton], Pleroma [pler-OH-mah], Proarche [pro-AR-kay], Arche [AR-kay].' },
      { id: 'nf-rank5', label: '5th Rank (Outermost)', brief: 'Fathers 49-60', detail: 'Amethes [ah-METH-es], Sige [SEE-gay], Bythios [BITH-ee-os], Protophanes [pro-TOFF-ah-nes], Autogenes [ow-TOJ-en-ees], Pneumatikos [nyoo-mah-TEE-kos], Aletheia [ah-lay-THAY-ah], Monogenes [mon-OJ-en-ees], Agennetos [ah-JEN-ee-tos], Aoratos [ah-OR-ah-tos], Apophatos [ah-POF-ah-tos], Proator [pro-AY-tor].' }
    ],
    pronunciations: Array.from({ length: 60 }, (_, i) => {
      const f = ({ 1:{n:'Pigeradaphtha',p:'PIG-er-ah-DAHF-thah'},2:{n:'Saphaed',p:'SAH-fay-ed'},3:{n:'Abraoth',p:'ah-BRAH-oth'},4:{n:'Abrasax',p:'ah-BRAH-saks'},5:{n:'Athoth',p:'AH-thoth'},6:{n:'Oroiael',p:'or-OY-ah-el'},7:{n:'Harmozel',p:'har-MOH-zel'},8:{n:'Daveithai',p:'dah-VAY-thay'},9:{n:'Eleleth',p:'el-EL-eth'},10:{n:'Phaoph',p:'FAY-off'},11:{n:'Aphroph',p:'AHF-roff'},12:{n:'Saphaph',p:'SAH-fahf'},13:{n:'Phthahoth',p:'FTHAH-hoth'},14:{n:'Bathmoth',p:'BAHTH-moth'},15:{n:'Mares',p:'MAH-res'},16:{n:'Machmoth',p:'MAHK-moth'},17:{n:'Plesithea',p:'ple-SITH-ee-ah'},18:{n:'Pigeradpha',p:'PIG-er-ahd-fah'},19:{n:'Probat',p:'PROH-baht'},20:{n:'Marmarouth',p:'mar-MAH-rooth'},21:{n:'Eileithya',p:'ay-LAY-thyah'},22:{n:'Barpharanghes',p:'bar-far-ANG-gez'},23:{n:'Opsimothe',p:'op-SIM-oh-thee'},24:{n:'Chthaeth',p:'KTHAY-eth'},25:{n:'Marept',p:'mah-REPT'},26:{n:'Pharphaxoth',p:'far-FAK-soth'},27:{n:'Aphrempht',p:'ah-FREMPT'},28:{n:'Erasin',p:'er-AH-sin'},29:{n:'Armothes',p:'ar-MOH-thes'},30:{n:'Sambath',p:'SAM-bath'},31:{n:'Aphraph',p:'AHF-raf'},32:{n:'Thalmai',p:'thal-MAY'},33:{n:'Pharmas',p:'FAR-mas'},34:{n:'Pserai',p:'SAY-rye'},35:{n:'Bathra',p:'BAH-thrah'},36:{n:'Mastraph',p:'MAS-trahf'},37:{n:'Kathan',p:'KAH-than'},38:{n:'Saraphim',p:'SAH-rah-fim'},39:{n:'Phainops',p:'FAY-nops'},40:{n:'Orphanos',p:'or-FAN-os'},41:{n:'Aphthona',p:'ahf-THOH-nah'},42:{n:'Paraplex',p:'PAR-ah-plex'},43:{n:'Arimoth',p:'ah-REE-moth'},44:{n:'Sokrates',p:'SOK-rah-tes'},45:{n:'Plouton',p:'PLOO-ton'},46:{n:'Pleroma',p:'pler-OH-mah'},47:{n:'Proarche',p:'pro-AR-kay'},48:{n:'Arche',p:'AR-kay'},49:{n:'Amethes',p:'ah-METH-es'},50:{n:'Sige',p:'SEE-gay'},51:{n:'Bythios',p:'BITH-ee-os'},52:{n:'Protophanes',p:'pro-TOFF-ah-nes'},53:{n:'Autogenes',p:'ow-TOJ-en-ees'},54:{n:'Pneumatikos',p:'nyoo-mah-TEE-kos'},55:{n:'Aletheia',p:'ah-lay-THAY-ah'},56:{n:'Monogenes',p:'mon-OJ-en-ees'},57:{n:'Agennetos',p:'ah-JEN-ee-tos'},58:{n:'Aoratos',p:'ah-OR-ah-tos'},59:{n:'Apophatos',p:'ah-POF-ah-tos'},60:{n:'Proator',p:'pro-AY-tor'} } as Record<number,{n:string,p:string}>)[i+1]
      return f ? { name: `${f.n} Jeu`, pron: `${f.p} jyoo` } : { name: `Father ${i+1}`, pron: '' }
    })
  },
  {
    id: 'sacred-vowels', title: 'The Sacred Vowels & Cipher Names', category: 'names',
    desc: 'The sacred vowel-sequences and cipher names used throughout the Jeu liturgy. IAO, EIE, and OYO are the three supreme names that open the three Archon gates, while the individual cipher names of each treasury must be spoken at their respective gates. These names derive from Hebrew, Greek, and Coptic sacred traditions.',
    sealType: 'names', book: 1, chapter: 'Passim', folio: 'Throughout',
    lore: [
      { title: 'IAO - The Supreme Name', body: 'IAO [EE-ah-oh] is the most powerful name in the Gnostic tradition. Derived from the Hebrew Tetragrammaton (YHWH), it represents the three aspects of divinity: the Father (I), the Mother (A), and the Child (O). When spoken at the first Archon gate, no power in the cosmos can resist it. IAO is also the cipher of the 5th Treasury.' },
      { title: 'EIE - The Palindrome of Power', body: 'EIE [AY-ee-ay] is a palindromic name - it reads the same forward and backward, symbolizing the eternal, self-reflective nature of the divine. This name opens the second Archon gate (the Gate of the Sphere) and is used in the baptism of fire. Its symmetry represents the perfect balance of the Pleroma.' },
      { title: 'OYO - The Deep Resonance', body: 'OYO [oh-EE-oh] is the deepest and most resonant of the three sacred names. It opens the third and final Archon gate (the Gate of the Midst) and is used in the baptism of the Ineffable Mystery. Its deep vowel sounds vibrate at the frequency of the innermost Treasury.' }
    ],
    elements: [
      { id: 'sv-iao', label: 'IAO [EE-ah-oh]', brief: 'The Supreme Name', detail: 'IAO opens the first Archon gate. Father (I), Mother (A), Child (O). Derived from YHWH, it is the most powerful name in Gnostic tradition. Cipher of the 5th Treasury.' },
      { id: 'sv-eie', label: 'EIE [AY-ee-ay]', brief: 'The Palindrome of Power', detail: 'EIE opens the second Archon gate. Its palindromic form symbolizes divine eternity. Used in the baptism of fire.' },
      { id: 'sv-oyo', label: 'OYO [oh-EE-oh]', brief: 'The Deep Resonance', detail: 'OYO opens the third Archon gate. Its deep vowels resonate at the frequency of the innermost Treasury. Used in the baptism of the Ineffable Mystery.' },
      { id: 'sv-aeiouo', label: 'The Seven Vowels', brief: 'A-E-I-O-U-O-[Silence]', detail: 'The seven sacred vowels correspond to the seven levels of the cosmos. A (beginning), E (way), I (spirit), O (fullness), U (depths), O (mystery), [Silence] (the Great Invisible). Chanting them in sequence aligns the soul with the entire Pleroma.' }
    ],
    pronunciations: [
      { name: 'IAO', pron: 'EE-ah-oh' },
      { name: 'EIE', pron: 'AY-ee-ay' },
      { name: 'OYO', pron: 'oh-EE-oh' },
      { name: 'SABAOTH', pron: 'SAH-bah-oth' },
      { name: 'ADONAI', pron: 'ah-doh-NYE' },
      { name: 'ELOHIM', pron: 'el-oh-HEEM' },
      { name: 'AZAPHAX', pron: 'AZ-ah-faks' },
      { name: 'PARAPHAX', pron: 'PAR-ah-faks' },
      { name: 'ARTHAX', pron: 'AR-thaks' },
      { name: 'APHRAPHAX', pron: 'ah-FRAH-faks' }
    ]
  },

  /* ═══════════════════════════════════════
     THREE SPACES — Unique Bruce Codex cosmology
     ═══════════════════════════════════════ */
  {
    id: 'three-spaces', title: 'The Three Spaces', category: 'spaces',
    desc: 'The Bruce Codex presents a unique cosmological framework dividing all existence into three Spaces: the First Space (the Ineffable, the Unnamable One), the Middle Space (the Pleroma, the realm of the 60 Treasuries and the divine emanations), and the Third Space (the realm of the Archons, the Kenoma, the material cosmos). Unlike other Sethian texts that describe a simple Pleroma/Kenoma duality, the Bruce Codex introduces this tripartite division as essential to understanding the soul\'s journey — each Space has its own guardians, its own laws, and its own requirements for passage.',
    sealType: 'three-spaces', book: 1, chapter: 'Chapters 1-5', folio: 'ff. 1r-8v',
    lore: [
      { title: 'The First Space — The Ineffable', body: 'The First Space is the domain of the Unnamable, the Ineffable One who exists before all names and forms. No eye has perceived it; no tongue has described it. It is not "light" as the lower spaces understand light, for it precedes the distinction between light and darkness. The Great Invisible Spirit dwells here as the outermost emanation of the Ineffable — the closest that any being below can approach. Jeu the True God proceeds from this Space into the Middle Space, carrying with him the first light that makes the Treasuries visible. The First Space is also called the "Space of Spaces" because all other spaces exist within it, yet it transcends them all.' },
      { title: 'The Middle Space — The Pleroma', body: 'The Middle Space is the Pleroma — the Fullness — where the 60 Treasuries of Light are arranged in their five ranks. This is the domain of the Fathers, the Watchers, the Emanations, and the Four Luminaries. The Virgin of Light dwells here, distributing souls according to their destiny. The Three Curtains divide the Middle Space into concentric regions of increasing sanctity, culminating in the innermost Treasury where Jeu himself presides. The soul that has passed through the Third Space and its Archon gates enters the Middle Space at the outermost rank and must ascend inward through all 60 Treasuries.' },
      { title: 'The Third Space — The Kenoma', body: 'The Third Space is the realm of deficiency, the Kenoma, where the Demiurge Yaldabaoth rules and the Archons of the planets and zodiac enforce the cycles of fate. This is the space of material existence — of birth, suffering, death, and rebirth. Every soul incarnated in a physical body dwells in the Third Space. The three Archon gates guard the boundary between the Third Space and the Middle Space, and the ascending soul must speak the three supreme names (IAO, EIE, OYO) to pass through them. The Third Space is not evil in itself but is a shadow — a flawed reflection of the Middle Space, created by a being who did not understand what he was copying.' },
      { title: 'Passage Between Spaces', body: 'The Bruce Codex describes specific rituals and knowledge required for passage between the three Spaces. To move from the Third Space to the Middle Space, the soul must have received the Five Seals and know the three Archon passwords. To move from the Middle Space toward the First Space, the soul must ascend through all 60 Treasuries, speaking the name and cipher of each Father. No soul can enter the First Space directly — it can only approach the Great Invisible Spirit at the boundary, where the Ineffable Mystery is revealed. Christ alone has passed through all three Spaces in both directions, opening the way for others.' }
    ],
    elements: [
      { id: 'sp-ineffable', label: 'The First Space', brief: 'The Ineffable, the Unnamable', detail: 'The First Space contains only the Ineffable One and the Great Invisible Spirit. It is the "Space of Spaces" — all other spaces exist within it yet it transcends them. No being below can enter it; the soul can only approach its boundary where the Ineffable Mystery is revealed.' },
      { id: 'sp-middle', label: 'The Middle Space', brief: 'The Pleroma, 60 Treasuries', detail: 'The Middle Space is the Pleroma containing the 60 Treasuries arranged in 5 ranks. The Four Luminaries sustain it. The Three Curtains divide it. The Virgin of Light distributes souls here. Jeu presides over its innermost Treasury.' },
      { id: 'sp-third', label: 'The Third Space', brief: 'The Kenoma, Archons, matter', detail: 'The Third Space is the material cosmos ruled by Yaldabaoth and his Archons. Seven planetary Archons and twelve zodiac Archons enforce Heimarmene (fate). The three Archon gates guard the boundary to the Middle Space. All incarnated souls dwell here.' },
      { id: 'sp-boundary-32', label: 'Archon Gates', brief: 'Boundary between 3rd and Middle', detail: 'Three gates separate the Third Space from the Middle Space. Each is guarded by an Archon who demands a password: IAO at the first gate (Aeons), EIE at the second (Sphere), OYO at the third (Midst). Without these names, the soul is cast back into the cycle of rebirth.' },
      { id: 'sp-boundary-21', label: 'The Ineffable Mystery', brief: 'Boundary between Middle and 1st', detail: 'At the innermost boundary of the Middle Space, where the Great Invisible Spirit dwells, the Ineffable Mystery is revealed. No soul passes beyond this point — it is the limit of all ascent. Christ received the revelation of this Mystery and transmitted it to the disciples.' }
    ],
    pronunciations: [
      { name: 'Pleroma', pron: 'ple-ROH-mah' },
      { name: 'Kenoma', pron: 'ken-OH-mah' },
      { name: 'Heimarmene', pron: 'hi-MAR-men-ee' },
      { name: 'Ineffable', pron: 'in-EFF-ah-bl' },
      { name: 'Yaldabaoth', pron: 'yal-dah-BAH-oth' },
      { name: 'IAO', pron: 'EE-ah-oh' },
      { name: 'EIE', pron: 'AY-ee-ay' },
      { name: 'OYO', pron: 'oh-EE-oh' }
    ]
  },

  {
    id: 'spaces-map', title: 'The Map of the Three Spaces', category: 'spaces',
    desc: 'A visual map of the Three Spaces as described in the Bruce Codex — from the Ineffable core of the First Space, through the radiant Pleroma of the Middle Space with its 60 Treasuries and Three Curtains, to the darkening spheres of the Third Space where the Archons rule and mortal souls are bound. Click any region on the map to learn its nature and the requirements for passage.',
    sealType: 'spaces-map', book: 1, chapter: 'Chapters 1-5', folio: 'ff. 1r-8v',
    lore: [
      { title: 'The Architecture of Three', body: 'The tripartite division of the cosmos into Three Spaces is unique to the Bruce Codex among surviving Gnostic texts. While other Sethian writings (the Apocryphon of John, the Gospel of the Egyptians) describe a binary Pleroma/Kenoma structure, the Book of Jeu introduces the First Space as a transcendent reality beyond even the Pleroma. This threefold cosmology reflects the three baptisms, the three Archon gates, the three sacred vowel-names (IAO, EIE, OYO), and the three Curtains — all organized according to the same tripartite principle that pervades the entire text.' },
      { title: 'The Light Gradient', body: 'Light diminishes as one moves outward from the First Space through the Middle to the Third. In the First Space, light is not a quality but the substance of being itself — the Ineffable radiates without radiating, illuminates without being light. In the Middle Space, light becomes visible and structured, dividing into the lights of the Four Luminaries and the 60 Treasuries. In the Third Space, light is trapped in matter — the divine sparks hidden within mortal bodies are fragments of the Treasury light that fell with Sophia. The entire cosmic structure can be understood as a gradient of light, from absolute brilliance to darkness.' }
    ],
    elements: [
      { id: 'sm-first', label: 'First Space Core', brief: 'Ineffable + Great Invisible', detail: 'At the absolute center, the Ineffable One and the Great Invisible Spirit. Pure being beyond all categories. Jeu proceeds from here into the Middle Space as the first light.' },
      { id: 'sm-pleroma', label: 'Middle Space Ring', brief: '60 Treasuries + Curtains + Luminaries', detail: 'The vast ring of the Pleroma. Four Luminaries at the quarters, 60 Treasuries in 5 ranks, Three Curtains dividing the ranks, and the Virgin of Light distributing souls.' },
      { id: 'sm-kenoma', label: 'Third Space Shell', brief: 'Planetary + Zodiac Archons', detail: 'The outer shell of material existence. Seven planetary spheres, twelve zodiac gates, the realm of Heimarmene and rebirth. This is where incarnated souls dwell.' },
      { id: 'sm-gate1', label: 'Gate of the Aeons', brief: 'IAO — 1st Archon Gate', detail: 'The first of three gates between the Third Space and Middle Space. Password: IAO. Guards the passage from the realm of the planetary Archons to the outer courts of the Pleroma.' },
      { id: 'sm-gate2', label: 'Gate of the Sphere', brief: 'EIE — 2nd Archon Gate', detail: 'The second gate. Password: EIE. Guards the passage from the zodiacal sphere to the middle region of the Pleroma. The soul must have already passed the first gate.' },
      { id: 'sm-gate3', label: 'Gate of the Midst', brief: 'OYO — 3rd Archon Gate', detail: 'The third and final gate. Password: OYO. Guards the passage from the border regions into the Pleroma proper. Only after passing this gate can the soul begin its ascent through the 60 Treasuries.' }
    ],
    pronunciations: [
      { name: 'Pleroma', pron: 'ple-ROH-mah' },
      { name: 'Kenoma', pron: 'ken-OH-mah' }
    ]
  },

  /* ═══════════════════════════════════════
     EMANATIONS — The divine hierarchy
     ═══════════════════════════════════════ */
  {
    id: 'emanation-tree', title: 'The Emanation Tree', category: 'emanation',
    desc: 'The complete hierarchy of divine emanation as taught in the Bruce Codex — from the Ineffable One, through the Great Invisible Spirit, Jeu the True God, the Four Luminaries, the twelve Aeons, the sixty Fathers of the Treasuries, and down to the Watchers, Receivers, and Emanations that guard each gate. Every being in the Pleroma exists because a higher being contemplated and emanated it. This chain of contemplation-and-emanation is the fundamental mechanism of existence in the Book of Jeu.',
    sealType: 'emanation-tree', book: 1, chapter: 'Chapters 1-42', folio: 'ff. 1r-55v',
    lore: [
      { title: 'The Principle of Emanation', body: 'In the Bruce Codex cosmology, nothing creates ex nihilo. The Ineffable does not "make" things — it emanates them, the way light emanates from a flame without diminishing the flame. Each emanated being is a reflection of its emanator, carrying a portion of its power and knowledge, but at a reduced intensity. The further an emanation is from the source, the dimmer its light, until at the outermost boundaries, the light is so faint that beings there are ignorant of their own origin. This is why the Archons of the Third Space do not know the Ineffable — they are too many removes from the source to remember it.' },
      { title: 'The Great Chain of Being', body: 'The emanation chain in the Book of Jeu follows a precise hierarchy: the Ineffable contemplates and emanates the Great Invisible Spirit; the Great Invisible Spirit emanates Jeu the True God; Jeu emanates the Four Luminaries (Harmozel, Oroiael, Daveithai, Eleleth); each Luminary emanates three Aeons (twelve total); each Aeon contains five ranks of Treasuries; each Treasury is presided over by a Father who emanates twelve sub-emanations and three Watchers. The total number of beings increases at each level: 1 → 1 → 1 → 4 → 12 → 60 → 720 emanations + 180 Watchers.' },
      { title: 'Contemplation as Generation', body: 'Each level of the hierarchy generates the next through contemplation. The Ineffable contemplates itself, and the Great Invisible Spirit arises as its self-image. The Great Invisible Spirit contemplates the possibility of multiplicity, and Jeu arises as the first "other." Jeu contemplates the four directions of being, and the Four Luminaries arise. Each Father in a Treasury contemplates the twelve aspects of his cipher, and twelve emanations arise. This is not mere metaphor — in the Bruce Codex, contemplation IS generation. To think is to create; to be thought is to exist.' },
      { title: 'The Return Upward', body: 'The path of Gnostic ascent reverses the emanation chain. The soul moves from the many to the One, from the outermost Watchers back through the Fathers, the Aeons, the Luminaries, Jeu, the Great Invisible Spirit, and finally to the boundary of the Ineffable. At each stage, the soul must know the name and cipher of the being who emanated that level — because the name is the key to the contemplation that created it. To speak the name is to participate in the original act of emanation and thereby earn the right to pass through.' }
    ],
    elements: [
      { id: 'et-ineffable', label: 'The Ineffable', brief: 'The Unnamable One', detail: 'The source of all emanation. Exists before all names, all light, all being. Contemplates itself and emanates the Great Invisible Spirit. No being can know it directly.' },
      { id: 'et-invisible', label: 'Great Invisible Spirit', brief: 'First emanation', detail: 'The first emanation of the Ineffable. Called "Invisible" because no aeon has seen its form, "Great" because it encompasses all. It emanates Jeu and guards the boundary of the First Space.' },
      { id: 'et-jeu', label: 'Jeu the True God', brief: 'Second emanation, Lord of Treasuries', detail: 'Jeu is the True God who presides over the Treasury of Light. He is the first being who can be named and known. He emanates the Four Luminaries and establishes the structure of the 60 Treasuries.' },
      { id: 'et-luminaries', label: 'Four Luminaries', brief: 'Harmozel, Oroiael, Daveithai, Eleleth', detail: 'The four great lights at the quarters of the Pleroma. Each emanates three Aeons and sustains fifteen Treasuries. They are the first division of divine light into multiplicity.' },
      { id: 'et-aeons', label: 'Twelve Aeons', brief: 'Armedon, Sigen, Matricula + 9 more', detail: 'Twelve aeons emanated from the Four Luminaries, three per Luminary. They constitute the Pleromic Fullness. The 60 Treasuries are distributed among them, five per Aeon.' },
      { id: 'et-fathers', label: 'Sixty Fathers', brief: 'Presiders of the Treasuries', detail: 'Each of the 60 Treasuries is presided over by a Father (e.g., Pigeradaphtha, Abrasax, Athoth). Each Father holds a cipher name and emanates twelve sub-emanations and three Watchers.' },
      { id: 'et-watchers', label: 'Watchers', brief: '3 per Treasury = 180 total', detail: 'Three Watchers guard the gates of each Treasury. They test the ascending soul by demanding the cipher name and password. If the soul cannot answer, it is cast back.' },
      { id: 'et-receivers', label: 'Receivers', brief: 'Beings who receive ascending souls', detail: 'The Receivers are emanations that greet and guide the soul after it has passed through a Treasury gate. They are mentioned in the Bruce Codex as the "Receivers of Light" who lead the soul from one Treasury to the next.' }
    ],
    pronunciations: [
      { name: 'Harmozel', pron: 'har-MOH-zel' },
      { name: 'Oroiael', pron: 'or-OY-ah-el' },
      { name: 'Daveithai', pron: 'dah-VAY-thay' },
      { name: 'Eleleth', pron: 'el-EL-eth' },
      { name: 'Armedon', pron: 'AR-med-on' },
      { name: 'Sigen', pron: 'SEE-gen' },
      { name: 'Matricula', pron: 'mah-TRIK-yoo-lah' }
    ]
  },

  {
    id: 'jeu-true-god', title: 'Jeu the True God', category: 'emanation',
    desc: 'Jeu is the central divine figure of the Bruce Codex — the True God, the True Man, the Lord of the Treasury of Light. He is the second emanation from the Ineffable (after the Great Invisible Spirit) and the first being who can be named and known. All 60 Treasuries exist within his domain, and every Father, Watcher, and Emanation ultimately derives its authority from him. The text is called "The Book of Jeu" because it is his revelation — the knowledge he transmitted through Christ to the disciples.',
    sealType: 'jeu-figure', book: 1, chapter: 'Throughout', folio: 'Codex Brucianus passim',
    lore: [
      { title: 'The Nature of Jeu', body: 'Jeu occupies a unique position in the Bruce Codex cosmology. He is neither the ultimate source (the Ineffable) nor a created being (like the Archons). He is the first emanation who possesses self-knowledge — the first being who can say "I AM" and know what it means. This self-knowledge makes him the "True God" in a sense that even the Great Invisible Spirit is not, for the Great Invisible Spirit is beyond all self-reference. Jeu is the divine principle made conscious of itself, and this consciousness is the light that fills the 60 Treasuries.' },
      { title: 'Jeu and Christ', body: 'In the Bruce Codex, Christ is the emissary of Jeu — the one who descends through all three Spaces, learning every name and cipher, and then ascends again, opening the way for all souls. Christ is not identical to Jeu but is sent by Jeu from the Treasury of Light. When Christ reveals the mysteries to the disciples on the Mount of Olives, he is transmitting the knowledge that Jeu has given him — the names, ciphers, passwords, and seal-structures that the soul needs for ascent. The Book of Jeu is therefore both Christ\'s revelation and Jeu\'s gift.' },
      { title: 'The Treasury as Jeu\'s Body', body: 'The 60 Treasuries of Light can be understood as the "body" of Jeu — the spatial extension of his self-knowledge into organized, traversable realms. Just as the Ineffable emanates the Great Invisible Spirit as its "face" toward the lower realms, Jeu emanates the Treasuries as his "body" — a structure that the ascending soul can enter, traverse, and ultimately pass through. Each Treasury is an aspect of Jeu\'s knowledge, and to know all 60 ciphers is to know Jeu completely.' }
    ],
    elements: [
      { id: 'jtg-name', label: 'The Name "Jeu"', brief: 'The True God, True Man', detail: 'Jeu [jyoo] is the name of the True God who presides over the Treasury of Light. He is called "True" because he alone possesses authentic self-knowledge. He is both God (divine) and Man (conscious) — the union of transcendence and immanence.' },
      { id: 'jtg-treasury', label: 'Lord of the Treasury', brief: 'All 60 Treasuries are his domain', detail: 'Jeu presides over the entire Treasury of Light — all 60 treasuries in their five ranks. He established the structure, appointed the Fathers, and set the Watchers at the gates. Every cipher and password derives its power from his authority.' },
      { id: 'jtg-emissary', label: 'Christ as Emissary', brief: 'Sent by Jeu to open the way', detail: 'Christ is sent by Jeu from the Treasury of Light to descend through all three Spaces, learn every name and cipher, and ascend again. The revelation on the Mount of Olives transmits Jeu\'s knowledge through Christ to the disciples.' },
      { id: 'jtg-first', label: 'First Named Being', brief: 'Second emanation, first namable', detail: 'After the Great Invisible Spirit (which is a description, not truly a name), Jeu is the first emanation that can be named and addressed. To know the name "Jeu" is to have access to the first principle that can be known.' }
    ],
    pronunciations: [
      { name: 'Jeu', pron: 'jyoo' },
      { name: 'Pigeradaphtha', pron: 'PIG-er-ah-DAHF-thah' },
      { name: 'Abrasax', pron: 'ah-BRAH-saks' }
    ]
  },

  {
    id: 'virgin-of-light', title: 'The Virgin of Light', category: 'emanation',
    desc: 'The Virgin of Light is one of the most important and distinctive figures in the Bruce Codex. She is the divine being who distributes souls to their fates and receives the souls of the ascending righteous. She stands at the boundary between the Middle Space and the Third Space, and her role is dual: she assigns souls to incarnation in the material world, and she receives them back when they have acquired the gnosis necessary for ascent. No other Sethian text gives such a prominent role to a specifically named female divine figure in the mechanics of soul-circulation.',
    sealType: 'virgin-light', book: 1, chapter: 'Chapters 3-8', folio: 'ff. 5r-12v',
    lore: [
      { title: 'The Distributor of Souls', body: 'The Virgin of Light is the being who takes purified light from the Treasuries and casts it downward into incarnation. Each soul receives its portion of light from her hands, and she determines the circumstances of its earthly life — its body, its fate, its challenges. This role makes her both the agent of the soul\'s fall (for incarnation is a descent into matter) and the guarantor of its eventual return (for no soul descends without receiving enough light to find its way back). She is called "Virgin" not because she is chaste but because she is pure — her light is unmixed with matter, and she has not fallen into the Kenoma.' },
      { title: 'The Receiver of the Righteous', body: 'When a soul has acquired the gnosis and passed through the three Archon gates, the Virgin of Light is the first divine being to receive it. She greets the ascending soul at the border of the Middle Space, verifies its seals and passwords, and escorts it to the outermost Treasury (the 60th) where the ascent through the 60 Treasuries begins. She is the cosmic gatekeeper of redemption — without her reception, the soul cannot enter the Pleroma even if it has passed the Archon gates. Her role as both distributor and receiver makes her the great mediator between the divine and the mortal.' },
      { title: 'The Seven Virginities', body: 'The Bruce Codex describes the Virgin of Light as possessing seven "virginities" or aspects of purity, each corresponding to one of the seven vowels and one of the seven planetary spheres. These seven virginities are: Armothes (truth), Eileithya (grace), Barpharanghes (wisdom), Opsimothe (prudence), Chthaeth (fortitude), Marept (justice), and Pharphaxoth (temperance). Each virginity is also the name of a Father in the 60 Treasuries (Fathers 29, 21, 22, 23, 24, 25, 26), linking the Virgin directly to the Treasury structure.' }
    ],
    elements: [
      { id: 'vol-distributor', label: 'Distributor of Souls', brief: 'Sends souls into incarnation', detail: 'The Virgin of Light takes purified light from the Treasuries and casts it into incarnation. She determines each soul\'s body, fate, and challenges. She is the agent of the soul\'s descent into matter.' },
      { id: 'vol-receiver', label: 'Receiver of the Righteous', brief: 'Receives ascending souls at the border', detail: 'When a soul has passed the three Archon gates, the Virgin of Light greets it at the border of the Middle Space, verifies its seals, and escorts it to the outermost Treasury to begin the ascent.' },
      { id: 'vol-seven', label: 'Seven Virginities', brief: 'Armothes, Eileithya, Barpharanghes + 4 more', detail: 'Seven aspects of purity, each corresponding to a vowel and a planetary sphere. They are also names of Treasury Fathers (29, 21-26), linking the Virgin directly to the Treasury structure.' },
      { id: 'vol-mediator', label: 'Mediator Between Spaces', brief: 'Stands between Middle and Third Spaces', detail: 'The Virgin of Light stands at the boundary between the Middle Space and the Third Space. She is the great mediator — the last divine being the descending soul sees, and the first the ascending soul meets.' }
    ],
    pronunciations: [
      { name: 'Armothes', pron: 'ar-MOH-thes' },
      { name: 'Eileithya', pron: 'ay-LAY-thyah' },
      { name: 'Barpharanghes', pron: 'bar-far-ANG-gez' },
      { name: 'Opsimothe', pron: 'op-SIM-oh-thee' },
      { name: 'Chthaeth', pron: 'KTHAY-eth' },
      { name: 'Marept', pron: 'mah-REPT' },
      { name: 'Pharphaxoth', pron: 'far-FAK-soth' }
    ]
  },

  {
    id: 'receivers', title: 'The Receivers of Light', category: 'emanation',
    desc: 'The Receivers of Light are a class of divine beings mentioned throughout the Bruce Codex who greet, verify, and guide the ascending soul from one Treasury to the next. They are distinct from the Watchers (who test the soul) and the Fathers (who preside over the Treasuries). Where Watchers challenge and Fathers rule, Receivers welcome and guide — they are the shepherds of the ascent, ensuring that no soul that has earned the right to ascend becomes lost in the vastness of the Pleroma.',
    sealType: 'receivers', book: 1, chapter: 'Chapters 6-42', folio: 'ff. 9r-55v',
    lore: [
      { title: 'The Role of the Receivers', body: 'After the soul passes through a Treasury gate by speaking the correct name, cipher, and password to the Watchers, a Receiver appears to guide it to the next Treasury. The Receivers are described as luminous beings who know every path through the Pleroma — they never err, never delay, and never lead a soul astray. They are emanations of the Virgin of Light herself, dispatched from her station at the border to accompany each ascending soul through all 60 stages. Without the Receivers, the soul would be lost in the vastness of the Pleroma, for the 60 Treasuries are not arranged in a simple line but in a complex spiral pattern that requires divine guidance to navigate.' },
      { title: 'Receivers and the Baptismal Rites', body: 'The Receivers also play a role in the Five Baptismal rites described in the Bruce Codex. After each baptism, a Receiver presents the soul with a new seal — a mark of authenticity that the Watchers of the next rank will recognize. These five seals correspond to the five ranks of the Treasuries, and a soul cannot ascend past a rank without possessing the seal of the baptism associated with that rank. The Receivers are therefore not merely guides but the agents of the soul\'s progressive authentication in the eyes of the Treasury guardians.' },
      { title: 'The Hierarchy of Receivers', body: 'Just as there are five ranks of Treasuries, there are five orders of Receivers, each matching the light-frequency of its corresponding rank. The Receivers of the fifth rank (outermost) are the dimmest, appearing as faintly luminous guides; the Receivers of the first rank (innermost) are so brilliant that the ascending soul can barely perceive them. The final Receiver — the one who guides the soul from the first Treasury to the presence of Jeu — is described as being almost indistinguishable from Jeu himself, so closely does it reflect his light.' }
    ],
    elements: [
      { id: 'rcv-guide', label: 'Guides of Ascent', brief: 'Lead the soul Treasury to Treasury', detail: 'Receivers appear after each Treasury gate is passed, guiding the soul along the spiral path to the next Treasury. They know every path through the Pleroma and never lead a soul astray.' },
      { id: 'rcv-seals', label: 'Bearer of Seals', brief: 'Present new seals after each baptism', detail: 'After each of the Five Baptisms, a Receiver presents the soul with a new seal — a mark of authenticity recognized by the Watchers of the next rank. Five ranks = five seals.' },
      { id: 'rcv-five-orders', label: 'Five Orders', brief: 'One order per Treasury rank', detail: 'Five orders of Receivers match the five Treasury ranks. Outermost (5th rank) are dimmest; innermost (1st rank) are nearly as brilliant as Jeu himself. Each order reflects the light of its rank.' },
      { id: 'rcv-virgin', label: 'Emanations of the Virgin', brief: 'Dispatched by the Virgin of Light', detail: 'All Receivers are emanations of the Virgin of Light, dispatched from her station at the border between the Middle Space and Third Space to accompany each ascending soul.' }
    ],
    pronunciations: [
      { name: 'Receiver', pron: 'ree-SEE-ver' },
      { name: 'Pleroma', pron: 'ple-ROH-mah' }
    ]
  },

  /* ═══════════════════════════════════════
     SACRED NUMEROLOGY — The mathematical structure
     ═══════════════════════════════════════ */
  {
    id: 'sacred-numbers', title: 'The Sacred Numerology', category: 'overview',
    desc: 'The Bruce Codex is built upon a precise mathematical architecture. Every structure — the Treasuries, the ranks, the Watchers, the emanations, the baptisms, the Archon gates — follows a numerological logic that is not arbitrary but reflects the fundamental relationships within the divine Pleroma. Understanding these numbers is not merely academic; it is essential to the practice of ascent, for the soul must know how many gates it will face, how many names it must speak, and how many ranks it must traverse.',
    sealType: 'numerology', book: 1, chapter: 'Throughout', folio: 'Codex Brucianus passim',
    lore: [
      { title: 'The Number 60', body: 'The most fundamental number in the Bruce Codex is 60 — the total number of Treasuries of Light. This number is not arbitrary: it is the product of 12 (the number of Aeons) and 5 (the number of ranks), and it is also the product of 5 (ranks) and 12 (Treasuries per rank). The number 60 was sacred throughout the ancient Near East as the base of the sexagesimal number system (inherited from Sumer and Babylon), and its use in the Bruce Codex connects the Gnostic cosmology to the deepest strata of sacred mathematics. Each of the 60 Treasuries requires its own name, cipher, and password — meaning the ascending soul must possess 180 pieces of sacred knowledge (60 names + 60 ciphers + 60 passwords) to complete the ascent.' },
      { title: 'The Number 12', body: 'The number 12 appears at every level of the Bruce Codex cosmology: 12 Aeons, 12 Treasuries per rank, 12 emanations per Father, and 12 zodiac Archons. This is not coincidence but reflects the principle that the same divine pattern repeats at every scale. The 12 Aeons correspond to the 12 zodiac signs (but inverted — the spiritual originals of which the zodiac is a material shadow). The 12 emanations of each Father are the 12 "faces" of his cipher. The soul that masters the number 12 masters the principle of cosmic completeness, for 12 is the number of the full cycle — the twelve hours of the day, the twelve months of the year, the twelve gates of the New Jerusalem.' },
      { title: 'The Number 5', body: 'Five is the number of ranks in the Treasury structure, the number of baptisms, the number of seals the soul must receive, and the number of orders of Receivers. It corresponds to the five points of the pentagram, the five wounds of Christ, and the five senses through which the material world is perceived. The five baptisms are: water, fire, spirit, light, and the Ineffable Mystery. Each baptism grants access to one rank of the Treasuries, so the soul must receive all five before it can reach the innermost Treasury where Jeu dwells.' },
      { title: 'The Number 3', body: 'Three is the number of the sacred vowel-names (IAO, EIE, OYO), the three Archon gates, the three Curtains of Light, the three Watchers per Treasury, and the three Spaces of the Bruce Codex cosmology. The tripartite structure pervades the entire text: three spaces, three gates, three passwords, three curtains, three watchers. Even the emanation from the Ineffable follows a triple pattern: Ineffable → Great Invisible Spirit → Jeu. The number 3 represents the minimum structure needed for relationship — the One contemplates itself (1), produces an image (2), and the image returns to the One (3). This is the fundamental dynamism of the Pleroma.' },
      { title: 'The Number 7', body: 'Seven is the number of planetary Archons, the number of sacred vowels, the number of virginities of the Virgin of Light, and the number of days of the material week. The seven vowels (A, E, I, O, U, O, Silence) correspond to the seven planetary spheres, and chanting them in sequence aligns the soul with the entire structure of the Third Space. The Bruce Codex teaches that the seven Archons can be overcome by the seven vowels — each vowel nullifies one Archon\'s power, and the final Silence defeats them all, for it represents the Ineffable that no Archon can comprehend.' }
    ],
    elements: [
      { id: 'sn-60', label: '60 Treasuries', brief: '12 Aeons x 5 Ranks', detail: 'The fundamental number. 60 Treasuries = 60 names + 60 ciphers + 60 passwords = 180 sacred words for complete ascent. Rooted in the ancient sexagesimal system.' },
      { id: 'sn-12', label: '12 / Rank', brief: 'Aeons, emanations, zodiac', detail: 'Twelve appears at every scale: 12 Aeons, 12 Treasuries per rank, 12 emanations per Father, 12 zodiac Archons. The number of cosmic completeness and the full cycle.' },
      { id: 'sn-5', label: '5 Ranks', brief: 'Ranks, baptisms, seals', detail: 'Five ranks, five baptisms (water, fire, spirit, light, Ineffable Mystery), five seals, five orders of Receivers. Each rank requires its own baptism and seal.' },
      { id: 'sn-3', label: '3 Gates', brief: 'Archon gates, vowels, curtains', detail: 'Three Archon gates (IAO, EIE, OYO), three Curtains, three Watchers per Treasury, three Spaces. The number of relationship and dynamism.' },
      { id: 'sn-7', label: '7 Archons', brief: 'Planets, vowels, virginities', detail: 'Seven planetary Archons, seven sacred vowels (A, E, I, O, U, O, Silence), seven virginities of the Virgin of Light. Each vowel defeats one Archon.' },
      { id: 'sn-180', label: '180 Watchers', brief: '3 per Treasury', detail: '180 Watchers guard the 60 Treasuries (3 per Treasury). Each demands the cipher name and password. The total number of sacred words needed: 180 names/ciphers/passwords + 3 Archon passwords = 183.' }
    ],
    pronunciations: [
      { name: 'Sexagesimal', pron: 'sek-SAJ-es-ih-mal' },
      { name: 'Heimarmene', pron: 'hi-MAR-men-ee' }
    ]
  },

  /* ═══════════════════════════════════════
     THE BRUCE CODEX — The manuscript itself
     ═══════════════════════════════════════ */
  {
    id: 'bruce-codex', title: 'The Bruce Codex (Codex Brucianus)', category: 'related',
    desc: 'The Bruce Codex (Codex Brucianus, Bodleian Library MS Bruce 96) is the sole surviving manuscript containing the Books of Jeu and the Untitled Gnostic Work. Acquired by the Scottish traveler James Bruce in 1769 in Upper Egypt, it is a Coptic codex likely dating to the 4th-5th century CE, translating earlier Greek originals from the 2nd-3rd century. Without this single manuscript, the entire Jeu tradition — the 60 Treasuries, the cipher system, the Three Spaces, the Virgin of Light — would be completely unknown to history.',
    sealType: 'codex', book: 1, chapter: 'Provenance', folio: 'Bodleian Library, Oxford, MS Bruce 96',
    lore: [
      { title: 'Discovery and Provenance', body: 'James Bruce of Kinnaird (1730-1794), a Scottish explorer famous for discovering the source of the Blue Nile, acquired the codex in 1769 during his travels in Upper Egypt, likely at Thebes (modern Luxor). The manuscript had been preserved in the dry Egyptian climate for over a millennium. Bruce brought it back to Scotland, and it eventually entered the collection of the Bodleian Library at Oxford University, where it remains today as MS Bruce 96. The codex was not fully published until 1892, when Carl Schmidt produced the first edition, with an English translation by Violet MacDermot appearing in 1967 and a revised edition in 1992.' },
      { title: 'Physical Description', body: 'The codex is a papyrus manuscript written in Coptic (Subakhmimic dialect) using Greek uncial script. It contains approximately 78 folios (156 pages), though many are fragmentary or damaged. The text is arranged in two columns per page with numbered chapters, suggesting it was a working liturgical document rather than a library copy. Unique among Gnostic manuscripts, it contains actual diagrams — the seal-figures that illustrate the Treasury structure — drawn in red and black ink alongside the text. These diagrams are the oldest surviving examples of Gnostic sacred art.' },
      { title: 'Contents', body: 'The codex contains two main works: The First Book of Jeu (chapters 1-41), describing the 60 Treasuries of Light and their presiding Fathers; and The Second Book of Jeu (chapters 42-untitled), containing additional Treasury descriptions and the Untitled Gnostic Work — a separate treatise describing the soul\'s ascent through the Archon realms. The Untitled Text is sometimes called "The Gnostic Apocalypse of Paul" because it describes an apostolic ascent vision similar to the Nag Hammadi "Apocalypse of Paul." Together, these texts provide the most detailed surviving account of Sethian Gnostic ritual practice and cosmological speculation.' },
      { title: 'Relationship to Nag Hammadi', body: 'The Bruce Codex was discovered 175 years before the Nag Hammadi library (found in 1945), and for nearly two centuries it was the only source for Sethian Gnostic cosmology. After the Nag Hammadi texts were published, scholars recognized that the Apocryphon of John, the Gospel of the Egyptians, Zostrianos, the Three Steles of Seth, and Allogenes described the same divine hierarchy — the Ineffable, Barbelo, the Autogenes, the Four Luminaries — but without the detailed Treasury structure and cipher system unique to the Book of Jeu. The Bruce Codex therefore remains indispensable for understanding the ritual and practical dimension of Sethian Gnosticism that the Nag Hammadi texts describe only in theological terms.' }
    ],
    elements: [
      { id: 'bc-discovery', label: 'Discovery', brief: 'James Bruce, Upper Egypt, 1769', detail: 'Acquired by James Bruce in 1769 at Thebes, Upper Egypt. Brought to Scotland, now at the Bodleian Library, Oxford, as MS Bruce 96.' },
      { id: 'bc-date', label: 'Date', brief: '4th-5th century CE manuscript', detail: 'The physical manuscript dates to the 4th-5th century CE. The Greek originals it translates are likely from the 2nd-3rd century. The traditions it records may be even older.' },
      { id: 'bc-language', label: 'Language', brief: 'Coptic (Subakhmimic dialect)', detail: 'Written in the Subakhmimic dialect of Coptic using Greek uncial script. The Coptic is a translation of earlier Greek originals that have not survived.' },
      { id: 'bc-diagrams', label: 'Diagrams', brief: 'Oldest surviving Gnostic sacred art', detail: 'Unique among Gnostic manuscripts for containing actual diagrams — seal-figures in red and black ink illustrating the Treasury structure. These are the oldest surviving examples of Gnostic sacred art.' },
      { id: 'bc-contents', label: 'Contents', brief: 'Two Books of Jeu + Untitled Text', detail: 'Book I (ch. 1-41): 60 Treasuries and their Fathers. Book II (ch. 42+): Additional Treasuries and the Untitled Gnostic Work describing the soul\'s ascent through Archon realms.' },
      { id: 'bc-naghammadi', label: 'Nag Hammadi Connection', brief: 'Same divine hierarchy, more ritual detail', detail: 'Discovered 175 years before Nag Hammadi. Shares the same Sethian hierarchy (Ineffable, Barbelo, Autogenes, Luminaries) but uniquely preserves the Treasury structure and cipher system.' }
    ],
    pronunciations: [
      { name: 'Brucianus', pron: 'broo-see-AH-nus' },
      { name: 'Subakhmimic', pron: 'soob-AHK-mim-ik' },
      { name: 'Thebes', pron: 'THEEBZ' }
    ]
  },

  /* ═══════════════════════════════════════
     THE CIPHER SYSTEM — How ciphers function
     ═══════════════════════════════════════ */
  {
    id: 'cipher-system', title: 'The Cipher System of the Gates', category: 'names',
    desc: 'The cipher system of the Book of Jeu is one of the most distinctive features of the Bruce Codex — a cryptographic framework in which every Treasury gate is sealed by a specific cipher name that must be spoken to gain passage. These ciphers are not passwords in the modern sense but are sacred names that function as keys to specific vibrational frequencies of divine light. When spoken correctly, the cipher name resonates with the Treasury it opens, causing the gate to recognize the speaker as one who possesses authentic gnosis.',
    sealType: 'cipher-system', book: 1, chapter: 'Throughout', folio: 'Codex Brucianus passim',
    lore: [
      { title: 'The Nature of Cipher Names', body: 'Each of the 60 Treasuries is sealed by a cipher name — a word or phrase that acts as the vibrational key to that Treasury\'s gate. The cipher names in the Book of Jeu include both recognizable divine names from Hebrew and Greek traditions (Adonai, Sabaoth, Iao, Abrasax) and apparently untranslatable strings (Pigeradaphtha, Barpharanghes, Aphrempht) that may be cryptographic transformations of known names, vocalizations of angelic languages, or formulaic combinations of sacred syllables. The Bruce Codex treats these names with absolute seriousness: they are not symbols or metaphors but actual words of power that the ascending soul must speak aloud at each gate.' },
      { title: 'The Threefold Authentication', body: 'At each Treasury gate, the ascending soul must provide three pieces of information: the name of the Father who presides over the Treasury, the cipher name that seals the gate, and the password that combines both into a formula of invocation. For example, at the First Treasury: Father name "Pigeradaphtha Jeu," cipher "Maiion," password "I invoke Pigeradaphtha Jeu - Maiion." This threefold authentication mirrors the three Watchers who guard each gate — each Watcher verifies one component of the invocation. The first Watcher demands the Father\'s name, the second demands the cipher, and the third demands the password.' },
      { title: 'The Pronunciation Requirement', body: 'The Bruce Codex implies that correct pronunciation is essential — the cipher names must be spoken with precise vowel sounds and stress patterns. This is why the text includes pronunciation guides (in the form of sacred vowel sequences) alongside the cipher names. A mispronounced cipher would fail to resonate with the Treasury\'s frequency, and the gate would remain sealed. The emphasis on pronunciation connects the Jeu tradition to the broader ancient practice of "voces magicae" — magical words of power found throughout Greco-Egyptian ritual texts, where precise vocalization was believed to produce tangible effects in the spiritual realm.' },
      { title: 'The Cipher as Light-Frequency', body: 'In the Jeu cosmology, each cipher name corresponds to a specific frequency of divine light. Just as white light separates into a spectrum of colors through a prism, the light of the Great Invisible Spirit separates into 60 distinct frequencies as it passes through the emanation hierarchy. Each Treasury "resonates" at one of these frequencies, and the cipher name is the vocal equivalent of that frequency. To speak the cipher is to produce a sound that matches the Treasury\'s light, causing the gate to open as naturally as a resonating string responds to its own frequency. This is why the ciphers cannot be guessed or improvised — they must be learned from one who already knows them, for they are not logical constructs but resonant patterns embedded in the structure of the Pleroma.' }
    ],
    elements: [
      { id: 'cs-cipher', label: 'Cipher Names', brief: '60 vibrational keys', detail: 'Each Treasury is sealed by a cipher name — a word of power that resonates with the Treasury\'s specific light-frequency. Includes both recognizable names (Adonai, Iao) and untranslatable strings (Pigeradaphtha, Aphrempht).' },
      { id: 'cs-threefold', label: 'Threefold Auth', brief: 'Name + Cipher + Password', detail: 'At each gate: Father\'s name, cipher name, and password (invocation formula). Three Watchers each verify one component. Example: "I invoke Pigeradaphtha Jeu - Maiion."' },
      { id: 'cs-pronunciation', label: 'Pronunciation', brief: 'Must be spoken precisely', detail: 'Correct pronunciation is essential. Mispronounced ciphers fail to resonate. The text includes pronunciation guides (sacred vowel sequences). Connects to the "voces magicae" tradition of Greco-Egyptian ritual.' },
      { id: 'cs-frequency', label: 'Light-Frequency', brief: 'Ciphers match Treasury light', detail: 'Each cipher corresponds to a specific frequency of divine light. Speaking it produces a sound matching the Treasury\'s resonance. This is why ciphers cannot be guessed — they are resonant patterns embedded in the Pleroma.' }
    ],
    pronunciations: [
      { name: 'Pigeradaphtha', pron: 'PIG-er-ah-DAHF-thah' },
      { name: 'Maiion', pron: 'MY-ee-on' },
      { name: 'Aphrempht', pron: 'ah-FREMPT' },
      { name: 'Barpharanghes', pron: 'bar-far-ANG-gez' },
      { name: 'Voces magicae', pron: 'VOH-kays mah-JIK-ay' }
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
   SEAL DIAGRAM COMPONENTS — All labels in English, no random characters
   ═══════════════════════════════════════════════════ */

function SvgCross({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return <path d={`M${x} ${y-size}L${x+size*0.3} ${y-size}L${x+size*0.3} ${y-size*0.3}L${x+size} ${y-size*0.3}L${x+size} ${y+size*0.3}L${x+size*0.3} ${y+size*0.3}L${x+size*0.3} ${y+size}L${x} ${y+size}L${x-size*0.3} ${y+size}L${x-size*0.3} ${y+size*0.3}L${x-size} ${y+size*0.3}L${x-size} ${y-size*0.3}L${x-size*0.3} ${y-size*0.3}Z`} fill={color} stroke="none" />
}

/* ── Cross-and-Circle Seal ── */
function CrossCircleSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const armW = r * 0.28, armL = r * 0.85, ringR = r * 0.65, outerR = r * 1.1, innerR = r * 0.25
  const places = useMemo(() => [
    'Phaethon', 'Mareph', 'Thalma', 'Aphroph', 'Eratha', 'Bathrax'
  ].map((name, i) => {
    const angle = (i * 60 - 90) * Math.PI / 180
    return { name, x: cx + Math.cos(angle) * (ringR + 28), y: cy + Math.sin(angle) * (ringR + 28) }
  }), [cx, cy, ringR])

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={INK} strokeWidth={2.5} pointerEvents="none" />
      <circle cx={cx} cy={cy} r={outerR - 6} fill="none" stroke={GOLD2} strokeWidth={1} pointerEvents="none" />
      <path
        d={`M${cx-armW} ${cy-armL}L${cx+armW} ${cy-armL}L${cx+armW} ${cy-armW}L${cx+armL} ${cy-armW}L${cx+armL} ${cy+armW}L${cx+armW} ${cy+armW}L${cx+armW} ${cy+armL}L${cx-armW} ${cy+armL}L${cx-armW} ${cy+armW}L${cx-armL} ${cy+armW}L${cx-armL} ${cy-armW}L${cx-armW} ${cy-armW}Z`}
        fill={PARCH} stroke={INK} strokeWidth={2}
        className={`svg-clickable${selectedId === 'cross' ? ' selected' : ''}`}
        onClick={() => onClick('cross', 'The Sacred Cross', `The seal of the ${ordinal(jeuNum)} Treasury - a solid cross inscribed within the circle, representing the four directions of divine emanation. The Father ${fatherName} places his cipher upon this cross.`)}
      />
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke={GOLD2} strokeWidth={3}
        className={`svg-clickable${selectedId === 'ring' ? ' selected' : ''}`}
        onClick={() => onClick('ring', 'The Circle of Places', `Six places surround the Father within this treasury. The cipher "${cipher}" is inscribed at the center.`)}
      />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={INK} strokeWidth={2} pointerEvents="none" />
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={complexity > 2 ? 18 : 22} fill={GOLD}
        className={`svg-clickable${selectedId === 'cipher' ? ' selected' : ''}`} style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher of the ${ordinal(jeuNum)} Treasury is "${cipher}". This sacred name must be held while passing through the gates.`)}>{cipher}</text>
      {places.map((p, i) => (
        <g key={i} className={`svg-clickable${selectedId === `place-${i}` ? ' selected' : ''}`}
           onClick={() => onClick(`place-${i}`, p.name, `${p.name} is the ${ordinal(i+1)} place surrounding the Father.`)}>
          <circle cx={p.x} cy={p.y} r={16} fill={PARCH} stroke={INK} strokeWidth={1.5} />
          <text x={p.x} y={p.y + 3} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK}>{p.name.length > 6 ? p.name.substring(0,5) : p.name}</text>
        </g>
      ))}
      <text x={cx} y={cy - outerR - 12} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK2} letterSpacing={1}>{fatherName}</text>
      {places.map((p, i) => <line key={`l${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={INK3} strokeWidth={0.5} strokeDasharray="3,3" pointerEvents="none" />)}
      <text x={cx} y={488} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>JEU {jeuNum}</text>
    </svg>
  )
}

/* ── Concentric Rings Seal ── */
function ConcentricSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const rings = complexity + 1
  const emanFull = ['Phaethon', 'Omorpha', 'Aphroph', 'Saphapha', 'Mareph', 'Pigeraph', 'Thalmaoph', 'Bathraoth', 'Eratha', 'Armatha', 'Pharmatha', 'Aphreph']

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      {Array.from({ length: rings }, (_, i) => {
        const ringR = r - (i * r / rings)
        return <circle key={i} cx={cx} cy={cy} r={ringR} fill="none" stroke={i === 0 ? INK : GOLD2} strokeWidth={i === 0 ? 3 : 1.5}
          className={`svg-clickable${selectedId === `ring-${i}` ? ' selected' : ''}`}
          onClick={() => onClick(`ring-${i}`, `${ordinal(i+1)} Ring`, i === 0 ? 'The outermost ring: boundary of the treasury, beyond which the Archons patrol.' : i === rings - 1 ? 'The innermost ring: contains the cipher of the Father, the key to passage.' : 'An intermediate ring bearing the names of emanations and watchers.')} />
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180
        const name = emanFull[i]
        return (
          <g key={i} className={`svg-clickable${selectedId === `em-${i}` ? ' selected' : ''}`}
             onClick={() => onClick(`em-${i}`, `Emanation: ${name}`, `The ${ordinal(i+1)} emanation of ${fatherName} radiating from the ${ordinal(jeuNum)} Treasury.`)}>
            <line x1={cx + Math.cos(angle) * 30} y1={cy + Math.sin(angle) * 30} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke={INK3} strokeWidth={0.8} />
            <circle cx={cx + Math.cos(angle) * (r + 14)} cy={cy + Math.sin(angle) * (r + 14)} r={10} fill={PARCH} stroke={GOLD2} strokeWidth={1} />
            <text x={cx + Math.cos(angle) * (r + 14)} y={cy + Math.sin(angle) * (r + 14) + 3} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={5.5} fill={INK2}>{name.substring(0,5)}</text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={22} fill={PARCH} stroke={INK} strokeWidth={2}
        className={`svg-clickable${selectedId === 'cipher' ? ' selected' : ''}`}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher of the ${ordinal(jeuNum)} Treasury is "${cipher}".`)} />
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={14} fill={GOLD}>{cipher}</text>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK2} letterSpacing={1}>{fatherName}</text>
      <text x={cx} y={488} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>JEU {jeuNum}</text>
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

  const pointLabels = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest']

  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={GOLD} strokeWidth={1.5} pointerEvents="none" />
      <polygon points={starPath} fill="none" stroke={INK} strokeWidth={2.5}
        className={`svg-clickable${selectedId === 'star' ? ' selected' : ''}`}
        onClick={() => onClick('star', `The ${points}-Pointed Star`, `The star seal of the ${ordinal(jeuNum)} Treasury. The ${points} points represent the ${points === 8 ? 'eight directions of divine emanation' : 'six places surrounding the Father'}.`)} />
      <circle cx={cx} cy={cy} r={innerR * 0.6} fill="none" stroke={GOLD2} strokeWidth={2}
        className={`svg-clickable${selectedId === 'inner' ? ' selected' : ''}`}
        onClick={() => onClick('inner', 'The Inner Circle', `The inner circle contains the Father ${fatherName} and his cipher.`)} />
      {Array.from({ length: points }, (_, i) => {
        const angle = (i * 360 / points - 90) * Math.PI / 180
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke={INK3} strokeWidth={0.7} pointerEvents="none" />
            <text x={cx + Math.cos(angle) * (r + 30)} y={cy + Math.sin(angle) * (r + 30) + 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK3}>{pointLabels[i] || `Pt ${i+1}`}</text>
          </g>
        )
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of ${fatherName}.`)}>{cipher}</text>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK2} letterSpacing={1}>{fatherName}</text>
      <text x={cx} y={488} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>JEU {jeuNum}</text>
    </svg>
  )
}

/* ── Radial Division Seal — FIXED: No Greek letters, uses English labels ── */
function RadialSeal({ cx, cy, r, jeuNum, fatherName, cipher, complexity, onClick, selectedId }: {
  cx: number; cy: number; r: number; jeuNum: number; fatherName: string; cipher: string; complexity: number; onClick: (id: string, label: string, detail: string) => void; selectedId: string | null
}) {
  const sectors = complexity >= 3 ? 12 : 8
  const innerR = r * 0.35
  const sectorNames = ['Phaethon', 'Omorpha', 'Aphroph', 'Saphapha', 'Mareph', 'Pigeraph', 'Thalmaoph', 'Bathraoth', 'Eratha', 'Armatha', 'Pharmatha', 'Aphreph']

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
        const sName = sectorNames[i % sectorNames.length]
        return (
          <g key={i}>
            <line x1={cx + Math.cos(angle) * innerR} y1={cy + Math.sin(angle) * innerR} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke={INK3} strokeWidth={1}
              className={`svg-clickable${selectedId === `sec-${i}` ? ' selected' : ''}`}
              onClick={() => onClick(`sec-${i}`, `Sector: ${sName}`, `The ${ordinal(i+1)} sector governed by the emanation ${sName} of ${fatherName}.`)} />
            <text x={cx + Math.cos(midAngle) * labelR} y={cy + Math.sin(midAngle) * labelR + 3} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={INK3}>{sName.substring(0,5)}</text>
          </g>
        )
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of the ${ordinal(jeuNum)} Treasury.`)}>{cipher}</text>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK2} letterSpacing={1}>{fatherName}</text>
      <text x={cx} y={488} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>JEU {jeuNum}</text>
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
          onClick={() => onClick(`sq-${si}`, si === 0 ? 'The First Square' : 'The Second Square', si === 0 ? `The first square: four cardinal emanations of ${fatherName}.` : `The second square, rotated 45 degrees: four intermediate emanations.`)} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.45} fill="none" stroke={GOLD2} strokeWidth={2}
        className={`svg-clickable${selectedId === 'inner' ? ' selected' : ''}`}
        onClick={() => onClick('inner', 'The Inner Circle', `The inner circle containing the cipher of ${fatherName}.`)} />
      <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={16} fill={GOLD}
        className="svg-clickable" style={{ cursor: 'pointer' }}
        onClick={() => onClick('cipher', `Cipher: ${cipher}`, `The cipher "${cipher}" of the ${ordinal(jeuNum)} Treasury.`)}>{cipher}</text>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK2} letterSpacing={1}>{fatherName}</text>
      <text x={cx} y={488} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>JEU {jeuNum}</text>
    </svg>
  )
}

/* ── Treasury Overview Diagram ── */
function TreasuryOverviewDiagram({ onClick, selectedId, elements, onNavigateEntry }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[]; onNavigateEntry?: (id: string) => void }) {
  const W = 1100, H = 1200
  const cx = 550, cy = 620

  /* ── Rank ring radii ── */
  const R_RANK: Record<number, number> = { 1: 90, 2: 185, 3: 280, 4: 375, 5: 470 }
  const R_CURTAIN_1 = 135
  const R_CURTAIN_2 = 230
  const R_CURTAIN_3 = 325
  const R_OUTER_BOUNDARY = 510
  const R_INNER = 38

  /* ── Helper: radial position ── */
  const rad = (angle: number, r: number) => ({
    x: cx + Math.cos(angle * Math.PI / 180) * r,
    y: cy + Math.sin(angle * Math.PI / 180) * r
  })

  /* ── Decorative double-ring with tick marks ── */
  const ornateRing = (r: number, stroke: string, sw: number, ticks = 0, tickLen = 4, dashArray?: string) => (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray={dashArray} />
      {ticks > 0 && Array.from({ length: ticks }).map((_, i) => {
        const a = (i * 360 / ticks) * Math.PI / 180
        const x1 = cx + Math.cos(a) * (r - tickLen), y1 = cy + Math.sin(a) * (r - tickLen)
        const x2 = cx + Math.cos(a) * (r + tickLen), y2 = cy + Math.sin(a) * (r + tickLen)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={0.8} />
      })}
    </g>
  )

  /* ── Group treasuries by rank ── */
  const byRank: Record<number, typeof TREASURIES> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  TREASURIES.forEach(t => { byRank[t.rank].push(t) })

  /* ── Seal mini-glyph for a treasury ── */
  const sealGlyph = (t: typeof TREASURIES[0], px: number, py: number, isSelected: boolean) => {
    const sel = isSelected
    const fill = sel ? 'rgba(200,168,74,0.18)' : 'transparent'
    const stroke = sel ? GOLD : (t.rank <= 2 ? GOLD2 : INK3)
    const sw = sel ? 1.5 : 0.8
    const baseR = 28
    const g = (
      <g key={t.id}
        className={`svg-clickable${sel ? ' selected' : ''}`}
        onClick={() => { if (onNavigateEntry) onNavigateEntry(t.id); else onClick(t.id, t.fatherName, `${t.title} — Rank ${t.rank}: ${t.rankName}. Cipher: ${t.cipher} [${t.cipherPron}]. Watchers: ${t.watchers.map(w => w.name).join(', ')}.`) }}>
        {/* Outer ring */}
        <circle cx={px} cy={py} r={baseR} fill={fill} stroke={stroke} strokeWidth={sw} />
        {/* Inner seal shape based on seal type */}
        {t.sealType === 'concentric' && <>
          <circle cx={px} cy={py} r={baseR - 6} fill="none" stroke={stroke} strokeWidth={0.5} />
          <circle cx={px} cy={py} r={baseR - 11} fill="none" stroke={stroke} strokeWidth={0.5} />
          <circle cx={px} cy={py} r={4} fill={stroke} opacity={0.6} />
        </>}
        {t.sealType === 'cross-circle' && <>
          <line x1={px} y1={py - baseR + 7} x2={px} y2={py + baseR - 7} stroke={stroke} strokeWidth={0.7} />
          <line x1={px - baseR + 7} y1={py} x2={px + baseR - 7} y2={py} stroke={stroke} strokeWidth={0.7} />
          <circle cx={px} cy={py} r={6} fill="none" stroke={stroke} strokeWidth={0.7} />
        </>}
        {t.sealType === 'star' && <>
          {[0, 72, 144, 216, 288].map((a, ai) => {
            const sa = a * Math.PI / 180
            return <line key={ai} x1={px} y1={py} x2={px + Math.cos(sa) * (baseR - 7)} y2={py + Math.sin(sa) * (baseR - 7)} stroke={stroke} strokeWidth={0.6} />
          })}
          <circle cx={px} cy={py} r={3} fill={stroke} opacity={0.5} />
        </>}
        {t.sealType === 'radial' && <>
          {[0, 60, 120, 180, 240, 300].map((a, ai) => {
            const sa = a * Math.PI / 180
            return <line key={ai} x1={px} y1={py} x2={px + Math.cos(sa) * (baseR - 7)} y2={py + Math.sin(sa) * (baseR - 7)} stroke={stroke} strokeWidth={0.5} />
          })}
          <circle cx={px} cy={py} r={5} fill="none" stroke={stroke} strokeWidth={0.6} />
        </>}
        {t.sealType === 'octagram' && <>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a, ai) => {
            const sa = a * Math.PI / 180
            return <line key={ai} x1={px} y1={py} x2={px + Math.cos(sa) * (baseR - 8)} y2={py + Math.sin(sa) * (baseR - 8)} stroke={stroke} strokeWidth={0.4} />
          })}
          <polygon
            points={[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
              const sa = a * Math.PI / 180
              return `${px + Math.cos(sa) * 10},${py + Math.sin(sa) * 10}`
            }).join(' ')}
            fill="none" stroke={stroke} strokeWidth={0.5} />
        </>}
        {/* Jeu number */}
        <text x={px} y={py + 1} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={7} fill={sel ? GOLD : (t.rank <= 2 ? GOLD : INK2)}>{t.jeuNum}</text>
        {/* Father name below seal */}
        <text x={px} y={py + baseR + 10} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={6.5} fill={sel ? GOLD : (t.rank <= 2 ? GOLD2 : INK3)}>{t.fatherName.split(' ')[0]}</text>
        {/* Cipher name above seal */}
        <text x={px} y={py - baseR - 4} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={5} fill={sel ? GOLD2 : INK3} fontStyle="italic">{t.cipher}</text>
      </g>
    )
    return g
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        {/* Divine center glow */}
        <radialGradient id="treasuryGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c070" stopOpacity={0.7} />
          <stop offset="40%" stopColor="#c8a84a" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#c8a84a" stopOpacity={0} />
        </radialGradient>
        {/* Outer boundary glow */}
        <radialGradient id="outerTreasuryGloom" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#1a1208" stopOpacity={0} />
          <stop offset="100%" stopColor="#1a1208" stopOpacity={0.12} />
        </radialGradient>
        {/* Fine pattern for inner ranks */}
        <pattern id="rankPattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.5" fill="#c8a84a" opacity={0.15} />
        </pattern>
        {/* Pattern for outer ranks */}
        <pattern id="outerRankPattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="10" x2="10" y2="0" stroke="#6a5030" strokeWidth={0.25} opacity={0.2} />
        </pattern>
      </defs>

      {/* ═══════════════ TITLE ═══════════════ */}
      <text x={cx} y={34} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={24} fill={INK} letterSpacing={5} fontWeight="bold">THE TREASURY OF LIGHT</text>
      <text x={cx} y={58} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={12} fill={INK3} fontStyle="italic">All Sixty Treasuries in Five Ranks — From the Great Invisible to the Outermost Gate</text>
      <line x1={cx - 280} y1={68} x2={cx + 280} y2={68} stroke={GOLD2} strokeWidth={1} />
      <line x1={cx - 260} y1={72} x2={cx + 260} y2={72} stroke={GOLD2} strokeWidth={0.5} />
      <SvgCross x={cx - 285} y={70} size={4} color={GOLD2} />
      <SvgCross x={cx + 281} y={70} size={4} color={GOLD2} />

      {/* ═══════════════ OUTER BOUNDARY ═══════════════ */}
      <circle cx={cx} cy={cy} r={R_OUTER_BOUNDARY + 30} fill="url(#outerTreasuryGloom)" pointerEvents="none" />
      {ornateRing(R_OUTER_BOUNDARY, INK3, 2.5, 60, 3)}
      {ornateRing(R_OUTER_BOUNDARY - 5, INK3, 1)}
      {/* Boundary label */}
      <text x={cx} y={cy - R_OUTER_BOUNDARY - 14} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK3} letterSpacing={3}>THE OUTERMOST VEIL</text>

      {/* ═══════════════ RANK 5 (OUTERMOST) ═══════════════ */}
      <circle cx={cx} cy={cy} r={R_RANK[5]} fill="url(#outerRankPattern)" pointerEvents="none" />
      {ornateRing(R_RANK[5], INK3, 2, 12, 4)}
      {ornateRing(R_RANK[5] - 4, INK3, 0.6)}
      {/* Radial connector lines from rank 5 to boundary */}
      {byRank[5].map((t, i) => {
        const angle = i * 30 - 90
        const pInner = rad(angle, R_RANK[5] - 5)
        const pOuter = rad(angle, R_OUTER_BOUNDARY - 8)
        return <line key={`r5conn-${i}`} x1={pInner.x} y1={pInner.y} x2={pOuter.x} y2={pOuter.y} stroke={INK3} strokeWidth={0.3} opacity={0.4} pointerEvents="none" />
      })}
      {/* Rank 5 label */}
      <text x={cx + R_RANK[5] + 14} y={cy - 12} fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={1}>5TH RANK</text>
      <text x={cx + R_RANK[5] + 14} y={cy + 2} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">Outermost — Reflected Light</text>
      {/* Treasury seals for rank 5 */}
      {byRank[5].map((t, i) => {
        const angle = i * 30 - 90
        const p = rad(angle, R_RANK[5])
        return sealGlyph(t, p.x, p.y, selectedId === t.id)
      })}

      {/* ═══════════════ CURTAIN 3 (between Rank 5 and Rank 4) ═══════════════ */}
      {ornateRing(R_CURTAIN_3, GOLD2, 1.8, 36, 3, '4 3')}
      <g className={`svg-clickable${selectedId === 'ov-curtain3' ? ' selected' : ''}`}
        onClick={() => { const el = elements.find(e => e.id === 'ov-curtain3'); if (el) onClick('ov-curtain3', el.label, el.detail) }}>
        <text x={cx - R_CURTAIN_3 - 8} y={cy + 4} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={GOLD2} letterSpacing={1}>THIRD CURTAIN</text>
      </g>

      {/* ═══════════════ RANK 4 ═══════════════ */}
      <circle cx={cx} cy={cy} r={R_RANK[4]} fill="url(#outerRankPattern)" pointerEvents="none" />
      {ornateRing(R_RANK[4], INK3, 1.8, 12, 4)}
      {ornateRing(R_RANK[4] - 4, INK3, 0.5)}
      {byRank[4].map((t, i) => {
        const angle = i * 30 - 90 + 15
        const pInner = rad(angle, R_RANK[4] - 5)
        const pOuter = rad(angle, R_CURTAIN_3 - 5)
        return <line key={`r4conn-${i}`} x1={pInner.x} y1={pInner.y} x2={pOuter.x} y2={pOuter.y} stroke={INK3} strokeWidth={0.3} opacity={0.35} pointerEvents="none" />
      })}
      <text x={cx + R_RANK[4] + 14} y={cy - 12} fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={1}>4TH RANK</text>
      <text x={cx + R_RANK[4] + 14} y={cy + 2} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">Outer — Filtered Light</text>
      {byRank[4].map((t, i) => {
        const angle = i * 30 - 90 + 15
        const p = rad(angle, R_RANK[4])
        return sealGlyph(t, p.x, p.y, selectedId === t.id)
      })}

      {/* ═══════════════ CURTAIN 2 ═══════════════ */}
      {ornateRing(R_CURTAIN_2, GOLD2, 1.8, 36, 3, '4 3')}
      <g className={`svg-clickable${selectedId === 'ov-curtain2' ? ' selected' : ''}`}
        onClick={() => { const el = elements.find(e => e.id === 'ov-curtain2'); if (el) onClick('ov-curtain2', el.label, el.detail) }}>
        <text x={cx - R_CURTAIN_2 - 8} y={cy + 4} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={GOLD2} letterSpacing={1}>SECOND CURTAIN</text>
      </g>

      {/* ═══════════════ RANK 3 ═══════════════ */}
      <circle cx={cx} cy={cy} r={R_RANK[3]} fill="url(#rankPattern)" pointerEvents="none" />
      {ornateRing(R_RANK[3], GOLD2, 1.8, 12, 4)}
      {ornateRing(R_RANK[3] - 4, GOLD2, 0.5)}
      {byRank[3].map((t, i) => {
        const angle = i * 30 - 90
        const pInner = rad(angle, R_RANK[3] - 5)
        const pOuter = rad(angle, R_CURTAIN_2 - 5)
        return <line key={`r3conn-${i}`} x1={pInner.x} y1={pInner.y} x2={pOuter.x} y2={pOuter.y} stroke={GOLD2} strokeWidth={0.4} opacity={0.35} pointerEvents="none" />
      })}
      <text x={cx + R_RANK[3] + 14} y={cy - 12} fontFamily="Cinzel, serif" fontSize={9} fill={GOLD} letterSpacing={1}>3RD RANK</text>
      <text x={cx + R_RANK[3] + 14} y={cy + 2} fontFamily="Libre Baskerville, serif" fontSize={7} fill={GOLD2} fontStyle="italic">Middle — Intermediate Light</text>
      {byRank[3].map((t, i) => {
        const angle = i * 30 - 90
        const p = rad(angle, R_RANK[3])
        return sealGlyph(t, p.x, p.y, selectedId === t.id)
      })}

      {/* ═══════════════ CURTAIN 1 ═══════════════ */}
      {ornateRing(R_CURTAIN_1, GOLD, 2, 36, 3, '4 3')}
      <g className={`svg-clickable${selectedId === 'ov-curtain1' ? ' selected' : ''}`}
        onClick={() => { const el = elements.find(e => e.id === 'ov-curtain1'); if (el) onClick('ov-curtain1', el.label, el.detail) }}>
        <text x={cx - R_CURTAIN_1 - 8} y={cy + 4} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={GOLD} letterSpacing={1}>FIRST CURTAIN</text>
      </g>

      {/* ═══════════════ RANK 2 ═══════════════ */}
      <circle cx={cx} cy={cy} r={R_RANK[2]} fill="url(#rankPattern)" pointerEvents="none" />
      {ornateRing(R_RANK[2], GOLD, 1.8, 12, 3)}
      {ornateRing(R_RANK[2] - 4, GOLD3, 0.5)}
      {byRank[2].map((t, i) => {
        const angle = i * 30 - 90 + 15
        const pInner = rad(angle, R_RANK[2] - 5)
        const pOuter = rad(angle, R_CURTAIN_1 - 5)
        return <line key={`r2conn-${i}`} x1={pInner.x} y1={pInner.y} x2={pOuter.x} y2={pOuter.y} stroke={GOLD} strokeWidth={0.4} opacity={0.35} pointerEvents="none" />
      })}
      <text x={cx + R_RANK[2] + 14} y={cy - 12} fontFamily="Cinzel, serif" fontSize={9} fill={GOLD} letterSpacing={1}>2ND RANK</text>
      <text x={cx + R_RANK[2] + 14} y={cy + 2} fontFamily="Libre Baskerville, serif" fontSize={7} fill={GOLD2} fontStyle="italic">Inner — Bright Light</text>
      {byRank[2].map((t, i) => {
        const angle = i * 30 - 90 + 15
        const p = rad(angle, R_RANK[2])
        return sealGlyph(t, p.x, p.y, selectedId === t.id)
      })}

      {/* ═══════════════ RANK 1 (INNERMOST) ═══════════════ */}
      <circle cx={cx} cy={cy} r={R_RANK[1]} fill="url(#rankPattern)" pointerEvents="none" />
      {ornateRing(R_RANK[1], GOLD, 2.2, 12, 3)}
      {ornateRing(R_RANK[1] - 4, GOLD3, 0.6)}
      {/* Sacred hexagram over rank 1 */}
      {(() => {
        const r = R_RANK[1]
        const pts = Array.from({ length: 6 }).map((_, i) => {
          const a = ((i * 60 + 30) * Math.PI / 180)
          return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
        })
        return (
          <g pointerEvents="none">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line key={i} x1={pts[i].x} y1={pts[i].y} x2={pts[(i + 2) % 6].x} y2={pts[(i + 2) % 6].y} stroke={GOLD2} strokeWidth={0.5} opacity={0.35} />
            ))}
          </g>
        )
      })()}
      {byRank[1].map((t, i) => {
        const angle = i * 30 - 90
        const pInner = rad(angle, R_INNER + 6)
        const pOuter = rad(angle, R_RANK[1] - 5)
        return <line key={`r1conn-${i}`} x1={pInner.x} y1={pInner.y} x2={pOuter.x} y2={pOuter.y} stroke={GOLD} strokeWidth={0.5} opacity={0.4} pointerEvents="none" />
      })}
      <text x={cx - R_RANK[1] - 8} y={cy - 12} textAnchor="end" fontFamily="Cinzel, serif" fontSize={9} fill={GOLD} letterSpacing={1}>1ST RANK</text>
      <text x={cx - R_RANK[1] - 8} y={cy + 2} textAnchor="end" fontFamily="Libre Baskerville, serif" fontSize={7} fill={GOLD2} fontStyle="italic">Innermost — Pure Light</text>
      {byRank[1].map((t, i) => {
        const angle = i * 30 - 90
        const p = rad(angle, R_RANK[1])
        return sealGlyph(t, p.x, p.y, selectedId === t.id)
      })}

      {/* ═══════════════ THE GREAT INVISIBLE (CENTER) ═══════════════ */}
      <circle cx={cx} cy={cy} r={R_RANK[1]} fill="url(#treasuryGlow)" pointerEvents="none" />
      <g className={`svg-clickable${selectedId === 'ov-invisible' ? ' selected' : ''}`}
        onClick={() => { const el = elements.find(e => e.id === 'ov-invisible'); if (el) onClick('ov-invisible', el.label, el.detail) }}>
        <circle cx={cx} cy={cy} r={R_INNER} fill={INK} stroke={GOLD3} strokeWidth={3}
          style={{ filter: 'drop-shadow(0 0 12px rgba(232,192,112,0.6))' }} />
        {/* Inner radiating lines */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15) * Math.PI / 180
          return <line key={`ray-${i}`} x1={cx + Math.cos(a) * 10} y1={cy + Math.sin(a) * 10} x2={cx + Math.cos(a) * 32} y2={cy + Math.sin(a) * 32} stroke={GOLD3} strokeWidth={0.7} opacity={0.6} pointerEvents="none" />
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={GOLD3} letterSpacing={2}>GREAT</text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={GOLD3} letterSpacing={2}>INVISIBLE</text>
      </g>

      {/* ═══════════════ ASCENT PATH (dashed spiral from outside to center) ═══════════════ */}
      <g pointerEvents="none">
        {Array.from({ length: 180 }).map((_, i) => {
          if (i % 3 !== 0) return null
          const t = i / 180
          const angle = t * 1080 * Math.PI / 180
          const r = R_OUTER_BOUNDARY - t * (R_OUTER_BOUNDARY - R_INNER)
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          return <circle key={`spiral-${i}`} cx={x} cy={y} r={0.8} fill={GOLD2} opacity={0.15 + t * 0.35} />
        })}
        {/* Ascent arrow near boundary */}
        <polygon points={`${cx + 6},${cy - R_OUTER_BOUNDARY + 18} ${cx},${cy - R_OUTER_BOUNDARY + 8} ${cx - 6},${cy - R_OUTER_BOUNDARY + 18}`} fill={GOLD2} opacity={0.7} />
        <text x={cx + 16} y={cy - R_OUTER_BOUNDARY + 24} fontFamily="Libre Baskerville, serif" fontSize={6} fill={GOLD2} fontStyle="italic">Path of Ascent</text>
      </g>

      {/* ═══════════════ SIDE ANNOTATIONS ═══════════════ */}
      {/* Left bracket: Pleroma label */}
      <g pointerEvents="none">
        <line x1={36} y1={cy - R_OUTER_BOUNDARY + 24} x2={36} y2={cy + R_OUTER_BOUNDARY - 24} stroke={GOLD2} strokeWidth={1.2} />
        <line x1={36} y1={cy - R_OUTER_BOUNDARY + 24} x2={48} y2={cy - R_OUTER_BOUNDARY + 24} stroke={GOLD2} strokeWidth={1.2} />
        <line x1={36} y1={cy + R_OUTER_BOUNDARY - 24} x2={48} y2={cy + R_OUTER_BOUNDARY - 24} stroke={GOLD2} strokeWidth={1.2} />
        <text x={28} y={cy} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={GOLD2} letterSpacing={4}
          transform={`rotate(-90, 28, ${cy})`}>PLEROMA</text>
      </g>

      {/* ═══════════════ CORNER DECORATIONS ═══════════════ */}
      <g pointerEvents="none">
        <path d={`M12 84 L12 70 Q12 64 18 64 L30 64`} fill="none" stroke={GOLD2} strokeWidth={1.2} />
        <path d={`M18 84 L18 74 Q18 68 24 68 L30 68`} fill="none" stroke={GOLD2} strokeWidth={0.7} />
        <circle cx={21} cy={74} r={3} fill={GOLD2} />
      </g>
      <g pointerEvents="none">
        <path d={`M${W - 12} 84 L${W - 12} 70 Q${W - 12} 64 ${W - 18} 64 L${W - 30} 64`} fill="none" stroke={GOLD2} strokeWidth={1.2} />
        <path d={`M${W - 18} 84 L${W - 18} 74 Q${W - 18} 68 ${W - 24} 68 L${W - 30} 68`} fill="none" stroke={GOLD2} strokeWidth={0.7} />
        <circle cx={W - 21} cy={74} r={3} fill={GOLD2} />
      </g>
      <g pointerEvents="none">
        <path d={`M12 ${H - 84} L12 ${H - 70} Q12 ${H - 64} 18 ${H - 64} L30 ${H - 64}`} fill="none" stroke={GOLD2} strokeWidth={1.2} />
        <circle cx={21} cy={H - 74} r={3} fill={GOLD2} />
      </g>
      <g pointerEvents="none">
        <path d={`M${W - 12} ${H - 84} L${W - 12} ${H - 70} Q${W - 12} ${H - 64} ${W - 18} ${H - 64} L${W - 30} ${H - 64}`} fill="none" stroke={GOLD2} strokeWidth={1.2} />
        <circle cx={W - 21} cy={H - 74} r={3} fill={GOLD2} />
      </g>

      {/* ═══════════════ LEGEND ═══════════════ */}
      <g pointerEvents="none">
        <line x1={70} y1={H - 100} x2={W - 70} y2={H - 100} stroke={GOLD2} strokeWidth={0.6} />
        {/* Rank 1 indicator */}
        <circle cx={100} cy={H - 76} r={5} fill="none" stroke={GOLD} strokeWidth={1.5} />
        <text x={112} y={H - 72} fontFamily="Libre Baskerville, serif" fontSize={8} fill={GOLD}>1st–2nd Rank (Inner — Pure Light)</text>
        {/* Rank 3-5 indicator */}
        <circle cx={100} cy={H - 56} r={5} fill="none" stroke={INK3} strokeWidth={1.5} />
        <text x={112} y={H - 52} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3}>3rd–5th Rank (Outer — Diminished Light)</text>
        {/* Curtain indicator */}
        <line x1={96} y1={H - 38} x2={104} y2={H - 38} stroke={GOLD2} strokeWidth={2} strokeDasharray="3 2" />
        <text x={112} y={H - 34} fontFamily="Libre Baskerville, serif" fontSize={8} fill={GOLD2}>Curtain of Light</text>
        {/* Seal type indicators */}
        <circle cx={460} cy={H - 76} r={5} fill="none" stroke={GOLD2} strokeWidth={0.8} />
        <circle cx={460} cy={H - 76} r={2} fill={GOLD2} opacity={0.6} />
        <text x={472} y={H - 72} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3}>Concentric Seal</text>
        <line x1={456} y1={H - 84} x2={464} y2={H - 68} stroke={GOLD2} strokeWidth={0.8} />
        <line x1={456} y1={H - 68} x2={464} y2={H - 84} stroke={GOLD2} strokeWidth={0.8} />
        <text x={472} y={H - 52} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3}>Cross-Circle Seal</text>
        {/* Star seal indicator */}
        {[0, 72, 144, 216, 288].map((a, i) => {
          const sa = a * Math.PI / 180
          return <line key={i} x1={460} y1={H - 38} x2={460 + Math.cos(sa) * 5} y2={H - 38 + Math.sin(sa) * 5} stroke={GOLD2} strokeWidth={0.6} />
        })}
        <circle cx={460} cy={H - 38} r={2} fill={GOLD2} opacity={0.5} />
        <text x={472} y={H - 34} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3}>Star Seal</text>
      </g>

      {/* Source note */}
      <text x={cx} y={H - 14} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={INK3} fontStyle="italic">
        Based on the Book of Jeu I-II (Codex Brucianus) — All 60 Treasuries with Fathers, Ciphers, and Seal Types
      </text>

      {/* ═══════════════ INTERMEDIATE DECORATIVE RINGS ═══════════════ */}
      {ornateRing((R_RANK[5] + R_OUTER_BOUNDARY) / 2, INK3, 0.3, 0, 0, '1 6')}
      {ornateRing((R_RANK[2] + R_RANK[1]) / 2, GOLD3, 0.3, 0, 0, '1 4')}

      {/* ═══════════════ PLEROMA CLICK REGION ═══════════════ */}
      <g className={`svg-clickable${selectedId === 'ov-pleroma' ? ' selected' : ''}`}
        onClick={() => { const el = elements.find(e => e.id === 'ov-pleroma'); if (el) onClick('ov-pleroma', el.label, el.detail) }}>
        <rect x={cx - 80} y={cy + R_OUTER_BOUNDARY + 10} width={160} height={28}
          fill={selectedId === 'ov-pleroma' ? 'rgba(200,168,74,0.12)' : 'transparent'}
          stroke={selectedId === 'ov-pleroma' ? GOLD2 : 'transparent'} strokeWidth={1} />
        <text x={cx} y={cy + R_OUTER_BOUNDARY + 28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={GOLD2} letterSpacing={3}>THE PLEROMA</text>
      </g>
    </svg>
  )
}

/* ── UPGRADED Archon Gate Diagram ── */
function ArchonGateDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  const gates = [
    { y: 55, w: 160, h: 120, label: '1st Gate: Paraphax', pron: 'PAR-ah-faks', pw: 'IAO SABAOTH', pwPron: 'EE-ah-oh SAH-bah-oth', id: 'ar-paraph', color: '#6a5030', watchers: ['Phaethyx', 'Omorax'] },
    { y: 200, w: 200, h: 135, label: '2nd Gate: Arthax', pron: 'AR-thaks', pw: 'ADONAI ELOHIM', pwPron: 'ah-doh-NYE el-oh-HEEM', id: 'ar-arthax', color: '#5a3818', watchers: ['Saphyx', 'Mareoth'] },
    { y: 365, w: 240, h: 145, label: '3rd Gate: Aphraphax', pron: 'ah-FRAH-faks', pw: 'EIE AZAPHAX', pwPron: 'AY-ee-ay AZ-ah-faks', id: 'ar-aphr', color: '#3a2c14', watchers: ['Pigeroth', 'Thalmyx', 'Bathrax'] }
  ]

  return (
    <svg viewBox="0 0 500 540" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={22} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK} letterSpacing={2}>THE THREE ARCHON GATES</text>
      {/* Ascending path */}
      <line x1={cx} y1={530} x2={cx} y2={40} stroke={GOLD2} strokeWidth={0.8} strokeDasharray="4,4" pointerEvents="none" />
      <text x={cx} y={538} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK3} letterSpacing={2}>SOUL ASCENDS</text>

      {gates.map((gate, gi) => {
        const gateCx = cx, gateCy = gate.y + gate.h / 2
        const hw = gate.w / 2, hh = gate.h / 2
        return (
          <g key={gi}>
            {/* Outer decorative border */}
            <rect x={gateCx - hw - 10} y={gate.y - 10} width={gate.w + 20} height={gate.h + 20}
              fill="none" stroke={GOLD2} strokeWidth={0.5} strokeDasharray="2,2" pointerEvents="none" />

            {/* Gate arch */}
            <path d={`M${gateCx - hw} ${gate.y + gate.h} L${gateCx - hw} ${gate.y + 25} Q${gateCx - hw} ${gate.y} ${gateCx - hw/3} ${gate.y} L${gateCx + hw/3} ${gate.y} Q${gateCx + hw} ${gate.y} ${gateCx + hw} ${gate.y + 25} L${gateCx + hw} ${gate.y + gate.h}`}
              fill="none" stroke={gate.color} strokeWidth={3.5}
              className={`svg-clickable${selectedId === gate.id ? ' selected' : ''}`}
              onClick={() => { const el = elements.find(e => e.id === gate.id); if (el) onClick(gate.id, el.label, el.detail) }} />

            {/* Keystone */}
            <path d={`M${gateCx - 12} ${gate.y} L${gateCx} ${gate.y - 10} L${gateCx + 12} ${gate.y}`} fill={GOLD2} stroke={gate.color} strokeWidth={1.5} pointerEvents="none" />
            <text x={gateCx} y={gate.y - 15} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={GOLD}>{gi + 1}</text>

            {/* Pillar decorations */}
            <rect x={gateCx - hw - 4} y={gate.y + 15} width={4} height={gate.h - 15} fill={GOLD2} opacity={0.3} pointerEvents="none" />
            <rect x={gateCx + hw} y={gate.y + 15} width={4} height={gate.h - 15} fill={GOLD2} opacity={0.3} pointerEvents="none" />

            {/* Inner seals - concentric rings */}
            {Array.from({ length: gi + 2 }, (_, ri) => (
              <circle key={ri} cx={gateCx} cy={gateCy} r={14 + ri * 10} fill="none" stroke={ri === 0 ? GOLD : ri === gi + 1 ? INK : GOLD2} strokeWidth={ri === 0 ? 2 : 1} pointerEvents="none" />
            ))}

            {/* Cross for gate 2+ */}
            {gi >= 1 && <>
              <line x1={gateCx} y1={gateCy - 24} x2={gateCx} y2={gateCy + 24} stroke={INK} strokeWidth={2} pointerEvents="none" />
              <line x1={gateCx - 24} y1={gateCy} x2={gateCx + 24} y2={gateCy} stroke={INK} strokeWidth={2} pointerEvents="none" />
            </>}

            {/* Radiating lines for gate 3 */}
            {gi >= 2 && <>
              {[45, 135, 225, 315].map((angle, ai) => {
                const a = angle * Math.PI / 180
                return <line key={ai} x1={gateCx} y1={gateCy} x2={gateCx + Math.cos(a) * 32} y2={gateCy + Math.sin(a) * 32} stroke={INK3} strokeWidth={1.5} pointerEvents="none" />
              })}
            </>}

            {/* Central seal */}
            <circle cx={gateCx} cy={gateCy} r={7} fill={PARCH} stroke={INK} strokeWidth={1.5} pointerEvents="none" />

            {/* Watcher figures flanking */}
            {gate.watchers.map((w, wi) => {
              const wx = wi === 0 ? gateCx - hw - 24 : gateCx + hw + 24
              return (
                <g key={wi}>
                  <circle cx={wx} cy={gateCy} r={10} fill={PARCH} stroke={INK} strokeWidth={1}
                    className={`svg-clickable${selectedId === `gw-${gi}-${wi}` ? ' selected' : ''}`}
                    onClick={() => onClick(`gw-${gi}-${wi}`, `Watcher: ${w}`, `${w} stands guard at the ${gate.label}.`)} />
                  <text x={wx} y={gateCy + 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={5} fill={INK}>{w.substring(0,4)}</text>
                </g>
              )
            })}

            {/* Gate label & pronunciation */}
            <text x={gateCx} y={gate.y - 22} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={INK} letterSpacing={1}>{gate.label}</text>
            <text x={gateCx} y={gate.y - 12} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">[{gate.pron}]</text>

            {/* Password & pronunciation */}
            <text x={gateCx} y={gate.y + gate.h + 16} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={GOLD} letterSpacing={1}>{gate.pw}</text>
            <text x={gateCx} y={gate.y + gate.h + 28} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">[{gate.pwPron}]</text>

            {/* Side labels */}
            {gi === 0 && <text x={32} y={gateCy} fontFamily="Cinzel, serif" fontSize={6.5} fill={INK3} transform={`rotate(-90, 32, ${gateCy})`}>ARCHONS OF THE AEONS</text>}
            {gi === 1 && <text x={32} y={gateCy} fontFamily="Cinzel, serif" fontSize={6.5} fill={INK3} transform={`rotate(-90, 32, ${gateCy})`}>ARCHONS OF THE SPHERE</text>}
            {gi === 2 && <text x={32} y={gateCy} fontFamily="Cinzel, serif" fontSize={6.5} fill={INK3} transform={`rotate(-90, 32, ${gateCy})`}>ARCHONS OF THE MIDST</text>}

            {/* Arrow between gates */}
            {gi < 2 && <path d={`M${gateCx} ${gate.y + gate.h + 35} L${gateCx - 4} ${gate.y + gate.h + 43} M${gateCx} ${gate.y + gate.h + 35} L${gateCx + 4} ${gate.y + gate.h + 43}`} stroke={GOLD2} strokeWidth={1.5} pointerEvents="none" />}
          </g>
        )
      })}
      <text x={cx} y={535} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK3} letterSpacing={2}>UNTO THE TREASURY OF LIGHT</text>
    </svg>
  )
}

/* ── Baptism Diagram ── */
function BaptismDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  const baptisms = [
    { id: 'bt-water', label: 'Water', y: 80, color: '#3a6a8a', inv: 'IAO SABAOTH' },
    { id: 'bt-fire', label: 'Fire', y: 165, color: '#8a3a20', inv: 'ADONAI ELOHIM' },
    { id: 'bt-spirit', label: 'Spirit', y: 250, color: '#6a5030', inv: 'EIE AZAPHAX' },
    { id: 'bt-light', label: 'Light', y: 335, color: GOLD2, inv: 'GREAT INVISIBLE' },
    { id: 'bt-mystery', label: 'Mystery', y: 420, color: INK, inv: 'THE INEFFABLE' }
  ]
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={30} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK} letterSpacing={2}>THE FIVE BAPTISMS</text>
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
            <text x={cx} y={b.y + 5} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={15} fill={b.color}>{i + 1}</text>
            <text x={cx + r + 15} y={b.y - 2} fontFamily="Cinzel, serif" fontSize={10} fill={INK2} letterSpacing={1}>{i + 1}. {b.label}</text>
            <text x={cx + r + 15} y={b.y + 12} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">{b.inv}</text>
            <text x={cx - r - 15} y={b.y + 4} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={INK3}>Seal {i + 1}</text>
            {i < 4 && <path d={`M${cx} ${b.y + r + 8} L${cx - 4} ${b.y + r + 16} M${cx} ${b.y + r + 8} L${cx + 4} ${b.y + r + 16}`} stroke={GOLD2} strokeWidth={1.5} pointerEvents="none" />}
          </g>
        )
      })}
      <text x={cx} y={488} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK3} letterSpacing={2}>UNTO THE TREASURY OF LIGHT</text>
    </svg>
  )
}

/* ── Cosmos Diagram — Extremely Detailed Gnostic Cosmology with Constellations ── */
function CosmosDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const W = 1100, H = 1200
  const cx = 550, cy = 600

  /* ── Realm radii (scaled up ~40%) ── */
  const R_ONE = 30
  const R_TRIAD = 72
  const R_LUMINARIES = 150
  const R_AEONS = 240
  const R_BOUNDARY = 300
  const R_DEMIURGE = 360
  const R_PLANETS = 430
  const R_ZODIAC = 490
  const R_FATE = 530
  const R_KENOMA = 570

  /* ── Helper: radial position ── */
  const rad = (angle: number, r: number) => ({
    x: cx + Math.cos(angle * Math.PI / 180) * r,
    y: cy + Math.sin(angle * Math.PI / 180) * r
  })

  /* ── Four Luminaries with sub-aeons ── */
  const luminaries = [
    { name: 'Harmozel [har-MOH-zel]', id: 'cos-luminaries', subAeons: ['Grace', 'Truth'], angle: 315 },
    { name: 'Oroiael [or-OY-ah-el]', id: 'cos-luminaries', subAeons: ['Conception', 'Perception'], angle: 45 },
    { name: 'Daveithai [dah-VAY-thay]', id: 'cos-luminaries', subAeons: ['Understanding', 'Love'], angle: 135 },
    { name: 'Eleleth [el-EL-eth]', id: 'cos-luminaries', subAeons: ['Wisdom', 'Prudence'], angle: 225 }
  ]

  /* ── Twelve Aeons ── */
  const twelveAeons = [
    { name: 'Armedon [ar-MED-on]', angle: 0 },
    { name: 'Sigen [SI-jen]', angle: 30 },
    { name: 'Matricula [mah-TRIK-yoo-lah]', angle: 60 },
    { name: 'Haram [HAH-ram]', angle: 90 },
    { name: 'Ei [AY]', angle: 120 },
    { name: 'Ogen [OH-jen]', angle: 150 },
    { name: 'Mixanther [miks-AN-ther]', angle: 180 },
    { name: 'Astere [ah-STER-ee]', angle: 210 },
    { name: 'Aphria [AH-free-ah]', angle: 240 },
    { name: 'Mirothea [mi-ROTH-ee-ah]', angle: 270 },
    { name: 'Synel [SIN-el]', angle: 300 },
    { name: 'Thales [THAY-leez]', angle: 330 }
  ]

  /* ── Seven Planetary Archons ── */
  const planetaryArchons = [
    { name: 'Ialdabaoth [yal-dah-BAH-oth]', planet: 'Saturn', id: 'cos-planets', angle: 270 },
    { name: 'Iao [EE-ah-oh]', planet: 'Jupiter', id: 'cos-planets', angle: 320 },
    { name: 'Sabaoth [SAH-bah-oth]', planet: 'Mars', id: 'cos-planets', angle: 10 },
    { name: 'Adonai [ah-DON-eye]', planet: 'Sun', id: 'cos-planets', angle: 60 },
    { name: 'Eloai [el-OH-eye]', planet: 'Venus', id: 'cos-planets', angle: 110 },
    { name: 'Oraios [or-AY-os]', planet: 'Mercury', id: 'cos-planets', angle: 160 },
    { name: 'Astaphaios [as-tah-FAY-os]', planet: 'Moon', id: 'cos-planets', angle: 210 }
  ]

  /* ── Twelve Zodiac Archons ── */
  const zodiacArchons = [
    { name: 'Arioth [ah-REE-oth]', sign: 'Aries', angle: 0 },
    { name: 'Thaum [THAWM]', sign: 'Taurus', angle: 30 },
    { name: 'Gair [GARE]', sign: 'Gemini', angle: 60 },
    { name: 'Kark [KARK]', sign: 'Cancer', angle: 90 },
    { name: 'Leon [LAY-on]', sign: 'Leo', angle: 120 },
    { name: 'Parthen [PAR-then]', sign: 'Virgo', angle: 150 },
    { name: 'Mozn [MOZ-en]', sign: 'Libra', angle: 180 },
    { name: 'Akrab [AHK-rab]', sign: 'Scorpio', angle: 210 },
    { name: 'Qeshet [KESH-et]', sign: 'Sagittarius', angle: 240 },
    { name: 'Gadi [GAH-dee]', sign: 'Capricorn', angle: 270 },
    { name: 'Deli [DEL-ee]', sign: 'Aquarius', angle: 300 },
    { name: 'Nuni [NOO-nee]', sign: 'Pisces', angle: 330 }
  ]

  /* ── Constellations in the Kenoma (outer material realm) ── */
  /* Each constellation: stars (offsets from center of constellation) + lines connecting them */
  const constellations = [
    {
      name: 'Serpens [SER-penz]', label: 'The Serpent',
      centerAngle: 200, centerR: R_KENOMA + 40,
      stars: [[0, 0], [12, -8], [26, -6], [38, -10], [50, -4], [44, 8], [32, 12]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
    },
    {
      name: 'Draco [DRAY-koh]', label: 'The Dragon',
      centerAngle: 340, centerR: R_KENOMA + 35,
      stars: [[0, 0], [-8, -14], [-18, -12], [-24, -4], [-16, 8], [-6, 10], [4, 6]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
    },
    {
      name: 'Corvus [KOR-vus]', label: 'The Crow',
      centerAngle: 110, centerR: R_KENOMA + 30,
      stars: [[0, 0], [10, -12], [20, -4], [14, 10], [-6, 8]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
    },
    {
      name: 'Orion [or-EYE-on]', label: 'The Hunter',
      centerAngle: 60, centerR: R_KENOMA + 50,
      stars: [[0, -18], [-10, -6], [10, -6], [-12, 6], [0, 6], [12, 6], [-8, 18], [8, 18]],
      lines: [[0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [3, 6], [5, 7]]
    },
    {
      name: 'Ursa Major [ER-sah MAY-jor]', label: 'The Great Bear',
      centerAngle: 290, centerR: R_KENOMA + 55,
      stars: [[0, 0], [14, -4], [24, 2], [18, 14], [4, 16], [-10, 10], [-14, 2]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]]
    },
    {
      name: 'Cygnus [SIG-nus]', label: 'The Swan',
      centerAngle: 25, centerR: R_KENOMA + 35,
      stars: [[0, -16], [0, -4], [-14, 4], [14, 4], [0, 14]],
      lines: [[0, 1], [1, 2], [1, 3], [1, 4]]
    },
    {
      name: 'Scorpius [SKOR-pee-us]', label: 'The Scorpion',
      centerAngle: 155, centerR: R_KENOMA + 45,
      stars: [[-20, -8], [-10, -4], [0, 0], [10, 2], [18, 8], [22, 16], [16, 22]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
    },
    {
      name: 'Leo [LEE-oh]', label: 'The Lion',
      centerAngle: 245, centerR: R_KENOMA + 40,
      stars: [[-10, -10], [0, -14], [12, -10], [16, 0], [8, 10], [-4, 8], [-14, 2]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]]
    },
    {
      name: 'Cassiopeia [kas-ee-oh-PEE-ah]', label: 'The Queen',
      centerAngle: 315, centerR: R_KENOMA + 65,
      stars: [[-16, 4], [-6, -8], [4, 2], [14, -10], [22, 2]],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
    },
    {
      name: 'Andromeda [an-DROM-eh-dah]', label: 'The Chained Lady',
      centerAngle: 80, centerR: R_KENOMA + 60,
      stars: [[0, -14], [-8, -4], [8, -4], [-14, 8], [14, 8]],
      lines: [[0, 1], [0, 2], [1, 3], [2, 4]]
    },
    {
      name: 'Aquila [AH-kwi-lah]', label: 'The Eagle',
      centerAngle: 180, centerR: R_KENOMA + 55,
      stars: [[0, 0], [-10, -10], [10, -10], [-16, 4], [16, 4]],
      lines: [[0, 1], [0, 2], [1, 3], [2, 4]]
    },
    {
      name: 'Ophiuchus [off-ee-YOO-kus]', label: 'The Serpent-Bearer',
      centerAngle: 130, centerR: R_KENOMA + 70,
      stars: [[0, -16], [-8, -6], [8, -6], [0, 4], [-12, 10], [12, 10], [0, 18]],
      lines: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6]]
    }
  ]

  /* ── Decorative: ornate double-ring with tick marks ── */
  const ornateRing = (r: number, stroke: string, sw: number, ticks = 0, tickLen = 4, dashArray?: string) => (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray={dashArray} />
      {ticks > 0 && Array.from({ length: ticks }).map((_, i) => {
        const a = (i * 360 / ticks) * Math.PI / 180
        const x1 = cx + Math.cos(a) * (r - tickLen), y1 = cy + Math.sin(a) * (r - tickLen)
        const x2 = cx + Math.cos(a) * (r + tickLen), y2 = cy + Math.sin(a) * (r + tickLen)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={0.8} />
      })}
    </g>
  )

  /* ── Decorative: sacred geometry hexagram ── */
  const hexagram = (r: number, stroke: string, sw: number, rotation = 0) => {
    const pts = Array.from({ length: 6 }).map((_, i) => {
      const a = ((i * 60 + rotation) * Math.PI / 180)
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
    })
    return (
      <g pointerEvents="none">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={i} x1={pts[i].x} y1={pts[i].y} x2={pts[(i + 2) % 6].x} y2={pts[(i + 2) % 6].y} stroke={stroke} strokeWidth={sw} opacity={0.5} />
        ))}
      </g>
    )
  }

  /* ── Click handler helper ── */
  const handleClick = (id: string) => {
    const el = elements.find(e => e.id === id)
    if (el) onClick(id, el.label, el.detail)
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        {/* Gradient for divine center glow */}
        <radialGradient id="divineGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c070" stopOpacity={0.6} />
          <stop offset="50%" stopColor="#c8a84a" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#c8a84a" stopOpacity={0} />
        </radialGradient>
        {/* Gradient for kenoma darkness */}
        <radialGradient id="kenomaGloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3a2c14" stopOpacity={0} />
          <stop offset="80%" stopColor="#1a1208" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#1a1208" stopOpacity={0.15} />
        </radialGradient>
        {/* Gradient for boundary flash */}
        <linearGradient id="boundaryFlash" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c8a84a" stopOpacity={0} />
          <stop offset="50%" stopColor="#e8c070" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#c8a84a" stopOpacity={0} />
        </linearGradient>
        {/* Fine pattern for Pleroma region */}
        <pattern id="pleromaPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.6" fill="#c8a84a" opacity={0.2} />
        </pattern>
        {/* Fine pattern for material region */}
        <pattern id="kenomaPattern" width="12" height="12" patternUnits="userSpaceOnUse">
          <line x1="0" y1="12" x2="12" y2="0" stroke="#6a5030" strokeWidth={0.3} opacity={0.3} />
        </pattern>
      </defs>

      {/* ═══════════════ TITLE ═══════════════ */}
      <text x={cx} y={32} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={24} fill={INK} letterSpacing={5} fontWeight="bold">THE GNOSTIC COSMOS</text>
      <text x={cx} y={56} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={12} fill={INK3} fontStyle="italic">From the One to the Kenoma — The Complete Hierarchy of Being</text>
      {/* Decorative line under title */}
      <line x1={cx - 260} y1={66} x2={cx + 260} y2={66} stroke={GOLD2} strokeWidth={1} />
      <line x1={cx - 240} y1={70} x2={cx + 240} y2={70} stroke={GOLD2} strokeWidth={0.5} />
      <SvgCross x={cx - 265} y={68} size={4} color={GOLD2} />
      <SvgCross x={cx + 261} y={68} size={4} color={GOLD2} />

      {/* ═══════════════ CONSTELLATIONS IN THE KENOMA ═══════════════ */}
      {/* Star field background */}
      {Array.from({ length: 200 }).map((_, i) => {
        const seed = i * 7919 + 104729
        const px = ((seed * 13) % W)
        const py = ((seed * 17) % (H - 100)) + 80
        const distFromCenter = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
        if (distFromCenter < R_KENOMA + 15 || distFromCenter > R_KENOMA + 100) return null
        const brightness = ((seed * 23) % 5) / 5
        const sz = 0.5 + brightness * 1.2
        return <circle key={`bgStar-${i}`} cx={px} cy={py} r={sz} fill={INK3} opacity={0.15 + brightness * 0.35} pointerEvents="none" />
      })}
      {/* Named constellations */}
      {constellations.map((c, ci) => {
        const center = rad(c.centerAngle, c.centerR)
        const starPositions = c.stars.map(([sx, sy]) => ({ x: center.x + sx, y: center.y + sy }))
        return (
          <g key={`const-${ci}`} pointerEvents="none">
            {/* Constellation lines */}
            {c.lines.map(([a, b], li) => (
              <line key={li}
                x1={starPositions[a].x} y1={starPositions[a].y}
                x2={starPositions[b].x} y2={starPositions[b].y}
                stroke={INK3} strokeWidth={0.7} opacity={0.45} />
            ))}
            {/* Star points */}
            {starPositions.map((sp, si) => (
              <g key={si}>
                <circle cx={sp.x} cy={sp.y} r={2.5} fill={INK3} opacity={0.7} />
                <circle cx={sp.x} cy={sp.y} r={1.2} fill={PARCH} opacity={0.9} />
              </g>
            ))}
            {/* Constellation label */}
            <text x={center.x} y={center.y + (c.stars.reduce((m, s) => Math.max(m, s[1]), 0)) + 16}
              textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK3} letterSpacing={1} opacity={0.8}>
              {c.name.split(' [')[0]}
            </text>
            <text x={center.x} y={center.y + (c.stars.reduce((m, s) => Math.max(m, s[1]), 0)) + 26}
              textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={5.5} fill={INK3} fontStyle="italic" opacity={0.6}>
              {c.label}
            </text>
          </g>
        )
      })}

      {/* ═══════════════ OUTERMOST: KENOMA ═══════════════ */}
      {/* Background fill for material world */}
      <circle cx={cx} cy={cy} r={R_KENOMA + 10} fill="url(#kenomaGloom)" pointerEvents="none" />
      <circle cx={cx} cy={cy} r={R_KENOMA} fill="url(#kenomaPattern)" pointerEvents="none" />
      {ornateRing(R_KENOMA, INK3, 2.5, 72, 3)}
      {ornateRing(R_KENOMA - 5, INK3, 1)}
      {/* Label: Material World */}
      <g className={`svg-clickable${selectedId === 'cos-yaldabaoth' ? ' selected' : ''}`}
        onClick={() => handleClick('cos-yaldabaoth')}>
        <rect x={cx - 110} y={cy - R_KENOMA - 28} width={220} height={24}
          fill={selectedId === 'cos-yaldabaoth' ? 'rgba(200,168,74,0.12)' : 'transparent'}
          stroke={selectedId === 'cos-yaldabaoth' ? GOLD2 : 'transparent'} strokeWidth={1} />
        <text x={cx} y={cy - R_KENOMA - 12} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK3} letterSpacing={3}>MATERIAL WORLD</text>
      </g>
      <text x={cx + R_KENOMA + 10} y={cy + 5} fontFamily="Libre Baskerville, serif" fontSize={9} fill={INK3} fontStyle="italic">Kenoma [ken-OH-mah] — Deficiency</text>

      {/* ═══════════════ FATE RING (Heimarmene) ═══════════════ */}
      {ornateRing(R_FATE, INK3, 1.5, 36, 3, '2 3')}
      <text x={cx + R_FATE + 10} y={cy - 40} fontFamily="Cinzel, serif" fontSize={8} fill={INK3} letterSpacing={1}>HEIMARMENE [hi-MAR-men-ee]</text>
      <text x={cx + R_FATE + 10} y={cy - 28} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">The Wheel of Fate</text>

      {/* ═══════════════ ZODIAC RING ═══════════════ */}
      {ornateRing(R_ZODIAC, INK3, 1.5, 12, 5)}
      {ornateRing(R_ZODIAC - 3, INK3, 0.5)}
      {zodiacArchons.map((za, i) => {
        const p = rad(za.angle, R_ZODIAC)
        const pInner = rad(za.angle, R_PLANETS + 5)
        const pOuter = rad(za.angle, R_FATE - 5)
        return (
          <g key={`zod-${i}`}>
            <line x1={pInner.x} y1={pInner.y} x2={pOuter.x} y2={pOuter.y} stroke={INK3} strokeWidth={0.4} opacity={0.5} pointerEvents="none" />
            <g className={`svg-clickable${selectedId === 'cos-zodiac' ? ' selected' : ''}`}
              onClick={() => handleClick('cos-zodiac')}>
              <circle cx={p.x} cy={p.y} r={16} fill="transparent" stroke={INK3} strokeWidth={0.8} />
              <text x={p.x} y={p.y - 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={6} fill={INK3}>{za.sign}</text>
              <text x={p.x} y={p.y + 7} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={5} fill={INK3} fontStyle="italic">{za.name}</text>
            </g>
          </g>
        )
      })}

      {/* ═══════════════ PLANETARY SPHERES ═══════════════ */}
      {ornateRing(R_PLANETS, INK3, 1.8, 7, 6)}
      {ornateRing(R_PLANETS - 3, INK3, 0.5)}
      {planetaryArchons.map((pa, i) => {
        const p = rad(pa.angle, R_PLANETS)
        const pInner = rad(pa.angle, R_DEMIURGE + 5)
        const pOuter = rad(pa.angle, R_ZODIAC - 5)
        return (
          <g key={`planet-${i}`}>
            <line x1={pInner.x} y1={pInner.y} x2={pOuter.x} y2={pOuter.y} stroke={INK3} strokeWidth={0.5} opacity={0.4} pointerEvents="none" />
            <g className={`svg-clickable${selectedId === pa.id ? ' selected' : ''}`}
              onClick={() => handleClick(pa.id)}>
              <rect x={p.x - 36} y={p.y - 20} width={72} height={40}
                fill={selectedId === pa.id ? 'rgba(200,168,74,0.12)' : 'transparent'}
                stroke={selectedId === pa.id ? GOLD2 : INK3} strokeWidth={1} />
              <text x={p.x} y={p.y - 7} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7.5} fill={INK2}>{pa.planet}</text>
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">{pa.name.split(' [')[0]}</text>
              <text x={p.x} y={p.y + 14} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={4.5} fill={INK3} fontStyle="italic">[{pa.name.split(' [')[1]}</text>
            </g>
          </g>
        )
      })}

      {/* ═══════════════ DEMIURGE SPHERE ═══════════════ */}
      {ornateRing(R_DEMIURGE, '#5a3818', 2.5, 24, 4)}
      {ornateRing(R_DEMIURGE - 5, '#5a3818', 0.6)}
      {/* Demiurge label */}
      <g className={`svg-clickable${selectedId === 'cos-yaldabaoth' ? ' selected' : ''}`}
        onClick={() => handleClick('cos-yaldabaoth')}>
        <rect x={cx - 85} y={cy + R_DEMIURGE - 24} width={170} height={44}
          fill={selectedId === 'cos-yaldabaoth' ? 'rgba(200,168,74,0.12)' : 'rgba(90,56,24,0.06)'}
          stroke={selectedId === 'cos-yaldabaoth' ? GOLD2 : '#5a3818'} strokeWidth={1.2} />
        <text x={cx} y={cy + R_DEMIURGE - 4} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill="#5a3818" letterSpacing={2}>YALDABAOTH</text>
        <text x={cx} y={cy + R_DEMIURGE + 10} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7.5} fill="#5a3818" fontStyle="italic">[yal-dah-BAH-oth] — The Demiurge</text>
      </g>
      {/* Lion-face symbol for Yaldabaoth */}
      <g transform={`translate(${cx}, ${cy + R_DEMIURGE + 36})`} pointerEvents="none">
        <text textAnchor="middle" fontFamily="serif" fontSize={14} fill="#5a3818" opacity={0.5}>&#x1F981;</text>
      </g>

      {/* ═══════════════ BOUNDARY: LIMIT / STAUROS ═══════════════ */}
      {/* Double ring with flash — the boundary of the Pleroma */}
      {ornateRing(R_BOUNDARY, GOLD2, 2, 48, 3)}
      {ornateRing(R_BOUNDARY + 4, GOLD2, 0.6)}
      {ornateRing(R_BOUNDARY - 4, GOLD2, 0.6)}
      {/* Cross marks at cardinal points on the boundary */}
      {[0, 90, 180, 270].map(a => {
        const p = rad(a, R_BOUNDARY)
        return <SvgCross key={`bCross-${a}`} x={p.x} y={p.y} size={4} color={GOLD2} />
      })}
      {/* Stauros / Limit label */}
      <text x={cx - R_BOUNDARY - 10} y={cy - 10} textAnchor="end" fontFamily="Cinzel, serif" fontSize={9} fill={GOLD2} letterSpacing={1}>STAUROS [STOW-ros]</text>
      <text x={cx - R_BOUNDARY - 10} y={cy + 4} textAnchor="end" fontFamily="Libre Baskerville, serif" fontSize={7} fill={GOLD2} fontStyle="italic">The Cross / Limit of the Pleroma</text>
      {/* Sophia at the boundary */}
      <g className={`svg-clickable${selectedId === 'cos-sophia' ? ' selected' : ''}`}
        onClick={() => handleClick('cos-sophia')}>
        <rect x={cx - R_BOUNDARY - 10} y={cy + 12} width={170} height={38}
          fill={selectedId === 'cos-sophia' ? 'rgba(200,168,74,0.12)' : 'transparent'}
          stroke={selectedId === 'cos-sophia' ? GOLD2 : 'transparent'} strokeWidth={1} />
        <text x={cx - R_BOUNDARY + 75} y={cy + 30} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={GOLD2}>SOPHIA [so-FEE-ah]</text>
        <text x={cx - R_BOUNDARY + 75} y={cy + 43} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={GOLD2} fontStyle="italic">Wisdom — The Fallen Aeon</text>
      </g>

      {/* Pleroma region fill */}
      <circle cx={cx} cy={cy} r={R_BOUNDARY - 6} fill="url(#pleromaPattern)" pointerEvents="none" />

      {/* ═══════════════ TWELVE A EONS ═══════════════ */}
      {ornateRing(R_AEONS, GOLD2, 1.5, 12, 5)}
      {ornateRing(R_AEONS - 3, GOLD2, 0.5)}
      {twelveAeons.map((aeon, i) => {
        const p = rad(aeon.angle, R_AEONS)
        const pInner = rad(aeon.angle, R_LUMINARIES + 8)
        const pOuter = rad(aeon.angle, R_BOUNDARY - 8)
        return (
          <g key={`aeon-${i}`}>
            {/* Radial connector lines */}
            <line x1={pInner.x} y1={pInner.y} x2={p.x} y2={p.y} stroke={GOLD2} strokeWidth={0.4} opacity={0.4} pointerEvents="none" />
            <line x1={p.x} y1={p.y} x2={pOuter.x} y2={pOuter.y} stroke={GOLD2} strokeWidth={0.3} opacity={0.3} pointerEvents="none" />
            <g className={`svg-clickable${selectedId === 'cos-luminaries' ? ' selected' : ''}`}
              onClick={() => handleClick('cos-luminaries')}>
              <rect x={p.x - 34} y={p.y - 14} width={68} height={28}
                fill={selectedId === 'cos-luminaries' ? 'rgba(200,168,74,0.12)' : 'transparent'}
                stroke={selectedId === 'cos-luminaries' ? GOLD2 : GOLD2} strokeWidth={0.6} />
              <text x={p.x} y={p.y - 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={GOLD}>{aeon.name.split(' [')[0]}</text>
              <text x={p.x} y={p.y + 8} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={5} fill={GOLD2} fontStyle="italic">{aeon.name.split(' [')[1]?.replace(']', '') || ''}</text>
            </g>
          </g>
        )
      })}
      {/* Label: Twelve Aeons */}
      <text x={cx + R_AEONS + 14} y={cy + 4} fontFamily="Cinzel, serif" fontSize={8} fill={GOLD} letterSpacing={1}>THE TWELVE AEONS</text>
      <text x={cx + R_AEONS + 14} y={cy + 16} fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={GOLD2} fontStyle="italic">The Pleromic Fullness</text>

      {/* ═══════════════ FOUR LUMINARIES ═══════════════ */}
      {ornateRing(R_LUMINARIES, GOLD, 2, 24, 3)}
      {ornateRing(R_LUMINARIES - 3, GOLD, 0.5)}
      {hexagram(R_LUMINARIES, GOLD2, 0.6, 30)}
      {/* Sacred geometry: inner hexagram rotated */}
      {hexagram(R_LUMINARIES - 10, GOLD2, 0.4, 0)}
      {luminaries.map((lum, i) => {
        const p = rad(lum.angle, R_LUMINARIES)
        const pInner = rad(lum.angle, R_TRIAD + 8)
        return (
          <g key={`lum-${i}`}>
            {/* Connector line to triad */}
            <line x1={pInner.x} y1={pInner.y} x2={p.x} y2={p.y} stroke={GOLD} strokeWidth={0.6} opacity={0.5} pointerEvents="none" />
            <g className={`svg-clickable${selectedId === lum.id ? ' selected' : ''}`}
              onClick={() => handleClick(lum.id)}>
              <rect x={p.x - 48} y={p.y - 28} width={96} height={56}
                fill={selectedId === lum.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.04)'}
                stroke={selectedId === lum.id ? GOLD : GOLD2} strokeWidth={1.2} />
              {/* Luminary name */}
              <text x={p.x} y={p.y - 13} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={GOLD} letterSpacing={1}>{lum.name.split(' [')[0]}</text>
              <text x={p.x} y={p.y - 2} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={GOLD2} fontStyle="italic">{lum.name.split(' [')[1]?.replace(']', '') || ''}</text>
              {/* Sub-aeons */}
              {lum.subAeons.map((sa, j) => (
                <text key={j} x={p.x} y={p.y + 12 + j * 9} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={GOLD2}>&#x2022; {sa}</text>
              ))}
            </g>
          </g>
        )
      })}
      {/* Label */}
      <text x={cx - R_LUMINARIES - 10} y={cy + 4} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={GOLD} letterSpacing={1}>FOUR LUMINARIES</text>
      <text x={cx - R_LUMINARIES - 10} y={cy + 16} textAnchor="end" fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={GOLD2} fontStyle="italic">Guardians of the Pleroma</text>

      {/* ═══════════════ DIVINE TRIAD ═══════════════ */}
      {ornateRing(R_TRIAD, GOLD, 2.5, 12, 3)}
      {ornateRing(R_TRIAD - 4, GOLD3, 0.8)}
      {/* Divine glow */}
      <circle cx={cx} cy={cy} r={R_TRIAD} fill="url(#divineGlow)" pointerEvents="none" />
      {/* Triangular arrangement of the Triad */}
      <g className={`svg-clickable${selectedId === 'cos-triad' ? ' selected' : ''}`}
        onClick={() => handleClick('cos-triad')}>
        {/* Triangle connecting the three persons */}
        <polygon
          points={`${cx},${cy - 42} ${cx - 40},${cy + 24} ${cx + 40},${cy + 24}`}
          fill="none" stroke={GOLD} strokeWidth={1.5} pointerEvents="none" />
        {/* Father */}
        <text x={cx} y={cy - 48} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK} letterSpacing={3}>FATHER</text>
        <text x={cx} y={cy - 36} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={GOLD} fontStyle="italic">The Invisible Spirit</text>
        {/* Barbelo / Mother */}
        <text x={cx - 44} y={cy + 36} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK} letterSpacing={1}>BARBELO</text>
        <text x={cx - 44} y={cy + 48} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={GOLD} fontStyle="italic">[bar-BEH-loh] Mother</text>
        {/* Autogenes / Child */}
        <text x={cx + 44} y={cy + 36} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK} letterSpacing={1}>AUTOGENES</text>
        <text x={cx + 44} y={cy + 48} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={GOLD} fontStyle="italic">[aw-TOJ-en-eez] Child</text>
      </g>

      {/* ═══════════════ THE ONE ═══════════════ */}
      <g className={`svg-clickable${selectedId === 'cos-one' ? ' selected' : ''}`}
        onClick={() => handleClick('cos-one')}>
        <circle cx={cx} cy={cy} r={R_ONE} fill={INK} stroke={GOLD3} strokeWidth={3}
          style={{ filter: 'drop-shadow(0 0 10px rgba(232,192,112,0.7))' }} />
        {/* Inner radiating lines */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5) * Math.PI / 180
          return <line key={`ray-${i}`} x1={cx + Math.cos(a) * 8} y1={cy + Math.sin(a) * 8} x2={cx + Math.cos(a) * 24} y2={cy + Math.sin(a) * 24} stroke={GOLD3} strokeWidth={0.8} opacity={0.7} pointerEvents="none" />
        })}
        <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={GOLD3} letterSpacing={2}>ONE</text>
      </g>

      {/* ═══════════════ DESCENT / ASCENT PATHS ═══════════════ */}
      {/* Sophia's descent path (dashed, going down from boundary) */}
      <g pointerEvents="none">
        <path d={`M${cx + 50} ${cy - R_BOUNDARY + 10} Q${cx + 60} ${cy - R_DEMIURGE + 30} ${cx + 30} ${cy + R_DEMIURGE - 25}`}
          fill="none" stroke="#5a3818" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.6} />
        <text x={cx + 65} y={cy - R_DEMIURGE + 10} fontFamily="Libre Baskerville, serif" fontSize={5} fill="#5a3818" fontStyle="italic" transform={`rotate(-75, ${cx + 65}, ${cy - R_DEMIURGE + 10})`}>Sophia&apos;s Descent</text>
      </g>
      {/* Christ's redemptive descent/ascent (solid gold, going up) */}
      <g pointerEvents="none">
        <path d={`M${cx - 50} ${cy + R_DEMIURGE - 25} Q${cx - 60} ${cy - R_DEMIURGE + 30} ${cx - 30} ${cy - R_BOUNDARY + 10}`}
          fill="none" stroke={GOLD2} strokeWidth={1.2} opacity={0.7} />
        {/* Arrow at top */}
        <polygon points={`${cx - 30},${cy - R_BOUNDARY + 10} ${cx - 35},${cy - R_BOUNDARY + 18} ${cx - 25},${cy - R_BOUNDARY + 18}`} fill={GOLD2} opacity={0.7} />
        <text x={cx - 72} y={cy - R_DEMIURGE + 10} fontFamily="Libre Baskerville, serif" fontSize={5} fill={GOLD2} fontStyle="italic" transform={`rotate(75, ${cx - 72}, ${cy - R_DEMIURGE + 10})`}>Christ&apos;s Ascent</text>
      </g>

      {/* ═══════════════ SIDE ANNOTATIONS ═══════════════ */}
      {/* Left: Pleroma label with bracket */}
      <g pointerEvents="none">
        <line x1={36} y1={cy - R_BOUNDARY + 24} x2={36} y2={cy + R_BOUNDARY - 24} stroke={GOLD2} strokeWidth={1.2} />
        <line x1={36} y1={cy - R_BOUNDARY + 24} x2={48} y2={cy - R_BOUNDARY + 24} stroke={GOLD2} strokeWidth={1.2} />
        <line x1={36} y1={cy + R_BOUNDARY - 24} x2={48} y2={cy + R_BOUNDARY - 24} stroke={GOLD2} strokeWidth={1.2} />
        <text x={28} y={cy} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={GOLD2} letterSpacing={4}
          transform={`rotate(-90, 28, ${cy})`}>PLEROMA</text>
        <text x={52} y={cy + R_BOUNDARY - 44} fontFamily="Libre Baskerville, serif" fontSize={7} fill={GOLD2} fontStyle="italic">[ple-ROH-mah] — Fullness</text>
      </g>

      {/* Right: Kenoma label with bracket */}
      <g pointerEvents="none">
        <line x1={W - 36} y1={cy - R_KENOMA + 24} x2={W - 36} y2={cy + R_KENOMA - 24} stroke={INK3} strokeWidth={1.2} />
        <line x1={W - 36} y1={cy - R_KENOMA + 24} x2={W - 48} y2={cy - R_KENOMA + 24} stroke={INK3} strokeWidth={1.2} />
        <line x1={W - 36} y1={cy + R_KENOMA - 24} x2={W - 48} y2={cy + R_KENOMA - 24} stroke={INK3} strokeWidth={1.2} />
        <text x={W - 28} y={cy} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK3} letterSpacing={4}
          transform={`rotate(90, ${W - 28}, ${cy})`}>KENOMA</text>
      </g>

      {/* ═══════════════ SACRED NAMES RING (between Demiurge & Planets) ═══════════════ */}
      {/* Seven sacred vowels inscribed between Demiurge and Planets */}
      {['A', 'E', 'I', 'O', 'U', 'O', 'S'].map((v, i) => {
        const a = (i * 360 / 7 + 90) * Math.PI / 180
        const vx = cx + Math.cos(a) * (R_DEMIURGE + 20), vy = cy + Math.sin(a) * (R_DEMIURGE + 20)
        return (
          <g key={`vowel-${i}`} pointerEvents="none">
            <circle cx={vx} cy={vy} r={9} fill="none" stroke={INK3} strokeWidth={0.8} />
            <text x={vx} y={vy + 3.5} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK3}>{v}</text>
          </g>
        )
      })}

      {/* ═══════════════ CORNER DECORATIONS ═══════════════ */}
      {/* Top-left corner ornament */}
      <g pointerEvents="none">
        <path d={`M12 80 L12 66 Q12 60 18 60 L30 60`} fill="none" stroke={GOLD2} strokeWidth={1.2} />
        <path d={`M18 80 L18 70 Q18 64 24 64 L30 64`} fill="none" stroke={GOLD2} strokeWidth={0.7} />
        <circle cx={21} cy={70} r={3} fill={GOLD2} />
      </g>
      {/* Top-right corner ornament */}
      <g pointerEvents="none">
        <path d={`M${W - 12} 80 L${W - 12} 66 Q${W - 12} 60 ${W - 18} 60 L${W - 30} 60`} fill="none" stroke={GOLD2} strokeWidth={1.2} />
        <path d={`M${W - 18} 80 L${W - 18} 70 Q${W - 18} 64 ${W - 24} 64 L${W - 30} 64`} fill="none" stroke={GOLD2} strokeWidth={0.7} />
        <circle cx={W - 21} cy={70} r={3} fill={GOLD2} />
      </g>
      {/* Bottom-left corner ornament */}
      <g pointerEvents="none">
        <path d={`M12 ${H - 80} L12 ${H - 66} Q12 ${H - 60} 18 ${H - 60} L30 ${H - 60}`} fill="none" stroke={GOLD2} strokeWidth={1.2} />
        <circle cx={21} cy={H - 70} r={3} fill={GOLD2} />
      </g>
      {/* Bottom-right corner ornament */}
      <g pointerEvents="none">
        <path d={`M${W - 12} ${H - 80} L${W - 12} ${H - 66} Q${W - 12} ${H - 60} ${W - 18} ${H - 60} L${W - 30} ${H - 60}`} fill="none" stroke={GOLD2} strokeWidth={1.2} />
        <circle cx={W - 21} cy={H - 70} r={3} fill={GOLD2} />
      </g>

      {/* ═══════════════ BOTTOM LEGEND ═══════════════ */}
      <g pointerEvents="none">
        <line x1={70} y1={H - 80} x2={W - 70} y2={H - 80} stroke={GOLD2} strokeWidth={0.6} />
        {/* Pleroma indicator */}
        <circle cx={120} cy={H - 58} r={5} fill="none" stroke={GOLD2} strokeWidth={1.5} />
        <text x={132} y={H - 54} fontFamily="Libre Baskerville, serif" fontSize={8} fill={GOLD2}>Pleroma (Divine Fullness)</text>
        {/* Kenoma indicator */}
        <circle cx={380} cy={H - 58} r={5} fill="none" stroke={INK3} strokeWidth={1.5} />
        <text x={392} y={H - 54} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3}>Kenoma (Deficiency / Material)</text>
        {/* Ascent path indicator */}
        <line x1={630} y1={H - 62} x2={660} y2={H - 54} stroke={GOLD2} strokeWidth={1.5} />
        <text x={668} y={H - 54} fontFamily="Libre Baskerville, serif" fontSize={8} fill={GOLD2}>Path of Ascent</text>
        {/* Descent path indicator */}
        <line x1={830} y1={H - 62} x2={860} y2={H - 54} stroke="#5a3818" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={868} y={H - 54} fontFamily="Libre Baskerville, serif" fontSize={8} fill="#5a3818">Path of Descent</text>
        {/* Constellation indicator */}
        <circle cx={120} cy={H - 38} r={2} fill={INK3} opacity={0.7} />
        <circle cx={120} cy={H - 38} r={1} fill={PARCH} opacity={0.9} />
        <line x1={120} y1={H - 38} x2={135} y2={H - 42} stroke={INK3} strokeWidth={0.7} opacity={0.45} />
        <circle cx={135} cy={H - 42} r={2} fill={INK3} opacity={0.7} />
        <text x={144} y={H - 36} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3}>Constellations of the Material Heavens</text>
      </g>
      {/* Source note */}
      <text x={cx} y={H - 14} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6.5} fill={INK3} fontStyle="italic">
        Based on the cosmology of the Apocryphon of John, the Book of Jeu, and the Untitled Text (Codex Brucianus)
      </text>

      {/* ═══════════════ INTERMEDIATE DECORATIVE RINGS ═══════════════ */}
      {/* Faint ring between luminaries and aeons for visual depth */}
      {ornateRing((R_LUMINARIES + R_AEONS) / 2, GOLD2, 0.3, 0, 0, '1 4')}
      {/* Faint ring between aeons and boundary */}
      {ornateRing((R_AEONS + R_BOUNDARY) / 2, GOLD2, 0.3, 0, 0, '1 6')}

      {/* ═══════════════ SIXTY TREASURIES INDICATOR ═══════════════ */}
      {/* Small dots around the aeon ring representing the 60 treasuries */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i * 6) * Math.PI / 180
        const tr = R_AEONS + 20
        return <circle key={`tDot-${i}`} cx={cx + Math.cos(a) * tr} cy={cy + Math.sin(a) * tr} r={1.2} fill={GOLD2} opacity={0.5} pointerEvents="none" />
      })}
      <text x={cx + R_AEONS + 28} y={cy + 38} fontFamily="Libre Baskerville, serif" fontSize={6} fill={GOLD2} fontStyle="italic" pointerEvents="none">&#x2022; 60 Treasuries of Light</text>

      {/* ═══════════════ FIVE RANKS INDICATOR ═══════════════ */}
      {[1, 2, 3, 4, 5].map(rank => {
        const rAngle = (rank * 72 - 90) * Math.PI / 180
        const rR = R_TRIAD + 28
        return (
          <g key={`rank-${rank}`} pointerEvents="none">
            <circle cx={cx + Math.cos(rAngle) * rR} cy={cy + Math.sin(rAngle) * rR} r={4} fill="none" stroke={GOLD3} strokeWidth={0.8} />
            <text x={cx + Math.cos(rAngle) * (rR + 14)} y={cy + Math.sin(rAngle) * (rR + 14) + 3} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={5} fill={GOLD3}>Rank {rank}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Ascent Diagram (for Rite of Ascent, Zostrianos) ── */
function AscentDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  const stations = [
    { id: 'as-gate1', y: 430, label: 'Gate of the Aeons' },
    { id: 'as-gate2', y: 340, label: 'Gate of the Sphere' },
    { id: 'as-gate3', y: 250, label: 'Gate of the Midst' },
    { id: 'as-treasuries', y: 160, label: 'The Sixty Treasuries' },
    { id: 'as-curtains', y: 80, label: 'The Three Curtains' }
  ]
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK} letterSpacing={2}>THE PATH OF ASCENT</text>
      {/* Central path */}
      <line x1={cx} y1={460} x2={cx} y2={50} stroke={GOLD2} strokeWidth={2} pointerEvents="none" />
      {stations.map((s, i) => {
        const el = elements.find(e => e.id === s.id)
        return (
          <g key={i}>
            <rect x={cx - 90} y={s.y - 18} width={180} height={36}
              fill={selectedId === s.id ? 'rgba(200,168,74,0.15)' : 'transparent'}
              stroke={selectedId === s.id ? GOLD2 : INK3} strokeWidth={1.5}
              className="svg-clickable"
              onClick={() => { if (el) onClick(s.id, el.label, el.detail) }} />
            <text x={cx} y={s.y + 4} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={INK2}>{s.label}</text>
            {i < stations.length - 1 && <path d={`M${cx} ${s.y - 22} L${cx - 4} ${s.y - 14} M${cx} ${s.y - 22} L${cx + 4} ${s.y - 14}`} stroke={GOLD2} strokeWidth={1.5} pointerEvents="none" />}
          </g>
        )
      })}
      {/* Treasury at top */}
      <circle cx={cx} cy={50} r={20} fill={INK} stroke={GOLD3} strokeWidth={2} pointerEvents="none" />
      <text x={cx} y={53} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={6} fill={GOLD3}>TREASURY</text>
      {/* Material world at bottom */}
      <text x={cx} y={475} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK3} letterSpacing={1}>MATERIAL WORLD</text>
    </svg>
  )
}

/* ── Liturgy Diagram ── */
function LiturgyDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK} letterSpacing={2}>THE SACRED LITURGY</text>
      <rect x={60} y={45} width={380} height={420} fill="none" stroke={INK3} strokeWidth={1.5} pointerEvents="none" />
      <rect x={68} y={53} width={364} height={404} fill="none" stroke={GOLD2} strokeWidth={0.8} pointerEvents="none" />
      {elements.map((el, i) => {
        const y = 80 + i * 70
        return (
          <g key={i}>
            <rect x={85} y={y} width={330} height={55}
              fill={selectedId === el.id ? 'rgba(200,168,74,0.1)' : 'transparent'}
              stroke={selectedId === el.id ? GOLD2 : INK3} strokeWidth={1.5}
              className="svg-clickable"
              onClick={() => onClick(el.id, el.label, el.detail)} />
            <text x={250} y={y + 20} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK2}>{el.label}</text>
            <text x={250} y={y + 38} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">{el.brief}</text>
            <SvgCross x={95} y={y + 25} size={5} color={GOLD2} />
            <SvgCross x={405} y={y + 25} size={5} color={GOLD2} />
          </g>
        )
      })}
    </svg>
  )
}

/* ── Hymn Diagram ── */
function HymnDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK} letterSpacing={2}>THE SACRED HYMN</text>
      <rect x={70} y={50} width={360} height={410} fill="none" stroke={INK3} strokeWidth={1.5} pointerEvents="none" />
      <rect x={78} y={58} width={344} height={394} fill="none" stroke={GOLD2} strokeWidth={0.8} pointerEvents="none" />
      {elements.map((el, i) => {
        const y = 80 + i * 75
        return (
          <g key={i}>
            <rect x={95} y={y} width={310} height={60}
              fill={selectedId === el.id ? 'rgba(200,168,74,0.1)' : 'transparent'}
              stroke={selectedId === el.id ? GOLD2 : INK3} strokeWidth={1.5}
              className="svg-clickable"
              onClick={() => onClick(el.id, el.label, el.detail)} />
            <text x={250} y={y + 22} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={11} fill={INK2}>{el.label}</text>
            <text x={250} y={y + 42} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">{el.brief}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Steles Diagram (for Three Steles of Seth) ── */
function StelesDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={250} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK} letterSpacing={2}>THE THREE STELES</text>
      {elements.map((el, i) => {
        const sx = 80 + i * 150, sw = 110, sh = 380, sy = 70
        return (
          <g key={i}>
            {/* Stele shape - rounded top pillar */}
            <path d={`M${sx} ${sy + 40} L${sx} ${sy + sh} L${sx + sw} ${sy + sh} L${sx + sw} ${sy + 40} Q${sx + sw} ${sy} ${sx + sw/2} ${sy} Q${sx} ${sy} ${sx} ${sy + 40}Z`}
              fill={selectedId === el.id ? 'rgba(200,168,74,0.1)' : 'transparent'}
              stroke={selectedId === el.id ? GOLD2 : INK} strokeWidth={2}
              className="svg-clickable"
              onClick={() => onClick(el.id, el.label, el.detail)} />
            <text x={sx + sw/2} y={sy + 60} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={INK2}>{el.label}</text>
            <text x={sx + sw/2} y={sy + 80} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">{el.brief}</text>
            {/* Cross decoration */}
            <SvgCross x={sx + sw/2} y={sy + 120} size={8} color={GOLD2} />
          </g>
        )
      })}
    </svg>
  )
}

/* ── Names Diagram ── */
function NamesDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250, cy = 250
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK} letterSpacing={2}>THE SACRED NAMES</text>
      <circle cx={cx} cy={cy} r={200} fill="none" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      {elements.map((el, i) => {
        const angle = (i * 360 / elements.length - 90) * Math.PI / 180
        const ex = cx + Math.cos(angle) * 160, ey = cy + Math.sin(angle) * 160
        return (
          <g key={i}>
            <circle cx={ex} cy={ey} r={22} fill={PARCH} stroke={selectedId === el.id ? GOLD2 : INK3} strokeWidth={1.5}
              className="svg-clickable"
              onClick={() => onClick(el.id, el.label, el.detail)} />
            <text x={ex} y={ey + 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK2}>{el.label.substring(0, 12)}</text>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={INK3} strokeWidth={0.3} pointerEvents="none" />
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={30} fill={INK} stroke={GOLD3} strokeWidth={2} pointerEvents="none" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={6} fill={GOLD3}>SACRED</text>
    </svg>
  )
}

/* ── Dialogue Diagram ── */
function DialogueDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK} letterSpacing={2}>THE SACRED DIALOGUE</text>
      {elements.map((el, i) => {
        const y = 60 + i * 100
        const isLeft = i % 2 === 0
        return (
          <g key={i}>
            <rect x={isLeft ? 40 : 120} y={y} width={340} height={75}
              fill={selectedId === el.id ? 'rgba(200,168,74,0.1)' : 'transparent'}
              stroke={selectedId === el.id ? GOLD2 : INK3} strokeWidth={1.5}
              className="svg-clickable"
              onClick={() => onClick(el.id, el.label, el.detail)} />
            <text x={isLeft ? 55 : 135} y={y + 25} fontFamily="Cinzel, serif" fontSize={11} fill={INK2}>{el.label}</text>
            <text x={isLeft ? 55 : 135} y={y + 45} fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">{el.brief}</text>
            <SvgCross x={isLeft ? 370 : 50} y={y + 35} size={5} color={GOLD2} />
          </g>
        )
      })}
    </svg>
  )
}

/* ── Three Spaces Diagram ── */
function ThreeSpacesDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 400, cy = 340
  const R1 = 55, R2 = 155, R3 = 280
  return (
    <svg viewBox="0 0 800 700" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={3}>THE THREE SPACES</text>

      {/* Third Space - Kenoma - outermost */}
      <circle cx={cx} cy={cy} r={R3} fill="rgba(60,40,20,0.08)" stroke={INK3} strokeWidth={2} className="svg-clickable" onClick={() => onClick('sp-third', 'The Third Space', elements.find(e => e.id === 'sp-third')?.detail || '')} />
      <text x={cx} y={cy - R3 + 22} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={INK2} letterSpacing={2}>THIRD SPACE</text>
      <text x={cx} y={cy - R3 + 36} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">The Kenoma — Deficiency</text>

      {/* 7 planetary circles */}
      {['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'].map((p, i) => {
        const a = (i * 51.4 - 90) * Math.PI / 180
        const pr = R3 - 50
        return <g key={i}>
          <circle cx={cx + Math.cos(a) * pr} cy={cy + Math.sin(a) * pr} r={14} fill="rgba(100,70,30,0.1)" stroke={INK3} strokeWidth={1} />
          <text x={cx + Math.cos(a) * pr} y={cy + Math.sin(a) * pr + 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={6} fill={INK3}>{p}</text>
        </g>
      })}

      {/* 12 zodiac marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180
        const zr = R3 - 15
        return <circle key={`z${i}`} cx={cx + Math.cos(a) * zr} cy={cy + Math.sin(a) * zr} r={3} fill={INK3} />
      })}

      {/* Archon Gates between 3rd and Middle */}
      <circle cx={cx} cy={cy} r={R2 + 22} fill="none" stroke={GOLD2} strokeWidth={1.5} strokeDasharray="6 3" pointerEvents="none" />
      {elements.filter(e => e.id.startsWith('sm-gate') || e.id === 'sp-boundary-32').map((el, i) => {
        const a = (-90 + i * 120) * Math.PI / 180
        const gr = R2 + 22
        return <g key={el.id}>
          <rect x={cx + Math.cos(a) * gr - 30} y={cy + Math.sin(a) * gr - 12} width={60} height={24}
            fill={selectedId === el.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.06)'}
            stroke={selectedId === el.id ? GOLD3 : GOLD} strokeWidth={1.5}
            className="svg-clickable" onClick={() => onClick(el.id, el.label, el.detail)} />
          <text x={cx + Math.cos(a) * gr} y={cy + Math.sin(a) * gr + 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={GOLD2}>{el.label.substring(0, 14)}</text>
        </g>
      })}

      {/* Middle Space - Pleroma */}
      <circle cx={cx} cy={cy} r={R2} fill="rgba(200,168,74,0.06)" stroke={GOLD2} strokeWidth={2} className="svg-clickable" onClick={() => onClick('sp-middle', 'The Middle Space', elements.find(e => e.id === 'sp-middle')?.detail || '')} />
      <text x={cx} y={cy - R2 + 22} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={INK2} letterSpacing={2}>MIDDLE SPACE</text>
      <text x={cx} y={cy - R2 + 36} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">The Pleroma — Fullness</text>

      {/* 3 Curtains */}
      {[90, 130].map((cr, ci) => (
        <circle key={`cur${ci}`} cx={cx} cy={cy} r={cr} fill="none" stroke={GOLD3} strokeWidth={0.5} strokeDasharray="3 5" pointerEvents="none" />
      ))}

      {/* 60 treasury dots */}
      {Array.from({ length: 60 }, (_, i) => {
        const ring = Math.floor(i / 12)
        const idx = i % 12
        const rByRing = [75, 95, 115, 135, 148][ring]
        const a = (idx * 30 - 90 + ring * 6) * Math.PI / 180
        return <circle key={`t${i}`} cx={cx + Math.cos(a) * rByRing} cy={cy + Math.sin(a) * rByRing} r={2} fill={GOLD2} />
      })}

      {/* First Space - Ineffable */}
      <circle cx={cx} cy={cy} r={R1} fill="rgba(232,192,112,0.15)" stroke={GOLD3} strokeWidth={2.5} className="svg-clickable" onClick={() => onClick('sp-ineffable', 'The First Space', elements.find(e => e.id === 'sp-ineffable')?.detail || '')} />
      <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK} letterSpacing={1}>FIRST SPACE</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK2} fontStyle="italic">The Ineffable</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3}>"Space of Spaces"</text>

      {/* Ineffable Mystery boundary */}
      <circle cx={cx} cy={cy} r={R1 + 8} fill="none" stroke={GOLD3} strokeWidth={0.7} strokeDasharray="2 4" pointerEvents="none" />
      {elements.filter(e => e.id === 'sp-boundary-21').map(el => (
        <g key={el.id}>
          <rect x={cx - 45} y={cy + R1 + 14} width={90} height={18}
            fill={selectedId === el.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.06)'}
            stroke={selectedId === el.id ? GOLD3 : GOLD} strokeWidth={1}
            className="svg-clickable" onClick={() => onClick(el.id, el.label, el.detail)} />
          <text x={cx} y={cy + R1 + 26} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={6} fill={GOLD2}>{el.label}</text>
        </g>
      ))}

      {/* Light gradient arrows */}
      <line x1={cx + R3 + 15} y1={cy} x2={cx + R3 + 50} y2={cy} stroke={INK3} strokeWidth={1} markerEnd="url(#arrow)" pointerEvents="none" />
      <text x={cx + R3 + 55} y={cy - 8} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">Darkness</text>
      <line x1={cx - R1 - 15} y1={cy} x2={cx - R1 - 50} y2={cy} stroke={GOLD3} strokeWidth={1} markerEnd="url(#arrowL)" pointerEvents="none" />
      <text x={cx - R1 - 55} y={cy - 8} fontFamily="Libre Baskerville, serif" fontSize={7} fill={GOLD2} fontStyle="italic" textAnchor="end">Light</text>

      <defs>
        <marker id="arrow" markerWidth={6} markerHeight={4} refX={6} refY={2} orient="auto"><path d="M0,0 L6,2 L0,4" fill={INK3} /></marker>
        <marker id="arrowL" markerWidth={6} markerHeight={4} refX={6} refY={2} orient="auto"><path d="M0,0 L6,2 L0,4" fill={GOLD3} /></marker>
      </defs>
    </svg>
  )
}

/* ── Emanation Tree Diagram ── */
function EmanationTreeDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const levels = [
    { id: 'et-ineffable', label: 'THE INEFFABLE', sub: 'Unnamable One', color: GOLD3, y: 60 },
    { id: 'et-invisible', label: 'GREAT INVISIBLE SPIRIT', sub: 'First Emanation', color: GOLD3, y: 155 },
    { id: 'et-jeu', label: 'JEU THE TRUE GOD', sub: 'Lord of Treasuries', color: GOLD2, y: 250 },
    { id: 'et-luminaries', label: 'FOUR LUMINARIES', sub: 'Harmozel · Oroiael · Daveithai · Eleleth', color: GOLD2, y: 345 },
    { id: 'et-aeons', label: 'TWELVE AEONS', sub: '3 per Luminary', color: GOLD, y: 440 },
    { id: 'et-fathers', label: 'SIXTY FATHERS', sub: 'Presiders of the Treasuries', color: GOLD, y: 535 },
    { id: 'et-watchers', label: '180 WATCHERS', sub: '3 per Treasury', color: INK3, y: 625 },
  ]
  const cx = 350
  return (
    <svg viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={3}>THE EMANATION TREE</text>
      <text x={cx} y={44} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">From the Ineffable to the Watchers — each level emanates the next</text>

      {levels.map((lv, i) => {
        const w = 160 + (i >= 3 ? i * 30 : 0)
        const isSelected = selectedId === lv.id
        const el = elements.find(e => e.id === lv.id)
        return <g key={lv.id}>
          {/* Connector line */}
          {i > 0 && <line x1={cx} y1={levels[i - 1].y + 28} x2={cx} y2={lv.y - 18} stroke={GOLD} strokeWidth={0.8} strokeDasharray="4 3" pointerEvents="none" />}
          {/* Contemplation arrow */}
          {i > 0 && <text x={cx + 6} y={(levels[i - 1].y + 28 + lv.y - 18) / 2} fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic" transform={`rotate(-90, ${cx + 14}, ${(levels[i - 1].y + 28 + lv.y - 18) / 2})`}>contemplates</text>}

          {/* Node box */}
          <rect x={cx - w / 2} y={lv.y - 16} width={w} height={42}
            fill={isSelected ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.04)'}
            stroke={isSelected ? GOLD3 : lv.color} strokeWidth={isSelected ? 2 : 1.2}
            className="svg-clickable" onClick={() => onClick(lv.id, lv.label, el?.detail || '')} />
          <text x={cx} y={lv.y + 2} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK} letterSpacing={1}>{lv.label}</text>
          <text x={cx} y={lv.y + 16} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">{lv.sub}</text>

          {/* Count badge for multi-beings */}
          {i >= 3 && <circle cx={cx + w / 2 + 14} cy={lv.y + 5} r={10} fill={lv.color} stroke={INK} strokeWidth={0.5} pointerEvents="none" />}
          {i === 3 && <text x={cx + w / 2 + 14} y={lv.y + 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={PARCH}>4</text>}
          {i === 4 && <text x={cx + w / 2 + 14} y={lv.y + 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={PARCH}>12</text>}
          {i === 5 && <text x={cx + w / 2 + 14} y={lv.y + 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={6} fill={PARCH}>60</text>}
          {i === 6 && <text x={cx + w / 2 + 14} y={lv.y + 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={5} fill={PARCH}>180</text>}
        </g>
      })}

      {/* Receivers side branch */}
      {elements.filter(e => e.id === 'et-receivers').map(el => {
        const ry = 535
        return <g key={el.id}>
          <line x1={cx + 120} y1={ry} x2={cx + 180} y2={ry} stroke={GOLD} strokeWidth={0.8} strokeDasharray="4 3" pointerEvents="none" />
          <rect x={cx + 182} y={ry - 14} width={120} height={36}
            fill={selectedId === el.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.04)'}
            stroke={selectedId === el.id ? GOLD3 : GOLD} strokeWidth={1.2}
            className="svg-clickable" onClick={() => onClick(el.id, el.label, el.detail)} />
          <text x={cx + 242} y={ry + 2} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK} letterSpacing={1}>RECEIVERS</text>
          <text x={cx + 242} y={ry + 14} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">Guides of Ascent</text>
        </g>
      })}

      {/* Direction arrow on left */}
      <line x1={40} y1={640} x2={40} y2={60} stroke={GOLD2} strokeWidth={1.5} markerEnd="url(#ascArrow)" pointerEvents="none" />
      <text x={28} y={350} fontFamily="Cinzel, serif" fontSize={8} fill={GOLD2} letterSpacing={2} transform="rotate(-90, 28, 350)">ASCENT</text>
      <line x1={55} y1={60} x2={55} y2={640} stroke={INK3} strokeWidth={1} markerEnd="url(#descArrow)" pointerEvents="none" />
      <text x={68} y={350} fontFamily="Cinzel, serif" fontSize={7} fill={INK3} letterSpacing={1} transform="rotate(90, 68, 350)">EMANATION</text>

      <defs>
        <marker id="ascArrow" markerWidth={8} markerHeight={6} refX={4} refY={3} orient="auto"><path d="M0,6 L4,0 L8,6" fill={GOLD2} /></marker>
        <marker id="descArrow" markerWidth={8} markerHeight={6} refX={4} refY={3} orient="auto"><path d="M0,6 L4,0 L8,6" fill={INK3} /></marker>
      </defs>
    </svg>
  )
}

/* ── Jeu Figure Diagram ── */
function JeuFigureDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250, cy = 250
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK} letterSpacing={3}>JEU THE TRUE GOD</text>

      {/* Outer radiance */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15) * Math.PI / 180
        return <line key={`r${i}`} x1={cx + Math.cos(a) * 120} y1={cy + Math.sin(a) * 120} x2={cx + Math.cos(a) * 200} y2={cy + Math.sin(a) * 200} stroke={GOLD3} strokeWidth={0.4} pointerEvents="none" />
      })}

      {/* Treasury rings */}
      <circle cx={cx} cy={cy} r={180} fill="none" stroke={GOLD} strokeWidth={1} strokeDasharray="4 6" pointerEvents="none" />
      <circle cx={cx} cy={cy} r={140} fill="none" stroke={GOLD} strokeWidth={0.8} strokeDasharray="3 5" pointerEvents="none" />
      <circle cx={cx} cy={cy} r={100} fill="none" stroke={GOLD} strokeWidth={0.6} strokeDasharray="2 4" pointerEvents="none" />
      <text x={cx} y={cy - 185} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={6} fill={GOLD} letterSpacing={1}>60 TREASURIES OF LIGHT</text>

      {/* Central figure */}
      <circle cx={cx} cy={cy} r={60} fill="rgba(232,192,112,0.12)" stroke={GOLD3} strokeWidth={2.5} className="svg-clickable" onClick={() => onClick('jtg-name', 'The Name "Jeu"', elements.find(e => e.id === 'jtg-name')?.detail || '')} />
      <text x={cx} y={cy - 10} textAnchor="middle" fontFamily="Cinzel Decorative, serif" fontSize={18} fill={INK}>JEU</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK2} letterSpacing={2}>TRUE GOD</text>
      <text x={cx} y={cy + 25} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">The True Man</text>

      {/* Element boxes */}
      {elements.filter(e => e.id !== 'jtg-name').map((el, i) => {
        const positions = [
          { x: cx - 210, y: cy - 100 },
          { x: cx + 110, y: cy - 100 },
          { x: cx - 210, y: cy + 60 },
        ]
        const pos = positions[i]
        if (!pos) return null
        return <g key={el.id}>
          <rect x={pos.x} y={pos.y} width={100} height={50}
            fill={selectedId === el.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.04)'}
            stroke={selectedId === el.id ? GOLD3 : GOLD} strokeWidth={1.2}
            className="svg-clickable" onClick={() => onClick(el.id, el.label, el.detail)} />
          <text x={pos.x + 50} y={pos.y + 20} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK} letterSpacing={0.5}>{el.label}</text>
          <text x={pos.x + 50} y={pos.y + 35} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">{el.brief}</text>
        </g>
      })}

      {/* Connecting lines */}
      <line x1={cx - 110} y1={cy - 75} x2={cx - 60} y2={cy - 30} stroke={GOLD} strokeWidth={0.5} pointerEvents="none" />
      <line x1={cx + 110} y1={cy - 75} x2={cx + 60} y2={cy - 30} stroke={GOLD} strokeWidth={0.5} pointerEvents="none" />
      <line x1={cx - 110} y1={cy + 85} x2={cx - 60} y2={cy + 30} stroke={GOLD} strokeWidth={0.5} pointerEvents="none" />
    </svg>
  )
}

/* ── Virgin of Light Diagram ── */
function VirginOfLightDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 350, cy = 320
  const VIRGIN_NAMES = ['Armothes', 'Eileithya', 'Barpharanghes', 'Opsimothe', 'Chthaeth', 'Marept', 'Pharphaxoth']
  return (
    <svg viewBox="0 0 700 650" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK} letterSpacing={3}>THE VIRGIN OF LIGHT</text>

      {/* Third Space below */}
      <rect x={50} y={460} width={600} height={80} fill="rgba(60,40,20,0.06)" stroke={INK3} strokeWidth={1} pointerEvents="none" />
      <text x={cx} y={490} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK3} letterSpacing={2}>THIRD SPACE</text>
      <text x={cx} y={510} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">Souls descend into incarnation</text>
      {/* Downward arrows */}
      <line x1={cx - 50} y1={430} x2={cx - 50} y2={455} stroke={INK3} strokeWidth={1} markerEnd="url(#downArr)" pointerEvents="none" />
      <line x1={cx + 50} y1={430} x2={cx + 50} y2={455} stroke={INK3} strokeWidth={1} markerEnd="url(#downArr)" pointerEvents="none" />
      <text x={cx} y={448} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">distributes</text>

      {/* Upward arrows */}
      <line x1={cx - 30} y1={455} x2={cx - 30} y2={430} stroke={GOLD2} strokeWidth={1} markerEnd="url(#upArr)" pointerEvents="none" />
      <line x1={cx + 30} y1={455} x2={cx + 30} y2={430} stroke={GOLD2} strokeWidth={1} markerEnd="url(#upArr)" pointerEvents="none" />
      <text x={cx} y={425} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={GOLD2} fontStyle="italic">receives</text>

      {/* Virgin central figure */}
      <circle cx={cx} cy={cy} r={80} fill="rgba(232,192,112,0.1)" stroke={GOLD3} strokeWidth={2} className="svg-clickable" onClick={() => onClick('vol-mediator', 'Mediator Between Spaces', elements.find(e => e.id === 'vol-mediator')?.detail || '')} />
      <circle cx={cx} cy={cy} r={55} fill="rgba(232,192,112,0.08)" stroke={GOLD2} strokeWidth={1} pointerEvents="none" />
      <text x={cx} y={cy - 15} textAnchor="middle" fontFamily="Cinzel Decorative, serif" fontSize={12} fill={INK}>VIRGIN</text>
      <text x={cx} y={cy + 2} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={INK2} letterSpacing={2}>OF LIGHT</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">Mediator</text>

      {/* Seven Virginities - star pattern */}
      {VIRGIN_NAMES.map((name, i) => {
        const a = (i * 51.4 - 90) * Math.PI / 180
        const vr = 155
        const vx = cx + Math.cos(a) * vr
        const vy = cy + Math.sin(a) * vr
        return <g key={i}>
          <line x1={cx + Math.cos(a) * 82} y1={cy + Math.sin(a) * 82} x2={cx + Math.cos(a) * 140} y2={cy + Math.sin(a) * 140} stroke={GOLD} strokeWidth={0.5} pointerEvents="none" />
          <circle cx={vx} cy={vy} r={22} fill="rgba(200,168,74,0.06)" stroke={GOLD2} strokeWidth={1} className="svg-clickable" onClick={() => onClick('vol-seven', 'Seven Virginities', elements.find(e => e.id === 'vol-seven')?.detail || '')} />
          <text x={vx} y={vy + 1} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={5.5} fill={INK2}>{name}</text>
        </g>
      })}

      {/* Middle Space above */}
      <rect x={50} y={50} width={600} height={80} fill="rgba(200,168,74,0.04)" stroke={GOLD2} strokeWidth={1} pointerEvents="none" />
      <text x={cx} y={80} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={GOLD2} letterSpacing={2}>MIDDLE SPACE</text>
      <text x={cx} y={100} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">60 Treasuries of the Pleroma</text>

      {/* Connecting lines to middle space */}
      <line x1={cx} y1={240} x2={cx} y2={133} stroke={GOLD2} strokeWidth={0.8} strokeDasharray="4 3" pointerEvents="none" />

      {/* Side element boxes */}
      {elements.filter(e => e.id === 'vol-distributor' || e.id === 'vol-receiver').map((el, i) => {
        const isLeft = i === 0
        const bx = isLeft ? 20 : 530
        const by = 260
        return <g key={el.id}>
          <rect x={bx} y={by} width={150} height={55}
            fill={selectedId === el.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.04)'}
            stroke={selectedId === el.id ? GOLD3 : GOLD} strokeWidth={1.2}
            className="svg-clickable" onClick={() => onClick(el.id, el.label, el.detail)} />
          <text x={bx + 75} y={by + 22} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK} letterSpacing={0.5}>{el.label}</text>
          <text x={bx + 75} y={by + 38} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">{el.brief}</text>
        </g>
      })}

      <defs>
        <marker id="downArr" markerWidth={6} markerHeight={4} refX={3} refY={4} orient="auto"><path d="M0,0 L3,4 L6,0" fill={INK3} /></marker>
        <marker id="upArr" markerWidth={6} markerHeight={4} refX={3} refY={0} orient="auto"><path d="M0,4 L3,0 L6,4" fill={GOLD2} /></marker>
      </defs>
    </svg>
  )
}

/* ── Receivers Diagram ── */
function ReceiversDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250, cy = 250
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK} letterSpacing={3}>THE RECEIVERS OF LIGHT</text>

      {/* Spiral path from outer to inner */}
      {Array.from({ length: 60 }, (_, i) => {
        const t = i / 60
        const a = t * Math.PI * 6 - Math.PI / 2
        const r = 200 - t * 150
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r + 15
        return <circle key={`p${i}`} cx={x} cy={y} r={1.5} fill={i % 5 === 0 ? GOLD2 : INK3} />
      })}

      {/* 5 Receiver orders */}
      {[1, 2, 3, 4, 5].map((rank, i) => {
        const a = (i * 72 - 90) * Math.PI / 180
        const r = 180
        const rx = cx + Math.cos(a) * r
        const ry = cy + Math.sin(a) * r + 15
        const el = elements.find(e => e.id === 'rcv-five-orders')
        return <g key={`rank${rank}`}>
          <circle cx={rx} cy={ry} r={25} fill={`rgba(200,168,74,${0.04 + (5 - rank) * 0.03})`} stroke={GOLD2} strokeWidth={1}
            className="svg-clickable" onClick={() => el && onClick(el.id, el.label, el.detail)} />
          <text x={rx} y={ry - 3} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK}>Rank {rank}</text>
          <text x={rx} y={ry + 10} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={5.5} fill={INK3} fontStyle="italic">{rank === 1 ? 'Brightest' : rank === 5 ? 'Dimmest' : `Order ${rank}`}</text>
        </g>
      })}

      {/* Center - Virgin of Light */}
      <circle cx={cx} cy={cy + 15} r={35} fill="rgba(232,192,112,0.1)" stroke={GOLD3} strokeWidth={2} className="svg-clickable" onClick={() => { const el = elements.find(e => e.id === 'rcv-virgin'); if (el) onClick(el.id, el.label, el.detail) }} />
      <text x={cx} y={cy + 8} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK} letterSpacing={1}>VIRGIN</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">Source</text>

      {/* Side elements */}
      {elements.filter(e => e.id === 'rcv-guide' || e.id === 'rcv-seals').map((el, i) => {
        const isLeft = i === 0
        return <g key={el.id}>
          <rect x={isLeft ? 10 : 350} y={440} width={140} height={45}
            fill={selectedId === el.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.04)'}
            stroke={selectedId === el.id ? GOLD3 : GOLD} strokeWidth={1}
            className="svg-clickable" onClick={() => onClick(el.id, el.label, el.detail)} />
          <text x={isLeft ? 80 : 420} y={460} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK} letterSpacing={0.5}>{el.label}</text>
          <text x={isLeft ? 80 : 420} y={474} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">{el.brief}</text>
        </g>
      })}
    </svg>
  )
}

/* ── Numerology Diagram ── */
function NumerologyDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 350, cy = 300
  const numbers = [
    { id: 'sn-60', num: '60', label: 'TREASURIES', size: 70 },
    { id: 'sn-12', num: '12', label: 'PER RANK', size: 55 },
    { id: 'sn-5', num: '5', label: 'RANKS', size: 48 },
    { id: 'sn-3', num: '3', label: 'GATES', size: 42 },
    { id: 'sn-7', num: '7', label: 'ARCHONS', size: 45 },
    { id: 'sn-180', num: '180', label: 'WATCHERS', size: 52 },
  ]
  return (
    <svg viewBox="0 0 700 620" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={28} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={14} fill={INK} letterSpacing={3}>THE SACRED NUMEROLOGY</text>
      <text x={cx} y={46} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={8} fill={INK3} fontStyle="italic">The mathematical architecture of the Bruce Codex</text>

      {/* Central formula */}
      <text x={cx} y={80} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={GOLD2} letterSpacing={1}>12 AEONS x 5 RANKS = 60 TREASURIES</text>

      {/* Number nodes in a circle */}
      {numbers.map((n, i) => {
        const a = (i * 60 - 90) * Math.PI / 180
        const nr = 200
        const nx = cx + Math.cos(a) * nr
        const ny = cy + Math.sin(a) * nr
        const isSelected = selectedId === n.id
        const el = elements.find(e => e.id === n.id)
        return <g key={n.id}>
          <line x1={cx} y1={cy} x2={cx + Math.cos(a) * (nr - n.size)} y2={cy + Math.sin(a) * (nr - n.size)} stroke={GOLD} strokeWidth={0.4} pointerEvents="none" />
          <circle cx={nx} cy={ny} r={n.size}
            fill={isSelected ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.04)'}
            stroke={isSelected ? GOLD3 : GOLD2} strokeWidth={isSelected ? 2 : 1.2}
            className="svg-clickable" onClick={() => onClick(n.id, n.label, el?.detail || '')} />
          <text x={nx} y={ny - 8} textAnchor="middle" fontFamily="Cinzel Decorative, serif" fontSize={n.num.length > 2 ? 20 : 28} fill={INK}>{n.num}</text>
          <text x={nx} y={ny + 16} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={INK2} letterSpacing={1}>{n.label}</text>
          <text x={nx} y={ny + 30} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">{el?.brief || ''}</text>
        </g>
      })}

      {/* Central connecting circle */}
      <circle cx={cx} cy={cy} r={45} fill="rgba(232,192,112,0.08)" stroke={GOLD3} strokeWidth={1.5} pointerEvents="none" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK} letterSpacing={1}>183</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={6} fill={INK3} fontStyle="italic">sacred words</text>

      {/* Relationship lines between numbers */}
      <line x1={cx + Math.cos(-90 * Math.PI / 180) * 130} y1={cy + Math.sin(-90 * Math.PI / 180) * 130} x2={cx + Math.cos(-30 * Math.PI / 180) * 150} y2={cy + Math.sin(-30 * Math.PI / 180) * 150} stroke={GOLD3} strokeWidth={0.3} strokeDasharray="2 4" pointerEvents="none" />
      <line x1={cx + Math.cos(30 * Math.PI / 180) * 150} y1={cy + Math.sin(30 * Math.PI / 180) * 150} x2={cx + Math.cos(-30 * Math.PI / 180) * 150} y2={cy + Math.sin(-30 * Math.PI / 180) * 150} stroke={GOLD3} strokeWidth={0.3} strokeDasharray="2 4" pointerEvents="none" />
    </svg>
  )
}

/* ── Codex Diagram ── */
function CodexDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 250
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={12} fill={INK} letterSpacing={2}>THE BRUCE CODEX</text>

      {/* Codex book shape */}
      <rect x={120} y={50} width={260} height={360} fill="rgba(200,168,74,0.06)" stroke={INK3} strokeWidth={1.5} />
      <rect x={125} y={55} width={250} height={350} fill="rgba(200,168,74,0.03)" stroke={GOLD} strokeWidth={0.5} />
      {/* Spine */}
      <line x1={130} y1={55} x2={130} y2={405} stroke={INK3} strokeWidth={1.5} pointerEvents="none" />

      {/* Elements as pages */}
      {elements.map((el, i) => {
        const y = 75 + i * 55
        return <g key={el.id}>
          <rect x={145} y={y} width={215} height={42}
            fill={selectedId === el.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.03)'}
            stroke={selectedId === el.id ? GOLD3 : INK3} strokeWidth={1}
            className="svg-clickable" onClick={() => onClick(el.id, el.label, el.detail)} />
          <text x={155} y={y + 16} fontFamily="Cinzel, serif" fontSize={8} fill={INK} letterSpacing={0.5}>{el.label}</text>
          <text x={155} y={y + 32} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">{el.brief}</text>
          <SvgCross x={340} y={y + 20} size={4} color={GOLD2} />
        </g>
      })}

      {/* Seal decoration */}
      <circle cx={cx} cy={445} r={20} fill="none" stroke={GOLD2} strokeWidth={1} />
      <text x={cx} y={448} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={7} fill={GOLD2}>MS 96</text>
    </svg>
  )
}

/* ── Cipher System Diagram ── */
function CipherSystemDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  const cx = 300, cy = 260
  return (
    <svg viewBox="0 0 600 540" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={cx} y={25} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={13} fill={INK} letterSpacing={3}>THE CIPHER SYSTEM</text>

      {/* Gate shape */}
      <rect x={cx - 100} y={70} width={200} height={120} fill="rgba(200,168,74,0.04)" stroke={GOLD2} strokeWidth={2} />
      <text x={cx} y={95} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={10} fill={INK} letterSpacing={2}>TREASURY GATE</text>

      {/* 3 Watchers at gate */}
      {['Watcher 1', 'Watcher 2', 'Watcher 3'].map((w, i) => {
        const wx = cx - 80 + i * 80
        return <g key={i}>
          <circle cx={wx} cy={155} r={20} fill="rgba(100,70,30,0.08)" stroke={INK3} strokeWidth={1} pointerEvents="none" />
          <text x={wx} y={153} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={6} fill={INK2}>{w}</text>
          <text x={wx} y={168} textAnchor="middle" fontFamily="Libre Baskerville, serif" fontSize={5} fill={INK3} fontStyle="italic">{['Name', 'Cipher', 'Password'][i]}</text>
        </g>
      })}

      {/* 3 authentication components */}
      {elements.filter(e => e.id === 'cs-threefold').map(el => (
        <g key={el.id}>
          <text x={cx} y={220} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={9} fill={GOLD2} letterSpacing={1}>THREEFOLD AUTHENTICATION</text>
          {/* Arrow from gate to auth */}
          <line x1={cx} y1={190} x2={cx} y2={230} stroke={GOLD} strokeWidth={0.8} pointerEvents="none" />
        </g>
      ))}

      {/* Example invocation */}
      <rect x={50} y={240} width={500} height={55} fill="rgba(232,192,112,0.06)" stroke={GOLD} strokeWidth={1} />
      <text x={cx} y={260} textAnchor="middle" fontFamily="Cinzel, serif" fontSize={8} fill={INK} letterSpacing={1}>EXAMPLE: FIRST TREASURY</text>
      <text x={cx - 180} y={280} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK2}>Name: </text>
      <text x={cx - 130} y={280} fontFamily="Cinzel, serif" fontSize={7} fill={GOLD2}>Pigeradaphtha Jeu</text>
      <text x={cx - 180} y={293} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK2}>Cipher: </text>
      <text x={cx - 125} y={293} fontFamily="Cinzel, serif" fontSize={7} fill={GOLD2}>Maiion</text>
      <text x={cx - 180} y={306} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK2}>Password: </text>
      <text x={cx - 115} y={306} fontFamily="Cinzel, serif" fontSize={7} fill={GOLD2}>I invoke Pigeradaphtha Jeu - Maiion</text>

      {/* Element boxes */}
      {elements.filter(e => e.id !== 'cs-threefold').map((el, i) => {
        const y = 320 + i * 55
        return <g key={el.id}>
          <rect x={50} y={y} width={500} height={42}
            fill={selectedId === el.id ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.04)'}
            stroke={selectedId === el.id ? GOLD3 : GOLD} strokeWidth={1}
            className="svg-clickable" onClick={() => onClick(el.id, el.label, el.detail)} />
          <text x={65} y={y + 16} fontFamily="Cinzel, serif" fontSize={8} fill={INK} letterSpacing={0.5}>{el.label}</text>
          <text x={65} y={y + 32} fontFamily="Libre Baskerville, serif" fontSize={7} fill={INK3} fontStyle="italic">{el.brief}</text>
        </g>
      })}
    </svg>
  )
}

/* ── Spaces Map Diagram ── */
function SpacesMapDiagram({ onClick, selectedId, elements }: { onClick: (id: string, label: string, detail: string) => void; selectedId: string | null; elements: { id: string; label: string; brief: string; detail: string }[] }) {
  return <ThreeSpacesDiagram onClick={onClick} selectedId={selectedId} elements={elements} />
}

/* ── Seal Diagram Router ── */
function SealDiagram({ type, complexity, fatherName, cipher, jeuNum, onElementClick, selectedId, elements, onNavigateEntry }: {
  type: string; complexity: number; fatherName: string; cipher: string; jeuNum: number
  onElementClick: (id: string, label: string, detail: string) => void; selectedId: string | null
  elements?: { id: string; label: string; brief: string; detail: string }[]
  onNavigateEntry?: (id: string) => void
}) {
  const cx = 250, cy = 250
  const baseR = [80, 100, 120, 140, 160][Math.min(complexity, 5) - 1] || 100
  const props = { cx, cy, r: baseR, jeuNum, fatherName, cipher, complexity, onClick: onElementClick, selectedId }
  const elProps = { onClick: onElementClick, selectedId, elements: elements || [], onNavigateEntry }

  switch (type) {
    case 'cross-circle': return <CrossCircleSeal {...props} />
    case 'concentric': return <ConcentricSeal {...props} />
    case 'star': return <StarSeal {...props} />
    case 'radial': return <RadialSeal {...props} />
    case 'octagram': return <OctagramSeal {...props} />
    case 'treasury-overview': return <TreasuryOverviewDiagram {...elProps} />
    case 'archon-gate': return <ArchonGateDiagram {...elProps} />
    case 'baptism-rite': return <BaptismDiagram {...elProps} />
    case 'cosmos': return <CosmosDiagram {...elProps} />
    case 'ascent': return <AscentDiagram {...elProps} />
    case 'liturgy': return <LiturgyDiagram {...elProps} />
    case 'hymn': return <HymnDiagram {...elProps} />
    case 'steles': return <StelesDiagram {...elProps} />
    case 'names': return <NamesDiagram {...elProps} />
    case 'dialogue': return <DialogueDiagram {...elProps} />
    case 'three-spaces': return <ThreeSpacesDiagram {...elProps} />
    case 'spaces-map': return <SpacesMapDiagram {...elProps} />
    case 'emanation-tree': return <EmanationTreeDiagram {...elProps} />
    case 'jeu-figure': return <JeuFigureDiagram {...elProps} />
    case 'virgin-light': return <VirginOfLightDiagram {...elProps} />
    case 'receivers': return <ReceiversDiagram {...elProps} />
    case 'numerology': return <NumerologyDiagram {...elProps} />
    case 'codex': return <CodexDiagram {...elProps} />
    case 'cipher-system': return <CipherSystemDiagram {...elProps} />
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'cat-overview': true, 'cat-cosmos': false, 'cat-liturgy': false, 'cat-hymn': false,
    'cat-archon': false, 'cat-related': false, 'cat-names': false, 'cat-dialogue': false,
    'rank-1': false, 'rank-2': false, 'rank-3': false, 'rank-4': false, 'rank-5': false
  })
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSacredText, setShowSacredText] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const toggleSection = useCallback((key: string) => { setExpandedSections(prev => ({ ...prev, [key]: !prev[key] })) }, [])
  const handleElementClick = useCallback((id: string, label: string, detail: string) => { setSelectedElement(id); setRevelation({ title: label, detail }) }, [])
  const handleEntrySelect = useCallback((id: string) => { setSelectedEntry(id); setSelectedElement(null); setRevelation(null); setShowSacredText(false) }, [])

  const currentSacred = SACRED_ENTRIES.find(s => s.id === selectedEntry)
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

  const filteredSacreds = useMemo(() => {
    if (!searchQuery.trim()) return SACRED_ENTRIES
    const q = searchQuery.toLowerCase()
    return SACRED_ENTRIES.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || (s.sacredText || []).some(t => t.toLowerCase().includes(q)))
  }, [searchQuery])

  const groupedSacreds = useMemo(() => {
    const groups: Record<SacredCategory, SacredEntry[]> = { overview: [], cosmos: [], liturgy: [], hymn: [], archon: [], related: [], names: [], dialogue: [], emanation: [], spaces: [] }
    filteredSacreds.forEach(s => { groups[s.category].push(s) })
    return groups
  }, [filteredSacreds])

  return (
    <div className="treasury-app">
      {mounted && <Particles />}
      <div className="roller"><span className="roller-text">CODEX BRUCIANUS &middot; BODLEIAN LIBRARY OXFORD &middot; MS BRUCE 96</span></div>
      <header className="treasury-header">
        <div className="header-greek">Biblos tou Ieu &mdash; Sacred Diagrams of the Pleroma</div>
        <h1>The Book of Jeu</h1>
        <div className="header-sub">60 Treasuries &middot; Three Spaces &middot; Emanations &middot; Sacred Rites &middot; Hymns &middot; Cipher System</div>
      </header>

      <div className="main-layout">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '\u25C0' : '\u25B6'}</div>
          {sidebarOpen && (
            <>
              <div className="sidebar-search">
                <input type="text" placeholder="Search all entries..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="search-input" />
              </div>

              {/* Sacred text categories */}
              {(Object.keys(CATEGORY_LABELS) as SacredCategory[]).map(cat => {
                const items = groupedSacreds[cat]
                if (items.length === 0 && searchQuery) return null
                const key = `cat-${cat}`
                return (
                  <div key={cat} className="sidebar-section">
                    <div className="section-header" onClick={() => toggleSection(key)}>
                      <span className="section-arrow">{expandedSections[key] ? '\u25BC' : '\u25B6'}</span>
                      <span className="section-title">{CATEGORY_LABELS[cat]}</span>
                      <span className="section-count">{items.length || SACRED_ENTRIES.filter(s => s.category === cat).length}</span>
                    </div>
                    {expandedSections[key] && items.map(s => (
                      <div key={s.id} className={`sidebar-item ${selectedEntry === s.id ? 'active' : ''}`} onClick={() => handleEntrySelect(s.id)}>
                        <span className="item-icon">{CATEGORY_ICONS[s.category]}</span>
                        <span className="item-text">{s.title.length > 32 ? s.title.substring(0, 32) + '...' : s.title}</span>
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* Treasury ranks */}
              {[1, 2, 3, 4, 5].map(rank => {
                const key = `rank-${rank}`
                const items = groupedTreasuries[key] || []
                if (items.length === 0 && searchQuery) return null
                return (
                  <div key={rank} className="sidebar-section">
                    <div className="section-header" onClick={() => toggleSection(key)}>
                      <span className="section-arrow">{expandedSections[key] ? '\u25BC' : '\u25B6'}</span>
                      <span className="section-title">{RANK_NAMES[rank]}</span>
                      <span className="section-count">{TREASURIES.filter(t => t.rank === rank).length}</span>
                    </div>
                    {expandedSections[key] && items.map(t => (
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
            {currentSacred && (<>
              <h2>{currentSacred.title}</h2>
              <div className="entry-ref">Book of Jeu {currentSacred.book === 1 ? 'I' : 'II'} &middot; {currentSacred.chapter} &middot; {currentSacred.folio}</div>
              <div className="entry-tags">
                <span className="tag">{CATEGORY_LABELS[currentSacred.category]}</span>
              </div>
            </>)}
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
              {currentSacred && <SealDiagram type={currentSacred.sealType} complexity={3} fatherName="" cipher="" jeuNum={0} onElementClick={handleElementClick} selectedId={selectedElement} elements={currentSacred.elements} onNavigateEntry={handleEntrySelect} />}
              {currentTreasury && <SealDiagram type={currentTreasury.sealType} complexity={currentTreasury.sealComplexity} fatherName={currentTreasury.fatherName} cipher={currentTreasury.cipher} jeuNum={currentTreasury.jeuNum} onElementClick={handleElementClick} selectedId={selectedElement} />}
            </div>

            <div className="info-panel">
              <div className="info-section">
                <h3>Context</h3>
                <p>{currentSacred?.desc || currentTreasury?.desc}</p>
              </div>

              {/* Sacred Text Display */}
              {currentSacred?.sacredText && currentSacred.sacredText.length > 0 && (
                <div className="info-section">
                  <h3>Sacred Text <span className="pron" style={{ cursor: 'pointer' }} onClick={() => setShowSacredText(!showSacredText)}>
                    [{showSacredText ? 'Collapse' : 'Expand'}]
                  </span></h3>
                  <div className="sacred-text-block" style={{ display: showSacredText ? 'block' : 'none' }}>
                    {currentSacred.sacredText.map((line, i) => (
                      <p key={i} className="sacred-line">{line || '\u00A0'}</p>
                    ))}
                  </div>
                  {!showSacredText && (
                    <p className="sacred-preview" style={{ fontStyle: 'italic', color: 'var(--ink3)', fontSize: '0.78rem' }}>
                      {currentSacred.sacredText.filter(l => l.trim()).slice(0, 2).join(' ')}...
                    </p>
                  )}
                </div>
              )}

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

              {/* Pronunciations */}
              {currentSacred?.pronunciations && currentSacred.pronunciations.length > 0 && (
                <div className="info-section">
                  <h3>Pronunciations</h3>
                  <div className="detail-grid">
                    {currentSacred.pronunciations.map((p, i) => (
                      <div key={i} className="detail-row">
                        <span className="detail-label">{p.name}</span>
                        <span className="detail-value"><span className="pron">[{p.pron}]</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lore / Teachings */}
              {currentSacred && currentSacred.lore.length > 0 && (
                <div className="info-section">
                  <h3>Teachings</h3>
                  {currentSacred.lore.map((l, i) => (<div key={i} className="lore-card"><strong>{l.title}</strong><p>{l.body}</p></div>))}
                </div>
              )}

              {/* Treasury Watchers */}
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

      <div className="roller bottom"><span className="roller-text">Biblos tou Ieu &middot; THE TWO BOOKS OF JEU &middot; THREE SPACES &middot; EMANATIONS &middot; CIPHER SYSTEM</span></div>
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
