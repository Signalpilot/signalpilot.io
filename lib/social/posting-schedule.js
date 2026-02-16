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
  [35, 36, 40],   // Row 13: 035 Product | 036 EDU | 040 Docs
  [41, 39, 43],   // Row 14: 041 Marketing | 039 EDU | 043 Blog
  [44, 46, 47],   // Row 15: 044 Quote | 046 EDU | 047 Blog
  [45, 49, 48],   // Row 16: 045 Product | 049 EDU | 048 Chronicle
  [51, 52, 50],   // Row 17: 051 Marketing | 052 EDU | 050 Docs
  [54, 56, 53],   // Row 18: 054 Quote | 056 EDU | 053 Blog
  [55, 59, 57],   // Row 19: 055 Product | 059 EDU | 057 Blog
  [65, 62, 60],   // Row 20: 065 Product | 062 EDU | 060 Docs
  [61, 66, 63],   // Row 21: 061 Marketing | 066 EDU | 063 Blog
  [64, 72, 58],   // Row 22: 064 Quote | 072 EDU | 058 Chronicle
  [64, 76, 68],
  [65, 79, 70],
  [71, 82, 73],
  [74, 86, 77],
  [75, 89, 78],
  [81, 92, 80],
  [84, 96, 83],
  [85, 99, 87],
  [91, 102, 88],
  [94, 106, 90],
  [95, 109, 93],
  [101, 112, 97],
  [104, 116, 98],
  [105, 119, 100],
  [111, 122, 103],
  [114, 126, 107],
  [115, 129, 108],
  [121, 132, 110],
  [124, 136, 113],
  [125, 139, 117],
  [131, 140, 118],
  [134, 142, 120],
  [135, 146, 123],
  [141, 149, 127],
  [144, 150, 128],
  [145, 152, 130],
  [151, 156, 133],
  [154, 159, 137],
  [155, 160, 138],
  [161, 162, 143],
  [164, 166, 147],
  [165, 169, 148],
  [171, 170, 153],
  [174, 172, 157],
  [175, 176, 158],
  [184, 179, 163],
  [185, 180, 167],
  [191, 182, 168],
  [194, 186, 173],
  [195, 189, 177],
  [201, 192, 178],
  [204, 196, 181],
  [205, 199, 183],
  [211, 202, 187],
  [214, 206, 188],
  [215, 209, 190],
  [221, 212, 193],
  [224, 216, 197],
  [225, 219, 198],
  [231, 222, 200],
  [234, 226, 203],
  [235, 229, 207],
  [241, 232, 208],
  [244, 236, 210],
  [245, 239, 213],
  [251, 242, 217],
  [254, 246, 218],
  [255, 249, 220],
  [261, 252, 223],
  [264, 256, 227],
  [265, 259, 228],
  [271, 262, 230],
  [274, 266, 233],
  [275, 269, 237],
  [281, 272, 238],
  [284, 276, 240],
  [285, 279, 243],
  [291, 282, 247],
  [294, 286, 248],
  [295, 289, 250],
  [300, 292, 253],
  [304, 296, 257],
  [305, 299, 258],
  [311, 302, 260],
  [314, 306, 263],
  [315, 309, 267],
  [320, 312, 268],
  [321, 316, 270],
  [324, 319, 273],
  [325, 322, 277],
  [330, 326, 278],
  [331, 329, 280],
  [334, 332, 283],
  [335, 336, 287],
  [341, 339, 288],
  [344, 342, 290],
  [345, 346, 293],
  [351, 348, 297],
  [354, 349, 298],
  [355, 352, 301],
  [364, 356, 303],
  [365, 359, 307],
  [371, 361, 308],
  [374, 362, 310],
  [375, 366, 313],
  [381, 369, 317],
  [384, 372, 318],
  [385, 376, 323],
  [389, 379, 327],
  [391, 382, 328],
  [394, 386, 333],
  [395, 392, 337],
  [400, 396, 338],
  [404, 401, 340],
  [405, 402, 343],
  [414, 406, 347],
  [415, 409, 350],
  [421, 411, 353],
  [424, 412, 357],
  [425, 416, 358],
  [432, 419, 360],
  [434, 422, 363],
  [435, 426, 367],
  [437, 429, 368],
  [441, 431, 370],
  [444, 436, 373],
  [445, 439, 377],
  [451, 442, 378],
  [454, 446, 380],
  [455, 449, 383],
  [461, 452, 387],
  [464, 456, 388],
  [465, 459, 390],
  [471, 462, 393],
  [474, 466, 397],
  [475, 469, 398],
  [481, 472, 399],
  [484, 476, 403],
  [485, 479, 407],
  [491, 482, 408],
  [494, 486, 410],
  [495, 489, 413],
  [500, 492, 417],
  [504, 496, 418],
  [505, 499, 420],
  [511, 502, 423],
  [514, 506, 427],
  [515, 509, 428],
  [521, 512, 430],
  [524, 516, 433],
  [525, 519, 438],
  [531, 522, 440],
  [534, 526, 443],
  [535, 529, 447],
  [541, 532, 448],
  [544, 536, 450],
  [545, 539, 453],
  [551, 542, 457],
  [554, 546, 458],
  [555, 549, 460],
  [561, 552, 463],
  [564, 556, 467],
  [565, 559, 468],
  [571, 562, 470],
  [574, 566, 473],
  [575, 569, 477],
  [581, 572, 478],
  [584, 576, 480],
  [585, 579, 483],
  [591, 582, 487],
  [594, 586, 488],
  [595, 589, 490],
  [601, 592, 493],
  [604, 596, 497],
  [605, 599, 498],
  [611, 602, 501],
  [614, 606, 503],
  [615, 609, 507],
  [621, 612, 508],
  [624, 616, 510],
  [625, 619, 513],
  [631, 622, 517],
  [634, 626, 518],
  [635, 629, 520],
  [641, 632, 523],
  [644, 636, 527],
  [645, 638, 528],
  [649, 639, 530],
  [650, 642, 533],
  [651, 646, 537],
  [652, 665, 538],
  [653, 666, 540],
  [654, 667, 543],
  [655, 668, 547],
  [656, 669, 548],
  [657, 670, 550],
  [658, 671, 553],
  [659, 672, 557],
  [660, 673, 558],
  [661, 674, 560],
  [662, 675, 563],
  [663, 676, 567],
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
