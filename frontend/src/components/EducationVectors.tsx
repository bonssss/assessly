import type { SVGProps } from "react";

/**
 * High-quality 2D vector illustration matching the Freepik clean line-art style
 * featuring books, laptop with glowing lightbulb, coffee mug, and potted plant.
 */
export function HeroStudyIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 620 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[540px] drop-shadow-sm select-none"
      {...props}
    >
      {/* Background Soft Sky-Cyan Blob */}
      <path
        d="M260 70C340 40 450 60 510 120C570 180 580 290 530 360C480 430 370 450 290 440C210 430 150 370 170 280C190 190 180 100 260 70Z"
        fill="#e0f2fe"
        opacity="0.9"
      />

      {/* Floating Outline Cloud (Top-Left) */}
      <g
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
      >
        <path d="M125 185C125 174 134 165 145 165C148 152 159 142 173 142C189 142 202 154 204 170C214 170 222 178 222 188C222 198 214 206 204 206H145C134 206 125 197 125 185Z" />
      </g>

      {/* Floating Outline Cloud (Right) */}
      <g
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
      >
        <path d="M470 230C470 220 478 212 488 212C491 201 501 192 513 192C527 192 538 202 540 216C549 216 556 223 556 232C556 241 549 248 540 248H488C478 248 470 240 470 230Z" />
      </g>

      {/* Ambient Wind/Breeze Lines */}
      <path
        d="M470 160H545"
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="30 10 12 8"
      />
      <path d="M180 195H220" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M140 180H160" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

      {/* Ground Horizon Shadow Line */}
      <path
        d="M130 395C240 405 440 405 570 395"
        stroke="#e2e8f0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* ========================================================= */}
      {/* 1. BOOKS STACK (BASE)                                     */}
      {/* ========================================================= */}

      {/* Bottom Horizontal Blue Book */}
      <g>
        {/* Book Spine / Cover */}
        <rect
          x="215"
          y="340"
          width="215"
          height="38"
          rx="5"
          fill="#60a5fa"
          stroke="#1e293b"
          strokeWidth="2.8"
        />
        {/* Book Paper Core */}
        <rect
          x="230"
          y="346"
          width="190"
          height="26"
          rx="3"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        {/* Paper texture lines */}
        <line x1="240" y1="355" x2="410" y2="355" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="240" y1="363" x2="400" y2="363" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Green Bookmark Ribbon hanging out */}
        <path
          d="M375 346V382L383 376L391 382V346H375Z"
          fill="#4ade80"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Top Horizontal Yellow Book */}
      <g>
        {/* Book Spine / Cover */}
        <rect
          x="200"
          y="295"
          width="210"
          height="42"
          rx="6"
          fill="#facc15"
          stroke="#1e293b"
          strokeWidth="2.8"
        />
        {/* Book Paper Core */}
        <rect
          x="215"
          y="302"
          width="185"
          height="28"
          rx="3"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        {/* Paper texture lines */}
        <line x1="225" y1="311" x2="390" y2="311" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="225" y1="320" x2="380" y2="320" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Pink Bookmark Ribbon hanging out */}
        <path
          d="M358 302V340L366 334L374 340V302H358Z"
          fill="#f472b6"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Vertical Green Binder (Leaning on the left) */}
      <g transform="rotate(-6 185 360)">
        <rect
          x="165"
          y="245"
          width="44"
          height="145"
          rx="5"
          fill="#4ade80"
          stroke="#1e293b"
          strokeWidth="2.8"
        />
        {/* White label bands */}
        <rect
          x="165"
          y="260"
          width="44"
          height="15"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        <rect
          x="165"
          y="360"
          width="44"
          height="15"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        <circle cx="187" cy="300" r="4.5" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
      </g>

      {/* ========================================================= */}
      {/* 2. LAPTOP WITH GLOWING LIGHTBULB                          */}
      {/* ========================================================= */}
      <g>
        {/* Laptop Screen Body */}
        <rect
          x="225"
          y="160"
          width="165"
          height="115"
          rx="8"
          fill="#f8fafc"
          stroke="#1e293b"
          strokeWidth="3"
        />

        {/* Laptop Inner Screen */}
        <rect
          x="233"
          y="168"
          width="149"
          height="96"
          rx="4"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />

        {/* Browser / App Header Dots */}
        <circle cx="360" cy="176" r="2.5" fill="#38bdf8" />
        <circle cx="367" cy="176" r="2.5" fill="#facc15" />
        <circle cx="374" cy="176" r="2.5" fill="#4ade80" />

        {/* Glowing Yellow Lightbulb */}
        <g>
          {/* Lightbulb Glow Halo */}
          <circle cx="308" cy="208" r="22" fill="#fef08a" opacity="0.45" />

          {/* Lightbulb Bulb Glass */}
          <path
            d="M294 202C294 194.268 300.268 188 308 188C315.732 188 322 194.268 322 202C322 207.2 319.2 211.7 315 214.2V219H301V214.2C296.8 211.7 294 207.2 294 202Z"
            fill="#facc15"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Lightbulb Base Thread & Contact */}
          <path d="M302 222H314" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M304 225H312" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

          {/* Idea Rays / Glow Flares */}
          <line
            x1="274"
            y1="202"
            x2="284"
            y2="202"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="277"
            y1="192"
            x2="285"
            y2="197"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="277"
            y1="212"
            x2="285"
            y2="207"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <line
            x1="342"
            y1="202"
            x2="332"
            y2="202"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="339"
            y1="192"
            x2="331"
            y2="197"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="339"
            y1="212"
            x2="331"
            y2="207"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Laptop Keyboard Base Tray */}
        <path
          d="M213 275L218 285C219 288 222 290 225 290H390C393 290 396 288 397 285L402 275H213Z"
          fill="#e2e8f0"
          stroke="#1e293b"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Trackpad notch */}
        <path d="M295 277H320" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* ========================================================= */}
      {/* 3. COFFEE MUG (LEFT FRONT)                                */}
      {/* ========================================================= */}
      <g>
        {/* Mug Body */}
        <rect
          x="212"
          y="350"
          width="40"
          height="45"
          rx="5"
          fill="#f472b6"
          stroke="#1e293b"
          strokeWidth="2.8"
        />
        {/* Mug Handle */}
        <path
          d="M252 358C261 358 266 362 266 370C266 378 261 382 252 382"
          fill="none"
          stroke="#1e293b"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* Top Rim Liquid */}
        <ellipse
          cx="232"
          cy="350"
          rx="20"
          ry="3.5"
          fill="#fbcfe8"
          stroke="#1e293b"
          strokeWidth="2"
        />
      </g>

      {/* ========================================================= */}
      {/* 4. POTTED PLANT (RIGHT FRONT)                             */}
      {/* ========================================================= */}
      <g>
        {/* Plant Leaves */}
        <path
          d="M485 345C470 325 450 295 460 260C480 275 490 310 485 345Z"
          fill="#4ade80"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line
          x1="472"
          y1="310"
          x2="480"
          y2="305"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="477"
          y1="325"
          x2="483"
          y2="320"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M492 345C492 315 498 280 508 245C522 270 515 315 495 345"
          fill="#22c55e"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line
          x1="502"
          y1="290"
          x2="507"
          y2="285"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="500"
          y1="315"
          x2="505"
          y2="310"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M500 345C515 320 540 290 570 275C565 305 535 330 500 345Z"
          fill="#4ade80"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line
          x1="530"
          y1="305"
          x2="538"
          y2="300"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="520"
          y1="325"
          x2="528"
          y2="320"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Flower Pot (Yellow Ceramic) */}
        <polygon
          points="465,345 525,345 515,395 475,395"
          fill="#facc15"
          stroke="#1e293b"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Pot Rim */}
        <rect
          x="460"
          y="342"
          width="70"
          height="8"
          rx="3"
          fill="#fef08a"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
      </g>
    </svg>
  );
}

/**
 * Clean Auth Page Vector illustration with student desk, diploma, and desk lamp
 */
export function AuthVectorIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 500 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[420px] drop-shadow-sm select-none"
      {...props}
    >
      {/* Background Soft Mint / Cyan Circle */}
      <circle cx="250" cy="210" r="170" fill="#ccfbf1" opacity="0.8" />

      {/* Floating Outline Cloud */}
      <g
        stroke="#94a3b8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
      >
        <path d="M70 140C70 130 78 122 88 122C91 112 100 104 112 104C125 104 135 113 137 126C145 126 152 133 152 141C152 149 145 156 137 156H88C78 156 70 148 70 140Z" />
      </g>

      {/* Modern Desk Surface */}
      <rect
        x="60"
        y="310"
        width="380"
        height="12"
        rx="4"
        fill="#e2e8f0"
        stroke="#1e293b"
        strokeWidth="2.8"
      />
      <path d="M100 322V360" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M400 322V360" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />

      {/* Open Laptop on Desk */}
      <g>
        <rect
          x="180"
          y="195"
          width="140"
          height="95"
          rx="6"
          fill="#f8fafc"
          stroke="#1e293b"
          strokeWidth="2.8"
        />
        <rect
          x="188"
          y="202"
          width="124"
          height="78"
          rx="3"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        {/* Screen Content: Exam Pass Score Badge */}
        <circle cx="250" cy="241" r="24" fill="#dcfce7" stroke="#4ade80" strokeWidth="2" />
        <path
          d="M242 241L248 247L258 235"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Laptop Base */}
        <path
          d="M165 290L170 300C171 303 174 305 177 305H323C326 305 329 303 330 300L335 290H165Z"
          fill="#cbd5e1"
          stroke="#1e293b"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      </g>

      {/* Graduation Cap / Mortarboard Floating on Right */}
      <g transform="rotate(10 370 140)">
        <polygon
          points="370,110 425,128 370,146 315,128"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />
        <path
          d="M340 137V155C340 167 370 175 370 175C370 175 400 167 400 155V137"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />
        <path d="M425 128V165" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="425" cy="168" r="3.5" fill="#facc15" />
      </g>

      {/* Stack of Study Guides (Left Desk) */}
      <g>
        <rect
          x="90"
          y="285"
          width="70"
          height="25"
          rx="3"
          fill="#93c5fd"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        <rect
          x="95"
          y="265"
          width="60"
          height="20"
          rx="3"
          fill="#fef08a"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        <path
          d="M135 265V285L140 280L145 285V265H135Z"
          fill="#f472b6"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
      </g>

      {/* Cute Desk Plant (Right Desk) */}
      <g>
        <path
          d="M365 285C355 265 350 245 360 225C370 240 375 265 365 285Z"
          fill="#4ade80"
          stroke="#1e293b"
          strokeWidth="2"
        />
        <path
          d="M375 285C385 260 405 240 420 230C415 255 395 275 375 285Z"
          fill="#22c55e"
          stroke="#1e293b"
          strokeWidth="2"
        />
        <polygon
          points="350,285 390,285 383,310 357,310"
          fill="#facc15"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
