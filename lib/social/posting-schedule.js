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
  // Row 13 (post orders 37-39)
  [35, 36, 33],
  // Row 14 (40-42)
  [41, 42, 40],
  // Row 15 (43-45)
  [44, 46, 43],
  // Row 16 (46-48)
  [45, 49, 47],
  // Row 17 (49-51)
  [51, 52, 48],
  // Row 18 (52-54)
  [54, 56, 50],
  // Row 19 (55-57)
  [55, 59, 53],
  // Row 20 (58-60)
  [61, 62, 57],
  // Row 21 (61-63)
  [64, 66, 58],
  // Row 22 (64-66)
  [65, 69, 60],
  // Row 23 (67-69)
  [71, 72, 63],
  // Row 24 (70-72)
  [74, 76, 67],
  // Row 25 (73-75)
  [75, 79, 68],
  // Row 26 (76-78)
  [81, 82, 70],
  // Row 27 (79-81)
  [84, 86, 73],
  // Row 28 (82-84)
  [85, 89, 77],
  // Row 29 (85-87)
  [91, 92, 78],
  // Row 30 (88-90)
  [94, 96, 80],
  // Row 31 (91-93)
  [95, 99, 83],
  // Row 32 (94-96)
  [101, 102, 87],
  // Row 33 (97-99)
  [104, 106, 88],
  // Row 34 (100-102)
  [105, 109, 90],
  // Row 35 (103-105)
  [111, 112, 93],
  // Row 36 (106-108)
  [114, 116, 97],
  // Row 37 (109-111)
  [115, 119, 98],
  // Row 38 (112-114)
  [121, 122, 100],
  // Row 39 (115-117)
  [124, 126, 103],
  // Row 40 (118-120)
  [125, 129, 107],
  // Row 41 (121-123)
  [131, 132, 108],
  // Row 42 (124-126)
  [134, 136, 110],
  // Row 43 (127-129)
  [135, 139, 113],
  // Row 44 (130-132)
  [141, 142, 117],
  // Row 45 (133-135)
  [144, 146, 118],
  // Row 46 (136-138)
  [145, 149, 120],
  // Row 47 (139-141)
  [151, 152, 123],
  // Row 48 (142-144)
  [154, 156, 127],
  // Row 49 (145-147)
  [155, 159, 128],
  // Row 50 (148-150)
  [161, 162, 130],
  // Row 51 (151-153)
  [164, 166, 133],
  // Row 52 (154-156)
  [165, 169, 137],
  // Row 53 (157-159)
  [171, 172, 138],
  // Row 54 (160-162)
  [174, 176, 140],
  // Row 55 (163-165)
  [175, 179, 143],
  // Row 56 (166-168)
  [184, 182, 147],
  // Row 57 (169-171)
  [185, 186, 148],
  // Row 58 (172-174)
  [191, 189, 150],
  // Row 59 (175-177)
  [194, 192, 153],
  // Row 60 (178-180)
  [195, 196, 157],
  // Row 61 (181-183)
  [201, 199, 158],
  // Row 62 (184-186)
  [204, 202, 160],
  // Row 63 (187-189)
  [205, 206, 163],
  // Row 64 (190-192)
  [211, 209, 167],
  // Row 65 (193-195)
  [214, 212, 168],
  // Row 66 (196-198)
  [215, 216, 170],
  // Row 67 (199-201)
  [221, 219, 173],
  // Row 68 (202-204)
  [224, 222, 177],
  // Row 69 (205-207)
  [225, 226, 178],
  // Row 70 (208-210)
  [231, 229, 180],
  // Row 71 (211-213)
  [234, 232, 181],
  // Row 72 (214-216)
  [235, 236, 183],
  // Row 73 (217-219)
  [241, 239, 187],
  // Row 74 (220-222)
  [244, 242, 188],
  // Row 75 (223-225)
  [245, 246, 190],
  // Row 76 (226-228)
  [251, 249, 193],
  // Row 77 (229-231)
  [254, 252, 197],
  // Row 78 (232-234)
  [255, 256, 198],
  // Row 79 (235-237)
  [261, 259, 200],
  // Row 80 (238-240)
  [264, 262, 203],
  // Row 81 (241-243)
  [265, 266, 207],
  // Row 82 (244-246)
  [271, 269, 208],
  // Row 83 (247-249)
  [274, 272, 210],
  // Row 84 (250-252)
  [275, 276, 213],
  // Row 85 (253-255)
  [281, 279, 217],
  // Row 86 (256-258)
  [284, 282, 218],
  // Row 87 (259-261)
  [285, 286, 220],
  // Row 88 (262-264)
  [291, 289, 223],
  // Row 89 (265-267)
  [294, 292, 227],
  // Row 90 (268-270)
  [295, 296, 228],
  // Row 91 (271-273)
  [300, 299, 230],
  // Row 92 (274-276)
  [304, 302, 233],
  // Row 93 (277-279)
  [305, 306, 237],
  // Row 94 (280-282)
  [311, 309, 238],
  // Row 95 (283-285)
  [314, 312, 240],
  // Row 96 (286-288)
  [315, 316, 243],
  // Row 97 (289-291)
  [321, 319, 247],
  // Row 98 (292-294)
  [324, 322, 248],
  // Row 99 (295-297)
  [325, 326, 250],
  // Row 100 (298-300)
  [331, 329, 253],
  // Row 101 (301-303)
  [334, 332, 257],
  // Row 102 (304-306)
  [335, 336, 258],
  // Row 103 (307-309)
  [341, 339, 260],
  // Row 104 (310-312)
  [344, 342, 263],
  // Row 105 (313-315)
  [345, 346, 267],
  // Row 106 (316-318)
  [351, 349, 268],
  // Row 107 (319-321)
  [354, 352, 270],
  // Row 108 (322-324)
  [355, 356, 273],
  // Row 109 (325-327)
  [361, 359, 277],
  // Row 110 (328-330)
  [364, 362, 278],
  // Row 111 (331-333)
  [365, 366, 280],
  // Row 112 (334-336)
  [371, 369, 283],
  // Row 113 (337-339)
  [374, 372, 287],
  // Row 114 (340-342)
  [375, 376, 288],
  // Row 115 (343-345)
  [381, 379, 290],
  // Row 116 (346-348)
  [384, 382, 293],
  // Row 117 (349-351)
  [385, 386, 297],
  // Row 118 (352-354)
  [391, 389, 298],
  // Row 119 (355-357)
  [394, 392, 301],
  // Row 120 (358-360)
  [395, 396, 303],
  // Row 121 (361-363)
  [400, 401, 307],
  // Row 122 (364-366)
  [404, 402, 308],
  // Row 123 (367-369)
  [405, 406, 310],
  // Row 124 (370-372)
  [411, 409, 313],
  // Row 125 (373-375)
  [414, 412, 317],
  // Row 126 (376-378)
  [415, 416, 318],
  // Row 127 (379-381)
  [421, 419, 320],
  // Row 128 (382-384)
  [424, 422, 323],
  // Row 129 (385-387)
  [425, 426, 327],
  // Row 130 (388-390)
  [431, 429, 328],
  // Row 131 (391-393)
  [434, 432, 330],
  // Row 132 (394-396)
  [435, 436, 333],
  // Row 133 (397-399)
  [441, 439, 337],
  // Row 134 (400-402)
  [444, 442, 338],
  // Row 135 (403-405)
  [445, 446, 340],
  // Row 136 (406-408)
  [451, 449, 343],
  // Row 137 (409-411)
  [454, 452, 347],
  // Row 138 (412-414)
  [455, 456, 348],
  // Row 139 (415-417)
  [461, 459, 350],
  // Row 140 (418-420)
  [464, 462, 353],
  // Row 141 (421-423)
  [465, 466, 357],
  // Row 142 (424-426)
  [471, 469, 358],
  // Row 143 (427-429)
  [474, 472, 360],
  // Row 144 (430-432)
  [475, 476, 363],
  // Row 145 (433-435)
  [481, 479, 367],
  // Row 146 (436-438)
  [484, 482, 368],
  // Row 147 (439-441)
  [485, 486, 370],
  // Row 148 (442-444)
  [491, 489, 373],
  // Row 149 (445-447)
  [494, 492, 377],
  // Row 150 (448-450)
  [495, 496, 378],
  // Row 151 (451-453)
  [500, 499, 380],
  // Row 152 (454-456)
  [504, 502, 383],
  // Row 153 (457-459)
  [505, 506, 387],
  // Row 154 (460-462)
  [511, 509, 388],
  // Row 155 (463-465)
  [514, 512, 390],
  // Row 156 (466-468)
  [515, 516, 393],
  // Row 157 (469-471)
  [521, 519, 397],
  // Row 158 (472-474)
  [524, 522, 398],
  // Row 159 (475-477)
  [525, 526, 399],
  // Row 160 (478-480)
  [531, 529, 403],
  // Row 161 (481-483)
  [534, 532, 407],
  // Row 162 (484-486)
  [535, 536, 408],
  // Row 163 (487-489)
  [541, 539, 410],
  // Row 164 (490-492)
  [544, 542, 413],
  // Row 165 (493-495)
  [545, 546, 417],
  // Row 166 (496-498)
  [551, 549, 418],
  // Row 167 (499-501)
  [554, 552, 420],
  // Row 168 (502-504)
  [555, 556, 423],
  // Row 169 (505-507)
  [561, 559, 427],
  // Row 170 (508-510)
  [564, 562, 428],
  // Row 171 (511-513)
  [565, 566, 430],
  // Row 172 (514-516)
  [571, 569, 433],
  // Row 173 (517-519)
  [574, 572, 437],
  // Row 174 (520-522)
  [581, 576, 438],
  // Row 175 (523-525)
  [584, 579, 440],
  // Row 176 (526-528)
  [591, 582, 443],
  // Row 177 (529-531)
  [594, 586, 447],
  // Row 178 (532-534)
  [601, 589, 448],
  // Row 179 (535-537)
  [604, 592, 450],
  // Row 180 (538-540)
  [614, 596, 453],
  // Row 181 (541-543)
  [615, 599, 457],
  // Row 182 (544-546)
  [621, 602, 458],
  // Row 183 (547-549)
  [624, 606, 460],
  // Row 184 (550-552)
  [625, 609, 463],
  // Row 185 (553-555)
  [631, 612, 467],
  // Row 186 (556-558)
  [634, 616, 468],
  // Row 187 (559-561)
  [635, 619, 470],
  // Row 188 (562-564)
  [641, 622, 473],
  // Row 189 (565-567)
  [644, 626, 477],
  // Row 190 (568-570)
  [645, 629, 478],
  // Row 191 (571-573)
  [649, 632, 480],
  // Row 192 (574-576)
  [487, 636, 483],
  // Row 193 (577-579)
  [490, 639, 488],
  // Row 194 (580-582)
  [497, 642, 493],
  // Row 195 (583-585)
  [501, 646, 498],
  // Row 196 (586-588)
  [507, 513, 503],
  // Row 197 (589-591)
  [510, 520, 508],
  // Row 198 (592-594)
  [518, 528, 517],
  // Row 199 (595-597)
  [527, 537, 523],
  // Row 200 (598-600)
  [533, 543, 530],
  // Row 201 (601-603)
  [540, 550, 538],
  // Row 202 (604-606)
  [548, 558, 547],
  // Row 203 (607-609)
  [557, 567, 553],
  // Row 204 (610-612)
  [563, 573, 560],
  // Row 205 (613-615)
  [570, 580, 568],
  // Row 206 (616-618)
  [578, 588, 577],
  // Row 207 (619-621)
  [587, 597, 583],
  // Row 208 (622-624)
  [593, 603, 590],
  // Row 209 (625-627)
  [600, 613, 598],
  // Row 210 (628-630)
  [610, 620, 607],
  // Row 211 (631-633)
  [618, 628, 617],
  // Row 212 (634-636)
  [627, 637, 623],
  // Row 213 (637-639)
  [633, 643, 630],
  // Row 214 (640-642)
  [640, 650, 638],
  // Row 215 (643-645)
  [648, 647, 649],
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
