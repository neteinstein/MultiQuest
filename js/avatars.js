/* MultiQuest — avatars. Each has its own drawing, step motion, idle motion and board theme.
 * Parts with class "pc" are painted with the player's colour (CSS variable --pc). */
(function (root) {
  'use strict';

  var SKIN = '#f1c7a1';

  var SVG = {
    warrior:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<path class="pc" d="M20 36h24l4 22H16z"/>' +
      '<rect x="20" y="44" width="24" height="3" fill="#5b3a1a"/>' +
      '<circle cx="32" cy="25" r="10" fill="' + SKIN + '"/>' +
      '<path d="M21 25a11 11 0 0 1 22 0v2H21z" fill="#a3acb6"/>' +
      '<rect x="31" y="25" width="2" height="7" fill="#7d858e"/>' +
      '<path class="pc" d="M32 15q7-10 15-6q-7 1-12 8z"/>' +
      '<circle cx="28" cy="30" r="1.4" fill="#222"/><circle cx="36" cy="30" r="1.4" fill="#222"/>' +
      '<g class="part-shield"><circle cx="17" cy="45" r="8.5" fill="#8b5a2b" stroke="#5b3a1a" stroke-width="2"/>' +
      '<path class="pc" d="M15.5 39h3v4.5h4.5v3h-4.5v4.5h-3v-4.5H11v-3h4.5z"/></g>' +
      '<g class="part-sword"><rect x="47" y="18" width="3" height="24" rx="1" fill="#dfe3e8" stroke="#9aa3ad"/>' +
      '<rect x="43.5" y="41" width="10" height="3" rx="1" fill="#6b4a2b"/><rect x="47.3" y="44" width="2.4" height="6" fill="#6b4a2b"/></g>' +
      '</svg>',

    lynx:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<path d="M14 26L19 6l11 13z" fill="#c98a4b"/><path d="M50 26L45 6 34 19z" fill="#c98a4b"/>' +
      '<path d="M19 6l-1-5M45 6l1-5" stroke="#2b1d14" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M18 13l2-4 4 6zM46 13l-2-4-4 6z" fill="#f3d9b5"/>' +
      '<path d="M12 36l-8 14 12-5 4 8 4-9zM52 36l8 14-12-5-4 8-4-9z" fill="#ead2ab"/>' +
      '<ellipse cx="32" cy="35" rx="18" ry="16" fill="#d9a05b"/>' +
      '<ellipse cx="32" cy="43" rx="9" ry="7" fill="#f6e8cf"/>' +
      '<circle cx="22" cy="28" r="1.4" fill="#6b4423"/><circle cx="42" cy="28" r="1.4" fill="#6b4423"/>' +
      '<circle cx="19" cy="38" r="1.3" fill="#6b4423"/><circle cx="45" cy="38" r="1.3" fill="#6b4423"/>' +
      '<circle cx="28" cy="22" r="1.1" fill="#6b4423"/><circle cx="36" cy="22" r="1.1" fill="#6b4423"/>' +
      '<ellipse cx="25" cy="33" rx="3.4" ry="3" fill="#d6c23a"/><ellipse cx="39" cy="33" rx="3.4" ry="3" fill="#d6c23a"/>' +
      '<ellipse cx="25" cy="33" rx="1" ry="2.4" fill="#1b1b1b"/><ellipse cx="39" cy="33" rx="1" ry="2.4" fill="#1b1b1b"/>' +
      '<path d="M29 40h6l-3 3z" fill="#3b2a20"/>' +
      '<path d="M32 43v2M32 45q-3 2-5 0M32 45q3 2 5 0" stroke="#3b2a20" stroke-width="1.2" fill="none"/>' +
      '<path class="pc" d="M18 50q14 8 28 0l2 5q-16 8-32 0z"/>' +
      '</svg>',

    tree:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<path d="M28 38h8l2 20h-12z" fill="#7a5230"/>' +
      '<path d="M26 58q6-4 12 0" stroke="#5d3d22" stroke-width="2" fill="none"/>' +
      '<g class="part-canopy">' +
      '<circle cx="32" cy="22" r="14" fill="#3f9d4a"/><circle cx="20" cy="30" r="10" fill="#368a40"/>' +
      '<circle cx="44" cy="30" r="10" fill="#368a40"/><circle cx="32" cy="34" r="10" fill="#43a650"/>' +
      '<circle cx="25" cy="18" r="3" fill="#62c06c" opacity=".7"/>' +
      '<circle class="pc" cx="22" cy="27" r="2.6"/><circle class="pc" cx="40" cy="20" r="2.6"/>' +
      '<circle class="pc" cx="42" cy="34" r="2.6"/><circle class="pc" cx="30" cy="36" r="2.6"/>' +
      '</g>' +
      '<circle cx="29" cy="46" r="1.3" fill="#2b1a0e"/><circle cx="35" cy="46" r="1.3" fill="#2b1a0e"/>' +
      '<path d="M29.5 50q2.5 2 5 0" stroke="#2b1a0e" stroke-width="1.2" fill="none"/>' +
      '<rect class="pc" x="27" y="40" width="10" height="3" rx="1"/>' +
      '</svg>',

    rock:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<path d="M10 46q-2-16 10-26q10-9 24-4q12 5 12 20q1 14-10 19q-12 5-26 2q-9-2-10-11z" fill="#8c9095"/>' +
      '<path d="M16 26q6-8 16-9" stroke="#b3b7bb" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M42 46q4-2 6-7M22 52q5 2 10 1" stroke="#6d7175" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M30 15q4-4 9-2q-2 3-9 2z" fill="#6aa84f"/><path d="M36 14q5-3 8 1q-4 1-8-1z" fill="#7cbf5f"/>' +
      '<circle cx="26" cy="36" r="2.4" fill="#fff"/><circle cx="40" cy="36" r="2.4" fill="#fff"/>' +
      '<circle cx="26.6" cy="36.4" r="1.3" fill="#222"/><circle cx="40.6" cy="36.4" r="1.3" fill="#222"/>' +
      '<path d="M29 43q4 3 8 0" stroke="#333" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<path class="pc" d="M12 31q20-8 43 0l-1 4q-21-7-41 0z"/>' +
      '</svg>',

    camoes:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<path class="pc" d="M16 48q16-6 32 0l3 12H13z"/>' +
      '<path d="M18 46q14 6 28 0l-2 5q-12 4-24 0z" fill="#f5f2e8" stroke="#d8d2bf"/>' +
      '<ellipse cx="32" cy="29" rx="11" ry="13" fill="' + SKIN + '"/>' +
      '<path d="M21 31q1 13 11 15q10-2 11-15q-3 6-11 7q-8-1-11-7z" fill="#7a4a24"/>' +
      '<path d="M27 37q5-2 10 0" stroke="#5b3518" stroke-width="2" fill="none"/>' +
      '<path d="M21 24q2-10 11-10q9 0 11 10q-5-4-11-4q-6 0-11 4z" fill="#7a4a24"/>' +
      '<path d="M19 22q13-8 26 0" stroke="#3b8a3b" stroke-width="3" fill="none" stroke-dasharray="3 1.5"/>' +
      '<path d="M22 27l7 3" stroke="#222" stroke-width="1.2"/>' +
      '<ellipse cx="26" cy="29" rx="3" ry="2.4" fill="#222"/>' +
      '<circle cx="37" cy="29" r="1.5" fill="#222"/>' +
      '<g class="part-quill"><path d="M50 50q4-16 10-22q-2 10-8 22z" fill="#fff" stroke="#bbb"/>' +
      '<path d="M51 50l-1 4" stroke="#444" stroke-width="1.2"/></g>' +
      '</svg>',

    shakespeare:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<path class="pc" d="M16 50q16-6 32 0l3 10H13z"/>' +
      '<g class="part-ruff"><ellipse cx="32" cy="45" rx="15" ry="5" fill="#fbfaf5" stroke="#d2cdb8"/>' +
      '<path d="M20 45q2 3 4 0q2 3 4 0q2 3 4 0q2 3 4 0q2 3 4 0q2 3 4 0" stroke="#d2cdb8" fill="none"/></g>' +
      '<ellipse cx="32" cy="29" rx="10.5" ry="13" fill="' + SKIN + '"/>' +
      '<path d="M21.5 27q-2 8 1 13l3-2q-2-6-1-11zM42.5 27q2 8-1 13l-3-2q2-6 1-11z" fill="#6a4524"/>' +
      '<path d="M22 22q3-6 10-6q7 0 10 6q-2-2-4-2q-6-3-12 0q-2 0-4 2z" fill="#6a4524" opacity=".9"/>' +
      '<path d="M27 35q5-2 10 0q-5 2-10 0z" fill="#6a4524"/>' +
      '<path d="M30 39q2 4 4 0z" fill="#6a4524"/>' +
      '<circle cx="28" cy="28" r="1.4" fill="#222"/><circle cx="36" cy="28" r="1.4" fill="#222"/>' +
      '<circle cx="21.5" cy="32" r="1.2" fill="#e8c34a"/>' +
      '<g class="part-quill"><path d="M8 52q-2-16 4-26q1 10-1 26z" fill="#fff" stroke="#bbb"/></g>' +
      '</svg>',

    ball:
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<circle cx="32" cy="32" r="24" fill="#fafafa" stroke="#222" stroke-width="2"/>' +
      '<path d="M32 22l8 6-3 9h-10l-3-9z" fill="#222"/>' +
      '<path d="M32 22v-14M40 28l13-4M37 37l8 11M27 37l-8 11M24 28l-13-4" stroke="#222" stroke-width="1.6"/>' +
      '<path d="M26 8.5l6-.5 6 .5-6 4zM53.5 22l2 6-1 6-4-6zM47 50l-5 4-6 2 3-7zM17 50l5 4 6 2-3-7zM10.5 22l-2 6 1 6 4-6z" fill="#222"/>' +
      '<circle class="pcs" cx="32" cy="32" r="27" fill="none" stroke-width="3"/>' +
      '</svg>'
  };

  // stepMs: time per house; ease: CSS easing of the travel between houses.
  var AVATARS = {
    warrior: { stepMs: 380, ease: 'cubic-bezier(.45,0,.55,1)', theme: 'warrior' },
    lynx: { stepMs: 270, ease: 'cubic-bezier(.2,.8,.3,1)', theme: 'lynx' },
    tree: { stepMs: 520, ease: 'ease-in-out', theme: 'tree' },
    rock: { stepMs: 440, ease: 'cubic-bezier(.6,0,.9,.6)', theme: 'rock' },
    camoes: { stepMs: 470, ease: 'cubic-bezier(.4,.1,.4,1)', theme: 'camoes' },
    shakespeare: { stepMs: 450, ease: 'ease-in-out', theme: 'shakespeare' },
    ball: { stepMs: 320, ease: 'cubic-bezier(.3,.6,.4,1)', theme: 'ball' }
  };

  var ORDER = ['warrior', 'lynx', 'tree', 'rock', 'camoes', 'shakespeare', 'ball'];

  // Decorations floating in the background for each theme.
  var DECOR = {
    default: ['✦', '◆', '✧', '◇'],
    warrior: ['⚔️', '🛡️', '🏰', '🚩'],
    lynx: ['🐾', '🌾', '🌿', '🍂'],
    tree: ['🍃', '🌳', '🍂', '🌱'],
    rock: ['⛰️', '🪨', '❄️', '🏔️'],
    camoes: ['⛵', '🌊', '🧭', '📜'],
    shakespeare: ['🎭', '🪶', '🌹', '📜'],
    ball: ['⚽', '🥅', '🏆', '⭐']
  };

  var COLORS = [
    { id: 'red', hex: '#e53935', pt: 'Vermelho', en: 'Red' },
    { id: 'blue', hex: '#1e88e5', pt: 'Azul', en: 'Blue' },
    { id: 'green', hex: '#43a047', pt: 'Verde', en: 'Green' },
    { id: 'yellow', hex: '#fdd835', pt: 'Amarelo', en: 'Yellow' },
    { id: 'purple', hex: '#8e24aa', pt: 'Roxo', en: 'Purple' },
    { id: 'orange', hex: '#fb8c00', pt: 'Laranja', en: 'Orange' },
    { id: 'pink', hex: '#ec407a', pt: 'Rosa', en: 'Pink' },
    { id: 'cyan', hex: '#00acc1', pt: 'Ciano', en: 'Cyan' },
    { id: 'brown', hex: '#6d4c41', pt: 'Castanho', en: 'Brown' },
    { id: 'black', hex: '#263238', pt: 'Preto', en: 'Black' }
  ];

  root.MQAvatars = { SVG: SVG, AVATARS: AVATARS, ORDER: ORDER, DECOR: DECOR, COLORS: COLORS };
})(this);
