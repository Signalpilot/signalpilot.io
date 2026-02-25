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
  [41, 42, 43],   // Row 14: 041 Marketing | 042 EDU | 043 Blog
  [44, 46, 47],   // Row 15: 044 Quote | 046 EDU | 047 Blog
  [45, 49, 48],   // Row 16: 045 Product | 049 EDU | 048 Chronicle
  [51, 52, 50],   // Row 17: 051 Marketing | 052 EDU | 050 Docs
  [54, 56, 53],   // Row 18: 054 Quote | 056 EDU | 053 Blog
  [55, 59, 57],   // Row 19: 055 Product | 059 EDU | 057 Blog
  [65, 62, 60],   // Row 20: 065 Product | 062 EDU | 060 Docs
  [61, 66, 63],   // Row 21: 061 Marketing | 066 EDU | 063 Blog
  [64, 72, 58],   // Row 22: 064 Quote | 072 EDU | 058 Chronicle
  [71, 76, 68],   // Row 23: 071 Marketing | 076 EDU | 068 Chronicle
  [74, 69, 70],
  [75, 79, 73],
  [81, 82, 77],
  [84, 86, 78],
  [85, 89, 80],
  [91, 92, 83],
  [94, 96, 87],
  [95, 99, 88],
  [101, 102, 90],
  [104, 106, 93],
  [105, 109, 97],
  [111, 112, 98],
  [114, 116, 100],
  [115, 119, 103],
  [121, 122, 107],
  [125, 124, 108],
  [131, 126, 110],
  [135, 129, 113],
  [141, 132, 117],
  [144, 139, 118],
  [145, 140, 120],
  [151, 142, 123],
  [155, 146, 127],
  [161, 149, 128],
  [165, 150, 130],
  [171, 152, 133],
  [175, 156, 134],
  [184, 159, 136],
  [185, 160, 137],
  [191, 162, 138],
  [194, 166, 143],
  [195, 169, 147],
  [201, 170, 148],
  [205, 172, 153],
  [211, 176, 154],
  [214, 179, 157],
  [215, 180, 158],
  [221, 182, 163],
  [224, 186, 164],
  [225, 189, 167],
  [234, 192, 168],
  [235, 196, 173],
  [241, 199, 174],
  [244, 202, 177],
  [245, 206, 178],
  [251, 209, 181],
  [254, 212, 183],
  [255, 216, 187],
  [261, 219, 188],
  [264, 222, 190],
  [265, 226, 193],
  [271, 229, 197],
  [274, 231, 198],
  [275, 232, 200],
  [281, 236, 203],
  [284, 239, 204],
  [285, 242, 207],
  [291, 246, 208],
  [294, 249, 210],
  [295, 252, 213],
  [300, 256, 217],
  [305, 259, 218],
  [311, 262, 220],
  [314, 266, 223],
  [315, 269, 227],
  [320, 272, 228],
  [321, 276, 230],
  [324, 279, 233],
  [325, 282, 237],
  [330, 286, 238],
  [331, 289, 240],
  [334, 292, 243],
  [335, 293, 247],
  [341, 296, 248],
  [344, 299, 250],
  [345, 302, 253],
  [351, 306, 257],
  [354, 309, 258],
  [355, 312, 260],
  [364, 316, 263],
  [365, 319, 267],
  [371, 322, 268],
  [374, 326, 270],
  [375, 329, 273],
  [381, 332, 277],
  [384, 336, 278],
  [385, 339, 280],
  [389, 342, 283],
  [391, 346, 287],
  [394, 348, 288],
  [395, 349, 290],
  [400, 352, 297],
  [404, 356, 298],
  [405, 359, 301],
  [414, 361, 303],
  [415, 362, 304],
  [421, 366, 307],
  [423, 369, 308],
  [424, 372, 310],
  [425, 376, 313],
  [432, 379, 317],
  [434, 382, 318],
  [435, 386, 323],
  [437, 392, 327],
  [441, 396, 328],
  [444, 401, 333],
  [445, 402, 337],
  [451, 406, 338],
  [454, 409, 340],
  [455, 411, 343],
  [461, 412, 347],
  [464, 419, 350],
  [465, 422, 353],
  [471, 426, 357],
  [474, 429, 358],
  [475, 431, 360],
  [481, 436, 363],
  [484, 439, 367],
  [485, 442, 368],
  [491, 446, 370],
  [494, 449, 373],
  [495, 452, 377],
  [500, 456, 378],
  [503, 459, 380],
  [504, 462, 383],
  [505, 466, 387],
  [511, 469, 388],
  [514, 472, 390],
  [515, 476, 393],
  [521, 479, 397],
  [524, 482, 398],
  [525, 486, 399],
  [530, 489, 403],
  [531, 492, 407],
  [534, 496, 408],
  [535, 499, 410],
  [538, 502, 413],
  [541, 506, 416],
  [544, 509, 417],
  [545, 512, 418],
  [551, 516, 420],
  [554, 519, 427],
  [555, 522, 428],
  [561, 526, 430],
  [564, 529, 433],
  [565, 532, 438],
  [571, 536, 440],
  [574, 539, 443],
  [575, 542, 447],
  [581, 546, 448],
  [584, 549, 450],
  [585, 552, 453],
  [591, 556, 457],
  [594, 559, 458],
  [595, 562, 460],
  [601, 566, 463],
  [604, 569, 467],
  [605, 572, 468],
  [611, 576, 470],
  [614, 579, 473],
  [615, 582, 477],
  [621, 586, 478],
  [624, 589, 480],
  [625, 592, 483],
  [631, 596, 487],
  [634, 599, 488],
  [635, 602, 490],
  [641, 606, 493],
  [644, 609, 497],
  [645, 612, 498],
  [649, 616, 501],
  [650, 619, 507],
  [651, 622, 508],
  [652, 626, 510],
  [653, 629, 513],
  [654, 632, 517],
  [655, 636, 518],
  [656, 638, 520],
  [657, 639, 523],
  [658, 642, 527],
  [659, 646, 528],
  [660, 665, 533],
  [660, 666, 537],
  [661, 667, 540],
  [661, 668, 543],
  [662, 669, 547],
  [662, 670, 548],
  [663, 671, 550],
  [663, 672, 553],
  [664, 673, 557],
  [664, 674, 558],
  [664, 675, 560]
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
// Interleaves short 3-tweet bangers (677+) with longer threads (0-676)
// Phase 1 (orders 0-99): 50/50 thread/banger for cold account growth
// Phase 2 (orders 100-300): 1 banger every 3 posts
// PostOrders 0-56: identity mapping (already posted via old system)
// PostOrders 57-156: 50/50 alternation (long thread, banger, long thread, banger)
// PostOrders 157-456: 1 banger every 3 posts (thread, thread, banger)
// PostOrders 457+: 1 banger every 5 posts, then pure threads
// Total: 845 posts (677 long threads + 168 short 3-tweet bangers)
const TWITTER_SCHEDULE = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 677, 58,
  678, 59, 679, 60, 680, 61, 681, 62, 682, 63, 683, 64, 684, 65, 685, 66, 686, 67, 687, 68,
  688, 69, 689, 70, 690, 71, 691, 72, 692, 73, 693, 74, 694, 75, 695, 76, 696, 77, 697, 78,
  698, 79, 699, 80, 700, 81, 701, 82, 702, 83, 703, 84, 704, 85, 705, 86, 706, 87, 707, 88,
  708, 89, 709, 90, 710, 91, 711, 92, 712, 93, 713, 94, 714, 95, 715, 96, 716, 97, 717, 98,
  718, 99, 719, 100, 720, 101, 721, 102, 722, 103, 723, 104, 724, 105, 725, 106, 726, 107, 108, 727,
  109, 110, 728, 111, 112, 729, 113, 114, 730, 115, 116, 731, 117, 118, 732, 119, 120, 733, 121, 122,
  734, 123, 124, 735, 125, 126, 736, 127, 128, 737, 129, 130, 738, 131, 132, 739, 133, 134, 740, 135,
  136, 741, 137, 138, 742, 139, 140, 743, 141, 142, 744, 143, 144, 745, 145, 146, 746, 147, 148, 747,
  149, 150, 748, 151, 152, 749, 153, 154, 750, 155, 156, 751, 157, 158, 752, 159, 160, 753, 161, 162,
  754, 163, 164, 755, 165, 166, 756, 167, 168, 757, 169, 170, 758, 171, 172, 759, 173, 174, 760, 175,
  176, 761, 177, 178, 762, 179, 180, 763, 181, 182, 764, 183, 184, 765, 185, 186, 766, 187, 188, 767,
  189, 190, 768, 191, 192, 769, 193, 194, 770, 195, 196, 771, 197, 198, 772, 199, 200, 773, 201, 202,
  774, 203, 204, 775, 205, 206, 776, 207, 208, 777, 209, 210, 778, 211, 212, 779, 213, 214, 780, 215,
  216, 781, 217, 218, 782, 219, 220, 783, 221, 222, 784, 223, 224, 785, 225, 226, 786, 227, 228, 787,
  229, 230, 788, 231, 232, 789, 233, 234, 790, 235, 236, 791, 237, 238, 792, 239, 240, 793, 241, 242,
  794, 243, 244, 795, 245, 246, 796, 247, 248, 797, 249, 250, 798, 251, 252, 799, 253, 254, 800, 255,
  256, 801, 257, 258, 802, 259, 260, 803, 261, 262, 804, 263, 264, 805, 265, 266, 806, 267, 268, 807,
  269, 270, 808, 271, 272, 809, 273, 274, 810, 275, 276, 811, 277, 278, 812, 279, 280, 813, 281, 282,
  814, 283, 284, 815, 285, 286, 816, 287, 288, 817, 289, 290, 818, 291, 292, 819, 293, 294, 820, 295,
  296, 821, 297, 298, 822, 299, 300, 823, 301, 302, 824, 303, 304, 825, 305, 306, 826, 307, 308, 309,
  310, 827, 311, 312, 313, 314, 828, 315, 316, 317, 318, 829, 319, 320, 321, 322, 830, 323, 324, 325,
  326, 831, 327, 328, 329, 330, 832, 331, 332, 333, 334, 833, 335, 336, 337, 338, 834, 339, 340, 341,
  342, 835, 343, 344, 345, 346, 836, 347, 348, 349, 350, 837, 351, 352, 353, 354, 838, 355, 356, 357,
  358, 839, 359, 360, 361, 362, 840, 363, 364, 365, 366, 841, 367, 368, 369, 370, 842, 371, 372, 373,
  374, 843, 375, 376, 377, 378, 844, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391,
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
 * Uses TWITTER_SCHEDULE to interleave short 3-tweet bangers with longer threads
 */
function getTwitterPostNumber(postOrder) {
  if (postOrder < 0 || postOrder >= TWITTER_SCHEDULE.length) return null;
  return TWITTER_SCHEDULE[postOrder];
}

/**
 * Get post number for a given platform and post order
 */
function getPostNumber(platform, postOrder) {
  if (platform === 'instagram' || platform === 'reels') {
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
