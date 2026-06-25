export default function LogoBrEcho() {
  return (
    <svg viewBox="0 0 120 120" width="48" height="48" role="img" aria-label="Brechó de Luxo">
      <defs>
        <radialGradient id="logoGold" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFE066"/>
          <stop offset="50%" stopColor="#D4A017"/>
          <stop offset="100%" stopColor="#9A6E00"/>
        </radialGradient>
        <radialGradient id="logoBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a1a"/>
          <stop offset="100%" stopColor="#0a0a0a"/>
        </radialGradient>
      </defs>

      {/* Fundo circular */}
      <circle cx="60" cy="60" r="58" fill="url(#logoBg)"/>
      <circle cx="60" cy="60" r="57" fill="none" stroke="url(#logoGold)" strokeWidth="1.2"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#logoGold)" strokeWidth="0.5"/>

      {/* Coroa */}
      <rect x="36" y="18" width="48" height="7" rx="1.5" fill="url(#logoGold)"/>
      {/* Pico central */}
      <polygon points="60,5 54,18 66,18" fill="url(#logoGold)"/>
      <circle cx="60" cy="4.5" r="3" fill="url(#logoGold)"/>
      <circle cx="60" cy="4.5" r="1.5" fill="#0a0a0a"/>
      {/* Pico esquerdo */}
      <polygon points="44,9 39,18 49,18" fill="url(#logoGold)"/>
      <circle cx="44" cy="8.5" r="2.2" fill="url(#logoGold)"/>
      <circle cx="44" cy="8.5" r="1" fill="#0a0a0a"/>
      {/* Pico direito */}
      <polygon points="76,9 71,18 81,18" fill="url(#logoGold)"/>
      <circle cx="76" cy="8.5" r="2.2" fill="url(#logoGold)"/>
      <circle cx="76" cy="8.5" r="1" fill="#0a0a0a"/>

      {/* Círculo ornamental */}
      <circle cx="60" cy="66" r="38" fill="none" stroke="url(#logoGold)" strokeWidth="1.2"/>
      <circle cx="60" cy="66" r="33" fill="none" stroke="url(#logoGold)" strokeWidth="0.5"/>

      {/* Pontos decorativos */}
      <circle cx="60" cy="29" r="1.5" fill="url(#logoGold)"/>
      <circle cx="60" cy="103" r="1.5" fill="url(#logoGold)"/>
      <circle cx="23" cy="66" r="1.5" fill="url(#logoGold)"/>
      <circle cx="97" cy="66" r="1.5" fill="url(#logoGold)"/>

      {/* Ornamentos laterais simples */}
      <path d="M24,50 Q18,56 17,63" stroke="url(#logoGold)" strokeWidth="0.8" fill="none"/>
      <path d="M24,50 Q21,44 27,40" stroke="url(#logoGold)" strokeWidth="0.8" fill="none"/>
      <path d="M96,50 Q102,56 103,63" stroke="url(#logoGold)" strokeWidth="0.8" fill="none"/>
      <path d="M96,50 Q99,44 93,40" stroke="url(#logoGold)" strokeWidth="0.8" fill="none"/>
      <path d="M24,82 Q18,76 17,69" stroke="url(#logoGold)" strokeWidth="0.8" fill="none"/>
      <path d="M96,82 Q102,76 103,69" stroke="url(#logoGold)" strokeWidth="0.8" fill="none"/>

      {/* Flor de lis inferior */}
      <ellipse cx="60" cy="107" rx="3" ry="5" fill="url(#logoGold)"/>
      <ellipse cx="55" cy="105" rx="4" ry="2" transform="rotate(-25,55,105)" fill="url(#logoGold)"/>
      <ellipse cx="65" cy="105" rx="4" ry="2" transform="rotate(25,65,105)" fill="url(#logoGold)"/>

      {/* Iniciais BL */}
      <text
        x="51" y="82"
        fontFamily="Palatino Linotype, Palatino, Garamond, Georgia, serif"
        fontSize="42"
        fontWeight="bold"
        fontStyle="italic"
        fill="url(#logoGold)"
        textAnchor="middle">B</text>
      <text
        x="74" y="90"
        fontFamily="Palatino Linotype, Palatino, Garamond, Georgia, serif"
        fontSize="38"
        fontWeight="bold"
        fontStyle="italic"
        fill="url(#logoGold)"
        textAnchor="middle">L</text>
    </svg>
  )
}
