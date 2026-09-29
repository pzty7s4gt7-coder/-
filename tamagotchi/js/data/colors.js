/*
 * COLOUR GENE — one of the 5 inherited traits.
 * Slots: a main, b shade, c highlight, o outline, d accent, e accent shade.
 * Add a colour: TM.register('color', { id, name, a, b, c, o, d, e })
 */
(function () {
  const C = (id, name, a, b, c, o, d, e) => TM.register('color', { id, name, a, b, c, o, d, e });
  C('pink',     'ももいろ',   '#ffb0cf', '#f27aa8', '#ffe3ef', '#8e2f5c', '#8fd8ff', '#3f8fd0');
  C('sky',      'そらいろ',   '#a4dcff', '#63afe8', '#e2f5ff', '#2c5a8e', '#ffd35c', '#d69a1e');
  C('lemon',    'レモン',     '#fff27e', '#f0c83c', '#fffcd4', '#8a661a', '#ff94bc', '#d8588a');
  C('mint',     'ミント',     '#aef2cc', '#62c898', '#e2fff0', '#2a6e50', '#ffa8c8', '#e06a98');
  C('lavender', 'ラベンダー', '#dcbcff', '#aa86e8', '#f3eaff', '#5a3e8c', '#ffe07a', '#d8a830');
  C('orange',   'みかん',     '#ffba6c', '#f08a38', '#ffe4c2', '#8a4a1a', '#86d86a', '#3f9a4a');
  C('cream',    'ミルク',     '#fff4dc', '#f0d6a4', '#ffffff', '#8a6a4a', '#ff9ab8', '#d86a8a');
  C('choco',    'ショコラ',   '#bc845a', '#8a5638', '#e4bc92', '#4a2a1a', '#ffb8d0', '#e07aa0');
  C('berry',    'いちご',     '#ff7080', '#d8404e', '#ffc4cc', '#7a1a28', '#fff4dc', '#e8c8a0');
  C('snow',     'ゆき',       '#ffffff', '#d4ddf0', '#ffffff', '#5a6a8e', '#a4dcff', '#63afe8');
  C('gray',     'はいいろ',   '#bcbccc', '#8a8aa2', '#eaeaf2', '#3e3e54', '#ff8fb8', '#d8588a');
  C('navy',     'よぞら',     '#6280ec', '#3a52b8', '#aec4ff', '#1a2a6a', '#fff07a', '#e0b830');
  C('grape',    'ぶどう',     '#b27ae0', '#8450b8', '#dcc0f6', '#3e1e66', '#9ef0c8', '#4ab888');
  C('leaf',     'わかば',     '#b6e67a', '#82bc48', '#e6fcc4', '#3e6a1e', '#ffb0cf', '#f27aa8');
})();
