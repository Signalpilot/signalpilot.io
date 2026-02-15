// Posting Schedule: Maps post order to post numbers for each platform
// Twitter uses sequential post numbers (0, 1, 2, 3...)
// Instagram uses 9-grid order (Orange→Neutral→Teal per row) from POST_MAPPING.md

// Already posted (rows 1-12, post orders 1-36)
const ALREADY_POSTED = [
  // Row 1: 003, 001, 002
  { postOrder: 1, postNumber: 3 },
  { postOrder: 2, postNumber: 1 },
  { postOrder: 3, postNumber: 2 },
  // Row 2: 006, 005, 004
  { postOrder: 4, postNumber: 6 },
  { postOrder: 5, postNumber: 5 },
  { postOrder: 6, postNumber: 4 },
  // Row 3: 009, 008, 007
  { postOrder: 7, postNumber: 9 },
  { postOrder: 8, postNumber: 8 },
  { postOrder: 9, postNumber: 7 },
  // Row 4: 014, 011, 013
  { postOrder: 10, postNumber: 14 },
  { postOrder: 11, postNumber: 11 },
  { postOrder: 12, postNumber: 13 },
  // Row 5: 012, 015, 017
  { postOrder: 13, postNumber: 12 },
  { postOrder: 14, postNumber: 15 },
  { postOrder: 15, postNumber: 17 },
  // Row 6: 018, 016, 010
  { postOrder: 16, postNumber: 18 },
  { postOrder: 17, postNumber: 16 },
  { postOrder: 18, postNumber: 10 },
  // Row 7: 021, 020, 019
  { postOrder: 19, postNumber: 21 },
  { postOrder: 20, postNumber: 20 },
  { postOrder: 21, postNumber: 19 },
  // Row 8: 022, 023, 027
  { postOrder: 22, postNumber: 22 },
  { postOrder: 23, postNumber: 23 },
  { postOrder: 24, postNumber: 27 },
  // Row 9: (marketing), 026, 030
  { postOrder: 25, postNumber: 25 },
  { postOrder: 26, postNumber: 26 },
  { postOrder: 27, postNumber: 30 },
  // Row 10: 024, 031, 029
  { postOrder: 28, postNumber: 24 },
  { postOrder: 29, postNumber: 31 },
  { postOrder: 30, postNumber: 29 },
  // Row 11: 028, 032, 037
  { postOrder: 31, postNumber: 28 },
  { postOrder: 32, postNumber: 32 },
  { postOrder: 33, postNumber: 37 },
  // Row 12: 034, 039, 038
  { postOrder: 34, postNumber: 34 },
  { postOrder: 35, postNumber: 39 },
  { postOrder: 36, postNumber: 38 },
];

// Row 13 — next to post (post orders 37-39)
// Then rows 14-215 from COMPLETE POSTING SCHEDULE table
// Format per row: [Orange, Neutral, Teal] = 3 post orders
const NINE_GRID_ROWS = [
  [35, 36, 33],
  [40, 42, 43],
  [41, 46, 47],
  [44, 49, 48],
  [45, 52, 50],
  [51, 56, 53],
  [54, 59, 57],
  [55, 62, 58],
  [60, 66, 63],
  [61, 69, 67],
  [64, 72, 68],
  [65, 76, 70],
  [71, 79, 73],
  [74, 82, 77],
  [75, 86, 78],
  [81, 89, 80],
  [84, 92, 83],
  [85, 96, 87],
  [91, 99, 88],
  [94, 102, 90],
  [95, 106, 93],
  [101, 109, 97],
  [104, 112, 98],
  [105, 116, 100],
  [111, 119, 103],
  [114, 122, 107],
  [115, 126, 108],
  [121, 129, 110],
  [124, 132, 113],
  [125, 136, 117],
  [131, 139, 118],
  [134, 140, 120],
  [135, 142, 123],
  [141, 146, 127],
  [144, 149, 128],
  [145, 150, 130],
  [151, 152, 133],
  [154, 156, 137],
  [155, 159, 138],
  [161, 160, 143],
  [164, 162, 147],
  [165, 166, 148],
  [171, 169, 153],
  [174, 170, 157],
  [175, 172, 158],
  [184, 176, 163],
  [185, 179, 167],
  [191, 180, 168],
  [194, 182, 173],
  [195, 186, 177],
  [201, 189, 178],
  [204, 192, 181],
  [205, 196, 183],
  [211, 199, 187],
  [214, 202, 188],
  [215, 206, 190],
  [221, 209, 193],
  [224, 212, 197],
  [225, 216, 198],
  [231, 219, 200],
  [234, 222, 203],
  [235, 226, 207],
  [241, 229, 208],
  [244, 232, 210],
  [245, 236, 213],
  [251, 239, 217],
  [254, 242, 218],
  [255, 246, 220],
  [261, 249, 223],
  [264, 252, 227],
  [265, 256, 228],
  [271, 259, 230],
  [274, 262, 233],
  [275, 266, 237],
  [281, 269, 238],
  [284, 272, 240],
  [285, 276, 243],
  [291, 279, 247],
  [294, 282, 248],
  [295, 286, 250],
  [300, 289, 253],
  [304, 292, 257],
  [305, 296, 258],
  [311, 299, 260],
  [314, 302, 263],
  [315, 306, 267],
  [320, 309, 268],
  [321, 312, 270],
  [324, 316, 273],
  [325, 319, 277],
  [330, 322, 278],
  [331, 326, 280],
  [334, 329, 283],
  [335, 332, 287],
  [341, 336, 288],
  [344, 339, 290],
  [345, 342, 293],
  [351, 346, 297],
  [354, 348, 298],
  [355, 349, 301],
  [364, 352, 303],
  [365, 356, 307],
  [371, 359, 308],
  [374, 361, 310],
  [375, 362, 313],
  [381, 366, 317],
  [384, 369, 318],
  [385, 372, 323],
  [389, 376, 327],
  [391, 379, 328],
  [394, 382, 333],
  [395, 386, 337],
  [400, 392, 338],
  [404, 396, 340],
  [405, 401, 343],
  [414, 402, 347],
  [415, 406, 350],
  [421, 409, 353],
  [424, 411, 357],
  [425, 412, 358],
  [432, 416, 360],
  [434, 419, 363],
  [435, 422, 367],
  [437, 426, 368],
  [441, 429, 370],
  [444, 431, 373],
  [445, 436, 377],
  [451, 439, 378],
  [454, 442, 380],
  [455, 446, 383],
  [461, 449, 387],
  [464, 452, 388],
  [465, 456, 390],
  [471, 459, 393],
  [474, 462, 397],
  [475, 466, 398],
  [481, 469, 399],
  [484, 472, 403],
  [485, 476, 407],
  [491, 479, 408],
  [494, 482, 410],
  [495, 486, 413],
  [500, 489, 417],
  [504, 492, 418],
  [505, 496, 420],
  [511, 499, 423],
  [514, 502, 427],
  [515, 506, 428],
  [521, 509, 430],
  [524, 512, 433],
  [525, 516, 438],
  [531, 519, 440],
  [534, 522, 443],
  [535, 526, 447],
  [541, 529, 448],
  [544, 532, 450],
  [545, 536, 453],
  [551, 539, 457],
  [554, 542, 458],
  [555, 546, 460],
  [561, 549, 463],
  [564, 552, 467],
  [565, 556, 468],
  [571, 559, 470],
  [574, 562, 473],
  [575, 566, 477],
  [581, 569, 478],
  [584, 572, 480],
  [585, 576, 483],
  [591, 579, 487],
  [594, 582, 488],
  [595, 586, 490],
  [601, 589, 493],
  [604, 592, 497],
  [605, 596, 498],
  [611, 599, 501],
  [614, 602, 503],
  [615, 606, 507],
  [621, 609, 508],
  [624, 612, 510],
  [625, 616, 513],
  [631, 619, 517],
  [634, 622, 518],
  [635, 626, 520],
  [641, 629, 523],
  [644, 632, 527],
  [645, 636, 528],
  [649, 638, 530],
  [650, 639, 533],
  [651, 642, 537],
  [652, 646, 538],
  [653, 665, 540],
  [654, 666, 543],
  [655, 667, 547],
  [656, 668, 548],
  [657, 669, 550],
  [658, 670, 553],
  [659, 671, 557],
  [660, 672, 558],
  [661, 673, 560],
  [662, 674, 563],
  [663, 675, 567],
  [664, 676, 568]
];

/**
 * Build the complete Instagram posting order: postOrder → postNumber
 * Starts at post order 37 (after 36 already posted)
 */
function buildInstagramSchedule() {
  const schedule = [];

  // Add already posted
  for (const entry of ALREADY_POSTED) {
    schedule.push(entry);
  }

  // Add future rows (starting at post order 37)
  let postOrder = 37;
  for (const [orange, neutral, teal] of NINE_GRID_ROWS) {
    schedule.push({ postOrder, postNumber: orange, column: 'orange' });
    postOrder++;
    schedule.push({ postOrder, postNumber: neutral, column: 'neutral' });
    postOrder++;
    schedule.push({ postOrder, postNumber: teal, column: 'teal' });
    postOrder++;
  }

  return schedule;
}

/**
 * Get the post number for a given Instagram post order
 */
function getInstagramPostNumber(postOrder) {
  const schedule = buildInstagramSchedule();
  const entry = schedule.find(e => e.postOrder === postOrder);
  return entry ? entry.postNumber : null;
}

/**
 * Get the post number for a given Twitter post order
 * Twitter uses sequential posting (post order = post number)
 */
function getTwitterPostNumber(postOrder) {
  return postOrder;
}

/**
 * Get post number for a given platform and post order
 */
function getPostNumber(platform, postOrder) {
  if (platform === 'instagram') {
    return getInstagramPostNumber(postOrder);
  }
  return getTwitterPostNumber(postOrder);
}

/**
 * Get column color for an Instagram post order
 */
function getInstagramColumn(postOrder) {
  const schedule = buildInstagramSchedule();
  const entry = schedule.find(e => e.postOrder === postOrder);
  return entry ? entry.column : null;
}

/**
 * Get the total number of posts available in the Instagram schedule
 */
function getInstagramTotalPosts() {
  return ALREADY_POSTED.length + NINE_GRID_ROWS.length * 3;
}

/**
 * Starting post order for new posts (after already posted)
 */
const INSTAGRAM_START_ORDER = 37;
const TWITTER_START_ORDER = 0;

export {
  buildInstagramSchedule,
  getInstagramPostNumber,
  getTwitterPostNumber,
  getPostNumber,
  getInstagramColumn,
  getInstagramTotalPosts,
  INSTAGRAM_START_ORDER,
  TWITTER_START_ORDER,
  NINE_GRID_ROWS,
  ALREADY_POSTED,
};
