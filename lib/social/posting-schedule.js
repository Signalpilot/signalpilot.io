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
// Then rows 14-219 — all verified against post_color_mapping.json + content-queue.json
// Format per row: [Orange, Neutral, Teal] = 3 post orders
// 207 rows = 621 posts. Includes all posts from content-queue.json with IG content.
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
  [74, 665, 33],   // Row 24: 074 Quote | 665 EDU | 033 Blog
  [75, 69, 70],   // Row 25: 075 Product | 069 EDU | 070 Docs
  [81, 79, 73],   // Row 26: 081 Marketing | 079 EDU | 073 Blog
  [84, 82, 77],   // Row 27: 084 Quote | 082 EDU | 077 Blog
  [85, 86, 78],   // Row 28: 085 Product | 086 EDU | 078 Chronicle
  [88, 89, 80],   // Row 29: 088 Chronicle | 089 EDU | 080 Docs
  [91, 92, 83],   // Row 30: 091 Marketing | 092 EDU | 083 Blog
  [94, 96, 87],   // Row 31: 094 Quote | 096 EDU | 087 Blog
  [95, 99, 90],   // Row 32: 095 Product | 099 EDU | 090 Docs
  [101, 102, 93],   // Row 33: 101 Marketing | 102 EDU | 093 Blog
  [104, 106, 97],   // Row 34: 104 Quote | 106 EDU | 097 Blog
  [105, 109, 98],   // Row 35: 105 Product | 109 EDU | 098 Chronicle
  [111, 112, 100],   // Row 36: 111 Marketing | 112 EDU | 100 Docs
  [114, 116, 103],   // Row 37: 114 Quote | 116 EDU | 103 Blog
  [115, 119, 107],   // Row 38: 115 Product | 119 EDU | 107 Blog
  [121, 122, 108],   // Row 39: 121 Marketing | 122 EDU | 108 Chronicle
  [124, 126, 110],   // Row 40: 124 Quote | 126 EDU | 110 Docs
  [125, 129, 113],   // Row 41: 125 Product | 129 EDU | 113 Blog
  [131, 132, 117],   // Row 42: 131 Marketing | 132 EDU | 117 Blog
  [134, 136, 118],   // Row 43: 134 Quote | 136 EDU | 118 Chronicle
  [135, 139, 120],   // Row 44: 135 Product | 139 EDU | 120 Docs
  [141, 142, 123],   // Row 45: 141 Marketing | 142 EDU | 123 Blog
  [144, 146, 127],   // Row 46: 144 Quote | 146 EDU | 127 Blog
  [145, 149, 128],   // Row 47: 145 Product | 149 EDU | 128 Chronicle
  [151, 152, 130],   // Row 48: 151 Marketing | 152 EDU | 130 Docs
  [154, 156, 133],   // Row 49: 154 Quote | 156 EDU | 133 Blog
  [155, 159, 137],   // Row 50: 155 Product | 159 EDU | 137 Blog
  [161, 162, 138],   // Row 51: 161 Marketing | 162 EDU | 138 Chronicle
  [164, 166, 140],   // Row 52: 164 Quote | 166 EDU | 140 Docs
  [165, 169, 143],   // Row 53: 165 Product | 169 EDU | 143 Blog
  [171, 172, 147],   // Row 54: 171 Marketing | 172 EDU | 147 Blog
  [174, 176, 148],   // Row 55: 174 Quote | 176 EDU | 148 Chronicle
  [175, 179, 150],   // Row 56: 175 Product | 179 EDU | 150 Docs
  [184, 182, 153],   // Row 57: 184 Marketing | 182 EDU | 153 Blog
  [185, 186, 157],   // Row 58: 185 Product | 186 EDU | 157 Blog
  [191, 189, 158],   // Row 59: 191 Marketing | 189 EDU | 158 Chronicle
  [194, 192, 160],   // Row 60: 194 Quote | 192 EDU | 160 Docs
  [195, 196, 163],   // Row 61: 195 Product | 196 EDU | 163 Blog
  [201, 199, 167],   // Row 62: 201 Marketing | 199 EDU | 167 Blog
  [204, 202, 168],   // Row 63: 204 Quote | 202 EDU | 168 Chronicle
  [205, 206, 170],   // Row 64: 205 Product | 206 EDU | 170 Docs
  [211, 209, 173],   // Row 65: 211 Marketing | 209 EDU | 173 Blog
  [214, 212, 177],   // Row 66: 214 Quote | 212 EDU | 177 Blog
  [215, 216, 178],   // Row 67: 215 Product | 216 EDU | 178 Chronicle
  [221, 219, 180],   // Row 68: 221 Marketing | 219 EDU | 180 Docs
  [224, 222, 181],   // Row 69: 224 Quote | 222 EDU | 181 Docs
  [225, 226, 183],   // Row 70: 225 Product | 226 EDU | 183 Blog
  [231, 229, 187],   // Row 71: 231 Marketing | 229 EDU | 187 Blog
  [234, 232, 188],   // Row 72: 234 Quote | 232 EDU | 188 Chronicle
  [235, 236, 190],   // Row 73: 235 Product | 236 EDU | 190 Docs
  [241, 239, 193],   // Row 74: 241 Marketing | 239 EDU | 193 Blog
  [244, 242, 197],   // Row 75: 244 Quote | 242 EDU | 197 Blog
  [245, 246, 198],   // Row 76: 245 Product | 246 EDU | 198 Chronicle
  [251, 249, 200],   // Row 77: 251 Marketing | 249 EDU | 200 Docs
  [254, 252, 203],   // Row 78: 254 Quote | 252 EDU | 203 Blog
  [255, 256, 207],   // Row 79: 255 Product | 256 EDU | 207 Blog
  [258, 257, 208],   // Row 80: 258 Product | 257 EDU | 208 Chronicle
  [261, 259, 210],   // Row 81: 261 Marketing | 259 EDU | 210 Docs
  [264, 260, 213],   // Row 82: 264 Quote | 260 EDU | 213 Blog
  [265, 262, 217],   // Row 83: 265 Product | 262 EDU | 217 Blog
  [267, 263, 218],   // Row 84: 267 Product | 263 EDU | 218 Chronicle
  [270, 266, 220],   // Row 85: 270 Marketing | 266 EDU | 220 Docs
  [271, 269, 223],   // Row 86: 271 Marketing | 269 EDU | 223 Blog
  [273, 272, 227],   // Row 87: 273 Quote | 272 EDU | 227 Blog
  [274, 276, 228],   // Row 88: 274 Quote | 276 EDU | 228 Chronicle
  [275, 278, 230],   // Row 89: 275 Product | 278 EDU | 230 Docs
  [281, 279, 233],   // Row 90: 281 Marketing | 279 EDU | 233 Blog
  [284, 282, 237],   // Row 91: 284 Quote | 282 EDU | 237 Blog
  [285, 286, 238],   // Row 92: 285 Product | 286 EDU | 238 Chronicle
  [288, 287, 240],   // Row 93: 288 Marketing | 287 EDU | 240 Docs
  [291, 289, 243],   // Row 94: 291 Marketing | 289 EDU | 243 Blog
  [294, 290, 247],   // Row 95: 294 Quote | 290 EDU | 247 Blog
  [295, 292, 248],   // Row 96: 295 Product | 292 EDU | 248 Chronicle
  [297, 293, 250],   // Row 97: 297 Marketing | 293 EDU | 250 Docs
  [300, 296, 253],   // Row 98: 300 Marketing | 296 EDU | 253 Blog
  [304, 298, 268],   // Row 99: 304 Quote | 298 EDU | 268 DOCS
  [305, 299, 277],   // Row 100: 305 Product | 299 EDU | 277 DOCS
  [311, 302, 280],   // Row 101: 311 Marketing | 302 EDU | 280 Blog
  [314, 303, 283],   // Row 102: 314 Quote | 303 EDU | 283 Chronicle
  [315, 306, 301],   // Row 103: 315 Product | 306 EDU | 301 Blog
  [318, 308, 307],   // Row 104: 318 Quote | 308 EDU | 307 DOCS
  [321, 309, 313],   // Row 105: 321 Marketing | 309 EDU | 313 Chronicle
  [324, 310, 328],   // Row 106: 324 Quote | 310 EDU | 328 Chronicle
  [325, 312, 331],   // Row 107: 325 Product | 312 EDU | 331 Docs
  [327, 316, 334],   // Row 108: 327 Quote | 316 EDU | 334 Blog
  [330, 317, 337],   // Row 109: 330 Product | 317 EDU | 337 Chronicle
  [333, 319, 340],   // Row 110: 333 Marketing | 319 EDU | 340 Docs
  [336, 320, 343],   // Row 111: 336 Quote | 320 EDU | 343 Blog
  [339, 322, 346],   // Row 112: 339 Product | 322 EDU | 346 Chronicle
  [342, 323, 349],   // Row 113: 342 Marketing | 323 EDU | 349 Docs
  [345, 326, 352],   // Row 114: 345 Quote | 326 EDU | 352 Blog
  [348, 329, 355],   // Row 115: 348 Product | 329 EDU | 355 Chronicle
  [351, 332, 358],   // Row 116: 351 Marketing | 332 EDU | 358 Docs
  [354, 335, 361],   // Row 117: 354 Quote | 335 EDU | 361 Blog
  [357, 338, 364],   // Row 118: 357 Product | 338 EDU | 364 Chronicle
  [360, 341, 367],   // Row 119: 360 Marketing | 341 EDU | 367 Docs
  [363, 344, 370],   // Row 120: 363 Quote | 344 EDU | 370 Blog
  [366, 347, 373],   // Row 121: 366 Product | 347 EDU | 373 Chronicle
  [369, 350, 376],   // Row 122: 369 Marketing | 350 EDU | 376 Docs
  [372, 353, 379],   // Row 123: 372 Quote | 353 EDU | 379 Blog
  [375, 356, 382],   // Row 124: 375 Product | 356 EDU | 382 Chronicle
  [378, 359, 385],   // Row 125: 378 Marketing | 359 EDU | 385 Docs
  [381, 362, 388],   // Row 126: 381 Quote | 362 EDU | 388 Blog
  [384, 365, 391],   // Row 127: 384 Product | 365 EDU | 391 Chronicle
  [387, 368, 394],   // Row 128: 387 Marketing | 368 EDU | 394 Docs
  [390, 371, 397],   // Row 129: 390 Quote | 371 EDU | 397 Blog
  [393, 374, 400],   // Row 130: 393 Product | 374 EDU | 400 Chronicle
  [396, 377, 403],   // Row 131: 396 Marketing | 377 EDU | 403 Docs
  [399, 380, 406],   // Row 132: 399 Quote | 380 EDU | 406 Blog
  [402, 383, 409],   // Row 133: 402 Product | 383 EDU | 409 Chronicle
  [405, 386, 412],   // Row 134: 405 Marketing | 386 EDU | 412 Docs
  [408, 389, 415],   // Row 135: 408 Quote | 389 EDU | 415 Blog
  [411, 392, 418],   // Row 136: 411 Product | 392 EDU | 418 Chronicle
  [414, 395, 421],   // Row 137: 414 Marketing | 395 EDU | 421 Docs
  [417, 398, 424],   // Row 138: 417 Quote | 398 EDU | 424 Blog
  [420, 401, 427],   // Row 139: 420 Product | 401 EDU | 427 Chronicle
  [423, 404, 430],   // Row 140: 423 Marketing | 404 EDU | 430 Docs
  [426, 407, 433],   // Row 141: 426 Quote | 407 EDU | 433 Blog
  [429, 410, 436],   // Row 142: 429 Product | 410 EDU | 436 Chronicle
  [432, 413, 439],   // Row 143: 432 Marketing | 413 EDU | 439 Docs
  [435, 416, 442],   // Row 144: 435 Quote | 416 EDU | 442 Blog
  [438, 419, 445],   // Row 145: 438 Product | 419 EDU | 445 Chronicle
  [441, 422, 448],   // Row 146: 441 Marketing | 422 EDU | 448 Docs
  [444, 425, 451],   // Row 147: 444 Quote | 425 EDU | 451 Blog
  [447, 428, 454],   // Row 148: 447 Product | 428 EDU | 454 Chronicle
  [450, 431, 457],   // Row 149: 450 Marketing | 431 EDU | 457 Docs
  [453, 434, 460],   // Row 150: 453 Quote | 434 EDU | 460 Blog
  [456, 437, 463],   // Row 151: 456 Product | 437 EDU | 463 Chronicle
  [459, 440, 466],   // Row 152: 459 Marketing | 440 EDU | 466 Docs
  [462, 443, 469],   // Row 153: 462 Quote | 443 EDU | 469 Blog
  [465, 446, 472],   // Row 154: 465 Product | 446 EDU | 472 Chronicle
  [468, 449, 475],   // Row 155: 468 Marketing | 449 EDU | 475 Docs
  [471, 452, 478],   // Row 156: 471 Quote | 452 EDU | 478 Blog
  [474, 455, 481],   // Row 157: 474 Product | 455 EDU | 481 Chronicle
  [477, 458, 484],   // Row 158: 477 Marketing | 458 EDU | 484 Docs
  [480, 461, 487],   // Row 159: 480 Quote | 461 EDU | 487 Blog
  [483, 464, 490],   // Row 160: 483 Product | 464 EDU | 490 Chronicle
  [486, 467, 493],   // Row 161: 486 Marketing | 467 EDU | 493 Docs
  [489, 470, 496],   // Row 162: 489 Quote | 470 EDU | 496 Blog
  [492, 473, 499],   // Row 163: 492 Product | 473 EDU | 499 Chronicle
  [495, 476, 502],   // Row 164: 495 Marketing | 476 EDU | 502 Docs
  [498, 479, 505],   // Row 165: 498 Quote | 479 EDU | 505 Blog
  [501, 482, 508],   // Row 166: 501 Product | 482 EDU | 508 Chronicle
  [504, 485, 511],   // Row 167: 504 Marketing | 485 EDU | 511 Docs
  [507, 488, 514],   // Row 168: 507 Quote | 488 EDU | 514 Blog
  [510, 491, 517],   // Row 169: 510 Product | 491 EDU | 517 Chronicle
  [513, 494, 520],   // Row 170: 513 Marketing | 494 EDU | 520 Docs
  [516, 497, 523],   // Row 171: 516 Quote | 497 EDU | 523 Blog
  [519, 500, 526],   // Row 172: 519 Product | 500 EDU | 526 Chronicle
  [522, 503, 529],   // Row 173: 522 Marketing | 503 EDU | 529 Docs
  [525, 506, 532],   // Row 174: 525 Quote | 506 EDU | 532 Blog
  [528, 509, 535],   // Row 175: 528 Product | 509 EDU | 535 Chronicle
  [531, 512, 538],   // Row 176: 531 Marketing | 512 EDU | 538 Docs
  [534, 515, 541],   // Row 177: 534 Quote | 515 EDU | 541 Blog
  [537, 518, 544],   // Row 178: 537 Product | 518 EDU | 544 Chronicle
  [540, 521, 547],   // Row 179: 540 Marketing | 521 EDU | 547 Docs
  [543, 524, 550],   // Row 180: 543 Quote | 524 EDU | 550 Blog
  [546, 527, 553],   // Row 181: 546 Product | 527 EDU | 553 Chronicle
  [549, 530, 556],   // Row 182: 549 Marketing | 530 EDU | 556 Docs
  [552, 533, 559],   // Row 183: 552 Quote | 533 EDU | 559 Blog
  [555, 536, 562],   // Row 184: 555 Product | 536 EDU | 562 Chronicle
  [558, 539, 565],   // Row 185: 558 Marketing | 539 EDU | 565 Docs
  [561, 542, 568],   // Row 186: 561 Quote | 542 EDU | 568 Blog
  [564, 545, 571],   // Row 187: 564 Product | 545 EDU | 571 Chronicle
  [567, 548, 574],   // Row 188: 567 Marketing | 548 EDU | 574 Docs
  [570, 551, 577],   // Row 189: 570 Quote | 551 EDU | 577 Blog
  [573, 554, 580],   // Row 190: 573 Product | 554 EDU | 580 Chronicle
  [576, 557, 583],   // Row 191: 576 Marketing | 557 EDU | 583 Docs
  [579, 560, 586],   // Row 192: 579 Quote | 560 EDU | 586 Blog
  [582, 563, 589],   // Row 193: 582 Product | 563 EDU | 589 Chronicle
  [585, 566, 592],   // Row 194: 585 Marketing | 566 EDU | 592 Docs
  [588, 569, 595],   // Row 195: 588 Quote | 569 EDU | 595 Blog
  [591, 572, 598],   // Row 196: 591 Product | 572 EDU | 598 Chronicle
  [594, 575, 601],   // Row 197: 594 Marketing | 575 EDU | 601 Docs
  [597, 578, 604],   // Row 198: 597 Quote | 578 EDU | 604 Blog
  [600, 581, 607],   // Row 199: 600 Product | 581 EDU | 607 Chronicle
  [603, 584, 610],   // Row 200: 603 Marketing | 584 EDU | 610 Docs
  [606, 587, 613],   // Row 201: 606 Quote | 587 EDU | 613 Blog
  [609, 590, 616],   // Row 202: 609 Product | 590 EDU | 616 Chronicle
  [612, 593, 619],   // Row 203: 612 Marketing | 593 EDU | 619 Docs
  [615, 596, 622],   // Row 204: 615 Quote | 596 EDU | 622 Blog
  [618, 599, 625],   // Row 205: 618 Product | 599 EDU | 625 Chronicle
  [621, 602, 628],   // Row 206: 621 Marketing | 602 EDU | 628 Docs
  [624, 605, 631],   // Row 207: 624 Quote | 605 EDU | 631 Blog
  [627, 608, 634],   // Row 208: 627 Product | 608 EDU | 634 Chronicle
  [630, 611, 637],   // Row 209: 630 Marketing | 611 EDU | 637 Docs
  [633, 614, 640],   // Row 210: 633 Quote | 614 EDU | 640 Blog
  [636, 617, 643],   // Row 211: 636 Product | 617 EDU | 643 Chronicle
  [639, 620, 646],   // Row 212: 639 Marketing | 620 EDU | 646 Docs
  [642, 623, 649],   // Row 213: 642 Quote | 623 EDU | 649 Blog
  [645, 626, 768],   // Row 214: 645 Product | 626 EDU | 768 Chronicle
  [648, 629, 770],   // Row 215: 648 Marketing | 629 EDU | 770 Chronicle
  [651, 632, 801],   // Row 216: 651 Quote | 632 EDU | 801 Chronicle
  [652, 635, 806],   // Row 217: 652 Product | 635 EDU | 806 Chronicle
  [653, 638, 809],   // Row 218: 653 Marketing | 638 EDU | 809 Chronicle
  [654, 641, 822],   // Row 219: 654 Quote | 641 EDU | 822 Chronicle
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
