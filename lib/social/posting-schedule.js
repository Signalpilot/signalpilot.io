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
// Then rows 14-200 — all verified against post_color_mapping.json + content-queue.json
// Format per row: [Orange, Neutral, Teal] = 3 post orders
// 188 rows = 564 posts. Posts 651-675 have no teal content, so schedule ends at row 200.
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
  [74, 69, 70],   // Row 24: 074 Quote | 069 EDU | 070 Docs
  [75, 79, 73],   // Row 25: 075 Product | 079 EDU | 073 Blog
  [81, 82, 77],   // Row 26: 081 Marketing | 082 EDU | 077 Blog
  [84, 86, 78],   // Row 27: 084 Quote | 086 EDU | 078 Chronicle
  [85, 89, 80],   // Row 28: 085 Product | 089 EDU | 080 Docs
  [91, 92, 83],   // Row 29: 091 Marketing | 092 EDU | 083 Blog
  [94, 96, 87],   // Row 30: 094 Quote | 096 EDU | 087 Blog
  [95, 99, 90],   // Row 31: 095 Product | 099 EDU | 090 Docs
  [88, 102, 93],   // Row 32: 088 Chronicle | 102 EDU | 093 Blog
  [101, 106, 97],   // Row 33: 101 Marketing | 106 EDU | 097 Blog
  [104, 109, 98],   // Row 34: 104 Quote | 109 EDU | 098 Chronicle
  [105, 112, 100],   // Row 35: 105 Product | 112 EDU | 100 Docs
  [111, 116, 103],   // Row 36: 111 Marketing | 116 EDU | 103 Blog
  [114, 119, 107],   // Row 37: 114 Quote | 119 EDU | 107 Blog
  [115, 122, 108],   // Row 38: 115 Product | 122 EDU | 108 Chronicle
  [121, 126, 110],   // Row 39: 121 Marketing | 126 EDU | 110 Docs
  [125, 129, 113],   // Row 40: 125 Product | 129 EDU | 113 Blog
  [124, 132, 117],   // Row 41: 124 Quote | 132 EDU | 117 Blog
  [131, 139, 118],   // Row 42: 131 Marketing | 139 EDU | 118 Chronicle
  [135, 142, 140],   // Row 43: 135 Product | 142 EDU | 140 Docs
  [141, 146, 120],   // Row 44: 141 Marketing | 146 EDU | 120 Docs
  [144, 149, 123],   // Row 45: 144 Quote | 149 EDU | 123 Blog
  [145, 152, 127],   // Row 46: 145 Product | 152 EDU | 127 Blog
  [151, 156, 128],   // Row 47: 151 Marketing | 156 EDU | 128 Chronicle
  [155, 159, 150],   // Row 48: 155 Product | 159 EDU | 150 Docs
  [161, 136, 130],   // Row 49: 161 Marketing | 136 EDU | 130 Docs
  [165, 162, 133],   // Row 50: 165 Product | 162 EDU | 133 Blog
  [171, 166, 160],   // Row 51: 171 Marketing | 166 EDU | 160 Docs
  [175, 169, 137],   // Row 52: 175 Product | 169 EDU | 137 Blog
  [134, 172, 138],   // Row 53: 134 Quote | 172 EDU | 138 Chronicle
  [184, 176, 143],   // Row 54: 184 Marketing | 176 EDU | 143 Blog
  [185, 179, 147],   // Row 55: 185 Product | 179 EDU | 147 Blog
  [191, 182, 170],   // Row 56: 191 Marketing | 182 EDU | 170 Docs
  [194, 186, 148],   // Row 57: 194 Quote | 186 EDU | 148 Chronicle
  [195, 189, 153],   // Row 58: 195 Product | 189 EDU | 153 Blog
  [201, 192, 157],   // Row 59: 201 Marketing | 192 EDU | 157 Blog
  [205, 196, 180],   // Row 60: 205 Product | 196 EDU | 180 Docs
  [211, 199, 158],   // Row 61: 211 Marketing | 199 EDU | 158 Chronicle
  [154, 202, 163],   // Row 62: 154 Quote | 202 EDU | 163 Blog
  [214, 206, 167],   // Row 63: 214 Quote | 206 EDU | 167 Blog
  [215, 209, 168],   // Row 64: 215 Product | 209 EDU | 168 Chronicle
  [221, 212, 173],   // Row 65: 221 Marketing | 212 EDU | 173 Blog
  [224, 216, 177],   // Row 66: 224 Quote | 216 EDU | 177 Blog
  [164, 219, 178],   // Row 67: 164 Quote | 219 EDU | 178 Chronicle
  [225, 222, 181],   // Row 68: 225 Product | 222 EDU | 181 Docs
  [234, 226, 183],   // Row 69: 234 Quote | 226 EDU | 183 Blog
  [235, 229, 187],   // Row 70: 235 Product | 229 EDU | 187 Blog
  [241, 232, 188],   // Row 71: 241 Marketing | 232 EDU | 188 Chronicle
  [174, 236, 190],   // Row 72: 174 Quote | 236 EDU | 190 Docs
  [244, 239, 193],   // Row 73: 244 Quote | 239 EDU | 193 Blog
  [245, 242, 197],   // Row 74: 245 Product | 242 EDU | 197 Blog
  [251, 246, 198],   // Row 75: 251 Marketing | 246 EDU | 198 Chronicle
  [254, 249, 200],   // Row 76: 254 Quote | 249 EDU | 200 Docs
  [255, 252, 203],   // Row 77: 255 Product | 252 EDU | 203 Blog
  [261, 256, 207],   // Row 78: 261 Marketing | 256 EDU | 207 Blog
  [264, 259, 208],   // Row 79: 264 Quote | 259 EDU | 208 Chronicle
  [265, 262, 210],   // Row 80: 265 Product | 262 EDU | 210 Docs
  [271, 266, 213],   // Row 81: 271 Marketing | 266 EDU | 213 Blog
  [274, 269, 217],   // Row 82: 274 Quote | 269 EDU | 217 Blog
  [231, 320, 218],   // Row 83: 231 Marketing | 320 EDU | 218 Chronicle
  [275, 272, 220],   // Row 84: 275 Product | 272 EDU | 220 Docs
  [281, 276, 223],   // Row 85: 281 Marketing | 276 EDU | 223 Blog
  [284, 279, 227],   // Row 86: 284 Quote | 279 EDU | 227 Blog
  [204, 282, 228],   // Row 87: 204 Quote | 282 EDU | 228 Chronicle
  [285, 286, 230],   // Row 88: 285 Product | 286 EDU | 230 Docs
  [291, 289, 233],   // Row 89: 291 Marketing | 289 EDU | 233 Blog
  [294, 292, 237],   // Row 90: 294 Quote | 292 EDU | 237 Blog
  [295, 335, 238],   // Row 91: 295 Product | 335 EDU | 238 Chronicle
  [300, 293, 331],   // Row 92: 300 Marketing | 293 EDU | 331 Docs
  [305, 341, 240],   // Row 93: 305 Product | 341 EDU | 240 Docs
  [311, 296, 334],   // Row 94: 311 Marketing | 296 EDU | 334 Blog
  [314, 344, 243],   // Row 95: 314 Quote | 344 EDU | 243 Blog
  [315, 299, 247],   // Row 96: 315 Product | 299 EDU | 247 Blog
  [321, 302, 248],   // Row 97: 321 Marketing | 302 EDU | 248 Chronicle
  [324, 306, 250],   // Row 98: 324 Quote | 306 EDU | 250 Docs
  [325, 257, 253],   // Row 99: 325 Product | 257 EDU | 253 Blog
  [330, 309, 355],   // Row 100: 330 Product | 309 EDU | 355 Chronicle
  [345, 312, 364],   // Row 101: 345 Quote | 312 EDU | 364 Chronicle
  [351, 260, 268],   // Row 102: 351 Marketing | 260 EDU | 268 Docs
  [354, 316, 277],   // Row 103: 354 Quote | 316 EDU | 277 Docs
  [258, 263, 385],   // Row 104: 258 Product | 263 EDU | 385 Docs
  [267, 365, 280],   // Row 105: 267 Product | 365 EDU | 280 Blog
  [270, 319, 283],   // Row 106: 270 Marketing | 319 EDU | 283 Chronicle
  [375, 371, 391],   // Row 107: 375 Product | 371 EDU | 391 Chronicle
  [273, 322, 346],   // Row 108: 273 Quote | 322 EDU | 346 Chronicle
  [381, 374, 394],   // Row 109: 381 Quote | 374 EDU | 394 Docs
  [384, 326, 349],   // Row 110: 384 Product | 326 EDU | 349 Docs
  [336, 329, 400],   // Row 111: 336 Quote | 329 EDU | 400 Chronicle
  [339, 332, 352],   // Row 112: 339 Product | 332 EDU | 352 Blog
  [342, 278, 301],   // Row 113: 342 Marketing | 278 EDU | 301 Blog
  [348, 389, 361],   // Row 114: 348 Product | 389 EDU | 361 Blog
  [288, 287, 415],   // Row 115: 288 Marketing | 287 EDU | 415 Blog
  [297, 395, 421],   // Row 116: 297 Marketing | 395 EDU | 421 Docs
  [405, 290, 307],   // Row 117: 405 Marketing | 290 EDU | 307 Docs
  [414, 404, 424],   // Row 118: 414 Marketing | 404 EDU | 424 Blog
  [304, 356, 376],   // Row 119: 304 Quote | 356 EDU | 376 Docs
  [366, 298, 313],   // Row 120: 366 Product | 298 EDU | 313 Chronicle
  [423, 359, 379],   // Row 121: 423 Marketing | 359 EDU | 379 Blog
  [369, 303, 382],   // Row 122: 369 Marketing | 303 EDU | 382 Chronicle
  [372, 362, 328],   // Row 123: 372 Quote | 362 EDU | 328 Chronicle
  [432, 308, 445],   // Row 124: 432 Marketing | 308 EDU | 445 Chronicle
  [318, 310, 337],   // Row 125: 318 Quote | 310 EDU | 337 Chronicle
  [435, 425, 451],   // Row 126: 435 Quote | 425 EDU | 451 Blog
  [327, 317, 406],   // Row 127: 327 Quote | 317 EDU | 406 Blog
  [441, 434, 454],   // Row 128: 441 Marketing | 434 EDU | 454 Chronicle
  [396, 386, 409],   // Row 129: 396 Marketing | 386 EDU | 409 Chronicle
  [444, 323, 340],   // Row 130: 444 Quote | 323 EDU | 340 Docs
  [333, 437, 343],   // Row 131: 333 Marketing | 437 EDU | 343 Blog
  [402, 392, 412],   // Row 132: 402 Product | 392 EDU | 412 Docs
  [411, 401, 358],   // Row 133: 411 Product | 401 EDU | 358 Docs
  [465, 338, 475],   // Row 134: 465 Product | 338 EDU | 475 Docs
  [471, 455, 481],   // Row 135: 471 Quote | 455 EDU | 481 Chronicle
  [426, 461, 436],   // Row 136: 426 Quote | 461 EDU | 436 Chronicle
  [357, 347, 484],   // Row 137: 357 Product | 347 EDU | 484 Docs
  [474, 464, 439],   // Row 138: 474 Product | 464 EDU | 439 Docs
  [429, 419, 367],   // Row 139: 429 Product | 419 EDU | 367 Docs
  [360, 350, 442],   // Row 140: 360 Marketing | 350 EDU | 442 Blog
  [363, 422, 370],   // Row 141: 363 Quote | 422 EDU | 370 Blog
  [495, 353, 373],   // Row 142: 495 Marketing | 353 EDU | 373 Chronicle
  [456, 431, 505],   // Row 143: 456 Product | 431 EDU | 505 Blog
  [378, 485, 466],   // Row 144: 378 Marketing | 485 EDU | 466 Docs
  [459, 368, 511],   // Row 145: 459 Marketing | 368 EDU | 511 Docs
  [504, 491, 469],   // Row 146: 504 Marketing | 491 EDU | 469 Blog
  [462, 446, 388],   // Row 147: 462 Quote | 446 EDU | 388 Blog
  [387, 494, 514],   // Row 148: 387 Marketing | 494 EDU | 514 Blog
  [390, 449, 472],   // Row 149: 390 Quote | 449 EDU | 472 Chronicle
  [393, 452, 397],   // Row 150: 393 Product | 452 EDU | 397 Blog
  [525, 377, 403],   // Row 151: 525 Quote | 377 EDU | 403 Docs
  [486, 500, 496],   // Row 152: 486 Marketing | 500 EDU | 496 Blog
  [399, 503, 535],   // Row 153: 399 Quote | 503 EDU | 535 Chronicle
  [489, 380, 499],   // Row 154: 489 Quote | 380 EDU | 499 Chronicle
  [531, 383, 538],   // Row 155: 531 Marketing | 383 EDU | 538 Docs
  [492, 515, 502],   // Row 156: 492 Product | 515 EDU | 502 Docs
  [534, 476, 541],   // Row 157: 534 Quote | 476 EDU | 541 Blog
  [408, 521, 544],   // Row 158: 408 Quote | 521 EDU | 544 Chronicle
  [417, 479, 418],   // Row 159: 417 Quote | 479 EDU | 418 Chronicle
  [516, 524, 427],   // Row 160: 516 Quote | 524 EDU | 427 Chronicle
  [420, 482, 526],   // Row 161: 420 Product | 482 EDU | 526 Chronicle
  [519, 398, 430],   // Row 162: 519 Product | 398 EDU | 430 Docs
  [555, 530, 529],   // Row 163: 555 Product | 530 EDU | 529 Docs
  [522, 407, 433],   // Row 164: 522 Marketing | 407 EDU | 433 Blog
  [561, 410, 565],   // Row 165: 561 Quote | 410 EDU | 565 Docs
  [564, 413, 532],   // Row 166: 564 Product | 413 EDU | 532 Blog
  [438, 506, 571],   // Row 167: 438 Product | 506 EDU | 571 Chronicle
  [447, 416, 574],   // Row 168: 447 Product | 416 EDU | 574 Docs
  [546, 509, 448],   // Row 169: 546 Product | 509 EDU | 448 Docs
  [549, 545, 556],   // Row 170: 549 Marketing | 545 EDU | 556 Docs
  [450, 512, 457],   // Row 171: 450 Marketing | 512 EDU | 457 Docs
  [585, 551, 559],   // Row 172: 585 Marketing | 551 EDU | 559 Blog
  [552, 554, 595],   // Row 173: 552 Quote | 554 EDU | 595 Blog
  [453, 428, 562],   // Row 174: 453 Quote | 428 EDU | 562 Chronicle
  [591, 536, 460],   // Row 175: 591 Product | 536 EDU | 460 Blog
  [594, 440, 601],   // Row 176: 594 Marketing | 440 EDU | 601 Docs
  [468, 539, 463],   // Row 177: 468 Marketing | 539 EDU | 463 Chronicle
  [576, 443, 604],   // Row 178: 576 Marketing | 443 EDU | 604 Blog
  [579, 575, 586],   // Row 179: 579 Quote | 575 EDU | 586 Blog
  [615, 542, 478],   // Row 180: 615 Quote | 542 EDU | 478 Blog
  [582, 581, 589],   // Row 181: 582 Product | 581 EDU | 589 Chronicle
  [477, 584, 625],   // Row 182: 477 Marketing | 584 EDU | 625 Chronicle
  [621, 458, 592],   // Row 183: 621 Marketing | 458 EDU | 592 Docs
  [624, 566, 631],   // Row 184: 624 Quote | 566 EDU | 631 Blog
  [480, 569, 487],   // Row 185: 480 Quote | 569 EDU | 487 Blog
  [483, 467, 634],   // Row 186: 483 Product | 467 EDU | 634 Chronicle
  [606, 605, 490],   // Row 187: 606 Quote | 605 EDU | 490 Chronicle
  [609, 572, 493],   // Row 188: 609 Product | 572 EDU | 493 Docs
  [645, 611, 649],   // Row 189: 645 Product | 611 EDU | 649 Blog
  [612, 470, 616],   // Row 190: 612 Marketing | 470 EDU | 616 Chronicle
  [498, 614, 619],   // Row 191: 498 Quote | 614 EDU | 619 Docs
  [501, 473, 622],   // Row 192: 501 Product | 473 EDU | 622 Blog
  [507, 596, 508],   // Row 193: 507 Quote | 596 EDU | 508 Chronicle
  [651, 599, 517],   // Row 194: 651 Quote | 599 EDU | 517 Chronicle
  [652, 488, 520],   // Row 195: 652 Product | 488 EDU | 520 Docs
  [510, 635, 523],   // Row 196: 510 Product | 635 EDU | 523 Blog
  [653, 602, 646],   // Row 197: 653 Marketing | 602 EDU | 646 Docs
  [513, 641, 547],   // Row 198: 513 Marketing | 641 EDU | 547 Docs
  [654, 644, 550],   // Row 199: 654 Quote | 644 EDU | 550 Blog
  [655, 497, 553]   // Row 200: 655 Product | 497 EDU | 553 Chronicle
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
