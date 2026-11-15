// Lucide icons rendered to SVG, one meaning each. The shapes are Lucide's
// own, copied here so every module resolves by relative import (no bare
// `lucide` import for a page without a bundler): to add an icon, copy its
// node from lucide@1.8.0's dist/esm/icons/<name>.js.

/**
 * @license Icon shapes from Lucide v1.8.0 (https://lucide.dev).
 *
 * ISC License
 *
 * Copyright (c) 2026 Lucide Icons and Contributors
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * Of these, Calendar, Check, ChevronDown, ChevronsRight, ChevronsUp, Clock,
 * Crosshair, ExternalLink, Info, Link, LogIn, LogOut, Maximize, Target, X,
 * ZoomIn and ZoomOut are derived from the Feather project:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-present Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { C } from './tokens.js';
import type { Icon } from './dom.js';

/** An icon's shapes, as Lucide gives them: SVG elements on a 24 px grid,
 *  each its tag and attributes. */
type IconNode = ReadonlyArray<readonly [tag: string, attrs: Readonly<Record<string, string>>]>;

// The shapes, by Lucide's names (ScatterChart is Lucide's chart-scatter,
// Filter its funnel).
const Users: IconNode = [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }], ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744" }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }], ["circle", { cx: "9", cy: "7", r: "4" }]];
const Clock: IconNode = [["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "M12 6v6l4 2" }]];
const Skull: IconNode = [["path", { d: "m12.5 17-.5-1-.5 1h1z" }], ["path", { d: "M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z" }], ["circle", { cx: "15", cy: "12", r: "1" }], ["circle", { cx: "9", cy: "12", r: "1" }]];
const Film: IconNode = [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }], ["path", { d: "M7 3v18" }], ["path", { d: "M3 7.5h4" }], ["path", { d: "M3 12h18" }], ["path", { d: "M3 16.5h4" }], ["path", { d: "M17 3v18" }], ["path", { d: "M17 7.5h4" }], ["path", { d: "M17 16.5h4" }]];
const Calendar: IconNode = [["path", { d: "M8 2v4" }], ["path", { d: "M16 2v4" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2" }], ["path", { d: "M3 10h18" }]];
const Hammer: IconNode = [["path", { d: "m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9" }], ["path", { d: "m18 15 4-4" }], ["path", { d: "m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" }]];
const Signpost: IconNode = [["path", { d: "M12 13v8" }], ["path", { d: "M12 3v3" }], ["path", { d: "M2.354 10.354a1.207 1.207 0 0 1 0-1.708l2.06-2.06A2 2 0 0 1 5.828 6h12.344a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H5.828a2 2 0 0 1-1.414-.586z" }]];
const Play: IconNode = [["path", { d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" }]];
const Pause: IconNode = [["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1" }], ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1" }]];
const SkipBack: IconNode = [["path", { d: "M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" }], ["path", { d: "M3 20V4" }]];
const SkipForward: IconNode = [["path", { d: "M21 4v16" }], ["path", { d: "M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" }]];
const Layers: IconNode = [["path", { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" }], ["path", { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" }], ["path", { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" }]];
const Flame: IconNode = [["path", { d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" }]];
const Waypoints: IconNode = [["path", { d: "m10.586 5.414-5.172 5.172" }], ["path", { d: "m18.586 13.414-5.172 5.172" }], ["path", { d: "M6 12h12" }], ["circle", { cx: "12", cy: "20", r: "2" }], ["circle", { cx: "12", cy: "4", r: "2" }], ["circle", { cx: "20", cy: "12", r: "2" }], ["circle", { cx: "4", cy: "12", r: "2" }]];
const ScatterChart: IconNode = [["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor" }], ["circle", { cx: "18.5", cy: "5.5", r: ".5", fill: "currentColor" }], ["circle", { cx: "11.5", cy: "11.5", r: ".5", fill: "currentColor" }], ["circle", { cx: "7.5", cy: "16.5", r: ".5", fill: "currentColor" }], ["circle", { cx: "17.5", cy: "14.5", r: ".5", fill: "currentColor" }], ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16" }]];
const Grid3x3: IconNode = [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }], ["path", { d: "M3 9h18" }], ["path", { d: "M3 15h18" }], ["path", { d: "M9 3v18" }], ["path", { d: "M15 3v18" }]];
const Copy: IconNode = [["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]];
const Check: IconNode = [["path", { d: "M20 6 9 17l-5-5" }]];
const ChevronDown: IconNode = [["path", { d: "m6 9 6 6 6-6" }]];
const User: IconNode = [["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }], ["circle", { cx: "12", cy: "7", r: "4" }]];
const RefreshCw: IconNode = [["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }], ["path", { d: "M21 3v5h-5" }], ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }], ["path", { d: "M8 16H3v5" }]];
const MessageSquarePlus: IconNode = [["path", { d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" }], ["path", { d: "M12 8v6" }], ["path", { d: "M9 11h6" }]];
const X: IconNode = [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]];
const Landmark: IconNode = [["path", { d: "M10 18v-7" }], ["path", { d: "M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" }], ["path", { d: "M14 18v-7" }], ["path", { d: "M18 18v-7" }], ["path", { d: "M3 22h18" }], ["path", { d: "M6 18v-7" }]];
const Award: IconNode = [["path", { d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" }], ["circle", { cx: "12", cy: "8", r: "6" }]];
const Maximize: IconNode = [["path", { d: "M8 3H5a2 2 0 0 0-2 2v3" }], ["path", { d: "M21 8V5a2 2 0 0 0-2-2h-3" }], ["path", { d: "M3 16v3a2 2 0 0 0 2 2h3" }], ["path", { d: "M16 21h3a2 2 0 0 0 2-2v-3" }]];
const Heart: IconNode = [["path", { d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" }]];
const Zap: IconNode = [["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" }]];
const Activity: IconNode = [["path", { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" }]];
const Flag: IconNode = [["path", { d: "M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" }]];
const Bomb: IconNode = [["circle", { cx: "11", cy: "13", r: "9" }], ["path", { d: "M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95" }], ["path", { d: "m22 2-1.5 1.5" }]];
const Package: IconNode = [["path", { d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" }], ["path", { d: "M12 22V12" }], ["polyline", { points: "3.29 7 12 12 20.71 7" }], ["path", { d: "m7.5 4.27 9 5.15" }]];
const Hand: IconNode = [["path", { d: "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" }], ["path", { d: "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" }], ["path", { d: "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" }], ["path", { d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" }]];
const Footprints: IconNode = [["path", { d: "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" }], ["path", { d: "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" }], ["path", { d: "M16 17h4" }], ["path", { d: "M4 13h4" }]];
const MapPin: IconNode = [["path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }], ["circle", { cx: "12", cy: "10", r: "3" }]];
const TriangleAlert: IconNode = [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }], ["path", { d: "M12 9v4" }], ["path", { d: "M12 17h.01" }]];
const Info: IconNode = [["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "M12 16v-4" }], ["path", { d: "M12 8h.01" }]];
const ExternalLink: IconNode = [["path", { d: "M15 3h6v6" }], ["path", { d: "M10 14 21 3" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }]];
const Link: IconNode = [["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }], ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }]];
const ImageDown: IconNode = [["path", { d: "M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" }], ["path", { d: "m14 19 3 3v-5.5" }], ["path", { d: "m17 22 3-3" }], ["circle", { cx: "9", cy: "9", r: "2" }]];
const Filter: IconNode = [["path", { d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" }]];
const Target: IconNode = [["circle", { cx: "12", cy: "12", r: "10" }], ["circle", { cx: "12", cy: "12", r: "6" }], ["circle", { cx: "12", cy: "12", r: "2" }]];
const Eye: IconNode = [["path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" }], ["circle", { cx: "12", cy: "12", r: "3" }]];
const EyeOff: IconNode = [["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" }], ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242" }], ["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" }], ["path", { d: "m2 2 20 20" }]];
const ZoomIn: IconNode = [["circle", { cx: "11", cy: "11", r: "8" }], ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }], ["line", { x1: "11", x2: "11", y1: "8", y2: "14" }], ["line", { x1: "8", x2: "14", y1: "11", y2: "11" }]];
const ZoomOut: IconNode = [["circle", { cx: "11", cy: "11", r: "8" }], ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }], ["line", { x1: "8", x2: "14", y1: "11", y2: "11" }]];
const LogOut: IconNode = [["path", { d: "m16 17 5-5-5-5" }], ["path", { d: "M21 12H9" }], ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }]];
const Send: IconNode = [["path", { d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" }], ["path", { d: "m21.854 2.147-10.94 10.939" }]];
const Trophy: IconNode = [["path", { d: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" }], ["path", { d: "M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" }], ["path", { d: "M18 9h1.5a1 1 0 0 0 0-5H18" }], ["path", { d: "M4 22h16" }], ["path", { d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" }], ["path", { d: "M6 9H4.5a1 1 0 0 1 0-5H6" }]];
const Swords: IconNode = [["polyline", { points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5" }], ["line", { x1: "13", x2: "19", y1: "19", y2: "13" }], ["line", { x1: "16", x2: "20", y1: "16", y2: "20" }], ["line", { x1: "19", x2: "21", y1: "21", y2: "19" }], ["polyline", { points: "14.5 6.5 18 3 21 3 21 6 17.5 9.5" }], ["line", { x1: "5", x2: "9", y1: "14", y2: "18" }], ["line", { x1: "7", x2: "4", y1: "17", y2: "20" }], ["line", { x1: "3", x2: "5", y1: "19", y2: "21" }]];
const RotateCcw: IconNode = [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { d: "M3 3v5h5" }]];
const ChevronsRight: IconNode = [["path", { d: "m6 17 5-5-5-5" }], ["path", { d: "m13 17 5-5-5-5" }]];
const Anchor: IconNode = [["path", { d: "M12 6v16" }], ["path", { d: "m19 13 2-1a9 9 0 0 1-18 0l2 1" }], ["path", { d: "M9 11h6" }], ["circle", { cx: "12", cy: "4", r: "2" }]];
const Ghost: IconNode = [["path", { d: "M9 10h.01" }], ["path", { d: "M15 10h.01" }], ["path", { d: "M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" }]];
const Crosshair: IconNode = [["circle", { cx: "12", cy: "12", r: "10" }], ["line", { x1: "22", x2: "18", y1: "12", y2: "12" }], ["line", { x1: "6", x2: "2", y1: "12", y2: "12" }], ["line", { x1: "12", x2: "12", y1: "6", y2: "2" }], ["line", { x1: "12", x2: "12", y1: "22", y2: "18" }]];
const LogIn: IconNode = [["path", { d: "m10 17 5-5-5-5" }], ["path", { d: "M15 12H3" }], ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }]];
const ChevronsUp: IconNode = [["path", { d: "m17 11-5-5-5 5" }], ["path", { d: "m17 18-5-5-5 5" }]];
const Wind: IconNode = [["path", { d: "M12.8 19.6A2 2 0 1 0 14 16H2" }], ["path", { d: "M17.5 8a2.5 2.5 0 1 1 2 4H2" }], ["path", { d: "M9.8 4.4A2 2 0 1 1 11 8H2" }]];
const Volume2: IconNode = [["path", { d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" }], ["path", { d: "M16 9a5 5 0 0 1 0 6" }], ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728" }]];
const ScrollText: IconNode = [["path", { d: "M15 12h-5" }], ["path", { d: "M15 8h-5" }], ["path", { d: "M19 17V5a2 2 0 0 0-2-2H4" }], ["path", { d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" }]];
const MessagesSquare: IconNode = [["path", { d: "M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" }], ["path", { d: "M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" }]];
const LocateFixed: IconNode = [["line", { x1: "2", x2: "5", y1: "12", y2: "12" }], ["line", { x1: "19", x2: "22", y1: "12", y2: "12" }], ["line", { x1: "12", x2: "12", y1: "2", y2: "5" }], ["line", { x1: "12", x2: "12", y1: "19", y2: "22" }], ["circle", { cx: "12", cy: "12", r: "7" }], ["circle", { cx: "12", cy: "12", r: "3" }]];
const Shapes: IconNode = [["path", { d: "M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" }], ["rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }], ["circle", { cx: "17.5", cy: "17.5", r: "3.5" }]];

function render(node: IconNode, size = 14): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.style.pointerEvents = 'none';
  svg.setAttribute('aria-hidden', 'true');
  for (const [tag, attrs] of node) {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    svg.appendChild(el);
  }
  return svg;
}

export const icons = {
  players:  (s?: number) => render(Users, s),
  clock:    (s?: number) => render(Clock, s),
  skull:    (s?: number) => render(Skull, s),
  film:     (s?: number) => render(Film, s),
  calendar: (s?: number) => render(Calendar, s),
  forge:    (s?: number) => render(Hammer, s),
  play:     (s?: number) => render(Play, s),
  pause:    (s?: number) => render(Pause, s),
  prev:     (s?: number) => render(SkipBack, s),
  next:     (s?: number) => render(SkipForward, s),
  // layer toggles (Films' viewer indexes these by layer key)
  geometry: (s?: number) => render(Layers, s),
  heatmap:  (s?: number) => render(Flame, s),
  paths:    (s?: number) => render(Waypoints, s),
  deaths:   (s?: number) => render(X, s),
  shots:    (s?: number) => render(Zap, s),
  ground:   (s?: number) => render(Package, s),
  world:    (s?: number) => render(MapPin, s),
  places:   (s?: number) => render(Signpost, s),
  devices:  (s?: number) => render(Shapes, s),
  carried:  (s?: number) => render(Hand, s),
  hits:     (s?: number) => render(Activity, s),
  throws:   (s?: number) => render(Bomb, s),
  objectives: (s?: number) => render(Flag, s),
  actions:  (s?: number) => render(Footprints, s),
  vitals:   (s?: number) => render(Heart, s),
  scatter:  (s?: number) => render(ScatterChart, s),
  density:  (s?: number) => render(Grid3x3, s),
  layers:   (s?: number) => render(Layers, s),
  headshot: (s?: number) => render(Target, s),
  // chrome
  copy:     (s?: number) => render(Copy, s),
  check:    (s?: number) => render(Check, s),
  x:        (s?: number) => render(X, s),
  alert:    (s?: number) => render(TriangleAlert, s),
  info:     (s?: number) => render(Info, s),
  external: (s?: number) => render(ExternalLink, s),
  caret:    (s?: number) => render(ChevronDown, s),
  link:     (s?: number) => render(Link, s),
  image:    (s?: number) => render(ImageDown, s),
  filter:   (s?: number) => render(Filter, s),
  eye:      (s?: number) => render(Eye, s),
  eyeOff:   (s?: number) => render(EyeOff, s),
  zoomIn:   (s?: number) => render(ZoomIn, s),
  zoomOut:  (s?: number) => render(ZoomOut, s),
  logOut:   (s?: number) => render(LogOut, s),
  send:     (s?: number) => render(Send, s),
  user:     (s?: number) => render(User, s),
  sync:     (s?: number) => render(RefreshCw, s),
  feedback: (s?: number) => render(MessageSquarePlus, s),
  builtin:  (s?: number) => render(Landmark, s),
  medal:    (s?: number) => render(Award, s),
  fit:      (s?: number) => render(Maximize, s),
  scores:   (s?: number) => render(Trophy, s),
  // The Events tab and its announcer lines.
  events:   (s?: number) => render(ScrollText, s),
  voice:    (s?: number) => render(Volume2, s),
  chatter:  (s?: number) => render(MessagesSquare, s),
  spawn:    (s?: number) => render(LocateFixed, s),
  // Player actions (pipeline 12), in the player card.
  melee:    (s?: number) => render(Swords, s),
  reload:   (s?: number) => render(RotateCcw, s),
  thrust:   (s?: number) => render(ChevronsRight, s),
  grapple:  (s?: number) => render(Anchor, s),
  camo:     (s?: number) => render(Ghost, s),
  zoom:     (s?: number) => render(Crosshair, s),
  sprint:   (s?: number) => render(Wind, s),
  jump:     (s?: number) => render(ChevronsUp, s),
  // A player entering and leaving a zone.
  zoneIn:   (s?: number) => render(LogIn, s),
  zoneOut:  (s?: number) => render(LogOut, s),
} as const;

/** Tint an icon and attach an explanatory tooltip. Standalone status icons are
 *  informative (not decorative), so undo render()'s `pointer-events:none` /
 *  `aria-hidden` and expose as a named image. */
function statusIcon(ic: SVGSVGElement, color: string, title: string): SVGSVGElement {
  ic.style.color = color;
  ic.style.pointerEvents = 'auto';
  ic.removeAttribute('aria-hidden');
  ic.setAttribute('role', 'img');
  ic.setAttribute('aria-label', title);
  // An SVG's tooltip comes from a <title> child, not a title attribute.
  const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  tip.textContent = title;
  ic.prepend(tip);
  return ic;
}

/** Forge vs Built-in indicator — pre-colored, pre-titled. Films' home page
 *  appends the bare SVG after the map name; its viewer wraps it in
 *  `chip(mapKind(f), …)`. */
export function mapKind(isForge: boolean | undefined, size = 12): SVGSVGElement {
  return isForge
    ? statusIcon(icons.forge(size), C.forge, 'Forge map')
    : statusIcon(icons.builtin(size), C.faint, 'Built-in map');
}

/** Render an icon at `size` and tint it. The inline-expression form of the
 *  ubiquitous `const ic = icons.X(n); ic.style.color = C.y;` two-liner. */
export const tint = (ic: Icon, size: number, color: string): SVGSVGElement => {
  const s = ic(size); s.style.color = color; return s;
};

/** A `sync` icon already spinning — every "in progress" affordance in the app. */
export const spinner = (size = 14): SVGSVGElement => {
  const s = icons.sync(size); s.style.animation = 'spin .9s linear infinite'; return s;
};
