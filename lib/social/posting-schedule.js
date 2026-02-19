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

// Twitter posting schedule: maps postOrder → postNumber
// Interleaves standalone bangers (677+) with original threads (0-676)
// Phase 1 (orders 0-99): 50/50 thread/standalone for cold account growth
// Phase 2 (orders 100-300): 1 standalone every 3 posts
// Phase 3 (orders 300+): 1 standalone every 5 posts
// Total: 845 posts
const TWITTER_SCHEDULE = [
  0, 677, 1, 678, 2, 679, 3, 680, 4, 681, 5, 682, 6, 683, 7, 684, 8, 685, 9, 686,
  10, 687, 11, 688, 12, 689, 13, 690, 14, 691, 15, 692, 16, 693, 17, 694, 18, 695, 19, 696,
  20, 697, 21, 698, 22, 699, 23, 700, 24, 701, 25, 702, 26, 703, 27, 704, 28, 705, 29, 706,
  30, 707, 31, 708, 32, 709, 33, 710, 34, 711, 35, 712, 36, 713, 37, 714, 38, 715, 39, 716,
  40, 717, 41, 718, 42, 719, 43, 720, 44, 721, 45, 722, 46, 723, 47, 724, 48, 725, 49, 726,
  50, 51, 727, 52, 53, 728, 54, 55, 729, 56, 57, 730, 58, 59, 731, 60, 61, 732, 62, 63,
  733, 64, 65, 734, 66, 67, 735, 68, 69, 736, 70, 71, 737, 72, 73, 738, 74, 75, 739, 76,
  77, 740, 78, 79, 741, 80, 81, 742, 82, 83, 743, 84, 85, 744, 86, 87, 745, 88, 89, 746,
  90, 91, 747, 92, 93, 748, 94, 95, 749, 96, 97, 750, 98, 99, 751, 100, 101, 752, 102, 103,
  753, 104, 105, 754, 106, 107, 755, 108, 109, 756, 110, 111, 757, 112, 113, 758, 114, 115, 759, 116,
  117, 760, 118, 119, 761, 120, 121, 762, 122, 123, 763, 124, 125, 764, 126, 127, 765, 128, 129, 766,
  130, 131, 767, 132, 133, 768, 134, 135, 769, 136, 137, 770, 138, 139, 771, 140, 141, 772, 142, 143,
  773, 144, 145, 774, 146, 147, 775, 148, 149, 776, 150, 151, 777, 152, 153, 778, 154, 155, 779, 156,
  157, 780, 158, 159, 781, 160, 161, 782, 162, 163, 783, 164, 165, 784, 166, 167, 785, 168, 169, 786,
  170, 171, 787, 172, 173, 788, 174, 175, 789, 176, 177, 790, 178, 179, 791, 180, 181, 792, 182, 183,
  793, 184, 185, 186, 187, 794, 188, 189, 190, 191, 795, 192, 193, 194, 195, 796, 196, 197, 198, 199,
  797, 200, 201, 202, 203, 798, 204, 205, 206, 207, 799, 208, 209, 210, 211, 800, 212, 213, 214, 215,
  801, 216, 217, 218, 219, 802, 220, 221, 222, 223, 803, 224, 225, 226, 227, 804, 228, 229, 230, 231,
  805, 232, 233, 234, 235, 806, 236, 237, 238, 239, 807, 240, 241, 242, 243, 808, 244, 245, 246, 247,
  809, 248, 249, 250, 251, 810, 252, 253, 254, 255, 811, 256, 257, 258, 259, 812, 260, 261, 262, 263,
  813, 264, 265, 266, 267, 814, 268, 269, 270, 271, 815, 272, 273, 274, 275, 816, 276, 277, 278, 279,
  817, 280, 281, 282, 283, 818, 284, 285, 286, 287, 819, 288, 289, 290, 291, 820, 292, 293, 294, 295,
  821, 296, 297, 298, 299, 822, 300, 301, 302, 303, 823, 304, 305, 306, 307, 824, 308, 309, 310, 311,
  825, 312, 313, 314, 315, 826, 316, 317, 318, 319, 827, 320, 321, 322, 323, 828, 324, 325, 326, 327,
  829, 328, 329, 330, 331, 830, 332, 333, 334, 335, 831, 336, 337, 338, 339, 832, 340, 341, 342, 343,
  833, 344, 345, 346, 347, 834, 348, 349, 350, 351, 835, 352, 353, 354, 355, 836, 356, 357, 358, 359,
  837, 360, 361, 362, 363, 838, 364, 365, 366, 367, 839, 368, 369, 370, 371, 840, 372, 373, 374, 375,
  841, 376, 377, 378, 379, 842, 380, 381, 382, 383, 843, 384, 385, 386, 387, 844, 388, 389, 390, 391,
  392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411,
  412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431,
  432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451,
  452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471,
  472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491,
  492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511,
  512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531,
  532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551,
  552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571,
  572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591,
  592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611,
  612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631,
  632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651,
  652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671,
  672, 673, 674, 675, 676,
];

/**
 * Get the post number for a given Twitter post order
 * Uses TWITTER_SCHEDULE to interleave standalone bangers with original threads
 */
function getTwitterPostNumber(postOrder) {
  if (postOrder < 0 || postOrder >= TWITTER_SCHEDULE.length) return null;
  return TWITTER_SCHEDULE[postOrder];
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
  TWITTER_SCHEDULE,
  NINE_GRID_ROWS,
  ALREADY_POSTED,
};
