/* ============================================================
   SETTINGS
   ============================================================ */

const ENABLE_SK_CRITS = true;
const ENABLE_SIG_CRITS = true;
const FILTER_LOW_HP = true; // true = hide builds under 50k HP
const GHOST_SHROUDS = 30;
const ER_MINIMUM = 120;

// How many top builds to print.
const TOP_N = 15;

// Name of a build to track/pin even if it falls outside TOP_N
// (must match the auto-generated "name" format, e.g. "12-131").
// Set to null to disable.
const SELECTED_BUILD = "11-1101";

/* ============================================================
   ECHOES
   ============================================================ */

const MAIN_STAT = (stat, cost) => {
  const key = `${stat.toUpperCase()}_${cost}`;
  const mainstats = {
    CD_4: { cd: 44, atk_: 150 },
    CR_4: { cr: 22, atk_: 150 },
    ATK_1: { atk: 18, hp_: 2280 },
    HP_1: { hp: 22.8, hp_: 2280 },
  };

  if (!mainstats[key]) {
    throw new Error(
      `MAIN_STAT: no entry for "${key}". Add it to the mainstats table.`,
    );
  }

  return mainstats[key];
};

const MYRIAD_SNARE = [
  // These guys are always 4 cost, so only cd or cr option is needed there
  {
    main: MAIN_STAT("cd", 4),
    sub: { cd: 17.4, cr: 9.9, atk: 10.1, hp: 9.4, hp_: 540 },
  },
  {
    main: MAIN_STAT("cr", 4),
    sub: { cd: 12.6, cr: 9.3, er: 9.2, hp: 10.9 },
  },
];

const CALAMITY_EFFIGY = [
  // These guys are always 4 cost, so only cd or cr option is needed there
  {
    main: MAIN_STAT("cd", 4),
    sub: { cd: 15, cr: 7.5 },
  },
];

const YELLOW_PUPPET = [
  // These guys are always 1 cost, so only atk/hp option is needed there
  {
    main: MAIN_STAT("hp", 1),
    sub: { cd: 12.6, cr: 9.9, er: 10, hp_: 390 },
  },
  {
    main: MAIN_STAT("hp", 1),
    sub: { hp: 6.4, er: 10, cr: 7.5, heavy: 7.1 },
  },
];

const PURPLE_PUPPET = [
  // These guys are always 1 cost, so only atk/hp option is needed there
  {
    main: MAIN_STAT("hp", 1),
    sub: { cd: 13.8, cr: 8.1, heavy: 9.4, hp_: 390 },
  },
  {
    main: MAIN_STAT("atk", 1),
    sub: { cd: 13.8, cr: 7.5, atk: 7.9, heavy: 8.1 },
  },
];

const PORCELEIN_PICKET = [
  // These guys are always 1 cost, so only atk/hp option is needed there
  {
    main: MAIN_STAT("hp", 1),
    sub: { cd: 12.6, cr: 7.5, er: 9.2, hp_: 430 },
  },
  {
    main: MAIN_STAT("hp", 1),
    sub: { hp_: 390, cd: 12.6, atk: 10.1, cr: 6.3, er: 9.2 },
  },
  {
    main: MAIN_STAT("hp", 1),
    sub: { hp: 8.6, hp_: 470, cr: 8.7, cd: 15 },
  },
  {
    main: MAIN_STAT("hp", 1),
    sub: { cr: 9.9, cd: 12.6, er: 9.2, hp_: 430 },
  },
];

const STONE_PICKET = [
  // These guys are always 1 cost, so only atk/hp option is needed there
  {
    main: MAIN_STAT("hp", 1),
    sub: { cd: 13.8, cr: 7.5, atk: 10.9, hp: 8.6, er: 10.8 },
  },
  {
    main: MAIN_STAT("hp", 1),
    sub: { cd: 13.8, cr: 9.3, hp: 7.9, er: 10 },
  },
];

/* ============================================================
   BASE EFFECTS
   ============================================================ */

const HP_BASE = 15375;
const ATK_BASE = 413 + 313;

const CR_CHAR = 5;
const CD_CHAR = 150;
const ER_CHAR = 100;

const HP_SIG = 72.2;
const HP_SKILL = 12;
const HP_SONATA = 10;

const CR_SKILL = 8;
const CR_SONATA = 20;
const CR_SK = ENABLE_SK_CRITS ? 12.5 : 0;
const CR_SIG = ENABLE_SIG_CRITS ? 12 : 0;

const CD_SK = ENABLE_SK_CRITS ? 25 : 0;
const CD_SIG = ENABLE_SIG_CRITS ? 24 : 0;

const DMG_BONUS_SONATA = 15;
const DMG_BONUS_MAIN_SLOT = 24;

const DMG_BONUS_PER_1K_HP = 1.5 + 0.05 * GHOST_SHROUDS;
const ATK_FLAT_PER_1K_HP = 36;

const CR_EXTRA = 0;
const CD_EXTRA = 0;
const HP_EXTRA = 0;
const ATK_EXTRA = 0;
const ATK_FLAT_EXTRA = 0;
const HP_FLAT_EXTRA = 0;
const DMG_BONUS_EXTRA = 0;
const ER_EXTRA = 0;

/* ============================================================
   TREE BUILDING
   ============================================================ */

const echoList = [
  MYRIAD_SNARE,
  CALAMITY_EFFIGY,
  YELLOW_PUPPET,
  PURPLE_PUPPET,
  PORCELEIN_PICKET,
  STONE_PICKET,
];

const dfs = (storage, cur, sizes, pos) => {
  if (pos >= sizes.length) {
    storage.push([...cur]);
    return;
  }

  const count = sizes[pos];

  if (count === 0) {
    // no items available for this slot — skip it
    cur.push(-1);
    dfs(storage, cur, sizes, pos + 1);
    cur.pop();
    return;
  }

  for (let i = 0; i < count; i++) {
    cur.push(i);
    dfs(storage, cur, sizes, pos + 1);
    cur.pop();
  }
};

const generateBuilds = (a, b, c, d, e, f) => {
  const storage = [];
  dfs(storage, [], [a, b, c, d, e, f], 0);
  return storage;
};

const getBuilds = () => {
  const [e1, e2, e3, e4, e5, e6] = echoList.map((e) => e.length);

  return [
    ...generateBuilds(e1, e2, 0, e4, e5, e6),
    ...generateBuilds(e1, e2, e3, 0, e5, e6),
    ...generateBuilds(e1, e2, e3, e4, 0, e6),
    ...generateBuilds(e1, e2, e3, e4, e5, 0),
  ];
};

/* ============================================================
   STAT CALCULATIONS
   ============================================================ */

const HP_MINIMUM = FILTER_LOW_HP ? 50000 : 0;
const CR_BASE = CR_CHAR + CR_SKILL + CR_SK + CR_SIG + CR_SONATA + CR_EXTRA;
const CD_BASE = CD_CHAR + CD_SK + CD_SIG + CD_EXTRA;
const ER_BASE = ER_CHAR + ER_EXTRA;
const HP_PERCENT_BASE = HP_SIG + HP_SKILL + HP_SONATA + HP_EXTRA;
const ATK_PERCENT_BASE = ATK_EXTRA;
const DMG_BONUS_BASE = DMG_BONUS_SONATA + DMG_BONUS_MAIN_SLOT + DMG_BONUS_EXTRA;

const STAT_KEYS = ["cr", "cd", "er", "atk", "atk_", "hp", "hp_"];

const buildName = (index) => {
  let name = "";
  for (let i = 0; i < index.length; i++) {
    if (i === 2) name += "-";
    name += index[i] === -1 ? "0" : index[i] + 1;
  }
  return name;
};

const getBuildStat = (index) => {
  const build = {
    name: buildName(index),
    cr: CR_BASE,
    cd: CD_BASE,
    er: ER_BASE,
    atk: ATK_PERCENT_BASE,
    atk_: ATK_FLAT_EXTRA,
    hp: HP_PERCENT_BASE,
    hp_: HP_FLAT_EXTRA,
    bonus: DMG_BONUS_BASE,
  };

  for (let i = 0; i < index.length; i++) {
    if (index[i] === -1) continue;

    const echo = echoList[i][index[i]];
    if (!echo || !echo.sub) {
      console.log(`Missing echo at slot ${i}, option ${index[i]}`);
      continue;
    }

    // mainstat: only 2 keys present per echo, out of the 7 possible
    for (const key of STAT_KEYS) {
      if (echo.main?.[key] !== undefined) build[key] += echo.main[key];
      if (echo.sub?.[key] !== undefined) build[key] += echo.sub[key];
    }

    build.bonus += echo.sub.heavy || 0;
  }

  return build;
};

const getStats = (buildsIndex) => buildsIndex.map(getBuildStat);

/* ============================================================
   FILTERING / SCORING
   ============================================================ */

const cleanBuild = (rawBuild) => {
  const hpFinal = HP_BASE * (1 + rawBuild.hp / 100) + rawBuild.hp_;
  // Whole 1k-HP stacks only — a build with e.g. 49.6k HP has 49 stacks,
  // not 50, so this floors rather than rounds.
  const hpStacks = Math.min(50, Math.floor(hpFinal / 1000));

  const atk =
    ATK_BASE * (1 + rawBuild.atk / 100) +
    rawBuild.atk_ +
    ATK_FLAT_PER_1K_HP * hpStacks;
  const cr = Math.min(rawBuild.cr, 100) / 100;
  const cd = rawBuild.cd / 100;
  const bonus = (rawBuild.bonus + DMG_BONUS_PER_1K_HP * hpStacks) / 100;

  const score = atk * (1 + bonus) * (cr * cd + (1 - cr));

  return {
    name: rawBuild.name,
    atk,
    hp: hpFinal,
    score,
    cr: rawBuild.cr,
    cd: rawBuild.cd,
    er: rawBuild.er,
    heavy: rawBuild.bonus - DMG_BONUS_BASE,
  };
};

const filterBuilds = (buildsInfo) => {
  const filtered = buildsInfo
    .map(cleanBuild)
    .filter((b) => b.er >= ER_MINIMUM && b.hp >= HP_MINIMUM);

  // Higher score wins; ties broken by higher ER.
  filtered.sort(
    (a, b) => Math.round(b.score) - Math.round(a.score) || b.er - a.er,
  );
  return filtered;
};

/* ============================================================
   PRINTING
   ============================================================ */

const pad = (val, width, align = "left") => {
  const str = String(val);
  return align === "left" ? str.padEnd(width) : str.padStart(width);
};

const COLUMNS = [
  { key: "rank", label: "#", width: 4, align: "right" },
  { key: "name", label: "Build", width: 8, align: "left" },
  { key: "score", label: "Score", width: 9, align: "right" },
  { key: "delta", label: "% vs sel", width: 9, align: "right" },
  { key: "atk", label: "ATK", width: 7, align: "right" },
  { key: "hp", label: "HP", width: 7, align: "right" },
  { key: "cr", label: "CR%", width: 7, align: "right" },
  { key: "cd", label: "CD%", width: 7, align: "right" },
  { key: "er", label: "ER%", width: 7, align: "right" },
  { key: "heavy", label: "Heavy%", width: 8, align: "right" },
];

const printRow = (row) => {
  console.log(
    COLUMNS.map((c) => pad(row[c.key], c.width, c.align)).join(" | "),
  );
};

const printHeader = () => {
  printRow(Object.fromEntries(COLUMNS.map((c) => [c.key, c.label])));
  console.log(COLUMNS.map((c) => "-".repeat(c.width)).join("-+-"));
};

const toRow = (build, rank, selectedScore) => ({
  rank,
  name: build.name,
  score: build.score.toFixed(1),
  delta: `${((build.score / selectedScore) * 100).toFixed(1)}%`,
  atk: build.atk.toFixed(0),
  hp: build.hp.toFixed(0),
  cr: build.cr.toFixed(1),
  cd: build.cd.toFixed(1),
  er: build.er.toFixed(1),
  heavy: build.heavy.toFixed(1),
});

const printSettings = () => {
  const settings = [
    ["HP_BASE", HP_BASE],
    ["ATK_BASE", ATK_BASE],
    ["GHOST_SHROUDS", GHOST_SHROUDS],
    ["ER_MINIMUM", ER_MINIMUM],
    ["ENABLE_SK_CRITS", ENABLE_SK_CRITS],
    ["ENABLE_SIG_CRITS", ENABLE_SIG_CRITS],
    ["TOP_N", TOP_N],
    ["SELECTED_BUILD", SELECTED_BUILD ?? "(none)"],
  ];
  const labelWidth = Math.max(...settings.map(([label]) => label.length));

  console.log("=== Settings ===");
  for (const [label, value] of settings) {
    console.log(`${label.padEnd(labelWidth)}: ${value}`);
  }
  console.log("");
};

const printBuilds = (allBuilds) => {
  // No SELECTED_BUILD set -> default to the #1 ranked build as the 100% reference.
  let selectedIndex = SELECTED_BUILD
    ? allBuilds.findIndex((b) => b.name === SELECTED_BUILD)
    : 0;

  if (SELECTED_BUILD && selectedIndex === -1) {
    console.log(
      `Warning: SELECTED_BUILD "${SELECTED_BUILD}" not found among filtered builds. Defaulting to #1.\n`,
    );
    selectedIndex = 0;
  }

  const selectedScore = allBuilds[selectedIndex].score;

  console.log(
    `=== Top ${Math.min(TOP_N, allBuilds.length)} Builds (of ${allBuilds.length} filtered) ===`,
  );
  printHeader();

  const top = allBuilds.slice(0, TOP_N);
  top.forEach((build, i) => printRow(toRow(build, i + 1, selectedScore)));

  // If the selected build exists but fell outside the top N, show it separately.
  if (selectedIndex !== -1 && selectedIndex >= TOP_N) {
    console.log(COLUMNS.map((c) => "-".repeat(c.width)).join("-+-"));
    printRow(toRow(allBuilds[selectedIndex], selectedIndex + 1, selectedScore));
  }

  console.log("");
};

/* ============================================================
   MAIN
   ============================================================ */

const runCalc = () => {
  const buildsIndex = getBuilds();
  const buildsInfo = getStats(buildsIndex);
  const buildsFiltered = filterBuilds(buildsInfo);

  printSettings();
  printBuilds(buildsFiltered);
};

runCalc();
